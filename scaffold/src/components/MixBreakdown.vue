<script setup lang="ts">
// Comp-mix percentage bar (Options / Tokens / Cash), base-case net. CSS bar (reference is CSS, not a chart).
import { computed } from "vue";
import { fUSD, fPct } from "../engine";
const props = defineProps<{ c: any }>();
const seg = computed(() => {
  const c = props.c;
  const arr: [string, number, string][] = [
    ["Options", c.baseEqNet, "#9C4A0C"],
    ["Tokens", c.tkPct * c.base.fdv, "#C46A1F"],
    ["Cash", c.cashTotal, "#87807A"],
  ];
  return arr.filter((s) => s[1] > 0);
});
const total = computed(() =>
  Math.max(
    1,
    seg.value.reduce((s, x) => s + x[1], 0),
  ),
);
</script>

<template>
  <div class="bg-surface-white rounded border border-outline-gray-1 p-5">
    <div class="text-sm text-ink-gray-6 mb-3">Mix · base-case net value</div>
    <div class="flex w-full h-[18px] rounded overflow-hidden bg-surface-gray-2">
      <div
        v-for="[l, v, col] in seg"
        :key="l"
        :title="`${l} ${fUSD(v)}`"
        :style="{ width: (v / total) * 100 + '%', background: col }"
      />
    </div>
    <div class="flex flex-wrap gap-3 text-xs mt-2 text-ink-gray-7">
      <span v-for="[l, v, col] in seg" :key="l" class="flex items-center gap-1"
        ><span class="inline-block size-2 rounded-full" :style="{ background: col }" />{{ l }}
        {{ fPct(v / total, 0) }} <span class="text-ink-gray-6">({{ fUSD(v) }})</span></span
      >
    </div>
  </div>
</template>
