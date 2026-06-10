<script setup lang="ts">
// COM-96: the shared roster-table chrome — overflow/print wrapper, sr-only caption, the header row
// with right-aligned numeric columns, and the neutral total band (COM-118: a sum is not the current
// case). Engine values render in the host's slots — NO money math in here.
// Decision record (issue asked adopt-vs-custom): frappe-ui ListView's single-row-object model fights
// the scenario-dynamic columns, the col-span layouts and the aggregate footer — local primitive kept.
withDefaults(
  defineProps<{
    columns: { label: string; align?: "right" | "left"; noPrint?: boolean }[];
    caption?: string;
    minWidth?: string;
  }>(),
  { caption: "", minWidth: "560px" },
);
</script>

<template>
  <div class="overflow-x-auto print-area">
    <table class="w-full text-sm" :style="{ minWidth }">
      <caption v-if="caption" class="sr-only">
        {{
          caption
        }}
      </caption>
      <thead>
        <tr class="border-b border-outline-gray-2 text-left text-ink-gray-6">
          <th
            v-for="(c, i) in columns"
            :key="i"
            class="py-3 font-normal"
            :class="[c.align === 'right' ? 'text-right' : '', c.noPrint ? 'no-print px-2' : 'px-4']"
          >
            {{ c.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <slot />
      </tbody>
      <tfoot v-if="$slots.total">
        <tr class="bg-surface-gray-1 border-t border-outline-gray-2">
          <slot name="total" />
        </tr>
      </tfoot>
    </table>
  </div>
</template>
