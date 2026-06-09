<script setup lang="ts">
// Upside curve: equity net-vs-exit (custom SVG area with a breakeven cue) + tokens-vs-FDV (frappe-charts
// line). Net of strike. COM-57: the equity chart now shades the underwater x-region and draws a labelled
// breakeven vertical — the single most important options affordance — from values the engine already
// returns (strikeBasis / retention / eqPct). Engine untouched. frappe-charts can't do a vertical marker /
// x-region, so the equity half is custom SVG (the token half stays frappe-charts — linear, no breakeven).
import { computed } from "vue";
import { useStudio } from "../store";
import { roundLabel, fUSD, BENCH, safeDiv } from "../engine";
import FrappeChart from "./FrappeChart.vue";
import Term from "./Term.vue";
import { chartHex } from "../constants";
const props = defineProps<{ c: any; markerExit?: number | null }>();
const tkColors = computed(() => [chartHex("--chart-customer")]);
const { store } = useStudio();
const plan = computed(() => store.S.plan);
const sb = computed(() => props.c.base);
const topEq = computed(() => sb.value.exitVal * (plan.value.exitMultiple || 2));
const breakeven = computed(() => safeDiv(sb.value.strikeBasis, sb.value.retention));

// --- equity net-vs-exit: custom SVG (COM-57) ---
const EW = 360,
  EH = 190;
const EPAD = { l: 46, r: 14, t: 14, b: 28 };
const netAt = (V: number) =>
  Math.max(0, props.c.eqPct * (sb.value.retention * V - sb.value.strikeBasis));
const eqYMax = computed(() => Math.max(1, netAt(topEq.value)));
const ex = (V: number) =>
  EPAD.l + (Math.min(V, topEq.value) / topEq.value) * (EW - EPAD.l - EPAD.r);
const ey = (n: number) =>
  EH - EPAD.b - (Math.min(n, eqYMax.value) / eqYMax.value) * (EH - EPAD.t - EPAD.b);
const eqPath = computed(() => {
  const steps = 48;
  let d = `M ${ex(0)} ${ey(0)}`;
  for (let i = 0; i <= steps; i++) {
    const V = (topEq.value / steps) * i;
    d += ` L ${ex(V)} ${ey(netAt(V))}`;
  }
  d += ` L ${ex(topEq.value)} ${ey(0)} Z`;
  return d;
});
const beClamped = computed(() => Math.min(Math.max(breakeven.value, 0), topEq.value));
const eqXTicks = computed(() => [0, topEq.value / 2, topEq.value]);
// COM-47: optional exit-slider marker (clamped to the plotted exit range).
const mx = computed(() =>
  props.markerExit == null ? null : Math.min(Math.max(props.markerExit, 0), topEq.value),
);

// --- tokens vs FDV: frappe-charts line (linear, no strike) ---
const lineOpts = {
  lineOptions: { hideDots: 1 },
  tooltipOptions: { formatTooltipY: (v: number) => fUSD(v * 1e6) },
};
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
</script>

<template>
  <div class="bg-surface-white rounded border border-outline-gray-1 p-5">
    <div class="text-sm text-ink-gray-6 mb-3">
      Upside · what an outcome is worth (<Term k="netOfStrike">net of strike</Term>)
    </div>
    <div class="grid lg:grid-cols-2 gap-4">
      <div>
        <div class="text-xs text-ink-gray-7 mb-2">
          Equity · net vs exit company value <span class="text-ink-gray-6">· $M</span>
        </div>
        <svg
          :viewBox="`0 0 ${EW} ${EH}`"
          class="w-full text-ink-gray-9"
          style="height: 190px"
          role="img"
          :aria-label="`Equity net value vs exit company value, net of strike. Underwater (net $0) below ${fUSD(breakeven)} exit; ${(sb.retention * 100).toFixed(0)}% retained after dilution.`"
        >
          <!-- COM-57: underwater band — the x-region where net equity is $0 -->
          <rect
            :x="ex(0)"
            :y="EPAD.t"
            :width="ex(beClamped) - ex(0)"
            :height="EH - EPAD.t - EPAD.b"
            :style="{ fill: 'var(--chart-warning)', fillOpacity: 0.08 }"
          />
          <line
            :x1="EPAD.l"
            :y1="EH - EPAD.b"
            :x2="EW - EPAD.r"
            :y2="EH - EPAD.b"
            class="stroke-current text-ink-gray-3"
            stroke-width="1"
          />
          <line
            :x1="EPAD.l"
            :y1="EPAD.t"
            :x2="EPAD.l"
            :y2="EH - EPAD.b"
            class="stroke-current text-ink-gray-3"
            stroke-width="1"
          />
          <!-- net-equity area (0 while underwater, rising past breakeven) -->
          <path
            :d="eqPath"
            stroke-linejoin="round"
            :style="{
              fill: 'var(--chart-capital)',
              fillOpacity: 0.16,
              stroke: 'var(--chart-capital)',
              strokeWidth: 1.75,
            }"
          />
          <!-- COM-57: labelled breakeven vertical -->
          <line
            :x1="ex(beClamped)"
            :y1="EPAD.t"
            :x2="ex(beClamped)"
            :y2="EH - EPAD.b"
            :style="{ stroke: 'var(--chart-warning)' }"
            stroke-width="1.5"
            stroke-dasharray="3 2"
          />
          <text
            :x="ex(beClamped) + 4"
            :y="EPAD.t + 9"
            font-size="10"
            :style="{ fill: 'var(--chart-warning)' }"
          >
            breakeven
          </text>
          <!-- COM-47: exit-slider marker — where the advisor's slider sits on the curve -->
          <template v-if="mx !== null">
            <line
              :x1="ex(mx)"
              :y1="EPAD.t"
              :x2="ex(mx)"
              :y2="EH - EPAD.b"
              :style="{ stroke: 'var(--chart-uplift)' }"
              stroke-width="1"
              stroke-opacity="0.55"
            />
            <circle
              :cx="ex(mx)"
              :cy="ey(netAt(mx))"
              r="4"
              stroke="#fff"
              stroke-width="1.5"
              :style="{ fill: 'var(--chart-uplift)' }"
            />
          </template>
          <text
            :x="EPAD.l - 5"
            :y="EPAD.t + 8"
            text-anchor="end"
            class="fill-current text-ink-gray-6"
            font-size="10"
          >
            {{ fUSD(eqYMax) }}
          </text>
          <text
            :x="EPAD.l - 5"
            :y="EH - EPAD.b"
            text-anchor="end"
            class="fill-current text-ink-gray-6"
            font-size="10"
          >
            $0
          </text>
          <text
            v-for="(t, i) in eqXTicks"
            :key="i"
            :x="ex(t)"
            :y="EH - 8"
            :text-anchor="i === 0 ? 'start' : i === eqXTicks.length - 1 ? 'end' : 'middle'"
            class="fill-current text-ink-gray-6"
            font-size="10"
          >
            {{ fUSD(t) }}
          </text>
        </svg>
        <p class="text-p-xs mt-1 text-ink-gray-6">
          Below {{ fUSD(breakeven) }} exit, equity is underwater (net $0) — tokens still carry
          value. Base-case {{ (sb.retention * 100).toFixed(0) }}% retained after dilution.
        </p>
      </div>
      <div>
        <div class="text-xs text-ink-gray-7 mb-2">
          Tokens · value vs <Term k="tgeFdv">TGE FDV</Term>
          <span class="text-ink-gray-6">· $M</span>
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
