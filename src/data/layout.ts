import {useSyncExternalStore} from 'react';
import {MODULES,MAX_EXTRA_MODULES,buildExtraModule,extraKindOf,isExtraModuleId,nextExtraNumber,registerModule,unregisterModule,type ExtraKind,type PanelModule} from './panel';
/** Posición de cada módulo sobre los rieles. Las posiciones base vienen de panel.ts; el usuario puede acoplarlos donde quiera y añadir paneles. */
export type Pos={x:number;y:number};
export type Layout=Record<string,Pos>;
export type Rect={x:number;y:number;w:number;h:number};
export const GAP=24,MIN_GAP=8,MARGIN_X=65,TOP_Y=76,RAIL_OFFSET=34,SNAP=56,MAX_X=4000,MAX_Y=4000,KEY='panellab.layout.v1',EXTRAS_KEY='panellab.extras.v1';
/** Ancho útil del tablero base: los paneles añadidos se colocan primero a lo ancho de este borde y luego en una fila nueva. */
const BOARD_RIGHT=1342;
const baseIds=()=>MODULES.filter(m=>!m.extra);
const baseLayout=():Layout=>Object.fromEntries(baseIds().map(m=>[m.id,{x:m.x,y:m.y}]));
/** Coloca en un hueco libre los módulos adicionales que aún no tienen posición. */
function placeExtras(layout:Layout):Layout{
 const next={...layout};
 for(const m of MODULES)if(m.extra&&!valid(next[m.id]))next[m.id]=freeSlot(next,m);
 return next;
}
const base=():Layout=>placeExtras(baseLayout());
export const DEFAULT_LAYOUT:Layout=base();
let current:Layout=base();
const listeners=new Set<()=>void>();
const emit=()=>listeners.forEach(l=>l());
export const getLayout=()=>current;
export const modulePos=(m:{id:string;x:number;y:number},layout:Layout=current):Pos=>layout[m.id]??{x:m.x,y:m.y};
export const moduleRect=(m:PanelModule,layout:Layout=current):Rect=>({...modulePos(m,layout),w:m.w,h:m.h});
function valid(v:unknown):v is Pos{return !!v&&typeof v==='object'&&Number.isFinite((v as Pos).x)&&Number.isFinite((v as Pos).y)}
export function setModulePos(id:string,pos:Pos,persist=false){
 current={...current,[id]:pos};emit();if(persist)save();
}
export function resetLayout(){current=base();emit();try{localStorage.removeItem(KEY)}catch{}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(current))}catch{}}
function saveExtras(){try{localStorage.setItem(EXTRAS_KEY,JSON.stringify(MODULES.filter(m=>m.extra).map(m=>m.id)))}catch{}}

/* Lista de módulos: cambia cuando se añade o se retira un panel. Los componentes se suscriben con useModules(). */
let version=0;
const moduleListeners=new Set<()=>void>();
const bump=()=>{version++;moduleListeners.forEach(l=>l())};
export const useModules=()=>{useSyncExternalStore(cb=>{moduleListeners.add(cb);return()=>{moduleListeners.delete(cb)}},()=>version,()=>0);return MODULES};
export const extraModules=()=>MODULES.filter(m=>m.extra);
/** Añade un panel nuevo en un hueco libre del banco. Devuelve null si se alcanzó el máximo. */
export function addExtraModule(kind:ExtraKind):PanelModule|null{
 if(extraModules().length>=MAX_EXTRA_MODULES)return null;
 const m=buildExtraModule(kind,nextExtraNumber(kind));
 if(!registerModule(m))return null;
 current={...current,[m.id]:freeSlot(current,m)};
 saveExtras();save();bump();emit();
 return m;
}
/** Retira un panel añadido. Los paneles base no se pueden retirar. */
export function removeExtraModule(id:string){
 if(!unregisterModule(id))return false;
 const {[id]:_removed,...rest}=current;current=rest;
 saveExtras();save();bump();emit();
 return true;
}
/** Recupera los paneles añadidos antes de leer la práctica, para que sus cables sigan siendo válidos. */
export function loadExtraModules(){
 try{
  const raw=JSON.parse(localStorage.getItem(EXTRAS_KEY)||'null');if(!Array.isArray(raw))return;
  let changed=false;
  for(const id of raw.slice(0,MAX_EXTRA_MODULES)){
   if(typeof id!=='string'||!isExtraModuleId(id))continue;
   const kind=extraKindOf(id);if(!kind)continue;
   if(registerModule(buildExtraModule(kind,Number(id.match(/(\d+)$/)![1]))))changed=true;
  }
  if(changed){current=placeExtras(current);bump();emit()}
 }catch{}
}
/** Recupera la disposición guardada, descartando posiciones que se superpongan. */
export function loadLayout(){
 loadExtraModules();
 try{
  const raw=JSON.parse(localStorage.getItem(KEY)||'null');
  if(!raw||typeof raw!=='object'){current=base();emit();return}
  const next=baseLayout();for(const m of MODULES)if(valid(raw[m.id]))next[m.id]={x:raw[m.id].x,y:raw[m.id].y};
  const placed=placeExtras(next);
  if(MODULES.some((a,i)=>MODULES.slice(i+1).some(b=>overlaps(moduleRect(a,placed),moduleRect(b,placed),MIN_GAP-1)))){current=base();emit();return}
  current=placed;emit();
 }catch{}
}
export const useLayout=()=>useSyncExternalStore(cb=>{listeners.add(cb);return()=>{listeners.delete(cb)}},getLayout,()=>DEFAULT_LAYOUT);

