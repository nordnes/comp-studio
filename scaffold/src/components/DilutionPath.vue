<script setup lang="ts">
// Equity dilution mini-chart (base path retention). CSS bars (reference 770-791).
import { computed } from "vue";
import { useStudio } from "../store";
import { walkScenario, baseScenKey, fPct, clamp } from "../engine";
const props = defineProps<{ c: any }>();
const { store } = useStudio();
const w = computed(() => walkScenario(store.S.plan, baseScenKey(store.S.plan)));
const pctOfGrant = (sN: number) => props.c.baseEq * (w.value.steps[0].N / sN);
</script>

<template>
  <!-- COM-88: static read-out — the section label carries it; no frame -->
  <div>
    <div class="flex items-center gap-2 mb-3">
      <span class="lucide-trending-down size-3.5 text-ink-gray-6" aria-hidden="true" />
      <div class="text-sm text-ink-gray-6">Equity dilution · base path</div>
    </div>
    <div class="flex items-end gap-1 h-20">
      <div
        v-for="(s, i) in w.steps"
        :key="s.id"
        class="flex-1 flex flex-col items-center justify-end"
      >
        <div
          class="text-xs tabular-nums"
          :class="i === w.steps.length - 1 ? 'text-ink-amber-strong' : 'text-ink-gray-6'"
        >
          {{ fPct(pctOfGrant(s.N), 2) }}
        </div>
        <div
          class="w-[70%] rounded-t"
          :style="{
            height: clamp(pctOfGrant(s.N) / (c.baseEq || 1), 0, 1) * 70 + 6 + 'px',
            background:
              i === 0
                ? 'var(--chart-capital)'
                : i === w.steps.length - 1
                  ? 'var(--chart-customer)'
                  : 'var(--chart-tint)',
          }"
        />
        <div class="text-ink-gray-7 mt-1" style="font-size: 10px">{{ s.label }}</div>
      </div>
    </div>
    <p class="text-p-xs mt-2 text-ink-gray-6">
      A bridge grant of {{ fPct(c.baseEq, 2) }} dilutes to
      {{ fPct(c.baseEq * c.retentionBase, 2) }} by the exit ({{ fPct(c.retentionBase, 0) }}
      retained). Tokens aren't diluted.
    </p>
  </div>
</template>
