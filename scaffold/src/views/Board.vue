<script setup lang="ts">
// Board (Section III) — roster, scenario ranges, pool, company cost, valuation staircase (frappe-charts
// grouped bar, Robin's call) and potential scatter (custom SVG — frappe-charts has no scatter in 1.6.2).
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Badge } from 'frappe-ui';
import { useStudio } from '../store';
import { fUSD, fPct, walkScenario, baseScenKey, tgeFdvFor, roundLabel, fMult, BENCH } from '../engine';
import { TIER_COLOR } from '../constants';
import PageHeader from '../components/PageHeader.vue';
import PoolAllocation from '../components/PoolAllocation.vue';
import ContextStrip from '../components/ContextStrip.vue';
import StageBadge from '../components/StageBadge.vue';
import FootballField from '../components/FootballField.vue';
import FrappeChart from '../components/FrappeChart.vue';

const { store, board, select, addAdvisor, delAdvisor } = useStudio();
const router = useRouter();
const S = computed(() => store.S);

function open(id: string) { select(id); router.push('/advisors'); }
function boardPack() { window.print(); }

// --- valuation staircase (grouped bar: Raiku vs market median per stage) ---
const stair = computed(() => {
  const w = walkScenario(S.value.plan, baseScenKey(S.value.plan));
  const labels = w.steps.map(s => s.label);
  // plot in $M — frappe-charts has no y-axis tick formatter, so a raw-dollar axis reads "100000000".
  const datasets: any[] = [{ name: 'Raiku', values: w.steps.map(s => Math.round(s.post / 1e6)) }];
  if (S.value.plan.showBenchmarks) datasets.push({ name: 'Median', values: w.steps.map(s => Math.round((BENCH.postMoney[s.id] || 0) / 1e6)) });
  return { labels, datasets };
});
const stairFdv = computed(() => { const w = walkScenario(S.value.plan, baseScenKey(S.value.plan)); return tgeFdvFor(S.value.plan, baseScenKey(S.value.plan), w); });
const stairOpts = { axisOptions: { xAxisMode: 'tick' }, barOptions: { spaceRatio: 0.4 }, tooltipOptions: { formatTooltipY: (v: number) => fUSD(v * 1e6) } };

// --- potential scatter (custom SVG) ---
const PAD = { l: 46, r: 16, t: 16, b: 28 }; const VW = 460; const VH = 280;
const scatter = computed(() => board.value.rows.map(({ a, c }: any) => ({
  name: a.name.split(' ')[0], x: c.baseCaseTotal, y: Math.max(0, c.baseCaseCeil - c.baseCaseTotal),
  z: Math.max(c.capTotal || 0, 1), tier: a.tier || 0, id: a.id,
})));
const xMax = computed(() => Math.max(1, ...scatter.value.map(d => d.x)));
const yMax = computed(() => Math.max(1, ...scatter.value.map(d => d.y)));
const zMax = computed(() => Math.max(1, ...scatter.value.map(d => d.z)));
const sx = (x: number) => PAD.l + (x / xMax.value) * (VW - PAD.l - PAD.r);
const sy = (y: number) => VH - PAD.b - (y / yMax.value) * (VH - PAD.t - PAD.b);
const sr = (z: number) => 5 + Math.sqrt(z / zMax.value) * 16;

// --- per-advisor scenario range ---
const ranges = computed(() => board.value.rows.map(({ a, c }: any) => {
  const totals = c.scen.map((s: any) => s.total);
  return { name: a.name.split(' ')[0], lo: Math.min(...totals), base: c.baseCaseTotal, hi: Math.max(...totals) };
}));
const rangeMax = computed(() => Math.max(1, ...ranges.value.map(r => r.hi)));
const baseEqSum = computed(() => board.value.rows.reduce((s: number, r: any) => s + r.c.baseEq, 0));
const baseTotalSum = computed(() => board.value.rows.reduce((s: number, r: any) => s + r.c.baseCaseTotal, 0));
</script>

