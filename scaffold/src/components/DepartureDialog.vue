<script setup lang="ts">
// COM-163 (F18): model a departure — the Rousseau scenario as one click, not a fire drill.
// The six-limb Bad-Leaver test classifies through the ENGINE (classifyLeaver — never ad hoc);
// modelDeparture computes vested-to-date per instrument (incl. the RTA 24-month qualifying
// rule), what lapses vs retains per Plan v9 Rule 5.8 + Board discretion, the pool return, and
// the Andersen disqualification warnings. Recording hands off to the COM-159 pipeline
// (stage → rolled-off). Zero money math in the view.
import { ref, computed } from "vue";
import { Badge, Button, Dialog, FormControl, Switch } from "frappe-ui";
import { DialogDescription } from "reka-ui";
import { useStudio } from "../store";
import {
  BAD_LEAVER_LIMBS,
  classifyLeaver,
  modelDeparture,
  fUSD,
  fNum,
  fTok,
  fDate,
  todayISO,
} from "../engine";
const props = defineProps<{ sel: any }>();
const open = defineModel<boolean>({ default: false });
const { store, recordDeparture } = useStudio();

const dateISO = ref(todayISO());
const death = ref(false);
const limbs = ref<number[]>([]);
function toggleLimb(n: number) {
  limbs.value = limbs.value.includes(n) ? limbs.value.filter((x) => x !== n) : [...limbs.value, n];
}
const leaverType = computed(() => classifyLeaver(death.value, limbs.value));
const result = computed(() =>
  modelDeparture(
    props.sel,
    leaverType.value,
    dateISO.value,
    store.S.plan,
    store.S.tiers,
    store.S.objectives,
  ),
);
const LEAVER_THEME: Record<string, string> = { bad: "red", good: "green", death: "gray" };
const instLabel: Record<string, string> = { option: "Options", rta: "Tokens (RTA)", cash: "Cash" };
const fQty = (r: any, n: number) =>
  r.instrument === "cash" ? fUSD(n) : r.instrument === "rta" ? fTok(n) : fNum(n);

function record() {
  // UXS-C: recording COMMITS the modeled outcome — grants materialise (retained frozen, lapsed
  // lapsed, cash accrued-only) and every surface moves; the stage flip rides the same record.
  recordDeparture(props.sel.id, leaverType.value, dateISO.value);
  open.value = false;
}
const dialogOptions = computed(() => ({
  title: props.sel ? `Model departure · ${props.sel.name}` : "Model departure",
  size: "2xl" as const,
}));
</script>

