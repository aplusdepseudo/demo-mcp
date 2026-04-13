import 'dotenv/config';
import { runRFPDocumentationAgent } from './rfpAgent.js';

// --- Configuration -------------------------------------------------------
// All values are read from environment variables (see .env.example).
// The two optional CLI arguments let you override the RFP topic and budget
// directly from the command line:
//   node src/index.js "Cloud ERP Implementation" 750000
// -------------------------------------------------------------------------

const config = {
  // Azure AI Foundry project endpoint
  projectEndpoint: process.env.FOUNDRY_PROJECT_ENDPOINT,
  // Model deployment name inside the Foundry project
  modelDeployment: process.env.FOUNDRY_MODEL_NAME || 'gpt-5.1',
  // Running MCP procurement server base URL (used for vendor list lookups)
  mcpServerUrl: process.env.MCP_SERVER_URL || 'http://localhost:3000',
  // Directory where the Excel report and text summaries will be saved
  outputDir: process.env.OUTPUT_DIR || './output',
};

// RFP topic and budget can be provided as CLI arguments
const rfpTopic = process.argv[2] || 'Enterprise ERP System Implementation';
const rfpBudget = parseInt(process.argv[3] || '500000', 10);

// Validate required configuration
if (!config.projectEndpoint) {
  console.error('ERROR: FOUNDRY_PROJECT_ENDPOINT is not set. Please configure your .env file.');
  process.exit(1);
}

console.log('=== RFP Documentation Agent ===');
console.log(`Topic  : ${rfpTopic}`);
console.log(`Budget : $${rfpBudget.toLocaleString()} USD`);
console.log(`Model  : ${config.modelDeployment}`);
console.log(`Output : ${config.outputDir}`);
console.log('================================\n');

runRFPDocumentationAgent(config, rfpTopic, rfpBudget).catch((err) => {
  console.error('\nAgent run failed:', err.message ?? err);
  process.exit(1);
});
