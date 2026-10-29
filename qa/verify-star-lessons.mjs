import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {createHash} from 'node:crypto';
const out='qa/star-lessons';fs.mkdirSync(out,{recursive:true});
await build({stdin:{resolveDir:process.cwd(),contents:"export {ESTRELLA_CADE} from './src/data/cade';export * from './src/data/lessons';export * from './src/data/lessonTeaching';export * from './src/data/lessonSchematics';export * from './src/data/lessonAssessment';export * from './src/data/assessmentState';export * from './src/data/wiring';export * from './src/data/panel';export * from './src/data/simulation';export * from './src/data/panelHistory';export * from './src/data/practice';"},bundle:true,platform:'node',format:'cjs',outfile:out+'/model.cjs',logLevel:'silent'});
const m=await import('./star-lessons/model.cjs?'+Date.now());m.registerModule(m.buildExtraModule('tri',3));
const sources=JSON.parse(fs.readFileSync('src/data/starDeltaSources.json','utf8')),checks=[];
for(const [id,source] of Object.entries(sources)){
 const raw=fs.readFileSync('referencias/lecciones-estrella-triangulo/'+source.source),file=JSON.parse(raw),lesson=m.LESSONS[id],cade=m.LESSON_SCHEMATICS[id];
 assert.equal(createHash('sha256').update(raw).digest('hex'),source.sha256);
 const expected=file.wires.map(w=>[id==='estrellaManual'&&w.from.terminalId==='BOTONERAS:S2:2'&&w.to.terminalId==='BOTONERAS:S3:3'?'BOTONERAS:S1:4':w.from.terminalId,w.to.terminalId]);assert.deepEqual(lesson.pairs,expected,'la guía manual adapta solo la toma de SB3 a la figura 1; la fuente original conserva su hash');
 assert.equal(lesson.steps.length,id==='estrellaManual'?46:42);
 const wires=lesson.pairs.map(([from,to])=>m.createCable(from,to,[])),nets=[...m.cableNodes(wires).values()],terminals=[...new Set(lesson.pairs.flat())];
 for(const step of lesson.steps){assert.ok(m.TERMINAL_BY_ID.has(step.from)&&m.TERMINAL_BY_ID.has(step.to));const teaching=m.teachingForStep(step,id);assert.ok(teaching.components.every(c=>c.name&&c.role));for(const k of ['why','behavior','without','question'])assert.ok(teaching[k].length>20);assert.ok(teaching.criteria.length>=2)}
 // The original reference remains intact; lessons already use their own annotated diagrams.
 assert.deepEqual(m.ESTRELLA_CADE.drawing,JSON.parse(fs.readFileSync('src/data/cadeEstrellaTriangulo.json','utf8')),'se conserva el diagrama de referencia original');
 const mapped=cade.PORTS.filter(p=>p.panel);assert.ok(mapped.length>0,'el esquema de la lección tiene correspondencias');for(const p of mapped)assert.ok(m.TERMINAL_BY_ID.has(p.panel),'cada correspondencia refiere a un borne existente: '+p.panel);
 const progress=m.lessonProgress(lesson,0,wires);assert.ok(progress.active.length>0,'el primer cable se puede seguir en su esquema');assert.equal(progress.ends.length,2,'el trazado tiene sus dos extremos');for(const wireId of [...progress.active,...progress.done])assert.ok(cade.WIRES.some(w=>w.id===wireId),'el trazado utiliza conductores existentes');
 const a=m.newAssessment(id);assert.equal(m.assessLesson(a,wires).complete,true);assert.equal(m.assessLesson(a,[]).complete,false);const other=nets.flatMap(ids=>ids.slice(1).map(to=>m.createCable(ids[0],to,[])));assert.equal(m.assessLesson(a,other).complete,true);
 const p={...m.emptyPractice(),title:lesson.title,mode:'guided',wires,diagram:lesson.diagram,steps:lesson.steps,stepIndex:2};assert.deepEqual(m.readPractice(p),p);const assessment={...a,answers:[{wireId:wires[0].id,from:wires[0].from.terminalId,to:wires[0].to.terminalId,text:'Explicación de la conexión.'}],submitted:true};const exam={...p,mode:'free',steps:[],stepIndex:0,assessment};assert.deepEqual(m.readPanelFile(m.panelExport(exam,m.newPanelHistory(exam))).practice,exam);
 assert.ok(fs.existsSync('public'+lesson.diagram.src));checks.push(`${id}: ${lesson.steps.length} conexiones verificadas, fuente original intacta, enseñanza, evaluación y JSON/historial`);
 const input={...m.emptySimulation(),enabled:true,plugged:true,forceBreaker:true,breakers:[true,true]},star=id==='estrellaManual'?'CONTACTOR_TRIFASICO_3':'CONTACTOR_TRIFASICO',delta=id==='estrellaManual'?'CONTACTOR_TRIFASICO':'CONTACTOR_TRIFASICO_3';
 let sim=m.solveSimulation(wires,{...input,pressed:['S1']});assert.equal(sim.fault,null);assert.equal(sim.relays.CONTACTOR_TERMICO,true);assert.equal(sim.relays[star],true);assert.equal(sim.relays[delta],false);assert.equal(sim.motor.connection,'star');
 sim=m.solveSimulation(wires,input,sim.relays);assert.equal(sim.relays[star],true,'retención al soltar S1');
 sim=m.solveSimulation(wires,{...input,pressed:id==='estrellaManual'?['S3']:[]},sim.relays,id==='estrellaTimer'?['TEMPORIZADOR_1']:[]);assert.equal(sim.fault,null);assert.equal(sim.relays[star],false);assert.equal(sim.relays[delta],true);assert.equal(sim.motor.connection,'delta');
 sim=m.solveSimulation(wires,input,sim.relays,id==='estrellaTimer'?['TEMPORIZADOR_1']:[]);assert.equal(sim.relays[delta],true,'mantiene triángulo');
 sim=m.solveSimulation(wires,{...input,pressed:['S2']},sim.relays,id==='estrellaTimer'?['TEMPORIZADOR_1']:[]);assert.equal(sim.motor.status,'off');assert.equal(sim.relays.CONTACTOR_TERMICO,false);
 checks.push(`${id}: el modelo arranca en estrella, retiene, cambia a triángulo y para con los papeles indicados`);
}
// Los papeles de KM2/KM3 y S3 no se heredan del ejemplo antiguo.
assert.ok(m.teachingForStep({from:'TEMPORIZADOR_1:56',to:'CONTACTOR_TRIFASICO_3:71'},'estrellaTimer').behavior.includes('estrella'));
assert.ok(m.teachingForStep({from:'BOTONERAS:S3:4',to:'CONTACTOR_TRIFASICO_3:71'},'estrellaManual').why.includes('KM2'));
assert.ok(m.componentForTerminal('CONTACTOR_TRIFASICO_3:A1').name.includes('KM3'));
assert.ok(m.componentForTerminal('BOTONERAS:S3:1').role.includes('1–2'));
fs.writeFileSync(out+'/model-results.json',JSON.stringify({checks},null,2));console.log(checks.map(s=>'PASS '+s).join('\n'));
