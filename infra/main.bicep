targetScope = 'resourceGroup'

// ─── Parameters ───────────────────────────────────────────────────────────────

@description('Prefix used for naming all resources.')
param prefix string

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Resource ID of the existing Virtual Network for network injection.')
param vnetId string

@description('Resource ID of the existing Subnet for network injection.')
param subnetId string

@description('SKU name for the AI Foundry hub. Default: Basic.')
@allowed(['Basic', 'Standard'])
param hubSkuName string = 'Basic'

@description('Tags to apply to all resources.')
param tags object = {}

// ─── Variables ────────────────────────────────────────────────────────────────

var hubName = '${prefix}-ai-hub'
var projectName = '${prefix}-ai-project'
var storageName = replace('${prefix}st', '-', '')
var keyVaultName = '${prefix}-kv'
var aiServicesName = '${prefix}-ais'

// ─── Storage Account (required dependency for AI Hub) ─────────────────────────

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageName
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    networkAcls: {
      defaultAction: 'Deny'
      virtualNetworkRules: [
        {
          id: subnetId
          action: 'Allow'
        }
      ]
    }
  }
}

// ─── Key Vault (required dependency for AI Hub) ───────────────────────────────

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    networkAcls: {
      defaultAction: 'Deny'
      virtualNetworkRules: [
        {
          id: subnetId
        }
      ]
    }
  }
}

// ─── Azure AI Services (provides the AI endpoint for model deployments) ──────

resource aiServices 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: aiServicesName
  location: location
  tags: tags
  kind: 'AIServices'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: aiServicesName
    publicNetworkAccess: 'Disabled'
    networkAcls: {
      defaultAction: 'Deny'
      virtualNetworkRules: [
        {
          id: subnetId
        }
      ]
    }
  }
}

// ─── Azure AI Foundry Hub ─────────────────────────────────────────────────────

resource hub 'Microsoft.MachineLearningServices/workspaces@2024-10-01' = {
  name: hubName
  location: location
  tags: tags
  kind: 'Hub'
  sku: {
    name: hubSkuName
    tier: hubSkuName
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    friendlyName: hubName
    description: 'Azure AI Foundry Hub deployed with prefix: ${prefix}'
    storageAccount: storageAccount.id
    keyVault: keyVault.id

    // Network injection configuration
    managedNetwork: {
      isolationMode: 'AllowOnlyApprovedOutbound'
    }

    publicNetworkAccess: 'Disabled'

    serverlessComputeSettings: {
      serverlessComputeCustomSubnet: subnetId
      serverlessComputeNoPublicIP: true
    }
  }

  // AI Services connection
  resource aiServicesConnection 'connections@2024-10-01' = {
    name: '${hubName}-ais-connection'
    properties: {
      category: 'AIServices'
      authType: 'AAD'
      isSharedToAll: true
      target: aiServices.properties.endpoint
      metadata: {
        ApiType: 'Azure'
        ResourceId: aiServices.id
      }
    }
  }
}

// ─── Azure AI Foundry Project ─────────────────────────────────────────────────

resource project 'Microsoft.MachineLearningServices/workspaces@2024-10-01' = {
  name: projectName
  location: location
  tags: tags
  kind: 'Project'
  sku: {
    name: hubSkuName
    tier: hubSkuName
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    friendlyName: projectName
    description: 'Azure AI Foundry Project deployed with prefix: ${prefix}'
    hubResourceId: hub.id
  }
}

// ─── Outputs ──────────────────────────────────────────────────────────────────

output hubId string = hub.id
output hubName string = hub.name
output projectId string = project.id
output projectName string = project.name
output aiServicesEndpoint string = aiServices.properties.endpoint
