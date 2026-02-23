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

## ☁️ Deploy to Azure Web App

This project can be deployed to an **Azure Web App (Node.js)** with minimal configuration.

### Prerequisites

- An Azure subscription
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) installed
- A Linux **App Service Plan** (B1 or higher recommended)

### 1) Create the Azure Web App

```bash
az group create --name <resource-group> --location <region>
az appservice plan create --name <plan-name> --resource-group <resource-group> --sku B1 --is-linux
az webapp create --name <app-name> --resource-group <resource-group> --plan <plan-name> --runtime "NODE:22-lts"
```

### 2) Configure app settings

Azure Web App automatically sets the `PORT` environment variable — the server already picks it up.

The MCP SDK includes DNS rebinding protection that validates the `Host` header. On Azure, the incoming host is your `*.azurewebsites.net` domain. The server reads `WEBSITE_HOSTNAME` (automatically set by Azure) to allow it:

```bash
# WEBSITE_HOSTNAME is set automatically by Azure — no manual action needed.
```

If you use a custom domain, add it via the `WEBSITE_HOSTNAME` override or adjust `ALLOWED_HOSTS` accordingly.

### 3) Build and deploy

**Option A — Deploy with Azure CLI (ZIP deploy):**

```bash
npm install
npm run build
az webapp deploy --name <app-name> --resource-group <resource-group> --src-path . --type zip
```

**Option B — Deploy via GitHub Actions:**

Set up continuous deployment from your repository in the Azure Portal under **Deployment Center**, or use the Azure CLI:

```bash
az webapp deployment source config --name <app-name> --resource-group <resource-group> --repo-url <github-repo-url> --branch main
```

Azure's Oryx build system will automatically run `npm install` and `npm run build` during deployment.

### 4) Verify the deployment

```bash
curl https://<app-name>.azurewebsites.net/
# Expected: {"status":"up","message":"Demo MCP server running"}
```

### 5) Connect an MCP client

Point your MCP client to:

```
https://<app-name>.azurewebsites.net/mcp
```

### Key configuration notes

| Setting | Description |
|---|---|
| `PORT` | Set automatically by Azure; the server binds to it |
| `WEBSITE_HOSTNAME` | Set automatically by Azure; used for Host header validation |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | Set to `true` if you want Oryx to build on deploy |

## 🏗️ Deploy Infrastructure with Bicep

The `infra/` folder contains **Bicep templates** to provision the Azure AI Foundry infrastructure shell (Hub, Project, AI Services, and supporting resources) with network injection. Model deployments are managed separately through the Azure portal or CLI once the infrastructure is in place.

### Prerequisites

- An Azure subscription
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) installed (v2.61+)
- An existing **Virtual Network** and **Subnet**

### Resources deployed

| Resource | Description |
|---|---|
| **Storage Account** | Required by the AI Foundry Hub, network-restricted to your subnet |
| **Key Vault** | Required by the AI Foundry Hub, network-restricted to your subnet |
| **AI Services** | Cognitive Services account (kind `AIServices`) providing the AI endpoint |
| **AI Foundry Hub** | Azure AI Foundry Hub with managed network and VNet injection |
| **AI Foundry Project** | Project linked to the Hub |

### 1) Edit the parameters file

Open `infra/main.bicepparam` and replace the placeholder values with your own:

```bicep
using 'main.bicep'

param prefix = 'myapp'                    // Prefix for all resource names
param location = 'swedencentral'
param vnetId = '/subscriptions/<subscription-id>/resourceGroups/<rg>/providers/Microsoft.Network/virtualNetworks/<vnet>'
param subnetId = '/subscriptions/<subscription-id>/resourceGroups/<rg>/providers/Microsoft.Network/virtualNetworks/<vnet>/subnets/<subnet>'

param tags = {
  environment: 'dev'
  project: 'mcp-demo'
}
```

### 2) Create a resource group (if needed)

```bash
az group create --name <resource-group> --location <region>
```

### 3) Deploy with the parameters file

```bash
az deployment group create \
  --resource-group <resource-group> \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam
```

### 4) Or deploy with inline parameters

You can also pass parameters directly on the command line:

```bash
az deployment group create \
  --resource-group <resource-group> \
  --template-file infra/main.bicep \
  --parameters \
    prefix=myapp \
    location=swedencentral \
    vnetId='/subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Network/virtualNetworks/<vnet>' \
    subnetId='/subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Network/virtualNetworks/<vnet>/subnets/<subnet>'
```

### 5) Validate before deploying (dry-run)

Run a **what-if** to preview changes without actually deploying:

```bash
az deployment group what-if \
  --resource-group <resource-group> \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam
```

### 6) Check deployment outputs

After a successful deployment, retrieve the outputs:

```bash
az deployment group show \
  --resource-group <resource-group> \
  --name main \
  --query properties.outputs
```

This returns the Hub ID, Project ID, and AI Services endpoint. You can then deploy models through the Azure AI Foundry portal or via the CLI:

```bash
az cognitiveservices account deployment create \
  --name <ai-services-name> \
  --resource-group <resource-group> \
  --deployment-name gpt-4o \
  --model-name gpt-4o \
  --model-version 2024-08-06 \
  --model-format OpenAI \
  --sku-capacity 10 \
  --sku-name GlobalStandard
```
