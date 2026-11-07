// Entorno de nave industrial (fase 14). Puro (sin three ni React): lista de primitivas que el escenario dibuja alrededor de la planta para que parezca una
// empresa real: suelo de hormigón con franjas, paredes con zócalo, ventanas y portones, columnas de acero, cerchas con lámparas, bandeja de cables, tubería de aire,
// estanterías con palets y señalética. Es decorado: no es parte del modelo, no se guarda y no interfiere con el montaje ni los cables.
// Las medidas son de ejemplo (una nave genérica), no de una instalación real.
import type {Vec3} from '../model/types.ts';

export type HallPart = {shape: 'box' | 'cyl'; pos: Vec3; size: Vec3; axis?: 'x' | 'y' | 'z'; color: string; emissive?: string; opacity?: number; kind: 'floor' | 'mark' | 'wall' | 'glass' | 'door' | 'steel' | 'lamp' | 'prop' | 'sign'};
export type HallBounds = {cx: number; cz: number; w: number; d: number; h: number};

export const HALL_HEIGHT = 5.5;
const MARGIN = 4.5, MIN_W = 24, MIN_D = 16;

/** Tamaño de la nave: cubre toda la planta con un margen de paso, con un mínimo para que se sienta amplia. */
export function hallBounds(positions: readonly Vec3[]): HallBounds {
  if (!positions.length) return {cx: 0, cz: 0, w: MIN_W, d: MIN_D, h: HALL_HEIGHT};
  const xs = positions.map(p => p[0]), zs = positions.map(p => p[2]), x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
  return {cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, w: Math.min(80, Math.max(MIN_W, x1 - x0 + MARGIN * 2 + 3)), d: Math.min(60, Math.max(MIN_D, z1 - z0 + MARGIN * 2 + 3)), h: HALL_HEIGHT};
}

const box = (x: number, y: number, z: number, w: number, h: number, d: number, color: string, kind: HallPart['kind'], extra: Partial<HallPart> = {}): HallPart => ({shape: 'box', pos: [x, y, z], size: [w, h, d], color, kind, ...extra});
const cyl = (x: number, y: number, z: number, r: number, len: number, axis: 'x' | 'y' | 'z', color: string, kind: HallPart['kind'], extra: Partial<HallPart> = {}): HallPart => ({shape: 'cyl', pos: [x, y, z], size: [r, len, 0], axis, color, kind, ...extra});

const FLOOR_Y = -0.056; // justo bajo el piso de planta (que sube hasta y = 0)
const WALL = '#e3e6eb', BAND = '#35496b', STEEL = '#7a8696', YELLOW = '#f2c200', GREEN = '#2f9e5b';

