import {useRef,useState,type ReactNode,type RefObject} from 'react';
import {FloatingWindow} from './FloatingWindow';

/** El disparador conserva su lugar; el contenido abre una ventana independiente del lienzo. */
export function FloatingDisclosure({title,summary,summaryLabel,className='',children,detailsRef}:{title:string;summary:ReactNode;summaryLabel?:string;className?:string;children:ReactNode;detailsRef?:RefObject<HTMLDetailsElement|null>}){
 const ownRef=useRef<HTMLDetailsElement>(null),menu=detailsRef??ownRef,[open,setOpen]=useState(false),[minimized,setMinimized]=useState(false),[activation,setActivation]=useState(0);
 const close=()=>{if(menu.current)menu.current.open=false;setOpen(false);setMinimized(false)};
 return <details ref={menu} className={className} onToggle={e=>{if(e.target===e.currentTarget)setOpen(e.currentTarget.open)}}><summary aria-label={summaryLabel} aria-expanded={open&&!minimized} data-window-state={minimized?'minimized':open?'open':'closed'} onClick={e=>{e.preventDefault();if(open&&minimized){setMinimized(false);setActivation(v=>v+1);return;}const next=!menu.current?.open;if(menu.current)menu.current.open=next;setOpen(next)}}>{summary}</summary>{open&&<FloatingWindow scaleBody={false} visible={!minimized} activation={activation} onMinimize={()=>setMinimized(true)} title={title} onClose={close} closeLabel={`Cerrar ${title.toLowerCase()}`} className="floating-menu">{children}</FloatingWindow>}</details>;
}
