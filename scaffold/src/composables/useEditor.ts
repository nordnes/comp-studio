// COM-76: global open-state for the "Edit package" Dialog. Kept out of store.ts so the store stays a
// pure reducer. The editor always targets the currently-selected advisor (store.selId), so callers that
// open it from a roster row select(id) first, then openEditor().
import { ref } from "vue";

const open = ref(false);

export function useEditor() {
  return {
    open,
    openEditor: () => (open.value = true),
    closeEditor: () => (open.value = false),
  };
}
