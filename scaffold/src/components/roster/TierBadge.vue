<script setup lang="ts">
// COM-96: the tier pill, byte-identical wherever it appears. Owns the one piece of shared
// presentation logic: a $value-mode advisor shows '$value' instead of a tier name.
import { computed } from "vue";
import { Badge } from "frappe-ui";

const props = withDefaults(defineProps<{ mode?: string; tierName?: string }>(), {
  mode: "tier",
  tierName: "",
});
const label = computed(() => (props.mode === "value" ? "$value" : props.tierName || "—"));
</script>

<template>
  <!-- panel 008 (R4.2): gray, not orange — the pill states tier CLASSIFICATION, which is
       neither current/active-case nor status; amber stays reserved (DESIGN_SYSTEM §3) -->
  <Badge :label="label" theme="gray" variant="subtle" size="sm" />
</template>
