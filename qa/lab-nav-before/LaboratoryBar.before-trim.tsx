import {useState,type ReactNode} from 'react';
import {BookOpen,Check,CircuitBoard,Copy,Cpu,Download,Droplets,FilePlus2,Home,Layers,MoreHorizontal,Pause,Play,Upload,Zap} from 'lucide-react';
import '../styles/project-form.css';
import {FloatingWindow} from '../components/FloatingWindow';
import {LegalLink} from '../components/LegalLink';
import {TutorialHelp} from '../components/TutorialHelp';
import {TOOLS,TOOL_GROUPS,type Tool} from './model';
const ToolOptions=()=>{const grouped=TOOL_GROUPS.flatMap(g=>g.tools);return <>{TOOLS.filter(t=>!grouped.includes(t.id)&&TOOLS.indexOf(t)<TOOLS.findIndex(x=>x.id===TOOL_GROUPS[0].tools[0])).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}{TOOL_GROUPS.map(g=><optgroup key={g.id} label={g.name}>{g.tools.map(id=>TOOLS.find(t=>t.id===id)!).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</optgroup>)}{TOOLS.filter(t=>!grouped.includes(t.id)&&TOOLS.indexOf(t)>TOOLS.findIndex(x=>x.id===TOOL_GROUPS[0].tools[0])).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</>;};
import type {Laboratory} from './useLaboratory';
const EXAMPLES:{kind:Parameters<Laboratory['add']>[0];next:Tool;label:string;hint:string;icon:ReactNode;first?:boolean}[]=[{kind:'motor',next:'schematic',label:'Marcha y retención',hint:'Un motor que arranca y para con dos botones',icon:<Zap size={18}/>,first:true},{kind:'tank',next:'process',label:'Llenado automático',hint:'Un tanque que se llena solo',icon:<Droplets size={18}/>},{kind:'hbridge',next:'breadboard',label:'Puente H con L293D',hint:'Cambia el giro de un motor con un chip',icon:<CircuitBoard size={18}/>},{kind:'hbridge-bjt',next:'breadboard',label:'Puente H con transistores',hint:'La misma idea, con transistores',icon:<Cpu size={18}/>}];
export function LaboratoryBar({lab,tool,onTool,onHelp}:{lab:Laboratory;tool:Tool;onTool:(tool:Tool)=>void;onHelp:()=>void}){
 const [projectOpen,setProjectOpen]=useState(false);
 const example=(kind:Parameters<Laboratory['add']>[0],next?:Tool)=>{lab.add(kind);if(next)onTool(next);setProjectOpen(false)};
 if(tool==='geogebra'||tool==='temperature'||tool==='detectors'||tool==='soldering')return <header className="compact-bar lab-compact-bar" aria-label="Laboratorio"><a href="/" aria-label="Inicio"><Home size={20}/></a><label className="lab-compact-tool"><span className="lab-sr-only">Herramienta del laboratorio</span><select aria-label="Herramienta del laboratorio" value={tool} onChange={e=>onTool(e.target.value as Tool)}><ToolOptions/></select></label><a href="/estudio"><BookOpen size={18}/>Estudio</a></header>;
 return <>
  <header className="compact-bar lab-compact-bar" aria-label="Laboratorio">
   <a href="/" aria-label="Inicio"><Home size={20}/></a>
   <label className="lab-compact-tool"><span className="lab-sr-only">Herramienta del laboratorio</span><select aria-label="Herramienta del laboratorio" value={tool} onChange={e=>onTool(e.target.value as Tool)}><ToolOptions/></select></label>
   <span className="lab-compact-project" title={lab.project.name}>{lab.project.name}</span>
   <button type="button" className={`lab-compact-run ${lab.running?'running':''}`} aria-label={lab.running?'Detener':'Simular proyecto'} aria-pressed={lab.running} disabled={!lab.ready} onClick={()=>{if(lab.running)lab.stop();else if(!lab.start())onTool('plc')}}>{lab.running?<Pause size={19}/>:<Play size={19}/>}<span>{lab.running?'Detener':'Simular'}</span></button>
   <TutorialHelp context="laboratory"/>
   <button type="button" aria-label="Opciones del proyecto" aria-haspopup="dialog" aria-expanded={projectOpen} onClick={()=>setProjectOpen(true)}><MoreHorizontal size={22}/></button>
  </header>
  {projectOpen&&<FloatingWindow title="Mi proyecto" width={400} side="right" className="lab-project-window" closeLabel="Cerrar opciones del proyecto" onClose={()=>setProjectOpen(false)}><div className="lab-project-settings lab-pf">
   <section className="lab-pf-section" aria-label="Tu proyecto"><label>Nombre del proyecto<input aria-label="Nombre del proyecto" disabled={lab.running||!lab.ready} value={lab.project.name} maxLength={100} onChange={e=>lab.update(p=>({...p,name:e.target.value}))}/></label>
    <span className="lab-project-save" role="status">{lab.saved&&<Check size={14}/>} {!lab.ready?'Abriendo biblioteca…':lab.storageBlocked?'Guardado desactivado':lab.saved?'Guardado en este navegador':'Guardando…'}</span></section>
   <fieldset className="lab-project-examples lab-pf-section"><legend>Ejemplos para practicar</legend><p className="lab-pf-help">Elige uno y se abre listo para probar.</p>
    <div className="lab-pf-cards">{EXAMPLES.map(e=><button key={e.label} aria-label={e.label} disabled={lab.running||!lab.ready} onClick={()=>example(e.kind,e.next)}><span className="lab-pf-icon" aria-hidden="true">{e.icon}</span><span className="lab-pf-text"><strong>{e.label}</strong><small>{e.hint}</small></span>{e.first?<span className="lab-pf-tag" aria-hidden="true">Para empezar</span>:null}</button>)}</div>
    <button className="lab-pf-row" aria-label="Nuevo proyecto vacío" disabled={lab.running||!lab.ready} onClick={()=>example('blank')}><span className="lab-pf-icon" aria-hidden="true"><FilePlus2 size={18}/></span><span className="lab-pf-text"><strong>Nuevo proyecto vacío</strong><small>Empieza desde cero</small></span></button></fieldset>
   <section className="lab-project-actions lab-pf-section" aria-label="Guardar y compartir"><h3>Guardar y compartir</h3>
    <button className="lab-pf-row" aria-label="Duplicar proyecto" disabled={lab.running||!lab.ready||lab.projects.length>=30} onClick={()=>{lab.duplicate();setProjectOpen(false)}}><span className="lab-pf-icon" aria-hidden="true"><Copy size={18}/></span><span className="lab-pf-text"><strong>Duplicar proyecto</strong><small>Haz una copia para probar sin riesgo</small></span></button>
    <button className="lab-pf-row" aria-label="Exportar proyecto" onClick={lab.exportProject}><span className="lab-pf-icon" aria-hidden="true"><Download size={18}/></span><span className="lab-pf-text"><strong>Exportar proyecto</strong><small>Descárgalo para guardarlo o enviarlo</small></span></button>
    <label className={`lab-project-import lab-pf-row ${lab.running?'disabled':''}`}><span className="lab-pf-icon" aria-hidden="true"><Upload size={18}/></span><span className="lab-pf-text"><strong>Importar proyecto</strong><small>Abre un archivo que descargaste</small></span><input aria-label="Importar proyecto" type="file" accept=".json,application/json" disabled={lab.running} onChange={e=>{const file=e.target.files?.[0];if(file)void lab.importProject(file);e.target.value='';setProjectOpen(false)}}/></label></section>
   <details className="lab-pf-more"><summary>Más opciones</summary>
    <label>Proyecto activo<select aria-label="Proyecto activo" disabled={!lab.ready||lab.running} value={lab.project.id} onChange={e=>lab.select(e.target.value)}>{lab.projects.map(p=><option key={p.id} value={p.id}>{p.name||'Sin nombre'}</option>)}</select></label>
    <label>Velocidad de simulación<select aria-label="Velocidad de simulación" value={lab.speed} onChange={e=>lab.setSpeed(Number(e.target.value))}>{[.2,.5,1,2,5].map(s=><option key={s} value={s}>×{s}</option>)}</select></label>
    <nav className="lab-project-links" aria-label="Más espacios"><a href="/?view=simulator">Panel de práctica</a><a href="/estudio"><BookOpen size={15}/>Estudio</a><button onClick={()=>{setProjectOpen(false);onHelp()}}><Layers size={15}/>Cómo se conectan</button><LegalLink/></nav></details>
  </div></FloatingWindow>}
 </>;
}
