<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import {
  FrappeUIProvider,
  Dialogs,
  Button,
  Badge,
  Dropdown,
  Dialog,
  TextInput,
  Select,
  Alert,
} from "frappe-ui";
import { useStudio } from "./store";
import { confirmDestroy } from "./confirm";
import Term from "./components/Term.vue";
import CommandPalette from "./components/CommandPalette.vue";
import { fUSD, fPct, scenKeys, baseScenKey } from "./engine";

// COM-62: left-sidebar IA (replaces the 6 horizontal top-tabs). Workflow groups (Robin's call):
// Board (analyse) · Advisor (package & share); Configure is a footer item. Icons from the bundled set.
const navGroups: { label: string; items: { to: string; label: string; icon: string }[] }[] = [
  {
    label: "Board",
    items: [
      { to: "/overview", label: "Overview", icon: "lucide-layout-grid" },
      { to: "/board", label: "Board", icon: "lucide-users" },
      { to: "/compare", label: "Compare", icon: "lucide-layers" },
    ],
  },
  {
    label: "Advisor",
    items: [
      { to: "/advisors", label: "Advisors", icon: "lucide-user" },
      { to: "/proposition", label: "Proposition", icon: "lucide-file-text" },
    ],
  },
];
const configureItem = { to: "/configure", label: "Configure", icon: "lucide-settings" };

const route = useRoute();
const navOpen = ref(false);
watch(
  () => route.path,
  () => (navOpen.value = false), // close the mobile drawer after navigating
);

const {
  store,
  selected,
  board,
  toggleMgr,
  saveBoard,
  loadBoard,
  delBoard,
  exportJSON,
  importJSON,
  exportBoardCSV,
  copyState,
  pasteState,
  reset,
  setPath,
} = useStudio();

const fileRef = ref<HTMLInputElement | null>(null);
const saveAsName = ref("");
const savedNames = computed(() => Object.keys(store.saved));

function onImportFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) importJSON(f);
  (e.target as HTMLInputElement).value = "";
}

// COM-66: surface the primary share path (clipboard / file) as its own labeled "Share" button.
const shareActions = computed(() => [
  { label: "Copy to clipboard", icon: "lucide-copy", onClick: () => copyState() },
  { label: "Export JSON", icon: "lucide-file-json", onClick: () => exportJSON() },
]);
// COM-66: the overflow keeps paste/CSV/import, with destructive Reset isolated in its own group (divider).
const moreActions = computed(() => [
  {
    group: "Data",
    hideLabel: true,
    items: [
      { label: "Paste state", icon: "lucide-clipboard-paste", onClick: () => pasteState() },
      { label: "Export board CSV", icon: "lucide-file-text", onClick: () => exportBoardCSV() },
      { label: "Import JSON", icon: "lucide-upload", onClick: () => fileRef.value?.click() },
    ],
  },
  {
    group: "Reset",
    hideLabel: true,
    items: [
      {
        label: "Reset to baseline",
        icon: "lucide-rotate-ccw",
        onClick: () =>
          confirmDestroy(
            "Reset to baseline",
            "This discards all edits to the current board and restores the defaults.",
            reset,
          ),
      },
    ],
  },
]);

function doSaveAs() {
  const n = saveAsName.value.trim();
  if (n) {
    saveBoard(n);
    saveAsName.value = "";
  }
}

// COM-46: global scenario lens. Robin's call — the toggle drives plan.baseScenario (reuse the base
// designation) so every view that reads baseScenKey speaks the same case; persisted with the board.
const activeScenario = computed({
  get: () => baseScenKey(store.S.plan),
  set: (k: string) => setPath(["plan", "baseScenario"], k),
});
const scenarioOptions = computed(() =>
  scenKeys(store.S.plan).map((k) => ({ label: store.S.plan.scenarios[k].label, value: k })),
);

// COM-62: breadcrumb — Studio › view › advisor (the advisor segment only on the per-advisor routes).
const allNav = [...navGroups.flatMap((g) => g.items), configureItem];
const breadcrumb = computed(() => {
  const parts = ["Studio", allNav.find((i) => i.to === route.path)?.label || ""];
  const adv = selected.value?.a?.name;
  if (adv && (route.path === "/advisors" || route.path === "/proposition")) parts.push(adv);
  return parts.filter(Boolean);
});

// COM-59: per-recipient print running mark. Left = the confidential statement (constant); right = the
// recipient + date, route-aware — proposition/advisors print a named package, board is the internal pack.
const PRINT_CONFIDENTIAL = "Raiku Labs — Confidential · Discussion draft, not a binding offer";
const printDate = computed(() =>
  new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
);
const printRecipient = computed(() => {
  const name = selected.value?.a?.name;
  if (route.path === "/board") return `Internal board pack · ${printDate.value}`;
  if (name && (route.path === "/proposition" || route.path === "/advisors"))
    return `Prepared for ${name} · ${printDate.value}`;
  return `Internal · ${printDate.value}`;
});

