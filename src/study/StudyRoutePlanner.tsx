import {useEffect,useState} from 'react';
import {ArrowRight,BookOpen,Check,Play} from 'lucide-react';
import {classOutlines,type ClassMaterial} from './classCatalog';
import {courses} from './courseCatalog';
import {studyClasses,studyClassUrl} from './StudyClassContext';
import {geoLesson,readGeoProgress} from '../learning/geogebraLessons';
import {useAcademicState} from './academicState';
import {academicLesson} from './academicContent';
import {problemById} from '../learning/functionProblems';
import {correctProblemAnswer} from './FunctionProblemNotebook';
import '../styles/study-navigation.css';

const ready=(m:ClassMaterial)=>!!(m.toolLessonId||m.mathReview||m.academicLessonId||m.tempLessonId||m.detLessonId||m.topicIds?.length);
const kind=(m:ClassMaterial)=>m.toolLessonId?.startsWith('problema-')?'problems':m.mathReview==='all'?'review':m.toolLessonId?.startsWith('matrices-')?'practice':ready(m)?'learn':'source';
const names={problems:'Resolver problemas',learn:'Aprender la materia',practice:'Practicar matrices',review:'Repasar',source:'Consultar originales'};
type Category=keyof typeof names;
export const LAST_STUDY_CLASS='modo:study:last-class:v1';
export function readLastStudyClass():{courseId:string;classId:string}|null{
  try{const value=JSON.parse(localStorage.getItem(LAST_STUDY_CLASS)||'null');return value&&typeof value.courseId==='string'&&typeof value.classId==='string'&&studyClasses(value.courseId).some(m=>m.id===value.classId)?value:null;}catch{return null;}
}
export function StudyRoutePlanner({courseId,initialUnit,onUnitChange,onModuleChange}:{courseId?:string;initialUnit?:string|null;onUnitChange?:(id:string)=>void;onModuleChange?:(id:string)=>void}){
  const [selectedCourse,setCourse]=useState(courseId||'s2-5'),[unitId,setUnit]=useState(initialUnit||'mtfm01-u2'),[category,setCategory]=useState<Category>('problems'),[recent,setRecent]=useState<ReturnType<typeof readLastStudyClass>>(null),[loaded,setLoaded]=useState(false);
  const [moduleId,setModule]=useState('');
  const academic=useAcademicState();
  useEffect(()=>{const sync=()=>setModule(new URLSearchParams(location.search).get('modulo')||'');sync();window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync);},[]);
  useEffect(()=>{const last=readLastStudyClass();setRecent(last);if(!courseId&&last){setCourse(last.courseId);const previousUnit=classOutlines[last.courseId]?.units.find(u=>u.materials.some(m=>m.id===last.classId));setUnit(previousUnit?.id||'');setModule(previousUnit?.modules?.find(m=>m.materialIds.includes(last.classId))?.id||'');}setLoaded(true);},[courseId]);
  useEffect(()=>{if(initialUnit)setUnit(initialUnit);},[initialUnit]);
  const outline=classOutlines[selectedCourse],units=outline?.units||[],unit=units.find(u=>u.id===unitId)||units.find(u=>u.materials.some(ready))||units[0];
  const categories=Object.keys(names).filter(k=>unit?.materials.some(m=>kind(m)===k)) as Category[],activeCategory=categories.includes(category)?category:categories[0];
  const modules=unit?.modules,selectedModule=modules?.find(m=>m.id===moduleId)||modules?.[0];
  const materials=selectedModule?selectedModule.materialIds.map(id=>unit?.materials.find(m=>m.id===id)).filter((m):m is ClassMaterial=>!!m):unit?.materials.filter(m=>kind(m)===activeCategory)||[];
  const progress=(m:ClassMaterial):{text:string;done:boolean;started:boolean}=>{
    const lesson=geoLesson(m.toolLessonId);
    if(loaded&&lesson)try{
      const geo=readGeoProgress(lesson),problem=problemById(lesson.id);let answers=0;
      if(problem){const raw=JSON.parse(localStorage.getItem(`modo:function-problem:${problem.id}:v1`)||'null');if(raw?.version===1&&Array.isArray(raw.checked))answers=problem.questions.filter(q=>raw.checked.includes(q.id)&&correctProblemAnswer(q,raw.answers?.[q.id]?.value||'')).length;}
      const done=geo.completed.length===lesson.steps.length,started=geo.completed.length>0||answers>0;
      return {text:problem?`${answers}/${problem.questions.length} respuestas · ${geo.completed.length}/${lesson.steps.length} en GeoGebra`:done?'Práctica de GeoGebra completada':started?`${geo.completed.length}/${lesson.steps.length} actividades en GeoGebra`:'Por empezar',done:done&&(!problem||answers===problem.questions.length),started};
    }catch{return {text:'Guardado por revisar',done:false,started:false};}
    if(m.academicLessonId){const lesson=academicLesson(m.academicLessonId),saved=academic.state.lessons[m.academicLessonId],checked=lesson?.steps.filter(s=>saved?.steps[s.id]?.checked).length||0;return {text:checked?`${checked}/${lesson?.steps.length} pasos comprobados`:'Por empezar',done:!!lesson&&checked===lesson.steps.length,started:!!saved};}
    return {text:ready(m)?'Disponible':'Documento de consulta',done:false,started:false};
  };
  const next=materials.find(m=>ready(m)&&!progress(m).done)||materials.find(ready),last=recent?studyClasses(recent.courseId).find(m=>m.id===recent.classId):null;
  return <section className="study-route-planner" aria-label="Elegir qué estudiar">
    {!courseId&&recent&&last&&<a className="study-last-activity" href={studyClassUrl(recent.courseId,last)}><Play size={17}/><span><strong>Retomar mi última actividad</strong><small>{last.title}</small></span><ArrowRight size={17}/></a>}
    {!courseId&&<div className="study-route-selectors"><label><span>1. Elige el ramo</span><select aria-label="Ramo para estudiar" value={selectedCourse} onChange={e=>{setCourse(e.target.value);setUnit('');setModule('');setCategory('problems');}}>{courses.filter(c=>classOutlines[c.id]).map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label></div>}
    <section className="study-unit-picker"><h2>{courseId?'1':'2'}. Elige la unidad</h2><nav className="study-unit-buttons" aria-label="Unidades para estudiar">{units.map((u,i)=><button type="button" key={u.id} aria-label={u.title} aria-pressed={unit?.id===u.id} onClick={()=>{setUnit(u.id);setModule('');setCategory('problems');onUnitChange?.(u.id);}}><span>Unidad {i+1}</span><strong>{u.title.replace(/^Unidad \d+:\s*/,'')}</strong></button>)}</nav></section>
    {selectedModule?<section className="study-module-picker"><h2>{courseId?'2':'3'}. Elige el módulo o actividad del aula</h2><nav className="study-module-buttons" aria-label="Módulos de la unidad">{modules?.map(m=><button type="button" key={m.id} aria-pressed={selectedModule.id===m.id} onClick={()=>{setModule(m.id);onModuleChange?.(m.id);}}><strong>{m.title}</strong><small>{m.summary}</small>{m.origin==='support'&&<span>Apoyo complementario</span>}</button>)}</nav></section>:<nav className="study-route-categories" aria-label="Qué quieres hacer">{categories.map(c=><button key={c} aria-pressed={activeCategory===c} onClick={()=>setCategory(c)}>{names[c]} <small>{unit?.materials.filter(m=>kind(m)===c).length}</small></button>)}</nav>}
    {selectedModule&&<header className="study-module-heading"><div><span>{selectedModule.origin==='classroom'?'ORGANIZACIÓN DE TU AULA':'APOYO PARA ESTUDIAR'}</span><h2>{selectedModule.title}</h2><p>{selectedModule.summary}</p></div>{next&&<a className="study-module-start" href={studyClassUrl(selectedCourse,next)}>{progress(next).started?'Continuar actividad':'Empezar actividad'}<ArrowRight size={16}/></a>}</header>}
    {selectedCourse==='s2-5'&&unit?.id==='mtfm01-u4'&&<p className="study-route-guidance">Esta unidad es de matrices. Tus problemas de población, estroncio, bancos y planta están en <a href="/estudio?curso=s2-5&unidad=mtfm01-u2">Unidad 2 · Exponenciales y logaritmos <ArrowRight size={14}/></a>.</p>}
    {next&&!selectedModule&&<div className="study-next-action"><div><span>{modules?(courseId?'3':'4'):(courseId?'2':'3')}. TU SIGUIENTE ACCIÓN</span><h2>{next.title.replace('Problema de clase · ','')}</h2><p>{activeCategory==='problems'?'Lee el enunciado, responde una pregunta y comprueba el cálculo en GeoGebra.':activeCategory==='practice'?'Lee el ejemplo y aplica las operaciones en GeoGebra.':'Abre la explicación y sigue el recorrido de la actividad.'}</p></div><a href={studyClassUrl(selectedCourse,next)}>{progress(next).started?'Continuar actividad':'Empezar actividad'}<ArrowRight size={17}/></a></div>}
    <div className="study-route-list" aria-label="Actividades de esta unidad">{materials.map((m,i)=>{const p=progress(m);return ready(m)?<a key={m.id} href={studyClassUrl(selectedCourse,m)} data-study-status={p.done?'complete':p.started?'started':'available'}><span className="study-route-index">{p.done?<Check size={16}/>:i+1}</span><span><strong>{m.title.replace('Problema de clase · ','')}</strong><small>{p.text}</small></span><ArrowRight size={17}/></a>:m.pdfUrl?<a href={m.pdfUrl} target="_blank" rel="noreferrer" key={m.id}><BookOpen size={17}/><span><strong>{m.title}</strong><small>Consultar documento original ↗</small></span></a>:<p key={m.id}>{m.title} · material pendiente</p>;})}{!materials.length&&!selectedModule?.resources?.length&&<p className="study-module-pending">{selectedModule?.pending||'Esta unidad todavía no tiene actividades disponibles. Elige otra unidad.'}</p>}{selectedModule?.resources?.map(resource=><a key={resource.href} href={resource.href} target="_blank" rel="noreferrer"><BookOpen size={17}/><span><strong>{resource.title}</strong><small>Abrir recurso original en GeoGebra ↗</small></span></a>)}</div>
  </section>;
}
