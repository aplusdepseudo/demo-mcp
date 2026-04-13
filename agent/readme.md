# 🤖 RFP Documentation Agent

An **Azure AI Foundry** agent that provisions and configures the infrastructure for automated RFP (Request for Proposal) documentation generation. The agent is provisioned from this code; the conversation itself is handled by a separate single-page application (SPA).

---

## 📋 What This Code Does

This module handles the **server-side lifecycle** of the RFP agent:

| Responsibility | Where |
|----------------|-------|
| Upload enterprise prerequisites to a vector store (RAG knowledge base) | `provisionRFPAgent` |
| Create and register the agent in Azure AI Foundry with all tools | `provisionRFPAgent` |
| Delete the agent version and vector store when done | `deprovisionRFPAgent` |
| Parse the agent's JSON response into typed data | `parseRfpOutput` |
| Generate a formatted Excel report from the agent output | `generateReport` |

The **conversation** (sending the user prompt, handling `list_vendors` / `get_vendor_risk_score` function calls, receiving the JSON response) is owned by the SPA.

---

## 🏗️ Architecture

```
agent/
├── src/
│   ├── index.ts          CLI entry point — provisions the agent and prints
│   │                     agentName + agentVersion + vectorStoreId as JSON
│   └── rfpAgent.ts       All exported types, tool definitions, prompt builder,
│                         provision/deprovision, parseRfpOutput, generateReport
├── assets/
│   └── rfp-prerequisites.txt   Enterprise RFP prerequisite knowledge document
│                               (uploaded to a Foundry vector store at provision time)
├── tsconfig.json
├── package.json
├── .env.example
└── readme.md             ← You are here
```

### Agent tools registered in Foundry

| Tool | Type | Description |
|------|------|-------------|
| `file_search` | Built-in RAG | Searches the uploaded prerequisites document via vector store |
| `list_vendors` | Function (SPA handles) | Lists all suppliers from the MCP procurement server |
| `get_vendor_risk_score` | Function (SPA handles) | Retrieves the risk profile for a specific supplier |

---