export const overlaps=(a:Rect,b:Rect,pad=MIN_GAP)=>a.x<b.x+b.w+pad&&b.x<a.x+a.w+pad&&a.y<b.y+b.h+pad&&b.y<a.y+a.h+pad;
const nearest=(value:number,candidates:number[],threshold=SNAP)=>{
 let best:number|null=null,bestDistance=threshold+1;
 for(const c of candidates){const d=Math.abs(c-value);if(d<bestDistance){best=c;bestDistance=d}}
 return best;
};
const clampPos=(p:Pos):Pos=>({x:Math.min(MAX_X,Math.max(MARGIN_X,Math.round(p.x))),y:Math.min(MAX_Y,Math.max(TOP_Y,Math.round(p.y)))});

/** Primer hueco libre del banco para un panel nuevo: junto a los demás si cabe a lo ancho, o en una fila nueva debajo. */
export function freeSlot(layout:Layout,me:PanelModule,modules:PanelModule[]=MODULES):Pos{
 const others=modules.filter(m=>m.id!==me.id&&valid(layout[m.id])).map(m=>moduleRect(m,layout));
 const right=Math.max(BOARD_RIGHT,...others.map(o=>o.x+o.w)),bottom=Math.max(TOP_Y-GAP,...others.map(o=>o.y+o.h));
 const candidates:Pos[]=[{x:MARGIN_X,y:TOP_Y},{x:MARGIN_X,y:bottom+GAP}];
 for(const o of others)candidates.push({x:o.x+o.w+GAP,y:o.y},{x:o.x,y:o.y+o.h+GAP},{x:MARGIN_X,y:o.y+o.h+GAP},{x:o.x-GAP-me.w,y:o.y});
 const fits=candidates.filter(c=>c.x>=MARGIN_X&&c.y>=TOP_Y&&c.x+me.w<=right&&!others.some(o=>overlaps({...c,w:me.w,h:me.h},o)));
 fits.sort((a,b)=>(a.y+me.h)-(b.y+me.h)||a.y-b.y||a.x-b.x);
 return fits[0]??{x:MARGIN_X,y:bottom+GAP};
}

export type SnapResult={pos:Pos;guides:{x?:number;y?:number};/** Módulo vecino al que queda acoplado, si lo hay. */target:string|null;/** Verdadero si la posición se ajustó a un borde, a un riel o a un hueco. */snapped:boolean};
/** Módulo con el que `r` comparte un borde a distancia de acople (a un lado o encima/debajo, con tramos que se enfrentan). */
function dockedTo(r:Rect,others:{id:string;rect:Rect}[]){
 const tol=2;
 for(const {id,rect:o} of others){
  const sideBySide=Math.abs(r.x-(o.x+o.w+GAP))<=tol||Math.abs(r.x+r.w+GAP-o.x)<=tol,rowsMeet=r.y<o.y+o.h&&o.y<r.y+r.h;
  const stacked=Math.abs(r.y-(o.y+o.h+GAP))<=tol||Math.abs(r.y+r.h+GAP-o.y)<=tol,columnsMeet=r.x<o.x+o.w&&o.x<r.x+r.w;
  if(sideBySide&&rowsMeet||stacked&&columnsMeet)return id;
 }
 return null;
}
/**
 * Acopla el módulo a los bordes cercanos de los demás o al inicio del riel.
 * Nunca rechaza una posición: si quedaría encima de otro módulo, devuelve el hueco de acople libre más cercano
 * (a un lado, encima o debajo de cualquier módulo). Así el panel se puede soltar sobre otro y se coloca junto a él.
 */
