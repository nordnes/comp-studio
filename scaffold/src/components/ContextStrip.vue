<script setup lang="ts">
// Shared context strip (Advisors + Board): base-path post-moneys, TGE FDV (mult × anchor), ESOP start→cap.
import { computed } from "vue";
import { useStudio } from "../store";
import { walkScenario, tgeFdvFor, baseScenKey, roundLabel, fUSD, fPct, fMult } from "../engine";
import Term from "./Term.vue";
const { store } = useStudio();
const plan = computed(() => store.S.plan);
const w = computed(() => walkScenario(plan.value, baseScenKey(plan.value)));
const fdv = computed(() => tgeFdvFor(plan.value, baseScenKey(plan.value), w.value));
</script>

<template>
  <div class="no-print flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-ink-gray-6">
    <span class="text-ink-amber-strong">Base path</span>
    <span v-for="s in w.steps" :key="s.id" class="tabular-nums text-ink-gray-7"
      >{{ s.label }} {{ fUSD(s.post) }}</span
    >
    <span class="text-ink-gray-6">·</span>
    <span class="tabular-nums text-ink-gray-7"
      ><Term k="tgeFdv">TGE FDV</Term> {{ fUSD(fdv) }}
      <span class="text-ink-gray-6"
        >({{ fMult(plan.scenarios[baseScenKey(plan)].tgeMult) }}
        {{ roundLabel(plan, plan.tgeAnchor) }})</span
      ></span
    >
    <span class="text-ink-gray-6">·</span>
    <span class="tabular-nums text-ink-gray-7"
      >ESOP {{ fPct(plan.esopStart, 0) }} → {{ fPct(plan.esopCap, 0) }}</span
    >
  </div>
</template>
