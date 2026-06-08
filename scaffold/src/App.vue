<script setup lang="ts">
import { useRoute } from 'vue-router';
const tabs: [string, string][] = [
  ['/overview', 'Overview'], ['/advisors', 'Advisors'], ['/board', 'Board'],
  ['/compare', 'Compare'], ['/proposition', 'Proposition'], ['/configure', 'Configure'],
];
const route = useRoute();
</script>

<template>
  <div class="min-h-screen">
    <header class="no-print sticky top-0 z-20 bg-white border-b" style="border-color:#C9C2BA">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-baseline gap-4 flex-wrap">
        <div class="font-display text-xl">Raiku Labs</div>
        <div class="eyebrow hidden sm:block" style="color:#87807A">Advisory Board · Compensation Studio</div>
        <span class="eyebrow px-1.5 py-0.5" style="color:#9C4A0C;background:#FBEFD9">Internal</span>
      </div>
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto border-t" style="border-color:#E5E0DA">
        <router-link v-for="[to, label] in tabs" :key="to" :to="to" class="py-3 px-4 text-sm whitespace-nowrap no-underline"
          :style="{ color: route.path === to ? '#1A1815' : '#87807A', borderBottom: route.path === to ? '1.5px solid #9C4A0C' : '1.5px solid transparent', marginBottom: '-0.5px' }">{{ label }}</router-link>
      </nav>
    </header>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8"><router-view /></main>
  </div>
</template>
