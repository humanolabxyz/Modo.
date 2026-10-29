import {useEffect,useState,type ReactNode} from 'react';
import {ChevronUp} from 'lucide-react';
import {FloatingWindow} from '../components/FloatingWindow';
import {useCompactLayout} from '../hooks/useCompactLayout';
import {LAB_COMPACT_QUERY} from './workspaceLayout';
/** Propiedades de cada herramienta: tarjeta en escritorio y ventana movible en móvil/tablet.
 *  Se abre al seleccionar un elemento y se puede cerrar o volver a abrir desde la pizarra. */
export function InspectorSheet({title,summary,openKey,children}:{title:string;summary?:string;openKey?:string|null;children:ReactNode}){
  const [open,setOpen]=useState(false);
  const {compact}=useCompactLayout(LAB_COMPACT_QUERY);
  useEffect(()=>{if(openKey)setOpen(true);},[openKey]);
  if(compact)return <>
    <button type="button" className="lab-inspector-trigger" aria-label={`Abrir ${title.toLocaleLowerCase('es')}`} aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}><strong>{title}</strong><ChevronUp size={16}/></button>
    {open&&<FloatingWindow title={title} eyebrow={summary} width={350} side="right" top={104} className="lab-property-window" closeLabel={`Cerrar ${title.toLocaleLowerCase('es')}`} onClose={()=>setOpen(false)}><div className="lab-property-content">{children}</div></FloatingWindow>}
  </>;
  return <aside className={`lab-inspector lab-sheet ${open?'is-open':''}`} aria-label={title}>
    <button type="button" className="lab-sheet-handle" aria-expanded={open} onClick={()=>setOpen(!open)}><span className="lab-sheet-grip" aria-hidden="true"/><strong>{title}</strong>{summary?<small>{summary}</small>:null}<ChevronUp size={18} aria-hidden="true"/></button>
    <div className="lab-sheet-body">{children}</div>
  </aside>;
}
