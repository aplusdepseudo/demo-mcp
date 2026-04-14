import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AIProjectClient, type FileSearchTool } from '@azure/ai-projects';
import { DefaultAzureCredential } from '@azure/identity';
import ExcelJS from 'exceljs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the enterprise RFP prerequisites knowledge document
const PREREQUISITES_FILE = path.join(__dirname, '..', 'assets', 'rfp-prerequisites.txt');

// -------------------------------------------------------------------------
// Public types
// -------------------------------------------------------------------------

export interface AgentConfig {
  projectEndpoint: string;
  modelDeployment: string;
  mcpServerUrl: string;
  outputDir: string;
}

export interface AgentProvisionResult {
  agentName: string;
  agentVersion: string;
  vectorStoreId: string;
}

export interface ChecklistItem {
  category: string;
  item: string;
  priority: string;
  completed: boolean;
}

export interface VendorAssessment {
  vendorId: string;
  name: string;
  country: string;
  category: string;
  riskScore: number;
  riskLevel: string;
  eligible: boolean;
  categoryMatch: boolean;
  justification: string;
}

export interface TargetedVendor {
  vendorId: string;
  name: string;
  country: string;
  riskScore: number;
  riskLevel: string;
  justification: string;
}

export interface RfpOutput {
  rfpTopic: string;
  budget: number;
  prerequisitesChecklist: ChecklistItem[];
  technicalChecklist: ChecklistItem[];
  functionalChecklist: ChecklistItem[];
  vendorAssessment: VendorAssessment[];
  targetedVendors: TargetedVendor[];
}

// -------------------------------------------------------------------------
// Agent system instructions
// -------------------------------------------------------------------------

const AGENT_INSTRUCTIONS = `You are an expert procurement analyst specializing in enterprise RFP (Request for Proposal) management.

Your responsibilities:
1. Review the enterprise RFP prerequisites from the knowledge base and extract a compliance checklist.
2. Analyze the RFP topic and generate both a TECHNICAL checklist and a FUNCTIONAL checklist tailored to the topic.
3. Use the procurement MCP tools to retrieve supplier data and risk assessments, verify their eligibility, and produce a shortlist of targeted vendors with justifications.
4. Respond in structured JSON so the calling application can generate Excel reports.

Always base prerequisites checklists on the knowledge base document. Always use the procurement tools to get current vendor data before producing the vendor shortlist.`;

// -------------------------------------------------------------------------
// Prompt builder
// Exported so the SPA can use this as the initial user message when starting
// a conversation with the provisioned agent.
// -------------------------------------------------------------------------

export function buildRfpPrompt(rfpTopic: string, rfpBudget: number): string {
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

// -------------------------------------------------------------------------
// Helpers: parse raw LLM text to typed RfpOutput
// Exported for use by the SPA or any downstream consumer.
// -------------------------------------------------------------------------

export function parseRfpOutput(text: string): RfpOutput {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Agent response does not contain a JSON block.');
  }
  return JSON.parse(jsonMatch[0]) as RfpOutput;
}

// -------------------------------------------------------------------------
// Private: upload the prerequisites document and create a vector store
// -------------------------------------------------------------------------

type OpenAIClient = ReturnType<AIProjectClient['getOpenAIClient']>;

async function setupKnowledgeBase(openAIClient: OpenAIClient): Promise<string> {
  console.log('Step 1/2 – Setting up knowledge base (vector store)...');

  const vectorStore = await openAIClient.vectorStores.create({ name: 'RFPPrerequisitesStore' });
  console.log(`  Vector store created: ${vectorStore.id}`);

  const fileStream = fs.createReadStream(PREREQUISITES_FILE);
  const uploaded = await openAIClient.vectorStores.files.uploadAndPoll(vectorStore.id, fileStream);
  console.log(`  Prerequisites document uploaded: ${uploaded.id}`);

  return vectorStore.id;
}

// -------------------------------------------------------------------------
// Private: create the agent version in Foundry with all tools
// -------------------------------------------------------------------------

async function createAgentVersion(
  project: AIProjectClient,
  config: AgentConfig,
  vectorStoreId: string,
): Promise<{ name: string; version: string }> {
  console.log('Step 2/2 – Creating RFP agent...');

  const fileSearchTool: FileSearchTool = {
    type: 'file_search',
    vector_store_ids: [vectorStoreId],
  };

  const mcpEndpoint = new URL('/mcp', config.mcpServerUrl).toString();

  const agent = await project.agents.createVersion('rfp-agent', {
    kind: 'prompt',
    model: config.modelDeployment,
    instructions: AGENT_INSTRUCTIONS,
    tools: [
      fileSearchTool,
      {
        type: 'mcp',
        server_label: 'procurement',
        server_url: mcpEndpoint,
        require_approval: 'never',
      },
    ],
  });

  console.log(`  Agent created: ${agent.name} (version ${agent.version})`);
  return { name: agent.name, version: agent.version };
}

// -------------------------------------------------------------------------
// Provision: create vector store + agent in Azure AI Foundry
// Call this once before starting a conversation from the SPA.
// -------------------------------------------------------------------------

