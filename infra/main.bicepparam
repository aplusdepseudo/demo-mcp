using 'foundryVNETInjection.bicep'

param prefix = 'demo-agentic'
param location = 'norwayeast'
param subnetAgent = '/subscriptions/0c597dc4-1753-4e29-9a7f-4ad8ab887aab/resourceGroups/demo-agentic-rg/providers/Microsoft.Network/virtualNetworks/demo-agentic-vnet/subnets/subnet-agent'
param vnetPEName = 'demo-agentic-vnet'
param subnetPEName = 'subnet-default'

param tags = {
  environment: 'dev'
  project: 'mcp-demo-fullprivate'
}
