targetScope = 'resourceGroup'

// ─── Parameters ───────────────────────────────────────────────────────────────

@description('Prefix used for naming all resources.')
param prefix string

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Resource ID of the existing Subnet for network injection.')
param subnetId string

@description('Tags to apply to all resources.')
param tags object = {}

// ─── Variables ────────────────────────────────────────────────────────────────

var projectName = '${prefix}-foundry-project'
var foundryName = '${prefix}-foundry-core'

// ─── Azure AI Foundry ──────
resource foundryCore 'Microsoft.CognitiveServices/accounts@2025-10-01-preview' = {
  name: foundryName
  location: location
  tags: tags
  kind: 'AIServices'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: foundryName
    publicNetworkAccess: 'Enabled'
    networkInjections: [
      {
        scenario: 'agent'
        subnetArmId: subnetId
        useMicrosoftManagedNetwork: false
      }
    ]
  }
}

// ─── Azure AI Foundry Project ─────────────────────────────────────────────────
resource project 'Microsoft.CognitiveServices/accounts/projects@2025-10-01-preview' = {
  parent: foundryCore
  name: projectName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    description: 'Azure AI Foundry Project deployed with prefix: ${prefix}'
    displayName: projectName
  }
  tags: tags
}
