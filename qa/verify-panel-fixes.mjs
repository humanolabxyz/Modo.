import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/panel-fixes';fs.mkdirSync(out,{recursive:true});
await build({stdin:{contents:`export * from './src/data/panelMeter';export * from './src/data/panelElectrical';export * from './src/data/simulation';export {createCable} from './src/data/wiring';export {addExtraModule} from './src/data/layout';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile:out+'/model.mjs',logLevel:'silent'});
const {readPanelMeter:read,panelElectrical,panelAmmeterBridge,DEFAULT_PANEL_METER_MODEL:model,solveSimulation:solve,SIMULATION_EXAMPLES:examples,emptySimulation,OFF_RELAYS,createCable,addExtraModule}=await import('./panel-fixes/model.mjs?'+Date.now());
const checks=[],test=(name,fn)=>{fn();checks.push(name);console.log('PASS',name);},near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const cables=pairs=>{const ws=[];for(const [a,b] of pairs)ws.push(createCable(a,b,ws));return ws;};
const on={...emptySimulation(),enabled:true,plugged:true,forceBreaker:true,breakers:[true,true]};
const measure=(ws,a,b,input=on,mode='V',previous=OFF_RELAYS(),timed=[],jack='vo')=>read(ws,input,solve(ws,input,previous,timed),timed,mode,a,b,model,jack);
test('F/N da 24 V; R/S, S/T y T/R dan 380 V RMS sin usar TP como neutro',()=>{
 near(measure([],'FUENTE:F','FUENTE:N').value,24);
 for(const [a,b] of [['R','S'],['S','T'],['T','R']])near(measure([],`FUENTE:${a}`,`FUENTE:${b}`).value,380);
 for(const id of ['FUENTE:TP','FUENTE:N'])assert.equal(measure([],'FUENTE:R',id).text,'SIN REFERENCIA');
 near(measure([],'FUENTE:R','FUENTE:S',{...on,forceBreaker:false}).value,0);
 near(measure([],'FUENTE:R','FUENTE:S',{...on,breakers:[false,false]}).value,380);
 near(measure([],'FUENTE:F','FUENTE:N',{...on,breakers:[true,false]}).value,0);
});
test('Voltaje sobre bobina, contacto abierto y punto flotante conserva la referencia correcta',()=>{
 const ws=cables([['FUENTE:F','CONTACTOR_TERMICO:13'],['CONTACTOR_TERMICO:14','CONTACTOR_TERMICO:A1'],['CONTACTOR_TERMICO:A2','FUENTE:N']]);
 near(measure(ws,'CONTACTOR_TERMICO:13','CONTACTOR_TERMICO:14').value,24);
 near(measure(ws,'CONTACTOR_TERMICO:A1','CONTACTOR_TERMICO:A2').value,0);
 assert.equal(measure(ws,'CONTACTOR_TRIFASICO:L1','FUENTE:N').text,'SIN REFERENCIA');
});
test('Amperímetro exige A/COM y una rama abierta; el puente no modifica los cables del usuario',()=>{
 const ws=cables([['FUENTE:F','BOTONERAS:PILOTO_1']]),snapshot=JSON.stringify(ws),meter={red:'BOTONERAS:N',black:'FUENTE:N'};
 assert.equal(measure(ws,meter.red,meter.black,on,'A').text,'USA A Y COM');
 const bridge=panelAmmeterBridge(ws,on,OFF_RELAYS(),[],model,meter);assert.ok(bridge);
 const result=solve([...ws,bridge],on);assert.equal(result.pilots[0],true);assert.equal(solve(ws,on).pilots[0],false);
 near(read(ws,on,result,[],'A',meter.red,meter.black,model,'a10').value,24/480.1);
 assert.equal(JSON.stringify(ws),snapshot);
 const closed=[...ws,createCable(meter.red,meter.black,ws)];assert.equal(measure(closed,meter.red,meter.black,on,'A',OFF_RELAYS(),[],'a10').text,'ABRE LA RAMA');
 assert.equal(measure(ws,meter.red,meter.black,on,'V',OFF_RELAYS(),[],'a10').text,'USA V Ω');
});
test('Entrada A rechaza conexiones entre fuentes, sobrecarga y unión mando/fuerza',()=>{
 for(const plugged of [true,false])assert.equal(panelAmmeterBridge([],{...on,plugged},OFF_RELAYS(),[],model,{red:'FUENTE:F',black:'FUENTE:N'}),null);
 assert.equal(measure([],'FUENTE:F','FUENTE:N',on,'A',OFF_RELAYS(),[],'a10').text,'SOBRECARGA');
 assert.equal(panelAmmeterBridge([],on,OFF_RELAYS(),[],model,{red:'FUENTE:R',black:'FUENTE:S'}),null);
 assert.ok(panelElectrical(cables([['FUENTE:R','FUENTE:N']]),on,OFF_RELAYS(),[],model).fault);
});
test('Amperímetro insertado en retorno de bobina permite actuar y retener el contactor',()=>{
 const ws=cables(examples.hold.pairs.filter(([a,b])=>a!=='CONTACTOR_TERMICO:A2'||b!=='FUENTE:N'));
 const bridge=panelAmmeterBridge(ws,on,OFF_RELAYS(),[],model,{red:'CONTACTOR_TERMICO:A2',black:'FUENTE:N'});assert.ok(bridge);
 const started=solve([...ws,bridge],{...on,pressed:['S3']});assert.ok(started.relays.CONTACTOR_TERMICO);
 const held=solve([...ws,bridge],on,started.relays);assert.ok(held.relays.CONTACTOR_TERMICO);
 near(read(ws,on,held,[],'A','CONTACTOR_TERMICO:A2','FUENTE:N',model,'a10').value,24/240.1);
 assert.equal(solve(ws,on,held.relays).relays.CONTACTOR_TERMICO,false);
});
test('2 contactores + conjunto temporizado: estrella → triángulo, polos de KT1 y enclavamientos',()=>{
 const ws=cables(examples.starDelta.pairs),snapshot=JSON.stringify(ws);
 assert.equal(examples.starDelta.needs,undefined);assert.ok(!ws.some(w=>JSON.stringify(w).includes('CONTACTOR_TRIFASICO_3')));
 let r=solve(ws,{...on,pressed:['S3']});assert.equal(r.fault,null);assert.equal(r.motor.connection,'star');assert.ok(r.relays.TEMPORIZADOR_1);assert.ok(r.relays.CONTACTOR_TRIFASICO);assert.equal(r.relays.CONTACTOR_TERMICO,false);
 r=solve(ws,on,r.relays);assert.equal(r.motor.connection,'star');
 /* Con el motor cargando la red, la impedancia de línea del modelo (0,15 Ω) baja la tensión de bobina hasta ≈1,5 % bajo la nominal. */
 near(read(ws,on,r,[],'V','BORNERA_MOTOR:U1','BORNERA_MOTOR:U2',model).value,380/Math.sqrt(3),380/Math.sqrt(3)*.015);
 const delta=solve(ws,on,r.relays,['TEMPORIZADOR_1']);assert.equal(delta.fault,null);assert.equal(delta.motor.connection,'delta');assert.ok(delta.relays.CONTACTOR_TERMICO);assert.equal(delta.relays.CONTACTOR_TRIFASICO,false);
 near(read(ws,on,delta,['TEMPORIZADOR_1'],'V','BORNERA_MOTOR:U1','BORNERA_MOTOR:U2',model).value,380,380*.015);
 for(const patch of [{pressed:['S2']},{thermalTripped:true},{plugged:false},{breakers:[false,false]}]){const off=solve(ws,{...on,...patch},delta.relays,['TEMPORIZADOR_1']);assert.notEqual(off.motor.status,'running');assert.ok(!Object.values(off.relays).some(Boolean));assert.equal(solve(ws,on,off.relays).motor.status,'off');}
 assert.equal(solve(ws,{...on,forceBreaker:false},delta.relays,['TEMPORIZADOR_1']).motor.status,'off');assert.equal(JSON.stringify(ws),snapshot);
});
test('Corriente de línea trifásica: abrir una fase e insertar A conserva el giro y calcula la rama',()=>{
 const ws=cables(examples.starDelta.pairs.filter(([a,b])=>a!=='TEMPORIZADOR_1:T1'||b!=='BORNERA_MOTOR:U1'));
 const meter={red:'TEMPORIZADOR_1:T1',black:'BORNERA_MOTOR:U1'};
 const bridge=panelAmmeterBridge(ws,on,OFF_RELAYS(),[],model,meter);assert.ok(bridge);
 const r=solve([...ws,bridge],{...on,pressed:['S3']});assert.equal(r.motor.connection,'star');
 /* Esta comprobación es de la rama resistiva (devanado de 100 Ω): el perfil por defecto es de inducción, así que se pide el modelo resistivo explícitamente. */
 const resistive={...model,motorMode:'resistive',lineOhms:0};
 near(read(ws,on,r,[],'A',meter.red,meter.black,resistive,'a10').value,(380/Math.sqrt(3))/(100+.1/1.5));
});
test('Los valores ajustados cambian el cálculo; la variante previa de 3 contactores sigue disponible',()=>{
 const adjusted={...model,lineVolts:400};near(read([],on,solve([],on),[],'V','FUENTE:R','FUENTE:T',adjusted).value,400);
 addExtraModule('tri');const ws=cables(examples.starDeltaThree.pairs);let r=solve(ws,{...on,pressed:['S3']});assert.equal(r.motor.connection,'star');r=solve(ws,on,r.relays,['TEMPORIZADOR_1']);assert.equal(r.motor.connection,'delta');
});
fs.writeFileSync(out+'/model-results.json',JSON.stringify({result:'PASS',checks},null,2));
