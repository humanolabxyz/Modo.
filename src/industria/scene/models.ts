// Formas 3D de las piezas del catálogo (fase 11). Puro (sin three ni React): cada pieza es una lista de primitivas en el sistema local de la pieza,
// así se puede probar en Node (que cada forma cabe en la caja del catálogo, tiene un tornillo por terminal y se distingue de las demás).
//
// IMPORTANTE: son las formas reales de cada TIPO de aparato (carril omega, interruptor modular con palanca, contactor, PLC con LED, motor con aletas,
// pulsador con cabezal…), no la réplica de un producto ni de un fabricante. Las medidas siguen siendo las de ejemplo del catálogo genérico.
import {shapeOf, type ShapeDef} from '../build/shapes.ts';
import type {Vec3} from '../model/types.ts';

export type PartRole = 'body' | 'front' | 'trim' | 'metal' | 'screw' | 'lens' | 'led' | 'dark' | 'label';
/** box: size = [ancho, alto, fondo]; cyl: size = [radio, largo, 0] a lo largo de `axis`; sphere: size = [radio, 0, 0]. */
export type Part = {shape: 'box' | 'cyl' | 'sphere'; pos: Vec3; size: Vec3; axis?: 'x' | 'y' | 'z'; color: string; role: PartRole; emissive?: string; /** detalle fino: se omite con muchas piezas en escena */ fine?: boolean; /** transparencia de una pieza `lens` (por defecto 0,92) */ opacity?: number; /** `door`: panel de la puerta del gabinete (transparente, cerrado o abierto según la propiedad «puerta»); `doorfit`: herraje o adorno que gira con la puerta pero no se vuelve transparente */ tag?: 'door' | 'doorfit'};
export type Detail = 'high' | 'low';
/** `door`: el mando está montado en la puerta de un gabinete (frente redondo asomando, cuerpo y contactos dentro). */
export type Variant = 'din' | 'door';

const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
/** Aclara (f > 0) u oscurece (f < 0) un color #rrggbb. */
export function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, mix = (c: number) => clamp(f >= 0 ? c + (255 - c) * f : c * (1 + f));
  return '#' + [mix(r), mix(g), mix(b)].map(c => c.toString(16).padStart(2, '0')).join('');
}
const fit = (p: Part): Part => ({...p, tag: 'doorfit'});
const DARK = '#2a3038', METAL = '#c4cad2', WHITE = '#f1f3f6', BRASS = '#b8893b', BAND_DARK = '#35496b';

const box = (x: number, y: number, z: number, w: number, h: number, d: number, color: string, role: PartRole, fine = false, emissive?: string): Part => ({shape: 'box', pos: [x, y, z], size: [w, h, d], color, role, fine, ...(emissive ? {emissive} : {})});
const cyl = (x: number, y: number, z: number, r: number, len: number, axis: 'x' | 'y' | 'z', color: string, role: PartRole, fine = false): Part => ({shape: 'cyl', pos: [x, y, z], size: [r, len, 0], axis, color, role, fine});
const ball = (x: number, y: number, z: number, r: number, color: string, role: PartRole, fine = false, emissive?: string): Part => ({shape: 'sphere', pos: [x, y, z], size: [r, 0, 0], color, role, fine, ...(emissive ? {emissive} : {})});

/** Cuerpo modular de riel: base, frente más claro, alojamientos de bornes arriba y abajo y pie de enganche. */
function dinBody(w: number, h: number, d: number, color: string): Part[] {
  return [
    box(0, 0, -d * 0.225, w, h, d * 0.55, color, 'body'),
    box(0, 0, d * 0.275, w * 0.92, h * 0.78, d * 0.45, shade(color, 0.14), 'front'),
    box(0, h / 2 - h * 0.05, d * 0.25, w * 0.98, h * 0.1, d * 0.5, DARK, 'dark', true),
    box(0, -h / 2 + h * 0.05, d * 0.25, w * 0.98, h * 0.1, d * 0.5, DARK, 'dark', true),
    box(0, -h * 0.4, -d / 2 + 0.003, Math.min(w * 0.6, 0.03), h * 0.12, 0.006, METAL, 'metal', true),
    box(0, h * 0.39, d / 2 - 0.0006, w * 0.9, 0.0012, 0.0012, shade(color, 0.35), 'label', true),
    box(-w * 0.46, 0, d * 0.3, 0.0012, h * 0.7, d * 0.38, shade(color, -0.12), 'dark', true), box(w * 0.46, 0, d * 0.3, 0.0012, h * 0.7, d * 0.38, shade(color, -0.12), 'dark', true),
  ];
}

/** Un tornillo de borne por terminal (cabeza metálica con ranura), mirando hacia fuera de la cara donde está el terminal. */
function screws(shape: ShapeDef): Part[] {
  const out: Part[] = [], top = shape.center[1] + shape.size[1] / 2;
  for (const t of shape.terminals ?? []) {
    const [x, y, z] = [t.position[0] - shape.center[0], t.position[1] - shape.center[1], t.position[2] - shape.center[2]];
    const onTop = Math.abs(t.position[1] - top) < 0.002, r = Math.min(0.0042, Math.max(0.0028, shape.size[0] / 14));
    if (onTop) { out.push(box(x, y - 0.003, z, r * 3.4, 0.006, r * 3.4, DARK, 'dark', true), box(x, y - 0.0005, z, r * 3, 0.0012, r * 3, BRASS, 'metal', true), cyl(x, y + 0.002, z, r, 0.004, 'y', METAL, 'screw', true), box(x, y + 0.0042, z, r * 2.2, 0.0008, 0.0009, DARK, 'dark', true)); }
    else { out.push(box(x, y, z - 0.003, r * 3.4, r * 3.4, 0.006, DARK, 'dark', true), box(x, y, z - 0.0005, r * 3, r * 3, 0.0012, BRASS, 'metal', true), cyl(x, y, z + 0.002, r, 0.004, 'z', METAL, 'screw', true), box(x, y, z + 0.0042, r * 2.2, 0.0009, 0.0008, DARK, 'dark', true)); }
  }
  return out;
}

const poleXs = (shape: ShapeDef): number[] => (shape.terminals ?? []).filter(t => t.group === 'superior').map(t => t.position[0] - shape.center[0]).sort((a, b) => a - b);

