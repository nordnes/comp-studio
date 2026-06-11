<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
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
  Sidebar,
  SidebarItem,
  KeyboardShortcut,
  ListView,
  ListRows,
  ListRow,
  ListRowItem,
  Breadcrumbs,
} from "frappe-ui";
import { DialogDescription } from "reka-ui";
import { useStudio } from "./store";
import { confirmDestroy } from "./confirm";
import Term from "./components/Term.vue";
import ConfirmDestroyDialog from "./components/ConfirmDestroyDialog.vue";
import CommandPalette from "./components/CommandPalette.vue";
import PackageEditor from "./components/PackageEditor.vue";
import { fUSD, fPct, scenKeys, baseScenKey, setList } from "./engine";
import { CONFIDENTIAL_EYEBROW } from "./constants";
// COM-62 workflow groups, COM-93 single-sourced from src/nav.ts (shared with palette + router).
import { navGroups, configureItem } from "./nav";

const route = useRoute();
const router = useRouter();
const navOpen = ref(false);
watch(
  () => route.path,
  () => (navOpen.value = false), // close the mobile drawer after navigating
);

// COM-135: hidden UI must be truly hidden — below lg the closed drawer is `inert` (out of the tab
// order and a11y tree, not just translated off-canvas), and while it's open the content column is
// inert instead, which doubles as the focus trap. Esc closes; focus follows the drawer state.
const isMobile = ref(false);
let drawerMq: MediaQueryList | undefined;
const onDrawerMq = () => (isMobile.value = !!drawerMq?.matches);
const asideRef = ref<HTMLElement | null>(null);
const navToggleRef = ref<HTMLButtonElement | null>(null);
function onDrawerKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && navOpen.value) navOpen.value = false;
}
watch(navOpen, (open) => {
  if (!isMobile.value) return;
  // nextTick both ways: the target subtree is still `inert` until the DOM flushes, and
  // focus() inside an inert subtree is a silent no-op.
  if (open)
    nextTick(() =>
      asideRef.value?.querySelector<HTMLElement>("button, a, select, [tabindex]")?.focus(),
    );
  else nextTick(() => navToggleRef.value?.focus());
});
// UXS-M (UXP 2.1/3.2 — P0): reka's modal layers lock body pointer-events while open, and
// MenuRootContentModal flips disable-outside-pointer-events REACTIVELY on close — the
// DismissableLayer cleanup re-reads the now-false prop and SKIPS the restore, wedging the lock
// with no overlay left ("the app randomly stops responding": every click dies, full opacity,
// no cue; observed up to ~30s on /board load and after Escape-closing the board switcher).
// The watchdog clears a body lock that no living dismissable layer justifies. Poll-based by
// design — the wedge IS a missed cleanup, so there is no event to hook.
let pointerWatchdog: number | undefined;
onMounted(() => {
  drawerMq = window.matchMedia("(max-width: 1023.98px)"); // below Tailwind lg
  onDrawerMq();
  drawerMq.addEventListener("change", onDrawerMq);
  window.addEventListener("keydown", onDrawerKeydown);
  pointerWatchdog = window.setInterval(() => {
    if (
      document.body.style.pointerEvents === "none" &&
      !document.querySelector("[data-dismissable-layer]")
    ) {
      document.body.style.pointerEvents = "";
    }
  }, 500);
});
onUnmounted(() => {
  window.clearInterval(pointerWatchdog);
  drawerMq?.removeEventListener("change", onDrawerMq);
  window.removeEventListener("keydown", onDrawerKeydown);
});

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
  activateSet,
} = useStudio();

