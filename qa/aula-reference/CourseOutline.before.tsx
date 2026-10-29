import {StudyRoutePlanner} from './StudyRoutePlanner';
import { type ReactNode, lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, ClipboardList, FileText } from "lucide-react";
import {StudyClassContext} from './StudyClassContext';
import { classOutlines, type ClassMaterial } from "./classCatalog";
import { courses } from "./courseCatalog";
import { lessons, type Screen, type StudyState } from "./model";
import { shortTitles } from "./StudyNavigation";
import {geoLesson,studyLessonUrl} from '../learning/geogebraLessons';
import {ToolLessonStudy} from './ToolLessonStudy';
import {TemperatureLessonStudy} from './TemperatureLessonStudy';
import {DetectorLessonStudy} from './DetectorLessonStudy';
import {detectorLesson,detStudyUrl} from '../learning/detectorLessons';
import {temperatureLesson,tempStudyUrl} from '../learning/temperatureLessons';
import {REVIEW_ID,reviewUrl} from '../learning/temperatureReview';
import {TemperatureReviewStudy} from './TemperatureReviewStudy';
import {academicLesson,academicUrl} from './academicContent';
import academicSources from './content/academic-sources.json';
import {StudyFocusBanner} from './StudyFocusBanner';
import {CourseArt,courseIdentity} from './StudyArt';
import '../styles/academic.css';
const AcademicLessonView=lazy(()=>import('./AcademicLessonView'));
const MathUnitReview=lazy(()=>import('./MathUnitReview').then(m=>({default:m.MathUnitReview})));

