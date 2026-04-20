# 📄 RFP Documentation Agent — Demo

A monorepo that demonstrates **automated RFP (Request for Proposal) documentation generation** using Azure AI Foundry, MCP (Model Context Protocol), and a Vue.js frontend.

An AI agent analyses mock procurement data (suppliers, contracts, invoices, risk scores) through MCP tools and an enterprise knowledge base, then produces structured checklists and vendor assessments — all rendered in a browser-based UI.

## 🙏 Acknowledgment

Thanks to Lucas for the original MCP server repository that served as a starting point:

- https://github.com/lzetea/ariba-mock

---

## 🏗️ Architecture Overview

```
┌─────────────┐        ┌───────────────────────────────────────────┐
│   Browser   │  REST  │           Azure AI Foundry                │
│   (SPA)     │───────▶│  ┌─────────────────────────────────────┐  │
│  Vue.js 3   │        │  │          RFP Agent                  │  │
│  MSAL auth  │        │  │  file_search (RAG) + MCP tools      │  │
└─────────────┘        │  └──────────────┬──────────────────────┘  │
                       │                 │ server-side tool calls   │
                       │  ┌──────────────▼──────────────────────┐  │
                       │  │       MCP Server (App Service)      │  │
                       │  │  Mock procurement data over MCP     │  │
                       │  └─────────────────────────────────────┘  │
                       └───────────────────────────────────────────┘
```

**Key design principle:** The agent handles all tool calls (MCP procurement tools, file_search) **server-side in Azure AI Foundry**. The SPA is a thin display layer — it authenticates via MSAL, creates a Foundry conversation via REST API, waits for the agent response, and renders the results.

---

## 📦 Components

| Directory | Component | Description |
|-----------|-----------|-------------|
| [`mcp/`](mcp/) | **MCP Server** | Stateless Node.js server exposing mock procurement data (suppliers, POs, invoices, contracts, RFPs, risk scores) as MCP tools over Streamable HTTP |
| [`agent/`](agent/) | **Agent Provisioner** | TypeScript CLI that provisions the RFP agent in Azure AI Foundry with file_search (RAG) and MCP tool connections |
| [`spa/`](spa/) | **Frontend SPA** | Vue.js 3 static frontend — authenticates via MSAL, drives the Foundry conversation, and renders structured results |
| [`infra/`](infra/) | **Infrastructure** | Azure Bicep templates to provision AI Foundry, App Service, Cosmos DB, AI Search, Storage, and private networking |

---

## ⚡ Quick Start

### Prerequisites

- **Node.js 18+**
- An [Azure subscription](https://azure.microsoft.com/free/)
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) installed and authenticated (`az login`)

### 1) Deploy infrastructure

```bash
cd infra
# Edit main.bicepparam with your values (prefix, subnet IDs, etc.)
npm run deploy-infra
```

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Faplusdepseudo%2Fdemo-mcp%2Fmain%2Finfra%2Fmain.json)

### 2) Deploy the MCP server

```bash
cd infra
npm run deploy-app      # Builds mcp/, packages, and deploys to Azure App Service
```

### 3) Provision the agent

```bash
cd agent
cp .env.example .env    # Set FOUNDRY_PROJECT_ENDPOINT, FOUNDRY_MODEL_NAME, MCP_SERVER_URL
npm install && npm start
```

### 4) Run the SPA

```bash
cd spa
cp .env.example .env    # Set VITE_FOUNDRY_PROJECT_ENDPOINT, VITE_ENTRA_CLIENT_ID, VITE_ENTRA_TENANT_ID
npm install && npm run dev
```

Open **http://localhost:5173** — enter an RFP topic, budget, and agent name, then click **Generate**.

---

## 🔄 End-to-End Flow

```
1. Infrastructure deployed (Bicep)  →  AI Foundry + App Service + networking
2. MCP server deployed              →  Procurement tools available at /mcp
3. Agent provisioned                →  Agent created in Foundry with tools
4. User opens SPA                   →  Authenticates via MSAL (Entra ID)
5. User submits RFP topic + budget  →  SPA sends prompt to Foundry agent
6. Agent calls tools server-side    →  file_search (RAG) + MCP procurement tools
7. Agent returns structured JSON    →  SPA renders checklists + vendor tables
```

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| MCP Server | Node.js, Express, TypeScript, MCP SDK, Zod |
| Agent | TypeScript, Azure AI Foundry SDK (`@azure/ai-projects`), ExcelJS |
| Frontend | Vue.js 3, Vite, MSAL Browser |
| Infrastructure | Azure Bicep, AI Foundry, App Service, Cosmos DB, AI Search |
| Authentication | Entra ID (MSAL) + `DefaultAzureCredential` |

---

## 📂 Project Structure

```
├── mcp/                    MCP procurement server
│   └── src/
│       ├── api.ts          Mock data & domain logic
│       ├── mcp.ts          MCP tool registration
│       ├── server.ts       Express HTTP server
│       └── index.ts        Entry point
├── agent/                  Foundry agent provisioner
│   ├── src/
│   │   ├── agent.ts        Provision/deprovision, prompt builder, report generation
│   │   └── index.ts        CLI entry point
│   └── assets/
│       └── rfp-prerequisites.txt
├── spa/                    Vue.js frontend
│   └── src/
│       ├── App.vue         Root component (conversation orchestration)
│       ├── services/       Auth (MSAL) + Foundry REST client
│       └── components/     Form, progress log, results tabs
└── infra/                  Azure Bicep infrastructure
    ├── main.bicep          Orchestrator module
    ├── foundry.bicep       AI Foundry + networking
    ├── webapp.bicep        App Service
    └── main.bicepparam     Parameter values
```

---

## 📖 Component Documentation

Each component has its own README with detailed setup, configuration, and API documentation:

- [**MCP Server** → `mcp/README.md`](mcp/README.md)
- [**Agent Provisioner** → `agent/readme.md`](agent/readme.md)
- [**Frontend SPA** → `spa/readme.md`](spa/readme.md)
- [**Infrastructure** → `infra/README.md`](infra/README.md)

---

## 💡 Notes

This is a **demo implementation** intended for experimentation and learning. The procurement data is entirely mock/synthetic. Feel free to adapt it as a starting point for your own MCP + AI Foundry integrations. 🙌
