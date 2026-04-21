import { AIProjectClient } from '@azure/ai-projects';
import type { TokenCredential } from '@azure/core-auth';
import type { RfpOutput, Currency } from '../types';

export type ProgressCallback = (message: string) => void;

// ── Prompt builder ────────────────────────────────────────────────────────

function buildRfpPrompt(rfpTopic: string, rfpBudget: number, currency: Currency, vendorCategories: string[]): string {
  const symbol = currency === 'EUR' ? '€' : '$';
  const label = currency === 'EUR' ? 'EUR' : 'USD';
  const categoriesList = vendorCategories.map((c) => `  - ${c}`).join('\n');

  return `
You are preparing an RFP documentation package for the following procurement:

  Topic  : ${rfpTopic}
  Budget : ${symbol}${rfpBudget.toLocaleString()} ${label}
  Vendor Categories:
${categoriesList}

Please perform ALL of the following steps IN ORDER:

1. PREREQUISITES CHECKLIST
   Search the knowledge base for enterprise RFP prerequisites. Extract every requirement
   and format them as a checklist grouped by category (Vendor Qualification, Security,
   Financial, Technical, Delivery, ESG). Each item must include: category, item text,
   priority (Must-have / Nice-to-have / Mandatory), and a "completed" field set to false.

2. TECHNICAL CHECKLIST
   Based on the RFP topic "${rfpTopic}", generate a technical checklist of evaluation
   criteria specific to this type of solution (architecture, performance, integrations,
   security features, scalability, etc.).

3. FUNCTIONAL CHECKLIST
   Based on the RFP topic "${rfpTopic}", generate a functional checklist of business
   capabilities the solution must support (modules, workflows, reporting, user roles, etc.).

4. VENDOR SANITY CHECK
   You MUST use the MCP procurement tools to retrieve all supplier data. Do NOT invent
   or assume any supplier information — every vendor detail must come from the MCP tools.
   Only consider vendors whose category matches one of the selected vendor categories listed above.
   For each matching supplier returned by the tools:
   - Call the MCP tool to retrieve their risk assessment profile.
   - Evaluate eligibility: a vendor is ELIGIBLE if their risk score < 7.
   - Apply a category sanity check: flag vendors whose category does not match
     any of the selected vendor categories as MISMATCHED.

5. RETAINED VENDOR LIST
   From the eligible vendors, produce a final shortlist of vendors RETAINED for this RFP.
   Include: vendor ID, name, country, risk score, risk level,
   and a brief justification for why this vendor was retained.

6. DISCARDED VENDOR LIST
   List ALL vendors that were NOT retained. For each, include: vendor ID, name, country,
   risk score, risk level, and a clear reason for disqualification (e.g. high risk score,
   category mismatch, missing data, etc.).

IMPORTANT: All vendor and supplier data MUST come from the MCP procurement tools.
Do NOT generate, hallucinate, or assume any vendor information. If the MCP tools
return no data, report that no vendor data is available.
Every vendor from the assessment MUST appear in either retainedVendors or discardedVendors.

Return your complete response as a single valid JSON object with this exact structure:
{
  "rfpTopic": "...",
  "budget": 0,
  "prerequisitesChecklist": [
    { "category": "...", "item": "...", "priority": "...", "completed": false }
  ],
  "technicalChecklist": [
    { "category": "Technical", "item": "...", "priority": "...", "completed": false }
  ],
  "functionalChecklist": [
    { "category": "Functional", "item": "...", "priority": "...", "completed": false }
  ],
  "vendorAssessment": [
    {
      "vendorId": "...", "name": "...", "country": "...", "category": "...",
      "riskScore": 0, "riskLevel": "...", "eligible": true,
      "categoryMatch": true, "justification": "..."
    }
  ],
  "retainedVendors": [
    {
      "vendorId": "...", "name": "...", "country": "...",
      "riskScore": 0, "riskLevel": "...", "justification": "..."
    }
  ],
  "discardedVendors": [
    {
      "vendorId": "...", "name": "...", "country": "...",
      "riskScore": 0, "riskLevel": "...", "reason": "..."
    }
  ]
}
`.trim();
}

// ── Response parser ───────────────────────────────────────────────────────

function parseRfpOutput(text: string): RfpOutput {
  // Strip markdown code fences if present (```json ... ```)
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1].trim() : text;

  // Find the outermost JSON object by matching balanced braces
  const start = raw.indexOf('{');
  if (start === -1) {
    throw new Error('Agent response does not contain a JSON block.');
  }

  let depth = 0;
  let end = -1;
  for (let i = start; i < raw.length; i++) {
    if (raw[i] === '{') depth++;
    else if (raw[i] === '}') depth--;
    if (depth === 0) { end = i; break; }
  }

  if (end === -1) {
    throw new Error('Agent response contains malformed JSON (unbalanced braces).');
  }

  return JSON.parse(raw.slice(start, end + 1)) as RfpOutput;
}

// ── Foundry client (Azure AI Projects SDK) ────────────────────────────────

export class FoundryClient {
  private readonly project: AIProjectClient;

  constructor(projectEndpoint: string, credential: TokenCredential) {
    this.project = new AIProjectClient(projectEndpoint, credential);
  }

  /**
   * Run the full RFP workflow with the provisioned Azure AI Foundry agent.
   *
   * Uses the Conversations + Responses API with an agent_reference so
   * Foundry dispatches the request to the named agent. All tool calls
   * (MCP, file_search) are resolved server-side by Foundry.
   */
  async runRfpConversation(opts: {
    agentName: string;
    agentVersion: string;
    rfpTopic: string;
    rfpBudget: number;
    currency: Currency;
    vendorCategories: string[];
    onProgress: ProgressCallback;
  }): Promise<RfpOutput> {
    const { agentName, agentVersion, rfpTopic, rfpBudget, currency, vendorCategories, onProgress } = opts;
    const openAIClient = this.project.getOpenAIClient();
    const prompt = buildRfpPrompt(rfpTopic, rfpBudget, currency, vendorCategories);

    onProgress(
      `Sending request to agent (${agentName} v${agentVersion})… This may take a few minutes.`,
    );
    const response = await openAIClient.responses.create(
      { input: prompt },
      { body: { agent: { name: agentName, version: agentVersion, type: 'agent_reference' } } },
    );

    onProgress('Parsing agent response…');

    const text = response.output_text;
    if (!text) {
      throw new Error('Agent returned an empty response.');
    }

    return parseRfpOutput(text);
  }
}