type Builder = (s: ShapeDef) => Part[];
/** Posiciones x de las patas de una cinta: una cada ~1,8 m, siempre en los dos extremos. */
const legXs = (w: number): number[] => { const n = Math.max(2, Math.round(w / 1.8) + 1); return Array.from({length: n}, (_, i) => -w / 2 + 0.05 + (i * (w - 0.1)) / (n - 1)); };
const BUILDERS: Record<string, Builder> = {
  generico: s => { const [w, h, d] = s.size; return [box(0, 0, 0, w, h, d, s.color, 'body'), box(0, h / 2 - 0.004, 0, w * 0.94, 0.008, d * 0.94, shade(s.color, 0.2), 'front', true), box(0, -h / 2 + 0.006, 0, w * 1.0, 0.012, d * 1.0, shade(s.color, -0.2), 'dark', true), ...[-1, 1].flatMap(sx => [-1, 1].map(sz => cyl(sx * (w / 2 - 0.02), h / 2 + 0.001, sz * (d / 2 - 0.02), 0.008, 0.003, 'y', METAL, 'screw', true)))]; },
  placa: s => { const [w, h, d] = s.size; const holes: Part[] = []; for (const sx of [-1, 1]) for (const y of [-h / 2 + 0.05, 0, h / 2 - 0.05]) holes.push(cyl(sx * (w / 2 - 0.04), y, 0, 0.011, d + 0.002, 'z', DARK, 'dark', true)); const edge = shade(s.color, 0.22); return [box(0, 0, 0, w, h, d, s.color, 'body'), box(0, h / 2 - 0.003, d / 2 - 0.0005, w, 0.006, 0.001, edge, 'front', true), box(0, -h / 2 + 0.003, d / 2 - 0.0005, w, 0.006, 0.001, edge, 'front', true), box(-w / 2 + 0.003, 0, d / 2 - 0.0005, 0.006, h, 0.001, edge, 'front', true), box(w / 2 - 0.003, 0, d / 2 - 0.0005, 0.006, h, 0.001, edge, 'front', true), ...holes]; },
  riel: s => { const [w, h, d] = s.size; const slots: Part[] = []; for (let x = -w / 2 + 0.025; x < w / 2 - 0.02; x += 0.05) slots.push(box(x, 0, d / 2 - 0.0008, 0.016, 0.0048, 0.0016, DARK, 'dark', true)); return [
    box(0, 0, -d / 2 + 0.001, w, h * 0.78, 0.002, s.color, 'body'), box(0, h * 0.5 - 0.0018, -d / 2 + 0.001, w, 0.0036, 0.002, s.color, 'body'), box(0, -h * 0.5 + 0.0018, -d / 2 + 0.001, w, 0.0036, 0.002, s.color, 'body'),
    box(0, 0, d / 2 - 0.001, w, h * 0.43, 0.002, shade(s.color, 0.12), 'front'), box(0, h * 0.215, 0, w, 0.0016, d * 0.9, s.color, 'body'), box(0, -h * 0.215, 0, w, 0.0016, d * 0.9, s.color, 'body'), ...slots]; },
  'aparato-din': s => { const [w, h, d] = s.size; return [...dinBody(w, h, d, s.color), box(0, 0, d / 2 + 0.0005, w * 0.5, h * 0.3, 0.001, WHITE, 'label', true)]; },
  'breaker-1p': s => breaker(s), 'breaker-3p': s => breaker(s),
  'contactor-3p': s => { const [w, h, d] = s.size; return [...dinBody(w, h, d, s.color), box(0, 0.002, d / 2 + 0.002, w * 0.52, h * 0.26, 0.004, DARK, 'dark', true), box(0, -h * 0.17, d / 2 + 0.003, w * 0.32, h * 0.1, 0.006, '#dfe4ea', 'trim', true), box(0, h * 0.2, d / 2 + 0.001, w * 0.5, h * 0.07, 0.002, WHITE, 'label', true), ...screws(s)]; },
  'borne-paso': s => { const [w, h, d] = s.size; return [box(0, 0, -d * 0.1, w, h, d * 0.8, s.color, 'body'), box(0, 0, d * 0.32, w * 0.8, h * 0.9, d * 0.35, shade(s.color, 0.15), 'front'), box(0, 0, d * 0.5 - 0.001, w * 0.9, 0.0016, 0.002, DARK, 'dark', true), ...screws(s)]; },
  'fuente-cc': s => { const [w, h, d] = s.size; const vents: Part[] = [0.16, 0.06, -0.04, -0.14].map(f => box(0, h * f, d / 2 + 0.001, w * 0.72, h * 0.018, 0.002, DARK, 'dark', true)); return [...dinBody(w, h, d, s.color), ...vents, ball(w * 0.3, h * 0.28, d / 2 + 0.002, 0.0034, '#37d67a', 'led', true, '#37d67a'), ...screws(s)]; },
  'plc-generico': s => { const [w, h, d] = s.size; const leds: Part[] = (s.terminals ?? []).filter(t => /^D[IO]\d/.test(t.id)).map(t => ball(t.position[0] - s.center[0], (t.position[1] - s.center[1]) * 0.55, d / 2 + 0.002, 0.0026, t.id.startsWith('DI') ? '#37d67a' : '#f0a020', 'led', true, t.id.startsWith('DI') ? '#37d67a' : '#f0a020')); return [...dinBody(w, h, d, s.color), box(0, 0, d / 2 + 0.001, w * 0.46, h * 0.2, 0.002, WHITE, 'label', true), box(-w * 0.38, 0, d / 2 + 0.003, w * 0.12, h * 0.34, 0.006, '#46505e', 'trim', true), ...leds, ...screws(s)]; },
  'rele-termico': s => { const [w, h, d] = s.size; return [...dinBody(w, h, d, s.color), cyl(w * 0.18, h * 0.12, d / 2 + 0.003, Math.min(0.012, w * 0.26), 0.006, 'z', '#e07a1f', 'trim', true), box(w * 0.18, h * 0.12, d / 2 + 0.0065, 0.014, 0.0018, 0.0012, DARK, 'dark', true), box(-w * 0.2, h * 0.12, d / 2 + 0.004, w * 0.2, h * 0.1, 0.008, '#c0392b', 'trim', true), box(0, -h * 0.08, d / 2 + 0.0008, w * 0.6, h * 0.12, 0.0016, WHITE, 'label', true), ...screws(s)]; },
  'pulsador-na': s => pushbutton(s, '#2f9e5b'), 'pulsador-nc': s => pushbutton(s, '#c0392b'),
  piloto: s => { const [w, h, d] = s.size, r = Math.min(w, h) * 0.38; return [box(0, 0, -d * 0.2, w, h, d * 0.6, '#3b434d', 'body'), cyl(0, 0, d * 0.12, r * 1.15, 0.008, 'z', METAL, 'metal', true), ball(0, 0, d * 0.12 + 0.003, r, s.color, 'lens'), box(0, -h * 0.4, -d / 2 + 0.003, Math.min(w * 0.6, 0.03), h * 0.1, 0.006, METAL, 'metal', true), ...screws(s)]; },
  'red-3f': s => { const [w, h, d] = s.size; return [box(0, 0, 0, w, h, d, s.color, 'body'), box(0, h / 2 - 0.004, 0, w * 0.96, 0.008, d * 0.96, shade(s.color, 0.18), 'front', true), box(0, h / 2 - 0.007, 0, w * 0.74, 0.014, 0.05, DARK, 'dark', true), box(0, -h * 0.2, d / 2 + 0.0006, w, 0.03, 0.0012, '#f2c200', 'label', true), box(0, h * 0.1, d / 2 + 0.0006, w * 0.5, 0.05, 0.0012, WHITE, 'label', true), ...screws(s)]; },
  'motor-3p': s => {
    const [w, h, d] = s.size, cy = 0.09 - s.center[1], r = Math.min(h, d) * 0.42, fins: Part[] = [];
    for (let i = -3; i <= 3; i++) fins.push(cyl(i * 0.02, cy, 0, r * 1.05, 0.006, 'x', shade(s.color, -0.08), 'body', true));
    return [cyl(0, cy, 0, r, w * 0.72, 'x', s.color, 'body'), ...fins, cyl(-w * 0.4, cy, 0, r * 0.98, 0.022, 'x', shade(s.color, -0.25), 'dark'), cyl(w * 0.4, cy, 0, r * 0.98, 0.018, 'x', shade(s.color, -0.12), 'front', true),
      cyl(w * 0.46, cy, 0, 0.0095, 0.05, 'x', METAL, 'metal', true), box(0, -h / 2 + 0.01, 0, w * 0.8, 0.02, d * 0.92, shade(s.color, -0.3), 'dark', true), cyl(-w * 0.46, cy, 0, r * 0.9, 0.03, 'x', '#46505e', 'trim', true),
      box(0.02, h / 2 - 0.0125 - 0.002, 0, 0.15, 0.025, 0.07, shade(s.color, -0.18), 'trim'), ...fan(cy, w, r), box(0.02, cy + r * 0.2, r * 0.96, 0.07, 0.04, 0.002, WHITE, 'label', true), ...screws(s)];
  },

  canaleta: s => ductParts(s, 'x'), 'canaleta-vertical': s => ductParts(s, 'y'),
  'canal-piso': s => { const [w, h, d] = s.size, bars: Part[] = []; for (let x = -w / 2 + 0.05; x < w / 2 - 0.02; x += 0.05) bars.push(box(x, h / 2 - 0.004, 0, 0.014, 0.008, d - 0.02, '#4a525c', 'dark', true)); return [
    box(0, -h / 2 + 0.003, 0, w, 0.006, d, s.color, 'body'), box(0, 0, d / 2 - 0.006, w, h, 0.012, shade(s.color, 0.15), 'body'), box(0, 0, -d / 2 + 0.006, w, h, 0.012, shade(s.color, 0.15), 'body'), box(w / 2 - 0.006, 0, 0, 0.012, h, d, shade(s.color, 0.1), 'body'), box(-w / 2 + 0.006, 0, 0, 0.012, h, d, shade(s.color, 0.1), 'body'),
    box(0, h / 2 - 0.0035, 0, w - 0.03, 0.007, d - 0.03, '#2a2f36', 'lens', false), ...bars]; },

  // — Tablero (fase 18): gabinete con puerta —
  gabinete: s => { const [w, h, d] = s.size, c = s.color, dk = shade(c, -0.4), t = 0.02, door = (p: Part): Part => ({...p, tag: 'door'}); return [
    box(-(w / 2 - t / 2), 0, 0, t, h, d, c, 'body'), box(w / 2 - t / 2, 0, 0, t, h, d, c, 'body'), box(0, h / 2 - t / 2, 0, w, t, d, shade(c, 0.08), 'body'), box(0, 0, -d / 2 + t / 2, w, h, t, shade(c, -0.08), 'body'), box(0, -h / 2 + 0.05, 0, w, 0.1, d, dk, 'body'),
    door(box(0, 0.05, d / 2 - t / 2, w - 0.02, h - 0.1, t, c, 'body')),
    fit(box(-0.014, 0.255, 0.14, 0.83, 0.038, 0.020, '#454f5b', 'trim')),
    box(-0.135, -h / 2 + 0.145, -0.115, 0.48, 0.058, 0.043, '#717b86', 'trim', true),
    box(-0.34, -h / 2 + 0.22, -0.115, 0.054, 0.18, 0.042, '#717b86', 'trim', true),
    cyl(w * 0.36, 0.08, d / 2 + 0.01, 0.011, 0.02, 'z', METAL, 'metal'), box(w * 0.36, 0.08, d / 2 + 0.012, 0.03, 0.12, 0.012, '#2a2f36', 'trim', true), cyl(w * 0.36, 0.08, d / 2 + 0.003, 0.02, 0.003, 'z', '#20262d', 'dark', true),
    ...[0.42, 0.05, -0.32].map(y => cyl(-(w / 2 - 0.006), y, d / 2 - 0.004, 0.011, 0.09, 'y', METAL, 'metal', true)),
    box(0, 0.05 + (h - 0.1) / 2 - 0.006, d / 2 + 0.0004, w - 0.04, 0.012, 0.0008, dk, 'dark', true), box(0, 0.05 - (h - 0.1) / 2 + 0.006, d / 2 + 0.0004, w - 0.04, 0.012, 0.0008, dk, 'dark', true),
    ...Array.from({length: 7}, (_, i) => box(0, -h / 2 + 0.16 + i * 0.013, d / 2 + 0.0008, 0.26, 0.007, 0.0016, '#20262d', 'dark', true)),
    cyl(-w * 0.3, h * 0.36, d / 2 + 0.003, 0.07, 0.004, 'z', '#20262d', 'dark', true), cyl(-w * 0.3, h * 0.36, d / 2 + 0.0055, 0.05, 0.002, 'z', '#3a424d', 'dark', true), cyl(-w * 0.3, h * 0.36, d / 2 + 0.0078, 0.012, 0.002, 'z', METAL, 'metal', true),
    box(0, h * 0.4, d / 2 + 0.001, 0.22, 0.045, 0.0018, WHITE, 'label', true), box(w * 0.32, h * 0.4, d / 2 + 0.001, 0.05, 0.045, 0.0018, '#f2c200', 'label', true),
    ...[-0.32, -0.2, -0.08, 0.04].map(x => cyl(x, -h / 2 - 0.005, 0.02, 0.016, 0.02, 'y', '#3a4250', 'metal', true)), cyl(w * 0.36, 0.0, d / 2 + 0.0105, 0.008, 0.003, 'z', '#c9ced6', 'metal', true),
    ...[-1, 1].flatMap(sx => [-1, 1].map(sz => cyl(sx * (w / 2 - 0.05), h / 2 + 0.008, sz * (d / 2 - 0.05), 0.012, 0.016, 'y', METAL, 'metal', true))), box(-(w / 2 - 0.03), -0.3, d / 2 - 0.03, 0.012, 0.2, 0.004, '#b87333', 'metal', true)]; },

  'plinto-tablero': s => { const [w, h, d] = s.size; return [
    box(0, 0, 0, w, h, d, s.color, 'body'), box(0, h / 2 - 0.004, 0, w - 0.02, 0.008, d - 0.02, shade(s.color, 0.12), 'front', true), box(0, -0.01, d / 2 + 0.0006, w * 0.5, h * 0.55, 0.0012, '#2a2f36', 'dark', true),
    ...[-1, 1].flatMap(sx => [-1, 1].map(sz => cyl(sx * (w / 2 - 0.05), h / 2 + 0.008, sz * (d / 2 - 0.05), 0.009, 0.016, 'y', METAL, 'metal', true))), box(0, -h / 2 + 0.006, d / 2 + 0.0006, w, 0.012, 0.0012, shade(s.color, -0.2), 'dark', true)]; },

  // — Sala eléctrica (fase 19): muros, puerta de salida con barra antipánico (cierra hacia fuera), ranura de cables, luces, climatizador, bandeja, extintor y pasillo marcado —
  'sala-electrica': s => { const [w, h, d] = s.size, t = 0.15, c = s.color, dk = shade(c, -0.3), ex = w / 2 - t / 2, top = h / 2, bot = -h / 2, yFloor = bot + 0.021; return [
    box(0, 0, -(d / 2 - t / 2), w, h, t, c, 'body'), box(0, 0, d / 2 - t / 2, w, h, t, c, 'body'), box(-ex, 0, 0, t, h, d - 2 * t, c, 'body'),
    box(ex, 0, -0.95, t, h, 1.2, c, 'body'), box(ex, 0.15, -0.05, t, h - 0.3, 0.8, c, 'body'), box(ex, 0, 0.475, t, h, 0.35, c, 'body'), box(ex, bot + 2.1 + (h - 2.1) / 2, 1.1, t, h - 2.1, 0.9, c, 'body'),
    box(0, bot + 0.02, 0, w - 2 * t, 0.04, d - 2 * t, '#7d838c', 'front'),
    box(0, bot + 0.07, -(d / 2 - t - 0.001), w - 2 * t, 0.14, 0.002, BAND_DARK, 'dark', true), box(0, bot + 0.07, d / 2 - t - 0.001, w - 2 * t, 0.14, 0.002, BAND_DARK, 'dark', true),
    // puerta de salida (verde) con barra antipánico por dentro, señal de peligro por fuera y luz de emergencia
    fit(box(ex - 0.045, bot + 1.05, 1.1, 0.04, 2.05, 0.88, '#3f6f4a', 'trim', true)), fit(box(ex - 0.075, bot + 1.0, 1.1, 0.02, 0.05, 0.7, METAL, 'metal', true)), fit(box(ex + t / 2 + 0.003, bot + 1.0, 1.1, 0.006, 0.05, 0.12, '#2a2f36', 'dark', true)),
    box(ex + t / 2 + 0.0004, bot + 2.5, 1.1, 0.004, 0.4, 0.4, '#f2c200', 'label', true), box(ex + t / 2 + 0.0045, bot + 2.5, 1.1, 0.002, 0.2, 0.025, DARK, 'dark', true), box(ex + t / 2 + 0.0045, bot + 2.37, 1.1, 0.002, 0.03, 0.03, DARK, 'dark', true),
    box(ex - t / 2 - 0.03, bot + 2.25, 0.8, 0.06, 0.1, 0.22, '#f1f3f6', 'trim', true), ball(ex - t / 2 - 0.065, bot + 2.25, 0.8, 0.012, '#d62b2b', 'led', true, '#d62b2b'),
    // luces de trabajo, climatizador, bandeja de cables, extintor
    ...[-1.4, 0, 1.4].flatMap(x => [-0.8, 0.8].map(z => box(x, top - 0.12, z, 1.1, 0.05, 0.22, '#f4f6f8', 'trim', true, '#fff6d6'))),
    box(-(w / 2 - t - 0.12), bot + 2.35, -0.9, 0.22, 0.32, 1.0, '#f1f3f6', 'trim', true), box(-(w / 2 - t - 0.025), bot + 2.28, -0.9, 0.03, 0.06, 0.9, '#2a2f36', 'dark', true), box(-(w / 2 - t - 0.12), bot + 2.35, 0.9, 0.18, 0.1, 0.16, '#d9dde2', 'trim', true),
    box(0, top - 0.55, -0.7, w - 2 * t, 0.06, 0.34, '#9aa3ad', 'metal', true), ...Array.from({length: 17}, (_, i) => box(-w / 2 + t + 0.1 + i * ((w - 2 * t - 0.2) / 16), top - 0.55, -0.7, 0.03, 0.08, 0.36, '#7a838d', 'metal', true)),
    ...[-1.8, 1.0].map(x => cyl(x, top - 0.55 + 0.22, -0.7, 0.01, 0.4, 'y', '#9aa3ad', 'metal', true)),
    cyl(ex - t / 2 - 0.1, bot + 0.45, 1.45, 0.08, 0.5, 'y', '#d62b2b', 'trim', true), cyl(ex - t / 2 - 0.1, bot + 0.72, 1.45, 0.03, 0.06, 'y', '#2a2f36', 'dark', true), box(ex - t / 2 - 0.04, bot + 1.25, 1.45, 0.03, 0.25, 0.25, '#d62b2b', 'label', true),
    // pasillo libre marcado frente al tablero (el tablero queda en el centro, mirando a +z) y franja de seguridad ante la puerta
    box(0, yFloor, 1.175, 1.4, 0.002, 0.06, '#f2c200', 'label', true), box(-0.7, yFloor, 0.675, 0.06, 0.002, 1.06, '#f2c200', 'label', true), box(0.7, yFloor, 0.675, 0.06, 0.002, 1.06, '#f2c200', 'label', true),
    box(ex - 0.5, yFloor, 1.1, 0.9, 0.002, 0.9, '#2a2f36', 'label', true), ...[0, 1, 2, 3].map(i => box(ex - 0.5 - 0.35 + i * 0.23, yFloor + 0.001, 1.1, 0.1, 0.002, 0.9, '#f2c200', 'label', true))]; },

  // — Escenario de planta (fase 13): formas por tipo de equipo, en el sistema local centrado en la caja del catálogo —
  'piso-planta': s => { const [w, h, d] = s.size, y = h / 2 - 0.0004, line = '#f2c200', joint = shade(s.color, -0.28); return [
    box(0, 0, 0, w, h, d, s.color, 'body'), box(0, h / 2 - 0.002, 0, w, 0.004, d, shade(s.color, 0.1), 'front'),
    box(0, y, d / 2 - 0.06, w - 0.1, 0.001, 0.05, line, 'label', true), box(0, y, -d / 2 + 0.06, w - 0.1, 0.001, 0.05, line, 'label', true), box(-w / 2 + 0.06, y, 0, 0.05, 0.001, d - 0.1, line, 'label', true), box(w / 2 - 0.06, y, 0, 0.05, 0.001, d - 0.1, line, 'label', true),
    ...[-1, 0, 1].map(k => box(k * (w / 4), y, 0, 0.004, 0.001, d, joint, 'dark', true)), ...[-0.5, 0.5].map(k => box(0, y, k * (d / 2), w, 0.001, 0.004, joint, 'dark', true))]; },
  'mesa-trabajo': s => { const [w, h, d] = s.size, leg = shade(s.color, -0.3); return [
    box(0, h / 2 - 0.025, 0, w, 0.05, d, s.color, 'body'), ...[-1, 1].flatMap(sx => [-1, 1].map(sz => box(sx * (w / 2 - 0.04), -0.025, sz * (d / 2 - 0.04), 0.05, h - 0.05, 0.05, leg, 'body'))),
    box(0, -h / 2 + 0.2, 0, w - 0.1, 0.02, d - 0.1, shade(s.color, -0.15), 'front'), box(0, h / 2 - 0.07, d / 2 - 0.03, w - 0.1, 0.06, 0.012, leg, 'dark', true), box(0, h / 2 - 0.0258, 0, w - 0.02, 0.0016, d - 0.02, shade(s.color, 0.25), 'label', true)]; },
  'valla-seguridad': s => { const [w, h, d] = s.size, mesh = '#6b7480', bars: Part[] = []; for (let i = 0; i < 11; i++) bars.push(box(-w / 2 + 0.1 + i * ((w - 0.2) / 10), 0, 0, 0.006, h - 0.12, 0.006, mesh, 'dark', true)); for (let j = 0; j < 6; j++) bars.push(box(0, -h / 2 + 0.08 + j * ((h - 0.16) / 5), 0, w - 0.12, 0.006, 0.006, mesh, 'dark', true)); return [
    box(-w / 2 + 0.03, 0, 0, 0.06, h, d, '#3a3f47', 'body'), box(w / 2 - 0.03, 0, 0, 0.06, h, d, '#3a3f47', 'body'), box(0, h / 2 - 0.02, 0, w, 0.04, d * 0.75, s.color, 'body'), box(0, -h / 2 + 0.05, 0, w, 0.04, d * 0.75, s.color, 'body'), ...bars,
    box(-w / 2 + 0.05, -h / 2 + 0.006, 0, 0.1, 0.012, 0.05, '#2a2f36', 'dark', true), box(w / 2 - 0.05, -h / 2 + 0.006, 0, 0.1, 0.012, 0.05, '#2a2f36', 'dark', true)]; },
  'cinta-transportadora': s => { const [w, h, d] = s.size, top = h / 2, leg = shade(s.color, -0.35), rail = shade(s.color, 0.18), roller = (x: number) => cyl(x, top - 0.03, 0, 0.03, d - 0.1, 'z', METAL, 'metal'); return [
    ...legXs(w).flatMap((x, i, all) => [-1, 1].map(sz => box(x, -0.05, sz * (d / 2 - 0.05), 0.06, h - 0.1, 0.06, leg, 'body', i > 0 && i < all.length - 1))),
    box(0, top - 0.06, d / 2 - 0.03, w, 0.1, 0.06, rail, 'body'), box(0, top - 0.06, -d / 2 + 0.03, w, 0.1, 0.06, rail, 'body'),
    box(0, top - 0.012, 0, w - 0.08, 0.02, d - 0.12, '#2b2f35', 'dark'), roller(-w / 2 + 0.05), roller(w / 2 - 0.05),
    ...Array.from({length: Math.max(15, Math.round(w * 9))}, (_, i) => box(-w / 2 + 0.12 + i * ((w - 0.24) / (Math.max(15, Math.round(w * 9)) - 1)), top - 0.0015, 0, 0.008, 0.001, d - 0.14, '#454b53', 'dark', true)),
    box(0, -h / 2 + 0.25, 0, w - 0.14, 0.03, 0.03, leg, 'dark', true), box(0, -h / 2 + 0.25, d / 2 - 0.05, w - 0.14, 0.03, 0.03, leg, 'dark', true)]; },
  'caja-producto': s => { const [w, h, d] = s.size; return [
    box(0, 0, 0, w, h, d, s.color, 'body'), box(0, h / 2 - 0.0006, 0, 0.04, 0.0012, d, '#e7d9b4', 'label', true), box(0, h / 2 - 0.0006, 0, w, 0.0012, 0.003, shade(s.color, -0.25), 'dark', true),
    box(0, 0.005, d / 2 + 0.0006, w * 0.45, h * 0.3, 0.0012, WHITE, 'label', true), box(0, -h / 2 + 0.012, d / 2 + 0.0004, w, 0.002, 0.001, shade(s.color, -0.2), 'dark', true)]; },
  'brazo-robot': s => { const orange = s.color, dark = '#30353d'; return [
    cyl(-0.12, -0.5, 0, 0.23, 0.1, 'y', dark, 'dark'), cyl(-0.12, -0.38, 0, 0.17, 0.14, 'y', orange, 'body'), box(-0.12, -0.05, 0, 0.1, 0.5, 0.14, orange, 'body'),
    cyl(-0.12, 0.22, 0, 0.075, 0.18, 'z', dark, 'dark'), box(0.06, 0.22, 0, 0.3, 0.09, 0.12, orange, 'body'), cyl(0.2, 0.22, 0, 0.05, 0.12, 'z', dark, 'dark'),
    box(0.2, 0.13, 0, 0.05, 0.1, 0.05, METAL, 'metal'), box(0.18, 0.04, 0, 0.01, 0.08, 0.03, METAL, 'metal'), box(0.22, 0.04, 0, 0.01, 0.08, 0.03, METAL, 'metal'),
    cyl(-0.12, -0.45, 0, 0.19, 0.012, 'y', shade(orange, -0.3), 'body', true), ...[-1, 1].flatMap(sx => [-1, 1].map(sz => cyl(-0.12 + sx * 0.18, -0.545, sz * 0.18, 0.012, 0.012, 'y', METAL, 'metal', true))),
    box(-0.12, -0.3, 0.071, 0.07, 0.12, 0.002, '#46505e', 'trim', true), ball(-0.12, 0.22, 0.095, 0.006, '#37d67a', 'led', true, '#37d67a'), box(-0.12, -0.44, 0.2, 0.26, 0.1, 0.06, '#2a2f36', 'dark', true), ...screws(s)]; },
  compresor: s => { const [w, h, d] = s.size, tank = '#2f7aa8'; return [
    cyl(0, -0.2, 0, 0.17, 0.6, 'x', s.color, 'body'), cyl(-0.3, -0.2, 0, 0.17, 0.012, 'x', shade(tank, -0.2), 'body', true), cyl(0.3, -0.2, 0, 0.17, 0.012, 'x', shade(tank, -0.2), 'body', true),
    box(-0.12, 0.1, 0, 0.2, 0.5, 0.2, shade(s.color, -0.3), 'body'), cyl(0.15, 0.12, 0, 0.08, 0.25, 'x', '#46505e', 'body'), box(-0.25, -0.38, 0, 0.06, 0.04, d * 0.8, DARK, 'dark'), box(0.25, -0.38, 0, 0.06, 0.04, d * 0.8, DARK, 'dark'),
    cyl(0.25, -0.2, 0.172, 0.012, 0.012, 'z', METAL, 'metal'), cyl(-0.12, 0.36, 0, 0.05, 0.02, 'y', METAL, 'metal', true), cyl(0.05, -0.02, 0.17, 0.035, 0.012, 'z', WHITE, 'label', true), ...screws(s)]; },
  'valvula-5-2': s => { const [w, h, d] = s.size; return [
    box(0, 0, 0, w * 0.6, h, d, s.color, 'body'), cyl(-w * 0.4, 0, 0, 0.02, 0.018, 'x', '#2a2f36', 'trim'), cyl(w * 0.4, 0, 0, 0.02, 0.018, 'x', '#2a2f36', 'trim'),
    box(0, h / 2 - 0.004, 0, w * 0.56, 0.008, d * 0.9, shade(s.color, 0.2), 'front', true), box(0, -0.005, d / 2 + 0.0006, w * 0.5, 0.02, 0.0012, WHITE, 'label', true),
    ...[-0.025, 0, 0.025].map(x => cyl(x, -0.005, d / 2 + 0.002, 0.0075, 0.005, 'z', BRASS, 'metal', true)), ball(w * 0.4, 0.02, 0.0, 0.004, '#37d67a', 'led', true, '#37d67a'), ...screws(s)]; },
  'cilindro-neumatico': s => { const [w, h, d] = s.size; return [
    cyl(-0.06, 0, 0, 0.034, 0.28, 'x', s.color, 'body'), box(-0.19, 0, 0, 0.02, h, d, '#46505e', 'body'), box(0.07, 0, 0, 0.02, h, d, '#46505e', 'body'),
    cyl(0.14, 0, 0, 0.008, 0.12, 'x', METAL, 'metal'), box(0.195, 0, 0, 0.01, 0.026, 0.026, METAL, 'metal'), box(-0.06, -h / 2 + 0.004, 0, 0.22, 0.008, d, DARK, 'dark', true),
    ...[-0.12, 0.0].map(x => cyl(x, 0, 0, 0.0365, 0.004, 'x', shade(s.color, -0.3), 'dark', true)), box(-0.06, 0.0345, 0, 0.12, 0.001, 0.014, WHITE, 'label', true), ...screws(s)]; },
  tanque: s => { const [w, h, d] = s.size, shell = s.color; return [
    cyl(0, -0.02, 0, 0.28, 0.8, 'y', shell, 'body'), cyl(0, 0.4, 0, 0.22, 0.06, 'y', shade(shell, 0.15), 'body'), cyl(0, -0.46, 0, 0.2, 0.06, 'y', shade(shell, -0.15), 'body'),
    ...[-1, 1].flatMap(sx => [-1, 1].map(sz => box(sx * 0.21, -0.465, sz * 0.21, 0.04, 0.07, 0.04, DARK, 'dark'))),
    box(0.17, -0.02, 0.265, 0.05, 0.5, 0.022, '#cfe6f2', 'lens'), box(0.17, -0.12, 0.2652, 0.034, 0.28, 0.002, '#2d7fd1', 'led', true), cyl(0, 0.35, 0, 0.285, 0.008, 'y', METAL, 'metal', true), cyl(0, -0.3, 0, 0.285, 0.008, 'y', METAL, 'metal', true),
    cyl(0, 0.32, 0.285, 0.016, 0.03, 'z', METAL, 'metal', true), cyl(0, -0.34, 0.285, 0.016, 0.03, 'z', METAL, 'metal', true), ...screws(s)]; },
  'sensor-inductivo': s => [cyl(0, -0.005, 0, 0.012, 0.05, 'y', s.color, 'body'), box(0, -0.014, 0, 0.028, 0.008, 0.028, shade(s.color, -0.15), 'body'), cyl(0, -0.03, 0, 0.0095, 0.002, 'y', '#e0a800', 'trim', true), ball(0, 0.021, 0.008, 0.0028, '#f0a020', 'led', true, '#f0a020'), ...screws(s)],
  'sensor-fotoelectrico': s => { const [w, h, d] = s.size; return [
    box(0, -0.004, 0, w, h * 0.9, d, s.color, 'body'), cyl(0, -0.004, d / 2 + 0.001, 0.011, 0.004, 'z', '#1a1f26', 'dark', true), cyl(0, -0.004, d / 2 + 0.003, 0.008, 0.003, 'z', '#9fd8ff', 'lens', true), ball(w * 0.32, 0.018, d / 2 + 0.001, 0.0026, '#37d67a', 'led', true, '#37d67a'),
    box(0, -h / 2 + 0.004, 0, w * 1.0, 0.008, d, '#1a1f26', 'dark', true), ...screws(s)]; },
  'torre-luminosa': s => [
    box(0, -0.12, 0, 0.07, 0.06, 0.07, '#2a2f36', 'body'), cyl(0, -0.05, 0, 0.03, 0.06, 'y', '#3aa655', 'body'), cyl(0, 0.01, 0, 0.03, 0.06, 'y', '#e8a317', 'body'), cyl(0, 0.07, 0, 0.03, 0.06, 'y', '#d64545', 'body'), cyl(0, 0.12, 0, 0.032, 0.014, 'y', '#2a2f36', 'dark'),
    ...[-0.05, 0.01, 0.07].map(y => cyl(0, y, 0, 0.0325, 0.004, 'y', '#1e2329', 'dark', true)), cyl(0, 0.14, 0, 0.012, 0.03, 'y', METAL, 'metal', true), ...screws(s)],
  'paro-emergencia': s => [
    box(0, -0.015, 0, 0.08, 0.05, 0.06, s.color, 'body'), cyl(0, 0.0, 0, 0.034, 0.008, 'y', '#2a2f36', 'dark'), cyl(0, 0.017, 0, 0.026, 0.03, 'y', '#d62b2b', 'trim'), cyl(0, 0.03, 0, 0.022, 0.006, 'y', shade('#d62b2b', 0.25), 'trim', true),
    box(0, -0.036, 0.0308, 0.07, 0.006, 0.0012, '#2a2f36', 'dark', true), ...screws(s)],
};

