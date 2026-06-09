<script setup lang="ts">
// COM-52: glossary tooltip. Wraps load-bearing finance jargon in a frappe-ui Tooltip so the
// definition is a hover/focus affordance, not buried in footnotes. Presentation-only; definitions
// live in constants.ts GLOSSARY. The trigger is keyboard-focusable; reka-ui wires aria-describedby
// to the bubble on focus. Default slot overrides the displayed text (keeps the existing label).
import { Tooltip } from "frappe-ui";
import { GLOSSARY } from "../constants";

const props = defineProps<{ k: keyof typeof GLOSSARY }>();
const entry = GLOSSARY[props.k];
</script>

<template>
  <Tooltip :text="entry.text" :hover-delay="0.3">
    <span class="cursor-help border-b border-dotted border-current" tabindex="0">
      <slot>{{ entry.term }}</slot>
    </span>
  </Tooltip>
</template>