<template>
  <Dialog v-model="open" :options="dialogOptions">
    <template #body-content>
      <div v-if="sel" class="space-y-5">
        <DialogDescription class="block text-p-sm text-ink-gray-6 -mt-1">
          Model the leaver outcome under the plan rules; recording it commits the numbers.
        </DialogDescription>
        <!-- classification: date + death + the six limbs -->
        <div class="flex items-end gap-4 flex-wrap">
          <FormControl
            type="date"
            label="Cessation date"
            size="sm"
            :model-value="dateISO"
            @update:model-value="(v: string) => (dateISO = v)"
          />
          <label class="flex items-center gap-2 pb-1.5">
            <Switch :model-value="death" @update:model-value="(v: boolean) => (death = v)" />
            <span class="text-sm text-ink-gray-7">Death in service</span>
          </label>
          <Badge :theme="LEAVER_THEME[leaverType]" variant="subtle" class="mb-1.5"
            >{{ leaverType }} leaver</Badge
          >
        </div>
        <div>
          <div class="section-label mb-2">Bad-Leaver six-limb test (RTA-aligned)</div>
          <p v-if="death" class="text-p-xs text-ink-gray-6 mb-2">
            Death is never a Bad Leaver — the definition's carve-out applies even with limbs ticked.
          </p>
          <label
            v-for="l in BAD_LEAVER_LIMBS"
            :key="l.limb"
            class="flex items-start gap-2 py-1 cursor-pointer"
          >
            <input
              type="checkbox"
              class="mt-0.5 accent-current"
              :checked="limbs.includes(l.limb)"
              :aria-label="`Limb ${l.limb}`"
              @change="toggleLimb(l.limb)"
            />
            <span class="text-p-xs text-ink-gray-7">{{ l.limb }}. {{ l.label }}</span>
          </label>
        </div>

        <!-- the per-instrument outcome -->
        <div>
          <div class="section-label mb-2">
            Outcome at {{ fDate(dateISO) }} · per instrument, vested-to-date
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs text-ink-gray-6">
                  <th class="py-1.5 font-normal">Instrument</th>
                  <th class="py-1.5 font-normal text-right">Granted</th>
                  <th class="py-1.5 font-normal text-right">Vested</th>
                  <th class="py-1.5 font-normal text-right">Retained</th>
                  <th class="py-1.5 font-normal text-right">Lapses</th>
                  <th class="py-1.5 font-normal text-right">Retained value (today)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-gray-1 tabular-nums">
                <tr v-for="(r, i) in result.rows" :key="i">
                  <td class="py-1.5 text-ink-gray-7">
                    {{ instLabel[r.instrument] || r.instrument }}
                    <Badge v-if="r.exercised" theme="gray" variant="subtle" size="sm"
                      >exercised — issued shares</Badge
                    >
                    <Badge v-else-if="r.boardDiscretion" theme="orange" variant="subtle" size="sm"
                      >Board discretion</Badge
                    >
                  </td>
                  <td class="py-1.5 text-right text-ink-gray-9">{{ fQty(r, r.qty) }}</td>
                  <td class="py-1.5 text-right text-ink-gray-9">{{ fQty(r, r.vestedQty) }}</td>
                  <td class="py-1.5 text-right text-ink-gray-9">{{ fQty(r, r.retainedQty) }}</td>
                  <td
                    class="py-1.5 text-right"
                    :class="r.lapsedQty > 0 ? 'text-ink-red-3' : 'text-ink-gray-6'"
                  >
                    {{ fQty(r, r.lapsedQty) }}
                  </td>
                  <td class="py-1.5 text-right text-ink-gray-9">
                    {{ fUSD(r.retainedValueToday) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex flex-wrap gap-x-8 gap-y-1 mt-3 text-p-xs text-ink-gray-6 tabular-nums">
            <span
              >Retained <b class="text-ink-gray-9">{{ fUSD(result.retainedValueToday) }}</b> today ·
              {{ fUSD(result.retainedValue) }} at exit</span
            >
            <span
              >Forfeited <b class="text-ink-red-3">{{ fUSD(result.forfeitedValueToday) }}</b> today
              · {{ fUSD(result.forfeitedValue) }} at exit</span
            >
            <span v-if="result.poolReturned > 0"
              >{{ fNum(result.poolReturned) }} option shares return to the pool</span
            >
          </div>
        </div>

        <!-- the Andersen guardrails -->
        <div
          v-if="result.warnings.length"
          class="rounded border border-outline-amber-2 bg-surface-amber-1 p-3 space-y-1"
        >
          <p v-for="(w, i) in result.warnings" :key="i" class="text-p-xs text-ink-amber-strong">
            {{ w }}
          </p>
        </div>
        <p class="text-p-xs text-ink-gray-6">
          Vested-to-date is the ceiling — never accelerated. Tokens apply the 24-month qualifying
          rule; a Bad Leaver lapses vested and unvested options on cessation (Rule 5.8); good
          leavers may keep vested awards at Board discretion. Discussion draft, not a binding
          determination.
        </p>
      </div>
    </template>
    <template #actions>
      <div class="flex justify-end gap-2">
        <Button variant="ghost" theme="gray" label="Close" @click="open = false" />
        <!-- UXS-O (UXP 7.3): recording lapses awards — the button reads as destructive -->
        <Button variant="solid" theme="red" label="Record departure (roll off)" @click="record" />
      </div>
    </template>
  </Dialog>
</template>