const fileRef = ref<HTMLInputElement | null>(null);
const saveAsName = ref("");
const savedNames = computed(() => Object.keys(store.saved));
// COM-103: the Mgr list rides frappe-ui's ListView primitives (rowKey = the board name).
const savedRows = computed(() =>
  savedNames.value.map((n) => ({ name: n, current: n === store.last })),
);
// COM-102: board identity IS the switcher — a Dropdown triggered by the active board's name
// (the Gameplan workspace-switcher idiom); Manage… opens the existing Mgr Dialog.
const boardSwitcherOptions = computed(() => [
  {
    group: "Boards",
    hideLabel: true,
    items: savedNames.value.map((n) => ({
      label: n,
      icon: n === store.last ? "lucide-check" : "lucide-folder-open",
      onClick: () => loadBoard(n),
    })),
  },
  {
    group: "Manage",
    hideLabel: true,
    items: [{ label: "Manage boards…", icon: "lucide-pen", onClick: () => toggleMgr() }],
  },
]);
const savedListOptions = {
  selectable: false,
  showTooltip: false,
  onRowClick: (r: any) => loadBoard(r.name),
};

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
// COM-92: the SECOND global lens — Stage (plan.currentStage, already board-persisted) joins Case in
// the shell so every route answers "under which future?" without navigation. The options-sources
// stay pluggable single supply points: COM-148 (M10 scenario sets) swaps DATA here, not the control.
const currentStage = computed({
  get: () => store.S.plan.currentStage,
  set: (v: string) => setPath(["plan", "currentStage"], v),
});
const stageOptions = computed(() =>
  store.S.plan.milestones.map((m: any) => ({ label: m.label, value: m.id })),
);
// COM-148: the THIRD lens — saved scenario SETS. Selecting one activates it (deep copy into the
// working scenarios, Undo on the toast); the control then snaps back to the working placeholder
// because the active map is a copy, not a live pointer to the set.
const setLens = ref("");
const setOptions = computed(() => [
  { label: "Working scenarios", value: "" },
  ...setList(store.S.plan).map((s) => ({
    label: `${s.starred ? "★ " : ""}${s.label}`,
    value: s.id,
  })),
]);
function onSetLens(v: string) {
  if (!v) return;
  activateSet(v);
  setLens.value = "";
}

// COM-62: breadcrumb — board › view › advisor (the advisor segment only on the per-advisor routes).
// COM-102: the root is the active BOARD (→ /overview), not the static "Studio".
// COM-101: shaped for frappe-ui <Breadcrumbs> — every segment with a route is real wayfinding; the
// advisor crumb stays routeless until a /advisors/:id param exists.
const allNav = [...navGroups.flatMap((g) => g.items), configureItem];
const breadcrumbItems = computed(() => {
  const items: { label: string; route?: string }[] = [
    { label: store.S.name || "Untitled board", route: "/overview" },
  ];
  const view = allNav.find((i) => i.to === route.path);
  if (view) items.push({ label: view.label, route: view.to });
  const adv = selected.value?.a?.name;
  if (adv && (route.path === "/advisors" || route.path === "/proposition"))
    items.push({ label: adv });
  return items;
});

// COM-59: per-recipient print running mark. Left = the confidential statement (constant); right = the
// recipient + date, route-aware — proposition/advisors print a named package, board is the internal pack.
const PRINT_CONFIDENTIAL = `Raiku Labs — ${CONFIDENTIAL_EYEBROW}, not a binding offer`;
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

