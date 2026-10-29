import {useEffect,useState,type ReactNode} from 'react';
import {ChevronUp} from 'lucide-react';
import {FloatingWindow} from '../components/FloatingWindow';
import {useCompactLayout} from '../hooks/useCompactLayout';
import {LAB_COMPACT_QUERY} from './workspaceLayout';
/** Propiedades de cada herramienta en una ventana movible y ajustable sobre la pizarra.
 *  Se abre al seleccionar un elemento y se puede cerrar o volver a abrir desde la pizarra. */
export function InspectorSheet({title,summary,openKey,children,floating=false}:{title:string;summary?:string;openKey?:string|null;children:ReactNode;floating?:boolean}){
  const [open,setOpen]=useState(false);
  const {compact}=useCompactLayout(LAB_COMPACT_QUERY);
  useEffect(()=>{if(openKey)setOpen(true);},[openKey]);
  return <>
    <button type="button" className={`lab-inspector-trigger ${floating?'cab-guide-trigger':''}`} aria-label={`Abrir ${title.toLocaleLowerCase('es')}`} aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}><strong>{title}</strong><ChevronUp size={16}/></button>
    {open&&<FloatingWindow title={title} eyebrow={summary} width={floating&&!compact?420:350} side="right" top={104} className={`lab-property-window ${floating?'cab-guide-window':''}`} showControlsHint={floating} closeLabel={`Cerrar ${title.toLocaleLowerCase('es')}`} onClose={()=>setOpen(false)}><div className="lab-property-content">{children}</div></FloatingWindow>}
  </>;
}
