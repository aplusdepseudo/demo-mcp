<template>
  <section class="rfp-results card" v-if="output">
    <div class="results-header">
      <h2>
        RFP Documentation: <em>{{ output.rfpTopic }}</em>
      </h2>
      <span class="budget">Budget: ${{ output.budget.toLocaleString() }} USD</span>
    </div>

    <!-- Tab navigation -->
    <div class="tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span class="badge">{{ tabCount(tab.id) }}</span>
      </button>
    </div>

    <!-- Prerequisites Checklist -->
    <div v-if="activeTab === 'prerequisites'" class="tab-panel">
      <ChecklistTable :items="output.prerequisitesChecklist" />
    </div>

    <!-- Technical Checklist -->
    <div v-if="activeTab === 'technical'" class="tab-panel">
      <ChecklistTable :items="output.technicalChecklist" />
    </div>

    <!-- Functional Checklist -->
    <div v-if="activeTab === 'functional'" class="tab-panel">
      <ChecklistTable :items="output.functionalChecklist" />
    </div>

    <!-- Vendor Assessment -->
    <div v-if="activeTab === 'vendors'" class="tab-panel">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Country</th>
              <th>Category</th>
              <th>Risk Score</th>
              <th>Risk Level</th>
              <th>Eligible</th>
              <th>Cat. Match</th>
              <th>Justification</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in output.vendorAssessment" :key="v.vendorId">
              <td class="mono">{{ v.vendorId }}</td>
              <td>{{ v.name }}</td>
              <td>{{ v.country }}</td>
              <td>{{ v.category }}</td>
              <td class="center">{{ v.riskScore }}</td>
              <td class="center">
                <RiskBadge :level="v.riskLevel" />
              </td>
              <td class="center">
                <span :class="v.eligible ? 'yes' : 'no'">{{ v.eligible ? '✓' : '✗' }}</span>
              </td>
              <td class="center">
                <span :class="v.categoryMatch ? 'yes' : 'no'">{{ v.categoryMatch ? '✓' : '✗' }}</span>
              </td>
              <td class="small">{{ v.justification }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Retained Vendors -->
    <div v-if="activeTab === 'retained'" class="tab-panel">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Country</th>
              <th>Risk Score</th>
              <th>Risk Level</th>
              <th>Justification</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in output.retainedVendors" :key="v.vendorId">
              <td class="mono">{{ v.vendorId }}</td>
              <td>{{ v.name }}</td>
              <td>{{ v.country }}</td>
              <td class="center">{{ v.riskScore }}</td>
              <td class="center">
                <RiskBadge :level="v.riskLevel" />
              </td>
              <td class="small">{{ v.justification }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Discarded Vendors -->
    <div v-if="activeTab === 'discarded'" class="tab-panel">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Country</th>
              <th>Risk Score</th>
              <th>Risk Level</th>
              <th>Reason for Disqualification</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in output.discardedVendors" :key="v.vendorId" class="discarded-row">
              <td class="mono">{{ v.vendorId }}</td>
              <td>{{ v.name }}</td>
              <td>{{ v.country }}</td>
              <td class="center">{{ v.riskScore }}</td>
              <td class="center">
                <RiskBadge :level="v.riskLevel" />
              </td>
              <td class="small">{{ v.reason }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="download-row">
      <button class="btn-primary-dl" @click="downloadExcel" :disabled="exporting">
        <span v-if="exporting">⏳ Generating…</span>
        <span v-else>📦 Export Excel Package</span>
      </button>
      <button class="btn-outline" @click="downloadJson">⬇ Download JSON</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { RfpOutput } from '../types.ts';
import ChecklistTable from './ChecklistTable.vue';
import RiskBadge from './RiskBadge.vue';
import { downloadExcelReport } from '../services/excelExport';

const props = defineProps<{
  output: RfpOutput | null;
}>();

const exporting = ref(false);

const tabs = [
  { id: 'prerequisites', label: 'Prerequisites' },
  { id: 'technical', label: 'Technical' },
  { id: 'functional', label: 'Functional' },
  { id: 'vendors', label: 'Vendor Assessment' },
  { id: 'retained', label: '✓ Retained' },
  { id: 'discarded', label: '✗ Discarded' },
] as const;

type TabId = (typeof tabs)[number]['id'];

const activeTab = ref<TabId>('prerequisites');

function tabCount(id: TabId): number {
  if (!props.output) return 0;
  const map: Record<TabId, number> = {
    prerequisites: props.output.prerequisitesChecklist?.length ?? 0,
    technical: props.output.technicalChecklist?.length ?? 0,
    functional: props.output.functionalChecklist?.length ?? 0,
    vendors: props.output.vendorAssessment?.length ?? 0,
    retained: props.output.retainedVendors?.length ?? 0,
    discarded: props.output.discardedVendors?.length ?? 0,
  };
  return map[id];
}

async function downloadExcel() {
  if (!props.output) return;
  exporting.value = true;
  try {
    await downloadExcelReport(props.output);
  } finally {
    exporting.value = false;
  }
}

function downloadJson() {
  if (!props.output) return;
  const blob = new Blob([JSON.stringify(props.output, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rfp_${props.output.rfpTopic.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.rfp-results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.results-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #33475b;
  margin: 0;
}

h2 em {
  font-style: normal;
  color: #0091ae;
}

.budget {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0;
}

.tab-btn {
  padding: 0.45rem 0.9rem;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  border-radius: 4px 4px 0 0;
  transition: color 0.15s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.tab-btn:hover {
  color: #33475b;
}

.tab-btn.active {
  color: #33475b;
  border-bottom-color: #ff7a59;
  font-weight: 600;
}

.badge {
  background: #e5e7eb;
  color: #374151;
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  font-weight: 600;
}

.tab-btn.active .badge {
  background: #fff1ee;
  color: #ff5c35;
}

.tab-panel {
  min-height: 200px;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
}

th {
  background: #33475b;
  color: #fff;
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
}

td {
  padding: 0.45rem 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: top;
}

tr:nth-child(even) td {
  background: #f8fafc;
}

.mono {
  font-family: monospace;
  font-size: 0.8rem;
}

.center {
  text-align: center;
}

.small {
  font-size: 0.8rem;
  color: #4b5563;
}

.yes {
  color: #16a34a;
  font-weight: 700;
}

.no {
  color: #dc2626;
  font-weight: 700;
}

.discarded-row td {
  color: #6b7280;
}

.discarded-row td:first-child {
  border-left: 3px solid #fca5a5;
}

.download-row {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.btn-primary-dl {
  padding: 0.55rem 1.2rem;
  background: #ff7a59;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary-dl:hover:not(:disabled) {
  background: #ff5c35;
}

.btn-primary-dl:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline {
  padding: 0.5rem 1.1rem;
  border: 1.5px solid #33475b;
  color: #33475b;
  background: transparent;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.btn-outline:hover {
  background: #33475b;
  color: #fff;
}
</style>
