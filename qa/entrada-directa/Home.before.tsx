import {useEffect, useRef, useState} from 'react';
import {ArrowRight, ArrowUpRight, BookOpen, ChevronDown, Clock3, FlaskConical, FolderOpen, GitBranch, Info, Play, Plug, Plus, UsersRound, X} from 'lucide-react';
import {InstallApp} from './InstallApp';
import {CLASS_DIAGRAMS, type PracticeDocument, type StudyMode} from '../data/practice';
import '../styles/modo-home.css';
import '../styles/modo-home-refinement.css';
import '../styles/modo-launchpad.css';

type HomeProps = {
  practice: PracticeDocument;
  onStart: (mode: StudyMode, diagramId: string) => void;
  onContinue: () => void;
  onImport: (file: File) => void;
  ready: boolean;
};
const spaces = [
  {id:'panel', number:'01', name:'Panel de control', subtitle:'CABLEADO Y MANIOBRAS', description:'Conexión de bornes, lectura de esquemas y comprobación de circuitos de mando.', action:'Preparar una práctica', preview:'Trabaja sobre el banco virtual: conecta bornes, interpreta un diagrama y revisa el circuito de mando mientras practicas.', features:['Conexión de bornes','Diagramas de clase','Práctica guiada'], image:'bornes', Icon:Plug, href:''},
  {id:'study', number:'02', name:'Estudio', subtitle:'FUNDAMENTOS Y DIAGRAMAS', description:'Material de clase, conceptos eléctricos y ejercicios aplicados a la automatización.', action:'Elegir una materia', preview:'Consulta el material de tus ramos, recorre las explicaciones y pasa de los ejemplos a los ejercicios a tu propio ritmo.', features:['Materias por ramo','Ejemplos paso a paso','Ejercicios y repaso'], image:'protecciones', Icon:BookOpen, href:'/estudio'},
  {id:'lab', number:'03', name:'Laboratorio', subtitle:'AUTOMATIZACIÓN E INSTRUMENTACIÓN', description:'Herramientas de PLC, electrónica, medición y simulación de procesos.', action:'Explorar herramientas', preview:'Diseña esquemas, programa un PLC virtual o explora electrónica e instrumentación con las herramientas del laboratorio.', features:['Esquemas, PLC y HMI','Protoboard y procesos','Medición y GeoGebra'], image:'laboratorio', Icon:FlaskConical, href:'/laboratorio'},
];

