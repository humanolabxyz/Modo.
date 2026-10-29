import {dimensions,ports,type Board,type End,type Wire} from './model';
import {ductsFor} from './cabinet';
export type CablePoint={x:number;y:number};
export type CableEnd={point:CablePoint;out:CablePoint;angle:number};
export type CableGeometry={path:string;guide:CablePoint;ends:[CableEnd,CableEnd];color:string};
const same=(a:CablePoint,b:CablePoint)=>Math.abs(a.x-b.x)<.001&&Math.abs(a.y-b.y)<.001;
export function roundedCable(points:CablePoint[],radius=14):string{
 const p=points.filter((point,i)=>!i||!same(point,points[i-1]));if(p.length<2)return '';
 let d=`M${p[0].x} ${p[0].y}`;
 for(let i=1;i<p.length-1;i++){const a=p[i-1],b=p[i],c=p[i+1],l1=Math.hypot(b.x-a.x,b.y-a.y),l2=Math.hypot(c.x-b.x,c.y-b.y),r=Math.min(radius,l1/2,l2/2);d+=`L${b.x+(a.x-b.x)*r/l1} ${b.y+(a.y-b.y)*r/l1}Q${b.x} ${b.y} ${b.x+(c.x-b.x)*r/l2} ${b.y+(c.y-b.y)*r/l2}`;}
 return d+`L${p.at(-1)!.x} ${p.at(-1)!.y}`;
}
export function cableColor(w:Wire){const phase=w.from.port+' '+w.to.port;return w.route==='pe'?'#4e7740':w.route==='power'?/L2|T2|V1|V2/.test(phase)?'#343d3b':/L3|T3|W1|W2/.test(phase)?'#82877e':'#795d43':'#286c98';}
export function cableGeometry(board:Board,wire:Wire,getPoint?:(end:End)=>CablePoint,via=wire.via):CableGeometry{
 const end=(e:End):CableEnd=>{const part=board.parts.find(p=>p.id===e.part)!;const port=ports(part.kind).find(p=>p.id===e.port)!,d=dimensions(part.kind),point=getPoint?.(e)??{x:part.x+port.x,y:part.y+port.y};const out=port.x===0?{x:-1,y:0}:port.x===d.w?{x:1,y:0}:port.y===0?{x:0,y:-1}:{x:0,y:1};return {point,out,angle:Math.atan2(out.y,out.x)*180/Math.PI};};
 const a=end(wire.from),b=end(wire.to),number=Number(wire.label?.match(/\d+/)?.[0]??0)||[...wire.id].reduce((h,c)=>h+c.charCodeAt(0),0),lane=(number%5-2)/2;
 const all=ductsFor(board),horizontal=all.filter(d=>d.width>d.height).sort((a,b)=>a.y-b.y),vertical=all.filter(d=>d.height>=d.width);
 const track=(d:typeof all[number],axis:'x'|'y')=>d[axis]+(axis==='y'?d.height:d.width)/2+lane*Math.max(0,Math.min(8,(axis==='y'?d.height:d.width)/2-7));
 const lead=(e:CableEnd)=>({x:e.point.x+e.out.x*26+e.out.y*lane*5,y:e.point.y+e.out.y*26-e.out.x*lane*5});
 const sa=lead(a),sb=lead(b);
 if(via){return {path:roundedCable([a.point,sa,{x:via.x,y:sa.y},via,{x:sb.x,y:via.y},sb,b.point],18),guide:via,ends:[a,b],color:cableColor(wire)};}
 if(wire.from.part===wire.to.part){const y=Math.max(a.point.y,b.point.y)+39+lane*7;return {path:roundedCable([a.point,sa,{x:sa.x,y},{x:sb.x,y},sb,b.point],16),guide:{x:(sa.x+sb.x)/2,y},ends:[a,b],color:cableColor(wire)};}
 const local=(e:CableEnd,s:CablePoint)=>{const candidates=horizontal.filter(d=>e.point.x>=d.x-25&&e.point.x<=d.x+d.width+25).filter(d=>e.out.y<0?d.y+d.height<=e.point.y-8:e.out.y>0?d.y>=e.point.y+8:true).sort((d,z)=>Math.abs(track(d,'y')-s.y)-Math.abs(track(z,'y')-s.y));const duct=candidates[0];return {point:{x:s.x,y:duct?track(duct,'y'):s.y+e.out.y*12},duct};};
 const la=local(a,sa),lb=local(b,sb),preferred=wire.route==='pe'?horizontal.at(-1):wire.route==='power'?horizontal[Math.min(1,horizontal.length-1)]:horizontal[0];
 const y=la.duct&&la.duct.id===lb.duct?.id?la.point.y:preferred?track(preferred,'y'):(la.point.y+lb.point.y)/2;
 const spine=(p:CablePoint)=>{const v=[...vertical].sort((d,z)=>Math.abs(track(d,'x')-p.x)-Math.abs(track(z,'x')-p.x))[0];return v&&p.x>=157&&p.x<=1057?track(v,'x'):p.x;};
 const x1=Math.abs(la.point.y-y)<1?la.point.x:spine(la.point),x2=Math.abs(lb.point.y-y)<1?lb.point.x:spine(lb.point);
 const points=[a.point,sa,la.point,{x:x1,y:la.point.y},{x:x1,y},{x:x2,y},{x:x2,y:lb.point.y},lb.point,sb,b.point];
 return {path:roundedCable(points,16),guide:{x:(x1+x2)/2,y},ends:[a,b],color:cableColor(wire)};
}
