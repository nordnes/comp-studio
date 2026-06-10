<script setup lang="ts">
// Board (Section III) — roster, scenario ranges, pool, company cost, valuation staircase (frappe-charts
// grouped bar, Robin's call) and potential scatter (custom SVG — frappe-charts has no scatter in 1.6.2).
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { Button, Badge, Dropdown, TabButtons } from "frappe-ui";
import { useStudio } from "../store";
import { useEditor } from "../composables/useEditor";
import {
  fUSD,
  fPct,
  walkScenario,
  baseScenKey,
  scenKeys,
  tgeFdvFor,
  roundLabel,
  fMult,
  BENCH,
} from "../engine";
import { TIER_COLOR, chartHex, shortName } from "../constants";
import PageHeader from "../components/PageHeader.vue";
import PoolAllocation from "../components/PoolAllocation.vue";
import ContextStrip from "../components/ContextStrip.vue";
import FootballField from "../components/FootballField.vue";
import FrappeChart from "../components/FrappeChart.vue";
import Term from "../components/Term.vue";
import EmptyState from "../components/EmptyState.vue";
import RosterTable from "../components/roster/RosterTable.vue";
import RosterRow from "../components/roster/RosterRow.vue";
import RosterIdentity from "../components/roster/RosterIdentity.vue";
import TierBadge from "../components/roster/TierBadge.vue";
import Panel from "../components/Panel.vue";

const { store, board, select, addAdvisor, delAdvisor, setPath } = useStudio();
const { openEditor } = useEditor();
const router = useRouter();
const S = computed(() => store.S);

function open(id: string) {
  select(id);
  router.push("/advisors");
}
// COM-75: per-row kebab — change tier in-context (writes via setPath; switches to tier mode so it
// takes effect), open the package, or remove. Shared shape with Overview. Engine untouched.
function rowMenu(a: any) {
  const idx = S.value.advisors.findIndex((x: any) => x.id === a.id);
  return [
    {
      label: "Change tier",
      icon: "lucide-layers",
      submenu: S.value.tiers.map((t: any, ti: number) => ({
        label: `${t.name} · ${fMult(t.mult)}`,
        icon: a.mode !== "value" && a.tier === ti ? "lucide-check" : null,
        onClick: () => {
          setPath(["advisors", idx, "mode"], "tier");
          setPath(["advisors", idx, "tier"], ti);
        },
      })),
    },
    {
      label: "Edit package",
      icon: "lucide-pen",
      onClick: () => {
        select(a.id);
        openEditor();
      },
    },
    { label: "Remove", icon: "lucide-trash-2", theme: "red", onClick: () => delAdvisor(a.id) },
  ];
}
function boardPack() {
  window.print();
}

// COM-85: Board-LOCAL scenario projection — a presentation ref, NOT a store mutation, so the
// global Case lens and every other route stay untouched. '' = follow the board's base case.
const boardCase = ref("");
const bc = computed(() =>
  boardCase.value && S.value.plan.scenarios[boardCase.value]
    ? boardCase.value
    : baseScenKey(S.value.plan),
);
const caseButtons = computed(() =>
  scenKeys(S.value.plan).map((k) => ({
    label: S.value.plan.scenarios[k].label || k,
    value: k,
  })),
);
// The chosen scenario row for an advisor (falls back to the engine's base case).
const sFor = (c: any) => c.scen.find((x: any) => x.key === bc.value) || c.base;
// Per-scenario ceiling has no engine export — mirror engine.ts baseCaseCeil exactly
// (netEqAt(eqPctCeil, exitVal) + tkPctCeil × fdv) over already-exported fields (PD2 §2 rule 3).
const ceilFor = (c: any) => {
  const s = sFor(c);
  return s.netEqAt(c.eqPctCeil, s.exitVal) + c.tkPctCeil * s.fdv;
};

