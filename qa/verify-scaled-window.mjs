import assert from 'node:assert/strict';
import {scaleWindowRect} from '../src/layout/scaledWindow.ts';
const bounds={minLeft:8,minTop:56,maxRight:1432,maxBottom:892};
const original={left:300,top:120,width:520,height:420};
for(const factor of [.1,.75,1,1.25,8]){
 const resized=scaleWindowRect(original,factor,bounds);
 assert.ok(Math.abs(resized.width/resized.height-original.width/original.height)<1e-10,'La proporción permanece constante');
 assert.equal(resized.left,original.left);assert.equal(resized.top,original.top);
 assert.ok(resized.left+resized.width<=bounds.maxRight+.001);
 assert.ok(resized.top+resized.height<=bounds.maxBottom+.001);
 assert.ok(resized.width>=260&&resized.height>=140);
}
const corner={left:1100,top:700,width:280,height:180};
const limited=scaleWindowRect(corner,4,bounds);
assert.ok(limited.left+limited.width<=bounds.maxRight+.001&&limited.top+limited.height<=bounds.maxBottom+.001);
assert.ok(Math.abs(limited.width/limited.height-corner.width/corner.height)<1e-10);
console.log('PASS: escala proporcional, tamaño mínimo, esquina fija y límites de pantalla');
