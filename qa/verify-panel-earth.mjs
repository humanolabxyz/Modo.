// Tierra de protección: sin TP el motor gira igual (como en la realidad), pero una fuga deja la carcasa con tensión y sin protección.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/panel-faults';fs.mkdirSync(out,{recursive:true});
await build({stdin:{resolveDir:process.cwd(),contents:"export {addExtraModule} from './src/data/layout';export * from './src/data/panelFaults';export * from './src/data/simulation';export * from './src/data/panelElectrical';export * from './src/data/panelMeter';export * from './src/data/meterActivity';export * from './src/data/panelCalibration';export * from './src/data/panelEarth';",loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:out+'/earth.mjs',logLevel:'error'});
const m=await import('./panel-faults/earth.mjs?'+Date.now()),profile=m.defaultCalibration(),model={...profile.model,resistanceMode:'model'};
m.addExtraModule('tri');
const roles={manual:{M:'CONTACTOR_TERMICO',S:'CONTACTOR_TRIFASICO_3'},twoContactors:{M:'TEMPORIZADOR_1',S:'CONTACTOR_TRIFASICO'},matias:{M:'TEMPORIZADOR_1',S:'CONTACTOR_TERMICO'}};
const touches=(w,t)=>w.from.terminalId===t||w.to.terminalId===t;
/** Banco en marcha en estrella: devuelve lógica, red eléctrica y el motor. */
function run(wires,p,faults=[]){
 const r=roles[p],input=(extra={})=>({...m.emptySimulation(),enabled:true,plugged:true,forceBreaker:true,breakers:[true,true],faults,...extra});
 const pressed=m.solveSimulation(wires,input({pressed:['S1']}),m.OFF_RELAYS(),[]),held=m.solveSimulation(wires,input(),pressed.relays,[]);
 const power={[r.M]:true,[r.S]:true},run=input({powerContacts:power}),net=m.panelElectrical(wires,run,held.relays,[],profile.model);
 return {held,net,run};
}
let n=0;const ok=(c,msg)=>{assert.ok(c,msg);n++;};
const res={};
for(const p of ['twoContactors','manual','matias']){
 const wires=m.activityDocument(p).wires,healthy=run(wires,p);
 res[p]={motor:healthy.held.motor.status,bonded:healthy.net.earth.motorBonded,hazard:healthy.net.earth.hazard};
 ok(healthy.held.motor.status==='running','El motor debe girar '+p+' aunque falte tierra: '+healthy.held.motor.message);
 const motorTp=wires.filter(w=>touches(w,'BORNERA_MOTOR:TP')),without=wires.filter(w=>!motorTp.includes(w));
 const bare=run(without,p);
 ok(bare.held.motor.status==='running',`${p}: sin TP en el motor sigue girando`);
 ok(!bare.net.earth.motorBonded&&bare.net.earth.hazard==='sin-tierra',`${p}: sin TP el motor se marca sin tierra`);
 /* Fuga de aislación de 2 kΩ en U1: con tierra vuelve por TP; sin tierra la carcasa queda con tensión. */
 const leak=[{id:'i',kind:'insulation',terminal:'BORNERA_MOTOR:U1',ohms:2000}];
 const wired=motorTp.length?run(wires,p,leak):null;
 if(wired){
  ok(wired.net.earth.motorBonded&&wired.net.earth.casingVolts===0,`${p}: con tierra la carcasa queda a 0 V`);
  ok(wired.net.earth.groundAmps>.05&&wired.net.earth.groundAmps<.2,`${p}: fuga a tierra ≈110 mA, dio ${wired.net.earth.groundAmps}`);
  ok(wired.net.earth.hazard==='fuga',`${p}: con tierra es fuga, no choque`);
 }
 const floating=run(without,p,leak);
 ok(floating.net.earth.casingVolts>150,`${p}: sin tierra la carcasa flota cerca de la tensión de fase, dio ${floating.net.earth.casingVolts}`);
 ok(floating.net.earth.bodyAmps>.03&&floating.net.earth.hazard==='choque',`${p}: la persona recibe más de 30 mA`);
 ok(floating.net.earth.touchVolts>40,`${p}: tensión de contacto peligrosa`);
 /* Aislación casi sana (47 kΩ) sin tierra: fuga leve, sin llegar a choque. */
 const light=run(without,p,[{id:'i',kind:'insulation',terminal:'BORNERA_MOTOR:U1',ohms:47000}]);
 ok(light.net.earth.hazard==='fuga'&&light.net.earth.bodyAmps<.03,`${p}: 47 kΩ sin tierra es fuga leve`);
 /* El voltímetro entre la carcasa y la TP de la fuente ve la tensión flotante. */
 const off=m.solveSimulation(without,floating.run,floating.held.relays,[]);
 const reading=m.readPanelMeter(without,floating.run,off,[],'V','BORNERA_MOTOR:TP','FUENTE:TP',{...profile.model,resistanceMode:'model'});
 ok(typeof reading.value==='number'&&reading.value>150,`${p}: voltímetro carcasa–TP ve la tensión flotante, dio ${reading.text}`);
 const grounded=wired?m.readPanelMeter(wires,wired.run,m.solveSimulation(wires,wired.run,wired.held.relays,[]),[],'V','BORNERA_MOTOR:TP','FUENTE:TP',profile.model):null;
 if(grounded)ok(grounded.value===0,`${p}: con tierra el voltímetro carcasa–TP marca 0 V`);
 /* Una fase unida a TP es un cortocircuito a tierra. */
 const bad=[...wires,{id:'tp-r',from:{terminalId:'FUENTE:R'},to:{terminalId:'FUENTE:TP'},color:'#000',layer:0}];
 ok(run(bad,p).net.earth.short&&run(bad,p).net.fault,`${p}: fase unida a TP es cortocircuito a tierra`);
}
ok(res.twoContactors.bonded&&res.manual.bonded&&res.matias.bonded,'Los tres montajes completan la cadena de tierra');
/* Bloqueo: con la exigencia activa y un módulo sin TP, nada energiza; al cerrar la cadena vuelve a funcionar. */
for(const p of ['twoContactors','manual','matias']){
 const wires=m.activityDocument(p).wires,input=(extra={})=>({...m.emptySimulation(),enabled:true,plugged:true,forceBreaker:true,breakers:[true,true],earthRequired:true,...extra});
 const pressed=m.solveSimulation(wires,input({pressed:['S1']}),m.OFF_RELAYS(),[]);
 ok(pressed.powered&&pressed.motor.status!=='off'||pressed.powered,p+': con la tierra completa el mando energiza');
 const drop=wires.find(w=>w.from.terminalId.startsWith('BORNERA_MOTOR:TP')||w.to.terminalId.startsWith('BORNERA_MOTOR:TP'));
 const cut=wires.filter(w=>w!==drop);
 const blocked=m.solveSimulation(cut,input({pressed:['S1']}),m.OFF_RELAYS(),[]);
 ok(!blocked.powered&&blocked.relays&&!Object.values(blocked.relays).some(Boolean),p+': sin la TP del motor no energiza ningún relé');
 ok(/Falta la tierra de protecci/.test(blocked.motor.message)&&/MOTOR/i.test(blocked.motor.message),p+': el mensaje nombra el módulo sin tierra ('+blocked.motor.message+')');
 const net=m.panelElectrical(cut,input({powerContacts:{}}),m.OFF_RELAYS(),[],profile.model);
 ok(net.lineAmps.R===0&&net.current===0,p+': el solver tampoco ve corriente sin tierra');
 const off=m.solveSimulation(cut,input());
 const meter=m.readPanelMeter(cut,input(),off,[],'V','FUENTE:R','FUENTE:S',model);
 ok(/Falta la tierra/.test(meter.note),p+': el multímetro explica el bloqueo');
 const free=m.solveSimulation(cut,{...input({pressed:['S1']}),earthRequired:false},m.OFF_RELAYS(),[]);
 ok(free.powered,p+': con la exigencia desactivada vuelve a energizar');
}
console.log(JSON.stringify(res));console.log(`PASS verify-panel-earth: ${n} comprobaciones`);
