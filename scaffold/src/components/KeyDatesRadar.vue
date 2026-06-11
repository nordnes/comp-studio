<script setup lang="ts">
// COM-173 (M13 #2): the cross-advisor key-dates radar — one merged, forward-looking feed so the
// founder/chair never misses a qualifying gate, a window expiry, a backstop, or a review coming
// due (the Carta grant-timeline / Tokenomist upcoming-unlocks pattern). Computed on load from
// the engine's PER-ADVISOR exports (trajectoryEvents + nextReviewDue) — the roster-level merge
// is the only new thing here; no money math, no persistence, no server.
import { ref, computed } from "vue";
import { Badge } from "frappe-ui";
import { useStudio } from "../store";
import { trajectoryEvents, nextReviewDue, addMonthsUTC, fDate, todayISO } from "../engine";
import { shortName } from "../constants";
import Panel from "./Panel.vue";

const { store } = useStudio();
const S = computed(() => store.S);
const horizon = ref<90 | 180>(90);

const rosterNames = computed(() => S.value.advisors.map((a: any) => a.name));
const sn = (n: string) => shortName(n, rosterNames.value);

// the consequence line per event kind — what the date MEANS, not just what it is
const CONSEQUENCE: Record<string, string> = {
  cliff: "vesting cliff — the first 25% of options vests",
  tranche: "annual tranche — another 25% of options vests",
  qualifying: "qualifying gate — accrued tokens become distributable; the Bad-Leaver window ends",
  review: "scheduled review checkpoint",
  "review-due": "review due by cadence — schedule it",
  tge: "TGE — token vesting begins from here",
  backstop: "Clause 3.6 backstop — a ≥90-day exercise window must open",
};
const KIND_THEME: Record<string, string> = {
  qualifying: "orange",
  backstop: "orange",
  "review-due": "blue",
  review: "blue",
  tge: "green",
  cliff: "gray",
  tranche: "gray",
};

const feed = computed(() => {
  const today = todayISO();
  const end = addMonthsUTC(today, horizon.value === 90 ? 3 : 6);
  const rows: {
    dateISO: string;
    advisor: string;
    kind: string;
    label: string;
    consequence: string;
  }[] = [];
  for (const a of S.value.advisors) {
    const evs = trajectoryEvents(a as any, S.value.plan, S.value.tiers, S.value.objectives);
    for (const e of evs) {
      if (e.kind === "start" || e.kind === "today" || e.kind === "round") continue;
      if (e.dateISO > today && e.dateISO <= end) {
        rows.push({
          dateISO: e.dateISO,
          advisor: sn(a.name),
          kind: e.kind,
          label: e.label,
          consequence: CONSEQUENCE[e.kind] || "",
        });
      }
    }
    // the cadence projection for advisors with no open review (trajectoryEvents already emits
    // review/review-due — this catch is only for overdue ones, which sort to the top)
    const due = nextReviewDue(a as any, S.value.plan, today);
    if (due.overdue) {
      rows.push({
        dateISO: due.dueISO,
        advisor: sn(a.name),
        kind: "review-overdue",
        label: "Review OVERDUE",
        consequence: `was due ${fDate(due.dueISO)} — schedule it`,
      });
    }
  }
  rows.sort((x, y) => x.dateISO.localeCompare(y.dateISO));
  return rows;
});
</script>

<template>
  <Panel class="space-y-3">
    <div class="flex items-center justify-between flex-wrap gap-2">
      <div class="section-label">Key dates · the next {{ horizon }} days, all advisors</div>
      <div class="flex rounded-md border border-outline-gray-2 overflow-hidden no-print">
        <button
          v-for="h in [90, 180]"
          :key="h"
          :aria-pressed="horizon === h"
          class="px-2 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ink-gray-6)]"
          :class="
            horizon === h
              ? 'bg-surface-gray-3 text-ink-gray-9'
              : 'text-ink-gray-5 hover:bg-surface-gray-1'
          "
          @click="horizon = h as 90 | 180"
        >
          {{ h }}d
        </button>
      </div>
    </div>
    <p v-if="!feed.length" class="text-p-xs text-ink-gray-6">
      Nothing lands in the next {{ horizon }} days — no gates, tranches, reviews or backstops across
      the roster.
    </p>
    <div v-else class="divide-y divide-outline-gray-1">
      <div v-for="(r, i) in feed" :key="i" class="py-1.5 flex items-baseline gap-3 flex-wrap">
        <span class="text-xs tabular-nums text-ink-gray-6 w-20 shrink-0">{{
          fDate(r.dateISO)
        }}</span>
        <span class="text-sm text-ink-gray-9 w-24 shrink-0">{{ r.advisor }}</span>
        <Badge
          :theme="r.kind === 'review-overdue' ? 'red' : KIND_THEME[r.kind] || 'gray'"
          variant="subtle"
          size="sm"
          >{{ r.label }}</Badge
        >
        <span class="text-p-xs text-ink-gray-6">{{ r.consequence }}</span>
      </div>
    </div>
  </Panel>
</template>
