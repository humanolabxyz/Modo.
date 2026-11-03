import {memo, useEffect, useMemo, useRef, useState, type MutableRefObject} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {Line, OrbitControls} from '@react-three/drei';
import {Group, Quaternion, Vector3, type Mesh, type MeshBasicMaterial} from 'three';
import {PartMesh} from '../build/PartMesh';
import {createWheelRouter, ORBIT_PER_HEIGHT, parseNavMode, zoomFactor} from '../interaction/navigation.ts';
import type {PartInstance} from '../project/types.ts';
import type {ArenaFrame, prepareArena} from './model.ts';
import {ARENA_RADIUS} from './model.ts';

export type BattleStatus = 'ready' | 'loading' | 'running' | 'paused' | 'finished' | 'error';
type Live = {frame: ArenaFrame | null; status: BattleStatus; automatic: boolean; reduced: boolean};
const COLORS=['#3a91ff','#ffad43'];
const CAMERA={position:[1.35,1.15,1.55] as [number,number,number],fov:43};
const GL={antialias:true};
function FrameSignal({frame}:{frame:ArenaFrame|null}){const invalidate=useThree(s=>s.invalidate);useEffect(()=>invalidate(),[frame,invalidate]);return null;}

/** Geometry stays mounted once. Only transforms interpolate between the worker's 20 Hz snapshots. */
const Actor=memo(function Actor({part,live}: {part:PartInstance;live:MutableRefObject<Live>}){
  const ref=useRef<Group>(null);
  const local=useMemo(()=>({...part,transform:{position:[0,0,0] as [number,number,number],rotation:[0,0,0,1] as [number,number,number,number]}}),[part]);
  const position=useMemo(()=>new Vector3(),[]),rotation=useMemo(()=>new Quaternion(),[]);
  useFrame((_,dt)=>{
    if(!ref.current)return;
    const pose=live.current.frame?.physics.poses[part.instanceId];
    position.fromArray(pose?.p??part.transform.position);rotation.fromArray(pose?.q??part.transform.rotation);
    const alpha=live.current.reduced||!pose||live.current.status==='paused'?1:1-Math.exp(-Math.min(dt,.1)*22);
    ref.current.position.lerp(position,alpha);ref.current.quaternion.slerp(rotation,alpha);
  });
  return <group ref={ref} position={part.transform.position} quaternion={part.transform.rotation}><PartMesh part={local} selected={false} interfering={false} showPins={false}/></group>;
});

function Director({live,roots}:{live:MutableRefObject<Live>;roots:string[]}){
  const target=useMemo(()=>new Vector3(),[]),desired=useMemo(()=>new Vector3(),[]),look=useMemo(()=>new Vector3(0,.03,0),[]);
  const age=useRef(0),shake=useRef(0),sequence=useRef(0);
  useFrame(({camera,size},dt)=>{
    const {frame,status,automatic,reduced}=live.current;
    if(!automatic||reduced||status==='paused')return;
    age.current+=Math.min(dt,.1);
    const poses=roots.map(id=>frame?.physics.poses[id]?.p).filter(Boolean) as [number,number,number][];
    target.set(0,.035,0);if(poses.length)target.set(poses.reduce((s,p)=>s+p[0],0)/poses.length,.045,poses.reduce((s,p)=>s+p[2],0)/poses.length);
    let angle=.73+Math.sin(age.current*.14)*.16,radius=1.55,height=1.1;
    if(status==='ready'||status==='loading'){angle=age.current*.12+.65;radius=1.8;height=1.25;target.set(0,.025,0);}
    else if(frame?.result){const winner=frame.result.winner,p=winner===null?null:frame.physics.poses[roots[winner]]?.p;if(p)target.set(p[0],.07,p[2]);radius=1.05;height=.7;angle=age.current*.2;}
    else if(frame?.countdown){radius=1.25;height=.95;target.set(0,.04,0);}
    else if(poses.length===2){radius=Math.max(1.15,Math.min(1.7,1+Math.hypot(poses[0][0]-poses[1][0],poses[0][2]-poses[1][2])*.65));height=.88;}
    const impact=frame?.physics.impacts?.at(-1);
    if(impact&&impact.sequence!==sequence.current){sequence.current=impact.sequence;shake.current=.22;}
    shake.current=Math.max(0,shake.current-dt);
    const kick=Math.sin(age.current*85)*shake.current*.025;
    const framing=Math.max(1,Math.min(1.8,size.height/size.width));
    desired.set(target.x+Math.sin(angle)*radius*framing+kick,height*framing,target.z+Math.cos(angle)*radius*framing);
    const alpha=1-Math.exp(-Math.min(dt,.1)*2.7);camera.position.lerp(desired,alpha);look.lerp(target,alpha);camera.lookAt(look);
  });return null;
}

