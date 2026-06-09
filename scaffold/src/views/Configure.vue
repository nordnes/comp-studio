<script setup lang="ts">
// Configure (Section VI) — the editing surface. Dark Espresso panel via [data-theme="dark"] (semantic
// tokens flip automatically). Every structural list (rounds/scenarios/tiers/milestones/objectives) edits
// through the store's reducer-parity actions incl. delete-cascades. Numbers use the shared NumIn editor.
import { ref } from "vue";
import { Button, Select, Checkbox } from "frappe-ui";
import { useStudio } from "../store";
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
} from "../engine";
import { CAT_OPTIONS } from "../constants";
import NumIn from "../components/NumIn.vue";
import { confirmDestroy } from "../confirm";

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
} = useStudio();

const S = store; // reactive
const setP = (k: string, v: any) => setPath(["plan", k], v);

const csvRef = ref<HTMLInputElement | null>(null);
function onCsv(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) importRoadmap(f);
  (e.target as HTMLInputElement).value = "";
}

const esopOpts = [
  { label: "10%", value: 0.1 },
  { label: "15%", value: 0.15 },
];
const anchorOpts = () =>
  roundList(S.S.plan).map((r) => ({ label: roundLabel(S.S.plan, r), value: r }));
const msOpts = () => S.S.plan.milestones.map((m) => ({ label: m.label, value: m.id }));
</script>

