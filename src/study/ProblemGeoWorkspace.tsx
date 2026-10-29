import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {ArrowLeft,CheckCircle2} from 'lucide-react';
import GeoGebraView,{type GeoGebraHandle} from '../lab/GeoGebraView';
import {FloatingWindow} from '../components/FloatingWindow';
import {FunctionProblemNotebook} from './FunctionProblemNotebook';
import type {FunctionProblem} from '../learning/functionProblems';
import type {GeoLesson} from '../learning/geogebraLessons';
import {inUnit2Review} from './ExamReviewContext';
import {unit2ReviewUrl} from './studyFocus';
import '../styles/problem-geo-workspace.css';

export function ProblemGeoWorkspace({problem,lesson,onBack}:{problem:FunctionProblem;lesson:GeoLesson;onBack:()=>void}){
 const navigation=useRef<GeoGebraHandle>(null),[open,setOpen]=useState(true),[tab,setTab]=useState<'notebook'|'geo'>('notebook'),[portrait,setPortrait]=useState(()=>matchMedia('(orientation:portrait)').matches);
 useEffect(()=>{const media=matchMedia('(orientation:portrait)'),update=()=>setPortrait(media.matches);media.addEventListener('change',update);const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{media.removeEventListener('change',update);document.body.style.overflow=overflow;};},[]);
 const leave=(done:()=>void)=>navigation.current?navigation.current.save(done):done();
 return <section className="lab-page lab-compact lab-geogebra-mode problem-geo-workspace" style={{'--lab-bar-height':'46px'} as CSSProperties} data-problem-geo-workspace={problem.id}>
  <nav className="lab-compact-bar problem-geo-topbar" aria-label="Navegación del espacio de estudio"><button onClick={()=>leave(onBack)}><ArrowLeft size={16}/>Volver al ramo</button><strong>GeoGebra · {problem.title}</strong>{inUnit2Review()&&<a href={unit2ReviewUrl} onClick={e=>{e.preventDefault();leave(()=>location.assign(unit2ReviewUrl));}}>Volver al repaso</a>}</nav>
  <div className="lab-workspace"><section className="lab-editor"><GeoGebraView navigationRef={navigation} lessonId={lesson.id} externalLesson={{open,onOpen:()=>setOpen(true),onClose:()=>setOpen(false),render:(guide,progress,confirmed)=><FloatingWindow className="geo-lesson-window" title={problem.title} eyebrow={tab==='geo'?`GeoGebra · Paso ${progress.step+1} de ${lesson.steps.length}`:'Lección guiada'} width={portrait?500:520} anchor={portrait?'bottom':'top'} side="right" top={60} dockFraction={.56} heightFraction={portrait ? .56 : .84} visible={open} scaleBody={false} onClose={()=>setOpen(false)} closeLabel="Replegar lección">
    <div className="problem-float-tabs" role="tablist" aria-label="Contenido de la lección"><button role="tab" id="problem-notebook-tab" aria-selected={tab==='notebook'} aria-controls="problem-notebook-panel" onClick={()=>setTab('notebook')}>Cuaderno</button><button role="tab" id="problem-geo-tab" aria-selected={tab==='geo'} aria-controls="problem-geo-panel" onClick={()=>setTab('geo')}>Pasos de GeoGebra</button></div>
    <div id="problem-notebook-panel" role="tabpanel" aria-labelledby="problem-notebook-tab" hidden={tab!=='notebook'} className="study-shell study-campus-shell study-floating-content"><FunctionProblemNotebook problem={problem} lesson={lesson} geoProgress={progress} onBack={()=>leave(onBack)} onOpenGeo={()=>{setTab('geo');setOpen(true);}}/></div>
    <div id="problem-geo-panel" role="tabpanel" aria-labelledby="problem-geo-tab" hidden={tab!=='geo'}>{guide}</div>
    {confirmed&&<div className="problem-lesson-success" aria-hidden="true"><CheckCircle2 size={56}/><strong>¡Correcto!</strong><span>{progress.step<lesson.steps.length-1?'Siguiente paso…':'Práctica completada'}</span></div>}
   </FloatingWindow>}}/></section></div>
 </section>;
}