/** Todas las primitivas de la nave, centradas en (cx, cz). */
export function hallParts(b: HallBounds): HallPart[] {
  const {cx, cz, w, d, h} = b, x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2, out: HallPart[] = [];
  const t = 0.12; // grosor visible de pared
  // Suelo de hormigón con juntas, franja amarilla de la zona de trabajo y pasillo verde
  out.push(box(cx, FLOOR_Y - 0.02, cz, w, 0.04, d, '#b4bac3', 'floor'));
  for (let x = x0 + 4; x < x1 - 0.5; x += 4) out.push(box(x, FLOOR_Y + 0.0012, cz, 0.03, 0.002, d, '#9aa1ac', 'mark'));
  for (let z = z0 + 4; z < z1 - 0.5; z += 4) out.push(box(cx, FLOOR_Y + 0.0012, z, w, 0.002, 0.03, '#9aa1ac', 'mark'));
  const m = 1.6, ix0 = x0 + m, ix1 = x1 - m, iz0 = z0 + m, iz1 = z1 - m; // pasillo perimetral
  out.push(box(cx, FLOOR_Y + 0.002, iz0, ix1 - ix0 + 0.2, 0.003, 0.14, YELLOW, 'mark'), box(cx, FLOOR_Y + 0.002, iz1, ix1 - ix0 + 0.2, 0.003, 0.14, YELLOW, 'mark'), box(ix0, FLOOR_Y + 0.002, cz, 0.14, 0.003, iz1 - iz0, YELLOW, 'mark'), box(ix1, FLOOR_Y + 0.002, cz, 0.14, 0.003, iz1 - iz0, YELLOW, 'mark'));
  out.push(box(cx, FLOOR_Y + 0.0025, z1 - 0.8, w - 3.4, 0.003, 0.7, GREEN, 'mark', {opacity: 0.85}));
  // Paredes (planos finos), zócalo azul, y cenefa superior
  const wall = (x: number, z: number, ww: number, dd: number) => { out.push(box(x, h / 2, z, ww, h, dd, WALL, 'wall'), box(x, 0.6, z, ww + (dd < ww ? 0.002 : 0.04), 1.2, dd + (dd < ww ? 0.04 : 0.002), BAND, 'wall'), box(x, h - 0.25, z, ww + (dd < ww ? 0.002 : 0.05), 0.5, dd + (dd < ww ? 0.05 : 0.002), '#c5ccd6', 'wall')); };
  wall(cx, z0, w, t); wall(cx, z1, w, t); wall(x0, cz, t, d); wall(x1, cz, t, d);
  // Ventanas corridas en la pared de fondo y en la izquierda
  for (let x = x0 + 2.5; x < x1 - 1.5; x += 3.2) out.push(box(x, 3.5, z0 + 0.07, 2.2, 1.1, 0.04, '#9cc7e6', 'glass', {opacity: 0.55, emissive: '#7fb6e0'}), box(x, 3.5, z0 + 0.085, 2.3, 0.05, 0.03, '#f4f6f8', 'wall'), box(x, 3.5, z0 + 0.085, 0.05, 1.2, 0.03, '#f4f6f8', 'wall'));
  for (let z = z0 + 2.5; z < z1 - 1.5; z += 3.2) out.push(box(x0 + 0.07, 3.5, z, 0.04, 1.1, 2.2, '#9cc7e6', 'glass', {opacity: 0.55, emissive: '#7fb6e0'}), box(x0 + 0.085, 3.5, z, 0.03, 0.05, 2.3, '#f4f6f8', 'wall'), box(x0 + 0.085, 3.5, z, 0.03, 1.2, 0.05, '#f4f6f8', 'wall'));
  // Portón enrollable en la pared derecha y puerta de personal en la de fondo
  out.push(box(x1 - 0.08, 1.7, cz - 1.5, 0.05, 3.4, 4.0, '#8a929e', 'door'), box(x1 - 0.1, 3.5, cz - 1.5, 0.12, 0.22, 4.3, '#2f353d', 'door'));
  for (let y = 0.3; y < 3.4; y += 0.28) out.push(box(x1 - 0.11, y, cz - 1.5, 0.01, 0.012, 4.0, '#6c747f', 'door'));
  out.push(box(x1 - 0.1, 3.9, cz - 1.5, 0.02, 0.2, 1.2, '#e8a317', 'sign'));
  out.push(box(cx - w * 0.3, 1.05, z0 + 0.07, 1.0, 2.1, 0.06, GREEN, 'door'), box(cx - w * 0.3, 2.3, z0 + 0.08, 0.5, 0.18, 0.02, '#f4f6f8', 'sign'));
  // Columnas de acero con protección amarilla y negra en la base
  const cols: [number, number][] = []; for (let x = x0 + 0.4; x <= x1 - 0.3; x += (w - 0.7) / Math.max(2, Math.round(w / 6))) { cols.push([x, z0 + 0.4], [x, z1 - 0.4]); }
  for (const [x, z] of cols) out.push(box(x, h / 2, z, 0.32, h, 0.32, STEEL, 'steel'), box(x, 0.4, z, 0.4, 0.8, 0.4, YELLOW, 'steel'), box(x, 0.4, z, 0.405, 0.12, 0.405, '#1f2329', 'steel'), box(x, 0.65, z, 0.405, 0.12, 0.405, '#1f2329', 'steel'));
  // Cerchas con lámparas colgantes y bandeja de cables / tubería de aire
  for (let x = x0 + 2; x < x1 - 1; x += 4) { out.push(box(x, h - 0.2, cz, 0.18, 0.3, d - 0.3, STEEL, 'steel')); for (let z = z0 + 3; z < z1 - 2; z += 4) out.push(cyl(x, h - 0.9, z, 0.012, 0.9, 'y', '#9aa1ac', 'steel'), box(x, h - 1.4, z, 1.2, 0.08, 0.3, '#f4f6f8', 'lamp', {emissive: '#fff6d6'})); }
  out.push(box(cx, h - 1.9, z0 + 1.0, w - 1.2, 0.08, 0.4, '#8a929e', 'steel'));
  for (let x = x0 + 1; x < x1 - 1; x += 0.5) out.push(box(x, h - 1.9, z0 + 1.0, 0.025, 0.1, 0.42, '#6c747f', 'steel'));
  out.push(cyl(cx, 3.0, z0 + 0.35, 0.06, w - 1, 'x', '#2f7aa8', 'steel'));
  for (let x = x0 + 3; x < x1 - 2; x += 5) out.push(box(x, 3.0, z0 + 0.2, 0.08, 0.12, 0.3, '#46505e', 'steel'));
  // Estanterías con cajas y palets junto a la pared izquierda
  for (let i = 0; i < 3; i++) { const z = z1 - 2.6 - i * 2.6, x = x0 + 0.9; out.push(...rack(x, z)); }
  for (let i = 0; i < 4; i++) out.push(...pallet(x1 - 2.2 - (i % 2) * 1.4, z1 - 1.7 - Math.floor(i / 2) * 1.4, 1 + (i % 3)));
  // Extintor, botiquín y señales
  out.push(cyl(cx + w * 0.2, 0.5, z0 + 0.55, 0.08, 0.5, 'y', '#d62b2b', 'prop'), box(cx + w * 0.2, 1.25, z0 + 0.13, 0.35, 0.35, 0.02, '#d62b2b', 'sign'), box(cx - w * 0.05, 1.7, z0 + 0.13, 0.4, 0.4, 0.02, GREEN, 'sign'), box(cx + w * 0.38, 1.7, z0 + 0.13, 0.45, 0.35, 0.02, '#1d6fb8', 'sign'));
  return out;
}

