// Cómo se reparte la rueda / el desplazamiento de dos dedos sobre la pizarra 3D. Puro (sin React ni three) para probarlo en Node.
// Ratón: la rueda hace zoom (lo resuelve camera-controls). Trackpad: dos dedos orbitan, Shift + dos dedos desplaza y el pellizco hace zoom.
export type NavMode = 'auto' | 'mouse' | 'trackpad';
/** `native`: se lo dejamos a camera-controls; `zoom`: acercar/alejar; `orbit` y `pan`: mover la cámara con la rueda. */
export type WheelAction = 'native' | 'zoom' | 'orbit' | 'pan';
export type WheelLike = {deltaX: number; deltaY: number; deltaMode: number; ctrlKey: boolean; shiftKey: boolean; metaKey?: boolean};

export const NAV_MODES: readonly NavMode[] = ['auto', 'mouse', 'trackpad'];
export const NAV_LABEL: Record<NavMode, string> = {auto: 'Auto', mouse: 'Ratón', trackpad: 'Trackpad'};
export const nextNavMode = (m: NavMode): NavMode => NAV_MODES[(NAV_MODES.indexOf(m) + 1) % NAV_MODES.length];
export const parseNavMode = (v: unknown): NavMode => (v === 'mouse' || v === 'trackpad' ? v : 'auto');

/** Una rueda de ratón entrega saltos enteros grandes (≈100 px) y nunca deltaX; un trackpad entrega muchos eventos pequeños o fraccionarios. */
export function looksLikeTrackpad(e: WheelLike): boolean {
  if (e.deltaMode !== 0) return false;
  return e.deltaX !== 0 || !Number.isInteger(e.deltaY) || Math.abs(e.deltaY) < 50;
}

const MOMENTUM_MS = 220;

/** Clasifica cada evento de rueda. Recuerda el último evento de trackpad para que la inercia (saltos grandes al final del gesto) no se tome por una rueda. */
export function createWheelRouter(getMode: () => NavMode) {
  let lastTrackpadAt = -Infinity;
  return (e: WheelLike, now: number): WheelAction => {
    const mode = getMode();
    if (mode === 'mouse') return 'native';
    if (e.ctrlKey || e.metaKey) return 'zoom'; // pellizco del trackpad (el navegador lo manda como Ctrl + rueda) o Ctrl + rueda
    const trackpad = mode === 'trackpad' || looksLikeTrackpad(e) || (e.deltaMode === 0 && now - lastTrackpadAt < MOMENTUM_MS);
    if (!trackpad) return 'native';
    lastTrackpadAt = now;
    return e.shiftKey ? 'pan' : 'orbit';
  };
}

/** Factores de sensibilidad (rad por píxel de desplazamiento ≈ 2π·0,7 / alto de la vista). */
export const ORBIT_PER_HEIGHT = Math.PI * 2 * 0.7;
/** Pellizco: cada unidad de deltaY escala la distancia por e^(deltaY·k). */
export const ZOOM_PINCH_K = 0.012;
export const ZOOM_WHEEL_K = 0.0018;
export const zoomFactor = (e: Pick<WheelLike, 'deltaY' | 'deltaMode' | 'ctrlKey'>) => Math.exp(Math.max(-60, Math.min(60, e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY)) * (e.ctrlKey ? ZOOM_PINCH_K : ZOOM_WHEEL_K));
