import {useEffect, useRef, useState} from 'react';
import {ArrowRight, ArrowUpRight, BookOpen, Clock3, FlaskConical, FolderOpen, Play, Plug, UsersRound, X} from 'lucide-react';
import {InstallApp} from './InstallApp';
import type {PracticeDocument} from '../data/practice';
import {APP_VERSION} from '../data/releases';
import '../styles/modo-home.css';
import '../styles/modo-home-refinement.css';
import '../styles/modo-launchpad.css';

type HomeProps = {
  practice: PracticeDocument;
  onEnterPanel: () => void;
  onContinue: () => void;
  onImport: (file: File) => void;
  ready: boolean;
};
const spaces = [
  {id:'panel', number:'01', name:'Panel de control', subtitle:'CABLEADO Y MANIOBRAS', description:'Conexión de bornes, lectura de esquemas y comprobación de circuitos de mando.', action:'Entrar al panel', image:'bornes', Icon:Plug, href:''},
  {id:'study', number:'02', name:'Estudio', subtitle:'FUNDAMENTOS Y DIAGRAMAS', description:'Material de clase, conceptos eléctricos y ejercicios aplicados a la automatización.', action:'Entrar a Estudio', image:'protecciones', Icon:BookOpen, href:'/estudio'},
  {id:'lab', number:'03', name:'Laboratorio', subtitle:'AUTOMATIZACIÓN E INSTRUMENTACIÓN', description:'Herramientas de PLC, electrónica, medición y simulación de procesos.', action:'Entrar al laboratorio', image:'laboratorio', Icon:FlaskConical, href:'/laboratorio'},
];

export function Home({practice, onEnterPanel, onContinue, onImport, ready}: HomeProps) {
  const hasPractice=practice.wires.length>0||practice.steps.length>0||!!practice.learning||!!practice.assessment;
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
  const openPanel=()=>{stopHover();onEnterPanel();};
  const touchPreview=()=>window.matchMedia('(hover:none), (pointer:coarse)').matches;
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
      {spaces.map(({id,number,name,subtitle,description,action,image,Icon,href})=>{
        const active=previewId===id;
        const leaving=leavingIds.includes(id);
        const content=<><span className="launch-entry-top"><img className="launch-entry-photo" src={`/images/modo/${image}-640.webp`} srcSet={`/images/modo/${image}-640.webp 640w, /images/modo/${image}-1024.webp 1024w`} sizes="(max-width:600px) 260px, (max-width:1100px) 320px, 380px" alt="" width="640" height="427" decoding="async"/><span className="launch-entry-icon"><Icon size={26} strokeWidth={1.6} aria-hidden="true"/></span><span className="launch-entry-number" aria-hidden="true">{number}</span></span><span className="launch-entry-copy"><span className="launch-eyebrow">{subtitle}</span><strong>{name}</strong><span>{description}</span></span><span className="launch-entry-action"><span className="launch-entry-desktop-action">{action}</span><span className="launch-entry-touch-action">Ver contenido</span><ArrowRight size={19} aria-hidden="true"/></span></>;
        return <div key={id} className={`launch-space${active||leaving?' is-previewed':''}${leaving&&!active?' is-returning':''}`} onPointerEnter={event=>{if(!previewDismissed.current&&event.pointerType==='mouse'&&window.matchMedia('(hover:hover) and (pointer:fine)').matches){stopHover();hoverTimer.current=setTimeout(()=>{hoverTimer.current=null;changePreview(id);},140);}}} onFocusCapture={event=>{if(!previewDismissed.current&&(event.target as HTMLElement).matches(':focus-visible')&&window.matchMedia('(hover:hover) and (pointer:fine)').matches&&!event.currentTarget.contains(event.relatedTarget as Node|null))changePreview(id);}}>
          {id==='panel'?<button type="button" disabled={!ready} className="launch-entry" aria-expanded={active} aria-controls={active?`launch-preview-${id}`:undefined} onClick={()=>{if(touchPreview())changePreview(id);else openPanel();}}>{content}</button>:<a className="launch-entry" href={href} aria-expanded={active} aria-controls={active?`launch-preview-${id}`:undefined} onClick={event=>{if(touchPreview()){event.preventDefault();changePreview(id);}}}>{content}</a>}
          {(active||leaving)&&<section id={`launch-preview-${id}`} className={`launch-preview${leaving&&!active?' is-leaving':''}`} inert={leaving&&!active} aria-hidden={leaving&&!active?true:undefined} aria-label={`Vista de ${name}`}>
            <div className="launch-preview-main"><span className="launch-preview-visual"><img src={`/images/preview-home/${id}.jpg`} alt={`Vista de la interfaz de ${name}`} width="1280" height="800" decoding="async"/><span className="launch-preview-visual-label"><Icon size={16} aria-hidden="true"/>{name}</span></span><div className="launch-preview-copy">
              {id==='panel'?<button type="button" className="launch-solid" disabled={!ready} onClick={openPanel}>{action}<ArrowRight size={18} aria-hidden="true"/></button>:<a className="launch-solid" href={href}>{action}<ArrowRight size={18} aria-hidden="true"/></a>}
            </div></div>
            <button type="button" className="launch-preview-close" aria-label={`Cerrar vista de ${name}`} onClick={closePreview}><X size={18} aria-hidden="true"/></button>
          </section>}
        </div>;
      })}
    </nav>

    <div className="launch-utilities"><label className={`launch-import${!ready?' is-disabled':''}`}><FolderOpen size={18} aria-hidden="true"/><span>Abrir práctica guardada</span><input type="file" aria-label="Abrir práctica guardada" accept="application/json,.json" disabled={!ready} onChange={event=>{if(event.target.files?.[0])onImport(event.target.files[0]);event.target.value='';}}/></label><a href="/comunidad/"><UsersRound size={18} aria-hidden="true"/>Comunidad<ArrowUpRight size={15} aria-hidden="true"/></a></div>
    <footer className="launch-footer" aria-label="Créditos de Humano Lab"><div><p><strong>Una iniciativa de Humano Lab.</strong><br/>Creación y dirección: Félix Levancini · Jefe del laboratorio.</p><p>© 2026 Humano Lab · Aportes originales.</p></div><div className="launch-footer-links"><a href="/legal/" target="_blank" rel="noopener noreferrer">Uso educativo, privacidad y créditos<ArrowUpRight size={14} aria-hidden="true"/></a><a href="/versiones/" aria-label={`Ver cambios de la versión ${APP_VERSION}`}>Versión {APP_VERSION}</a><InstallApp/></div></footer>
  </section>;
}
