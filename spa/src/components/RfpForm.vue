<template>
  <section class="rfp-form card">
    <h2>Agent Configuration</h2>
    <div class="form-grid">
      <label>
        <span>Agent Name</span>
        <input
          v-model="config.agentName"
          type="text"
          placeholder="rfp-agent"
          :disabled="loading"
        />
      </label>

      <label>
        <span>Agent Version</span>
        <input
          v-model="config.agentVersion"
          type="text"
          placeholder="1"
          :disabled="loading"
        />
      </label>
    </div>

    <h2 class="mt">RFP Details</h2>
    <div class="form-grid">
      <label class="full">
        <span>RFP Topic / Context</span>
        <textarea
          v-model="rfpTopic"
          rows="3"
          placeholder="e.g. Enterprise ERP Software Procurement for a 500-person manufacturing company"
          :disabled="loading"
        />
      </label>

      <label>
        <span>Budget (USD)</span>
        <input
          v-model.number="rfpBudget"
          type="number"
          min="0"
          step="10000"
          placeholder="500000"
          :disabled="loading"
        />
      </label>
    </div>

    <div class="actions">
      <button
        class="btn-primary"
        :disabled="loading || !isValid"
        @click="handleSubmit"
      >
        <span v-if="loading">⏳ Generating…</span>
        <span v-else>🚀 Generate RFP Documentation</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import type { GenerateRequest } from '../types.ts';

const emit = defineEmits<{
  submit: [request: GenerateRequest];
}>();

const props = defineProps<{
  loading: boolean;
}>();

const config = reactive({
  agentName: 'rfp-agent',
  agentVersion: '1',
});

const rfpTopic = ref('');
const rfpBudget = ref(500000);

const isValid = computed(
  () =>
    config.agentName.trim() !== '' &&
    rfpTopic.value.trim() !== '' &&
    rfpBudget.value > 0,
);

function handleSubmit() {
  if (!isValid.value || props.loading) return;
  emit('submit', {
    agentName: config.agentName.trim(),
    agentVersion: config.agentVersion.trim(),
    rfpTopic: rfpTopic.value.trim(),
    rfpBudget: rfpBudget.value,
  });
}
</script>

<style scoped>
.rfp-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e3a5f;
  margin: 0 0 0.5rem;
}

h2.mt {
  margin-top: 0.75rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

label.full {
  grid-column: 1 / -1;
}

input,
textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  background: #fff;
  transition: border-color 0.15s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

input:disabled,
textarea:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.btn-primary {
  padding: 0.6rem 1.5rem;
  background: #1e3a5f;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
