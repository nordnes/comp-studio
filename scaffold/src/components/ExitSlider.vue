<script setup lang="ts">
// COM-47: exit-valuation slider (Ledgy pattern). Lets a non-expert drag across the deliberate scenario
// range and feel the options upside. PRESENTATION-ONLY — it linearly interpolates the engine's already-
// computed per-scenario net values (equity / token / total / exitVal); at each scenario tick it matches
// the engine exactly, so it stays anchored to the deliberate range, not a forecast. The slider CONTROL
// is no-print; COM-84 adds a print-only target-outcome sentence so the chosen exit survives the doc.
// COM-84: when a `sel` advisor is passed, the thumb initialises from sel.targetExit and each released
// drag persists the interpolated exit back via setAdvisorTargetExit (the COM-82 reducer).
import { computed, ref, watch } from "vue";
import { fUSD } from "../engine";
import { useStudio } from "../store";
// printLine needs an explicit default: Vue casts an ABSENT Boolean-typed prop to false
// (HTML boolean-attribute semantics), which would silently drop the print sentence.
const props = withDefaults(defineProps<{ c: any; sel?: any; printLine?: boolean }>(), {
  printLine: true,
});
const emit = defineEmits<{ (e: "exit", v: number): void }>();
const { setAdvisorTargetExit } = useStudio();

const scen = computed<any[]>(() =>
  [...(props.c?.scen || [])].sort((a: any, b: any) => a.exitVal - b.exitVal),
);
const baseIndex = computed(() => {
  const i = scen.value.findIndex((s: any) => s.key === props.c?.base?.key);
  return i < 0 ? 0 : i;
});
const maxPos = computed(() => Math.max(0, scen.value.length - 1));
const pos = ref(0);
// COM-84: map a persisted exit value back to a thumb position (inverse of the lerp below).
function posFromExit(v: number) {
  const s = scen.value;
  if (!s.length) return 0;
  if (v <= s[0].exitVal) return 0;
  for (let i = 0; i < s.length - 1; i++) {
    const a = s[i].exitVal,
      b = s[i + 1].exitVal;
    if (v <= b) return i + (b > a ? (v - a) / (b - a) : 0);
  }
  return maxPos.value;
}
// thumb = the advisor's saved target when present, else the base scenario; re-inits when the
// advisor or the scenario set changes (NOT on every drag — targetExit isn't watched).
function initPos() {
  const t = props.sel?.targetExit;
  pos.value = t != null ? posFromExit(t) : baseIndex.value;
}
watch([() => props.sel?.id, () => scen.value.length, baseIndex], initPos, { immediate: true });
// COM-84: persist on release (the `change` event), not per drag frame.
function commitTarget() {
  if (props.sel) setAdvisorTargetExit(props.sel.id, view.value.exitVal);
}

const view = computed(() => {
  const s = scen.value;
  if (!s.length) return { total: 0, equity: 0, token: 0, exitVal: 0, label: "" };
  const i = Math.max(0, Math.min(s.length - 1, Math.floor(pos.value)));
  const j = Math.min(s.length - 1, i + 1);
  const f = pos.value - i;
  const L = (a: number, b: number) => a + (b - a) * f;
  return {
    total: L(s[i].total, s[j].total),
    equity: L(s[i].equity, s[j].equity),
    token: L(s[i].token, s[j].token),
    exitVal: L(s[i].exitVal, s[j].exitVal),
    label: f < 0.5 ? s[i].label : s[j].label,
  };
});
// publish the selected exit so a host (Advisors) can mark the UpsideCurve
watch(
  () => view.value.exitVal,
  (v) => emit("exit", v),
  { immediate: true },
);
const tickPct = (i: number) => (maxPos.value ? (i / maxPos.value) * 100 : 0);
</script>

<template>
  <div class="no-print bg-surface-white rounded border border-outline-gray-1 p-5">
    <div class="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
      <div class="text-sm text-ink-gray-6">Explore the exit · drag to feel the upside</div>
      <div class="text-xs text-ink-gray-5">net of strike &amp; dilution · not a forecast</div>
    </div>
    <div class="flex items-end gap-4 mb-4 flex-wrap">
      <div>
        <div class="figure-md text-ink-gray-9">
          {{ fUSD(view.total) }}
        </div>
        <div class="text-p-xs mt-1 text-ink-gray-6">
          net at ~{{ fUSD(view.exitVal) }} exit · eq {{ fUSD(view.equity) }} · tok
          {{ fUSD(view.token) }}
        </div>
      </div>
      <div class="ml-auto text-xs text-ink-amber-strong">{{ view.label }}</div>
    </div>
    <input
      v-model.number="pos"
      type="range"
      min="0"
      :max="maxPos"
      step="0.01"
      class="w-full accent-[var(--chart-capital)]"
      :aria-label="`Exit valuation: ${view.label}, net ${fUSD(view.total)}`"
      @change="commitTarget"
    />
    <div class="relative h-4 mt-1">
      <span
        v-for="(s, i) in scen"
        :key="s.key"
        class="absolute text-xs text-ink-gray-6 whitespace-nowrap"
        :class="i === 0 ? '' : i === scen.length - 1 ? '-translate-x-full' : '-translate-x-1/2'"
        :style="{ left: tickPct(i) + '%' }"
        >{{ s.label }}</span
      >
    </div>
  </div>
  <!-- COM-84: the chosen outcome survives into print (the control above is no-print). Hosts that
       carry their own in-document sentence (Proposition) pass :print-line="false". -->
  <p v-if="printLine !== false" class="print-only text-p-sm text-ink-gray-7">
    At a ~{{ fUSD(view.exitVal) }} exit, this package is worth ~{{ fUSD(view.total) }} net — net of
    strike &amp; dilution · not a forecast.
  </p>
</template>
