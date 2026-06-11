<script setup lang="ts">
// Inline click-to-edit numeric editor (the reference's NumIn + DField, unified). Semantic tokens
// throughout; the app is light-only (COM-72 made Configure light, COM-110 deleted the dark branch).
// Formats: usd / pct / pps / mult / num. Clamps to min/max. Enter commits, Escape cancels.
// UXS-J (ux-sweep CGC-4 + UXP 4.1/4.4): the editor announces its own clamps (a toast at the
// component — every consumer is covered, no per-call-site wiring); money fields accept 95M/95k
// shorthand and show a live formatted preview while editing (the operator stops counting zeros
// on the strike anchor); the display button's AX name carries the current value.
import { computed, ref, nextTick } from "vue";
import { toast } from "frappe-ui";
import { fUSD, fPct, fMult, fNum, fPps, ok, clamp } from "../engine";

const props = withDefaults(
  defineProps<{
    modelValue: number;
    fmt?: "usd" | "pct" | "pps" | "mult" | "num";
    min?: number;
    max?: number;
    ariaLabel?: string;
  }>(),
  { fmt: "num", min: -Infinity, max: Infinity },
);
const emit = defineEmits<{
  (e: "update:modelValue", v: number): void;
  // COM-77: fired when commit() coerces an out-of-range value, so the parent can show a
  // transient FormControl-style helper. Presentation feedback only — clamp stays the engine's.
  (e: "clamp", message: string): void;
}>();

const edit = ref(false);
const draft = ref("");
const inputEl = ref<HTMLInputElement | null>(null);

// UXP 4.1: '95M' / '1.5k' / '$90,000,000' all parse; the preview renders what will commit.
function parseDraft(raw: string): number {
  const m = String(raw)
    .trim()
    .match(/^\$?\s*(-?[0-9][0-9,]*\.?[0-9]*)\s*([kKmMbB])?\s*$/);
  if (!m) return NaN;
  let v = parseFloat(m[1].replace(/,/g, ""));
  if (isNaN(v)) return NaN;
  const suf = (m[2] || "").toLowerCase();
  if (suf === "k") v *= 1e3;
  else if (suf === "m") v *= 1e6;
  else if (suf === "b") v *= 1e9;
  return v;
}
const preview = computed(() => {
  if (!edit.value) return "";
  let v = parseDraft(draft.value);
  if (isNaN(v)) return "";
  if (props.fmt === "pct") v /= 100;
  return fmtVal(clamp(v, props.min!, props.max!));
});

function fmtVal(v: number): string {
  return props.fmt === "usd"
    ? fUSD(v)
    : props.fmt === "pct"
      ? fPct(v, 2)
      : props.fmt === "pps"
        ? fPps(v) // UXS-I (ux-sweep CGC-11): '$1572.95' beside a caption reading '$1,572.95'
        : props.fmt === "mult"
          ? fMult(v)
          : fNum(v);
}
function disp(): string {
  return fmtVal(props.modelValue);
}
async function start() {
  const mv = props.modelValue ?? 0; // undefined scenario fields edit from 0, not "NaN"/"undefined"
  draft.value = String(props.fmt === "pct" ? +(mv * 100).toFixed(4) : mv);
  edit.value = true;
  await nextTick();
  inputEl.value?.focus();
  inputEl.value?.select();
}
function commit() {
  // panel 008 (R3.18 wart): Enter commits and unmounts the input, whose unmount blur fires
  // commit() AGAIN — the same value re-emitted, duplicating downstream effects (two identical
  // audit events per edit). One commit per edit session.
  if (!edit.value) return;
  let v = parseDraft(draft.value);
  if (isNaN(v)) v = parseFloat(draft.value.replace(/[^0-9.-]/g, ""));
  if (!isNaN(v)) {
    if (props.fmt === "pct") v /= 100;
    const c = clamp(v, props.min!, props.max!);
    if (c !== v) {
      const lo = isFinite(props.min!) ? fmtVal(props.min!) : null;
      const hi = isFinite(props.max!) ? fmtVal(props.max!) : null;
      const range =
        lo && hi ? ` (allowed ${lo}–${hi})` : lo ? ` (min ${lo})` : hi ? ` (max ${hi})` : "";
      const msg = `Adjusted to ${fmtVal(c)}${range}`;
      emit("clamp", msg);
      // UXS-J (ux-sweep CGC-4): the clamp announces ITSELF — Configure's ~30 NumIns silently
      // coerced out-of-range input. Parents with their own inline display (COM-77) still get
      // the event; the toast is the floor every consumer inherits.
      toast.error(msg);
    }
    emit("update:modelValue", c);
  }
  edit.value = false;
}
</script>

<template>
  <span v-if="edit" class="relative inline-block w-full min-w-0">
    <input
      ref="inputEl"
      v-model="draft"
      :aria-label="ariaLabel"
      class="w-full min-w-0 bg-surface-white border border-outline-gray-3 rounded px-2 py-1 text-sm tabular-nums text-ink-gray-9 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--ink-gray-6)] focus:border-outline-gray-3"
      @blur="commit"
      @keydown.enter.prevent="commit"
      @keydown.escape.stop="edit = false"
    />
    <!-- UXP 4.1: the live preview — '95M' reads back as '$95.0M' before it commits -->
    <span
      v-if="preview && preview !== draft"
      class="absolute left-0 top-full mt-0.5 z-10 rounded bg-surface-gray-7 px-1.5 py-0.5 text-xs tabular-nums text-ink-white pointer-events-none"
      aria-hidden="true"
      >= {{ preview }}</span
    >
  </span>
  <button
    v-else
    type="button"
    :aria-label="ariaLabel ? `${ariaLabel}: ${disp()}` : undefined"
    :title="`Click to edit (accepts 95M / 1.5k shorthand)`"
    class="text-left tabular-nums text-ink-gray-9 border-b border-dashed border-transparent hover:border-outline-gray-4 hover:text-ink-amber-strong transition-colors"
    @click="start"
  >
    {{ disp() }}
  </button>
</template>
