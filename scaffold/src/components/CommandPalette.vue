<script setup lang="ts">
// COM-63: ⌘K command palette (frontend-only). Cmd/Ctrl+K — or the sidebar trigger via the
// 'open-command-palette' window event (mobile, no keyboard) — opens a searchable, grouped command list:
// Go to (routes), Advisors (select + open), Boards (load), Actions (copy / export / import / reset).
// Pure UI over the store; no Frappe data layer. Keyboard: ↑/↓ move · ↵ run · esc close.
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useStudio } from "../store";
import { confirmDestroy } from "../confirm";

const router = useRouter();
const { store, select, loadBoard, copyState, exportJSON, exportBoardCSV, importJSON, reset } =
  useStudio();

const open = ref(false);
const query = ref("");
const idx = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);
const fileRef = ref<HTMLInputElement | null>(null);

const ROUTES = [
  { to: "/overview", label: "Overview" },
  { to: "/board", label: "Board" },
  { to: "/compare", label: "Compare" },
  { to: "/advisors", label: "Advisors" },
  { to: "/proposition", label: "Proposition" },
  { to: "/configure", label: "Configure" },
];

type Cmd = { id: string; group: string; label: string; hint?: string; run: () => void };

const commands = computed<Cmd[]>(() => {
  const list: Cmd[] = [];
  ROUTES.forEach((r) =>
    list.push({ id: "go:" + r.to, group: "Go to", label: r.label, run: () => router.push(r.to) }),
  );
  (store.S.advisors || []).forEach((a: any) =>
    list.push({
      id: "adv:" + a.id,
      group: "Advisors",
      label: a.name,
      hint: a.sector,
      run: () => {
        select(a.id);
        router.push("/advisors");
      },
    }),
  );
  Object.keys(store.saved || {}).forEach((n) =>
    list.push({
      id: "board:" + n,
      group: "Boards",
      label: n,
      hint: n === store.last ? "current" : undefined,
      run: () => loadBoard(n),
    }),
  );
  list.push({
    id: "act:copy",
    group: "Actions",
    label: "Copy to clipboard",
    run: () => copyState(),
  });
  list.push({ id: "act:json", group: "Actions", label: "Export JSON", run: () => exportJSON() });
  list.push({
    id: "act:csv",
    group: "Actions",
    label: "Export board CSV",
    run: () => exportBoardCSV(),
  });
  list.push({
    id: "act:import",
    group: "Actions",
    label: "Import JSON",
    run: () => fileRef.value?.click(),
  });
  list.push({
    id: "act:reset",
    group: "Actions",
    label: "Reset to baseline",
    run: () =>
      confirmDestroy(
        "Reset to baseline",
        "This discards all edits to the current board and restores the defaults.",
        reset,
      ),
  });
  return list;
});

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return commands.value;
  return commands.value.filter((c) =>
    `${c.label} ${c.hint || ""} ${c.group}`.toLowerCase().includes(q),
  );
});

watch(query, () => (idx.value = 0));
watch(filtered, (f) => {
  if (idx.value > f.length - 1) idx.value = Math.max(0, f.length - 1);
});

function openPalette() {
  open.value = true;
  query.value = "";
  idx.value = 0;
  nextTick(() => inputRef.value?.focus());
}
function close() {
  open.value = false;
}
function runAt(i: number) {
  const c = filtered.value[i];
  if (!c) return;
  close();
  c.run();
}
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    open.value ? close() : openPalette();
    return;
  }
  if (!open.value) return;
  if (e.key === "Escape") {
    e.preventDefault();
    close();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    idx.value = Math.min(filtered.value.length - 1, idx.value + 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    idx.value = Math.max(0, idx.value - 1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    runAt(idx.value);
  }
}
function onImportFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) importJSON(f);
  (e.target as HTMLInputElement).value = "";
}
onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("open-command-palette", openPalette);
});
onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("open-command-palette", openPalette);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 px-4 pt-[12vh]"
      @click.self="close"
    >
      <div
        class="w-full max-w-lg overflow-hidden rounded-lg border border-outline-gray-2 bg-surface-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          placeholder="Search views, advisors, boards, actions…"
          aria-label="Command search"
          class="w-full border-b border-outline-gray-1 bg-transparent px-4 py-3 text-sm text-ink-gray-9 outline-none"
        />
        <div class="max-h-[50vh] overflow-y-auto py-1">
          <div v-if="!filtered.length" class="px-4 py-6 text-center text-sm text-ink-gray-5">
            No matches
          </div>
          <template v-for="(c, i) in filtered" :key="c.id">
            <div
              v-if="i === 0 || filtered[i - 1].group !== c.group"
              class="px-4 pb-1 pt-2 text-xs uppercase tracking-wider text-ink-gray-5"
            >
              {{ c.group }}
            </div>
            <button
              class="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm transition-colors"
              :class="
                i === idx
                  ? 'bg-surface-gray-3 text-ink-gray-9'
                  : 'text-ink-gray-7 hover:bg-surface-gray-2'
              "
              @click="runAt(i)"
              @mousemove="idx = i"
            >
              <span class="truncate">{{ c.label }}</span>
              <span v-if="c.hint" class="shrink-0 text-xs text-ink-gray-5">{{ c.hint }}</span>
            </button>
          </template>
        </div>
        <div
          class="flex items-center gap-3 border-t border-outline-gray-1 px-4 py-2 text-xs text-ink-gray-5"
        >
          <span>↑↓ navigate</span><span>↵ select</span><span>esc close</span>
        </div>
      </div>
    </div>
    <input
      ref="fileRef"
      type="file"
      accept="application/json"
      class="hidden"
      @change="onImportFile"
    />
  </Teleport>
</template>
