<script setup lang="ts">
// COM-157 (F15): the Trajectory — the headline spec-v2 surface. A horizontal timeline over the
// engagement: the cumulative VESTED net value as a BAND (floor → base → ceiling, engine
// trajectoryBand) with the dated events lane above it (engine trajectoryEvents). Complements —
// never replaces — GrowthWaterfall and UpsideCurve. Custom SVG; zero money math in the view.
import { computed } from "vue";
import { useStudio } from "../store";
import { trajectoryBand, trajectoryEvents, nextReviewDue, fUSD, fDate } from "../engine";
const props = defineProps<{ sel: any; c: any }>();
const { store } = useStudio();

const band = computed(() =>
  trajectoryBand(props.sel, store.S.plan, store.S.tiers, store.S.objectives),
);
const events = computed(() =>
  trajectoryEvents(props.sel, store.S.plan, store.S.tiers, store.S.objectives),
);
const months = computed(() => band.value.length - 1);
const inWindow = computed(() => events.value.filter((e) => e.m >= 0 && e.m <= months.value));
const beyond = computed(() => events.value.filter((e) => e.m > months.value));
const due = computed(() => nextReviewDue(props.sel, store.S.plan));
// Δ2: the Series-A structural review ("trainer wheels" formalisation) flags when the plan
// carries a seriesA milestone — presentation flag only.
const seriesAFlag = computed(() => store.S.plan.milestones.some((m: any) => m.id === "seriesA"));

const W = 720,
  H = 280,
  padL = 46,
  padR = 12,
  padT = 76, // headroom for up to four stacked label rows
  padB = 24;
const x = (m: number) => padL + (m / Math.max(1, months.value)) * (W - padL - padR);
const maxV = computed(() => Math.max(1, band.value[band.value.length - 1]?.ceil || 1));
const y = (v: number) => H - padB - (v / maxV.value) * (H - padT - padB);
function areaPath(loKey: "floor" | "base", hiKey: "base" | "ceil") {
  const cd = band.value;
  let d = `M ${x(cd[0].m)} ${y(cd[0][hiKey])}`;
  for (let k = 1; k < cd.length; k++) d += ` L ${x(cd[k].m)} ${y(cd[k][hiKey])}`;
  for (let k = cd.length - 1; k >= 0; k--) d += ` L ${x(cd[k].m)} ${y(cd[k][loKey])}`;
  return d + " Z";
}
const baseLine = computed(() => {
  const cd = band.value;
  let d = `M ${x(cd[0].m)} ${y(cd[0].base)}`;
  for (let k = 1; k < cd.length; k++) d += ` L ${x(cd[k].m)} ${y(cd[k].base)}`;
  return d;
});
// event styling: a quiet lane — color only where the established tokens already speak
const EVENT_COLOR: Record<string, string> = {
  qualifying: "var(--chart-warning)",
  review: "var(--chart-capital)",
  "review-due": "var(--chart-capital)",
  tge: "var(--chart-customer)",
  backstop: "var(--chart-warning)",
  round: "var(--chart-uplift)",
};
// collision-aware label rows: events sharing an x-neighbourhood stack instead of overprinting
// (three events can land on month 12 — cliff, TGE, and a cadence review)
const laidOut = computed(() => {
  const minGapPx = 92;
  const rows: number[] = []; // the rightmost label edge per row
  return inWindow.value.map((e) => {
    const px = x(e.m);
    let row = 0;
    while (row < rows.length && px - rows[row] < minGapPx) row++;
    rows[row] = px;
    return { ...e, row };
  });
});
const endVals = computed(() => band.value[band.value.length - 1] || { floor: 0, base: 0, ceil: 0 });
</script>

