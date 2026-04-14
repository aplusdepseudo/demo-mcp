import type { RfpOutput } from '../types';

const API_VERSION = '2025-04-01-preview';

export type ProgressCallback = (message: string) => void;

// ── Prompt builder ────────────────────────────────────────────────────────

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

// ── Response parser ───────────────────────────────────────────────────────

function parseRfpOutput(text: string): RfpOutput {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Agent response does not contain a JSON block.');
  }
  return JSON.parse(jsonMatch[0]) as RfpOutput;
}

// ── Foundry REST client ───────────────────────────────────────────────────

interface ConversationResponse {
  id: string;
}

interface AgentResponse {
  output_text?: string;
}

export class FoundryClient {
  private readonly baseUrl: string;
  private readonly tokenProvider: () => Promise<string>;

  constructor(projectEndpoint: string, tokenProvider: () => Promise<string>) {
    this.baseUrl = projectEndpoint.replace(/\/+$/, '');
    this.tokenProvider = tokenProvider;
  }

  private async request<T>(path: string, method: string, body?: unknown): Promise<T> {
    const token = await this.tokenProvider();
    const url = `${this.baseUrl}${path}?api-version=${API_VERSION}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Foundry API error ${response.status}: ${text}`);
    }

    if (method === 'DELETE') return undefined as T;
    return (await response.json()) as T;
  }

  /**
   * Run the full RFP conversation with the provisioned Azure AI Foundry agent.
   *
   * Flow:
   *  1. Create a conversation with the initial RFP prompt
   *  2. Generate a response via the agent (all tool calls handled server-side)
   *  3. Parse the agent's JSON response into RfpOutput
   *  4. Clean up the conversation (best-effort)
   */
  async runRfpConversation(
    agentName: string,
    rfpTopic: string,
    rfpBudget: number,
    onProgress: ProgressCallback,
  ): Promise<RfpOutput> {
    // 1. Create conversation
    onProgress('Creating conversation…');
    const prompt = buildRfpPrompt(rfpTopic, rfpBudget);

    const conversation = await this.request<ConversationResponse>(
      '/openai/conversations',
      'POST',
      { items: [{ type: 'message', role: 'user', content: prompt }] },
    );

    // 2. Generate agent response (MCP tool calls handled server-side by Foundry)
    onProgress(
      `Waiting for agent response (${agentName})… This may take a few minutes.`,
    );

    const response = await this.request<AgentResponse>(
      '/openai/responses',
      'POST',
      {
        conversation: conversation.id,
        agent: { name: agentName, type: 'agent_reference' },
      },
    );

    // 3. Parse response
    onProgress('Parsing agent response…');

    if (!response.output_text) {
      throw new Error('Agent returned an empty response.');
    }

    // 4. Cleanup (best-effort)
    try {
      await this.request(`/openai/conversations/${conversation.id}`, 'DELETE');
    } catch {
      // Not critical
    }

    return parseRfpOutput(response.output_text);
  }
}
