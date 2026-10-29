// Interferencia entre piezas por cajas orientadas (OBB, teorema del eje separador) y candidatos de unión. Puro: se prueba en Node.
import {getDefinition} from '../catalog/index.ts';
import {anchorWorld, closure, hosts, anchorOf} from '../project/commands.ts';
import {cross, dist, dot, len, qRotate, sub} from '../project/math.ts';
import type {PartInstance, RobotProject, Vec3} from '../project/types.ts';

export type Obb = {center: Vec3; axes: [Vec3, Vec3, Vec3]; half: Vec3};

/** Caja orientada de una pieza. `shrink` (m) la encoge por cada lado para ignorar piezas que solo se tocan. */
export function obbOf(part: PartInstance, shrink = 0): Obb | null {
  const def = getDefinition(part.definitionId);
  if (!def) return null;
  const q = part.transform.rotation;
  return {center: part.transform.position, axes: [qRotate(q, [1, 0, 0]), qRotate(q, [0, 1, 0]), qRotate(q, [0, 0, 1])], half: [Math.max(0, def.dimensions[0] / 2 - shrink), Math.max(0, def.dimensions[1] / 2 - shrink), Math.max(0, def.dimensions[2] / 2 - shrink)]};
}

/** ¿Se solapan dos cajas orientadas? (SAT con los 15 ejes candidatos). */
export function obbIntersect(a: Obb, b: Obb): boolean {
  const t = sub(b.center, a.center);
  const radius = (o: Obb, axis: Vec3) => o.half[0] * Math.abs(dot(o.axes[0], axis)) + o.half[1] * Math.abs(dot(o.axes[1], axis)) + o.half[2] * Math.abs(dot(o.axes[2], axis));
  const axes: Vec3[] = [...a.axes, ...b.axes];
  for (const x of a.axes) for (const y of b.axes) { const c = cross(x, y); if (len(c) > 1e-9) axes.push(c); }
  for (const axis of axes) if (Math.abs(dot(t, axis)) > radius(a, axis) + radius(b, axis)) return false;
  return true;
}

/** Piezas que se atraviesan sin estar unidas directamente. Las que solo se tocan (menos de 1 mm) no cuentan. */
export function findInterferences(p: RobotProject, shrink = 0.0005): [string, string][] {
  const boxes = p.parts.map(x => ({id: x.instanceId, box: obbOf(x, shrink)}));
  const joined = new Set(p.attachments.flatMap(a => [`${a.parent.instanceId}|${a.child.instanceId}`, `${a.child.instanceId}|${a.parent.instanceId}`]));
  const out: [string, string][] = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (!a.box || !b.box || joined.has(`${a.id}|${b.id}`)) continue;
    if (dist(a.box.center, b.box.center) > len(a.box.half) + len(b.box.half)) continue; // descarte rápido por esferas
    if (obbIntersect(a.box, b.box)) out.push([a.id, b.id]);
  }
  return out;
}

export type JoinCandidate = {parent: {instanceId: string; anchorId: string}; child: {instanceId: string; anchorId: string}; distance: number; point: Vec3};
export const JOIN_RANGE = 0.015; // 15 mm

/**
 * Anclajes compatibles a menos de 15 mm entre una pieza de `ids` y otra que no cuelga de ellas.
 * El anfitrión es el que acepta al otro; el hijo no puede tener ya padre ni el anclaje del padre estar ocupado.
 */
export function findJoinCandidates(p: RobotProject, ids: readonly string[], range = JOIN_RANGE): JoinCandidate[] {
  const mine = new Set(ids);
  const out: JoinCandidate[] = [];
  const occupied = new Set(p.attachments.map(a => `${a.parent.instanceId}:${a.parent.anchorId}`));
  const hasParent = new Set(p.attachments.map(a => a.child.instanceId));
  for (const x of p.parts.filter(q => mine.has(q.instanceId))) {
    const family = closure(p, [x.instanceId]);
    for (const y of p.parts) {
      if (mine.has(y.instanceId) || family.has(y.instanceId) || closure(p, [y.instanceId]).has(x.instanceId)) continue;
      const dx = getDefinition(x.definitionId), dy = getDefinition(y.definitionId);
      if (!dx || !dy) continue;
      for (const ax of dx.anchors) for (const ay of dy.anchors) {
        for (const [pp, pa, cc, ca] of [[x, ax, y, ay], [y, ay, x, ax]] as const) {
          if (!hosts(pa, ca) || hasParent.has(cc.instanceId) || occupied.has(`${pp.instanceId}:${pa.id}`) || !anchorOf(cc, ca.id)) continue;
          const w1 = anchorWorld(pp, pa.id)!.position, w2 = anchorWorld(cc, ca.id)!.position, d = dist(w1, w2);
          if (d <= range) out.push({parent: {instanceId: pp.instanceId, anchorId: pa.id}, child: {instanceId: cc.instanceId, anchorId: ca.id}, distance: d, point: w1});
        }
      }
    }
  }
  return out.sort((a, b) => a.distance - b.distance);
}

export const WORK_AREA = 5; // el área de trabajo es un cuadrado de ±5 m
export type Placement = {ok: boolean; reason?: string; overlaps: string[]};
/** ¿Se puede soltar una pieza nueva aquí? Solo se rechaza lo imposible; si se superpone con otras se avisa pero se permite. */
export function placementCheck(p: RobotProject, definitionId: string, position: Vec3, limit = 200): Placement {
  const def = getDefinition(definitionId);
  if (!def) return {ok: false, reason: 'La pieza no existe en el catálogo.', overlaps: []};
  if (p.parts.length >= limit) return {ok: false, reason: `Ya hay ${limit} piezas, el máximo del proyecto.`, overlaps: []};
  if (Math.abs(position[0]) > WORK_AREA || Math.abs(position[2]) > WORK_AREA) return {ok: false, reason: `Fuera del área de trabajo (±${WORK_AREA} m).`, overlaps: []};
  const box = obbOf({instanceId: 'ghost', definitionId, label: '', transform: {position, rotation: [0, 0, 0, 1]}}, 0.0005)!;
  const overlaps = p.parts.filter(x => { const o = obbOf(x, 0.0005); return !!o && obbIntersect(box, o); }).map(x => x.instanceId);
  return {ok: true, overlaps};
}
