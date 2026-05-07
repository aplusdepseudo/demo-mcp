# Migration Plan: File_Search Vector Store to Foundry IQ (Knowledge Index)

**Status:** Planning  
**Date:** May 7, 2026  
**Objective:** Migrate from runtime-created OpenAI vector stores to Foundry IQ (Knowledge Index) with multi-file support and advanced RAG capabilities. Complete replacement of the current file_search implementation.

---

## Overview

This migration replaces the existing vector store implementation with Foundry IQ's Knowledge Index, enabling:
- Multi-file knowledge base support (not just single `rfp-prerequisites.txt`)
- Advanced chunking strategies and metadata filtering
- Improved RAG capabilities with Foundry-native indexing
- Complete removal of OpenAI vector store dependencies

---

## Implementation Phases

### **Phase 1: Agent Code Migration**

#### Step 1: Replace setupKnowledgeBase() function
**File:** [agent/src/agent.ts](../agent/src/agent.ts#L183-L194)

- Replace `openAIClient.vectorStores.create()` with `AIProjectClient.knowledge.createIndex()`
- Configure index settings: chunking strategy, embedding model, metadata schema
- Update function return type from `vectorStoreId: string` to `knowledgeIndexId: string`

**Code Changes:**
```typescript
// OLD: Vector Store approach
async function setupKnowledgeBase(openAIClient: OpenAIClient): Promise<string> {
  const vectorStore = await openAIClient.vectorStores.create({ 
    name: 'RFPPrerequisitesStore' 
  });
  const fileStream = fs.createReadStream(PREREQUISITES_FILE);
  await openAIClient.vectorStores.files.uploadAndPoll(vectorStore.id, fileStream);
  return vectorStore.id;
}

// NEW: Knowledge Index approach
async function setupKnowledgeBase(projectClient: AIProjectClient): Promise<string> {
  const knowledgeIndex = await projectClient.knowledge.createIndex({
    name: 'RFPPrerequisitesIndex',
    embeddingModel: 'text-embedding-3-large',
    chunkSize: 500,
    chunkOverlap: 50,
    metadata: { purpose: 'rfp-compliance', version: '1.0' }
  });
  return knowledgeIndex.id;
}
```

#### Step 2: Add multi-file upload support
**File:** [agent/src/agent.ts](../agent/src/agent.ts#L183-L194)  
**Depends on:** Step 1

- Scan `agent/assets/` directory for all `.txt`, `.md`, `.pdf` files
- Use `AIProjectClient.knowledge.addIndexSources()` for batch file upload
- Add metadata tagging for file categorization

**Code Changes:**
```typescript
async function uploadKnowledgeSources(
  projectClient: AIProjectClient, 
  knowledgeIndexId: string
): Promise<void> {
  const assetsDir = path.join(__dirname, '..', 'assets');
  const files = fs.readdirSync(assetsDir)
    .filter(f => /\.(txt|md|pdf)$/i.test(f))
    .map(f => ({
      path: path.join(assetsDir, f),
      metadata: {
        filename: f,
        category: f.includes('prerequisites') ? 'prerequisites' : 'general',
        uploadedAt: new Date().toISOString()
      }
    }));

  await projectClient.knowledge.addIndexSources(knowledgeIndexId, files);
  console.log(`Uploaded ${files.length} files to Knowledge Index`);
}
```

#### Step 3: Update FileSearchTool registration
**File:** [agent/src/agent.ts](../agent/src/agent.ts#L203-L212)

- Update from `vector_store_ids: [vectorStoreId]` to `knowledge_index_ids: [knowledgeIndexId]`
- Verify tool type remains `file_search` or update to new Foundry IQ tool type if API changed

**Code Changes:**
```typescript
// OLD: Vector Store registration
const fileSearchTool: FileSearchTool = {
  type: 'file_search',
  vector_store_ids: [vectorStoreId],
};

// NEW: Knowledge Index registration
const fileSearchTool: FileSearchTool = {
  type: 'file_search',
  knowledge_index_ids: [knowledgeIndexId],
};
```

#### Step 4: Update cleanup logic
**File:** [agent/src/agent.ts](../agent/src/agent.ts#L247-L268)

- Replace `openAIClient.vectorStores.delete()` with `AIProjectClient.knowledge.deleteIndex()`
- Add error handling for orphaned Knowledge Index scenarios

**Code Changes:**
```typescript
// OLD: Vector Store cleanup
async function deprovisionRFPAgent() {
  try {
    await agentsClient.deleteAgent(agentName);
    await openAIClient.vectorStores.delete(vectorStoreId);
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

// NEW: Knowledge Index cleanup
async function deprovisionRFPAgent() {
  try {
    await agentsClient.deleteAgent(agentName);
    await projectClient.knowledge.deleteIndex(knowledgeIndexId);
  } catch (error) {
    if (error.code === 'IndexNotFound') {
      console.warn('Knowledge Index already deleted');
    } else {
      throw error;
    }
  }
}
```

#### Step 5: Add index status polling
**Parallelizable with:** Steps 1-4

- Implement health check function to verify index readiness before agent creation
- Add retry logic for index creation failures

**Code Changes:**
```typescript
async function waitForIndexReady(
  projectClient: AIProjectClient, 
  indexId: string, 
  maxWaitMs: number = 60000
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    const status = await projectClient.knowledge.getIndexStatus(indexId);
    if (status === 'Ready') {
      console.log('Knowledge Index is ready');
      return;
    }
    if (status === 'Failed') {
      throw new Error('Knowledge Index creation failed');
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Timeout waiting for Knowledge Index to be ready');
}
```

---

### **Phase 2: Infrastructure Updates**

#### Step 6: Review Capability Host configuration
**File:** [infra/foundry.bicep](../infra/foundry.bicep#L517-L524)  
**Parallelizable with:** Phase 1

- Verify `vectorStoreConnections` property still applies to Knowledge Index
- Research if Knowledge Index requires additional connection types (e.g., `knowledgeIndexConnections`)

**Review Points:**
```bicep
// Current Capability Host configuration
resource capPrj 'Microsoft.CognitiveServices/accounts/projects/capabilityHosts@2025-09-01' = {
  name: projectCapHostName
  parent: prj
  properties: {
    vectorStoreConnections: [connAis.name]  // ← Verify this applies to Knowledge Index
    storageConnections: [connStg.name]
    threadStorageConnections: [connCos.name]
  }
}

// May need to update to:
properties: {
  knowledgeIndexConnections: [connAis.name]  // ← New property name?
  storageConnections: [connStg.name]
  threadStorageConnections: [connCos.name]
}
```

#### Step 7: Update RBAC assignments
**File:** [infra/foundry.bicep](../infra/foundry.bicep#L168-L207)  
**Depends on:** Step 6

- Verify AI Search Contributor and Search Index Data Contributor roles are sufficient
- Add any new roles required for Knowledge Index operations

**Current RBAC:**
```bicep
// Verify these roles are sufficient for Knowledge Index
var rdAisSvc = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7ca78c08-252a-4471-8644-bb5ff32d4ba0') // Search Service Contributor
var rdAisIdx = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '8ebe5a00-799e-43f5-93ac-243d3dce84a7') // Search Index Data Contributor
```

#### Step 8: Add Knowledge Index parameters
**Parallelizable with:** Step 7

- Add Bicep parameters for index configuration (chunk size, overlap, embedding model)
- Consider adding `knowledgeIndexName` as output for troubleshooting

**Bicep Parameters:**
```bicep
@description('Knowledge Index chunking configuration')
param knowledgeIndexChunkSize int = 500

@description('Knowledge Index chunk overlap')
param knowledgeIndexChunkOverlap int = 50

@description('Embedding model for Knowledge Index')
param knowledgeIndexEmbeddingModel string = 'text-embedding-3-large'

// Add output for debugging
output knowledgeIndexConfiguration object = {
  chunkSize: knowledgeIndexChunkSize
  chunkOverlap: knowledgeIndexChunkOverlap
  embeddingModel: knowledgeIndexEmbeddingModel
}
```

---

### **Phase 3: Documentation & Scripts**

#### Step 9: Update agent README
**File:** [agent/readme.md](../agent/readme.md)  
**Parallelizable with:** Implementation

Updates required:
- Replace all "vector store" references with "Knowledge Index" / "Foundry IQ"
- Update tool registration table at Line 45
- Update provisioning flow section (Lines 165-167) — document multi-file support
- Add troubleshooting section for Knowledge Index creation failures

**Documentation Changes:**
```markdown
<!-- OLD -->
| Tool | Type | Purpose |
|------|------|---------|
| `file_search` | Built-in RAG | Searches the uploaded prerequisites document via vector store |

<!-- NEW -->
| Tool | Type | Purpose |
|------|------|---------|
| `file_search` | Built-in RAG | Searches knowledge base via Foundry IQ Knowledge Index (supports multiple documents with metadata) |

<!-- Add troubleshooting section -->
## Troubleshooting

### Knowledge Index Creation Failures

**Symptom:** Agent provisioning fails with "Knowledge Index not ready"
**Solution:** 
1. Check AI Search service is running: `az search service show`
2. Verify RBAC permissions on AI Search
3. Increase timeout in `waitForIndexReady()` function

**Symptom:** Multi-file upload fails
**Solution:**
1. Verify all files in `agent/assets/` are valid formats (`.txt`, `.md`, `.pdf`)
2. Check file size limits (max 20MB per file)
3. Review file encoding (UTF-8 required)
```

#### Step 10: Update root README
**File:** [README.md](../README.md)  
**Parallelizable with:** Step 9

- Update component #2 description (Line 41) — replace file_search tool description
- Update key design principle (Line 32) if tool call handling changes
- Update architecture diagram if visual representation exists

#### Step 11: Update infrastructure README
**File:** [infra/README.md](../infra/README.md)  
**Parallelizable with:** Step 9

- Update infrastructure component list (Lines 8-21) if Capability Host changes
- Document Knowledge Index-specific infrastructure requirements

#### Step 12: Update Copilot instructions
**File:** [.github/copilot-instructions.md](../.github/copilot-instructions.md)  
**Parallelizable with:** Step 9

- Update domain layer description to reflect Knowledge Index
- Update conventions section if new API patterns emerge

**Documentation Changes:**
```markdown
<!-- Add to Conventions section -->
- **Knowledge Index naming**: Knowledge Indexes follow `{Purpose}Index` format — `RFPPrerequisitesIndex`, `ComplianceDocsIndex`.
- **Multi-file metadata**: All knowledge sources include metadata: `{ filename, category, uploadedAt }`.
- **API pattern**: Knowledge Index operations use `AIProjectClient.knowledge.*` namespace (not OpenAI client).
```

#### Step 13: Add deployment script validation
**Depends on:** Phase 1 completion

- Update [agent/package.json](../agent/package.json) `provision` script with pre-flight checks
- Add environment variable validation for Knowledge Index configuration
- Consider adding `deprovision` script for cleanup during testing

**Package.json Updates:**
```json
{
  "scripts": {
    "start": "tsx src/index.ts",
    "build": "tsc",
    "provision": "node build/index.js",
    "provision:validate": "tsx src/validate.ts && npm run provision",
    "deprovision": "node build/deprovision.js",
    "test:local": "tsx src/test-knowledge-index.ts"
  }
}
```

---

### **Phase 4: Testing & Migration Validation**

#### Step 14: Create test assets
**Parallelizable with:** Phase 1

- Add sample multi-file knowledge base to `agent/assets/` for testing
- Create test data with metadata

**Test Files to Create:**
```
agent/assets/
├── rfp-prerequisites.txt (existing)
├── test-prerequisites-v2.txt (new - additional requirements)
├── compliance-addendum.md (new - compliance updates)
├── security-standards.pdf (new - security specifications)
└── vendor-guidelines.md (new - vendor qualification details)
```

#### Step 15: Implement local testing
**Depends on:** Step 14

- Add npm script in [agent/package.json](../agent/package.json) for local testing
- Create test harness to verify multi-file indexing
- Validate metadata tagging and retrieval

**Test Harness:**
```typescript
// agent/src/test-knowledge-index.ts
async function testKnowledgeIndex() {
  console.log('Testing Knowledge Index setup...');
  
  // Test 1: Create index
  const indexId = await setupKnowledgeBase(projectClient);
  console.log('✓ Knowledge Index created:', indexId);
  
  // Test 2: Upload multiple files
  await uploadKnowledgeSources(projectClient, indexId);
  console.log('✓ Files uploaded');
  
  // Test 3: Wait for readiness
  await waitForIndexReady(projectClient, indexId);
  console.log('✓ Index is ready');
  
  // Test 4: Query index
  const results = await projectClient.knowledge.query(indexId, 'vendor qualification');
  console.log('✓ Query results:', results.length, 'documents');
  
  // Cleanup
  await projectClient.knowledge.deleteIndex(indexId);
  console.log('✓ Cleanup complete');
}
```

#### Step 16: End-to-end validation
**Depends on:** All previous steps

**Validation Checklist:**
- [ ] Run `npm run deploy-infra` — infrastructure provisions successfully
- [ ] Run `npm run deploy-app` — MCP server deploys successfully
- [ ] Run `npm run deploy-agent` — agent provisions with Knowledge Index
- [ ] Verify Knowledge Index appears in Foundry portal
- [ ] Test agent invocation with file_search queries
- [ ] Confirm multi-file sources are used in responses
- [ ] Run `npm run deprovision` — cleanup removes Knowledge Index
- [ ] Verify no orphaned resources in Azure portal

---

## Key Files & Components

| File | Functions/Resources | Changes Required |
|------|---------------------|------------------|
| [agent/src/agent.ts](../agent/src/agent.ts) | `setupKnowledgeBase()` (L183-194)<br>`createAgentVersion()` (L197-221)<br>`deprovisionRFPAgent()` (L247-268) | Replace vector store APIs with Knowledge Index<br>Add multi-file upload support<br>Update tool registration |
| [agent/src/index.ts](../agent/src/index.ts) | Entry point, config loading | Add Knowledge Index config parameters |
| [agent/assets/](../agent/assets/) | Knowledge base files | Expand from single file to multi-file structure |
| [infra/foundry.bicep](../infra/foundry.bicep) | Capability Host (L517-524)<br>RBAC (L168-207)<br>AI Search (L145-167) | Review connections<br>Verify RBAC roles<br>Add Knowledge Index parameters |
| [agent/readme.md](../agent/readme.md) | Agent documentation | Update vector store → Knowledge Index references<br>Add troubleshooting section |
| [README.md](../README.md) | Architecture overview | Update component descriptions |
| [infra/README.md](../infra/README.md) | Infrastructure guide | Update if Capability Host changes |
| [.github/copilot-instructions.md](../.github/copilot-instructions.md) | Dev conventions | Update domain layer and API patterns |
| [agent/package.json](../agent/package.json) | Build/provision scripts | Add validation, testing, deprovision scripts |

---

## Verification Checklist

- [ ] **Unit Test**: `npm run provision` creates Knowledge Index with `knowledgeIndexId` output
- [ ] **Multi-File Test**: Place 3 files in `agent/assets/`, verify all indexed in Foundry portal
- [ ] **Metadata Test**: Query agent, verify responses include metadata from multiple sources
- [ ] **Integration Test**: Full deployment to Azure succeeds (infra → app → agent)
- [ ] **SPA E2E Test**: Frontend conversation uses Knowledge Index successfully
- [ ] **Cleanup Test**: `deprovisionRFPAgent()` deletes Knowledge Index completely
- [ ] **RBAC Test**: Project identity has all required permissions for Knowledge Index operations
- [ ] **Performance Test**: Compare response quality vs. old vector store approach
- [ ] **Error Handling**: Test failure scenarios (index creation timeout, upload failures)

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Migration Strategy** | Complete replacement | Remove all vector store code; no backward compatibility needed |
| **File Support** | Multi-file with scanning | Scan `agent/assets/` for `.txt`, `.md`, `.pdf` files dynamically |
| **Deployment Timing** | Agent provisioning time | Maintain current workflow pattern (TypeScript runtime creation) |
| **API Surface** | `AIProjectClient.knowledge.*` | Replace `openAIClient.vectorStores.*` completely |
| **Foundry IQ Features** | Advanced RAG | Leverage chunking, metadata filtering, multi-source indexing |
| **Backward Compatibility** | Breaking change | Full re-provisioning required; acceptable for this project |
| **Metadata Schema** | File-level metadata | Track filename, category, upload timestamp for each document |
| **Chunking Strategy** | Configurable via Bicep | Default 500-token chunks with 50-token overlap |
| **Embedding Model** | text-embedding-3-large | Better quality than default; configurable via environment |

---

## Open Questions & Recommendations

### 1. API Documentation Research
**Question:** Has the `@azure/ai-projects` SDK `knowledge` namespace API stabilized?

**Recommendation:** 
- Review latest `@azure/ai-projects` documentation before implementation
- Verify exact API signatures for: `createIndex()`, `addIndexSources()`, `deleteIndex()`, `getIndexStatus()`, `query()`
- Check for breaking changes between SDK versions
- Consult Azure AI Foundry REST API documentation for fallback if SDK incomplete

**Research Tasks:**
```bash
# Check installed SDK version
npm list @azure/ai-projects

# Review SDK changelog
npm view @azure/ai-projects versions
npm view @azure/ai-projects@latest

# Check official documentation
# https://learn.microsoft.com/azure/ai-services/foundry/
```

### 2. Embedding Model Configuration
**Question:** Which embedding model provides best RFP prerequisite retrieval quality?

**Recommendation:** 
- Research if `text-embedding-3-large` or domain-specific embeddings improve compliance checklist accuracy
- Consider A/B testing with current model vs. newer options
- Test with sample RFP queries to measure recall and precision

**Test Queries:**
- "What are the vendor qualification criteria?"
- "List all security and compliance requirements"
- "What financial documentation is required?"
- "Show ESG-related prerequisites"

**Metrics to Track:**
- Response accuracy (manual evaluation)
- Source citation correctness
- Query latency
- Token usage

### 3. Chunking Strategy
**Question:** What chunk size/overlap optimizes for compliance requirement extraction?

**Recommendation:** 
Test multiple configurations:

| Configuration | Chunk Size | Overlap | Use Case |
|---------------|------------|---------|----------|
| Fine-grained | 256 tokens | 25 tokens | Precise requirement extraction |
| Balanced | 500 tokens | 50 tokens | Default (recommended) |
| Context-rich | 1024 tokens | 128 tokens | Complex multi-step requirements |

**Evaluation Method:**
1. Create test set of 20 RFP compliance questions
2. Run agent with each chunking configuration
3. Measure accuracy, completeness, and response quality
4. Select optimal configuration based on results

### 4. Capability Host Properties
**Question:** Does Knowledge Index require different Capability Host configuration than vector stores?

**Recommendation:**
- Test current `vectorStoreConnections` property first
- If fails, research Bicep API version `2025-09-01` for new properties
- Check if separate `knowledgeIndexConnections` property introduced
- Consult Azure Resource Manager template reference

---

## Migration Timeline (Estimated)

| Phase | Tasks | Estimated Effort | Dependencies |
|-------|-------|-----------------|--------------|
| **Phase 1: Agent Code** | Steps 1-5 | 2-3 days | API documentation research (0.5 days) |
| **Phase 2: Infrastructure** | Steps 6-8 | 1 day | Phase 1 (partial overlap possible) |
| **Phase 3: Documentation** | Steps 9-13 | 1 day | Can run in parallel with implementation |
| **Phase 4: Testing** | Steps 14-16 | 2 days | All previous phases complete |
| **API Research** | SDK verification | 0.5 days | Before Phase 1 |
| **Buffer** | Unexpected issues | 1 day | - |
| **Total** | All phases | **6-8 days** | Sequential with parallelization |

**Critical Path:**
1. API research → Phase 1 → Phase 4 → Deployment (5-6 days)
2. Phase 2 and Phase 3 can overlap with Phase 1 to reduce total time

---

## Rollback Plan

If issues arise during migration:

### Before Deployment
1. **Git revert** to pre-migration commit
2. Restore from feature branch backup
3. No Azure resources affected

### After Deployment (Agent Provisioning Failed)
1. Run `deprovisionRFPAgent()` to cleanup partial resources
2. Delete Knowledge Index manually via Foundry portal if script fails
3. Re-deploy from previous release tag
4. Restore vector store implementation from Git history

### After Deployment (Knowledge Index Works, Quality Issues)
1. Keep Knowledge Index infrastructure
2. Adjust chunking parameters in Bicep (`knowledgeIndexChunkSize`, `knowledgeIndexChunkOverlap`)
3. Re-provision agent with new configuration
4. Compare results with A/B testing

### Complete Failure Scenario
1. Run cleanup script: `npm run deprovision`
2. Delete Knowledge Index via Azure CLI: `az cognitiveservices account knowledge-index delete`
3. Restore vector store implementation from Git
4. Re-deploy entire stack from previous working version

**Backup Commands:**
```bash
# Backup current working state before migration
git checkout -b backup/pre-knowledge-index-migration
git push origin backup/pre-knowledge-index-migration

# Rollback if needed
git checkout main
git revert <migration-commit-hash>
git push origin main
```

---

## Success Criteria

Migration is complete when:

✅ All vector store code removed from codebase  
✅ Knowledge Index created successfully with multi-file support  
✅ Agent provisions and invokes correctly with Foundry IQ  
✅ SPA can query agent and receive quality responses  
✅ All documentation updated (agent, infra, root README, Copilot instructions)  
✅ Deployment scripts validated end-to-end  
✅ No orphaned resources after cleanup  
✅ Test suite passes (unit, integration, E2E)  
✅ Performance meets or exceeds previous vector store approach  
✅ RBAC permissions verified and documented  

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **API not stable** | Medium | High | Research SDK thoroughly before implementation; fallback to REST API |
| **RBAC permissions insufficient** | Low | Medium | Test in dev environment first; document required roles |
| **Capability Host incompatible** | Low | High | Review Bicep API docs; test infra deployment separately |
| **Knowledge Index quality degradation** | Medium | High | A/B test with old approach; tune chunking parameters |
| **Multi-file upload failures** | Medium | Medium | Add comprehensive error handling; validate files before upload |
| **Deployment script regression** | Low | Medium | Keep deployment scripts backward-compatible during transition |
| **Index creation timeout** | Medium | Low | Increase polling timeout; add retry logic |

---

## Next Steps

1. **Immediate (Before Starting):**
   - [ ] Review this plan with team
   - [ ] Get approval for breaking change (no backward compatibility)
   - [ ] Research `@azure/ai-projects` SDK `knowledge` namespace documentation
   - [ ] Create feature branch: `feature/foundry-iq-migration`

2. **Phase 1 Start:**
   - [ ] Update [agent/src/agent.ts](../agent/src/agent.ts) — `setupKnowledgeBase()` function
   - [ ] Add multi-file scanning and upload logic
   - [ ] Update tool registration and cleanup functions

3. **Parallel Track:**
   - [ ] Start documentation updates while code is in progress
   - [ ] Create test assets in `agent/assets/`
   - [ ] Review Bicep infrastructure requirements

4. **Before Deployment:**
   - [ ] Run local test harness
   - [ ] Create backup branch
   - [ ] Prepare rollback plan
   - [ ] Deploy to dev environment first

---

**Plan Version:** 1.0  
**Last Updated:** May 7, 2026  
**Owner:** Development Team  
**Approvals:** _Pending review_