// --- valuation staircase (grouped bar: Raiku vs market median per stage) ---
const stair = computed(() => {
  const w = walkScenario(S.value.plan, baseScenKey(S.value.plan));
  const labels = w.steps.map((s) => s.label);
  // plot in $M — frappe-charts has no y-axis tick formatter, so a raw-dollar axis reads "100000000".
  const datasets: any[] = [{ name: "Raiku", values: w.steps.map((s) => Math.round(s.post / 1e6)) }];
  if (S.value.plan.showBenchmarks)
    datasets.push({
      name: "Median",
      values: w.steps.map((s) => Math.round((BENCH.postMoney[s.id] || 0) / 1e6)),
    });
  return { labels, datasets };
});
const stairFdv = computed(() => {
  const w = walkScenario(S.value.plan, baseScenKey(S.value.plan));
  return tgeFdvFor(S.value.plan, baseScenKey(S.value.plan), w);
});
const stairOpts = {
  axisOptions: { xAxisMode: "tick" },
  barOptions: { spaceRatio: 0.4 },
  tooltipOptions: { formatTooltipY: (v: number) => fUSD(v * 1e6) },
};
// Raiku series = capital; market-median series = a mid-weight slate (COM-50: tint was 1.59:1, invisible).
const stairColors = computed(() => [chartHex("--chart-capital"), chartHex("--chart-median")]);

// --- potential scatter (custom SVG) ---
const PAD = { l: 52, r: 16, t: 16, b: 28 };
const VW = 460;
const VH = 280;
// COM-136: chart labels disambiguate duplicate first names (and guard mononyms/empty).
const rosterNames = computed(() => board.value.rows.map((r: any) => r.a.name));
const scatter = computed(() =>
  board.value.rows.map(({ a, c }: any) => {
    const s = sFor(c); // COM-85: scatter re-keys to the board-local case
    return {
      name: shortName(a.name, rosterNames.value),
      x: s.total,
      y: Math.max(0, ceilFor(c) - s.total),
      z: Math.max(c.capTotal || 0, 1),
      tier: a.tier || 0,
      id: a.id,
    };
  }),
);
const xMax = computed(() => Math.max(1, ...scatter.value.map((d) => d.x)));
const yMax = computed(() => Math.max(1, ...scatter.value.map((d) => d.y)));
const zMax = computed(() => Math.max(1, ...scatter.value.map((d) => d.z)));
const sx = (x: number) => PAD.l + (x / xMax.value) * (VW - PAD.l - PAD.r);
const sy = (y: number) => VH - PAD.b - (y / yMax.value) * (VH - PAD.t - PAD.b);
const sr = (z: number) => 5 + Math.sqrt(z / zMax.value) * 16;

// COM-48: y-gridlines at "nice" headroom values (the chart had only two corner $ labels).
function niceStep(raw: number) {
  const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const n = raw / mag;
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
}
const yTicks = computed(() => {
  const step = niceStep(yMax.value / 3);
  const ticks: number[] = [];
  for (let v = step; v <= yMax.value * 1.0001; v += step) ticks.push(v);
  return ticks;
});

// COM-48: bubble + label layout. Several advisors cluster at the same low base, so their names
// overprinted into a smear. Place each label greedily — prefer above, fall back below, then stack
// upward — avoiding collisions at similar x. hoverId raises the active bubble to the front (rendered
// last) and is also set on focus, so keyboard selection is legible too.
const hoverId = ref<string | null>(null);
const LABEL_H = 13;
const scatterPlaced = computed(() => {
  const placed: { x: number; y: number }[] = [];
  const collides = (x: number, y: number) =>
    placed.some((q) => Math.abs(q.x - x) < 36 && Math.abs(q.y - y) < LABEL_H);
  const pts = scatter.value.map((d) => {
    const px = sx(d.x),
      py = sy(d.y),
      r = sr(d.z);
    let ly = py - r - 5; // prefer a label above the bubble
    if (collides(px, ly)) {
      const yb = py + r + 12;
      if (!collides(px, yb)) ly = yb;
      else while (collides(px, ly) && ly > LABEL_H) ly -= LABEL_H; // stack upward
    }
    placed.push({ x: px, y: ly });
    return { ...d, px, py, r, ly };
  });
  return pts.sort((a, b) => (a.id === hoverId.value ? 1 : 0) - (b.id === hoverId.value ? 1 : 0));
});

