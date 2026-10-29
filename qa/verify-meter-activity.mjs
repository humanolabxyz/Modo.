import assert from 'node:assert/strict';import fs from 'node:fs';import {build} from 'esbuild';
const out='qa/multimeter-activity';
await build({stdin:{resolveDir:process.cwd(),contents:`export * from './src/data/meterActivity';export * from './src/data/panelElectrical';export * from './src/data/panelMeter';export * from './src/data/simulation';export * from './src/data/panel';export * from './src/data/practice';export * from './src/data/layout';`},bundle:true,platform:'node',format:'esm',outfile:out+'/model.mjs',logLevel:'silent'});
const m=await import('./multimeter-activity/model.mjs?'+Date.now());m.addExtraModule('tri');const checks=[];
const original=JSON.parse(fs.readFileSync('public/activities/proyecto-matias.json','utf8'));
assert.deepEqual(m.activityDocument('matias').wires,original.wires,'Los 45 cables de Matías conservan extremos, IDs, colores y recorrido');
assert.equal(original.panelHistory.steps.length,0);
assert.equal(m.ACTIVITY_STEPS.filter(s=>s.table).length,15,'Las cinco tablas del profesor contienen 3 mediciones cada una');
for(const profile of ['manual','matias']){
 const doc=m.activityDocument(profile),w=doc.wires;assert.ok(m.matchesActivity(profile,w));assert.equal(w.length,profile==='manual'?46:45);for(const wire of w)for(const p of [wire.from,wire.to])assert.ok(m.TERMINAL_BY_ID.has(p.terminalId));
 let input={...m.emptySimulation(),enabled:true},result=m.solveSimulation(w,input),timed=[];
 const context=s=>({profile,wires:w,input,result,timed,model:m.DEFAULT_PANEL_METER_MODEL,mode:s.mode??'OFF',redJack:'vo',probes:[s.red??null,s.black??null],frozen:false,clamp:s.phase??null});
 const base={...input,plugged:true,forceBreaker:true,breakers:[true,true]};
 const star=m.solveSimulation(w,{...base,pressed:['S1']});assert.equal(star.motor.connection,'star',profile);
 const held=m.solveSimulation(w,base,star.relays);assert.equal(held.motor.connection,'star');
 const deltaTimed=profile==='matias'?['TEMPORIZADOR_1']:[];
 const delta=m.solveSimulation(w,{...base,pressed:profile==='manual'?['S3']:[]},held.relays,deltaTimed);assert.equal(delta.motor.connection,'delta');
 const ideal={...m.DEFAULT_PANEL_METER_MODEL,lineOhms:0},starElectrical=m.panelElectrical(w,base,held.relays,[],ideal),deltaElectrical=m.panelElectrical(w,base,delta.relays,deltaTimed,ideal);
 for(const phase of ['R','S','T']){assert.ok(starElectrical.lineAmps[phase]>0);assert.ok(Math.abs(deltaElectrical.lineAmps[phase]/starElectrical.lineAmps[phase]-3)<.0001)}
 for(const [index,raw] of m.ACTIVITY_STEPS.entries()){const s=m.activityStep(profile,index);
  if(s.stage==='cold'){input={...m.emptySimulation(),enabled:true};timed=[];result=m.solveSimulation(w,input)}
  else if(s.stage==='control'){input={...base,forceBreaker:false};result=m.solveSimulation(w,input)}
  else if(['control-rest','control-reset'].includes(s.stage)){input={...base,forceBreaker:false};result=m.solveSimulation(w,input);timed=[]}
  else if(s.stage==='control-star'){input={...base,forceBreaker:false};result=m.solveSimulation(w,input,held.relays);timed=[]}
  else if(s.stage==='control-delta'){input={...base,forceBreaker:false};timed=deltaTimed;result=m.solveSimulation(w,input,delta.relays,timed)}
  else if(s.stage==='control-trip'){input={...base,forceBreaker:false,thermalTripped:true};result=m.solveSimulation(w,input,delta.relays,deltaTimed)}
  else if(s.stage==='powered-rest'){input=base;result=m.solveSimulation(w,input);timed=[]}
  else if(s.stage==='supply'){input=base;result=m.solveSimulation(w,input)}
  else if(s.stage==='star'){input=base;result=held;timed=[]}
  else if(s.stage==='delta'){input=base;result=delta;timed=deltaTimed}
  else if(s.stage==='trip'){input={...base,thermalTripped:true};result=m.solveSimulation(w,input,delta.relays,deltaTimed)}
  else if(s.stage==='reset'){input=base;result=m.solveSimulation(w,input)}
  else {input={...m.emptySimulation(),enabled:true};result=m.solveSimulation(w,input)}
  const c={...context(s),...(s.id==='dismantle'?{wires:[]}: {})},check=m.checkActivity(s,c);assert.equal(check.ready,true,profile+' '+s.id+' '+check.message);
  if(check.reading){const val=check.reading.value;assert.notEqual(val,undefined);assert.ok(m.observedMatches(val===null?'OL':String(val),val));assert.equal(m.observedMatches('98765',val),false)}
  if(s.kind==='meter'){
   assert.equal(m.checkActivity(s,{...c,probes:[s.red,'FUENTE:TP']}).ready,false,'Puntas equivocadas no registran');assert.equal(m.checkActivity(s,{...c,redJack:'a10'}).ready,false);assert.equal(m.checkActivity(s,{...c,frozen:true}).ready,false);
   assert.equal(m.checkActivity(s,{...c,probes:[s.black,s.red]}).ready,true,'V~ y Ω aceptan extremos intercambiados');
   if(s.stage==='cold')assert.equal(m.checkActivity(s,{...c,input:{...c.input,plugged:true}}).ready,false);
  }
  if(s.kind==='clamp')assert.equal(m.checkActivity(s,{...c,clamp:s.phase==='R'?'S':'R'}).ready,false);
 }
 const cold={...m.emptySimulation(),enabled:true},coil=m.readPanelMeter(w,cold,m.solveSimulation(w,cold),[],'R','CONTACTOR_TERMICO:A1','CONTACTOR_TERMICO:A2');assert.equal(coil.text,'SIN DATOS','No se inventa la resistencia real de la bobina');
 checks.push({profile,wires:w.length,steps:m.ACTIVITY_STEPS.length,starAmps:starElectrical.lineAmps,deltaAmps:deltaElectrical.lineAmps});
}
assert.ok(m.readActivity(m.newActivity('manual')));assert.equal(m.readActivity({...m.newActivity('manual'),index:999}),null);assert.equal(m.readActivity({...m.newActivity('manual'),records:[{id:'fake'}]}),null);
const draft={...m.newActivity('manual'),index:25,complete:true,records:m.ACTIVITY_STEPS.filter(s=>!['control-rest','control-star','control-delta','control-trip','control-reset','force-continuity','powered-rest'].includes(s.id)).map(s=>({id:s.id,observed:'1',text:'Prueba previa',value:1,at:new Date().toISOString()}))};const migrated=m.readActivity(draft);assert.equal(migrated.complete,false);assert.equal(m.ACTIVITY_STEPS[migrated.index].id,'control-rest');assert.equal(migrated.records.length,27,'Mediciones previas se conservan al exigir los pasos añadidos del profesor');
fs.writeFileSync(out+'/model-results.json',JSON.stringify({checks},null,2));console.log(JSON.stringify({checks},null,2));
