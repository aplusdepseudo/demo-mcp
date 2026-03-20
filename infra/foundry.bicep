targetScope = 'resourceGroup'

// ─── Parameters ───────────────────────────────────────────────────────────────

@description('Prefix used for naming all resources.')
param prefix string

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Resource ID of the existing Subnet for network injection.')
param agentSubnetId string

@description('Name of the existing vnet for private endpoints.')
param peVNETName string

@description('Name of the existing subnet for private endpoints.')
param peSubnetName string

@description('Tags to apply to all resources.')
param tags object = {}

// ─── Variables ────────────────────────────────────────────────────────────────

var accountName = '${prefix}-aif'

var projectName = '${prefix}-aif-proj'
var projectCapHostName = '${prefix}-aif-proj-caphost'

var cosmosName = '${prefix}-cosdb'
var searchName = '${prefix}-ais'
var storageName = replace('${prefix}sa', '-', '')

var storageConnectionName = '${prefix}-conn-stg'
var aisearchConnectionName = '${prefix}-conn-ais'
var cosmosdbConnectionName = '${prefix}-conn-cosdb'

var roles = {
  rdStgBlob: 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
  rdCosOp: '230815da-be43-4aae-9cb4-875f7bd000aa'
  rdCosData: '00000000-0000-0000-0000-000000000002'
  rdAisIdx: '8ebe5a00-799e-43f5-93ac-243d3dce84a7'
  rdAisSvc: '7ca78c08-252a-4471-8644-bb5ff32d4ba0'
  rdKvAdmin: '00482a5a-887f-4fb3-b363-3b7fe8e74483'
}

// ─── Azure AI Foundry aif ──────

resource aif 'Microsoft.CognitiveServices/accounts@2025-09-01' = {
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
        subnetArmId: agentSubnetId
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

resource prj 'Microsoft.CognitiveServices/accounts/projects@2025-09-01' = {
  parent: aif
  name: projectName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    description: 'Default prj created with the resource'
    displayName: 'Default prj for ${prefix}'
  }
}

// ─── Storage Account (dependency for Capability Host) ─────────────────────────

resource stg 'Microsoft.Storage/storageAccounts@2025-06-01' = {
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

resource rdStgBlob 'Microsoft.Authorization/roleDefinitions@2022-04-01' existing = {
  name: roles.rdStgBlob
  scope: resourceGroup()
}

resource raStgBlobPrj 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: stg
  name: guid(prj.id, rdStgBlob.id, stg.id)
  properties: {
    principalId: prj.identity.principalId
    roleDefinitionId: rdStgBlob.id
    principalType: 'ServicePrincipal'
  }
}

// ─── AI Search instance (dependency for Capability Host) ─────────────────────────

resource ais 'Microsoft.Search/searchServices@2025-05-01' = {
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
    hostingMode: 'Default'
    partitionCount: 1
    replicaCount: 1
    semanticSearch: 'disabled'
    publicNetworkAccess: 'disabled'
  }
  sku: {
    name: 'standard'
  }
}

resource rdAisIdx 'Microsoft.Authorization/roleDefinitions@2022-04-01' existing = {
  name: roles.rdAisIdx
  scope: resourceGroup()
}

resource raAisIdxPrj 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: ais
  name: guid(prj.id, rdAisIdx.id, ais.id)
  properties: {
    principalId: prj.identity.principalId
    roleDefinitionId: rdAisIdx.id
    principalType: 'ServicePrincipal'
  }
}

resource rdAisSvc 'Microsoft.Authorization/roleDefinitions@2022-04-01' existing = {
  name: roles.rdAisSvc
  scope: resourceGroup()
}

resource raAisSvcPrj 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: ais
  name: guid(prj.id, rdAisSvc.id, ais.id)
  properties: {
    principalId: prj.identity.principalId
    roleDefinitionId: rdAisSvc.id
    principalType: 'ServicePrincipal'
  }
}

// ─── CosmosDB instance (dependency for Capability Host) ─────────────────────────

resource cos 'Microsoft.DocumentDB/databaseAccounts@2025-10-15' = {
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

resource rdCosOp 'Microsoft.Authorization/roleDefinitions@2022-04-01' existing = {
  name: roles.rdCosOp
  scope: resourceGroup()
}

resource raCosOpPrj 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: cos
  name: guid(prj.id, rdCosOp.id, cos.id)
  properties: {
    principalId: prj.identity.principalId
    roleDefinitionId: rdCosOp.id
    principalType: 'ServicePrincipal'
  }
}

resource rdCosData 'Microsoft.DocumentDB/databaseAccounts/sqlRoleDefinitions@2025-10-15' existing = {
  parent: cos
  name: roles.rdCosData
}

resource raCosDataPrj 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2025-10-15' = {
  parent: cos
  name: guid(cos.id, prj.id, roles.rdCosData)
  properties: {
    principalId: prj.identity.principalId
    roleDefinitionId: rdCosData.id
    scope: cos.id
  }
}

// ─── Private endpoint and private DNS ─────────────────────────

resource vnet 'Microsoft.Network/virtualNetworks@2025-05-01' existing = {
  name: peVNETName
  scope: resourceGroup()
}
resource snet 'Microsoft.Network/virtualNetworks/subnets@2025-05-01' existing = {
  parent: vnet
  name: peSubnetName
}

resource peAif 'Microsoft.Network/privateEndpoints@2025-05-01' = {
  name: '${accountName}-pe'
  location: location
  properties: {
    subnet: { id: snet.id }
    privateLinkServiceConnections: [
      {
        name: '${accountName}-plnk'
        properties: {
          privateLinkServiceId: aif.id
          groupIds: ['account']
        }
      }
    ]
  }
}

