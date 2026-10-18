import {useEffect,useLayoutEffect,useRef,type RefObject} from 'react';
import {motionReduced} from '../motion/surface';
export type CanvasView={x:number;y:number;w:number;h:number};
export type SvgNavigationApi={show:(v:CanvasView)=>void;commit:()=>void};
export function currentSvgView(svg:SVGSVGElement,fallback:CanvasView):CanvasView{const b=svg.viewBox.baseVal;return b.width&&b.height?{x:b.x,y:b.y,w:b.width,h:b.height}:fallback}
/** Animate viewBox without rerendering every terminal on each animation frame.
 *  Durante un gesto, `show` escribe el viewBox directo en el DOM; `commit` sincroniza el estado de React una sola vez. */
export function useSvgNavigation(ref:RefObject<SVGSVGElement|null>,view:CanvasView,setView:(v:CanvasView)=>void,{min=240,max=3200,active=true,duration=210,interactive=true}={}):SvgNavigationApi{
 const current=useRef(view),latest=useRef({view,setView,min,max}),frame=useRef(0);
 const api=useRef<SvgNavigationApi>({show:()=>{},commit:()=>{}}).current;
 latest.current={view,setView,min,max};
 useLayoutEffect(()=>{
  const svg=ref.current;if(!svg||!active)return;cancelAnimationFrame(frame.current);
  const reduced=motionReduced();
  const write=(v:CanvasView)=>{current.current=v;svg.setAttribute('viewBox',`${v.x} ${v.y} ${v.w} ${v.h}`)};
  if(reduced||svg.dataset.dragging==='true'){write(view);svg.dataset.animating='false';return;}
  // React ya escribió el viewBox nuevo: interpolar desde el último cuadro visible.
  const from=current.current,distance=Math.abs(from.x-view.x)+Math.abs(from.y-view.y)+Math.abs(from.w-view.w)+Math.abs(from.h-view.h);
  if(distance<.001){write(view);svg.dataset.animating='false';return;}
  write(from);svg.dataset.animating='true';const start=performance.now();
  const tick=(now:number)=>{const t=Math.max(0,Math.min(1,(now-start)/duration)),ease=1-Math.pow(1-t,3);write({x:from.x+(view.x-from.x)*ease,y:from.y+(view.y-from.y)*ease,w:from.w+(view.w-from.w)*ease,h:from.h+(view.h-from.h)*ease});if(t<1)frame.current=requestAnimationFrame(tick);else{write(view);svg.dataset.animating='false'}};
  frame.current=requestAnimationFrame(tick);return ()=>cancelAnimationFrame(frame.current);
 },[ref,active,duration,view.x,view.y,view.w,view.h]);
 useEffect(()=>{
  const svg=ref.current;if(!svg||!active||!interactive)return;
  let space=false,suppress=false,consumed=false;
  const pointers=new Map<number,{x:number;y:number}>();
  let drag:{x:number;y:number;view:CanvasView;scale:number}|null=null;
  let pinch:{distance:number;center:{x:number;y:number};world:{x:number;y:number};view:CanvasView;scale:number}|null=null;
  let pending:CanvasView|null=null,commitTimer=0,settle=0;
  const read=()=>currentSvgView(svg,latest.current.view);
  const show=(v:CanvasView)=>{cancelAnimationFrame(frame.current);svg.dataset.animating='false';pending=v;current.current=v;svg.dataset.gesture='true';svg.setAttribute('viewBox',`${v.x} ${v.y} ${v.w} ${v.h}`)};
  const commit=()=>{clearTimeout(commitTimer);if(pending){const v=pending;pending=null;latest.current.setView(v)}cancelAnimationFrame(settle);settle=requestAnimationFrame(()=>{delete svg.dataset.gesture})};
  const commitSoon=()=>{clearTimeout(commitTimer);commitTimer=window.setTimeout(commit,140)};
  api.show=show;api.commit=commit;
  const wheel=(e:WheelEvent)=>{e.preventDefault();const v=read(),scale=svg.getScreenCTM()?.a||1;
   if(e.ctrlKey||e.metaKey){const matrix=svg.getScreenCTM();if(!matrix)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse()),w=Math.max(latest.current.min,Math.min(latest.current.max,v.w*Math.exp(e.deltaY*.002))),factor=w/v.w;show({x:p.x-(p.x-v.x)*factor,y:p.y-(p.y-v.y)*factor,w,h:v.h*factor})}
   else{const units=e.deltaMode===1?16:e.deltaMode===2?innerHeight:1;show({...v,x:v.x+(e.shiftKey&&e.deltaX===0?e.deltaY:e.deltaX)*units/scale,y:v.y+(e.shiftKey?0:e.deltaY)*units/scale})}
   commitSoon();
  };
  const keydown=(e:KeyboardEvent)=>{if(e.code!=='Space'||(e.target as Element)?.closest('input,textarea,select,button,summary,.simulation-control,[contenteditable]'))return;space=true;svg.dataset.spacePan='true';e.preventDefault()};
  const release=()=>{space=false;delete svg.dataset.spacePan};
  const keyup=(e:KeyboardEvent)=>{if(e.code==='Space')release()};
  const down=(e:PointerEvent)=>{
   if((e.target as Element)?.closest('.simulation-control'))return;
   if(!pointers.size&&!drag)suppress=false;
   if(e.pointerType==='touch')pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size===2){const [a,b]=[...pointers.values()],center={x:(a.x+b.x)/2,y:(a.y+b.y)/2},matrix=svg.getScreenCTM();if(!matrix)return;const p=new DOMPoint(center.x,center.y).matrixTransform(matrix.inverse());pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),center,world:{x:p.x,y:p.y},view:read(),scale:matrix.a};consumed=true;suppress=true;svg.dataset.dragging='true';for(const id of pointers.keys())try{svg.setPointerCapture(id)}catch{}e.stopPropagation();return;}
   if(space||e.button===1){drag={x:e.clientX,y:e.clientY,view:read(),scale:svg.getScreenCTM()?.a||1};svg.dataset.dragging='true';svg.setPointerCapture(e.pointerId);e.preventDefault();e.stopPropagation()}
  };
  const move=(e:PointerEvent)=>{
   if(pointers.has(e.pointerId))pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pinch&&pointers.size===2){const [a,b]=[...pointers.values()],center={x:(a.x+b.x)/2,y:(a.y+b.y)/2},distance=Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),w=Math.max(latest.current.min,Math.min(latest.current.max,pinch.view.w*pinch.distance/distance)),factor=w/pinch.view.w;show({x:pinch.world.x+(pinch.view.x-pinch.world.x)*factor-(center.x-pinch.center.x)/pinch.scale*factor,y:pinch.world.y+(pinch.view.y-pinch.world.y)*factor-(center.y-pinch.center.y)/pinch.scale*factor,w,h:pinch.view.h*factor});e.stopPropagation();return;}
   if(consumed){e.stopPropagation();return;}
   if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>3)suppress=true;show({...drag.view,x:drag.view.x-dx/drag.scale,y:drag.view.y-dy/drag.scale});e.stopPropagation()}
  };
  const up=(e:PointerEvent)=>{pointers.delete(e.pointerId);if(consumed){pinch=null;if(!pointers.size){consumed=false;delete svg.dataset.dragging;commit()}}if(drag){drag=null;delete svg.dataset.dragging;commit()}};
  const click=(e:MouseEvent)=>{if(suppress){e.preventDefault();e.stopPropagation();suppress=false}};
  svg.addEventListener('wheel',wheel,{passive:false});svg.addEventListener('pointerdown',down,true);svg.addEventListener('pointermove',move,true);svg.addEventListener('pointerup',up,true);svg.addEventListener('pointercancel',up,true);svg.addEventListener('click',click,true);document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);window.addEventListener('blur',release);
  return ()=>{svg.removeEventListener('wheel',wheel);svg.removeEventListener('pointerdown',down,true);svg.removeEventListener('pointermove',move,true);svg.removeEventListener('pointerup',up,true);svg.removeEventListener('pointercancel',up,true);svg.removeEventListener('click',click,true);document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);window.removeEventListener('blur',release);cancelAnimationFrame(frame.current);cancelAnimationFrame(settle);clearTimeout(commitTimer);api.show=()=>{};api.commit=()=>{}};
 },[ref,active,interactive]);
 return api;
}
