/* Compara el circuito de fuerza dibujado en la lección de dos contactores con la Figura Nº2 de la guía del profesor (pág. 6):
 *  KM1 (principal) → relé térmico → U1, V1, W1; contactor de triángulo con entradas L1–L3 y salidas 2 → W2, 4 → U2, 6 → V2;
 *  contactor de estrella con 1–3–5 unidos y salidas 2 → V2, 4 → U2, 6 → W2. Con esas fases, cada devanado debe quedar entre dos fases distintas. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/power-diagram';fs.mkdirSync(out,{recursive:true});
await build({stdin:{resolveDir:process.cwd(),contents:"export * from './src/data/cade';export * from './src/data/lessonSchematics';export * from './src/data/lessons';export * from './src/data/twoContactorReference';"},bundle:true,platform:'node',format:'cjs',outfile:out+'/model.cjs',logLevel:'silent'});
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
const r=analyse(two,ids);
assert.deepEqual(r.mainFeed,['L1','L2','L3'],'El principal toma L1, L2 y L3');assert.deepEqual(r.feed,['L1','L2','L3'],'El triángulo toma L1, L2 y L3 (guía, fig. 2)');
assert.deepEqual(r.thermalToMotor,[true,true,true],'El relé térmico alimenta U1, V1 y W1');
assert.deepEqual(r.deltaOut,['W2','U2','V2'],'Triángulo: 2 → W2, 4 → U2, 6 → V2 (guía, fig. 2)');
assert.deepEqual(r.starOut,['V2','U2','W2'],'Estrella: 2 → V2, 4 → U2, 6 → W2 (guía, fig. 2)');assert.ok(r.starBridge,'Estrella: 1, 3 y 5 unidos');
/* Fases en cada borne del motor con el triángulo cerrado: polo k lleva la fase de su entrada a su salida. */
const feedPhase={'2':r.feed[0],'4':r.feed[1],'6':r.feed[2]},atEnd=Object.fromEntries(['2','4','6'].map(t=>[r.deltaOut[['2','4','6'].indexOf(t)],feedPhase[t]])),start={U1:'L1',V1:'L2',W1:'L3'};
const winding={U:[start.U1,atEnd.U2],V:[start.V1,atEnd.V2],W:[start.W1,atEnd.W2]};
for(const [k,[a,b]] of Object.entries(winding))assert.notEqual(a,b,`Triángulo: el devanado ${k} queda entre dos fases distintas (${a}–${b})`);
assert.equal(new Set(Object.values(winding).map(p=>p.slice().sort().join('-'))).size,3,'Triángulo: los tres devanados usan pares de fases distintos');
checks.push('Fuerza de la lección = figura Nº2 de la guía: triángulo 2→W2, 4→U2, 6→V2; estrella con puente 1-3-5; devanados entre fases distintas');
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
/* Cada conexión del dibujo debe existir en el banco y cada cable del banco debe verse en el dibujo (con las anclas de cada paso). */
{const lesson=m.TWO_CONTACTOR_LESSON,anch=m.TWO_CONTACTOR_REFERENCE_PAIRS,portTerms=new Map(),add=(p,t)=>{if(!portTerms.has(p))portTerms.set(p,new Set());portTerms.get(p).add(t);};
 lesson.pairs.forEach(([a,b],i)=>{const an=anch[i];if(!an)return;add(an[0],a);add(an[1],b);});
 const par=new Map(),f=x=>{if(!par.has(x))par.set(x,x);if(par.get(x)!==x)par.set(x,f(par.get(x)));return par.get(x);};lesson.pairs.forEach(([a,b])=>par.set(f(a),f(b)));
 const dnets=new Map();for(const w of two.WIRES){const n=two.network(w.id);dnets.set(n.wires.map(x=>x.id).sort((a,b)=>a-b).join(','),n.ports.map(p=>p.anchor));}
 const dn=new Map();let k=0;for(const ports of dnets.values()){k++;for(const p of ports)dn.set(p,k);}
 const bad=[];for(const ports of dnets.values()){const g=new Set();for(const p of ports)for(const t of portTerms.get(p)||[])g.add(f(t));if(g.size>1)bad.push('dibujo une y el banco no: '+ports.filter(p=>portTerms.has(p)).join(' = '));}
 const byBank=new Map();for(const [p,ts] of portTerms)for(const t of ts){const g=f(t);if(!byBank.has(g))byBank.set(g,new Set());byBank.get(g).add(p);}
 for(const ps of byBank.values()){if(new Set([...ps].map(p=>dn.get(p))).size>1)bad.push('banco une y el dibujo no: '+[...ps].join(' | '));}
 assert.deepEqual(bad,[],'Dibujo y cableado del banco son la misma red');checks.push('Cada conexión del dibujo existe en los 40 cables del banco y cada cable se ve en el dibujo (mando y fuerza)');}
fs.writeFileSync(out+'/results.json',JSON.stringify({checks,twoContactors:r,baseDeltaOut:o.deltaOut,timerDeltaOut:t.deltaOut},null,2));console.log(checks);
