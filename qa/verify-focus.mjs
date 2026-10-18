// Enfocar un módulo dentro de la parte visible del banco (Node 24 ejecuta .ts directamente).
import assert from 'node:assert/strict';
import {freeRegion,viewForModule} from '../src/layout/focusView.ts';
const FULL={w:1680,h:1460};
// ── freeRegion ──
const stage={left:0,top:48,width:390,height:796};
assert.deepEqual(freeRegion(stage,null),stage,'sin ventana, todo el banco');
assert.deepEqual(freeRegion(stage,{left:6,top:388,width:378,height:376}),{left:0,top:48,width:390,height:340},'ventana abajo → zona libre arriba');
const land={left:0,top:44,width:844,height:346};
assert.deepEqual(freeRegion(land,{left:6,top:50,width:337,height:264}),{left:343,top:44,width:501,height:346},'ventana a la izquierda → zona libre a la derecha');
assert.deepEqual(freeRegion(stage,{left:0,top:48,width:390,height:796}),stage,'ventana que lo cubre todo → se usa todo el banco');
// ── viewForModule: el centro del módulo cae en el centro de la zona libre y el módulo cabe ──
const project=(v,stage,X,Y)=>{const aspect=FULL.h/FULL.w,s=Math.min(stage.width/v.w,stage.height/(v.w*aspect));return {x:stage.width/2+(X-(v.x+v.w/2))*s,y:stage.height/2+(Y-(v.y+(v.w*aspect)/2))*s,s}};
for(const [stg,win] of [[stage,{left:6,top:388,width:378,height:376}],[land,{left:6,top:50,width:337,height:264}],[stage,null]]){
 const free=freeRegion(stg,win),m={x:600,y:300,w:300,h:220};
 const v=viewForModule(m,FULL,stg,free),p=project(v,stg,m.x+m.w/2,m.y+m.h/2);
 assert.ok(Math.abs(v.h-v.w*FULL.h/FULL.w)<1e-6,'mantiene la proporción del banco');
 assert.ok(Math.abs(stg.left+p.x-(free.left+free.width/2))<1&&Math.abs(stg.top+p.y-(free.top+free.height/2))<1,`centro del módulo en el centro de la zona libre (${JSON.stringify(win)})`);
 assert.ok(m.w*p.s<=free.width+0.5&&m.h*p.s<=free.height+0.5,'el módulo cabe en la zona libre');
}
// un módulo alto en una zona libre baja obliga a alejar el zoom
const tall=viewForModule({x:0,y:0,w:200,h:600},FULL,stage,{left:0,top:48,width:390,height:200});
assert.ok(tall.w>440,'se aleja lo necesario para que quepa');
console.log('PASS verify-focus');