export function Home({practice, onStart, onContinue, onImport, ready}: HomeProps) {
  const hasPractice=practice.wires.length>0||practice.steps.length>0||!!practice.learning||!!practice.assessment;
  const [panelOpen,setPanelOpen]=useState(false);
  const [previewId,setPreviewId]=useState<string|null>(null);
  const [leavingIds,setLeavingIds]=useState<string[]>([]);
  const currentPreview=useRef<string|null>(null);
  const exitTimers=useRef(new Map<string,ReturnType<typeof setTimeout>>());
  const changePreview=(next:string|null)=>{
    const previous=currentPreview.current;
    if(previous===next)return;
    currentPreview.current=next;
    if(next){const pending=exitTimers.current.get(next);if(pending)clearTimeout(pending);exitTimers.current.delete(next);}
    const reduced=document.documentElement.classList.contains('modo-reduced')||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced){for(const timer of exitTimers.current.values())clearTimeout(timer);exitTimers.current.clear();setLeavingIds([]);}
    else{
      setLeavingIds(ids=>{const remaining=ids.filter(id=>id!==next&&id!==previous);return previous?[...remaining,previous]:remaining;});
      if(previous){
        const pending=exitTimers.current.get(previous);if(pending)clearTimeout(pending);
        exitTimers.current.set(previous,setTimeout(()=>{exitTimers.current.delete(previous);setLeavingIds(ids=>ids.filter(id=>id!==previous));},280));
      }
    }
    setPreviewId(next);
  };
  const previewDismissed=useRef(false);
  const hoverTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const stopHover=()=>{if(hoverTimer.current!==null)clearTimeout(hoverTimer.current);hoverTimer.current=null;};
  useEffect(()=>()=>{if(hoverTimer.current!==null)clearTimeout(hoverTimer.current);for(const timer of exitTimers.current.values())clearTimeout(timer);exitTimers.current.clear();},[]);
  const closePreview=()=>{stopHover();previewDismissed.current=true;changePreview(null);};
  const setupHeading=useRef<HTMLHeadingElement>(null);
  const panelButton=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(panelOpen)setupHeading.current?.focus();},[panelOpen]);
  const openPanel=()=>{stopHover();changePreview(null);setPanelOpen(true);};
  const closeSetup=()=>{setPanelOpen(false);panelButton.current?.focus();};
  return <section className="home-view modo-home modo-launchpad" aria-label="Inicio de modo.">
    <header className="launch-intro">
      <h1><span>Laboratorio</span><span>eléctrico.</span></h1>
      <p>Control y automatización, en práctica.</p>
    </header>

    {hasPractice&&<section className="launch-resume" aria-labelledby="launch-resume-heading">
      <span className="launch-resume-icon"><Clock3 size={22} aria-hidden="true"/></span>
      <div><p className="launch-eyebrow">RETOMA DONDE QUEDASTE</p><h2 id="launch-resume-heading">Tu práctica actual</h2><p>{practice.wires.length} {practice.wires.length===1?'cable':'cables'} · {practice.steps.length} {practice.steps.length===1?'paso':'pasos'} · guardado local</p></div>
      <button type="button" className="launch-solid" disabled={!ready} onClick={onContinue}><Play size={16} aria-hidden="true"/>Continuar práctica<ArrowRight size={17} aria-hidden="true"/></button>
    </section>}

    <nav className={`launch-spaces${previewId?' has-preview':''}`} aria-label="Elige tu espacio de trabajo" onPointerLeave={event=>{stopHover();previewDismissed.current=false;if(event.pointerType==='mouse'&&!event.currentTarget.contains(document.activeElement))changePreview(null);}} onBlurCapture={event=>{if(event.relatedTarget&&!event.currentTarget.contains(event.relatedTarget as Node|null))changePreview(null);}} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();closePreview();}}}>
      {spaces.map(({id,number,name,subtitle,description,action,preview,features,image,Icon,href})=>{
        const active=previewId===id;
        const leaving=leavingIds.includes(id);
        const content=<><span className="launch-entry-top"><img className="launch-entry-photo" src={`/images/modo/${image}-640.webp`} srcSet={`/images/modo/${image}-640.webp 640w, /images/modo/${image}-1024.webp 1024w`} sizes="(max-width:600px) 260px, (max-width:1100px) 320px, 380px" alt="" width="640" height="427" decoding="async"/><span className="launch-entry-icon"><Icon size={26} strokeWidth={1.6} aria-hidden="true"/></span><span className="launch-entry-number" aria-hidden="true">{number}</span></span><span className="launch-entry-copy"><span className="launch-eyebrow">{subtitle}</span><strong>{name}</strong><span>{description}</span></span><span className="launch-entry-action">{action}<ArrowRight size={19} aria-hidden="true"/></span></>;
        return <div key={id} className={`launch-space${active||leaving?' is-previewed':''}${leaving&&!active?' is-returning':''}`} onPointerEnter={event=>{if(!previewDismissed.current&&event.pointerType==='mouse'&&window.matchMedia('(hover:hover) and (pointer:fine)').matches){stopHover();hoverTimer.current=setTimeout(()=>{hoverTimer.current=null;changePreview(id);},140);}}} onFocusCapture={event=>{if(!previewDismissed.current&&(event.target as HTMLElement).matches(':focus-visible')&&window.matchMedia('(hover:hover) and (pointer:fine)').matches&&!event.currentTarget.contains(event.relatedTarget as Node|null))changePreview(id);}}>
          {id==='panel'?<button ref={panelButton} type="button" disabled={!ready} className={`launch-entry${panelOpen?' is-selected':''}`} aria-expanded={panelOpen} aria-controls="home-panel-setup" onClick={()=>panelOpen?closeSetup():openPanel()}>{content}</button>:<a className="launch-entry" href={href}>{content}</a>}
          <button type="button" className="launch-peek-toggle" aria-label={`${active?'Ocultar':'Ver'} contenido de ${name}`} aria-expanded={active} aria-controls={active?`launch-preview-${id}`:undefined} onClick={()=>changePreview(active?null:id)}><Info size={19} aria-hidden="true"/></button>
          {(active||leaving)&&<section id={`launch-preview-${id}`} className={`launch-preview${leaving&&!active?' is-leaving':''}`} inert={leaving&&!active} aria-hidden={leaving&&!active?true:undefined} aria-label={`Vista de ${name}`}>
            {(()=>{
              const expanded=<><span className="launch-preview-visual"><img src={`/images/preview-home/${id}.jpg`} alt={`Vista de la interfaz de ${name}`} width="1280" height="800" decoding="async"/><span className="launch-preview-visual-label"><Icon size={16} aria-hidden="true"/>{name}</span></span><span className="launch-preview-copy"><span className="launch-eyebrow">{number} / {subtitle}</span><strong className="launch-preview-title">{name}</strong><span className="launch-preview-description">{preview}</span><span className="launch-preview-features">{features.map(feature=><span key={feature}>{feature}</span>)}</span><span className="launch-solid">{action}<ArrowRight size={18} aria-hidden="true"/></span></span></>;
              return id==='panel'?<button type="button" className="launch-preview-main" disabled={!ready} onClick={openPanel}>{expanded}</button>:<a className="launch-preview-main" href={href}>{expanded}</a>;
            })()}
            <button type="button" className="launch-preview-close" aria-label={`Cerrar vista de ${name}`} onClick={closePreview}><X size={18} aria-hidden="true"/></button>
          </section>}
        </div>;
      })}
    </nav>

    {panelOpen&&<section id="home-panel-setup" className="launch-setup" aria-labelledby="panel-heading">
      <div className="launch-setup-heading"><div><p className="launch-eyebrow">PREPARA TU ESPACIO</p><h2 id="panel-heading" ref={setupHeading} tabIndex={-1}>Panel de control</h2><p>Elige cómo quieres practicar. Puedes añadir un diagrama si lo necesitas.</p></div><button type="button" className="launch-close" onClick={closeSetup} aria-label="Cerrar configuración del panel"><X size={20}/></button></div>
      <form className="launch-panel-form" onSubmit={event=>{
        event.preventDefault();const data=new FormData(event.currentTarget);
        onStart(data.get('mode') as StudyMode,String(data.get('diagram')));
      }}>
        <div className="launch-fields"><label htmlFor="learning-mode">Modo de aprendizaje</label><div className="launch-select"><GitBranch size={19} aria-hidden="true"/><select id="learning-mode" name="mode" defaultValue="free">
          <option value="free">Práctica libre · conectar cables</option><option value="identify">Reconocimiento guiado · 9 retos con fotografías</option><option value="guided">Leer diagramas · líneas, símbolos y práctica</option><option value="explore">Explorar componentes</option>
        </select><ChevronDown size={17} aria-hidden="true"/></div>
        <details className="launch-diagram"><summary><Plus size={18} aria-hidden="true"/>Añadir un diagrama <span>· opcional</span></summary><div><label htmlFor="circuit">Material de estudio</label><select id="circuit" name="diagram" defaultValue={practice.diagram?.origin==='class_photo'?practice.diagram.id:'none'}><option value="none">Sin diagrama · cargar mi imagen en el simulador</option>{CLASS_DIAGRAMS.map(diagram=><option key={diagram.id} value={diagram.id}>{diagram.name}</option>)}</select><small>También puedes cargar una imagen dentro de la práctica.</small></div></details></div>
        <button type="submit" className="launch-solid launch-start" disabled={!ready}>Abrir panel de control<ArrowRight size={18} aria-hidden="true"/></button>
      </form>
    </section>}

    <div className="launch-utilities"><label className={`launch-import${!ready?' is-disabled':''}`}><FolderOpen size={18} aria-hidden="true"/><span>Abrir práctica guardada</span><input type="file" aria-label="Abrir práctica guardada" accept="application/json,.json" disabled={!ready} onChange={event=>{if(event.target.files?.[0])onImport(event.target.files[0]);event.target.value='';}}/></label><a href="/comunidad/"><UsersRound size={18} aria-hidden="true"/>Comunidad<ArrowUpRight size={15} aria-hidden="true"/></a></div>
    <footer className="launch-footer" aria-label="Créditos de Humano Lab"><div><p><strong>Una iniciativa de Humano Lab.</strong><br/>Creación y dirección: Félix Levancini · Jefe del laboratorio.</p><p>© 2026 Humano Lab · Aportes originales.</p></div><div className="launch-footer-links"><a href="/legal/" target="_blank" rel="noopener noreferrer">Uso educativo, privacidad y créditos<ArrowUpRight size={14} aria-hidden="true"/></a><InstallApp/></div></footer>
  </section>;
}
