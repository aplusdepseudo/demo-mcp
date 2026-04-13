# 🤖 RFP Documentation Agent

An **Azure AI Foundry** agent that automates the generation of complete RFP (Request for Proposal) documentation packages, including compliance checklists, technical and functional requirements, vendor eligibility assessments, and a formatted Excel report — all based on your enterprise procurement prerequisites.

---

## 📋 What the Agent Does

Given an RFP **topic** (e.g., "Enterprise ERP System Implementation") and a **budget**, the agent performs the following steps automatically:

| Step | What Happens |
|------|-------------|
| **1. Prerequisites Review** | Searches the enterprise RFP prerequisites knowledge base (via the built-in `file_search` RAG tool) and generates a compliance checklist grouped by category (Vendor Qualification, Security, Financial, Technical, Delivery, ESG). |
| **2. Technical Checklist** | Produces a topic-specific technical evaluation checklist (architecture, performance, integrations, scalability, etc.). |
| **3. Functional Checklist** | Produces a topic-specific functional requirements checklist (business capabilities, modules, workflows, reporting, etc.). |
| **4. Vendor Sanity Check** | Calls the MCP procurement server to list all vendors and retrieve risk scores for each, then flags vendors as eligible/ineligible and checks category alignment with the RFP topic. |
| **5. Targeted Vendor List** | Produces a final shortlist of recommended vendors with justifications for inclusion or exclusion. |
| **6. Excel Report** | Generates a formatted multi-sheet `.xlsx` file containing all checklists and vendor data, ready for distribution to stakeholders. |

---

## 🏗️ Architecture

```
agent/
├── src/
│   ├── index.js          Entry point — reads config, parses CLI args, calls the agent
│   └── rfpAgent.js       Agent orchestration: knowledge base setup, agent creation,
│                         conversation loop with function-call handling, Excel generation
├── assets/
│   └── rfp-prerequisites.txt   Enterprise RFP prerequisite knowledge document
│                               (uploaded to a Foundry vector store at run time)
├── package.json
├── .env.example          Environment variable template
└── readme.md             ← You are here
```

The agent uses three Azure AI Foundry tools:

- **`file_search`** — RAG over the enterprise prerequisites document stored in an OpenAI vector store.
- **`list_vendors` / `get_vendor_risk_score`** — Custom function tools that call the MCP procurement server (`/mcp` endpoint) to retrieve live vendor and risk data.

At the end of the run, the agent version and vector store are automatically deleted from Foundry to avoid accumulating orphaned resources.

---

## 🧱 Tech Stack

