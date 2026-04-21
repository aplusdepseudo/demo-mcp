<template>
  <div class="rfp-form">
    <p class="greeting">Let's build your RFP! 👋</p>

    <!-- Section 1: Agent configuration -->
    <section class="form-section">
      <h3 class="section-title">
        <span class="section-number">1</span>
        Agent Configuration
      </h3>
      <div class="section-fields">
        <div class="inline-fields">
          <label class="field">
            <span class="field-label">Agent Name</span>
            <div class="input-wrap">
              <input
                v-model="agentName"
                type="text"
                placeholder="rfp-agent"
                :disabled="loading"
              />
            </div>
          </label>
          <label class="field field-sm">
            <span class="field-label">Version</span>
            <div class="input-wrap">
              <input
                v-model="agentVersion"
                type="text"
                placeholder="1"
                :disabled="loading"
              />
            </div>
          </label>
        </div>
      </div>
    </section>

    <!-- Section 2: RFP prompt parameters -->
    <section class="form-section">
      <h3 class="section-title">
        <span class="section-number">2</span>
        RFP Details
      </h3>
      <div class="section-fields">
        <label class="field">
          <span class="field-label">Topic / Context</span>
          <div class="input-wrap">
            <textarea
              v-model="rfpTopic"
              rows="2"
              placeholder="e.g. Enterprise ERP Software Procurement for a 500-person manufacturing company"
              :disabled="loading"
            />
          </div>
        </label>

        <label class="field">
          <span class="field-label">Budget</span>
          <div class="input-wrap budget-wrap">
            <input
              v-model.number="rfpBudget"
              type="number"
              min="0"
              step="10000"
              placeholder="500000"
              :disabled="loading"
            />
            <select v-model="currency" :disabled="loading" class="currency-select">
              <option value="EUR">€ EUR</option>
              <option value="USD">$ USD</option>
            </select>
          </div>
        </label>

        <div class="field">
          <span class="field-label">Vendor Categories</span>
          <div class="multiselect-wrap">
            <label
              v-for="cat in VENDOR_CATEGORIES"
              :key="cat"
              class="chip"
              :class="{ selected: selectedCategories.has(cat), disabled: loading }"
            >
              <input
                type="checkbox"
                :value="cat"
                :checked="selectedCategories.has(cat)"
                :disabled="loading"
                @change="toggleCategory(cat)"
              />
              <span class="chip-label">{{ cat }}</span>
            </label>
          </div>
        </div>
      </div>
    </section>

    <button
      class="btn-generate"
      :disabled="loading || !isValid"
      @click="handleSubmit"
    >
      <span v-if="loading">Generating…</span>
      <span v-else>Next ›</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from 'vue';
import type { GenerateRequest, Currency } from '../types';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

const VENDOR_CATEGORIES = [
  'ERP Software',
  'CRM Software',
  'Cybersecurity Software',
  'Cloud Infrastructure',
  'Data Analytics & BI',
  'ITSM / IT Service Management',
  'HR & Payroll Software',
  'Supply Chain Management',
  'Legacy Software',
] as const;

