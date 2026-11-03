import {E6_HOME, E6_JOINTS, E6_LINKS, E6_IGNORED_COLLISIONS} from './e6Data.ts';
import {DEG, qFromAxisAngle, qInv, qMul, qRotate, tMul, tPoint, sub, cross, dot} from '../project/math.ts';
import type {PartInstance, Quat, Transform, Vec3, RobotProject} from '../project/types.ts';
import {obbIntersect, obbOf, type Obb} from '../build/interference.ts';

export const HOME = E6_HOME;
export const JOINTS = E6_JOINTS.map((j, i) => ({name: ['J1 · Base','J2 · Hombro','J3 · Codo','J4 · Giro de muñeca','J5 · Flexión de muñeca','J6 · Herramienta'][i], min: j.lower/DEG, max:j.upper/DEG, velocity:Math.min(120,j.velocity/DEG)}));
export const armAngles = (arm: PartInstance): number[] => JOINTS.map((j,i) => typeof arm.props?.[`j${i+1}`] === 'number' ? Math.max(j.min,Math.min(j.max,Number(arm.props[`j${i+1}`]))) : HOME[i]);
const rpy = (v: number[]): Quat => qMul(qFromAxisAngle([0,0,1],v[2]),qMul(qFromAxisAngle([0,1,0],v[1]),qFromAxisAngle([1,0,0],v[0])));
export function armFrames(arm: PartInstance) {
  // ROS Z-up → PanelLab Y-up. Existing part transform is centered on its base.
  let t = tMul(arm.transform,{position:[0,-.0515,0],rotation:qFromAxisAngle([1,0,0],-Math.PI/2)});
  const base=t, links:Transform[]=[t], joints:Transform[]=[], angles=armAngles(arm);
  E6_JOINTS.forEach((j,i)=>{
    t=tMul(t,{position:j.origin as Vec3,rotation:rpy(j.rpy)});
    joints.push(t);
    t=tMul(t,{position:[0,0,0],rotation:qFromAxisAngle(j.axis as Vec3,angles[i]*DEG)});
    links.push(t);
  });
  return {base,links,joints,flange:t,tcp:tMul(t,{position:[0,0,.07],rotation:[0,0,0,1]})};
}
export function withAngles(arm:PartInstance,angles:number[]):PartInstance {return {...arm,props:{...arm.props,...Object.fromEntries(angles.map((v,i)=>[`j${i+1}`,v]))}};}
const orientationError=(to:Quat,from:Quat):Vec3=>{
  const q=qMul(to,qInv(from)),sign=q[3]<0?-1:1;
  return [q[0]*2*sign,q[1]*2*sign,q[2]*2*sign];
};
function solve6(a:number[][],b:number[]):number[]|null {
  const m=a.map((row,i)=>[...row,b[i]]);
  for(let k=0;k<6;k++){
    let pivot=k; for(let i=k+1;i<6;i++)if(Math.abs(m[i][k])>Math.abs(m[pivot][k]))pivot=i;
    [m[k],m[pivot]]=[m[pivot],m[k]]; if(Math.abs(m[k][k])<1e-12)return null;
    const d=m[k][k];for(let j=k;j<=6;j++)m[k][j]/=d;
    for(let i=0;i<6;i++)if(i!==k){const s=m[i][k];for(let j=k;j<=6;j++)m[i][j]-=s*m[k][j];}
  }
  return m.map(row=>row[6]);
}
/** Damped least-squares numerical IK for the published six-axis chain. */
export function inverseArm(arm:PartInstance,target:Transform):number[]|null {
  const seeds=[armAngles(arm),HOME,[0,60,60,0,-120,0],[90,45,70,0,-115,0],[-90,45,70,0,-115,0]];
  for(const seed of seeds){
    let q=[...seed];
    for(let iteration=0;iteration<160;iteration++){
      const frame=armFrames(withAngles(arm,q)).tcp, pe=sub(target.position,frame.position), re=orientationError(target.rotation,frame.rotation);
      if(Math.hypot(...pe)<.0005&&Math.hypot(...re)<.008)return q;
      const error=[...pe,...re.map(v=>v*.15)],columns:number[][]=[];
      for(let j=0;j<6;j++){
        const test=[...q];test[j]+=.05;
        const next=armFrames(withAngles(arm,test)).tcp;
        columns.push([...sub(next.position,frame.position).map(v=>v/(.05*DEG)),...orientationError(next.rotation,frame.rotation).map(v=>v*.15/(.05*DEG))]);
      }
      const a=Array.from({length:6},(_,i)=>Array.from({length:6},(_,j)=>columns[i].reduce((s,v,k)=>s+v*columns[j][k],0)+(i===j?.00004:0)));
      const b=columns.map(col=>col.reduce((s,v,k)=>s+v*error[k],0)),delta=solve6(a,b);if(!delta)break;
      q=q.map((v,i)=>Math.max(JOINTS[i].min+.05,Math.min(JOINTS[i].max-.05,v+Math.max(-.2,Math.min(.2,delta[i]))/DEG)));
    }
  }
  return null;
}
export function armBoxes(arm:PartInstance):Obb[]{
  const f=armFrames(arm);
  return E6_LINKS.map((link,i)=>({center:tPoint(f.links[i],link.center as Vec3),axes:[[1,0,0],[0,1,0],[0,0,1]].map(v=>qRotate(f.links[i].rotation,v as Vec3)) as [Vec3,Vec3,Vec3],half:link.half.map(v=>Math.max(.001,v-.002)) as Vec3}));
}
export function armCollision(p:RobotProject,arm:PartInstance):string|null {
  const boxes=armBoxes(arm),f=armFrames(arm);
  for(let i=1;i<boxes.length;i++){
    const b=boxes[i]; const extent=b.axes.reduce((s,a,k)=>s+Math.abs(a[1])*b.half[k],0);
    if(b.center[1]-extent<-.002)return 'Colisión con el suelo.';
    for(let j=0;j<i;j++){
      const n=E6_LINKS[i].name,m=E6_LINKS[j].name;
      if(E6_IGNORED_COLLISIONS.some(pair=>pair.includes(n)&&pair.includes(m)))continue;
      if(obbIntersect(b,boxes[j]))return `Autocolisión: ${n} con ${m}.`;
    }
    for(const part of p.parts){
      if(part.instanceId===arm.instanceId||part.definitionId==='arm-drop-zone'||part.instanceId===arm.props?.held)continue;
      if(part.definitionId==='arm-practice-block' && i>=5 && Math.hypot(...sub(part.transform.position,f.tcp.position))<.06)continue;
      const other=obbOf(part,.001);if(other&&obbIntersect(b,other))return `Colisión con ${part.label}.`;
    }
    for(const obstacle of p.scene.obstacles){
      const t=obstacle.transform,other:Obb={center:t.position,axes:[[1,0,0],[0,1,0],[0,0,1]].map(v=>qRotate(t.rotation,v as Vec3)) as [Vec3,Vec3,Vec3],half:obstacle.size.map(v=>v/2) as Vec3};
      if(obbIntersect(b,other))return 'Colisión con un obstáculo del escenario.';
    }
  }
  const tool:Obb={center:tPoint(f.tcp,[0,0,-.025]),axes:[[1,0,0],[0,1,0],[0,0,1]].map(v=>qRotate(f.tcp.rotation,v as Vec3)) as [Vec3,Vec3,Vec3],half:[.038,.013,.03]};
  if(tool.center[1]-tool.axes.reduce((s,a,k)=>s+Math.abs(a[1])*tool.half[k],0)<-.001)return 'La pinza tocaría el suelo.';
  if(boxes.slice(0,4).some(b=>obbIntersect(tool,b)))return 'Autocolisión de la pinza con el brazo.';
  for(const part of p.parts){
    if(part.definitionId!=='educational-conveyor')continue;
    const box=obbOf(part,.001);if(!box)continue;
    if(obbIntersect(tool,box))return 'Colisión de la pinza con la cinta.';
    if(arm.props?.held&&obbIntersect({center:f.tcp.position,axes:tool.axes,half:[.0175,.0175,.0175]},box))return 'La carga choca con la cinta.';
  }
  for(const obstacle of p.scene.obstacles){
    const t=obstacle.transform,box:Obb={center:t.position,axes:[[1,0,0],[0,1,0],[0,0,1]].map(v=>qRotate(t.rotation,v as Vec3)) as [Vec3,Vec3,Vec3],half:obstacle.size.map(v=>v/2) as Vec3};
    if(obbIntersect(tool,box))return 'Colisión de la pinza con un obstáculo.';
    if(arm.props?.held){const load:Obb={center:f.tcp.position,axes:tool.axes,half:[.0175,.0175,.0175]};if(obbIntersect(load,box))return 'La carga choca con un obstáculo.';}
  }
  if(f.tcp.position[1]<.0175)return 'La herramienta tocaría el suelo.';
  return null;
}
/** Gravity torque using manufacturer URDF COM/mass, plus configured tool/payload.
 * CAD masses are not the complete measured robot mass: never present as motor rating.
 */
