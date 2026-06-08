<script setup lang="ts">
// Advisors (Section II) — the hero / live-edit view. Left: profile, base/tier, performance controls.
// Right (print-area): potential strip, growth waterfall, upside curve, and a detail expander
// (vesting, scenario range, mix, dilution, instruments). All money from the engine via the store.
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Badge, Select, Checkbox } from 'frappe-ui';
import { useStudio } from '../store';
import { fUSD, fPct, fNum, fTok, fMult, roundList, roundLabel, SECTORS, stageReached, todayISO } from '../engine';
import { CAT } from '../constants';
import PageHeader from '../components/PageHeader.vue';
import ContextStrip from '../components/ContextStrip.vue';
import StageBadge from '../components/StageBadge.vue';
import AdvisorPicker from '../components/AdvisorPicker.vue';
import NumIn from '../components/NumIn.vue';
import EquityBenchmark from '../components/EquityBenchmark.vue';
import PotentialStrip from '../components/PotentialStrip.vue';
import GrowthWaterfall from '../components/GrowthWaterfall.vue';
import UpsideCurve from '../components/UpsideCurve.vue';
import VestingTimeline from '../components/VestingTimeline.vue';
import FootballField from '../components/FootballField.vue';
import MixBreakdown from '../components/MixBreakdown.vue';
import DilutionPath from '../components/DilutionPath.vue';

const { store, selected, setPath } = useStudio();
const router = useRouter();
const S = computed(() => store.S);
const sel = computed(() => selected.value?.a as any);
const c = computed(() => selected.value?.c as any);
const i = computed(() => S.value.advisors.findIndex((a: any) => a.id === sel.value?.id));
const showDetail = ref(false);

function setField(k: string, v: any) { setPath(['advisors', i.value, k], v); }
function setPerfField(k: string, v: any) { const perf: any = { ...(sel.value.performance || {}) }; perf[k] = v; setPath(['advisors', i.value, 'performance'], perf); }
function objState(id: string) { const p: any = sel.value.performance || {}; return p.achieved?.includes(id) ? 'earned' : p.targeted?.includes(id) ? 'targeted' : 'off'; }
function setObjState(id: string, st: string) {
  const p: any = sel.value.performance || { achieved: [], targeted: [] };
  const a = new Set<string>(p.achieved || []); const t = new Set<string>(p.targeted || []);
  a.delete(id); t.delete(id); if (st === 'earned') a.add(id); if (st === 'targeted') t.add(id);
  setPath(['advisors', i.value, 'performance'], { ...p, achieved: [...a], targeted: [...t] });
}
function printPage() { window.print(); }
const ms = computed(() => Object.fromEntries(S.value.plan.milestones.map((m: any) => [m.id, m.label])));
const ff = computed(() => { const t = c.value.scen.map((s: any) => s.total); return { lo: Math.min(...t), base: c.value.baseCaseTotal, hi: Math.max(...t) }; });
function toProp() { router.push('/proposition'); }
</script>

