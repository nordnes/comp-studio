<script setup lang="ts">
// COM-76: the per-advisor package editor, extracted from Advisors into a global frappe-ui Dialog
// (mounted once in App.vue). Edits the currently-selected advisor live via setPath (autosave); snapshots
// on open and restores on Cancel. Carries the COM-73 field set + COM-77 FormLabel/:description/clamp stack.
import { ref, reactive, computed, watch } from "vue";
import { Dialog, Button, Switch, TabButtons, Divider, FormControl, FormLabel } from "frappe-ui";
import { useStudio } from "../store";
import { useEditor } from "../composables/useEditor";
import {
  fUSD,
  fPct,
  fMult,
  roundList,
  roundLabel,
  SECTORS,
  stageReached,
  todayISO,
} from "../engine";
import { CAT } from "../constants";
import NumIn from "./NumIn.vue";
import EquityBenchmark from "./EquityBenchmark.vue";
import Term from "./Term.vue";

const { store, selected, setPath } = useStudio();
const { open } = useEditor();
const S = computed(() => store.S);
const sel = computed(() => selected.value?.a as any);
const c = computed(() => selected.value?.c as any);
const i = computed(() => S.value.advisors.findIndex((a: any) => a.id === sel.value?.id));
const ms = computed(() =>
  Object.fromEntries(S.value.plan.milestones.map((m: any) => [m.id, m.label])),
);
const dialogOptions = computed(() => ({
  title: sel.value ? `Edit package · ${sel.value.name}` : "Edit package",
  size: "lg" as const,
}));

// Snapshot on open; Cancel restores it (revert), Save keeps the live edits. JSON clone — structuredClone
// throws on Vue's reactive proxy.
const cloneAdv = (a: any) => JSON.parse(JSON.stringify(a));
const snapshot = ref<any>(null);
const isDirty = computed(
  () =>
    !!snapshot.value && !!sel.value && JSON.stringify(sel.value) !== JSON.stringify(snapshot.value),
);
watch(open, (v) => {
  snapshot.value = v && sel.value ? cloneAdv(sel.value) : null;
});
function cancel(close: () => void) {
  if (snapshot.value) setPath(["advisors", i.value], cloneAdv(snapshot.value));
  snapshot.value = null;
  close();
}
function save(close: () => void) {
  snapshot.value = null;
  close();
}

function setField(k: string, v: any) {
  setPath(["advisors", i.value, k], v);
}
// COM-77: surface a NumIn clamp as a transient red helper under the field (FormControl has no :error slot).
const clampMsgs = reactive<Record<string, string>>({});
const clampTimers: Record<string, ReturnType<typeof setTimeout>> = {};
function onClamp(key: string, message: string) {
  clampMsgs[key] = message;
  clearTimeout(clampTimers[key]);
  clampTimers[key] = setTimeout(() => delete clampMsgs[key], 4000);
}
function setPerfField(k: string, v: any) {
  const perf: any = { ...sel.value.performance };
  perf[k] = v;
  setPath(["advisors", i.value, "performance"], perf);
}
function objState(id: string) {
  const p: any = sel.value.performance || {};
  return p.achieved?.includes(id) ? "earned" : p.targeted?.includes(id) ? "targeted" : "off";
}
function setObjState(id: string, st: string) {
  const p: any = sel.value.performance || { achieved: [], targeted: [] };
  const a = new Set<string>(p.achieved || []);
  const t = new Set<string>(p.targeted || []);
  a.delete(id);
  t.delete(id);
  if (st === "earned") a.add(id);
  if (st === "targeted") t.add(id);
  setPath(["advisors", i.value, "performance"], { ...p, achieved: [...a], targeted: [...t] });
}
</script>

