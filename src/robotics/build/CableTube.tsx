import {useLayoutEffect,useRef} from 'react';
import type {BufferGeometry,CatmullRomCurve3} from 'three';
import {createCableGeometry,updateCableGeometry} from './cableGeometry';

export function CableTube({curve,radius,color,selected=false,hit=false}:{curve:CatmullRomCurve3;radius:number;color:string;selected?:boolean;hit?:boolean}){
 const geometry=useRef<BufferGeometry>(null);
 const segments=hit?16:24,radial=hit?4:6;
 useLayoutEffect(()=>{if(geometry.current)updateCableGeometry(geometry.current,curve,radius,segments,radial);},[curve,radius,segments,radial]);
 // R3F owns and disposes this geometry once at unmount, not at every shape change.
 return <mesh visible={!hit}><bufferGeometry ref={geometry} onUpdate={g=>{
  if(!g.getAttribute('position')){const initial=createCableGeometry(segments,radial);g.copy(initial);initial.dispose();}
 }}/>{hit?<meshBasicMaterial/>:<meshStandardMaterial color={color} roughness={.5} emissive={selected?color:'#000000'} emissiveIntensity={selected?.5:0}/>}</mesh>;
}