<template>
  <div
    data-theme="dark"
    class="-mx-3 sm:-mx-5 -my-6 sm:-my-8 min-h-[calc(100vh-3rem)] bg-surface-white text-ink-gray-9"
  >
    <div class="mx-auto w-full max-w-7xl px-3 sm:px-5 py-8 space-y-6">
      <!-- header -->
      <div class="flex justify-between items-center gap-3 flex-wrap">
        <div>
          <div class="text-sm text-ink-amber-strong">Configure</div>
          <h1 class="font-display text-2xl mt-1 text-ink-gray-9">Plan basis &amp; controls</h1>
        </div>
        <Button
          variant="solid"
          theme="gray"
          icon-left="lucide-check"
          label="Done"
          route="/overview"
        />
      </div>

      <!-- roadmap CSV -->
      <div
        class="rounded border border-outline-gray-2 bg-surface-gray-2 p-3 flex items-center gap-2 flex-wrap"
      >
        <span class="text-sm text-ink-amber-strong">Roadmap CSV</span>
        <input ref="csvRef" type="file" accept=".csv,text/csv" class="hidden" @change="onCsv" />
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
          >columns: scope,round,postMoney,raise,esopPct,tgeMult — ingest cap-table / dilution-model
          updates</span
        >
      </div>

      <!-- bridge -->
      <div class="rounded border border-outline-gray-2 bg-surface-gray-2 p-4">
        <div class="text-sm text-ink-amber-strong mb-3">
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
          <div class="text-sm text-ink-amber-strong">
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
            <input
              :value="rd.label"
              :aria-label="`Round ${i + 1} name`"
              class="flex-1 min-w-0 bg-transparent border-b border-outline-gray-3 text-sm text-ink-gray-9 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--ink-gray-6)] py-1"
              @input="
                (e) => setPath(['plan', 'rounds', i, 'label'], (e.target as HTMLInputElement).value)
              "
            />
            <button
              v-if="S.S.plan.rounds.length > 1"
              aria-label="Delete round"
              class="inline-flex shrink-0 items-center justify-center size-8 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6 hover:text-ink-red-3"
              @click="
                confirmDestroy(
                  'Delete round',
                  'Deleting a round removes it from every scenario. Continue?',
                  () => delRound(rd.id),
                )
              "
            >
              <span class="lucide-trash-2 size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <!-- scenarios -->
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm text-ink-amber-strong">
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
                <input
                  :value="S.S.plan.scenarios[sk].label"
                  :aria-label="`Scenario ${sk} name`"
                  class="bg-transparent border-b border-outline-gray-3 text-ink-gray-9 font-display outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--ink-gray-6)] py-0.5 w-40"
                  @input="
                    (e) =>
                      setPath(
                        ['plan', 'scenarios', sk, 'label'],
                        (e.target as HTMLInputElement).value,
                      )
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
                  kept · FDV {{ fUSD(tgeFdvFor(S.S.plan, sk, walkScenario(S.S.plan, sk))) }}</span
                >
                <button
                  v-if="Object.keys(S.S.plan.scenarios).length > 1"
                  aria-label="Delete scenario"
                  class="inline-flex shrink-0 items-center justify-center size-8 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6 hover:text-ink-red-3"
                  @click="
                    confirmDestroy('Delete scenario', 'Delete this scenario path?', () =>
                      delScenario(sk),
                    )
                  "
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
                  @update:model-value="(v) => setPath(['plan', 'scenarios', sk, 'tgeMult'], v)"
                />
              </div>
            </div>
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
          <label class="flex items-end gap-2 text-sm pb-1 text-ink-gray-7"
            ><Checkbox
              :model-value="S.S.plan.showBenchmarks"
              @update:model-value="(v) => setP('showBenchmarks', v)"
            />
            Show industry benchmarks ($1B FDV caution)</label
          >
        </div>
        <div class="text-p-xs mt-2 flex items-center gap-1 text-ink-amber-strong">
          <span class="lucide-triangle-alert size-3" aria-hidden="true" /> TGE multipliers are
          working assumptions — validate against tokenomics before sharing externally.
        </div>
      </div>

      <!-- uniform base + pools -->
      <div class="rounded border border-outline-gray-2 bg-surface-gray-2 p-4">
        <div class="text-sm text-ink-amber-strong mb-3">Uniform base · tokens &amp; pools</div>
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
          <div>
            <div class="text-xs text-ink-gray-6 mb-1">CoC acceleration</div>
            <NumIn
              :model-value="S.S.plan.cocAccelPct"
              fmt="pct"
              aria-label="CoC acceleration"
              @update:model-value="(v) => setP('cocAccelPct', v)"
            />
          </div>
          <div>
            <div class="text-xs text-ink-gray-6 mb-1">Equity vest yrs</div>
            <NumIn
              :model-value="S.S.plan.equityVestYears"
              aria-label="Equity vest years"
              @update:model-value="(v) => setP('equityVestYears', v)"
            />
          </div>
          <div>
            <div class="text-xs text-ink-gray-6 mb-1">TGE date</div>
            <input
              type="date"
              :value="S.S.plan.tgeDate"
              aria-label="TGE date"
              class="w-full bg-surface-white border border-outline-gray-3 rounded px-2 py-1 text-sm text-ink-gray-9 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--ink-gray-6)]"
              @input="(e) => setP('tgeDate', (e.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>

      <!-- capital schedule -->
      <div class="rounded border border-outline-gray-2 bg-surface-gray-2 p-4">
        <div class="text-sm text-ink-amber-strong mb-3">Capital-introduced schedule</div>
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

      <!-- objectives -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm text-ink-amber-strong">Objectives</div>
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
            <input
              :value="o.label"
              :aria-label="`Objective ${i + 1} label`"
              class="sm:col-span-3 bg-surface-white border border-outline-gray-3 rounded px-2 py-1 text-sm text-ink-gray-9 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--ink-gray-6)]"
              @input="
                (e) => setPath(['objectives', i, 'label'], (e.target as HTMLInputElement).value)
              "
            />
            <div class="sm:col-span-2">
              <Select
                :model-value="o.category"
                :options="CAT_OPTIONS"
                @update:model-value="(v) => setPath(['objectives', i, 'category'], v)"
              />
            </div>
            <input
              :value="o.trigger"
              :aria-label="`Objective ${i + 1} trigger`"
              class="sm:col-span-4 bg-surface-white border border-outline-gray-3 rounded px-2 py-1 text-xs text-ink-gray-7 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--ink-gray-6)]"
              @input="
                (e) => setPath(['objectives', i, 'trigger'], (e.target as HTMLInputElement).value)
              "
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
              class="sm:col-span-1 justify-self-end inline-flex shrink-0 items-center justify-center size-8 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6 hover:text-ink-red-3"
              @click="
                confirmDestroy(
                  'Delete objective',
                  'This removes the objective from every advisor performance list. Continue?',
                  () => delObjective(o.id),
                )
              "
            >
              <span class="lucide-trash-2 size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <!-- tiers -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm text-ink-amber-strong">Tiers · multiplier on the uniform base</div>
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
              <input
                :value="t.name"
                :aria-label="`Tier ${i + 1} name`"
                class="flex-1 min-w-0 bg-transparent border-b border-outline-gray-3 font-display text-lg text-ink-gray-9 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--ink-gray-6)]"
                @input="(e) => setPath(['tiers', i, 'name'], (e.target as HTMLInputElement).value)"
              />
              <button
                v-if="S.S.tiers.length > 1"
                aria-label="Delete tier"
                class="inline-flex shrink-0 items-center justify-center size-8 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6 hover:text-ink-red-3"
                @click="
                  confirmDestroy(
                    'Delete tier',
                    'Advisors on higher tiers shift down. Continue?',
                    () => delTier(i),
                  )
                "
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
          <div class="text-sm text-ink-amber-strong">
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
            <input
              :value="m.label"
              :aria-label="`Milestone ${i + 1} name`"
              class="flex-1 min-w-0 bg-transparent border-b border-outline-gray-3 text-sm text-ink-gray-9 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--ink-gray-6)] py-1"
              @input="
                (e) =>
                  setPath(['plan', 'milestones', i, 'label'], (e.target as HTMLInputElement).value)
              "
            />
            <button
              v-if="S.S.plan.milestones.length > 1"
              aria-label="Delete milestone"
              class="inline-flex shrink-0 items-center justify-center size-8 rounded hover:bg-surface-gray-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink-gray-6)] text-ink-gray-6 hover:text-ink-red-3"
              @click="
                confirmDestroy(
                  'Delete milestone',
                  'Dependent stage and objective gates reassign to the first milestone. Continue?',
                  () => delMilestone(m.id),
                )
              "
            >
              <span class="lucide-trash-2 size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div class="text-p-xs mt-2 text-ink-gray-6">
          Order sets gating: an objective counts once the company stage reaches its gate. Deleting a
          milestone reassigns dependent gates to the first.
        </div>
      </div>
    </div>
  </div>
</template>