function Energy({live,roots,initial}:{live:MutableRefObject<Live>;roots:string[];initial:ReturnType<typeof prepareArena>}){
  const halos=useRef<(Mesh|null)[]>([]),burst=useRef<Group>(null),sparks=useRef<(Mesh|null)[]>([]),flash=useRef<Mesh>(null);
  const sequence=useRef(0),age=useRef(2),ambient=useRef(0);
  const start=useMemo(()=>new Vector3(),[]);
  useFrame((_,dt)=>{
    const {frame,status,reduced}=live.current;
    if(status!=='paused')ambient.current+=Math.min(dt,.1);
    roots.forEach((id,i)=>{
      const halo=halos.current[i];if(!halo)return;
      const p=frame?.physics.poses[id]?.p??initial.project.parts.find(x=>x.instanceId===id)!.transform.position;
      halo.position.set(p[0],.004,p[2]);
      const edge=Math.hypot(p[0],p[2])>.6,mat=halo.material as MeshBasicMaterial;
      mat.color.set(edge?'#ff4f61':COLORS[i]);mat.opacity=reduced?.7:.6+Math.sin(ambient.current*4)*.12;
    });
    const impact=frame?.physics.impacts?.at(-1);
    if(impact&&impact.sequence!==sequence.current){sequence.current=impact.sequence;age.current=0;start.fromArray(impact.position);}
    if(status!=='paused')age.current+=Math.min(dt,.1);
    if(!burst.current||!flash.current)return;
    burst.current.visible=!reduced&&age.current<.55&&!!frame;
    burst.current.position.copy(start);flash.current.visible=burst.current.visible;
    flash.current.position.set(start.x,.006,start.z);flash.current.scale.setScalar(1+age.current*7);
    (flash.current.material as MeshBasicMaterial).opacity=Math.max(0,.75-age.current*1.6);
    sparks.current.forEach((spark,i)=>{if(!spark)return;const a=i*2.39996,s=.17+(i%5)*.055,t=age.current;spark.position.set(Math.cos(a)*t*s,(.12+(i%4)*.055)*t-.5*t*t,Math.sin(a)*t*s);spark.rotation.set(a,t*9,a);(spark.material as MeshBasicMaterial).opacity=Math.max(0,1-t*1.8);});
  });
  return <>
    {roots.map((id,i)=><mesh ref={el=>{halos.current[i]=el;}} key={id} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.155,.165,48]}/><meshBasicMaterial color={COLORS[i]} transparent opacity={.65} depthWrite={false}/></mesh>)}
    <group ref={burst} visible={false}>{Array.from({length:20},(_,i)=><mesh key={i} ref={el=>{sparks.current[i]=el;}}><boxGeometry args={[.004,.004,.018]}/><meshBasicMaterial color={i%3?'#ffbd64':'#ffffff'} transparent depthWrite={false}/></mesh>)}</group>
    <mesh ref={flash} visible={false} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.025,.031,40]}/><meshBasicMaterial color="#ffb44a" transparent depthWrite={false}/></mesh>
  </>;
}

