<script setup lang="ts">
// Configure (Section VI) — the editing surface, a standard light surface (COM-72; the dark branch was
// deleted in COM-110). Every structural list (rounds/scenarios/tiers/milestones/objectives) edits
// through the store's reducer-parity actions incl. delete-cascades. Numbers use the shared NumIn editor.
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
// COM-106: Configure joins the Advisors form idiom — TextInput for inline labels, FormControl for
// the date; NumIn stays (the deliberate click-to-edit numeric). setPath wiring unchanged.
import { Button, Select, Switch, TextInput, FormControl } from "frappe-ui";
import { useStudio } from "../store";
import { confirmDestroy } from "../confirm";
import {
  walkScenario,
  tgeFdvFor,
  baseScenKey,
  roundList,
  roundLabel,
  fUSD,
  fPct,
  fNum,
  fMult,
  safeDiv,
  ENTITY,
  FD_COMPOSITION,
  POOL_PRESETS,
  poolGuardrail,
  poolSharesExact,
  tokenPoolHeadroom,
  headlineObservations,
  planWithSet,
  walkComposed,
  setList,
} from "../engine";
import { CAT_OPTIONS } from "../constants";
import NumIn from "../components/NumIn.vue";
import PageHeader from "../components/PageHeader.vue";

const {
  store,
  setPath,
  addRound,
  delRound,
  addScenario,
  delScenario,
  addTier,
  delTier,
  addMilestone,
  delMilestone,
  addObjective,
  delObjective,
  importRoadmap,
  downloadRoadmap,
  saveSetAs,
  duplicateSet,
  updateSet,
  deleteSet,
} = useStudio();

const S = store; // reactive
const setP = (k: string, v: any) => setPath(["plan", k], v);

const csvRef = ref<HTMLInputElement | null>(null);
function onCsv(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) importRoadmap(f);
  (e.target as HTMLInputElement).value = "";
}

// COM-95: the frappe-ui settings two-column IA — a left rail of three groups replaces the flat
// 8-section scroll. Presentation state only; every section keeps its exact store wiring.
// COM-94: ?group=cap|grants|perf deep-links a rail group (the palette's New scenario/objective land
// on the right section).
const GROUPS = [
  { key: "cap", label: "Cap table", desc: "Bridge · rounds · scenarios" },
  { key: "grants", label: "Grants & pools", desc: "Uniform base · capital" },
  { key: "perf", label: "Performance", desc: "Objectives · tiers · milestones" },
] as const;
type GroupKey = (typeof GROUPS)[number]["key"];
const route = useRoute();
const group = ref<GroupKey>(
  GROUPS.some((g) => g.key === route.query.group) ? (route.query.group as GroupKey) : "cap",
);

const esopOpts = [
  { label: "10%", value: 0.1 },
  { label: "15%", value: 0.15 },
];
const anchorOpts = () =>
  roundList(S.S.plan).map((r) => ({ label: roundLabel(S.S.plan, r), value: r }));
// COM-107: the two widest cascades get a confirm that names the blast radius (counts derived
// here in the view; the store stays a pure reducer).
function confirmDelRound(rd: any) {
  const granted = S.S.advisors.filter((a: any) => a.grantRound === rd.id).length;
  confirmDestroy(
    "Delete round",
    `Delete ${rd.label}? ${granted ? `${granted} advisor grant${granted === 1 ? " is" : "s are"} made at this round and will be reassigned.` : "No advisor grants reference it."}`,
    () => delRound(rd.id),
  );
}
function confirmDelMilestone(m: any) {
  const gated = S.S.objectives.filter((o: any) => o.gate === m.id).length;
  confirmDestroy(
    "Delete milestone",
    `Delete ${m.label}? ${gated ? `${gated} objective${gated === 1 ? " is" : "s are"} gated on it and will be reassigned.` : "No objectives are gated on it."}`,
    () => delMilestone(m.id),
  );
}
const msOpts = () => S.S.plan.milestones.map((m) => ({ label: m.label, value: m.id }));

// COM-142: constitutional baseline (A.1/A.2/A.4). The guardrail verdict comes from the engine —
// the view only renders poolGuardrail()'s level/msg. Pool presets stay BOTH selectable until
// open decision #1 lands; a non-preset persisted value surfaces as "Custom".
const guard = computed(() => poolGuardrail(S.S.plan));
const fShares = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const poolOpts = computed(() => {
  const opts: { label: string; value: number }[] = POOL_PRESETS.map((p) => ({
    label: `${p.label} — ${fShares(p.printed)}`,
    value: p.printed,
  }));
  const cur = S.S.plan.advisorPoolShares;
  if (cur != null && !POOL_PRESETS.some((p) => p.printed === cur))
    opts.push({ label: `Custom — ${fShares(cur)}`, value: cur });
  return opts;
});

