import {build} from 'esbuild';import assert from 'node:assert/strict';import fs from 'node:fs';
const out='qa/two-contactor-measurements';fs.mkdirSync(out,{recursive:true});await build({stdin:{resolveDir:process.cwd(),contents:"export * from './src/data/meterActivity';export * from './src/data/activityTrace';export * from './src/data/simulation';export * from './src/data/panelElectrical';export * from './src/data/lessons';export * from './src/data/machineReport';"},bundle:true,platform:'node',format:'esm',outfile:out+'/model.mjs',logLevel:'silent'});const m=await import('./two-contactor-measurements/model.mjs?'+Date.now());
const profile='twoContactors',full=m.activityDocument(profile),control=m.activityDocument(profile,'control');/* El guardado ya incluye el cable de protección TP. */assert.equal(full.wires.length,41);assert.deepEqual(full.wires.map(w=>[w.from.terminalId,w.to.terminalId]),m.LESSONS.estrellaDosContactores.pairs);assert.ok(!full.wires.some(w=>[w.from.terminalId,w.to.terminalId].some(id=>id.includes('CONTACTOR_TRIFASICO_'))));assert.equal(m.matchesActivity(profile,full.wires),true);assert.equal(m.matchesActivity(profile,control.wires,'control'),true);assert.equal(m.matchesActivity(profile,m.activityDocument('matias').wires),false);assert.notEqual(m.ACTIVITY_KEY,m.LEGACY_ACTIVITY_KEY);
/* Una práctica guardada con el cableado anterior (37 cables, triángulo desde U1) recibe un aviso claro y no el mensaje genérico. */
{const legacy=m.LESSONS.estrellaDosContactores.pairs.filter(([x,y])=>!(x==='BOTONERAS:PILOTO_2'||y==='BOTONERAS:PILOTO_2')&&!(x==='CONTACTOR_TRIFASICO:82'||x==='CONTACTOR_TERMICO:82'||x==='CONTACTOR_TERMICO:81'||y==='CONTACTOR_TERMICO:81'||y==='CONTACTOR_TRIFASICO:81')&&!(x==='TEMPORIZADOR_1:L1'&&y==='CONTACTOR_TERMICO:L1'||x==='TEMPORIZADOR_1:L2'&&y==='CONTACTOR_TERMICO:L2'||x==='TEMPORIZADOR_1:L3'&&y==='CONTACTOR_TERMICO:L3')).concat([['BORNERA_MOTOR:U1','CONTACTOR_TERMICO:L1']]).map(([x,y],i)=>({id:'o'+i,from:{terminalId:x},to:{terminalId:y}}));
 const msg=m.checkActivity(m.activityStep('twoContactors',0),{profile:'twoContactors',wires:legacy,input:{},result:{},timed:[],model:{},mode:'C',redJack:'vo',probes:[null,null],frozen:false,clamp:null});
 assert.equal(msg.ready,false);assert.match(msg.message,/cableado anterior/);}
let wires=control.wires,input={...m.emptySimulation(),enabled:true},result=m.solveSimulation(wires,input),timed=[],events=[],seq=0;
const advance=(kind,control,change)=>{const before=m.traceState(input,result.relays,0);change();const after=m.traceState(input,result.relays,0);events.push({id:++seq,seconds:seq,kind,control,before,after});};
const solve=()=>{result=m.solveSimulation(wires,input,result.relays,timed);};
const start=()=>{input={...input,pressed:['S1']};solve();input={...input,pressed:[]};solve();};
const records=[];
for(let index=0;index<m.ACTIVITY_STEPS.length;index++){
 const step=m.activityStep(profile,index),since=seq;
 if(step.id==='control-volts'){input={...input,plugged:true,breakers:[true,true]};solve();}
 if(step.id==='force-continuity'){input={...input,plugged:false,forceBreaker:false,breakers:[false,false]};wires=full.wires;timed=[];solve();}
 if(step.id==='line-RS'){input={...input,plugged:true,forceBreaker:true};solve();}
 if(step.id==='powered-rest'){input={...input,breakers:[true,true]};solve();}
 if(['control-star','start-star'].includes(step.id)){assert.equal(m.solveSimulation(wires,{...input,pressed:['S3']},result.relays,timed).relays.TEMPORIZADOR_1,false,'S3 no inicia el montaje');timed=[];advance('press','S1',start);}
 if(['control-delta','change-delta'].includes(step.id))advance('timer','TEMPORIZADOR_1',()=>{timed=['TEMPORIZADOR_1'];solve();});
 if(['control-trip','overload'].includes(step.id))advance('test',undefined,()=>{input={...input,thermalTripped:true};solve();});
 if(['control-reset','reset'].includes(step.id))advance('thermalReset',undefined,()=>{input={...input,thermalTripped:false};timed=[];solve();});
 if(step.id==='shutdown'){input={...input,plugged:false,forceBreaker:false,breakers:[false,false]};solve();}
 if(step.id==='dismantle'){wires=[];solve();}
 const context={profile,wires,input,result,timed,model:{...m.DEFAULT_PANEL_METER_MODEL,rotorRpm:1480},mode:step.mode??'V',redJack:'vo',probes:[step.red??null,step.black??null],frozen:false,clamp:step.phase??null};
 const state=m.checkActivity(step,context);assert.equal(state.ready,true,step.id+': '+state.message);const evidence=m.checkActionEvidence(step,context,events,since);assert.equal(evidence.ready,true,step.id+': '+evidence.message);if(['control-volts','control-rest','control-trip','control-reset','powered-rest','overload','reset'].includes(step.id))assert.equal(result.pilots[1],true,'P2 rojo encendido en reposo y con TEST: '+step.id);if(result.relays.TEMPORIZADOR_1)assert.equal(result.pilots[1],false,'P2 rojo apagado mientras marcha: '+step.id);records.push({id:step.id,observed:'Estado comprobado',text:state.reading?.text??'Estado comprobado',value:state.reading?.value??null,at:new Date().toISOString(),action:evidence.proof});
 if(step.kind==='clamp')assert.ok(state.reading.value>0,step.id);
}
const progress={...m.newActivity(profile),index:m.ACTIVITY_STEPS.length-1,records,complete:true};assert.equal(m.readActivity(progress).complete,true);assert.match(m.machineMeasurementsHtml(progress),/Panel de dos contactores/);assert.equal(records.length,34);assert.equal(m.ACTIVITY_STEPS.filter(s=>s.table).length,15);
fs.writeFileSync(out+'/model-results.json',JSON.stringify({profile,fullWires:full.wires.length,controlWires:control.wires.length,steps:records.length,tableReadings:15,records},null,2));console.log('41 cables con TP, 34 pasos, 15 mediciones, S1/temporizador/TEST/RESET, roles y pilotos: PASS');
