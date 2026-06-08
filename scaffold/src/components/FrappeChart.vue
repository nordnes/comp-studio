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

// COM-16 contract: pass a PLAIN snapshot to Chart/update — frappe-charts deep-clones and mutating a
// reactive proxy in place won't update; passing the proxy can also confuse it.
function snap(d: any) { try { return JSON.parse(JSON.stringify(d)); } catch { return d; } }
function build() {
  if (!el.value) return;
  el.value.innerHTML = '';
  chart = new Chart(el.value, {
    type: props.type, data: snap(props.data), height: props.height || 240,
    colors: props.colors, animate: false, ...(props.options || {}),
  }); // new Chart returns undefined for an unknown type — guarded below.
  // frappe-charts (animate:false) can paint a degenerate axis / 0-height bars until a redraw — force one
  // on the next frame so the FIRST paint is correct, without waiting for a resize event.
  requestAnimationFrame(() => chart?.draw?.(true));
}
// update() only swaps data; type/colours changes need a full rebuild (destroy+new via build()).
watch(() => props.data, () => { if (chart && typeof chart.update === 'function') chart.update(snap(props.data)); else build(); }, { deep: true });
watch(() => [props.type, props.colors], build, { deep: true });

onMounted(() => {
  build(); // build synchronously so the chart exists; build() forces a next-frame redraw to correct it.
  // frappe-charts only listens to window resize (its ResizeObserver is disabled), so also
  // observe the container and redraw on size change (responsive reflow, sidebar, etc.).
  if (el.value && 'ResizeObserver' in window) {
    ro = new ResizeObserver(() => chart?.draw?.(true));
    ro.observe(el.value);
  }
});
onBeforeUnmount(() => { ro?.disconnect(); ro = null; chart?.destroy?.(); chart = null; });
</script>

<template><div ref="el" /></template>