const Venue=memo(function Venue(){
  return <>
    <color attach="background" args={['#091426']}/><fog attach="fog" args={['#091426',3.5,8]}/>
    <ambientLight intensity={.9}/><hemisphereLight args={['#d7eaff','#182945',1.5]}/><directionalLight position={[2,4,2]} intensity={2.6}/>
    <pointLight position={[-1,.7,-.8]} color="#378fff" intensity={2}/><pointLight position={[1,.7,1]} color="#ffa53a" intensity={1.8}/>
    <mesh position={[0,-.025,0]}><cylinderGeometry args={[ARENA_RADIUS,ARENA_RADIUS,.05,96]}/><meshStandardMaterial color="#eaf1fa" roughness={.7}/></mesh>
    <mesh position={[0,.001,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.69,.75,96]}/><meshStandardMaterial color="#172333" roughness={.8}/></mesh>
    <mesh position={[0,-.032,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.751,.005,8,96,Math.PI]}/><meshBasicMaterial color="#438eff"/></mesh>
    <mesh position={[0,-.032,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.751,.005,8,96,Math.PI]}/><meshBasicMaterial color="#ffa539"/></mesh>
    <mesh position={[0,-.3,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[20,20]}/><meshStandardMaterial color="#0d1d32" roughness={.9}/></mesh>
    {[.95,1.35,1.8].map((r,i)=><mesh key={r} position={[0,-.298,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[r,r+.002,96]}/><meshBasicMaterial color={i%2?'#293a54':'#1f3351'}/></mesh>)}
    {[-1,1].map(side=><mesh key={side} position={[0,.002,side*.36]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.19,.192,48,1,0,Math.PI]}/><meshBasicMaterial color={side<0?'#a4cafa':'#f4d5a4'}/></mesh>)}
  </>;
});

/** Trackpad en la arena: dos dedos orbitan y el pellizco acerca (misma regla y mismo ajuste Auto/Ratón/Trackpad que la pizarra de armado). */
function TrackpadNav() {
  const {gl, camera, get} = useThree();
  useEffect(() => {
    const host = gl.domElement.parentElement; if (!host) return;
    const mode = () => { try { return parseNavMode(localStorage.getItem('modo.robotics.navMode')); } catch { return 'auto' as const; } };
    const route = createWheelRouter(mode), offset = new Vector3(), target = new Vector3(0, .03, 0);
    const wheel = (e: WheelEvent) => {
      const controls = get().controls as unknown as {enabled: boolean; update(): void} | null;
      if (controls && !controls.enabled) return;
      const action = route(e, performance.now());
      if (action === 'native') return;
      e.preventDefault(); e.stopPropagation();
      offset.copy(camera.position).sub(target);
      let r = offset.length(), theta = Math.atan2(offset.x, offset.z), phi = Math.acos(Math.min(1, Math.max(-1, offset.y / r)));
      const height = Math.max(1, gl.domElement.clientHeight);
      if (action === 'zoom') r = Math.min(3.4, Math.max(.6, r * zoomFactor(e)));
      else { theta -= ORBIT_PER_HEIGHT * e.deltaX / height; phi = Math.min(Math.PI / 2.05, Math.max(.05, phi - ORBIT_PER_HEIGHT * e.deltaY / height)); }
      camera.position.set(target.x + r * Math.sin(phi) * Math.sin(theta), target.y + r * Math.cos(phi), target.z + r * Math.sin(phi) * Math.cos(theta));
      camera.lookAt(target);
      controls?.update();
    };
    host.addEventListener('wheel', wheel, {capture: true, passive: false});
    return () => host.removeEventListener('wheel', wheel, {capture: true});
  }, [gl, camera, get]);
  return null;
}

export function ArenaStage({prepared,frame,status,automatic,reduced}:{prepared:ReturnType<typeof prepareArena>|null;frame:ArenaFrame|null;status:BattleStatus;automatic:boolean;reduced:boolean}){
  const live=useRef<Live>({frame,status,automatic,reduced});live.current={frame,status,automatic,reduced};
  const [paths,setPaths]=useState<[number,number,number][][]>([[],[]]);
  // Sample the actual route, keeping visual history outside render and outside the simulation.
  useEffect(()=>{
    if(!frame){setPaths([[],[]]);return;}
    setPaths(previous=>{
      let changed=false;
      const next=frame.roots.map((id,i)=>{
        const p=frame.physics.poses[id]?.p,last=previous[i].at(-1);
        if(!p||Math.hypot(p[0],p[2])>=.735||last&&Math.hypot(last[0]-p[0],last[2]-p[2])<=.012)return previous[i];
        changed=true;return [...previous[i].slice(-43),[p[0],.003,p[2]] as [number,number,number]];
      });return changed?next:previous;
    });
  },[frame,prepared]);
  return <Canvas camera={CAMERA} dpr={[1,1.35]} gl={GL} frameloop={reduced||status==='paused'?'demand':'always'} aria-label="Arena 3D de sumo">
    <FrameSignal frame={frame}/>
    <Venue/>
    {prepared?.project.parts.map(part=><Actor key={part.instanceId} part={part} live={live}/>)}
    {prepared&&<Energy live={live} roots={prepared.roots} initial={prepared}/>}
    {paths.map((points,i)=>points.length>1?<Line key={i} points={points} color={COLORS[i]} transparent opacity={.28} lineWidth={1.5} depthWrite={false}/>:null)}
    <Director live={live} roots={prepared?.roots??[]}/>
    <TrackpadNav/>
    <OrbitControls makeDefault enabled={!automatic||reduced} target={[0,.03,0]} minDistance={.6} maxDistance={3.4} maxPolarAngle={Math.PI/2.05}/>
  </Canvas>;
}
