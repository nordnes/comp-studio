<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { FrappeUIProvider, Dialogs, Button, Badge, Dropdown, Dialog, Alert, TextInput } from 'frappe-ui';
import { useStudio } from './store';
import { fUSD, fPct } from './engine';

// Nav is the IA from the reference (sentence case, frappe-ui best practice — no uppercase roman eyebrows).
const tabs: { to: string; label: string }[] = [
  { to: '/overview', label: 'Overview' },
  { to: '/advisors', label: 'Advisors' },
  { to: '/board', label: 'Board' },
  { to: '/compare', label: 'Compare' },
  { to: '/proposition', label: 'Proposition' },
  { to: '/configure', label: 'Configure' },
];

const route = useRoute();
const {
  store, board, toggleMgr, saveBoard, loadBoard, delBoard,
  exportJSON, importJSON, exportBoardCSV, copyState, pasteState, reset,
} = useStudio();

const fileRef = ref<HTMLInputElement | null>(null);
const saveAsName = ref('');
const savedNames = computed(() => Object.keys(store.saved));

function onImportFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) importJSON(f);
  (e.target as HTMLInputElement).value = '';
}

const moreActions = computed(() => [
  { label: 'Copy state', icon: 'lucide-copy', onClick: () => copyState() },
  { label: 'Paste state', icon: 'lucide-clipboard-paste', onClick: () => pasteState() },
  { label: 'Export JSON', icon: 'lucide-file-json', onClick: () => exportJSON() },
  { label: 'Export board CSV', icon: 'lucide-file-text', onClick: () => exportBoardCSV() },
  { label: 'Import JSON', icon: 'lucide-upload', onClick: () => fileRef.value?.click() },
  { label: 'Reset to baseline', icon: 'lucide-rotate-ccw', onClick: () => reset() },
]);

function doSaveAs() { const n = saveAsName.value.trim(); if (n) { saveBoard(n); saveAsName.value = ''; } }
</script>

<template>
  <FrappeUIProvider>
    <div class="min-h-screen bg-surface-white text-ink-gray-9">
      <input ref="fileRef" type="file" accept="application/json" class="hidden" @change="onImportFile" />

      <header class="no-print sticky top-0 z-20 bg-surface-white border-b border-outline-gray-1">
        <div class="mx-auto w-full max-w-7xl px-3 sm:px-5">
          <div class="flex items-center justify-between gap-3 py-3 flex-wrap">
            <div class="flex items-baseline gap-3">
              <span class="font-display text-lg leading-none text-ink-gray-9">Raiku Labs</span>
              <span class="hidden sm:inline text-p-xs text-ink-gray-5">Advisory Board · Compensation Studio</span>
              <Badge label="Internal" theme="orange" variant="subtle" size="sm" />
            </div>
            <div class="flex items-center gap-2">
              <span v-if="store.status" class="text-xs text-ink-gray-5 mr-1">{{ store.status }}</span>
              <Button variant="subtle" theme="gray" icon-left="lucide-folder-open"
                :label="savedNames.length ? `Saved · ${savedNames.length}` : 'Saved'" @click="toggleMgr()" />
              <Dropdown :options="moreActions">
                <Button variant="ghost" theme="gray" icon="lucide-ellipsis" aria-label="More actions" />
              </Dropdown>
            </div>
          </div>
          <nav class="flex gap-1 overflow-x-auto -mb-px">
            <router-link v-for="t in tabs" :key="t.to" :to="t.to"
              class="whitespace-nowrap px-3 py-2.5 text-sm no-underline border-b-2 transition-colors"
              :class="route.path === t.to
                ? 'text-ink-gray-9 border-ink-gray-9 font-medium'
                : 'text-ink-gray-5 border-transparent hover:text-ink-gray-7'">
              {{ t.label }}
            </router-link>
          </nav>
        </div>
        <Alert v-if="!store.storageOk" theme="orange" variant="subtle" class="rounded-none border-x-0">
          Browser storage is unavailable — use <b>Export JSON</b> to keep your work.
        </Alert>
        <Alert v-else-if="board.warnings.length" theme="red" variant="subtle" class="rounded-none border-x-0">
          <b>Budget:</b> {{ board.warnings[0] }}<span v-if="board.warnings.length > 1"> (+{{ board.warnings.length - 1 }})</span>
        </Alert>
      </header>

      <main class="mx-auto w-full max-w-7xl px-3 sm:px-5 py-6 sm:py-8">
        <router-view />
      </main>

      <footer class="no-print bg-surface-white border-t border-outline-gray-1">
        <div class="mx-auto w-full max-w-7xl px-3 sm:px-5 py-8 text-p-xs text-ink-gray-5 leading-relaxed space-y-2">
          <div class="text-sm text-ink-gray-7">Notes · all equity values net of strike</div>
          <p>
            Every advisor starts on the same uniform base ({{ fPct(store.S.plan.baseGrant.equityPct, 2) }} equity ·
            {{ fPct(store.S.plan.baseGrant.tokenPct, 2) }} tokens), scaled by tier. Performance uplift grows the grant
            once its milestone gate is reached. Equity is options struck at the bridge price; value shown is net of
            exercise cost and of dilution through the cap-table walk (scenario-specific). Tokens are a fixed % of supply
            valued at TGE FDV. Above $1B TGE FDV, 2025 launches mostly traded down — shown as a caution band.
            A discussion draft, not a binding offer or legal/financial advice.
          </p>
        </div>
      </footer>

      <!-- Saved-board manager (Mgr) -->
      <Dialog v-model:open="store.showMgr" :options="{ title: 'Saved boards', size: 'lg' }">
        <template #body-content>
          <p class="text-p-sm text-ink-gray-6 mb-4">
            Saves are local to this browser. To share a board with the council, use <b>Copy state</b> (clipboard)
            or <b>Export JSON</b> (file) from the actions menu.
          </p>
          <div v-if="!savedNames.length" class="text-sm text-ink-gray-5 mb-4">No saved boards yet.</div>
          <ul v-else class="divide-y divide-outline-gray-1 mb-5 border border-outline-gray-1 rounded">
            <li v-for="n in savedNames" :key="n" class="flex items-center justify-between gap-2 px-3 py-2">
              <button class="flex items-center gap-2 text-sm text-left text-ink-gray-8 hover:text-ink-gray-9"
                @click="loadBoard(n)">
                <span v-if="n === store.last" class="lucide-check size-4 text-ink-green-3" aria-hidden="true" />
                <span v-else class="size-4" aria-hidden="true" />
                {{ n }}
              </button>
              <Button variant="ghost" theme="red" size="sm" icon="lucide-trash-2" aria-label="Delete board"
                @click="delBoard(n)" />
            </li>
          </ul>
          <div class="flex items-end gap-2">
            <div class="flex-1">
              <TextInput v-model="saveAsName" placeholder="Save current board as…" @keydown.enter="doSaveAs" />
            </div>
            <Button variant="solid" theme="gray" label="Save as" :disabled="!saveAsName.trim()" @click="doSaveAs" />
          </div>
        </template>
      </Dialog>

      <Dialogs />
    </div>
  </FrappeUIProvider>
</template>