<template>
  <!-- COM-88: static read-out — the section label carries it; no frame -->
  <div>
    <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
      <div class="section-label">Trajectory · vested value over the engagement, net of strike</div>
      <div class="text-xs text-ink-gray-6 tabular-nums">
        Next review {{ fDate(due.dueISO) }}
        <span v-if="due.overdue" class="text-ink-red-3">· overdue</span>
      </div>
    </div>
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="w-full"
      style="height: 280px"
      role="img"
      :aria-label="`Trajectory over ${months} months: cumulative vested net value grows from zero to ${fUSD(endVals.base)} on the base path, between a ${fUSD(endVals.floor)} floor and a ${fUSD(endVals.ceil)} ceiling. Events marked: vesting cliff, annual tranches, the 24-month qualifying gate, reviews, TGE and today.`"
    >
      <line
        :x1="padL"
        :y1="H - padB"
        :x2="W - padR"
        :y2="H - padB"
        class="stroke-current text-ink-gray-3"
        stroke-width="1"
      />
      <!-- the band: floor→base (earned) and base→ceiling (potential) -->
      <path
        :d="areaPath('floor', 'base')"
        :style="{ fill: 'var(--chart-capital)', fillOpacity: 0.3 }"
      />
      <path
        :d="areaPath('base', 'ceil')"
        :style="{ fill: 'var(--chart-uplift)', fillOpacity: 0.18 }"
      />
      <path
        :d="baseLine"
        fill="none"
        :style="{ stroke: 'var(--chart-capital)' }"
        stroke-width="1.5"
      />
      <!-- events lane -->
      <template v-for="e in laidOut" :key="e.id">
        <line
          :x1="x(e.m)"
          :y1="padT - 26"
          :x2="x(e.m)"
          :y2="H - padB"
          :class="EVENT_COLOR[e.kind] ? '' : 'stroke-current text-ink-gray-4'"
          :style="EVENT_COLOR[e.kind] ? { stroke: EVENT_COLOR[e.kind] } : {}"
          stroke-dasharray="2 4"
        />
        <text
          :x="x(e.m)"
          :y="padT - 30 - e.row * 13"
          :text-anchor="e.m > months * 0.85 ? 'end' : e.m < months * 0.08 ? 'start' : 'middle'"
          font-size="11"
          :class="EVENT_COLOR[e.kind] ? '' : 'fill-current text-ink-gray-6'"
          :style="EVENT_COLOR[e.kind] ? { fill: EVENT_COLOR[e.kind] } : {}"
        >
          {{ e.label }}
        </text>
      </template>
      <!-- y scale: the end values, right-aligned at the edge -->
      <text
        :x="padL - 4"
        :y="y(0) + 4"
        text-anchor="end"
        font-size="11"
        class="fill-current text-ink-gray-6"
      >
        $0
      </text>
      <text
        :x="padL - 4"
        :y="y(maxV) + 10"
        text-anchor="end"
        font-size="11"
        class="fill-current text-ink-gray-6"
      >
        {{ fUSD(maxV) }}
      </text>
      <text :x="padL" :y="H - 8" font-size="11" class="fill-current text-ink-gray-6">M0</text>
      <text
        :x="W - padR"
        :y="H - 8"
        text-anchor="end"
        font-size="11"
        class="fill-current text-ink-gray-6"
      >
        M{{ months }}
      </text>
    </svg>
    <div class="flex gap-3 text-xs mt-2 text-ink-gray-6 flex-wrap tabular-nums">
      <span class="flex items-center gap-1"
        ><span
          class="inline-block size-2 rounded-full"
          style="background: var(--chart-capital)"
        />Earned path · {{ fUSD(endVals.floor) }} floor → {{ fUSD(endVals.base) }} base</span
      >
      <span class="flex items-center gap-1"
        ><span
          class="inline-block size-2 rounded-full"
          style="background: var(--chart-uplift)"
        />Ceiling {{ fUSD(endVals.ceil) }}</span
      >
    </div>
    <p class="text-p-xs mt-1 text-ink-gray-6">
      The band is the package's cumulative vested value under the selected scenario: floor = the
      uniform base grant, base = earned performance, ceiling = every objective at maximum. Closed
      rounds mark the timeline (new grants price there); open rounds stay on the dilution path until
      closed in Configure.
      <template v-if="seriesAFlag"
        >At Series A the advisory board formalises — a structural review of every package is
        expected (Δ2).</template
      >
      <template v-for="e in beyond" :key="e.id">{{
        ` ${e.label} falls beyond this window (${fDate(e.dateISO)}).`
      }}</template>
    </p>
  </div>
</template>
