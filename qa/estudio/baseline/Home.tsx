import {ArrowRight,FolderOpen,Play} from 'lucide-react';
import {CLASS_DIAGRAMS,type PracticeDocument,type StudyMode} from '../data/practice';
export function Home({practice,onStart,onContinue,onImport,ready}:{practice:PracticeDocument;onStart:(mode:StudyMode,diagramId:string)=>void;onContinue:()=>void;onImport:(file:File)=>void;ready:boolean}){
 return <section className="home-view home-v2" aria-label="Inicio de PanelLab">
  <div className="eyebrow">MÁQUINAS ROTATORIAS · INACAP</div>
  <h1>Practica en el banco<span className="header-period">.</span></h1>
  <p>Conecta cables o aprende a reconocer los bornes.</p>
  <form className="home-options" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);onStart(data.get('mode') as StudyMode,String(data.get('diagram')))}}>
   <label htmlFor="learning-mode">Modo de aprendizaje</label>
   <select id="learning-mode" name="mode" defaultValue="free"><option value="free">Práctica libre · conectar cables</option><option value="identify">Reconocimiento guiado · 9 retos con fotografías</option><option value="guided">Leer diagramas · líneas, símbolos y práctica</option><option value="explore">Explorar componentes</option></select>
   <details className="disclosure home-reference"><summary>Añadir un diagrama · opcional</summary><label htmlFor="circuit">Material de estudio</label>
   <select id="circuit" name="diagram" defaultValue={practice.diagram?.origin==='class_photo'?practice.diagram.id:'none'}><option value="none">Sin diagrama · cargar mi imagen en el simulador</option>{CLASS_DIAGRAMS.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select>
   <small>Puedes usar una foto de clase o cargar tu imagen dentro de la práctica.</small></details>
   <button className="primary-action" disabled={!ready} type="submit">Empezar práctica <ArrowRight size={17}/></button>
  </form>
  <div className="continue-practice"><div><h2>Tu última práctica</h2><p>{practice.wires.length} cables · {practice.steps.length} pasos</p></div><button className="primary-action" disabled={!ready} onClick={onContinue}><Play size={16}/> Continuar práctica</button></div>
  <label className="import-practice"><FolderOpen size={17}/> Abrir una práctica guardada<input type="file" accept="application/json,.json" onChange={e=>{if(e.target.files?.[0])onImport(e.target.files[0]);e.target.value=''}}/></label>
 </section>;
}
