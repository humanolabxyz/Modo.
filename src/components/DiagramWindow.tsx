import {useEffect,useRef,useState,type MouseEvent as ReactMouseEvent,type PointerEvent as ReactPointerEvent,type ReactNode} from 'react';
import {clampRect,moveRect,resizeRect,type Bounds,type Rect,type ResizeDir} from '../layout/floatRect';
const HANDLES:ResizeDir[]=['se','sw','e','w','s'];
type Gesture={kind:'move'|'resize';dir:ResizeDir;x0:number;y0:number;rect0:Rect;bounds:Bounds;last:Rect;moved:boolean};
/** Límites de la ventana: bajo la barra y dentro de los márgenes seguros (muesca, barra de inicio). */
function readBounds():Bounds{
 const probe=document.createElement('div');
 probe.style.cssText='position:fixed;left:env(safe-area-inset-left,0px);top:env(safe-area-inset-top,0px);width:env(safe-area-inset-right,0px);height:env(safe-area-inset-bottom,0px);visibility:hidden;pointer-events:none';
 document.body.appendChild(probe);const p=probe.getBoundingClientRect();probe.remove();
 const bar=document.querySelector('.compact-bar')?.getBoundingClientRect();
 return {minLeft:p.left+4,maxRight:innerWidth-p.width-4,minTop:(bar?.bottom??0)+4,maxBottom:innerHeight-p.height-4};
}
const toRect=(el:HTMLElement):Rect=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height}};
const keyFor=(portrait:boolean)=>`panellab-float-v2-${portrait?'portrait':'landscape'}`;
const loadRect=(key:string):Rect|null=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&[v.left,v.top,v.width,v.height].every(n=>Number.isFinite(n))?v:null}catch{return null}};
const saveRect=(key:string,r:Rect|null)=>{try{r?localStorage.setItem(key,JSON.stringify(r)):localStorage.removeItem(key)}catch{}};
/** Diagrama en móvil: una ventana flotante que se mueve por la cabecera y se redimensiona por sus bordes.
 *  Cada orientación recuerda su propia posición y tamaño. Durante el gesto solo se tocan estilos del DOM
 *  (sin re-render); al soltar se confirma el estado y se guarda. */
export function DiagramWindow({open,compact,portrait,maximized,children}:{open:boolean;compact:boolean;portrait:boolean;maximized:boolean;children:ReactNode}){
 const root=useRef<HTMLDivElement>(null),gesture=useRef<Gesture|null>(null);
 const [rect,setRect]=useState<Rect|null>(null);
 const key=keyFor(portrait);
 /* Cada orientación tiene su propia ventana: al girar se carga la guardada (o la de por defecto). */
 useEffect(()=>{
  if(!compact){setRect(null);return}
  const saved=loadRect(key);setRect(saved?clampRect(saved,readBounds()):null);
 },[compact,key]);
 useEffect(()=>{
  if(!compact||!rect)return;
  const fit=()=>{const c=clampRect(rect,readBounds());if(c.left!==rect.left||c.top!==rect.top||c.width!==rect.width||c.height!==rect.height)setRect(c)};
  addEventListener('resize',fit);return ()=>removeEventListener('resize',fit);
 },[compact,rect]);
 const down=(e:ReactPointerEvent<HTMLDivElement>)=>{
  const el=root.current,target=e.target as Element;
  if(!compact||maximized||!el)return;
  const handle=target.closest<HTMLElement>('.float-handle'),header=target.closest('.diagram-pane-actions');
  if(!handle&&(!header||target.closest('button,a,input,select')))return;
  const rect0=toRect(el);
  gesture.current={kind:handle?'resize':'move',dir:(handle?.dataset.dir as ResizeDir)||'se',x0:e.clientX,y0:e.clientY,rect0,bounds:readBounds(),last:rect0,moved:false};
  el.setPointerCapture(e.pointerId);
 };
 const move=(e:ReactPointerEvent<HTMLDivElement>)=>{
  const el=root.current,g=gesture.current;if(!g||!el)return;
  const dx=e.clientX-g.x0,dy=e.clientY-g.y0;if(Math.abs(dx)+Math.abs(dy)>3)g.moved=true;
  const next=g.kind==='move'?moveRect(g.rect0,dx,dy,g.bounds):resizeRect(g.rect0,g.dir,dx,dy,g.bounds);
  g.last=next;el.style.left=next.left+'px';el.style.top=next.top+'px';el.style.width=next.width+'px';el.style.height=next.height+'px';
 };
 const up=(e:ReactPointerEvent<HTMLDivElement>)=>{
  const el=root.current,g=gesture.current;if(!g||!el)return;gesture.current=null;
  try{el.releasePointerCapture(e.pointerId)}catch{}
  if(g.moved){saveRect(key,g.last);setRect(g.last)}
 };
 const reset=(e:ReactMouseEvent<HTMLDivElement>)=>{
  const el=root.current,header=el?.querySelector('.diagram-pane-actions');
  /* Con el puntero capturado el evento llega a la raíz: se comprueba por coordenadas, no por e.target. */
  const hit=document.elementFromPoint(e.clientX,e.clientY),box=header?.getBoundingClientRect();
  if(!compact||!el||!box||e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom||hit?.closest('button,a,input,select'))return;
  for(const p of ['left','top','width','height'])el.style.removeProperty(p);
  saveRect(key,null);setRect(null);
 };
 /* El mismo árbol en escritorio y móvil: así el DiagramPane no se desmonta al cruzar el umbral y conserva su estado. */
 return <div ref={root} className={compact?'diagram-window':'diagram-passthrough'} hidden={compact&&!open} data-max={compact?maximized:undefined} style={compact&&!maximized&&rect?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:undefined} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDoubleClick={reset}>
  {children}
  {compact&&!maximized?HANDLES.map(d=><div key={d} className={`float-handle float-handle-${d}`} data-dir={d} aria-hidden="true"/>):null}
 </div>;
}
