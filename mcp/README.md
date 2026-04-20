# 🔌 MCP Procurement Server

A stateless **Node.js + TypeScript** server that exposes mock procurement data as [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) tools over Streamable HTTP.

This server provides the data layer for the RFP Documentation Agent — suppliers, purchase orders, invoices, contracts, RFPs, proposals, and risk scores are all available as MCP tools that Azure AI Foundry calls server-side.

---

## 📋 What This Does

| Responsibility | Where |
|----------------|-------|
| Serve mock procurement data (suppliers, POs, invoices, contracts, RFPs, proposals) | `src/api.ts` |
| Register MCP tools with validated input schemas | `src/mcp.ts` |
| Expose a Streamable HTTP MCP endpoint at `POST /mcp` | `src/server.ts` |
| Health check endpoint at `GET /` | `src/server.ts` |

> **Note:** The server is fully **stateless** — a new MCP server instance and transport are created per request and torn down when the response closes.

---

## 🏗️ Architecture

```
mcp/
├── src/
│   ├── index.ts        Entry point — starts the Express server
│   ├── server.ts       Express HTTP server, route handlers, host validation
│   ├── mcp.ts          MCP server creation & tool registration
│   └── api.ts          Mock data stores & domain logic (pure functions)
├── build/              Compiled JavaScript output (after npm run build)
├── package.json
├── tsconfig.json
├── .deployment         Azure deployment configuration
└── README.md           ← You are here
```

### Two-layer design

1. **Domain API** (`api.ts`) — Pure functions that query in-memory `Record<string, T>` data stores. Each entity type follows the same pattern: a `list` function with optional filter parameters and a `get` function by ID. Returns typed objects or `{ error: "... not found" }` for missing IDs.

2. **MCP layer** (`mcp.ts`) — Registers tools using `@modelcontextprotocol/sdk` with Zod-validated input schemas. Tool names follow the `action_entity` convention (`get_supplier`, `list_purchase_orders`, `get_risk_score`). Each tool maps directly to a domain API function.

---

## 🧱 Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | **TypeScript** (ESM, strict mode) |
| Runtime | Node.js 18+ |
| HTTP framework | [Express](https://expressjs.com/) v5 |
| MCP SDK | [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk) |
| Schema validation | [Zod](https://zod.dev/) v3 (imported as `zod/v3`) |

---

## ⚡ Getting Started

### 1) Install dependencies

```bash
cd mcp
npm install
```

### 2) Run in development

```bash
npm start          # Run with tsx (no build step needed)
```

### 3) Watch mode (auto-reload)

```bash
npm run dev
```

### 4) Build for production

```bash
npm run build       # TypeScript → build/
npm run start:prod  # Run compiled JS
```

---

## 🔌 Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check — returns `{"status":"up","message":"Demo MCP server running"}` |
| `POST` | `/mcp` | MCP requests (Streamable HTTP transport) |
| `GET` | `/mcp` | Returns `405` (stateless — no SSE session support) |
| `DELETE` | `/mcp` | Returns `405` (stateless — no session teardown) |

---

## 🧪 Available MCP Tools

| Tool | Description |
|------|-------------|
| `get_dashboard_summary` | Aggregated overview of all procurement data |
| `list_suppliers` | List suppliers with optional filters (status, category, country) |
| `get_supplier` | Get a single supplier by ID |
| `list_purchase_orders` | List POs with optional filters (status, supplier_id) |
| `get_purchase_order` | Get a single PO by ID |
| `list_requisitions` | List requisitions with optional filters |
| `get_requisition` | Get a single requisition by ID |
| `list_invoices` | List invoices with optional filters (status, supplier_id) |
| `get_invoice` | Get a single invoice by ID |
| `list_contracts` | List contracts with optional filters (status, type) |
| `get_contract` | Get a single contract by ID |
| `list_rfps` | List RFPs with optional filters |
| `get_rfp` | Get a single RFP by ID |
| `list_proposals` | List proposals with optional filters (rfp_id, supplier_id) |
| `get_proposal` | Get a single proposal by ID |
| `get_risk_score` | Get the risk score for a supplier by ID |

---

## 🕵️ Inspect & Test with MCP Inspector

Use the MCP Inspector to validate the server and test tools interactively.

### 1) Start the server

```bash
npm start
```

### 2) Launch the inspector

```bash
npm run inspect
# or: npx -y @modelcontextprotocol/inspector
```

### 3) Connect

- Choose **Streamable HTTP** transport
- Set server URL to: `http://localhost:3000/mcp`
- Connect and initialize the session

### 4) Test a tool

- Select a tool (e.g., `list_suppliers`, `get_risk_score`)
- Provide inputs if needed (e.g., `supplier_id`, `status`)
- Run and inspect the JSON result

💡 If you run on a different port, update the URL (e.g., `http://localhost:4000/mcp`).

---

## ☁️ Deploy to Azure Web App

### Prerequisites

- An Azure subscription
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) installed
- A Linux App Service Plan (B1 or higher)

### Option A — Deploy with Azure CLI (ZIP deploy)

```bash
cd mcp
npm install && npm run build
mkdir -p package
tar -cavf ./package/build.zip -C ./build/ *
az webapp deploy --name <app-name> --resource-group <resource-group> \
  --src-path ./package/build.zip --type zip
```

### Option B — Use infra scripts

```bash
cd infra
npm run deploy-app   # Builds, packages, and deploys in one step
```

### Option C — Deploy via GitHub Actions

Set up continuous deployment from the Azure Portal under **Deployment Center**.

### Verify the deployment

```bash
curl https://<app-name>.azurewebsites.net/
# Expected: {"status":"up","message":"Demo MCP server running"}
```

### Connect an MCP client

Point your MCP client to: `https://<app-name>.azurewebsites.net/mcp`

### Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP server port (set automatically on Azure) | `3000` |
| `WEBSITE_HOSTNAME` | Allowed Host header value (set automatically on Azure) | — |

The MCP SDK validates the `Host` header for DNS rebinding protection. On Azure, `WEBSITE_HOSTNAME` is set automatically. For custom domains, adjust the allowed hosts accordingly.

---

## 📦 Scripts

```bash
npm start          # Run with tsx (development)
npm run start:prod # Run compiled build (production)
npm run dev        # Watch mode with auto-reload
npm run build      # Compile TypeScript → build/
npm run inspect    # Launch MCP Inspector UI
npm run deploy     # Build, zip & deploy to Azure Web App
```