export function snapModule(layout:Layout,id:string,desired:Pos,modules:PanelModule[]=MODULES):SnapResult|null{
 const me=modules.find(m=>m.id===id);if(!me)return null;
 const entries=modules.filter(m=>m.id!==id&&valid(layout[m.id])).map(m=>({id:m.id,rect:moduleRect(m,layout)}));
 const others=entries.map(e=>e.rect);
 const fits=(p:Pos)=>!others.some(o=>overlaps({...p,w:me.w,h:me.h},o));
 const d=clampPos(desired);
 const xs=[MARGIN_X,...others.flatMap(o=>[o.x+o.w+GAP,o.x-GAP-me.w,o.x,o.x+o.w-me.w])].filter(x=>x>=MARGIN_X);
 const ys=[TOP_Y,...others.flatMap(o=>[o.y+o.h+GAP,o.y-GAP-me.h,o.y,o.y+o.h-me.h])].filter(y=>y>=TOP_Y);
 const sx=nearest(d.x,xs),sy=nearest(d.y,ys);
 let pos={x:sx??d.x,y:sy??d.y},snapped=sx!=null||sy!=null;
 if(!fits(pos)){
  /* Encima de otro módulo: se busca el hueco de acople libre más cercano. */
  const slots:Pos[]=[],alignY=nearest(d.y,ys,SNAP*3)??d.y,alignX=nearest(d.x,xs,SNAP*3)??d.x;
  for(const o of others){
   for(const y of [o.y,o.y+o.h-me.h,alignY])slots.push({x:o.x+o.w+GAP,y},{x:o.x-GAP-me.w,y});
   for(const x of [o.x,o.x+o.w-me.w,alignX])slots.push({x,y:o.y+o.h+GAP},{x,y:o.y-GAP-me.h});
  }
  /* El hueco debe respetar la separación de acople con todos los demás, no solo con aquel al que se pega. */
  const clear=(p:Pos)=>!others.some(o=>overlaps({...p,w:me.w,h:me.h},o,GAP-2));
  const free=slots.map(clampPos).filter(clear);
  free.sort((a,b)=>Math.hypot(a.x-d.x,a.y-d.y)-Math.hypot(b.x-d.x,b.y-d.y));
  pos=free[0]??freeSlot(layout,me,modules);snapped=true;
 }
 const rect={...pos,w:me.w,h:me.h},target=dockedTo(rect,entries);
 return {pos,guides:{...(xs.includes(pos.x)?{x:pos.x}:{}),...(ys.includes(pos.y)?{y:pos.y}:{})},target,snapped};
}
/** Filas de riel: módulos cuyo borde superior casi coincide comparten riel. */
export function railRows(layout:Layout,modules:PanelModule[]=MODULES){
 const rows:{top:number;bottom:number}[]=[];
 for(const r of modules.map(m=>moduleRect(m,layout)).sort((a,b)=>a.y-b.y)){
  const row=rows.find(x=>Math.abs(x.top-r.y)<=SNAP);
  if(row){row.top=Math.min(row.top,r.y);row.bottom=Math.max(row.bottom,r.y+r.h)}else rows.push({top:r.y,bottom:r.y+r.h});
 }
 return rows.map(r=>({...r,rail:r.top-RAIL_OFFSET}));
}
/** Marco del tablero: se ajusta a los módulos para que no sobre espacio en blanco. */
export function boardFrame(layout:Layout,modules:PanelModule[]=MODULES){
 const rects=modules.map(m=>moduleRect(m,layout));
 const right=Math.max(...rects.map(r=>r.x+r.w)),bottom=Math.max(...rects.map(r=>r.y+r.h));
 const rows=railRows(layout,modules),railBottom=bottom+46;
 return {x:29,y:28,w:right+48-29,h:railBottom+27+20-28,rows,railBottom,right:right+48,bottom:railBottom+47};
}
/** Encuadre que muestra todo el tablero con el aspecto de la ventana de trabajo. */
export const VIEW_ASPECT=1680/1460;
export function fitView(layout:Layout=current,modules:PanelModule[]=MODULES){
 const f=boardFrame(layout,modules),padL=270,padR=130,padTop=150,padBottom=130;
 const w0=f.w+padL+padR,h0=f.h+padTop+padBottom,w=Math.max(w0,h0*VIEW_ASPECT),h=w/VIEW_ASPECT;
 return {x:f.x-padL-(w-w0)/2,y:f.y-padTop-(h-h0)/2,w,h};
}
/** Posición libre (sin acople) dentro de los límites del banco; la usa el módulo mientras se arrastra. */
export const clampFree=(p:Pos):Pos=>({x:Math.min(MAX_X,Math.max(MARGIN_X,p.x)),y:Math.min(MAX_Y,Math.max(TOP_Y,p.y))});