export async function provisionRFPAgent(config: AgentConfig): Promise<AgentProvisionResult> {
  const project = new AIProjectClient(config.projectEndpoint, new DefaultAzureCredential());
  const openAIClient = project.getOpenAIClient();

  const vectorStoreId = await setupKnowledgeBase(openAIClient);
  const agent = await createAgentVersion(project, config, vectorStoreId);

  return {
    agentName: agent.name,
    agentVersion: agent.version,
    vectorStoreId,
  };
}

// -------------------------------------------------------------------------
// Deprovision: delete the agent version and vector store from Foundry
// Call this after the SPA conversation is complete.
// -------------------------------------------------------------------------

export async function deprovisionRFPAgent(
  config: AgentConfig,
  provision: AgentProvisionResult,
): Promise<void> {
  const project = new AIProjectClient(config.projectEndpoint, new DefaultAzureCredential());
  const openAIClient = project.getOpenAIClient();

  try {
    await project.agents.deleteVersion(provision.agentName, provision.agentVersion);
    console.log(`  Agent version deleted: ${provision.agentName} v${provision.agentVersion}`);
  } catch (err) {
    console.warn('  Warning: could not delete agent version (manual cleanup may be needed).');
  }

  try {
    await openAIClient.vectorStores.delete(provision.vectorStoreId);
    console.log(`  Vector store deleted: ${provision.vectorStoreId}`);
  } catch (err) {
    console.warn('  Warning: could not delete vector store (manual cleanup may be needed).');
  }
}

// -------------------------------------------------------------------------
// Generate Excel report from typed agent output
// Call this after the SPA has obtained and parsed the agent's JSON response.
// -------------------------------------------------------------------------

export async function generateReport(
  output: RfpOutput,
  rfpTopic: string,
  rfpBudget: number,
  outputDir: string,
): Promise<{ jsonPath: string; xlsxPath: string }> {
  fs.mkdirSync(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const safeTopicName = rfpTopic.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);

  // Save raw JSON for reference
  const jsonPath = path.join(outputDir, `rfp_${safeTopicName}_${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');

  // Build the Excel workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'RFP Documentation Agent';
  workbook.created = new Date();

  addChecklistSheet(workbook, 'Prerequisites Checklist', output.prerequisitesChecklist ?? [], '#1F4E79');
  addChecklistSheet(workbook, 'Technical Checklist', output.technicalChecklist ?? [], '#14375A');
  addChecklistSheet(workbook, 'Functional Checklist', output.functionalChecklist ?? [], '#1F497D');
  addVendorSheet(workbook, 'Vendor Assessment', output.vendorAssessment ?? []);
  addVendorSheet(workbook, 'Targeted Vendors', output.targetedVendors ?? [], true);

  const xlsxPath = path.join(outputDir, `rfp_${safeTopicName}_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(xlsxPath);

  return { jsonPath, xlsxPath };
}

// -------------------------------------------------------------------------
// Excel helper: add a checklist worksheet
// -------------------------------------------------------------------------

function addChecklistSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  items: ChecklistItem[],
  headerColor: string,
): void {
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = [
    { header: 'Category', key: 'category', width: 28 },
    { header: 'Checklist Item', key: 'item', width: 70 },
    { header: 'Priority', key: 'priority', width: 18 },
    { header: 'Completed', key: 'completed', width: 14 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + headerColor.replace('#', '') } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } } };
  });
  headerRow.height = 22;

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

    const priorityCell = row.getCell('priority');
    if (item.priority === 'Must-have' || item.priority === 'Mandatory') {
      priorityCell.font = { color: { argb: 'FFC00000' }, bold: true };
    } else if (item.priority === 'Nice-to-have') {
      priorityCell.font = { color: { argb: 'FF7F7F7F' } };
    }

    row.getCell('completed').alignment = { horizontal: 'center', vertical: 'middle' };
  });

  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: 'A1', to: 'D1' };
}

// -------------------------------------------------------------------------
// Excel helper: add a vendor worksheet
// -------------------------------------------------------------------------

function addVendorSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  vendors: (VendorAssessment | TargetedVendor)[],
  isShortlist = false,
): void {
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = isShortlist
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

    const riskCell = row.getCell('riskLevel');
    if (vendor.riskLevel === 'High') {
      riskCell.font = { color: { argb: 'FFC00000' }, bold: true };
    } else if (vendor.riskLevel === 'Medium') {
      riskCell.font = { color: { argb: 'FF9C5700' }, bold: true };
    } else if (vendor.riskLevel === 'Low') {
      riskCell.font = { color: { argb: 'FF375623' }, bold: true };
    }

    if (!isShortlist) {
      const v = vendor as VendorAssessment;
      const eligibleCell = row.getCell('eligible');
      eligibleCell.value = v.eligible ? '✓ Yes' : '✗ No';
      eligibleCell.font = { color: { argb: v.eligible ? 'FF375623' : 'FFC00000' }, bold: true };
      eligibleCell.alignment = { horizontal: 'center', vertical: 'middle' };

      const matchCell = row.getCell('categoryMatch');
      matchCell.value = v.categoryMatch ? '✓ Yes' : '✗ No';
      matchCell.font = { color: { argb: v.categoryMatch ? 'FF375623' : 'FFC00000' } };
      matchCell.alignment = { horizontal: 'center', vertical: 'middle' };
    }
  });

  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  if (sheet.columns.length > 0) {
    sheet.autoFilter = { from: 'A1', to: { row: 1, column: sheet.columns.length } };
  }
}
