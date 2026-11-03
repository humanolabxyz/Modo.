// Un polo de fuerza con resistencia de contacto: el modelo lógico, el solver AC y el óhmetro deben coincidir.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/panel-faults';fs.mkdirSync(out,{recursive:true});
await build({stdin:{resolveDir:process.cwd(),contents:"export {addExtraModule} from './src/data/layout';export * from './src/data/panelFaults';export * from './src/data/simulation';export * from './src/data/panelElectrical';export * from './src/data/panelMeter';export * from './src/data/meterActivity';export * from './src/data/panelCalibration';",loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:out+'/contacts.mjs',logLevel:'error'});
const m=await import('./panel-faults/contacts.mjs?'+Date.now()),profile=m.defaultCalibration(),model={...profile.model,resistanceMode:'model'};
m.addExtraModule('tri');
const roles={manual:{M:'CONTACTOR_TERMICO',S:'CONTACTOR_TRIFASICO_3'},twoContactors:{M:'TEMPORIZADOR_1',S:'CONTACTOR_TRIFASICO'},matias:{M:'TEMPORIZADOR_1',S:'CONTACTOR_TERMICO'}};
let n=0;const ok=(c,msg)=>{assert.ok(c,msg);n++;};
for(const p of ['twoContactors','manual','matias']){
 const wires=m.activityDocument(p).wires,{M,S}=roles[p];
 const input=(faults,extra={})=>({...m.emptySimulation(),enabled:true,plugged:true,forceBreaker:true,breakers:[true,true],faults,...extra});
 const state=faults=>{
  const pressed=m.solveSimulation(wires,input(faults,{pressed:['S1']}),m.OFF_RELAYS(),[]),held=m.solveSimulation(wires,input(faults),pressed.relays,[]);
  const net=m.panelElectrical(wires,input(faults,{powerContacts:{[M]:true,[S]:true}}),held.relays,[],profile.model);
  return {held,net};
 };
 const pole=ohms=>[{id:'c',kind:'contact-resistive',a:`${M}:L2`,b:`${M}:T2`,ohms}];
 const healthy=state([]),light=state(pole(5)),dead=state(pole(20000));
 ok(healthy.held.motor.status==='running',p+': sano gira');
 /* 5 Ω: sigue conduciendo; el motor gira y la tensión del bobinado baja un poco. */
 ok(light.held.motor.status==='running',p+': 5 Ω sigue girando');
 ok(light.net.positiveVolts<=healthy.net.positiveVolts+1e-6,p+': 5 Ω no sube la tensión');
 /* 20 kΩ: equivale a una fase abierta en lógica y en solver, no solo en uno de los dos. */
 ok(dead.held.motor.status==='fault'&&/fase/i.test(dead.held.motor.message),p+': 20 kΩ = falta una fase en la lógica ('+dead.held.motor.message+')');
 ok(dead.net.positiveVolts<healthy.net.positiveVolts*.8||dead.net.negativeVolts>healthy.net.negativeVolts*.2,p+': el solver también ve la fase abierta');
 /* El óhmetro entre los bornes del polo: abierto (OL) con 20 kΩ, ~ohms con 5 Ω. */
 const off=faults=>({...m.emptySimulation(),enabled:true,faults,powerContacts:{[M]:true}});
 const ohm=faults=>{const i=off(faults);return m.readPanelMeter(wires,i,m.solveSimulation(wires,i),[],'R',`${M}:L2`,`${M}:T2`,model);};
 ok(ohm(pole(20000)).text==='OL'||ohm(pole(20000)).value==null,p+': el óhmetro ve el polo abierto');
}
console.log(`PASS verify-contact-faults: ${n} comprobaciones`);
