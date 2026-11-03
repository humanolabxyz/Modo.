import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ARM_ID, BLOCK_ID, ZONE_ID, armTaskProgress, buildArmPractice, buildArmTransfer, gripArm, heldId, moveArm, resetArmPractice} from '../src/robotics/arm/model.ts';
import {prepareArmTask} from '../src/robotics/arm/program.ts';
import {planArmMotion} from '../src/robotics/arm/motion.ts';
import {createDropWorld} from '../src/robotics/arm/drop.ts';
import {parseRobotProject} from '../src/robotics/project/validate.ts';
import {removeParts} from '../src/robotics/project/commands.ts';
import {findInterferences} from '../src/robotics/build/interference.ts';
const checks=[];
fs.mkdirSync('qa/robotics-arm-task',{recursive:true});
for (const build of [buildArmPractice, buildArmTransfer]) {
  let p=build();const id=p.parts[0].instanceId,original=JSON.stringify(p),task=prepareArmTask(p,id,100);
  assert.ok(task.ok,task.message);assert.equal(JSON.stringify(p),original,'preparar no mueve el proyecto');
  assert.ok(task.program.points.length<=40);
  const parsed=parseRobotProject({...p,armProgram:task.program});assert.ok(parsed.ok,parsed.error);
  assert.deepEqual(parsed.project.armProgram,task.program,'conserva las comprobaciones de agarre al importar');
  let releases=0;
  for(const point of task.program.points){
    const plan=planArmMotion(p,id,point.angles,point.kind,100);assert.ok(plan.ok,`${point.name}: ${plan.message}`);
    for(const frame of plan.frames){const r=moveArm(p,id,frame);assert.ok(r.ok,r.message);p=r.project;}
    const arm=p.parts.find(x=>x.instanceId===id),held=heldId(arm);
    if((arm.props.gripperOpen!==false)!==point.gripperOpen){
      const r=gripArm(p,id,point.gripperOpen);assert.ok(r.ok,r.message);p=r.project;
      if(held&&point.gripperOpen){
        const world=await createDropWorld(p,p.parts.find(x=>x.instanceId===held),p.parts.find(x=>x.instanceId===id));
        let fall;try{for(let i=0;i<700;i++){fall=world.step();if(fall.done)break;}}finally{world.free();}
        assert.ok(fall.done);p={...p,parts:p.parts.map(x=>x.instanceId===held?{...x,transform:fall.transform}:x)};
        releases++;
        assert.equal(armTaskProgress(p).done,releases);
        assert.equal(armTaskProgress(p).complete,releases===armTaskProgress(p).total,'ninguna entrega parcial completa el lote');
      }
    }
    if(point.expectedHeld)assert.equal(heldId(p.parts.find(x=>x.instanceId===id)),point.expectedHeld);
  }
  assert.ok(armTaskProgress(p).complete);assert.equal(releases,build===buildArmTransfer?3:1);
  fs.writeFileSync(`qa/robotics-arm-task/${build===buildArmTransfer?'transfer':'single'}-completed.modo.json`,JSON.stringify({...p,armProgram:task.program},null,2));
  assert.ok(findInterferences(p).every(pair=>pair.every(id=>p.parts.find(x=>x.instanceId===id).definitionId!==ZONE_ID)),'un destino pintado no produce interferencia');
  const reset=resetArmPractice(p,id);assert.ok(reset.ok);assert.equal(armTaskProgress(reset.project).done,0);
  for(const block of reset.project.parts.filter(x=>x.definitionId===BLOCK_ID)){
    const before=JSON.parse(original).parts.find(x=>x.instanceId===block.instanceId);
    assert.ok(block.transform.position.every((v,i)=>Math.abs(v-before.transform.position[i])<1e-9));
  }
  const missing=removeParts({...reset.project,armProgram:task.program},[reset.project.parts.find(x=>x.definitionId===BLOCK_ID).instanceId]);
  assert.equal(missing.project.armProgram,undefined);assert.ok(parseRobotProject(missing.project).ok);
  checks.push(`${p.name}: ciclo completo con ${releases} agarres comprobados, caídas físicas, destinos individuales, reinicio e importación.`);
}
const p=buildArmTransfer(),id=p.parts[0].instanceId;
for(const changed of [
  {...p,parts:p.parts.map(x=>x.definitionId===BLOCK_ID?{...x,props:{...x.props,massKg:1}}:x)},
  {...p,parts:p.parts.filter(x=>x.definitionId!==ZONE_ID)},
  {...p,parts:p.parts.map(x=>x.definitionId===BLOCK_ID?{...x,transform:{...x.transform,position:[2,.02,0]}}:x)},
  {...p,scene:{...p.scene,obstacles:[{id:'muro',shape:'box',transform:{position:[.25,.15,.10],rotation:[0,0,0,1]},size:[.2,.3,.2]}]}},
])assert.equal(prepareArmTask(changed,id).ok,false);
const wrong=p.parts.map(x=>x.definitionId===BLOCK_ID?{...x,props:{...x.props,depositedBy:id},transform:{...x.transform,position:[.38,.0175,-.14]}}:x);
assert.equal(armTaskProgress({...p,parts:wrong}).complete,false,'una pieza en el destino de otra no completa la tarea');
checks.push('Rechaza carga excesiva, destino ausente, pieza inalcanzable, obstáculo y entregas en destinos equivocados.');
fs.mkdirSync('qa/robotics-arm-task',{recursive:true});fs.writeFileSync('qa/robotics-arm-task/model-results.json',JSON.stringify({checks},null,2));
checks.forEach(x=>console.log('PASS',x));
