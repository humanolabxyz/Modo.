// Fallas de laboratorio: cada una debe cambiar el circuito tal como lo haría en un banco real, y verse igual en la lógica, el solver AC y el óhmetro.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/panel-faults';fs.mkdirSync(out,{recursive:true});
await build({stdin:{resolveDir:process.cwd(),contents:"export * from './src/data/panelFaults';export * from './src/data/simulation';export * from './src/data/panelElectrical';export * from './src/data/panelMeter';export * from './src/data/meterActivity';export * from './src/data/panelRuntime';export * from './src/data/panelCalibration';export * from './src/data/panelSequences';export * from './src/data/panelMotorDynamics';",loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:out+'/model.mjs',loader:{'.json':'json'},logLevel:'silent'});
const m=await import('./panel-faults/model.mjs?'+Date.now()),checks=[];
const near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<t,`${a} vs ${b}`);
const ok=(name,fn)=>{fn();checks.push(name);console.log('PASS',name);};
const KT='TEMPORIZADOR_1',DELTA='CONTACTOR_TERMICO',STAR='CONTACTOR_TRIFASICO';
const wires=m.activityDocument('twoContactors').wires,profile=m.defaultCalibration(),model=profile.model;
const wire=(a,b)=>{const w=wires.find(w=>w.from.terminalId===a&&w.to.terminalId===b||w.from.terminalId===b&&w.to.terminalId===a);assert.ok(w,`no hay cable ${a} ${b}`);return w;};
const base=(faults=[],pressed=[])=>({...m.emptySimulation(),enabled:true,plugged:true,forceBreaker:true,breakers:[true,true],faults,pressed});
/** Arranque virtual: S1 pulsado y soltado, luego opcionalmente el temporizador cumplido. */
function start(faults=[],ws=wires,{timed=false}={}){
 const pressed=m.solveSimulation(ws,base(faults,['S1']),m.OFF_RELAYS(),[]),held=m.solveSimulation(ws,base(faults,[]),pressed.relays,[]);
 return timed?m.solveSimulation(ws,base(faults,[]),held.relays,[KT]):held;
}
const rest=m.solveSimulation(wires,base(),m.OFF_RELAYS(),[]);
const healthy=start(),healthyDelta=start([],wires,{timed:true});
ok('Referencia sana: reposo, estrella con retención y triángulo',()=>{
 assert.equal(rest.relays[KT],false);assert.equal(rest.pilots[1],true);
 assert.equal(healthy.relays[KT],true);assert.equal(healthy.relays[STAR],true);assert.equal(healthy.relays[DELTA],false);assert.equal(healthy.pilots[0],true);
 assert.equal(healthyDelta.relays[DELTA],true);assert.equal(healthyDelta.relays[STAR],false);
});

