import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AIProjectClient } from '@azure/ai-projects';
import { DefaultAzureCredential } from '@azure/identity';
import ExcelJS from 'exceljs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the enterprise RFP prerequisites knowledge document
const PREREQUISITES_FILE = path.join(__dirname, '..', 'assets', 'rfp-prerequisites.txt');

// -------------------------------------------------------------------------
// Agent system instructions
// -------------------------------------------------------------------------
const AGENT_INSTRUCTIONS = `You are an expert procurement analyst specializing in enterprise RFP (Request for Proposal) management.

Your responsibilities:
1. Review the enterprise RFP prerequisites from the knowledge base and extract a compliance checklist.
2. Analyze the RFP topic and generate both a TECHNICAL checklist and a FUNCTIONAL checklist tailored to the topic.
3. Review the list of vendors provided via tools, verify their eligibility, and produce a shortlist of targeted vendors with justifications.
4. Respond in structured JSON so the calling application can generate Excel reports.

Always base prerequisites checklists on the knowledge base document. Always call the vendor tools to get current vendor data before producing the vendor shortlist.`;

// -------------------------------------------------------------------------
// Function tool definitions (vendor data from MCP procurement server)
// -------------------------------------------------------------------------
const LIST_VENDORS_TOOL = {
  type: 'function',
  name: 'list_vendors',
  description: 'List all vendors (suppliers) from the procurement system. Returns name, status, category, country, and risk score for each vendor.',
  strict: false,
  parameters: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Optional category filter (e.g., "ERP Software", "IT Services").',
      },
    },
    required: [],
    additionalProperties: false,
  },
};

const GET_VENDOR_RISK_TOOL = {
  type: 'function',
  name: 'get_vendor_risk_score',
  description: 'Get the detailed risk assessment for a specific vendor by their vendor ID.',
  strict: true,
  parameters: {
    type: 'object',
    properties: {
      vendor_id: {
        type: 'string',
        description: 'The vendor/supplier ID (e.g., "SUP-1000").',
      },
    },
    required: ['vendor_id'],
    additionalProperties: false,
  },
};

// -------------------------------------------------------------------------
// Helper: call the MCP procurement server via HTTP
// -------------------------------------------------------------------------
async function callMcpTool(mcpServerUrl, toolName, toolArgs) {
  const requestBody = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name: toolName, arguments: toolArgs },
  };

  const response = await fetch(`${mcpServerUrl}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`MCP server returned HTTP ${response.status} for tool "${toolName}"`);
  }

  // The MCP server uses Streamable HTTP — read the full body as text and parse
  const text = await response.text();
  // Strip SSE framing if present (lines starting with "data: ")
  const jsonLines = text
    .split('\n')
    .filter((line) => line.startsWith('data: '))
    .map((line) => line.slice(6).trim())
    .filter(Boolean);

  const parsed = jsonLines.length > 0 ? JSON.parse(jsonLines[0]) : JSON.parse(text);
  const content = parsed?.result?.content ?? [];
  return content.length > 0 ? JSON.parse(content[0].text) : null;
}

// -------------------------------------------------------------------------
// Step 1: Upload the prerequisites document and create a vector store
// -------------------------------------------------------------------------
async function setupKnowledgeBase(openAIClient) {
  console.log('Step 1/4 – Setting up knowledge base (vector store)...');

  const vectorStore = await openAIClient.vectorStores.create({ name: 'RFPPrerequisitesStore' });
  console.log(`  Vector store created: ${vectorStore.id}`);

  const fileStream = fs.createReadStream(PREREQUISITES_FILE);
  const uploaded = await openAIClient.vectorStores.files.uploadAndPoll(vectorStore.id, fileStream);
  console.log(`  Prerequisites document uploaded: ${uploaded.id}`);

  return vectorStore.id;
}

// -------------------------------------------------------------------------
// Step 2: Create the agent with all tools
// -------------------------------------------------------------------------
async function createAgent(project, config, vectorStoreId) {
  console.log('Step 2/4 – Creating RFP documentation agent...');

  const agent = await project.agents.createVersion('rfp-documentation-agent', {
    kind: 'prompt',
    model: config.modelDeployment,
    instructions: AGENT_INSTRUCTIONS,
    tools: [
      // RAG tool: search enterprise prerequisites knowledge base
      { type: 'file_search', vector_store_ids: [vectorStoreId] },
      // Function tools: query the procurement MCP server for vendor data
      LIST_VENDORS_TOOL,
      GET_VENDOR_RISK_TOOL,
    ],
  });

  console.log(`  Agent created: ${agent.name} (version ${agent.version})`);
  return agent;
}

// -------------------------------------------------------------------------
// Step 3: Run the agent conversation with function-call handling
// -------------------------------------------------------------------------
async function runAgentConversation(openAIClient, agent, config, rfpTopic, rfpBudget) {
  console.log('Step 3/4 – Running agent conversation...');

  const userPrompt = `
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

  // Initial response from the agent
  let response = await openAIClient.responses.create(
    { input: [{ type: 'message', role: 'user', content: userPrompt }] },
    { body: { agent: { name: agent.name, type: 'agent_reference' } } },
  );

  // Handle function calls in a loop until the agent provides a final text response
  while (response.output.some((item) => item.type === 'function_call')) {
    console.log('  Handling vendor tool calls...');
    const toolOutputs = [];

    for (const item of response.output) {
      if (item.type !== 'function_call') continue;

      let result;
      const args = JSON.parse(item.arguments || '{}');

      if (item.name === 'list_vendors') {
        console.log(`    → list_vendors (category: ${args.category ?? 'all'})`);
        result = await callMcpTool(config.mcpServerUrl, 'list_suppliers', { category: args.category });
      } else if (item.name === 'get_vendor_risk_score') {
        console.log(`    → get_vendor_risk_score (${args.vendor_id})`);
        result = await callMcpTool(config.mcpServerUrl, 'get_risk_score', { supplier_id: args.vendor_id });
      } else {
        result = { error: `Unknown tool: ${item.name}` };
      }

      toolOutputs.push({
        type: 'function_call_output',
        call_id: item.call_id,
        output: JSON.stringify(result),
      });
    }

    // Submit tool results back to the agent
    response = await openAIClient.responses.create(
      { input: toolOutputs, previous_response_id: response.id },
      { body: { agent: { name: agent.name, type: 'agent_reference' } } },
    );
  }

  return response.output_text;
}

