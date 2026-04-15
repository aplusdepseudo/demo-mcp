<template>
  <div class="app-shell">
    <div class="wizard-card">
      <!-- Accent bar -->
      <div class="accent-bar"></div>

      <!-- Header -->
      <div class="wizard-header">
        <div class="logo">
          <ContosoLogo :size="28" />
          <span class="logo-sep">|</span>
          <span class="logo-text">RFP Generator</span>
        </div>
      </div>

      <!-- Main content: form or results -->
      <div v-if="!output" class="wizard-body">
        <RfpForm :loading="loading" @submit="handleGenerate" />

        <div class="wizard-side">
          <div class="side-brand">
            <div class="side-icon">📋</div>
            <p class="side-title">Azure AI Foundry Agent</p>
            <p class="side-desc">
              Automated RFP documentation generation powered by an AI agent with
              access to your procurement data via MCP tools.
            </p>
          </div>
          <div class="side-stats">
            <div class="stat">
              <span class="stat-value">5</span>
              <span class="stat-label">Checklist categories</span>
            </div>
            <div class="stat">
              <span class="stat-value">MCP</span>
              <span class="stat-label">Live vendor data</span>
            </div>
            <div class="stat">
              <span class="stat-value">AI</span>
              <span class="stat-label">Risk assessment</span>
            </div>
          </div>
          <p class="side-footer">
            Prerequisite checks, technical &amp; functional checklists,
            vendor assessment — all in one pass.
          </p>
        </div>
      </div>

      <!-- Progress log (shown during generation) -->
      <ProgressLog v-if="logs.length > 0 && !output" :logs="logs" />

      <!-- Error -->
      <div v-if="errorMessage" class="error-banner">
        ❌ {{ errorMessage }}
      </div>

      <!-- Results (replaces form once ready) -->
      <div v-if="output" class="results-wrapper">
        <button class="back-link" @click="resetView">‹ Back</button>
        <RfpResults :output="output" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import RfpForm from './components/RfpForm.vue';
import ProgressLog from './components/ProgressLog.vue';
import RfpResults from './components/RfpResults.vue';
import ContosoLogo from './components/ContosoLogo.vue';
import type { GenerateRequest, RfpOutput } from './types';
import type { LogEntry } from './components/ProgressLog.vue';
import { MsalBrowserCredential } from './services/auth';
import { FoundryClient } from './services/foundryClient';

const loading = ref(false);
const logs = ref<LogEntry[]>([]);
const output = ref<RfpOutput | null>(null);
const errorMessage = ref<string | null>(null);

function log(type: LogEntry['type'], message: string) {
  logs.value.push({ type, message });
}

function resetView() {
  output.value = null;
  logs.value = [];
  errorMessage.value = null;
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

    const credential = new MsalBrowserCredential();
    const client = new FoundryClient(projectEndpoint, credential);

    const result = await client.runRfpConversation({
      agentName: request.agentName,
      agentVersion: request.agentVersion,
      rfpTopic: request.rfpTopic,
      rfpBudget: request.rfpBudget,
      currency: request.currency,
      onProgress: (message) => log('status', message),
    });

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
  background: #e8ecf1;
  color: #33475b;
}

/* ── Wizard shell ── */
.app-shell {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 3rem 1.5rem;
}

.wizard-card {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 1060px;
  overflow: hidden;
  position: relative;
}

.accent-bar {
  height: 5px;
  background: #ff7a59;
}

.wizard-header {
  padding: 1.5rem 2.5rem 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.logo-sep {
  color: #cbd6e2;
  font-weight: 300;
  font-size: 1.2rem;
}

.logo-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #516f90;
  letter-spacing: -0.3px;
}

/* ── Two-column body ── */
.wizard-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  padding: 2rem 2.5rem 2.5rem;
  min-height: 420px;
  align-items: start;
}

@media (max-width: 760px) {
  .wizard-body {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

/* ── Side panel (right column) ── */
.wizard-side {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 0.5rem;
}

.side-brand {
  text-align: center;
}

.side-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.side-title {
  font-size: 1rem;
  font-weight: 700;
  color: #33475b;
  margin: 0 0 0.35rem;
}

.side-desc {
  font-size: 0.85rem;
  color: #516f90;
  line-height: 1.5;
  margin: 0;
}

.side-stats {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.stat-value {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ff7a59;
}

.stat-label {
  font-size: 0.72rem;
  color: #7c98b6;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 600;
}

.side-footer {
  font-size: 0.8rem;
  color: #7c98b6;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

/* ── Error ── */
.error-banner {
  margin: 0 2.5rem 1.5rem;
  padding: 0.85rem 1rem;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  color: #b91c1c;
  font-size: 0.88rem;
}

/* ── Results wrapper ── */
.results-wrapper {
  padding: 1rem 2.5rem 2.5rem;
}

.back-link {
  background: none;
  border: none;
  color: #0091ae;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  transition: color 0.15s;
}

.back-link:hover {
  color: #007a8a;
}

/* ── Shared card override for children ── */
.card {
  background: transparent;
  border: none;
  padding: 0;
  box-shadow: none;
  border-radius: 0;
}
</style>
