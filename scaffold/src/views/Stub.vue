<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
</script>

<template>
  <div class="text-center py-24 border border-dashed" style="border-color:#C9C2BA;background:#fff">
    <div class="eyebrow mb-2" style="color:#9C4A0C">{{ route.meta.title }}</div>
    <h2 class="font-display text-2xl mb-2">Built by Claude Code</h2>
    <p class="text-sm max-w-md mx-auto" style="color:#87807A">Implement this view per <code>ULTRACODE_PROMPT.md</code>, porting the matching section of <code>reference/advisor-comp-studio.tsx</code>. The engine and store are already wired — import <code>useStudio()</code> and the engine helpers.</p>
  </div>
</template>
