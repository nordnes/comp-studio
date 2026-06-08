<script setup lang="ts">
// Inline click-to-edit numeric editor (the reference's NumIn + DField, unified). Theme-aware via semantic
// tokens — renders light in normal views and dark inside a [data-theme="dark"] panel (Configure). Formats:
// usd / pct / pps / mult / num. Clamps to min/max. Enter commits, Escape cancels.
import { ref, nextTick } from 'vue';
import { fUSD, fPct, fMult, fNum, ok, clamp } from '../engine';

const props = withDefaults(defineProps<{
  modelValue: number;
  fmt?: 'usd' | 'pct' | 'pps' | 'mult' | 'num';
  min?: number; max?: number; ariaLabel?: string;
}>(), { fmt: 'num', min: -Infinity, max: Infinity });
const emit = defineEmits<{ (e: 'update:modelValue', v: number): void }>();

const edit = ref(false);
const draft = ref('');
const inputEl = ref<HTMLInputElement | null>(null);

function disp(): string {
  const v = props.modelValue;
  return props.fmt === 'usd' ? fUSD(v)
    : props.fmt === 'pct' ? fPct(v, 2)
    : props.fmt === 'pps' ? `$${ok(v) ? v.toFixed(2) : '—'}`
    : props.fmt === 'mult' ? fMult(v)
    : fNum(v);
}
async function start() {
  draft.value = String(props.fmt === 'pct' ? +(props.modelValue * 100).toFixed(4) : props.modelValue);
  edit.value = true;
  await nextTick();
  inputEl.value?.focus();
  inputEl.value?.select();
}
function commit() {
  let v = parseFloat(draft.value.replace(/[^0-9.\-]/g, ''));
  if (!isNaN(v)) { if (props.fmt === 'pct') v /= 100; emit('update:modelValue', clamp(v, props.min!, props.max!)); }
  edit.value = false;
}
</script>

<template>
  <input v-if="edit" ref="inputEl" v-model="draft" :aria-label="ariaLabel"
    class="w-full min-w-0 bg-surface-white border border-outline-gray-3 rounded px-2 py-1 text-sm tabular-nums text-ink-gray-9 outline-none focus:border-outline-gray-3"
    @blur="commit" @keydown.enter.prevent="commit" @keydown.escape="edit = false" />
  <button v-else type="button" :aria-label="ariaLabel"
    class="text-left tabular-nums text-ink-gray-9 border-b border-dashed border-transparent hover:border-outline-gray-3 hover:text-ink-amber-3 transition-colors"
    @click="start">{{ disp() }}</button>
</template>
