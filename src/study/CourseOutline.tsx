import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, ClipboardList, FileText } from "lucide-react";
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
  const backToOutline=()=>{setSelectedClass(null);const url=new URL(location.href);url.searchParams.delete('clase');url.searchParams.delete('paso');history.pushState(null,'',url);};
  const topics = selectedClass?.topicIds?.map(id => lessons.find(lesson => lesson.id === id)).filter((lesson): lesson is typeof lessons[number] => !!lesson) || [];
  const reviewed = topics.filter(lesson => state.progress[lesson.id]?.reviewed).length;
  const next = topics.find(lesson => lesson.id === state.lesson && state.progress[lesson.id]?.started && !state.progress[lesson.id]?.reviewed) || topics.find(lesson => !state.progress[lesson.id]?.reviewed) || topics[0];
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [selectedClass]);
  const rows = (materials: ClassMaterial[]) => <div className="class-materials">
    {materials.map(material => {
      const ready = !!material.topicIds?.length||!!material.toolLessonId||!!material.tempLessonId||!!material.detLessonId;
      const Icon = material.kind === "class" ? FileText : ClipboardList;
      const content = <><Icon size={20} aria-hidden="true" /><span>{material.title}</span>{ready ? <span className="class-ready">Estudiar <ChevronRight size={17} /></span> : <small>PDF pendiente</small>}</>;
      return ready ? <button className="class-material-row" data-kind={material.kind} key={material.id} onClick={() => {setSelectedClass(material);const lesson=geoLesson(material.toolLessonId),temp=temperatureLesson(material.tempLessonId),det=detectorLesson(material.detLessonId);if(lesson)history.pushState(null,'',studyLessonUrl(lesson,0));else if(temp)history.pushState(null,'',tempStudyUrl(temp,0));else if(det)history.pushState(null,'',detStudyUrl(det,0));else if(material.tempLessonId===REVIEW_ID)history.pushState(null,'',reviewUrl());}}>{content}</button> : <div className="class-material-row is-pending" data-kind={material.kind} key={material.id}>{content}</div>;
    })}
  </div>;

  const toolLesson=geoLesson(selectedClass?.toolLessonId);
  if(selectedClass?.tempLessonId===REVIEW_ID)return <TemperatureReviewStudy key={REVIEW_ID} onBack={backToOutline}/>;
  const tempLesson=temperatureLesson(selectedClass?.tempLessonId);
  if(tempLesson)return <TemperatureLessonStudy key={tempLesson.id} lesson={tempLesson} onBack={backToOutline}/>;
  const detLesson=detectorLesson(selectedClass?.detLessonId);
  if(detLesson)return <DetectorLessonStudy key={detLesson.id} lesson={detLesson} onBack={backToOutline}/>;
  if(toolLesson)return <ToolLessonStudy key={toolLesson.id} lesson={toolLesson} onBack={backToOutline}/>;
  if (selectedClass) return <div className="study-hub campus-class-view">
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
  </div>;

  return <div className="study-hub campus-outline-view">
    <button className="campus-back" onClick={onBack}><ArrowLeft size={17} /> Mis ramos</button>
    <header className="campus-heading"><h1 id="campus-title" ref={heading} tabIndex={-1}>{course.title}</h1><p>Unidades, clases y actividades del ramo.</p></header>
    {!!outline?.units.length && <section className="class-units" aria-label="Unidades del ramo">
      {outline.units.map((unit, index) => <details className="class-unit" key={unit.id} open={index === Math.max(0, outline.units.findIndex(u => u.materials.length > 0))}>
        <summary><ChevronDown size={18} aria-hidden="true" /><span>{unit.title}</span></summary>
        {unit.materials.length ? rows(unit.materials) : <p className="class-unit-pending">Falta incorporar la lista de clases de esta unidad.</p>}
      </details>)}
    </section>}
    {!!outline?.unassigned.length && <section className="class-unassigned" aria-label="Material de clase disponible"><h2>Material de clase disponible</h2><p>Su número de clase y unidad todavía están por confirmar.</p>{rows(outline.unassigned)}</section>}
    {!outline?.units.length && !outline?.unassigned.length && <p className="class-unit-pending">Todavía falta incorporar las unidades y clases de este ramo.</p>}
    {outline?.units.length ? <p className="class-outline-note">Se conserva el orden del aula. Cada documento mantiene su propia lección.{courseId==='s2-5'?' Faltan otros materiales de estas unidades; matrices puede explorarse libremente en GeoGebra.':courseId==='s2-3'?' Faltan las conferencias y las otras guías prácticas; llegarán al recibir sus documentos.':''}</p> : null}
  </div>;
}