// COM-115: the company cost as ONE range (floor · base · ceiling over the board-local case),
// not three equal tiles — selection over the engine's exported board.cost, no new math.
const costRange = computed(() => {
  const keys = scenKeys(S.value.plan);
  const first = keys[0];
  const last = keys[keys.length - 1];
  return {
    floor: { label: S.value.plan.scenarios[first].label, v: board.value.cost[first] || 0 },
    base: { label: S.value.plan.scenarios[bc.value].label, v: board.value.cost[bc.value] || 0 },
    ceil: { label: S.value.plan.scenarios[last].label, v: board.value.cost[last] || 0 },
  };
});

// --- per-advisor scenario range ---
const ranges = computed(() =>
  board.value.rows.map(({ a, c }: any) => {
    const totals = c.scen.map((s: any) => s.total);
    return {
      name: shortName(a.name, rosterNames.value),
      lo: Math.min(...totals),
      base: c.baseCaseTotal,
      hi: Math.max(...totals),
    };
  }),
);
const rangeMax = computed(() => Math.max(1, ...ranges.value.map((r) => r.hi)));
const baseEqSum = computed(() => board.value.rows.reduce((s: number, r: any) => s + r.c.baseEq, 0));
// COM-85: roster value column + board total follow the local case (s.total per advisor).
const caseTotalSum = computed(() =>
  board.value.rows.reduce((s: number, r: any) => s + sFor(r.c).total, 0),
);
</script>

