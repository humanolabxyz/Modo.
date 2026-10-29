import {useEffect,useLayoutEffect,useRef} from 'react';
import type {BananaCable} from '../data/practice';
import {cableGeometry} from '../data/wiring';
import {createRope,retarget,ropePath,stepRope,type Rope} from '../data/ropes';
import {BananaCableVisual} from './BananaCable';
/** El cable cuelga de sus dos clavijas con peso y holgura (ver data/ropes.ts): cuando un módulo se mueve, el cable se balancea y
 *  se asienta, como los cables del multímetro. Los trazos de cada cable llevan `data-wp` para que el bucle de animación les ponga la
 *  forma nueva sin volver a pintar todo el tablero. */
export function WireLayer({wires,selected,onSelect,hitConnectors=true,errorWires=[],routeWireIds=[],liveWireIds=[]}:{layoutKey?:unknown;wires:BananaCable[];selected:string|null;onSelect:(id:string)=>void;hitConnectors?:boolean;errorWires?:string[];routeWireIds?:string[];liveWireIds?:string[]}){
 /* Un cable recién puesto anima su «clic» durante 0,7 s; los que ya estaban al abrir no se animan. */
 const seen=useRef<Map<string,number>|null>(null),now=Date.now();
 if(seen.current===null)seen.current=new Map(wires.map(w=>[w.id,0]));
 else for(const w of wires)if(!seen.current.has(w.id))seen.current.set(w.id,now+700);
 const isFresh=(id:string)=>(seen.current?.get(id)??0)>now;
 const root=useRef<SVGGElement>(null),ropes=useRef(new Map<string,Rope>()),frame=useRef(0);
 const flowPaths=useRef<SVGPathElement[]>([]);
 useLayoutEffect(()=>{flowPaths.current=Array.from(root.current?.querySelectorAll<SVGPathElement>('[data-flow-wire]')??[]);},[liveWireIds]);
 const flow=useRef(0),hasLive=liveWireIds.length>0;
 useEffect(()=>{
  if(!hasLive)return;const node=root.current,svg=node?.ownerSVGElement;if(!node||!svg)return;
  const slow=matchMedia('(prefers-reduced-motion: reduce)'),advance=()=>{
   if(document.hidden||svg.dataset.gesture==='true'||svg.dataset.dragging==='true'||svg.dataset.animating==='true')return;
   flow.current=(flow.current-2)%18;for(const path of flowPaths.current)path.setAttribute('stroke-dashoffset',String(flow.current));
  };
  let timer=window.setInterval(advance,slow.matches?200:100);
  const rate=()=>{clearInterval(timer);timer=window.setInterval(advance,slow.matches?200:100)};slow.addEventListener('change',rate);
  return()=>{clearInterval(timer);slow.removeEventListener('change',rate)};
 },[hasLive]);
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const known=new Set(wires.map(w=>w.id));
 for(const id of ropes.current.keys())if(!known.has(id)){ropes.current.delete(id)}
 let wake=false;
 const items=[...wires].sort((a,b)=>a.layer-b.layer||a.id.localeCompare(b.id)).map(w=>{
  const geometry=cableGeometry(w,wires),a={x:geometry.from.head.x,y:geometry.from.head.y+19},b={x:geometry.to.head.x,y:geometry.to.head.y+19};
  const shape={sag:geometry.sag-19,from:geometry.from.offset,to:geometry.to.offset};
  let rope=ropes.current.get(w.id);
  if(!rope){rope=createRope(a,b,shape);ropes.current.set(w.id,rope)}
  else if(retarget(rope,a,b,shape,!reduced))wake=true;
  return {w,geometry,path:ropePath(rope)};
 });
 useEffect(()=>{
  if(!wake&&![...ropes.current.values()].some(r=>r.awake))return;
  if(frame.current)return;
  const tick=()=>{
   frame.current=0;let any=false;
   for(const [id,rope] of ropes.current){
    if(!rope.awake)continue;
    const alive=stepRope(rope);any=any||alive;
    const group=root.current?.querySelector(`[data-wire-id="${id}"]`);if(!group)continue;
    const d=ropePath(rope);
    for(const el of group.querySelectorAll('[data-wp]'))el.setAttribute('d',d);
   }
   if(any)frame.current=requestAnimationFrame(tick);
  };
  frame.current=requestAnimationFrame(tick);
 });
 useEffect(()=>()=>{cancelAnimationFrame(frame.current);frame.current=0},[]);
 return <g ref={root} className="wire-layer">{items.map(({w,geometry,path})=>{
  const active=selected===w.id;
  return <g key={w.id} role="button" tabIndex={0} className="interactive-wire" data-wire-id={w.id} aria-label={`Cable de ${w.from.terminalId} a ${w.to.terminalId}`} aria-pressed={active} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onSelect(w.id)}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onSelect(w.id)}}}>
   {routeWireIds.includes(w.id)&&<path data-wp data-route-wire={w.id} d={path} fill="none" stroke="#28a7d2" strokeWidth="15" opacity=".7" pointerEvents="none"/>}
   {liveWireIds.includes(w.id)&&<path data-wp data-live-wire={w.id} d={path} fill="none" stroke="#e3af36" strokeWidth="12" opacity=".75" pointerEvents="none"/>}
   {active&&<path data-wp d={path} fill="none" stroke="#eba638" strokeWidth="13" opacity=".8" pointerEvents="none"/>}
   {errorWires.includes(w.id)&&<path data-wp data-wire-error={w.id} d={path} fill="none" stroke="#d34040" strokeWidth="15" opacity=".8" pointerEvents="none"/>}
   <path data-wp className="wire-hit" d={path} fill="none" stroke="transparent" strokeWidth="19" pointerEvents={hitConnectors?'stroke':'none'}/>
   {[geometry.from,geometry.to].map((end,i)=><path key={i} d={`M${end.point.x} ${end.point.y} L${end.head.x} ${end.head.y}`} stroke={w.color} strokeWidth="5" pointerEvents="none"/>)}
   {hitConnectors&&[geometry.from,geometry.to].map((end,i)=><circle key={`hit-${i}`} className="connector-hit" cx={end.head.x} cy={end.head.y+7} r="16" fill="transparent"/>)}
   <BananaCableVisual fresh={isFresh(w.id)} id={w.id} from={geometry.from.head} to={geometry.to.head} color={w.color} sag={geometry.sag} offsets={{from:geometry.from.offset,to:geometry.to.offset}} path={path}/>
   {liveWireIds.includes(w.id)&&<path data-wp className="wire-flow" data-flow-wire={w.id} d={path} fill="none" stroke="#fff6c4" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="1 17" pointerEvents="none"/>}
   <title>{`${w.from.terminalId} ↔ ${w.to.terminalId}`}</title>
  </g>;
 })}</g>;
}
