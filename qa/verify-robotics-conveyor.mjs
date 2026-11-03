import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildConveyorCell,stepConveyor,conveyorReading,routeDetectedPiece,beltPieces,feedInterlock} from '../src/robotics/conveyor/model.ts';
import {CONVEYOR_ID,CONVEYOR_TEMPLATE,COLOR_RGB} from '../src/robotics/conveyor/constants.ts';
import {readPieceColor} from '../src/robotics/conveyor/color.ts';
import {ARM_ID,BLOCK_ID,ZONE_ID,heldId,gripArm,moveArm,resetArmPractice,armTaskProgress} from '../src/robotics/arm/model.ts';
import {prepareArmTask} from '../src/robotics/arm/program.ts';
import {planArmMotion} from '../src/robotics/arm/motion.ts';
import {createDropWorld} from '../src/robotics/arm/drop.ts';
import {buildTemplate} from '../src/robotics/project/templates.ts';
import {parseRobotProject} from '../src/robotics/project/validate.ts';
import {catalogShape} from '../src/robotics/catalog/index.ts';
import {qFromAxisAngle} from '../src/robotics/project/math.ts';
const out='qa/robotics-conveyor',checks=[];fs.mkdirSync(out,{recursive:true});
const pass=s=>{checks.push(s);console.log('PASS',s);};
let p=buildTemplate(CONVEYOR_TEMPLATE),id=p.parts[0].instanceId;const initial=structuredClone(p);
assert.ok(parseRobotProject(p,{catalog:catalogShape}).ok);assert.equal(p.firmware.length,0);assert.equal(feedInterlock(p),null);
const source=p.parts.filter(x=>x.definitionId===BLOCK_ID),before=source.map(x=>x.transform.position[2]);
let r=stepConveyor(p,.1);assert.equal(r.state,'moving');assert.equal(JSON.stringify(p),JSON.stringify(initial));
r.project.parts.filter(x=>x.definitionId===BLOCK_ID).forEach((x,i)=>assert.ok(Math.abs(before[i]-x.transform.position[2]-.008)<1e-9));
assert.equal(armTaskProgress(r.project).done,0);assert.equal(conveyorReading(r.project).present,false);
const shuffled={...p,parts:p.parts.map(x=>x.instanceId===source[0].instanceId?{...x,label:'ID rojo pero superficie azul',props:{...x.props,surfaceR:55,surfaceG:115,surfaceB:225}}:x)};
let s=shuffled;for(let t=0;t<1000;t++){r=stepConveyor(s,.02);s=r.project;if(r.state!=='moving')break;}
assert.equal(conveyorReading(s).color.color,'azul');const routed=routeDetectedPiece(s);assert.ok(routed.ok);
const routedBlock=routed.project.parts.find(x=>x.instanceId===routed.pieceId);assert.equal(routed.project.parts.find(x=>x.instanceId===routedBlock.props.targetZone).props.acceptColor,'azul');
pass('Banda desplaza las piezas a la velocidad elegida sin mutar el origen; presencia y selección de destino provienen de posición y RGB, incluso al cambiar el color sin cambiar el ID.');
let releases=0;
while(!armTaskProgress(p).complete){
  assert.equal(feedInterlock(p),null);
  for(let t=0;t<4000;t++){r=stepConveyor(p,.02);p=r.project;if(r.state!=='moving')break;}
  assert.equal(r.state,'detected',r.message);assert.ok(conveyorReading(p).present);
  assert.deepEqual(stepConveyor(p,1).project,p,'el sensor detiene la banda sin arrastrar las piezas');
  const route=routeDetectedPiece(p);assert.ok(route.ok,route.message);p=route.project;
  const task=prepareArmTask(p,id,100,[route.pieceId]);assert.ok(task.ok,task.message);
  for(const point of task.program.points){
    const plan=planArmMotion(p,id,point.angles,point.kind,100);assert.ok(plan.ok,`${point.name}: ${plan.message}`);
    for(const frame of plan.frames){const moved=moveArm(p,id,frame);assert.ok(moved.ok,moved.message);p=moved.project;}
    const arm=p.parts.find(x=>x.instanceId===id),holding=heldId(arm);
    if((arm.props.gripperOpen!==false)!==point.gripperOpen){
      const grip=gripArm(p,id,point.gripperOpen);assert.ok(grip.ok);p=grip.project;
      if(holding&&point.gripperOpen){
        const world=await createDropWorld(p,p.parts.find(x=>x.instanceId===holding),p.parts.find(x=>x.instanceId===id));
        let frame;try{for(let k=0;k<700;k++){frame=world.step();if(frame.done)break;}}finally{world.free();}
        assert.ok(frame.done);p={...p,parts:p.parts.map(x=>x.instanceId===holding?{...x,transform:frame.transform}:x)};releases++;
      }
    }
    if(point.expectedHeld)assert.equal(heldId(p.parts.find(x=>x.instanceId===id)),point.expectedHeld);
  }
  assert.equal(armTaskProgress(p).done,releases);assert.ok(releases<=3);
}
assert.equal(releases,3);assert.equal(beltPieces(p).length,0);assert.ok(parseRobotProject(p,{catalog:catalogShape}).ok);
fs.writeFileSync(out+'/completed.modo.json',JSON.stringify(p,null,2));
const reset=resetArmPractice(p,id);assert.ok(reset.ok);assert.equal(beltPieces(reset.project).length,3);assert.equal(armTaskProgress(reset.project).done,0);
pass('Lote completo: tres transportes, detecciones, agarres y trayectorias progresivas, liberaciones Rapier y destinos por color; reinicio devuelve las piezas a la banda elevada.');
const fault=(key,value)=>({...initial,parts:initial.parts.map(x=>x.definitionId===CONVEYOR_ID?{...x,props:{...x.props,[key]:value}}:x)});
assert.equal(stepConveyor(fault('jammed',true),.1).state,'fault');assert.equal(JSON.stringify(stepConveyor(fault('jammed',true),.1).project),JSON.stringify(fault('jammed',true)));
let noSensor=fault('sensorFault',true);for(let t=0;t<1000;t++){r=stepConveyor(noSensor,.02);noSensor=r.project;if(r.state!=='moving')break;}
assert.equal(r.state,'fault');assert.match(r.message,/sin detección/);assert.equal(conveyorReading(noSensor).present,false);assert.equal(armTaskProgress(noSensor).done,0);
assert.equal(stepConveyor({...initial,parts:initial.parts.filter(x=>x.definitionId!==BLOCK_ID)},.1).state,'empty');
const obstruction={...initial,scene:{...initial.scene,obstacles:[{id:'atasco',shape:'box',transform:{position:[.28,.10,.245],rotation:[0,0,0,1]},size:[.12,.06,.002]}]}};
assert.equal(stepConveyor(obstruction,10).state,'fault','una actualización grande no atraviesa un obstáculo delgado');
const unknown={...s,parts:s.parts.map(x=>x.instanceId===source[0].instanceId?{...x,props:{...x.props,surfaceR:0,surfaceG:0,surfaceB:0}}:x)};
assert.equal(routeDetectedPiece(unknown).ok,false);
const missingZone={...s,parts:s.parts.filter(x=>x.definitionId!==ZONE_ID)};assert.equal(routeDetectedPiece(missingZone).ok,false);
const tilted={...initial,parts:initial.parts.map(x=>x.definitionId===CONVEYOR_ID?{...x,transform:{...x.transform,rotation:qFromAxisAngle([1,0,0],.2)}}:x)};assert.equal(stepConveyor(tilted,.1).state,'fault');
assert.equal(parseRobotProject(fault('speedMps',4)).ok,false);assert.equal(parseRobotProject(fault('sensorFault','no')).ok,false);
assert.equal(stepConveyor(initial,NaN).state,'fault');
pass('Fallas observables: atasco, obstáculo delgado, sensor sin detección con parada de salida, cinta vacía, color desconocido, destino ausente, cinta inclinada e importación inválida; ninguna inventa entregas.');
fs.writeFileSync(out+'/model-results.json',JSON.stringify({checks},null,2));
