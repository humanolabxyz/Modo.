import {useEffect, useMemo, useSyncExternalStore} from 'react';
import {BufferAttribute, BufferGeometry, Color, DoubleSide, type Texture} from 'three';
import {sampleHeight} from '../terrain/heightfield.ts';
import type {WorldSession} from '../world/session.ts';

/** La red se dibuja independientemente del detalle de la malla del terreno. */
export function RuralRoads({session, grain}: {session: WorldSession; grain: Texture}) {
  const version = useSyncExternalStore(session.subscribe.bind(session), () => session.terrain.versions.join(','));
  const geometry = useMemo(() => {
    const hf = session.terrain.hf, vertices: number[] = [], colors: number[] = [], uvs: number[] = [], indices: number[] = [];
    const shades = ['#8a704e','#b49a71','#967b59','#b49a71','#b49a71','#967b59','#b49a71','#8a704e'].map(c => new Color(c));
    for (const road of [...(hf.baseRoads ?? []), ...(hf.surfaceEdits ?? []).filter(e => e.kind === 'road')]) {
      const points = road.points; if (!points || !road.width) continue;
      // Rodadas de un vehículo (~1,5 m entre ruedas), independientes del ancho total de la vía.
      const half = road.width / 2, track = Math.min(0.95, half * 0.7), offsets = [-half,-half*0.86,-track,-track*0.58,track*0.58,track,half*0.86,half];
      for (let j = 1; j < points.length; j++) {
        const a = points[j-1], b = points[j], dx = b[0]-a[0], dz = b[1]-a[1], length = Math.hypot(dx,dz);
        if (!length) continue;
        const steps = Math.max(1, Math.ceil(length / 2)), start = vertices.length / 3;
        for (let i=0; i<=steps; i++) for (let k=0;k<offsets.length;k++) {
          const t=i/steps, x=a[0]+dx*t-dz/length*offsets[k], z=a[1]+dz*t+dx/length*offsets[k];
          vertices.push(x,sampleHeight(hf,x,z)+0.12,z); uvs.push(x/2,z/2); const c=shades[k]; colors.push(c.r,c.g,c.b);
        }
        for(let i=0;i<steps;i++) for(let k=0;k<offsets.length-1;k++) {
          const p=start+i*offsets.length+k, q=p+offsets.length;
          indices.push(p,q,p+1,p+1,q,q+1);
        }
      }
    }
    const g=new BufferGeometry(); g.setAttribute('position',new BufferAttribute(new Float32Array(vertices),3));
    g.setAttribute('color',new BufferAttribute(new Float32Array(colors),3));g.setAttribute('uv',new BufferAttribute(new Float32Array(uvs),2)); g.setIndex(indices); g.computeVertexNormals(); return g;
  }, [session, version]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh name="red de caminos rurales" geometry={geometry} raycast={() => null} frustumCulled={false}>
    <meshStandardMaterial map={grain} vertexColors roughness={1} side={DoubleSide} polygonOffset polygonOffsetFactor={-1} />
  </mesh>;
}
