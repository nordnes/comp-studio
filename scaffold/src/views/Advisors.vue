<script setup lang="ts">
// Advisors (Section II) — the per-advisor read view. A compact read-only package summary + the
// full-width decision projection (potential strip, growth waterfall, upside curve, detail expander).
// Editing lives in the global "Edit package" Dialog (COM-76, components/PackageEditor.vue). All money
// from the engine via the store.
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Badge, Button, Dropdown, Select, Tabs } from "frappe-ui";
import { useStudio } from "../store";
import { useEditor } from "../composables/useEditor";
import {
  fUSD,
  fPct,
  fNum,
  fTok,
  fMult,
  roundLabel,
  todayISO,
  scenKeys,
  baseScenKey,
  fDate,
  roundList,
  effectiveGrants,
  computeGrant,
  GRANT_LIFECYCLES,
  EXERCISE_MECHANICS,
  FUNDING_ROUND_CARVEOUT,
  exerciseCheck,
} from "../engine";
import NumIn from "../components/NumIn.vue";
import PageHeader from "../components/PageHeader.vue";
import ContextStrip from "../components/ContextStrip.vue";
import AdvisorPicker from "../components/AdvisorPicker.vue";
import ScenarioTable from "../components/ScenarioTable.vue";
import GrowthWaterfall from "../components/GrowthWaterfall.vue";
import UpsideCurve from "../components/UpsideCurve.vue";
import ExitSlider from "../components/ExitSlider.vue";
import VestingTimeline from "../components/VestingTimeline.vue";
import FootballField from "../components/FootballField.vue";
import MixBreakdown from "../components/MixBreakdown.vue";
import DilutionPath from "../components/DilutionPath.vue";
import Term from "../components/Term.vue";
import EmptyState from "../components/EmptyState.vue";
import Panel from "../components/Panel.vue";

const { store, selected, setAdvisorCase, addAdvisor, addGrant, updateGrant, removeGrant } =
  useStudio();
const { openEditor } = useEditor();
const router = useRouter();
const S = computed(() => store.S);
const sel = computed(() => selected.value?.a as any);
const c = computed(() => selected.value?.c as any);
// COM-81: per-advisor case override — '' = match board (no override). The store re-bases the
// projection via a shallow plan clone; the global Case lens is untouched.
const caseOptions = computed(() => [
  { label: "Match board", value: "" },
  ...scenKeys(S.value.plan).map((k) => ({
    label: S.value.plan.scenarios[k].label || k,
    value: k,
  })),
]);
const advisorCase = computed({
  get: () => sel.value?.caseOverride || "",
  set: (v: string) => setAdvisorCase(sel.value.id, v || null),
});
const overrideDiverged = computed(
  () => !!sel.value?.caseOverride && sel.value.caseOverride !== baseScenKey(S.value.plan),
);
// COM-91: granular disclosure — Tabs replace the all-or-nothing detail dump (one surface at a time).
const detailTab = ref(0);
// COM-47: the exit slider publishes the selected exit value; UpsideCurve marks it on the equity curve.
const exitMarker = ref<number | null>(null);

