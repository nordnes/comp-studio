<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Alert, Button, Dropdown } from "frappe-ui";
import { useStudio } from "../store";
import { useEditor } from "../composables/useEditor";
import {
  fUSD,
  fPct,
  fMult,
  scenKeys,
  baseScenKey,
  walkScenario,
  tgeFdvFor,
  BENCH,
} from "../engine";
import PageHeader from "../components/PageHeader.vue";
import RosterIdentity from "../components/roster/RosterIdentity.vue";
import TierBadge from "../components/roster/TierBadge.vue";
import PoolAllocation from "../components/PoolAllocation.vue";
import Term from "../components/Term.vue";
import EmptyState from "../components/EmptyState.vue";
import Panel from "../components/Panel.vue";

const { store, board, select, delAdvisor, setPath } = useStudio();
const { openEditor } = useEditor();
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
// COM-75: per-card kebab (mirror of Board) — change tier in-context, open the package, or remove.
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

// COM-113: ONE hero figure (the decision number) + a quiet supporting strip. The Advisors count
// tile is gone — the roster directly below answers it.
const heroCost = computed(() => fUSD(board.value.cost[baseKey.value] || 0));
const rangeText = computed(
  () =>
    `${S.value.plan.scenarios[sk.value[0]].label} → ${S.value.plan.scenarios[sk.value[sk.value.length - 1]].label} · ` +
    `${fUSD(board.value.cost[sk.value[0]] || 0)} – ${fUSD(board.value.cost[sk.value[sk.value.length - 1]] || 0)}`,
);
const supporting = computed(() => [
  { l: "Equity of company", v: fPct(baseEqSum.value, 2), sub: "base, pre-uplift" },
  { l: "Tokens of supply", v: fPct(board.value.sumTk, 2), sub: "earned" },
  { l: "Annual cash", v: fUSD(board.value.sumCash), sub: "" },
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
  <EmptyState
    v-if="!board.rows.length"
    title="No advisors yet."
    body="Add your first advisor to model a package — a uniform base that grows with performance, net of strike and dilution against the company plan."
  >
    <Button
      variant="solid"
      theme="gray"
      icon-left="lucide-plus"
      label="Add advisor"
      class="mt-2"
      route="/board"
    />
  </EmptyState>

  <div v-else class="mx-auto w-full max-w-reading px-3 sm:px-5 space-y-8">
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

    <!-- COM-113: ONE hero figure + a quiet supporting strip on the white canvas (the six-up tile
         band is gone). Amber ink marks the current-case conclusion — the page's one amber moment. -->
    <div class="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
      <div>
        <div class="text-xs mb-1.5 text-ink-amber-strong">Net cost · base</div>
        <div class="figure-lg text-ink-gray-9">{{ heroCost }}</div>
        <div class="text-p-xs mt-2 tabular-nums text-ink-gray-6">{{ rangeText }}</div>
      </div>
      <dl class="flex flex-wrap gap-x-10 gap-y-3 pb-1">
        <div v-for="s in supporting" :key="s.l">
          <dt class="text-xs mb-1 text-ink-gray-6">{{ s.l }}</dt>
          <dd class="text-sm tabular-nums text-ink-gray-9">
            {{ s.v }}<span v-if="s.sub" class="ml-1 text-xs text-ink-gray-6">{{ s.sub }}</span>
          </dd>
        </div>
      </dl>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-3">
        <div class="section-label">Roster · click to open a package</div>
        <div class="grid sm:grid-cols-2 gap-3">
          <!-- COM-108: the interactive roster card rides Panel (surface from the primitive,
               behaviour classes fall through; p-4 stays the card's compact padding) -->
          <Panel
            v-for="{ a, c } in board.rows"
            :key="a.id"
            :padded="false"
            role="button"
            tabindex="0"
            :aria-label="`Open ${a.name}`"
            @click="open(a.id)"
            @keydown.enter="open(a.id)"
            @keydown.space.prevent="open(a.id)"
            class="text-left p-4 cursor-pointer hover:bg-surface-gray-1 hover:border-outline-gray-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--ink-gray-6)]"
          >
            <div class="flex items-center justify-between gap-2">
              <!-- COM-96: identity + tier pill come from the shared roster primitives -->
              <RosterIdentity :name="a.name" max-w="max-w-full" />
              <div class="flex items-center gap-1 shrink-0">
                <TierBadge :mode="a.mode" :tier-name="S.tiers[a.tier]?.name" />
                <Dropdown :options="rowMenu(a)" placement="right" class="no-print">
                  <template #trigger>
                    <button
                      aria-label="Advisor actions"
                      class="inline-flex shrink-0 items-center justify-center size-7 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6"
                      @click.stop
                      @keydown.stop
                    >
                      <span class="lucide-ellipsis size-4" aria-hidden="true" />
                    </button>
                  </template>
                </Dropdown>
              </div>
            </div>
            <div class="text-xs mt-0.5 text-ink-gray-6">{{ a.sector.split("—")[0].trim() }}</div>
            <div class="flex justify-between items-baseline mt-3">
              <div class="figure-sm text-ink-gray-9">
                {{ fUSD(c.baseCaseTotal) }}
              </div>
              <div class="text-xs tabular-nums text-ink-gray-6">
                {{ fPct(c.eqPct, 2) }} eq · {{ fPct(c.tkPct, 2) }} tok
              </div>
            </div>
            <div v-if="c.ceilUplift > c.earnedUplift" class="text-xs mt-1 text-ink-green-3">
              +{{ (c.ceilUplift * 100).toFixed(0) }}% potential at ceiling
            </div>
          </Panel>
        </div>
        <p class="text-p-xs text-ink-gray-6">
          Base path:
          <span v-for="(s, i) in w.steps" :key="s.id"
            >{{ i ? " → " : "" }}{{ s.label }} {{ fUSD(s.post) }}</span
          >
          · <Term k="tgeFdv">TGE FDV</Term> {{ fUSD(fdv) }}.
        </p>
      </div>

      <div class="space-y-6">
        <PoolAllocation :board="board" :committed="S.plan.committedAdvisorTokenPct" />
        <Panel class="space-y-2">
          <div class="section-label">Benchmark</div>
          <p class="text-p-sm text-ink-gray-7">
            Board base equity <b class="text-ink-gray-9">{{ fPct(baseEqSum, 2) }}</b> · FAST
            per-head 0.30–1.00% · advisory pool ~{{ fPct(BENCH.advisorPool, 0) }}.
          </p>
          <p class="text-p-xs text-ink-gray-6">Source: {{ BENCH.advisorSrc }}.</p>
        </Panel>
        <Alert :theme="hasBudget ? 'red' : 'yellow'" title="To confirm / alerts">
          <template #description>
            <div class="space-y-1.5">
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
          </template>
        </Alert>
      </div>
    </div>
  </div>
</template>
