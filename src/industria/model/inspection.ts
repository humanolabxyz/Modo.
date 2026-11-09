import {add, qRotate, tInv, tPoint} from '../../robotics/project/math.ts';
import {shapeOf} from '../build/shapes.ts';
import {toTransform} from '../build/snap.ts';
import type {Entity, IndustryProject, Vec3} from './types.ts';
import type {CameraState} from './ui.ts';

export function containerOf(project: IndustryProject, id: string, definitionId: 'gabinete' | 'sala-electrica'): Entity | undefined {
  const entities = project.entities;
  const pose = project.poses[id];
  if (!pose) return;
  const parents = new Map(project.mounts.map(m => [m.child.entityId, m.parent.entityId]));
  for (let parent = parents.get(id); parent; parent = parents.get(parent)) {
    const entity = entities.find(e => e.id === parent);
    if (entity?.definitionId === definitionId) return entity;
  }
  // Los proyectos anteriores sitúan la placa y el gabinete por coordenadas.
  const point = tPoint(toTransform(pose), shapeOf(entities.find(e => e.id === id)?.definitionId ?? '').center);
  return entities.filter(e => e.id !== id && e.definitionId === definitionId && project.poses[e.id])
    .map(e => {
      const shape = shapeOf(e.definitionId);
      const local = tPoint(tInv(toTransform(project.poses[e.id])), point);
      const offset = local.map((v, i) => Math.abs(v - shape.center[i]));
      return {entity: e, inside: offset.every((v, i) => v <= shape.size[i] / 2 + 0.02), distance: Math.hypot(...offset)};
    })
    .filter(candidate => candidate.inside)
    .sort((a, b) => a.distance - b.distance)[0]?.entity;
}

export function inspectionCamera(project: IndustryProject, entity: Entity, detail = false, aspect = 1): CameraState {
  const pose = toTransform(project.poses[entity.id]);
  const {center, size} = shapeOf(entity.definitionId);
  const openCabinet = detail && entity.definitionId === 'gabinete';
  const distance = Math.max(0.65, Math.max(size[0], size[1], size[2]) * (openCabinet ? 1.55 : detail ? 1.25 : 1.8)) * Math.max(1, 0.72 / Math.max(0.2, aspect));
  const offset: Vec3 = [distance * 0.28, distance * 0.38, distance];
  const target = tPoint(pose, openCabinet ? [center[0] - 0.09, center[1], center[2] + 0.1] : center);
  return {target, position: add(target, qRotate(pose.rotation, offset))};
}

export function overviewCamera(project: IndustryProject): CameraState {
  const positions = Object.values(project.poses).map(p => p.position);
  if (!positions.length) return {target: [0, 0.8, 0], position: [6, 5, 7]};
  const xs = positions.map(p => p[0]), zs = positions.map(p => p[2]);
  const target: Vec3 = [(Math.min(...xs) + Math.max(...xs)) / 2, 0.8, (Math.min(...zs) + Math.max(...zs)) / 2];
  const extent = Math.max(4, Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs));
  return {target, position: add(target, [extent * 0.72, extent * 0.85, extent * 0.95])};
}
