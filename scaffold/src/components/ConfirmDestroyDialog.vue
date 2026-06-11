<script setup lang="ts">
// UXS-F1 (ux-sweep CGC-8): destructive confirms get a REAL Cancel button — frappe-ui's
// confirmDialog renders only the primary action (dismissal was the X icon or an unlabelled
// Escape). One instance mounts in App.vue over the confirm.ts state; options.message doubles
// as the dialog's accessible description (the reka aria-describedby warning dies with it).
import { computed } from "vue";
import { Dialog, Button } from "frappe-ui";
import { confirmState } from "../confirm";

const options = computed(() => ({
  title: confirmState.title,
  message: confirmState.message,
  size: "sm" as const,
}));
function onConfirm(close: () => void) {
  const act = confirmState.action;
  confirmState.action = null;
  act?.();
  close();
}
</script>

<template>
  <Dialog v-model="confirmState.open" :options="options">
    <template #actions="{ close }">
      <div class="flex w-full items-center justify-end gap-2">
        <Button variant="subtle" theme="gray" label="Cancel" @click="close" />
        <Button variant="solid" theme="red" label="Confirm" @click="onConfirm(close)" />
      </div>
    </template>
  </Dialog>
</template>
