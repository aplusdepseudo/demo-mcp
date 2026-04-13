# 🖥️ RFP Documentation SPA

A **Vue.js + TypeScript** single-page application that drives the end-to-end conversation with the Azure AI Foundry RFP Documentation Agent and presents the generated output in a structured, tab-based UI.

---

## 📋 What This Does

| Responsibility | Where |
|----------------|-------|
| Accept RFP topic, budget and Foundry agent config from the user | `src/components/RfpForm.vue` |
| Stream real-time progress from the backend to the UI | `src/App.vue` + `src/components/ProgressLog.vue` |
| Drive the Foundry conversation loop (thread → run → tool calls → result) | `server/agentConversation.ts` |
| Proxy `list_vendors` / `get_vendor_risk_score` tool calls to the MCP server | `server/agentConversation.ts` |
| Display checklists and vendor tables in a tabbed layout | `src/components/RfpResults.vue` |
| Serve the built Vue SPA and provide the `/api/generate` SSE endpoint | `server/index.ts` |

---

## 🏗️ Architecture

```
spa/
├── src/                     Vue.js frontend (TypeScript, Vite)
│   ├── main.ts              App entry point
│   ├── App.vue              Root component — manages state and SSE stream
│   ├── types.ts             Shared TypeScript types (frontend + backend)
│   ├── vite-env.d.ts        Vite / Vue ambient type declarations
│   └── components/
│       ├── RfpForm.vue      Configuration + RFP input form
│       ├── ProgressLog.vue  Scrollable real-time progress log
│       ├── RfpResults.vue   Tabbed results view
│       ├── ChecklistTable.vue   Reusable checklist table
│       └── RiskBadge.vue    Coloured risk-level pill badge
│
├── server/                  Express backend (TypeScript, Node.js)
│   ├── index.ts             Server entry point + /api/generate SSE handler
│   └── agentConversation.ts Foundry conversation loop + MCP proxy
│
├── index.html               Vite HTML template
├── vite.config.ts           Vite config (proxy /api → backend in dev)
├── tsconfig.json            TypeScript config for frontend
├── tsconfig.server.json     TypeScript config for backend
├── package.json             Scripts + dependencies
├── .env.example             Environment variable documentation
└── readme.md                ← You are here
```

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | [Vue.js 3](https://vuejs.org/) (Composition API, `<script setup>`) |
| Language | **TypeScript** (strict mode) |
| Build tool | [Vite](https://vitejs.dev/) v6 |
| Backend | [Express](https://expressjs.com/) v4 |
| Agent SDK | [`@azure/ai-projects`](https://www.npmjs.com/package/@azure/ai-projects) v2 |
| Authentication | [`@azure/identity`](https://www.npmjs.com/package/@azure/identity) — `DefaultAzureCredential` |
| Real-time updates | **Server-Sent Events (SSE)** |

---

## ⚡ Getting Started

### Prerequisites

1. **Node.js 18+**
2. The **agent provisioned** in Azure AI Foundry (run `cd agent && npm start` first) to obtain `agentName` + `agentVersion`.
3. The **MCP procurement server** running:
   ```bash
   cd mcp && npm install && npm run start
   ```
4. [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) authenticated: `az login`.
5. Your Azure identity must have the **Azure AI User** role on the Foundry project resource.

### 1) Install dependencies

```bash
cd spa
npm install
```

### 2) Configure environment variables

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `FOUNDRY_PROJECT_ENDPOINT` | ✅ | Foundry project endpoint URL |
| `MCP_SERVER_URL` | optional | MCP server URL (default: `http://localhost:3000`) |
| `PORT` | optional | Server port (default: `3000`) |

### 3) Run in development mode

```bash
npm run dev
```

This starts:
- **Vite dev server** on `http://localhost:5173` (hot-reload)
- **Express backend** on `http://localhost:3000` (auto-reload via tsx watch)

Vite proxies all `/api/*` calls to the backend automatically.

Open **http://localhost:5173** in your browser.

### 4) Build for production

```bash
npm run build    # Compiles TypeScript (backend) + Vite (frontend)
npm run start    # Starts the Express server that serves the built SPA
```

The production server listens on `http://localhost:3000` (or `$PORT`) and serves both the Vue SPA and the `/api/generate` endpoint.

---

## 🖼️ UI Overview

| Section | Description |
|---------|-------------|
| **Agent Configuration** | Enter the Foundry project endpoint, agent name, agent version, and MCP server URL |
| **RFP Details** | Enter the procurement topic and budget |
| **Generate button** | Starts the agent conversation; the button is disabled until required fields are filled |
| **Progress Log** | Live stream of status messages and tool-call events |
| **Results (tabs)** | Prerequisites / Technical / Functional checklists + Vendor Assessment + Targeted Vendors |
| **Download JSON** | Download the raw `RfpOutput` as a `.json` file |

---

## 🔄 Conversation Flow

```
Browser → POST /api/generate (SSE)
  ↓
server/index.ts
  ↓
server/agentConversation.ts
  ├─ AIProjectClient.getOpenAIClient()
  ├─ openai.beta.threads.create()
  ├─ openai.beta.threads.messages.create()  ← RFP prompt
  ├─ openai.beta.threads.runs.create()      ← references agentName
  └─ polling loop:
       ├─ requires_action → list_vendors    → MCP /mcp (list_suppliers)
       ├─ requires_action → get_vendor_risk_score → MCP /mcp (get_risk_score)
       └─ completed → retrieve assistant message → parseRfpOutput → SSE result
```

---

## 🔐 Authentication

Uses `DefaultAzureCredential` on the backend — automatically picks up:

- Azure CLI credentials (`az login`)
- Environment variables (`AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID`)
- Managed Identity when deployed on Azure

---
