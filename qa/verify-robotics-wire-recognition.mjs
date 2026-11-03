import assert from 'node:assert/strict';
import {buildRobot2wd} from './robotics/robot2wd.mjs';
import {buildTemplate,TEMPLATE_EXPLORER,TEMPLATE_READY_ROBOT,TEMPLATE_ROVER_4WD} from '../src/robotics/project/templates.ts';
import {detectWiringGuide,templateGuide} from '../src/robotics/guide/guides.ts';
import {matchReference,resolveWire,guideProgress,applyStep} from '../src/robotics/guide/wireGuide.ts';
import {newRobotProject} from '../src/robotics/project/defaults.ts';
for(const id of [TEMPLATE_EXPLORER,TEMPLATE_READY_ROBOT,TEMPLATE_ROVER_4WD]){
 const reference=buildTemplate(id),project={...reference,connections:[],workspace:{mode:'build',wiringGuide:'robot-2-ruedas-evita'}};
 assert.equal(detectWiringGuide(project)?.id,`plantilla:${id}`,'detecta inventario pese a la guía anterior');
 const guide=templateGuide(id),renamed={...project,parts:project.parts.slice().reverse().map(p=>({...p,instanceId:'copy-'+p.instanceId,transform:{...p.transform,position:p.transform.position.map(v=>v+.05)}})),attachments:[]};
 const matched=matchReference(renamed,guide);assert.equal(new Set(matched.values()).size,matched.size);
 for(const original of guide.reference.parts){const actual=renamed.parts.find(p=>p.instanceId===matched.get(original.instanceId));assert.equal(actual?.label,original.label,'mantiene funciones de motores/servos reordenados');}
 for(const s of guide.steps){if(s.kind==='wire'){const r=resolveWire(renamed,s,matched);assert.ok(!('missing'in r));}}
 let p=renamed;for(const step of guide.steps){const result=applyStep(p,step,matchReference(p,guide));assert.ok(!('error'in result),result.error);p=result.project;}assert.ok(guideProgress(p,guide).complete);
 const partial={...project,parts:reference.parts.slice(0,1),workspace:{mode:'build',assemblyTemplate:id}};assert.equal(detectWiringGuide(partial)?.id,`plantilla:${id}`,'reconoce un armado parcial con referencia explícita');
 console.log('PASS reconocimiento, instancias únicas y cableado completo: '+id);
}
assert.equal(detectWiringGuide(newRobotProject()),undefined);console.log('PASS no inventa un robot para un proyecto vacío');


assert.equal(detectWiringGuide(buildRobot2wd().project)?.id,'robot-2-ruedas-evita');console.log('PASS montaje básico sin protoboard conserva su guía de 21 pasos');
