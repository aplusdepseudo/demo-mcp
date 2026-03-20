targetScope = 'resourceGroup'

// ─── Parameters ───────────────────────────────────────────────────────────────

@description('Prefix used for naming all resources.')
param prefix string

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Resource ID of the existing Subnet for network injection.')
param subnetAgent string

@description('Name of the existing vnet for private endpoints.')
param vnetPEName string

@description('Name of the existing subnet for private endpoints.')
param subnetPEName string

@description('Tags to apply to all resources.')
param tags object = {}

// ─── Variables ────────────────────────────────────────────────────────────────
var accountName = '${prefix}-aif'
var projectName = '${prefix}-aif-proj'
var accountCapHostName = '${prefix}-aif-caphost'
var projectCapHostName = '${prefix}-aif-proj-caphost'

var cosmosName = '${prefix}-cosdb'
var searchName = '${prefix}-ais'
var storageName = replace('${prefix}sa', '-', '')

var storageConnectionName = '${prefix}-conn-stg'
var aisearchConnectionName = '${prefix}-conn-ais'
var cosmosdbConnectionName = '${prefix}-conn-cosdb'

var roles = {
  storageBlobDataContributor: 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
  cosmosDBOperatorRole: '230815da-be43-4aae-9cb4-875f7bd000aa'
  cosmosDBDataContributor: '00000000-0000-0000-0000-000000000002'
  searchIndexDataContributorRole: '8ebe5a00-799e-43f5-93ac-243d3dce84a7'
  searchServiceContributorRole: '7ca78c08-252a-4471-8644-bb5ff32d4ba0'
  keyVaultAdministrator: '00482a5a-887f-4fb3-b363-3b7fe8e74483'
}

// ─── Azure AI Foundry account ──────

resource account 'Microsoft.CognitiveServices/accounts@2025-09-01' = {
  name: accountName
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
    customSubDomainName: accountName
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
      virtualNetworkRules: []
      ipRules: []
    }
    networkInjections: [
      {
        scenario: 'agent'
        subnetArmId: subnetAgent
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
  parent: account
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

// ─── Storage Account (dependency for Capability Host) ─────────────────────────

resource storageAccount 'Microsoft.Storage/storageAccounts@2025-06-01' = {
  name: storageName
  location: location
  tags: tags
  sku: {
    name: 'Standard_ZRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowSharedKeyAccess: false
    allowBlobPublicAccess: false
    publicNetworkAccess: 'disabled'
  }
}

resource storageBlobDataContributor 'Microsoft.Authorization/roleDefinitions@2022-04-01' existing = {
  name: roles.storageBlobDataContributor
  scope: resourceGroup()
}

resource storageBlobDataContributorRoleAssignmentProject 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: storageAccount
  name: guid(project.id, storageBlobDataContributor.id, storageAccount.id)
  properties: {
    principalId: project.identity.principalId
    roleDefinitionId: storageBlobDataContributor.id
    principalType: 'ServicePrincipal'
  }
}

// ─── AI Search instance (dependency for Capability Host) ─────────────────────────

resource aiSearch 'Microsoft.Search/searchServices@2025-05-01' = {
  name: searchName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    disableLocalAuth: false
    authOptions: { aadOrApiKey: { aadAuthFailureMode: 'http401WithBearerChallenge' } }
    encryptionWithCmk: {
      enforcement: 'Unspecified'
    }
    hostingMode: 'default'
    partitionCount: 1
    replicaCount: 1
    semanticSearch: 'disabled'
    publicNetworkAccess: 'disabled'
  }
  sku: {
    name: 'standard'
  }
}

resource searchIndexDataContributorRole 'Microsoft.Authorization/roleDefinitions@2022-04-01' existing = {
  name: roles.searchIndexDataContributorRole
  scope: resourceGroup()
}

resource searchIndexDataContributorAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: aiSearch
  name: guid(project.id, searchIndexDataContributorRole.id, aiSearch.id)
  properties: {
    principalId: project.identity.principalId
    roleDefinitionId: searchIndexDataContributorRole.id
    principalType: 'ServicePrincipal'
  }
}

resource searchServiceContributorRole 'Microsoft.Authorization/roleDefinitions@2022-04-01' existing = {
  name: roles.searchServiceContributorRole
  scope: resourceGroup()
}

