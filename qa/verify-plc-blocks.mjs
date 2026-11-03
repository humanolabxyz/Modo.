// PLC virtual: TP, flancos, CTU/CTD/CTUD con reset y carga, programa aplicado y validación de proyectos.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
const out='qa/plc-blocks';fs.mkdirSync(out,{recursive:true});
await build({stdin:{resolveDir:process.cwd(),contents:"export {tick,emptyRuntime,compilePLC} from './src/lab/engine';export {newProject} from './src/lab/model';export {parseProject} from './src/lab/validation';",loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:out+'/bundle.mjs',logLevel:'error'});
const m=await import('./plc-blocks/bundle.mjs?'+Date.now());
let n=0;const ok=(c,msg)=>{assert.ok(c,msg);n++;};
const tag=(address,name,type='bool')=>({address,name,type,initial:false});
const rung=(id,input,output,mode,preset=1,extra={})=>({id,comment:'',branches:[[{address:input,negated:false}]],output,mode,preset,...extra});
function project(rungs){const p=m.newProject('blank');const own=['M1.0','M1.1','M1.2','M1.3','M0.0','M0.1','M0.2','Q0.0'].map(a=>tag(a,a));p.plc={...p.plc,language:'ladder',source:'',rungs,tags:[...p.plc.tags.filter(t=>!own.some(o=>o.address===t.address)),...own]};return p;}
function run(p,steps){let r=m.emptyRuntime(p);const seen=[];for(const [writes,dt] of steps){r=m.tick(p,r,{},writes,dt,null);seen.push({...r.memory});}return {r,seen};}
const high={'M1.0':true},low={'M1.0':false};
// TP: pulso de 1 s que no se redispara mientras corre
{const p=project([rung('a','M1.0','Q0.0','tp',1)]),{seen}=run(p,[[low,.1],[high,.1],[high,.4],[low,.1],[high,.1],[high,.5],[high,.5],[low,.1]]);
 ok(!seen[0]['Q0.0'],'TP: sin entrada, salida 0');ok(seen[1]['Q0.0']&&seen[2]['Q0.0'],'TP: sube con el flanco');ok(seen[4]['Q0.0'],'TP: re-entrada durante el pulso no lo reinicia ni lo corta');ok(!seen[6]['Q0.0'],'TP: termina a 1 s aunque la entrada siga');}
// Flancos: un solo ciclo
{const p=project([rung('r','M1.0','M0.0','rise'),rung('f','M1.0','M0.1','fall')]),{seen}=run(p,[[low,.1],[high,.1],[high,.1],[low,.1],[low,.1]]);
 ok(seen[1]['M0.0']&&!seen[2]['M0.0'],'Flanco ↑ dura un ciclo');ok(seen[3]['M0.1']&&!seen[4]['M0.1'],'Flanco ↓ dura un ciclo');}
// CTU con reset (prioridad 1) y carga (prioridad 2)
{const p=project([rung('c','M1.0','Q0.0','ctu',3,{resetSignal:'M1.1',loadSignal:'M1.2'})]);
 const pulses=[];for(let i=0;i<3;i++)pulses.push([high,.1],[low,.1]);
 const {r,seen}=run(p,pulses);ok(r.blocks.c.count===3&&seen.at(-1)['Q0.0'],'CTU cuenta 3 flancos y activa la salida');
 const reset=m.tick(p,r,{},{'M1.1':true,'M1.2':true},.1,null);ok(reset.blocks.c.count===0&&!reset.memory['Q0.0'],'Reset domina a la carga');
 const load=m.tick(p,reset,{},{'M1.1':false,'M1.2':true},.1,null);ok(load.blocks.c.count===3,'Carga lleva el contador a PV');}
// CTD: inicia en PV, baja con flancos, salida al llegar a 0, nunca negativo
{const p=project([rung('d','M1.0','Q0.0','ctd',2)]);let r=m.emptyRuntime(p);
 r=m.tick(p,r,{},low,.1,null);ok(r.blocks.d.count===2&&!r.memory['Q0.0'],'CTD inicia en PV');
 for(let i=0;i<3;i++){r=m.tick(p,r,{},high,.1,null);r=m.tick(p,r,{},low,.1,null);}
 ok(r.blocks.d.count===0&&r.memory['Q0.0'],'CTD llega a 0 y no baja de 0');}
// CTUD: dos flancos simultáneos se anulan
{const p=project([rung('u','M1.0','Q0.0','ctud',5,{downSignal:'M1.3'})]);let r=m.emptyRuntime(p);
 r=m.tick(p,r,{},{'M1.0':true,'M1.3':false},.1,null);ok(r.blocks.u.count===1,'CTUD sube');
 r=m.tick(p,r,{},{'M1.0':false,'M1.3':false},.1,null);
 r=m.tick(p,r,{},{'M1.0':true,'M1.3':true},.1,null);ok(r.blocks.u.count===1,'CTUD: subida y bajada simultáneas se anulan');
 r=m.tick(p,r,{},{'M1.0':false,'M1.3':false},.1,null);
 r=m.tick(p,r,{},{'M1.0':false,'M1.3':true},.1,null);ok(r.blocks.u.count===0,'CTUD baja con su entrada');}
// Diagnósticos
{const bad=project([rung('x','M1.0','Q0.0','ctu',3,{resetSignal:'Z9.9'})]);ok(m.compilePLC(bad).diagnostics.some(d=>d.code==='L006'),'señal de reset inexistente se rechaza (L006)');
 const frac=project([rung('x','M1.0','Q0.0','ctd',2.5)]);ok(m.compilePLC(frac).diagnostics.some(d=>d.code==='L007'),'contador con ajuste no entero se rechaza (L007)');}
// Proyecto: ida y vuelta con bloques nuevos y programa activo; un activo inválido se rechaza
{const p=project([rung('c','M1.0','Q0.0','ctud',4,{resetSignal:'M1.1',loadSignal:'M1.2',downSignal:'M1.3'})]);const draft=structuredClone(p.plc);p.plc.active=structuredClone(draft);
 const back=m.parseProject(JSON.parse(JSON.stringify(p)));ok(back.ok,'el proyecto con bloques nuevos y programa activo se importa: '+(back.error??''));
 ok(back.project.plc.rungs[0].mode==='ctud'&&back.project.plc.rungs[0].downSignal==='M1.3','conserva modo y señales');ok(back.project.plc.active?.rungs[0].resetSignal==='M1.1','conserva el programa activo');
 const broken=JSON.parse(JSON.stringify(p));broken.plc.active.rungs[0].mode='inventado';ok(!m.parseProject(broken).ok,'un programa activo inválido no se importa');
 const nested=JSON.parse(JSON.stringify(p));nested.plc.active.active=structuredClone(draft);ok(!m.parseProject(nested).ok,'un activo anidado se rechaza');}
console.log(`PASS verify-plc-blocks: ${n} comprobaciones`);