/** Estantería metálica de tres niveles con cajas (postes azules, travesaños naranjas). */
function rack(x: number, z: number): HallPart[] {
  const out: HallPart[] = [], w = 0.9, l = 2.2;
  for (const dz of [-l / 2, l / 2]) for (const dx of [-w / 2, w / 2]) out.push(box(x + dx, 1.5, z + dz, 0.06, 3.0, 0.06, '#1d6fb8', 'prop'));
  for (const y of [0.4, 1.4, 2.4]) { for (const dx of [-w / 2, w / 2]) out.push(box(x + dx, y, z, 0.05, 0.1, l, '#e8741e', 'prop')); out.push(box(x, y + 0.02, z, w - 0.05, 0.03, l - 0.05, '#c9ced6', 'prop'));
    for (let k = 0; k < 3; k++) out.push(box(x, y + 0.24, z - l / 2 + 0.4 + k * 0.7, 0.7, 0.4, 0.55, k % 2 ? '#c9a26b' : '#b78f55', 'prop')); }
  return out;
}

/** Palet de madera con una pila de cajas (`n` niveles). */
function pallet(x: number, z: number, n: number): HallPart[] {
  const out: HallPart[] = [box(x, 0.08, z, 1.2, 0.04, 0.8, '#b08a54', 'prop')];
  for (const dx of [-0.5, 0, 0.5]) out.push(box(x + dx, 0.03, z, 0.14, 0.06, 0.8, '#9c7843', 'prop'));
  for (let i = 0; i < n; i++) out.push(box(x, 0.1 + 0.32 + i * 0.64, z, 1.1, 0.6, 0.7, i % 2 ? '#c9a26b' : '#b78f55', 'prop'), box(x, 0.1 + 0.32 + i * 0.64, z + 0.351, 0.5, 0.3, 0.004, '#f1f3f6', 'sign'));
  return out;
}

/** ¿Debe dibujarse la nave? Cuando hay un piso de planta en el proyecto (así se activa con la mini fábrica y con cualquier planta que armes con piso). */
export const hasHall = (definitionIds: readonly string[]): boolean => definitionIds.includes('piso-planta');
