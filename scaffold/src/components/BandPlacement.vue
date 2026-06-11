<script setup lang="ts">
// COM-179 (M13): the band-placement roster chart — every advisor a dot on ONE band bar (the
// Pave/Figures compa pattern). Carl's generosity review is a roster-level question; outliers
// and internal inconsistency read in one glance instead of six text-row lookups. Pure render
// over generosityCheck rows (the compa ratio IS the placement: 1.0 = the $50K median); the
// in-line band 0.8–1.2 mirrors the engine's own ▲/◆/▼ thresholds.
import { computed } from "vue";
import { fUSD } from "../engine";
const props = defineProps<{ rows: any[]; anchorUSD: number }>();

const W = 720,
  ROW = 26,
  padL = 96,
  padR = 56,
  padT = 8,
  padB = 22;
const H = computed(() => padT + props.rows.length * ROW + padB);
// the x scale spans 0 → max(2.0, the largest compa × 1.15) so the in-line band sits mid-chart
const maxCompa = computed(() => Math.max(2, ...props.rows.map((r: any) => r.compa)) * 1.15);
const x = (compa: number) =>
  padL + (Math.min(compa, maxCompa.value) / maxCompa.value) * (W - padL - padR);
const DOT_COLOR: Record<string, string> = {
  above: "var(--chart-warning)",
  inline: "var(--chart-uplift)",
  below: "var(--chart-cash)",
};
</script>

<template>
  <svg
    :viewBox="`0 0 ${W} ${H}`"
    class="w-full"
    :style="{ height: `${H}px` }"
    role="img"
    :aria-label="`Band placement: each advisor's annual package value as a ratio of the ${fUSD(anchorUSD)} advisory median. The 0.8 to 1.2 band is in line; ${rows.filter((r) => r.status === 'above').length} above, ${rows.filter((r) => r.status === 'below').length} below.`"
  >
    <!-- the in-line band (0.8–1.2 — the engine's own ▲/◆/▼ thresholds) -->
    <rect
      :x="x(0.8)"
      :y="padT"
      :width="x(1.2) - x(0.8)"
      :height="H - padT - padB"
      :style="{ fill: 'var(--chart-uplift)', fillOpacity: 0.08 }"
    />
    <line
      :x1="x(1)"
      :y1="padT"
      :x2="x(1)"
      :y2="H - padB"
      class="stroke-current text-ink-gray-4"
      stroke-width="1"
      stroke-dasharray="2 4"
    />
    <text
      :x="x(1)"
      :y="H - 8"
      text-anchor="middle"
      font-size="11"
      class="fill-current text-ink-gray-6"
    >
      {{ fUSD(anchorUSD) }}/yr median
    </text>
    <template v-for="(r, i) in rows" :key="r.advisorId">
      <line
        :x1="padL"
        :y1="padT + i * ROW + ROW / 2"
        :x2="W - padR"
        :y2="padT + i * ROW + ROW / 2"
        class="stroke-current text-ink-gray-2"
        stroke-width="1"
      />
      <text
        :x="padL - 6"
        :y="padT + i * ROW + ROW / 2 + 4"
        text-anchor="end"
        font-size="11"
        class="fill-current text-ink-gray-7"
      >
        {{ r.name.split(" ")[0] }}
      </text>
      <circle
        :cx="x(r.compa)"
        :cy="padT + i * ROW + ROW / 2"
        r="5"
        stroke="#fff"
        stroke-width="1.5"
        :style="{ fill: DOT_COLOR[r.status] || 'var(--chart-cash)' }"
      />
      <text
        :x="W - padR + 6"
        :y="padT + i * ROW + ROW / 2 + 4"
        font-size="11"
        class="fill-current text-ink-gray-6 tabular-nums"
      >
        {{ r.compa.toFixed(2) }}
      </text>
    </template>
  </svg>
</template>