/** Tapa del ventilador del motor: aro oscuro y rejilla de ranuras radiales (detalle fino). */
function fan(cy: number, w: number, r: number): Part[] {
  const out: Part[] = [cyl(-w * 0.5, cy, 0, r * 0.82, 0.004, 'x', DARK, 'dark', true)];
  for (const k of [-0.5, 0, 0.5]) out.push(box(-w * 0.5 - 0.0025, cy + k * r, 0, 0.002, 0.0035, r * 1.5, shade(DARK, 0.3), 'dark', true), box(-w * 0.5 - 0.0025, cy, k * r, 0.002, r * 1.5, 0.0035, shade(DARK, 0.3), 'dark', true));
  return out;
}

/** Canaleta ranurada: fondo, dos paredes con ranuras (peine), tapa translúcida (se ven los cables por dentro) y remaches. `axis` = dirección larga. */
function ductParts(s: ShapeDef, axis: 'x' | 'y'): Part[] {
  const [w, h, d] = s.size, L = axis === 'x' ? w : h, T = axis === 'x' ? h : w, out: Part[] = [];
  const at = (u: number, v: number, z: number, lu: number, tv: number, dz: number, color: string, role: PartRole, fine = false) => (axis === 'x' ? box(u, v, z, lu, tv, dz, color, role, fine) : box(v, u, z, tv, lu, dz, color, role, fine));
  out.push(at(0, 0, -d / 2 + 0.003, L, T, 0.006, s.color, 'body'));
  for (const side of [-1, 1]) {
    const edge = side * (T / 2 - 0.003);
    out.push(at(0, edge, -d / 2 + 0.009, L, 0.006, 0.018, shade(s.color, -0.12), 'body'));
    for (const u of [-L / 2 + 0.007, L / 2 - 0.007]) out.push(at(u, edge, 0, 0.014, 0.006, d, shade(s.color, -0.06), 'body'));
    for (let u = -L / 2 + 0.024; u < L / 2 - 0.009; u += 0.024) out.push(at(u, edge, 0.003, 0.014, 0.006, d - 0.008, shade(s.color, -0.06), 'trim', true));
  }
  out.push({...at(0, 0, d / 2 - 0.0025, L - 0.004, T - 0.012, 0.005, '#dfe5ec', 'lens', false), opacity: 0.38});
  for (const u of [-L / 2 + 0.02, L / 2 - 0.02]) out.push(at(u, 0, d / 2 + 0.0008, 0.008, 0.008, 0.002, METAL, 'metal', true));
  return out;
}

