import fs from 'node:fs';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {TEMPLATES, buildTemplate, buildLineRobot, buildExplorer, buildReadyRobot} from '../src/robotics/project/templates.ts';
import {solve, measure} from '../src/robotics/circuit/solve.ts';
import {diagnose} from '../src/robotics/circuit/diagnostics.ts';
import {solveDynamic} from '../src/robotics/circuit/dynamic.ts';
import {buildGraph, netOfPin} from '../src/robotics/circuit/graph.ts';
import {setPartProp, disconnect, translateParts, pinWorld} from '../src/robotics/project/commands.ts';
import {parseRobotProject} from '../src/robotics/project/validate.ts';
import {catalogShape} from '../src/robotics/catalog/index.ts';
import {Coordinator} from '../src/robotics/sim/coordinator.ts';
import {RobotPhysics} from '../src/robotics/sim/physics.ts';
import {distanceToTrack, makeLineTrack} from '../src/robotics/sim/lineTrack.ts';
import {qRotate} from '../src/robotics/project/math.ts';
import {LINE_HEX, LINE_SKETCH, EXPLORER_HEX, EXPLORER_SKETCH} from '../src/robotics/project/kitSketches.ts';
import {hashSource} from '../src/robotics/mcu/compiler/state.ts';
const out='qa/robotics-kit';fs.mkdirSync(out,{recursive:true});const report={checks:[],physics:{}};
const pass=s=>{report.checks.push(s);console.log('PASS',s);};
const find=(p,id)=>p.parts.find(x=>x.definitionId===id);
const runner=(p,physics)=>{const u=find(p,'arduino-uno-r3');return new Coordinator({project:p,targetId:u.instanceId,hex:p.firmware[0].artifact.hex},physics);};
for(const t of TEMPLATES.filter(t => !t.id.startsWith('brazo-') && !t.id.startsWith('robot-oruga-'))){ // el robot de orugas es de otro tipo (sin protoboard ni regulador, con pantalla y servo): tiene su prueba propia
 const p=buildTemplate(t.id),s=solve(p),bb=find(p,'breadboard-400'),uno=find(p,'arduino-uno-r3'),sw=find(p,'power-switch'),battery=find(p,'battery-holder-4aa'),reg=find(p,'regulator-5v');
 assert.ok(parseRobotProject(JSON.parse(JSON.stringify(p)),{catalog:catalogShape}).ok);assert.deepEqual(diagnose(p,s),[]);assert.equal(battery.props.voltage,6);assert.equal(s.devices.get(uno.instanceId).via,'5v');
 assert.equal(measure(s,{instanceId:bb.instanceId,pinId:'R+10'},{instanceId:bb.instanceId,pinId:'R-10'}).volts,5);
 assert.equal(p.firmware[0].artifact.sourceHash,hashSource(p.firmware[0].source));
 const rail=p.connections.find(c=>c.a.instanceId===reg.instanceId&&c.a.pinId==='5V');const broken=disconnect(p,rail.id);
 assert.equal(solve(broken).devices.get(uno.instanceId).powered,false,'la alimentación atraviesa de verdad la protoboard');
 const off=setPartProp(p,sw.instanceId,'closed',false);assert.equal(runner(off).snapshot().status,'unpowered');assert.ok([...solveDynamic(off,new Map()).motors.values()].every(m=>Math.abs(m.volts)<1e-6));
 const start=pinWorld(p,{instanceId:bb.instanceId,pinId:'A1'}),moved=translateParts(p,[find(p,'chassis-2wd').instanceId],[.1,0,.2]).project,end=pinWorld(moved,{instanceId:bb.instanceId,pinId:'A1'});assert.ok(Math.abs(end[0]-start[0]-.1)<1e-9&&Math.abs(end[2]-start[2]-.2)<1e-9);
 pass(t.name+': circuito limpio, 6 V→regulador→protoboard→5 V, interruptor corta, cable retirado corta, montaje y guardado válidos.');
}
for(const [name,source,hex] of [['line',LINE_SKETCH,LINE_HEX],['explorer',EXPLORER_SKETCH,EXPLORER_HEX]]) {assert.equal(source,fs.readFileSync('qa/fixtures/robotica/sketches/'+name+'.ino','utf8'));assert.equal(hex,fs.readFileSync('qa/fixtures/robotica/'+name+'.hex','utf8'));}
let p=buildLineRobot(),sensors=p.parts.filter(x=>x.definitionId==='tcrt5000-module');
for(const [blackL,blackR] of [[false,false],[true,false],[false,true]]){
 let bench=setPartProp(setPartProp(p,sensors[0].instanceId,'testBlack',blackL),sensors[1].instanceId,'testBlack',blackR);
 const c=runner(bench);c.advance(200000);const snap=c.snapshot(),motors=Object.values(snap.motors),levels=Object.values(snap.reflectance).map(s=>s.level);
 assert.deepEqual(levels,[Number(blackL),Number(blackR)]);
 if(blackL)assert.ok(motors[0].volts<motors[1].volts,'negro izquierdo desacelera rueda izquierda');else if(blackR)assert.ok(motors[1].volts<motors[0].volts,'negro derecho desacelera rueda derecha');else assert.ok(Math.abs(motors[0].volts-motors[1].volts)<.1);
}
const inverted=setPartProp(setPartProp(p,sensors[0].instanceId,'testBlack',true),sensors[0].instanceId,'activeLow',true);const ci=runner(inverted);ci.advance(100000);assert.equal(ci.snapshot().reflectance[sensors[0].instanceId].level,0);
const doWire=p.connections.find(c=>c.a.instanceId===sensors[0].instanceId&&c.a.pinId==='DO'),cut=setPartProp(disconnect(p,doWire.id),sensors[0].instanceId,'testBlack',true);const cc=runner(cut);cc.advance(100000);assert.equal(cc.snapshot().reflectance[sensors[0].instanceId].linked,false);
pass('Infrarrojos: negro/blanco, polaridad invertida, DO desconectado y corrección de cada motor por el programa AVR.');
for(const distance of [.1,1]){let e=buildExplorer();e=setPartProp(e,find(e,'hc-sr04').instanceId,'testDistance',distance);const c=runner(e);c.advance(500000);const led=Object.values(c.snapshot().leds)[0];assert.equal(led.on,distance<.2);assert.ok(!led.overcurrent);}
pass('Explorador: el LED con 220 Ω responde al ultrasonido; sin sobrecorriente.');
const old=newRobotProjectForCompatibility();function newRobotProjectForCompatibility(){const p=buildReadyRobot();const {lineTrack,...scene}=p.scene;return {...p,scene};}assert.ok(parseRobotProject(old,{catalog:catalogShape}).ok);
const invalid={...p,scene:{...p.scene,lineTrack:{name:'mal',width:.025,closed:true,points:[]}}};assert.equal(parseRobotProject(invalid,{catalog:catalogShape}).ok,false);
assert.equal(parseRobotProject({...p,scene:{...p.scene,lineTrack:null}},{catalog:catalogShape}).ok,false);
assert.ok(distanceToTrack(makeLineTrack('oval'),[0,0,0])<1e-9);
pass('Pistas: guardado, importación, geometría, compatibilidad sin pista y rechazo de pistas inválidas.');
await RAPIER.init();
for(const [kind,project,duration] of [['avoid',buildReadyRobot(),9000],['line',buildLineRobot(),40000]]) {
 const phys=RobotPhysics.create(RAPIER,project),c=runner(project,phys),ch=find(project,'chassis-2wd').instanceId,path=[],patterns=new Set();let last=null,traveled=0,maxError=0;
 for(let t=0;t<duration;t+=20){c.advance(20000);const snap=c.snapshot(),pose=snap.physics.poses[ch],f=qRotate(pose.q,[0,0,1]);if(last)traveled+=Math.hypot(pose.p[0]-last[0],pose.p[2]-last[2]);last=pose.p;path.push({t:t+20,p:pose.p,yaw:Math.atan2(f[0],f[2])});if(project.scene.lineTrack){maxError=Math.max(maxError,distanceToTrack(project.scene.lineTrack,pose.p));patterns.add(Object.values(snap.reflectance).map(s=>Number(s.black)).join(''));}}
 report.physics[kind]={traveled,maxError,patterns:[...patterns],path};fs.writeFileSync(out+'/physics-'+kind+'.json',JSON.stringify(report.physics[kind],null,2));
 console.log('PHYSICS',kind,JSON.stringify({traveled,maxError,patterns:[...patterns],last:path.at(-1)}));
 assert.ok(traveled>.3,kind+' avanza más de 30 cm');
 if(kind==='line'){assert.ok(maxError<.04,'el seguidor permanece a menos de 4 cm de la línea');assert.ok(patterns.size>1,'lee cambios reales de negro/blanco');assert.ok(path.some(s=>s.t>25000&&Math.hypot(s.p[0],s.p[2])<.15),'completa una vuelta y vuelve cerca del inicio');}else{const front=Math.max(...path.filter(s=>Math.abs(s.p[0])<.35).map(s=>s.p[2]+.1215));assert.ok(front<.68,'no toca la caja');assert.ok(path.some(s=>Math.abs(s.yaw)>.4),'gira ante el obstáculo');}
 phys.dispose();pass(kind+': comportamiento verificado con Rapier, circuito y MCU reales del simulador.');
}
fs.writeFileSync(out+'/verification.json',JSON.stringify(report,null,2));
