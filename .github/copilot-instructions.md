# Copilot Instructions

## Build & Run

### MCP Server (mock procurement data)

All MCP server commands run from the `mcp/` directory:

```bash
cd mcp
npm run build        # TypeScript → build/ (tsc)
npm run start        # Run with tsx (no build step needed)
npm run dev          # Watch mode with auto-reload
npm run inspect      # Launch MCP Inspector UI
```

### Agent (Azure AI Foundry provisioner)

```bash
cd agent
npm install
npm start            # Provision the agent in Foundry (tsx)
npm run build        # TypeScript → build/ (tsc)
```

### SPA (Vue 3 + Express backend)

```bash
cd spa
npm install
npm run dev          # Vite dev server + Express backend (concurrently)
npm run build        # Build Vue SPA for production
npm run start        # Start production Express server
```

No test framework is configured.

## Architecture

This is a three-component monorepo for an RFP (Request for Proposal) documentation automation demo:

1. **MCP Server** (`mcp/`) — Stateless MCP server that exposes mock procurement data (suppliers, POs, invoices, contracts, RFPs, proposals, risk scores) as MCP tools over Streamable HTTP at `POST /mcp`.

2. **Agent** (`agent/`) — Azure AI Foundry agent provisioner. Creates an agent in Foundry with:
   - `file_search` tool (vector store with RFP prerequisites document)
   - `mcp` tool (native MCP connection to the procurement server — all tool calls handled server-side by Foundry)

3. **SPA** (`spa/`) — Vue 3 frontend + Express backend. The SPA **only displays agent progress** — it never calls MCP tools directly. The backend creates a Foundry conversation, sends the prompt via the Conversations + Responses API, and streams status events to the frontend via SSE.

4. **Infra** (`infra/`) — Azure Bicep templates + deployment scripts.

### Key design principle

The agent handles all tool calls (MCP procurement tools, file_search) **server-side in Azure AI Foundry**. The SPA is a thin display layer that creates a conversation, waits for the agent response, and renders the results.

## Domain Layer

The domain API (`mcp/src/api.ts`) provides pure functions that query in-memory `Record<string, T>` data stores and return typed objects or `{ error: "... not found" }` for missing IDs. Each entity type follows the same pattern: a `list` function with optional filter parameters and a `get` function by ID.

## Conventions

- **ESM throughout**: `"type": "module"` in all package.json files; imports use `.js` extensions even for `.ts` source files (required by Node ESM resolution).
- **Tool naming**: MCP tools follow `action_entity` format — `get_supplier`, `list_purchase_orders`, `get_risk_score`.
- **Zod v3 import path**: Zod is imported as `zod/v3` (not bare `zod`), matching the installed version's export map.
- **API doc comments**: Each API section in `mcp/src/api.ts` uses a block-comment header with description, inputs, and outputs (written in French).
- **No session state**: The MCP server is fully stateless — a new MCP server + transport is created per request and torn down on response close.
- **Environment variables**: `PORT` (server port, default 3000), `WEBSITE_HOSTNAME` (allowed Host headers for DNS rebinding protection, comma-separated).

## Git Workflow

Before committing, always ask the user for a commit message (title) and description. Do not generate commit messages autonomously.

## Infrastructure

The `infra/` folder contains Azure Bicep templates and its own `infra/package.json` with deployment scripts. Resource names (`resourceGroup`, `resourceWebApp`) are configured in `infra/package.json > config`. Deploy with `cd infra && npm run deploy-infra` (Bicep) or `npm run deploy-app` (web app ZIP deploy).
