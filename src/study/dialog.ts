import type { KeyboardEvent } from "react";

/** Conserva Tab/Shift+Tab en los controles visibles; Escape usa el cierre nativo. */
export function trapDialogTab(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const dialog = event.currentTarget;
  const controls = [
    ...dialog.querySelectorAll<HTMLElement>(
      "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex]",
    ),
  ].filter(
    (el) =>
      el.tabIndex >= 0 &&
      el.getClientRects().length > 0 &&
      getComputedStyle(el).visibility !== "hidden",
  );
  const first = controls[0],
    last = controls.at(-1),
    active = document.activeElement;
  if (!first) {
    event.preventDefault();
    dialog.focus();
    return;
  }
  if (!dialog.contains(active) || (!event.shiftKey && active === last)) {
    event.preventDefault();
    first.focus();
  } else if (event.shiftKey && active === first) {
    event.preventDefault();
    last?.focus();
  }
}
