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
var foundryName = '${prefix}-aif'
var projectName = '${prefix}-aif-proj'

// ─── Azure AI Foundry ──────
resource foundryCore 'Microsoft.CognitiveServices/accounts@2025-09-01' = {
  name: foundryName
  location: location
  tags: tags
  kind: 'AIServices'
  sku: {
    name: 'S0'
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    apiProperties: {}
    customSubDomainName: foundryName
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      virtualNetworkRules: []
      ipRules: []
    }
    networkInjections: [
      {
        scenario: 'agent'
        subnetArmId: subnetId
        useMicrosoftManagedNetwork: false
      }
    ]
    allowProjectManagement: true
    defaultProject: projectName
    associatedProjects: [
      projectName
    ]
  }
}

resource project 'Microsoft.CognitiveServices/accounts/projects@2025-09-01' = {
  parent: foundryCore
  name: projectName
  location: location
  kind: 'AIServices'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    description: 'Default project created with the resource'
    displayName: 'Default project for ${prefix}'
  }
}
