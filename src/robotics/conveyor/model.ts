import type {PartInstance,RobotProject,Vec3} from '../project/types.ts';
import {tIdentity,tInv,tPoint,qRotate} from '../project/math.ts';
import {newId} from '../project/defaults.ts';
import {buildArmPractice,ARM_ID,BLOCK_ID,ZONE_ID,heldId,armTaskProgress,armFrames} from '../arm/model.ts';
import {obbIntersect} from '../build/interference.ts';
import {CONVEYOR_ID,BELT_TOP,BELT_LENGTH,SENSOR_Z,COLOR_RGB,SORT_COLORS} from './constants.ts';
import {readPieceColor} from './color.ts';
export const findConveyor=(p:RobotProject)=>p.parts.find(x=>x.definitionId===CONVEYOR_ID);
const local=(belt:PartInstance,piece:PartInstance)=>tPoint(tInv(belt.transform),piece.transform.position);
export function beltPieces(p:RobotProject) {
  const belt=findConveyor(p);if(!belt)return [];
  return p.parts.filter(x=>{
    if(x.definitionId!==BLOCK_ID||x.locked||p.parts.some(a=>heldId(a)===x.instanceId))return false;
    const v=local(belt,x);
    return Math.abs(v[0])<=.0525&&Math.abs(v[1]-(BELT_TOP+.0175))<.006&&Math.abs(v[2])<=BELT_LENGTH/2-.0175+.001;
  }).sort((a,b)=>local(belt,a)[2]-local(belt,b)[2]);
}
export function conveyorReading(p:RobotProject) {
  const belt=findConveyor(p),pieces=beltPieces(p);
  const piece=belt&&!belt.props?.sensorFault?pieces.find(x=>Math.abs(local(belt,x)[2]-SENSOR_Z)<=.025):undefined;
  return {belt,piece,present:!!piece,color:piece?readPieceColor(piece):null,remaining:pieces.length,progress:armTaskProgress(p)};
}
export type BeltStep={project:RobotProject;state:'moving'|'detected'|'empty'|'fault';message:string};
export function feedInterlock(p:RobotProject):string|null {
  const belt=findConveyor(p),arm=p.parts.find(x=>x.definitionId===ARM_ID);
  if(!belt||!arm)return 'La célula requiere cinta y brazo E6.';
  if(heldId(arm))return 'La pinza sostiene una pieza. Deposítala o reinicia antes de avanzar la cinta.';
  const tcp=tPoint(tInv(belt.transform),armFrames(arm).tcp.position);
  if(Math.abs(tcp[0])<.12&&Math.abs(tcp[2])<BELT_LENGTH/2+.08&&tcp[1]<.20)return 'Retira el brazo de la cinta con Posición inicial antes de transportar.';
  return null;
}
/** Contact transport with no slip on a level belt; not a calibrated friction/motor model.
 * Stops at the physical beam or the guarded outlet. Tests use scene coordinates.
 */
