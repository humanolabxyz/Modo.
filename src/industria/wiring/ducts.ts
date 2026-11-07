// Canaletas y canales de piso (fase 15). Puro: se prueba en Node. En una instalación real los cables no van sueltos: salen del terminal, entran por la ranura de la
// canaleta más cercana, viajan por dentro y salen por la ranura más cercana al destino. Aquí cada pieza «conductora» aporta un tramo (su eje) y los tramos que se
// tocan forman una red; el cable elige el camino más corto por dentro de esa red. Solo es presentación: no cambia la topología ni el modelo.
import {add, qRotate, scale} from '../../robotics/project/math.ts';
import {shapeOf} from '../build/shapes.ts';
import {toTransform} from '../build/snap.ts';
import type {IndustryProject, Vec3} from '../model/types.ts';

/** Piezas que llevan cables por dentro: eje largo local y normal de montaje local. */
export const DUCT_DEFS: Record<string, {axis: 0 | 1; normal: Vec3}> = {canaleta: {axis: 0, normal: [0, 0, 1]}, 'canaleta-vertical': {axis: 1, normal: [0, 0, 1]}, 'canal-piso': {axis: 0, normal: [0, 1, 0]}};
export const isDuct = (definitionId: string): boolean => definitionId in DUCT_DEFS;
/** Distancia máxima para que dos tramos se consideren unidos (curva o subida entre una canaleta y la siguiente). */
export const JOIN = 0.45;
/** Un terminal solo usa canaleta si hay una a menos de esta distancia. */
export const REACH = 3.2;
const LANE = 0.007;

export type DuctSeg = {id: string; a: Vec3; b: Vec3; perp: Vec3};
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: Vec3): Vec3 => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** Eje de cada canaleta del proyecto en coordenadas del mundo. */
export function ductSegments(p: IndustryProject): DuctSeg[] {
  const out: DuctSeg[] = [];
  for (const e of p.entities) {
    const def = DUCT_DEFS[e.definitionId], pose = p.poses[e.id]; if (!def || !pose) continue;
    const s = shapeOf(e.definitionId), rot = toTransform(pose).rotation, half = s.size[def.axis] / 2, axisLocal: Vec3 = [0, 0, 0]; axisLocal[def.axis] = 1;
    const c = add(pose.position, qRotate(rot, s.center as Vec3)), ax = qRotate(rot, axisLocal), nrm = qRotate(rot, def.normal);
    out.push({id: e.id, a: add(c, scale(ax, -half)), b: add(c, scale(ax, half)), perp: norm(cross(ax, nrm))});
  }
  return out;
}

/** Punto del tramo más cercano a `q` y su posición t (0..1). */
export function project(seg: DuctSeg, q: Vec3): {point: Vec3; t: number; dist: number} {
  const d = sub(seg.b, seg.a), l2 = dot(d, d) || 1e-9, t = Math.max(0, Math.min(1, dot(sub(q, seg.a), d) / l2)), point: Vec3 = [seg.a[0] + d[0] * t, seg.a[1] + d[1] * t, seg.a[2] + d[2] * t];
  return {point, t, dist: len(sub(q, point))};
}

type Node = {p: Vec3; seg: number; t: number};
export type Hit = (a: Vec3, b: Vec3, first: boolean) => boolean;

/** Caminos candidatos del extremo del cable a la canaleta: directo, primero vertical, primero horizontal o rodeando por un lado. */
function approaches(from: Vec3, to: Vec3): Vec3[][] {
  const out: Vec3[][] = [[], [[from[0], to[1], from[2]]], [[to[0], from[1], to[2]]]];
  for (const o of [0.3, -0.3, 0.6, -0.6]) { out.push([[from[0], from[1], from[2] + o], [from[0], to[1], from[2] + o], [to[0], to[1], to[2] + o]]); out.push([[from[0] + o, from[1], from[2]], [from[0] + o, to[1], from[2]], [to[0] + o, to[1], to[2]]]); }
  return out;
}

