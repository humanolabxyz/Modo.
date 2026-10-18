import {ArrowRight,FolderOpen,Play,BookOpen,Plug} from 'lucide-react';
import '../styles/study-home.css';
import {CLASS_DIAGRAMS,type PracticeDocument,type StudyMode} from '../data/practice';
export function Home({practice,onStart,onContinue,onImport,ready}:{practice:PracticeDocument;onStart:(mode:StudyMode,diagramId:string)=>void;onContinue:()=>void;onImport:(file:File)=>void;ready:boolean}){
 return <section className="home-view home-v2 home-modules" aria-label="Inicio de PanelLab">
  <div className="eyebrow">MÁQUINAS ROTATORIAS · INACAP</div>
  <h1>Practica en el banco<span className="header-period">.</span></h1>
  <p>Conecta cables o refuerza la teoría con protecciones eléctricas.</p>
  <div className="home-module-grid"><article className="home-module-card"><div className="home-module-heading"><Plug size={25}/><div><h2>Panel de práctica</h2><p>Conecta cables, reconoce bornes, utiliza diagramas y practica en el panel de máquinas rotatorias.</p></div></div>
  <form className="home-options" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);onStart(data.get('mode') as StudyMode,String(data.get('diagram')))}}>
   <label htmlFor="learning-mode">Modo de aprendizaje</label>
   <select id="learning-mode" name="mode" defaultValue="free"><option value="free">Práctica libre · conectar cables</option><option value="identify">Reconocimiento guiado · 9 retos con fotografías</option><option value="guided">Leer diagramas · líneas, símbolos y práctica</option><option value="explore">Explorar componentes</option></select>
   <details className="disclosure home-reference"><summary>Añadir un diagrama · opcional</summary><label htmlFor="circuit">Material de estudio</label>
   <select id="circuit" name="diagram" defaultValue={practice.diagram?.origin==='class_photo'?practice.diagram.id:'none'}><option value="none">Sin diagrama · cargar mi imagen en el simulador</option>{CLASS_DIAGRAMS.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select>
   <small>Puedes usar una foto de clase o cargar tu imagen dentro de la práctica.</small></details>
   <button className="primary-action" disabled={!ready} type="submit">Empezar práctica <ArrowRight size={17}/></button>
  </form>
  </article><article className="home-module-card"><div className="home-module-heading"><BookOpen size={25}/><div><h2>Estudiar protecciones</h2><p>Explora ocho temas con componentes, cálculos y ejercicios. Revisa tus errores y prepárate con simulacros.</p></div></div><div className="home-study-photos" aria-label="Componentes del material docente"><img src="/estudio/fotos/04_interruptor_termomagnetico.jpg" alt="Interruptor termomagnético del material docente"/><img src="/estudio/fotos/05_fusibles.jpg" alt="Fusibles del material docente"/></div><a className="home-study-link" href="/estudio"><BookOpen size={19}/> Entrar a estudiar <ArrowRight size={19}/></a></article></div>
  <div className="continue-practice"><div><h2>Tu última práctica</h2><p>{practice.wires.length} cables · {practice.steps.length} pasos</p></div><button className="primary-action" disabled={!ready} onClick={onContinue}><Play size={16}/> Continuar práctica</button></div>
  <label className="import-practice"><FolderOpen size={17}/> Abrir una práctica guardada<input type="file" accept="application/json,.json" onChange={e=>{if(e.target.files?.[0])onImport(e.target.files[0]);e.target.value=''}}/></label>
 </section>;
}
