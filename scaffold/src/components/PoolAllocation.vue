<script setup lang="ts">
// Shared pool-allocation bars (Overview + Board). Equity vs ESOP + Tokens vs board bucket;
// dark fill = earned/used, light = ceiling, red when ceiling exceeds budget. CSS bars (no chart engine).
import { computed } from "vue";
import { fPct } from "../engine";
import Panel from "./Panel.vue";

const props = defineProps<{ board: any; committed: number }>();

const segments = computed(() => {
  const b = props.board;
  return [
    {
      label: `Equity (of ${fPct(b.esopNow, 0)} ESOP)`,
      used: b.sumEq,
      ceil: b.sumEqCeil,
      budget: b.esopNow,
    },
    {
      label: `Tokens (board bucket ${fPct(b.boardBucket, 2)})`,
      used: b.sumTk,
      ceil: b.sumTkCeil,
      budget: b.boardBucket,
    },
  ];
});
const w = (v: number, budget: number) =>
  `${Math.max(0, Math.min(1.4, budget ? v / budget : 0)) * 100}%`;
const over = (s: { ceil: number; budget: number }) => s.ceil > s.budget + 1e-9;
</script>

<template>
  <Panel class="space-y-4">
    <div class="text-sm text-ink-gray-6">Pool allocation</div>
    <div v-for="s in segments" :key="s.label">
      <div class="flex justify-between text-sm mb-1.5">
        <span class="text-ink-gray-6">{{ s.label }}</span>
        <span class="tabular-nums" :class="over(s) ? 'text-ink-red-3' : 'text-ink-gray-9'">
          {{ fPct(s.used, 2) }} → {{ fPct(s.ceil, 2) }} / {{ fPct(s.budget, 2) }}
        </span>
      </div>
      <div class="relative h-2 rounded-full bg-surface-gray-2 overflow-hidden">
        <div
          class="absolute inset-y-0 left-0 rounded-full"
          :class="over(s) ? 'bg-surface-red-2' : 'bg-surface-gray-4'"
          :style="{ width: w(s.ceil, s.budget) }"
        />
        <div
          class="absolute inset-y-0 left-0 rounded-full bg-surface-gray-7"
          :style="{ width: w(s.used, s.budget) }"
        />
      </div>
    </div>
    <p class="text-p-xs text-ink-gray-6 leading-relaxed">
      Solid = earned · light = ceiling. The board's token bucket is ring-fenced and scalable,
      separate from the 5% ecosystem advisor pool (~{{ fPct(committed, 2) }} committed there).
    </p>
  </Panel>
</template>
