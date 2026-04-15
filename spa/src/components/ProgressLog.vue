<template>
  <section class="progress-log" v-if="logs.length > 0">
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
  type: 'status' | 'error';
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
  if (type === 'error') return '❌';
  return '✓';
}
</script>

<style scoped>
.progress-log {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 2.5rem 1.5rem;
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
  padding: 0.35rem 0.6rem;
  border-radius: 4px;
  background: #f5f8fa;
  color: #516f90;
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
