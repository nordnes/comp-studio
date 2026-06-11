<script setup lang="ts">
// FAST advisor-equity band gauge + verdict (Advisors, tier mode). CSS gauge (reference 1428-1444).
import { computed } from "vue";
import { BENCH, benchLevelForTier, fPct, clamp, fDate } from "../engine";
const props = defineProps<{ sel: any; c: any }>();
const band = computed(() => BENCH.advisorEquity[benchLevelForTier(props.sel.tier || 0)]);
const eq = computed(() => props.c.baseEq);
const MAX = 0.012;
const verdict = computed(() =>
  eq.value > band.value.hi + 1e-9
    ? "above market"
    : eq.value < band.value.lo - 1e-9
      ? "below market"
      : "in market range",
);
const vcol = computed(() =>
  verdict.value === "above market"
    ? "text-ink-amber-strong"
    : verdict.value === "below market"
      ? "text-ink-blue-3"
      : "text-ink-green-3",
);
</script>

<template>
  <div
    v-if="sel.mode !== 'value'"
    class="pt-1"
    role="img"
    :aria-label="`Base equity ${fPct(eq, 2)} versus FAST ${band.label} band ${fPct(band.lo, 2)} to ${fPct(band.hi, 2)} — ${verdict}.`"
  >
    <div class="flex items-center justify-between text-xs mb-1">
      <span class="text-ink-gray-6">vs industry benchmark · FAST {{ band.label }}</span
      ><span :class="vcol">{{ fPct(eq, 2) }} · {{ verdict }}</span>
    </div>
    <div class="relative h-2 rounded bg-surface-gray-2 border border-outline-gray-1">
      <div
        class="absolute top-0 bottom-0 bg-surface-amber-2 rounded"
        :style="{
          left: (band.lo / MAX) * 100 + '%',
          width: ((band.hi - band.lo) / MAX) * 100 + '%',
        }"
      />
      <div
        class="absolute -top-0.5 -bottom-0.5 w-0.5"
        :style="{ left: clamp(eq / MAX, 0, 1) * 100 + '%', background: 'var(--chart-capital)' }"
      />
    </div>
    <p class="text-p-xs mt-1 text-ink-gray-6">
      FAST {{ fPct(band.lo, 2) }}–{{ fPct(band.hi, 2) }} per head · advisory pool ~{{
        fPct(BENCH.advisorPool, 0)
      }}. Source: {{ BENCH.advisorSrc }} · as of {{ fDate(BENCH.asOf.advisorEquity) }}.
    </p>
  </div>
</template>
