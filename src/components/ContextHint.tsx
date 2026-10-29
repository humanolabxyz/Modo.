import {useState,type ReactNode} from 'react';
import {X} from 'lucide-react';
/** Optional instructions: closing survives hover updates until the tool changes. */
export function ContextHint({message,className='',children}:{message:string;className?:string;children?:ReactNode}){
 const [dismissed,setDismissed]=useState(false);
 if(dismissed||!message)return null;
 return <div className={`${className} context-hint`}><span role="status">{message}</span>{children}<button type="button" className="context-hint-close" aria-label="Cerrar ayuda de pantalla" title="Cerrar ayuda" onClick={()=>setDismissed(true)}><X size={16} aria-hidden="true"/></button></div>;
}
