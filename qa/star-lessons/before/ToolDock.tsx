import {useState} from 'react';
import {MousePointer2,Hand,Cable,Eraser,Trash2,Undo2,Redo2,GraduationCap,Eye,EyeOff,LogOut,ScanSearch,PlayCircle,ClipboardPenLine} from 'lucide-react';
import {CableColorPicker} from './CableColorPicker';
import {FloatingWindow} from './FloatingWindow';
export type BoardTool='inspect'|'pan'|'connect'|'erase';
/** Guías paso a paso disponibles desde el sombrero de la barra: lecciones armadas con circuitos reales y el reconocimiento de bornes. */
export type GuideLesson={key:string;title:string;steps:number;summary:string};
export type GuideDock={
 /** Hay una guía en marcha (lección o reconocimiento). */active:boolean;
 /** La ventana de la guía está abierta. */open:boolean;
 /** Nombre de lo que está en marcha, y su avance. */current?:{title:string;index:number;total:number;unit?:string};
 lessons:GuideLesson[];
 onToggle:()=>void;onLesson:(key:string)=>void;onAssessment:(key:string)=>void;onIdentify:()=>void;onExit:()=>void;
};
function GuideMenu({guide}:{guide:GuideDock}){
 const [open,setOpen]=useState(false);
 const run=(action:()=>void)=>()=>{action();setOpen(false)};
 return <div className="guide-menu">
  <button type="button" className={guide.active&&guide.open?'active':''} aria-label="Guía paso a paso" aria-haspopup="dialog" aria-expanded={open} aria-pressed={guide.active&&guide.open} title="Guía paso a paso" onClick={()=>setOpen(!open)}><GraduationCap size={21}/><span className="dock-tooltip">Guía paso a paso</span>{guide.active&&<i className="guide-dot" aria-hidden="true"/>}</button>
  {open&&<FloatingWindow title="Lecciones y práctica" onClose={()=>setOpen(false)} width={380} className="guide-picker-window" closeLabel="Cerrar lecciones y práctica"><div className="guide-menu-pop">
   {guide.active&&guide.current&&<section className="guide-menu-current" aria-label="Guía en marcha">
    <small>En marcha</small><strong>{guide.current.title}</strong>
    <div className="guide-menu-progress" role="img" aria-label={`Paso ${Math.min(guide.current.index+1,guide.current.total)} de ${guide.current.total}`}><i style={{width:`${Math.min(100,(guide.current.index/Math.max(1,guide.current.total))*100)}%`}}/></div>
    <span>{guide.current.unit??'Paso'} {Math.min(guide.current.index+(guide.current.unit?0:1),guide.current.total)} de {guide.current.total}</span>
    <div className="guide-menu-actions"><button type="button" onClick={run(guide.onToggle)}>{guide.open?<><EyeOff size={15}/>Ocultar ventana</>:<><Eye size={15}/>Mostrar ventana</>}</button><button type="button" onClick={run(guide.onExit)}><LogOut size={15}/>Salir de la guía</button></div>
   </section>}
   <small className="guide-menu-title">Lecciones con circuitos reales</small>
   {guide.lessons.map(l=><article key={l.key} className="guide-lesson-choice"><div className="guide-lesson-heading"><span className="guide-lesson-number">{l.key==='simple'?'01':'02'}</span><div><h4>{l.title}</h4><small>{l.steps} conexiones</small></div></div><p>{l.key==='simple'?'Arranque, retención y parada de un motor.':'Dos sentidos de giro con enclavamiento.'}</p><div className="guide-lesson-actions"><button type="button" className="guide-learn-start" aria-label={`Aprender: ${l.title}`} onClick={run(()=>guide.onLesson(l.key))}><PlayCircle size={16}/>Aprender</button><button type="button" className="guide-assessment-start" aria-label={l.key==='simple'?'Evaluarme: marcha y paro':'Evaluarme: inversión de giro'} onClick={run(()=>guide.onAssessment(l.key))}><ClipboardPenLine size={16}/>Armar y explicar</button></div></article>)}
   <span className="guide-replace-note">Al iniciar se vacía el banco. Deshacer recupera tu montaje.</span>
   <small className="guide-menu-title">Practicar</small>
   <button type="button" className="guide-menu-item" onClick={run(guide.onIdentify)}><ScanSearch size={18}/><span><b>Reconocer bornes</b><em>Nueve retos para encontrar bornes en el banco</em></span></button>
  </div></FloatingWindow>}
 </div>;
}
export function ToolDock({tool,onTool,canUndo,canRedo,onUndo,onRedo,selectedWire,onDelete,color,onColor,connectingDisabled=false,guide}:{tool:BoardTool;onTool:(t:BoardTool)=>void;canUndo:boolean;canRedo:boolean;onUndo:()=>void;onRedo:()=>void;selectedWire:boolean;onDelete:()=>void;color:string;onColor:(color:string)=>void;connectingDisabled?:boolean;guide?:GuideDock}){
 const tools=[{id:'inspect',label:'Seleccionar',key:'V',Icon:MousePointer2},{id:'pan',label:'Mover vista',key:'H',Icon:Hand},{id:'connect',label:'Conectar cables',key:'C',Icon:Cable},{id:'erase',label:'Retirar cables',key:'E',Icon:Eraser}] as const;
 return <div className="tool-dock" role="toolbar" aria-label="Herramientas del banco">
  {tools.map(({id,label,key,Icon})=><button key={id} type="button" className={tool===id?'active':''} aria-label={label} aria-pressed={tool===id} disabled={id==='connect'&&connectingDisabled} title={`${label} (${key})`} onClick={()=>onTool(id)}><Icon size={20}/><span className="dock-tooltip">{label} <kbd>{key}</kbd></span></button>)}
  <CableColorPicker value={color} onChange={onColor} selected={selectedWire}/>
  {guide&&<><i/><GuideMenu guide={guide}/></>}
  <i/><button aria-label="Deshacer" title="Deshacer (Ctrl+Z)" disabled={!canUndo} onClick={onUndo}><Undo2 size={19}/></button><button aria-label="Rehacer" title="Rehacer (Ctrl+Shift+Z)" disabled={!canRedo} onClick={onRedo}><Redo2 size={19}/></button>
  {selectedWire&&<><i/><button className="dock-delete" aria-label="Eliminar cable seleccionado" title="Eliminar cable seleccionado (Supr)" onClick={onDelete}><Trash2 size={19}/></button></>}
 </div>;
}
