import {useRef,useState,type ReactNode,type RefObject} from 'react';
import {FloatingWindow} from './FloatingWindow';

/** El disparador conserva su lugar; el contenido abre una ventana independiente del lienzo. */
export function FloatingDisclosure({title,summary,summaryLabel,className='',children,detailsRef}:{title:string;summary:ReactNode;summaryLabel?:string;className?:string;children:ReactNode;detailsRef?:RefObject<HTMLDetailsElement|null>}){
 const ownRef=useRef<HTMLDetailsElement>(null),menu=detailsRef??ownRef,[open,setOpen]=useState(false);
 const close=()=>{if(menu.current)menu.current.open=false;setOpen(false)};
 return <details ref={menu} className={className} onToggle={e=>{if(e.target===e.currentTarget)setOpen(e.currentTarget.open)}}><summary aria-label={summaryLabel} onClick={e=>{e.preventDefault();const next=!menu.current?.open;if(menu.current)menu.current.open=next;setOpen(next)}}>{summary}</summary>{open&&<FloatingWindow scaleBody={false} title={title} onClose={close} closeLabel={`Cerrar ${title.toLowerCase()}`} className="floating-menu">{children}</FloatingWindow>}</details>;
}
