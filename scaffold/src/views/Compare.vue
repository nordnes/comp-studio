<script setup lang="ts">
// Compare (Section IV) — side-by-side matrix + grouped bar (one series per scenario). The grouped
// comparison bar lives HERE (not Board), per the reference.
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { Badge, Button } from "frappe-ui";
import { useStudio } from "../store";
import { fUSD, fPct, scenKeys, baseScenKey } from "../engine";
import { SCEN_TOKENS, chartHex, shortName } from "../constants";
import PageHeader from "../components/PageHeader.vue";
import FrappeChart from "../components/FrappeChart.vue";
import EmptyState from "../components/EmptyState.vue";
import Panel from "../components/Panel.vue";

const { store, board, select, flash, addAdvisor } = useStudio();
// COM-136: chart/heading labels disambiguate duplicate first names (mononym/empty guarded).
const rosterNames = computed(() => board.value.rows.map((r: any) => r.a.name));
const sn = (n: string) => shortName(n, rosterNames.value);
const router = useRouter();
const S = computed(() => store.S);
const cols = computed(() => scenKeys(S.value.plan));
function open(id: string) {
  select(id);
  router.push("/advisors");
}

const baseEqSum = computed(() => board.value.rows.reduce((s: number, r: any) => s + r.c.baseEq, 0));
// COM-58: per-row scenario cells with Δ% vs the base scenario column (engine values; computed once).
const matrix = computed(() => {
  const bk = baseScenKey(S.value.plan);
  return board.value.rows.map(({ a, c }: any) => {
    const totals = c.scen.map((s: any) => s.total);
    return {
      a,
      c,
      // COM-86: scenario sensitivity — the gap between the best and worst case (engine totals only).
      spread: Math.max(...totals) - Math.min(...totals),
      cells: cols.value.map((k) => {
        const baseTotal = c.scen.find((x: any) => x.key === bk)?.total || 0;
        const total = c.scen.find((x: any) => x.key === k)?.total || 0;
        const delta =
          k === bk || !baseTotal ? null : Math.round(((total - baseTotal) / baseTotal) * 100);
        return { k, total, delta, isBase: k === bk };
      }),
    };
  });
});

// COM-86: sortable Spread column (desc → asc → roster order) + pin-to-compare over the transient
// store.pinnedIds (COM-82 — never persisted/hashed; roster-scrubbed in the store).
const spreadSort = ref<null | "desc" | "asc">(null);
function cycleSpreadSort() {
  spreadSort.value =
    spreadSort.value === "desc" ? "asc" : spreadSort.value === "asc" ? null : "desc";
}
const rowsSorted = computed(() => {
  if (!spreadSort.value) return matrix.value;
  return [...matrix.value].sort((x: any, y: any) =>
    spreadSort.value === "desc" ? y.spread - x.spread : x.spread - y.spread,
  );
});
function togglePin(id: string) {
  const i = store.pinnedIds.indexOf(id);
  if (i >= 0) store.pinnedIds.splice(i, 1);
  else if (store.pinnedIds.length >= 3) flash("Pin limit — unpin one first (max 3)");
  else store.pinnedIds.push(id);
}
const pinned = computed(() =>
  store.pinnedIds.map((id) => matrix.value.find((r: any) => r.a.id === id)).filter(Boolean),
);
// Head-to-head: transposed (rows = scenarios, cols = pinned advisors), cells = net + the existing Δ shape.
const h2hRows = computed(() => {
  const bk = baseScenKey(S.value.plan);
  return cols.value.map((k) => ({
    k,
    label: S.value.plan.scenarios[k].label,
    isBase: k === bk,
    cells: pinned.value.map((r: any) => r.cells.find((x: any) => x.k === k)),
  }));
});
const h2hChart = computed(() => ({
  labels: cols.value.map((k) => S.value.plan.scenarios[k].label),
  datasets: pinned.value.map((r: any) => ({
    name: sn(r.a.name),
    values: cols.value.map((k) => (r.c.scen.find((x: any) => x.key === k)?.total || 0) / 1e6),
  })),
}));
const chart = computed(() => ({
  labels: board.value.rows.map((r: any) => sn(r.a.name)),
  datasets: cols.value.map((k) => ({
    name: S.value.plan.scenarios[k].label,
    values: board.value.rows.map(
      (r: any) => (r.c.scen.find((x: any) => x.key === k)?.total || 0) / 1e6,
    ),
  })),
})); // values in full-precision $M (COM-123: never Math.round the geometry — sub-$1M bars must stay accurate;
// frappe-charts has no y-axis tick formatter so raw dollars would read "10000000", hence $M not $).
const chartOpts = {
  axisOptions: { xAxisMode: "tick" },
  tooltipOptions: { formatTooltipY: (v: number) => fUSD(v * 1e6) },
};
const scenColors = computed(() =>
  cols.value.map((_, i) => chartHex(SCEN_TOKENS[i % SCEN_TOKENS.length])),
);
</script>

