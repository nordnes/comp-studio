<script setup lang="ts">
// Shared page header (frappe-ui best practice: sentence-case editorial title + description, actions on the
// right). Replaces the reference's uppercase roman-numeral "Section N" eyebrows (Robin: use Frappe UI
// conventions). A light Raiku brand accent — Fraunces `font-display` — is kept for the page title only.
defineProps<{ title: string; desc?: string }>();
</script>

<template>
  <div class="flex justify-between items-start gap-4 flex-wrap">
    <div class="max-w-2xl">
      <h1 class="font-display text-2xl sm:text-3xl leading-tight text-ink-gray-9">{{ title }}</h1>
      <p v-if="desc" class="mt-3 text-p-sm text-ink-gray-6 leading-relaxed">{{ desc }}</p>
      <slot name="desc" />
    </div>
    <div class="flex items-center gap-2 flex-wrap no-print"><slot name="actions" /></div>
  </div>
</template>
