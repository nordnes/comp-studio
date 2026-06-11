<script setup lang="ts">
// Upside curve: equity net-vs-exit (custom SVG area with a breakeven cue) + tokens-vs-FDV
// (custom SVG line since the COM-28 residual — frappe-charts can't draw the $1B caution x-band
// or scenario/selected markers, the same limitation that moved the equity half in COM-57).
// Net of strike; all values from the engine's per-scenario exports (strikeBasis / retention /
// eqPct / tkPct / fdv). Both halves carry per-scenario markers; ChipRow presets were superseded
// by the COM-47 ExitSlider (equity) + the scenario markers (token) — flagged in the PR.
import { computed } from "vue";
import { useStudio } from "../store";
import { roundLabel, fUSD, BENCH, safeDiv } from "../engine";
import Term from "./Term.vue";
import Panel from "./Panel.vue";
const props = defineProps<{ c: any; markerExit?: number | null }>();
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

// --- tokens vs FDV: custom SVG (COM-28 residual — frappe-charts can't draw the $1B caution
// x-band, scenario markers or a selected marker; the equity half set the precedent in COM-57).
// Same sanctioned mirror as the old frappe-charts build: token value = c.tkPct × FDV.
const topFdv = computed(() =>
  Math.max(
    BENCH.fdvCaution * 1.5,
    Math.max(sb.value.fdv, ...props.c.scen.map((s: any) => s.fdv)) * 1.2,
  ),
);
const tkValAt = (F: number) => props.c.tkPct * F;
const tkYMax = computed(() => Math.max(1, tkValAt(topFdv.value)));
const tx = (F: number) =>
  EPAD.l + (Math.min(F, topFdv.value) / topFdv.value) * (EW - EPAD.l - EPAD.r);
const ty = (v: number) =>
  EH - EPAD.b - (Math.min(v, tkYMax.value) / tkYMax.value) * (EH - EPAD.t - EPAD.b);
const tkLine = computed(
  () => `M ${tx(0)} ${ty(0)} L ${tx(topFdv.value)} ${ty(tkValAt(topFdv.value))}`,
);
const tkXTicks = computed(() => [0, topFdv.value / 2, topFdv.value]);
// the per-scenario markers (both halves) + the active-case marker on the token half;
// labels alternate above/below the line by index parity to dodge collisions
const tkScenMarks = computed(() =>
  props.c.scen.map((s: any, i: number) => ({
    key: s.key,
    label: s.label,
    x: tx(s.fdv),
    y: ty(tkValAt(Math.min(s.fdv, topFdv.value))),
    dy: i % 2 ? 14 : -8,
  })),
);
const eqScenMarks = computed(() =>
  props.c.scen.map((s: any, i: number) => ({
    key: s.key,
    label: s.label,
    x: ex(Math.min(s.exitVal, topEq.value)),
    y: ey(netAt(Math.min(s.exitVal, topEq.value))),
    dy: i % 2 ? 14 : -8,
  })),
);
</script>

<template>
  <Panel>
    <div class="section-label mb-3">
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
          <!-- COM-28: per-scenario markers on the equity curve -->
          <template v-for="m in eqScenMarks" :key="m.key">
            <circle :cx="m.x" :cy="m.y" r="3" :style="{ fill: 'var(--chart-capital)' }" />
            <text
              :x="m.x"
              :y="m.y + m.dy"
              text-anchor="middle"
              font-size="9"
              class="fill-current text-ink-gray-6"
            >
              {{ m.label }}
            </text>
          </template>
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
        <svg
          :viewBox="`0 0 ${EW} ${EH}`"
          class="w-full text-ink-gray-9"
          style="height: 190px"
          role="img"
          :aria-label="`Token value vs TGE fully-diluted valuation, rising linearly from zero. Scenario markers at ${props.c.scen.map((s: any) => `${s.label} ${fUSD(s.fdv)}`).join(', ')}.${plan.showBenchmarks ? ' FDV above $1 billion is shaded as a caution band — 2025 launches above it mostly traded down.' : ''}`"
        >
          <!-- COM-28: the $1B caution band (x-region) + labelled line — benchmark info, so it
               follows the showBenchmarks gate like the caption and the shell footer copy -->
          <template v-if="plan.showBenchmarks">
            <rect
              :x="tx(BENCH.fdvCaution)"
              :y="EPAD.t"
              :width="Math.max(0, tx(topFdv) - tx(BENCH.fdvCaution))"
              :height="EH - EPAD.t - EPAD.b"
              :style="{ fill: 'var(--chart-warning)', fillOpacity: 0.08 }"
            />
            <line
              :x1="tx(BENCH.fdvCaution)"
              :y1="EPAD.t"
              :x2="tx(BENCH.fdvCaution)"
              :y2="EH - EPAD.b"
              :style="{ stroke: 'var(--chart-warning)' }"
              stroke-width="1.5"
              stroke-dasharray="3 2"
            />
            <text
              :x="tx(BENCH.fdvCaution) + 4"
              :y="EPAD.t + 9"
              font-size="10"
              :style="{ fill: 'var(--chart-warning)' }"
            >
              $1B caution
            </text>
          </template>
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
          <path
            :d="tkLine"
            fill="none"
            :style="{ stroke: 'var(--chart-customer)', strokeWidth: 1.75 }"
          />
          <!-- per-scenario markers + the active-case marker -->
          <template v-for="m in tkScenMarks" :key="m.key">
            <circle :cx="m.x" :cy="m.y" r="3" :style="{ fill: 'var(--chart-customer)' }" />
            <text
              :x="m.x"
              :y="m.y + m.dy"
              text-anchor="middle"
              font-size="9"
              class="fill-current text-ink-gray-6"
            >
              {{ m.label }}
            </text>
          </template>
          <circle
            :cx="tx(sb.fdv)"
            :cy="ty(tkValAt(Math.min(sb.fdv, topFdv)))"
            r="4"
            stroke="#fff"
            stroke-width="1.5"
            :style="{ fill: 'var(--chart-uplift)' }"
          />
          <text
            :x="EPAD.l - 5"
            :y="EPAD.t + 8"
            text-anchor="end"
            class="fill-current text-ink-gray-6"
            font-size="10"
          >
            {{ fUSD(tkYMax) }}
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
            v-for="(t, i) in tkXTicks"
            :key="`xt-${i}`"
            :x="tx(t)"
            :y="EH - 8"
            :text-anchor="i === 0 ? 'start' : i === tkXTicks.length - 1 ? 'end' : 'middle'"
            class="fill-current text-ink-gray-6"
            font-size="10"
          >
            {{ fUSD(t) }}
          </text>
        </svg>
        <p class="text-p-xs mt-1 text-ink-gray-6">
          TGE FDV = multiple × {{ roundLabel(plan, plan.tgeAnchor) }} post-money. The dot marks this
          case's FDV.<span v-if="plan.showBenchmarks">
            2025 launches above $1B FDV mostly traded down.</span
          >
        </p>
      </div>
    </div>
  </Panel>
</template>
