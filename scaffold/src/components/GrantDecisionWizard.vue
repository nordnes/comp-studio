<script setup lang="ts">
// COM-165 (B.3/Part 12): the Ispahani 9-step grant-decision process as a guided flow. The
// steps are VERBATIM (engine ISPAHANI_STEPS); steps 5–8 carry live engine context (the
// total-comp picture, the market comparison, the internal comparators, the reserve position)
// so the operator answers against the numbers, not from memory. Recording leaves the artefact —
// "the strongest possible answer to 'defend it in a board conversation'."
import { ref, computed } from "vue";
import { Button, Dialog, FormControl, Select, TextInput } from "frappe-ui";
import { DialogDescription } from "reka-ui";
import { useStudio } from "../store";
import { ISPAHANI_STEPS, generosityCheck, poolGuardrail, fUSD, fPct } from "../engine";
const open = defineModel<boolean>({ default: false });
const { store, recordDecision } = useStudio();
const S = computed(() => store.S);

const subject = ref("");
const advisorId = ref("");
const decidedBy = ref("");
const answers = ref<string[]>(Array(ISPAHANI_STEPS.length).fill(""));
const advisorOpts = computed(() => [
  { label: "Board-level (no single advisor)", value: "" },
  ...S.value.advisors.map((a) => ({ label: a.name, value: a.id })),
]);

// live context per step — engine reads only
const generosity = computed(() =>
  generosityCheck(S.value.advisors, S.value.plan, S.value.tiers, S.value.objectives),
);
const guard = computed(() => poolGuardrail(S.value.plan));
const selRow = computed(() => generosity.value.rows.find((r) => r.advisorId === advisorId.value));
const stepContext = computed(() => {
  const g = generosity.value;
  const ctx: Record<number, string> = {};
  if (selRow.value) {
    ctx[4] = `Live: ${selRow.value.name} totals ${fUSD(selRow.value.baseCaseTotal)} at base (${fUSD(selRow.value.annual)}/yr).`;
    ctx[5] = `Live: compa ${selRow.value.compa.toFixed(2)} vs the ${fUSD(g.anchorUSD)}/yr advisory median${selRow.value.flags.length ? ` · ${selRow.value.flags.length} guardrail flag(s)` : ""}.`;
  }
  ctx[6] =
    `Live: board median ${fUSD(g.median)}; ` +
    g.rows.map((r) => `${r.name.split(" ")[0]} ${fUSD(r.annual)}/yr`).join(" · ");
  ctx[7] = `Live: ${guard.value.msg}`;
  return ctx;
});

function reset() {
  subject.value = "";
  advisorId.value = "";
  decidedBy.value = "";
  answers.value = Array(ISPAHANI_STEPS.length).fill("");
}
// UXP 2.3/2.4: an empty submit must say so AT THE FIELD — the rejection toast renders
// bottom-right outside the dialog's visual focus and the dialog otherwise just sits there.
const subjectError = ref("");
function record() {
  if (!subject.value.trim()) {
    subjectError.value = "Subject is required — what grant is this about?";
    (document.querySelector('[aria-label="Decision subject"]') as HTMLElement | null)?.focus();
    return;
  }
  subjectError.value = "";
  const ok = recordDecision({
    subject: subject.value,
    advisorId: advisorId.value || undefined,
    answers: answers.value,
    decidedBy: decidedBy.value || undefined,
  });
  if (ok) {
    reset();
    open.value = false;
  }
}
const dialogOptions = {
  title: "New grant decision · the Ispahani 9 steps",
  size: "2xl" as const,
};
</script>

<template>
  <Dialog v-model="open" :options="dialogOptions">
    <template #body-content>
      <div class="space-y-4">
        <DialogDescription class="block text-p-sm text-ink-gray-6 -mt-1">
          Walk the nine steps with live context; recording lands a decision artefact on Governance.
        </DialogDescription>
        <div class="flex items-end gap-3 flex-wrap">
          <div class="flex-1 min-w-44">
            <TextInput
              v-model="subject"
              size="sm"
              placeholder="Subject — e.g. Iraj chair package v2"
              aria-label="Decision subject"
              :aria-invalid="subjectError ? 'true' : undefined"
              @update:model-value="subjectError = ''"
            />
            <p v-if="subjectError" class="mt-1 text-p-xs text-ink-red-3" role="alert">
              {{ subjectError }}
            </p>
          </div>
          <div>
            <div class="text-xs text-ink-gray-6 mb-1">About</div>
            <Select
              :model-value="advisorId"
              :options="advisorOpts"
              aria-label="Decision advisor"
              @update:model-value="(v) => (advisorId = v)"
            />
          </div>
          <TextInput
            v-model="decidedBy"
            size="sm"
            placeholder="Decided by"
            aria-label="Decided by"
          />
        </div>
        <div class="space-y-3">
          <div v-for="(step, i) in ISPAHANI_STEPS" :key="i">
            <FormControl
              type="textarea"
              :label="`${i + 1}. ${step}`"
              size="sm"
              :rows="1"
              :model-value="answers[i]"
              @update:model-value="(v: string) => (answers[i] = v)"
            />
            <p v-if="stepContext[i]" class="text-p-xs text-ink-gray-6 mt-0.5 tabular-nums">
              {{ stepContext[i] }}
            </p>
          </div>
        </div>
        <p class="text-p-xs text-ink-gray-6">
          The verbatim Ispahani sequence (B.3). Recording leaves an artefact per decision — the
          answer to "defend it in a board conversation". Step 8's reserve discipline is the standing
          guardrail.
        </p>
      </div>
    </template>
    <template #actions>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" theme="gray" label="Cancel" @click="open = false" />
        <Button variant="solid" theme="gray" label="Record decision" @click="record" />
      </div>
    </template>
  </Dialog>
</template>