<template>
  <Dialog v-model="open" :options="dialogOptions">
    <template #body-content>
      <div v-if="sel" class="space-y-5">
        <!-- Identity -->
        <div class="space-y-4">
          <div class="section-label">Identity</div>
          <FormControl
            type="text"
            label="Name"
            size="sm"
            :model-value="sel.name"
            @update:model-value="(v) => setField('name', v)"
          />
          <FormControl
            type="select"
            label="Sector"
            size="sm"
            :model-value="sel.sector"
            :options="SECTORS.map((s) => ({ label: s, value: s }))"
            @update:model-value="(v) => setField('sector', v)"
          />
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <FormLabel label="Engagement (yrs)" />
              <NumIn
                :model-value="sel.years"
                :min="1"
                :max="10"
                aria-label="Years"
                @update:model-value="(v) => setField('years', v)"
                @clamp="(m) => onClamp('years', m)"
              />
              <p v-if="clampMsgs.years" role="alert" class="text-p-xs text-ink-red-3">
                {{ clampMsgs.years }}
              </p>
            </div>
            <FormControl
              type="date"
              label="Start date"
              description="Anchors vesting & TGE offset"
              size="sm"
              :model-value="sel.startDate || todayISO()"
              @update:model-value="(v) => setField('startDate', v)"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <FormControl
              type="select"
              label="Granted at"
              description="Sets the strike basis & dilution path"
              size="sm"
              :model-value="sel.grantRound || 'bridge'"
              :options="roundList(S.plan).map((r) => ({ label: roundLabel(S.plan, r), value: r }))"
              @update:model-value="(v) => setField('grantRound', v)"
            />
            <FormControl
              type="select"
              label="Tax residency"
              description="Recorded for the offer; not modelled"
              size="sm"
              :model-value="sel.taxResidency || 'Other'"
              :options="['UK', 'US', 'Other'].map((t) => ({ label: t, value: t }))"
              @update:model-value="(v) => setField('taxResidency', v)"
            />
          </div>
          <FormControl
            type="textarea"
            label="Notes"
            size="sm"
            :rows="2"
            :model-value="sel.notes"
            @update:model-value="(v) => setField('notes', v)"
          />
        </div>

        <Divider />

        <!-- Base grant -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="section-label">Base grant</div>
            <TabButtons
              :model-value="sel.mode"
              :buttons="[
                { label: 'By tier', value: 'tier' },
                { label: 'By $ value', value: 'value' },
              ]"
              @update:model-value="(v) => setField('mode', v)"
            />
          </div>
          <!-- COM-78: the denomination switch explains itself — neither mode's inputs are lost -->
          <p class="text-p-xs text-ink-gray-6">
            {{
              sel.mode === "tier"
                ? "Uniform base × tier multiplier — your $-value inputs are preserved when you switch."
                : "Target annual value converted to eq% / tok% at the base-case path — your tier selection is preserved."
            }}
          </p>
          <template v-if="sel.mode === 'tier'">
            <div
              class="flex items-center gap-2 text-xs px-3 py-2 rounded bg-surface-gray-2 text-ink-gray-7"
            >
              <span class="lucide-layers size-3.5" aria-hidden="true" /> Uniform base
              {{ fPct(S.plan.baseGrant.equityPct, 2) }} eq ·
              {{ fPct(S.plan.baseGrant.tokenPct, 2) }} tok, <Term k="tierMultiplier">×tier</Term>
            </div>
            <!-- COM-79: ONE aligned selectable list (name | ×mult | eq·tok in fixed slots) replaces
                 the 3-up mini-card grid — amber bg = the selected tier (the current-case meaning) -->
            <div
              class="rounded border border-outline-gray-2 divide-y divide-outline-gray-1"
              aria-label="Tier"
            >
              <button
                v-for="(t, ti) in S.tiers"
                :key="ti"
                type="button"
                :aria-pressed="sel.tier === ti"
                class="grid w-full grid-cols-[1fr_4rem_10rem] items-center gap-3 px-3 py-2 text-left first:rounded-t last:rounded-b focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ink-gray-6)]"
                :class="sel.tier === ti ? 'bg-surface-amber-2' : 'hover:bg-surface-gray-1'"
                @click="setField('tier', ti)"
              >
                <span class="text-sm font-medium text-ink-gray-9 truncate">{{ t.name }}</span>
                <span class="text-xs tabular-nums text-ink-gray-7">
                  <Term k="tierMultiplier">{{ fMult(t.mult) }}</Term>
                </span>
                <span class="text-xs tabular-nums text-right text-ink-gray-6">
                  {{ fPct(S.plan.baseGrant.equityPct * t.mult, 1) }} eq ·
                  {{ fPct(S.plan.baseGrant.tokenPct * t.mult, 1) }} tok
                </span>
              </button>
            </div>
            <EquityBenchmark :sel="sel" :c="c" />
          </template>
          <template v-else>
            <div class="space-y-1.5">
              <FormLabel label="Annual value (USD)" />
              <NumIn
                :model-value="sel.annualValue"
                fmt="usd"
                :min="0"
                aria-label="Annual value"
                @update:model-value="(v) => setField('annualValue', v)"
                @clamp="(m) => onClamp('annualValue', m)"
              />
              <p v-if="clampMsgs.annualValue" role="alert" class="text-p-xs text-ink-red-3">
                {{ clampMsgs.annualValue }}
              </p>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-ink-gray-7">Options / tokens split</span
                ><span class="tabular-nums text-ink-gray-9"
                  >{{ fPct(sel.splitOptions, 0) }} / {{ fPct(1 - sel.splitOptions, 0) }}</span
                >
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                :value="sel.splitOptions"
                aria-label="Options / tokens split"
                :aria-valuetext="`${fPct(sel.splitOptions, 0)} options, ${fPct(1 - sel.splitOptions, 0)} tokens`"
                class="w-full"
                style="accent-color: var(--chart-capital)"
                @input="
                  (e) => setField('splitOptions', Number((e.target as HTMLInputElement).value))
                "
              />
            </div>
            <!-- COM-78: the resolved denomination, read from the existing engine computed —
                 value mode shows its eq/tok the same way the tier cards show theirs -->
            <div v-if="c" class="text-xs tabular-nums text-ink-gray-6">
              Resolves to {{ fPct(c.baseEq, 2) }} eq · {{ fPct(c.baseTk, 3) }} tok at the base-case
              path
            </div>
          </template>
          <Divider />
          <!-- COM-99: a settings-style toggle (it gates the Annual cash field) is a Switch -->
          <Switch
            :model-value="sel.hasCash"
            label="Cash retainer (post-Series A)"
            @update:model-value="(v: boolean) => setField('hasCash', v)"
          />
          <div v-if="sel.hasCash" class="space-y-1.5">
            <FormLabel label="Annual cash (USD)" />
            <NumIn
              :model-value="sel.cashAnnual"
              fmt="usd"
              :min="0"
              aria-label="Cash"
              @update:model-value="(v) => setField('cashAnnual', v)"
              @clamp="(m) => onClamp('cashAnnual', m)"
            />
            <p v-if="clampMsgs.cashAnnual" role="alert" class="text-p-xs text-ink-red-3">
              {{ clampMsgs.cashAnnual }}
            </p>
          </div>
        </div>

        <Divider />

        <!-- Performance — COM-118: neutral surface (the amber wash said "important", not "current");
             the small amber icon keeps the warmth, state colors below carry the meaning -->
        <div class="rounded border border-outline-gray-1 bg-surface-gray-1 p-5 space-y-4">
          <div class="flex items-center gap-2">
            <span class="lucide-trending-up size-4 text-ink-amber-strong" aria-hidden="true" />
            <div class="section-label">Performance</div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-ink-gray-7">Capital introduced · by channel</span
              ><span
                class="font-display tabular-nums"
                :class="c.capEarned > 0 ? 'text-ink-green-3' : 'text-ink-amber-strong'"
                >+{{ (c.capRaw * 100).toFixed(0) }}%<span
                  v-if="c.capEarned < c.capRaw"
                  class="ml-1 text-xs font-sans text-ink-amber-strong"
                  ><Term k="awaitingGate">pending</Term></span
                ></span
              >
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <div class="text-xs text-ink-gray-6 mb-1">Equity round</div>
                <NumIn
                  :model-value="sel.performance?.capitalEquity || 0"
                  fmt="usd"
                  :min="0"
                  aria-label="Capital equity round"
                  @update:model-value="(v) => setPerfField('capitalEquity', v)"
                />
              </div>
              <div>
                <div class="text-xs text-ink-gray-6 mb-1">Token OTC (Foundation)</div>
                <NumIn
                  :model-value="sel.performance?.capitalToken || 0"
                  fmt="usd"
                  :min="0"
                  aria-label="Capital token OTC"
                  @update:model-value="(v) => setPerfField('capitalToken', v)"
                />
              </div>
            </div>
            <p class="text-p-xs mt-1 text-ink-gray-6">
              {{ fUSD(S.plan.capitalUplift.per) }} introduced → +{{
                (S.plan.capitalUplift.pct * 100).toFixed(0)
              }}% of base, cap +{{ (S.plan.capitalUplift.cap * 100).toFixed(0) }}% · gate
              {{ ms[S.plan.capitalUplift.gate] }} · counts both channels
            </p>
          </div>
          <div>
            <div class="text-xs text-ink-gray-6 mb-1">Uplift earned at (month)</div>
            <div class="w-16">
              <NumIn
                :model-value="sel.upliftStartMonth ?? 6"
                :min="0"
                :max="48"
                aria-label="Uplift earn month"
                @update:model-value="(v) => setField('upliftStartMonth', v)"
              />
            </div>
          </div>
          <div class="pt-2 border-t border-outline-gray-2">
            <div class="text-xs text-ink-gray-6 pb-1">Objectives · off / target / earned</div>
            <!-- COM-80: aligned divide-y rows replace the nested card-in-card grid; state lives in
                 the stateful bits (the TabButtons selection + the amber awaiting-gate note), not in
                 decorative borders -->
            <div class="divide-y divide-outline-gray-1">
              <div
                v-for="o in S.objectives"
                :key="o.id"
                class="grid grid-cols-[0.625rem_1fr_3.5rem_auto] items-center gap-3 py-2.5"
              >
                <span
                  class="inline-block size-2 rounded-full"
                  :style="{ background: CAT[o.category]?.color }"
                />
                <div class="min-w-0">
                  <div class="text-sm font-medium text-ink-gray-9 truncate">{{ o.label }}</div>
                  <div class="text-p-xs text-ink-gray-6 leading-snug">
                    {{ o.trigger }} · gate: {{ ms[o.gate]
                    }}<span
                      v-if="objState(o.id) === 'earned' && !stageReached(S.plan, o.gate)"
                      class="text-ink-amber-strong"
                    >
                      · <Term k="awaitingGate">awaiting gate</Term></span
                    >
                  </div>
                </div>
                <span class="text-xs tabular-nums text-right text-ink-green-3"
                  >+{{ (o.uplift * 100).toFixed(0) }}%</span
                >
                <TabButtons
                  :model-value="objState(o.id)"
                  :buttons="[
                    { label: 'Off', value: 'off' },
                    { label: 'Target', value: 'targeted' },
                    { label: 'Earned', value: 'earned' },
                  ]"
                  @update:model-value="(v) => setObjState(o.id, v)"
                />
              </div>
            </div>
            <p class="text-p-xs pt-1 text-ink-gray-6">
              Earned: <span class="text-ink-green-3">+{{ (c.earnedUplift * 100).toFixed(0) }}%</span
              ><span v-if="c.pendingUplift > 0">
                · pending gate:
                <span class="text-ink-amber-strong"
                  >+{{ (c.pendingUplift * 100).toFixed(0) }}%</span
                ></span
              >
              · ceiling +{{ (c.ceilUplift * 100).toFixed(0) }}%
            </p>
          </div>
        </div>
      </div>
    </template>
    <template #actions="{ close }">
      <div class="flex items-center gap-2 w-full justify-end">
        <span v-if="isDirty" class="text-xs text-ink-amber-strong mr-auto">Edited</span>
        <Button variant="subtle" theme="gray" label="Cancel" @click="cancel(close)" />
        <Button variant="solid" theme="gray" label="Save" @click="save(close)" />
      </div>
    </template>
  </Dialog>
</template>
