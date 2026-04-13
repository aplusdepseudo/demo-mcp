<template>
  <section class="progress-log card" v-if="logs.length > 0">
    <h2>Progress</h2>
    <ul ref="listEl">
      <li
        v-for="(entry, idx) in logs"
        :key="idx"
        :class="entry.type"
      >
        <span class="icon">{{ iconFor(entry.type) }}</span>
        <span class="text">{{ entry.message }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

export interface LogEntry {
  type: 'status' | 'tool_call' | 'error';
  message: string;
}

const props = defineProps<{
  logs: LogEntry[];
}>();

const listEl = ref<HTMLUListElement | null>(null);

watch(
  () => props.logs.length,
  async () => {
    await nextTick();
    if (listEl.value) {
      listEl.value.scrollTop = listEl.value.scrollHeight;
    }
  },
);

function iconFor(type: LogEntry['type']): string {
  if (type === 'tool_call') return '🔧';
  if (type === 'error') return '❌';
  return '✓';
}
</script>

<style scoped>
.progress-log {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e3a5f;
  margin: 0;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.85rem;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  background: #f8fafc;
}

li.tool_call {
  background: #eff6ff;
  color: #1d4ed8;
}

li.error {
  background: #fef2f2;
  color: #dc2626;
}

.icon {
  flex-shrink: 0;
  font-size: 0.8rem;
  margin-top: 0.05rem;
}

.text {
  line-height: 1.4;
}
</style>