function breaker(s: ShapeDef): Part[] {
  const [w, h, d] = s.size, xs = poleXs(s), parts = [...dinBody(w, h, d, s.color)];
  parts.push(box(0, h * 0.1, d / 2 + 0.0008, w * 0.86, h * 0.34, 0.0016, '#dfe4ea', 'label', true));
  for (const x of xs.length ? xs : [0]) parts.push(box(x, h * 0.1, d / 2 + 0.006, Math.min(0.012, w * 0.34), h * 0.2, 0.01, '#1f242b', 'trim', true));
  if (xs.length > 1) parts.push(box(0, h * 0.21, d / 2 + 0.005, (xs.at(-1)! - xs[0]) + 0.012, 0.005, 0.006, '#1f242b', 'trim', true));
  return [...parts, ...screws(s)];
}
function pushbutton(s: ShapeDef, color: string): Part[] {
  const [w, h, d] = s.size, r = Math.min(w, h) * 0.34;
  return [box(0, -h * 0.12, -d * 0.2, w, h * 0.7, d * 0.6, '#39424c', 'body'), box(0, h * 0.28, d * 0.05, w * 0.98, h * 0.2, d * 0.5, DARK, 'dark', true), cyl(0, -h * 0.12, d * 0.12, r * 1.2, 0.006, 'z', METAL, 'metal', true), cyl(0, -h * 0.12, d * 0.12 + 0.012, r, 0.014, 'z', color, 'trim'), box(0, -h * 0.45, -d / 2 + 0.003, Math.min(w * 0.6, 0.03), h * 0.1, 0.006, METAL, 'metal', true), ...screws(s)];
}