<template>
  <!-- COM-89: dense tables opt OUT of the reading column — Board keeps the wide canvas -->
  <!-- COM-133: teach instead of rendering empty axes + a zeroed total -->
  <EmptyState
    v-if="!board.rows.length"
    icon="lucide-users"
    title="No advisors on the board yet."
    body="Add your first advisor to model a package — a uniform base that grows with performance, net of strike and dilution against the company plan."
  >
    <Button
      variant="solid"
      theme="gray"
      icon-left="lucide-plus"
      label="Add advisor"
      class="mt-2"
      @click="addAdvisor"
    />
  </EmptyState>

  <div v-else class="mx-auto w-full max-w-7xl px-3 sm:px-5 space-y-8">
    <PageHeader
      title="The board, and what it costs us."
      desc="Uniform base × tier, grown by gated performance. Equity is net of strike and scenario dilution; tokens are valued at the scenario's TGE FDV."
    >
      <template #actions>
        <Button
          variant="subtle"
          theme="gray"
          icon-left="lucide-printer"
          label="Board pack"
          @click="boardPack"
        />
        <Button
          variant="solid"
          theme="gray"
          icon-left="lucide-plus"
          label="Add"
          @click="addAdvisor"
        />
      </template>
    </PageHeader>
    <ContextStrip />

    <!-- COM-85: board-local scenario projection (presentation-only; the global Case is untouched) -->
    <div class="flex items-center gap-2.5 flex-wrap no-print">
      <span class="text-xs text-ink-gray-6">Project the board under</span>
      <TabButtons
        :buttons="caseButtons"
        :model-value="bc"
        @update:model-value="boardCase = $event"
      />
      <Badge v-if="bc !== baseScenKey(S.plan)" theme="orange" variant="subtle"
        >Projected: {{ S.plan.scenarios[bc].label }}</Badge
      >
    </div>

    <div class="grid lg:grid-cols-12 gap-8">
      <div class="lg:col-span-8 space-y-6">
        <!-- roster table -->
        <!-- COM-88 de-boxed · COM-96: chrome + row a11y live in the shared roster primitives;
             the engine values keep rendering here (values arrive as props, no math inside) -->
        <RosterTable
          :columns="[
            { label: 'Advisor' },
            { label: 'Tier' },
            { label: 'Base eq', align: 'right' },
            { label: 'Earned', align: 'right' },
            { label: `Net · ${S.plan.scenarios[bc].label}`, align: 'right' },
            { label: '', noPrint: true },
          ]"
          caption="Advisory board roster — base equity, earned uplift and net value per advisor, with the board total."
        >
          <RosterRow
            v-for="{ a, c } in board.rows"
            :key="a.id"
            :aria-label="`Open ${a.name}`"
            @open="open(a.id)"
          >
            <td class="px-4 py-3">
              <RosterIdentity :name="a.name" :sector="a.sector.split('—')[0].trim()" />
            </td>
            <td class="px-4 py-3">
              <TierBadge :mode="a.mode" :tier-name="S.tiers[a.tier]?.name" />
            </td>
            <td class="px-4 py-3 tabular-nums text-right text-ink-gray-8">
              {{ fPct(c.baseEq, 2) }}
            </td>
            <td
              class="px-4 py-3 tabular-nums text-right"
              :class="c.earnedUplift > 0 ? 'text-ink-green-3' : 'text-ink-gray-6'"
            >
              +{{ (c.earnedUplift * 100).toFixed(0) }}%<span
                v-if="c.pendingUplift > 0"
                class="text-ink-amber-strong"
              >
                +{{ (c.pendingUplift * 100).toFixed(0)
                }}<Term k="awaitingGate"
                  ><span class="ml-1 text-xs font-sans">pending</span></Term
                ></span
              >
            </td>
            <td class="px-4 py-3 tabular-nums text-right font-medium text-ink-gray-9">
              {{ fUSD(sFor(c).total) }}
            </td>
            <td class="px-2 py-3 no-print">
              <Dropdown :options="rowMenu(a)" placement="right">
                <template #trigger>
                  <button
                    aria-label="Advisor actions"
                    class="inline-flex shrink-0 items-center justify-center size-8 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6"
                    @click.stop
                    @keydown.stop
                  >
                    <span class="lucide-ellipsis size-4" aria-hidden="true" />
                  </button>
                </template>
              </Dropdown>
            </td>
          </RosterRow>
          <!-- COM-118: the total is a sum, not the current case — the primitive renders the
               neutral band; amber stays reserved for the company-cost conclusion below -->
          <template #total>
            <td class="px-4 py-3 font-medium text-ink-gray-9">Board · {{ board.rows.length }}</td>
            <td />
            <td class="px-4 py-3 tabular-nums text-right font-medium text-ink-gray-9">
              {{ fPct(baseEqSum, 2) }}
            </td>
            <td />
            <td class="px-4 py-3 tabular-nums text-right font-medium text-ink-gray-9">
              {{ fUSD(caseTotalSum) }}
            </td>
            <td class="no-print" />
          </template>
        </RosterTable>
        <!-- scenario range by advisor -->
        <div class="print-area">
          <div class="section-label mb-3">Scenario range by advisor · net value</div>
          <!-- COM-88: static list — the section label gives context; no frame.
               COM-120: fixed-width columns (name · bar · range) so the labels align down the
               list instead of jittering with name/value width; the bar is label-less. -->
          <div class="space-y-3">
            <div
              v-for="r in ranges"
              :key="r.name"
              class="ff-row grid grid-cols-[8rem_1fr_7rem] items-center gap-3"
            >
              <span class="text-xs text-ink-gray-7 min-w-0 truncate" :title="r.name">{{
                r.name
              }}</span>
              <FootballField :lo="r.lo" :base="r.base" :hi="r.hi" :max="rangeMax" compact />
              <span class="text-xs tabular-nums text-ink-gray-6 text-right"
                >{{ fUSD(r.lo) }} – {{ fUSD(r.hi) }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-4 space-y-6">
        <PoolAllocation :board="board" :committed="S.plan.committedAdvisorTokenPct" />
        <div class="rounded border border-outline-amber-2 bg-surface-amber-2 p-5 space-y-3">
          <div class="text-sm text-ink-amber-strong flex items-center gap-2">
            <span class="lucide-building-2 size-3.5" aria-hidden="true" /> Company cost · net to the
            board
          </div>
          <!-- COM-115: one RANGE, not three equal tiles — floor and ceiling quiet at the ends,
               the projected case bold in the middle, the shared FootballField idiom beneath -->
          <div class="flex items-end justify-between gap-4">
            <div>
              <div class="text-xs text-ink-gray-6 mb-1">{{ costRange.floor.label }}</div>
              <div class="text-sm tabular-nums text-ink-gray-7">
                {{ fUSD(costRange.floor.v) }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-xs text-ink-amber-strong mb-1">{{ costRange.base.label }}</div>
              <div class="figure-md text-ink-gray-9">{{ fUSD(costRange.base.v) }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-ink-gray-6 mb-1">{{ costRange.ceil.label }}</div>
              <div class="text-sm tabular-nums text-ink-gray-7">{{ fUSD(costRange.ceil.v) }}</div>
            </div>
          </div>
          <FootballField
            :lo="costRange.floor.v"
            :base="costRange.base.v"
            :hi="costRange.ceil.v"
            :max="costRange.ceil.v"
            compact
          />
          <p class="text-p-xs text-ink-gray-6">
            Total net value across the board at each scenario.
          </p>
          <div class="pt-2 border-t border-outline-amber-2 text-sm flex justify-between">
            <span class="text-ink-gray-6">Annual cash</span
            ><span class="tabular-nums text-ink-gray-9">{{ fUSD(board.sumCash) }}/yr</span>
          </div>
        </div>
      </div>
    </div>

    <!-- COM-90: analysis charts sit BELOW the roster — the page leads with its subject
         (the roster + what it costs us); the dense graphics are the supporting read. -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- valuation staircase -->
      <Panel
        class="print-area"
        role="img"
        :aria-label="`Valuation path base case. TGE FDV ${fUSD(stairFdv)}.`"
      >
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div class="section-label">
            Valuation path · base case{{ S.plan.showBenchmarks ? " vs market median" : "" }}
            <span class="text-ink-gray-6">· post-money $M</span>
          </div>
          <div class="text-xs tabular-nums text-ink-gray-6">
            <Term k="tgeFdv">TGE FDV</Term> {{ fUSD(stairFdv) }} ·
            {{ fMult(S.plan.scenarios[baseScenKey(S.plan)].tgeMult) }} ×
            {{ roundLabel(S.plan, S.plan.tgeAnchor) }}
          </div>
        </div>
        <FrappeChart
          type="bar"
          :data="stair"
          :height="210"
          :colors="stairColors"
          :options="stairOpts"
        />
        <p v-if="S.plan.showBenchmarks" class="text-p-xs text-ink-gray-6 mt-1">
          Median = 2025 market post-money by stage ({{ BENCH.postMoneySrc }}). Raiku's plan runs
          above median — an ambitious path.
        </p>
      </Panel>

      <!-- potential scatter -->
      <Panel
        class="print-area"
        role="img"
        :aria-label="`Advisor potential under ${S.plan.scenarios[bc].label}: net value (x) vs headroom to ceiling (y); bubble size is capital introduced.`"
      >
        <div class="section-label mb-3">
          Untapped potential · current net (x) vs <Term k="headroom">headroom</Term> (y) · bubble =
          capital introduced
        </div>
        <svg
          :viewBox="`0 0 ${VW} ${VH}`"
          class="w-full text-ink-gray-9"
          :style="{ height: '260px' }"
        >
          <line
            :x1="PAD.l"
            :y1="VH - PAD.b"
            :x2="VW - PAD.r"
            :y2="VH - PAD.b"
            class="stroke-current text-ink-gray-3"
            stroke-width="1"
          />
          <line
            :x1="PAD.l"
            :y1="PAD.t"
            :x2="PAD.l"
            :y2="VH - PAD.b"
            class="stroke-current text-ink-gray-3"
            stroke-width="1"
          />
          <!-- COM-48: light y-gridlines + $ ticks (headroom) so vertical position reads quantitatively -->
          <g v-for="t in yTicks" :key="`gl-${t}`">
            <line
              :x1="PAD.l"
              :y1="sy(t)"
              :x2="VW - PAD.r"
              :y2="sy(t)"
              class="stroke-current text-ink-gray-2"
              stroke-width="1"
              stroke-dasharray="2 3"
            />
            <text
              :x="PAD.l - 5"
              :y="sy(t) + 3"
              text-anchor="end"
              class="fill-current text-ink-gray-5"
              font-size="10"
            >
              {{ fUSD(t) }}
            </text>
          </g>
          <text :x="PAD.l" :y="VH - 6" class="fill-current text-ink-gray-7" font-size="11">
            {{ fUSD(0) }}
          </text>
          <text
            :x="VW - PAD.r"
            :y="VH - 6"
            text-anchor="end"
            class="fill-current text-ink-gray-7"
            font-size="11"
          >
            {{ fUSD(xMax) }}
          </text>
          <!-- COM-122: on-axis titles so the chart teaches itself (13 in the viewBox ≈ 11.4px
               rendered at the card's ~0.875 scale — above the COM-49 floor; ink-gray-6 per M7) -->
          <text
            :x="(PAD.l + VW - PAD.r) / 2"
            :y="VH - 6"
            text-anchor="middle"
            class="fill-current text-ink-gray-6"
            font-size="13"
          >
            Current net value
          </text>
          <text
            :x="12"
            :y="(PAD.t + VH - PAD.b) / 2"
            text-anchor="middle"
            class="fill-current text-ink-gray-6"
            font-size="13"
            :transform="`rotate(-90, 12, ${(PAD.t + VH - PAD.b) / 2})`"
          >
            Headroom to ceiling
          </text>
          <g
            v-for="d in scatterPlaced"
            :key="d.id"
            tabindex="0"
            role="button"
            :aria-label="`Open ${d.name}`"
            class="cursor-pointer focus:outline-none"
            @click="open(d.id)"
            @keydown.enter="open(d.id)"
            @keydown.space.prevent="open(d.id)"
            @mouseenter="hoverId = d.id"
            @mouseleave="hoverId = null"
            @focusin="hoverId = d.id"
            @focusout="hoverId = null"
          >
            <circle
              :cx="d.px"
              :cy="d.py"
              :r="d.r"
              :style="{
                fill: TIER_COLOR[d.tier] || 'var(--chart-capital)',
                fillOpacity: hoverId === d.id ? 0.9 : 0.55,
              }"
              :stroke="hoverId === d.id ? 'var(--ink-gray-9)' : 'none'"
              stroke-width="1.5"
            />
            <!-- COM-51: tier initial as a redundant (non-color) channel for colour-blind + print;
                 rendered only where the bubble is large enough to hold the glyph. -->
            <text
              v-if="d.r >= 9"
              :x="d.px"
              :y="d.py + 3.5"
              text-anchor="middle"
              font-size="10"
              font-weight="600"
              class="fill-white"
              style="pointer-events: none"
            >
              {{ (S.tiers[d.tier]?.name || "")[0] }}
            </text>
            <!-- COM-48: de-collided label (above / below / stacked) with a white halo so names stay
                 legible over gridlines and neighbouring bubbles even when points cluster. -->
            <text
              :x="d.px"
              :y="d.ly"
              text-anchor="middle"
              class="fill-current"
              :class="hoverId === d.id ? 'text-ink-gray-9' : 'text-ink-gray-7'"
              font-size="10"
              :font-weight="hoverId === d.id ? 600 : 400"
              style="
                pointer-events: none;
                paint-order: stroke;
                stroke: #fff;
                stroke-width: 2.5px;
                stroke-linejoin: round;
              "
            >
              {{ d.name }}
            </text>
          </g>
        </svg>
        <div class="flex gap-3 text-xs mt-1 flex-wrap text-ink-gray-6">
          <span v-for="(t, i) in S.tiers" :key="i" class="flex items-center gap-1"
            ><span
              class="inline-block size-2 rounded-full"
              :style="{ background: TIER_COLOR[i] }"
            /><span class="font-semibold text-ink-gray-8">{{ (t.name || "")[0] }}</span>
            {{ t.name }}</span
          >
          <span class="ml-auto">top-left = most headroom, modest today</span>
        </div>
      </Panel>
    </div>
  </div>
</template>
