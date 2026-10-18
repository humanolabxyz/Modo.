import {build} from 'esbuild';
import assert from 'node:assert/strict';
import fs from 'node:fs';
await build({entryPoints:['src/data/simulation.ts','src/data/wiring.ts','src/data/layout.ts','src/data/panel.ts'],bundle:true,platform:'node',format:'esm',outdir:'qa/motor/model',logLevel:'silent',external:['react']});
const {solveSimulation,emptySimulation,SIMULATION_EXAMPLES,OFF_RELAYS}=await import('./motor/model/simulation.js');
const {createCable}=await import('./motor/model/wiring.js');
const layout=await import('./motor/model/layout.js');
const {MODULES:MODS}=await import('./motor/model/panel.js');
const checks=[],pass=s=>checks.push(s);
const cables=pairs=>{const ws=[];pairs.forEach(([a,b])=>ws.push(createCable(a,b,ws)));return ws};
const on={...emptySimulation(),enabled:true,plugged:true,forceBreaker:true,breakers:[true,true]};
const M='BORNERA_MOTOR:',KM='CONTACTOR_TERMICO:';
const power=(map=['U1','V1','W1'],extra=[['W2','U2'],['U2','V2']])=>[
 ['FUENTE:R',KM+'L1'],['FUENTE:S',KM+'L2'],['FUENTE:T',KM+'L3'],
 [KM+'T1',M+map[0]],[KM+'T2',M+map[1]],[KM+'T3',M+map[2]],...extra.map(([a,b])=>[M+a,M+b])];
