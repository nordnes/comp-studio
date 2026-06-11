<script setup lang="ts">
// Inline click-to-edit numeric editor (the reference's NumIn + DField, unified). Semantic tokens
// throughout; the app is light-only (COM-72 made Configure light, COM-110 deleted the dark branch).
// Formats: usd / pct / pps / mult / num. Clamps to min/max. Enter commits, Escape cancels.
import { ref, nextTick } from "vue";
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
  let v = parseFloat(draft.value.replace(/[^0-9.-]/g, ""));
  if (!isNaN(v)) {
    if (props.fmt === "pct") v /= 100;
    const c = clamp(v, props.min!, props.max!);
    if (c !== v) {
      const lo = isFinite(props.min!) ? fmtVal(props.min!) : null;
      const hi = isFinite(props.max!) ? fmtVal(props.max!) : null;
      const range =
        lo && hi ? ` (allowed ${lo}–${hi})` : lo ? ` (min ${lo})` : hi ? ` (max ${hi})` : "";
      emit("clamp", `Adjusted to ${fmtVal(c)}${range}`);
    }
    emit("update:modelValue", c);
  }
  edit.value = false;
}
</script>

<template>
  <input
    v-if="edit"
    ref="inputEl"
    v-model="draft"
    :aria-label="ariaLabel"
    class="w-full min-w-0 bg-surface-white border border-outline-gray-3 rounded px-2 py-1 text-sm tabular-nums text-ink-gray-9 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--ink-gray-6)] focus:border-outline-gray-3"
    @blur="commit"
    @keydown.enter.prevent="commit"
    @keydown.escape.stop="edit = false"
  />
  <button
    v-else
    type="button"
    :aria-label="ariaLabel"
    class="text-left tabular-nums text-ink-gray-9 border-b border-dashed border-transparent hover:border-outline-gray-3 hover:text-ink-amber-strong transition-colors"
    @click="start"
  >
    {{ disp() }}
  </button>
</template>