function printPage() {
  window.print();
}
const ff = computed(() => {
  const t = c.value.scen.map((s: any) => s.total);
  return { lo: Math.min(...t), base: c.value.baseCaseTotal, hi: Math.max(...t) };
});
function toProp() {
  router.push("/proposition");
}
// COM-144: per-grant rows — explicit grants when the advisor has them, else the derived implicit
// package (the engine's §5 shim). All pricing comes from computeGrant; the view renders rows.
const isExplicit = computed(() => Array.isArray(sel.value?.grants));
const grantRows = computed(() =>
  effectiveGrants(sel.value, S.value.plan, S.value.tiers, S.value.objectives).map((g) => ({
    g,
    r: computeGrant(g, S.value.plan, sel.value.caseOverride || baseScenKey(S.value.plan)),
  })),
);
const grantRoundOpts = computed(() =>
  roundList(S.value.plan).map((r) => ({ label: roundLabel(S.value.plan, r), value: r })),
);
const lifecycleOpts = GRANT_LIFECYCLES.map((l) => ({ label: l, value: l }));
const addGrantOpts = [
  { label: "Option grant", onClick: () => addGrant(sel.value.id, "option") },
  { label: "Token grant (RTA)", onClick: () => addGrant(sel.value.id, "rta") },
  { label: "Cash", onClick: () => addGrant(sel.value.id, "cash") },
];
// COM-151: the earliest exercisable option grant anchors the 3.6 backstop line.
const backstop = computed(() => {
  const opts = grantRows.value
    .map(({ g }) => g)
    .filter(
      (g) => g.instrument === "option" && g.lifecycle !== "lapsed" && g.lifecycle !== "exercised",
    )
    .sort((a, b) => a.vestStartISO.localeCompare(b.vestStartISO));
  return opts.length ? exerciseCheck(opts[0], todayISO()).backstop : null;
});
</script>