// ——— Detalle fino de cada equipo (fase 16): rasgos de los aparatos reales (cubrebornes, ventanas, diales, conectores, aletas, bridas…). Todo `fine`: con muchas piezas
// en escena se omite y no cambia las cajas ni los terminales. Son rasgos genéricos de cada TIPO de equipo, no la réplica de un producto ni de un fabricante. ———
const glass = (p: Part, opacity: number): Part => ({...p, opacity});
const ENRICH: Record<string, Builder> = {
  'breaker-1p': s => breakerExtra(s), 'breaker-3p': s => breakerExtra(s),
  'contactor-3p': s => { const [w, h, d] = s.size, dk = shade(s.color, -0.3); return [
    box(0, h / 2 - 0.006, d * 0.3, w * 0.96, 0.012, d * 0.4, dk, 'dark', true), box(0, -h / 2 + 0.006, d * 0.3, w * 0.96, 0.012, d * 0.4, dk, 'dark', true),
    box(w * 0.18, h * 0.2, d / 2 + 0.0008, w * 0.4, h * 0.09, 0.0012, WHITE, 'label', true), ...[-0.3, 0, 0.3].map(k => box(w * k, h * 0.02, d / 2 + 0.002, w * 0.12, h * 0.2, 0.002, '#10151b', 'dark', true)),
    box(-w * 0.5 + 0.0015, -h * 0.4, d * 0.1, 0.003, 0.012, 0.02, METAL, 'metal', true), box(w * 0.5 - 0.0015, -h * 0.4, d * 0.1, 0.003, 0.012, 0.02, METAL, 'metal', true), box(0, h * 0.4, d / 2 + 0.0006, w * 0.8, 0.0012, 0.0012, shade(s.color, 0.4), 'label', true)]; },
  'rele-termico': s => { const [w, h, d] = s.size; return [
    cyl(-w * 0.2, h * 0.24, d / 2 + 0.003, 0.0065, 0.006, 'z', '#2a5db0', 'trim', true), box(w * 0.18, h * 0.24, d / 2 + 0.0008, w * 0.5, h * 0.05, 0.0012, WHITE, 'label', true), ...[0, 1, 2, 3, 4].map(i => box(w * 0.18 - w * 0.2 + i * w * 0.1, h * 0.28, d / 2 + 0.0015, 0.0012, 0.006, 0.0012, DARK, 'dark', true)),
    box(0, h / 2 - 0.006, d * 0.3, w * 0.96, 0.012, d * 0.4, shade(s.color, -0.3), 'dark', true), box(0, -h / 2 + 0.006, d * 0.3, w * 0.96, 0.012, d * 0.4, shade(s.color, -0.3), 'dark', true)]; },
  'fuente-cc': s => { const [w, h, d] = s.size; return [
    cyl(w * 0.25, -h * 0.08, d / 2 + 0.002, 0.0035, 0.004, 'z', METAL, 'metal', true), box(-w * 0.15, -h * 0.08, d / 2 + 0.0008, w * 0.4, h * 0.08, 0.0012, WHITE, 'label', true),
    ...[-0.38, 0.38].map(sx => box(sx * w, 0, d * 0.3, 0.0012, h * 0.7, d * 0.38, shade(s.color, -0.25), 'dark', true)), box(0, h / 2 - 0.006, d * 0.3, w * 0.96, 0.012, d * 0.4, '#20262d', 'dark', true), box(0, -h / 2 + 0.006, d * 0.3, w * 0.96, 0.012, d * 0.4, '#20262d', 'dark', true)]; },
  'plc-generico': s => { const [w, h, d] = s.size; return [
    box(0, h / 2 - 0.007, d * 0.32, w * 0.94, 0.012, d * 0.36, '#3a7d54', 'trim', true), box(0, -h / 2 + 0.007, d * 0.32, w * 0.94, 0.012, d * 0.36, '#d98a2b', 'trim', true),
    glass(box(w * 0.3, h * 0.1, d / 2 + 0.0015, w * 0.26, h * 0.16, 0.003, '#123047', 'lens', true), 0.95), box(w * 0.3, h * 0.1, d / 2 + 0.0034, w * 0.22, h * 0.1, 0.0006, '#7fd3ff', 'lens', true, '#2a7ea8'),
    box(w * 0.33, -h * 0.12, d / 2 + 0.001, 0.017, 0.012, 0.002, '#1a1f26', 'dark', true), box(w * 0.33, -h * 0.12, d / 2 + 0.0023, 0.015, 0.01, 0.0008, METAL, 'metal', true), cyl(-w * 0.2, -h * 0.12, d / 2 + 0.002, 0.005, 0.004, 'z', '#c8ced6', 'metal', true),
    ...[0, 1, 2].map(i => ball(w * 0.18 + i * 0.006, -h * 0.02, d / 2 + 0.002, 0.0022, ['#37d67a', '#f0a020', '#d9302c'][i], 'trim', true, ['#37d67a', '#f0a020', '#d9302c'][i]))]; },
  'borne-paso': s => { const [w, h, d] = s.size; return [
    box(0, h * 0.04, d * 0.5 + 0.0004, w * 0.8, h * 0.12, 0.0008, WHITE, 'label', true), box(0, 0, d * 0.5 - 0.002, w * 0.7, 0.005, 0.0025, DARK, 'dark', true),
    box(w / 2 - 0.0003, 0, 0, 0.0006, h * 0.92, d * 0.82, shade(s.color, 0.25), 'front', true), box(0, h * 0.32, d * 0.5 - 0.004, w * 0.8, 0.008, 0.008, shade(s.color, -0.3), 'dark', true), box(0, -h * 0.32, d * 0.5 - 0.004, w * 0.8, 0.008, 0.008, shade(s.color, -0.3), 'dark', true)]; },
  'pulsador-na': s => buttonExtra(s, 'I'), 'pulsador-nc': s => buttonExtra(s, 'O'),
  piloto: s => { const [w, h, d] = s.size, r = Math.min(w, h) * 0.38; return [cyl(0, 0, d * 0.12 + 0.002, r * 1.3, 0.003, 'z', shade(METAL, -0.1), 'metal', true), cyl(0, 0, d * 0.12 - 0.003, r * 1.45, 0.003, 'z', '#2a2f36', 'dark', true), ball(-r * 0.3, r * 0.3, d * 0.12 + 0.0055, r * 0.18, WHITE, 'label', true)]; },
  'red-3f': s => { const [w, h, d] = s.size; return [
    cyl(w * 0.4, 0.02, d / 2 + 0.008, 0.012, 0.016, 'z', METAL, 'metal', true), box(w * 0.4, 0.02, d / 2 + 0.013, 0.012, 0.05, 0.008, '#2a2f36', 'trim', true), box(0, -h * 0.05, d / 2 + 0.0004, w * 0.96, 0.002, 0.0008, shade(s.color, -0.3), 'dark', true),
    ...[0, 1, 2, 3].map(i => box(-w * 0.3 + i * 0.03, -h * 0.35, d / 2 + 0.001, 0.02, 0.004, 0.0016, DARK, 'dark', true)), box(-w * 0.35, h * 0.12, d / 2 + 0.0008, 0.06, 0.05, 0.0012, '#f2c200', 'label', true), box(-w * 0.35, h * 0.115, d / 2 + 0.0016, 0.008, 0.022, 0.0008, DARK, 'dark', true),
    cyl(0, h / 2 - 0.011, 0, 0.012, 0.012, 'y', '#2a2f36', 'dark', true)]; },
  'motor-3p': s => { const [w, h, d] = s.size, cy = 0.09 - s.center[1], r = Math.min(h, d) * 0.42; return [
    cyl(0.02, h / 2 - 0.0125 - 0.002, 0.04, 0.0085, 0.022, 'z', '#2a2f36', 'dark', true), box(w * 0.46 - 0.007, cy, 0, 0.004, 0.006, 0.014, DARK, 'dark', true),
    ...[-1, 1].flatMap(sx => [-1, 1].map(sz => cyl(sx * w * 0.3, -h / 2 + 0.021, sz * d * 0.4, 0.007, 0.004, 'y', METAL, 'metal', true))),
    cyl(0, cy + r + 0.004, 0, 0.007, 0.012, 'y', METAL, 'metal', true), cyl(-w * 0.43, cy, 0, r * 0.4, 0.004, 'x', '#2a2f36', 'dark', true)]; },
  'brazo-robot': s => { const dark = '#30353d', o = s.color; return [
    cyl(-0.12, 0.22, 0.085, 0.045, 0.05, 'z', dark, 'dark', true), cyl(-0.12, 0.22, -0.085, 0.04, 0.03, 'z', shade(o, -0.2), 'body', true), cyl(0.2, 0.22, 0.07, 0.035, 0.03, 'z', dark, 'dark', true),
    box(-0.12, -0.05, 0, 0.104, 0.02, 0.144, '#f2f2f2', 'label', true), box(0.06, 0.22, 0.0, 0.3, 0.012, 0.124, '#f2f2f2', 'label', true), box(0.18, 0.0, 0, 0.004, 0.025, 0.034, '#1a1f26', 'dark', true), box(0.22, 0.0, 0, 0.004, 0.025, 0.034, '#1a1f26', 'dark', true),
    ...[0, 1, 2, 3].map(i => cyl(-0.12 + Math.cos(i * 1.57) * 0.15, -0.44, Math.sin(i * 1.57) * 0.15, 0.01, 0.01, 'y', METAL, 'metal', true)), cyl(-0.12, -0.255, 0, 0.17, 0.006, 'y', '#f2f2f2', 'label', true)]; },
  compresor: s => { const [w, h, d] = s.size; return [
    cyl(0.1, -0.02, 0, 0.014, 0.05, 'y', BRASS, 'metal', true), cyl(0.18, -0.025, 0, 0.012, 0.03, 'y', '#2a2f36', 'dark', true), cyl(-0.12, 0.372, 0, 0.04, 0.04, 'y', '#2a2f36', 'dark', true), box(-0.12, 0.1, 0.101, 0.2, 0.08, 0.002, '#2a2f36', 'dark', true),
    cyl(0.28, -0.37, 0.0, 0.01, 0.03, 'y', BRASS, 'metal', true), ...[-0.3, -0.2, 0.2, 0.3].map(x => cyl(x, -0.2, 0, 0.1705, 0.006, 'x', shade(s.color, -0.35), 'dark', true)), ...[-1, 1].map(sx => cyl(sx * 0.25, -0.395, d * 0.36, 0.012, 0.012, 'y', '#2a2f36', 'dark', true))]; },
  'valvula-5-2': s => { const [w, h, d] = s.size; return [
    ...[-1, 1].map(sx => cyl(sx * w * 0.47, 0.012, 0, 0.007, 0.006, 'x', '#c0392b', 'trim', true)), box(w * 0.4, h / 2 + 0.008, 0, 0.018, 0.02, 0.018, '#1a1f26', 'trim', true), ...[-0.3, 0.3].map(sx => cyl(w * sx, -h / 2 + 0.003, d / 2 - 0.008, 0.005, 0.01, 'y', BRASS, 'metal', true)), box(0, h * 0.2, d / 2 + 0.0006, w * 0.5, 0.004, 0.0012, WHITE, 'label', true)]; },
  'cilindro-neumatico': s => { const [w, h, d] = s.size; return [
    ...[-1, 1].flatMap(sy => [-1, 1].map(sz => cyl(-0.06, sy * 0.027, sz * 0.027, 0.003, 0.3, 'x', METAL, 'metal', true))), cyl(-0.18, 0.032, 0, 0.004, 0.012, 'y', '#c0392b', 'trim', true), cyl(0.06, 0.032, 0, 0.004, 0.012, 'y', '#c0392b', 'trim', true), cyl(0.07, 0, 0, 0.012, 0.012, 'x', '#2a2f36', 'dark', true), box(0.1, 0, 0, 0.012, 0.005, 0.05, DARK, 'dark', true)]; },
  tanque: s => { return [
    cyl(0, 0.43, 0, 0.1, 0.02, 'y', METAL, 'metal', true), cyl(0.15, 0.46, 0, 0.012, 0.1, 'y', '#8a929e', 'metal', true), ...[0.1, -0.12].map(y => cyl(0, y, 0, 0.2815, 0.006, 'y', '#7d8a98', 'metal', true)),
    ...[-1, 1].map(sx => box(sx * 0.2, -0.02, -0.28, 0.012, 0.74, 0.01, '#8a929e', 'metal', true)), cyl(0, 0.46, 0, 0.1, 0.004, 'y', '#2a2f36', 'dark', true)]; },
  'sensor-inductivo': s => [cyl(0.0165, 0.012, 0, 0.0062, 0.01, 'x', METAL, 'metal', true), box(0.011, 0.012, 0, 0.003, 0.016, 0.016, '#2a2f36', 'dark', true), cyl(0, -0.03, 0, 0.0108, 0.002, 'y', '#c8ced6', 'metal', true)],
  'sensor-fotoelectrico': s => { const [w, h, d] = s.size; return [
    cyl(w * 0.5 + 0.006, 0.004, 0, 0.006, 0.01, 'x', METAL, 'metal', true), cyl(-w * 0.25, h * 0.5 - 0.003, 0, 0.004, 0.006, 'y', '#e8a317', 'trim', true), box(0, -h * 0.5 + 0.004, 0, w * 1.2, 0.006, d * 0.7, '#2a2f36', 'dark', true), ...[-1, 1].map(sx => box(sx * w * 0.52, -h * 0.5 + 0.004, 0, 0.004, 0.006, 0.01, DARK, 'dark', true))]; },
  'paro-emergencia': s => [cyl(0, 0.011, 0, 0.031, 0.002, 'y', '#f2c200', 'trim', true), cyl(0, 0.003, 0, 0.0365, 0.002, 'y', '#f2c200', 'trim', true), box(0, -0.018, 0.0308, 0.03, 0.01, 0.0012, WHITE, 'label', true)],
  'cinta-transportadora': s => { const [w, h, d] = s.size, top = h / 2; return [
    ...legXs(w).flatMap(x => [-1, 1].map(sz => box(x, -h / 2 + 0.01, sz * (d / 2 - 0.05), 0.1, 0.02, 0.1, '#20262d', 'dark', true))), box(0, top - 0.06, d / 2 - 0.0006, w - 0.02, 0.02, 0.0012, '#f2c200', 'label', true), box(0, top - 0.06, -d / 2 + 0.0006, w - 0.02, 0.02, 0.0012, '#f2c200', 'label', true),
    box(w / 2 - 0.05, top - 0.07, 0, 0.1, 0.1, d - 0.1, shade(s.color, -0.2), 'dark', true), box(-w / 2 + 0.05, top - 0.07, 0, 0.1, 0.1, d - 0.1, shade(s.color, -0.2), 'dark', true)]; },
  'mesa-trabajo': s => { const [w, h, d] = s.size; return [...[-1, 1].flatMap(sx => [-1, 1].map(sz => cyl(sx * (w / 2 - 0.04), -h / 2 + 0.004, sz * (d / 2 - 0.04), 0.022, 0.008, 'y', '#20262d', 'dark', true))), box(0, -h / 2 + 0.215, d / 2 - 0.06, w - 0.1, 0.05, 0.004, shade(s.color, -0.25), 'dark', true)]; },
  'valla-seguridad': s => { const [w, h, d] = s.size; return [box(w / 2 - 0.03, 0.1, d / 2 + 0.0004, 0.04, 0.12, 0.0008, '#f2c200', 'label', true), box(w / 2 - 0.03, 0.1, d / 2 + 0.0012, 0.03, 0.012, 0.001, DARK, 'dark', true), ...[-1, 1].map(sx => cyl(sx * (w / 2 - 0.03), h / 2 - 0.1, 0, 0.012, 0.02, 'z', METAL, 'metal', true))]; },
};