resource peAis 'Microsoft.Network/privateEndpoints@2025-05-01' = {
  name: '${searchName}-pe'
  location: location
  properties: {
    subnet: { id: snet.id }
    privateLinkServiceConnections: [
      {
        name: '${searchName}-plnk'
        properties: {
          privateLinkServiceId: ais!.id
          groupIds: ['searchService']
        }
      }
    ]
  }
}

resource peStg 'Microsoft.Network/privateEndpoints@2025-05-01' = {
  name: '${storageName}-pe'
  location: location
  properties: {
    subnet: { id: snet.id }
    privateLinkServiceConnections: [
      {
        name: '${storageName}-plnk'
        properties: {
          privateLinkServiceId: stg!.id
          groupIds: ['blob']
        }
      }
    ]
  }
}

resource peCos 'Microsoft.Network/privateEndpoints@2025-05-01' = {
  name: '${cosmosName}-pe'
  location: location
  properties: {
    subnet: { id: snet.id }
    privateLinkServiceConnections: [
      {
        name: '${cosmosName}-plnk'
        properties: {
          privateLinkServiceId: cos!.id // Target Cosmos DB account
          groupIds: [ 'Sql' ]
        }
      }
    ]
  }
}

// ─── Private DNS Zones & VNet Links ─────────────────────────────────────────

resource dnsAif 'Microsoft.Network/privateDnsZones@2024-06-01' = {
  name: 'privatelink.cognitiveservices.azure.com'
  location: 'global'
  tags: tags
}

resource lnkDnsAif 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01' = {
  parent: dnsAif
  name: '${peVNETName}-cognitiveservices-link'
  location: 'global'
  properties: {
    virtualNetwork: { id: vnet.id }
    registrationEnabled: false
  }
}

resource grpDnsAif 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2025-05-01' = {
  parent: peAif
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'cognitiveservices'
        properties: {
          privateDnsZoneId: dnsAif.id
        }
      }
    ]
  }
}

resource dnsAis 'Microsoft.Network/privateDnsZones@2024-06-01' = {
  name: 'privatelink.search.windows.net'
  location: 'global'
  tags: tags
}

resource lnkDnsAis 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01' = {
  parent: dnsAis
  name: '${peVNETName}-search-link'
  location: 'global'
  properties: {
    virtualNetwork: { id: vnet.id }
    registrationEnabled: false
  }
}

resource grpDnsAis 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2025-05-01' = {
  parent: peAis
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'search'
        properties: {
          privateDnsZoneId: dnsAis.id
        }
      }
    ]
  }
}

resource dnsStgBlob 'Microsoft.Network/privateDnsZones@2024-06-01' = {
  name: 'privatelink.blob.${environment().suffixes.storage}'
  location: 'global'
  tags: tags
}

resource lnkDnsStgBlob 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01' = {
  parent: dnsStgBlob
  name: '${peVNETName}-blob-link'
  location: 'global'
  properties: {
    virtualNetwork: { id: vnet.id }
    registrationEnabled: false
  }
}

resource grpDnsStg 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2025-05-01' = {
  parent: peStg
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'blob'
        properties: {
          privateDnsZoneId: dnsStgBlob.id
        }
      }
    ]
  }
}

resource dnsCos 'Microsoft.Network/privateDnsZones@2024-06-01' = {
  name: 'privatelink.documents.azure.com'
  location: 'global'
  tags: tags
}

resource lnkDnsCos 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01' = {
  parent: dnsCos
  name: '${peVNETName}-cosmos-link'
  location: 'global'
  properties: {
    virtualNetwork: { id: vnet.id }
    registrationEnabled: false
  }
}

resource grpDnsCos 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2025-05-01' = {
  parent: peCos
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'cosmos'
        properties: {
          privateDnsZoneId: dnsCos.id
        }
      }
    ]
  }
}

// ─── Connections for Capability Host ─────────────────────────────────────────

resource connStg 'Microsoft.CognitiveServices/accounts/projects/connections@2025-09-01' = {
  parent: prj
  name: storageConnectionName
  properties: {
    category: 'AzureStorageAccount'
    authType: 'AAD'
    metadata: {
      ApiType: 'Azure'
      ResourceId: stg.id
      location: location
    }
    target: 'https://${stg.name}.blob.${environment().suffixes.storage}/'
  }
  dependsOn: [
    grpDnsAif
    grpDnsStg
  ]
}

resource connCos 'Microsoft.CognitiveServices/accounts/projects/connections@2025-09-01' = {
  parent: prj
  name: cosmosdbConnectionName
  properties: {
    category: 'CosmosDB'
    authType: 'AAD'
    metadata: {
      ApiType: 'Azure'
      ResourceId: cos.id
      location: location
    }
    target: cos.properties.documentEndpoint
  }
  dependsOn: [
    grpDnsAif
    grpDnsCos
  ]
}

resource connAis 'Microsoft.CognitiveServices/accounts/projects/connections@2025-09-01' = {
  parent: prj
  name: aisearchConnectionName
  properties: {
    category: 'CognitiveSearch'
    authType: 'AAD'
    metadata: {
      ApiType: 'Azure'
      ResourceId: ais.id
      location: location
    }
    target: 'https://${searchName}.search.windows.net'
  }
  dependsOn: [
    grpDnsAif
    grpDnsAis
  ]
}

// ─── Capability Hosts (Agents) ────────────────────────────────────────────────

resource capPrj 'Microsoft.CognitiveServices/accounts/projects/capabilityHosts@2025-09-01' = {
  name: projectCapHostName
  parent: prj
  properties: {
    vectorStoreConnections: [connAis.name]
    storageConnections: [connStg.name]
    threadStorageConnections: [connCos.name]
  }
}
