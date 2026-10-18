import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  Activity,
  BookOpen,
  Cable,
  Check,
  ChevronRight,
  FileText,
  Layers,
  Menu,
  Search,
  Shield,
  SlidersHorizontal,
  TrendingUp,
  X,
  Zap,
  Cog,
} from "lucide-react";
import { lessons, lessonStatus, type Progress, type Screen } from "./model";
import { trapDialogTab } from "./dialog";

export const topicIcons: Record<
  string,
  ComponentType<{ size?: number; strokeWidth?: number }>
> = {
  "objetivos-fallas": Zap,
  coordinacion: SlidersHorizontal,
  termomagnetico: Shield,
  fusibles: Layers,
  conductores: Cable,
  guardamotor: Cog,
  "tierra-sobretension": Activity,
  "motor-trifasico": Cog,
};
export const shortTitles: Record<string, string> = {
  "objetivos-fallas": "Reconocer las fallas",
  coordinacion: "Coordinar las corrientes",
  termomagnetico: "Termomagnético",
  fusibles: "Fusibles",
  conductores: "Conductores",
  guardamotor: "Guardamotor",
  "tierra-sobretension": "SPD y diferencial",
  "motor-trifasico": "Motor trifásico",
};
type Props = {
  lesson: string;
  screen: Screen;
  progress: Record<string, Progress>;
  onNavigate: (screen: Screen, topic?: string) => void;
};
export function StudyNavigation({
  lesson,
  screen,
  progress,
  onNavigate,
}: Props) {
  const [search, setSearch] = useState(""),
    [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const reviewed = Object.values(progress).filter((p) => p.reviewed).length;
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  const go = (page: Screen, topic?: string) => {
    onNavigate(page, topic);
    setOpen(false);
    setSearch("");
  };
  const matches = lessons.filter((l) =>
    `${l.title} ${l.concepts.join(" ")}`
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .includes(
        search
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase(),
      ),
  );
  const index = lessons.findIndex((l) => l.id === lesson);
  const list = (mobile = false) => (
    <>
      <div className="topic-search">
        <Search size={17} />
        <input
          aria-label={mobile ? "Buscar tema en menú móvil" : "Buscar tema"}
          placeholder="Buscar un tema…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button aria-label="Limpiar búsqueda" onClick={() => setSearch("")}>
            <X size={15} />
          </button>
        )}
      </div>
      <nav aria-label={mobile ? "Temas en menú móvil" : "Temas de estudio"}>
        {matches.map((l) => {
          const i = lessons.indexOf(l),
            Icon = topicIcons[l.id];
          return (
            <button
              key={l.id}
              data-topic={l.id}
              aria-current={
                lesson === l.id && ["lesson", "practice"].includes(screen)
                  ? "page"
                  : undefined
              }
              onClick={() => go("lesson", l.id)}
            >
              <span className="topic-symbol">
                <Icon size={19} />
              </span>
              <span className="topic-label">
                <small>TEMA {String(i + 1).padStart(2, "0")}</small>
                <span className="topic-full-title">{l.title}</span>
                <span className="topic-short-title">{shortTitles[l.id]}</span>
              </span>
              <span
                className="topic-state"
                title={lessonStatus(progress[l.id])}
              >
                {progress[l.id]?.reviewed ? (
                  <Check size={15} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </span>
            </button>
          );
        })}
        {matches.length === 0 && (
          <p className="topic-empty">
            No encontramos ese tema. Prueba con “motor”, “fusible” o
            “corriente”.
          </p>
        )}
        <div className="topic-nav-tools">
          <button
            aria-current={screen === "progress" ? "page" : undefined}
            onClick={() => go("progress")}
          >
            <TrendingUp size={19} /> Mi progreso
          </button>
        </div>
      </nav>
    </>
  );
  return (
    <>
      <aside className="study-sidebar">
        <div className="topic-sidebar-heading">
          <BookOpen size={19} />
          <h2>Ruta de estudio</h2>
          <span>8 temas</span>
        </div>
        <div className="topic-desktop-list">{list()}</div>
        <div className="topic-sidebar-progress">
          <div>
            <span>Temas revisados</span>
            <strong>{reviewed}/8</strong>
          </div>
          <progress value={reviewed} max={8} aria-label="Progreso del índice" />
          <a href="/estudio/profesor.pdf" target="_blank" rel="noreferrer">
            <FileText size={16} /> Material del profesor ↗
          </a>
        </div>
        <div className="topic-mobile-toolbar">
          <button
            aria-label="Abrir menú de temas"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            <Menu size={19} />
            {screen === "progress" ? (
              <span>Los 8 <small>temas</small></span>
            ) : (
              <span>Tema {index + 1} <small>de 8 · cambiar</small></span>
            )}
            <ChevronRight size={17} />
          </button>
          <label className="study-mobile-topics">
            Elegir tema
            <select
              value={
                screen === "progress" ? "progress" : lesson
              }
              onChange={(e) =>
                e.target.value === "progress"
                  ? go("progress")
                  : go("lesson", e.target.value)
              }
            >
              {lessons.map((l, i) => (
                <option value={l.id} key={l.id}>
                  {i + 1}. {l.title}
                </option>
              ))}
              <option value="progress">Mi progreso</option>
            </select>
          </label>
        </div>
      </aside>
      <dialog
        ref={dialog}
        className="study-topic-dialog"
        onKeyDown={trapDialogTab}
        aria-labelledby="mobile-menu-title"
        onClose={() => { setOpen(false); setSearch(""); }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div className="topic-dialog-content">
          <div className="topic-dialog-heading">
            <div>
              <small>PROTECCIONES ELÉCTRICAS</small>
              <h2 id="mobile-menu-title">Elige qué estudiar</h2>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú de temas"
            >
              <X size={21} />
            </button>
          </div>
          {list(true)}
          <p className="topic-dialog-progress">
            {reviewed} de 8 temas revisados · tu avance se conserva
          </p>
          <a className="topic-material-link" href="/estudio/profesor.pdf" target="_blank" rel="noreferrer"><FileText size={16} /> Consultar material del profesor</a>
        </div>
      </dialog>
    </>
  );
}
export function StudyTabs({
  screen,
  onNavigate,
}: {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
}) {
  return (
    <nav className="study-section-tabs" aria-label="Secciones del estudio">
      {(
        [
          ["lesson", "Aprender", BookOpen],
          ["practice", "Practicar", SlidersHorizontal],
          ["progress", "Progreso", TrendingUp],
        ] as const
      ).map(([id, label, Icon]) => (
        <button
          key={id}
          aria-current={screen === id ? "page" : undefined}
          onClick={() => onNavigate(id)}
        >
          <Icon size={17} />
          {label}
        </button>
      ))}
    </nav>
  );
}
