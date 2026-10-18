import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/lesson-understanding';fs.mkdirSync(out,{recursive:true});
await build({stdin:{contents:"export * from './src/data/lessonAssessment';export * from './src/data/assessmentState';export * from './src/data/lessonTeaching';export * from './src/data/lessons';export * from './src/data/wiring';export * from './src/data/practice';export * from './src/data/panelHistory';export * from './src/data/session';export {registerModule,buildExtraModule} from './src/data/panel';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',outfile:out+'/model.cjs',logLevel:'silent'});
const m=await import('./lesson-understanding/model.cjs?'+Date.now()),checks=[];
m.registerModule(m.buildExtraModule('tri',3));
for(const lesson of Object.values(m.LESSONS)){
 for(const step of lesson.steps){const t=m.teachingForStep(step,lesson.schematic);assert.ok(t.components.length&&t.components.every(c=>c.name&&c.role));for(const k of ['why','behavior','without','question'])assert.ok(t[k]?.length>20,`${step.id} sin ${k}`);assert.ok(t.criteria.length>=2)}
 const a=m.newAssessment(lesson.id);let wires=lesson.pairs.map(([f,t])=>m.createCable(f,t,[]));
 assert.equal(m.assessLesson(a,[]).complete,false);assert.equal(m.assessLesson(a,wires.reverse()).complete,true,'acepta cualquier orden');
 const nets=[...m.cableNodes(wires).values()];const equivalent=nets.flatMap(ids=>ids.slice(1).map(to=>m.createCable(ids[0],to,[])));assert.equal(m.assessLesson(a,equivalent).complete,true,'acepta puentes equivalentes');
 const wrong=m.createCable('FUENTE:F','FUENTE:N',wires);assert.equal(m.assessLesson(a,[...wires,wrong]).complete,false,'rechaza redes contaminadas aunque todas las parejas estén unidas');
 const bad=m.assessLesson(a,[wrong]);assert.equal(bad.verdicts[0].status,'incompatible');assert.ok(!m.questionFor(lesson,wrong).includes('Correcta'),'no adelanta resultado');
 const w=wires[0],answered={...a,answers:[{wireId:w.id,from:w.from.terminalId,to:w.to.terminalId,text:'Explico la función de la unión.'}],reflection:'Explicación global',submitted:true};
 assert.ok(m.answerFor(answered,w));assert.equal(m.answerFor(answered,{...w,to:{terminalId:w.to.terminalId==='FUENTE:N'?'FUENTE:F':'FUENTE:N'}}),undefined,'no reutiliza respuesta de otros extremos');assert.ok(m.answerFor(answered,{...w,from:w.to,to:w.from}),'invertir extremos no cambia la pregunta');
 const p={...m.emptyPractice(),wires,diagram:lesson.diagram,assessment:answered};assert.deepEqual(m.readPractice(p).assessment,answered);const h=m.newPanelHistory(p);assert.deepEqual(m.readPanelFile(m.panelExport(p,h)).practice,p,'exportación/importación con respuestas y entrega');
 assert.throws(()=>m.readPractice({...p,assessment:{...answered,answers:[{...answered.answers[0],to:'INVENTADO:1'}]}}));assert.throws(()=>m.readPractice({...p,assessment:{...answered,answers:[{...answered.answers[0],text:'x'.repeat(3001)}]}}));
 assert.throws(()=>m.readPractice({...p,mode:'guided'}));assert.ok(m.readPractice(m.emptyPractice()),'compatibilidad con paneles anteriores');
 checks.push(`${lesson.id}: explicaciones completas, equivalencias, errores de red, respuestas asociadas al cable y JSON/historial`);
}
fs.writeFileSync(out+'/model-results.json',JSON.stringify({checks},null,2));console.log('PASS',checks.join('\nPASS '));
