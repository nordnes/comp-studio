<script lang="ts">
import { ref } from "vue";
// COM-62: one module-level viewport flag (single matchMedia listener, shared by every PageHeader) driving
// the responsive page-header teleport — desktop teleports actions to #app-header, mobile keeps them in-body.
const MOBILE_MQ = "(max-width: 1023.98px)"; // below Tailwind's `lg` (the sidebar breakpoint)
const isMobile = ref(typeof window !== "undefined" && window.matchMedia(MOBILE_MQ).matches);
if (typeof window !== "undefined")
  window.matchMedia(MOBILE_MQ).addEventListener("change", (e) => (isMobile.value = e.matches));
</script>

<script setup lang="ts">
// The Fraunces editorial title + description stay in the body hero; the #actions slot teleports to the
// app-shell's thin #app-header bar on desktop (next to the breadcrumbs) and renders in-body on mobile,
// where the thin bar would crowd. Title-only views teleport nothing.
defineProps<{ title: string; desc?: string }>();
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="font-display text-2xl sm:text-3xl leading-tight text-ink-gray-9">{{ title }}</h1>
    <p v-if="desc" class="mt-3 text-p-sm text-ink-gray-6 leading-relaxed">{{ desc }}</p>
    <slot name="desc" />
  </div>
  <Teleport to="#app-header" :disabled="isMobile">
    <div class="flex items-center gap-2 flex-wrap no-print" :class="{ 'mt-4': isMobile }">
      <slot name="actions" />
    </div>
  </Teleport>
</template>