| Component | Technology |
|-----------|-----------|
| Agent runtime | [Azure AI Foundry](https://learn.microsoft.com/azure/ai-foundry/) — Agent Service |
| SDK | [`@azure/ai-projects`](https://www.npmjs.com/package/@azure/ai-projects) v2.x |
| Authentication | [`@azure/identity`](https://www.npmjs.com/package/@azure/identity) — `DefaultAzureCredential` |
| AI Model | **GPT-5.1** (configurable via `FOUNDRY_MODEL_NAME`) |
| Excel generation | [`exceljs`](https://www.npmjs.com/package/exceljs) |
| Vendor data source | MCP mock procurement server (from the `mcp/` folder) |
| Runtime | Node.js 18+ (ESM) |

---

## ⚡ Getting Started

### Prerequisites

1. An [Azure subscription](https://azure.microsoft.com/free/).
2. A [Microsoft Foundry project](https://learn.microsoft.com/azure/ai-studio/how-to/create-projects) with:
   - A **GPT-5.1** (or compatible) model deployed. The deployment name is shown under **Models + endpoints** in the Foundry portal.
   - **File Search** and **Code Interpreter** enabled (both are on by default for Foundry Agent projects).
3. The **MCP procurement server** running locally (or deployed):
   ```bash
   cd mcp
   npm install
   npm run start   # starts on http://localhost:3000
   ```
4. [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) installed and authenticated:
   ```bash
   az login
   ```
5. Your Azure identity must have the **Azure AI User** role (or higher) on the Foundry project resource.

### 1) Install dependencies

```bash
cd agent
npm install
```

### 2) Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `FOUNDRY_PROJECT_ENDPOINT` | ✅ | Your Foundry project endpoint URL (see below) |
| `FOUNDRY_MODEL_NAME` | ✅ | Deployment name of your GPT model (e.g., `gpt-5.1`) |
| `MCP_SERVER_URL` | optional | URL of the MCP server (default: `http://localhost:3000`) |
| `OUTPUT_DIR` | optional | Output directory for generated files (default: `./output`) |

**Finding your Foundry project endpoint:**

1. Open [Azure AI Foundry portal](https://ai.azure.com).
2. Navigate to your project.
3. Click **Project settings** → **Overview**.
4. Copy the **Project endpoint** value. It looks like:
   `https://your-ai-services-account.services.ai.azure.com/api/projects/your-project-name`

### 3) Run the agent

```bash
# Default: "Enterprise ERP System Implementation", budget $500,000
npm start

# Custom topic and budget
npm start -- "Cloud Data Warehouse Migration" 750000
# or
node src/index.js "Logistics Management Platform" 300000
```

### 4) Review the output

Generated files are saved to the `output/` directory (or the path set in `OUTPUT_DIR`):

| File | Description |
|------|-------------|
| `rfp_<topic>_<timestamp>.xlsx` | Formatted Excel workbook with 5 sheets |
| `rfp_<topic>_<timestamp>.json` | Raw structured data from the agent |
| `agent-output.txt` | Raw text output from the agent (debug) |

---

## 📊 Excel Report Structure

The generated `.xlsx` workbook contains 5 worksheets:

### Sheet 1 — Prerequisites Checklist
All compliance items extracted from the enterprise RFP prerequisites knowledge document, grouped by category (Vendor Qualification, Security, Financial, Technical, Delivery, ESG).

| Column | Description |
|--------|-------------|
| Category | Requirement category |
| Checklist Item | Full requirement text |
| Priority | `Mandatory` / `Must-have` / `Nice-to-have` |
| Completed | ☐ checkbox (to be filled manually or via process) |

### Sheet 2 — Technical Checklist
Topic-specific technical evaluation criteria generated by the agent.

### Sheet 3 — Functional Checklist
Topic-specific functional capabilities and business requirements generated by the agent.

### Sheet 4 — Vendor Assessment
Full assessment of all vendors from the procurement system.

| Column | Description |
|--------|-------------|
| Vendor ID | Internal procurement ID |
| Vendor Name | Company name |
| Country | Country of registration |
| Category | Vendor service category |
| Risk Score | Numeric risk score (0–10) |
| Risk Level | `Low` / `Medium` / `High` |
| Eligible | Whether the vendor passed the eligibility check |
| Category Match | Whether the vendor's category matches the RFP topic |
| Justification | AI-generated reason for the eligibility decision |

### Sheet 5 — Targeted Vendors
Final recommended shortlist of vendors for this RFP.

---

## 🔍 How the Knowledge Base Works

At startup, the agent uploads `assets/rfp-prerequisites.txt` to a new OpenAI vector store inside your Foundry project. This document contains the full set of enterprise procurement prerequisites across 6 categories and 8 sections.

The agent uses the `file_search` tool to query this document when building the prerequisites checklist, ensuring every generated checklist item is grounded in your enterprise standards.

**To customize the knowledge base:**
1. Edit `assets/rfp-prerequisites.txt` with your organization's actual prerequisites.
2. You can also add additional files (e.g., security policies, contractual templates) — upload them to the same vector store in the `setupKnowledgeBase()` function in `src/rfpAgent.js`.

---

## 🔌 Vendor Data Integration

The agent queries the MCP procurement server using two function tools:

### `list_vendors`
Calls `POST /mcp` on the MCP server with the `list_suppliers` tool. Returns all suppliers with name, status, category, country, and risk score.

### `get_vendor_risk_score`
Calls `POST /mcp` on the MCP server with the `get_risk_score` tool for a specific vendor ID. Returns a detailed risk profile including `risk_level` and risk factor breakdown.

If the MCP server is not reachable (e.g., running in a standalone mode), the function tools will return an error and the agent will produce the checklists based on the prompt context alone, without vendor data.

---

## ☁️ Deploying to Azure AI Foundry Agent Service

The agent is designed to run as a hosted Foundry agent. Once the infrastructure in `infra/` is deployed:

1. Push this repository to your connected GitHub repository.
2. In the **Azure AI Foundry portal**, navigate to **Agents** and create a new agent referencing:
   - Model: your GPT-5.1 deployment
   - Tools: File Search (with the prerequisites vector store), plus the two function tools (`list_vendors`, `get_vendor_risk_score`) pointed at your deployed MCP server URL.
3. Set `FOUNDRY_PROJECT_ENDPOINT` and `FOUNDRY_MODEL_NAME` in your App Service environment variables.
4. Run the agent via the portal or by calling the agent API endpoint.

For fully private connectivity between the Foundry agent and the MCP server (deployed as an Azure Web App), use the **network injection** feature configured in `infra/main.bicep`, which places the agent in the same VNET as the Web App.

---

## 🛠️ Customization

| What to customize | Where |
|-------------------|-------|
| Enterprise prerequisites | `assets/rfp-prerequisites.txt` |
| Agent instructions / behavior | `AGENT_INSTRUCTIONS` constant in `src/rfpAgent.js` |
| Evaluation JSON schema | The prompt in `runAgentConversation()` in `src/rfpAgent.js` |
| Excel styles / colors | `addChecklistSheet()` / `addVendorSheet()` in `src/rfpAgent.js` |
| Model deployment name | `FOUNDRY_MODEL_NAME` env var or `config.modelDeployment` in `src/index.js` |
| Output directory | `OUTPUT_DIR` env var |

---

## 🔐 Authentication

The agent uses `DefaultAzureCredential` from `@azure/identity`, which automatically picks up credentials in this order:

1. **Environment variables** (`AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`) — for CI/CD or service principals.
2. **Azure CLI** (`az login`) — for local development.
3. **Managed Identity** — for deployments on Azure (App Service, ACI, AKS, etc.).

No API keys are stored in code or configuration files.

---

## 💡 Notes

- The agent version and vector store are automatically deleted from Foundry after each run to avoid resource accumulation. Disable this in the `finally` block of `runRFPDocumentationAgent()` if you want to inspect them in the Foundry portal.
- The Excel file uses the `exceljs` library; no Python or Excel installation is required.
- The agent's JSON response is also saved as `agent-output.txt` (raw text) and `rfp_*.json` (parsed) in the output directory for debugging.
