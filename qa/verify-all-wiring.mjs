/* Cableado de TODAS las lecciones: redes del esquema = redes del banco, polos de cada contactor coherentes, sin cables repetidos y comportamiento simulado
 * (marcha, retención, paro, enclavamiento, inversión, estrella → triángulo y tensión de cada devanado). */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/all-wiring';fs.mkdirSync(out,{recursive:true});
await build({stdin:{resolveDir:process.cwd(),contents:"export * from './src/data/lessons';export * from './src/data/cade';export * from './src/data/lessonSchematics';export * from './src/data/simulation';export * from './src/data/panelElectrical';export * from './src/data/panelCalibration';export * from './src/data/wiring';export * from './src/data/panel';export * from './src/data/twoContactorReference';"},bundle:true,platform:'node',format:'cjs',outfile:out+'/model.cjs',logLevel:'silent'});
const m=await import('./all-wiring/model.cjs?'+Date.now());m.registerModule(m.buildExtraModule('tri',3));
const checks=[],cal=m.defaultCalibration();
const base={...m.emptySimulation(),enabled:true,plugged:true,forceBreaker:true,breakers:[true,true]};
const wiresOf=lesson=>lesson.pairs.map(([a,b])=>m.createCable(a,b,[]));

/* 1 · Cada lección: bornes existentes, sin cables repetidos, un paso por cable. */
for(const [id,lesson] of Object.entries(m.LESSONS)){
 const keys=lesson.pairs.map(p=>[...p].sort().join('|'));
 assert.equal(new Set(keys).size,keys.length,`${id}: sin cables repetidos`);
 for(const [a,b] of lesson.pairs){
  assert.ok(m.TERMINAL_BY_ID.has(a)&&m.TERMINAL_BY_ID.has(b),`${id}: borne existente ${a} / ${b}`);
  assert.notEqual(a,b);
 }
 assert.equal(lesson.steps.length,lesson.pairs.length);
}
checks.push('Las 5 lecciones: bornes existentes, sin cables repetidos y un paso por cable');

/* 1b · Nombres: en todas las lecciones, incluida la de dos contactores, los del banco. */
{
 const L=(id)=>m.terminalLabel(id,'dosContactores');
 assert.equal(L('TEMPORIZADOR_1:A1'),'KT1 · A1','el contactor principal es el temporizador KT1');
 assert.equal(L('TEMPORIZADOR_1:13'),'KT1 · 13','la retención 13–14 es de KT1');
 assert.equal(L('TEMPORIZADOR_1:55'),'KT1 · 55','los contactos temporizados son KT1');
 assert.equal(L('TEMPORIZADOR_1:68'),'KT1 · 68');
 assert.equal(L('CONTACTOR_TERMICO:A1'),'KM1 · A1','el de triángulo es KM1 (contactor + relé térmico)');
 assert.equal(L('CONTACTOR_TRIFASICO:A1'),'KM2 · A1','el de estrella es KM2 (contactor trifásico)');
 assert.equal(m.terminalLabel('CONTACTOR_TERMICO:95'),'KM1 · 95','las demás lecciones conservan los nombres del banco');
 assert.equal(m.terminalLabel('TEMPORIZADOR_1:55'),'KT1 · 55');
 const titles=m.TWO_CONTACTOR_LESSON.steps.map(s=>s.title);
 for(const [text,msg] of [['Bobina de KT1 · A1','bobina del principal'],['Retención de KT1 · entrada 13','retención en KT1'],['Alimentación de la etapa estrella · KT1 55','etapa estrella por KT1 55'],['Enclavamiento de estrella · KM1:72 a KM2:A1','estrella = KM2'],['Enclavamiento de triángulo · KM2:72 a KM1:A1','triángulo = KM1']])assert.ok(titles.includes(text),'título esperado: '+msg);
 const text=JSON.stringify(m.TWO_CONTACTOR_LESSON.steps.map(s=>[s.title,s.explanation]));
 for(const old of ['conjunto temporizado KT1','Conjunto temporizado','KT1 cierra','Bobina del conjunto','KM3'])assert.ok(!text.includes(old),'texto con el nombre anterior: '+old);
 checks.push('Nombres del banco: KT1 temporizador (principal y retardo), KM1 contactor + relé térmico (triángulo), KM2 contactor trifásico (estrella); sin KM3');
}
/* 2 · Esquema = banco (redes) y polos coherentes, en las lecciones con correspondencia de bornes. */
for(const [id,lesson] of Object.entries(m.LESSONS)){
 const cade=m.LESSON_SCHEMATICS[lesson.schematic];
 if(!cade.PORTS.some(p=>p.panel))continue;
 const par=new Map();
 const find=x=>{if(!par.has(x))par.set(x,x);if(par.get(x)!==x)par.set(x,find(par.get(x)));return par.get(x);};
 lesson.pairs.forEach(([a,b])=>par.set(find(a),find(b)));
 const key=p=>p.objectId+':'+p.terminal;
 const drawingNets=new Map();
 for(const w of cade.WIRES){const n=cade.network(w.id);drawingNets.set(n.ports.map(key).sort().join(','),n.ports);}
 const nets=[...drawingNets.values()];
 for(const ports of nets){
  const mapped=ports.filter(p=>p.panel);
  const groups=new Set(mapped.map(p=>find(p.panel)));
  assert.ok(groups.size<=1,`${id}: el esquema une y el banco no: ${mapped.map(p=>p.reference+':'+p.terminal+'→'+p.panel).join(' = ')}`);
 }
 const netOf=new Map();
 nets.forEach((ports,i)=>ports.forEach(p=>netOf.set(key(p),i)));
 const byBank=new Map();
 for(const ports of nets)for(const p of ports.filter(q=>q.panel)){
  const g=find(p.panel);
  if(!byBank.has(g))byBank.set(g,new Set());
  byBank.get(g).add(netOf.get(key(p)));
 }
 for(const [g,ids] of byBank)assert.equal(ids.size,1,`${id}: el banco une y el esquema no: ${g}`);
 for(const o of cade.SYMBOLS.filter(s=>['contactor3','thermal3','breaker3'].includes(s.shape))){
  const pm=Object.fromEntries((o.ports||[]).map(p=>[p.terminal,p.panel]));
  for(const [a,b] of [['1','2'],['3','4'],['5','6']]){
   const x=pm[a]?.split(':')[1],y=pm[b]?.split(':')[1];
   if(/^L\d$/.test(x||'')&&/^T\d$/.test(y||''))assert.equal(x[1],y[1],`${id}: polo ${a}-${b} de ${o.reference} cruzado (${pm[a]} con ${pm[b]})`);
  }
 }
 checks.push(`${id}: esquema y banco son la misma red y los polos de cada contactor son coherentes`);
}

