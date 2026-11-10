import {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import {useThree} from '@react-three/fiber';
import {BufferAttribute, BufferGeometry, Color, DoubleSide, InstancedMesh, Object3D} from 'three';
import {groundDetails} from '../terrain/groundDetails.ts';
import {itemById,sizeOf} from '../catalog/items.ts';
import type {WorldSession} from '../world/session.ts';

/** Pastos, pequeñas piedras y ramas caídas: tres mallas instanciadas sin interacción. */
export function GroundDetails({session}:{session:WorldSession}) {
  const {invalidate}=useThree(), grass=useRef<InstancedMesh>(null),twigs=useRef<InstancedMesh>(null),stones=useRef<InstancedMesh>(null);
  const sig=session.entities.map(e=>`${e.type}:${e.pose.position[0]}:${e.pose.position[2]}:${JSON.stringify(e.params)}`).join('|');
  const revision=session.terrain.versions.join(',');
  const detail=useMemo(()=>groundDetails(session.terrain.hf,session.site,session.entities.map(e=>{
    const def=itemById(e.type),[w,,d]=def?sizeOf(def,e.params):[2,0,2];return {x:e.pose.position[0],z:e.pose.position[2],r:Math.hypot(w,d)/2+1};
  })),[session,sig,revision]); // eslint-disable-line react-hooks/exhaustive-deps
  const blades=useMemo(()=>{
    const vertices:number[]=[];
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3,dx=Math.cos(a),dz=Math.sin(a),bx=Math.cos(a+1.57)*0.045,bz=Math.sin(a+1.57)*0.045;
      vertices.push(-bx,0,-bz,bx,0,bz,dx*0.15,0.28+(i%3)*0.08,dz*0.15);
    }
    const g=new BufferGeometry();g.setAttribute('position',new BufferAttribute(new Float32Array(vertices),3));g.computeVertexNormals();return g;
  },[]);
  useEffect(()=>()=>blades.dispose(),[blades]);
  useLayoutEffect(()=>{
    const object=new Object3D(),color=new Color(),arid=session.terrain.presetId==='desierto'||session.terrain.presetId==='oasis-norte';
    const setup=(mesh:InstancedMesh|null,list:typeof detail.grass,kind:'grass'|'twig'|'stone')=>{
      if(!mesh)return;
      list.forEach((p,i)=>{
        object.position.set(p.x,p.y+(kind==='stone'?0.035:kind==='twig'?0.035:0.02),p.z);
        object.rotation.set(kind==='twig'?Math.PI/2:0,p.yaw,kind==='twig'?p.yaw:0);
        if(kind==='grass') object.scale.set(p.scale*(0.75+p.tone*0.55),p.scale*(0.65+p.tone*0.85),p.scale*(0.75+p.tone*0.55));
        else object.scale.setScalar(p.scale);
        object.updateMatrix();mesh.setMatrixAt(i,object.matrix);
        const palette=kind==='grass'?(arid?['#b4a267','#9b8e55','#c1ad76']:['#68864a','#819352','#536f40','#a49d64']):kind==='twig'?['#695442','#8a7154','#594c3b']:['#aaa08a','#81796b','#b6aa91'];
        mesh.setColorAt(i,color.set(palette[Math.floor(p.tone*palette.length)%palette.length]));
      });
      mesh.count=list.length;mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;mesh.computeBoundingSphere();
    };
    setup(grass.current,detail.grass,'grass');setup(twigs.current,detail.twigs,'twig');setup(stones.current,detail.stones,'stone');invalidate();
  },[detail,invalidate,session]);
  const noRaycast=()=>null;
  return <group name="detalle natural del suelo">
    <instancedMesh key={`grass-${detail.grass.length}`} ref={grass} args={[blades,undefined,Math.max(1,detail.grass.length)]} raycast={noRaycast} frustumCulled={false}><meshStandardMaterial color="#ffffff" roughness={1} side={DoubleSide}/></instancedMesh>
    <instancedMesh key={`twigs-${detail.twigs.length}`} ref={twigs} args={[undefined,undefined,Math.max(1,detail.twigs.length)]} raycast={noRaycast} frustumCulled={false}><cylinderGeometry args={[0.025,0.04,0.75,5]}/><meshStandardMaterial color="#ffffff" roughness={1}/></instancedMesh>
    <instancedMesh key={`stones-${detail.stones.length}`} ref={stones} args={[undefined,undefined,Math.max(1,detail.stones.length)]} raycast={noRaycast} frustumCulled={false}><dodecahedronGeometry args={[0.1,0]}/><meshStandardMaterial color="#ffffff" roughness={1} flatShading/></instancedMesh>
  </group>;
}
