// Geometría de montaje de Industria: poses en mundo, candidatos de anclaje con vista previa alineada, deslizamiento, interferencias y movimiento de grupos.
// Puro (sin React ni three). Reutiliza la matemática de transformaciones de Robótica (cuaterniones) en lugar de duplicarla.
import {add, cross, dot, len, qFromAxisAngle, qFromEuler, qMul, qNorm, qRotate, qToEuler, scale, sub, tInv, tMul, tPoint} from '../../robotics/project/math.ts';
import type {Quat, Transform} from '../../robotics/project/types.ts';
import {hasMountCycle} from '../model/validate.ts';
import type {IndustryProject, Mount, Pose, Vec3} from '../model/types.ts';
import {anchorOf, shapeOf, type AnchorDef} from './shapes.ts';

export const SNAP_RANGE = 0.12; // m
export const GRID_STEP = 0.05; // m (rejilla del «Imán»)
export const SLIDE_STEP = 0.005; // m (paso al deslizar sobre un riel o una cara)
export const MOUNT_TOLERANCE = 0.002; // m

const unit = (v: Vec3): Vec3 => { const n = len(v) || 1; return [v[0] / n, v[1] / n, v[2] / n]; };
export const toTransform = (pose: Pose): Transform => ({position: pose.position, rotation: qFromEuler(pose.rotation)});
export const toPose = (t: Transform): Pose => ({position: t.position.map(round) as Vec3, rotation: qToEuler(t.rotation).map(round) as Vec3});
const round = (v: number) => Math.round(v * 1e6) / 1e6;

