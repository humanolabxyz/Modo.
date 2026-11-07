import {isPhoneViewport,PHONE_VIEWPORT_QUERY} from '../layout/phoneViewport';
import {useEffect,useId,useLayoutEffect,useRef,type ReactNode,type PointerEvent as ReactPointerEvent,type KeyboardEvent as ReactKeyboardEvent} from 'react';
import {createPortal} from 'react-dom';
import {GripHorizontal,Maximize2,MoveDiagonal,Minimize2,Minus,RotateCcw,X} from 'lucide-react';
import {moveRect,type Bounds,type Rect} from '../layout/floatRect';
import '../styles/floating-window.css';
import '../styles/floating-window-touch.css';
import '../styles/phone-window-navigation.css';

let nextLayer=300;
const layers=new Set<number>();
const MIN_W=260,MIN_H=170;
const EDGES=['n','s','e','w','ne','nw','se','sw'] as const;
type Edge=typeof EDGES[number];
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
/** Los límites se calculan una vez y se reutilizan unos instantes: leer posiciones del DOM obliga al navegador a recalcular todo el layout,
 *  y varias ventanas a la vez lo repetían decenas de veces al abrir una herramienta. */
let boundsCache:{t:number;v:Bounds}|null=null;
let probe:HTMLDivElement|null=null;
if(typeof window!=='undefined'){const reset=()=>{boundsCache=null};addEventListener('resize',reset);visualViewport?.addEventListener('resize',reset);visualViewport?.addEventListener('scroll',reset)}
function bounds(phone=false):Bounds{
 const now=performance.now();if(!phone&&boundsCache&&now-boundsCache.t<150)return boundsCache.v;
 if(!probe||!probe.isConnected){probe=document.createElement('div');probe.setAttribute('aria-hidden','true');probe.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;box-sizing:content-box;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';document.body.appendChild(probe)}
 const cs=getComputedStyle(probe),safe={top:parseFloat(cs.paddingTop)||0,width:parseFloat(cs.paddingRight)||0,height:parseFloat(cs.paddingBottom)||0,left:parseFloat(cs.paddingLeft)||0};
 const viewport=window.visualViewport,left=viewport?.offsetLeft??0,top=viewport?.offsetTop??0;
 const bottom=top+(viewport?.height??innerHeight)-safe.height-8;
 if(phone)return {minLeft:left+safe.left+8,maxRight:left+(viewport?.width??innerWidth)-safe.width-8,minTop:top+safe.top+8,maxBottom:bottom};
 const dock=Array.from(document.querySelectorAll('.tool-dock,.lab-dock,.cab-controls')).map(el=>el.getBoundingClientRect()).find(r=>r.width>0&&r.height>0&&r.bottom>bottom-80&&r.top<bottom);
 const v={minLeft:left+safe.left+8,maxRight:left+(viewport?.width??innerWidth)-safe.width-8,minTop:Math.max(top+safe.top,document.querySelector('.compact-bar')?.getBoundingClientRect().bottom??0)+8,maxBottom:dock?Math.min(bottom,dock.top-8):bottom};
 boundsCache={t:now,v};return v;
}
const rectOf=(el:HTMLElement):Rect=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height}};
/** Cada ventana recuerda dónde la dejaste (posición y, si la ajustaste, su tamaño). Sólo en pantallas anchas: en angostas se acopla abajo. */
const storageKey=(title:string)=>`panellab-win-v1:${title}`;
const loadSaved=(title:string):Partial<Rect>|null=>{try{const v=JSON.parse(localStorage.getItem(storageKey(title))||'null');return v&&Number.isFinite(v.left)&&Number.isFinite(v.top)?v:null}catch{return null}};
const forget=(title:string)=>{try{localStorage.removeItem(storageKey(title))}catch{}};
/** Olvida la posición y el tamaño guardados de una ventana (por su `storageId`, o por su título si no tiene). Sirve para «Restablecer disposición». */
export const forgetWindowLayout=(storageId:string)=>forget(storageId);
/** Las ventanas secundarias salen del contenedor del diagrama para evitar recortes y solapamientos.
 *  Se mueven por la cabecera, se ajustan por cualquier borde o esquina, se maximizan y el contenido se reacomoda a su tamaño.
 *  `anchor="bottom"`: en pantallas angostas la ventana se acopla abajo (hasta que se arrastra) para dejar visible lo que explica. */
