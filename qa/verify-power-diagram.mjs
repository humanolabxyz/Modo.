import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/power-diagram';fs.mkdirSync(out,{recursive:true});
await build({stdin:{resolveDir:process.cwd(),contents:"export * from './src/data/cade';export * from './src/data/lessonSchematics';export * from './src/data/lessons';"},bundle:true,platform:'node',format:'cjs',outfile:out+'/model.cjs',logLevel:'silent'});
const m=await import('./power-diagram/model.cjs?'+Date.now());
const checks=[];
function nets(cade){const key=p=>p.objectId+':'+p.terminal,groups=new Map();for(const w of cade.WIRES){const n=cade.network(w.id);const ids=n.wires.map(x=>x.id).sort((a,b)=>a-b).join(',');groups.set(ids,new Set(n.ports.map(key)));}
 const netOf=new Map();let i=0;for(const s of groups.values()){i++;for(const p of s)netOf.set(p,i);}return netOf;}
function analyse(cade,ids){const net=nets(cade),same=(a,b)=>net.get(a)!==undefined&&net.get(a)===net.get(b),{main,delta,star,breaker,motor,thermal}=ids;
 const phase={};for(const [k,t] of [['L1','2'],['L2','4'],['L3','6']])phase[k]=`${breaker}:${t}`;
 const lineOf=p=>Object.keys(phase).find(k=>same(p,phase[k]));
 const feed=['1','3','5'].map(t=>lineOf(`${delta}:${t}`)),mainFeed=['1','3','5'].map(t=>lineOf(`${main}:${t}`));
 const motorU={U1:lineOf(`${thermal}:2`)?lineOf(`${thermal}:2`):null};
 const toMotor=(contactor,t)=>['U2','V2','W2'].find(e=>same(`${contactor}:${t}`,`${motor}:${e}`));
 return {feed,mainFeed,deltaOut:['2','4','6'].map(t=>toMotor(delta,t)),starOut:['2','4','6'].map(t=>toMotor(star,t)),starBridge:same(`${star}:1`,`${star}:3`)&&same(`${star}:3`,`${star}:5`),thermalToMotor:[['2','U1'],['4','V1'],['6','W1']].map(([t,e])=>same(`${thermal}:${t}`,`${motor}:${e}`))};}
const two=m.LESSON_CADES.estrellaDosContactores,original=m.ESTRELLA_CADE;
const ids={main:3,delta:6,star:7,breaker:2,motor:5,thermal:4};
const link=(a,b)=>assert.ok(m.traceStep(two,a,b),a+' ↔ '+b);
const rows=['R','S','T'].map((phase,i)=>({phase,pole:i+1,start:['U1','V1','W1'][i],delta:['W2','U2','V2'][i],star:['V2','U2','W2'][i]}));
for(const {phase,pole,start,delta,star} of rows){
 link('FUENTE:'+phase,'TEMPORIZADOR_1:L'+pole);
 link('FUENTE:'+phase,'CONTACTOR_TERMICO:L'+pole);
 link('TEMPORIZADOR_1:T'+pole,'BORNERA_MOTOR:'+start);
 link('CONTACTOR_TERMICO:T'+pole,'BORNERA_MOTOR:'+delta);
 link('CONTACTOR_TRIFASICO:T'+pole,'BORNERA_MOTOR:'+star);
}
link('CONTACTOR_TRIFASICO:L1','CONTACTOR_TRIFASICO:L2');
link('CONTACTOR_TRIFASICO:L2','CONTACTOR_TRIFASICO:L3');
link('FUENTE:TP','BORNERA_MOTOR:TP');
checks.push('Fuerza del guardado de Matías: R/S/T a KT1 y KM1, puente L1–L2–L3 de KM2, extremos de cada devanado y tierra del motor.');
const refs=new Set(two.SYMBOLS.map(o=>o.reference));
for(const ok of ['KM1','KM2','KT1'])assert.ok(refs.has(ok),'Rótulo del banco presente: '+ok);assert.ok(!refs.has('KM3'),'No hay KM3');
const ref=id=>two.SYMBOLS.find(o=>o.id===id).reference;
assert.equal(ref(3),'KT1','Contactor principal = KT1');assert.equal(ref(57),'KT1','Retención 13–14 = KT1');assert.equal(ref(63),'KT1','Bobina del principal = KT1');
assert.equal(ref(58),'KT1','Contactos temporizados = KT1');
assert.equal(ref(6),'KM1','Triángulo = KM1');assert.equal(ref(65),'KM1');assert.equal(ref(7),'KM2','Estrella = KM2');assert.equal(ref(64),'KM2');
assert.equal(ref(62),'KM1','Primer NC del piloto rojo = KM1');assert.equal(ref(1001),'KM2','Segundo NC del piloto rojo = KM2');
checks.push('Rótulos del banco: principal KT1 (bobina, retención, polos y contactos temporizados), triángulo KM1, estrella KM2');
/* El dibujo base (lo usan también las lecciones de tres contactores) y el de la variante con temporizador tienen el mismo triángulo corregido. */
const o=analyse(original,ids);assert.deepEqual(o.deltaOut,['W2','U2','V2'],'Dibujo base: triángulo 2 → W2, 4 → U2, 6 → V2');assert.deepEqual(o.starOut,['V2','U2','W2']);
const timer=m.LESSON_CADES.estrellaTimer,t=analyse(timer,ids);assert.deepEqual(t.deltaOut,['W2','U2','V2'],'Dibujo con temporizador: triángulo 2 → W2, 4 → U2, 6 → V2');assert.deepEqual(t.starOut,['V2','U2','W2']);
checks.push('El dibujo base y el de la variante con temporizador tienen el triángulo de la guía (2→W2, 4→U2, 6→V2)');
fs.writeFileSync(out+'/results.json',JSON.stringify({checks,twoContactors:rows,baseDeltaOut:o.deltaOut,timerDeltaOut:t.deltaOut},null,2));console.log(checks);
