<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Button, Badge } from "frappe-ui";
import { useStudio } from "../store";
import { fUSD, fPct, fNum, scenKeys, baseScenKey, walkScenario, tgeFdvFor, BENCH } from "../engine";
import PageHeader from "../components/PageHeader.vue";
import PoolAllocation from "../components/PoolAllocation.vue";

const { store, board, select } = useStudio();
const router = useRouter();
const S = computed(() => store.S);
const sk = computed(() => scenKeys(S.value.plan));
const baseKey = computed(() => baseScenKey(S.value.plan));
const baseEqSum = computed(() => board.value.rows.reduce((s, r) => s + r.c.baseEq, 0));
const w = computed(() => walkScenario(S.value.plan, baseKey.value));
const fdv = computed(() => tgeFdvFor(S.value.plan, baseKey.value, w.value));

function open(id: string) {
  select(id);
  router.push("/advisors");
}

const kpis = computed(() => [
  { l: "Advisors", v: fNum(board.value.rows.length), accent: false, sub: "" },
  { l: "Net cost · base", v: fUSD(board.value.cost[baseKey.value] || 0), accent: true, sub: "" },
  {
    l: `Range ${S.value.plan.scenarios[sk.value[0]].label}→${S.value.plan.scenarios[sk.value[sk.value.length - 1]].label}`,
    v: `${fUSD(board.value.cost[sk.value[0]] || 0)} – ${fUSD(board.value.cost[sk.value[sk.value.length - 1]] || 0)}`,
    accent: false,
    sub: "",
  },
  { l: "Equity of company", v: fPct(baseEqSum.value, 2), accent: false, sub: "base, pre-uplift" },
  { l: "Tokens of supply", v: fPct(board.value.sumTk, 2), accent: false, sub: "earned" },
  { l: "Annual cash", v: fUSD(board.value.sumCash), accent: false, sub: "" },
]);

const flags = computed(() => {
  const out: { t: string; m: string }[] = [];
  board.value.warnings.forEach((x: string) => out.push({ t: "budget", m: x }));
  S.value.advisors.forEach((a: any) => {
    if (/confirm/i.test(a.notes || "")) out.push({ t: "confirm", m: `${a.name}: confirm terms` });
  });
  out.push({
    t: "note",
    m: "TGE multipliers (2×/5×/12×) unvalidated — confirm before sharing externally.",
  });
  out.push({
    t: "note",
    m: `ESOP at adoption ${fPct(S.value.plan.esopStart, 0)} (10% / 15% switch — board decision open).`,
  });
  return out;
});
const hasBudget = computed(() => flags.value.some((f) => f.t === "budget"));
</script>

