import {insidePolygon, pathSample, segmentSample, segmentsCross, type Point2} from './geometry.ts';
import type {TerrainEdit} from '../model/types.ts';

/** Red rural base: un anillo alrededor del predio y tres accesos al borde del mapa. */
export function ruralRoads(sizeX: number, sizeZ: number, site: readonly [number, number]): TerrainEdit[] {
  const [x, z] = site, halfX = sizeX / 2, halfZ = sizeZ / 2, r = Math.min(120, halfX / 3, halfZ / 3);
  const west = Math.max(-halfX + 2, x - r), east = Math.min(halfX - 2, x + r);
  const north = Math.max(-halfZ + 2, z - r), south = Math.min(halfZ - 2, z + r);
  const paths: Point2[][] = [
    [[west,north],[x,north-5],[east,north],[east+5,z],[east,south],[x,south+5],[west,south],[west-5,z],[west,north]],
    [[-halfX+2,z-15],[west-5,z]],
    [[x-15,-halfZ+2],[x,north-5]],
    [[x+15,halfZ-2],[x,south+5]],
  ];
  return paths.map((points, i) => ({id:`rural-base-${i}`,kind:'road',center:[x,z],radius:Math.max(sizeX,sizeZ),amount:1,at:0,points,width:i===0?6:5}));
}

/** La franja completa de cada camino editado queda reservada para circulación. */
export function roadContains(edits: readonly TerrainEdit[] | undefined, x: number, z: number, margin = 0): boolean {
  return !!edits?.some(e => e.kind === 'road' && e.points && e.width && pathSample([x, z], e.points).distance < e.width / 2 + margin);
}

/** Acerca los puntos a la vía existente para facilitar cruces y conexiones. */
export function snapToRoad(edits: readonly TerrainEdit[], point: Point2, distance = 10): Point2 {
  let best = distance, result: Point2 = point;
  for (const road of edits) {
    if (road.kind !== 'road' || !road.points) continue;
    for (let i=1; i<road.points.length; i++) {
      const a=road.points[i-1], b=road.points[i], q=segmentSample(point,a,b);
      if(q.distance < best) {best=q.distance; result=[a[0]+(b[0]-a[0])*q.t,a[1]+(b[1]-a[1])*q.t];}
    }
  }
  return result;
}

export function roadOverlapsPolygon(edit: TerrainEdit, polygon: readonly Point2[]): boolean {
  if (edit.kind !== 'road' || !edit.points || !edit.width) return false;
  const radius = edit.width / 2;
  for (let i = 1; i < edit.points.length; i++) {
    const a = edit.points[i - 1], b = edit.points[i];
    if (insidePolygon(a, polygon) || insidePolygon(b, polygon)) return true;
    for (let j = 0; j < polygon.length; j++) {
      const c = polygon[j], d = polygon[(j + 1) % polygon.length];
      if (segmentsCross(a, b, c, d) || segmentSample(c, a, b).distance < radius || segmentSample(a, c, d).distance < radius || segmentSample(b, c, d).distance < radius) return true;
    }
  }
  return false;
}
