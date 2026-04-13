<template>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Item</th>
          <th>Priority</th>
          <th>Done</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in items" :key="idx">
          <td class="category">{{ item.category }}</td>
          <td>{{ item.item }}</td>
          <td>
            <span :class="priorityClass(item.priority)">{{ item.priority }}</span>
          </td>
          <td class="center">{{ item.completed ? '✓' : '☐' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { ChecklistItem } from '../types.ts';

defineProps<{
  items: ChecklistItem[];
}>();

function priorityClass(priority: string): string {
  if (priority === 'Mandatory' || priority === 'Must-have') return 'priority-high';
  if (priority === 'Nice-to-have') return 'priority-low';
  return 'priority-med';
}
</script>

<style scoped>
.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
}

th {
  background: #1e3a5f;
  color: #fff;
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-weight: 600;
}

td {
  padding: 0.45rem 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: top;
}

tr:nth-child(even) td {
  background: #f8fafc;
}

.category {
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.center {
  text-align: center;
}

.priority-high {
  color: #dc2626;
  font-weight: 700;
}

.priority-med {
  color: #d97706;
  font-weight: 600;
}

.priority-low {
  color: #6b7280;
}
</style>
