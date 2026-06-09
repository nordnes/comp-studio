<script setup lang="ts">
// Shared advisor selector (Advisors + Proposition). COM-68: promoted Select -> searchable, labeled
// Combobox so it scales as the roster grows. v-model is the selected advisor id (store.selId).
import { Combobox } from "frappe-ui";
import { useStudio } from "../store";
const { store, select } = useStudio();
</script>

<template>
  <Combobox
    :model-value="store.selId"
    :options="store.S.advisors.map((a) => ({ label: a.name, value: a.id }))"
    placeholder="Search advisors…"
    aria-label="Select advisor"
    @update:model-value="(v: string) => select(v)"
  />
</template>
