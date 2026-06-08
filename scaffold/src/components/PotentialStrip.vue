<script setup lang="ts">
// Floor / Current / Ceiling / Best-case cells with mini bars (Advisors hero).
import { computed } from 'vue';
import { fUSD, clamp } from '../engine';
const props = defineProps<{ c: any }>();
const cells = computed(() => {
  const c = props.c;
  return [
    { k: 'Floor', v: c.baseCaseBase, s: 'guaranteed base', accent: false },
    { k: 'Current', v: c.baseCaseTotal, s: c.earnedUplift > 0 ? `+${(c.earnedUplift * 100).toFixed(0)}% earned` : 'no uplift yet', accent: true },
    { k: 'Ceiling', v: c.baseCaseCeil, s: `+${(c.ceilUplift * 100).toFixed(0)}% if targets hit`, accent: false },
    { k: 'Best case', v: c.bestCaseTotal, s: 'aggressive scenario', accent: false },
  ];
});
const max = computed(() => Math.max(1, ...cells.value.map(c => c.v)));
</script>

<template>
  <div class="rounded border border-outline-gray-1 overflow-hidden">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-px bg-surface-gray-2">
      <div v-for="cell in cells" :key="cell.k" class="p-4" :class="cell.accent ? 'bg-surface-amber-2' : 'bg-surface-white'">
        <div class="text-xs mb-1" :class="cell.accent ? 'text-ink-amber-3' : 'text-ink-gray-5'">{{ cell.k }}</div>
        <div class="font-display tabular-nums text-ink-gray-9" style="font-size:1.5rem;font-weight:350;line-height:1">{{ fUSD(cell.v) }}</div>
        <div class="text-xs mt-1.5 text-ink-gray-5">{{ cell.s }}</div>
        <div class="h-[3px] mt-2 bg-surface-gray-2 rounded-full overflow-hidden"><div class="h-full rounded-full" :class="cell.accent ? 'bg-surface-amber-3' : 'bg-surface-gray-5'" :style="{ width: clamp(cell.v / max, 0, 1) * 100 + '%' }" /></div>
      </div>
    </div>
  </div>
</template>