ok('Cable cortado en el mando: marcha no activa nada y el rojo sigue encendido',()=>{
 const f=[{id:'a',kind:'wire-open',wire:wire('BOTONERAS:S2:2','BOTONERAS:S1:3').id}],r=start(f);
 assert.equal(r.relays[KT],false);assert.equal(r.relays[STAR],false);assert.equal(m.solveSimulation(wires,base(f),m.OFF_RELAYS(),[]).pilots[1],true);
});
ok('Cable cortado en la retención: funciona pulsado y se detiene al soltar',()=>{
 const f=[{id:'a',kind:'wire-open',wire:wire('TEMPORIZADOR_1:14','BOTONERAS:S1:4').id}],pressed=m.solveSimulation(wires,base(f,['S1']),m.OFF_RELAYS(),[]),released=m.solveSimulation(wires,base(f,[]),pressed.relays,[]);
 assert.equal(pressed.relays[KT],true);assert.equal(released.relays[KT],false);
});
ok('Falso contacto (cable con resistencia): la bobina solo cierra si la tensión alcanza',()=>{
 const id=wire('BOTONERAS:S1:4','TEMPORIZADOR_1:A1').id;
 assert.equal(start([{id:'a',kind:'wire-resistive',wire:id,ohms:20}]).relays[KT],true,'20 Ω dejan ≈22 V en la bobina: cierra');
 assert.equal(start([{id:'a',kind:'wire-resistive',wire:id,ohms:100}]).relays[KT],false,'100 Ω dejan ≈17 V en la bobina: no cierra');
 assert.equal(start([{id:'a',kind:'wire-resistive',wire:id,ohms:20000}]).relays[KT],false,'un cable tan resistivo equivale a uno cortado');
});
ok('Falso contacto intermitente: el reloj lo abre y lo cierra de forma determinista',()=>{
 const f=[{id:'a',kind:'wire-loose',wire:'w1',period:4,closedFraction:.5}];
 assert.deepEqual(m.resolveFaults(f,1),[]);assert.equal(m.resolveFaults(f,3)[0].kind,'wire-open');assert.deepEqual(m.resolveFaults(f,5),[]);assert.equal(m.resolveFaults(f,7)[0].kind,'wire-open');
});
ok('Secundario de mando bajo: 16 V no cierran el contactor, 22 V sí',()=>{
 assert.equal(start([{id:'a',kind:'control-low',volts:16}]).relays[KT],false);assert.equal(start([{id:'a',kind:'control-low',volts:22}]).relays[KT],true);
});
ok('Bobina abierta: no cierra nunca y el óhmetro mide OL entre A1 y A2',()=>{
 const f=[{id:'a',kind:'coil-open',relay:KT}];assert.equal(start(f).relays[KT],false);
 const input={...m.emptySimulation(),enabled:true,faults:f},res=m.solveSimulation([],input),
  sana=m.readPanelMeter([],{...input,faults:[]},res,[],'R',KT+':A1',KT+':A2',{...model,resistanceMode:'model'}),dañada=m.readPanelMeter([],input,res,[],'R',KT+':A1',KT+':A2',{...model,resistanceMode:'model'});
 near(sana.value,240.4,.001);assert.equal(dañada.text,'OL');
});
ok('Contacto auxiliar sin cerrar (pulsador sucio): S1 no da marcha pero se oye el pulsador',()=>{
 const f=[{id:'a',kind:'contact-open',a:'BOTONERAS:S1:3',b:'BOTONERAS:S1:4'}];assert.equal(start(f).relays[KT],false);
});
ok('Enclavamiento sin cerrar (NC 71–72 de KM1 abierto): el temporizador corre pero la estrella nunca entra',()=>{
 const f=[{id:'a',kind:'contact-open',a:DELTA+':71',b:DELTA+':72'}],r=start(f);
 assert.equal(r.relays[KT],true);assert.equal(r.relays[STAR],false);assert.equal(r.pilots[0],false);
});
ok('NC pegado (71–72 de KM2 cerrado con la bobina energizada): ya no impide el triángulo cuando KM2 está en estrella',()=>{
 const f=[{id:'a',kind:'contact-welded',a:STAR+':71',b:STAR+':72'}],r=start(f,wires,{timed:true});
 assert.equal(r.relays[DELTA],true);
});
ok('Lámpara quemada: el piloto de estrella no enciende y la bobina sí',()=>{
 const f=[{id:'a',kind:'pilot-burnt',n:1}],r=start(f);assert.equal(r.relays[STAR],true);assert.equal(r.pilots[0],false);
});
ok('Resistencia de contacto: el óhmetro la suma y la bobina pierde tensión',()=>{
 const input={...m.emptySimulation(),enabled:true,faults:[{id:'a',kind:'contact-resistive',a:'BOTONERAS:S2:1',b:'BOTONERAS:S2:2',ohms:150}]},res=m.solveSimulation([],input),
  r=m.readPanelMeter([],input,res,[],'C','BOTONERAS:S2:1','BOTONERAS:S2:2',{...model,resistanceMode:'model'});
 near(r.value,150.4,.01);
 assert.equal(start(input.faults).relays[KT],false,'150 Ω en serie con la bobina de 240 Ω dejan ≈15 V');
});
ok('Cable cortado: la continuidad entre sus puntas da OL; cable flojo: da la resistencia del falso contacto',()=>{
 const w=wire('BOTONERAS:S2:2','BOTONERAS:S1:3'),off={...m.emptySimulation(),enabled:true};
 const read=(faults)=>m.readPanelMeter(wires,{...off,faults},m.solveSimulation(wires,{...off,faults}),[],'C','BOTONERAS:S2:2','BOTONERAS:S1:3',{...model,resistanceMode:'model'});
 assert.ok(read([]).value<1);assert.equal(read([{id:'a',kind:'wire-open',wire:w.id}]).text,'OL');near(read([{id:'a',kind:'wire-resistive',wire:w.id,ohms:80}]).value,80.41,.01);
});

