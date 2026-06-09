<script setup lang="ts">
// Upside curve: equity net-vs-exit (area) + tokens-vs-FDV (line), two frappe-charts. Net of strike.
import { computed } from "vue";
import { useStudio } from "../store";
import { roundLabel, fUSD, BENCH, safeDiv } from "../engine";
import FrappeChart from "./FrappeChart.vue";
import Term from "./Term.vue";
import { chartHex } from "../constants";
const props = defineProps<{ c: any }>();
const eqColors = computed(() => [chartHex("--chart-capital")]);
const tkColors = computed(() => [chartHex("--chart-customer")]);
const { store } = useStudio();
const plan = computed(() => store.S.plan);
const sb = computed(() => props.c.base);
const topEq = computed(() => sb.value.exitVal * (plan.value.exitMultiple || 2));
const breakeven = computed(() => safeDiv(sb.value.strikeBasis, sb.value.retention));
const eqChart = computed(() => {
  const steps = 12;
  const values: number[] = [];
  const labels: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const V = (topEq.value / steps) * i;
    labels.push(fUSD(V));
    values.push(
      Math.round(
        Math.max(0, props.c.eqPct * (sb.value.retention * V - sb.value.strikeBasis)) / 1e6,
      ),
    );
  }
  return { labels, datasets: [{ name: "net", values }] }; // y in $M
});
const topFdv = computed(() =>
  Math.max(
    BENCH.fdvCaution * 1.5,
    Math.max(sb.value.fdv, ...props.c.scen.map((s: any) => s.fdv)) * 1.2,
  ),
);
const tkChart = computed(() => {
  const steps = 12;
  const values: number[] = [];
  const labels: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const F = (topFdv.value / steps) * i;
    labels.push(fUSD(F));
    values.push(Math.round((props.c.tkPct * F) / 1e6));
  }
  return { labels, datasets: [{ name: "token value", values }] }; // y in $M
});
const areaOpts = {
  lineOptions: { regionFill: 1, hideDots: 1 },
  tooltipOptions: { formatTooltipY: (v: number) => fUSD(v * 1e6) },
};
const lineOpts = {
  lineOptions: { hideDots: 1 },
  tooltipOptions: { formatTooltipY: (v: number) => fUSD(v * 1e6) },
};
</script>

<template>
  <div class="bg-surface-white rounded border border-outline-gray-1 p-5">
    <div class="text-sm text-ink-gray-6 mb-3">
      Upside · what an outcome is worth (<Term k="netOfStrike">net of strike</Term>)
    </div>
    <div class="grid lg:grid-cols-2 gap-4">
      <div>
        <div class="text-xs text-ink-amber-strong mb-2">
          Equity · net vs exit company value <span class="text-ink-gray-6">· $M</span>
        </div>
        <FrappeChart
          type="line"
          :data="eqChart"
          :height="190"
          :colors="eqColors"
          :options="areaOpts"
          :aria-label="`Equity net value vs exit company value, net of strike. Underwater below ${fUSD(breakeven)} exit; ${(sb.retention * 100).toFixed(0)}% retained after dilution.`"
        />
        <p class="text-p-xs mt-1 text-ink-gray-6">
          Below {{ fUSD(breakeven) }} exit, equity is underwater (net $0). Base-case
          {{ (sb.retention * 100).toFixed(0) }}% retained after dilution.
        </p>
      </div>
      <div>
        <div class="text-xs text-ink-amber-strong mb-2">
          Tokens · value vs <Term k="tgeFdv">TGE FDV</Term> <span class="text-ink-gray-6">· $M</span>
        </div>
        <FrappeChart
          type="line"
          :data="tkChart"
          :height="190"
          :colors="tkColors"
          :options="lineOpts"
          aria-label="Token value vs TGE fully-diluted valuation, rising linearly from zero."
        />
        <p class="text-p-xs mt-1 text-ink-gray-6">
          TGE FDV = multiple × {{ roundLabel(plan, plan.tgeAnchor) }} post-money.<span
            v-if="plan.showBenchmarks"
          >
            2025 launches above $1B FDV mostly traded down.</span
          >
        </p>
      </div>
    </div>
  </div>
</template>
