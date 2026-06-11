<script setup lang="ts">
// COM-158 (F16): the review workflow — "start everyone the same; review and top up the keepers"
// (Iraj), on the record. Schedule a checkpoint (calendar or round event), complete it with
// inputs → outcome → approver, and a top-up appends a NEW grant priced at the then-current
// round (the COM-144 growth story). Store actions do the writing; the engine prices everything.
import { ref, computed } from "vue";
import { Badge, Button, Select, TextInput, FormControl } from "frappe-ui";
import { useStudio } from "../store";
import { REVIEW_OUTCOMES, nextReviewDue, fDate, fUSD } from "../engine";
const props = defineProps<{ sel: any }>();
const { store, scheduleReview, completeReview } = useStudio();

const reviews = computed(() =>
  (Array.isArray(props.sel?.reviews) ? [...props.sel.reviews] : []).sort((a: any, b: any) =>
    a.scheduledISO.localeCompare(b.scheduledISO),
  ),
);
const openReview = computed(() => reviews.value.find((r: any) => !r.completedISO) || null);
const due = computed(() => nextReviewDue(props.sel, store.S.plan));

// schedule form
const schedOpen = ref(false);
const schedDate = ref("");
const schedTrigger = ref("scheduled");
const schedNote = ref("");
function onSchedule() {
  scheduleReview(props.sel.id, {
    scheduledISO: schedDate.value || due.value.dueISO,
    trigger: schedTrigger.value,
    eventNote: schedTrigger.value === "event" ? schedNote.value : undefined,
  });
  schedOpen.value = false;
  schedNote.value = "";
}

// complete form (the earliest open review)
const inputs = ref("");
const outcome = ref("no-change");
const approver = ref("");
const topUpValue = ref(50000);
function onComplete() {
  const ok = completeReview(props.sel.id, openReview.value.id, {
    inputs: inputs.value,
    outcome: outcome.value,
    approver: approver.value,
    topUpValueUSD: outcome.value === "top-up" ? topUpValue.value : undefined,
  });
  if (ok) {
    inputs.value = "";
    approver.value = "";
    outcome.value = "no-change";
  }
}
const OUTCOME_THEME: Record<string, string> = {
  "no-change": "gray",
  "top-up": "green",
  "band-change": "blue",
  "roll-off": "red",
};
const outcomeOpts = REVIEW_OUTCOMES.map((o) => ({ label: o, value: o }));
</script>

<template>
  <div class="mt-8">
    <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
      <div class="section-label">Reviews · the growth mechanic, on the record</div>
      <Button
        variant="subtle"
        theme="gray"
        size="sm"
        icon-left="lucide-calendar-plus"
        label="Schedule review"
        @click="
          schedDate = due.dueISO;
          schedOpen = !schedOpen;
        "
      />
    </div>

    <div
      v-if="schedOpen"
      class="rounded border border-outline-gray-2 bg-surface-gray-2 p-3 mb-3 flex items-end gap-3 flex-wrap"
    >
      <FormControl
        type="date"
        label="Checkpoint"
        size="sm"
        :model-value="schedDate"
        @update:model-value="(v: string) => (schedDate = v)"
      />
      <div>
        <div class="text-xs text-ink-gray-6 mb-1">Trigger</div>
        <Select
          :model-value="schedTrigger"
          :options="[
            { label: 'Calendar checkpoint', value: 'scheduled' },
            { label: 'Round event', value: 'event' },
          ]"
          aria-label="Review trigger"
          @update:model-value="(v) => (schedTrigger = v)"
        />
      </div>
      <TextInput
        v-if="schedTrigger === 'event'"
        v-model="schedNote"
        size="sm"
        placeholder="e.g. Series A close"
        aria-label="Event note"
      />
      <Button variant="solid" theme="gray" size="sm" label="Schedule" @click="onSchedule" />
    </div>

    <p v-if="!reviews.length && !schedOpen" class="text-p-xs text-ink-gray-6">
      No reviews yet — the cadence projects the next checkpoint for {{ fDate(due.dueISO) }}. Reviews
      record engagement, objectives earned and the board view; a top-up outcome appends a new grant
      priced at the then-current round.
    </p>

    <!-- history timeline (the Frappe HR appraisal-cycle pattern) -->
    <div v-if="reviews.length" class="divide-y divide-outline-gray-1">
      <div v-for="r in reviews" :key="r.id" class="py-2.5 flex items-start gap-3 flex-wrap">
        <span class="text-sm tabular-nums text-ink-gray-9 w-24 shrink-0">{{
          fDate(r.scheduledISO)
        }}</span>
        <Badge v-if="r.outcome" :theme="OUTCOME_THEME[r.outcome] || 'gray'" variant="subtle">{{
          r.outcome
        }}</Badge>
        <Badge v-else theme="orange" variant="subtle">open</Badge>
        <span class="text-p-xs text-ink-gray-6">
          {{ r.trigger === "event" ? r.eventNote || "round event" : "calendar" }}
          <template v-if="r.approver"> · signed off by {{ r.approver }}</template>
          <template v-if="r.completedISO"> · {{ fDate(r.completedISO) }}</template>
        </span>
        <span v-if="r.inputs" class="basis-full text-p-xs text-ink-gray-7">{{ r.inputs }}</span>
      </div>
    </div>

    <!-- complete the earliest open review -->
    <div
      v-if="openReview"
      class="rounded border border-outline-gray-2 bg-surface-gray-2 p-3 mt-3 space-y-3"
    >
      <div class="text-xs text-ink-gray-6">
        Complete the {{ fDate(openReview.scheduledISO) }} review
      </div>
      <FormControl
        type="textarea"
        label="Inputs — engagement, objectives earned, board view"
        size="sm"
        :rows="2"
        :model-value="inputs"
        @update:model-value="(v: string) => (inputs = v)"
      />
      <div class="flex items-end gap-3 flex-wrap">
        <div>
          <div class="text-xs text-ink-gray-6 mb-1">Outcome</div>
          <Select
            :model-value="outcome"
            :options="outcomeOpts"
            aria-label="Review outcome"
            @update:model-value="(v) => (outcome = v)"
          />
        </div>
        <div v-if="outcome === 'top-up'">
          <div class="text-xs text-ink-gray-6 mb-1">Top-up value ($, at the current round)</div>
          <TextInput
            type="number"
            size="sm"
            :model-value="String(topUpValue)"
            aria-label="Top-up value USD"
            @update:model-value="(v: string) => (topUpValue = Number(v) || 0)"
          />
        </div>
        <TextInput
          v-model="approver"
          size="sm"
          placeholder="Approver (required)"
          aria-label="Approver"
        />
        <Button
          variant="solid"
          theme="gray"
          size="sm"
          label="Complete review"
          @click="onComplete"
        />
      </div>
      <p class="text-p-xs text-ink-gray-6">
        No one decides their own comp — grandparent approval minimum (B.1 #5). A top-up appends a
        draft option grant priced at the then-current round{{
          outcome === "top-up"
            ? ` (${fUSD(topUpValue)} base-case value → options at the current round)`
            : ""
        }}; it shows on the Instruments tab.
      </p>
    </div>
  </div>
</template>