export function CourseOutline({ courseId, state, onBack, onOpen }: {
  courseId: string;
  state: StudyState;
  onBack: () => void;
  onOpen: (screen: Screen, topic?: string) => void;
}) {
  const [selectedClass, setSelectedClass] = useState<ClassMaterial | null>(null);
  const [unitTarget,setUnitTarget]=useState<string|null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const course = courses.find(item => item.id === courseId)!;
  const outline = classOutlines[courseId];
  useEffect(()=>{const sync=()=>{setUnitTarget(new URLSearchParams(location.search).get('unidad'));const id=new URLSearchParams(location.search).get('clase');const material=[...(outline?.units.flatMap(u=>u.materials)||[]),...(outline?.unassigned||[])].find(m=>m.id===id);setSelectedClass(material||null);};sync();window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync);},[outline]);
  const backToOutline=()=>{const unit=outline?.units.find(u=>u.materials.some(m=>m.id===selectedClass?.id)),module=unit?.modules?.find(m=>m.materialIds.includes(selectedClass?.id||''));setSelectedClass(null);const url=new URL(location.href);url.searchParams.delete('clase');url.searchParams.delete('paso');if(unit){url.searchParams.set('unidad',unit.id);setUnitTarget(unit.id);}if(module)url.searchParams.set('modulo',module.id);history.pushState(null,'',url);};
  const topics = selectedClass?.topicIds?.map(id => lessons.find(lesson => lesson.id === id)).filter((lesson): lesson is typeof lessons[number] => !!lesson) || [];
  const reviewed = topics.filter(lesson => state.progress[lesson.id]?.reviewed).length;
  const next = topics.find(lesson => lesson.id === state.lesson && state.progress[lesson.id]?.started && !state.progress[lesson.id]?.reviewed) || topics.find(lesson => !state.progress[lesson.id]?.reviewed) || topics[0];
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [selectedClass]);
  useEffect(()=>{if(selectedClass||!unitTarget)return;const unit=document.getElementById(unitTarget);unit?.querySelector<HTMLElement>('summary')?.focus({preventScroll:true});unit?.scrollIntoView({block:'start',behavior:'instant'});},[selectedClass,unitTarget]);
  const rows = (materials: ClassMaterial[]) => <div className="class-materials">
    {materials.map((material,index) => {
      const ready = !!material.topicIds?.length||!!material.toolLessonId||!!material.tempLessonId||!!material.detLessonId||!!material.academicLessonId||!!material.mathReview;
      const Icon = material.kind === "class" ? FileText : ClipboardList;
      const academic=academicLesson(material.academicLessonId);
      const content = <><span className="class-row-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><span className="class-material-name"><strong>{material.title}</strong><small>{material.mathReview?'Explicación, ejemplos y repaso de la Unidad 2':academic?`${academic.steps.length} pasos · explicación, ejemplo y práctica`:ready?'Clase guiada y actividad':material.pdfUrl?'Material de consulta':'Aún sin documento disponible'}</small></span>{ready ? <span className="class-ready">Estudiar <ChevronRight size={17} /></span> : <small>{material.pdfUrl?'Ver original ↗':'Fuente pendiente'}</small>}</>;
      return ready ? <button className="class-material-row" data-kind={material.kind} key={material.id} onClick={() => {setSelectedClass(material);const lesson=geoLesson(material.toolLessonId),temp=temperatureLesson(material.tempLessonId),det=detectorLesson(material.detLessonId),academic=academicLesson(material.academicLessonId);if(academic){const url=new URL(academicUrl(academic),location.origin);url.searchParams.delete('paso');history.pushState(null,'',url);}else if(lesson)history.pushState(null,'',studyLessonUrl(lesson,0));else if(temp)history.pushState(null,'',tempStudyUrl(temp,0));else if(det)history.pushState(null,'',detStudyUrl(det,0));else if(material.tempLessonId===REVIEW_ID)history.pushState(null,'',reviewUrl());else {const url=new URL(location.href);url.searchParams.set('clase',material.id);history.pushState(null,'',url);}}}>{content}</button> : material.pdfUrl?<a className="class-material-row" data-kind={material.kind} key={material.id} href={material.pdfUrl} target="_blank" rel="noreferrer">{content}</a>:<div className="class-material-row is-pending" data-kind={material.kind} key={material.id}>{content}</div>;
    })}
  </div>;

  const frame=(content:ReactNode)=><div className="study-class-frame">{selectedClass&&<StudyClassContext courseId={courseId} classId={selectedClass.id}/>}<div className="study-class-content">{content}</div></div>;
  const toolLesson=geoLesson(selectedClass?.toolLessonId);
  const academic=academicLesson(selectedClass?.academicLessonId);
  if(selectedClass?.mathReview)return frame(<Suspense fallback={<p role="status">Abriendo el repaso…</p>}><MathUnitReview key={selectedClass.id} initialTopic={selectedClass.mathReview} onBack={backToOutline}/></Suspense>);
  if(academic)return frame(<Suspense fallback={<p role="status">Abriendo la clase…</p>}><AcademicLessonView key={academic.id} lesson={academic} onBack={backToOutline}/></Suspense>);
  if(selectedClass?.tempLessonId===REVIEW_ID)return frame(<TemperatureReviewStudy key={REVIEW_ID} onBack={backToOutline}/>);
  const tempLesson=temperatureLesson(selectedClass?.tempLessonId);
  if(tempLesson)return frame(<TemperatureLessonStudy key={tempLesson.id} lesson={tempLesson} onBack={backToOutline}/>);
  const detLesson=detectorLesson(selectedClass?.detLessonId);
  if(detLesson)return frame(<DetectorLessonStudy key={detLesson.id} lesson={detLesson} onBack={backToOutline}/>);
  if(toolLesson)return frame(<ToolLessonStudy key={toolLesson.id} lesson={toolLesson} onBack={backToOutline}/>);
  if (selectedClass) return frame(<div className="study-hub campus-class-view">
    <button className="campus-back" onClick={backToOutline}><ArrowLeft size={17} /> Volver al ramo</button>
    <header className="campus-heading"><h1 id="campus-title" ref={heading} tabIndex={-1}>{selectedClass.title}</h1><p>Una clase, con sus temas en el orden del material.</p></header>
    <div className="class-study-bar"><span>{reviewed}/{topics.length} temas revisados</span><a href={selectedClass.pdfUrl} target="_blank" rel="noreferrer"><FileText size={16} /> Ver PDF original ↗</a></div>
    {next && <button className="class-start" onClick={() => onOpen("lesson", next.id)}>{reviewed === topics.length ? "Repasar clase" : topics.some(lesson => state.progress[lesson.id]?.started) ? "Continuar clase" : "Empezar clase"}<ArrowRight size={18} /></button>}
    <section className="campus-topics" aria-label={`Temas de ${selectedClass.title}`}>
      <div className="campus-topic-grid">{topics.map((lesson, index) => <button className="campus-topic" key={lesson.id} data-topic={lesson.id} onClick={() => onOpen("lesson", lesson.id)}>
        <span className="campus-topic-number">{String(index + 1).padStart(2, "0")}</span>
        <span className="campus-topic-copy"><strong>{shortTitles[lesson.id]}</strong><small>{state.progress[lesson.id]?.reviewed ? "Revisado" : state.progress[lesson.id]?.started ? "En curso" : "Pendiente"}</small></span>
        {state.progress[lesson.id]?.reviewed ? <Check size={18} aria-label="Revisado" /> : <ChevronRight size={18} aria-hidden="true" />}
      </button>)}</div>
    </section>
  </div>);

  return <div className="study-hub campus-outline-view">
    <button className="campus-back" onClick={onBack}><ArrowLeft size={17} /> Mis ramos</button>
    <header className="campus-heading"><h1 id="campus-title" ref={heading} tabIndex={-1}>{course.title}</h1><p>{courseId==='s2-5'?'Elige la unidad, entra al módulo y abre su actividad.':'Elige una unidad y una actividad para empezar.'}</p></header>
    <StudyRoutePlanner courseId={courseId} initialUnit={unitTarget} onUnitChange={id=>{setUnitTarget(id);const url=new URL(location.href);url.searchParams.set('unidad',id);url.searchParams.delete('modulo');history.replaceState(null,'',url);}} onModuleChange={id=>{const url=new URL(location.href);url.searchParams.set('modulo',id);history.replaceState(null,'',url);}}/>
    <details className="study-all-courses"><summary>Ver programa completo y documentos originales</summary>

    {!!outline?.units.length && <section className="class-units" aria-label="Unidades del ramo">
      {outline.units.map((unit, index) => <details className="class-unit" id={unit.id} key={unit.id} open={unitTarget?unit.id===unitTarget:courseId==='s2-5'?unit.id==='mtfm01-u2':index === Math.max(0, outline.units.findIndex(u => u.materials.length > 0))}>
        <summary><span className="class-unit-number">{String(index+1).padStart(2,'0')}</span><span>{unit.title}<small>{unit.materials.length?`${unit.materials.length} clases y recursos`:'Fuentes pendientes'}</small></span><ChevronDown size={18} aria-hidden="true" /></summary>
        {unit.modules?unit.modules.map(module=><details className="class-module" key={module.id} open><summary>{module.title}{module.origin==='support'&&<small>Apoyo complementario</small>}</summary>{rows(module.materialIds.map(id=>unit.materials.find(m=>m.id===id)).filter((m):m is ClassMaterial=>!!m))}{module.resources?.map(resource=><a className="class-material-row" key={resource.href} href={resource.href} target="_blank" rel="noreferrer">{resource.title} ↗</a>)}{module.pending&&<p className="class-unit-pending">{module.pending}</p>}</details>):unit.materials.length ? rows(unit.materials) : <p className="class-unit-pending">Fuentes pendientes de esta unidad. No se inventan clases ni avance.</p>}
      </details>)}
    </section>}
    {!!outline?.unassigned.length && <section className="class-unassigned" aria-label="Material de clase disponible"><h2>Material de clase disponible</h2><p>Su número de clase y unidad todavía están por confirmar.</p>{rows(outline.unassigned)}</section>}
    {!outline?.units.length && !outline?.unassigned.length && <p className="class-unit-pending">Todavía falta incorporar las unidades y clases de este ramo.</p>}
    {outline?.units.length ? <p className="class-outline-note">Las adaptaciones muestran su alcance y conservan el original. Las fuentes de consulta, evaluaciones e índices no se cuentan como clases completadas.{courseId==='s2-3'?' P&ID y datos del equipo físico siguen pendientes.':courseId==='s2-1'?' La correspondencia del ítem Ejercicio 1 con el documento de ajuste cero no está confirmada.':''}</p> : null}
    {academicSources.some(s=>s.courseId===courseId)&&<details className="academic-backup"><summary>Todos los originales recibidos ({academicSources.filter(s=>s.courseId===courseId).length})</summary><p className="academic-resource-note">Incluye clases, consulta, índices y evaluaciones. Abrir una fuente no registra dominio ni supone que su adaptación esté completa.</p>{academicSources.filter(s=>s.courseId===courseId).map(s=><div className="academic-resource-row" key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.id} · {s.title} ↗</a><small>{s.format.toUpperCase()}{s.pages?` · ${s.pages} páginas`:''}</small></div>)}</details>}
    </details>
  </div>;
}
