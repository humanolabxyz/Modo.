import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/two-contactor-lesson';fs.mkdirSync(out,{recursive:true});
await build({stdin:{resolveDir:process.cwd(),contents:"export * from './src/data/lessons';export * from './src/data/lessonTeaching';export * from './src/data/lessonSchematics';export * from './src/data/lessonAssessment';export * from './src/data/assessmentState';export * from './src/data/wiring';export * from './src/data/simulation';export * from './src/data/panel';export * from './src/data/practice';export * from './src/data/panelElectrical';export * from './src/data/panelHistory';"},bundle:true,platform:'node',format:'cjs',outfile:out+'/model.cjs',logLevel:'silent'});
const m=await import('./two-contactor-lesson/model.cjs?'+Date.now()),checks=[];
const source=JSON.parse(fs.readFileSync('src/data/twoContactorMatias.json','utf8'));
const lesson=m.TWO_CONTACTOR_LESSON,cade=m.LESSON_SCHEMATICS.estrellaDosContactores;
assert.deepEqual(lesson.pairs,source.pairs);
assert.equal(lesson.steps.length,41);
assert.equal(fs.existsSync('public'+lesson.diagram.src),true);
const wires=lesson.pairs.map(([a,b])=>m.createCable(a,b,[]));
const terminals=[...new Set(lesson.pairs.flat())];
assert.deepEqual(cade.PORTS.flatMap(p=>p.panel?[p.panel]:[]).sort(),terminals.sort());
const traces=m.lessonTraces(lesson);
for(const [i,trace] of traces.entries())assert.ok(trace?.wires.length,`Tramo de referencia para paso ${i+1}`);
for(const [i,a] of terminals.entries())for(const b of terminals.slice(i+1)){
 assert.equal(Boolean(m.traceStep(cade,a,b)),m.connectedByCables(a,b,wires),a+' ↔ '+b);
}
checks.push('41 pares en el orden de Matías. Cada paso tiene trazo y las redes del esquema coinciden con el cableado.');
for(const s of lesson.steps){const t=m.teachingForStep(s,lesson.schematic);for(const k of ['why','behavior','without','question'])assert.ok(t[k].length>30);assert.ok(t.criteria.length>=2);assert.ok(t.components.length>0);}
const assessment=m.newAssessment('estrellaDosContactores');assert.ok(m.assessLesson(assessment,wires).complete);assert.equal(m.assessLesson(assessment,[]).complete,false);
const practice={...m.emptyPractice(),title:lesson.title,mode:'guided',wires,steps:lesson.steps,diagram:lesson.diagram,stepIndex:5};assert.deepEqual(m.readPractice(practice),practice);assert.deepEqual(m.readPanelFile(m.panelExport(practice,m.newPanelHistory(practice))).practice,practice);
checks.push('Evaluación reconoce el montaje y rechaza el vacío; práctica y exportación/historial conservan la nueva lección');
const input={...m.emptySimulation(),enabled:true,plugged:true,forceBreaker:true,breakers:[true,true]};
let sim=m.solveSimulation(wires,{...input,pressed:['S3']});assert.equal(sim.motor.status,'off','S3 no inicia este montaje');
let rest=m.solveSimulation(wires,input);assert.deepEqual(rest.pilots,[false,true,false,false],'En reposo solo se enciende el rojo P2');assert.deepEqual(m.solveSimulation(wires,{...input,pressed:['S2']},rest.relays).pilots,[false,true,false,false]);
sim=m.solveSimulation(wires,{...input,pressed:['S1']});assert.equal(sim.fault,null);assert.equal(sim.motor.connection,'star');assert.ok(sim.relays.TEMPORIZADOR_1&&sim.relays.CONTACTOR_TRIFASICO);assert.equal(sim.relays.CONTACTOR_TERMICO,false);
sim=m.solveSimulation(wires,input,sim.relays);assert.equal(sim.motor.connection,'star','Retiene al soltar S1');
assert.deepEqual(sim.pilots,[true,false,false,false],'En estrella solo P1; el rojo se apaga');
const delta=m.solveSimulation(wires,input,sim.relays,['TEMPORIZADOR_1']);assert.equal(delta.fault,null);assert.equal(delta.motor.connection,'delta');assert.equal(delta.relays.CONTACTOR_TRIFASICO,false);assert.equal(delta.relays.CONTACTOR_TERMICO,true);assert.deepEqual(delta.pilots,[false,false,false,true],'En triángulo solo P4; el rojo sigue apagado');
for(const state of [sim,delta]){const stop=m.solveSimulation(wires,{...input,pressed:['S2']},state.relays,['TEMPORIZADOR_1']);assert.equal(stop.motor.status,'off');const trip=m.solveSimulation(wires,{...input,thermalTripped:true},state.relays,['TEMPORIZADOR_1']);assert.equal(trip.motor.status,'off');assert.equal(trip.pilots[2],true);assert.equal(trip.pilots[1],true,'Con TEST se encienden P3 amarillo y P2 rojo');assert.equal(trip.pilots[0]||trip.pilots[3],false);}
checks.push('S1: estrella KM2 + KT1, retención, cambio a triángulo KM1; S3 no da marcha; S2 y TEST detienen en ambas etapas y P3 avisa; el rojo P2 se enciende en reposo y con TEST y se apaga en estrella y triángulo');
fs.writeFileSync(out+'/model-results.json',JSON.stringify({checks},null,2));console.log(checks);
