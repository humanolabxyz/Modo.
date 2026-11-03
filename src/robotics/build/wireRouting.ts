import {getDefinition} from '../catalog/index.ts';
import {tInv, tPoint} from '../project/math.ts';
import type {PartInstance, Vec3} from '../project/types.ts';

/** Visual routing around aligned, stacked plates. Electrical endpoints and saved manual routes stay unchanged. */
export function createDeckWireRouter(parts: readonly PartInstance[]): ((a: Vec3, b: Vec3) => Vec3[]) | null {
  const decks = parts.filter(p => p.definitionId === 'chassis-2wd');
  if (decks.length < 2) return null;
  const reference = decks[0], inv = tInv(reference.transform);
  const aligned = decks.map(part => ({part, local: tPoint(inv, part.transform.position)})).filter(({part, local}) => {
    const dot = part.transform.rotation.reduce((n, v, i) => n + v * reference.transform.rotation[i], 0);
    return Math.abs(dot) > 0.999 && Math.hypot(local[0], local[2]) < 0.002;
  }).sort((a, b) => a.local[1] - b.local[1]);
  if (aligned.length < 2 || aligned.at(-1)!.local[1] - aligned[0].local[1] < 0.02) return null;
  const upper = aligned.at(-1)!.part, toLocal = tInv(upper.transform);
  const dimensions = getDefinition(upper.definitionId)!.dimensions, halfY = dimensions[1] / 2, edgeX = dimensions[0] / 2 + 0.015;
  return (a, b) => {
    const x = tPoint(toLocal, a), y = tPoint(toLocal, b);
    const highA = x[1] >= halfY, highB = y[1] >= halfY;
    if (highA && highB) return [];
    if (!highA && !highB) {
      const middle: Vec3 = [(x[0] + y[0]) / 2, Math.min(-halfY - 0.006, Math.max(x[1], y[1]) + 0.006), (x[2] + y[2]) / 2];
      return [tPoint(upper.transform, middle)];
    }
    const high = highA ? x : y, side = high[0] < 0 ? -edgeX : edgeX;
    const way = (p: Vec3, above: boolean): Vec3 => [side, above ? p[1] + 0.006 : Math.min(p[1] + 0.006, -halfY - 0.006), p[2]];
    return [tPoint(upper.transform, way(x, highA)), tPoint(upper.transform, way(y, highB))];
  };
}
