import {useEffect,useRef,useState} from 'react';
import {MousePointer2,Hand,Cable,Eraser,Trash2,Undo2,Redo2,GraduationCap,Eye,EyeOff,LogOut,ScanSearch,PlayCircle} from 'lucide-react';
import {CableColorPicker} from './CableColorPicker';
export type BoardTool='inspect'|'pan'|'connect'|'erase';
/** Guías paso a paso disponibles desde el sombrero de la barra: lecciones armadas con circuitos reales y el reconocimiento de bornes. */
export type GuideLesson={key:string;title:string;steps:number;summary:string};
export type GuideDock={
 /** Hay una guía en marcha (lección o reconocimiento). */active:boolean;
 /** La ventana de la guía está abierta. */open:boolean;
 /** Nombre de lo que está en marcha, y su avance. */current?:{title:string;index:number;total:number};
 lessons:GuideLesson[];
 onToggle:()=>void;onLesson:(key:string)=>void;onIdentify:()=>void;onExit:()=>void;
};
function GuideMenu({guide}:{guide:GuideDock}){
 const [open,setOpen]=useState(false),root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!open)return;
  const away=(e:Event)=>{if(!root.current?.contains(e.target as Node))setOpen(false)},esc=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.stopPropagation();setOpen(false)}};
  document.addEventListener('pointerdown',away);document.addEventListener('keydown',esc,true);
  return()=>{document.removeEventListener('pointerdown',away);document.removeEventListener('keydown',esc,true)};
 },[open]);
 const run=(action:()=>void)=>()=>{action();setOpen(false)};
 return <div ref={root} className="guide-menu">
  <button type="button" className={guide.active&&guide.open?'active':''} aria-label="Guía paso a paso" aria-haspopup="menu" aria-expanded={open} aria-pressed={guide.active&&guide.open} title="Guía paso a paso" onClick={()=>setOpen(!open)}><GraduationCap size={21}/><span className="dock-tooltip">Guía paso a paso</span>{guide.active&&<i className="guide-dot" aria-hidden="true"/>}</button>
  {open&&<div className="guide-menu-pop" role="menu" aria-label="Guía paso a paso">
   {guide.active&&guide.current&&<section className="guide-menu-current" aria-label="Guía en marcha">
    <small>En marcha</small><strong>{guide.current.title}</strong>
    <div className="guide-menu-progress" role="img" aria-label={`Paso ${Math.min(guide.current.index+1,guide.current.total)} de ${guide.current.total}`}><i style={{width:`${Math.min(100,(guide.current.index/Math.max(1,guide.current.total))*100)}%`}}/></div>
    <span>Paso {Math.min(guide.current.index+1,guide.current.total)} de {guide.current.total}</span>
    <div className="guide-menu-actions"><button type="button" role="menuitem" onClick={run(guide.onToggle)}>{guide.open?<><EyeOff size={15}/>Ocultar ventana</>:<><Eye size={15}/>Mostrar ventana</>}</button><button type="button" role="menuitem" onClick={run(guide.onExit)}><LogOut size={15}/>Salir de la guía</button></div>
   </section>}
   <small className="guide-menu-title">Lecciones con circuitos reales</small>
   {guide.lessons.map(l=><button key={l.key} type="button" role="menuitem" className="guide-menu-item" onClick={run(()=>guide.onLesson(l.key))}><PlayCircle size={18}/><span><b>{l.title}</b><em>{l.summary}</em><small>{l.steps} pasos · reemplaza los cables actuales (Deshacer los recupera)</small></span></button>)}
   <small className="guide-menu-title">Practicar</small>
   <button type="button" role="menuitem" className="guide-menu-item" onClick={run(guide.onIdentify)}><ScanSearch size={18}/><span><b>Reconocer bornes</b><em>Nueve retos para encontrar bornes en el banco</em></span></button>
  </div>}
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