/** Detalle de los interruptores automáticos: cubrebornes transparentes, indicador de posición y rótulo de características. */
function breakerExtra(s: ShapeDef): Part[] {
  const [w, h, d] = s.size;
  return [glass(box(0, h / 2 - 0.011, d * 0.28, w * 0.9, 0.007, d * 0.38, '#a9bdd3', 'lens', true), 0.4), glass(box(0, -h / 2 + 0.011, d * 0.28, w * 0.9, 0.007, d * 0.38, '#a9bdd3', 'lens', true), 0.4),
    box(0, -h * 0.2, d / 2 + 0.0008, w * 0.8, h * 0.09, 0.0012, WHITE, 'label', true), box(0, h * 0.37, d / 2 + 0.0008, w * 0.8, 0.003, 0.0012, DARK, 'dark', true),
    ...(poleXs(s).length ? poleXs(s) : [0]).map(x => box(x, h * 0.2, d / 2 + 0.0008, Math.min(0.012, w * 0.34), 0.004, 0.0012, '#d62b2b', 'label', true))];
}
/** Pulsadores: aro moleteado y marca I (NA) u O (NC) sobre la cabeza. */
function buttonExtra(s: ShapeDef, mark: 'I' | 'O'): Part[] {
  const [w, h, d] = s.size, r = Math.min(w, h) * 0.34, y = -h * 0.12, z = d * 0.12 + 0.0195;
  return [cyl(0, y, d * 0.12 + 0.003, r * 1.35, 0.003, 'z', shade(METAL, -0.1), 'metal', true), cyl(0, y, d * 0.12 - 0.003, r * 1.5, 0.003, 'z', '#20262d', 'dark', true),
    ...(mark === 'I' ? [box(0, y, z, r * 0.16, r * 0.9, 0.001, WHITE, 'label', true)] : [cyl(0, y, z, r * 0.4, 0.001, 'z', WHITE, 'label', true), cyl(0, y, z + 0.0006, r * 0.26, 0.001, 'z', '#c0392b', 'label', true)])];
}

