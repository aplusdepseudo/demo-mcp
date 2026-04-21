targetScope = 'resourceGroup'

@description('Prefix used for naming all resources.')
param prefix string

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Resource ID of the existing Subnet for Foundry network injection.')
param agentSubnetId string

@description('Name of the existing VNet hosting private endpoints.')
param peVNETName string

@description('Name of the existing subnet for private endpoints.')
param peSubnetName string

@description('Name for the MCP Web App. Must be globally unique in Azure App Service.')
param webAppName string = '${prefix}-wa'

@description('Name for the Static Web App (SPA). Must be globally unique.')
param staticWebAppName string = '${prefix}-swa'

@description('Azure region for the Static Web App.')
param staticWebAppLocation string = 'westeurope'

@description('Tags to apply to all resources.')
param tags object = {}

module fdy './foundry.bicep' = {
  params: {
    prefix: prefix
    location: location
    agentSubnetId: agentSubnetId
    peVNETName: peVNETName
    peSubnetName: peSubnetName
    tags: tags
  }
}

module wa './webapp.bicep' = {
  params: {
    prefix: prefix
    location: location
    webAppName: webAppName
    staticWebAppName: staticWebAppName
    staticWebAppLocation: staticWebAppLocation
    peVNETName: peVNETName
    peSubnetName: peSubnetName
    tags: tags
  }
}
