import {isPhoneViewport} from '../layout/phoneViewport';
import '../styles/phone-window-navigation.css';
import {windowTabsLayoutEvent} from './WindowTabs';
import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent,type ReactNode} from 'react';
import {clampRect,moveRect,resizeRect,type Bounds,type Rect,type ResizeDir} from '../layout/floatRect';
import '../styles/diagram-desktop-window.css';
const HANDLES:ResizeDir[]=['se','sw','e','w','s'];
type Gesture={kind:'move'|'resize';dir:ResizeDir;x0:number;y0:number;rect0:Rect;bounds:Bounds;last:Rect;moved:boolean};
/** Límites de la ventana: bajo la barra y dentro de los márgenes seguros (muesca, barra de inicio). */
function readBounds(desktop=false):Bounds{
 const probe=document.createElement('div');
 probe.style.cssText='position:fixed;left:env(safe-area-inset-left,0px);top:env(safe-area-inset-top,0px);width:env(safe-area-inset-right,0px);height:env(safe-area-inset-bottom,0px);visibility:hidden;pointer-events:none';
 document.body.appendChild(probe);const p=probe.getBoundingClientRect();probe.remove();
 const tabs=document.querySelector('.fw-tabstrip')?.getBoundingClientRect();
 const bar=document.querySelector('.compact-bar')?.getBoundingClientRect();
 return {minLeft:p.left+4,maxRight:innerWidth-p.width-4,minTop:Math.max(bar?.bottom??0,desktop?64:0)+4,maxBottom:Math.min(innerHeight-p.height-4,tabs?.height?tabs.top-6:Infinity)};
}
const toRect=(el:HTMLElement):Rect=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height}};
const keyFor=(portrait:boolean,compact:boolean)=>compact?`panellab-float-v2-${portrait?'portrait':'landscape'}`:'panellab-float-v2-desktop';
const loadRect=(key:string):Rect|null=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&[v.left,v.top,v.width,v.height].every(n=>Number.isFinite(n))?v:null}catch{return null}};
const saveRect=(key:string,r:Rect|null)=>{try{r?localStorage.setItem(key,JSON.stringify(r)):localStorage.removeItem(key)}catch{}};
/** Diagrama: una ventana flotante que se mueve por la cabecera y se redimensiona por sus bordes (móvil y escritorio).
 *  Cada orientación (y el escritorio) recuerda su propia posición y tamaño. Durante el gesto solo se tocan estilos del DOM
 *  (sin re-render); al soltar se confirma el estado y se guarda. */
export function DiagramWindow({open,compact,portrait,maximized,floating=compact,onToggleMax,children}:{open:boolean;compact:boolean;portrait:boolean;maximized:boolean;/** Ventana flotante (por defecto sólo en móvil). En escritorio queda fuera sólo en la lectura a pantalla completa. */floating?:boolean;onToggleMax():void;children:ReactNode}){
 const root=useRef<HTMLDivElement>(null),gesture=useRef<Gesture|null>(null);
 const [rect,setRect]=useState<Rect|null>(null);
 const phone=compact&&isPhoneViewport();
 const key=keyFor(portrait,compact),bounds=()=>readBounds(!compact),locked=compact&&maximized;
 /* Cada orientación tiene su propia ventana: al girar se carga la guardada (o la de por defecto). */
 useEffect(()=>{
  if(!floating)return;
  const saved=loadRect(key);setRect(saved?clampRect(saved,bounds()):null);
 },[key]);
 useEffect(()=>{
  if(!open||!floating||!rect)return;
  const fit=()=>{const c=clampRect(rect,bounds());if(c.left!==rect.left||c.top!==rect.top||c.width!==rect.width||c.height!==rect.height)setRect(c)};
  addEventListener('resize',fit);addEventListener(windowTabsLayoutEvent,fit);return ()=>{removeEventListener('resize',fit);removeEventListener(windowTabsLayoutEvent,fit)};
 },[open,floating,rect,phone]);
 const down=(e:ReactPointerEvent<HTMLDivElement>)=>{
  const el=root.current,target=e.target as Element;
  if(!floating||locked||!el||e.button!==0)return;
  const handle=target.closest<HTMLElement>('.float-handle'),header=target.closest<HTMLElement>('.diagram-pane-actions');
  if(!handle&&(!header||target.closest('button,a,input,select')))return;
  const rect0=toRect(el);
  gesture.current={kind:handle?'resize':'move',dir:(handle?.dataset.dir as ResizeDir)||'se',x0:e.clientX,y0:e.clientY,rect0,bounds:bounds(),last:rect0,moved:false};
  (handle??header)?.setPointerCapture(e.pointerId);
  e.preventDefault();
 };
 const move=(e:ReactPointerEvent<HTMLDivElement>)=>{
  const el=root.current,g=gesture.current;if(!g||!el)return;
  const dx=e.clientX-g.x0,dy=e.clientY-g.y0;if(Math.abs(dx)+Math.abs(dy)>3)g.moved=true;
  if(!g.moved)return;
  el.dataset.adjusted='true';
  const next=g.kind==='move'?moveRect(g.rect0,dx,dy,g.bounds):resizeRect(g.rect0,g.dir,dx,dy,g.bounds);
  g.last=next;el.style.left=next.left+'px';el.style.top=next.top+'px';el.style.width=next.width+'px';el.style.height=next.height+'px';
 };
 const up=()=>{
  const el=root.current,g=gesture.current;if(!g||!el)return;gesture.current=null;
  if(g.moved){saveRect(key,g.last);setRect(g.last)}
 };
 const maximize=(e:React.MouseEvent<HTMLDivElement>)=>{
  const el=root.current,header=el?.querySelector('.diagram-pane-actions');
  /* Con el puntero capturado el evento llega a la raíz: se comprueba por coordenadas, no por e.target. */
  const hit=document.elementFromPoint(e.clientX,e.clientY),box=header?.getBoundingClientRect();
  if(!floating||!el||!box||e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom||hit?.closest('button,a,input,select'))return;
  onToggleMax();
 };
 /* El mismo árbol en escritorio y móvil: así el DiagramPane no se desmonta al cruzar el umbral y conserva su estado. */
 return <div ref={root} className={floating?'diagram-window':'diagram-passthrough'} hidden={floating&&!open} data-max={compact?maximized:undefined} data-phone-layout={phone} data-adjusted={!!rect&&!locked} style={floating&&!locked&&rect?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:undefined} onKeyDown={e=>{if(!floating||locked||!(e.target as Element).closest('.diagram-move-handle')||!root.current)return;const delta:Record<string,[number,number]>={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]};if(!delta[e.key])return;e.preventDefault();const next=moveRect(toRect(root.current),...delta[e.key],bounds());saveRect(key,next);setRect(next)}} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDoubleClick={maximize}>
  {children}
  {floating&&!locked?HANDLES.map(d=><div key={d} className={`float-handle float-handle-${d}`} data-dir={d} aria-hidden="true"/>):null}
 </div>;
}