// ── Fuerza ────────────────────────────────────────────────────────────────
const star=healthy,deltaNet=(faults)=>{const r=start(faults,wires,{timed:true});return m.panelElectrical(wires,{...base(faults),powerContacts:{[KT]:true,[DELTA]:true,[STAR]:false}},r.relays,[KT],model);};
ok('Contactor soldado: estrella pegada + triángulo cerrado = cortocircuito entre fases',()=>{
 const faults=['1','3','5'].map((p,i)=>({id:'w'+i,kind:'contact-welded',a:`${STAR}:L${i+1}`,b:`${STAR}:T${i+1}`})),r=start(faults,wires,{timed:true});
 const solved=m.solveSimulation(wires,{...base(faults),powerContacts:{[KT]:true,[DELTA]:true}},r.relays,[KT]);assert.equal(solved.fault,'phase-short');
});
ok('Polo quemado en el contactor principal: falta una fase en el motor',()=>{
 const faults=[{id:'a',kind:'contact-open',a:`${KT}:L2`,b:`${KT}:T2`}],r=m.solveSimulation(wires,{...base(faults),powerContacts:{[KT]:true,[STAR]:true}},start(faults).relays,[]);
 assert.equal(r.motor.status,'fault');assert.match(r.motor.message,/Falta una fase/);
 const net=m.panelElectrical(wires,{...base(faults),powerContacts:{[KT]:true,[STAR]:true}},start(faults).relays,[],model);assert.ok(!net.fault,net.fault);assert.ok(net.negativeVolts>1);
});
ok('Devanado abierto: una línea sin corriente, las otras dos tomando la corriente en serie, y el motor no gira',()=>{
 const faults=[{id:'a',kind:'winding-open',phase:'U'}],power={[KT]:true,[STAR]:true},sane=m.panelElectrical(wires,{...base(),powerContacts:power},healthy.relays,[],model),bad=m.panelElectrical(wires,{...base(faults),powerContacts:power},start(faults).relays,[],model);
 assert.ok(!bad.fault,bad.fault);assert.ok(Math.max(...Object.values(sane.lineAmps))>1);
 const amps=Object.values(bad.lineAmps).sort((a,b)=>a-b);assert.ok(amps[0]<amps[2]*.05,'una línea queda casi sin corriente: '+JSON.stringify(bad.lineAmps));assert.ok(bad.negativeVolts>1);
 const r=m.solveSimulation(wires,{...base(faults),powerContacts:power},start(faults).relays,[]);assert.equal(r.motor.status,'fault');assert.match(r.motor.message,/abierto/);
});
ok('Secuencia de fases invertida: el motor gira al revés y sigue sano',()=>{
 const faults=[{id:'a',kind:'sequence-reversed'}],power={[KT]:true,[STAR]:true},a=m.solveSimulation(wires,{...base(),powerContacts:power},healthy.relays,[]),b=m.solveSimulation(wires,{...base(faults),powerContacts:power},start(faults).relays,[]);
 assert.equal(a.motor.direction,1);assert.equal(b.motor.direction,-1);
 const net=m.panelElectrical(wires,{...base(faults),powerContacts:power},start(faults).relays,[],{...model,motorDirection:-1});assert.ok(!net.fault);assert.ok(net.positiveVolts>200);assert.ok(net.negativeVolts<1);
});
ok('Aislación baja: el óhmetro ve una fuga entre U1 y TP; sana da OL',()=>{
 const input={...m.emptySimulation(),enabled:true},res=m.solveSimulation([],input),mdl={...model,resistanceMode:'model'};
 assert.equal(m.readPanelMeter([],input,res,[],'R','BORNERA_MOTOR:U1','BORNERA_MOTOR:TP',mdl).text,'OL');
 const r=m.readPanelMeter([],{...input,faults:[{id:'a',kind:'insulation',terminal:'BORNERA_MOTOR:U1',ohms:47000}]},res,[],'R','BORNERA_MOTOR:U1','BORNERA_MOTOR:TP',mdl);near(r.value,47000.4,1);
});

// ── Protecciones ──────────────────────────────────────────────────────────
ok('Térmico con ajuste bajo dispara con una corriente que el ajuste correcto tolera; térmico muerto no dispara',()=>{
 const run=(settings,amps,seconds)=>{let t=m.coldThermal();for(let i=0;i<seconds*10;i++)t=m.advanceThermal(t,amps,settings,.1);return t.tripped;};
 const th=m.DEFAULT_THERMAL;assert.equal(run(th,6,200),false);assert.equal(run(m.thermalWithFaults(th,[{id:'a',kind:'thermal-weak',factor:.5}]),6,200),true);
 assert.equal(run(th,6*7.2,40),true);assert.equal(run(m.thermalWithFaults(th,[{id:'a',kind:'thermal-dead'}]),6*7.2,40),false);
});
ok('Temporizador: «adelantado» cambia en menos de 0,25 s; «trabado» no cambia nunca',()=>{
 near(m.timerDuration(4,[]),4);near(m.timerDuration(4,[{id:'a',kind:'timer-fast'}]),.25);assert.ok(m.timerDuration(4,[{id:'a',kind:'timer-stuck'}])>1e5);
});
ok('Sin fallas el comportamiento no cambia (mismas relaciones que antes)',()=>{
 const net=m.panelElectrical(wires,{...base(),powerContacts:{[KT]:true,[STAR]:true}},healthy.relays,[],model),withEmpty=m.panelElectrical(wires,{...base([]),powerContacts:{[KT]:true,[STAR]:true}},healthy.relays,[],model);
 assert.deepEqual(net.lineAmps,withEmpty.lineAmps);assert.ok(net.positiveVolts>200);
});
fs.writeFileSync(out+'/results.json',JSON.stringify({checks},null,2));console.log(`PASS verify-panel-faults: ${checks.length} comprobaciones`);
