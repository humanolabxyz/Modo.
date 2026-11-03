import assert from 'node:assert/strict';
import fs from 'node:fs';
import R from '@dimforge/rapier3d-compat';
import {buildCombatRobot,buildTemplate,COMBAT_TEMPLATES,TEMPLATES} from '../src/robotics/project/templates.ts';
import {COMBAT_DEFINITIONS,combatHulls} from '../src/robotics/catalog/combat.ts';
import {catalogShape} from '../src/robotics/catalog/index.ts';
import {parseRobotProject} from '../src/robotics/project/validate.ts';
import {arenaEligibility,ArenaMatch} from '../src/robotics/arena/model.ts';
import {findInterferences} from '../src/robotics/build/interference.ts';
import {detach,translateParts,anchorWorld} from '../src/robotics/project/commands.ts';
import {diagnose} from '../src/robotics/circuit/diagnostics.ts';
import {solve} from '../src/robotics/circuit/solve.ts';
const out='qa/robotics-combat-parts',checks=[];fs.mkdirSync(out,{recursive:true});await R.init();
const pass=s=>{checks.push(s);console.log('PASS',s);};
for(const [kind,wheels,count] of [['wedge',2,18],['scoop',4,22],['bumper',2,18]]){
 const p=buildCombatRobot(kind),part=p.parts.find(x=>x.definitionId===`sumo-${kind}`),def=COMBAT_DEFINITIONS.find(x=>x.id===part.definitionId);
 assert.equal(p.parts.length,count);assert.equal(p.attachments.length,count-1);assert.equal(p.attachments.filter(x=>x.kind==='wheel-hinge').length,wheels);
 assert.deepEqual(diagnose(p,solve(p)),[]);assert.equal(arenaEligibility(p).error,undefined);assert.deepEqual(findInterferences(p),[]);
 const parsed=parseRobotProject(JSON.parse(JSON.stringify(p)),{catalog:catalogShape});assert.ok(parsed.ok);assert.deepEqual(parsed.project,p);
 assert.ok(part.transform.position[1]-def.dimensions[1]/2>.004);
 const mount=p.attachments.find(x=>x.child.instanceId===part.instanceId);assert.equal(mount.parent.anchorId,'combat-front');
 const parentAnchor=anchorWorld(p.parts[0],'combat-front').position,childAnchor=anchorWorld(part,'back').position;assert.ok(parentAnchor.every((v,i)=>Math.abs(v-childAnchor[i])<1e-12));
 const shifted=translateParts(p,[p.parts[0].instanceId],[.2,0,.1]).project.parts.find(x=>x.instanceId===part.instanceId);
 assert.ok(Math.abs(shifted.transform.position[0]-part.transform.position[0]-.2)<1e-9);
 assert.ok(arenaEligibility(detach(p,mount.id)).error,'pieza suelta impide competir');
 assert.ok(Math.abs(combatHulls(def.id).reduce((sum,h)=>sum+h.massFraction,0)-1)<1e-9);
 for(const h of combatHulls(def.id))for(let i=0;i<h.vertices.length;i++)assert.ok(Math.abs(h.vertices[i])<=def.dimensions[i%3]/2+1e-9,'malla dentro de la caja catalogada');
 pass(`${kind}: ${count} piezas, ${wheels} ruedas, fijación real, sin interferencias, circuito, exportación/importación y entrada a la arena.`);
}
assert.ok(COMBAT_TEMPLATES.every(x=>TEMPLATES.some(t=>t.id===x.id)&&buildTemplate(x.id)));
// Probe the actual convex shapes: the scoop opening stays empty and the wedge has a sloped surface.
for(const id of COMBAT_DEFINITIONS.map(x=>x.id)){
 const w=new R.World({x:0,y:0,z:0});
 for(const h of combatHulls(id)){const d=R.ColliderDesc.convexHull(new Float32Array(h.vertices));assert.ok(d);w.createCollider(d);}
 w.step();
 const probe=(origin,dir,max=1)=>w.castRay(new R.Ray(origin,dir),max,true);
 if(id==='sumo-scoop'){
  assert.equal(probe({x:0,y:0,z:.07},{x:0,y:0,z:-1},.07),null,'frente superior abierto');
  assert.ok(probe({x:0,y:0,z:0},{x:0,y:0,z:-1},.1),'respaldo sólido');
  assert.ok(probe({x:0,y:0,z:0},{x:0,y:-1,z:0},.1),'base sólida');
  assert.ok(probe({x:0,y:-.012,z:0},{x:1,y:0,z:0},.2),'lateral sólido');
 }else if(id==='sumo-wedge'){
  const rear=probe({x:0,y:.1,z:-.03},{x:0,y:-1,z:0});const front=probe({x:0,y:.1,z:.03},{x:0,y:-1,z:0});
  assert.ok(front.timeOfImpact-rear.timeOfImpact>.02,'rampa: punta más baja que la parte posterior');
 }else assert.ok(probe({x:0,y:0,z:.05},{x:0,y:0,z:-1},.1),'defensa vertical sólida');
 w.free();
}
pass('Contactos convexos: rampa inclinada, pala abierta con base/respaldo/laterales y defensa vertical; misma geometría que la vista.');
const a=buildCombatRobot('wedge'),b=buildCombatRobot('scoop'),original=JSON.stringify([a,b]),match=new ArenaMatch(R,a,b,6);
let gap=Infinity,peak=[0,0];while(!match.frame().result){match.step();const f=match.frame(),p=f.roots.map(id=>f.physics.poses[id].p);gap=Math.min(gap,Math.hypot(p[0][0]-p[1][0],p[0][2]-p[1][2]));p.forEach((v,i)=>peak[i]=Math.max(peak[i],v[1]));assert.ok(p.flat().every(Number.isFinite));}
const frame=match.frame();assert.ok(gap>.14&&gap<.5,`contacto estable entre construcciones, separación mínima ${gap}`);assert.ok(frame.physics.wheels.every(x=>Number.isFinite(x.torque)));assert.equal(JSON.stringify([a,b]),original);match.dispose();
pass('Cuña contra pala 4WD: dos circuitos/programas, contacto estable, seis motores y resultado sin modificar las construcciones.');
fs.writeFileSync(out+'/model-results.json',JSON.stringify({checks,gap,peak,result:frame.result},null,2));
