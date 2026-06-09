<script setup lang="ts">
// COM-133: the shared teaching empty state (the reference gated every per-advisor tab behind one of
// these; extracted from Overview's donor block). Icon medallion + one teaching sentence + a CTA slot.
withDefaults(defineProps<{ icon?: string; title: string; body: string }>(), {
  icon: "lucide-inbox",
});
</script>

<template>
  <div
    class="mx-auto w-full max-w-reading px-3 sm:px-5 flex flex-col items-center justify-center gap-3 py-24 text-center"
  >
    <div class="rounded-full bg-surface-gray-2 p-3 text-ink-gray-6">
      <span :class="icon" class="size-6" aria-hidden="true" />
    </div>
    <p class="text-lg text-ink-gray-8">{{ title }}</p>
    <p class="text-p-sm text-ink-gray-6 max-w-md">{{ body }}</p>
    <slot />
  </div>
</template>
