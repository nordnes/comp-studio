<script setup lang="ts">
// Shared current-stage picker (Advisors + Board). Drives plan.currentStage over the milestones (gating).
import { Select } from 'frappe-ui';
import { useStudio } from '../store';
const { store, setPath } = useStudio();
</script>

<template>
  <label class="flex items-center gap-2 text-xs text-ink-amber-strong">
    <span class="lucide-target size-3.5" aria-hidden="true" /> Stage
    <Select :model-value="store.S.plan.currentStage"
      :options="store.S.plan.milestones.map(m => ({ label: m.label, value: m.id }))"
      @update:model-value="(v: string) => setPath(['plan', 'currentStage'], v)" />
  </label>
</template>
