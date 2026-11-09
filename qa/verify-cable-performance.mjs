import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {CatmullRomCurve3,Vector3,Mesh,MeshBasicMaterial,Raycaster} from 'three';
import {createCableGeometry,updateCableGeometry} from '../src/robotics/build/cableGeometry.ts';

const out='qa/cable-performance-2026-11-03';fs.mkdirSync(out,{recursive:true});
await build({entryPoints:['src/data/simulation.ts','src/data/wiring.ts','src/data/ropes.ts'],bundle:true,platform:'node',format:'esm',outdir:`${out}/model`,logLevel:'silent'});
const {solveSimulation,createSimulationSolver,emptySimulation,SIMULATION_EXAMPLES,OFF_RELAYS}=await import(`./cable-performance-2026-11-03/model/simulation.js`);
const {createCable,TERMINAL_BY_ID}=await import(`./cable-performance-2026-11-03/model/wiring.js`);
const {createRope,retarget,stepRope,ropePath}=await import(`./cable-performance-2026-11-03/model/ropes.js`);
const solver=createSimulationSolver();let cases=0;const unavailable=[];
for(const [name,example] of Object.entries(SIMULATION_EXAMPLES)){
 if(example.pairs.some(([a,b])=>!TERMINAL_BY_ID.has(a)||!TERMINAL_BY_ID.has(b))){unavailable.push(name);continue;}
 const wires=[];for(const [a,b] of [...example.pairs,['FUENTE:TP','BORNERA_MOTOR:TP']])wires.push(createCable(a,b,wires));
 const on={...emptySimulation(),enabled:true,plugged:true,forceBreaker:true,breakers:[true,true],earthRequired:true};
 const inputs=[emptySimulation(),on,{...on,pressed:['S1']},{...on,pressed:['S2']},{...on,pressed:['S3']},{...on,thermalTripped:true},{...on,breakers:[true,false]},{...on,powerContacts:OFF_RELAYS()},
  ...[{id:'f',kind:'wire-open',wire:wires[0].id},{id:'f',kind:'control-low',volts:12},{id:'f',kind:'coil-open',relay:'CONTACTOR_TERMICO'},{id:'f',kind:'contact-welded',a:'CONTACTOR_TERMICO:13',b:'CONTACTOR_TERMICO:14'}].map(f=>({...on,faults:[f]}))];
 for(const input of inputs)for(const timed of [[],['TEMPORIZADOR_1']]){
  const previous=OFF_RELAYS(),actual=solver(wires,input,previous,timed);
  assert.deepEqual(actual,solveSimulation(wires,input,previous,timed));
  assert.equal(solver(wires,input,previous,timed),actual,'same logical input reuses result');
  const changed=wires.slice(1);assert.deepEqual(solver(changed,input,previous,timed),solveSimulation(changed,input,previous,timed));cases++;
 }
}
const curve=new CatmullRomCurve3([new Vector3(0,0,0),new Vector3(.1,.2,0),new Vector3(.3,.1,.05)]),geometry=createCableGeometry();
const positions=geometry.getAttribute('position'),index=geometry.index;
for(let i=0;i<100;i++){
 curve.points[1].z=i*.001;updateCableGeometry(geometry,curve,.0011);
 assert.equal(geometry.getAttribute('position'),positions);assert.equal(geometry.index,index);
 assert.ok(Array.from(positions.array).every(Number.isFinite));
}
const a=new Vector3().fromBufferAttribute(positions,index.getX(0)),b=new Vector3().fromBufferAttribute(positions,index.getX(1)),c=new Vector3().fromBufferAttribute(positions,index.getX(2));
assert.ok(b.sub(a).cross(c.sub(a)).dot(new Vector3().fromBufferAttribute(geometry.getAttribute('normal'),index.getX(0)))>0,'outward triangle winding');
const material=new MeshBasicMaterial(),mesh=new Mesh(geometry,material);mesh.visible=false;mesh.updateMatrixWorld();
const point=curve.getPoint(.5),hits=new Raycaster(point.clone().add(new Vector3(0,0,1)),new Vector3(0,0,-1)).intersectObject(mesh);
assert.ok(hits.length,'invisible picking volume remains raycastable');
geometry.dispose();material.dispose();
const rope=createRope({x:0,y:0},{x:100,y:20},{sag:80});retarget(rope,{x:10,y:20},{x:200,y:100},{sag:80});
for(let i=0;i<300;i++)stepRope(rope);
assert.equal(rope.nodes[0].x,10);assert.equal(rope.nodes.at(-1).x,200);assert.ok(!/NaN|Infinity/.test(ropePath(rope)));
assert.ok(cases>=100);
const result={logicalCases:cases,examplesRequiringOtherInventory:unavailable,bufferUpdates:100,checks:['logical cache matches uncached solver, including faults, controls, timers and cable removal','existing GPU buffers reused','outward surfaces and invisible picking remain valid','rope endpoints and finite path preserved']};
fs.writeFileSync(`${out}/verification.json`,JSON.stringify(result,null,2));console.log('PASS',JSON.stringify(result));
