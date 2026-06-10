<script setup lang="ts">
// COM-108: THE neutral surface — one source of truth for the card frame (bg/rounded/border).
// `padded` = the standard p-5; pass :padded="false" for overflow wrappers or custom padding.
// Bare `rounded` is deliberate (the adopted frappe-ui recipe); any rounded-md upgrade is a
// separate decision. Deliberate non-Panel exceptions: Proposition's outline-gray-2 editorial
// frame, and the amber company-cost conclusion (COM-118's one amber moment).
withDefaults(defineProps<{ padded?: boolean }>(), { padded: true });
</script>

<template>
  <div class="bg-surface-white rounded border border-outline-gray-1" :class="padded ? 'p-5' : ''">
    <slot />
  </div>
</template>
