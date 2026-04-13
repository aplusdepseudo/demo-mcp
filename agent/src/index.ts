import 'dotenv/config';
import { type AgentConfig, provisionRFPAgent } from './agent.js';

// -------------------------------------------------------------------------
// Configuration — read from environment variables (see .env.example)
// -------------------------------------------------------------------------

const config: AgentConfig = {
  projectEndpoint: process.env.FOUNDRY_PROJECT_ENDPOINT ?? '',
  modelDeployment: process.env.FOUNDRY_MODEL_NAME ?? 'gpt-5.1',
  mcpServerUrl: process.env.MCP_SERVER_URL ?? 'http://localhost:3000',
  outputDir: process.env.OUTPUT_DIR ?? './output',
};

if (!config.projectEndpoint) {
  console.error('ERROR: FOUNDRY_PROJECT_ENDPOINT is not set. Please configure your .env file.');
  process.exit(1);
}

// -------------------------------------------------------------------------
// Provision the agent and print the result as JSON.
// The SPA uses agentName + agentVersion to start a conversation with the
// agent, and vectorStoreId to reference the knowledge base.
// -------------------------------------------------------------------------

console.log(`Provisioning RFP agent (model: ${config.modelDeployment})...`);

const result = await provisionRFPAgent(config);

console.log('\n✅ Agent provisioned. Pass this to the SPA:\n');
console.log(JSON.stringify(result, null, 2));
