<script setup lang="ts">
// Reusable Vue wrapper around frappe-charts (vanilla SVG). Use for line/area,
// grouped bar, and percentage charts. For waterfall / staircase-steps / scatter,
// build small custom SVG components instead (frappe-charts lacks those).
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
// frappe-charts is framework-agnostic vanilla SVG. Bare import resolves to
// dist/frappe-charts.min.esm.js (package `module` field). It ships NO css file —
// styles self-inject at runtime, so do NOT import any frappe-charts css (the old
// `frappe-charts/dist/frappe-charts.min.css` does not exist in 1.6.2 and breaks the build).
// Use this wrapper for line/area, grouped/stacked bar, percentage, pie. For waterfall,
// scatter (not implemented in frappe-charts), football-field and vesting, use custom SVG.
// @ts-ignore — frappe-charts ships its own types loosely
import { Chart } from 'frappe-charts';

const props = defineProps<{
  type: 'line' | 'bar' | 'percentage' | 'pie' | 'axis-mixed';
  data: any;
  height?: number;
  colors?: string[];
  options?: Record<string, any>;
}>();

const el = ref<HTMLDivElement | null>(null);
let chart: any = null;
let ro: ResizeObserver | null = null;

function build() {
  if (!el.value) return;
  el.value.innerHTML = '';
  chart = new Chart(el.value, {
    type: props.type, data: props.data, height: props.height || 240,
    colors: props.colors, animate: false, ...(props.options || {}),
  });
}
// update() only swaps data; type/colours changes need a full rebuild.
watch(() => props.data, () => { chart?.update ? chart.update(props.data) : build(); }, { deep: true });
watch(() => [props.type, props.colors], build, { deep: true });

onMounted(() => {
  build();
  // frappe-charts only listens to window resize (its ResizeObserver is disabled), so a
  // chart built inside a hidden route/tab renders at 0 width — observe the container and
  // redraw on size change (covers route/tab show + responsive reflow).
  if (el.value && 'ResizeObserver' in window) {
    ro = new ResizeObserver(() => chart?.draw?.(true));
    ro.observe(el.value);
  }
});
onBeforeUnmount(() => { ro?.disconnect(); ro = null; chart?.destroy?.(); chart = null; });
</script>

<template><div ref="el" /></template>
