targetScope = 'resourceGroup'

// ─── Parameters ───────────────────────────────────────────────────────────────

@description('Prefix used for naming resources.')
param prefix string

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Globally unique App Service Web App name.')
param webAppName string

@description('Globally unique Static Web App name for the SPA.')
param staticWebAppName string

@description('Azure region for the Static Web App.')
param staticWebAppLocation string = 'westeurope'

@description('Name of the existing VNet hosting private endpoints.')
param peVNETName string

@description('Name of the existing subnet for private endpoints.')
param peSubnetName string

@description('Tags to apply to all resources.')
param tags object = {}

// ─── Variables ────────────────────────────────────────────────────────────────

var aseName = '${prefix}-asp'

// ─── App Service Plan ──────

resource ase 'Microsoft.Web/serverfarms@2025-03-01' = {
  name: aseName
  location: location
  tags: tags
  sku: {
    name: 'S3'
    tier: 'Standard'
    size: 'S3'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// ─── Azure Web App ──────

resource app 'Microsoft.Web/sites@2025-03-01' = {
  name: webAppName
  location: location
  tags: tags
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: ase.id
    httpsOnly: true
    publicNetworkAccess: 'Disabled'
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      minTlsVersion: '1.2'
      alwaysOn: true
      healthCheckPath: '/'
      appSettings: [
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~22'
        }
        {
          name: 'WEBSITES_PORT'
          value: '3000'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
      ]
    }
  }
}

// ─── Private endpoint and private DNS ─────────────────────────

resource vnet 'Microsoft.Network/virtualNetworks@2025-05-01' existing = {
  name: peVNETName
}

resource snet 'Microsoft.Network/virtualNetworks/subnets@2025-05-01' existing = {
  parent: vnet
  name: peSubnetName
}

resource peApp 'Microsoft.Network/privateEndpoints@2025-05-01' = {
  name: '${webAppName}-pe'
  location: location
  tags: tags
  properties: {
    subnet: {
      id: snet.id
    }
    privateLinkServiceConnections: [
      {
        name: '${webAppName}-pls'
        properties: {
          privateLinkServiceId: app.id
          groupIds: [
            'sites'
          ]
        }
      }
    ]
  }
}

resource dnsApp 'Microsoft.Network/privateDnsZones@2024-06-01' = {
  name: 'privatelink.azurewebsites.net'
  location: 'global'
  tags: tags
}

resource lnkDnsApp 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2024-06-01' = {
  parent: dnsApp
  name: '${peVNETName}-webapp-link'
  location: 'global'
  properties: {
    virtualNetwork: {
      id: vnet.id
    }
    registrationEnabled: false
  }
}

resource grpDnsApp 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2025-05-01' = {
  parent: peApp
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'webapp'
        properties: {
          privateDnsZoneId: dnsApp.id
        }
      }
    ]
  }
}

// ─── Static Web App (SPA) ─────────────────────────────────────────────────────

resource swa 'Microsoft.Web/staticSites@2024-04-01' = {
  name: staticWebAppName
  location: staticWebAppLocation
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    buildProperties: {
      skipGithubActionWorkflowGeneration: true
    }
  }
}
