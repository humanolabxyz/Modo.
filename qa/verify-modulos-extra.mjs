import {build} from 'esbuild';
import assert from 'node:assert/strict';
import fs from 'node:fs';
await build({entryPoints:['qa/modulos-extra/entry.ts'],bundle:true,platform:'node',format:'esm',outfile:'qa/modulos-extra/model/entry.js',logLevel:'silent',external:['react']});
const m=await import('./modulos-extra/model/entry.js');
const checks=[],pass=s=>checks.push(s);
const baseCount=m.MODULES.length,basePorts=m.TERMINALS.length;
// 1. Bobina A2 arriba y A1 debajo en el contactor + térmico, igual que en el contactor trifásico
const termOf=(mod,id)=>m.MODULES.find(x=>x.id===mod).terminals.find(t=>t.id===id);
assert.ok(termOf('CONTACTOR_TERMICO','A2').y<termOf('CONTACTOR_TERMICO','A1').y);
assert.ok(termOf('CONTACTOR_TRIFASICO','A2').y<termOf('CONTACTOR_TRIFASICO','A1').y);
assert.equal(termOf('CONTACTOR_TERMICO','A2').color,'red');assert.equal(termOf('CONTACTOR_TERMICO','A1').color,'white');
pass('A2 (rojo) queda sobre A1 (blanco) en el contactor + relé térmico');
// 2. Añadir el tercer contactor
const km3=m.addExtraModule('tri');
assert.equal(km3.id,'CONTACTOR_TRIFASICO_3');assert.equal(km3.defaultAlias,'KM3');
assert.equal(m.MODULES.length,baseCount+1);assert.equal(m.TERMINALS.length,basePorts+km3.terminals.length);
assert.ok(m.TERMINAL_BY_ID.has('CONTACTOR_TRIFASICO_3:A1')&&m.TERMINAL_BY_ID.has('CONTACTOR_TRIFASICO_3:T3'));
assert.equal(new Set(m.TERMINALS.map(t=>t.key)).size,m.TERMINALS.length,'identificadores de borne únicos');
const L=m.getLayout(),rects=m.MODULES.map(x=>m.moduleRect(x,L));
assert.ok(!rects.some((a,i)=>rects.slice(i+1).some(b=>m.overlaps(a,b,0))),'el panel nuevo no se superpone');
assert.ok(m.contactorIds().includes('CONTACTOR_TRIFASICO_3'));
assert.equal(m.PORT_COUNT,basePorts,'el inventario base no cambia');
pass('Añadir un contactor crea KM3 con bornes únicos, en un hueco libre y sin tocar el inventario base');
// 3. KM3 se energiza con su propio mando
const on={...m.emptySimulation(),enabled:true,plugged:true,breakers:[true,true]};
const cables=pairs=>{const ws=[];pairs.forEach(([a,b])=>ws.push(m.createCable(a,b,ws)));return ws};
const K='CONTACTOR_TRIFASICO_3:';
const control=cables([['FUENTE:F','BOTONERAS:S3:3'],['BOTONERAS:S3:4',K+'A1'],[K+'A2','FUENTE:N'],['FUENTE:N','BOTONERAS:N']]);
assert.equal(!!m.solveSimulation(control,on).relays['CONTACTOR_TRIFASICO_3'],false);
const pressed=m.solveSimulation(control,{...on,pressed:['S3']});
assert.equal(pressed.relays['CONTACTOR_TRIFASICO_3'],true);assert.equal(!!pressed.relays['CONTACTOR_TERMICO'],false);
// sus contactos de potencia cierran con la bobina activa
const power=cables([['FUENTE:R',K+'L1'],['FUENTE:S',K+'L2'],['FUENTE:T',K+'L3'],[K+'T1','BORNERA_MOTOR:U1'],[K+'T2','BORNERA_MOTOR:V1'],[K+'T3','BORNERA_MOTOR:W1'],['BORNERA_MOTOR:W2','BORNERA_MOTOR:U2'],['BORNERA_MOTOR:U2','BORNERA_MOTOR:V2'],...control.map(w=>[w.from.terminalId,w.to.terminalId])]);
const full={...on,forceBreaker:true};
let r=m.solveSimulation(power,{...full,pressed:['S3']});assert.equal(r.motor.status,'running');
assert.notEqual(m.solveSimulation(power,full).motor.status,'running','sin pulsar, KM3 no cierra y el motor no gira');
pass('KM3 actúa como contactor: su bobina responde al mando y sus contactos de potencia alimentan el motor');
// 4. Otros paneles: contactor n.º 4 y segundo temporizador
const km4=m.addExtraModule('tri'),kt=m.addExtraModule('timer');
assert.equal(km4.id,'CONTACTOR_TRIFASICO_4');assert.equal(kt.id,'TEMPORIZADOR_3');assert.equal(kt.category,'temporizadores');
assert.ok(kt.terminals.some(t=>t.id==='67')&&m.TERMINAL_BY_ID.has('TEMPORIZADOR_3:A1'));
pass('Se pueden añadir más contactores y temporizadores con numeración correlativa');
// 5. Quitar paneles añadidos; los base no se quitan
assert.equal(m.removeExtraModule('CONTACTOR_TRIFASICO'),false);assert.equal(m.removeExtraModule('FUENTE'),false);
assert.equal(m.removeExtraModule('CONTACTOR_TRIFASICO_4'),true);
assert.ok(!m.TERMINAL_BY_ID.has('CONTACTOR_TRIFASICO_4:A1'));assert.equal(m.addExtraModule('tri').id,'CONTACTOR_TRIFASICO_4','el número libre se reutiliza');
for(const id of ['CONTACTOR_TRIFASICO_4','TEMPORIZADOR_3'])m.removeExtraModule(id);
pass('Los paneles añadidos se pueden quitar; los del banco base no');
// 6. Acople: soltar sobre otro panel lo coloca en el hueco libre más cercano
const L2=m.getLayout(),over=m.snapModule(L2,'CONTACTOR_TRIFASICO_3',{x:600,y:450});
const me=m.MODULES.find(x=>x.id==='CONTACTOR_TRIFASICO_3');
assert.ok(over.snapped&&over.target);assert.ok(!m.MODULES.filter(x=>x.id!==me.id).some(x=>m.overlaps({...over.pos,w:me.w,h:me.h},m.moduleRect(x,L2))));
const up=m.snapModule(L2,'CONTACTOR_TRIFASICO_3',{x:690,y:412-me.h-30});
assert.equal(up.pos.y,Math.max(m.TOP_Y,412-me.h-24),'se puede dejar encima de otro panel, a la distancia de acople');
pass('Soltar un panel sobre otro lo acopla al lado, encima o debajo, nunca superpuesto');
// 6b. Soltar un panel sobre otro los intercambia (también con anchos distintos) sin superponerlos
{
 const L3=m.getLayout(),rectsOf=moves=>m.MODULES.map(x=>({id:x.id,...(moves[x.id]??m.modulePos(x,L3)),w:x.w,h:x.h}));
 const disjoint=moves=>{const r=rectsOf(moves);return !r.some((a,i)=>r.slice(i+1).some(b=>m.overlaps(a,b,0)))};
 const get=id=>m.MODULES.find(x=>x.id===id);
 // misma fila, anchos distintos: la fuente (585) sobre las botoneras (615)
 const fuente=m.modulePos(get('FUENTE'),L3),botones=m.modulePos(get('BOTONERAS'),L3);
 const row=m.dropModule(L3,'FUENTE',{x:botones.x+30,y:botones.y+10},fuente);
 assert.equal(row.kind,'swap');assert.equal(row.swapWith,'BOTONERAS');
 assert.equal(row.moves.BOTONERAS.x,65);assert.equal(row.moves.FUENTE.x,65+get('BOTONERAS').w+m.GAP);assert.ok(disjoint(row.moves));
 // misma columna: el contactor + térmico sobre la fuente
 const col=m.dropModule(L3,'CONTACTOR_TERMICO',{x:fuente.x+10,y:fuente.y+20},m.modulePos(get('CONTACTOR_TERMICO'),L3));
 assert.equal(col.kind,'swap');assert.equal(col.swapWith,'FUENTE');assert.equal(col.moves.CONTACTOR_TERMICO.y,76);assert.ok(disjoint(col.moves));
 // roce leve: solo se acopla, no intercambia
 const graze=m.dropModule(L3,'TEMPORIZADOR_1',{x:65,y:798-m.MODULES.find(x=>x.id==='TEMPORIZADOR_1').h+4},m.modulePos(get('TEMPORIZADOR_1'),L3));
 assert.notEqual(graze.kind,'swap');assert.ok(disjoint(graze.moves));
 // fuera de todo: queda libre
 const far=m.dropModule(L3,'TEMPORIZADOR_1',{x:300,y:2200},m.modulePos(get('TEMPORIZADOR_1'),L3));assert.notEqual(far.kind,'swap');
}
pass('Soltar un panel sobre otro los intercambia (misma fila o columna, aunque midan distinto) sin superposiciones; un roce solo acopla');
// 7. Prácticas guardadas: los cables a paneles que ya no existen se descartan sin perder el resto
const doc=m.emptyPractice();
const good=m.createCable('FUENTE:F','BOTONERAS:S3:3',[]);
const orphan={...m.createCable('FUENTE:N','BOTONERAS:N',[]),id:'orphan-1',to:{terminalId:'CONTACTOR_TRIFASICO_9:A1'}};
const read=m.readPractice(JSON.parse(JSON.stringify({...doc,wires:[good,orphan]})));
assert.deepEqual(read.wires.map(w=>w.id),[good.id]);
const bad={...orphan,id:'bad-1',to:{terminalId:'NO_EXISTE:A1'}};
assert.throws(()=>m.readPractice(JSON.parse(JSON.stringify({...doc,wires:[good,bad]}))));
pass('Al abrir una práctica se descartan cables a paneles retirados; los bornes inválidos siguen rechazándose');
// 8. Arranque estrella-triángulo con temporizador (retardo a la conexión)
{
 const ws=cables(m.SIMULATION_EXAMPLES.starDelta.pairs);
 const relaysOf=r=>({KM1:!!r.relays.CONTACTOR_TERMICO,KM2:!!r.relays.CONTACTOR_TRIFASICO,KM3:!!r.relays.CONTACTOR_TRIFASICO_3,KT:!!r.relays.TEMPORIZADOR_1});
 const settle=(input,timed,from=m.OFF_RELAYS())=>{let r=m.solveSimulation(ws,input,from,timed);for(let i=0;i<4;i++)r=m.solveSimulation(ws,input,r.relays,timed);return r};
 const run={...on,forceBreaker:true};
 let r=settle({...run,pressed:['S3']},[]);
 assert.deepEqual(relaysOf(r),{KM1:true,KM2:false,KM3:true,KT:true},'al pulsar marcha: KM1, KM3 (estrella) y el temporizador');
 assert.deepEqual([r.motor.status,r.motor.connection],['running','star']);
 r=settle({...run,pressed:[]},[],r.relays);
 assert.deepEqual(relaysOf(r),{KM1:true,KM2:false,KM3:true,KT:true},'KM1 se mantiene al soltar marcha; sigue la estrella mientras corre el retardo');
 assert.equal(r.motor.connection,'star');
 r=settle({...run,pressed:[]},['TEMPORIZADOR_1'],r.relays);
 assert.deepEqual(relaysOf(r),{KM1:true,KM2:true,KM3:false,KT:true},'al terminar el retardo cae KM3 y entra KM2');
 assert.deepEqual([r.motor.status,r.motor.connection,r.motor.direction],['running','delta',1]);
 assert.notEqual(r.motor.status,'fault');assert.equal(r.fault,null);
 // el contacto 13-14 del temporizador sigue a la bobina; sin retardo cumplido 67-68 está abierto
 const early=m.solveSimulation(ws,{...run,pressed:[]},r.relays,[]);assert.equal(!!early.relays.CONTACTOR_TRIFASICO,false,'sin retardo cumplido KM2 no entra');
 // parada: S2 corta el mando, todo vuelve a reposo y el motor se detiene
 const stop=settle({...run,pressed:['S2']},['TEMPORIZADOR_1'],r.relays);
 assert.deepEqual(relaysOf(stop),{KM1:false,KM2:false,KM3:false,KT:false});assert.notEqual(stop.motor.status,'running');
 // reinicio: tras parar y volver a arrancar el retardo empieza de nuevo (el hook limpia «timed» al caer la bobina)
 r=settle({...run,pressed:['S3']},[],stop.relays);assert.equal(r.motor.connection,'star');
 // disparo del térmico detiene todo
 const tripped=settle({...run,pressed:[],thermalTripped:true},['TEMPORIZADOR_1'],settle({...run,pressed:['S3']},['TEMPORIZADOR_1']).relays);
 assert.notEqual(tripped.motor.status,'running');
 // KM2 y KM3 nunca cierran a la vez (enclavamiento): ningún estado de la secuencia produce cortocircuito
 assert.ok(!['short','unstable'].includes(String(r.fault)));
}
pass('Estrella-triángulo: al pulsar marcha entra la estrella; al cumplirse el retardo cae KM3 y entra KM2 (triángulo); parada y térmico detienen todo');
// 9. Inversión de giro: ejemplo y lección guiada hechos a partir del circuito de un compañero
{
 const L=m.INVERSION_LESSON;
 assert.equal(L.steps.length,41);assert.equal(new Set(L.steps.map(x=>x.id)).size,41);
 for(const st of L.steps){
  assert.ok(m.TERMINAL_BY_ID.has(st.from)&&m.TERMINAL_BY_ID.has(st.to),'bornes del paso existen: '+st.id);
  assert.ok(st.region.w>0&&st.region.h>0&&st.region.x>=0&&st.region.y>=0&&st.region.x+st.region.w<=1000&&st.region.y+st.region.h<=1000,'región dentro de la imagen: '+st.id);
  assert.ok(st.explanation.length>20&&st.title.length>5);
 }
 // la lección y el ejemplo describen el mismo circuito, sin cables repetidos
 const keys=L.pairs.map(([a,b])=>[a,b].sort().join('|'));assert.equal(new Set(keys).size,41);
 assert.deepEqual(m.SIMULATION_EXAMPLES.inversion.pairs,L.pairs);
 // al terminar todos los pasos, cada paso queda cumplido por la red de cables
 const ws=cables(L.pairs);assert.ok(L.steps.every(st=>m.connectedByCables(st.from,st.to,ws)));
 assert.ok(!L.steps.every(st=>m.connectedByCables(st.from,st.to,ws.slice(0,20))),'con la mitad de los cables faltan pasos');
 // una práctica guiada con la lección se guarda y se vuelve a leer (diagrama integrado y pasos)
 const doc={...m.emptyPractice(),mode:'guided',diagram:L.diagram,steps:L.steps,wires:[]};
 const back=m.readPractice(JSON.parse(JSON.stringify(doc)));assert.equal(back.steps.length,41);assert.equal(back.diagram.src,'/diagrams/leccion-inversion-giro.png');
 assert.throws(()=>m.readPractice(JSON.parse(JSON.stringify({...doc,diagram:{...L.diagram,src:'/diagrams/otra-cosa.png'}}))));
 // comportamiento del circuito: marcha 1, retención, enclavamiento, paro, marcha 2 (giro inverso), térmico
 const wsx=cables(m.SIMULATION_EXAMPLES.inversion.pairs),run={...on,forceBreaker:true};
 let rel=m.OFF_RELAYS();
 const go=(pressed,extra={})=>{let r;for(let i=0;i<5;i++){r=m.solveSimulation(wsx,{...run,pressed,...extra},rel,[]);rel=r.relays}return r};
 const km=r=>[+!!r.relays.CONTACTOR_TERMICO,+!!r.relays.CONTACTOR_TRIFASICO].join('');
 let r=go([]);assert.equal(km(r),'00');assert.deepEqual(r.pilots,[false,true,false,false],'en reposo solo luce P2');
 r=go(['S1']);assert.equal(km(r),'10');assert.deepEqual([r.motor.status,r.motor.direction],['running',1]);assert.deepEqual(r.pilots,[true,false,false,false]);
 r=go([]);assert.equal(km(r),'10','KM1 se mantiene');
 r=go(['S3']);assert.equal(km(r),'10','con KM1 activo, S3 no hace entrar a KM2 (enclavamiento)');
 go([]);r=go(['S2']);assert.equal(km(r),'00');r=go([]);assert.equal(km(r),'00');
 r=go(['S3']);assert.equal(km(r),'01');assert.deepEqual([r.motor.status,r.motor.direction],['running',-1],'KM2 invierte el giro');assert.deepEqual(r.pilots,[false,false,false,true]);
 go([]);r=go(['S1']);assert.equal(km(r),'01','con KM2 activo, S1 no hace entrar a KM1');
 go([]);go(['S2']);go([]);
 r=go(['S1'],{thermalTripped:true});assert.equal(km(r),'00');assert.equal(r.pilots[2],true,'el térmico disparado enciende P3');
}
pass('Inversión de giro: la lección tiene los 41 cables del compañero con su orden, sus bornes y regiones son válidos, se guarda y se relee, y el circuito arranca en ambos sentidos con enclavamiento, paro y térmico');
// 10. Marcha y paro con retención (el circuito simple del compañero)
{
 const L=m.SIMPLE_LESSON;
 assert.equal(L.steps.length,24);assert.equal(new Set(L.steps.map(x=>x.id)).size,24);
 for(const st of L.steps){
  assert.ok(m.TERMINAL_BY_ID.has(st.from)&&m.TERMINAL_BY_ID.has(st.to),'bornes del paso existen: '+st.id);
  assert.ok(st.region.w>0&&st.region.h>0&&st.region.x>=0&&st.region.y>=0&&st.region.x+st.region.w<=1000&&st.region.y+st.region.h<=1000);
  assert.ok(st.explanation.length>20&&st.title.length>5);
 }
 assert.equal(new Set(L.pairs.map(([a,b])=>[a,b].sort().join('|'))).size,24);
 assert.deepEqual(m.SIMPLE_LESSON.pairs,m.SIMULATION_EXAMPLES.simple.pairs);
 assert.ok(!L.pairs.some(([a,b])=>a.startsWith('CONTACTOR_TRIFASICO')||b.startsWith('CONTACTOR_TRIFASICO')),'solo usa KM1');
 const ws=cables(L.pairs);assert.ok(L.steps.every(st=>m.connectedByCables(st.from,st.to,ws)));
 const back=m.readPractice(JSON.parse(JSON.stringify({...m.emptyPractice(),mode:'guided',diagram:L.diagram,steps:L.steps,wires:[]})));assert.equal(back.diagram.src,'/diagrams/leccion-marcha-paro.png');
 const run={...on,forceBreaker:true};let rel=m.OFF_RELAYS();
 const go=(pressed,extra={})=>{let r;for(let i=0;i<5;i++){r=m.solveSimulation(ws,{...run,pressed,...extra},rel,[]);rel=r.relays}return r};
 let r=go([]);assert.equal(!!r.relays.CONTACTOR_TERMICO,false);assert.deepEqual(r.pilots,[false,true,false,false],'en reposo luce P2');
 r=go(['S1']);assert.equal(r.relays.CONTACTOR_TERMICO,true);assert.deepEqual([r.motor.status,r.motor.connection,r.motor.direction],['running','star',1]);assert.deepEqual(r.pilots,[true,false,false,false]);
 r=go([]);assert.equal(r.relays.CONTACTOR_TERMICO,true,'se retiene al soltar S1');
 r=go(['S3']);assert.equal(r.relays.CONTACTOR_TERMICO,true,'S3 no está cableado: no cambia nada');
 go(['S2']);r=go([]);assert.equal(!!r.relays.CONTACTOR_TERMICO,false,'S2 para y no rearranca solo');
 r=go(['S1'],{thermalTripped:true});assert.equal(!!r.relays.CONTACTOR_TERMICO,false);assert.equal(r.pilots[2],true);
}
pass('Marcha y paro: la lección de 24 pasos usa solo KM1, coincide con el ejemplo, se guarda y se relee, y el circuito arranca, se retiene, para y respeta el térmico');
// 11. Esquemas de las lecciones: cada cable del banco tiene su línea en el esquema
for(const L of [m.SIMPLE_LESSON,m.INVERSION_LESSON]){
 const cade=m.LESSON_SCHEMATICS[L.schematic];
 const missing=L.steps.filter(st=>{const t=m.traceStep(cade,st.from,st.to);return !t||!t.wires.length}).map(st=>st.id+' '+st.from+' → '+st.to);
 assert.deepEqual(missing,[],'pasos sin línea en el esquema de '+L.id);
 // los bornes del banco que usa la lección están todos representados en el esquema
 const bound=new Set(cade.PORTS.map(p=>p.panel).filter(Boolean));
 for(const st of L.steps)assert.ok(bound.has(st.from)&&bound.has(st.to),'borne sin símbolo: '+st.from+' / '+st.to);
 // tramos distintos para cables distintos: ningún par de pasos ilumina exactamente las mismas líneas
 const sig=L.steps.map(st=>m.traceStep(cade,st.from,st.to).wires.slice().sort((a,b)=>a-b).join(','));
 const dup=sig.filter((x,i)=>sig.indexOf(x)!==i);assert.deepEqual(dup,[],'dos pasos iluminan la misma línea en '+L.id);
 // todo conductor del esquema se ilumina en algún paso (el esquema no tiene líneas huérfanas)
 const lit=new Set(sig.flatMap(x=>x.split(',').map(Number)));
 // (las uniones internas de un módulo —contactor→térmico, retorno de pilotos— no son cables del alumno y no se iluminan)
 const orphan=cade.WIRES.filter(w=>!lit.has(w.id)).map(w=>w.id),internal=cade.WIRES.filter(w=>w.internal).map(w=>w.id);
 assert.deepEqual(orphan,internal,'líneas sin paso que no son internas en '+L.id);
}
{ // casos concretos
 const c=m.LESSON_SCHEMATICS.inversion,t=(a,b)=>m.traceStep(c,a,b).wires.length;
 assert.ok(t('FUENTE:N','BOTONERAS:N')>=3,'el neutro recorre la barra');
 assert.notDeepEqual(m.traceStep(c,'CONTACTOR_TRIFASICO:T1','CONTACTOR_TERMICO:T3').wires,m.traceStep(c,'CONTACTOR_TRIFASICO:T3','CONTACTOR_TERMICO:T1').wires,'el cruce de fases ilumina líneas distintas');
}
pass('Esquemas de las lecciones: los 24 y 41 cables tienen su línea iluminable, todos los bornes tienen símbolo, ningún paso repite línea y no quedan líneas sin armar');
// 12. Esquema ↔ banco: cada línea del esquema sabe qué cable del banco representa
for(const L of [m.SIMPLE_LESSON,m.INVERSION_LESSON]){
 const cade=m.LESSON_SCHEMATICS[L.schematic];
 for(const w of cade.WIRES){
  const steps=m.stepsForWire(L,w.id);
  if(w.internal)assert.equal(steps.length,0,'una unión interna no representa ningún cable: '+L.id+' #'+w.id);
  else assert.ok(steps.length>=1,'toda línea con cable tiene su paso: '+L.id+' #'+w.id);
 }
 // cada símbolo con bornes del banco devuelve los cables que le llegan
 for(const o of cade.SYMBOLS.filter(o=>cade.PORTS.some(p=>p.objectId===o.id&&p.panel))){
  const steps=m.stepsForSymbol(L,o.id);
  const keys=new Set(cade.PORTS.filter(p=>p.objectId===o.id&&p.panel).map(p=>p.panel));
  assert.ok(steps.every(st=>keys.has(st.from)||keys.has(st.to)));
 }
 // progreso: al armar los primeros cables se marcan en verde sus líneas y el paso actual en naranja
 const first=m.lessonProgress(L,0,[]);assert.ok(first.active.length>0&&first.done.length===0&&first.ends.length===2);
 const ws=cables(L.pairs.slice(0,5)),p5=m.lessonProgress(L,5,ws);
 assert.ok(p5.done.length>=5,'las líneas de los cables armados quedan en verde');assert.ok(p5.active.every(id=>!p5.done.includes(id)));
}
{
 const L=m.INVERSION_LESSON,cade=m.LESSON_SCHEMATICS.inversion;
 const rail=cade.WIRES.find(w=>w.y===235&&w.y2===235&&w.x===280);
 assert.ok(m.stepsForWire(L,rail.id).length>=2,'un tramo compartido de la barra de neutro pertenece a varios cables');
 const km2=cade.SYMBOLS.find(o=>o.reference==='KM2'&&o.shape==='contactor3');
 assert.ok(m.stepsForSymbol(L,km2.id).length===6,'el contactor KM2 recibe tres cables de fase y entrega tres al motor');
}
pass('Esquema ↔ banco: cada línea con cable apunta a sus pasos (las uniones internas a ninguno), cada símbolo a sus cables, y el progreso marca en naranja el paso y en verde lo armado');
const report={checks};fs.writeFileSync('qa/modulos-extra/verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
