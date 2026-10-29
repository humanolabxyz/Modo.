import {CourseClassroom} from './CourseClassroom';
import {studyClassUrl} from './StudyClassContext';
import { type ReactNode, lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronRight, ClipboardList, FileText } from "lucide-react";
import {StudyClassContext} from './StudyClassContext';
import { classOutlines, type ClassMaterial } from "./classCatalog";
import { courses } from "./courseCatalog";
import { lessons, type Screen, type StudyState } from "./model";
import { shortTitles } from "./StudyNavigation";
import {geoLesson} from '../learning/geogebraLessons';
import {ToolLessonStudy} from './ToolLessonStudy';
import {TemperatureLessonStudy} from './TemperatureLessonStudy';
import {DetectorLessonStudy} from './DetectorLessonStudy';
import {detectorLesson} from '../learning/detectorLessons';
import {temperatureLesson} from '../learning/temperatureLessons';
import {REVIEW_ID} from '../learning/temperatureReview';
import {TemperatureReviewStudy} from './TemperatureReviewStudy';
import {MachineActivityStudy} from './MachineActivityStudy';
import {academicLesson} from './academicContent';
import academicSources from './content/academic-sources.json';
import '../styles/academic.css';
import '../styles/unit2-exam-review.css';
import {unit2ReviewUrl} from './studyFocus';
const AcademicLessonView=lazy(()=>import('./AcademicLessonView'));
const MathUnitReview=lazy(()=>import('./MathUnitReview').then(m=>({default:m.MathUnitReview})));
const Unit2ExamReview=lazy(()=>import('./Unit2ExamReview').then(m=>({default:m.Unit2ExamReview})));

export function CourseOutline({ courseId, state, onBack, onOpen }: {
  courseId: string;
  state: StudyState;
  onBack: () => void;
  onOpen: (screen: Screen, topic?: string) => void;
}) {
  const [selectedClass, setSelectedClass] = useState<ClassMaterial | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const course = courses.find(item => item.id === courseId)!;
  const outline = classOutlines[courseId];
  useEffect(()=>{const sync=()=>{const id=new URLSearchParams(location.search).get('clase');const material=[...(outline?.units.flatMap(u=>u.materials)||[]),...(outline?.unassigned||[])].find(m=>m.id===id);setSelectedClass(material||null);};sync();window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync);},[outline]);
  const backToOutline=()=>{const unit=outline?.units.find(u=>u.materials.some(m=>m.id===selectedClass?.id)),module=unit?.modules?.find(m=>m.materialIds.includes(selectedClass?.id||''));setSelectedClass(null);const url=new URL(location.href);url.searchParams.delete('clase');url.searchParams.delete('paso');if(unit){url.searchParams.set('unidad',unit.id);}if(module)url.searchParams.set('modulo',module.id);history.pushState(null,'',url);};
  const topics = selectedClass?.topicIds?.map(id => lessons.find(lesson => lesson.id === id)).filter((lesson): lesson is typeof lessons[number] => !!lesson) || [];
  const reviewed = topics.filter(lesson => state.progress[lesson.id]?.reviewed).length;
  const next = topics.find(lesson => lesson.id === state.lesson && state.progress[lesson.id]?.started && !state.progress[lesson.id]?.reviewed) || topics.find(lesson => !state.progress[lesson.id]?.reviewed) || topics[0];
  useEffect(() => {
    if(!selectedClass)return;
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [selectedClass]);

  const rows = (materials: ClassMaterial[]) => <div className="class-materials">
    {materials.map((material) => {
      const ready = !!material.machineActivity||!!material.topicIds?.length||!!material.toolLessonId||!!material.tempLessonId||!!material.detLessonId||!!material.academicLessonId||!!material.mathReview;
      const Icon = material.kind === "class" ? FileText : ClipboardList;
      const academic=academicLesson(material.academicLessonId);
      const content = <><Icon className="course-activity-icon" size={21} aria-hidden="true"/><span className="class-material-name"><strong>{material.title}</strong><small>{material.mathReview?'Explicación, ejemplos y repaso de la Unidad 2':academic?`${academic.steps.length} pasos · explicación, ejemplo y práctica`:ready?'Clase guiada y actividad':material.pdfUrl?'Material de consulta':'Aún sin documento disponible'}</small></span>{ready ? <span className="class-ready">Estudiar <ChevronRight size={17} /></span> : <small>{material.pdfUrl?'Ver original ↗':'Fuente pendiente'}</small>}</>;
      return ready ? <a className="class-material-row" data-material={material.id} data-kind={material.kind} key={material.id} href={studyClassUrl(courseId,material)}>{content}</a> : material.pdfUrl?<a className="class-material-row" data-kind={material.kind} key={material.id} href={material.pdfUrl} target="_blank" rel="noreferrer">{content}</a>:<div className="class-material-row is-pending" data-kind={material.kind} key={material.id}>{content}</div>;
    })}
  </div>;

  const frame=(content:ReactNode)=><div className="study-class-frame">{selectedClass&&<StudyClassContext courseId={courseId} classId={selectedClass.id}/>}<div className="study-class-content">{content}</div></div>;
  const toolLesson=geoLesson(selectedClass?.toolLessonId);
  const academic=academicLesson(selectedClass?.academicLessonId);
  if(selectedClass?.machineActivity)return frame(<MachineActivityStudy onBack={backToOutline}/>);
  if(selectedClass?.mathReview)return frame(<Suspense fallback={<p role="status">Abriendo el repaso…</p>}>{selectedClass.mathReview==='all'?<Unit2ExamReview onBack={backToOutline}/>:<MathUnitReview key={selectedClass.id} initialTopic={selectedClass.mathReview} onBack={backToOutline}/>}</Suspense>);
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
    <header className="campus-heading"><h1 id="campus-title" ref={heading} tabIndex={-1}>{course.title}</h1><p>Abre una unidad, despliega su módulo y elige la actividad.</p></header>
    {courseId==='s2-5'&&<aside className="course-exam-entry"><span><strong>Repaso de la prueba · Unidad 2</strong><small>Resuelve paso a paso las 4 actividades: población, estroncio, ahorro y planta.</small></span><a href={unit2ReviewUrl}>Empezar el repaso<ArrowRight size={17}/></a></aside>}
    <CourseClassroom courseId={courseId} title={course.title} outline={outline||{units:[],unassigned:[]}} rows={rows}>
    {academicSources.some(s=>s.courseId===courseId)&&<details className="academic-backup"><summary>Todos los originales recibidos ({academicSources.filter(s=>s.courseId===courseId).length})</summary><p className="academic-resource-note">Incluye clases, consulta, índices y evaluaciones. Abrir una fuente no registra dominio ni supone que su adaptación esté completa.</p>{academicSources.filter(s=>s.courseId===courseId).map(s=><div className="academic-resource-row" key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.id} · {s.title} ↗</a><small>{s.format.toUpperCase()}{s.pages?` · ${s.pages} páginas`:''}</small></div>)}</details>}
    </CourseClassroom>
  </div>;
}