export function stepConveyor(p:RobotProject,dt:number):BeltStep {
  if(!Number.isFinite(dt)||dt<0||dt>60)return {project:p,state:'fault',message:'Paso de tiempo inválido.'};
  // Substeps also protect pure callers from tunnelling through thin obstacles.
  if(dt>1/120+1e-8){
    let result:BeltStep={project:p,state:'moving',message:'Cinta en marcha.'};
    for(let left=dt;left>1e-8;left-=1/120){result=stepConveyor(result.project,Math.min(left,1/120));if(result.state!=='moving')break;}
    return result;
  }
  const reading=conveyorReading(p),belt=reading.belt;
  if(!belt)return {project:p,state:'fault',message:'Falta la cinta transportadora.'};
  if(qRotate(belt.transform.rotation,[0,1,0])[1]<.999)return {project:p,state:'fault',message:'Esta práctica requiere una cinta horizontal.'};
  if(belt.props?.jammed)return {project:p,state:'fault',message:'Atasco de cinta. Retira la falla antes de continuar.'};
  if(reading.present)return {project:p,state:'detected',message:'Sensor de presencia activo: cinta detenida para recoger.'};
  const pieces=beltPieces(p);
  if(!pieces.length)return {project:p,state:'empty',message:'Cinta vacía: no hay una pieza apoyada sobre la banda.'};
  const speed=Math.max(.02,Math.min(.12,Number(belt.props?.speedMps??.08)||.08));
  const leading=local(belt,pieces[0])[2],limit=belt.props?.sensorFault?-BELT_LENGTH/2+.0175:SENSOR_Z+.024;
  const travel=Math.min(speed*dt,Math.max(0,leading-limit));
  const ids=new Set(pieces.map(x=>x.instanceId));
  const next={...p,parts:p.parts.map(x=>{
    if(x.instanceId===belt.instanceId)return {...x,props:{...x.props,phaseM:(Number(x.props?.phaseM??0)+travel)%BELT_LENGTH}};
    if(!ids.has(x.instanceId))return x;
    const pos=local(belt,x);pos[2]-=travel;
    return {...x,transform:{...x.transform,position:tPoint(belt.transform,pos)}};
  })};
  // Obstacles block transport. Reject the whole tick, including belt phase.
  for(const piece of next.parts.filter(x=>ids.has(x.instanceId))){
    const axes=[[1,0,0],[0,1,0],[0,0,1]].map(v=>qRotate(piece.transform.rotation,v as Vec3)) as [Vec3,Vec3,Vec3];
    const box={center:piece.transform.position,axes,half:[.017,.017,.017] as Vec3};
    for(const o of p.scene.obstacles){
      const other={center:o.transform.position,axes:[[1,0,0],[0,1,0],[0,0,1]].map(v=>qRotate(o.transform.rotation,v as Vec3)) as [Vec3,Vec3,Vec3],half:o.size.map(v=>v/2) as Vec3};
      if(obbIntersect(box,other))return {project:p,state:'fault',message:'Atasco: una pieza encuentra un obstáculo en la cinta.'};
    }
  }
  if(conveyorReading(next).present)return {project:next,state:'detected',message:'Sensor de presencia activo: cinta detenida para recoger.'};
  if(leading-travel<=-BELT_LENGTH/2+.0175+.00001)return {project:next,state:'fault',message:'Parada de salida: una pieza llegó al final sin detección. Revisa el sensor.'};
  return {project:next,state:'moving',message:'Cinta en marcha · esperando presencia.'};
}
export function routeDetectedPiece(p:RobotProject):{ok:true;project:RobotProject;pieceId:string}|{ok:false;message:string} {
  const r=conveyorReading(p);
  if(!r.piece)return {ok:false,message:'No hay una pieza detectada en la estación de recogida.'};
  if(!r.color?.color)return {ok:false,message:'Color desconocido: la lectura RGB no corresponde a un destino. Revisa la superficie de la pieza.'};
  const zone=p.parts.find(x=>x.definitionId===ZONE_ID&&x.props?.acceptColor===r.color!.color);
  if(!zone)return {ok:false,message:`Falta el destino para color ${r.color.color}.`};
  return {ok:true,pieceId:r.piece.instanceId,project:{...p,parts:p.parts.map(x=>x.instanceId===r.piece!.instanceId?{...x,props:{...x.props,targetZone:zone.instanceId}}:x)}};
}
export function buildConveyorCell(now=new Date().toISOString()):RobotProject {
  const p=buildArmPractice(now),arm=p.parts.find(x=>x.definitionId===ARM_ID)!;
  const belt:PartInstance={instanceId:newId(),definitionId:CONVEYOR_ID,label:'Cinta · presencia y color',transform:{...tIdentity(),position:[.28,.04,.40]},locked:true,props:{speedMps:.08,jammed:false,sensorFault:false,phaseM:0}};
  const destinations:[[number,number],[number,number],[number,number]]=[[.25,-.14],[.38,-.14],[.25,-.27]];
  return {...p,name:'Fábrica E6 · cinta y clasificación',
    scene:{...p.scene,theme:'factory',sizeM:8,obstacles:[
      {id:'almacen-entrada',shape:'box',size:[.7,.55,.55],transform:{position:[-1.5,.275,.8],rotation:[0,0,0,1]}},
      {id:'almacen-salida',shape:'box',size:[.7,.55,.55],transform:{position:[1.5,.275,-.85],rotation:[0,0,0,1]}},
    ]},
    parts:[arm,belt,...SORT_COLORS.flatMap((color,i):PartInstance[]=>{
    const zoneId=newId(),[r,g,b]=COLOR_RGB[color],z=.28+i*.17,[x,dz]=destinations[i];
    return [
      {instanceId:newId(),definitionId:BLOCK_ID,label:`Pieza ${color}`,transform:{...tIdentity(),position:[.28,.0975,z]},props:{massKg:.05,startX:.28,startY:.046,startZ:z,surfaceR:r,surfaceG:g,surfaceB:b,targetZone:zoneId}},
      {instanceId:zoneId,definitionId:ZONE_ID,label:`Destino ${color}`,transform:{...tIdentity(),position:[x,.002,dz]},locked:true,props:{acceptColor:color,surfaceR:r,surfaceG:g,surfaceB:b}},
    ];
  })],workspace:{mode:'simulate',welcomeDismissed:true,camera:{position:[1.25,1,1.45],target:[.20,.10,.25]}}};
}
