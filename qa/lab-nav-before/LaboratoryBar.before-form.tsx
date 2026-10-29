import {useState} from 'react';
import {BookOpen,Check,Copy,Download,FilePlus2,Home,Layers,MoreHorizontal,Pause,Play} from 'lucide-react';
import {FloatingWindow} from '../components/FloatingWindow';
import {LegalLink} from '../components/LegalLink';
import {TutorialHelp} from '../components/TutorialHelp';
import {TOOLS,TOOL_GROUPS,type Tool} from './model';
const ToolOptions=()=>{const grouped=TOOL_GROUPS.flatMap(g=>g.tools);return <>{TOOLS.filter(t=>!grouped.includes(t.id)&&TOOLS.indexOf(t)<TOOLS.findIndex(x=>x.id===TOOL_GROUPS[0].tools[0])).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}{TOOL_GROUPS.map(g=><optgroup key={g.id} label={g.name}>{g.tools.map(id=>TOOLS.find(t=>t.id===id)!).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</optgroup>)}{TOOLS.filter(t=>!grouped.includes(t.id)&&TOOLS.indexOf(t)>TOOLS.findIndex(x=>x.id===TOOL_GROUPS[0].tools[0])).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</>;};
import type {Laboratory} from './useLaboratory';
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
  {projectOpen&&<FloatingWindow title="Mi proyecto" width={400} side="right" className="lab-project-window" closeLabel="Cerrar opciones del proyecto" onClose={()=>setProjectOpen(false)}><div className="lab-project-settings">
   <label>Nombre del proyecto<input aria-label="Nombre del proyecto" disabled={lab.running||!lab.ready} value={lab.project.name} maxLength={100} onChange={e=>lab.update(p=>({...p,name:e.target.value}))}/></label>
   <label>Proyecto activo<select aria-label="Proyecto activo" disabled={!lab.ready||lab.running} value={lab.project.id} onChange={e=>lab.select(e.target.value)}>{lab.projects.map(p=><option key={p.id} value={p.id}>{p.name||'Sin nombre'}</option>)}</select></label>
   <span className="lab-project-save" role="status">{lab.saved&&<Check size={14}/>} {!lab.ready?'Abriendo biblioteca…':lab.storageBlocked?'Guardado desactivado':lab.saved?'Guardado en este navegador':'Guardando…'}</span>
   <div className="lab-project-actions"><button disabled={lab.running||!lab.ready} onClick={()=>example('blank')}><FilePlus2 size={16}/>Nuevo proyecto vacío</button><button disabled={lab.running||!lab.ready||lab.projects.length>=30} onClick={()=>{lab.duplicate();setProjectOpen(false)}}><Copy size={16}/>Duplicar proyecto</button><button onClick={lab.exportProject}><Download size={16}/>Exportar proyecto</button><label className={`lab-project-import ${lab.running?'disabled':''}`}>Importar proyecto<input aria-label="Importar proyecto" type="file" accept=".json,application/json" disabled={lab.running} onChange={e=>{const file=e.target.files?.[0];if(file)void lab.importProject(file);e.target.value='';setProjectOpen(false)}}/></label></div>
   <fieldset className="lab-project-examples"><legend>Ejemplos para practicar</legend><button disabled={lab.running||!lab.ready} onClick={()=>example('motor','schematic')}>Marcha y retención</button><button disabled={lab.running||!lab.ready} onClick={()=>example('tank','process')}>Llenado automático</button><button disabled={lab.running||!lab.ready} onClick={()=>example('hbridge','breadboard')}>Puente H con L293D</button><button disabled={lab.running||!lab.ready} onClick={()=>example('hbridge-bjt','breadboard')}>Puente H con transistores</button></fieldset>
   <label>Velocidad de simulación<select aria-label="Velocidad de simulación" value={lab.speed} onChange={e=>lab.setSpeed(Number(e.target.value))}>{[.2,.5,1,2,5].map(s=><option key={s} value={s}>×{s}</option>)}</select></label>
   <nav className="lab-project-links" aria-label="Más espacios"><a href="/?view=simulator">Panel de práctica</a><a href="/estudio"><BookOpen size={15}/>Estudio</a><button onClick={()=>{setProjectOpen(false);onHelp()}}><Layers size={15}/>Cómo se conectan</button><LegalLink/></nav>
  </div></FloatingWindow>}
 </>;
}