/** Rotación mínima que lleva `from` hasta `to` (vectores unitarios). */
function arc(from: Vec3, to: Vec3): Quat {
  const d = dot(from, to);
  if (d > 1 - 1e-9) return [0, 0, 0, 1];
  if (d < -1 + 1e-9) {
    const probe: Vec3 = Math.abs(from[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    return qFromAxisAngle(unit(cross(from, probe)), Math.PI);
  }
  const c = cross(from, to);
  return qNorm([c[0], c[1], c[2], 1 + d]);
}

/** Eje de referencia de giro por defecto: perpendicular a la normal y estable (para normales verticales, el eje X). */
const defaultUp = (normal: Vec3): Vec3 => (Math.abs(normal[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0]);

export type AnchorWorld = {position: Vec3; normal: Vec3; up: Vec3};
export function anchorWorld(pose: Pose, anchor: AnchorDef): AnchorWorld {
  const t = toTransform(pose), n = unit(anchor.normal);
  return {position: tPoint(t, anchor.position), normal: qRotate(t.rotation, n), up: qRotate(t.rotation, anchor.up ? unit(anchor.up) : defaultUp(n))};
}

export type SnapCandidate = {
  parent: {entityId: string; anchorId: string};
  child: {entityId: string; anchorId: string};
  kind: AnchorDef['kind'];
  /** Distancia (m) entre el anclaje del hijo en su pose actual y el punto de acople. */
  distance: number;
  /** Pose del hijo ya alineada (posición y rotación): es la vista previa translúcida. */
  pose: Pose;
  /** Punto de acople en mundo. */
  point: Vec3;
};

const entityOf = (p: IndustryProject, id: string) => p.entities.find(e => e.id === id);

/** Entidades que cuelgan (directa o indirectamente) de `id`, sin incluirla. */
export function descendantsOf(p: Pick<IndustryProject, 'mounts'>, id: string): string[] {
  const out: string[] = [], seen = new Set([id]), queue = [id];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const m of p.mounts) if (m.parent.entityId === cur && !seen.has(m.child.entityId)) { seen.add(m.child.entityId); out.push(m.child.entityId); queue.push(m.child.entityId); }
  }
  return out;
}
export const parentMountOf = (p: Pick<IndustryProject, 'mounts'>, id: string): Mount | undefined => p.mounts.find(m => m.child.entityId === id);

/** Alinea el anclaje `child` de una pieza con el anclaje `host` (pose del anfitrión fija). Gira lo mínimo, ajusta el giro a múltiplos de 90° y desliza dentro de los límites. */
function alignTo(childPose: Pose, child: AnchorDef, hostPose: Pose, host: AnchorDef, step: number): {pose: Pose; point: Vec3; distance: number} {
  const hw = anchorWorld(hostPose, host), target = scale(hw.normal, -1);
  const cT = toTransform(childPose), cn = unit(child.normal);
  // 1) La normal del hijo debe quedar opuesta a la del anfitrión.
  let q = qNorm(qMul(arc(qRotate(cT.rotation, cn), target), cT.rotation));
  // 2) Giro alrededor de la normal: el «arriba» del hijo coincide con el del anfitrión salvo múltiplos de 90° (el más cercano).
  const upChild = qRotate(q, child.up ? unit(child.up) : defaultUp(cn));
  const flat = (v: Vec3): Vec3 => unit(sub(v, scale(target, dot(v, target))));
  const a = flat(upChild), b = flat(hw.up);
  const angle = Math.atan2(dot(cross(a, b), target), dot(a, b));
  const twist = angle - Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
  q = qNorm(qMul(qFromAxisAngle(target, twist), q));
  // 3) Posición: coincidir los puntos de anclaje; si el anfitrión permite deslizar, se proyecta y se recorta.
  const hostT = toTransform(hostPose);
  let point = hw.position;
  const where = add(cT.position, qRotate(q, child.position));
  if (host.slide) {
    const delta = sub(where, hw.position);
    host.slide.axes.forEach((axis, i) => {
      const w = qRotate(hostT.rotation, unit(axis)), [lo, hi] = host.slide!.limits[i];
      const s = Math.min(hi, Math.max(lo, Math.round(dot(delta, w) / step) * step));
      point = add(point, scale(w, s));
    });
  }
  const position = sub(point, qRotate(q, child.position));
  return {pose: toPose({position, rotation: q}), point, distance: len(sub(where, point))};
}

export type SnapOptions = {range?: number; step?: number};

/** Candidatos de anclaje para `entityId` (como hijo) en su pose actual o propuesta, del más cercano al más lejano. */
export function findSnapCandidates(p: IndustryProject, entityId: string, pose?: Pose, options: SnapOptions = {}): SnapCandidate[] {
  const me = entityOf(p, entityId);
  if (!me || me.locked || parentMountOf(p, entityId)) return [];
  const range = options.range ?? SNAP_RANGE, step = options.step ?? SLIDE_STEP;
  const mine = pose ?? p.poses[entityId];
  if (!mine) return [];
  const below = new Set(descendantsOf(p, entityId));
  const out: SnapCandidate[] = [];
  for (const child of shapeOf(me.definitionId).anchors) {
    if (child.role !== 'child') continue;
    for (const host of p.entities) {
      if (host.id === entityId || below.has(host.id)) continue;
      const hostPose = p.poses[host.id];
      if (!hostPose) continue;
      for (const anchor of shapeOf(host.definitionId).anchors) {
        if (anchor.role !== 'host' || anchor.kind !== child.kind) continue;
        if (!anchor.multi && p.mounts.some(m => m.parent.entityId === host.id && m.parent.anchorId === anchor.id)) continue;
        const aligned = alignTo(mine, child, hostPose, anchor, step);
        if (aligned.distance > range) continue;
        const next: Mount = {id: 'probe', kind: child.kind, parent: {entityId: host.id, anchorId: anchor.id}, child: {entityId, anchorId: child.id}};
        if (hasMountCycle([...p.mounts, next])) continue;
        out.push({parent: next.parent, child: next.child, kind: child.kind, distance: aligned.distance, pose: aligned.pose, point: aligned.point});
      }
    }
  }
  return out.sort((x, y) => x.distance - y.distance);
}

/** Mueve una pieza raíz y todo lo que cuelga de ella como un cuerpo rígido. */
export function movedPoses(p: IndustryProject, id: string, pose: Pose): Record<string, Pose> {
  const before = toTransform(p.poses[id]), after = toTransform(pose);
  const delta = tMul(after, tInv(before));
  const poses = {...p.poses, [id]: toPose(after)};
  for (const d of descendantsOf(p, id)) if (p.poses[d]) poses[d] = toPose(tMul(delta, toTransform(p.poses[d])));
  return poses;
}

export const snapToGrid = (v: Vec3, step = GRID_STEP): Vec3 => v.map(x => round(Math.round(x / step) * step)) as Vec3;

type Obb = {center: Vec3; axes: [Vec3, Vec3, Vec3]; half: Vec3};
/** Caja orientada de una entidad. */
export function obbOfEntity(p: IndustryProject, id: string, pose = p.poses[id], shrink = 0.0005): Obb | null {
  const e = entityOf(p, id);
  if (!e || !pose) return null;
  const s = shapeOf(e.definitionId), t = toTransform(pose), q = t.rotation;
  return {center: tPoint(t, s.center), axes: [qRotate(q, [1, 0, 0]), qRotate(q, [0, 1, 0]), qRotate(q, [0, 0, 1])], half: s.size.map(v => Math.max(0, v / 2 - shrink)) as Vec3};
}

// Se duplica el teorema del eje separador de Robótica (interference.ts) a propósito: importarlo arrastraría su catálogo de piezas al paquete de Industria.
export function obbIntersect(a: Obb, b: Obb): boolean {
  const t = sub(b.center, a.center);
  const radius = (o: Obb, axis: Vec3) => o.half[0] * Math.abs(dot(o.axes[0], axis)) + o.half[1] * Math.abs(dot(o.axes[1], axis)) + o.half[2] * Math.abs(dot(o.axes[2], axis));
  const axes: Vec3[] = [...a.axes, ...b.axes];
  for (const x of a.axes) for (const y of b.axes) { const c = cross(x, y); if (len(c) > 1e-9) axes.push(unit(c)); }
  return axes.every(axis => Math.abs(dot(t, axis)) <= radius(a, axis) + radius(b, axis));
}

/** Entidades que se atraviesan con `id` en `pose`. Las unidas por un montaje directo (o la misma cadena que se mueve) no cuentan. */
export function overlapsOf(p: IndustryProject, id: string, pose = p.poses[id]): string[] {
  const mine = obbOfEntity(p, id, pose);
  if (!mine) return [];
  const together = new Set([id, ...descendantsOf(p, id)]);
  const direct = new Set(p.mounts.filter(m => m.parent.entityId === id || m.child.entityId === id).flatMap(m => [m.parent.entityId, m.child.entityId]));
  return p.entities.filter(e => !together.has(e.id) && !direct.has(e.id)).filter(e => { const other = obbOfEntity(p, e.id); return other ? obbIntersect(mine, other) : false; }).map(e => e.id);
}

/** Comprueba que cada montaje sigue coincidiendo con la geometría (un hijo no debe quedar suelto en el aire tras mover al padre sin él). */
export function mountProblems(p: IndustryProject): string[] {
  const out: string[] = [];
  for (const m of p.mounts) {
    const pe = entityOf(p, m.parent.entityId), ce = entityOf(p, m.child.entityId);
    const pa = pe && anchorOf(pe.definitionId, m.parent.anchorId), ca = ce && anchorOf(ce.definitionId, m.child.anchorId);
    const pp = p.poses[m.parent.entityId], cp = p.poses[m.child.entityId];
    if (!pe || !ce || !pa || !ca || !pp || !cp) { out.push(`${m.id}: faltan datos geométricos del montaje`); continue; }
    const aligned = alignTo(cp, ca, pp, pa, SLIDE_STEP);
    const hw = anchorWorld(pp, pa), cw = anchorWorld(cp, ca);
    if (aligned.distance > MOUNT_TOLERANCE || dot(hw.normal, cw.normal) > -0.999) out.push(`${m.id}: ${ce.label} ya no coincide con ${pe.label}`);
  }
  return out;
}
