// Formas 3D de las piezas del catálogo (fase 11). Puro (sin three ni React): cada pieza es una lista de primitivas en el sistema local de la pieza,
// así se puede probar en Node (que cada forma cabe en la caja del catálogo, tiene un tornillo por terminal y se distingue de las demás).
//
// IMPORTANTE: son las formas reales de cada TIPO de aparato (carril omega, interruptor modular con palanca, contactor, PLC con LED, motor con aletas,
// pulsador con cabezal…), no la réplica de un producto ni de un fabricante. Las medidas siguen siendo las de ejemplo del catálogo genérico.
import {shapeOf, type ShapeDef} from '../build/shapes.ts';
import type {Vec3} from '../model/types.ts';

export type PartRole = 'body' | 'front' | 'trim' | 'metal' | 'screw' | 'lens' | 'led' | 'dark' | 'label';
/** box: size = [ancho, alto, fondo]; cyl: size = [radio, largo, 0] a lo largo de `axis`; sphere: size = [radio, 0, 0]. */
export type Part = {shape: 'box' | 'cyl' | 'sphere'; pos: Vec3; size: Vec3; axis?: 'x' | 'y' | 'z'; color: string; role: PartRole; emissive?: string; /** detalle fino: se omite con muchas piezas en escena */ fine?: boolean};
export type Detail = 'high' | 'low';

const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
/** Aclara (f > 0) u oscurece (f < 0) un color #rrggbb. */
export function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, mix = (c: number) => clamp(f >= 0 ? c + (255 - c) * f : c * (1 + f));
  return '#' + [mix(r), mix(g), mix(b)].map(c => c.toString(16).padStart(2, '0')).join('');
}
const DARK = '#2a3038', METAL = '#c4cad2', WHITE = '#f1f3f6', BRASS = '#b8893b';

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
  ];
}

/** Un tornillo de borne por terminal (cabeza metálica con ranura), mirando hacia fuera de la cara donde está el terminal. */
function screws(shape: ShapeDef): Part[] {
  const out: Part[] = [], top = shape.center[1] + shape.size[1] / 2;
  for (const t of shape.terminals ?? []) {
    const [x, y, z] = [t.position[0] - shape.center[0], t.position[1] - shape.center[1], t.position[2] - shape.center[2]];
    const onTop = Math.abs(t.position[1] - top) < 0.002, r = Math.min(0.0042, Math.max(0.0028, shape.size[0] / 14));
    if (onTop) { out.push(cyl(x, y + 0.002, z, r, 0.004, 'y', METAL, 'screw', true), box(x, y + 0.0042, z, r * 2.2, 0.0008, 0.0009, DARK, 'dark', true)); }
    else { out.push(cyl(x, y, z + 0.002, r, 0.004, 'z', METAL, 'screw', true), box(x, y, z + 0.0042, r * 2.2, 0.0009, 0.0008, DARK, 'dark', true)); }
  }
  return out;
}

const poleXs = (shape: ShapeDef): number[] => (shape.terminals ?? []).filter(t => t.group === 'superior').map(t => t.position[0] - shape.center[0]).sort((a, b) => a - b);

type Builder = (s: ShapeDef) => Part[];
const BUILDERS: Record<string, Builder> = {
  generico: s => { const [w, h, d] = s.size; return [box(0, 0, 0, w, h, d, s.color, 'body'), box(0, h / 2 - 0.004, 0, w * 0.94, 0.008, d * 0.94, shade(s.color, 0.2), 'front', true), box(0, -h / 2 + 0.006, 0, w * 1.0, 0.012, d * 1.0, shade(s.color, -0.2), 'dark', true), ...[-1, 1].flatMap(sx => [-1, 1].map(sz => cyl(sx * (w / 2 - 0.02), h / 2 + 0.001, sz * (d / 2 - 0.02), 0.008, 0.003, 'y', METAL, 'screw', true)))]; },
  placa: s => { const [w, h, d] = s.size; const holes: Part[] = []; for (const sx of [-1, 1]) for (const y of [-h / 2 + 0.05, 0, h / 2 - 0.05]) holes.push(cyl(sx * (w / 2 - 0.04), y, 0, 0.011, d + 0.002, 'z', DARK, 'dark', true)); return [box(0, 0, 0, w, h, d, s.color, 'body'), ...holes]; },
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
      box(0.02, h / 2 - 0.0125 - 0.002, 0, 0.15, 0.025, 0.07, shade(s.color, -0.18), 'trim'), ...screws(s)];
  },
};

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

/** Primitivas de una pieza en el sistema local del origen de su pose (ya desplazadas al centro de la caja del catálogo). */
export function modelParts(definitionId: string, detail: Detail = 'high'): Part[] {
  const shape = shapeOf(definitionId), build = BUILDERS[definitionId];
  const parts = build ? build(shape) : [box(0, 0, 0, shape.size[0], shape.size[1], shape.size[2], shape.color, 'body')];
  return parts.filter(p => detail === 'high' || !p.fine).map(p => ({...p, pos: [p.pos[0] + shape.center[0], p.pos[1] + shape.center[1], p.pos[2] + shape.center[2]] as Vec3}));
}

/** Caja que ocupa una primitiva (en el sistema local de la pieza). */
export function partBounds(p: Part): {min: Vec3; max: Vec3} {
  const half: Vec3 = p.shape === 'box' ? [p.size[0] / 2, p.size[1] / 2, p.size[2] / 2]
    : p.shape === 'sphere' ? [p.size[0], p.size[0], p.size[0]]
      : p.axis === 'x' ? [p.size[1] / 2, p.size[0], p.size[0]] : p.axis === 'y' ? [p.size[0], p.size[1] / 2, p.size[0]] : [p.size[0], p.size[0], p.size[1] / 2];
  return {min: [p.pos[0] - half[0], p.pos[1] - half[1], p.pos[2] - half[2]], max: [p.pos[0] + half[0], p.pos[1] + half[1], p.pos[2] + half[2]]};
}
