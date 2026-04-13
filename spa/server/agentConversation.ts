import { AIProjectClient } from '@azure/ai-projects';
import { DefaultAzureCredential } from '@azure/identity';
import type { RfpOutput, SseEvent } from '../src/types.ts';

export interface ConversationConfig {
  projectEndpoint: string;
  agentName: string;
  agentVersion: string;
  mcpServerUrl: string;
}

/** Build the initial RFP prompt — mirrors buildRfpPrompt from agent/src/rfpAgent.ts */
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
   Call the list_vendors tool to retrieve all vendors. For each vendor returned:
   - Call get_vendor_risk_score to get their risk profile.
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

/** Forward a tool call to the MCP server and return the result */
async function callMcpTool(mcpServerUrl: string, toolName: string, args: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(`${mcpServerUrl}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: toolName, arguments: args },
    }),
  });

  if (!response.ok) {
    throw new Error(`MCP server error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    result?: { content?: Array<{ type: string; text: string }> };
    error?: { message: string };
  };

  if (data.error) {
    throw new Error(`MCP tool error: ${data.error.message}`);
  }

  const text = data.result?.content?.[0]?.text;
  if (text) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return data.result;
}

/** Handle a single function tool call from the agent */
async function handleToolCall(
  toolName: string,
  rawArgs: string,
  mcpServerUrl: string,
): Promise<unknown> {
  const args = (rawArgs ? JSON.parse(rawArgs) : {}) as Record<string, unknown>;

  if (toolName === 'list_vendors') {
    return callMcpTool(mcpServerUrl, 'list_suppliers', { category: args['category'] ?? undefined });
  }

  if (toolName === 'get_vendor_risk_score') {
    return callMcpTool(mcpServerUrl, 'get_risk_score', { supplier_id: args['vendor_id'] });
  }

  throw new Error(`Unknown agent tool: ${toolName}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run the full RFP conversation with the provisioned Azure AI Foundry agent.
 *
 * Uses the OpenAI-compatible Assistants API exposed by the Foundry project
 * endpoint (project.getOpenAIClient()). The conversation loop:
 *   1. Create a thread
 *   2. Post the initial RFP prompt as a user message
 *   3. Create a run referencing the provisioned agent
 *   4. Poll until completed, handling any list_vendors / get_vendor_risk_score
 *      function calls by proxying them to the MCP server
 *   5. Extract the assistant's final JSON response and parse it into RfpOutput
 */
export async function runRfpConversation(
  config: ConversationConfig,
  rfpTopic: string,
  rfpBudget: number,
  emit: (event: SseEvent) => void,
): Promise<RfpOutput> {
  const project = new AIProjectClient(config.projectEndpoint, new DefaultAzureCredential());
  const openai = project.getOpenAIClient();

  // ── 1. Create thread ────────────────────────────────────────────────────
  emit({ type: 'status', message: 'Creating conversation thread…' });
  const thread = await openai.beta.threads.create();

  // ── 2. Post the RFP prompt ──────────────────────────────────────────────
  const prompt = buildRfpPrompt(rfpTopic, rfpBudget);
  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: prompt,
  });

  // ── 3. Start the run ────────────────────────────────────────────────────
  emit({
    type: 'status',
    message: `Starting agent run (${config.agentName} v${config.agentVersion})…`,
  });

  // The assistant_id is the Foundry agent name. If the Foundry project exposes
  // versioned assistants, use "<agentName>/<agentVersion>" instead.
  let run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: config.agentName,
  });

  // ── 4. Polling loop ─────────────────────────────────────────────────────
  const terminalStatuses = new Set(['completed', 'failed', 'cancelled', 'expired']);

  while (!terminalStatuses.has(run.status)) {
    await sleep(2000);
    // In the latest openai SDK the thread_id is passed as a param object
    run = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });

    if (run.status === 'queued' || run.status === 'in_progress') {
      emit({ type: 'status', message: `Agent is processing… (${run.status})` });
      continue;
    }

    if (run.status === 'requires_action' && run.required_action?.type === 'submit_tool_outputs') {
      const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
      emit({
        type: 'status',
        message: `Agent requested ${toolCalls.length} tool call(s)…`,
      });

      const toolOutputs: Array<{ tool_call_id: string; output: string }> = [];

      for (const toolCall of toolCalls) {
        emit({ type: 'tool_call', toolName: toolCall.function.name });
        try {
          const result = await handleToolCall(
            toolCall.function.name,
            toolCall.function.arguments,
            config.mcpServerUrl,
          );
          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: JSON.stringify(result),
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          emit({ type: 'status', message: `Tool call failed: ${msg}` });
          toolOutputs.push({ tool_call_id: toolCall.id, output: JSON.stringify({ error: msg }) });
        }
      }

      run = await openai.beta.threads.runs.submitToolOutputs(run.id, {
        thread_id: thread.id,
        tool_outputs: toolOutputs,
      });
    }
  }

  if (run.status !== 'completed') {
    throw new Error(`Agent run ended with status "${run.status}".`);
  }

  // ── 5. Extract the final assistant message ──────────────────────────────
  emit({ type: 'status', message: 'Retrieving agent response…' });

  const messages = await openai.beta.threads.messages.list(thread.id, { order: 'desc' });
  const assistantMsg = messages.data.find((m) => m.role === 'assistant');

  if (!assistantMsg) {
    throw new Error('No assistant message found after run completion.');
  }

  const firstContent = assistantMsg.content[0];
  if (firstContent.type !== 'text') {
    throw new Error(`Unexpected content type: ${firstContent.type}`);
  }

  return parseRfpOutput(firstContent.text.value);
}
