<script setup lang="ts">
// COM-169 (F23): run an exercise event — holder + grant + share count → window check (Board
// window or the 3.6 backstop) → the cash-free election routes → the jurisdictional checklist
// (s431 within 14 days; the PSC issuance-route flag at every Contracted-Entity exercise;
// 83(b)/409A; the deed of adherence) → the pack summary. Modeling + checklist (the spec's v1
// scope); zero money math in the view — exerciseRunbook composes COM-151/153/168.
import { ref, computed, watch } from "vue";
import { Badge, Button, Dialog, TextInput } from "frappe-ui";
import { DialogDescription } from "reka-ui";
import { useStudio } from "../store";
import { exerciseRunbook, computeGrant, baseScenKey, fUSD, fPps, fNum, todayISO } from "../engine";
const props = defineProps<{ sel: any; grant: any | null }>();
const open = defineModel<boolean>({ default: false });
const { store } = useStudio();

const qty = ref(0);
const maxQty = computed(() =>
  props.grant
    ? computeGrant(props.grant, store.S.plan, baseScenKey(store.S.plan)).quantity || 0
    : 0,
);
watch(open, (v) => {
  if (v) qty.value = Math.round(maxQty.value);
});
const pack = computed(() =>
  props.grant ? exerciseRunbook(props.sel, props.grant, qty.value, todayISO(), store.S.plan) : null,
);
const STATUS_THEME: Record<string, string> = { ok: "green", action: "orange", blocked: "red" };
const dialogOptions = computed(() => ({
  title: props.sel ? `Exercise runbook · ${props.sel.name}` : "Exercise runbook",
  size: "xl" as const,
}));
</script>

<template>
  <Dialog v-model="open" :options="dialogOptions">
    <template #body-content>
      <div v-if="pack && grant" class="space-y-4">
        <DialogDescription class="block text-p-sm text-ink-gray-6 -mt-1">
          Window, election and checklist for exercising this grant — display truth, no Board
          discretion simulated.
        </DialogDescription>
        <div class="flex items-end gap-3 flex-wrap">
          <div>
            <div class="text-xs text-ink-gray-6 mb-1">
              Shares to exercise · {{ fNum(maxQty) }} granted
            </div>
            <TextInput
              type="number"
              size="sm"
              :model-value="String(qty)"
              aria-label="Shares to exercise"
              @update:model-value="(v: string) => (qty = Number(v) || 0)"
            />
          </div>
          <Badge :theme="pack.blocked ? 'red' : 'green'" variant="subtle" class="mb-1.5">{{
            pack.blocked ? "blocked" : "clear to run"
          }}</Badge>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm tabular-nums">
          <div>
            <div class="text-xs text-ink-gray-6">Exercise cost</div>
            <div class="text-ink-gray-9">{{ fUSD(pack.costs.exerciseCost) }}</div>
          </div>
          <div>
            <div class="text-xs text-ink-gray-6">FMV ({{ pack.costs.valuationBasis }})</div>
            <div class="text-ink-gray-9">{{ fUSD(pack.costs.fmvValue) }}</div>
          </div>
          <div>
            <div class="text-xs text-ink-gray-6">Intrinsic (FMV − strike)</div>
            <div :class="pack.costs.underwater ? 'text-ink-red-3' : 'text-ink-gray-9'">
              {{ pack.costs.underwater ? "underwater" : fUSD(pack.costs.intrinsic) }}
            </div>
          </div>
          <div>
            <div class="text-xs text-ink-gray-6">Strike / FMV per share</div>
            <div class="text-ink-gray-9">
              {{ fPps(pack.costs.strikePps) }} / {{ fPps(pack.costs.fmvPps) }}
            </div>
          </div>
        </div>

        <div>
          <div class="section-label mb-2">The runbook · compliant by construction</div>
          <ul class="space-y-2">
            <li v-for="it in pack.items" :key="it.id" class="flex items-start gap-2">
              <Badge :theme="STATUS_THEME[it.status]" variant="subtle" size="sm" class="mt-0.5">{{
                it.status
              }}</Badge>
              <span class="text-p-xs text-ink-gray-7">{{ it.label }}</span>
            </li>
          </ul>
        </div>
        <p class="text-p-xs text-ink-gray-6">
          Modeling and checklist only — an internal discussion draft, not an instruction to exercise
          and not tax or legal advice. Document generation follows in a later issue.
        </p>
      </div>
    </template>
    <template #actions>
      <div class="flex justify-end">
        <Button variant="ghost" theme="gray" label="Close" @click="open = false" />
      </div>
    </template>
  </Dialog>
</template>
