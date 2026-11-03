import type {LineTrack, RobotProject, Vec3} from '../project/types.ts';
export type TrackPreset = 'none' | 'oval' | 'curves' | 'arena';
export function makeLineTrack(preset: Exclude<TrackPreset, 'none'>): LineTrack {
  if (preset === 'arena') return {name: 'Arena minisumo', width: 0.04, closed: true, points: Array.from({length: 96}, (_, i): Vec3 => {const a = i * Math.PI * 2 / 96; return [0.65 * Math.cos(a), 0, 0.65 * Math.sin(a)];})};
  if (preset === 'oval') return {name: 'Circuito ovalado', width: 0.025, closed: true, points: Array.from({length: 96}, (_, i): Vec3 => {const a = i * Math.PI * 2 / 96; return [0.55 * (1 - Math.cos(a)), 0, 0.75 * Math.sin(a)];})};
  return {name: 'Curvas suaves', width: 0.025, closed: false, points: Array.from({length: 81}, (_, i): Vec3 => {const z = i * 0.02; return [0.22 * (1 - Math.cos(z * 3)), 0, z];})};
}
export function distanceToTrack(track: LineTrack, p: Vec3): number {
  let best = Infinity;
  for (let i = 0; i < track.points.length - (track.closed ? 0 : 1); i++) {
    const a = track.points[i], b = track.points[(i + 1) % track.points.length];
    const dx = b[0] - a[0], dz = b[2] - a[2], d2 = dx * dx + dz * dz;
    const t = d2 ? Math.min(1, Math.max(0, ((p[0] - a[0]) * dx + (p[2] - a[2]) * dz) / d2)) : 0;
    best = Math.min(best, Math.hypot(p[0] - a[0] - t * dx, p[2] - a[2] - t * dz));
  }
  return best;
}
export const setLineTrack = (p: RobotProject, preset: TrackPreset): RobotProject => {
  const {lineTrack: _, ...scene} = p.scene;
  return {...p, scene: preset === 'none' ? scene : {...scene, lineTrack: makeLineTrack(preset)}};
};
