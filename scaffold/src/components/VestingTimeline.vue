<script setup lang="ts">
// Vesting timeline (custom SVG, 0–48 mo) — COM-149: the two instruments render as VISIBLY
// DIFFERENT curves (spec v2 Δ5). Equity = the Cert v3 annual STAIRCASE (stacked base + uplift
// areas). Token = the RTA monthly RAMP, drawn twice: a dashed accrual line (vesting) and a
// filled distributable area that is ZERO before the 24-month qualifying gate. All vesting
// fractions come from the engine (vestedFrac / distributableFrac over the effective rta grant);
// dollar scales are engine exports — no money math here beyond sanctioned netEqAt mirrors.
import { computed } from "vue";
import { useStudio } from "../store";
import {
  vestedFrac,
  distributableFrac,
  effectiveGrants,
  exerciseCheck,
  fDate,
  monthsBetween,
  todayISO,
  clamp,
} from "../engine";
const props = defineProps<{ c: any; sel: any }>();
const { store } = useStudio();

const model = computed(() => {
  const c = props.c,
    sel = props.sel,
    p = store.S.plan,
    sbv = c.base;
  const Vb = sbv.exitVal;
  const baseFull = sbv.netEqAt(c.baseEq, Vb);
  const upliftFull = Math.max(0, sbv.netEqAt(c.eqPct, Vb) - baseFull);
  // the engine's token leg (follows the COM-152 pre-TGE fallback when toggled)
  const tokenFull = sbv.token ?? c.tkPct * sbv.fdv;
  const startISO = sel.startDate || todayISO();
  const upliftStart = clamp(sel.upliftStartMonth ?? 6, 0, 48);
  const nowOffset = clamp(monthsBetween(startISO, todayISO()), 0, 48);
  // the package's rta grant drives the token curve via the ENGINE's gate (service = the
  // engagement clock = this chart's x axis)
  const grants = effectiveGrants(sel, p, store.S.tiers, store.S.objectives);
  const rta = grants.find((g) => g.instrument === "rta") || null;
  const firstOption = grants.find((g) => g.instrument === "option") || null;
  const backstop = firstOption ? exerciseCheck(firstOption, todayISO()).backstop : null;
  const cd: any[] = [];
  for (let m = 0; m <= 48; m++) {
    const evB = vestedFrac(m, p.equityVestYears, p.equityCliff);
    const evU = vestedFrac(m - upliftStart, p.equityVestYears, p.equityCliff);
    const tvAccrued = rta ? distributableFrac(rta, m, 24) : 0; // the curve itself (gate open)
    const tvDistributable = rta ? distributableFrac(rta, m, m) : 0; // gated by service-to-date
    cd.push({
      m,
      base: evB * baseFull,
      uplift: evU * upliftFull,
      tokAccrued: tvAccrued * tokenFull,
      tokDist: tvDistributable * tokenFull,
    });
  }
  return {
    cd,
    nowOffset,
    backstop,
    tokenAsEquity: !!sbv.tokenAsEquity,
    max: Math.max(1, baseFull + upliftFull + tokenFull),
  };
});
const W = 560,
  H = 210,
  padL = 36,
  padR = 10,
  padT = 10,
  padB = 22;
const x = (m: number) => padL + (m / 48) * (W - padL - padR);
const y = (v: number) => H - padB - (v / model.value.max) * (H - padT - padB);
// stacked step areas: token-distributable at the bottom, then base equity, then uplift
function stackPath(key: "tokDist" | "base" | "uplift") {
  const cd = model.value.cd;
  const cum = (d: any) =>
    key === "tokDist"
      ? d.tokDist
      : key === "base"
        ? d.tokDist + d.base
        : d.tokDist + d.base + d.uplift;
  const below = (d: any) =>
    key === "tokDist" ? 0 : key === "base" ? d.tokDist : d.tokDist + d.base;
  let top = `M ${x(0)} ${y(cum(cd[0]))}`;
  for (let k = 1; k < cd.length; k++)
    top += ` L ${x(cd[k].m)} ${y(cum(cd[k - 1]))} L ${x(cd[k].m)} ${y(cum(cd[k]))}`;
  let bot = "";
  for (let k = cd.length - 1; k >= 1; k--)
    bot += ` L ${x(cd[k].m)} ${y(below(cd[k]))} L ${x(cd[k].m)} ${y(below(cd[k - 1]))}`;
  bot += ` L ${x(0)} ${y(below(cd[0]))} Z`;
  return top + bot;
}
// the token ACCRUAL ramp as a line (monthly steps are 1-month wide — a polyline reads honestly
// at this resolution and stays visually distinct from the equity staircase's annual treads)
const accrualPath = computed(() => {
  const cd = model.value.cd;
  let d = `M ${x(0)} ${y(cd[0].tokAccrued)}`;
  for (let k = 1; k < cd.length; k++) d += ` L ${x(cd[k].m)} ${y(cd[k].tokAccrued)}`;
  return d;
});
const refLines = computed(() => {
  const out: any[] = [
    { m: 12, label: "cliff", color: "" },
    { m: 24, label: "qualifying · Bad-Leaver", color: "var(--chart-warning)" },
  ];
  if (model.value.nowOffset > 0 && model.value.nowOffset < 48)
    out.push({ m: model.value.nowOffset, label: "today", color: "" });
  return out;
});
</script>

