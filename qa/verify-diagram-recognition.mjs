import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/diagram-recognition';fs.mkdirSync(out,{recursive:true});
await build({stdin:{resolveDir:process.cwd(),contents:`export * from './src/data/learning';export * from './src/data/cade';export * from './src/data/panelCorrespondence';export * from './src/data/wiring';export * from './src/data/lessons';export * from './src/data/lessonSchematics';export * from './src/data/panel';export * from './src/data/practice';`},bundle:true,platform:'node',format:'esm',outfile:out+'/model.mjs',logLevel:'silent'});
const m=await import('./diagram-recognition/model.mjs?'+Date.now());
const old={CADE:JSON.parse(fs.readFileSync(out+'/original-perfecto.json','utf8'))};
assert.deepEqual(m.CADE,old.CADE,'El archivo original y todos sus objetos se conservan');
const model=m.learningModel();
assert.equal(model.flatMap(n=>n.missing).length,0,'Todos los bornes de PERFECTO tienen equivalencia');
assert.equal(new Set(model.flatMap(n=>n.lineIds)).size,47);
for(const p of m.UNIQUE_PORTS)assert.ok(m.TERMINAL_BY_ID.has(m.LABEL_BINDINGS[m.portKey(p)]),m.portKey(p));
const control=m.netForLine(83,model),power=m.netForLine(106,model);
assert.notEqual(control,power,'Q de mando y fuerza no se mezclan por numeración repetida');
assert.ok(control.terminals.includes('FUENTE:F')&&!control.terminals.includes('FUENTE:R'));
assert.ok(power.terminals.includes('FUENTE:R')&&!power.terminals.includes('FUENTE:F'));
assert.ok(!control.terminals.includes('CONTACTOR_TERMICO:96'),'No se puentea 95–96');
assert.deepEqual(m.routeForLine(83).pairs,[{from:'FUENTE:F',to:'CONTACTOR_TERMICO:95'}],'Al pulsar 83 se muestra el cable exacto de la lección');
assert.deepEqual(m.routeForLine(109).pairs,[],'La unión integrada con el térmico no crea cables ficticios');
const edge=p=>[p.from,p.to].sort().join('|');
assert.deepEqual(model.flatMap(n=>n.pairs).map(edge).sort(),m.SIMPLE_LESSON.steps.map(edge).sort(),'Las rutas son exactamente los 24 cables de Aprender');
const wires=[];for(const [from,to] of m.SIMPLE_LESSON.pairs)wires.push(m.createCable(from,to,wires));
for(const w of wires)assert.equal(m.assessCable(w,wires,model,{}),'correct',w.from.terminalId+' -> '+w.to.terminalId);
for(const n of model)assert.equal(m.netComplete(n,wires,model,{}),true,'La lección completa todas las redes de PERFECTO: '+n.id);
assert.equal(m.completedDiagramLines(wires,model,{}).length,47);
for(const [a,b] of [['FUENTE:F','FUENTE:R'],['FUENTE:R','FUENTE:S'],['FUENTE:F','FUENTE:N']]){
 const w=m.createCable(a,b,[]);assert.equal(m.assessCable(w,[w],model,{}),'short',a+' / '+b);
}
assert.equal(m.canBind('-KM1:A1','CONTACTOR_TERMICO:A2',{}),false);
assert.equal(m.canBind('-H1:X2','BOTONERAS:N',{}),true,'Solo los retornos comunes declarados comparten borne');
assert.equal(m.canBind('-SB1:11','BOTONERAS:N',{}),false,'Paro no puede usar el retorno común');
for(const bindings of [{},{'-SB2:13':'BOTONERAS:S3:3','-SB2:14':'BOTONERAS:S3:4'}]){
 const doc={...m.emptyPractice(),mode:'free',wires,learning:{...m.newLearning(),bindings}};
 assert.deepEqual(m.readPractice(JSON.parse(JSON.stringify(doc))),doc,'Se guarda y se recupera sin perder conexiones ni correspondencias personales');
}
const legacy={...m.emptyPractice(),wires,learning:{...m.newLearning(),bindings:{'-Q:3':'FUENTE:S'}}};
assert.deepEqual(m.readPractice(legacy).learning.bindings,{'-Q.potencia:3':'FUENTE:S'},'Correspondencias de exportaciones anteriores conservadas');
assert.throws(()=>m.readPractice({...m.emptyPractice(),learning:{...m.newLearning(),bindings:{'-SB1:11':'BOTONERAS:N'}}}));
m.registerModule(m.buildExtraModule('tri',3));
const lessons=[];
for(const lesson of Object.values(m.LESSONS)){
 let traced=0;
 for(const [i,step] of lesson.steps.entries()){
  assert.ok(m.TERMINAL_BY_ID.has(step.from)&&m.TERMINAL_BY_ID.has(step.to),lesson.id+' '+i);
  const trace=m.lessonTraces(lesson)[i];if(trace){traced++;for(const wire of trace.wires)assert.ok(m.stepsForWire(lesson,wire).includes(step));}
 }
 lessons.push({id:lesson.id,steps:lesson.steps.length,traced});
}
const result={checks:['47 líneas originales conservadas y con correspondencia','Mando de 24 V separado de fuerza trifásica','24 conexiones de marcha/paro aceptadas y todas las redes completas','Retornos comunes aceptados sin permitir unir bornes independientes','Cortocircuitos entre fuentes detectados','Guardado e importación conservan datos y correspondencias personales','4 lecciones mantienen bornes y trazado'],lessons};
fs.writeFileSync(out+'/model-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
