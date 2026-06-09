<script setup lang="ts">
// Advisors (Section II) — the per-advisor read view. A compact read-only package summary + the
// full-width decision projection (potential strip, growth waterfall, upside curve, detail expander).
// Editing lives in the global "Edit package" Dialog (COM-76, components/PackageEditor.vue). All money
// from the engine via the store.
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Badge, Button, Select } from "frappe-ui";
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
} from "../engine";
import PageHeader from "../components/PageHeader.vue";
import ContextStrip from "../components/ContextStrip.vue";
import StageBadge from "../components/StageBadge.vue";
import AdvisorPicker from "../components/AdvisorPicker.vue";
import PotentialStrip from "../components/PotentialStrip.vue";
import GrowthWaterfall from "../components/GrowthWaterfall.vue";
import UpsideCurve from "../components/UpsideCurve.vue";
import ExitSlider from "../components/ExitSlider.vue";
import VestingTimeline from "../components/VestingTimeline.vue";
import FootballField from "../components/FootballField.vue";
import MixBreakdown from "../components/MixBreakdown.vue";
import DilutionPath from "../components/DilutionPath.vue";
import Term from "../components/Term.vue";

const { store, selected, setAdvisorCase } = useStudio();
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
const showDetail = ref(false);
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
</script>

<template>
  <div v-if="!sel || !c" class="text-center py-24 text-ink-gray-6">
    No advisor selected. Add one on the Board.
  </div>
  <div v-else class="space-y-8">
    <div class="flex justify-between items-center flex-wrap gap-3 no-print">
      <PageHeader title="Base, then performance." />
      <div class="flex items-center gap-2 flex-wrap">
        <Button
          variant="solid"
          theme="gray"
          icon-left="lucide-pen"
          label="Edit package"
          @click="openEditor"
        />
        <StageBadge /><AdvisorPicker />
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
      </div>
    </div>
    <ContextStrip />

    <!-- COM-76: read-only package summary (the editable terms, recapped); Edit opens the Dialog -->
    <div class="bg-surface-white rounded border border-outline-gray-1 p-5 no-print">
      <div class="flex items-center justify-between mb-3">
        <div class="text-sm text-ink-gray-6">Package · {{ sel.name }}</div>
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
    </div>

    <!-- full-width decision projection -->
    <div class="space-y-6 print-area">
      <PotentialStrip :c="c" />
      <GrowthWaterfall :c="c" :sel="sel" />
      <ExitSlider :c="c" @exit="(v) => (exitMarker = v)" />
      <UpsideCurve :c="c" :marker-exit="exitMarker ?? undefined" />
      <Button
        class="w-full no-print"
        variant="subtle"
        theme="gray"
        :label="
          showDetail ? '− Hide detail' : '+ Show detail · vesting, scenario range, mix, instruments'
        "
        @click="showDetail = !showDetail"
      />
      <template v-if="showDetail">
        <VestingTimeline :c="c" :sel="sel" />
        <div class="bg-surface-white rounded border border-outline-gray-1 p-5">
          <div class="text-sm text-ink-gray-6 mb-3">Scenario range · net value (low → high)</div>
          <FootballField :lo="ff.lo" :base="ff.base" :hi="ff.hi" :max="ff.hi" />
          <div class="flex justify-between text-xs mt-2 tabular-nums text-ink-gray-6">
            <span>Low {{ fUSD(ff.lo) }}</span
            ><span class="text-ink-amber-strong">Base {{ fUSD(ff.base) }}</span
            ><span>High {{ fUSD(ff.hi) }}</span>
          </div>
        </div>
        <MixBreakdown :c="c" />
        <div class="grid sm:grid-cols-2 gap-6">
          <DilutionPath :c="c" />
          <div class="bg-surface-white rounded border border-outline-gray-1 p-5">
            <div class="text-sm text-ink-gray-6 mb-3">
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
                ><span class="tabular-nums text-ink-gray-9">{{ fUSD(c.tkPct * c.base.fdv) }}</span>
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
          </div>
        </div>
      </template>
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
