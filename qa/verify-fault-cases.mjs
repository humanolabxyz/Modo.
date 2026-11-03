// Cada caso de diagnóstico debe (1) construirse para los perfiles donde tiene sentido, (2) cambiar de verdad lo que miden los instrumentos y (3) quedar reparado al aplicar su arreglo.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/panel-faults';fs.mkdirSync(out,{recursive:true});
await build({stdin:{resolveDir:process.cwd(),contents:"export * from './src/data/faultCases';export {addExtraModule} from './src/data/layout';export * from './src/data/panelFaults';export * from './src/data/simulation';export * from './src/data/panelElectrical';export * from './src/data/panelMeter';export * from './src/data/meterActivity';export * from './src/data/panelCalibration';export * from './src/data/panelMotorDynamics';",loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:out+'/cases.mjs',loader:{'.json':'json'},logLevel:'silent'});
const m=await import('./panel-faults/cases.mjs?'+Date.now()),profile=m.defaultCalibration(),model={...profile.model,resistanceMode:'model'};
const DYNAMIC=new Set(['thermal-weak','thermal-dead','timer-stuck','timer-fast','rotor-locked','weak-control','no-control','sequence']);
const roles=p=>({manual:{M:'CONTACTOR_TERMICO',S:'CONTACTOR_TRIFASICO_3',D:'CONTACTOR_TRIFASICO'},twoContactors:{M:'TEMPORIZADOR_1',S:'CONTACTOR_TRIFASICO',D:'CONTACTOR_TERMICO'},matias:{M:'TEMPORIZADOR_1',S:'CONTACTOR_TERMICO',D:'CONTACTOR_TRIFASICO'}})[p];
/** Huella de lo que ve un alumno: reposo, estrella y triángulo (lógica + corrientes) y óhmetro entre los bornes del caso. */
function signature(wires,rawFaults,targets,p){
 const faults=m.resolveFaults(rawFaults,4.5);/* instante en que un falso contacto está abierto */
 const input=(extra={})=>({...m.emptySimulation(),enabled:true,plugged:true,forceBreaker:true,breakers:[true,true],faults,...extra});
 const r=roles(p),sig={};
 const rest=m.solveSimulation(wires,input(),m.OFF_RELAYS(),[]);sig.rest=[rest.pilots,Object.entries(rest.relays).filter(([,v])=>v).map(([k])=>k),rest.fault];
 const pressed=m.solveSimulation(wires,input({pressed:['S1']}),m.OFF_RELAYS(),[]),held=m.solveSimulation(wires,input(),pressed.relays,[]);
 sig.star=[held.pilots,Object.entries(held.relays).filter(([,v])=>v).map(([k])=>k),held.fault,held.motor.status,held.motor.message];
 const timed=p==='manual'?m.solveSimulation(wires,input({pressed:['S3']}),held.relays,[]):m.solveSimulation(wires,input(),held.relays,[r.M]);
 sig.delta=[timed.pilots,Object.entries(timed.relays).filter(([,v])=>v).map(([k])=>k),timed.fault,timed.motor.status];
 const power={[r.M]:true,[r.S]:true},net=m.panelElectrical(wires,input({powerContacts:power}),held.relays,[],profile.model);
 sig.amps=net.fault?net.fault:Object.values(net.lineAmps).map(v=>Math.round(v*100)/100);
 const off={...m.emptySimulation(),enabled:true,faults};sig.ohm=[];
 for(let i=0;i<targets.length;i++)for(let j=i+1;j<targets.length;j++){const res=m.solveSimulation(wires,off),a=m.readPanelMeter(wires,off,res,[],'R',targets[i],targets[j],model);sig.ohm.push(a.text);}
 return JSON.stringify(sig);
}
m.addExtraModule('tri');/* la guía manual usa un tercer contactor */
const results={};let built=0;
for(const p of ['twoContactors','manual','matias']){
 const doc=m.activityDocument(p),healthyWires=doc.wires,cases=m.casesFor(healthyWires,p);
 assert.ok(cases.length>=24,`${p}: solo ${cases.length} casos`);
 results[p]=cases.map(c=>c.id);
 for(const c of cases){
  const b=c.build(healthyWires,p);assert.ok(b,`${p}/${c.id}`);built++;
  assert.ok(b.targets.length>=1,`${p}/${c.id}: sin bornes que localizar`);
  const ids=new Set(b.wires.map(w=>w.id));
  for(const f of b.faults){if('wire' in f)assert.ok(ids.has(f.wire),`${p}/${c.id}: la falla apunta a un cable inexistente`);}
  assert.equal(c.options.length,4);assert.ok(c.answer>=0&&c.answer<4);assert.ok(c.symptom&&c.hint&&c.measure&&c.why&&c.question);
  if(c.fix==='wiring'){
   assert.ok(!m.matchesActivity(p,b.wires),`${p}/${c.id}: el montaje dañado no debería coincidir con el de referencia`);
   if(c.id!=='thermal-bypass'&&c.id!=='delta-crossed')assert.ok(b.faults.length===0);
  }
  if(c.fix==='component'&&!DYNAMIC.has(c.id)){
   const healthy=signature(healthyWires,[],b.targets,p),faulty=signature(b.wires,b.faults,b.targets,p);
   assert.notEqual(faulty,healthy,`${p}/${c.id}: la falla no cambia nada que un instrumento pueda ver`);
  }
 }
}
// Fallas dinámicas: efecto comprobable en el modelo del motor y de las protecciones.
const stall=m.advanceMotor(m.stoppedMotion(),{...profile.model,loadTorqueNm:m.loadTorqueWithFaults(4,[{id:'a',kind:'rotor-locked'}]),positiveVolts:220,negativeVolts:0},220,true,1,.5);
assert.equal(stall.stalled,true);assert.ok(Math.abs(stall.rpm)<5);
const free=m.advanceMotor(m.stoppedMotion(),{...profile.model,positiveVolts:220,negativeVolts:0},220,true,1,.5);assert.ok(Math.abs(free.rpm)>Math.abs(stall.rpm));
console.log('casos por perfil:',JSON.stringify(Object.fromEntries(Object.entries(results).map(([k,v])=>[k,v.length]))));
fs.writeFileSync(out+'/cases-results.json',JSON.stringify(results,null,2));console.log(`PASS verify-fault-cases: ${built} casos construidos y comprobados`);