/* 3 · Simulación. */
const solve=(wires,inp,relays,timed=[])=>m.solveSimulation(wires,inp,relays,timed);
const netOf=(wires,inp,sim,timed=[],direction=1)=>{
 const power={};
 for(const id of [...m.relayIds(),'TEMPORIZADOR_1'])if(sim.relays[id])power[id]=true;
 return m.panelElectrical(wires,{...inp,powerContacts:power},sim.relays,timed,{...cal.model,rotorRpm:1450,motorDirection:direction});
};
const V=(n,a,b)=>n.voltage('BORNERA_MOTOR:'+a,'BORNERA_MOTOR:'+b);
const near=(x,y,t,msg)=>assert.ok(x!==null&&x!==undefined&&Math.abs(x-y)<=t,`${msg}: ${x} no es ${y}`);

{ /* marcha y paro */
 const w=wiresOf(m.LESSONS.simple);
 let s=solve(w,{...base,pressed:['S1']});
 assert.equal(s.fault,null);assert.ok(s.relays.CONTACTOR_TERMICO,'S1 da marcha');assert.equal(s.motor.status,'running');
 s=solve(w,base,s.relays);assert.ok(s.relays.CONTACTOR_TERMICO,'retención al soltar S1');
 const n=netOf(w,base,s);assert.equal(n.fault,null);assert.equal(n.connection,'star','el motor del ejemplo está en estrella');
 near(V(n,'U1','U2'),219.4,3,'devanado en estrella');
 s=solve(w,{...base,pressed:['S2']},s.relays);assert.equal(s.motor.status,'off','S2 para');
 s=solve(w,{...base,pressed:['S1']});s=solve(w,{...base,thermalTripped:true},s.relays);
 assert.equal(s.motor.status,'off','TEST detiene');assert.equal(s.pilots[2],true,'TEST enciende P3');
 checks.push('simple: marcha, retención, paro y TEST; motor en estrella con 219 V por devanado');
}