// -------------------------------------------------------------------------
// Step 4: Parse agent output and generate the Excel report
// -------------------------------------------------------------------------
async function generateOutputs(agentOutput, rfpTopic, rfpBudget, outputDir) {
  console.log('Step 4/4 – Generating output files...');
  fs.mkdirSync(outputDir, { recursive: true });

  // Extract the JSON block from the agent response
  const jsonMatch = agentOutput.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Agent did not return a valid JSON block. Raw output saved to output/agent-output.txt');
  }

  const data = JSON.parse(jsonMatch[0]);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const safeTopicName = rfpTopic.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);

  // Save raw JSON for reference
  const jsonPath = path.join(outputDir, `rfp_${safeTopicName}_${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  JSON saved: ${jsonPath}`);

  // Build the Excel workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'RFP Documentation Agent';
  workbook.created = new Date();

  addChecklistSheet(workbook, 'Prerequisites Checklist', data.prerequisitesChecklist ?? [], '#1F4E79');
  addChecklistSheet(workbook, 'Technical Checklist', data.technicalChecklist ?? [], '#14375A');
  addChecklistSheet(workbook, 'Functional Checklist', data.functionalChecklist ?? [], '#1F497D');
  addVendorSheet(workbook, 'Vendor Assessment', data.vendorAssessment ?? []);
  addVendorSheet(workbook, 'Targeted Vendors', data.targetedVendors ?? [], true);

  const xlsxPath = path.join(outputDir, `rfp_${safeTopicName}_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(xlsxPath);
  console.log(`  Excel saved: ${xlsxPath}`);

  return { jsonPath, xlsxPath, data };
}

// -------------------------------------------------------------------------
// Excel helper: add a checklist worksheet
// -------------------------------------------------------------------------
function addChecklistSheet(workbook, sheetName, items, headerColor) {
  const sheet = workbook.addWorksheet(sheetName);

  // Column definitions
  sheet.columns = [
    { header: 'Category', key: 'category', width: 28 },
    { header: 'Checklist Item', key: 'item', width: 70 },
    { header: 'Priority', key: 'priority', width: 18 },
    { header: 'Completed', key: 'completed', width: 14 },
  ];

  // Style the header row
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + headerColor.replace('#', '') } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } } };
  });
  headerRow.height = 22;

  // Add data rows with alternating shading
  items.forEach((item, index) => {
    const row = sheet.addRow({
      category: item.category ?? '',
      item: item.item ?? '',
      priority: item.priority ?? '',
      completed: item.completed ? '✓' : '☐',
    });
    row.height = 18;

    const isEven = index % 2 === 0;
    row.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFF0F4F8' : 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFD0D8E0' } } };
    });

    // Color-code the Priority column
    const priorityCell = row.getCell('priority');
    if (item.priority === 'Must-have' || item.priority === 'Mandatory') {
      priorityCell.font = { color: { argb: 'FFC00000' }, bold: true };
    } else if (item.priority === 'Nice-to-have') {
      priorityCell.font = { color: { argb: 'FF7F7F7F' } };
    }

    // Center the Completed column
    row.getCell('completed').alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Freeze the header row
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Auto-filter on header
  sheet.autoFilter = { from: 'A1', to: 'D1' };
}

// -------------------------------------------------------------------------
// Excel helper: add a vendor worksheet
// -------------------------------------------------------------------------
function addVendorSheet(workbook, sheetName, vendors, isShortlist = false) {
  const sheet = workbook.addWorksheet(sheetName);

  const columns = isShortlist
    ? [
        { header: 'Vendor ID', key: 'vendorId', width: 14 },
        { header: 'Vendor Name', key: 'name', width: 30 },
        { header: 'Country', key: 'country', width: 14 },
        { header: 'Risk Score', key: 'riskScore', width: 13 },
        { header: 'Risk Level', key: 'riskLevel', width: 13 },
        { header: 'Justification', key: 'justification', width: 55 },
      ]
    : [
        { header: 'Vendor ID', key: 'vendorId', width: 14 },
        { header: 'Vendor Name', key: 'name', width: 30 },
        { header: 'Country', key: 'country', width: 14 },
        { header: 'Category', key: 'category', width: 22 },
        { header: 'Risk Score', key: 'riskScore', width: 13 },
        { header: 'Risk Level', key: 'riskLevel', width: 13 },
        { header: 'Eligible', key: 'eligible', width: 11 },
        { header: 'Category Match', key: 'categoryMatch', width: 16 },
        { header: 'Justification', key: 'justification', width: 50 },
      ];

  sheet.columns = columns;

  const headerColor = isShortlist ? 'FF375623' : 'FF2E4057';
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerColor } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } } };
  });
  headerRow.height = 22;

  vendors.forEach((vendor, index) => {
    const isEven = index % 2 === 0;
    const row = sheet.addRow(vendor);
    row.height = 18;

    row.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFF0F7EE' : 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFD0D8E0' } } };
    });

    // Color-code Risk Level
    const riskCell = row.getCell('riskLevel');
    if (vendor.riskLevel === 'High') {
      riskCell.font = { color: { argb: 'FFC00000' }, bold: true };
    } else if (vendor.riskLevel === 'Medium') {
      riskCell.font = { color: { argb: 'FF9C5700' }, bold: true };
    } else if (vendor.riskLevel === 'Low') {
      riskCell.font = { color: { argb: 'FF375623' }, bold: true };
    }

    // Color-code Eligible column if present
    if (!isShortlist) {
      const eligibleCell = row.getCell('eligible');
      eligibleCell.value = vendor.eligible ? '✓ Yes' : '✗ No';
      eligibleCell.font = { color: { argb: vendor.eligible ? 'FF375623' : 'FFC00000' }, bold: true };
      eligibleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      const matchCell = row.getCell('categoryMatch');
      matchCell.value = vendor.categoryMatch ? '✓ Yes' : '✗ No';
      matchCell.font = { color: { argb: vendor.categoryMatch ? 'FF375623' : 'FFC00000' } };
      matchCell.alignment = { horizontal: 'center', vertical: 'middle' };
    }
  });

  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  if (sheet.columns.length > 0) {
    const lastCol = sheet.columns.at(-1);
    sheet.autoFilter = { from: 'A1', to: { letter: lastCol.letter, number: 1 } };
  }
}

// -------------------------------------------------------------------------
// Main orchestration function
// -------------------------------------------------------------------------
export async function runRFPDocumentationAgent(config, rfpTopic, rfpBudget) {
  const project = new AIProjectClient(config.projectEndpoint, new DefaultAzureCredential());
  const openAIClient = project.getOpenAIClient();

  let agentName = null;
  let vectorStoreId = null;

  try {
    // Step 1 – Knowledge base
    vectorStoreId = await setupKnowledgeBase(openAIClient);

    // Step 2 – Create agent
    const agent = await createAgent(project, config, vectorStoreId);
    agentName = agent.name;
    const agentVersion = agent.version;

    // Step 3 – Run conversation
    const agentOutput = await runAgentConversation(openAIClient, agent, config, rfpTopic, rfpBudget);

    // Save raw output in case JSON parsing fails
    const outputDir = config.outputDir;
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'agent-output.txt'), agentOutput, 'utf-8');

    // Step 4 – Generate Excel and JSON outputs
    const { jsonPath, xlsxPath } = await generateOutputs(agentOutput, rfpTopic, rfpBudget, outputDir);

    console.log('\n✅ Done!');
    console.log(`   Excel report : ${xlsxPath}`);
    console.log(`   JSON data    : ${jsonPath}`);

    // Cleanup: delete the agent version to avoid accumulating versions in Foundry
    await project.agents.deleteVersion(agentName, agentVersion);
    console.log('   Agent version deleted from Foundry.');
  } catch (err) {
    console.error('\nError during agent run:', err.message ?? err);
    throw err;
  } finally {
    // Best-effort cleanup of the vector store to avoid orphaned resources
    if (vectorStoreId) {
      try {
        await openAIClient.vectorStores.del(vectorStoreId);
        console.log('   Vector store deleted.');
      } catch {
        console.warn('   Warning: could not delete vector store (manual cleanup may be needed).');
      }
    }
  }
}