function setCookie(name: string, value: string): void {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${encodeURIComponent(name)}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

const emit = defineEmits<{
  submit: [request: GenerateRequest];
}>();

const props = defineProps<{
  loading: boolean;
}>();

const agentName = ref('rfp-agent');
const agentVersion = ref('1');
const rfpTopic = ref('');
const rfpBudget = ref(500000);
const currency = ref<Currency>('EUR');
const selectedCategories = reactive(new Set<string>());

function toggleCategory(cat: string) {
  if (selectedCategories.has(cat)) {
    selectedCategories.delete(cat);
  } else {
    selectedCategories.add(cat);
  }
  setCookie('rfp_categories', JSON.stringify([...selectedCategories]));
}

// Restore saved values on mount
onMounted(() => {
  agentName.value = getCookie('rfp_agentName') ?? agentName.value;
  agentVersion.value = getCookie('rfp_agentVersion') ?? agentVersion.value;
  rfpTopic.value = getCookie('rfp_topic') ?? rfpTopic.value;
  const savedBudget = getCookie('rfp_budget');
  if (savedBudget) rfpBudget.value = Number(savedBudget) || rfpBudget.value;
  const savedCurrency = getCookie('rfp_currency');
  if (savedCurrency === 'USD' || savedCurrency === 'EUR') currency.value = savedCurrency;
  const savedCategories = getCookie('rfp_categories');
  if (savedCategories) {
    try {
      const parsed = JSON.parse(savedCategories);
      if (Array.isArray(parsed)) parsed.forEach((c: string) => selectedCategories.add(c));
    } catch { /* ignore */ }
  }
});

// Persist on change
watch(agentName, (v) => setCookie('rfp_agentName', v));
watch(agentVersion, (v) => setCookie('rfp_agentVersion', v));
watch(rfpTopic, (v) => setCookie('rfp_topic', v));
watch(rfpBudget, (v) => setCookie('rfp_budget', String(v)));
watch(currency, (v) => setCookie('rfp_currency', v));

const isValid = computed(
  () =>
    agentName.value.trim() !== '' &&
    agentVersion.value.trim() !== '' &&
    rfpTopic.value.trim() !== '' &&
    rfpBudget.value > 0 &&
    selectedCategories.size > 0,
);

function handleSubmit() {
  if (!isValid.value || props.loading) return;
  emit('submit', {
    agentName: agentName.value.trim(),
    agentVersion: agentVersion.value.trim(),
    rfpTopic: rfpTopic.value.trim(),
    rfpBudget: rfpBudget.value,
    currency: currency.value,
    vendorCategories: [...selectedCategories],
  });
}
</script>

<style scoped>
.rfp-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.greeting {
  font-size: 0.95rem;
  color: #516f90;
  margin: 0 0 1.25rem;
}

/* ── Sections ── */
.form-section {
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #33475b;
  margin: 0 0 1rem;
}

.section-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #0091ae;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.section-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-left: 2.1rem;
}

.inline-fields {
  display: flex;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.field-sm {
  flex: 0 0 5.5rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #7c98b6;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.input-wrap {
  border-bottom: 2px solid #cbd6e2;
  transition: border-color 0.2s;
}

.input-wrap:focus-within {
  border-color: #0091ae;
}

input,
textarea {
  width: 100%;
  padding: 0.5rem 0;
  border: none;
  outline: none;
  font-size: 0.95rem;
  font-family: inherit;
  color: #33475b;
  background: transparent;
  resize: none;
}

input::placeholder,
textarea::placeholder {
  color: #b0c4d8;
}

input:disabled,
textarea:disabled,
select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Budget row ── */
.budget-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.budget-wrap input {
  flex: 1;
  min-width: 0;
}

.currency-select {
  padding: 0.4rem 0.25rem;
  border: none;
  outline: none;
  font-size: 0.88rem;
  font-family: inherit;
  color: #33475b;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
}

/* ── Multiselect chips ── */
.multiselect-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border: 1.5px solid #cbd6e2;
  border-radius: 999px;
  font-size: 0.82rem;
  color: #516f90;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.chip input[type='checkbox'] {
  display: none;
}

.chip:hover:not(.disabled) {
  border-color: #0091ae;
  color: #0091ae;
}

.chip.selected {
  background: #e5f5f8;
  border-color: #0091ae;
  color: #0091ae;
  font-weight: 600;
}

.chip.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── CTA button ── */
.btn-generate {
  margin-top: 1.5rem;
  padding: 0.85rem 2rem;
  background: #ff7a59;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  width: 100%;
  letter-spacing: 0.2px;
}

.btn-generate:hover:not(:disabled) {
  background: #ff5c35;
}

.btn-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
