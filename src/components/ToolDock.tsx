import {useEffect,useRef,useState} from 'react';
import {Gauge,MousePointer2,Hand,Cable,Eraser,Trash2,Undo2,Redo2,GraduationCap,Eye,EyeOff,LogOut,ScanSearch,PlayCircle,ClipboardPenLine} from 'lucide-react';
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
 onToggle:()=>void;onLesson:(key:string)=>void;onAssessment:(key:string)=>void;onIdentify:()=>void;onMeterLesson?:()=>void;onExit:()=>void;
};
function GuideMenu({guide,open,setOpen}:{guide:GuideDock;open:boolean;setOpen:(open:boolean)=>void}){
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
   {!guide.active&&<section className="guide-first-time" aria-label="Si es tu primera vez"><small>¿Primera vez? Empieza aquí</small><ol><li>Elige la herramienta de cables <Cable size={14} aria-hidden="true"/> en la barra de abajo.</li><li>Toca un borne de origen y luego uno de destino: nace un cable.</li><li>¿Te equivocaste? <b>Deshacer</b> lo corrige.</li></ol><p>Después, la lección más corta te guía conexión por conexión. El video «Tu primer cable» está en el menú ⋯ → Tutoriales.</p></section>}
   {guide.onMeterLesson&&<button type="button" className="guide-measure-feature" onClick={run(guide.onMeterLesson)}><Gauge size={24}/><span><strong>Aprender a medir</strong><small>Guía del profesor · Actividad 2</small></span></button>}
   <small className="guide-menu-title">Lecciones con circuitos reales</small>
   {guide.lessons.map((l,index)=><article key={l.key} className="guide-lesson-choice"><div className="guide-lesson-heading"><span className="guide-lesson-number">{String(index+1).padStart(2,'0')}</span><div><h4>{l.title}</h4><small>{l.steps} conexiones{l.steps===Math.min(...guide.lessons.map(x=>x.steps))?' · la más corta':''}</small></div></div><p>{l.key==='simple'?'Arranque, retención y parada de un motor.':l.key==='inversion'?'Dos sentidos de giro con enclavamiento.':l.summary}</p><div className="guide-lesson-actions"><button type="button" className="guide-learn-start" aria-label={`Aprender: ${l.title}`} onClick={run(()=>guide.onLesson(l.key))}><PlayCircle size={16}/>Aprender</button><button type="button" className="guide-assessment-start" aria-label={l.key==='simple'?'Evaluarme: marcha y paro':l.key==='inversion'?'Evaluarme: inversión de giro':`Evaluarme: ${l.title.toLocaleLowerCase('es')}`} onClick={run(()=>guide.onAssessment(l.key))}><ClipboardPenLine size={16}/>Armar y explicar</button></div></article>)}
   <span className="guide-replace-note">Al iniciar se vacía el banco. Deshacer recupera tu montaje.</span>
   
   <small className="guide-menu-title">Practicar</small>
   <button type="button" className="guide-menu-item" onClick={run(guide.onIdentify)}><ScanSearch size={18}/><span><b>Reconocer bornes</b><em>Nueve retos para encontrar bornes en el banco</em></span></button>
  </div></FloatingWindow>}
 </div>;
}
export function ToolDock({tool,onTool,canUndo,canRedo,onUndo,onRedo,selectedWire,onDelete,hasWires,onClearWires,color,onColor,connectingDisabled=false,guide,meterOpen=false,onMeter,clampOpen=false,onClamp,measurementOpen=false}:{tool:BoardTool;onTool:(t:BoardTool)=>void;canUndo:boolean;canRedo:boolean;onUndo:()=>void;onRedo:()=>void;selectedWire:boolean;onDelete:()=>void;hasWires:boolean;onClearWires:()=>void;color:string;onColor:(color:string)=>void;connectingDisabled?:boolean;guide?:GuideDock;meterOpen?:boolean;onMeter?:()=>void;clampOpen?:boolean;onClamp?:()=>void;measurementOpen?:boolean}){
 const [pickerOpen,setPickerOpen]=useState(false);
 const [eraseOpen,setEraseOpen]=useState(false),eraseGroup=useRef<HTMLDivElement>(null);
 const eraseGesture=useRef<{x:number;y:number;swiped:boolean}|null>(null),eraseSwiped=useRef(false);
 useEffect(()=>{if(!eraseOpen)return;const close=(e:PointerEvent)=>{if(!eraseGroup.current?.contains(e.target as Node))setEraseOpen(false);};const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setEraseOpen(false);};document.addEventListener('pointerdown',close);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',key);};},[eraseOpen]);
 useEffect(()=>{setPickerOpen(false)},[meterOpen,clampOpen,measurementOpen]);
 const tools=[{id:'inspect',label:'Seleccionar',key:'V',Icon:MousePointer2},{id:'pan',label:'Mover vista',key:'H',Icon:Hand},{id:'connect',label:'Conectar cables',key:'C',Icon:Cable},{id:'erase',label:'Retirar cables',key:'E',Icon:Eraser}] as const;
 return <div className={`tool-dock${eraseOpen?' is-erase-open':''}`} role="toolbar" aria-label="Herramientas del banco">
  {tools.map(({id,label,key,Icon})=>id==='erase'?<div key={id} ref={eraseGroup} className="dock-erase-group">
   <button type="button" className={`dock-eraser${tool===id?' active':''}`} aria-label={label} aria-description="Pulsa para retirar un cable. Desliza hacia arriba para mostrar el basurero que borra todos." aria-pressed={tool===id} aria-expanded={eraseOpen} title={`${label} (${key}) · desliza hacia arriba para borrar todo`}
    onPointerDown={e=>{if(e.button!==0)return;eraseSwiped.current=false;eraseGesture.current={x:e.clientX,y:e.clientY,swiped:false};e.currentTarget.setPointerCapture(e.pointerId);}}
    onPointerMove={e=>{const start=eraseGesture.current;if(!start||start.swiped)return;const dy=start.y-e.clientY;if(dy>22&&dy>Math.abs(e.clientX-start.x)){start.swiped=true;eraseSwiped.current=true;onTool('erase');setEraseOpen(true);}}}
    onPointerUp={()=>{eraseGesture.current=null;}} onPointerCancel={()=>{eraseGesture.current=null;eraseSwiped.current=true;}}
    onKeyDown={e=>{if(e.key==='ArrowUp'){e.preventDefault();setEraseOpen(true);requestAnimationFrame(()=>eraseGroup.current?.querySelector<HTMLButtonElement>('.dock-clear-all')?.focus());}}}
    onClick={()=>{if(eraseSwiped.current){eraseSwiped.current=false;return;}onTool(id);setEraseOpen(true);}}><Icon size={20}/><span className="dock-tooltip">Retirar un cable <kbd>{key}</kbd></span></button>
   {eraseOpen&&<div className="dock-erase-popover" role="group" aria-label="Opciones de borrado"><button type="button" className="dock-clear-all" aria-label="Borrar todos los cables" title="Borrar todos los cables · Deshacer permite recuperarlos" disabled={!hasWires} onClick={()=>{onClearWires();setEraseOpen(false);}}><Trash2 size={22}/><span className="dock-clear-caption">Borrar todo</span></button></div>}
  </div>:<button key={id} type="button" className={tool===id?'active':''} aria-label={label} aria-pressed={tool===id} disabled={id==='connect'&&connectingDisabled} title={`${label} (${key})`} onClick={()=>{setEraseOpen(false);onTool(id);}}><Icon size={20}/><span className="dock-tooltip">{label} <kbd>{key}</kbd></span></button>)}
  {onMeter&&<button type="button" className={meterOpen||clampOpen?'active':''} aria-label="Multímetro del panel" aria-pressed={meterOpen||clampOpen} title="Multímetro" onClick={()=>{setPickerOpen(false);onMeter();}}><Gauge size={20}/><span className="dock-tooltip">Multímetro</span></button>}

  <CableColorPicker value={color} onChange={onColor} selected={selectedWire}/>
  {guide&&<><i/><GuideMenu guide={guide} open={pickerOpen} setOpen={setPickerOpen}/></>}
  <i/><button aria-label="Deshacer" title="Deshacer (Ctrl+Z)" disabled={!canUndo} onClick={onUndo}><Undo2 size={19}/></button><button aria-label="Rehacer" title="Rehacer (Ctrl+Shift+Z)" disabled={!canRedo} onClick={onRedo}><Redo2 size={19}/></button>
  {selectedWire&&<><i/><button className="dock-delete" aria-label="Eliminar cable seleccionado" title="Eliminar cable seleccionado (Supr)" onClick={onDelete}><Trash2 size={19}/></button></>}
 </div>;
}