// Bornes de tierra y de neutro: el cuerpo del borne de paso con su color y una franja que los distingue (amarilla en la tierra, blanca en el neutro)
BUILDERS['borne-tierra'] = s => [...BUILDERS['borne-paso'](s), box(0, -s.size[1] * 0.36, s.size[2] * 0.5 + 0.0006, s.size[0] * 0.8, s.size[1] * 0.1, 0.0012, '#f2c200', 'label', true)];
BUILDERS['borne-neutro'] = s => [...BUILDERS['borne-paso'](s), box(0, -s.size[1] * 0.36, s.size[2] * 0.5 + 0.0006, s.size[0] * 0.8, s.size[1] * 0.1, 0.0012, WHITE, 'label', true)];
ENRICH['borne-tierra'] = ENRICH['borne-paso']; ENRICH['borne-neutro'] = ENRICH['borne-paso'];
// Línea larga: la misma cinta, más larga (patas cada ~1,8 m). Piso de nave: losa lisa con juntas de dilatación, sin franjas de color (las pone la nave).
BUILDERS['cinta-larga'] = BUILDERS['cinta-transportadora']; ENRICH['cinta-larga'] = ENRICH['cinta-transportadora'];
BUILDERS['piso-nave'] = s => { const [w, h, d] = s.size, y = h / 2 - 0.0004, joint = shade(s.color, -0.22), out: Part[] = [box(0, 0, 0, w, h, d, s.color, 'body'), box(0, h / 2 - 0.002, 0, w, 0.004, d, shade(s.color, 0.06), 'front')];
  for (let x = -w / 2 + 3.5; x < w / 2 - 0.5; x += 3.5) out.push(box(x, y, 0, 0.03, 0.001, d, joint, 'dark', true));
  for (let z = -d / 2 + 4; z < d / 2 - 0.5; z += 4) out.push(box(0, y, z, w, 0.001, 0.03, joint, 'dark', true));
  return out; };

