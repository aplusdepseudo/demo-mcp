<template>
  <svg
    :height="size"
    :viewBox="`0 0 130 ${size}`"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Accent bar -->
    <rect x="0" :y="size * 0.15" width="4" :height="size * 0.7" rx="2" fill="#ff7a59" />
    <!-- "contoso" wordmark -->
    <text
      x="12"
      :y="size * 0.72"
      font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      :font-size="size * 0.65"
      font-weight="800"
      letter-spacing="-0.5"
      fill="#33475b"
    >cont<tspan fill="#0091ae">o</tspan>so</text>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 28 });
</script>
