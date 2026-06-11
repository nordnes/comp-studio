import { reactive } from "vue";

// COM-43 — route destructive store actions through a confirm dialog. No engine change — these
// only gate existing store mutations behind an explicit "Confirm".
// UXS-F1 (ux-sweep CGC-8): frappe-ui's confirmDialog renders ONLY the primary action — no
// Cancel button (dismissal was the X icon or an unlabelled Escape). The confirm now renders
// through our own ConfirmDestroyDialog (mounted once in App.vue) over this reactive state:
// a labelled Cancel beside the red Confirm, message as the accessible description.
export const confirmState = reactive({
  open: false,
  title: "",
  message: "",
  action: null as null | (() => void),
});

export function confirmDestroy(title: string, message: string, action: () => void): void {
  confirmState.title = title;
  confirmState.message = message;
  confirmState.action = action;
  confirmState.open = true;
}
