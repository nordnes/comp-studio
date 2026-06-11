<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Alert, Badge, Button, Dropdown } from "frappe-ui";
import { useStudio } from "../store";
import { confirmDestroy } from "../confirm";
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
  advisorStage,
} from "../engine";
import { grantPreconditions } from "../governance";
// COM-159: the pipeline chip — stage → Badge theme (status semantics carried by TEXT + theme;
// gray = pre-offer modeling, blue = in motion, orange = gating steps, green = committed/live).
const STAGE_THEME: Record<string, string> = {
  modeled: "gray",
  proposed: "blue",
  iterating: "blue",
  referenced: "orange",
  "offer-issued": "orange",
  signed: "green",
  active: "green",
  "rolled-off": "red",
};
import PageHeader from "../components/PageHeader.vue";
import RosterIdentity from "../components/roster/RosterIdentity.vue";
import TierBadge from "../components/roster/TierBadge.vue";
import KeyDatesRadar from "../components/KeyDatesRadar.vue";
import PoolAllocation from "../components/PoolAllocation.vue";
import Term from "../components/Term.vue";
import EmptyState from "../components/EmptyState.vue";
import Panel from "../components/Panel.vue";

const { store, board, select, delAdvisor, setPath } = useStudio();
// COM-167: blocking semantics — the O13 pre-condition check per package
const precond = (a: any) => grantPreconditions(a, store.gov);
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
    {
      label: "Remove",
      icon: "lucide-trash-2",
      theme: "red",
      // COM-107: a whole package is confirm-worthy (parity with Reset)
      onClick: () =>
        confirmDestroy(
          "Remove advisor",
          `Remove ${a.name}? Their package and objective progress are deleted.`,
          () => delAdvisor(a.id),
        ),
    },
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
      desc="A live snapshot against the company plan. Click an advisor to model their package."
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
        <!-- COM-129: "Net" here means net of strike — the page's first jargon gets the tooltip -->
        <div class="text-xs mb-1.5 text-ink-amber-strong">
          <Term k="netOfStrike">Net cost</Term> · base
        </div>
        <div class="figure-lg text-ink-gray-9">{{ heroCost }}</div>
        <!-- COM-125: a one-scenario plan has no range — hide the degenerate "$X – $X" line
             (Robin's prompt-set default: HIDE) -->
        <div v-if="sk.length > 1" class="text-p-xs mt-2 tabular-nums text-ink-gray-6">
          {{ rangeText }}
        </div>
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
            <!-- COM-31 residual: the chip group must WRAP at narrow widths — shrink-0 on a
                 four-chip row forced the card's min-content to ~449px and the page to 461
                 at a 375 viewport (the Wave-5 audit's /overview offender) -->
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <!-- COM-96: identity + tier pill come from the shared roster primitives -->
              <RosterIdentity :name="a.name" max-w="max-w-full" />
              <div class="flex items-center gap-1 flex-wrap justify-end">
                <!-- COM-167: the blocking chip — pre-conditions outstanding (O13) -->
                <Badge
                  v-if="!precond(a).ok"
                  theme="orange"
                  size="sm"
                  variant="subtle"
                  :title="precond(a).outstanding.join(' · ')"
                  >{{ precond(a).outstanding.length }} pre-condition{{
                    precond(a).outstanding.length === 1 ? "" : "s"
                  }}</Badge
                >
                <!-- COM-159: the offer-pipeline stage chip -->
                <Badge :theme="STAGE_THEME[advisorStage(a)] || 'gray'" size="sm" variant="subtle">{{
                  advisorStage(a)
                }}</Badge>
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
              +{{ (c.ceilUplift * 100).toFixed(0) }}%
              <Term k="headroom">potential at ceiling</Term>
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
        <!-- COM-173: the cross-advisor key-dates radar — the at-a-glance surface owns it -->
        <KeyDatesRadar />
        <PoolAllocation :board="board" :committed="S.plan.committedAdvisorTokenPct" />
        <Panel class="space-y-2">
          <div class="section-label">Benchmark</div>
          <p class="text-p-sm text-ink-gray-7">
            Board base equity <b class="text-ink-gray-9">{{ fPct(baseEqSum, 2) }}</b> ·
            <Term k="fast">FAST</Term> per-head 0.30–1.00% ·
            <Term k="advisoryPool">advisory pool</Term> ~{{ fPct(BENCH.advisorPool, 0) }}.
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
