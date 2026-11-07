// Enrutado visual de cables (fase 11). Puro: se prueba en Node. Cada cable sale perpendicular a la cara de su terminal, sube hasta una altura de crucero
// por encima de lo que haya en el camino y baja al otro terminal; se elige la primera ruta que no atraviesa ninguna otra pieza (con el grosor del cable).
// Solo presentación: no cambia la topología ni el modelo.
import {add, dot, qRotate, scale, sub} from '../../robotics/project/math.ts';
import {shapeOf} from '../build/shapes.ts';
import {obbOfEntity} from '../build/snap.ts';
import type {Connection, IndustryProject, TerminalRef, Vec3} from '../model/types.ts';
import {terminalDef, terminalWorld} from './engine.ts';
import {toTransform} from '../build/snap.ts';

export const CABLE_RADIUS = 0.0017; // m (≈ 3,4 mm de diámetro, de ejemplo)
const STUB = 0.026;
const LIFTS = [0.03, 0.06, 0.1, 0.16, 0.24, 0.36, 0.55];
const SIDE = [0.12, -0.12, 0.3, -0.3, 0.6, -0.6, 1.0, -1.0];
const HIGH = [0.9, 1.4, 2.2];

type Obb = NonNullable<ReturnType<typeof obbOfEntity>> & {radius: number};

/** Normal (en el mundo) de la cara de la pieza por la que sale el terminal. */
export function terminalNormal(p: IndustryProject, ref: TerminalRef): Vec3 {
  const e = p.entities.find(x => x.id === ref.entityId), def = e && terminalDef(p, ref), pose = e && p.poses[e.id];
  if (!e || !def || !pose) return [0, 1, 0];
  const s = shapeOf(e.definitionId), local = def.position.map((v, k) => v - s.center[k]) as Vec3;
  let axis = 0, best = -1;
  for (let k = 0; k < 3; k++) { const f = Math.abs(local[k]) / (s.size[k] / 2 || 1); if (f > best) { best = f; axis = k; } }
  const n: Vec3 = [0, 0, 0]; n[axis] = local[axis] >= 0 ? 1 : -1;
  return qRotate(toTransform(pose).rotation, n);
}

function insideObb(o: Obb, q: Vec3): boolean {
  const d = sub(q, o.center);
  return Math.abs(dot(d, o.axes[0])) <= o.half[0] && Math.abs(dot(d, o.axes[1])) <= o.half[1] && Math.abs(dot(d, o.axes[2])) <= o.half[2];
}
/** ¿Algún punto del tramo cae dentro de alguna de las piezas dadas? (muestreo cada 4 mm; el grosor ya va incluido en las cajas) */
export function segmentHits(a: Vec3, b: Vec3, obbs: readonly Obb[]): boolean {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), steps = Math.max(1, Math.ceil(len / 0.004));
  const near = obbs.filter(o => { const lo = [Math.min(a[0], b[0]) - o.radius, Math.min(a[1], b[1]) - o.radius, Math.min(a[2], b[2]) - o.radius], hi = [Math.max(a[0], b[0]) + o.radius, Math.max(a[1], b[1]) + o.radius, Math.max(a[2], b[2]) + o.radius]; return o.center.every((v, k) => v >= lo[k] && v <= hi[k]); });
  if (near.length === 0) return false;
  for (let i = 0; i <= steps; i++) { const t = i / steps, q: Vec3 = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; if (near.some(o => insideObb(o, q))) return true; }
  return false;
}

/** Cajas de todas las piezas, infladas con el grosor del cable. */
export function collisionBoxes(p: IndustryProject): Map<string, Obb> {
  const out = new Map<string, Obb>();
  for (const e of p.entities) { const o = obbOfEntity(p, e.id, undefined, -CABLE_RADIUS); if (o) out.set(e.id, {...o, radius: Math.hypot(...o.half)}); }
  return out;
}

export function routeCable(p: IndustryProject, c: Connection, lane = 0, boxes = collisionBoxes(p)): Vec3[] | null {
  const a = terminalWorld(p, c.a), b = terminalWorld(p, c.b);
  if (!a || !b) return null;
  if (c.route?.length) return [a, ...c.route, b];
  const na = terminalNormal(p, c.a), nb = terminalNormal(p, c.b);
  const a1 = add(a, scale(na, STUB)), b1 = add(b, scale(nb, STUB));
  const others = (skip: string[]) => [...boxes].filter(([id]) => !skip.includes(id)).map(([, o]) => o);
  const all = others([]), exceptA = others([c.a.entityId]), exceptB = others([c.b.entityId]);
  const clear = (path: Vec3[]) => path.every((q, i) => i === 0 || (i === 1 ? !segmentHits(path[0], q, exceptA) : i === path.length - 1 ? !segmentHits(path[i - 1], q, exceptB) : !segmentHits(path[i - 1], q, all)));
  // Puente corto entre terminales vecinos
  const direct: Vec3[] = [a, a1, b1, b];
  if (Math.hypot(b1[0] - a1[0], b1[1] - a1[1], b1[2] - a1[2]) < 0.14 && clear(direct)) return direct;
  const base = Math.max(a1[1], b1[1]);
  let last: Vec3[] = direct;
  for (const lift of LIFTS) {
    const top = base + lift + lane * 0.006;
    const path: Vec3[] = [a, a1, [a1[0], top, a1[2]], [b1[0], top, b1[2]], b1, b];
    last = path; if (clear(path)) return path;
  }
  // Si hay algo muy alto en medio (una placa), se rodea por un lado a poca altura en vez de subir por encima.
  const dx = b1[0] - a1[0], dz = b1[2] - a1[2], len = Math.hypot(dx, dz) || 1, perp: Vec3 = [-dz / len, 0, dx / len];
  for (const off of SIDE) for (const lift of [0.06, 0.16, 0.36]) {
    const top = base + lift + lane * 0.006, o = scale(perp, off);
    const path: Vec3[] = [a, a1, [a1[0], top, a1[2]], [a1[0] + o[0], top, a1[2] + o[2]], [b1[0] + o[0], top, b1[2] + o[2]], [b1[0], top, b1[2]], b1, b];
    if (clear(path)) return path;
  }
  for (const lift of HIGH) {
    const top = base + lift + lane * 0.006, path: Vec3[] = [a, a1, [a1[0], top, a1[2]], [b1[0], top, b1[2]], b1, b];
    last = path; if (clear(path)) return path;
  }
  return last;
}

/** Rutas de todos los cables (se calculan las cajas una sola vez). */
export function routeAll(p: IndustryProject): Map<string, Vec3[]> {
  const boxes = collisionBoxes(p), out = new Map<string, Vec3[]>();
  p.connections.forEach((c, i) => { const r = routeCable(p, c, i % 5, boxes); if (r) out.set(c.id, r); });
  return out;
}