<template>
  <div
    v-if="!board.rows.length"
    class="flex flex-col items-center justify-center gap-3 py-24 text-center"
  >
    <div class="rounded-full bg-surface-gray-2 p-3 text-ink-gray-6">
      <span class="lucide-inbox size-6" aria-hidden="true" />
    </div>
    <p class="text-lg text-ink-gray-8">No advisors yet.</p>
    <p class="text-p-sm text-ink-gray-6 max-w-md">
      Add your first advisor to model a package — a uniform base that grows with performance, net of
      strike and dilution against the company plan.
    </p>
    <Button
      variant="solid"
      theme="gray"
      icon-left="lucide-plus"
      label="Add advisor"
      class="mt-2"
      route="/board"
    />
  </div>

  <div v-else class="space-y-8">
    <PageHeader
      title="The advisory board, at a glance."
      desc="A live snapshot against the company plan — net of strike and dilution. Open Configure to edit the baseline; click an advisor to model their package."
    >
      <template #actions
        ><Button
          variant="solid"
          theme="gray"
          icon-left="lucide-sliders-horizontal"
          label="Configure"
          route="/configure"
      /></template>
    </PageHeader>

    <!-- KPI band -->
    <div
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-surface-gray-2 rounded overflow-hidden border border-outline-gray-1"
    >
      <div
        v-for="k in kpis"
        :key="k.l"
        class="p-4"
        :class="k.accent ? 'bg-surface-amber-2' : 'bg-surface-white'"
      >
        <div class="text-xs mb-1" :class="k.accent ? 'text-ink-amber-strong' : 'text-ink-gray-6'">
          {{ k.l }}
        </div>
        <div class="font-display text-xl leading-none tabular-nums text-ink-gray-9">{{ k.v }}</div>
        <div v-if="k.sub" class="text-xs mt-1 text-ink-gray-6">{{ k.sub }}</div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-3">
        <div class="text-sm text-ink-gray-6">Roster · click to open a package</div>
        <div class="grid sm:grid-cols-2 gap-3">
          <button
            v-for="{ a, c } in board.rows"
            :key="a.id"
            @click="open(a.id)"
            class="text-left bg-surface-white rounded border border-outline-gray-1 p-4 hover:bg-surface-gray-1 hover:border-outline-gray-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--ink-gray-6)]"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="font-medium text-ink-gray-9">{{ a.name }}</div>
              <Badge
                :label="a.mode === 'value' ? '$value' : S.tiers[a.tier]?.name || '—'"
                theme="orange"
                variant="subtle"
                size="sm"
              />
            </div>
            <div class="text-xs mt-0.5 text-ink-gray-6">{{ a.sector.split("—")[0].trim() }}</div>
            <div class="flex justify-between items-baseline mt-3">
              <div class="font-display text-xl tabular-nums text-ink-gray-9">
                {{ fUSD(c.baseCaseTotal) }}
              </div>
              <div class="text-xs tabular-nums text-ink-gray-6">
                {{ fPct(c.eqPct, 2) }} eq · {{ fPct(c.tkPct, 2) }} tok
              </div>
            </div>
            <div v-if="c.ceilUplift > c.earnedUplift" class="text-xs mt-1 text-ink-green-3">
              +{{ (c.ceilUplift * 100).toFixed(0) }}% potential at ceiling
            </div>
          </button>
        </div>
        <p class="text-p-xs text-ink-gray-6">
          Base path:
          <span v-for="(s, i) in w.steps" :key="s.id"
            >{{ i ? " → " : "" }}{{ s.label }} {{ fUSD(s.post) }}</span
          >
          · TGE FDV {{ fUSD(fdv) }}.
        </p>
      </div>

      <div class="space-y-6">
        <PoolAllocation :board="board" :committed="S.plan.committedAdvisorTokenPct" />
        <div class="bg-surface-white rounded border border-outline-gray-1 p-5 space-y-2">
          <div class="text-sm text-ink-gray-6">Benchmark</div>
          <p class="text-p-sm text-ink-gray-7">
            Board base equity <b class="text-ink-gray-9">{{ fPct(baseEqSum, 2) }}</b> · FAST
            per-head 0.30–1.00% · advisory pool ~{{ fPct(BENCH.advisorPool, 0) }}.
          </p>
          <p class="text-p-xs text-ink-gray-6">Source: {{ BENCH.advisorSrc }}.</p>
        </div>
        <div
          class="rounded border p-5 space-y-2"
          :class="
            hasBudget
              ? 'bg-surface-red-2 border-outline-red-2'
              : 'bg-surface-amber-2 border-outline-amber-2'
          "
        >
          <div class="text-sm" :class="hasBudget ? 'text-ink-red-3' : 'text-ink-amber-strong'">
            To confirm / alerts
          </div>
          <div
            v-for="(f, i) in flags"
            :key="i"
            class="text-p-xs flex items-start gap-1.5 leading-relaxed"
            :class="f.t === 'budget' ? 'text-ink-red-3' : 'text-ink-gray-7'"
          >
            <span class="lucide-triangle-alert size-3.5 shrink-0 mt-0.5" aria-hidden="true" />{{
              f.m
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
