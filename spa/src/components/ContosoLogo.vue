<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Rounded square background -->
    <rect width="40" height="40" rx="8" fill="#0091ae" />
    <!-- Stylised "C" lettermark -->
    <path
      d="M24.5 12.5a9.5 9.5 0 0 0-9.5 9.5 9.5 9.5 0 0 0 9.5 9.5c2.6 0 5-1.05 6.7-2.75"
      stroke="#fff"
      stroke-width="3.2"
      stroke-linecap="round"
    />
    <!-- Accent dot -->
    <circle cx="31.5" cy="14" r="2.8" fill="#ff7a59" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 32 });
</script>
