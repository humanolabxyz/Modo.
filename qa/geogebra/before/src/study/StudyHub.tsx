import { useState } from "react";
import { ArrowRight, BookOpen, Cpu, Network, Cog, BriefcaseBusiness, Grid2X2, Gauge, Search, X } from "lucide-react";
import { lessons, type Screen, type StudyState } from "./model";
import { courses, curriculumSource, enrolledCourses, normalizeSearch } from "./courseCatalog";
import { shortTitles } from "./StudyNavigation";
import { CourseOutline } from "./CourseOutline";
import { classOutlines } from "./classCatalog";

const courseIcons: Record<string, typeof Cpu> = {
  "s2-1": Cpu, "s2-4": Network, "s2-2": Cog,
  "s2-6": BriefcaseBusiness, "s2-5": Grid2X2, "s2-3": Gauge,
};

export function StudyHub({ state, onOpen }: { state: StudyState; onOpen: (screen: Screen, topic?: string) => void }) {
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState("mine");
  const [semester, setSemester] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const query = normalizeSearch(search);
  const matchingTopics = lessons.filter(lesson => normalizeSearch(`${lesson.title} ${lesson.concepts.join(" ")}`).includes(query));
  const sourceCourses = scope === "mine" ? enrolledCourses.map(entry => courses.find(course => course.id === entry.id)!) : courses;
  const filtered = sourceCourses.filter(course =>
    (scope !== "available" || course.available) &&
    (semester === "all" || String(course.semester) === semester) &&
    (!query || normalizeSearch(`${course.title} ${enrolledCourses.find(entry => entry.id === course.id)?.code || ""}`).includes(query) ||
      (course.available && (normalizeSearch("protecciones eléctricas").includes(query) || matchingTopics.length > 0))),
  );
  const hasProgress = Object.values(state.progress).some(progress => progress.started || progress.reviewed) || Object.keys(state.drafts).length > 0 || state.exams.length > 0;
  const current = lessons.find(lesson => lesson.id === state.lesson) || lessons[0];
  const resumeTitle = state.screen === "exam" ? "Evaluación de protecciones" : state.screen === "calc" ? "Cálculos de protecciones" : state.screen === "progress" ? "Mi progreso" : shortTitles[current.id];
  const selectCourse = (courseId: string) => {
    setSelectedCourse(courseId);
    setSearch("");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const backToCourses = () => {
    setSelectedCourse(null);
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() => document.getElementById("campus-title")?.focus({ preventScroll: true }));
  };
  if (selectedCourse) return <CourseOutline key={selectedCourse} courseId={selectedCourse} state={state} onBack={backToCourses} onOpen={onOpen} />;

  return <div className="study-hub">
    <header className="campus-heading"><h1 id="campus-title" tabIndex={-1}>{scope === "mine" ? "Mis ramos" : scope === "all" ? "Malla completa" : "Para estudiar"}</h1><p>Automatización y Robótica</p></header>
    <label className="campus-search"><Search size={19} aria-hidden="true" /><span className="sr-only">Buscar ramo o tema</span><input placeholder="Buscar un ramo o tema" value={search} onChange={event => setSearch(event.target.value)} />{search && <button aria-label="Limpiar búsqueda de materias" onClick={() => setSearch("")}><X size={17} /></button>}</label>
    {hasProgress && <section className="campus-resume" aria-label="Retomar estudio"><span>{resumeTitle}</span><button onClick={() => onOpen(state.screen, state.lesson)}>Continuar <ArrowRight size={16} /></button></section>}
    <section className="campus-catalog" aria-label="Ramos de estudio">
      <div className="campus-course-grid">
        {filtered.map(course => {
          const enrollment = enrolledCourses.find(entry => entry.id === course.id);
          const Icon = courseIcons[course.id] || BookOpen;
          const unitCount = classOutlines[course.id]?.units.length;
          const contents = <><span className="campus-course-top"><Icon size={24} strokeWidth={1.5} aria-hidden="true" /><small>{enrollment?.code || `Semestre ${course.semester}`}</small></span><strong className="campus-course-name">{course.title}</strong><span className="campus-course-status">{course.available ? "Protecciones eléctricas" : unitCount ? `${unitCount} unidades · PDF pendientes` : "Material pendiente"}<ArrowRight size={18} aria-hidden="true" /></span></>;
          return <button className={`campus-course ${course.available ? "is-available" : "is-pending"}`} data-course={course.id} key={course.id} aria-label={`Abrir ${course.title}`} onClick={() => selectCourse(course.id)}>{contents}</button>;
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
  </div>;
}