// COM-104: the nav consumes frappe-ui's Sidebar primitives; sections derive from nav.ts.
// onClick uses router.push — SidebarItem's own `to` handling calls router.replace, which
// would erase history entries (back-button regression).
const sidebarSections = computed(() =>
  navGroups.map((g) => ({
    label: g.label,
    items: g.items.map((it) => ({
      label: it.label,
      icon: it.icon,
      isActive: route.path === it.to,
      onClick: () => router.push(it.to),
    })),
  })),
);

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
        class="no-print fixed inset-0 z-30 bg-[var(--overlay)] lg:hidden"
        @click="navOpen = false"
      />

      <!-- COM-62: left sidebar — persistent on lg, off-canvas drawer on mobile.
           COM-104: the shell inside is frappe-ui's Sidebar (Robin's call 2026-06-09: adopt the
           primitive, KEEP this hand-rolled scrim+translate drawer wrapper — the lib's responsive
           mode is icon-collapse, not an overlay). disableCollapse kills both the collapse toggle
           and the <sm icon-rail so the wrapper alone owns mobile. -->
      <aside
        ref="asideRef"
        class="no-print fixed lg:sticky top-0 z-40 h-screen w-60 shrink-0 transition-transform duration-200"
        :class="navOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        :inert="isMobile && !navOpen"
      >
        <Sidebar :sections="sidebarSections" disable-collapse class="h-full w-60">
          <template #header>
            <div class="px-2 pt-2 pb-3 flex items-center gap-2">
              <span class="font-display text-lg leading-none text-ink-gray-9">Raiku Labs</span>
              <Badge label="Internal" theme="orange" variant="subtle" size="sm" />
            </div>
            <!-- COM-137: the data-loss state is too high-stakes for a scroll-away banner — a
                 persistent strip while storage is unavailable (volatile until exported) -->
            <div
              v-if="!store.storageOk"
              class="mx-1 mb-2 px-2 py-1.5 rounded bg-surface-amber-1 text-p-xs text-ink-amber-strong"
              title="Browser storage is unavailable — every edit is volatile. Export JSON to keep your work."
            >
              Not saved — export to keep
            </div>
            <!-- board-switcher + scenario case -->
            <div class="px-1 pb-3 space-y-2 border-b border-outline-gray-1">
              <!-- COM-63: command-palette trigger (⌘K) -->
              <!-- UXS-G (UXP 1.13): a stable AX name + machine-readable shortcut; the visual
                   kbd hint is decoration (it read 'Search K'/'Search + K' inconsistently). -->
              <button
                class="flex w-full items-center gap-2 rounded border border-outline-gray-2 bg-surface-white px-2.5 py-1.5 text-sm text-ink-gray-6 hover:bg-surface-gray-2"
                aria-label="Search"
                aria-keyshortcuts="Meta+K Control+K"
                @click="openCmdK"
              >
                <!-- COM-105: platform-correct shortcut (mod resolves to Ctrl off-Mac) -->
                <span aria-hidden="true">Search</span>
                <span aria-hidden="true" class="ml-auto">
                  <KeyboardShortcut combo="Mod+K" class="text-ink-gray-4" />
                </span>
              </button>
              <!-- COM-102: the active board's NAME is the switcher trigger -->
              <Dropdown class="w-full" :options="boardSwitcherOptions">
                <Button
                  class="w-full"
                  variant="subtle"
                  theme="gray"
                  icon-left="lucide-folder-open"
                  :label="store.S.name || 'Untitled board'"
                  :title="`Board · ${store.S.name}`"
                />
              </Dropdown>
              <!-- COM-148: the Set lens — any saved scenario set, two clicks from anywhere -->
              <label
                v-if="setOptions.length > 1"
                class="flex items-center gap-2"
                title="Switch the whole board to a saved scenario set"
              >
                <span class="text-p-xs text-ink-gray-6 w-9 shrink-0">Set</span>
                <Select
                  :model-value="setLens"
                  class="flex-1 min-w-0"
                  :options="setOptions"
                  aria-label="Scenario set"
                  @update:model-value="onSetLens"
                />
              </label>
              <label
                v-if="scenarioOptions.length > 1"
                class="flex items-center gap-2"
                title="The scenario case shown across every view"
              >
                <span class="text-p-xs text-ink-gray-6 w-9 shrink-0">Case</span>
                <Select
                  v-model="activeScenario"
                  class="flex-1 min-w-0"
                  :options="scenarioOptions"
                  aria-label="Scenario case"
                />
              </label>
              <!-- COM-92: Stage co-locates with Case — the two plan lenses in one shell block -->
              <label
                class="flex items-center gap-2"
                title="The plan stage that gates performance uplift"
              >
                <span class="text-p-xs text-ink-gray-6 w-9 shrink-0">Stage</span>
                <Select
                  v-model="currentStage"
                  class="flex-1 min-w-0"
                  :options="stageOptions"
                  aria-label="Plan stage"
                />
              </label>
            </div>
          </template>
          <!-- our icons are lucide CSS classes; the lib's default item renders string icons as
               literal text, so supply the row ourselves (aria-current falls through to the button) -->
          <template #sidebar-item="{ item }">
            <SidebarItem
              :label="item.label"
              :is-active="item.isActive"
              :on-click="item.onClick"
              :aria-current="item.isActive ? 'page' : undefined"
            >
              <template #icon>
                <span :class="item.icon" class="size-4 text-ink-gray-6" aria-hidden="true" />
              </template>
            </SidebarItem>
          </template>
          <!-- footer: Configure (the plan) + Share + overflow -->
          <template #footer-items>
            <div class="border-t border-outline-gray-1 pt-2 space-y-2">
              <SidebarItem
                :label="configureItem.label"
                :is-active="route.path === configureItem.to"
                :on-click="() => router.push(configureItem.to)"
                :aria-current="route.path === configureItem.to ? 'page' : undefined"
              >
                <template #icon>
                  <span
                    :class="configureItem.icon"
                    class="size-4 text-ink-gray-6"
                    aria-hidden="true"
                  />
                </template>
              </SidebarItem>
              <div class="flex items-center gap-2 px-1 pb-1">
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
                  <!-- icon-only frappe-ui Buttons take `label` (rendered sr-only + aria-label);
                       a fallthrough aria-label attr is clobbered by the component's own binding -->
                  <Button
                    variant="ghost"
                    theme="gray"
                    icon="lucide-ellipsis"
                    label="More actions"
                    title="More — paste, export CSV, import, reset"
                  />
                </Dropdown>
              </div>
            </div>
          </template>
        </Sidebar>
      </aside>

      <!-- content column — COM-135: inert behind the open mobile drawer (the focus trap) -->
      <div class="flex-1 min-w-0 flex flex-col" :inert="isMobile && navOpen">
        <!-- COM-62: thin app-header — mobile menu toggle + breadcrumbs + teleported page action -->
        <header class="no-print sticky top-0 z-20 bg-surface-white border-b border-outline-gray-1">
          <!-- UXS-O (UXP 8.1): min-h + wrap — at 1024 the teleported action cluster wrapped
               OVER the budget banner because the row's height was fixed -->
          <div class="flex items-center gap-3 min-h-12 py-1 flex-wrap px-3 sm:px-5">
            <button
              ref="navToggleRef"
              class="lg:hidden inline-flex items-center justify-center size-8 -ml-1 rounded hover:bg-surface-gray-2 text-ink-gray-7"
              aria-label="Open navigation"
              :aria-expanded="navOpen"
              @click="navOpen = !navOpen"
            >
              <span class="block w-5 space-y-1" aria-hidden="true">
                <span class="block h-0.5 rounded bg-current" />
                <span class="block h-0.5 rounded bg-current" />
                <span class="block h-0.5 rounded bg-current" />
              </span>
            </button>
            <!-- COM-101: frappe-ui Breadcrumbs — real wayfinding (board root → /overview, view
                 crumb routes; advisor crumb routeless until /advisors/:id exists) -->
            <!-- COM-31 residual: overflow-hidden actually CONTAINS the crumbs — min-w-0 alone
                 let the active crumb spill 2–23px past 375 (the Wave-5 audit's finding) -->
            <nav aria-label="Breadcrumb" class="flex items-center min-w-0 overflow-hidden">
              <Breadcrumbs :items="breadcrumbItems" />
            </nav>
            <!-- COM-62: teleport target for the active view's primary action(s) -->
            <div id="app-header" class="ml-auto flex items-center gap-2" />
          </div>
          <!-- COM-137: SIBLING alerts — independent failure states must not mask each other
               (storage-blocked AND over budget can both be true; show both, storage first) -->
          <div v-if="!store.storageOk" class="px-3 sm:px-5 pb-2">
            <Alert v-alert-dismiss-label theme="yellow" title="Browser storage is unavailable">
              <template #description>Use <b>Export JSON</b> to keep your work.</template>
            </Alert>
          </div>
          <!-- COM-138: every warning in full (the engine emits at most 3 — a list, not a dead
               "+N more") + a next step to where the breach is visible -->
          <div v-if="board.warnings.length" class="px-3 sm:px-5 pb-2">
            <Alert
              v-alert-dismiss-label
              theme="red"
              :title="board.warnings.length > 1 ? 'Budget warnings' : 'Budget warning'"
            >
              <template #description>
                <ul :class="board.warnings.length > 1 ? 'list-disc pl-4 space-y-0.5' : 'list-none'">
                  <li v-for="w in board.warnings" :key="w">{{ w }}</li>
                </ul>
                <!-- UXS-H (C12/DR-15): the CTA is a dead self-link when you are already
                     on /board — point at the pool panel below instead of reloading the page. -->
                <router-link
                  v-if="route.path !== '/board'"
                  to="/board"
                  class="mt-1 inline-block underline underline-offset-2"
                  >Review the pool on the Board</router-link
                >
                <span v-else class="mt-1 inline-block text-p-xs"
                  >The pool allocation panel below has the detail.</span
                >
              </template>
            </Alert>
          </div>
        </header>

        <!-- COM-89: main is full-bleed; each view sets its own column (max-w-reading for prose
             views, max-w-7xl for the dense Board/Compare tables) so one width stops serving none. -->
        <main class="flex-1 w-full py-6 sm:py-8">
          <router-view />
        </main>

        <footer class="no-print bg-surface-white border-t border-outline-gray-1">
          <div
            class="w-full max-w-reading mx-auto px-3 sm:px-5 py-8 text-p-xs text-ink-gray-6 leading-relaxed space-y-2"
          >
            <!-- COM-130: the heading pre-announced the very next sentence — reduced -->
            <div class="section-label">How to read these figures</div>
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
      <ConfirmDestroyDialog />
      <Dialog
        v-model="store.showMgr"
        :options="{
          title: 'Saved boards',
          size: 'lg',
        }"
      >
        <template #body-content>
          <DialogDescription as-child>
            <p class="text-p-sm text-ink-gray-6 mb-4">
              Saves are local to this browser. The active board saves continuously under its own
              name; <b>Save copy</b> freezes a checkpoint that only changes again if you load it. To
              share a board with the council, use <b>Copy state</b> (clipboard) or
              <b>Export JSON</b> (file) from the actions menu.
            </p>
          </DialogDescription>
          <div v-if="!savedNames.length" class="text-sm text-ink-gray-6 mb-4">
            No saved boards yet.
          </div>
          <!-- COM-103: ListView/ListRow/ListRowItem replace the hand-rolled ul — prefix slot is
               the current-board check (a fixed slot, so labels align), suffix the delete action -->
          <ListView
            v-else
            class="mb-5 rounded border border-outline-gray-1 p-1"
            :columns="[{ label: 'Board', key: 'name' }]"
            :rows="savedRows"
            row-key="name"
            :options="savedListOptions"
          >
            <ListRows>
              <ListRow v-for="row in savedRows" :key="row.name" :row="row" v-slot="{ item }">
                <ListRowItem :item="item" :column="{ key: 'name' }">
                  <template #prefix>
                    <span
                      :class="row.current ? 'lucide-check text-ink-green-3' : ''"
                      class="size-4 shrink-0"
                      aria-hidden="true"
                    />
                  </template>
                  <template #suffix>
                    <Button
                      class="ml-auto"
                      variant="ghost"
                      theme="red"
                      size="sm"
                      icon="lucide-trash-2"
                      label="Delete board"
                      @click.stop="
                        confirmDestroy(
                          'Delete board',
                          `Delete saved board ${row.name}? This cannot be undone.`,
                          () => delBoard(row.name),
                        )
                      "
                    />
                  </template>
                </ListRowItem>
              </ListRow>
            </ListRows>
          </ListView>
          <div class="flex items-end gap-2">
            <div class="flex-1">
              <TextInput
                v-model="saveAsName"
                placeholder="Save a checkpoint copy as…"
                @keydown.enter="doSaveAs"
              />
            </div>
            <Button
              variant="solid"
              theme="gray"
              label="Save copy"
              :disabled="!saveAsName.trim()"
              @click="doSaveAs"
            />
          </div>
        </template>
      </Dialog>

      <!-- COM-63: ⌘K command palette (frontend-only) -->
      <CommandPalette />

      <!-- COM-76: global "Edit package" Dialog — opened from Advisors and the roster kebabs -->
      <PackageEditor />

      <Dialogs />
    </div>
  </FrappeUIProvider>
</template>
