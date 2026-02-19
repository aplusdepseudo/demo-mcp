# 🚀 MCP Mock Demo Server

A lightweight **Node.js + TypeScript** demo server that showcases a simple implementation of an **MCP (Model Context Protocol) server**.

This project is designed to be easy to read, run, and extend for learning/demo purposes. ✨

## 🎯 What this project demonstrates

- 🧩 A minimal MCP server using `@modelcontextprotocol/sdk`
- 🌐 Streamable HTTP MCP endpoint at `/mcp`
- ✅ Health check endpoint at `/`
- 🛠️ A sample MCP tool: `list_suppliers`

## 🧱 Tech Stack

- Node.js
- TypeScript
- Express
- MCP SDK (`@modelcontextprotocol/sdk`)
- Zod

## ⚡ Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run in development

```bash
npm run start
```

### 3) Watch mode (auto-reload)

```bash
npm run dev
```

### 4) Build for production

```bash
npm run build
```

## 🔌 Endpoints

- `GET /` → returns server status
- `POST /mcp` → MCP requests (streamable HTTP transport)

## 🕵️ Inspect & Test with MCP Inspector

Use the MCP Inspector from the MCP npm package to validate your server and try tools interactively.

### 1) Start the server

```bash
npm run start
```

### 2) Launch MCP Inspector

```bash
npx -y @modelcontextprotocol/inspector
```

### 3) Connect to your server

- In the Inspector UI, choose **Streamable HTTP** transport
- Set server URL to: `http://localhost:3000/mcp`
- Connect, then initialize the session

### 4) Test a tool

- Open the tools list and select `list_suppliers`
- (Optional) provide inputs like `status` or `category`
- Run the tool and inspect the JSON result

💡 If you run on a different port, update the URL accordingly (for example `http://localhost:4000/mcp`).

## 🧪 Example tool included

- `list_suppliers`
  - Returns demo supplier data
  - Accepts optional inputs such as `status` and `category`

## 📂 Project Structure

```text
src/
  api.ts
  mcp.ts
  server.ts
  index.ts
build/
  ...compiled js
```

## 💡 Notes

This is a **demo/mock implementation** intended for experimentation and learning. Feel free to adapt it as a starting point for your own MCP integrations. 🙌
