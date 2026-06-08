<script setup lang="ts">
// Compare (Section IV) — side-by-side matrix + grouped bar (one series per scenario). The grouped
// comparison bar lives HERE (not Board), per the reference.
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Badge } from 'frappe-ui';
import { useStudio } from '../store';
import { fUSD, fPct, scenKeys, baseScenKey, SCEN_COLORS } from '../engine';
import PageHeader from '../components/PageHeader.vue';
import FrappeChart from '../components/FrappeChart.vue';

const { store, board, select } = useStudio();
const router = useRouter();
const S = computed(() => store.S);
const cols = computed(() => scenKeys(S.value.plan));
function open(id: string) { select(id); router.push('/advisors'); }

const baseEqSum = computed(() => board.value.rows.reduce((s: number, r: any) => s + r.c.baseEq, 0));
const chart = computed(() => ({
  labels: board.value.rows.map((r: any) => r.a.name.split(' ')[0]),
  datasets: cols.value.map(k => ({ name: S.value.plan.scenarios[k].label, values: board.value.rows.map((r: any) => Math.round(r.c.scen.find((x: any) => x.key === k)?.total || 0)) })),
}));
const chartOpts = { axisOptions: { xAxisMode: 'tick' }, tooltipOptions: { formatTooltipY: (v: number) => fUSD(v) } };
const scenColors = computed(() => cols.value.map((_, i) => SCEN_COLORS[i % SCEN_COLORS.length]));
</script>

<template>
  <div class="space-y-8">
    <PageHeader title="The board, side by side." desc="Net of strike & scenario dilution. Click a row to open a package." />

    <div class="bg-surface-white rounded border border-outline-gray-1 overflow-x-auto">
      <table class="w-full text-sm" style="min-width:760px">
        <thead><tr class="border-b border-outline-gray-2 text-left text-ink-gray-5">
          <th class="px-4 py-3 font-normal">Advisor</th><th class="px-4 py-3 font-normal">Tier</th>
          <th class="px-4 py-3 font-normal">Base eq</th><th class="px-4 py-3 font-normal">Earned</th><th class="px-4 py-3 font-normal">Ceiling</th>
          <th v-for="k in cols" :key="k" class="px-4 py-3 font-normal">Net {{ S.plan.scenarios[k].label.toLowerCase() }}</th>
          <th class="px-4 py-3 font-normal">Cash/yr</th>
        </tr></thead>
        <tbody>
          <tr v-for="{ a, c } in board.rows" :key="a.id" class="border-b border-outline-gray-1 cursor-pointer hover:bg-surface-gray-1" @click="open(a.id)">
            <td class="px-4 py-3 font-medium text-ink-gray-9">{{ a.name }}</td>
            <td class="px-4 py-3"><Badge :label="a.mode === 'value' ? '$value' : (S.tiers[a.tier]?.name || '—')" theme="orange" variant="subtle" size="sm" /></td>
            <td class="px-4 py-3 tabular-nums text-ink-gray-8">{{ fPct(c.baseEq, 2) }}</td>
            <td class="px-4 py-3 tabular-nums" :class="c.earnedUplift > 0 ? 'text-ink-green-3' : 'text-ink-gray-5'">+{{ (c.earnedUplift * 100).toFixed(0) }}%</td>
            <td class="px-4 py-3 tabular-nums text-ink-gray-5">+{{ (c.ceilUplift * 100).toFixed(0) }}%</td>
            <td v-for="k in cols" :key="k" class="px-4 py-3 tabular-nums text-ink-gray-9" :class="k === baseScenKey(S.plan) ? 'font-medium' : ''">{{ fUSD(c.scen.find((x: any) => x.key === k)?.total || 0) }}</td>
            <td class="px-4 py-3 tabular-nums text-ink-gray-8">{{ c.cash ? fUSD(c.cash) : '—' }}</td>
          </tr>
          <tr class="bg-surface-amber-2">
            <td class="px-4 py-3 font-medium text-ink-gray-9">Board</td><td />
            <td class="px-4 py-3 tabular-nums font-medium text-ink-gray-9">{{ fPct(baseEqSum, 2) }}</td><td /><td />
            <td v-for="k in cols" :key="k" class="px-4 py-3 tabular-nums font-medium text-ink-gray-9">{{ fUSD(board.cost[k] || 0) }}</td>
            <td class="px-4 py-3 tabular-nums font-medium text-ink-gray-9">{{ fUSD(board.sumCash) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div>
      <div class="text-sm text-ink-gray-5 mb-3">Net value across scenarios</div>
      <div class="bg-surface-white rounded border border-outline-gray-1 p-6">
        <FrappeChart type="bar" :data="chart" :height="300" :colors="scenColors" :options="chartOpts" />
      </div>
    </div>
  </div>
</template>