<template>
  <div v-if="!sel || !c" class="text-center py-24 text-ink-gray-6">No advisor selected. Add one on the Board.</div>
  <div v-else class="space-y-8">
    <div class="flex justify-between items-center flex-wrap gap-3 no-print">
      <PageHeader title="Base, then performance." />
      <div class="flex items-center gap-2 flex-wrap"><StageBadge /><AdvisorPicker /><Button variant="subtle" theme="gray" icon-left="lucide-printer" label="Print" @click="printPage" /></div>
    </div>
    <ContextStrip />

    <div class="grid lg:grid-cols-12 gap-8">
      <!-- LEFT CONTROLS -->
      <div class="lg:col-span-5 space-y-6 no-print">
        <div class="bg-surface-white rounded border border-outline-gray-1 p-5 space-y-4">
          <div class="text-sm text-ink-gray-6">Profile</div>
          <div><div class="text-xs text-ink-gray-6 mb-1">Name</div><input :value="sel.name" class="w-full bg-transparent border-b border-outline-gray-2 text-sm text-ink-gray-9 outline-none py-1 focus:border-outline-gray-3" @input="e => setField('name', (e.target as HTMLInputElement).value)" /></div>
          <div><div class="text-xs text-ink-gray-6 mb-1">Sector</div><Select :model-value="sel.sector" :options="SECTORS.map(s => ({ label: s, value: s }))" @update:model-value="v => setField('sector', v)" /></div>
          <div class="grid grid-cols-2 gap-4">
            <div><div class="text-xs text-ink-gray-6 mb-1">Engagement (yrs)</div><NumIn :model-value="sel.years" :min="1" :max="10" aria-label="Years" @update:model-value="v => setField('years', v)" /></div>
            <div><div class="text-xs text-ink-gray-6 mb-1">Start date</div><input type="date" :value="sel.startDate || todayISO()" class="w-full bg-transparent border-b border-outline-gray-2 text-sm text-ink-gray-9 outline-none py-1" @input="e => setField('startDate', (e.target as HTMLInputElement).value)" /></div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div><div class="text-xs text-ink-gray-6 mb-1">Granted at</div><Select :model-value="sel.grantRound || 'bridge'" :options="roundList(S.plan).map(r => ({ label: roundLabel(S.plan, r), value: r }))" @update:model-value="v => setField('grantRound', v)" /></div>
            <div><div class="text-xs text-ink-gray-6 mb-1">Tax residency</div><Select :model-value="sel.taxResidency || 'Other'" :options="['UK', 'US', 'Other'].map(t => ({ label: t, value: t }))" @update:model-value="v => setField('taxResidency', v)" /></div>
          </div>
          <div><div class="text-xs text-ink-gray-6 mb-1">Notes</div><input :value="sel.notes" class="w-full bg-transparent border-b border-outline-gray-2 text-sm text-ink-gray-9 outline-none py-1" @input="e => setField('notes', (e.target as HTMLInputElement).value)" /></div>
        </div>

        <div class="bg-surface-white rounded border border-outline-gray-1 p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div class="text-sm text-ink-gray-6">Base — denomination</div>
            <div class="flex gap-1">
              <Button v-for="[m, l] in [['tier', 'By tier'], ['value', 'By $ value']]" :key="m" :variant="sel.mode === m ? 'solid' : 'subtle'" theme="gray" size="sm" :label="l" @click="setField('mode', m)" />
            </div>
          </div>
          <template v-if="sel.mode === 'tier'">
            <div class="flex items-center gap-2 text-xs px-3 py-2 rounded bg-surface-amber-2 text-ink-amber-strong"><span class="lucide-layers size-3.5" aria-hidden="true" /> Uniform base {{ fPct(S.plan.baseGrant.equityPct, 2) }} eq · {{ fPct(S.plan.baseGrant.tokenPct, 2) }} tok, ×tier</div>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="(t, ti) in S.tiers" :key="ti" class="p-3 text-left rounded border" :class="sel.tier === ti ? 'bg-surface-amber-2 border-outline-amber-2' : 'border-outline-gray-2 hover:bg-surface-gray-1'" @click="setField('tier', ti)">
                <div class="flex items-baseline justify-between"><div class="font-display text-base text-ink-gray-9">{{ t.name }}</div><div class="text-xs text-ink-amber-strong">{{ fMult(t.mult) }}</div></div>
                <div class="text-xs mt-1 tabular-nums text-ink-gray-6">{{ fPct(S.plan.baseGrant.equityPct * t.mult, 1) }} eq · {{ fPct(S.plan.baseGrant.tokenPct * t.mult, 1) }} tok</div>
              </button>
            </div>
            <EquityBenchmark :sel="sel" :c="c" />
          </template>
          <template v-else>
            <div><div class="text-xs text-ink-gray-6 mb-1">Annual value (USD)</div><NumIn :model-value="sel.annualValue" fmt="usd" :min="0" aria-label="Annual value" @update:model-value="v => setField('annualValue', v)" /></div>
            <div><div class="flex justify-between text-sm mb-1"><span class="text-ink-gray-7">Options / tokens split</span><span class="tabular-nums text-ink-gray-9">{{ fPct(sel.splitOptions, 0) }} / {{ fPct(1 - sel.splitOptions, 0) }}</span></div><input type="range" min="0" max="1" step="0.05" :value="sel.splitOptions" class="w-full" style="accent-color:#9C4A0C" @input="e => setField('splitOptions', Number((e.target as HTMLInputElement).value))" /></div>
          </template>
          <label class="flex items-center gap-2 text-sm pt-2 border-t border-outline-gray-1 text-ink-gray-7"><Checkbox :model-value="sel.hasCash" @update:model-value="v => setField('hasCash', v)" /> Cash retainer (post-Series A)</label>
          <div v-if="sel.hasCash"><div class="text-xs text-ink-gray-6 mb-1">Annual cash (USD)</div><NumIn :model-value="sel.cashAnnual" fmt="usd" :min="0" aria-label="Cash" @update:model-value="v => setField('cashAnnual', v)" /></div>
        </div>

        <div class="rounded border border-outline-amber-2 bg-surface-amber-2 p-5 space-y-4">
          <div class="flex items-center gap-2"><span class="lucide-trending-up size-4 text-ink-amber-strong" aria-hidden="true" /><div class="text-sm text-ink-amber-strong">Performance uplift</div></div>
          <div>
            <div class="flex justify-between text-sm mb-1"><span class="text-ink-gray-7">Capital introduced · by channel</span><span class="font-display tabular-nums" :class="c.capEarned > 0 ? 'text-ink-green-3' : 'text-ink-amber-strong'">+{{ (c.capRaw * 100).toFixed(0) }}%{{ c.capEarned < c.capRaw ? ' ⏳' : '' }}</span></div>
            <div class="grid grid-cols-2 gap-3">
              <div><div class="text-xs text-ink-gray-6 mb-1">Equity round</div><NumIn :model-value="sel.performance?.capitalEquity || 0" fmt="usd" :min="0" aria-label="Capital equity round" @update:model-value="v => setPerfField('capitalEquity', v)" /></div>
              <div><div class="text-xs text-ink-gray-6 mb-1">Token OTC (Foundation)</div><NumIn :model-value="sel.performance?.capitalToken || 0" fmt="usd" :min="0" aria-label="Capital token OTC" @update:model-value="v => setPerfField('capitalToken', v)" /></div>
            </div>
            <p class="text-p-xs mt-1 text-ink-gray-6">{{ fUSD(S.plan.capitalUplift.per) }} introduced → +{{ (S.plan.capitalUplift.pct * 100).toFixed(0) }}% of base, cap +{{ (S.plan.capitalUplift.cap * 100).toFixed(0) }}% · gate {{ ms[S.plan.capitalUplift.gate] }} · counts both channels</p>
          </div>
          <div class="space-y-2 pt-2 border-t border-outline-amber-2">
            <div class="text-xs text-ink-gray-6">Objectives · off / target / earned</div>
            <div v-for="o in S.objectives" :key="o.id" class="p-3 rounded border bg-surface-white"
              :class="objState(o.id) === 'earned' && !stageReached(S.plan, o.gate) ? 'border-outline-amber-2' : objState(o.id) === 'earned' ? 'border-outline-green-2' : objState(o.id) === 'targeted' ? 'border-outline-amber-2' : 'border-outline-gray-1'">
              <div class="flex items-center gap-2"><span class="inline-block size-2 rounded-full" :style="{ background: CAT[o.category]?.color }" /><span class="text-sm font-medium text-ink-gray-9">{{ o.label }}</span><span class="text-xs tabular-nums text-ink-green-3">+{{ (o.uplift * 100).toFixed(0) }}%</span></div>
              <div class="text-p-xs mt-1 text-ink-gray-6 leading-snug">{{ o.trigger }} · gate: {{ ms[o.gate] }}<span v-if="objState(o.id) === 'earned' && !stageReached(S.plan, o.gate)" class="text-ink-amber-strong"> · ⏳ awaiting gate</span></div>
              <div class="flex gap-1 mt-2"><Button v-for="[k, l] in [['off', 'Off'], ['targeted', 'Target'], ['earned', 'Earned']]" :key="k" :variant="objState(o.id) === k ? 'solid' : 'subtle'" :theme="objState(o.id) === k ? (k === 'earned' ? 'green' : 'gray') : 'gray'" size="sm" :label="l" @click="setObjState(o.id, k)" /></div>
            </div>
            <p class="text-p-xs pt-1 text-ink-gray-6">Earned: <span class="text-ink-green-3">+{{ (c.earnedUplift * 100).toFixed(0) }}%</span><span v-if="c.pendingUplift > 0"> · pending gate: <span class="text-ink-amber-strong">+{{ (c.pendingUplift * 100).toFixed(0) }}%</span></span> · ceiling +{{ (c.ceilUplift * 100).toFixed(0) }}%</p>
          </div>
        </div>
      </div>

      <!-- RIGHT HERO -->
      <div class="lg:col-span-7 space-y-6 print-area">
        <PotentialStrip :c="c" />
        <GrowthWaterfall :c="c" :sel="sel" />
        <UpsideCurve :c="c" />
        <Button class="w-full no-print" variant="subtle" theme="gray" :label="showDetail ? '− Hide detail' : '+ Show detail · vesting, scenario range, mix, instruments'" @click="showDetail = !showDetail" />
        <template v-if="showDetail">
          <VestingTimeline :c="c" :sel="sel" />
          <div class="bg-surface-white rounded border border-outline-gray-1 p-5">
            <div class="text-sm text-ink-gray-6 mb-3">Scenario range · net value (low → high)</div>
            <FootballField :lo="ff.lo" :base="ff.base" :hi="ff.hi" :max="ff.hi" />
            <div class="flex justify-between text-xs mt-2 tabular-nums text-ink-gray-6"><span>Low {{ fUSD(ff.lo) }}</span><span class="text-ink-amber-strong">Base {{ fUSD(ff.base) }}</span><span>High {{ fUSD(ff.hi) }}</span></div>
          </div>
          <MixBreakdown :c="c" />
          <div class="grid sm:grid-cols-2 gap-6">
            <DilutionPath :c="c" />
            <div class="bg-surface-white rounded border border-outline-gray-1 p-5">
              <div class="text-sm text-ink-gray-6 mb-3">Instruments · net of strike</div>
              <div class="divide-y divide-outline-gray-1 text-sm">
                <div class="flex justify-between py-2"><span class="text-ink-gray-6">Options (base case net)</span><span class="tabular-nums text-ink-gray-9">{{ fUSD(c.baseEqNet) }}</span></div>
                <div class="flex justify-between py-2"><span class="text-ink-gray-6">Shares @ bridge</span><span class="tabular-nums text-ink-gray-9">{{ fNum(c.equityShares) }}</span></div>
                <div class="flex justify-between py-2"><span class="text-ink-gray-6">Strike</span><span class="tabular-nums text-ink-gray-9">${{ c.strikePps.toFixed(2) }}</span></div>
                <div class="flex justify-between py-2"><span class="text-ink-gray-6">Exercise cost</span><span class="tabular-nums text-ink-gray-9">{{ fUSD(c.exerciseCost) }}</span></div>
                <div class="flex justify-between py-2"><span class="text-ink-gray-6">Tokens</span><span class="tabular-nums text-ink-gray-9">{{ fPct(c.tkPct, 3) }} · {{ fTok(c.tokenCount) }}</span></div>
                <div class="flex justify-between py-2"><span class="text-ink-gray-6">Token value (base FDV)</span><span class="tabular-nums text-ink-gray-9">{{ fUSD(c.tkPct * c.base.fdv) }}</span></div>
                <div class="flex justify-between py-2"><span class="text-ink-gray-6">Vesting</span><span class="tabular-nums text-ink-gray-9">{{ S.plan.equityVestYears }}yr / {{ S.plan.equityCliff }}mo</span></div>
              </div>
              <p class="text-p-xs mt-2 text-ink-gray-6">Strike subject to an HMRC SAV / 409A valuation agreed before first grant.</p>
            </div>
          </div>
        </template>
        <Button class="w-full no-print" variant="solid" theme="gray" icon-right="lucide-arrow-right" :label="`View ${sel.name.split(' ')[0]}'s proposition`" @click="toProp" />
      </div>
    </div>
  </div>
</template>
