<script setup lang="ts">
// COM-83: the across-scenarios small-multiples table (Advisors hero). One tabulation of
// "this advisor across cases" replaces the four PotentialStrip restatements: the base-case
// floor → current → ceiling progression up top, then rows = scenarios from c.scen[]
// (Net / Equity / Tokens, engine-exported — no money math here).
import { computed } from "vue";
import { Badge } from "frappe-ui";
import { fUSD } from "../engine";
const props = defineProps<{ c: any }>();
const prog = computed(() => {
  const c = props.c;
  return [
    { k: "Floor", v: c.baseCaseBase, s: "guaranteed base", accent: false },
    {
      k: "Current",
      v: c.baseCaseTotal,
      s: c.earnedUplift > 0 ? `+${(c.earnedUplift * 100).toFixed(0)}% earned` : "no uplift yet",
      accent: true,
    },
    {
      k: "Ceiling",
      v: c.baseCaseCeil,
      s: `+${(c.ceilUplift * 100).toFixed(0)}% if targets hit`,
      accent: false,
    },
  ];
});
</script>

<template>
  <div class="bg-surface-white rounded border border-outline-gray-1 overflow-hidden">
    <!-- base-case progression (the old PotentialStrip numbers, distilled) -->
    <div class="grid grid-cols-3 gap-px bg-surface-gray-2 border-b border-outline-gray-1">
      <div
        v-for="cell in prog"
        :key="cell.k"
        class="p-4"
        :class="cell.accent ? 'bg-surface-amber-2' : 'bg-surface-white'"
      >
        <div
          class="text-xs mb-1"
          :class="cell.accent ? 'text-ink-amber-strong' : 'text-ink-gray-6'"
        >
          {{ cell.k }}
        </div>
        <div
          class="font-display tabular-nums text-ink-gray-9"
          style="font-size: 1.5rem; font-weight: 350; line-height: 1"
        >
          {{ fUSD(cell.v) }}
        </div>
        <div class="text-xs mt-1.5 text-ink-gray-6">{{ cell.s }}</div>
      </div>
    </div>
    <!-- across scenarios -->
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-outline-gray-2 text-ink-gray-6">
          <th class="px-4 py-2.5 font-normal text-left">Across scenarios</th>
          <th class="px-4 py-2.5 font-normal text-right">Net</th>
          <th class="px-4 py-2.5 font-normal text-right hidden sm:table-cell">Equity</th>
          <th class="px-4 py-2.5 font-normal text-right hidden sm:table-cell">Tokens</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="s in c.scen"
          :key="s.key"
          class="border-b border-outline-gray-1 last:border-b-0"
          :class="s.key === c.base.key ? 'bg-surface-amber-2' : ''"
        >
          <td class="px-4 py-2.5">
            <span class="text-ink-gray-9">{{ s.label }}</span>
            <Badge
              v-if="s.key === c.base.key"
              class="ml-2"
              theme="orange"
              variant="outline"
              size="sm"
              label="base"
            />
            <Badge
              v-if="s.underwater"
              class="ml-2"
              theme="red"
              variant="subtle"
              size="sm"
              label="equity underwater"
            />
          </td>
          <td class="px-4 py-2.5 tabular-nums text-right font-medium text-ink-gray-9">
            {{ fUSD(s.total) }}
          </td>
          <td class="px-4 py-2.5 tabular-nums text-right text-ink-gray-8 hidden sm:table-cell">
            {{ fUSD(s.equity) }}
          </td>
          <td class="px-4 py-2.5 tabular-nums text-right text-ink-gray-8 hidden sm:table-cell">
            {{ fUSD(s.token) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
