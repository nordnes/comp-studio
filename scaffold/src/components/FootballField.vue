<script setup lang="ts">
// Scenario range bar (low–high) with a base tick. Used single (Advisors) and per-row (Board). CSS bars.
import { fUSD } from "../engine";
const props = defineProps<{
  lo: number;
  base: number;
  hi: number;
  max: number;
  label?: string;
  compact?: boolean;
}>();
const pct = (v: number) => `${Math.max(0, Math.min(1, props.max ? v / props.max : 0)) * 100}%`;
</script>

<template>
  <div>
    <!-- COM-136: a long label truncates rather than colliding with the range read-out -->
    <div v-if="label" class="flex justify-between gap-2 text-xs mb-1">
      <span class="text-ink-gray-7 min-w-0 truncate" :title="label">{{ label }}</span>
      <span class="tabular-nums text-ink-gray-6 shrink-0">{{ fUSD(lo) }} – {{ fUSD(hi) }}</span>
    </div>
    <div
      class="relative rounded bg-surface-gray-2"
      :class="compact ? 'h-3' : 'h-[18px]'"
      role="img"
      :aria-label="`Scenario range ${fUSD(lo)} to ${fUSD(hi)}, base ${fUSD(base)}.`"
    >
      <!-- COM-119: weight inverted — the spread is CONTEXT (neutral band), the base case is THE
           SIGNAL (a 3px brand-amber tick). Amber marks the current case, nothing else. -->
      <!-- UXS-K (UXP 2.6): the band was near-invisible on white — one stop darker -->
      <div
        class="absolute rounded bg-surface-gray-4"
        :style="{ left: pct(lo), width: pct(hi - lo), top: '3px', bottom: '3px' }"
      />
      <div
        class="absolute bg-surface-amber-3 rounded"
        :style="{ left: pct(base), top: 0, bottom: 0, width: '3px' }"
        :title="`base ${fUSD(base)}`"
      />
    </div>
  </div>
</template>