## 🧱 Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | **TypeScript** (ESM, strict mode) |
| Agent runtime | [Azure AI Foundry](https://learn.microsoft.com/azure/ai-foundry/) — Agent Service |
| SDK | [`@azure/ai-projects`](https://www.npmjs.com/package/@azure/ai-projects) v2.x |
| Authentication | [`@azure/identity`](https://www.npmjs.com/package/@azure/identity) — `DefaultAzureCredential` |
| AI Model | **GPT-5.1** (configurable via `FOUNDRY_MODEL_NAME`) |
| Excel generation | [`exceljs`](https://www.npmjs.com/package/exceljs) |
| Runtime | Node.js 18+ |

---

## ⚡ Getting Started

### Prerequisites

1. An [Azure subscription](https://azure.microsoft.com/free/).
2. A [Microsoft Foundry project](https://learn.microsoft.com/azure/ai-studio/how-to/create-projects) with a **GPT-5.1** (or compatible) model deployed.
3. The **MCP procurement server** running (used by the SPA for vendor data):
   ```bash
   cd mcp && npm install && npm run start
   ```
4. [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) authenticated: `az login`.
5. Your Azure identity must have the **Azure AI User** role on the Foundry project resource.

### 1) Install dependencies

```bash
cd agent
npm install
```

### 2) Configure environment variables

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `FOUNDRY_PROJECT_ENDPOINT` | ✅ | Foundry project endpoint URL |
| `FOUNDRY_MODEL_NAME` | ✅ | Deployment name of your GPT model |
| `MCP_SERVER_URL` | optional | URL of the MCP server (default: `http://localhost:3000`) |
| `OUTPUT_DIR` | optional | Output directory for generated reports (default: `./output`) |

### 3) Provision the agent

```bash
npm start
```

The output is a JSON object the SPA needs to start a conversation:

```json
{
  "agentName": "rfp-documentation-agent",
  "agentVersion": "1",
  "vectorStoreId": "vs_abc123"
}
```

### 4) Build for production

```bash
npm run build   # compiles TypeScript → build/
```

---

## 🔄 End-to-End Flow

```
1. npm start
   → provisionRFPAgent()
   → uploads rfp-prerequisites.txt to a Foundry vector store
   → creates agent version in Foundry with file_search + function tools
   → prints { agentName, agentVersion, vectorStoreId }

2. SPA receives agentName + agentVersion
   → calls buildRfpPrompt(topic, budget) to get the initial user message
   → creates a Foundry conversation and sends the prompt with the agent reference
   → handles list_vendors function calls  → forwards to MCP server → returns results
   → handles get_vendor_risk_score calls → forwards to MCP server → returns results
   → receives the agent's final JSON text response

3. SPA calls parseRfpOutput(responseText)
   → extracts and validates the typed RfpOutput JSON

4. SPA (or backend) calls generateReport(output, topic, budget, outputDir)
   → saves rfp_<topic>_<timestamp>.json
   → saves rfp_<topic>_<timestamp>.xlsx  (5-sheet Excel workbook)

5. SPA calls deprovisionRFPAgent(config, provision)
   → deletes the agent version from Foundry
   → deletes the vector store
```

---

## 📊 Excel Report Structure

The `.xlsx` workbook contains 5 worksheets:

| Sheet | Content |
|-------|---------|
| **Prerequisites Checklist** | Compliance items from the enterprise knowledge base, grouped by category |
| **Technical Checklist** | Topic-specific technical evaluation criteria |
| **Functional Checklist** | Topic-specific functional requirements |
| **Vendor Assessment** | Full eligibility and risk review of all vendors |
| **Targeted Vendors** | Final recommended shortlist with justifications |

---

## 📦 Exported API

```typescript
// Types
export interface AgentConfig { ... }
export interface AgentProvisionResult { agentName, agentVersion, vectorStoreId }
export interface RfpOutput { rfpTopic, budget, prerequisitesChecklist, technicalChecklist, functionalChecklist, vendorAssessment, targetedVendors }
export interface ChecklistItem { category, item, priority, completed }
export interface VendorAssessment { vendorId, name, country, category, riskScore, riskLevel, eligible, categoryMatch, justification }
export interface TargetedVendor { vendorId, name, country, riskScore, riskLevel, justification }

// Tool definitions (export so the SPA knows which function call names to handle)
export const LIST_VENDORS_TOOL: FunctionTool
export const GET_VENDOR_RISK_TOOL: FunctionTool

// Helpers
export function buildRfpPrompt(rfpTopic: string, rfpBudget: number): string
export function parseRfpOutput(text: string): RfpOutput

// Agent lifecycle
export async function provisionRFPAgent(config: AgentConfig): Promise<AgentProvisionResult>
export async function deprovisionRFPAgent(config: AgentConfig, provision: AgentProvisionResult): Promise<void>

// Report generation
export async function generateReport(output: RfpOutput, rfpTopic: string, rfpBudget: number, outputDir: string): Promise<{ jsonPath: string; xlsxPath: string }>
```

---

## 🔐 Authentication

Uses `DefaultAzureCredential` — automatically picks up Azure CLI (`az login`), environment variables (`AZURE_CLIENT_ID` etc.), or Managed Identity on Azure.

---

## 🔍 Knowledge Base

`assets/rfp-prerequisites.txt` contains enterprise procurement requirements across 8 sections (Vendor Qualification, Security, Compliance, Financial, Technical, Delivery, ESG, Evaluation Weights). Customize this file for your organization's standards before provisioning.

---

## ☁️ Deploying to Azure

Once the infrastructure in `infra/` is provisioned, run `npm start` from within an Azure environment (App Service, Container, etc.) to provision the agent. The SPA then connects to the agent using the returned `agentName` and `agentVersion`.

For fully private connectivity between the SPA/backend and the MCP server, use the VNET injection configured in `infra/main.bicep`.

