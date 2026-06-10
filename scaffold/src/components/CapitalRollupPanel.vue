<script setup lang="ts">
// COM-161 (F20/O15): the board as a fundraising instrument, quantified. Engine capitalRollup
// aggregates channel-introduced capital per advisor (targeted → gated → earned) against the
// live raise target; gated uplift owed converts to earned when the round closes (COM-162).
// Pure render — every number is an engine export.
import { computed } from "vue";
import { Badge } from "frappe-ui";
import { useStudio } from "../store";
import { capitalRollup, fUSD, fPct, roundLabel } from "../engine";
import { shortName } from "../constants";
import Panel from "./Panel.vue";

const { store } = useStudio();
const S = computed(() => store.S);
const roll = computed(() =>
  capitalRollup(S.value.advisors, S.value.plan, S.value.tiers, S.value.objectives),
);
const rosterNames = computed(() => S.value.advisors.map((a: any) => a.name));
const sn = (n: string) => shortName(n, rosterNames.value);
// the live raise target — the bridge raise (O15's "bridge $5m+")
const raiseTarget = computed(() => S.value.plan.bridge.raise);
const coverage = computed(() => {
  const t = roll.value.totals;
  return raiseTarget.value > 0 ? (t.earned + t.gated) / raiseTarget.value : 0;
});
const rows = computed(() =>
  roll.value.rows.filter((r: any) => r.total > 0 || r.earnedUpliftValue > 0),
);
</script>

<template>
  <Panel class="print-area">
    <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
      <div class="section-label">Capital introductions · the board as a fundraising channel</div>
      <div class="text-xs tabular-nums text-ink-gray-6">
        Raise target {{ fUSD(raiseTarget) }} (bridge) · earned + gated cover
        {{ fPct(coverage, 0) }}
      </div>
    </div>

    <p v-if="!rows.length" class="text-p-xs text-ink-gray-6">
      No capital introductions tracked yet — add them per advisor in Edit package (Performance).
      Targeted pipelines roll up here against the raise; gated uplift converts to earned when the
      round closes.
    </p>

    <template v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-ink-gray-6">
              <th class="py-1.5 font-normal">Advisor</th>
              <th class="py-1.5 font-normal text-right">Targeted</th>
              <th class="py-1.5 font-normal text-right">Gated</th>
              <th class="py-1.5 font-normal text-right">Earned</th>
              <th class="py-1.5 font-normal text-right">Uplift owed (earned)</th>
              <th class="py-1.5 font-normal text-right">At ceiling</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-gray-1 tabular-nums">
            <tr v-for="r in rows" :key="r.advisorId">
              <td class="py-1.5 text-ink-gray-7">
                {{ sn(r.name) }}
                <Badge v-if="r.upliftViaGrants" theme="gray" variant="subtle" size="sm"
                  >via top-up grants</Badge
                >
              </td>
              <td class="py-1.5 text-right text-ink-gray-6">{{ fUSD(r.targeted) }}</td>
              <td
                class="py-1.5 text-right"
                :class="r.gated ? 'text-ink-amber-strong' : 'text-ink-gray-6'"
              >
                {{ fUSD(r.gated) }}
              </td>
              <td
                class="py-1.5 text-right"
                :class="r.earned ? 'text-ink-green-3' : 'text-ink-gray-6'"
              >
                {{ fUSD(r.earned) }}
              </td>
              <td class="py-1.5 text-right text-ink-gray-9">{{ fUSD(r.earnedUpliftValue) }}</td>
              <td class="py-1.5 text-right text-ink-gray-6">{{ fUSD(r.potentialUpliftValue) }}</td>
            </tr>
            <tr class="font-medium">
              <td class="py-1.5 text-ink-gray-9">Board</td>
              <td class="py-1.5 text-right text-ink-gray-9">{{ fUSD(roll.totals.targeted) }}</td>
              <td class="py-1.5 text-right text-ink-gray-9">{{ fUSD(roll.totals.gated) }}</td>
              <td class="py-1.5 text-right text-ink-gray-9">{{ fUSD(roll.totals.earned) }}</td>
              <td class="py-1.5 text-right text-ink-gray-9">
                {{ fUSD(roll.totals.earnedUpliftValue) }}
              </td>
              <td class="py-1.5 text-right text-ink-gray-9">
                {{ fUSD(roll.totals.potentialUpliftValue) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-p-xs text-ink-gray-6 mt-2">
        Expected capital in {{ fUSD(roll.totals.total) }} vs uplift owed out
        {{ fUSD(roll.totals.earnedUpliftValue) }} (earned) ·
        {{ fUSD(roll.totals.potentialUpliftValue) }} at ceiling. Schedule:
        {{ fUSD(roll.schedule.per) }} introduced → +{{ (roll.schedule.pct * 100).toFixed(0) }}% of
        base, cap +{{ (roll.schedule.cap * 100).toFixed(0) }}%, gated on
        {{ roundLabel(S.plan, roll.schedule.gate)
        }}<template v-if="!roll.schedule.gateReached"> (gate not yet reached)</template>. Gated
        amounts crystallise to earned when their round closes.
      </p>
    </template>
  </Panel>
</template>
