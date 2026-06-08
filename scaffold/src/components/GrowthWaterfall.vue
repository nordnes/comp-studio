<script setup lang="ts">
// Growth waterfall (custom SVG — frappe-charts has no waterfall). Horizontal floating bars: base →
// capital → objectives → ceiling, in base-case net value. solid = earned, faded = pending gate,
// outline = available. Current + Ceiling reference lines.
import { computed } from 'vue';
import { useStudio } from '../store';
import { stageReached, fUSD } from '../engine';
import { CAT } from '../constants';
const props = defineProps<{ c: any; sel: any }>();
const { store } = useStudio();

const model = computed(() => {
  const c = props.c, sel = props.sel, plan = store.S.plan, sb = c.base, tgeFdv = sb.fdv;
  const oMap: Record<string, any> = Object.fromEntries(store.S.objectives.map((o: any) => [o.id, o]));
  const valAt = (m: number) => sb.netEqAt(c.baseEq * (1 + m), sb.exitVal) + (c.baseTk * (1 + m)) * tgeFdv;
  const rows: any[] = []; let cum = 0;
  rows.push({ id: 'base', label: 'Base', kind: 'base', from: 0, to: valAt(0), color: '#9C4A0C', note: '' });
  if (c.capRaw > 0) { const earned = c.capEarned > 0; const prev = valAt(cum); cum += c.capRaw; rows.push({ id: 'capital', label: 'Capital', kind: earned ? 'earned' : 'pending', from: prev, to: valAt(cum), color: CAT.capital.color, note: `+${(c.capRaw * 100).toFixed(0)}%${earned ? '' : ' ⏳'}` }); }
  const perf = sel.performance || { achieved: [], targeted: [] }; const seen = new Set();
  (perf.achieved || []).forEach((id: string) => { const o = oMap[id]; if (!o) return; seen.add(id); const reached = stageReached(plan, o.gate); const prev = valAt(cum); cum += o.uplift; rows.push({ id, label: o.label, kind: reached ? 'earned' : 'pending', from: prev, to: valAt(cum), color: CAT[o.category]?.color || '#9C4A0C', note: `+${(o.uplift * 100).toFixed(0)}%${reached ? '' : ' ⏳'}` }); });
  (perf.targeted || []).forEach((id: string) => { const o = oMap[id]; if (!o || seen.has(id)) return; const prev = valAt(cum); cum += o.uplift; rows.push({ id, label: o.label, kind: 'available', from: prev, to: valAt(cum), color: CAT[o.category]?.color || '#9C4A0C', note: `+${(o.uplift * 100).toFixed(0)}%` }); });
  return { rows, ceiling: valAt(cum), current: valAt(c.earnedUplift) };
});
const W = 520, rowH = 34, padL = 96, padR = 76, padT = 8;
const max = computed(() => Math.max(1, model.value.ceiling * 1.05));
const H = computed(() => model.value.rows.length * rowH + padT + 24);
const x = (v: number) => padL + (v / max.value) * (W - padL - padR);
const lo = (r: any) => Math.min(r.from, r.to); const hi = (r: any) => Math.max(r.from, r.to);
</script>

<template>
  <div class="bg-surface-white rounded border border-outline-gray-1 p-5">
    <div class="flex items-center justify-between mb-1 flex-wrap gap-2">
      <div class="text-sm text-ink-gray-6">How the package grows · base-case net value</div>
      <div class="text-xs text-ink-gray-6">solid earned · faded pending gate · outline available</div>
    </div>
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" :style="{ height: H + 'px' }">
      <g v-for="(r, i) in model.rows" :key="r.id">
        <text :x="padL - 6" :y="padT + i * rowH + rowH / 2 + 4" text-anchor="end" class="fill-current text-ink-gray-8" font-size="11">{{ r.label }}</text>
        <rect :x="x(lo(r))" :y="padT + i * rowH + 6" :width="Math.max(1, x(hi(r)) - x(lo(r)))" :height="rowH - 14" rx="2"
          :style="{ fill: r.kind === 'available' ? 'none' : r.color, fillOpacity: r.kind === 'pending' ? 0.4 : (r.kind === 'base' ? 1 : 0.92), stroke: r.kind === 'available' ? r.color : 'none', strokeDasharray: r.kind === 'available' ? '3 2' : '0' }" />
        <text :x="x(hi(r)) + 6" :y="padT + i * rowH + rowH / 2 + 4" class="fill-current text-ink-gray-6" font-size="9">{{ r.note || fUSD(r.to) }}</text>
      </g>
      <line :x1="x(model.current)" :y1="padT" :x2="x(model.current)" :y2="H - 22" :style="{ stroke: '#2F6E63' }" stroke-width="1.5" />
      <text :x="x(model.current)" :y="H - 10" text-anchor="middle" font-size="9" :style="{ fill: '#2F6E63' }">Current</text>
      <line :x1="x(model.ceiling)" :y1="padT" :x2="x(model.ceiling)" :y2="H - 22" class="stroke-current text-ink-gray-4" stroke-width="1" stroke-dasharray="2 3" />
      <text :x="x(model.ceiling)" :y="H - 10" text-anchor="middle" font-size="9" class="fill-current text-ink-gray-6">Ceiling</text>
    </svg>
    <p class="text-p-xs mt-1 text-ink-gray-6">The band between Current and Ceiling is the remaining potential — earn it by hitting gated objectives.</p>
  </div>
</template>
