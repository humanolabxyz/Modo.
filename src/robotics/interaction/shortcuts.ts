// Atajos de la pizarra. Puros: reciben un resumen del evento y devuelven una orden o null.
export type ShortcutCommand =
  | 'tool-select' | 'tool-hand' | 'frame-selection' | 'frame-all'
  | 'view-front' | 'view-side' | 'view-top' | 'view-iso'
  | 'undo' | 'redo' | 'delete' | 'duplicate';

export type ShortcutEvent = {
  key: string;
  code: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
  /** Información del elemento que tiene el foco. */
  target: {tag: string; editable: boolean; insideWindow: boolean; insideEditor: boolean};
};

/** Los atajos se apagan si el foco está en un campo, en el editor de código o dentro de una ventana. */
export function shortcutsDisabled(t: ShortcutEvent['target']): boolean {
  const tag = t.tag.toLowerCase();
  return t.editable || t.insideWindow || t.insideEditor || tag === 'input' || tag === 'textarea' || tag === 'select';
}

const VIEWS: Record<string, ShortcutCommand> = {Digit1: 'view-front', Numpad1: 'view-front', Digit3: 'view-side', Numpad3: 'view-side', Digit7: 'view-top', Numpad7: 'view-top', Digit0: 'view-iso', Numpad0: 'view-iso'};

export function resolveShortcut(e: ShortcutEvent): ShortcutCommand | null {
  if (shortcutsDisabled(e.target)) return null;
  const mod = e.ctrl || e.meta;
  const key = e.key.toLowerCase();
  if (mod) {
    if (e.alt) return null;
    if (key === 'z') return e.shift ? 'redo' : 'undo';
    if (key === 'y') return 'redo';
    if (key === 'd' && !e.shift) return 'duplicate';
    return null;
  }
  if (e.alt) return null;
  if (e.code === 'Digit1' && e.shift) return 'frame-all';
  if (e.shift) return null;
  if (VIEWS[e.code]) return VIEWS[e.code];
  if (key === 'v') return 'tool-select';
  if (key === 'h') return 'tool-hand';
  if (key === 'f') return 'frame-selection';
  if (e.key === 'Delete' || e.key === 'Backspace') return 'delete';
  return null;
}

/** Resume el elemento enfocado sin depender del DOM en las pruebas. */
export function describeTarget(el: Element | null): ShortcutEvent['target'] {
  if (!el) return {tag: 'body', editable: false, insideWindow: false, insideEditor: false};
  const html = el as HTMLElement;
  return {tag: el.tagName, editable: html.isContentEditable === true, insideWindow: !!el.closest('[role="dialog"]'), insideEditor: !!el.closest('.cm-editor')};
}
