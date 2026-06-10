<script setup lang="ts">
// COM-96: the focusable roster row — open on click/Enter/Space, hover ruler, focus ring (the M7
// interactive-row a11y contract in one place).
defineProps<{ ariaLabel: string }>();
const emit = defineEmits<{ (e: "open"): void }>();
</script>

<template>
  <tr
    tabindex="0"
    role="button"
    :aria-label="ariaLabel"
    class="border-b border-outline-gray-1 cursor-pointer hover:bg-surface-gray-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ink-gray-6)] focus-visible:bg-surface-gray-1"
    @click="emit('open')"
    @keydown.enter="emit('open')"
    @keydown.space.prevent="emit('open')"
  >
    <slot />
  </tr>
</template>