resource searchServiceContributorRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: aiSearch
  name: guid(project.id, searchServiceContributorRole.id, aiSearch.id)
  properties: {
    principalId: project.identity.principalId
    roleDefinitionId: searchServiceContributorRole.id
    principalType: 'ServicePrincipal'
  }
}

// ─── CosmosDB instance (dependency for Capability Host) ─────────────────────────

resource cosmosDB 'Microsoft.DocumentDB/databaseAccounts@2025-10-15' = {
  name: cosmosName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    disableLocalAuth: true
    enableAutomaticFailover: false
    enableMultipleWriteLocations: false
    publicNetworkAccess: 'disabled'
    enableFreeTier: false
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    databaseAccountOfferType: 'Standard'
  }
}

resource cosmosDBOperatorRole 'Microsoft.Authorization/roleDefinitions@2022-04-01' existing = {
  name: roles.cosmosDBOperatorRole
  scope: resourceGroup()
}

resource cosmosDBOperatorRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: cosmosDB
  name: guid(project.id, cosmosDBOperatorRole.id, cosmosDB.id)
  properties: {
    principalId: project.identity.principalId
    roleDefinitionId: cosmosDBOperatorRole.id
    principalType: 'ServicePrincipal'
  }
}

resource cosmosDBDataContributorRole 'Microsoft.DocumentDB/databaseAccounts/sqlRoleDefinitions@2025-10-15' existing = {
  parent: cosmosDB
  name: roles.cosmosDBDataContributor
}

resource cosmosDBDataPlaneRoleAssignmentProject 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2025-10-15' = {
  parent: cosmosDB
  name: guid(cosmosDB.id, project.id, roles.cosmosDBDataContributor)
  properties: {
    principalId: project.identity.principalId
    roleDefinitionId: cosmosDBDataContributorRole.id
    scope: cosmosDB.id
  }
}

// ─── Private endpoint and private DNS ─────────────────────────

resource vnetPE 'Microsoft.Network/virtualNetworks@2025-05-01' existing = {
  name: vnetPEName
  scope: resourceGroup()
}
resource subnetPE 'Microsoft.Network/virtualNetworks/subnets@2025-05-01' existing = {
  parent: vnetPE
  name: subnetPEName
}

resource accountPE 'Microsoft.Network/privateEndpoints@2025-05-01' = {
  name: '${accountName}-pe'
  location: location
  properties: {
    subnet: { id: subnetPE.id }
    privateLinkServiceConnections: [
      {
        name: '${accountName}-plnk'
        properties: {
          privateLinkServiceId: account.id
          groupIds: ['account']
        }
      }
    ]
  }
}

resource searchPE 'Microsoft.Network/privateEndpoints@2025-05-01' = {
  name: '${searchName}-pe'
  location: location
  properties: {
    subnet: { id: subnetPE.id }
    privateLinkServiceConnections: [
      {
        name: '${searchName}-plnk'
        properties: {
          privateLinkServiceId: aiSearch!.id
          groupIds: ['searchService']
        }
      }
    ]
  }
}

resource storagePE 'Microsoft.Network/privateEndpoints@2025-05-01' = {
  name: '${storageName}-pe'
  location: location
  properties: {
    subnet: { id: subnetPE.id }
    privateLinkServiceConnections: [
      {
        name: '${storageName}-plnk'
        properties: {
          privateLinkServiceId: storageAccount!.id
          groupIds: ['blob']
        }
      }
    ]
  }
}

resource cosmosDBPE 'Microsoft.Network/privateEndpoints@2025-05-01' = {
  name: '${cosmosName}-pe'
  location: location
  properties: {
    subnet: { id: subnetPE.id }
    privateLinkServiceConnections: [
      {
        name: '${cosmosName}-plnk'
        properties: {
          privateLinkServiceId: cosmosDB!.id // Target Cosmos DB account
          groupIds: [ 'Sql' ]
        }
      }
    ]
  }
}

// ─── Private DNS Zones & VNet Links ─────────────────────────────────────────

resource cognitiveServicesDnsZone 'Microsoft.Network/privateDnsZones@2024-06-01' = {
  name: 'privatelink.cognitiveservices.azure.com'
  location: 'global'
  tags: tags
}

resource cognitiveServicesDnsZoneLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01' = {
  parent: cognitiveServicesDnsZone
  name: '${vnetPEName}-cognitiveservices-link'
  location: 'global'
  properties: {
    virtualNetwork: { id: vnetPE.id }
    registrationEnabled: false
  }
}

