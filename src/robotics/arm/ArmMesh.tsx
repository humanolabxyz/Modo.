import {Suspense} from 'react';
import {useLoader} from '@react-three/fiber';
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';
import type {PartInstance} from '../project/types.ts';
import {tIdentity} from '../project/math.ts';
import {armFrames} from './kinematics.ts';
import {E6_LINKS} from './e6Data.ts';

const URLS=E6_LINKS.map(link=>`/robotics/e6/${link.name}.STL`);
function ManufacturerMeshes({part}:{part:PartInstance}) {
  const geometry=useLoader(STLLoader,URLS);
  const f=armFrames({...part,transform:tIdentity()});
  return <>{f.links.map((t,i)=><mesh key={i} geometry={geometry[i]} position={t.position} quaternion={t.rotation} castShadow receiveShadow><meshStandardMaterial color={i===0?'#d5dadd':i===1||i===4?'#343b43':'#e8ecef'} metalness={.3} roughness={.42}/></mesh>)}</>;
}
export function ArmMesh({part}:{part:PartInstance}) {
  const f=armFrames({...part,transform:tIdentity()}),open=part.props?.gripperOpen!==false;
  return <>
    <Suspense fallback={<mesh><boxGeometry args={[.162,.103,.12]}/><meshStandardMaterial color="#d5dadd"/></mesh>}><ManufacturerMeshes part={part}/>
    <group position={f.tcp.position} quaternion={f.tcp.rotation}>
      <mesh position={[0,0,-.045]}><boxGeometry args={[.055,.025,.025]}/><meshStandardMaterial color="#333d46"/></mesh>
      {[-1,1].map(side=><mesh key={side} position={[side*(open?.035:.020),0,-.012]} castShadow><boxGeometry args={[.005,.022,.045]}/><meshStandardMaterial color="#93a2ae" metalness={.7} roughness={.3}/></mesh>)}
    </group>
    </Suspense>
  </>;
}
