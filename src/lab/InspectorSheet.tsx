import {createPortal} from 'react-dom';
import {useEffect,useState,type ReactNode} from 'react';
import {ChevronUp,SlidersHorizontal} from 'lucide-react';
import {FloatingWindow} from '../components/FloatingWindow';
import {useCompactLayout} from '../hooks/useCompactLayout';
import {LAB_COMPACT_QUERY} from './workspaceLayout';
/** Propiedades de cada herramienta en una ventana movible y ajustable sobre la pizarra.
 *  Se abre al seleccionar un elemento y se puede cerrar o volver a abrir desde la pizarra. */
export function InspectorSheet({title,summary,openKey,children,floating=false,triggerTarget}:{title:string;summary?:string;openKey?:string|null;children:ReactNode;floating?:boolean;triggerTarget?:HTMLElement|null}){
  const [open,setOpen]=useState(false),[created,setCreated]=useState(false),[activation,setActivation]=useState(0);
  const {compact}=useCompactLayout(LAB_COMPACT_QUERY);
  useEffect(()=>{if(openKey){setOpen(true);setCreated(true);setActivation(v=>v+1);}},[openKey]);
  const trigger=<button type="button" className={`lab-inspector-trigger ${floating?'cab-guide-trigger':''}`} title={title} aria-label={`Abrir ${title.toLocaleLowerCase('es')}`} aria-haspopup="dialog" aria-expanded={open} data-window-state={open?'open':created?'minimized':'closed'} onClick={()=>{setOpen(true);setCreated(true);setActivation(v=>v+1);}}><SlidersHorizontal size={18}/><strong>{title}</strong><ChevronUp size={16}/></button>;
  return <>
    {triggerTarget?createPortal(trigger,triggerTarget):trigger}
    {created&&<FloatingWindow title={title} eyebrow={summary} width={floating&&!compact?420:350} side="right" top={104} className={`lab-property-window ${floating?'cab-guide-window':''}`} showControlsHint={floating} activation={activation} visible={open} closeLabel={`Cerrar ${title.toLocaleLowerCase('es')}`} onMinimize={()=>setOpen(false)} onClose={()=>{setOpen(false);setCreated(false);}}><div className="lab-property-content">{children}</div></FloatingWindow>}
  </>;

}
