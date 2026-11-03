import type {RobotProject, Transform} from '../project/types.ts';
import {armAngles,armFrames,armCollision,inverseArm,JOINTS,withAngles} from './kinematics.ts';
import {ARM_ID,moveArm} from './model.ts';

export type MotionKind='MovJ'|'MovL';
export type MotionPlan={ok:true;frames:number[][];duration:number;kind:MotionKind}|{ok:false;message:string};
/** Quintic joint interpolation: zero endpoint velocity/acceleration, bounded speed.
 * 180°/s² is an explicit simulation setting, not a measured E6 servo parameter.
 */
export function planArmMotion(p:RobotProject,id:string,target:number[],kind:MotionKind='MovJ',speed=50):MotionPlan {
  const arm=p.parts.find(x=>x.instanceId===id&&x.definitionId===ARM_ID);
  if(!arm||target.length!==6||!target.every(Number.isFinite))return {ok:false,message:'Destino inválido.'};
  if(target.some((v,i)=>v<JOINTS[i].min||v>JOINTS[i].max))return {ok:false,message:'Destino fuera de los límites articulares.'};
  const start=armAngles(arm),ratio=Math.max(.1,Math.min(1,speed/100));
  const end=armFrames(withAngles(arm,target)).tcp,begin=armFrames(arm).tcp;
  const delta=target.map((v,i)=>Math.abs(v-start[i]));
  const distance=Math.hypot(...end.position.map((v,i)=>v-begin.position[i]));
  let duration=Math.max(.35,...delta.map((v,i)=>Math.max(1.875*v/(JOINTS[i].velocity*ratio),Math.sqrt(5.78*v/(180*ratio)))));
  if(kind==='MovL')duration=Math.max(duration,1.875*distance/(.5*ratio));
  // <=0.5° between samples prevents obstacles being skipped between rendered frames.
  const count=Math.max(Math.ceil(duration*50),Math.ceil(Math.max(...delta)*4));
  const frames:number[][]=[];let current=p,previous=start;
  for(let k=1;k<=count;k++){
    const t=k/count,u=t*t*t*(10+t*(-15+6*t));let angles:number[];
    if(kind==='MovJ')angles=start.map((v,i)=>v+(target[i]-v)*u);
    else {
      let q=end.rotation;
      if(begin.rotation.reduce((s,v,i)=>s+v*q[i],0)<0)q=q.map(v=>-v) as typeof q;
      const mixed=begin.rotation.map((v,i)=>v+(q[i]-v)*u),norm=Math.hypot(...mixed);
      const pose:Transform={position:begin.position.map((v,i)=>v+(end.position[i]-v)*u) as Transform['position'],rotation:mixed.map(v=>v/norm) as Transform['rotation']};
      const next=inverseArm(withAngles(arm,previous),pose);
      if(!next)return {ok:false,message:'MovL no ejecutable: singularidad o posición fuera de alcance en el recorrido.'};
      if(next.some((v,i)=>Math.abs(v-previous[i])>3))return {ok:false,message:'MovL detenido: salto articular cerca de una singularidad.'};
      angles=next;
    }
    const result=moveArm(current,id,angles);
    if(!result.ok)return {ok:false,message:`Trayectoria rechazada: ${result.message}`};
    current=result.project;previous=angles;frames.push(angles);
  }
  // Slow the linear trajectory if IK requires faster joint motion than configured.
  if(kind==='MovL'){
    let last=start,maxRate=1,velocity=[0,0,0,0,0,0];
    for(const frame of frames){const next=frame.map((v,i)=>(v-last[i])*count/duration);next.forEach((v,i)=>{maxRate=Math.max(maxRate,Math.abs(v)/(JOINTS[i].velocity*ratio),Math.sqrt(Math.abs(v-velocity[i])*count/duration/(180*ratio)));});velocity=next;last=frame;}
    duration*=maxRate;
  }
  return {ok:true,frames,duration,kind};
}
