<script setup lang="ts">
// Shared advisor selector (Advisors + Proposition).
import { Select } from 'frappe-ui';
import { useStudio } from '../store';
const { store, select } = useStudio();
</script>

<template>
  <Select :model-value="store.selId"
    :options="store.S.advisors.map(a => ({ label: a.name, value: a.id }))"
    @update:model-value="(v: string) => select(v)" />
</template>
