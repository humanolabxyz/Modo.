// Geometría pura de la ventana flotante (Node 24 ejecuta .ts directamente).
import assert from 'node:assert/strict';
import {clampRect,moveRect,resizeRect,MIN_W,MIN_H} from '../src/layout/floatRect.ts';
const b={minLeft:6,maxRight:844,minTop:50,maxBottom:390};
const r={left:100,top:60,width:300,height:200};
// mover
assert.deepEqual(moveRect(r,40,30,b),{left:140,top:90,width:300,height:200});
assert.deepEqual(moveRect(r,-500,-500,b),{left:6,top:50,width:300,height:200},'no sale por arriba ni por la izquierda');
assert.deepEqual(moveRect(r,900,900,b),{left:544,top:190,width:300,height:200},'no sale por abajo ni por la derecha');
// redimensionar
assert.deepEqual(resizeRect(r,'se',50,40,b),{left:100,top:60,width:350,height:240});
assert.equal(resizeRect(r,'se',-500,-500,b).width,MIN_W,'ancho mínimo');
assert.equal(resizeRect(r,'se',-500,-500,b).height,MIN_H,'alto mínimo');
assert.equal(resizeRect(r,'se',900,900,b).width,744,'no pasa del borde derecho');
assert.equal(resizeRect(r,'se',900,900,b).height,330,'no pasa del borde inferior');
assert.deepEqual(resizeRect(r,'sw',-40,20,b),{left:60,top:60,width:340,height:220},'sw crece hacia la izquierda');
assert.deepEqual(resizeRect(r,'sw',500,0,b),{left:180,top:60,width:MIN_W,height:200},'sw respeta el ancho mínimo sin desplazar el borde derecho');
assert.equal(resizeRect(r,'sw',-500,0,b).left,6,'sw no pasa del borde izquierdo');
assert.deepEqual(resizeRect(r,'e',30,99,b),{left:100,top:60,width:330,height:200},'e solo cambia el ancho');
assert.deepEqual(resizeRect(r,'w',-20,99,b),{left:80,top:60,width:320,height:200},'w solo cambia el ancho');
assert.deepEqual(resizeRect(r,'s',99,25,b),{left:100,top:60,width:300,height:225},'s solo cambia el alto');
// ajustar a la pantalla (p. ej. al girar el teléfono)
const c=clampRect({left:700,top:300,width:400,height:300},{minLeft:0,maxRight:600,minTop:40,maxBottom:350});
assert.ok(c.left>=0&&c.left+c.width<=600&&c.top>=40&&c.top+c.height<=350,'queda dentro de los límites');
assert.equal(c.width,400);assert.equal(c.height,300);assert.equal(c.left,200);assert.equal(c.top,50);
const small=clampRect({left:0,top:0,width:900,height:900},{minLeft:0,maxRight:300,minTop:40,maxBottom:200});
assert.equal(small.width,300);assert.equal(small.height,160,'si no cabe, se encoge al espacio disponible');
console.log('PASS verify-float');
