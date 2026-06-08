import { confirmDialog } from 'frappe-ui';

// COM-43 — route destructive store actions through a confirm dialog. Uses frappe-ui's confirmDialog,
// rendered by the <Dialogs/> already mounted in App.vue (socket-safe ToastProvider, no data layer).
// No engine change — these only gate existing store mutations behind an explicit "Confirm".
export function confirmDestroy(title: string, message: string, action: () => void): void {
  confirmDialog({
    title,
    message,
    onConfirm: (e?: { hideDialog?: () => void }) => { action(); e?.hideDialog?.(); },
  });
}