export type DropResult={
 /** Dónde queda el módulo arrastrado. */pos:Pos;
 /** Posiciones nuevas de los módulos que se mueven (el arrastrado y, si hay intercambio, el otro). */moves:Record<string,Pos>;
 kind:'swap'|'dock'|'free';swapWith:string|null;guides:{x?:number;y?:number};target:string|null;snapped:boolean};
const area=(r:Rect)=>r.w*r.h;
const intersection=(a:Rect,b:Rect)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
/**
 * Soltar un módulo. Si queda sobre otro (cubre buena parte de él), **cambian de lugar**: el arrastrado ocupa el sitio del otro y
 * el otro pasa al hueco que dejó. Si están en la misma fila o columna se reacomodan uno tras otro (aunque midan distinto) para
 * que no se superpongan. Si el intercambio no cabe, o apenas se tocan, se acopla al hueco libre más cercano (ver snapModule).
 * `origin` es la posición del módulo antes de empezar a arrastrar.
 */
export function dropModule(layout:Layout,id:string,desired:Pos,origin:Pos,modules:PanelModule[]=MODULES):DropResult|null{
 const me=modules.find(m=>m.id===id);if(!me)return null;
 const base=snapModule(layout,id,desired,modules);if(!base)return null;
 const dock:DropResult={pos:base.pos,moves:{[id]:base.pos},kind:base.snapped?'dock':'free',swapWith:null,guides:base.guides,target:base.target,snapped:base.snapped};
 const free:Rect={...clampFree(desired),w:me.w,h:me.h};
 let best:{m:PanelModule;rect:Rect;score:number}|null=null;
 for(const m of modules){
  if(m.id===id||!valid(layout[m.id]))continue;
  const rect=moduleRect(m,layout),inter=intersection(free,rect),center={x:free.x+free.w/2,y:free.y+free.h/2};
  const inside=center.x>rect.x&&center.x<rect.x+rect.w&&center.y>rect.y&&center.y<rect.y+rect.h;
  if(!inside&&inter<.3*Math.min(area(free),area(rect)))continue;
  if(!best||inter>best.score)best={m,rect,score:inter};
 }
 if(!best)return dock;
 const other=best.m,B=best.rect,A:Rect={...origin,w:me.w,h:me.h};
 const rest=modules.filter(m=>m.id!==id&&m.id!==other.id&&valid(layout[m.id])).map(m=>moduleRect(m,layout));
 const ok=(a:Pos,b:Pos)=>{
  const ra={...a,w:A.w,h:A.h},rb={...b,w:B.w,h:B.h};
  return a.x>=MARGIN_X&&a.y>=TOP_Y&&b.x>=MARGIN_X&&b.y>=TOP_Y&&!overlaps(ra,rb,GAP-2)&&!rest.some(r=>overlaps(ra,r)||overlaps(rb,r));
 };
 const candidates:{a:Pos;b:Pos}[]=[];
 const sameRow=A.y<B.y+B.h&&B.y<A.y+A.h,sameColumn=A.x<B.x+B.w&&B.x<A.x+A.w;
 if(sameRow){
  /* El arrastrado toma el lugar relativo del otro y se reacomodan uno tras otro, conservando la altura de cada hueco. */
  const left=Math.min(A.x,B.x);
  candidates.push(B.x>A.x?{b:{x:left,y:A.y},a:{x:left+B.w+GAP,y:B.y}}:{a:{x:left,y:B.y},b:{x:left+A.w+GAP,y:A.y}});
 }else if(sameColumn){
  const top=Math.min(A.y,B.y);
  candidates.push(B.y>A.y?{b:{x:A.x,y:top},a:{x:B.x,y:top+B.h+GAP}}:{a:{x:B.x,y:top},b:{x:A.x,y:top+A.h+GAP}});
 }
 candidates.push({a:{x:B.x,y:B.y},b:{x:A.x,y:A.y}});
 for(const c of candidates)if(ok(c.a,c.b))return {pos:c.a,moves:{[id]:c.a,[other.id]:c.b},kind:'swap',swapWith:other.id,guides:{},target:other.id,snapped:true};
 return dock;
}
