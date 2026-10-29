import {memo,useCallback,useEffect,useId,useLayoutEffect,useMemo,useRef} from 'react';
import {BANANA_COLOR,type BananaCable} from '../data/practice';
import {cableGeometry,indexCableEndpoints} from '../data/wiring';
import {createRope,retarget,ropePath,stepRope,type Rope} from '../data/ropes';
import {BananaCableVisual,CableMaterial} from './BananaCable';

type Geometry=ReturnType<typeof cableGeometry>;
type Item={w:BananaCable;geometry:Geometry;rope:Rope;settleBy:number};
const sameGeometry=(a:Geometry,b:Geometry)=>a.sag===b.sag&&(['from','to'] as const).every(end=>a[end].point.x===b[end].point.x&&a[end].point.y===b[end].point.y&&a[end].head.x===b[end].head.x&&a[end].head.y===b[end].head.y&&a[end].offset.x===b[end].offset.x&&a[end].offset.y===b[end].offset.y);
const safeColor=(color:string)=>/^#[\da-f]{6}$/i.test(color)?color.toLowerCase():BANANA_COLOR;
const EMPTY:string[]=[];

/** Static connector/cable drawing is kept separate from selection and the rope animation loop. */
const WireItem=memo(function WireItem({item,active,route,live,error,hitConnectors,fresh,materialId,onSelect,register}:{item:Item;active:boolean;route:boolean;live:boolean;error:boolean;hitConnectors:boolean;fresh:boolean;materialId:string;onSelect:(id:string)=>void;register:(id:string,node:SVGGElement|null)=>void}){
 const {w,geometry,rope}=item,root=useRef<SVGGElement>(null),path=ropePath(rope);
 useLayoutEffect(()=>{register(w.id,root.current);return()=>register(w.id,null);},[w.id,active,route,live,error,register]);
 return <g ref={root} role="button" tabIndex={0} className="interactive-wire" data-wire-id={w.id} aria-label={`Cable de ${w.from.terminalId} a ${w.to.terminalId}`} aria-pressed={active} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onSelect(w.id)}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onSelect(w.id)}}}>
  {route&&<path data-wp data-route-wire={w.id} d={path} fill="none" stroke="#28a7d2" strokeWidth="15" opacity=".7" pointerEvents="none"/>}
  {live&&<path data-wp data-live-wire={w.id} d={path} fill="none" stroke="#e3af36" strokeWidth="12" opacity=".75" pointerEvents="none"/>}
  {active&&<path data-wp d={path} fill="none" stroke="#eba638" strokeWidth="13" opacity=".8" pointerEvents="none"/>}
  {error&&<path data-wp data-wire-error={w.id} d={path} fill="none" stroke="#d34040" strokeWidth="15" opacity=".8" pointerEvents="none"/>}
  <path data-wp className="wire-hit" d={path} fill="none" stroke="transparent" strokeWidth="19" pointerEvents={hitConnectors?'stroke':'none'}/>
  {[geometry.from,geometry.to].map((end,i)=><path key={i} d={`M${end.point.x} ${end.point.y} L${end.head.x} ${end.head.y}`} stroke={w.color} strokeWidth="5" pointerEvents="none"/>)}
  {hitConnectors&&[geometry.from,geometry.to].map((end,i)=><circle key={`hit-${i}`} className="connector-hit" cx={end.head.x} cy={end.head.y+7} r="16" fill="transparent"/>)}
  <BananaCableVisual fresh={fresh} id={w.id} from={geometry.from.head} to={geometry.to.head} color={w.color} sag={geometry.sag} offsets={{from:geometry.from.offset,to:geometry.to.offset}} path={path} materialId={materialId}/>
  {live&&<path data-wp className="wire-flow" data-flow-wire={w.id} d={path} fill="none" stroke="#fff6c4" strokeWidth="3.2" strokeLinecap="round" strokeDasharray="1 17" pointerEvents="none"/>}
  <title>{`${w.from.terminalId} ↔ ${w.to.terminalId}`}</title>
 </g>;
});

