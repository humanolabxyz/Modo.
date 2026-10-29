// Máquina de estados de la pizarra 3D. Pura (sin React ni three) para poder probarla en Node.
// Regla central: mientras haya un gesto activo, ningún otro gesto puede empezar.
export type Gesture = 'idle' | 'selecting' | 'marquee' | 'panning' | 'orbiting';
// El arrastre del gizmo lo gobierna TransformControls (apaga la cámara mientras dura); la etapa 3 añadirá 'wiring'.
/** `move` y `rotate` muestran el gizmo de la selección; `wire` y `measure` reparten los clics sobre pines. Para los gestos del lienzo todos se comportan como `select`. */
export type ToolId = 'select' | 'hand' | 'move' | 'rotate' | 'wire' | 'measure';
export type PointerTarget = 'object' | 'empty';

export type PointerStart = {
  button: 0 | 1 | 2;
  target: PointerTarget;
  shift: boolean;
  alt: boolean;
  /** Espacio mantenido (desplazar como en Figma). */
  space: boolean;
  tool: ToolId;
  pointerType: 'mouse' | 'touch' | 'pen';
};

/** Qué gesto inicia este puntero. Si ya hay uno activo, devuelve el activo: el nuevo se ignora. */
export function startGesture(current: Gesture, e: PointerStart): Gesture {
  if (current !== 'idle') return current;
  if (e.button === 1) return 'panning';
  if (e.button === 2) return 'orbiting';
  if (e.space || e.tool === 'hand') return 'panning';
  if (e.alt) return 'orbiting';
  if (e.target === 'object') return 'selecting';
  return e.pointerType === 'mouse' || e.pointerType === 'pen' ? 'marquee' : 'orbiting';
}

export const endGesture = (_current: Gesture): Gesture => 'idle';

/** `pending`: hay un cable a medio hacer o una medición con un solo pin elegido. */
export type EditorState = {gesture: Gesture; tool: ToolId; selection: number; menuOpen: boolean; pending?: boolean};
export type EscapeAction = 'cancel-gesture' | 'close-menu' | 'cancel-pending' | 'reset-tool' | 'clear-selection' | 'none';

/** Esc deshace lo más reciente primero y nunca cierra ventanas (las ventanas son `passive`). */
export function escapeAction(s: EditorState): EscapeAction {
  if (s.gesture !== 'idle') return 'cancel-gesture';
  if (s.menuOpen) return 'close-menu';
  if (s.pending) return 'cancel-pending';
  if (s.tool !== 'select') return 'reset-tool';
  if (s.selection > 0) return 'clear-selection';
  return 'none';
}

export const MOVE_THRESHOLD_PX = 5;
export const LONG_PRESS_MS = 500;
export type Release = 'click' | 'drag' | 'context-menu';

/** Clasifica el final de un gesto: un botón derecho que no se movió abre el menú contextual; si se movió, fue una órbita. */
export function classifyRelease(button: number, movedPx: number): Release {
  if (movedPx > MOVE_THRESHOLD_PX) return 'drag';
  return button === 2 ? 'context-menu' : 'click';
}

/** Selección con Shift: alterna el objeto en el conjunto. Sin Shift reemplaza. */
export function nextSelection(current: readonly string[], id: string | null, additive: boolean): string[] {
  if (id === null) return additive ? [...current] : [];
  if (!additive) return [id];
  return current.includes(id) ? current.filter(x => x !== id) : [...current, id];
}

export type Rect2 = {x: number; y: number; w: number; h: number};
export const rectFromPoints = (ax: number, ay: number, bx: number, by: number): Rect2 => ({x: Math.min(ax, bx), y: Math.min(ay, by), w: Math.abs(bx - ax), h: Math.abs(by - ay)});
export const rectsIntersect = (a: Rect2, b: Rect2): boolean => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