resource accountPEDnsGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2025-05-01' = {
  parent: accountPE
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'cognitiveservices'
        properties: {
          privateDnsZoneId: cognitiveServicesDnsZone.id
        }
      }
    ]
  }
}

resource searchDnsZone 'Microsoft.Network/privateDnsZones@2024-06-01' = {
  name: 'privatelink.search.windows.net'
  location: 'global'
  tags: tags
}

resource searchDnsZoneLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01' = {
  parent: searchDnsZone
  name: '${vnetPEName}-search-link'
  location: 'global'
  properties: {
    virtualNetwork: { id: vnetPE.id }
    registrationEnabled: false
  }
}

resource searchPEDnsGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2025-05-01' = {
  parent: searchPE
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'search'
        properties: {
          privateDnsZoneId: searchDnsZone.id
        }
      }
    ]
  }
}

resource storageBlobDnsZone 'Microsoft.Network/privateDnsZones@2024-06-01' = {
  name: 'privatelink.blob.core.windows.net'
  location: 'global'
  tags: tags
}

resource storageBlobDnsZoneLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01' = {
  parent: storageBlobDnsZone
  name: '${vnetPEName}-blob-link'
  location: 'global'
  properties: {
    virtualNetwork: { id: vnetPE.id }
    registrationEnabled: false
  }
}

resource storagePEDnsGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2025-05-01' = {
  parent: storagePE
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'blob'
        properties: {
          privateDnsZoneId: storageBlobDnsZone.id
        }
      }
    ]
  }
}

resource cosmosDnsZone 'Microsoft.Network/privateDnsZones@2024-06-01' = {
  name: 'privatelink.documents.azure.com'
  location: 'global'
  tags: tags
}

resource cosmosDnsZoneLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01' = {
  parent: cosmosDnsZone
  name: '${vnetPEName}-cosmos-link'
  location: 'global'
  properties: {
    virtualNetwork: { id: vnetPE.id }
    registrationEnabled: false
  }
}

resource cosmosDBPEDnsGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2025-05-01' = {
  parent: cosmosDBPE
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'cosmos'
        properties: {
          privateDnsZoneId: cosmosDnsZone.id
        }
      }
    ]
  }
}

// ─── Connections for Capability Host ─────────────────────────────────────────

resource storageConnection 'Microsoft.CognitiveServices/accounts/projects/connections@2025-09-01' = {
  parent: project
  name: storageConnectionName
  properties: {
    category: 'AzureStorageAccount'
    authType: 'AAD'
    metadata: {
      ApiType: 'Azure'
      ResourceId: storageAccount.id
      location: location
    }
    target: 'https://${storageAccount.name}.blob.${environment().suffixes.storage}/'
  }
  dependsOn: [
    accountPEDnsGroup
    storagePEDnsGroup
  ]
}

resource cosmosdbConnection 'Microsoft.CognitiveServices/accounts/projects/connections@2025-09-01' = {
  parent: project
  name: cosmosdbConnectionName
  properties: {
    category: 'CosmosDB'
    authType: 'AAD'
    metadata: {
      ApiType: 'Azure'
      ResourceId: cosmosDB.id
      location: location
    }
    target: cosmosDB.properties.documentEndpoint
  }
  dependsOn: [
    accountPEDnsGroup
    cosmosDBPEDnsGroup
  ]
}

resource aisearchConnection 'Microsoft.CognitiveServices/accounts/projects/connections@2025-09-01' = {
  parent: project
  name: aisearchConnectionName
  properties: {
    category: 'CognitiveSearch'
    authType: 'AAD'
    metadata: {
      ApiType: 'Azure'
      ResourceId: aiSearch.id
      location: location
    }
    target: 'https://${searchName}.search.windows.net'
  }
  dependsOn: [
    accountPEDnsGroup
    searchPEDnsGroup
  ]
}

// ─── Capability Hosts (Agents) ────────────────────────────────────────────────

resource projectCapabilityHost 'Microsoft.CognitiveServices/accounts/projects/capabilityHosts@2025-09-01' = {
  name: projectCapHostName
  parent: project
  properties: {
    capabilityHostKind: 'Agents'
    vectorStoreConnections: [aisearchConnection.name]
    storageConnections: [storageConnection.name]
    threadStorageConnections: [cosmosdbConnection.name]
  }
}
