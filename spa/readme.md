# 🖥️ RFP Documentation SPA

A **Vue.js + TypeScript** single-page application that drives the end-to-end conversation with the Azure AI Foundry RFP Documentation Agent and presents the generated output in a structured, tab-based UI.

The SPA is a **pure static frontend** — it authenticates via MSAL (Entra ID), calls the Azure AI Foundry REST API directly from the browser, and renders the results. No backend server is needed.

---

## 📋 What This Does

| Responsibility | Where |
|----------------|-------|
| Accept RFP topic, budget and agent name from the user | `src/components/RfpForm.vue` |
| Authenticate with Azure via MSAL (Entra ID popup) | `src/services/auth.ts` |
| Create a Foundry conversation and send the RFP prompt | `src/services/foundryClient.ts` |
| Display real-time progress in the UI | `src/App.vue` + `src/components/ProgressLog.vue` |
| Display checklists and vendor tables in a tabbed layout | `src/components/RfpResults.vue` |

> **Note:** Tool calls (MCP procurement tools, file_search) are handled **entirely server-side** by Azure AI Foundry. The SPA never calls the MCP server directly.

---

## 🏗️ Architecture

```
spa/
├── src/                     Vue.js frontend (TypeScript, Vite)
│   ├── main.ts              App entry point
│   ├── App.vue              Root component — manages state and Foundry calls
│   ├── types.ts             Shared TypeScript types
│   ├── vite-env.d.ts        Vite / Vue ambient type declarations
│   ├── services/
│   │   ├── auth.ts          MSAL browser auth (Entra ID token acquisition)
│   │   └── foundryClient.ts Foundry REST client (Conversations + Responses API)
│   └── components/
│       ├── RfpForm.vue      Agent name + RFP input form
│       ├── ProgressLog.vue  Scrollable real-time progress log
│       ├── RfpResults.vue   Tabbed results view
│       ├── ChecklistTable.vue   Reusable checklist table
│       └── RiskBadge.vue    Coloured risk-level pill badge
│
├── index.html               Vite HTML template
├── vite.config.ts           Vite config
├── tsconfig.json            TypeScript config
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
| Authentication | [`@azure/msal-browser`](https://www.npmjs.com/package/@azure/msal-browser) — Entra ID (popup + silent token) |
| Agent API | Azure AI Foundry [Conversations + Responses REST API](https://learn.microsoft.com/azure/ai-services/openai/reference) (direct `fetch` from browser) |

---

## ⚡ Getting Started

### Prerequisites

1. **Node.js 18+**
2. The **agent provisioned** in Azure AI Foundry (run `cd agent && npm start` first) to obtain `agentName`.
3. An **Entra ID app registration** configured for SPA authentication:
   - Azure Portal → Entra ID → App registrations → New registration
   - Set a **SPA** redirect URI (e.g. `http://localhost:5173` for development)
   - Grant API permission: **Cognitive Services User** (`https://cognitiveservices.azure.com/.default`)
4. Your Azure identity must have the **Azure AI User** role on the Foundry project resource.

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
| `VITE_FOUNDRY_PROJECT_ENDPOINT` | ✅ | Foundry project endpoint URL |
| `VITE_ENTRA_CLIENT_ID` | ✅ | Entra ID app registration client ID |
| `VITE_ENTRA_TENANT_ID` | ✅ | Azure AD tenant ID |

### 3) Run in development mode

```bash
npm run dev
```

This starts the **Vite dev server** on `http://localhost:5173` with hot-reload.

Open **http://localhost:5173** in your browser.

### 4) Build for production

```bash
npm run build     # Builds the Vue SPA → dist/
npm run preview   # Preview the production build locally
```

The `dist/` folder can be deployed to any static hosting service (Azure Static Web Apps, Blob Storage, Netlify, etc.).

---

## 🖼️ UI Overview

| Section | Description |
|---------|-------------|
| **Agent Configuration** | Enter the Foundry agent name (default: `rfp-agent`) |
| **RFP Details** | Enter the procurement topic and budget |
| **Generate button** | Starts the agent conversation; disabled until required fields are filled |
| **Progress Log** | Live status messages as the conversation progresses |
| **Results (tabs)** | Prerequisites / Technical / Functional checklists + Vendor Assessment + Targeted Vendors |
| **Download JSON** | Download the raw `RfpOutput` as a `.json` file |

---

## 🔄 Conversation Flow

```
Browser (App.vue)
  ↓
  1. getAccessToken()              ← MSAL popup/silent (Entra ID)
  ↓
  2. FoundryClient.runRfpConversation()
     ├─ POST /openai/conversations  ← Create conversation with RFP prompt
     ├─ POST /openai/responses      ← Send to agent (agentName reference)
     │   └─ Foundry handles all tool calls server-side:
     │       ├─ file_search (RAG on prerequisites document)
     │       └─ MCP tools (list_suppliers, get_risk_score, …)
     └─ Parse output_text → RfpOutput JSON
  ↓
  3. Display results in tabbed UI
```

---

## 🔐 Authentication

Uses **MSAL browser** (`@azure/msal-browser`) for Entra ID authentication:

1. On first click of "Generate", a popup asks the user to sign in with their Azure AD account
2. Subsequent calls use **silent token acquisition** (cached tokens)
3. The bearer token is sent in the `Authorization` header of all Foundry REST API calls
4. Token scope: `https://cognitiveservices.azure.com/.default`

### Required Entra ID configuration

- **App registration** with SPA redirect URI (`http://localhost:5173` for dev)
- **API permission**: Cognitive Services User
- The user must have **Azure AI User** role on the Foundry project resource

---