const direct=(map,extra)=>cables([['FUENTE:R',M+map[0]],['FUENTE:S',M+map[1]],['FUENTE:T',M+map[2]],...extra.map(([a,b])=>[M+a,M+b])]);
// 1. Sin cables o sin FUERZA el motor no gira
assert.equal(solveSimulation([],on).motor.status,'off');
assert.equal(solveSimulation(direct(['U1','V1','W1'],[['W2','U2'],['U2','V2']]),{...on,forceBreaker:false}).motor.status,'off');
assert.equal(solveSimulation(direct(['U1','V1','W1'],[['W2','U2'],['U2','V2']]),{...on,plugged:false}).motor.status,'off');pass('Sin FUERZA, sin enchufe o sin cables el motor permanece detenido');
// 2. Estrella y triángulo, conectados directamente
const star=solveSimulation(direct(['U1','V1','W1'],[['W2','U2'],['U2','V2']]),on).motor;
assert.deepEqual([star.status,star.connection,star.direction],['running','star',1]);
const delta=solveSimulation(direct(['U1','V1','W1'],[['U1','W2'],['V1','U2'],['W1','V2']]),on).motor;
assert.deepEqual([delta.status,delta.connection,delta.direction],['running','delta',1]);assert.ok(delta.speed>star.speed);pass('Estrella y triángulo giran; el triángulo a mayor velocidad');
// 3. Cruzar dos fases invierte el sentido
assert.equal(solveSimulation(direct(['V1','U1','W1'],[['W2','U2'],['U2','V2']]),on).motor.direction,-1);
assert.equal(solveSimulation(direct(['V1','W1','U1'],[['W2','U2'],['U2','V2']]),on).motor.direction,1);pass('Permutar dos fases invierte el sentido; la rotación cíclica lo conserva');
// 4. Falta de fase, bobinas abiertas, fases iguales, cortocircuito
const missing=solveSimulation(cables([['FUENTE:R',M+'U1'],['FUENTE:S',M+'V1'],[M+'W2',M+'U2'],[M+'U2',M+'V2']]),on).motor;assert.equal(missing.status,'fault');assert.match(missing.message,/Falta una fase/);
assert.equal(solveSimulation(direct(['U1','V1','W1'],[]),on).motor.status,'fault');
assert.equal(solveSimulation(cables([['FUENTE:R',M+'U1'],['FUENTE:R',M+'V1'],['FUENTE:T',M+'W1'],[M+'W2',M+'U2'],[M+'U2',M+'V2']]),on).motor.status,'fault');
const short=solveSimulation(cables([['FUENTE:R','FUENTE:S']]),on).motor;assert.equal(short.status,'fault');assert.match(short.message,/Cortocircuito/);pass('Falta de fase, bobinas abiertas, fases repetidas y cortocircuito se detectan sin girar');
// 5. A través del contactor: gira solo con KM1 activo y se detiene si dispara el térmico
const viaKm=cables(power());
assert.equal(solveSimulation(viaKm,on,OFF_RELAYS()).motor.status,'off');
const closed={...OFF_RELAYS(),CONTACTOR_TERMICO:true};
assert.equal(solveSimulation(viaKm,{...on,pressed:[]},closed).relays.CONTACTOR_TERMICO,false,'sin mando la bobina cae');
const example=cables(SIMULATION_EXAMPLES.motor.pairs);
let relays=OFF_RELAYS();for(let i=0;i<3;i++)relays=solveSimulation(example,{...on,pressed:['S3']},relays).relays;
assert.equal(relays.CONTACTOR_TERMICO,true);
const running=solveSimulation(example,{...on,pressed:[]},relays);assert.equal(running.relays.CONTACTOR_TERMICO,true,'KM1 se mantiene al soltar marcha');assert.deepEqual([running.motor.status,running.motor.connection],['running','star']);
assert.ok(running.liveWireIds.length>=10,'cables de fuerza resaltados');
const tripped=solveSimulation(example,{...on,pressed:[],thermalTripped:true},relays).motor;assert.notEqual(tripped.status,'running');pass('El ejemplo arranca el motor con KM1, se mantiene y se detiene al disparar el térmico');
// 5b. Ejemplos de giro: invertido y triángulo
const runExample=name=>{const ws=cables(SIMULATION_EXAMPLES[name].pairs);let r=OFF_RELAYS();for(let i=0;i<3;i++)r=solveSimulation(ws,{...on,pressed:['S3']},r).relays;return solveSimulation(ws,{...on,pressed:[]},r).motor};
const fwd=runExample('motor'),rev=runExample('motorRev'),tri=runExample('motorDelta');
assert.equal(fwd.direction,1);assert.equal(rev.direction,-1);assert.equal(rev.connection,'star');assert.deepEqual([tri.connection,tri.direction],['delta',1]);pass('Los ejemplos de estrella, giro invertido y triángulo dan el sentido y la conexión esperados');
// 6. Acoplamiento: posiciones base sin solapes y snap
const L=layout.DEFAULT_LAYOUT,ids=Object.keys(L);assert.equal(ids.length,6);
const frame=layout.boardFrame(L);assert.equal(frame.rows.length,3);
const snapped=layout.snapModule(L,'TEMPORIZADOR_1',{x:70,y:800});assert.ok(snapped&&snapped.pos.x===65&&snapped.pos.y===798,'se acopla al riel y al margen');
const clear=(id,at)=>{const r=layout.snapModule(L,id,at);assert.ok(r);return r};
const noOverlap=(id,r)=>{const mine={x:r.pos.x,y:r.pos.y,w:MODS.find(m=>m.id===id).w,h:MODS.find(m=>m.id===id).h};return !MODS.filter(m=>m.id!==id).some(m=>layout.overlaps(mine,layout.moduleRect(m,L)))};
for(const [id,at] of [['TEMPORIZADOR_1',{x:300,y:430}],['TEMPORIZADOR_1',{x:690,y:90}],['FUENTE',{x:70,y:700}]]){const r=clear(id,at);assert.ok(noOverlap(id,r),'soltar sobre otro módulo lo coloca en un hueco libre: '+id);assert.ok(r.snapped);assert.ok(r.target,'queda acoplado a un vecino')}
const nextTo=layout.snapModule({...L,TEMPORIZADOR_1:{x:65,y:1200}},'TEMPORIZADOR_1',{x:100,y:1210});assert.equal(nextTo.pos.x,65);pass('Acoplamiento: se pega a bordes y riel; al soltar sobre otro módulo lo coloca en el hueco libre más cercano');
const report={checks};fs.writeFileSync('qa/motor/verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