export function gravityTorques(arm:PartInstance,payloadKg=0):number[]{
  const f=armFrames(arm);
  return f.joints.map((joint,i)=>{
    const axis=qRotate(joint.rotation,[0,0,1]);let torque=0;
    for(let j=i+1;j<E6_LINKS.length;j++){
      const force:Vec3=[0,-9.81*E6_LINKS[j].mass,0],lever=sub(tPoint(f.links[j],E6_LINKS[j].com as Vec3),joint.position);
      torque+=dot(cross(lever,force),axis);
    }
    torque+=dot(cross(sub(f.tcp.position,joint.position),[0,-9.81*(.08+payloadKg),0]),axis);
    return torque;
  });
}
export function modelTorques(arm:PartInstance,payloadKg:number,acceleration:number[]):number[]{
  const f=armFrames(arm),gravity=gravityTorques(arm,payloadKg);
  return f.joints.map((joint,i)=>{
    const axis=qRotate(joint.rotation,[0,0,1]);let inertia=0;
    for(let j=i+1;j<E6_LINKS.length;j++){
      const link=E6_LINKS[j],localAxis=qRotate(qInv(f.links[j].rotation),axis),r=sub(tPoint(f.links[j],link.com as Vec3),joint.position),m=link.inertia;
      const [x,y,z]=localAxis;
      const intrinsic=m.ixx*x*x+m.iyy*y*y+m.izz*z*z+2*(m.ixy*x*y+m.ixz*x*z+m.iyz*y*z);
      inertia+=intrinsic+link.mass*(dot(r,r)-dot(r,axis)**2);
    }
    const tool=sub(f.tcp.position,joint.position);
    inertia+=(.08+payloadKg)*(dot(tool,tool)-dot(tool,axis)**2);
    return gravity[i]+inertia*(acceleration[i]??0)*DEG;
  });
}