/** Cables keep their resting shapes; only moved endpoints wake their ropes. */
export function WireLayer({wires,layoutKey,selected,onSelect,hitConnectors=true,errorWires=EMPTY,routeWireIds=EMPTY,liveWireIds=EMPTY}:{layoutKey?:unknown;wires:BananaCable[];selected:string|null;onSelect:(id:string)=>void;hitConnectors?:boolean;errorWires?:string[];routeWireIds?:string[];liveWireIds?:string[]}){
 const root=useRef<SVGGElement>(null),records=useRef(new Map<string,Item>()),seen=useRef<Map<string,number>|null>(null),frame=useRef(0),flow=useRef(0);
 const flowPaths=useRef<SVGPathElement[]>([]);
 useLayoutEffect(()=>{flowPaths.current=Array.from(root.current?.querySelectorAll<SVGPathElement>('[data-flow-wire]')??[]);},[liveWireIds]);
 const paths=useRef(new Map<string,SVGPathElement[]>()),prefix=useId().replace(/[^\w-]/g,'');
 const register=useCallback((id:string,node:SVGGElement|null)=>{if(node)paths.current.set(id,Array.from(node.querySelectorAll<SVGPathElement>('[data-wp]')));else paths.current.delete(id);},[]);
 const index=useMemo(()=>indexCableEndpoints(wires),[wires]);
 const items=useMemo(()=>{
  const next=new Map<string,Item>(),initial=seen.current===null,now=Date.now();if(initial)seen.current=new Map();
  const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  for(const w of index.ordered){
   const geometry=cableGeometry(w,wires,index),old=records.current.get(w.id),same=old&&sameGeometry(old.geometry,geometry);
   if(!seen.current!.has(w.id))seen.current!.set(w.id,initial?0:now+700);
   if(same){next.set(w.id,old.w===w?old:{...old,w});continue;}
   const a={x:geometry.from.head.x,y:geometry.from.head.y+19},b={x:geometry.to.head.x,y:geometry.to.head.y+19},shape={sag:geometry.sag-19,from:geometry.from.offset,to:geometry.to.offset};
   const rope=old?.rope??createRope(a,b,shape);if(old)retarget(rope,a,b,shape,!reduced);
   next.set(w.id,{w,geometry,rope,settleBy:performance.now()+5000});
  }
  for(const id of seen.current!.keys())if(!next.has(id))seen.current!.delete(id);
  records.current=next;return [...next.values()];
 },[index,layoutKey,wires]);
 const colors=useMemo(()=>[...new Set(wires.map(w=>safeColor(w.color)))],[wires]);
 const routes=useMemo(()=>new Set(routeWireIds),[routeWireIds]),live=useMemo(()=>new Set(liveWireIds),[liveWireIds]),errors=useMemo(()=>new Set(errorWires),[errorWires]);
 const hasLive=liveWireIds.length>0;
 useEffect(()=>{
  if(!hasLive)return;const node=root.current,svg=node?.ownerSVGElement;if(!node||!svg)return;
  const slow=matchMedia('(prefers-reduced-motion: reduce)');let timer=0;
  const advance=()=>{if(document.hidden||svg.dataset.gesture==='true'||svg.dataset.dragging==='true'||svg.dataset.animating==='true')return;flow.current=(flow.current-2)%18;const offset=String(flow.current);for(const path of flowPaths.current)path.setAttribute('stroke-dashoffset',offset);};
  const rate=()=>{clearInterval(timer);if(!document.hidden)timer=window.setInterval(advance,slow.matches?200:100);};rate();slow.addEventListener('change',rate);document.addEventListener('visibilitychange',rate);
  return()=>{clearInterval(timer);slow.removeEventListener('change',rate);document.removeEventListener('visibilitychange',rate);};
 },[hasLive]);
 useEffect(()=>{
  if(frame.current||!items.some(item=>item.rope.awake))return;
  const tick=()=>{
   frame.current=0;let any=false;
   const now=performance.now();
   for(const [id,{rope,settleBy}] of records.current){if(!rope.awake)continue;stepRope(rope);if(now>=settleBy){rope.awake=false;rope.target=undefined;for(const n of rope.nodes){n.px=n.x;n.py=n.y;}}any=rope.awake||any;const d=ropePath(rope);for(const path of paths.current.get(id)??[])if(path.getAttribute('d')!==d)path.setAttribute('d',d);}
   if(any)frame.current=requestAnimationFrame(tick);
  };
  frame.current=requestAnimationFrame(tick);
 });
 useEffect(()=>()=>{cancelAnimationFrame(frame.current);frame.current=0;},[]);
 const now=Date.now();
 return <g ref={root} className="wire-layer">
  {colors.map(color=><CableMaterial key={color} id={`${prefix}-${color.slice(1)}`} color={color}/>)}
  {items.map(item=><WireItem key={item.w.id} item={item} active={selected===item.w.id} route={routes.has(item.w.id)} live={live.has(item.w.id)} error={errors.has(item.w.id)} hitConnectors={hitConnectors} fresh={(seen.current?.get(item.w.id)??0)>now} materialId={`${prefix}-${safeColor(item.w.color).slice(1)}`} onSelect={onSelect} register={register}/>)}
 </g>;
}