export function FloatingWindow({title,eyebrow,onClose,children,actions,activation,className='',closeLabel='Cerrar ventana',width=520,anchor='top',side='center',top=0,dockFraction=.5,passive=false,visible=true,heightFraction=.88,phoneFraction,scaleBody=false,scope,showControlsHint=false,freeOnTouch=true,onMinimize,storageId,cascade=0}:{title:string;/** Clave de persistencia de posición y tamaño (por defecto, el título). Evita que ventanas homónimas de otros módulos compartan lugar. */storageId?:string,/** Desplaza hacia abajo (px) la posición inicial de ventanas laterales para escalonarlas; 0 = sin cambio. */cascade?:number;eyebrow?:string;onClose:()=>void;children:ReactNode;actions?:ReactNode;activation?:number;className?:string;closeLabel?:string;width?:number;anchor?:'top'|'bottom';/** Lado de la pantalla en que aparece al abrirse (después se arrastra). */side?:'left'|'center'|'right';/** Separación extra desde el borde superior al abrirse. */top?:number;dockFraction?:number;/** Ventana de estado: no toma el foco al abrirse ni responde a Escape (sigue moviéndose, ajustándose y cerrándose). */passive?:boolean;visible?:boolean;heightFraction?:number;/** Optional compact phone window, leaving the canvas and dock visible. */phoneFraction?:number;/** Escala el contenido como imagen (zoom) en vez de reacomodarlo. Por defecto el contenido se adapta al tamaño. */scaleBody?:boolean;/** Selector del contenedor donde se monta (por defecto el documento): permite heredar los estilos de su espacio de trabajo. */scope?:string;showControlsHint?:boolean;freeOnTouch?:boolean;onMinimize?:()=>void}){
 const root=useRef<HTMLElement>(null),close=useRef<HTMLButtonElement>(null),onCloseRef=useRef(onClose),layer=useRef(0),id=useId(),lastActivation=useRef(activation),titleRef=useRef(title);
 const body=useRef<HTMLDivElement>(null),content=useRef<HTMLDivElement>(null),scaleLabel=useRef<HTMLSpanElement>(null),manual=useRef(false),phoneLayout=useRef(false),resetSize=useRef<()=>void>(()=>{}),maxRect=useRef<Rect|null>(null);
 const edge=useRef<{dir:Edge;x:number;y:number;rect:Rect;bounds:Bounds;base:number}|null>(null);
 const drag=useRef<{x:number;y:number;rect:Rect;bounds:Bounds}|null>(null),docked=useRef(anchor==='bottom');
 onCloseRef.current=onClose;titleRef.current=storageId??title;
 const raise=()=>{layers.delete(layer.current);layer.current=++nextLayer;if(!passive&&visible)layers.add(layer.current);if(root.current)root.current.style.zIndex=String(layer.current)};
 const scaleContent=(baseContentWidth:number)=>{
  const el=content.current,b=body.current;if(!el||!b||!root.current)return;
  if(!scaleBody){el.style.removeProperty('width');el.style.removeProperty('zoom');root.current.dataset.contentScale='1';if(scaleLabel.current)scaleLabel.current.textContent='';return;}
  const style=getComputedStyle(b),padding=parseFloat(style.paddingLeft)+parseFloat(style.paddingRight);
  const scale=Math.max(.1,(b.clientWidth-padding)/baseContentWidth);
  el.style.width=baseContentWidth+'px';el.style.zoom=String(scale);root.current.dataset.contentScale=String(scale);
  if(scaleLabel.current)scaleLabel.current.textContent=Math.round(scale*100)+'%';
 };
 const persist=()=>{
  const el=root.current;if(!el||(!freeOnTouch&&innerWidth<700)||!visible)return;
  try{const r=rectOf(el);localStorage.setItem(storageKey(titleRef.current),JSON.stringify(manual.current?r:{left:r.left,top:r.top}))}catch{}
 };
 const setMaximizedFlag=(on:boolean)=>{if(root.current)root.current.dataset.maximized=on?'true':'false'};
 const applyRect=(el:HTMLElement,r:Rect,b:Bounds)=>{
  el.style.maxHeight=(b.maxBottom-b.minTop)+'px';
  el.style.left=r.left+'px';el.style.top=r.top+'px';el.style.width=r.width+'px';el.style.height=r.height+'px';
 };
 useLayoutEffect(()=>{
  const el=root.current;if(!el||!visible)return;
  const resetContent=()=>{manual.current=false;el.style.height='auto';content.current?.style.removeProperty('zoom');content.current?.style.removeProperty('width');el.dataset.contentScale='1';if(scaleLabel.current)scaleLabel.current.textContent=scaleBody?'100%':''};
  const fit=(center=false)=>{
   const phone=isPhoneViewport(),b=bounds(phone&&phoneFraction===undefined);
   el.dataset.phoneLayout=String(phone);
   el.dataset.phoneLandscape=String(phone&&matchMedia('(orientation:landscape)').matches);
   if(phone){
    phoneLayout.current=true;manual.current=false;maxRect.current=null;setMaximizedFlag(false);
    const landscape=matchMedia('(orientation:landscape)').matches,availableWidth=b.maxRight-b.minLeft,availableHeight=b.maxBottom-b.minTop;
    const w=landscape?Math.min(480,availableWidth*.64):availableWidth;
    const minimized=el.classList.contains('is-minimized'),compactReading=!landscape&&el.classList.contains('is-measurement-ready')&&!el.classList.contains('is-editing-measurement');
    const h=minimized?Math.min(180,availableHeight):phoneFraction!==undefined?clamp(availableHeight*phoneFraction,MIN_H,availableHeight):compactReading?Math.min(availableHeight,Math.max(520,availableHeight*.64)):availableHeight;
    applyRect(el,{left:landscape?b.maxRight-w:b.minLeft,top:minimized||compactReading||phoneFraction!==undefined?b.maxBottom-h:b.minTop,width:w,height:h},b);
    return;
   }
   if(phoneLayout.current){phoneLayout.current=false;manual.current=false;el.style.height='auto';}
   if(manual.current){
    const old=rectOf(el),fittedWidth=Math.min(old.width,b.maxRight-b.minLeft-8),scale=Number(el.dataset.contentScale)||1,baseContentWidth=(content.current?.getBoundingClientRect().width??1)/scale;
    // Al girar a una pantalla mucho más estrecha, recuperar el tamaño legible de esa orientación.
    if(scaleBody&&scale*fittedWidth/old.width<.65)resetContent();
    else{el.style.width=fittedWidth+'px';el.style.maxHeight=(b.maxBottom-b.minTop)+'px';el.style.height=Math.min(old.height,b.maxBottom-b.minTop)+'px';scaleContent(baseContentWidth)}
   }
   const dock=docked.current&&b.maxRight-b.minLeft<700;
   if(!manual.current){el.style.width=Math.max(0,Math.min(width,b.maxRight-b.minLeft-8))+'px';el.style.maxHeight=Math.max(0,(b.maxBottom-b.minTop)*(dock?Math.max(.35,Math.min(.85,dockFraction)):Math.max(.35,Math.min(.95,heightFraction))))+'px'}
   const r=rectOf(el),p=moveRect(r,0,0,b);const centered=b.minLeft+(b.maxRight-b.minLeft-r.width)/2,start=dock||side==='center'?centered:side==='left'?b.minLeft:b.maxRight-r.width;el.style.left=(center||dock?start:p.left)+'px';el.style.top=(dock?b.maxBottom-r.height:center?Math.min(b.minTop+top,Math.max(b.minTop,b.maxBottom-r.height)):cascade>0?Math.min(b.minTop+cascade,Math.max(b.minTop,b.maxBottom-160)):p.top)+'px';
  };
  resetSize.current=()=>{edge.current=null;maxRect.current=null;setMaximizedFlag(false);forget(titleRef.current);resetContent();fit(true)};
  raise();fit(true);
  /* Recupera la posición (y el tamaño, si se ajustó) de la última vez. */
  const saved=!isPhoneViewport()&&(innerWidth>=700||freeOnTouch)?loadSaved(titleRef.current):null;
  if(saved){
   const b=bounds(isPhoneViewport()),cur=rectOf(el),w=Number.isFinite(saved.width)?clamp(saved.width!,MIN_W,b.maxRight-b.minLeft):cur.width,h=Number.isFinite(saved.height)?clamp(saved.height!,MIN_H,b.maxBottom-b.minTop):cur.height;
   docked.current=false;
   if(Number.isFinite(saved.width)&&Number.isFinite(saved.height)){manual.current=true;el.style.width=w+'px';el.style.maxHeight=(b.maxBottom-b.minTop)+'px';el.style.height=h+'px'}
   el.style.left=clamp(saved.left!,b.minLeft,b.maxRight-w)+'px';el.style.top=clamp(saved.top!,b.minTop,Math.max(b.minTop,b.maxBottom-Math.min(h,cur.height)))+'px';
  }
  const resize=()=>{drag.current=null;edge.current=null;delete el.dataset.resizing;fit()};
  let fitFrame=0;
  const observer=new ResizeObserver(()=>{if(fitFrame)return;fitFrame=requestAnimationFrame(()=>{fitFrame=0;if(!drag.current&&!edge.current)fit()})});observer.observe(el);
  const phoneQuery=matchMedia(PHONE_VIEWPORT_QUERY);phoneQuery.addEventListener('change',resize);
  addEventListener('resize',resize);visualViewport?.addEventListener('resize',resize);visualViewport?.addEventListener('scroll',resize);
  return ()=>{phoneQuery.removeEventListener('change',resize);observer.disconnect();cancelAnimationFrame(fitFrame);layers.delete(layer.current);removeEventListener('resize',resize);visualViewport?.removeEventListener('resize',resize);visualViewport?.removeEventListener('scroll',resize)};
 },[width,dockFraction,heightFraction,phoneFraction,scaleBody,visible,freeOnTouch]);
 useLayoutEffect(()=>{if(activation!==undefined&&lastActivation.current!==activation){raise();close.current?.focus({preventScroll:true})}lastActivation.current=activation},[activation]);
 useEffect(()=>{
  if(passive||!visible){layers.delete(layer.current);return;}
  raise();
  const previous=document.activeElement as HTMLElement|null;
  /* No le quita el foco a un campo que ya lo tomó al abrirse (editores con autoFocus). */
  if(!root.current?.contains(document.activeElement))close.current?.focus({preventScroll:true});
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]')&&layer.current===Math.max(...layers)){e.preventDefault();e.stopImmediatePropagation();onCloseRef.current()}};
  window.addEventListener('keydown',escape,true);
  return ()=>{window.removeEventListener('keydown',escape,true);if(previous?.isConnected)previous.focus({preventScroll:true})};
 },[visible,passive]);
 const down=(e:ReactPointerEvent<HTMLElement>)=>{
  if(isPhoneViewport()||e.button!==0||(e.target as Element).closest('button'))return;
  const el=root.current;if(!el)return;docked.current=false;if(maxRect.current){maxRect.current=null;setMaximizedFlag(false)}drag.current={x:e.clientX,y:e.clientY,rect:rectOf(el),bounds:bounds(isPhoneViewport())};el.dataset.moving='true';e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault();
 };
 const toggleMax=()=>{
  const el=root.current;if(!el)return;docked.current=false;
  if(maxRect.current){const b=bounds(isPhoneViewport()),r=maxRect.current;maxRect.current=null;setMaximizedFlag(false);applyRect(el,r,b);scaleContent((content.current?.getBoundingClientRect().width??1)/(Number(el.dataset.contentScale)||1));persist();return}
  const b=bounds(isPhoneViewport()),r=rectOf(el);maxRect.current=r;manual.current=true;setMaximizedFlag(true);
  applyRect(el,{left:b.minLeft,top:b.minTop,width:b.maxRight-b.minLeft,height:b.maxBottom-b.minTop},b);
 };
 /* Ajuste libre por cualquier borde o esquina. */
 const beginEdge=(dir:Edge)=>(e:ReactPointerEvent<HTMLElement>)=>{
  const el=root.current,c=content.current;if(isPhoneViewport()||e.button!==0||!el||!c)return;
  e.stopPropagation();docked.current=false;manual.current=true;if(maxRect.current){maxRect.current=null;setMaximizedFlag(false)}
  const b=bounds(isPhoneViewport()),scale=Number(el.dataset.contentScale)||1,start=rectOf(el);
  // Fija el tamaño visible antes de levantar el límite de altura. Así el primer
  // gesto no expande la ventana al tamaño natural de un contenido largo.
  el.style.height=start.height+'px';
  el.dataset.resizing='true';el.style.maxHeight=(b.maxBottom-b.minTop)+'px';
  edge.current={dir,x:e.clientX,y:e.clientY,rect:start,bounds:b,base:c.getBoundingClientRect().width/scale};
  e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault();
 };
 const moveEdge=(e:ReactPointerEvent<HTMLElement>)=>{
  const d=edge.current,el=root.current;if(!d||!el)return;
  const dx=e.clientX-d.x,dy=e.clientY-d.y,b=d.bounds;let {left,top,width,height}=d.rect;
  if(d.dir.includes('e'))width=clamp(d.rect.width+dx,MIN_W,b.maxRight-d.rect.left);
  if(d.dir.includes('w')){const right=d.rect.left+d.rect.width;left=clamp(d.rect.left+dx,b.minLeft,right-MIN_W);width=right-left}
  if(d.dir.includes('s'))height=clamp(d.rect.height+dy,MIN_H,b.maxBottom-d.rect.top);
  if(d.dir.includes('n')){const bottom=d.rect.top+d.rect.height;top=clamp(d.rect.top+dy,b.minTop,bottom-MIN_H);height=bottom-top}
  el.style.left=left+'px';el.style.top=top+'px';el.style.width=width+'px';el.style.height=height+'px';
  if(scaleBody)scaleContent(d.base);
 };
 const endEdge=(e:ReactPointerEvent<HTMLElement>)=>{
  if(!edge.current)return;edge.current=null;
  if(root.current)delete root.current.dataset.resizing;
  if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  persist();
 };
 const keyResize=(e:ReactKeyboardEvent<HTMLButtonElement>)=>{
  if(isPhoneViewport()||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();
  if(e.key==='Home'){resetSize.current();return}
  const el=root.current;if(!el)return;const b=bounds(isPhoneViewport()),r=rectOf(el),grow=e.key==='ArrowRight'||e.key==='ArrowDown'?1.1:.9;
  docked.current=false;manual.current=true;
  applyRect(el,{left:r.left,top:r.top,width:clamp(r.width*grow,MIN_W,b.maxRight-r.left),height:clamp(r.height*grow,MIN_H,b.maxBottom-r.top)},b);
  persist();
 };
 const maximizeLabel=`Maximizar o restaurar: ${title}`;
 return createPortal(<section ref={root} className={`mobile-floating-window ${className}${showControlsHint?' fw-has-hint':''}${freeOnTouch?' fw-free-touch':''}${visible?'':' floating-window-hidden'}`} data-maximized="false" aria-hidden={visible?undefined:true} role="dialog" aria-labelledby={id} onPointerDown={e=>{e.stopPropagation();raise()}} onKeyDown={e=>e.stopPropagation()}>
  <header className="floating-window-header" onDoubleClick={e=>{if(!(e.target as Element).closest('button'))toggleMax()}} onPointerDown={down} onPointerMove={e=>{const d=drag.current,el=root.current;if(!d||!el)return;const r=moveRect(d.rect,e.clientX-d.x,e.clientY-d.y,d.bounds);/* Durante el arrastre sólo se mueve la capa (transform): no se recalcula el layout ni se repinta lo que hay detrás. */el.style.transform=`translate(${r.left-d.rect.left}px,${r.top-d.rect.top}px)`}} onPointerUp={e=>{const moved=!!drag.current;drag.current=null;const el=root.current;if(el){const r=moveRect(rectOf(el),0,0,bounds(isPhoneViewport()));el.style.transform='';delete el.dataset.moving;el.style.left=r.left+'px';el.style.top=r.top+'px'}if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);if(moved)persist()}} onPointerCancel={()=>{drag.current=null;const el=root.current;if(el){const r=moveRect(rectOf(el),0,0,bounds(isPhoneViewport()));el.style.transform='';delete el.dataset.moving;el.style.left=r.left+'px';el.style.top=r.top+'px'}}}>
   <div className="floating-window-title" tabIndex={0} aria-label={`Mover ventana: ${title}`} onKeyDown={e=>{const el=root.current;if(!el)return;const delta:Record<string,[number,number]>={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]};if(!delta[e.key])return;e.preventDefault();const r=moveRect(rectOf(el),...delta[e.key],bounds(isPhoneViewport()));el.style.left=r.left+'px';el.style.top=r.top+'px';persist()}}><GripHorizontal size={16} aria-hidden="true"/><div>{eyebrow&&<small>{eyebrow}</small>}<h3 id={id} title={title}>{title}</h3></div></div>
   {onMinimize?<button type="button" aria-label={`Minimizar: ${title}`} title="Minimizar ventana" onClick={onMinimize}><Minus size={17}/></button>:null}
   <button type="button" className="floating-window-max" aria-label={maximizeLabel} title="Maximizar o restaurar (doble clic en la cabecera)" onClick={toggleMax}><Maximize2 size={17} className="fw-icon-max"/><Minimize2 size={17} className="fw-icon-restore"/></button>
   <button ref={close} type="button" aria-label={closeLabel} onClick={onClose}><X size={20}/></button>
  </header>
  <div ref={body} className="floating-window-body"><div ref={content} className="floating-window-content">{children}</div></div>
  {actions&&<div className="floating-window-actions">{actions}</div>}
  <footer className="floating-window-footer"><button type="button" aria-label="Restablecer tamaño y posición de la ventana" title="Restablecer tamaño y posición" onClick={()=>resetSize.current()}><RotateCcw size={13}/></button><span ref={scaleLabel} aria-hidden="true"/>{showControlsHint?<span className="fw-controls-hint">Mover: cabecera · Tamaño: esquinas</span>:null}<button type="button" className="floating-window-resize" aria-label={`Cambiar tamaño: ${title}`} title="Arrastra para agrandar o achicar" onPointerDown={beginEdge('se')} onPointerMove={moveEdge} onPointerUp={endEdge} onPointerCancel={endEdge} onKeyDown={keyResize}><MoveDiagonal size={17}/></button></footer>
  {EDGES.map(dir=><div key={dir} className={`fw-edge fw-edge-${dir}`} data-dir={dir} aria-hidden="true" onPointerDown={beginEdge(dir)} onPointerMove={moveEdge} onPointerUp={endEdge} onPointerCancel={endEdge}/>)}
 </section>,(scope?document.querySelector(scope) as HTMLElement|null:null)??document.body);
}
