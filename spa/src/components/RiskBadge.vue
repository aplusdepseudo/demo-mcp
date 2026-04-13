<template>
  <span :class="['risk-badge', cls]">{{ level }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ level: string }>();

const cls = computed(() => {
  if (props.level === 'High') return 'high';
  if (props.level === 'Medium') return 'medium';
  return 'low';
});
</script>

<style scoped>
.risk-badge {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.high {
  background: #fee2e2;
  color: #b91c1c;
}

.medium {
  background: #fef3c7;
  color: #92400e;
}

.low {
  background: #dcfce7;
  color: #15803d;
}
</style>
