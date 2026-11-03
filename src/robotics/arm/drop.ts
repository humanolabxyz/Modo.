import RAPIER from '@dimforge/rapier3d-compat';
import type {RobotProject,PartInstance,Quat,Vec3} from '../project/types.ts';
import {armFrames} from './kinematics.ts';
import {E6_LINKS} from './e6Data.ts';
import {tPoint} from '../project/math.ts';
import {CONVEYOR_ID} from '../conveyor/constants.ts';
let initialized:Promise<void>|undefined;
const xyz=([x,y,z]:Vec3)=>({x,y,z});
const rotation=([x,y,z,w]:Quat)=>({x,y,z,w});
/** Free release uses the existing Rapier engine, not a snap to the floor. */
export async function createDropWorld(p:RobotProject,block:PartInstance,arm:PartInstance){
  await (initialized??=RAPIER.init());
  const world=new RAPIER.World({x:0,y:-9.81,z:0});world.timestep=1/120;
  world.createCollider(RAPIER.ColliderDesc.cuboid(2,.025,2).setTranslation(0,-.025,0).setFriction(.7));
  for(const obstacle of p.scene.obstacles){
    const size=obstacle.size;
    const shape=obstacle.shape==='cylinder'?RAPIER.ColliderDesc.cylinder(size[1]/2,size[0]/2):RAPIER.ColliderDesc.cuboid(size[0]/2,size[1]/2,size[2]/2);
    world.createCollider(shape.setTranslation(...obstacle.transform.position).setRotation(rotation(obstacle.transform.rotation)));
  }
  for(const other of p.parts){
    if(other.definitionId===CONVEYOR_ID){world.createCollider(RAPIER.ColliderDesc.cuboid(.08,.04,.36).setTranslation(...other.transform.position).setRotation(rotation(other.transform.rotation)).setFriction(.7));continue;}
    if(other.definitionId!=='arm-practice-block'||other.instanceId===block.instanceId)continue;
    world.createCollider(RAPIER.ColliderDesc.cuboid(.0175,.0175,.0175).setTranslation(...other.transform.position).setRotation(rotation(other.transform.rotation)).setFriction(.7));
  }
  const frames=armFrames(arm);
  E6_LINKS.forEach((link,i)=>{
    const center=tPoint(frames.links[i],link.center as Vec3);
    world.createCollider(RAPIER.ColliderDesc.cuboid(...link.half as Vec3).setTranslation(...center).setRotation(rotation(frames.links[i].rotation)));
  });
  const body=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(...block.transform.position).setRotation(rotation(block.transform.rotation)).setCanSleep(true).setCcdEnabled(true));
  world.createCollider(RAPIER.ColliderDesc.cuboid(.0175,.0175,.0175).setMass(Number(block.props?.massKg??.05)).setFriction(.7).setRestitution(.08),body);
  let elapsed=0;
  return {step:()=>{
    world.step();elapsed+=world.timestep;
    const t=body.translation(),q=body.rotation(),v=body.linvel();
    return {transform:{position:[t.x,t.y,t.z] as Vec3,rotation:[q.x,q.y,q.z,q.w] as Quat},done:body.isSleeping()||(elapsed>.4&&Math.hypot(v.x,v.y,v.z)<.008)||elapsed>5};
  },free:()=>world.free()};
}
