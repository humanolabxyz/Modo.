import {useEffect,useRef,useState} from 'react';
import {PackagePlus} from 'lucide-react';
import {EXTRA_KINDS,MAX_EXTRA_MODULES,type ExtraKind} from '../data/panel';
import {extraModules,useModules} from '../data/layout';

/** Botón «Añadir panel»: agrega al banco otro contactor trifásico o otro temporizador (por ejemplo, el KM3 del arranque estrella-triángulo). */
export function AddPanelMenu({onAdd,variant='button'}:{onAdd:(kind:ExtraKind)=>void;variant?:'button'|'tile'}){
 useModules();
 const [open,setOpen]=useState(false),root=useRef<HTMLDivElement>(null),count=extraModules().length,full=count>=MAX_EXTRA_MODULES;
 useEffect(()=>{
  if(!open)return;
  const close=(e:Event)=>{if(!root.current?.contains(e.target as Node))setOpen(false)},esc=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};
  document.addEventListener('pointerdown',close);document.addEventListener('keydown',esc);
  return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',esc)};
 },[open]);
 return <div ref={root} className={`add-panel add-panel-${variant}`}>
  <button type="button" className={variant==='tile'?'menu-tile':'add-panel-toggle'} aria-haspopup="menu" aria-expanded={open} aria-label="Añadir panel al banco" title="Añadir otro contactor o temporizador al banco" onClick={()=>setOpen(!open)}><PackagePlus size={variant==='tile'?22:16}/><span>{variant==='tile'?'Añadir':'Añadir panel'}</span></button>
  {open&&<div className="add-panel-pop" role="menu" aria-label="Paneles que se pueden añadir">
   <p>Se coloca en un hueco libre del banco. Después arrástralo y se acopla a los demás.</p>
   {(Object.keys(EXTRA_KINDS) as ExtraKind[]).map(kind=><button key={kind} type="button" role="menuitem" disabled={full} onClick={()=>{onAdd(kind);setOpen(false)}}><b>{EXTRA_KINDS[kind].label}</b><small>{EXTRA_KINDS[kind].hint}</small></button>)}
   <small className="add-panel-count">{full?`Máximo de ${MAX_EXTRA_MODULES} paneles adicionales.`:`${count} de ${MAX_EXTRA_MODULES} paneles adicionales`}</small>
  </div>}
 </div>;
}