<template>
  <div class="space-y-8">
    <PageHeader title="The board, and what it costs us."
      desc="Uniform base × tier, grown by gated performance. Equity is net of strike and scenario dilution; tokens are valued at the scenario's TGE FDV.">
      <template #actions>
        <StageBadge />
        <Button variant="subtle" theme="gray" icon-left="lucide-printer" label="Board pack" @click="boardPack" />
        <Button variant="solid" theme="gray" icon-left="lucide-plus" label="Add" @click="addAdvisor" />
      </template>
    </PageHeader>
    <ContextStrip />

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- valuation staircase -->
      <div class="bg-surface-white rounded border border-outline-gray-1 p-5" role="img"
        :aria-label="`Valuation path base case. TGE FDV ${fUSD(stairFdv)}.`">
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div class="text-sm text-ink-gray-5">Valuation path · base case{{ S.plan.showBenchmarks ? ' vs market median' : '' }} <span class="text-ink-gray-4">· post-money $M</span></div>
          <div class="text-xs tabular-nums text-ink-gray-5">TGE FDV {{ fUSD(stairFdv) }} · {{ fMult(S.plan.scenarios[baseScenKey(S.plan)].tgeMult) }} × {{ roundLabel(S.plan, S.plan.tgeAnchor) }}</div>
        </div>
        <FrappeChart type="bar" :data="stair" :height="210" :colors="['#9C4A0C', '#E7C99B']" :options="stairOpts" />
        <p v-if="S.plan.showBenchmarks" class="text-p-xs text-ink-gray-5 mt-1">Median = 2025 market post-money by stage ({{ BENCH.postMoneySrc }}). Raiku's plan runs above median — an ambitious path.</p>
      </div>

      <!-- potential scatter -->
      <div class="bg-surface-white rounded border border-outline-gray-1 p-5" role="img"
        aria-label="Advisor potential: current net value (x) vs headroom to ceiling (y); bubble size is capital introduced.">
        <div class="text-sm text-ink-gray-5 mb-3">Untapped potential · current net (x) vs headroom (y) · bubble = capital introduced</div>
        <svg :viewBox="`0 0 ${VW} ${VH}`" class="w-full text-ink-gray-9" :style="{ height: '260px' }">
          <line :x1="PAD.l" :y1="VH - PAD.b" :x2="VW - PAD.r" :y2="VH - PAD.b" class="stroke-current text-ink-gray-3" stroke-width="1" />
          <line :x1="PAD.l" :y1="PAD.t" :x2="PAD.l" :y2="VH - PAD.b" class="stroke-current text-ink-gray-3" stroke-width="1" />
          <text :x="PAD.l" :y="VH - 6" class="fill-current text-ink-gray-5" font-size="9">{{ fUSD(0) }}</text>
          <text :x="VW - PAD.r" :y="VH - 6" text-anchor="end" class="fill-current text-ink-gray-5" font-size="9">{{ fUSD(xMax) }}</text>
          <g v-for="d in scatter" :key="d.id" class="cursor-pointer" @click="open(d.id)">
            <circle :cx="sx(d.x)" :cy="sy(d.y)" :r="sr(d.z)" :style="{ fill: TIER_COLOR[d.tier] || '#9C4A0C', fillOpacity: 0.7 }" />
            <text :x="sx(d.x)" :y="sy(d.y) - sr(d.z) - 3" text-anchor="middle" class="fill-current text-ink-gray-7" font-size="9">{{ d.name }}</text>
          </g>
        </svg>
        <div class="flex gap-3 text-xs mt-1 flex-wrap text-ink-gray-5">
          <span v-for="(t, i) in S.tiers" :key="i" class="flex items-center gap-1"><span class="inline-block size-2 rounded-full" :style="{ background: TIER_COLOR[i] }" />{{ t.name }}</span>
          <span class="ml-auto">top-left = most headroom, modest today</span>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-12 gap-8">
      <div class="lg:col-span-8 space-y-6">
        <!-- roster table -->
        <div class="bg-surface-white rounded border border-outline-gray-1 overflow-x-auto">
          <table class="w-full text-sm" style="min-width:560px">
            <thead><tr class="border-b border-outline-gray-2 text-left text-ink-gray-5">
              <th class="px-4 py-3 font-normal">Advisor</th><th class="px-4 py-3 font-normal">Tier</th>
              <th class="px-4 py-3 font-normal">Base eq</th><th class="px-4 py-3 font-normal">Earned</th>
              <th class="px-4 py-3 font-normal">Net base-case</th><th class="px-2 py-3 no-print" />
            </tr></thead>
            <tbody>
              <tr v-for="{ a, c } in board.rows" :key="a.id" class="border-b border-outline-gray-1 cursor-pointer hover:bg-surface-gray-1" @click="open(a.id)">
                <td class="px-4 py-3"><div class="font-medium text-ink-gray-9">{{ a.name }}</div><div class="text-xs text-ink-gray-5">{{ a.sector.split('—')[0].trim() }}</div></td>
                <td class="px-4 py-3"><Badge :label="a.mode === 'value' ? '$value' : (S.tiers[a.tier]?.name || '—')" theme="orange" variant="subtle" size="sm" /></td>
                <td class="px-4 py-3 tabular-nums text-ink-gray-8">{{ fPct(c.baseEq, 2) }}</td>
                <td class="px-4 py-3 tabular-nums" :class="c.earnedUplift > 0 ? 'text-ink-green-3' : 'text-ink-gray-5'">+{{ (c.earnedUplift * 100).toFixed(0) }}%<span v-if="c.pendingUplift > 0" class="text-ink-amber-3"> +{{ (c.pendingUplift * 100).toFixed(0) }}⏳</span></td>
                <td class="px-4 py-3 tabular-nums font-medium text-ink-gray-9">{{ fUSD(c.baseCaseTotal) }}</td>
                <td class="px-2 py-3 no-print"><button aria-label="Remove advisor" class="text-ink-gray-5 hover:text-ink-red-3" @click.stop="delAdvisor(a.id)"><span class="lucide-trash-2 size-3.5" aria-hidden="true" /></button></td>
              </tr>
              <tr class="bg-surface-amber-2">
                <td class="px-4 py-3 font-medium text-ink-gray-9">Board · {{ board.rows.length }}</td><td />
                <td class="px-4 py-3 tabular-nums font-medium text-ink-gray-9">{{ fPct(baseEqSum, 2) }}</td><td />
                <td class="px-4 py-3 tabular-nums font-medium text-ink-gray-9">{{ fUSD(baseTotalSum) }}</td><td class="no-print" />
              </tr>
            </tbody>
          </table>
        </div>
        <!-- scenario range by advisor -->
        <div>
          <div class="text-sm text-ink-gray-5 mb-3">Scenario range by advisor · net value</div>
          <div class="bg-surface-white rounded border border-outline-gray-1 p-5 space-y-3">
            <FootballField v-for="r in ranges" :key="r.name" :lo="r.lo" :base="r.base" :hi="r.hi" :max="rangeMax" :label="r.name" compact />
          </div>
        </div>
      </div>

      <div class="lg:col-span-4 space-y-6">
        <PoolAllocation :board="board" :committed="S.plan.committedAdvisorTokenPct" />
        <div class="rounded border border-outline-amber-2 bg-surface-amber-2 p-5 space-y-3">
          <div class="text-sm text-ink-amber-3 flex items-center gap-2"><span class="lucide-building-2 size-3.5" aria-hidden="true" /> Company cost · net to the board</div>
          <div class="grid grid-cols-3 gap-px bg-surface-gray-2 rounded overflow-hidden">
            <div v-for="k in Object.keys(S.plan.scenarios)" :key="k" class="p-3" :class="k === baseScenKey(S.plan) ? 'bg-surface-white' : 'bg-surface-amber-2'">
              <div class="text-xs text-ink-gray-5 mb-1">{{ S.plan.scenarios[k].label }}</div>
              <div class="font-display text-base tabular-nums text-ink-gray-9">{{ fUSD(board.cost[k] || 0) }}</div>
            </div>
          </div>
          <p class="text-p-xs text-ink-gray-6">Total net value across the board at each scenario.</p>
          <div class="pt-2 border-t border-outline-amber-2 text-sm flex justify-between"><span class="text-ink-gray-6">Annual cash</span><span class="tabular-nums text-ink-gray-9">{{ fUSD(board.sumCash) }}/yr</span></div>
        </div>
      </div>
    </div>
  </div>
</template>
