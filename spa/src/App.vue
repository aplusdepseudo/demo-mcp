<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-icon">📋</span>
          <span class="logo-text">RFP Documentation Generator</span>
        </div>
        <span class="tagline">Powered by Azure AI Foundry</span>
      </div>
    </header>

    <main class="app-main">
      <RfpForm :loading="loading" @submit="handleGenerate" />

      <ProgressLog v-if="logs.length > 0" :logs="logs" />

      <div v-if="errorMessage" class="error-banner card">
        ❌ {{ errorMessage }}
      </div>

      <RfpResults :output="output" />
    </main>

    <footer class="app-footer">
      <span>demo-mcp · Azure AI Foundry RFP Agent</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import RfpForm from './components/RfpForm.vue';
import ProgressLog from './components/ProgressLog.vue';
import RfpResults from './components/RfpResults.vue';
import type { GenerateRequest, RfpOutput } from './types';
import type { LogEntry } from './components/ProgressLog.vue';
import { getAccessToken } from './services/auth';
import { FoundryClient } from './services/foundryClient';

const loading = ref(false);
const logs = ref<LogEntry[]>([]);
const output = ref<RfpOutput | null>(null);
const errorMessage = ref<string | null>(null);

function log(type: LogEntry['type'], message: string) {
  logs.value.push({ type, message });
}

async function handleGenerate(request: GenerateRequest) {
  loading.value = true;
  logs.value = [];
  output.value = null;
  errorMessage.value = null;

  try {
    log('status', 'Authenticating with Azure…');

    const projectEndpoint = import.meta.env.VITE_FOUNDRY_PROJECT_ENDPOINT;
    if (!projectEndpoint) {
      throw new Error('VITE_FOUNDRY_PROJECT_ENDPOINT is not configured.');
    }

    const client = new FoundryClient(projectEndpoint, getAccessToken);

    const result = await client.runRfpConversation(
      request.agentName,
      request.rfpTopic,
      request.rfpBudget,
      (message) => log('status', message),
    );

    output.value = result;
    log('status', '✅ RFP documentation generated successfully.');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errorMessage.value = message;
    log('error', message);
  } finally {
    loading.value = false;
  }
}
</script>

<style>
/* ── Global reset & base ── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  background: #f0f4f8;
  color: #111827;
}

.card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* ── Layout ── */
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background: #1e3a5f;
  color: #fff;
  padding: 0.75rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.logo-icon {
  font-size: 1.4rem;
}

.logo-text {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.tagline {
  font-size: 0.8rem;
  opacity: 0.75;
}

.app-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex: 1;
}

.app-footer {
  text-align: center;
  padding: 1rem;
  font-size: 0.78rem;
  color: #9ca3af;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}

.error-banner {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #b91c1c;
  font-size: 0.9rem;
}
</style>
