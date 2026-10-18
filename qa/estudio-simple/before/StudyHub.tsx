import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, BookOpen, Check, ChevronRight, Cpu, Network, Cog, BriefcaseBusiness, Grid2X2, Gauge, Search, Sparkles, X } from "lucide-react";
import { lessons, type Screen, type StudyState } from "./model";
import { courses, curriculumSource, enrolledCourses, normalizeSearch } from "./courseCatalog";
import { shortTitles, topicIcons } from "./StudyNavigation";
const courseIcons: Record<string, typeof Cpu> = {
  "s2-1": Cpu, "s2-4": Network, "s2-2": Cog,
  "s2-6": BriefcaseBusiness, "s2-5": Grid2X2, "s2-3": Gauge,
};

export function StudyHub({ state, onOpen }: { state: StudyState; onOpen: (screen: Screen, topic?: string) => void }) {
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState("mine");
  const [semester, setSemester] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const topicsHeading = useRef<HTMLHeadingElement>(null);
  const query = normalizeSearch(search);
  const matchingTopics = lessons.filter(l => normalizeSearch(`${l.title} ${l.concepts.join(" ")}`).includes(query));
  const sourceCourses = scope === "mine" ? enrolledCourses.map(entry => courses.find(course => course.id === entry.id)!) : courses;
  const filtered = sourceCourses.filter(c => (scope !== "available" || c.available) && (semester === "all" || String(c.semester) === semester) && (!query || normalizeSearch(`${c.title} ${enrolledCourses.find(entry => entry.id === c.id)?.code || ""}`).includes(query) || (c.available && (normalizeSearch("protecciones eléctricas").includes(query) || matchingTopics.length > 0))));
  const current = lessons.find(l => l.id === state.lesson) || lessons[0];
  const hasProgress = Object.values(state.progress).some(p => p.started || p.reviewed) || Object.keys(state.drafts).length > 0 || state.exams.length > 0;
  const reviewed = lessons.filter(l => state.progress[l.id]?.reviewed).length;
  const showTopics = filtered.some(c => c.available) && (expanded || !!query);
  useEffect(() => {
    if (expanded) {
      topicsHeading.current?.focus({ preventScroll: true });
      topicsHeading.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [expanded]);
  const explore = () => {
    if (expanded || query) { setExpanded(false); setSearch(""); }
    else setExpanded(true);
  };
  return <div className="study-hub">
    <section className="campus-hero campus-personal-hero" aria-labelledby="campus-title">
      <div>
        <span className="campus-eyebrow"><span /> AUTOMATIZACIÓN Y ROBÓTICA · INACAP</span>
        <h1 id="campus-title" tabIndex={-1}>¿Qué estudiamos hoy?</h1>
        <p>Tus ramos en un solo lugar. Elige una materia y aprende paso a paso, mirando, respondiendo y haciendo.</p>
      </div>
      <span className="campus-personal-badge"><BookOpen size={18} /> Aprende a tu ritmo</span>
    </section>
    {hasProgress && <section className="campus-resume" aria-label="Retomar estudio">
      <span className="campus-resume-icon"><BookOpen size={24} /></span>
      <div><small>SIGUE DONDE QUEDASTE</small><h2>{state.screen === "exam" ? "Tu evaluación de protecciones" : state.screen === "calc" ? "Tus cálculos de protecciones" : state.screen === "progress" ? "Tu progreso en protecciones" : shortTitles[current.id]}</h2><p>Protecciones eléctricas · {reviewed} de {lessons.length} temas revisados</p></div>
      <button className="campus-solid" onClick={() => onOpen(state.screen, state.lesson)}>Continuar <ArrowRight size={18} /></button>
    </section>}
    <section className="campus-catalog" aria-labelledby="catalog-title">
      <div className="campus-section-heading"><div><h2 id="catalog-title">{scope === "mine" ? "Mis ramos" : scope === "available" ? "Materias con lecciones" : "Malla completa"}</h2></div><span className="campus-catalog-count">{scope === "mine" ? "Tus 6 ramos actuales" : scope === "available" ? "1 unidad de estudio disponible" : `${courses.length} ramos de referencia`}</span></div>
      <div className="campus-filters">
        <label className="campus-search"><Search size={20} /><span className="sr-only">Buscar ramo o tema</span><input placeholder="Busca un ramo o tema…" value={search} onChange={event => setSearch(event.target.value)} />{search && <button aria-label="Limpiar búsqueda de materias" onClick={() => setSearch("")}><X size={17} /></button>}</label>
        <label className="campus-semester"><span className="sr-only">Filtrar por semestre</span><select value={semester} onChange={event => setSemester(event.target.value)}><option value="all">Todos los semestres</option>{Array.from({ length: 8 }, (_, i) => <option key={i} value={String(i + 1)}>Semestre {i + 1}{i > 3 ? " · Ingeniería" : ""}</option>)}</select></label>
      </div>
      <div className="campus-scope" role="group" aria-label="Disponibilidad de materias"><button aria-pressed={scope === "mine"} onClick={() => { setScope("mine"); setSemester("all"); }}>Mis ramos <span>{enrolledCourses.length}</span></button><button aria-pressed={scope === "available"} onClick={() => { setScope("available"); setSemester("all"); }}>Con lecciones <span>1</span></button><button aria-pressed={scope === "all"} onClick={() => setScope("all")}>Malla completa <span>{courses.length}</span></button></div>
      <div className="campus-course-grid">
        {filtered.map(course => {
          const enrollment = enrolledCourses.find(entry => entry.id === course.id);
          const Icon = courseIcons[course.id] || BookOpen;
          return <article className={`campus-course campus-personal-course ${course.available ? "is-available" : "is-pending"}`} data-course={course.id} key={course.id}>
            <div className="campus-course-cover" aria-hidden="true"><Icon size={46} strokeWidth={1.3} /><span>{enrollment?.code || `SEMESTRE ${course.semester}`}</span>{course.available && <small>APRENDER HACIENDO</small>}</div>
            <div className="campus-personal-copy"><span className="campus-pending-semester">{enrollment ? `${enrollment.code} · ` : ""}SEMESTRE {course.semester}{course.semester > 4 ? " · INGENIERÍA" : ""}</span><h3>{course.title}</h3>
              {course.available ? <><p className="campus-unit-name">Protecciones eléctricas <span>· {lessons.length} temas</span></p><div className="campus-course-progress"><span>{reviewed}/{lessons.length} temas revisados aquí</span><progress value={reviewed} max={lessons.length} aria-label="Progreso local de protecciones" /></div><button className="campus-solid" aria-expanded={showTopics} aria-controls="campus-topics" onClick={explore}>{showTopics ? "Ocultar temas" : "Elegir un tema"} <ArrowDown size={18} /></button></> : <div className="campus-no-lessons"><p>Sin lecciones todavía</p><span className="campus-pending-note">Pendiente de incorporar material de estudio</span></div>}
            </div>
          </article>;
        })}
      </div>
      {filtered.length === 0 && <div className="campus-empty" role="status"><Search size={28} /><h3>No hay materias con esos filtros</h3><p>Busca otro nombre o explora todos los ramos de la malla.</p><button className="campus-solid" onClick={() => { setSearch(""); setSemester("all"); setScope("all"); }}>Ver todos los ramos <ArrowRight size={17} /></button></div>}
      <section className="campus-topics" id="campus-topics" hidden={!showTopics} aria-labelledby="campus-topics-title">
        <div className="campus-section-heading"><div><span className="campus-eyebrow">PROTECCIONES ELÉCTRICAS</span><h2 id="campus-topics-title" ref={topicsHeading} tabIndex={-1}>Elige tu próxima lección</h2></div><span>{reviewed}/{lessons.length} revisadas</span></div>
        <div className="campus-topic-grid">{(query && matchingTopics.length ? matchingTopics : lessons).map(l => { const Icon = topicIcons[l.id]; const complete = state.progress[l.id]?.reviewed; const started = state.progress[l.id]?.started; return <button className="campus-topic" key={l.id} data-topic={l.id} onClick={() => onOpen("lesson", l.id)}><div className="campus-topic-top"><span className="campus-topic-icon"><Icon size={22} /></span><small>{complete ? "Revisada" : started ? "En curso" : `${l.duration_min} min aprox.`}</small></div><span className="campus-topic-number">TEMA {String(lessons.indexOf(l) + 1).padStart(2, "0")}</span><h3>{shortTitles[l.id]}</h3><p>{l.learning_outcome}</p><span className="campus-topic-action">{complete ? "Repasar" : started ? "Continuar" : "Empezar"}<ChevronRight size={18} /></span></button>; })}</div>
      </section>
      {scope === "all" ? <p className="campus-reference">Malla de referencia {curriculumSource.year}: semestres 1–4 de Técnico y 1–8 de Ingeniería. Puede variar según tu plan de ingreso. <a href={curriculumSource.url} target="_blank" rel="noreferrer">Consultar fuente INACAP ↗</a></p> : <p className="campus-reference">El avance corresponde a tu estudio en modo. y es independiente del aula de INACAP.</p>}
    </section>
    <div className="campus-bottom-note"><Sparkles size={18} /><p>No necesitas saberlo todo para empezar. Cada lección te acompaña en el siguiente paso.</p></div>
  </div>;
}