<template>
  <!-- COM-133: teach instead of a sticky header over a zeroed total -->
  <EmptyState
    v-if="!board.rows.length"
    icon="lucide-layers"
    title="Nothing to compare yet."
    body="Add advisors to the board and their packages line up here across scenarios — every figure net of strike and dilution."
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

  <!-- COM-89: dense tables opt OUT of the reading column — Compare keeps the wide canvas -->
  <div v-else class="mx-auto w-full max-w-7xl px-3 sm:px-5 space-y-8">
    <PageHeader
      title="The board, side by side."
      desc="Net of strike & scenario dilution. Click a row to open a package."
    />

    <!-- COM-86: head-to-head panel — appears when ≥2 advisors are pinned (transient, never persisted) -->
    <Panel v-if="pinned.length >= 2" class="space-y-4 no-print">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="section-label">
          Head-to-head · {{ pinned.map((r: any) => sn(r.a.name)).join(" vs ") }}
        </div>
        <Button
          variant="ghost"
          theme="gray"
          size="sm"
          label="Unpin all"
          @click="store.pinnedIds = []"
        />
      </div>
      <table class="w-full text-sm" style="max-width: 560px">
        <thead>
          <tr class="border-b border-outline-gray-2 text-ink-gray-6">
            <th class="px-3 py-2 font-normal text-left">Scenario</th>
            <th v-for="r in pinned" :key="(r as any).a.id" class="px-3 py-2 font-normal text-right">
              {{ sn((r as any).a.name) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in h2hRows"
            :key="row.k"
            class="border-b border-outline-gray-1 last:border-b-0"
            :class="row.isBase ? 'bg-surface-amber-2' : ''"
          >
            <td class="px-3 py-2 text-ink-gray-8">
              {{ row.label
              }}<span v-if="row.isBase" class="ml-1 text-xs text-ink-amber-strong">base</span>
            </td>
            <td
              v-for="(cell, i) in row.cells"
              :key="i"
              class="px-3 py-2 tabular-nums text-right text-ink-gray-9"
            >
              {{ fUSD(cell?.total || 0) }}
              <span
                v-if="cell && cell.delta !== null"
                class="ml-1 text-xs"
                :class="
                  cell.delta > 0
                    ? 'text-ink-green-3'
                    : cell.delta < 0
                      ? 'text-ink-red-3'
                      : 'text-ink-gray-5'
                "
                >{{ cell.delta > 0 ? "↑" : cell.delta < 0 ? "↓" : ""
                }}{{ Math.abs(cell.delta) }}%</span
              >
            </td>
          </tr>
        </tbody>
      </table>
      <FrappeChart
        type="bar"
        :data="h2hChart"
        :height="220"
        :colors="scenColors"
        :options="chartOpts"
        :aria-label="`Grouped bar comparing ${pinned.map((r: any) => sn(r.a.name)).join(', ')} net value per scenario, in millions of dollars.`"
      />
    </Panel>

    <Panel :padded="false" class="overflow-auto max-h-[70vh]">
      <table class="w-full text-sm" style="min-width: 760px">
        <!-- COM-58: sticky header keeps the column labels readable on a tall/wide scroll -->
        <thead class="sticky top-0 z-[1] bg-surface-white">
          <tr class="border-b border-outline-gray-2 text-left text-ink-gray-6">
            <th
              class="px-4 py-3 font-normal sticky left-0 z-[3] bg-surface-white border-r border-outline-gray-1"
            >
              Advisor
            </th>
            <th class="px-4 py-3 font-normal">Tier</th>
            <th class="px-4 py-3 font-normal text-right">Base eq</th>
            <th class="px-4 py-3 font-normal text-right">Earned</th>
            <th class="px-4 py-3 font-normal text-right">Ceiling</th>
            <!-- COM-86: sortable scenario-sensitivity column -->
            <th
              class="px-4 py-3 font-normal text-right"
              :aria-sort="
                spreadSort === 'desc' ? 'descending' : spreadSort === 'asc' ? 'ascending' : 'none'
              "
            >
              <button
                class="inline-flex items-center gap-1 hover:text-ink-gray-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] rounded"
                @click="cycleSpreadSort"
              >
                Spread{{ spreadSort === "desc" ? " ↓" : spreadSort === "asc" ? " ↑" : "" }}
              </button>
            </th>
            <th v-for="k in cols" :key="k" class="px-4 py-3 font-normal text-right">
              Net {{ S.plan.scenarios[k].label.toLowerCase() }}
            </th>
            <th class="px-4 py-3 font-normal text-right">Cash/yr</th>
            <th class="px-2 py-3 font-normal no-print">Pin</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="{ a, c, cells, spread } in rowsSorted"
            :key="a.id"
            tabindex="0"
            role="button"
            :aria-label="`Open ${a.name}`"
            class="border-b border-outline-gray-1 cursor-pointer hover:bg-surface-gray-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ink-gray-6)] focus-visible:bg-surface-gray-1"
            @click="open(a.id)"
            @keydown.enter="open(a.id)"
            @keydown.space.prevent="open(a.id)"
          >
            <td
              class="px-4 py-3 font-medium text-ink-gray-9 sticky left-0 z-[2] bg-surface-white border-r border-outline-gray-1"
            >
              <!-- COM-136: cap + truncate the sticky name column -->
              <div class="min-w-0 max-w-[12rem] truncate" :title="a.name">{{ a.name }}</div>
            </td>
            <td class="px-4 py-3">
              <Badge
                :label="a.mode === 'value' ? '$value' : S.tiers[a.tier]?.name || '—'"
                theme="orange"
                variant="subtle"
                size="sm"
              />
            </td>
            <td class="px-4 py-3 tabular-nums text-right text-ink-gray-8">
              {{ fPct(c.baseEq, 2) }}
            </td>
            <td
              class="px-4 py-3 tabular-nums text-right"
              :class="c.earnedUplift > 0 ? 'text-ink-green-3' : 'text-ink-gray-6'"
            >
              +{{ (c.earnedUplift * 100).toFixed(0) }}%
            </td>
            <td class="px-4 py-3 tabular-nums text-right text-ink-gray-6">
              +{{ (c.ceilUplift * 100).toFixed(0) }}%
            </td>
            <td class="px-4 py-3 tabular-nums text-right text-ink-gray-8">
              {{ fUSD(spread) }}
            </td>
            <td
              v-for="cell in cells"
              :key="cell.k"
              class="px-4 py-3 tabular-nums text-right text-ink-gray-9"
              :class="cell.isBase ? 'font-medium' : ''"
            >
              {{ fUSD(cell.total) }}
              <!-- COM-58: Δ% vs the base scenario column (green up / red down) -->
              <span
                v-if="cell.delta !== null"
                class="ml-1 text-xs"
                :class="
                  cell.delta > 0
                    ? 'text-ink-green-3'
                    : cell.delta < 0
                      ? 'text-ink-red-3'
                      : 'text-ink-gray-5'
                "
                >{{ cell.delta > 0 ? "↑" : cell.delta < 0 ? "↓" : ""
                }}{{ Math.abs(cell.delta) }}%</span
              >
            </td>
            <td class="px-4 py-3 tabular-nums text-right text-ink-gray-8">
              {{ c.cash ? fUSD(c.cash) : "—" }}
            </td>
            <td class="px-2 py-3 no-print">
              <Button
                size="sm"
                :variant="store.pinnedIds.includes(a.id) ? 'subtle' : 'ghost'"
                :theme="store.pinnedIds.includes(a.id) ? 'blue' : 'gray'"
                :label="store.pinnedIds.includes(a.id) ? 'Pinned' : 'Pin'"
                :aria-pressed="store.pinnedIds.includes(a.id)"
                @click.stop="togglePin(a.id)"
                @keydown.stop
              />
            </td>
          </tr>
          <!-- COM-118: total row off amber — amber means the current case, and Compare's is the
               base-scenario row cells -->
          <tr class="bg-surface-gray-1 border-t border-outline-gray-2">
            <td
              class="px-4 py-3 font-medium text-ink-gray-9 sticky left-0 z-[2] bg-surface-gray-1 border-r border-outline-gray-1"
            >
              Board
            </td>
            <td />
            <td class="px-4 py-3 tabular-nums text-right font-medium text-ink-gray-9">
              {{ fPct(baseEqSum, 2) }}
            </td>
            <td />
            <td />
            <td />
            <td
              v-for="k in cols"
              :key="k"
              class="px-4 py-3 tabular-nums text-right font-medium text-ink-gray-9"
            >
              {{ fUSD(board.cost[k] || 0) }}
            </td>
            <td class="px-4 py-3 tabular-nums text-right font-medium text-ink-gray-9">
              {{ fUSD(board.sumCash) }}
            </td>
            <td class="no-print" />
          </tr>
        </tbody>
      </table>
    </Panel>

    <div>
      <div class="section-label mb-3">
        Net value across scenarios <span class="text-ink-gray-6">· $M</span>
      </div>
      <!-- COM-108: p-6 was the one drifted padding — unified to the Panel default -->
      <Panel>
        <FrappeChart
          type="bar"
          :data="chart"
          :height="300"
          :colors="scenColors"
          :options="chartOpts"
          aria-label="Grouped bar of each advisor net value across scenarios, in millions of dollars."
        />
      </Panel>
    </div>
  </div>
</template>
