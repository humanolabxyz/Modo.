import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CatmullRomCurve3,Vector3} from 'three';
import {createDeckWireRouter} from '../src/robotics/build/wireRouting.ts';
import {tInv,tPoint} from '../src/robotics/project/math.ts';
import RAPIER from '@dimforge/rapier3d-compat';
import {buildRover4wd,buildTowerRobot,buildSumoRobot,buildReadyRobot,TEMPLATES} from '../src/robotics/project/templates.ts';
import {CATALOG,catalogShape} from '../src/robotics/catalog/index.ts';
import {solve} from '../src/robotics/circuit/solve.ts';
import {solveDynamic} from '../src/robotics/circuit/dynamic.ts';
import {diagnose} from '../src/robotics/circuit/diagnostics.ts';
import {parseRobotProject} from '../src/robotics/project/validate.ts';
import {setPartProp,translateParts,pinWorld,disconnect} from '../src/robotics/project/commands.ts';
import {Coordinator} from '../src/robotics/sim/coordinator.ts';
import {RobotPhysics} from '../src/robotics/sim/physics.ts';
import {hashSource} from '../src/robotics/mcu/compiler/state.ts';
import {FOLLOW_SKETCH,FOLLOW_HEX,SUMO_SKETCH,SUMO_HEX} from '../src/robotics/project/assemblySketches.ts';
import {findInterferences} from '../src/robotics/build/interference.ts';
const out='qa/robotics-assemblies';fs.mkdirSync(out,{recursive:true});const report={checks:[],physics:{},overlaps:{}};
const pass=s=>{report.checks.push(s);console.log('PASS',s);};const find=(p,id)=>p.parts.find(x=>x.definitionId===id),count=(p,id)=>p.parts.filter(x=>x.definitionId===id).length;
const runner=(p,physics)=>new Coordinator({project:p,targetId:find(p,'arduino-uno-r3').instanceId,hex:p.firmware[0].artifact.hex},physics);
assert.equal(TEMPLATES.length,13);assert.equal(CATALOG.length,35);
for(const [kind,p,parts,wheels] of [['rover',buildRover4wd(),18,4],['tower',buildTowerRobot(),23,2],['sumo',buildSumoRobot(),23,2]]){
 assert.equal(p.parts.length,parts);assert.equal(p.attachments.length,parts-1);assert.equal(p.attachments.filter(a=>a.kind==='wheel-hinge').length,wheels);assert.equal(count(p,'wheel-65'),wheels);
 assert.deepEqual(diagnose(p,solve(p)),[]);const parsed=parseRobotProject(JSON.parse(JSON.stringify(p)),{catalog:catalogShape});assert.ok(parsed.ok,parsed.error);assert.deepEqual(parsed.project,p);assert.equal(p.firmware[0].artifact.sourceHash,hashSource(p.firmware[0].source));
 const bb=find(p,'breadboard-400'),before=pinWorld(p,{instanceId:bb.instanceId,pinId:'A1'}),shifted=translateParts(p,[p.parts[0].instanceId],[.1,0,-.2]).project,after=pinWorld(shifted,{instanceId:bb.instanceId,pinId:'A1'});assert.ok(Math.abs(after[0]-before[0]-.1)<1e-9&&Math.abs(after[2]-before[2]+.2)<1e-9);
 const off=setPartProp(p,find(p,'power-switch').instanceId,'closed',false);assert.equal(runner(off).snapshot().status,'unpowered');assert.ok([...solveDynamic(off,new Map()).motors.values()].every(m=>Math.abs(m.volts)<1e-6));
 const reg=find(p,'regulator-5v'),supply=p.connections.find(c=>c.a.instanceId===reg.instanceId&&c.a.pinId==='5V');assert.equal(solve(disconnect(p,supply.id)).devices.get(find(p,'arduino-uno-r3').instanceId).powered,false);
 report.overlaps[kind]=findInterferences(p).map(pair=>pair.map(id=>p.parts.find(x=>x.instanceId===id).label));assert.deepEqual(report.overlaps[kind],[],kind+' sin interferencias del armado');
 if(kind==='rover'){assert.equal(count(p,'dc-motor-tt'),4);assert.equal(count(p,'l298n-module'),2);assert.equal(count(p,'caster-ball'),0);const zs=new Set(p.parts.filter(x=>x.definitionId==='wheel-65').map(x=>x.transform.position[2]));assert.equal(zs.size,2);}
 if(kind==='tower'){assert.equal(count(p,'chassis-2wd'),2);const decks=p.parts.filter(x=>x.definitionId==='chassis-2wd');assert.ok(Math.abs(decks[1].transform.position[1]-decks[0].transform.position[1]-.044)<1e-9);assert.ok(find(p,'arduino-uno-r3').transform.position[1]>bb.transform.position[1]+.03);assert.equal(count(p,'bracket-generic'),8);}
 if(kind==='sumo'){assert.ok(p.parts.filter(x=>x.definitionId==='wheel-65').every(x=>x.transform.position[2]>.04));assert.ok(find(p,'caster-ball').transform.position[2]<-.08);assert.equal(count(p,'bracket-generic'),6);assert.equal(p.scene.lineTrack.name,'Arena minisumo');assert.equal(p.scene.obstacles.length,0);}
 pass(kind+': armado mecánico distinto, todas las piezas unidas, circuito limpio, protoboard y apagado funcionales, exportación/importación y movimiento conjunto.');
}
for(const [name,source,hex] of [['follow',FOLLOW_SKETCH,FOLLOW_HEX],['sumo',SUMO_SKETCH,SUMO_HEX]]){assert.equal(source,fs.readFileSync('qa/fixtures/robotica/sketches/'+name+'.ino','utf8'));assert.equal(hex,fs.readFileSync('qa/fixtures/robotica/'+name+'.hex','utf8'));}
for(const [distance,direction] of [[.12,-1],[.25,0],[.6,1],[3,0]]){let p=buildTowerRobot();p=setPartProp(p,find(p,'hc-sr04').instanceId,'testDistance',distance);const c=runner(p);c.advance(400000);for(const m of Object.values(c.snapshot().motors))assert.ok(direction===0?Math.abs(m.volts)<.05:direction*m.volts>.5);}
// Sample the rendered curves: crossings of the upper plate must pass outside its footprint.
const routed=buildTowerRobot(),router=createDeckWireRouter(routed.parts),upper=routed.parts.filter(p=>p.definitionId==='chassis-2wd')[1],toUpper=tInv(upper.transform);
assert.ok(router);assert.equal(createDeckWireRouter(buildReadyRobot().parts),null);
for(const wire of routed.connections){
 const a=pinWorld(routed,wire.a),b=pinWorld(routed,wire.b),middle=router(a,b);if(!middle.length)continue;
 const curve=new CatmullRomCurve3([a,...middle,b].map(p=>new Vector3(...p)),false,'catmullrom',.5);
 for(let i=0;i<=200;i++){const point=tPoint(toUpper,curve.getPoint(i/200).toArray());if(Math.abs(point[1])<.0025)assert.ok(Math.abs(point[0])>.0705||Math.abs(point[2])>.1055,'el cable cruza al exterior del piso superior');}
}
const movedRoute=translateParts(routed,[routed.parts[0].instanceId],[.2,0,-.1]).project,movedRouter=createDeckWireRouter(movedRoute.parts),example=routed.connections.find(w=>w.a.instanceId===find(routed,'arduino-uno-r3').instanceId||w.b.instanceId===find(routed,'arduino-uno-r3').instanceId);
const routeA=router(pinWorld(routed,example.a),pinWorld(routed,example.b)),routeB=movedRouter(pinWorld(movedRoute,example.a),pinWorld(movedRoute,example.b));assert.equal(routeA.length,routeB.length);for(let i=0;i<routeA.length;i++)assert.ok(Math.abs(routeB[i][0]-routeA[i][0]-.2)<1e-9&&Math.abs(routeB[i][2]-routeA[i][2]+.1)<1e-9);
pass('Doble piso: los cables rodean la placa, quedan bajo ella en el piso inferior y siguen al montaje al moverlo.');
pass('Seguidor de objetos: avanza a 60 cm, espera a 25 cm, retrocede a 12 cm y espera sin objeto cercano, ejecutando el HEX del UNO.');
await RAPIER.init();
for(const [kind,p,duration] of [['rover',buildRover4wd(),10000],['tower',buildTowerRobot(),9000],['sumo',buildSumoRobot(),24000]]){
 const phys=RobotPhysics.create(RAPIER,p),c=runner(p,phys),root=p.parts[0].instanceId,sensor=find(p,'hc-sr04').instanceId,path=[];let traveled=0,last=null,maxRadius=0,edgeSamples=0,reverseSamples=0,turn=0,prevYaw=null;
 const movedMotors=new Set();
 for(let t=0;t<duration;t+=20){c.advance(20000);const snap=c.snapshot(),pose=snap.physics.poses[root],q=pose.q,yaw=Math.atan2(2*(q[0]*q[2]+q[3]*q[1]),1-2*(q[0]*q[0]+q[1]*q[1]));assert.equal(Object.keys(snap.physics.poses).length,p.parts.length,'todas las piezas siguen un cuerpo simulado');if(last)traveled+=Math.hypot(pose.p[0]-last[0],pose.p[2]-last[2]);last=pose.p;maxRadius=Math.max(maxRadius,Math.hypot(pose.p[0],pose.p[2]));if(prevYaw!==null){let dy=yaw-prevYaw;if(dy>Math.PI)dy-=Math.PI*2;if(dy<-Math.PI)dy+=Math.PI*2;turn+=dy;}prevYaw=yaw;
  if(Object.values(snap.reflectance).some(s=>s.black))edgeSamples++;if(Object.values(snap.motors).some(m=>m.volts<-.1))reverseSamples++;for(const [id,m]of Object.entries(snap.motors))if(Math.abs(m.volts)>.5)movedMotors.add(id);
  path.push({t:t+20,p:pose.p,yaw,distance:phys.distance(sensor),edge:Object.values(snap.reflectance).map(s=>s.black)});
 }
 const summary={traveled,maxRadius,edgeSamples,reverseSamples,turn,movedMotors:movedMotors.size,last:path.at(-1),path};report.physics[kind]=summary;fs.writeFileSync(out+'/physics-'+kind+'.json',JSON.stringify(summary,null,2));console.log('PHYSICS',kind,JSON.stringify({...summary,path:undefined}));
 assert.ok(traveled>.08,kind+' se desplaza');
 if(kind==='rover'){assert.equal(movedMotors.size,4);assert.ok(Math.abs(turn)>.4,'el rover 4WD gira');const front=Math.max(...path.filter(s=>Math.abs(s.p[0])<.35).map(s=>s.p[2]+.1215));assert.ok(front<.69,'el rover esquiva la caja');}
 if(kind==='tower'){const tail=path.slice(-50),last=tail.at(-1);assert.ok(last.distance>.1&&last.distance<.4,'mantiene distancia del objeto');assert.ok(Math.hypot(tail[0].p[0]-last.p[0],tail[0].p[2]-last.p[2])<.05,'espera cerca del objetivo');}
 if(kind==='sumo'){assert.ok(edgeSamples>0,'los IR detectan el borde real');assert.ok(reverseSamples>0,'retrocede al borde');assert.ok(maxRadius<.65,'el centro del minisumo permanece dentro de la arena');assert.ok(Math.abs(turn)>.5,'cambia de dirección');}
 phys.dispose();pass(kind+': física, motores y sensores verificados desde el armado real.');
}
fs.writeFileSync(out+'/verification.json',JSON.stringify(report,null,2));