/** Mandos de panel en la puerta de un gabinete: aro y cabeza redondos por fuera, tuerca de fijación y bloque de contactos por dentro. */
const DOOR_OPERATORS = new Set(['pulsador-na', 'pulsador-nc', 'piloto']);
function doorOperator(s: ShapeDef): Part[] {
  // El plano de la puerta está en z = 0,035 del mando (el ancla «agujero»): por delante asoma el frente, por detrás quedan la tuerca, el bloque de contactos y los terminales.
  const Z = 0.035, out: Part[] = [cyl(0, 0, Z + 0.0015, 0.0165, 0.003, 'z', shade(METAL, -0.2), 'metal'), cyl(0, 0, Z - 0.0055, 0.0165, 0.004, 'z', '#20262d', 'dark', true), box(0, 0, Z - 0.0215, 0.03, 0.04, 0.026, '#2a2f36', 'body'), box(0, 0, Z - 0.0345, 0.026, 0.036, 0.002, '#3a424d', 'dark', true)];
  if (s.id === 'piloto') out.push(ball(0, 0, Z + 0.0035, 0.0125, s.color, 'lens'), ball(-0.004, 0.004, Z + 0.0135, 0.0025, WHITE, 'label', true));
  else { out.push(cyl(0, 0, Z + 0.009, 0.0125, 0.011, 'z', s.id === 'pulsador-na' ? '#2f9e5b' : '#c0392b', 'trim')); if (s.id === 'pulsador-na') out.push(box(0, 0, Z + 0.0146, 0.002, 0.011, 0.001, WHITE, 'label', true)); else out.push(cyl(0, 0, Z + 0.0146, 0.0052, 0.001, 'z', WHITE, 'label', true)); }
  return [...out, ...screws(s)];
}

/** Primitivas de una pieza en el sistema local del origen de su pose (ya desplazadas al centro de la caja del catálogo). */
export function modelParts(definitionId: string, detail: Detail = 'high', variant: Variant = 'din'): Part[] {
  const shape = shapeOf(definitionId), build = BUILDERS[definitionId];
  const parts0 = variant === 'door' && DOOR_OPERATORS.has(definitionId) ? doorOperator(shape) : build ? [...build(shape), ...(ENRICH[definitionId]?.(shape) ?? [])] : [box(0, 0, 0, shape.size[0], shape.size[1], shape.size[2], shape.color, 'body')];
  // Accesorios de la puerta del gabinete (manija, rejillas, ventilador, rótulos): giran con ella; las bisagras, los prensaestopas y las argollas no
  const parts = definitionId === 'gabinete' ? parts0.map(p => (p.tag || (p.shape === 'cyl' && p.axis === 'y') || p.pos[2] <= shape.size[2] / 2 - 0.03 ? p : ({...p, tag: 'doorfit' as const}))) : parts0;
  return parts.filter(p => detail === 'high' || !p.fine).map(p => ({...p, pos: [p.pos[0] + shape.center[0], p.pos[1] + shape.center[1], p.pos[2] + shape.center[2]] as Vec3}));
}

/** Caja que ocupa una primitiva (en el sistema local de la pieza). */
export function partBounds(p: Part): {min: Vec3; max: Vec3} {
  const half: Vec3 = p.shape === 'box' ? [p.size[0] / 2, p.size[1] / 2, p.size[2] / 2]
    : p.shape === 'sphere' ? [p.size[0], p.size[0], p.size[0]]
      : p.axis === 'x' ? [p.size[1] / 2, p.size[0], p.size[0]] : p.axis === 'y' ? [p.size[0], p.size[1] / 2, p.size[0]] : [p.size[0], p.size[0], p.size[1] / 2];
  return {min: [p.pos[0] - half[0], p.pos[1] - half[1], p.pos[2] - half[2]], max: [p.pos[0] + half[0], p.pos[1] + half[1], p.pos[2] + half[2]]};
}
