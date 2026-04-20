# 🏗️ Infrastructure — Azure Bicep Templates

Azure **Bicep** infrastructure-as-code templates that provision the complete cloud environment for the RFP Documentation Agent demo: AI Foundry, App Service, Cosmos DB, AI Search, Storage, and private networking.

---

## 📋 What This Deploys

| Resource | Description |
|----------|-------------|
| **AI Foundry** | Cognitive Services account (kind `AIServices`) with system-assigned identity and network injection |
| **AI Foundry Project** | Default project (child resource) for agent hosting |
| **Cosmos DB** | Thread storage backend via project connection |
| **Azure AI Search** | Search service for vector store connections |
| **Storage Account** | Blob storage for RAG documents and project data |
| **App Service** | Linux App Service plan + web app for hosting the MCP server |
| **Private Endpoints + DNS** | Private connectivity and DNS zones for Foundry, Storage, Search, and Cosmos DB |
| **Project Connections** | Foundry project connections and `Agents` capability host wiring |

---

## 🏗️ Template Structure

```
infra/
├── main.bicep          Orchestrator — calls foundry and webapp modules
├── foundry.bicep       AI Foundry account, project, Cosmos DB, AI Search,
│                       Storage, private endpoints, DNS zones, IAM roles,
│                       project connections, capability host
├── webapp.bicep        App Service plan (S3) + Linux web app (Node 22 LTS)
├── main.bicepparam     Parameter values (prefix, location, subnet IDs, tags)
├── main.json           Pre-compiled ARM template (for Deploy to Azure button)
├── package.json        Deployment scripts (deploy-infra, deploy-app, deploy-agent)
└── README.md           ← You are here
```

### Module diagram

```
main.bicep
  ├── foundry.bicep   →  AI Foundry + Cosmos + Search + Storage + networking
  └── webapp.bicep    →  App Service plan + web app
```

---

## ⚙️ Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `prefix` | ✅ | Naming prefix for all resources (e.g., `demo-agentic`) |
| `location` | ✅ | Azure region (e.g., `norwayeast`) |
| `agentSubnetId` | ✅ | Full resource ID of the existing subnet for Foundry network injection |
| `peVNETName` | ✅ | Name of the existing VNet for private endpoints |
| `peSubnetName` | ✅ | Name of the existing subnet for private endpoints |
| `webAppName` | ✅ | Globally unique name for the App Service web app |
| `tags` | optional | Resource tags (default: `{}`) |

---

## ⚡ Getting Started

### Prerequisites

- An [Azure subscription](https://azure.microsoft.com/free/)
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) v2.61+
- An existing **VNet with subnets** for network injection and private endpoints

### 1) Edit the parameters file

Open `main.bicepparam` and replace placeholder values:

```bicep
using 'main.bicep'

param prefix = 'myapp'
param location = 'norwayeast'
param agentSubnetId = '/subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Network/virtualNetworks/<vnet>/subnets/<subnet-agent>'
param peVNETName = '<existing-vnet-name>'
param peSubnetName = '<existing-pe-subnet-name>'
param webAppName = 'myapp-wa'

param tags = {
  environment: 'dev'
  project: 'mcp-demo'
}
```

### 2) Create a resource group (if needed)

```bash
az group create --name <resource-group> --location <region>
```

### 3) Deploy with npm script

```bash
cd infra
# Update config.resourceGroup in package.json if needed
npm run deploy-infra
```

Or deploy directly with Azure CLI:

```bash
az deployment group create \
  --resource-group <resource-group> \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam
```

### 4) Deploy to Azure (one-click)

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Faplusdepseudo%2Fdemo-mcp%2Fmain%2Finfra%2Fmain.json)

### 5) Validate before deploying (dry-run)

```bash
az deployment group what-if \
  --resource-group <resource-group> \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam
```

---

## 📦 Scripts

All scripts are defined in `package.json` and run from the `infra/` directory:

| Script | Description |
|--------|-------------|
| `npm run deploy-infra` | Deploy Bicep templates to Azure |
| `npm run deploy-app` | Build the MCP server, package, and deploy to App Service |
| `npm run deploy-agent` | Build the agent and provision it in Foundry |
| `npm run rebuild-arm` | Recompile `main.bicep` → `main.json` (ARM template) |

### Configuration (`package.json > config`)

```json
{
  "resourceGroup": "demo-agentic-rg",
  "resourceWebApp": "demo-agentic-wa",
  "foundryProjectEndpoint": "https://<account>.services.ai.azure.com/api/projects/<project>",
  "foundryModelName": "gpt-5.1"
}
```

Update these values to match your Azure environment before running deployment scripts.

---

## 🚀 Full Deployment Sequence

After infrastructure is deployed, follow this order:

```bash
# 1. Deploy infrastructure (this template)
cd infra && npm run deploy-infra

# 2. Deploy the MCP server to App Service
npm run deploy-app

# 3. Provision the agent in Foundry
npm run deploy-agent

# 4. Build and deploy the SPA (static hosting)
cd ../spa && npm run build
# Deploy dist/ to Azure Static Web Apps, Blob Storage, etc.
```

> **Note:** The MCP server must be running at its deployed URL before provisioning the agent, since Foundry validates the MCP tool connection at creation time.

---

## 🔒 Networking

All data-plane traffic flows through **private endpoints** inside the VNet:

- AI Foundry → private endpoint + `privatelink.cognitiveservices.azure.com` DNS zone
- Storage Account → private endpoint + `privatelink.blob.core.windows.net` DNS zone
- AI Search → private endpoint + `privatelink.search.windows.net` DNS zone
- Cosmos DB → private endpoint + `privatelink.documents.azure.com` DNS zone

The App Service (MCP server) communicates with Foundry through the agent's network injection subnet, enabling fully private connectivity between the agent and the procurement tools.
