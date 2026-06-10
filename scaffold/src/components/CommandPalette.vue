<script setup lang="ts">
// COM-63 → COM-105: the ⌘K palette on the frappe-ui CommandPalette pattern.
//
// UPSTREAM BUG (verified byte-for-byte in 0.1.278): the lib's CommandPalette.vue root is a DOUBLED
// <template> — a bare inner <template> compiles to a native (inert) template element, so its Dialog
// renders into inert DOM and never teleports; the component is broken as shipped. This file is that
// component's own template ported verbatim with the root fixed (plus our command wiring): same
// frappe-ui Dialog + CommandPaletteItem, same headlessui Combobox interaction (↑/↓/↵ owned by the
// lib stack), same classes. @headlessui/vue is frappe-ui's own dependency, declared explicitly.
// Pure UI over the store — no data layer. The parent keeps: the command list (groups recompute
// against searchQuery — the palette does NOT filter), the 'open-command-palette' window event
// (sidebar/mobile trigger), and the hidden Import file input.
import { ref, computed, markRaw, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Dialog, FeatherIcon, CommandPaletteItem } from "frappe-ui";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/vue";
import { useStudio } from "../store";
import { confirmDestroy } from "../confirm";
import { NAV } from "../nav";

const router = useRouter();
const { store, select, loadBoard, copyState, exportJSON, exportBoardCSV, importJSON, reset } =
  useStudio();

const show = ref(false);
const searchQuery = ref("");
const fileRef = ref<HTMLInputElement | null>(null);
const Item = markRaw(CommandPaletteItem);

type Cmd = {
  name: string;
  title: string;
  description?: string;
  disabled?: boolean;
  run?: () => void;
};

const allGroups = computed(() => {
  // COM-93: routes come from the shared nav model; the workflow group shows as the description
  // (skipped where it would just repeat the label, e.g. Configure).
  const goTo: Cmd[] = NAV.map((r) => ({
    name: "go:" + r.to,
    title: r.label,
    description: r.group !== r.label ? r.group : undefined,
    run: () => router.push(r.to),
  }));
  const advisors: Cmd[] = (store.S.advisors || []).map((a: any) => ({
    name: "adv:" + a.id,
    title: a.name,
    description: a.sector,
    run: () => {
      select(a.id);
      router.push("/advisors");
    },
  }));
  const boards: Cmd[] = Object.keys(store.saved || {}).map((n) => ({
    name: "board:" + n,
    title: n,
    description: n === store.last ? "current" : undefined,
    run: () => loadBoard(n),
  }));
  const actions: Cmd[] = [
    { name: "act:copy", title: "Copy to clipboard", run: () => copyState() },
    { name: "act:json", title: "Export JSON", run: () => exportJSON() },
    { name: "act:csv", title: "Export board CSV", run: () => exportBoardCSV() },
    { name: "act:import", title: "Import JSON", run: () => fileRef.value?.click() },
    {
      name: "act:reset",
      title: "Reset to baseline",
      run: () =>
        confirmDestroy(
          "Reset to baseline",
          "This discards all edits to the current board and restores the defaults.",
          reset,
        ),
    },
  ];
  return [
    { title: "Go to", component: Item, items: goTo },
    { title: "Advisors", component: Item, items: advisors },
    { title: "Boards", component: Item, items: boards },
    { title: "Actions", component: Item, items: actions },
  ];
});

// The palette does no filtering of its own — match on title/description/group title.
const groups = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const out = !q
    ? allGroups.value
    : allGroups.value
        .map((g) => ({
          ...g,
          items: g.items.filter((c) =>
            `${c.title} ${c.description || ""} ${g.title}`.toLowerCase().includes(q),
          ),
        }))
        .filter((g) => g.items.length);
  if (out.length) return out;
  return [
    {
      title: "",
      hideTitle: true,
      component: Item,
      items: [{ name: "none", title: "No matches", disabled: true }] as Cmd[],
    },
  ];
});

function onSelect(item: Cmd | null) {
  if (!item) return;
  show.value = false;
  item.run?.();
}

// The lib pattern's global watcher, ported: Cmd/Ctrl+K opens, Escape closes.
function keydownWatcher(e: KeyboardEvent) {
  if (e.key === "Escape" && show.value) {
    show.value = false;
    e.preventDefault();
  }
  if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
    show.value = true;
    e.preventDefault();
  }
}
const openPalette = () => (show.value = true);
onMounted(() => {
  window.addEventListener("keydown", keydownWatcher);
  window.addEventListener("open-command-palette", openPalette);
});
onUnmounted(() => {
  window.removeEventListener("keydown", keydownWatcher);
  window.removeEventListener("open-command-palette", openPalette);
});

function onImportFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) importJSON(f);
  (e.target as HTMLInputElement).value = "";
}
</script>

<template>
  <Dialog v-model="show" :options="{ size: 'xl', position: 'top' }" @after-leave="searchQuery = ''">
    <template #body>
      <div>
        <Combobox nullable @update:model-value="onSelect">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-4.5">
              <FeatherIcon name="search" class="h-4 w-4" />
            </div>
            <ComboboxInput
              placeholder="Search"
              class="w-full border-none bg-transparent py-3 pl-11.5 pr-4.5 text-base text-ink-gray-8 placeholder-ink-gray-4 focus:ring-0"
              :value="searchQuery"
              autocomplete="off"
              @change="searchQuery = $event.target.value"
            />
          </div>
          <ComboboxOptions
            class="max-h-96 overflow-auto border-t border-gray-100"
            static
            :hold="true"
          >
            <div v-for="group in groups" :key="group.title" class="mb-2 mt-4.5 first:mt-3">
              <div v-if="!group.hideTitle" class="mb-2.5 px-4.5 text-base text-ink-gray-5">
                {{ group.title }}
              </div>
              <ComboboxOption
                v-for="item in group.items"
                :key="item.name"
                v-slot="{ active }"
                :value="item"
                class="px-2.5"
                :disabled="item.disabled"
              >
                <component :is="group.component" :item="item" :active="active" />
              </ComboboxOption>
            </div>
          </ComboboxOptions>
        </Combobox>
      </div>
    </template>
  </Dialog>
  <input
    ref="fileRef"
    type="file"
    accept="application/json"
    class="hidden"
    @change="onImportFile"
  />
</template>
