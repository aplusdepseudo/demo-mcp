import { AIProjectClient } from '@azure/ai-projects';
import { DefaultAzureCredential } from '@azure/identity';
import type { RfpOutput, SseEvent } from '../src/types.ts';

export interface ConversationConfig {
  projectEndpoint: string;
  agentName: string;
  agentVersion: string;
}

/** Build the initial RFP prompt */
function buildRfpPrompt(rfpTopic: string, rfpBudget: number): string {
  return `
You are preparing an RFP documentation package for the following procurement:

  Topic  : ${rfpTopic}
  Budget : $${rfpBudget.toLocaleString()} USD

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
   Use the procurement tools to retrieve all suppliers. For each supplier:
   - Retrieve their risk assessment profile.
   - Evaluate eligibility: a vendor is ELIGIBLE if their risk score < 7.
   - Apply a category sanity check: flag vendors whose category does not match
     the RFP topic as MISMATCHED.

5. TARGETED VENDOR LIST
   From the eligible vendors, produce a final shortlist of vendors recommended
   for this RFP. Include: vendor ID, name, country, risk score, risk level,
   and a brief justification for inclusion or exclusion.

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
  "targetedVendors": [
    {
      "vendorId": "...", "name": "...", "country": "...",
      "riskScore": 0, "riskLevel": "...", "justification": "..."
    }
  ]
}
`.trim();
}

/** Extract and parse the RfpOutput JSON from the agent's text response */
function parseRfpOutput(text: string): RfpOutput {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Agent response does not contain a JSON block.');
  }
  return JSON.parse(jsonMatch[0]) as RfpOutput;
}

/** Validate that a URL uses only http or https to prevent SSRF attacks */
function validateHttpUrl(url: string, label: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`${label} is not a valid URL.`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`${label} must use the http or https protocol.`);
  }
}

/**
 * Run the full RFP conversation with the provisioned Azure AI Foundry agent.
 *
 * Uses the Conversations + Responses API. The agent handles all tool calls
 * (MCP procurement tools, file_search) server-side in Foundry — the SPA
 * only creates the conversation, sends the prompt, and reads the response.
 */
export async function runRfpConversation(
  config: ConversationConfig,
  rfpTopic: string,
  rfpBudget: number,
  emit: (event: SseEvent) => void,
): Promise<RfpOutput> {
  validateHttpUrl(config.projectEndpoint, 'Foundry project endpoint');

  const project = new AIProjectClient(config.projectEndpoint, new DefaultAzureCredential());
  const openai = project.getOpenAIClient();

  // ── 1. Create conversation with initial user message ────────────────────
  emit({ type: 'status', message: 'Creating conversation…' });
  const prompt = buildRfpPrompt(rfpTopic, rfpBudget);

  const conversation = await openai.conversations.create({
    items: [
      { type: 'message', role: 'user', content: prompt },
    ],
  });

  // ── 2. Generate response (all tool calls handled server-side) ───────────
  emit({
    type: 'status',
    message: `Waiting for agent response (${config.agentName})… This may take a few minutes.`,
  });

  const response = await openai.responses.create(
    { conversation: conversation.id },
    { body: { agent: { name: config.agentName, type: 'agent_reference' } } },
  );

  // ── 3. Extract and parse the agent's response ──────────────────────────
  emit({ type: 'status', message: 'Parsing agent response…' });

  const outputText = response.output_text;
  if (!outputText) {
    throw new Error('Agent returned an empty response.');
  }

  // ── 4. Cleanup ─────────────────────────────────────────────────────────
  try {
    await openai.conversations.delete(conversation.id);
  } catch {
    // Best-effort cleanup — not critical
  }

  return parseRfpOutput(outputText);
}