<template>
  <!-- COM-88: static read-out — the section label carries it; no frame -->
  <div>
    <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
      <div class="section-label">Vested value over time · base case, net of strike</div>
      <div class="text-xs text-ink-gray-6">
        Uplift earned · month {{ sel.upliftStartMonth ?? 6 }}
      </div>
    </div>
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="w-full"
      style="height: 210px"
      role="img"
      aria-label="Vested value over 48 months. Equity vests as an annual staircase: 25 percent at the 12-month cliff, then 25 percent at each anniversary. Tokens vest monthly after the cliff, but nothing is distributable before 24 months of service — the dashed line shows token vesting accrue while the filled area stays at zero until the qualifying gate."
    >
      <line
        :x1="padL"
        :y1="H - padB"
        :x2="W - padR"
        :y2="H - padB"
        class="stroke-current text-ink-gray-3"
        stroke-width="1"
      />
      <!-- token DISTRIBUTABLE (filled — zero before the month-24 gate) -->
      <path
        :d="stackPath('tokDist')"
        :style="{ fill: 'var(--chart-customer)', fillOpacity: 0.25 }"
      />
      <!-- equity staircase: base + uplift (the annual-tread non-color channel) -->
      <path :d="stackPath('base')" :style="{ fill: 'var(--chart-capital)', fillOpacity: 0.3 }" />
      <path :d="stackPath('uplift')" :style="{ fill: 'var(--chart-uplift)', fillOpacity: 0.3 }" />
      <!-- token ACCRUAL ramp (dashed line — vesting that is not yet distributable) -->
      <path
        :d="accrualPath"
        fill="none"
        :style="{ stroke: 'var(--chart-customer)' }"
        stroke-width="1.5"
        stroke-dasharray="5 3"
      />
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
          :text-anchor="r.m > 36 ? 'end' : 'middle'"
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
        ><span
          class="inline-block size-2 rounded-full"
          style="background: var(--chart-capital)"
        />Base equity (annual staircase)</span
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
        />Tokens distributable</span
      >
      <span class="flex items-center gap-1"
        ><svg width="18" height="6" aria-hidden="true">
          <line
            x1="0"
            y1="3"
            x2="18"
            y2="3"
            style="stroke: var(--chart-customer)"
            stroke-width="1.5"
            stroke-dasharray="5 3"
          /></svg
        >Token vesting (accruing)</span
      >
    </div>
    <p class="text-p-xs mt-1 text-ink-gray-6">
      Equity vests 25%/yr after a 1-year cliff (annual instalments, not monthly). Tokens vest 25% at
      the cliff then 2.08%/month to year 4 — but nothing is distributable before 24 months of
      Continuous Service (the qualifying gate). Voluntary exit before the 2-year Bad-Leaver line
      forfeits even vested options.
      <template v-if="model.backstop"
        >If no Exit Event by {{ fDate(model.backstop.anniversary9ISO) }}, a ≥90-day exercise window
        must open, closing by {{ fDate(model.backstop.lastCloseISO) }} (Option Certificate
        3.6).</template
      >
      No change-of-control acceleration under the plan (v9); an acquirer may roll over awards.
      <template v-if="model.tokenAsEquity"
        >This scenario models a liquidity event before TGE — token value re-states 1:1 as
        equity.</template
      >
    </p>
  </div>
</template>