// COM-147: scenario-set management + the engine's headline callouts (no view-side money math —
// headlineObservations and walkComposed do all the computing).
const sets = computed(() => setList(S.S.plan));
const headlines = computed(() => headlineObservations(S.S.plan));
const newSetName = ref("");
function onSaveSet() {
  saveSetAs(newSetName.value);
  newSetName.value = "";
}
// per-set callout: the founder-walk line computed over THAT set's scenarios
function setHeadline(id: string) {
  return headlineObservations(planWithSet(S.S.plan, id) as any)[0].text;
}
// the walk-forward prior picker — transient preview state ('' = this scenario's own cell)
const priors = ref<Record<string, string>>({});
function setPrior(roundId: string, v: string) {
  if (v) priors.value = { ...priors.value, [roundId]: v };
  else {
    const next = { ...priors.value };
    delete next[roundId];
    priors.value = next;
  }
}
const priorOpts = computed(() => [
  { label: "This scenario", value: "" },
  ...Object.keys(S.S.plan.scenarios).map((k) => ({
    label: S.S.plan.scenarios[k].label || k,
    value: k,
  })),
]);
const composed = computed(() => walkComposed(S.S.plan, baseScenKey(S.S.plan), priors.value as any));
</script>

<template>
  <!-- COM-72 (Robin's call): the editing surface is a standard LIGHT surface (was a [data-theme=dark]
       panel). Inputs use semantic tokens, so dropping the dark theme lightens the whole view cleanly. -->
  <div class="mx-auto w-full max-w-reading px-3 sm:px-5 text-ink-gray-9">
    <div class="space-y-6">
      <!-- COM-127: the shared editorial PageHeader; the solid "Done" (mere navigation posing as a
           primary) demotes to a ghost back-link -->
      <PageHeader title="The plan everything is measured against.">
        <template #actions>
          <Button variant="ghost" theme="gray" label="Back to overview" route="/overview" />
        </template>
      </PageHeader>

      <!-- COM-95: two-column settings layout — left group rail, right form column -->
      <div class="lg:flex lg:gap-8">
        <nav
          aria-label="Configure sections"
          class="mb-4 lg:mb-0 lg:w-44 shrink-0 flex lg:block gap-1 overflow-x-auto lg:sticky lg:top-20 lg:self-start"
        >
          <button
            v-for="g in GROUPS"
            :key="g.key"
            class="shrink-0 lg:w-full text-left rounded px-2.5 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)]"
            :class="
              group === g.key
                ? 'bg-surface-gray-3 text-ink-gray-9'
                : 'text-ink-gray-7 hover:bg-surface-gray-2'
            "
            :aria-current="group === g.key ? 'true' : undefined"
            @click="group = g.key"
          >
            <span class="block text-sm" :class="group === g.key ? 'font-medium' : ''">{{
              g.label
            }}</span>
            <span class="hidden lg:block text-p-xs text-ink-gray-6">{{ g.desc }}</span>
          </button>
        </nav>

        <div class="flex-1 min-w-0 space-y-6">
          <template v-if="group === 'cap'">
            <!-- roadmap CSV -->
            <div
              class="rounded border border-outline-gray-2 bg-surface-gray-2 p-3 flex items-center gap-2 flex-wrap"
            >
              <span class="section-label">Roadmap CSV</span>
              <input
                ref="csvRef"
                type="file"
                accept=".csv,text/csv"
                class="hidden"
                @change="onCsv"
              />
              <Button
                variant="subtle"
                theme="gray"
                size="sm"
                icon-left="lucide-upload"
                label="Import"
                @click="csvRef?.click()"
              />
              <Button
                variant="subtle"
                theme="gray"
                size="sm"
                icon-left="lucide-file-text"
                label="Download"
                @click="downloadRoadmap"
              />
              <span class="text-p-xs text-ink-gray-6"
                >columns: scope,round,postMoney,raise,esopPct,tgeMult — ingest cap-table /
                dilution-model updates</span
              >
            </div>

            <!-- bridge -->
            <div class="rounded border border-outline-gray-2 bg-surface-gray-2 p-4">
              <div class="section-label mb-3">
                Bridge (fixed grant event) · cap table {{ fNum(S.S.plan.fdPreESOP) }} FD pre-ESOP
              </div>
              <div class="grid sm:grid-cols-4 gap-4">
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">Bridge post-money</div>
                  <NumIn
                    :model-value="S.S.plan.bridge.post"
                    fmt="usd"
                    aria-label="Bridge post"
                    @update:model-value="(v) => setPath(['plan', 'bridge', 'post'], v)"
                  />
                </div>
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">Bridge raise</div>
                  <NumIn
                    :model-value="S.S.plan.bridge.raise"
                    fmt="usd"
                    aria-label="Bridge raise"
                    @update:model-value="(v) => setPath(['plan', 'bridge', 'raise'], v)"
                  />
                </div>
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">ESOP at adoption</div>
                  <Select
                    :model-value="S.S.plan.esopStart"
                    :options="esopOpts"
                    @update:model-value="(v) => setP('esopStart', Number(v))"
                  />
                </div>
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">ESOP cap</div>
                  <NumIn
                    :model-value="S.S.plan.esopCap"
                    fmt="pct"
                    aria-label="ESOP cap"
                    @update:model-value="(v) => setP('esopCap', v)"
                  />
                </div>
              </div>
            </div>

            <!-- rounds -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="section-label">
                  Rounds · priced events after the bridge (order matters)
                </div>
                <Button
                  variant="subtle"
                  theme="gray"
                  size="sm"
                  icon-left="lucide-plus"
                  label="Add round"
                  @click="addRound"
                />
              </div>
              <div class="grid sm:grid-cols-4 gap-2 mb-5">
                <div
                  v-for="(rd, i) in S.S.plan.rounds"
                  :key="rd.id"
                  class="rounded border border-outline-gray-2 bg-surface-gray-2 p-2 flex items-center gap-2"
                >
                  <span class="text-xs text-ink-gray-6 tabular-nums">{{ i + 1 }}</span>
                  <TextInput
                    class="flex-1 min-w-0"
                    size="sm"
                    :model-value="rd.label"
                    :aria-label="`Round ${i + 1} name`"
                    @update:model-value="(v: string) => setPath(['plan', 'rounds', i, 'label'], v)"
                  />
                  <button
                    v-if="S.S.plan.rounds.length > 1"
                    aria-label="Delete round"
                    title="Deleting a round reassigns grants made at it"
                    class="inline-flex shrink-0 items-center justify-center size-8 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6 hover:text-ink-red-3"
                    @click="confirmDelRound(rd)"
                  >
                    <span class="lucide-trash-2 size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <!-- scenarios -->
              <div class="flex items-center justify-between mb-3">
                <div class="section-label">
                  Scenario paths · per-round post-money / ESOP &amp; TGE multiple
                </div>
                <Button
                  variant="subtle"
                  theme="gray"
                  size="sm"
                  icon-left="lucide-plus"
                  label="Add scenario"
                  @click="addScenario"
                />
              </div>
              <div class="space-y-2">
                <div
                  v-for="sk in Object.keys(S.S.plan.scenarios)"
                  :key="sk"
                  class="rounded border p-3"
                  :class="
                    sk === baseScenKey(S.S.plan)
                      ? 'border-outline-amber-2 bg-surface-gray-2'
                      : 'border-outline-gray-2 bg-surface-gray-2'
                  "
                >
                  <div class="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <div class="flex items-center gap-2">
                      <TextInput
                        class="w-40"
                        size="sm"
                        :model-value="S.S.plan.scenarios[sk].label"
                        :aria-label="`Scenario ${sk} name`"
                        @update:model-value="
                          (v: string) => setPath(['plan', 'scenarios', sk, 'label'], v)
                        "
                      />
                      <button
                        class="text-xs px-2 py-0.5 rounded border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--ink-gray-6)]"
                        :class="
                          sk === baseScenKey(S.S.plan)
                            ? 'border-outline-amber-2 text-ink-amber-strong'
                            : 'border-outline-gray-3 text-ink-gray-6'
                        "
                        @click="setP('baseScenario', sk)"
                      >
                        {{ sk === baseScenKey(S.S.plan) ? "★ base" : "set base" }}
                      </button>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs tabular-nums text-ink-gray-6"
                        >exit {{ fUSD(walkScenario(S.S.plan, sk).exit.post) }} ·
                        {{
                          fPct(
                            safeDiv(
                              walkScenario(S.S.plan, sk).byId.bridge.N,
                              walkScenario(S.S.plan, sk).exit.N,
                            ),
                            0,
                          )
                        }}
                        kept · FDV
                        {{ fUSD(tgeFdvFor(S.S.plan, sk, walkScenario(S.S.plan, sk))) }}</span
                      >
                      <button
                        v-if="Object.keys(S.S.plan.scenarios).length > 1"
                        aria-label="Delete scenario"
                        title="Deleting a scenario removes it from every projection"
                        class="inline-flex shrink-0 items-center justify-center size-8 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6 hover:text-ink-red-3"
                        @click="delScenario(sk)"
                      >
                        <span class="lucide-trash-2 size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div class="grid sm:grid-cols-4 gap-3">
                    <div v-for="rd in S.S.plan.rounds" :key="rd.id" class="flex gap-2">
                      <div class="flex-1">
                        <div class="text-xs text-ink-gray-6 mb-1">{{ rd.label }} post</div>
                        <NumIn
                          :model-value="S.S.plan.scenarios[sk][rd.id]?.post"
                          fmt="usd"
                          :aria-label="`${rd.label} post`"
                          @update:model-value="
                            (v) => setPath(['plan', 'scenarios', sk, rd.id, 'post'], v)
                          "
                        />
                      </div>
                      <div class="w-14">
                        <div class="text-xs text-ink-gray-6 mb-1">ESOP</div>
                        <NumIn
                          :model-value="S.S.plan.scenarios[sk][rd.id]?.esop"
                          fmt="pct"
                          aria-label="ESOP"
                          @update:model-value="
                            (v) => setPath(['plan', 'scenarios', sk, rd.id, 'esop'], v)
                          "
                        />
                      </div>
                    </div>
                    <div>
                      <div class="text-xs text-ink-gray-6 mb-1">TGE ×</div>
                      <NumIn
                        :model-value="S.S.plan.scenarios[sk].tgeMult"
                        fmt="mult"
                        aria-label="TGE multiple"
                        @update:model-value="
                          (v) => setPath(['plan', 'scenarios', sk, 'tgeMult'], v)
                        "
                      />
                    </div>
                  </div>
                  <!-- COM-152: the pre-TGE liquidity fallback — token awards re-state 1:1 as
                       equity in THIS scenario (the 16 Apr all-hands position) -->
                  <Switch
                    class="mt-2"
                    :model-value="!!S.S.plan.scenarios[sk].preTgeLiquidity"
                    label="Liquidity event before TGE — token awards re-state 1:1 as equity"
                    @update:model-value="
                      (v: boolean) => setPath(['plan', 'scenarios', sk, 'preTgeLiquidity'], v)
                    "
                  />
                </div>
              </div>
              <div class="grid sm:grid-cols-3 gap-4 mt-3">
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">TGE FDV anchor (round before TGE)</div>
                  <Select
                    :model-value="S.S.plan.tgeAnchor"
                    :options="anchorOpts()"
                    @update:model-value="(v) => setP('tgeAnchor', v)"
                  />
                </div>
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">Upside exit multiple</div>
                  <NumIn
                    :model-value="S.S.plan.exitMultiple"
                    fmt="mult"
                    aria-label="Exit multiple"
                    @update:model-value="(v) => setP('exitMultiple', v)"
                  />
                </div>
                <!-- COM-99: a settings-style toggle is a Switch, not a form Checkbox -->
                <Switch
                  class="pb-1"
                  :model-value="S.S.plan.showBenchmarks"
                  label="Show industry benchmarks ($1B FDV caution)"
                  @update:model-value="(v: boolean) => setP('showBenchmarks', v)"
                />
              </div>
              <div class="text-p-xs mt-2 flex items-center gap-1 text-ink-amber-strong">
                <span class="lucide-triangle-alert size-3" aria-hidden="true" /> TGE multipliers are
                working assumptions — validate against tokenomics before sharing externally.
              </div>
            </div>

            <!-- COM-147: headline observations — the workbook's auto-callouts, engine-generated -->
            <div>
              <div class="section-label mb-3">Headline observations · this path</div>
              <div class="divide-y divide-outline-gray-1">
                <p
                  v-for="o in headlines"
                  :key="o.id"
                  class="py-1.5 text-p-sm text-ink-gray-7 tabular-nums"
                >
                  {{ o.text }}
                </p>
              </div>
            </div>

            <!-- COM-147: the walk-forward prior picker — re-base any round on another scenario's
                 cell (the workbook's "base prior" column); engine walkComposed, preview only -->
            <div>
              <div class="section-label mb-3">Walk priors · re-base rounds on another path</div>
              <div class="flex items-end gap-3 flex-wrap">
                <div v-for="rd in S.S.plan.rounds" :key="rd.id">
                  <div class="text-xs text-ink-gray-6 mb-1">{{ rd.label }} cell from</div>
                  <Select
                    :model-value="priors[rd.id] || ''"
                    :options="priorOpts"
                    :aria-label="`${rd.label} prior`"
                    @update:model-value="(v) => setPrior(rd.id, v)"
                  />
                </div>
                <p class="text-xs tabular-nums text-ink-gray-6 pb-1.5">
                  Composed: exit {{ fNum(composed.exit.N) }} FD · {{ fUSD(composed.exit.post) }} ·
                  founder
                  {{ fPct(safeDiv(S.S.plan.constitution?.issued ?? 0, composed.exit.N), 2) }}
                </p>
              </div>
              <p class="text-p-xs text-ink-gray-6 mt-2">
                A preview, not an edit — the walk recomputes with each selected cell taken from the
                chosen scenario; the saved scenarios are untouched.
              </p>
            </div>

            <!-- COM-147: saved scenario sets — save/duplicate/annotate/star/archive (COM-143) -->
            <div>
              <div class="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <div class="section-label">Scenario sets · saved bundles</div>
                <div class="flex items-center gap-2">
                  <TextInput
                    v-model="newSetName"
                    size="sm"
                    placeholder="Name this path…"
                    aria-label="New set name"
                  />
                  <Button
                    variant="subtle"
                    theme="gray"
                    size="sm"
                    icon-left="lucide-plus"
                    label="Save current"
                    @click="onSaveSet"
                  />
                </div>
              </div>
              <p v-if="!sets.length" class="text-p-xs text-ink-gray-6">
                No saved sets yet — save the current scenario grid to keep a named path (for
                example, "$90m floor per strategy memo") you can switch to or compare later.
              </p>
              <div v-else class="space-y-2">
                <div
                  v-for="s in sets"
                  :key="s.id"
                  class="rounded border p-3"
                  :class="
                    s.starred
                      ? 'border-outline-amber-2 bg-surface-gray-2'
                      : 'border-outline-gray-2 bg-surface-gray-2'
                  "
                >
                  <div class="flex items-center gap-2 flex-wrap">
                    <TextInput
                      class="w-44"
                      size="sm"
                      :model-value="s.label"
                      :aria-label="`Set ${s.label} name`"
                      @update:model-value="(v: string) => updateSet(s.id, { label: v })"
                    />
                    <button
                      class="text-xs px-2 py-0.5 rounded border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--ink-gray-6)]"
                      :class="
                        s.starred
                          ? 'border-outline-amber-2 text-ink-amber-strong'
                          : 'border-outline-gray-3 text-ink-gray-6'
                      "
                      :aria-pressed="!!s.starred"
                      @click="updateSet(s.id, { starred: !s.starred })"
                    >
                      {{ s.starred ? "★ base set" : "set base" }}
                    </button>
                    <span class="ml-auto flex items-center gap-1">
                      <Button
                        variant="subtle"
                        theme="gray"
                        size="sm"
                        icon-left="lucide-copy"
                        label="Duplicate"
                        @click="duplicateSet(s.id)"
                      />
                      <button
                        aria-label="Archive set"
                        title="Archive this set (Undo available)"
                        class="inline-flex shrink-0 items-center justify-center size-8 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6 hover:text-ink-red-3"
                        @click="deleteSet(s.id)"
                      >
                        <span class="lucide-trash-2 size-3.5" aria-hidden="true" />
                      </button>
                    </span>
                  </div>
                  <TextInput
                    class="mt-2"
                    size="sm"
                    :model-value="s.note || ''"
                    placeholder="Annotation — e.g. $90m floor per strategy memo"
                    :aria-label="`Set ${s.label} note`"
                    @update:model-value="(v: string) => updateSet(s.id, { note: v || undefined })"
                  />
                  <p class="text-p-xs text-ink-gray-6 mt-2 tabular-nums">
                    {{ setHeadline(s.id) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- COM-142: constitutional baseline (A.1) — editable position + the Rule 13.10 guardrail -->
            <div>
              <div class="section-label mb-1">Constitutional baseline · Rule 13.10</div>
              <p class="text-p-xs text-ink-gray-6 mb-3">
                {{ ENTITY.legalName }} (t/a {{ ENTITY.tradingAs }}) · {{ ENTITY.jurisdiction }} ·
                {{ ENTITY.regNo }}
              </p>
              <div class="rounded border border-outline-gray-2 bg-surface-gray-2 p-4">
                <div class="grid sm:grid-cols-4 gap-4">
                  <div>
                    <div class="text-xs text-ink-gray-6 mb-1">Authorised shares</div>
                    <NumIn
                      :model-value="S.S.plan.constitution!.authorised"
                      :min="0"
                      aria-label="Authorised shares"
                      @update:model-value="
                        (v) => setPath(['plan', 'constitution', 'authorised'], v)
                      "
                    />
                  </div>
                  <div>
                    <div class="text-xs text-ink-gray-6 mb-1">Issued (Robin, sole holder)</div>
                    <NumIn
                      :model-value="S.S.plan.constitution!.issued"
                      :min="0"
                      aria-label="Issued shares"
                      @update:model-value="(v) => setPath(['plan', 'constitution', 'issued'], v)"
                    />
                  </div>
                  <div>
                    <div
                      class="text-xs text-ink-gray-6 mb-1"
                      title="Rousseau repurchase, 30 Apr 2026 (art. 48)"
                    >
                      Cancelled &amp; available
                    </div>
                    <NumIn
                      :model-value="S.S.plan.constitution!.poolAvailable"
                      :min="0"
                      aria-label="Cancelled and available shares"
                      @update:model-value="
                        (v) => setPath(['plan', 'constitution', 'poolAvailable'], v)
                      "
                    />
                  </div>
                  <div>
                    <div class="text-xs text-ink-gray-6 mb-1">Advisor pool sizing</div>
                    <Select
                      :model-value="S.S.plan.advisorPoolShares"
                      :options="poolOpts"
                      @update:model-value="(v) => setP('advisorPoolShares', Number(v))"
                    />
                  </div>
                </div>
                <p
                  v-if="S.S.plan.advisorPoolShares === 8523"
                  class="text-p-xs text-ink-gray-6 mt-2"
                >
                  The printed 15% cell (8,523) is ~3.5 shares short of its own arithmetic —
                  recomputed {{ fShares(poolSharesExact(S.S.plan, 0.15)) }} at the live FD. Both
                  stay selectable until the Resolution 4/5 blanks land (open decision #1).
                </p>
                <p
                  v-if="guard.level !== 'ok'"
                  role="alert"
                  class="text-p-xs mt-2 flex items-center gap-1"
                  :class="guard.level === 'breach' ? 'text-ink-red-3' : 'text-ink-amber-strong'"
                >
                  <span class="lucide-triangle-alert size-3" aria-hidden="true" />
                  {{ guard.msg }}
                </p>
                <p v-else class="text-p-xs text-ink-gray-6 mt-2">
                  Pool {{ fNum(guard.poolShares) }} of {{ fNum(guard.cap) }} available — within the
                  Constitutional Limit (Rule 13.10).
                </p>
              </div>
            </div>

            <!-- COM-142: FD composition (A.2) — static read-out, label + rows on the canvas -->
            <div>
              <div class="section-label mb-3">Fully-diluted base · SAFEs as-converted</div>
              <div class="divide-y divide-outline-gray-1">
                <div
                  v-for="r in FD_COMPOSITION"
                  :key="r.id"
                  class="flex items-center justify-between py-1.5 text-sm"
                >
                  <span class="text-ink-gray-7">{{ r.label }}</span>
                  <span class="tabular-nums text-ink-gray-9">{{ fShares(r.shares) }}</span>
                </div>
                <div class="flex items-center justify-between py-1.5 text-sm font-medium">
                  <span class="text-ink-gray-9">Live FD pre-ESOP (the walk's starting count)</span>
                  <span class="tabular-nums text-ink-gray-9">{{
                    fShares(S.S.plan.fdPreESOP)
                  }}</span>
                </div>
              </div>
            </div>

            <!-- COM-142: token pools (A.4) — allocation editable, headroom computed by the engine -->
            <div>
              <div class="section-label mb-3">Token pools · live allocation</div>
              <div class="divide-y divide-outline-gray-1">
                <div v-for="(tp, i) in S.S.plan.tokenPools" :key="tp.id" class="py-2">
                  <div class="flex items-center gap-4 text-sm flex-wrap">
                    <span class="text-ink-gray-7 w-20 shrink-0">{{ tp.label }}</span>
                    <span class="flex items-center gap-1.5">
                      <span class="text-xs text-ink-gray-6">pool</span>
                      <NumIn
                        :model-value="tp.poolPct"
                        fmt="pct"
                        :min="0"
                        :max="1"
                        :aria-label="`${tp.label} pool percent`"
                        @update:model-value="
                          (v) => setPath(['plan', 'tokenPools', i, 'poolPct'], v)
                        "
                      />
                    </span>
                    <span class="flex items-center gap-1.5">
                      <span class="text-xs text-ink-gray-6">allocated</span>
                      <NumIn
                        :model-value="tp.allocatedPct"
                        fmt="pct"
                        :min="0"
                        :max="1"
                        :aria-label="`${tp.label} allocated percent`"
                        @update:model-value="
                          (v) => setPath(['plan', 'tokenPools', i, 'allocatedPct'], v)
                        "
                      />
                    </span>
                    <span class="ml-auto text-xs tabular-nums text-ink-gray-6"
                      >headroom
                      <span class="text-ink-gray-9">{{
                        fPct(tokenPoolHeadroom(tp), 3)
                      }}</span></span
                    >
                  </div>
                  <p v-if="tp.note" class="text-p-xs text-ink-gray-6 mt-0.5">{{ tp.note }}</p>
                </div>
              </div>
            </div>
          </template>

          <template v-if="group === 'grants'">
            <!-- COM-150 (Δ1): dollar value bands — the negotiation unit; % is an output.
                 Anchors are open decision #2 (pending Robin + Carl review). -->
            <div>
              <div class="section-label mb-3">Value bands · annual $ (the negotiation unit)</div>
              <div class="divide-y divide-outline-gray-1">
                <div
                  v-for="(b, bi) in S.S.plan.valueBands"
                  :key="b.id"
                  class="flex items-center justify-between py-1.5 text-sm gap-4"
                >
                  <span class="text-ink-gray-7">{{ b.label }}</span>
                  <span class="flex items-center gap-1.5">
                    <NumIn
                      :model-value="b.annualUSD"
                      fmt="usd"
                      :min="0"
                      :aria-label="`${b.label} band annual value`"
                      @update:model-value="
                        (v) => setPath(['plan', 'valueBands', bi, 'annualUSD'], v)
                      "
                    />
                    <span class="text-xs text-ink-gray-6">/yr</span>
                  </span>
                </div>
              </div>
              <p class="text-p-xs text-ink-gray-6 mt-2">
                Anchor numbers are pending Robin + Carl Sjöström review (open decision #2) —
                packages denominate in dollars and deliver in instruments; percent-of-company is an
                output, never the negotiation unit.
              </p>
            </div>

            <!-- COM-154: the cash-floor policy — default disallowed (open decision #3) -->
            <div>
              <div class="section-label mb-3">Cash floor · certainty traded from the package</div>
              <div class="rounded border border-outline-gray-2 bg-surface-gray-2 p-4 space-y-4">
                <Switch
                  :model-value="!!S.S.plan.cashFloor?.enabled"
                  label="Allow cash floors — advisors may trade instrument value for cash certainty"
                  @update:model-value="(v: boolean) => setPath(['plan', 'cashFloor', 'enabled'], v)"
                />
                <div v-if="S.S.plan.cashFloor?.enabled" class="grid sm:grid-cols-3 gap-4">
                  <div>
                    <div class="text-xs text-ink-gray-6 mb-1">
                      Exchange rate ($ value per $1 cash)
                    </div>
                    <NumIn
                      :model-value="S.S.plan.cashFloor.exchangeRate"
                      fmt="mult"
                      :min="0.1"
                      aria-label="Cash floor exchange rate"
                      @update:model-value="(v) => setPath(['plan', 'cashFloor', 'exchangeRate'], v)"
                    />
                  </div>
                  <div>
                    <div class="text-xs text-ink-gray-6 mb-1">Monthly burn</div>
                    <NumIn
                      :model-value="S.S.plan.cashFloor.monthlyBurnUSD"
                      fmt="usd"
                      :min="0"
                      aria-label="Monthly burn"
                      @update:model-value="
                        (v) => setPath(['plan', 'cashFloor', 'monthlyBurnUSD'], v)
                      "
                    />
                  </div>
                  <div>
                    <div class="text-xs text-ink-gray-6 mb-1">Affordability cap (% of burn)</div>
                    <NumIn
                      :model-value="S.S.plan.cashFloor.maxPctOfBurn"
                      fmt="pct"
                      :min="0.01"
                      :max="1"
                      aria-label="Affordability cap"
                      @update:model-value="(v) => setPath(['plan', 'cashFloor', 'maxPctOfBurn'], v)"
                    />
                  </div>
                </div>
              </div>
              <p class="text-p-xs text-ink-gray-6 mt-2">
                Disabled by default — cash-floor policy is open decision #3. When enabled, an
                advisor's elected floor is bought from the instrument legs at the exchange rate, and
                the Board view warns when total cash commitments pass the affordability cap.
              </p>
            </div>

            <!-- uniform base + pools -->
            <div class="rounded border border-outline-gray-2 bg-surface-gray-2 p-4">
              <div class="section-label mb-3">Uniform base · tokens &amp; pools</div>
              <div class="grid sm:grid-cols-4 gap-4">
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">Base equity %</div>
                  <NumIn
                    :model-value="S.S.plan.baseGrant.equityPct"
                    fmt="pct"
                    aria-label="Base equity"
                    @update:model-value="(v) => setPath(['plan', 'baseGrant', 'equityPct'], v)"
                  />
                </div>
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">Base token %</div>
                  <NumIn
                    :model-value="S.S.plan.baseGrant.tokenPct"
                    fmt="pct"
                    aria-label="Base token"
                    @update:model-value="(v) => setPath(['plan', 'baseGrant', 'tokenPct'], v)"
                  />
                </div>
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">Advisor token pool</div>
                  <NumIn
                    :model-value="S.S.plan.advisorTokenPoolPct"
                    fmt="pct"
                    aria-label="Advisor token pool"
                    @update:model-value="(v) => setP('advisorTokenPoolPct', v)"
                  />
                </div>
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">…committed (ecosystem)</div>
                  <NumIn
                    :model-value="S.S.plan.committedAdvisorTokenPct"
                    fmt="pct"
                    aria-label="Committed"
                    @update:model-value="(v) => setP('committedAdvisorTokenPct', v)"
                  />
                </div>
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">Board bucket (ring-fenced)</div>
                  <NumIn
                    :model-value="S.S.plan.boardTokenBucketPct"
                    fmt="pct"
                    aria-label="Board bucket"
                    @update:model-value="(v) => setP('boardTokenBucketPct', v)"
                  />
                </div>
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">Token supply</div>
                  <NumIn
                    :model-value="S.S.plan.tokenSupply"
                    aria-label="Token supply"
                    @update:model-value="(v) => setP('tokenSupply', v)"
                  />
                </div>
                <!-- COM-139 (Δ4): the CoC-acceleration control is GONE — Plan rules v9 deleted
                     Rule 9.2, and the engine never computed with cocAccelPct (an inert field;
                     it stays in state untouched, so no schema change). -->
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">Equity vest yrs</div>
                  <NumIn
                    :model-value="S.S.plan.equityVestYears"
                    aria-label="Equity vest years"
                    @update:model-value="(v) => setP('equityVestYears', v)"
                  />
                </div>
                <div>
                  <!-- COM-106: the Advisors FormControl date idiom (COM-72/77) -->
                  <FormControl
                    type="date"
                    label="TGE date"
                    size="sm"
                    :model-value="S.S.plan.tgeDate"
                    @update:model-value="(v: string) => setP('tgeDate', v)"
                  />
                </div>
              </div>
            </div>

            <!-- capital schedule -->
            <div class="rounded border border-outline-gray-2 bg-surface-gray-2 p-4">
              <div class="section-label mb-3">Capital-introduced schedule</div>
              <div class="grid sm:grid-cols-4 gap-4">
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">Per (USD)</div>
                  <NumIn
                    :model-value="S.S.plan.capitalUplift.per"
                    fmt="usd"
                    aria-label="Per"
                    @update:model-value="(v) => setPath(['plan', 'capitalUplift', 'per'], v)"
                  />
                </div>
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">Adds %base</div>
                  <NumIn
                    :model-value="S.S.plan.capitalUplift.pct"
                    fmt="pct"
                    aria-label="Adds"
                    @update:model-value="(v) => setPath(['plan', 'capitalUplift', 'pct'], v)"
                  />
                </div>
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">Cap %base</div>
                  <NumIn
                    :model-value="S.S.plan.capitalUplift.cap"
                    fmt="pct"
                    aria-label="Cap"
                    @update:model-value="(v) => setPath(['plan', 'capitalUplift', 'cap'], v)"
                  />
                </div>
                <div>
                  <div class="text-xs text-ink-gray-6 mb-1">Gate</div>
                  <Select
                    :model-value="S.S.plan.capitalUplift.gate"
                    :options="msOpts()"
                    @update:model-value="(v) => setPath(['plan', 'capitalUplift', 'gate'], v)"
                  />
                </div>
              </div>
            </div>
          </template>

          <template v-if="group === 'perf'">
            <!-- COM-155: the review cadence (open decision #4 — configurable, default 12) -->
            <div
              class="rounded border border-outline-gray-2 bg-surface-gray-2 p-3 flex items-center gap-3 flex-wrap"
            >
              <span class="section-label">Review cadence</span>
              <NumIn
                :model-value="S.S.plan.reviewCadenceMonths ?? 12"
                :min="1"
                :max="60"
                aria-label="Review cadence months"
                @update:model-value="(v) => setP('reviewCadenceMonths', v)"
              />
              <span class="text-p-xs text-ink-gray-6"
                >months between scheduled checkpoints (open decision #4 — 6 or 12 under discussion);
                event-triggered reviews ride fundraising closes</span
              >
            </div>

            <!-- objectives -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="section-label">Objectives</div>
                <Button
                  variant="subtle"
                  theme="gray"
                  size="sm"
                  icon-left="lucide-plus"
                  label="Add"
                  @click="addObjective"
                />
              </div>
              <div class="space-y-2">
                <div
                  v-for="(o, i) in S.S.objectives"
                  :key="o.id"
                  class="rounded border border-outline-gray-2 bg-surface-gray-2 p-3 grid sm:grid-cols-12 gap-3 items-center"
                >
                  <TextInput
                    class="sm:col-span-3"
                    size="sm"
                    :model-value="o.label"
                    :aria-label="`Objective ${i + 1} label`"
                    @update:model-value="(v: string) => setPath(['objectives', i, 'label'], v)"
                  />
                  <div class="sm:col-span-2">
                    <Select
                      :model-value="o.category"
                      :options="CAT_OPTIONS"
                      @update:model-value="(v) => setPath(['objectives', i, 'category'], v)"
                    />
                  </div>
                  <TextInput
                    class="sm:col-span-4"
                    size="sm"
                    :model-value="o.trigger"
                    :aria-label="`Objective ${i + 1} trigger`"
                    @update:model-value="(v: string) => setPath(['objectives', i, 'trigger'], v)"
                  />
                  <div class="sm:col-span-1">
                    <div class="text-xs text-ink-gray-6 mb-1">Uplift</div>
                    <NumIn
                      :model-value="o.uplift"
                      fmt="pct"
                      aria-label="Uplift"
                      @update:model-value="(v) => setPath(['objectives', i, 'uplift'], v)"
                    />
                  </div>
                  <div class="sm:col-span-1">
                    <Select
                      :model-value="o.gate"
                      :options="msOpts()"
                      @update:model-value="(v) => setPath(['objectives', i, 'gate'], v)"
                    />
                  </div>
                  <button
                    aria-label="Delete objective"
                    title="Deleting an objective scrubs it from every advisor"
                    class="sm:col-span-1 justify-self-end inline-flex shrink-0 items-center justify-center size-8 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6 hover:text-ink-red-3"
                    @click="delObjective(o.id)"
                  >
                    <span class="lucide-trash-2 size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            <!-- tiers -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="section-label">Tiers · multiplier on the uniform base</div>
                <Button
                  variant="subtle"
                  theme="gray"
                  size="sm"
                  icon-left="lucide-plus"
                  label="Add tier"
                  @click="addTier"
                />
              </div>
              <div class="grid sm:grid-cols-3 gap-4">
                <div
                  v-for="(t, i) in S.S.tiers"
                  :key="i"
                  class="rounded border border-outline-gray-2 bg-surface-gray-2 p-4"
                >
                  <div class="flex items-center justify-between mb-3 gap-2">
                    <TextInput
                      class="flex-1 min-w-0"
                      size="sm"
                      :model-value="t.name"
                      :aria-label="`Tier ${i + 1} name`"
                      @update:model-value="(v: string) => setPath(['tiers', i, 'name'], v)"
                    />
                    <button
                      v-if="S.S.tiers.length > 1"
                      aria-label="Delete tier"
                      title="Deleting a tier re-clamps advisors assigned to it"
                      class="inline-flex shrink-0 items-center justify-center size-8 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6 hover:text-ink-red-3"
                      @click="delTier(i)"
                    >
                      <span class="lucide-trash-2 size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <div class="text-xs text-ink-gray-6 mb-1">Multiplier</div>
                      <NumIn
                        :model-value="t.mult"
                        fmt="mult"
                        aria-label="Multiplier"
                        @update:model-value="(v) => setPath(['tiers', i, 'mult'], v)"
                      />
                    </div>
                    <div>
                      <div class="text-xs text-ink-gray-6 mb-1">= Equity</div>
                      <div class="font-display text-lg tabular-nums text-ink-gray-9">
                        {{ fPct(S.S.plan.baseGrant.equityPct * (t.mult || 1), 2) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- milestones -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="section-label">
                  Milestones · gates for performance uplift (in order)
                </div>
                <Button
                  variant="subtle"
                  theme="gray"
                  size="sm"
                  icon-left="lucide-plus"
                  label="Add milestone"
                  @click="addMilestone"
                />
              </div>
              <div class="grid sm:grid-cols-4 gap-2">
                <div
                  v-for="(m, i) in S.S.plan.milestones"
                  :key="m.id"
                  class="rounded border border-outline-gray-2 bg-surface-gray-2 p-2 flex items-center gap-2"
                >
                  <span class="text-xs text-ink-gray-6 tabular-nums">{{ i + 1 }}</span>
                  <TextInput
                    class="flex-1 min-w-0"
                    size="sm"
                    :model-value="m.label"
                    :aria-label="`Milestone ${i + 1} name`"
                    @update:model-value="
                      (v: string) => setPath(['plan', 'milestones', i, 'label'], v)
                    "
                  />
                  <button
                    v-if="S.S.plan.milestones.length > 1"
                    aria-label="Delete milestone"
                    title="Deleting a milestone reassigns the objectives gated on it"
                    class="inline-flex shrink-0 items-center justify-center size-8 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6 hover:text-ink-red-3"
                    @click="confirmDelMilestone(m)"
                  >
                    <span class="lucide-trash-2 size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div class="text-p-xs mt-2 text-ink-gray-6">
                Order sets gating: an objective counts once the company stage reaches its gate.
                Deleting a milestone reassigns dependent gates to the first.
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
