import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/activity-precision';fs.mkdirSync(out,{recursive:true});
await build({stdin:{resolveDir:process.cwd(),contents:"export * from './src/data/activityTrace';export * from './src/data/meterActivity';export * from './src/data/simulation';export * from './src/data/layout';export * from './src/data/panelElectrical';export * from './src/data/machineReport';"},bundle:true,platform:'node',format:'esm',outfile:out+'/model.mjs',logLevel:'silent'});
const m=await import('./activity-precision/model.mjs?'+Date.now()),checks=[];m.addExtraModule('tri');
const step=id=>m.ACTIVITY_STEPS.find(s=>s.id===id);
for(const profile of ['manual','matias'])for(const force of [false,true]){
 const wires=m.activityDocument(profile,force?'full':'control').wires,input={...m.emptySimulation(),enabled:true,plugged:true,breakers:[true,true],forceBreaker:force};
 const rest=m.solveSimulation(wires,input),y=m.solveSimulation(wires,{...input,pressed:['S1']},rest.relays),delta=m.solveSimulation(wires,profile==='manual'?{...input,pressed:['S3']}:input,y.relays,profile==='matias'?['TEMPORIZADOR_1']:[]),trip=m.solveSimulation(wires,{...input,thermalTripped:true},delta.relays);
 const states=[rest,y,delta,trip,rest],ids=force?['start-star','change-delta','overload','reset']:['control-star','control-delta','control-trip','control-reset'];
 for(let i=0;i<ids.length;i++){
  const s=step(ids[i]),required=m.actionRequirement(s,profile),beforeInput={...input,thermalTripped:i===3},afterInput={...input,thermalTripped:i===2};
  const event={id:i+5,seconds:10+i,kind:required.kind,control:required.control,before:m.traceState(beforeInput,states[i].relays,100),after:m.traceState(afterInput,states[i+1].relays,100)};
  const c={profile,wires,input:afterInput,result:states[i+1],timed:[],model:m.DEFAULT_PANEL_METER_MODEL,mode:'OFF',redJack:'vo',probes:[null,null],clamp:null,frozen:false};
  assert.equal(m.checkActivity(s,c).ready,true,profile+' '+ids[i]+' correct state');
  assert.equal(m.checkActionEvidence(s,c,[],0).ready,false,'Final state alone is insufficient');
  const proof=m.checkActionEvidence(s,c,[event],event.id-1);assert.equal(proof.ready,true,profile+' '+ids[i]);assert.equal(m.validActionProof(proof.proof),true);
  assert.equal(m.checkActionEvidence(s,c,[event],event.id).ready,false,'Prior step cannot count');
  for(const field of ['enabled','plugged','control'])for(const side of ['before','after']){const bad=structuredClone(event);bad[side][field]=false;assert.equal(m.checkActionEvidence(s,c,[bad],0).ready,false,side+' '+field);}
  const bad=structuredClone(event);bad.before.force=!force;assert.equal(m.checkActionEvidence(s,c,[bad],0).ready,false,'Wrong circuit stage');
  assert.equal(m.checkActionEvidence(s,{...c,input:{...c.input,pressed:['S1']}},[event],0).ready,false,'Release required');
  if(i===1||i===2){const wrong=structuredClone(event);wrong.before=m.traceState(input,rest.relays,0);assert.equal(m.checkActionEvidence(s,c,[wrong],0).ready,false,'No delta from rest / TEST from rest');}
  if(i===2){const wrong=structuredClone(event);wrong.after.relays={...delta.relays};assert.equal(m.checkActionEvidence(s,c,[wrong],0).ready,false,'TEST with coils latched cannot count');}
  if(i===3){const wrong=structuredClone(event);wrong.before.relays={...y.relays};assert.equal(m.checkActionEvidence(s,c,[wrong],0).ready,false,'RESET with energized coils cannot count');}
 }
}
checks.push('Eight maneuvers in both profiles: real transition, order, source, stage, released buttons, TEST and RESET; final state cannot substitute action');
for(const [text,value,ok,bad] of [['0,4 Ω',.4,['0.4','0,400'],['0.42','0.41','400','']],['0.003 A',.003,['0,003','0.0030'],['0.00305','0.00299']],['219,4 V',219.4,['219.4'],['220','219.42']],['250,0 mV',.25,['250','250.0'],['0.25','249.99']],['1,250 kΩ',1250,['1.25'],['1250','1.251']]]){
 const reading={text,value,kind:'voltage',note:''};for(const x of ok)assert.equal(m.matchesCapturedReading(x,reading),true,text+' '+x);for(const x of bad)assert.equal(m.matchesCapturedReading(x,reading),false,text+' '+x);
}
assert.equal(m.matchesCapturedReading('ol',{text:'OL',value:null}),true);assert.equal(m.matchesCapturedReading('0',{text:'OL',value:null}),false);checks.push('Transcription equals captured digits, with comma/point, displayed SI scale and OL; percentage-near values rejected');
const conditions={simulationSeconds:12.34,lineVolts:380,frequencyHz:50,relayAmps:5.77,profile:'Ejemplo didáctico',connection:'star'},action={version:1,eventId:5,kind:'press',control:'S1',seconds:10,from:'reposo',to:'estrella'},legacy={id:'thermal',observed:'0,4',text:'0,4 Ω',value:.4,at:'2026-10-27'},p={...m.newActivity('manual'),records:[legacy,{...legacy,id:'star-U',observed:'219,4',text:'219,4 V',value:219.4,conditions,capturedAt:'2026-10-27'},{...legacy,id:'start-star',action},{...legacy,id:'control-delta'}]};
assert.deepEqual(m.readActivity(JSON.parse(JSON.stringify(p))),p);
for(const bad of [{...conditions,simulationSeconds:-1},{...conditions,lineVolts:NaN},{...conditions,connection:'unknown'}])assert.equal(m.readActivity({...p,records:[{...legacy,conditions:bad}]}),null);
assert.equal(m.readActivity({...p,records:[{...legacy,action:{...action,eventId:-1}}]}),null);
const html=m.machineReportHtml(p);assert.match(html,/Ir 5.77 A/);assert.match(html,/t = 12.34 s/);assert.match(html,/reposo → estrella/);assert.match(html,/registro anterior sin traza/);
checks.push('Legacy readings retained; capture conditions and maneuver proof persist and export; malformed evidence rejected');
fs.writeFileSync(out+'/results.json',JSON.stringify({checks},null,2));console.log(JSON.stringify({checks},null,2));
