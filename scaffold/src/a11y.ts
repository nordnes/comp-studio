// R4.4 (rubric, panel 006): frappe-ui's Dialog chrome renders its close X as an icon-only ghost
// Button with NO accessible name and a ~28px target (Dialog.vue's DialogClose — not reachable
// via props on the pinned 0.1.278). This observer names and sizes it app-wide, covering every
// dialog incl. future ones. Scoped tightly: only icon-only buttons (svg child, no text) inside
// [role=dialog] that lack an aria-label — all of OUR icon-only buttons already carry labels.
export function installDialogA11y() {
  const fix = () => {
    document
      .querySelectorAll<HTMLButtonElement>("[role=dialog] button:not([aria-label])")
      .forEach((b) => {
        if (!b.textContent?.trim() && b.querySelector("svg")) {
          b.setAttribute("aria-label", "Close dialog");
          b.style.minWidth = "32px";
          b.style.minHeight = "32px";
        }
      });
  };
  const obs = new MutationObserver(fix);
  obs.observe(document.body, { childList: true, subtree: true });
  fix();
}
