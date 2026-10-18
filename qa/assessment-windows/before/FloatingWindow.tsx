import {useEffect,useId,useLayoutEffect,useRef,type ReactNode,type PointerEvent as ReactPointerEvent} from 'react';
import {createPortal} from 'react-dom';
import {GripHorizontal,MoveDiagonal,RotateCcw,X} from 'lucide-react';
import {moveRect,type Bounds,type Rect} from '../layout/floatRect';
import {scaleWindowRect} from '../layout/scaledWindow';
import '../styles/floating-window.css';

let nextLayer=300;
const layers=new Set<number>();
function bounds():Bounds{
 const probe=document.createElement('div');
 probe.style.cssText='position:fixed;left:env(safe-area-inset-left,0px);top:env(safe-area-inset-top,0px);width:env(safe-area-inset-right,0px);height:env(safe-area-inset-bottom,0px);visibility:hidden;pointer-events:none';
 document.body.appendChild(probe);const safe=probe.getBoundingClientRect();probe.remove();
 const viewport=window.visualViewport,left=viewport?.offsetLeft??0,top=viewport?.offsetTop??0;
 const bottom=top+(viewport?.height??innerHeight)-safe.height-8;
 const dock=Array.from(document.querySelectorAll('.tool-dock,.lab-dock')).map(el=>el.getBoundingClientRect()).find(r=>r.width>0&&r.height>0&&r.bottom>bottom-80&&r.top<bottom);
 return {minLeft:left+safe.left+8,maxRight:left+(viewport?.width??innerWidth)-safe.width-8,minTop:Math.max(top+safe.top,document.querySelector('.compact-bar')?.getBoundingClientRect().bottom??0)+8,maxBottom:dock?Math.min(bottom,dock.top-8):bottom};
}
const rectOf=(el:HTMLElement):Rect=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height}};
/** Las ventanas secundarias salen del contenedor del diagrama para evitar recortes y solapamientos. */
/** `anchor="bottom"`: en pantallas angostas la ventana se acopla abajo (hasta que se arrastra) para dejar visible lo que explica. */
export function FloatingWindow({title,eyebrow,onClose,children,className='',closeLabel='Cerrar ventana',width=520,anchor='top',side='center',top=0,dockFraction=.5}:{title:string;eyebrow?:string;onClose:()=>void;children:ReactNode;className?:string;closeLabel?:string;width?:number;anchor?:'top'|'bottom';/** Lado de la pantalla en que aparece al abrirse (después se arrastra). */side?:'left'|'center'|'right';/** Separación extra desde el borde superior al abrirse. */top?:number;dockFraction?:number}){
 const root=useRef<HTMLElement>(null),close=useRef<HTMLButtonElement>(null),onCloseRef=useRef(onClose),layer=useRef(0),id=useId();
 const body=useRef<HTMLDivElement>(null),content=useRef<HTMLDivElement>(null),scaleLabel=useRef<HTMLSpanElement>(null),manual=useRef(false),resetSize=useRef<()=>void>(()=>{});
 const resizing=useRef<{x:number;y:number;rect:Rect;bounds:Bounds;contentWidth:number;scale:number}|null>(null);
 const drag=useRef<{x:number;y:number;rect:Rect;bounds:Bounds}|null>(null),docked=useRef(anchor==='bottom');
 onCloseRef.current=onClose;
 const raise=()=>{layers.delete(layer.current);layer.current=++nextLayer;layers.add(layer.current);if(root.current)root.current.style.zIndex=String(layer.current)};
 const scaleContent=(baseContentWidth:number)=>{
  const el=content.current,b=body.current;if(!el||!b||!root.current)return;
  const style=getComputedStyle(b),padding=parseFloat(style.paddingLeft)+parseFloat(style.paddingRight);
  const scale=Math.max(.1,(b.clientWidth-padding)/baseContentWidth);
  el.style.width=baseContentWidth+'px';el.style.zoom=String(scale);root.current.dataset.contentScale=String(scale);
  if(scaleLabel.current)scaleLabel.current.textContent=Math.round(scale*100)+'%';
 };
 useLayoutEffect(()=>{
  const el=root.current;if(!el)return;
  const resetContent=()=>{manual.current=false;el.style.height='auto';content.current?.style.removeProperty('zoom');content.current?.style.removeProperty('width');el.dataset.contentScale='1';if(scaleLabel.current)scaleLabel.current.textContent='100%'};
  const fit=(center=false)=>{
   const b=bounds();
   if(manual.current){
    const old=rectOf(el),fittedWidth=Math.min(old.width,b.maxRight-b.minLeft-8),scale=Number(el.dataset.contentScale)||1,baseContentWidth=(content.current?.getBoundingClientRect().width??1)/scale;
    // Al girar a una pantalla mucho más estrecha, recuperar el tamaño legible de esa orientación.
    if(scale*fittedWidth/old.width<.65)resetContent();
    else{el.style.width=fittedWidth+'px';el.style.maxHeight=(b.maxBottom-b.minTop)+'px';el.style.height=Math.min(old.height,b.maxBottom-b.minTop)+'px';scaleContent(baseContentWidth)}
   }
   const dock=docked.current&&b.maxRight-b.minLeft<700;
   if(!manual.current){el.style.width=Math.max(0,Math.min(width,b.maxRight-b.minLeft-8))+'px';el.style.maxHeight=Math.max(0,(b.maxBottom-b.minTop)*(dock?Math.max(.35,Math.min(.85,dockFraction)):.88))+'px'}
   const r=rectOf(el),p=moveRect(r,0,0,b);const centered=b.minLeft+(b.maxRight-b.minLeft-r.width)/2,start=dock||side==='center'?centered:side==='left'?b.minLeft:b.maxRight-r.width;el.style.left=(center||dock?start:p.left)+'px';el.style.top=(dock?b.maxBottom-r.height:center?Math.min(b.minTop+top,Math.max(b.minTop,b.maxBottom-r.height)):p.top)+'px';
  };
  resetSize.current=()=>{resizing.current=null;resetContent();fit()};
  raise();fit(true);const resize=()=>{drag.current=null;resizing.current=null;delete el.dataset.resizing;fit()};
  const observer=new ResizeObserver(()=>{if(!drag.current&&!resizing.current)fit()});observer.observe(el);
  addEventListener('resize',resize);visualViewport?.addEventListener('resize',resize);visualViewport?.addEventListener('scroll',resize);
  return ()=>{observer.disconnect();layers.delete(layer.current);removeEventListener('resize',resize);visualViewport?.removeEventListener('resize',resize);visualViewport?.removeEventListener('scroll',resize)};
 },[width,dockFraction]);
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;close.current?.focus({preventScroll:true});
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]')&&layer.current===Math.max(...layers)){e.preventDefault();e.stopImmediatePropagation();onCloseRef.current()}};
  window.addEventListener('keydown',escape,true);
  return ()=>{window.removeEventListener('keydown',escape,true);if(previous?.isConnected)previous.focus({preventScroll:true})};
 },[]);
 const down=(e:ReactPointerEvent<HTMLElement>)=>{
  if(e.button!==0||(e.target as Element).closest('button'))return;
  const el=root.current;if(!el)return;docked.current=false;drag.current={x:e.clientX,y:e.clientY,rect:rectOf(el),bounds:bounds()};e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault();
 };
 const beginResize=(e:ReactPointerEvent<HTMLButtonElement>)=>{
  const el=root.current,c=content.current;if(e.button!==0||!el||!c)return;
  const scale=Number(el.dataset.contentScale)||1;
  resizing.current={x:e.clientX,y:e.clientY,rect:rectOf(el),bounds:bounds(),contentWidth:c.getBoundingClientRect().width/scale,scale};
  manual.current=true;el.dataset.resizing='true';el.style.maxHeight=(bounds().maxBottom-bounds().minTop)+'px';e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault();
 };
 const applyResize=(factor:number)=>{
  const d=resizing.current,el=root.current;if(!d||!el)return;
  const r=scaleWindowRect(d.rect,factor,d.bounds);el.style.width=r.width+'px';el.style.height=r.height+'px';scaleContent(d.contentWidth);
 };
 return createPortal(<section ref={root} className={`mobile-floating-window ${className}`} role="dialog" aria-labelledby={id} onPointerDown={e=>{e.stopPropagation();raise()}} onKeyDown={e=>e.stopPropagation()}>
  <header className="floating-window-header" onPointerDown={down} onPointerMove={e=>{const d=drag.current,el=root.current;if(!d||!el)return;const current=rectOf(el),r=moveRect({...d.rect,width:current.width,height:current.height},e.clientX-d.x,e.clientY-d.y,d.bounds);el.style.left=r.left+'px';el.style.top=r.top+'px'}} onPointerUp={e=>{drag.current=null;const el=root.current;if(el){const r=moveRect(rectOf(el),0,0,bounds());el.style.left=r.left+'px';el.style.top=r.top+'px'}if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}} onPointerCancel={()=>{drag.current=null}}>
   <div className="floating-window-title" tabIndex={0} aria-label={`Mover ventana: ${title}`} onKeyDown={e=>{const el=root.current;if(!el)return;const delta:Record<string,[number,number]>={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]};if(!delta[e.key])return;e.preventDefault();const r=moveRect(rectOf(el),...delta[e.key],bounds());el.style.left=r.left+'px';el.style.top=r.top+'px'}}><GripHorizontal size={16} aria-hidden="true"/><div>{eyebrow&&<small>{eyebrow}</small>}<h3 id={id}>{title}</h3></div></div>
   <button ref={close} type="button" aria-label={closeLabel} onClick={onClose}><X size={20}/></button>
  </header>
  <div ref={body} className="floating-window-body"><div ref={content} className="floating-window-content">{children}</div></div>
  <footer className="floating-window-footer"><button type="button" aria-label="Restablecer tamaño de ventana" title="Restablecer tamaño" onClick={()=>resetSize.current()}><RotateCcw size={13}/></button><span ref={scaleLabel} aria-hidden="true">100%</span><button type="button" className="floating-window-resize" aria-label={`Cambiar tamaño: ${title}`} title="Arrastra para agrandar o achicar" onPointerDown={beginResize} onPointerMove={e=>{const d=resizing.current;if(!d)return;const x=(e.clientX-d.x)/d.rect.width,y=(e.clientY-d.y)/d.rect.height;applyResize(1+(Math.abs(x)>Math.abs(y)?x:y))}} onPointerUp={e=>{resizing.current=null;if(root.current)delete root.current.dataset.resizing;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}} onPointerCancel={()=>{resizing.current=null;if(root.current)delete root.current.dataset.resizing}} onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){resetSize.current();return}const el=root.current,c=content.current;if(!el||!c)return;const scale=Number(el.dataset.contentScale)||1;resizing.current={x:0,y:0,rect:rectOf(el),bounds:bounds(),contentWidth:c.getBoundingClientRect().width/scale,scale};manual.current=true;applyResize((e.key==='ArrowLeft'||e.key==='ArrowUp') ? .9 : 1.1);resizing.current=null}}><MoveDiagonal size={17}/></button></footer>
 </section>,document.body);
}
