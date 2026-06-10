<script setup lang="ts">
// COM-96: the ONE Avatar + name (+ optional sector) identity cell — Board rows and Overview cards
// today, Compare's sticky column next. The COM-136 truncation rules live here so they can't drift.
import { Avatar } from "frappe-ui";

withDefaults(defineProps<{ name: string; sector?: string; maxW?: string }>(), {
  sector: "",
  maxW: "max-w-[14rem]",
});
</script>

<template>
  <div class="flex items-center gap-2.5 min-w-0">
    <Avatar :label="name" size="sm" />
    <div class="min-w-0" :class="maxW">
      <div class="font-medium text-ink-gray-9 truncate" :title="name">{{ name }}</div>
      <div v-if="sector" class="text-xs text-ink-gray-6 truncate">{{ sector }}</div>
    </div>
  </div>
</template>
