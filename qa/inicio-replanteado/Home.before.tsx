import {ArrowRight, BookOpen, ChevronDown, Clock3, FlaskConical, FolderOpen, GitBranch, Play, Plug, Plus} from 'lucide-react';
import {HomeTools} from '../lab/HomeTools';
import {InstallApp} from './InstallApp';
import {CommunityCard} from './CommunityCard';
import {CLASS_DIAGRAMS, type PracticeDocument, type StudyMode} from '../data/practice';
import '../styles/modo-home.css';
import '../styles/modo-home-refinement.css';

type HomeProps = {
  practice: PracticeDocument;
  onStart: (mode: StudyMode, diagramId: string) => void;
  onContinue: () => void;
  onImport: (file: File) => void;
  ready: boolean;
};

export function Home({practice, onStart, onContinue, onImport, ready}: HomeProps) {
  const hasPractice=practice.wires.length>0||practice.steps.length>0||!!practice.learning||!!practice.assessment;
  return <section className="home-view modo-home" aria-label="Inicio de modo.">
    <div className="modo-workspace">
      <div className="modo-intro">
        <div>
          <p className="modo-eyebrow">AUTOMATIZACIÓN · ROBÓTICA · APRENDIZAJE</p>
          <h1>Tu espacio<br className="modo-title-break"/> de trabajo<span>.</span></h1>
          <p className="modo-intro-description">Estudia una materia, conecta en el panel o experimenta en el laboratorio.</p>
        </div>
        <nav className="modo-home-shortcuts" aria-label="Accesos principales"><a href="/estudio"><BookOpen size={17} aria-hidden="true"/>Estudio<ArrowRight size={16} aria-hidden="true"/></a><a href="#panel-heading"><Plug size={17} aria-hidden="true"/>Panel de control</a><a href="/laboratorio"><FlaskConical size={17} aria-hidden="true"/>Laboratorio</a></nav>
      </div>
      <article className="modo-card modo-panel" aria-labelledby="panel-heading">
        <img className="modo-card-photo" src="/images/modo/bornes.webp" srcSet="/images/modo/bornes-640.webp 640w, /images/modo/bornes-1024.webp 1024w, /images/modo/bornes.webp 1536w" sizes="(max-width: 760px) calc(100vw - 24px), 56vw" alt="" width="1536" height="1024" fetchPriority="high"/>
        <div className="modo-card-heading">
          <span className="modo-module-icon"><Plug aria-hidden="true"/></span>
          <div><p className="modo-eyebrow">01 / CONECTA Y COMPRUEBA</p><h2 id="panel-heading" tabIndex={-1}>Panel de control</h2><p>Conecta cables, interpreta diagramas y comprueba tus conexiones.</p></div>
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
          <img className="modo-card-photo" src="/images/modo/protecciones.webp" srcSet="/images/modo/protecciones-640.webp 640w, /images/modo/protecciones-1024.webp 1024w, /images/modo/protecciones.webp 1536w" sizes="(max-width: 760px) calc(100vw - 24px), 38vw" alt="" width="1536" height="1024" decoding="async"/>
          <div className="modo-card-heading"><span className="modo-module-icon"><BookOpen aria-hidden="true"/></span><div><p className="modo-eyebrow">02 / ENTIENDE LA MATERIA</p><h2 id="study-heading">Estudio</h2><p>Tu material de clase, explicado. Elige un ramo, entiende la materia y ponla en práctica.</p></div></div>
          <span className="modo-round-arrow" aria-hidden="true"><ArrowRight size={25}/></span>
        </a>
        <HomeTools/>
      </div>
    </div>
    <div className="modo-card modo-recent">
      <span className="modo-module-icon"><Clock3 aria-hidden="true"/></span>
      <div className="modo-recent-copy"><p className="modo-eyebrow">{hasPractice?'RETOMA DONDE QUEDASTE':'TU PRÓXIMO PASO'}</p><h2>{hasPractice?'Tu práctica actual':'Empieza a practicar'}</h2><p>{hasPractice?`${practice.wires.length} cables · ${practice.steps.length} pasos`:'Elige una actividad o abre una práctica guardada.'}</p></div>
      <div className="modo-recent-actions">
        <button className="modo-continue" disabled={!ready} onClick={onContinue}><Play size={22} aria-hidden="true"/><span className="modo-continue-desktop">{hasPractice?'Continuar práctica':'Empezar práctica'}</span><span className="modo-continue-mobile">{hasPractice?'Continuar':'Empezar'}</span><ArrowRight className="modo-continue-mobile" size={22} aria-hidden="true"/></button>
        <label className="modo-import"><FolderOpen size={23} aria-hidden="true"/><span>Abrir práctica guardada</span><input type="file" aria-label="Abrir práctica guardada" accept="application/json,.json" disabled={!ready} onChange={event => {
          if (event.target.files?.[0]) onImport(event.target.files[0]);
          event.target.value = '';
        }}/></label>
      </div>
    </div>
    <CommunityCard/>
    <footer className="humano-credit" aria-label="Créditos de Humano Lab">
      <p><strong>Una iniciativa de Humano Lab.</strong><br/>Creación y dirección: Félix Levancini · Jefe del laboratorio.</p>
      <p>© 2026 Humano Lab · Aportes originales.<br/><a href="/legal/" target="_blank" rel="noopener noreferrer">Uso educativo, privacidad y créditos ↗</a></p>
      <div className="install-row"><InstallApp/></div>
    </footer>
  </section>;
}