<template>
  <!-- COM-133: the shared teaching empty state replaces the bare one-liner -->
  <EmptyState
    v-if="!sel || !c"
    icon="lucide-user"
    title="No advisor selected."
    body="Add your first advisor to start a package, or pick one from the Board roster — the package builds on the uniform base, net of strike and dilution."
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
  <div v-else class="mx-auto w-full max-w-reading px-3 sm:px-5 space-y-8">
    <!-- COM-127: the actions ride PageHeader's #actions teleport (#app-header on desktop) —
         the bespoke flex row that bypassed the shared action zone is gone -->
    <PageHeader title="Base, then performance.">
      <!-- COM-128: the locked framing, in-frame on the highest-screenshot-risk view (the verbatim
           non-negotiable phrases; presentation placement only) -->
      <template #desc>
        <p class="mt-3 text-p-xs text-ink-gray-6">
          Internal &amp; confidential · net of strike, pre-tax · discussion draft, not a binding
          offer.
        </p>
      </template>
      <template #actions>
        <Button
          variant="solid"
          theme="gray"
          icon-left="lucide-pen"
          label="Edit package"
          @click="openEditor"
        />
        <AdvisorPicker />
        <label class="flex items-center gap-1.5">
          <span class="text-xs text-ink-gray-6">This advisor's case</span>
          <Select v-model="advisorCase" :options="caseOptions" />
        </label>
        <Badge v-if="overrideDiverged" theme="orange" variant="subtle"
          >Override: {{ S.plan.scenarios[sel.caseOverride]?.label || sel.caseOverride }}</Badge
        >
        <Button
          variant="subtle"
          theme="gray"
          icon-left="lucide-printer"
          label="Print"
          @click="printPage"
        />
      </template>
    </PageHeader>
    <ContextStrip />

    <!-- COM-76: read-only package summary (the editable terms, recapped); Edit opens the Dialog -->
    <Panel class="no-print">
      <div class="flex items-center justify-between mb-3">
        <div class="section-label">Package · {{ sel.name }}</div>
        <Button
          variant="subtle"
          theme="gray"
          size="sm"
          icon-left="lucide-pen"
          label="Edit package"
          @click="openEditor"
        />
      </div>
      <dl class="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt class="text-xs text-ink-gray-6">Base</dt>
          <dd class="text-ink-gray-9">
            {{
              sel.mode === "value"
                ? fUSD(sel.annualValue) + "/yr"
                : (S.tiers[sel.tier]?.name || "—") + " · " + fMult(S.tiers[sel.tier]?.mult || 1)
            }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-ink-gray-6">Options / tokens</dt>
          <dd class="tabular-nums text-ink-gray-9">
            {{ fPct(sel.splitOptions, 0) }} / {{ fPct(1 - sel.splitOptions, 0) }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-ink-gray-6">Sector</dt>
          <dd class="text-ink-gray-9 truncate">{{ sel.sector.split("—")[0].trim() }}</dd>
        </div>
        <div>
          <dt class="text-xs text-ink-gray-6">Engagement</dt>
          <dd class="text-ink-gray-9">
            {{ sel.years }} yrs · from {{ sel.startDate || todayISO() }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-ink-gray-6">Granted at</dt>
          <dd class="text-ink-gray-9">{{ roundLabel(S.plan, sel.grantRound || "bridge") }}</dd>
        </div>
        <div>
          <dt class="text-xs text-ink-gray-6">Tax residency</dt>
          <dd class="text-ink-gray-9">{{ sel.taxResidency || "Other" }}</dd>
        </div>
        <div>
          <dt class="text-xs text-ink-gray-6">Cash</dt>
          <dd class="text-ink-gray-9">{{ sel.hasCash ? fUSD(sel.cashAnnual) + "/yr" : "—" }}</dd>
        </div>
        <div>
          <dt class="text-xs text-ink-gray-6">Performance</dt>
          <dd class="tabular-nums">
            <span class="text-ink-green-3">+{{ (c.earnedUplift * 100).toFixed(0) }}%</span
            ><span v-if="c.pendingUplift > 0" class="text-ink-amber-strong">
              · +{{ (c.pendingUplift * 100).toFixed(0) }}% pending</span
            >
            · ceil +{{ (c.ceilUplift * 100).toFixed(0) }}%
          </dd>
        </div>
      </dl>
    </Panel>

    <!-- full-width decision projection (COM-88: space-y-8 gives the de-boxed groups their rhythm) -->
    <div class="space-y-8 print-area">
      <!-- COM-83: one across-cases tabulation (replaces the PotentialStrip restatements) -->
      <ScenarioTable :c="c" />
      <!-- COM-83: FootballField promoted out of the detail expander — the range belongs beside the table.
           COM-88: static read-out, de-boxed (the label carries it). -->
      <div>
        <div class="section-label mb-3">Scenario range · net value (low → high)</div>
        <FootballField :lo="ff.lo" :base="ff.base" :hi="ff.hi" :max="ff.hi" />
        <div class="flex justify-between text-xs mt-2 tabular-nums text-ink-gray-6">
          <span>Low {{ fUSD(ff.lo) }}</span
          ><span class="text-ink-amber-strong">Base {{ fUSD(ff.base) }}</span
          ><span>High {{ fUSD(ff.hi) }}</span>
        </div>
      </div>
      <GrowthWaterfall :c="c" :sel="sel" />
      <ExitSlider :c="c" :sel="sel" @exit="(v) => (exitMarker = v)" />
      <UpsideCurve :c="c" :marker-exit="exitMarker ?? undefined" />
      <!-- COM-91: frappe-ui Tabs (Vesting · Mix · Dilution · Instruments) replace the single
           "+ Show detail" toggle that dumped four surfaces at once — jump straight to one.
           no-print keeps parity with the old collapsed-by-default print behaviour. -->
      <Tabs
        v-model="detailTab"
        class="no-print"
        :tabs="[
          { label: 'Vesting' },
          { label: 'Mix' },
          { label: 'Dilution' },
          { label: 'Instruments' },
        ]"
      >
        <template #tab-panel="{ tab }">
          <div class="w-full pt-6">
            <VestingTimeline v-if="tab.label === 'Vesting'" :c="c" :sel="sel" />
            <MixBreakdown v-else-if="tab.label === 'Mix'" :c="c" />
            <DilutionPath v-else-if="tab.label === 'Dilution'" :c="c" />
            <!-- COM-88: static read-out — label + divide-y rows, no frame -->
            <div v-else>
              <!-- COM-144: per-grant rows — grant date · round · strike · FMV · count · status.
                   Later top-up grants price at later valuations (Part 5.3). -->
              <div class="flex items-center justify-between mb-3">
                <div class="section-label">Grants · per-grant strike from the grant round</div>
                <Dropdown :options="addGrantOpts">
                  <Button
                    variant="subtle"
                    theme="gray"
                    size="sm"
                    icon-left="lucide-plus"
                    label="Add grant"
                  />
                </Dropdown>
              </div>
              <div class="divide-y divide-outline-gray-1 text-sm mb-2">
                <div v-for="{ g, r } in grantRows" :key="g.id" class="py-2">
                  <div class="flex items-center gap-3 flex-wrap">
                    <span class="text-xs text-ink-gray-6 tabular-nums w-16 shrink-0">{{
                      fDate(g.vestStartISO)
                    }}</span>
                    <Select
                      v-if="isExplicit"
                      class="w-28"
                      :model-value="g.round"
                      :options="grantRoundOpts"
                      :aria-label="`Grant round`"
                      @update:model-value="
                        (v) => updateGrant(sel.id, g.id, { round: v, strikePps: undefined })
                      "
                    />
                    <span v-else class="text-ink-gray-7 w-28">{{ r.roundLabel }}</span>
                    <span class="text-xs tabular-nums text-ink-gray-6"
                      >strike
                      <span class="text-ink-gray-9">{{
                        r.strikePps == null ? "—" : `$${r.strikePps.toFixed(2)}`
                      }}</span></span
                    >
                    <span class="text-xs tabular-nums text-ink-gray-6"
                      >FMV
                      <span class="text-ink-gray-9">{{
                        r.fmvPps == null
                          ? "—"
                          : g.instrument === "rta"
                            ? `$${r.fmvPps.toFixed(3)}`
                            : `$${r.fmvPps.toFixed(2)}`
                      }}</span></span
                    >
                    <span class="flex items-center gap-1.5 text-xs text-ink-gray-6">
                      {{ g.instrument === "cash" ? "amount" : "count" }}
                      <NumIn
                        v-if="isExplicit && g.instrument !== 'cash'"
                        :model-value="g.quantity ?? 0"
                        :min="0"
                        :aria-label="`${g.instrument} count`"
                        @update:model-value="(v) => updateGrant(sel.id, g.id, { quantity: v })"
                      />
                      <NumIn
                        v-else-if="isExplicit"
                        :model-value="g.valueUSD ?? 0"
                        fmt="usd"
                        :min="0"
                        aria-label="Cash amount"
                        @update:model-value="(v) => updateGrant(sel.id, g.id, { valueUSD: v })"
                      />
                      <span v-else class="tabular-nums text-ink-gray-9">{{
                        g.instrument === "cash"
                          ? fUSD(g.valueUSD ?? 0)
                          : g.instrument === "rta"
                            ? fTok(g.quantity ?? 0)
                            : fNum(g.quantity ?? 0)
                      }}</span>
                    </span>
                    <span class="ml-auto flex items-center gap-2">
                      <span
                        class="text-xs tabular-nums"
                        :class="r.underwater ? 'text-ink-red-3' : 'text-ink-gray-9'"
                        >{{ fUSD(r.value) }}</span
                      >
                      <Select
                        v-if="isExplicit"
                        class="w-26"
                        :model-value="g.lifecycle"
                        :options="lifecycleOpts"
                        aria-label="Grant status"
                        @update:model-value="(v) => updateGrant(sel.id, g.id, { lifecycle: v })"
                      />
                      <Badge v-else theme="gray" size="sm">{{ g.lifecycle }}</Badge>
                      <button
                        v-if="isExplicit"
                        aria-label="Remove grant"
                        class="inline-flex shrink-0 items-center justify-center size-8 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6 hover:text-ink-red-3"
                        @click="removeGrant(sel.id, g.id)"
                      >
                        <span class="lucide-trash-2 size-3.5" aria-hidden="true" />
                      </button>
                    </span>
                  </div>
                  <p v-if="g.docStatus || g.docUrl" class="text-p-xs text-ink-gray-6 mt-0.5 pl-19">
                    docs: {{ g.docStatus || "—"
                    }}<a
                      v-if="g.docUrl"
                      class="underline ml-1"
                      :href="g.docUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      >link</a
                    >
                  </p>
                </div>
                <p v-if="!grantRows.length" class="py-2 text-p-xs text-ink-gray-6">
                  No grants — add one to start the package.
                </p>
              </div>
              <p v-if="!isExplicit && grantRows.length" class="text-p-xs text-ink-gray-6 mb-4">
                Rows derive from the package settings — the first grant edit makes them explicit.
              </p>
              <div class="section-label mb-3">
                Instruments · <Term k="netOfStrike">net of strike</Term>
              </div>
              <div class="divide-y divide-outline-gray-1 text-sm">
                <div class="flex justify-between py-2">
                  <span class="text-ink-gray-6">Options (base case net)</span
                  ><span class="tabular-nums text-ink-gray-9">{{ fUSD(c.baseEqNet) }}</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-ink-gray-6">Shares @ bridge</span
                  ><span class="tabular-nums text-ink-gray-9">{{ fNum(c.equityShares) }}</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-ink-gray-6">Strike</span
                  ><span class="tabular-nums text-ink-gray-9">${{ c.strikePps.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-ink-gray-6">Exercise cost</span
                  ><span class="tabular-nums text-ink-gray-9">{{ fUSD(c.exerciseCost) }}</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-ink-gray-6">Tokens</span
                  ><span class="tabular-nums text-ink-gray-9"
                    >{{ fPct(c.tkPct, 3) }} · {{ fTok(c.tokenCount) }}</span
                  >
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-ink-gray-6">Token value (base FDV)</span
                  ><span class="tabular-nums text-ink-gray-9">{{
                    fUSD(c.tkPct * c.base.fdv)
                  }}</span>
                </div>
                <div class="flex justify-between py-2">
                  <span class="text-ink-gray-6">Vesting</span
                  ><span class="tabular-nums text-ink-gray-9"
                    >{{ S.plan.equityVestYears }}yr / {{ S.plan.equityCliff }}mo</span
                  >
                </div>
              </div>
              <p class="text-p-xs mt-2 text-ink-gray-6">
                Strike subject to an HMRC SAV / 409A valuation agreed before first grant.
              </p>
              <!-- COM-151: exercise mechanics stated (display truth — the engine computes the
                   backstop dates; Board discretion is never simulated) -->
              <div class="mt-6">
                <div class="section-label mb-3">Exercise mechanics</div>
                <div class="divide-y divide-outline-gray-1 text-sm">
                  <div v-for="m in EXERCISE_MECHANICS" :key="m.id" class="py-2">
                    <span class="text-xs text-ink-gray-6">{{ m.rule }}</span>
                    <p class="text-p-sm text-ink-gray-7 mt-0.5">{{ m.text }}</p>
                  </div>
                  <div v-if="backstop" class="py-2">
                    <span class="text-xs text-ink-gray-6">This package's backstop</span>
                    <p class="text-p-sm text-ink-gray-7 mt-0.5 tabular-nums">
                      If no exit by {{ fDate(backstop.anniversary9ISO) }}, a ≥90-day window must
                      open, closing by {{ fDate(backstop.lastCloseISO) }}.
                    </p>
                  </div>
                </div>
                <p class="text-p-xs mt-2 text-ink-gray-6">{{ FUNDING_ROUND_CARVEOUT }}</p>
              </div>
            </div>
          </div>
        </template>
      </Tabs>
      <Button
        class="w-full no-print"
        variant="solid"
        theme="gray"
        icon-right="lucide-arrow-right"
        :label="`View ${sel.name.split(' ')[0]}'s proposition`"
        @click="toProp"
      />
    </div>
  </div>
</template>
