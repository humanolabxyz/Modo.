import {useMemo,useRef,useState} from 'react';
import {useSvgNavigation} from '../hooks/useSvgNavigation';
import {Maximize2,Minimize2,PanelLeftOpen} from 'lucide-react';
import {CadeShape,CadeSheetFrame} from './CadeSheet';
import {LESSON_SCHEMATICS,lessonProgress} from '../data/lessonSchematics';
import type {Lesson} from '../data/lessons';
import type {BananaCable,ManualStep} from '../data/practice';
/** Esquema de la lección dentro de la ventana de la guía: se acerca a la línea del paso, la ilumina y marca en verde las ya armadas. */
export function LessonSchematic({lesson,step,steps,wires,onOpenDiagram}:{lesson:Lesson;step:ManualStep;steps:ManualStep[];wires:BananaCable[];onOpenDiagram?:()=>void}){
 const cade=LESSON_SCHEMATICS[lesson.schematic],[full,setFull]=useState(lesson.schematic==='estrellaDosContactores');
 const index=steps.findIndex(x=>x.id===step.id),progress=useMemo(()=>lessonProgress(lesson,index,wires),[lesson,index,wires]);
 const active=progress.ends.length?progress:null,activeIds=useMemo(()=>new Set(progress.active),[progress]),doneIds=useMemo(()=>new Set(progress.done),[progress]);
 const all=cade.drawing.views?.all??{x:0,y:0,w:300,h:200};
 /* Recorte: la línea del paso con aire alrededor, con la proporción del cuadro. */
 const view=useMemo(()=>{
  if(full||!active)return all;
  const pts=[...active.ends,...cade.WIRES.filter(w=>activeIds.has(w.id)).flatMap(w=>[{x:w.x,y:w.y},{x:w.x2,y:w.y2}])];
  const x0=Math.min(...pts.map(p=>p.x)),x1=Math.max(...pts.map(p=>p.x)),y0=Math.min(...pts.map(p=>p.y)),y1=Math.max(...pts.map(p=>p.y)),ratio=.6;
  let w=Math.max(x1-x0+44,125),h=Math.max(y1-y0+36,w*ratio);w=Math.max(w,h/ratio);h=w*ratio;
  w=Math.min(w,all.w);h=Math.min(h,all.h);
  return {x:Math.min(Math.max(all.x,(x0+x1)/2-w/2),all.x+all.w-w),y:Math.min(Math.max(all.y,(y0+y1)/2-h/2),all.y+all.h-h),w,h};
 },[full,active,cade,activeIds]);
 const svg=useRef<SVGSVGElement>(null);
 useSvgNavigation(svg,view,()=>{},{duration:360,interactive:false});
 const lit=(j:{x:number;y:number})=>cade.WIRES.some(w=>activeIds.has(w.id)&&(Math.hypot(w.x-j.x,w.y-j.y)<.01||Math.hypot(w.x2-j.x,w.y2-j.y)<.01));
 return <figure className="guide-schematic" data-guide-schematic data-active-wires={activeIds.size}>
  <svg ref={svg} viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} role="img" aria-label={`Esquema del circuito: se ilumina la línea que une ${step.from} con ${step.to}`} preserveAspectRatio="xMidYMid meet" color="#3c4650">
   <rect x={all.x-50} y={all.y-50} width={all.w+100} height={all.h+100} fill="#fff"/>
   {cade.drawing.frame&&<CadeSheetFrame frame={cade.drawing.frame}/>}
   {cade.WIRES.filter(w=>activeIds.has(w.id)).map(w=><line key={`g${w.id}`} x1={w.x} y1={w.y} x2={w.x2} y2={w.y2} stroke="#f7c35f" strokeOpacity=".5" strokeWidth="4.6" strokeLinecap="round" pointerEvents="none"/>)}
   {cade.WIRES.map(w=>{
    const isActive=activeIds.has(w.id),isDone=!isActive&&doneIds.has(w.id);
    return <line key={w.id} x1={w.x} y1={w.y} x2={w.x2} y2={w.y2} stroke={isActive?'#e08a10':isDone?'#2fa070':(w.color??'#44505a')} strokeWidth={isActive?1.9:isDone?1.2:.55} strokeLinecap="round" strokeDasharray={w.dashed?'1.6 1.1':undefined} data-lesson-wire={w.id} data-state={isActive?'active':isDone?'done':undefined} opacity={isActive||isDone?1:.8}/>;
   })}
   {cade.JUNCTIONS.map(j=><circle key={j.id} cx={j.x} cy={j.y} r=".75" fill={lit(j)?'#d98a0f':'#677c8a'}/>)}
   {cade.SYMBOLS.map(o=>o.shape?<g key={o.id} color="#3c4650"><CadeShape o={o}/></g>:null)}
   {active?.ends.map((p,i)=><circle key={i} data-lesson-end={i} cx={p.x} cy={p.y} r="2.7" fill="#fff6dc" stroke="#d98a0f" strokeWidth=".8" className="guide-schematic-end"/>)}
  </svg>
  <figcaption><span><i className="swatch active"/>Línea del paso</span><span><i className="swatch done"/>Ya armada</span>{!active&&<span>Sin trazo para este paso</span>}{onOpenDiagram&&<button type="button" className="guide-open-diagram" onClick={onOpenDiagram}><PanelLeftOpen size={13}/>Abrir en grande</button>}{<button type="button" onClick={()=>setFull(!full)} aria-pressed={full}>{full?<><Minimize2 size={13}/>Acercar a la línea</>:<><Maximize2 size={13}/>Esquema completo</>}</button>}</figcaption>
 </figure>;
}
