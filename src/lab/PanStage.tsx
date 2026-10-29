import {createPortal} from 'react-dom';
import {useCallback,useEffect,useLayoutEffect,useRef,useState,type MutableRefObject,type PointerEvent as ReactPointerEvent,type ReactNode} from 'react';
import {ZoomBar} from './CanvasControls';
/** Pizarrón para Esquemas, HMI y Procesos: el contenido (un SVG o una pantalla HTML de tamaño fijo) vive sobre un lienzo que se
 *  desplaza arrastrando, se acerca con la rueda (Ctrl/⌘), el gesto de pellizco o los botones, y al soltar sigue un instante por
 *  inercia. Las transformaciones se escriben directo en el DOM durante el gesto; React solo conoce el porcentaje de zoom.
 *  Es el mismo comportamiento de la protoboard, aplicado a elementos que no son una placa. */
export type StageApi={scale:()=>number;center:()=>{x:number;y:number};fit:()=>void;focus:(area:Focus)=>void};
type T={x:number;y:number;k:number};
const K_MIN=.1,K_MAX=4,KEEP=72;
const NO_PAN='[role="button"],button,input,select,textarea,a,summary,label,[data-nopan],.lab-widget';
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
export type Focus={x:number;y:number;w:number;h:number};
/** `focus` devuelve la zona que interesa encuadrar (por ejemplo, donde están los componentes) al ajustar la vista; sin ella se encuadra todo el lienzo. */
export function PanStage({width,height,label,fitLabel='Ajustar al lienzo',apiRef,scaleRef,onBackground,focus,unbounded=false,interaction='auto',panSurfaces=false,zoomTarget,children}:{width:number;height:number;label:string;fitLabel?:string;apiRef?:MutableRefObject<StageApi|null>;scaleRef?:MutableRefObject<number>;onBackground?:()=>void;focus?:()=>Focus|null;interaction?:'auto'|'pan'|'objects';panSurfaces?:boolean;unbounded?:boolean;zoomTarget?:HTMLElement|null;children:ReactNode}){
  const box=useRef<HTMLDivElement>(null),content=useRef<HTMLDivElement>(null),t=useRef<T>({x:0,y:0,k:1}),touched=useRef(false),run=useRef(0);
  const suppressClick=useRef(false);
  const pointers=useRef(new Map<number,{x:number;y:number}>()),gesture=useRef<{kind:'none'|'pan'|'pinch';sx:number;sy:number;ox:number;oy:number;moved:boolean;distance:number;start:T;cx:number;cy:number}>({kind:'none',sx:0,sy:0,ox:0,oy:0,moved:false,distance:1,start:{x:0,y:0,k:1},cx:0,cy:0});
  const trail=useRef<{t:number;x:number;y:number}[]>([]),latest=useRef({onBackground,focus});latest.current={onBackground,focus};
  const [percent,setPercent]=useState(100);
  const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const insets=()=>{const el=box.current;if(!el)return {top:0,right:0,bottom:0,left:0};const s=getComputedStyle(el),v=(side:string)=>parseFloat(s.getPropertyValue('scroll-padding-'+side))||0;return {top:v('top'),right:v('right'),bottom:v('bottom'),left:v('left')};};
  const apply=useCallback((next:T,limit=true)=>{
    const el=box.current,c=content.current;if(!el||!c)return;
    let {x,y,k}=next;k=clamp(k,K_MIN,K_MAX);
    if(limit&&!unbounded){const r=el.getBoundingClientRect();x=clamp(x,KEEP-width*k,r.width-KEEP);y=clamp(y,KEEP-height*k,r.height-KEEP);}
    t.current={x,y,k};c.style.transform=`translate(${x}px,${y}px) scale(${k})`;if(scaleRef)scaleRef.current=k;
    const p=Math.round(k*100);setPercent(previous=>previous===p?previous:p);
  },[width,height,scaleRef,unbounded]);
  const fitTarget=useCallback((area?:Focus):T=>{
    const el=box.current;if(!el)return t.current;const r=el.getBoundingClientRect(),i=insets(),fw=Math.max(80,r.width-i.left-i.right),fh=Math.max(80,r.height-i.top-i.bottom),f=area??latest.current.focus?.()??{x:0,y:0,w:width,h:height},k=clamp(Math.min(fw/f.w,fh/f.h,1.4),K_MIN,K_MAX);
    /* Ajustar muestra la zona completa también en vertical; el usuario puede acercarla y recorrerla. */
    const place=(free:number,size:number,lead:number,at:number)=>size<=free?lead+(free-size)/2-at:lead-at;
    return {k,x:place(fw,f.w*k,i.left,f.x*k),y:place(fh,f.h*k,i.top,f.y*k)};
  },[width,height]);
  const stop=()=>{if(run.current){cancelAnimationFrame(run.current);run.current=0;}};
  const animate=useCallback((target:T,ms=240)=>{
    stop();if(reduced()){apply(target);return;}
    const from={...t.current},begin=performance.now();
    const tick=(now:number)=>{const p=Math.min(1,(now-begin)/ms),e=1-Math.pow(1-p,3);apply({x:from.x+(target.x-from.x)*e,y:from.y+(target.y-from.y)*e,k:from.k+(target.k-from.k)*e});run.current=p<1?requestAnimationFrame(tick):0;};
    run.current=requestAnimationFrame(tick);
  },[apply]);
  const fit=useCallback((smooth=true)=>{touched.current=false;if(smooth)animate(fitTarget());else apply(fitTarget(),false);},[animate,apply,fitTarget]);
  const zoomAt=useCallback((factor:number,px?:number,py?:number,smooth=true)=>{
    const el=box.current;if(!el)return;const r=el.getBoundingClientRect(),i=insets(),cur=t.current,k=clamp(cur.k*factor,K_MIN,K_MAX),f=k/cur.k;
    const ax=px??i.left+(r.width-i.left-i.right)/2,ay=py??i.top+(r.height-i.top-i.bottom)/2;touched.current=true;
    const target={k,x:ax-(ax-cur.x)*f,y:ay-(ay-cur.y)*f};if(smooth)animate(target,200);else{stop();apply(target);}
  },[animate,apply]);
  useLayoutEffect(()=>{apply(fitTarget(),false);},[apply,fitTarget]);
  useEffect(()=>{
    const el=box.current;if(!el)return;
    const resize=new ResizeObserver(()=>{if(!touched.current&&!gesture.current.moved)apply(fitTarget(),false);else apply(t.current);});resize.observe(el);
    const wheel=(e:WheelEvent)=>{
      e.preventDefault();stop();touched.current=true;const r=el.getBoundingClientRect();
      if(e.ctrlKey||e.metaKey){const factor=Math.exp(-e.deltaY*.0022);zoomAt(factor,e.clientX-r.left,e.clientY-r.top,false);return;}
      const units=e.deltaMode===1?16:e.deltaMode===2?innerHeight:1,cur=t.current;
      apply({...cur,x:cur.x-(e.shiftKey&&e.deltaX===0?e.deltaY:e.deltaX)*units,y:cur.y-(e.shiftKey?0:e.deltaY)*units});
    };
    el.addEventListener('wheel',wheel,{passive:false});
    if(apiRef)apiRef.current={scale:()=>t.current.k,fit:()=>fit(true),focus:area=>{touched.current=true;animate(fitTarget(area));},center:()=>{const r=el.getBoundingClientRect(),i=insets(),cur=t.current;return {x:(i.left+(r.width-i.left-i.right)/2-cur.x)/cur.k,y:(i.top+(r.height-i.top-i.bottom)/2-cur.y)/cur.k};}};
    return()=>{resize.disconnect();el.removeEventListener('wheel',wheel);stop();if(apiRef)apiRef.current=null;};
  },[apply,fit,fitTarget,zoomAt,apiRef,animate]);
  const momentum=()=>{
    const samples=trail.current.filter(p=>performance.now()-p.t<110);trail.current=[];
    if(samples.length<2||reduced())return;
    const a=samples[0],b=samples[samples.length-1],dt=Math.max(16,b.t-a.t);let vx=(b.x-a.x)/dt,vy=(b.y-a.y)/dt;if(Math.hypot(vx,vy)<.25)return;
    let previous=performance.now();
    const tick=(now:number)=>{const step=Math.min(48,now-previous);previous=now;const cur=t.current;apply({...cur,x:cur.x+vx*step,y:cur.y+vy*step});const decay=Math.exp(-step/240);vx*=decay;vy*=decay;run.current=Math.hypot(vx,vy)<.02?0:requestAnimationFrame(tick);};
    run.current=requestAnimationFrame(tick);
  };
  const startPan=(x:number,y:number)=>{const g=gesture.current;g.kind='pan';g.sx=x;g.sy=y;g.ox=t.current.x;g.oy=t.current.y;g.moved=false;trail.current=[];};
  const down=(e:ReactPointerEvent<HTMLDivElement>)=>{
    if(e.button>0&&e.button!==1)return;if(interaction==='objects')return;stop();const target=e.target as Element,control=target.closest(NO_PAN);if(interaction!=='pan'&&control&&!(panSurfaces&&control.hasAttribute('data-pan-surface')))return;suppressClick.current=false;
    pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});const g=gesture.current;
    if(pointers.current.size===2){const [a,b]=[...pointers.current.values()];g.kind='pinch';g.start={...t.current};g.distance=Math.max(1,Math.hypot(a.x-b.x,a.y-b.y));g.cx=(a.x+b.x)/2;g.cy=(a.y+b.y)/2;g.moved=true;return;}
    startPan(e.clientX,e.clientY);
  };
  const move=(e:ReactPointerEvent<HTMLDivElement>)=>{
    const g=gesture.current,known=pointers.current.get(e.pointerId);if(!known||g.kind==='none')return;known.x=e.clientX;known.y=e.clientY;
    const r=box.current!.getBoundingClientRect();
    if(g.kind==='pinch'&&pointers.current.size>=2){
      const [a,b]=[...pointers.current.values()],distance=Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),cx=(a.x+b.x)/2,cy=(a.y+b.y)/2,k=clamp(g.start.k*distance/g.distance,K_MIN,K_MAX),f=k/g.start.k;
      const ax=g.cx-r.left,ay=g.cy-r.top;touched.current=true;apply({k,x:ax-(ax-g.start.x)*f+(cx-g.cx),y:ay-(ay-g.start.y)*f+(cy-g.cy)});return;
    }
    const dx=e.clientX-g.sx,dy=e.clientY-g.sy;
    if(!g.moved){if(Math.hypot(dx,dy)<=4)return;g.moved=true;suppressClick.current=true;touched.current=true;try{box.current!.setPointerCapture(e.pointerId);}catch{/* sin captura */}box.current!.classList.add('is-panning');}
    apply({...t.current,x:g.ox+dx,y:g.oy+dy});trail.current=[...trail.current.slice(-5),{t:performance.now(),x:dx,y:dy}];
  };
  const up=(e:ReactPointerEvent<HTMLDivElement>,cancelled=false)=>{
    if(!pointers.current.delete(e.pointerId))return;const g=gesture.current;
    if(g.kind==='pinch'){if(pointers.current.size<2){const [rest]=[...pointers.current.values()];if(rest){startPan(rest.x,rest.y);g.moved=true;}else g.kind='none';}return;}
    box.current?.classList.remove('is-panning');
    if(g.kind==='pan'){if(g.moved){if(!cancelled)momentum();}else if(!cancelled)latest.current.onBackground?.();}
    g.kind='none';g.moved=false;
  };
  const key=(e:React.KeyboardEvent<HTMLDivElement>)=>{
    if(e.target!==e.currentTarget)return;const step=60,cur=t.current,moves:Record<string,[number,number]>={ArrowLeft:[step,0],ArrowRight:[-step,0],ArrowUp:[0,step],ArrowDown:[0,-step]};
    if(e.key==='+'||e.key==='='){e.preventDefault();zoomAt(1.25);}else if(e.key==='-'){e.preventDefault();zoomAt(1/1.25);}else if(e.key==='0'||e.key==='Home'){e.preventDefault();fit(true);}
    else if(moves[e.key]){e.preventDefault();touched.current=true;animate({...cur,x:cur.x+moves[e.key][0],y:cur.y+moves[e.key][1]},140);}
  };
  return <>
    <div ref={box} className={`lab-pan interaction-${interaction}`} tabIndex={0} role="region" aria-label={`${label}. Arrastra para desplazar; Ctrl y rueda o pellizco para acercar; flechas para mover; 0 para ajustar.`} onPointerDownCapture={e=>{if(interaction==='pan'){down(e);e.stopPropagation();}else if((e.target as Element).closest(NO_PAN)){stop();suppressClick.current=false;}}} onPointerMoveCapture={e=>{if(interaction==='pan'){move(e);e.stopPropagation();}}} onPointerUpCapture={e=>{if(interaction==='pan'){up(e);e.stopPropagation();}}} onPointerDown={e=>{if(interaction!=='pan')down(e);}} onPointerMove={e=>{if(interaction!=='pan')move(e);}} onPointerUp={e=>{if(interaction!=='pan')up(e);}} onPointerCancel={e=>up(e,true)} onClickCapture={e=>{if(interaction==='pan'||suppressClick.current){e.preventDefault();e.stopPropagation();suppressClick.current=false;}}} onKeyDown={key}>
      <div ref={content} className="lab-pan-content" style={{width,height}}>{children}</div>
    </div>
    {zoomTarget?createPortal(<ZoomBar percent={percent} onZoomIn={()=>zoomAt(1.25)} onZoomOut={()=>zoomAt(1/1.25)} onFit={()=>fit(true)} fitLabel={fitLabel}/>,zoomTarget):<ZoomBar percent={percent} onZoomIn={()=>zoomAt(1.25)} onZoomOut={()=>zoomAt(1/1.25)} onFit={()=>fit(true)} fitLabel={fitLabel}/>}
  </>;
}
