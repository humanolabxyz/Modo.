import {StudyRoutePlanner} from './StudyRoutePlanner';
import { useEffect,useState,type CSSProperties } from "react";
import { ArrowRight, BookOpen, Cpu, Network, Cog, BriefcaseBusiness, Grid2X2, Gauge, Search, X } from "lucide-react";
import { lessons, type Screen, type StudyState } from "./model";
import { courses, curriculumSource, enrolledCourses, normalizeSearch } from "./courseCatalog";
import { shortTitles } from "./StudyNavigation";
import { CourseOutline } from "./CourseOutline";
import { classOutlines } from "./classCatalog";
import {academicLessons,academicUrl} from './academicContent';
import {useAcademicState} from './academicState';
import {AcademicBackup} from './AcademicBackup';
import {StudyFocusBanner} from './StudyFocusBanner';
import {CourseArt,courseIdentity} from './StudyArt';

const courseIcons: Record<string, typeof Cpu> = {
  "s2-1": Cpu, "s2-4": Network, "s2-2": Cog,
  "s2-6": BriefcaseBusiness, "s2-5": Grid2X2, "s2-3": Gauge,
};

export function StudyHub({ state, onOpen }: { state: StudyState; onOpen: (screen: Screen, topic?: string) => void }) {
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState("mine");
  const [semester, setSemester] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const academic=useAcademicState();
  const latest=Object.entries(academic.state.lessons).sort((a,b)=>b[1].updated.localeCompare(a[1].updated)).find(([id])=>academicLessons.some(l=>l.id===id));
  const resume=academicLessons.find(l=>l.id===latest?.[0]);
  useEffect(()=>{const sync=()=>{const id=new URLSearchParams(location.search).get('curso');setSelectedCourse(courses.some(c=>c.id===id)?id:null);};sync();window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync);},[]);
  const query = normalizeSearch(search);
  const matchingTopics = lessons.filter(lesson => normalizeSearch(`${lesson.title} ${lesson.concepts.join(" ")}`).includes(query));
  const sourceCourses = scope === "mine" ? enrolledCourses.map(entry => courses.find(course => course.id === entry.id)!) : courses;
  const filtered = sourceCourses.filter(course =>
    (scope !== "available" || course.available) &&
    (semester === "all" || String(course.semester) === semester) &&
    (!query || normalizeSearch(`${course.title} ${enrolledCourses.find(entry => entry.id === course.id)?.code || ""} ${classOutlines[course.id]?.units.flatMap(u=>u.materials.map(m=>m.title)).join(' ')||''} ${academicLessons.filter(l=>l.courseId===course.id).map(l=>l.steps.map(s=>s.title+' '+s.body).join(' ')).join(' ')}`).includes(query) ||
      (course.id==='s2-2' && (normalizeSearch("protecciones eléctricas").includes(query) || matchingTopics.length > 0)) ||
      (course.id==='s2-5'&&normalizeSearch('geogebra funciones lineales cuadráticas logarítmicas').includes(query))||
      (course.id==='s2-3'&&normalizeSearch('temperatura pt100 termocupla rtd transmisor guía g03 detectores inductivo capacitivo fotoeléctrico plc proximidad guía g01 g02').includes(query))),
  );
  const hasProgress = Object.values(state.progress).some(progress => progress.started || progress.reviewed) || Object.keys(state.drafts).length > 0 || state.exams.length > 0;
  const current = lessons.find(lesson => lesson.id === state.lesson) || lessons[0];
  const resumeTitle = state.screen === "exam" ? "Evaluación de protecciones" : state.screen === "calc" ? "Cálculos de protecciones" : state.screen === "progress" ? "Mi progreso" : shortTitles[current.id];
  const selectCourse = (courseId: string) => {
    const url=new URL(location.href);url.searchParams.set('curso',courseId);url.searchParams.delete('clase');url.searchParams.delete('paso');history.pushState(null,'',url);
    setSelectedCourse(courseId);
    setSearch("");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const backToCourses = () => {
    const url=new URL(location.href);url.searchParams.delete('curso');url.searchParams.delete('clase');url.searchParams.delete('paso');history.pushState(null,'',url);
    setSelectedCourse(null);
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() => document.getElementById("campus-title")?.focus({ preventScroll: true }));
  };
  if (selectedCourse) return <CourseOutline key={selectedCourse} courseId={selectedCourse} state={state} onBack={backToCourses} onOpen={onOpen} />;

  return <div className="study-hub study-home">
    <header className="study-nav-heading"><h1 id="campus-title" tabIndex={-1}>¿Qué vas a estudiar?</h1><p>Elige el ramo y la unidad. Entra al módulo y abre la actividad que vas a estudiar.</p></header>
    <StudyRoutePlanner/>
    <details className="study-all-courses"><summary>Ver todos mis ramos y más opciones</summary>

    <div className="study-catalog-heading" id="study-courses"><div><span className="study-kicker">AUTOMATIZACIÓN Y ROBÓTICA</span><h2>{scope === "mine" ? "Mis ramos" : scope === "all" ? "Malla completa" : "Para estudiar"}</h2></div>
    <label className="campus-search"><Search size={19} aria-hidden="true" /><span className="sr-only">Buscar ramo o tema</span><input placeholder="Buscar un ramo o tema" value={search} onChange={event => setSearch(event.target.value)} />{search && <button aria-label="Limpiar búsqueda de materias" onClick={() => setSearch("")}><X size={17} /></button>}</label>
    </div>
    {hasProgress && <section className="campus-resume" aria-label="Retomar estudio"><span>{resumeTitle}</span><button onClick={() => onOpen(state.screen, state.lesson)}>Continuar <ArrowRight size={16} /></button></section>}
    {resume&&latest&&<section className="campus-resume" aria-label="Retomar clase nueva"><span>{resume.title} · paso {Math.min(latest[1].step+1,resume.steps.length)}</span><a className="campus-back" href={academicUrl(resume,Math.min(latest[1].step,resume.steps.length-1))}>Continuar clase <ArrowRight size={16}/></a></section>}
    <section className="campus-catalog" aria-label="Ramos de estudio">
      <div className="campus-course-grid">
        {filtered.map(course => {
          const enrollment = enrolledCourses.find(entry => entry.id === course.id);
          const Icon = courseIcons[course.id] || BookOpen;
          const unitCount = classOutlines[course.id]?.units.length;
          const count=classOutlines[course.id]?.units.flatMap(u=>u.materials).filter(m=>m.academicLessonId||m.topicIds||m.tempLessonId||m.detLessonId||m.toolLessonId||m.mathReview).length||0;
          const identity=courseIdentity[course.id];
          const contents = <><span className="campus-course-cover"><span className="campus-course-code">{enrollment?.code || `Semestre ${course.semester}`}</span>{identity?<CourseArt courseId={course.id}/>:<Icon size={54} strokeWidth={1}/>}</span><span className="campus-course-copy"><span className="campus-course-top"><Icon size={16} strokeWidth={1.5} aria-hidden="true" /><small>{identity?.kicker||'RAMO DE LA MALLA'}</small></span><strong className="campus-course-name">{course.title}</strong><span className="campus-course-description">{identity?.description||'Espacio reservado para el material de este ramo.'}</span><span className="campus-course-status">{count?`${count} recorridos disponibles`:unitCount?`${unitCount} unidades · fuentes pendientes`:'Material pendiente'}<span className="campus-course-arrow"><ArrowRight size={18} aria-hidden="true" /></span></span></span></>;
          return <button style={identity?{'--course-accent':identity.color,'--course-soft':identity.soft} as CSSProperties:undefined} className={`campus-course ${course.available ? "is-available" : "is-pending"}`} data-course={course.id} key={course.id} aria-label={`Abrir ${course.title}`} onClick={() => selectCourse(course.id)}>{contents}</button>;
        })}
      </div>
      {filtered.length === 0 && <div className="campus-empty" role="status"><p>No encontramos ese ramo.</p><button className="campus-back" onClick={() => { setSearch(""); setSemester("all"); setScope("all"); }}>Ver todos los ramos <ArrowRight size={16} /></button></div>}
    </section>
    <details className="campus-options">
      <summary>Más opciones</summary>
      <div className="campus-options-fields">
        <label>Mostrar<select value={scope} onChange={event => { setScope(event.target.value); setSemester("all"); }} aria-label="Mostrar ramos"><option value="mine">Mis ramos</option><option value="available">Con lecciones</option><option value="all">Malla completa</option></select></label>
        <label>Semestre<select value={semester} onChange={event => setSemester(event.target.value)} aria-label="Filtrar por semestre"><option value="all">Todos los semestres</option>{Array.from({ length: 8 }, (_, i) => <option key={i} value={String(i + 1)}>Semestre {i + 1}{i > 3 ? " · Ingeniería" : ""}</option>)}</select></label>
      </div>
      {scope === "all" && <p className="campus-reference">Malla de referencia {curriculumSource.year}. Puede variar según tu plan de ingreso. <a href={curriculumSource.url} target="_blank" rel="noreferrer">Fuente INACAP ↗</a></p>}
    </details>
    <AcademicBackup/>
    </details>
  </div>;
}
