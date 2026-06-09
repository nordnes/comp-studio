<script setup lang="ts">
// Vesting timeline (custom SVG stacked step-area, 0–48 mo). Base equity + uplift + tokens, net of strike,
// with cliff / Bad-Leaver / TGE / today reference lines. Carries the legal vesting caveats in the caption.
import { computed } from "vue";
import { useStudio } from "../store";
import { vestedFrac, monthsBetween, todayISO, clamp } from "../engine";
import NumIn from "./NumIn.vue";
const props = defineProps<{ c: any; sel: any }>();
const { store, setPath } = useStudio();
const idx = computed(() => store.S.advisors.findIndex((a: any) => a.id === props.sel.id));

const model = computed(() => {
  const c = props.c,
    sel = props.sel,
    p = store.S.plan,
    sbv = c.base;
  const Vb = sbv.exitVal;
  const baseFull = sbv.netEqAt(c.baseEq, Vb);
  const upliftFull = Math.max(0, sbv.netEqAt(c.eqPct, Vb) - baseFull);
  const tokenFull = c.tkPct * sbv.fdv;
  const startISO = sel.startDate || todayISO();
  const upliftStart = clamp(sel.upliftStartMonth ?? 6, 0, 48);
  const tgeOffset = clamp(monthsBetween(startISO, p.tgeDate), 0, 48);
  const nowOffset = clamp(monthsBetween(startISO, todayISO()), 0, 48);
  const cd: any[] = [];
  for (let m = 0; m <= 48; m++) {
    const evB = vestedFrac(m, p.equityVestYears, p.equityCliff);
    const evU = vestedFrac(m - upliftStart, p.equityVestYears, p.equityCliff);
    const tv = m >= tgeOffset ? vestedFrac(m - tgeOffset, p.tokenVestYears, p.tokenCliff) : 0;
    cd.push({ m, tok: tv * tokenFull, base: evB * baseFull, uplift: evU * upliftFull });
  }
  return { cd, tgeOffset, nowOffset, max: Math.max(1, baseFull + upliftFull + tokenFull) };
});
const W = 560,
  H = 210,
  padL = 36,
  padR = 10,
  padT = 10,
  padB = 22;
const x = (m: number) => padL + (m / 48) * (W - padL - padR);
const y = (v: number) => H - padB - (v / model.value.max) * (H - padT - padB);
function stackPath(key: "tok" | "base" | "uplift") {
  const cd = model.value.cd;
  const cum = (d: any) =>
    key === "tok" ? d.tok : key === "base" ? d.tok + d.base : d.tok + d.base + d.uplift;
  const below = (d: any) => (key === "tok" ? 0 : key === "base" ? d.tok : d.tok + d.base);
  let top = `M ${x(0)} ${y(cum(cd[0]))}`;
  for (let k = 1; k < cd.length; k++)
    top += ` L ${x(cd[k].m)} ${y(cum(cd[k - 1]))} L ${x(cd[k].m)} ${y(cum(cd[k]))}`;
  let bot = "";
  for (let k = cd.length - 1; k >= 1; k--)
    bot += ` L ${x(cd[k].m)} ${y(below(cd[k]))} L ${x(cd[k].m)} ${y(below(cd[k - 1]))}`;
  bot += ` L ${x(0)} ${y(below(cd[0]))} Z`;
  return top + bot;
}
const refLines = computed(() => {
  const out = [
    { m: 12, label: "cliff", color: "" },
    { m: 24, label: "Bad-Leaver", color: "var(--chart-warning)" },
  ];
  if (model.value.tgeOffset > 0 && model.value.tgeOffset < 48)
    out.push({ m: model.value.tgeOffset, label: "TGE", color: "var(--chart-customer)" });
  if (model.value.nowOffset > 0 && model.value.nowOffset < 48)
    out.push({ m: model.value.nowOffset, label: "today", color: "" });
  return out;
});
</script>

<template>
  <div class="bg-surface-white rounded border border-outline-gray-1 p-5">
    <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
      <div class="text-sm text-ink-gray-6">Vested value over time · base case, net of strike</div>
      <label class="flex items-center gap-2 text-xs text-ink-gray-6"
        >Uplift earned at (month)
        <span class="w-12"
          ><NumIn
            :model-value="sel.upliftStartMonth ?? 6"
            :min="0"
            :max="48"
            aria-label="Uplift earn month"
            @update:model-value="
              (v: number) => setPath(['advisors', idx, 'upliftStartMonth'], v)
            " /></span
      ></label>
    </div>
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="w-full"
      style="height: 210px"
      role="img"
      aria-label="Vested value over 48 months: base equity, uplift, and tokens, net of strike. Cliff at 12 months, Bad-Leaver line at 24 months."
    >
      <line
        :x1="padL"
        :y1="H - padB"
        :x2="W - padR"
        :y2="H - padB"
        class="stroke-current text-ink-gray-3"
        stroke-width="1"
      />
      <path :d="stackPath('tok')" :style="{ fill: 'var(--chart-customer)', fillOpacity: 0.25 }" />
      <path :d="stackPath('base')" :style="{ fill: 'var(--chart-capital)', fillOpacity: 0.3 }" />
      <path :d="stackPath('uplift')" :style="{ fill: 'var(--chart-uplift)', fillOpacity: 0.3 }" />
      <template v-for="r in refLines" :key="r.label">
        <line
          :x1="x(r.m)"
          :y1="padT"
          :x2="x(r.m)"
          :y2="H - padB"
          :class="r.color ? '' : 'stroke-current text-ink-gray-4'"
          :style="r.color ? { stroke: r.color } : {}"
          stroke-dasharray="2 4"
        />
        <text
          :x="x(r.m)"
          :y="padT + 6"
          text-anchor="middle"
          font-size="11"
          :class="r.color ? '' : 'fill-current text-ink-gray-6'"
          :style="r.color ? { fill: r.color } : {}"
        >
          {{ r.label }}
        </text>
      </template>
      <text :x="padL" :y="H - 6" font-size="11" class="fill-current text-ink-gray-6">M0</text>
      <text
        :x="W - padR"
        :y="H - 6"
        text-anchor="end"
        font-size="11"
        class="fill-current text-ink-gray-6"
      >
        M48
      </text>
    </svg>
    <div class="flex gap-3 text-xs mt-2 text-ink-gray-6 flex-wrap">
      <span class="flex items-center gap-1"
        ><span class="inline-block size-2 rounded-full" style="background: var(--chart-capital)" />Base
        equity</span
      >
      <span class="flex items-center gap-1"
        ><span
          class="inline-block size-2 rounded-full"
          style="background: var(--chart-uplift)"
        />Uplift</span
      >
      <span class="flex items-center gap-1"
        ><span
          class="inline-block size-2 rounded-full"
          style="background: var(--chart-customer)"
        />Tokens</span
      >
    </div>
    <p class="text-p-xs mt-1 text-ink-gray-6">
      Equity vests 25%/yr after a 1-year cliff; uplift vests from the chosen month; tokens from TGE.
      Voluntary exit before the 2-year Bad-Leaver line forfeits even vested options. No exit by year
      9 → a ≥90-day exercise window opens (backstop). Change-of-control acceleration is at Board
      discretion, not guaranteed.
    </p>
  </div>
</template>
