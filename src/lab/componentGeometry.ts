import {HOLE_BY_ID,buttonPins,type ProtoComponent} from './model';
import type {Rect} from './labels';

/** Solid bodies only. Leads and insulated jumper wires may cross above the board. */
export function componentBody(c:ProtoComponent):Rect|null{
 const a=HOLE_BY_ID.get(c.from),b=HOLE_BY_ID.get(c.to);if(!a||!b||c.kind==='wire')return null;
 const x=(a.x+b.x)/2,y=(a.y+b.y)/2;
 if(c.kind==='bjt')return {x:x-14,y:y-37,w:28,h:27};
 if(c.kind==='l293d')return {x:a.x-11,y:b.y+8,w:b.x-a.x+22,h:a.y-b.y-16};
 if(c.kind==='button'&&buttonPins(c.from,c.to))return {x:Math.min(a.x,b.x)+8,y:Math.min(a.y,b.y)+6,w:Math.abs(b.x-a.x)-16,h:Math.abs(b.y-a.y)-12};
 const d=Math.hypot(b.x-a.x,b.y-a.y)||1,cos=Math.abs(b.x-a.x)/d,sin=Math.abs(b.y-a.y)/d;
 const w=c.kind==='motor'?46:c.kind==='led'?26:c.kind==='resistor'?Math.max(24,Math.min(50,d-14)):c.kind==='diode'?Math.max(22,Math.min(36,d-14)):30;
 const h=c.kind==='motor'?26:c.kind==='led'?26:c.kind==='resistor'?15:c.kind==='diode'?11:26;
 const rw=w*cos+h*sin,rh=w*sin+h*cos;return {x:x-rw/2,y:y-rh/2,w:rw,h:rh};
}
export function bodyCollision(c:ProtoComponent,others:ProtoComponent[]):ProtoComponent|undefined{
 const a=componentBody(c);if(!a)return;
 return others.find(o=>{if(o.id===c.id)return false;const b=componentBody(o);return b&&a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;});
}