/** Entrada/salida: la canaleta más cercana a la que se llega sin atravesar piezas. Devuelve el camino exterior y el punto de la canaleta. */
function attach(segs: DuctSeg[], from: Vec3, hits: Hit): {seg: number; point: Vec3; t: number; via: Vec3[]} | null {
  const ranked = segs.map((s, i) => ({i, ...project(s, from)})).filter(r => r.dist <= REACH).sort((a, b) => a.dist - b.dist).slice(0, 4);
  for (const r of ranked) for (const via of approaches(from, r.point)) {
    const path = [from, ...via, r.point];
    if (path.every((q, k) => k === 0 || !hits(path[k - 1], q, k === 1))) return {seg: r.i, point: r.point, t: r.t, via};
  }
  return null;
}

/** Ruta de un cable por dentro de las canaletas: [a, a1, …, entrada, …tramos…, salida, …, b1, b]. null si no hay canaleta alcanzable (el cable va por el aire). */
export function ductRoute(segs: readonly DuctSeg[], a: Vec3, a1: Vec3, b: Vec3, b1: Vec3, lane: number, hitsA: Hit, hitsB: Hit): Vec3[] | null {
  if (!segs.length) return null;
  const enter = attach(segs as DuctSeg[], a1, hitsA), leave = attach(segs as DuctSeg[], b1, hitsB);
  if (!enter || !leave) return null;
  // Nodos: extremos de cada tramo, entrada y salida, y los extremos proyectados sobre los tramos vecinos (uniones en T)
  const nodes: Node[] = []; const push = (p: Vec3, seg: number, t: number) => { nodes.push({p, seg, t}); return nodes.length - 1; };
  segs.forEach((s, i) => { push(s.a, i, 0); push(s.b, i, 1); });
  const entry = push(enter.point, enter.seg, enter.t), exit = push(leave.point, leave.seg, leave.t);
  const base = nodes.length;
  segs.forEach((s, i) => segs.forEach((o, j) => { if (i === j) return; for (const end of [s.a, s.b]) { const pr = project(o, end); if (pr.dist <= JOIN && pr.t > 0.001 && pr.t < 0.999) push(pr.point, j, pr.t); } }));
  void base;
  const adj: [number, number][][] = nodes.map(() => []);
  const link = (u: number, v: number, w: number) => { adj[u].push([v, w]); adj[v].push([u, w]); };
  segs.forEach((_, i) => { const on = nodes.map((n, k) => ({n, k})).filter(x => x.n.seg === i).sort((x, y) => x.n.t - y.n.t); for (let k = 1; k < on.length; k++) link(on[k - 1].k, on[k].k, len(sub(on[k].n.p, on[k - 1].n.p))); });
  for (let u = 0; u < nodes.length; u++) for (let v = u + 1; v < nodes.length; v++) if (nodes[u].seg !== nodes[v].seg) { const d = len(sub(nodes[u].p, nodes[v].p)); if (d <= JOIN) link(u, v, d + 0.05); }
  // Dijkstra
  const dist = nodes.map(() => Infinity), prev = nodes.map(() => -1), done = nodes.map(() => false); dist[entry] = 0;
  for (;;) { let u = -1; for (let k = 0; k < nodes.length; k++) if (!done[k] && dist[k] < Infinity && (u < 0 || dist[k] < dist[u])) u = k; if (u < 0 || u === exit) break; done[u] = true; for (const [v, w] of adj[u]) if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; } }
  if (!Number.isFinite(dist[exit])) return null;
  const chain: number[] = []; for (let k = exit; k >= 0; k = prev[k]) chain.push(k); chain.reverse();
  // Cada cable ocupa su carril dentro de la canaleta
  const off = (n: Node): Vec3 => add(n.p, scale(segs[n.seg].perp, ((lane % 5) - 2) * LANE));
  const inside = chain.map(k => off(nodes[k]));
  const back = [...leave.via].reverse();
  return [a, a1, ...enter.via, ...inside, ...back, b1, b];
}
