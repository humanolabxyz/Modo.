import {ArrowRight, BookOpen, ChevronDown, Clock3, FolderOpen, GitBranch, Play, Plug, Plus} from 'lucide-react';
import {HomeTools} from '../lab/HomeTools';
import {CLASS_DIAGRAMS, type PracticeDocument, type StudyMode} from '../data/practice';
import '../styles/modo-home.css';

type HomeProps = {
  practice: PracticeDocument;
  onStart: (mode: StudyMode, diagramId: string) => void;
  onContinue: () => void;
  onImport: (file: File) => void;
  ready: boolean;
};

export function Home({practice, onStart, onContinue, onImport, ready}: HomeProps) {
  return <section className="home-view modo-home" aria-label="Inicio de modo.">
    <div className="modo-workspace">
      <div className="modo-intro">
        <div>
          <p className="modo-eyebrow">AUTOMATIZACIÓN · ROBÓTICA · APRENDIZAJE</p>
          <h1>Tu espacio<br className="modo-title-break"/> de trabajo<span>.</span></h1>
          <p className="modo-intro-description">Practica, estudia y construye a tu ritmo.</p>
        </div>
        <div className="modo-intro-aside" aria-hidden="true"><span>APRENDE</span><span>CONECTA</span><span>EXPERIMENTA</span><i>//</i></div>
      </div>
      <article className="modo-card modo-panel" aria-labelledby="panel-heading">
        <img className="modo-card-photo" src="/images/modo/bornes.webp" alt="" width="1536" height="1024" fetchPriority="high"/>
        <div className="modo-card-heading">
          <span className="modo-module-icon"><Plug aria-hidden="true"/></span>
          <div><p className="modo-eyebrow">SIMULADOR</p><h2 id="panel-heading">Panel de control</h2><p>Conecta cables, interpreta diagramas y comprueba tus conexiones.</p></div>
        </div>
        <form className="modo-panel-form" onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          onStart(data.get('mode') as StudyMode, String(data.get('diagram')));
        }}>
          <div className="modo-panel-fields">
            <label htmlFor="learning-mode">Modo de aprendizaje</label>
            <div className="modo-select"><GitBranch size={21} aria-hidden="true"/><select id="learning-mode" name="mode" defaultValue="free">
              <option value="free">Práctica libre · conectar cables</option>
              <option value="identify">Reconocimiento guiado · 9 retos con fotografías</option>
              <option value="guided">Leer diagramas · líneas, símbolos y práctica</option>
              <option value="explore">Explorar componentes</option>
            </select><ChevronDown className="modo-select-chevron" size={18} aria-hidden="true"/></div>
            <details className="modo-diagram">
              <summary><Plus size={22} aria-hidden="true"/><span>Añadir un diagrama <span className="modo-optional">· opcional</span></span></summary>
              <div className="modo-diagram-content"><label htmlFor="circuit">Material de estudio</label>
                <select id="circuit" name="diagram" defaultValue={practice.diagram?.origin === 'class_photo' ? practice.diagram.id : 'none'}>
                  <option value="none">Sin diagrama · cargar mi imagen en el simulador</option>
                  {CLASS_DIAGRAMS.map(diagram => <option key={diagram.id} value={diagram.id}>{diagram.name}</option>)}
                </select>
                <small>Puedes usar una foto de clase o cargar tu imagen dentro de la práctica.</small>
              </div>
            </details>
          </div>
          <button className="modo-primary" disabled={!ready} type="submit">Abrir panel de control <ArrowRight size={22} aria-hidden="true"/></button>
        </form>
      </article>
      <div className="modo-side">
        <a className="modo-card modo-study" href="/estudio" aria-labelledby="study-heading">
          <img className="modo-card-photo" src="/images/modo/protecciones.webp" alt="" width="1536" height="1024" decoding="async"/>
          <div className="modo-card-heading"><span className="modo-module-icon"><BookOpen aria-hidden="true"/></span><div><p className="modo-eyebrow">ESTUDIO</p><h2 id="study-heading">Estudiar protecciones</h2><p>Teoría, componentes, cálculos y ejercicios. Revisa tus errores y prepárate con simulacros.</p></div></div>
          <span className="modo-round-arrow" aria-hidden="true"><ArrowRight size={25}/></span>
        </a>
        <HomeTools/>
      </div>
    </div>
    <div className="modo-card modo-recent">
      <span className="modo-module-icon"><Clock3 aria-hidden="true"/></span>
      <div className="modo-recent-copy"><p className="modo-eyebrow">PRÁCTICA RECIENTE</p><h2>Tu última práctica</h2><p>{practice.wires.length} cables · {practice.steps.length} pasos</p></div>
      <div className="modo-recent-actions">
        <button className="modo-continue" disabled={!ready} onClick={onContinue}><Play size={22} aria-hidden="true"/><span className="modo-continue-desktop">Continuar práctica</span><span className="modo-continue-mobile">Continuar</span><ArrowRight className="modo-continue-mobile" size={22} aria-hidden="true"/></button>
        <label className="modo-import"><FolderOpen size={23} aria-hidden="true"/><span>Abrir práctica guardada</span><input type="file" aria-label="Abrir práctica guardada" accept="application/json,.json" disabled={!ready} onChange={event => {
          if (event.target.files?.[0]) onImport(event.target.files[0]);
          event.target.value = '';
        }}/></label>
      </div>
    </div>
  </section>;
}
