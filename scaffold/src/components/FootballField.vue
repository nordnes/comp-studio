<script setup lang="ts">
// Scenario range bar (low–high) with a base tick. Used single (Advisors) and per-row (Board). CSS bars.
import { fUSD } from '../engine';
const props = defineProps<{ lo: number; base: number; hi: number; max: number; label?: string; compact?: boolean }>();
const pct = (v: number) => `${Math.max(0, Math.min(1, props.max ? v / props.max : 0)) * 100}%`;
</script>

<template>
  <div>
    <div v-if="label" class="flex justify-between text-xs mb-1">
      <span class="text-ink-gray-7">{{ label }}</span>
      <span class="tabular-nums text-ink-gray-5">{{ fUSD(lo) }} – {{ fUSD(hi) }}</span>
    </div>
    <div class="relative rounded bg-surface-gray-2" :class="compact ? 'h-3' : 'h-[18px]'">
      <div class="absolute rounded bg-surface-amber-2" :style="{ left: pct(lo), width: pct(hi - lo), top: '3px', bottom: '3px' }" />
      <div class="absolute bg-surface-gray-7 rounded" :style="{ left: pct(base), top: 0, bottom: 0, width: '2px' }" :title="`base ${fUSD(base)}`" />
    </div>
  </div>
</template>
