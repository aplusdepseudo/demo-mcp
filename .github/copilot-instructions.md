# Copilot Instructions

## Build & Run

All MCP server commands run from the `mcp/` directory:

```bash
cd mcp
npm run build        # TypeScript → build/ (tsc)
npm run start        # Run with tsx (no build step needed)
npm run dev          # Watch mode with auto-reload
npm run inspect      # Launch MCP Inspector UI
```

No test framework is configured.

## Architecture

This is a **stateless MCP (Model Context Protocol) server** that exposes mock procurement data as MCP tools over Streamable HTTP.

The codebase has two layers:

1. **Domain API** (`mcp/src/api.ts`) — Pure functions that query in-memory `Record<string, T>` data stores and return typed objects or `{ error: "... not found" }` for missing IDs. Each entity type (suppliers, POs, invoices, contracts, RFPs, proposals, requisitions) follows the same pattern: a `list` function with optional filter parameters and a `get` function by ID.

2. **MCP Tool Layer** (`mcp/src/mcp.ts`) — Registers each domain function as an MCP tool using `@modelcontextprotocol/sdk`. Input schemas are validated with Zod. Tool results are always returned as `{ content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }`.

3. **HTTP Server** (`mcp/src/server.ts`) — Express app created via `createMcpExpressApp` from the SDK. Exposes `GET /` (health) and `POST /mcp` (MCP requests). Each request creates a fresh `StreamableHTTPServerTransport` with no session management (`sessionIdGenerator: undefined`).

`mcp/src/index.ts` is just the entry point that calls `startServer()`.

## Conventions

- **ESM throughout**: `"type": "module"` in package.json; imports use `.js` extensions even for `.ts` source files (required by Node ESM resolution).
- **Tool naming**: MCP tools follow `action_entity` format — `get_supplier`, `list_purchase_orders`, `get_risk_score`.
- **Zod v3 import path**: Zod is imported as `zod/v3` (not bare `zod`), matching the installed version's export map.
- **API doc comments**: Each API section in `mcp/src/api.ts` uses a block-comment header with description, inputs, and outputs (written in French).
- **No session state**: The server is fully stateless — a new MCP server + transport is created per request and torn down on response close.
- **Environment variables**: `PORT` (server port, default 3000), `WEBSITE_HOSTNAME` (allowed Host headers for DNS rebinding protection, comma-separated).

## Infrastructure

The `infra/` folder contains Azure Bicep templates to provision an Azure AI Foundry instance with networking. The web app is deployed via ZIP deploy (`cd mcp && npm run deploy-app`). Resource names are configured in `mcp/package.json > config`.
