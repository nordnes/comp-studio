<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStudio } from '../store';
import { fUSD, fPct, fNum, scenKeys, baseScenKey, walkScenario, tgeFdvFor, BENCH } from '../engine';

const { state, board, select } = useStudio();
const router = useRouter();
const S = computed(() => state.S);
const sk = computed(() => scenKeys(S.value.plan));
const baseKey = computed(() => baseScenKey(S.value.plan));
const baseEqSum = computed(() => board.value.rows.reduce((s, r) => s + r.c.baseEq, 0));
const w = computed(() => walkScenario(S.value.plan, baseKey.value));
const fdv = computed(() => tgeFdvFor(S.value.plan, baseKey.value, w.value));

const flags = computed(() => {
  const out: { t: string; m: string }[] = [];
  board.value.warnings.forEach((x: string) => out.push({ t: 'budget', m: x }));
  S.value.advisors.forEach((a: any) => { if (/confirm/i.test(a.notes || '')) out.push({ t: 'confirm', m: `${a.name}: confirm terms` }); });
  out.push({ t: 'note', m: 'TGE multipliers unvalidated — confirm before sharing externally.' });
  out.push({ t: 'note', m: `ESOP at adoption ${fPct(S.value.plan.esopStart, 0)} (10% / 15% switch — board decision open).` });
  return out;
});

function open(id: string) { select(id); router.push('/advisors'); }
const kpis = computed(() => [
  { l: 'Advisors', v: fNum(board.value.rows.length), accent: false },
  { l: 'Net cost · base', v: fUSD(board.value.cost[baseKey.value] || 0), accent: true },
  { l: `Range ${S.value.plan.scenarios[sk.value[0]].label}→${S.value.plan.scenarios[sk.value[sk.value.length - 1]].label}`, v: `${fUSD(board.value.cost[sk.value[0]] || 0)} – ${fUSD(board.value.cost[sk.value[sk.value.length - 1]] || 0)}`, accent: false },
  { l: 'Equity of company', v: fPct(baseEqSum.value, 2), accent: false },
  { l: 'Tokens of supply', v: fPct(board.value.sumTk, 2), accent: false },
  { l: 'Annual cash', v: fUSD(board.value.sumCash), accent: false },
]);
</script>

<template>
  <div class="space-y-10">
    <div class="flex justify-between items-start gap-6 flex-wrap">
      <div class="max-w-2xl">
        <div class="eyebrow mb-3" style="color:#9C4A0C">Section I · Overview</div>
        <h2 class="font-display text-3xl sm:text-4xl" style="font-weight:350">The advisory board, at a glance.</h2>
        <p class="mt-4 text-sm" style="color:#4A4640;line-height:1.65">A live snapshot against the company plan — net of strike and dilution. Open Configure to edit the baseline; click an advisor to model their package.</p>
      </div>
      <router-link to="/configure" class="px-4 py-2 text-sm no-underline" style="background:#1A1815;color:#FBF8F3">Configure</router-link>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px" style="background:#E5E0DA;border:0.5px solid #E5E0DA">
      <div v-for="k in kpis" :key="k.l" class="p-4" :style="{ background: k.accent ? '#FCF4E3' : '#fff' }">
        <div class="eyebrow mb-1" :style="{ color: k.accent ? '#9C4A0C' : '#87807A' }">{{ k.l }}</div>
        <div class="font-display tabular-nums" style="font-size:1.35rem;line-height:1.05">{{ k.v }}</div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-3">
        <div class="eyebrow" style="color:#87807A">Roster · click to open a package</div>
        <div class="grid sm:grid-cols-2 gap-3">
          <button v-for="{ a, c } in board.rows" :key="a.id" @click="open(a.id)" class="p-4 text-left" style="background:#fff;border:0.5px solid #E5E0DA">
            <div class="flex items-center justify-between gap-2">
              <div class="font-medium">{{ a.name }}</div>
              <span class="text-xs px-2 py-0.5 whitespace-nowrap" style="background:#FBEFD9;color:#9C4A0C">{{ a.mode === 'value' ? '$value' : (S.tiers[a.tier]?.name || '—') }}</span>
            </div>
            <div class="text-xs mt-0.5" style="color:#87807A">{{ a.sector.split('—')[0].trim() }}</div>
            <div class="flex justify-between items-baseline mt-3">
              <div class="font-display text-xl tabular-nums">{{ fUSD(c.baseCaseTotal) }}</div>
              <div class="text-xs tabular-nums" style="color:#87807A">{{ fPct(c.eqPct, 2) }} eq · {{ fPct(c.tkPct, 2) }} tok</div>
            </div>
            <div v-if="c.ceilUplift > c.earnedUplift" class="text-xs mt-1" style="color:#2F6E63">+{{ (c.ceilUplift * 100).toFixed(0) }}% potential at ceiling</div>
          </button>
        </div>
        <div class="text-xs" style="color:#87807A">Base path: <span v-for="(s, i) in w.steps" :key="s.id">{{ i ? ' → ' : '' }}{{ s.label }} {{ fUSD(s.post) }}</span> · TGE FDV {{ fUSD(fdv) }}.</div>
      </div>

      <div class="space-y-6">
        <div class="p-5 space-y-3" style="background:#fff;border:0.5px solid #E5E0DA">
          <div class="eyebrow" style="color:#87807A">Pool consumption</div>
          <div class="text-sm flex justify-between"><span style="color:#4A4640">Equity (of {{ fPct(board.esopNow, 0) }} ESOP)</span><span class="tabular-nums">{{ fPct(board.sumEq, 2) }} → {{ fPct(board.sumEqCeil, 2) }}</span></div>
          <div class="text-sm flex justify-between"><span style="color:#4A4640">Tokens (board bucket {{ fPct(board.boardBucket, 2) }})</span><span class="tabular-nums">{{ fPct(board.sumTk, 2) }} → {{ fPct(board.sumTkCeil, 2) }}</span></div>
        </div>
        <div class="p-5 space-y-2" style="background:#fff;border:0.5px solid #E5E0DA">
          <div class="eyebrow" style="color:#87807A">Benchmark</div>
          <div class="text-sm" style="color:#4A4640">Board base equity <b>{{ fPct(baseEqSum, 2) }}</b> · FAST per-head 0.30–1.00% · advisory pool ~{{ fPct(BENCH.advisorPool, 0) }}.</div>
          <div class="text-xs" style="color:#87807A">Source: {{ BENCH.advisorSrc }}.</div>
        </div>
        <div class="p-5 space-y-2" :style="{ background: flags.some(f => f.t === 'budget') ? '#FBEAE6' : '#FCF4E3', border: '0.5px solid #C9C2BA' }">
          <div class="eyebrow" style="color:#9C4A0C">To confirm / alerts</div>
          <div v-for="(f, i) in flags" :key="i" class="text-xs" :style="{ color: f.t === 'budget' ? '#8C3A2B' : '#4A4640', lineHeight: 1.5 }">• {{ f.m }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
