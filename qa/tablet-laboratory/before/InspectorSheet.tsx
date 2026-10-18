import {useEffect,useState,type ReactNode} from 'react';
import {ChevronUp} from 'lucide-react';
/** Inspector de cada herramienta. En escritorio es una tarjeta flotante; en móvil es una hoja inferior plegable
 *  que se abre sola al seleccionar un elemento, de modo que la pantalla de trabajo no se convierte en una página interminable. */
export function InspectorSheet({title,summary,openKey,children}:{title:string;summary?:string;openKey?:string|null;children:ReactNode}){
  const [open,setOpen]=useState(false);
  useEffect(()=>{if(openKey)setOpen(true);},[openKey]);
  return <aside className={`lab-inspector lab-sheet ${open?'is-open':''}`} aria-label={title}>
    <button type="button" className="lab-sheet-handle" aria-expanded={open} onClick={()=>setOpen(!open)}><span className="lab-sheet-grip" aria-hidden="true"/><strong>{title}</strong>{summary?<small>{summary}</small>:null}<ChevronUp size={18} aria-hidden="true"/></button>
    <div className="lab-sheet-body">{children}</div>
  </aside>;
}
