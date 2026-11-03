import {useEffect, useMemo} from 'react';
import {BufferGeometry, DoubleSide, Float32BufferAttribute} from 'three';
import type {LineTrack} from '../project/types.ts';
/** World-scale ribbon, using the same polyline and width as the sensors. */
export function LineTrackMesh({track}: {track: LineTrack}) {
  const geometry = useMemo(() => {
    const vertices: number[] = [], r = track.width / 2;
    const add = (...p: number[][]) => {for (const v of p) vertices.push(v[0], 0.0015, v[1]);};
    for (let i = 0; i < track.points.length - (track.closed ? 0 : 1); i++) {
      const a = track.points[i], b = track.points[(i + 1) % track.points.length], dx = b[0] - a[0], dz = b[2] - a[2], len = Math.hypot(dx, dz);
      if (!len) continue;
      const nx = -dz / len * r, nz = dx / len * r;
      const al = [a[0] + nx, a[2] + nz], ar = [a[0] - nx, a[2] - nz], bl = [b[0] + nx, b[2] + nz], br = [b[0] - nx, b[2] - nz];
      add(al, ar, bl, ar, br, bl);
    }
    for (const p of track.points) for (let j = 0; j < 12; j++) {
      const a = j * Math.PI / 6, b = (j + 1) * Math.PI / 6;
      add([p[0], p[2]], [p[0] + r * Math.cos(a), p[2] + r * Math.sin(a)], [p[0] + r * Math.cos(b), p[2] + r * Math.sin(b)]);
    }
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(vertices, 3)); g.computeBoundingSphere(); return g;
  }, [track]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} raycast={() => null}><meshBasicMaterial color="#24262a" side={DoubleSide} /></mesh>;
}