{ /* inversión de giro */
 const w=wiresOf(m.LESSONS.inversion);
 let s=solve(w,{...base,pressed:['S1']});
 assert.ok(s.relays.CONTACTOR_TERMICO&&!s.relays.CONTACTOR_TRIFASICO,'S1: solo KM1');
 const fwd=s.motor.direction;
 const nf=netOf(w,base,s,[],fwd);assert.ok(nf.positiveVolts>nf.negativeVolts,'KM1: secuencia directa');
 s=solve(w,base,s.relays);
 const s3=solve(w,{...base,pressed:['S3']},s.relays);
 assert.ok(s3.relays.CONTACTOR_TERMICO&&!s3.relays.CONTACTOR_TRIFASICO,'enclavamiento: S3 no entra mientras KM1 está activo');
 s=solve(w,{...base,pressed:['S2']},s.relays);assert.equal(s.motor.status,'off');
 s=solve(w,{...base,pressed:['S3']});
 assert.ok(s.relays.CONTACTOR_TRIFASICO&&!s.relays.CONTACTOR_TERMICO,'S3: solo KM2');
 const rev=s.motor.direction;assert.equal(rev,-fwd,'KM2 invierte el giro');
 const nrDirect=netOf(w,base,s,[],fwd);
 assert.ok(nrDirect.negativeVolts>nrDirect.positiveVolts,'KM2 entrega secuencia inversa respecto del giro directo');
 s=solve(w,{...base,pressed:['S1']},s.relays);
 assert.ok(s.relays.CONTACTOR_TRIFASICO&&!s.relays.CONTACTOR_TERMICO,'enclavamiento: S1 no entra mientras KM2 está activo');
 checks.push('inversion: KM1 directo, KM2 inverso, enclavamiento cruzado y paro');
}

const STAR_DELTA=[
 ['estrellaManual',{main:'CONTACTOR_TERMICO',star:'CONTACTOR_TRIFASICO_3',delta:'CONTACTOR_TRIFASICO'}],
 ['estrellaTimer',{main:'CONTACTOR_TERMICO',star:'CONTACTOR_TRIFASICO',delta:'CONTACTOR_TRIFASICO_3'}],
 ['estrellaDosContactores',{main:'TEMPORIZADOR_1',star:'CONTACTOR_TRIFASICO',delta:'CONTACTOR_TERMICO'}],
];
for(const [id,roles] of STAR_DELTA){
 const w=wiresOf(m.LESSONS[id]),timed=id==='estrellaManual'?[]:['TEMPORIZADOR_1'];
 let s=solve(w,{...base,pressed:['S1']});
 assert.equal(s.fault,null,id);
 assert.ok(s.relays[roles.main],`${id}: principal activo`);
 assert.ok(s.relays[roles.star]&&!s.relays[roles.delta],`${id}: estrella`);
 let n=netOf(w,base,s);
 assert.equal(n.fault,null);assert.equal(n.connection,'star',`${id}: conexión de estrella`);
 for(const wd of ['U','V','W'])near(V(n,wd+'1',wd+'2'),219.4,3,`${id}: devanado ${wd} en estrella`);
 near(n.voltage('FUENTE:R','BORNERA_MOTOR:U1'),0,1,`${id}: R llega a U1`);
 near(n.voltage('FUENTE:S','BORNERA_MOTOR:V1'),0,1,`${id}: S llega a V1`);
 near(n.voltage('FUENTE:T','BORNERA_MOTOR:W1'),0,1,`${id}: T llega a W1`);
 s=solve(w,base,s.relays);assert.ok(s.relays[roles.star],`${id}: retención`);
 s=solve(w,{...base,pressed:id==='estrellaManual'?['S3']:[]},s.relays,timed);
 assert.ok(s.relays[roles.delta]&&!s.relays[roles.star],`${id}: triángulo`);
 n=netOf(w,base,s,timed);
 assert.equal(n.fault,null);assert.equal(n.connection,'delta',`${id}: conexión de triángulo`);
 for(const wd of ['U','V','W'])near(V(n,wd+'1',wd+'2'),380,6,`${id}: devanado ${wd} en triángulo`);
 near(n.voltage('FUENTE:R','BORNERA_MOTOR:W2'),0,1,`${id}: R llega a W2`);
 near(n.voltage('FUENTE:S','BORNERA_MOTOR:U2'),0,1,`${id}: S llega a U2`);
 near(n.voltage('FUENTE:T','BORNERA_MOTOR:V2'),0,1,`${id}: T llega a V2`);
 const stop=solve(w,{...base,pressed:['S2']},s.relays,timed);assert.equal(stop.motor.status,'off',`${id}: S2 para`);
 const trip=solve(w,{...base,thermalTripped:true},s.relays,timed);
 assert.equal(trip.motor.status,'off',`${id}: TEST detiene`);assert.equal(trip.pilots[2],true,`${id}: TEST enciende P3`);
 checks.push(`${id}: estrella 219 V y triángulo 380 V por devanado; R→U1/W2, S→V1/U2, T→W1/V2; retención, paro y TEST`);
}
fs.writeFileSync(out+'/results.json',JSON.stringify({checks},null,2));
console.log(checks.map(c=>'PASS '+c).join('\n'));