const navLinkClass = (active: boolean) =>
  active
    ? "bg-surface-gray-3 text-ink-gray-9 font-medium"
    : "text-ink-gray-7 hover:bg-surface-gray-2";

// COM-63: open the ⌘K command palette from the sidebar trigger (it also listens for Cmd/Ctrl+K itself).
const openCmdK = () => window.dispatchEvent(new Event("open-command-palette"));
</script>

<template>
  <FrappeUIProvider>
    <div class="min-h-screen flex bg-surface-white text-ink-gray-9">
      <input
        ref="fileRef"
        type="file"
        accept="application/json"
        class="hidden"
        @change="onImportFile"
      />

      <!-- COM-62: mobile drawer scrim -->
      <div
        v-if="navOpen"
        class="no-print fixed inset-0 z-30 bg-black/30 lg:hidden"
        @click="navOpen = false"
      />

      <!-- COM-62: left sidebar — persistent on lg, off-canvas drawer on mobile -->
      <aside
        class="no-print fixed lg:sticky top-0 z-40 h-screen w-60 shrink-0 flex flex-col border-r border-outline-gray-1 bg-surface-white transition-transform duration-200"
        :class="navOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      >
        <div class="px-4 py-4 flex items-center gap-2 border-b border-outline-gray-1">
          <span class="font-display text-lg leading-none text-ink-gray-9">Raiku Labs</span>
          <Badge label="Internal" theme="orange" variant="subtle" size="sm" />
        </div>
        <!-- board-switcher + scenario case -->
        <div class="px-3 py-3 space-y-2 border-b border-outline-gray-1">
          <!-- COM-63: command-palette trigger (⌘K) -->
          <button
            class="flex w-full items-center gap-2 rounded border border-outline-gray-2 px-2.5 py-1.5 text-sm text-ink-gray-5 hover:bg-surface-gray-2"
            @click="openCmdK"
          >
            <span>Search</span><span class="ml-auto text-xs text-ink-gray-4">⌘K</span>
          </button>
          <Button
            class="w-full"
            variant="subtle"
            theme="gray"
            icon-left="lucide-folder-open"
            :label="savedNames.length ? `Saved · ${savedNames.length}` : 'Saved boards'"
            @click="toggleMgr()"
          />
          <label
            v-if="scenarioOptions.length > 1"
            class="flex items-center gap-2"
            title="The scenario case shown across every view"
          >
            <span class="text-p-xs text-ink-gray-6 shrink-0">Case</span>
            <Select
              v-model="activeScenario"
              class="flex-1"
              :options="scenarioOptions"
              aria-label="Scenario case"
            />
          </label>
        </div>
        <!-- workflow-grouped nav -->
        <nav class="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          <div v-for="g in navGroups" :key="g.label">
            <div class="px-2 mb-1 text-xs uppercase tracking-wider text-ink-gray-5">
              {{ g.label }}
            </div>
            <router-link
              v-for="it in g.items"
              :key="it.to"
              :to="it.to"
              :aria-current="route.path === it.to ? 'page' : undefined"
              class="flex items-center gap-2.5 px-2.5 py-2 rounded text-sm no-underline transition-colors"
              :class="navLinkClass(route.path === it.to)"
            >
              <span :class="it.icon" class="size-4 shrink-0" aria-hidden="true" />{{ it.label }}
            </router-link>
          </div>
        </nav>
        <!-- footer: Configure (the plan) + Share + overflow -->
        <div class="px-3 py-3 border-t border-outline-gray-1 space-y-2">
          <router-link
            :to="configureItem.to"
            :aria-current="route.path === configureItem.to ? 'page' : undefined"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded text-sm no-underline transition-colors"
            :class="navLinkClass(route.path === configureItem.to)"
          >
            <span :class="configureItem.icon" class="size-4 shrink-0" aria-hidden="true" />{{
              configureItem.label
            }}
          </router-link>
          <div class="flex items-center gap-2">
            <Dropdown class="flex-1" :options="shareActions">
              <Button
                class="w-full"
                variant="subtle"
                theme="gray"
                icon-left="lucide-share-2"
                label="Share"
                title="Copy or export this board to share"
              />
            </Dropdown>
            <Dropdown :options="moreActions">
              <Button
                variant="ghost"
                theme="gray"
                icon="lucide-ellipsis"
                aria-label="More actions"
                title="More — paste, export CSV, import, reset"
              />
            </Dropdown>
          </div>
        </div>
      </aside>

      <!-- content column -->
      <div class="flex-1 min-w-0 flex flex-col">
        <!-- COM-62: thin app-header — mobile menu toggle + breadcrumbs + teleported page action -->
        <header class="no-print sticky top-0 z-20 bg-surface-white border-b border-outline-gray-1">
          <div class="flex items-center gap-3 h-12 px-3 sm:px-5">
            <button
              class="lg:hidden inline-flex items-center justify-center size-8 -ml-1 rounded hover:bg-surface-gray-2 text-ink-gray-7"
              aria-label="Open navigation"
              @click="navOpen = !navOpen"
            >
              <span class="block w-5 space-y-1" aria-hidden="true">
                <span class="block h-0.5 rounded bg-current" />
                <span class="block h-0.5 rounded bg-current" />
                <span class="block h-0.5 rounded bg-current" />
              </span>
            </button>
            <nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-sm min-w-0">
              <template v-for="(b, i) in breadcrumb" :key="i">
                <span v-if="i" class="text-ink-gray-4" aria-hidden="true">›</span>
                <span
                  class="truncate"
                  :class="
                    i === breadcrumb.length - 1 ? 'text-ink-gray-9 font-medium' : 'text-ink-gray-6'
                  "
                  >{{ b }}</span
                >
              </template>
            </nav>
            <!-- COM-62: teleport target for the active view's primary action(s) -->
            <div id="app-header" class="ml-auto flex items-center gap-2" />
          </div>
          <div v-if="!store.storageOk" class="px-3 sm:px-5 pb-2">
            <Alert theme="yellow" title="Browser storage is unavailable">
              <template #description>Use <b>Export JSON</b> to keep your work.</template>
            </Alert>
          </div>
          <div v-else-if="board.warnings.length" class="px-3 sm:px-5 pb-2">
            <Alert theme="red" title="Budget warning">
              <template #description
                >{{ board.warnings[0]
                }}<span v-if="board.warnings.length > 1">
                  (+{{ board.warnings.length - 1 }} more)</span
                ></template
              >
            </Alert>
          </div>
        </header>

        <main class="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-5 py-6 sm:py-8">
          <router-view />
        </main>

        <footer class="no-print bg-surface-white border-t border-outline-gray-1">
          <div
            class="w-full max-w-7xl mx-auto px-3 sm:px-5 py-8 text-p-xs text-ink-gray-6 leading-relaxed space-y-2"
          >
            <div class="text-sm text-ink-gray-7">
              Notes · all equity values <Term k="netOfStrike">net of strike</Term>
            </div>
            <p>
              Every advisor starts on the same uniform base ({{
                fPct(store.S.plan.baseGrant.equityPct, 2)
              }}
              equity · {{ fPct(store.S.plan.baseGrant.tokenPct, 2) }} tokens), scaled by tier.
              Performance uplift grows the grant once its milestone gate is reached. Equity is
              options struck at the bridge price; value shown is net of exercise cost and of
              dilution through the cap-table walk (scenario-specific). Tokens are a fixed % of
              supply valued at TGE FDV. Above $1B TGE FDV, 2025 launches mostly traded down — shown
              as a caution band. A discussion draft, not a binding offer or legal/financial advice.
            </p>
          </div>
        </footer>
      </div>

      <!-- COM-59: per-recipient confidentiality running mark — print-only, repeats on every page -->
      <div class="print-running" aria-hidden="true">
        <span>{{ PRINT_CONFIDENTIAL }}</span>
        <span>{{ printRecipient }}</span>
      </div>

      <!-- Saved-board manager (Mgr) -->
      <Dialog v-model="store.showMgr" :options="{ title: 'Saved boards', size: 'lg' }">
        <template #body-content>
          <p class="text-p-sm text-ink-gray-6 mb-4">
            Saves are local to this browser. To share a board with the council, use
            <b>Copy state</b> (clipboard) or <b>Export JSON</b> (file) from the actions menu.
          </p>
          <div v-if="!savedNames.length" class="text-sm text-ink-gray-6 mb-4">
            No saved boards yet.
          </div>
          <ul
            v-else
            class="divide-y divide-outline-gray-1 mb-5 border border-outline-gray-1 rounded"
          >
            <li
              v-for="n in savedNames"
              :key="n"
              class="flex items-center justify-between gap-2 px-3 py-2"
            >
              <button
                class="flex items-center gap-2 text-sm text-left text-ink-gray-8 hover:text-ink-gray-9"
                @click="loadBoard(n)"
              >
                <span
                  v-if="n === store.last"
                  class="lucide-check size-4 text-ink-green-3"
                  aria-hidden="true"
                />
                <span v-else class="size-4" aria-hidden="true" />
                {{ n }}
              </button>
              <Button
                variant="ghost"
                theme="red"
                size="sm"
                icon="lucide-trash-2"
                aria-label="Delete board"
                @click="
                  confirmDestroy(
                    'Delete board',
                    `Delete saved board ${n}? This cannot be undone.`,
                    () => delBoard(n),
                  )
                "
              />
            </li>
          </ul>
          <div class="flex items-end gap-2">
            <div class="flex-1">
              <TextInput
                v-model="saveAsName"
                placeholder="Save current board as…"
                @keydown.enter="doSaveAs"
              />
            </div>
            <Button
              variant="solid"
              theme="gray"
              label="Save as"
              :disabled="!saveAsName.trim()"
              @click="doSaveAs"
            />
          </div>
        </template>
      </Dialog>

      <!-- COM-63: ⌘K command palette (frontend-only) -->
      <CommandPalette />

      <Dialogs />
    </div>
  </FrappeUIProvider>
</template>
