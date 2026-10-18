import {useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {Eye,Focus,Minus,Plus,Spline} from 'lucide-react';
/** Controles flotantes compartidos por las superficies de trabajo del laboratorio. Usan el mismo lenguaje visual del panel
 *  (dock oscuro, zoom claro) sin depender de sus tipos ni de sus reglas globales. */
export type DockMenuItem={id:string;label:string;note?:string;shortcut?:string;icon:ReactNode;pressed?:boolean;disabled?:boolean;onClick:()=>void};
export type DockItem={id:string;label:string;shortcut?:string;icon:ReactNode;disabled?:boolean;pressed?:boolean;onClick?:()=>void;menu?:DockMenuItem[]}|'separator';
export function FloatingDock({items,label}:{items:DockItem[];label:string}){
  const [open,setOpen]=useState<string|null>(null),[position,setPosition]=useState<CSSProperties>({}),dock=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!open)return;
    const away=(e:PointerEvent)=>{if(!(e.target as Element)?.closest('.lab-dock-menu,.lab-dock button[aria-haspopup]'))setOpen(null);};
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(null);};
    document.addEventListener('pointerdown',away);document.addEventListener('keydown',key);
    return()=>{document.removeEventListener('pointerdown',away);document.removeEventListener('keydown',key);};
  },[open]);
  const toggle=(id:string,button:HTMLElement)=>{
    if(open===id){setOpen(null);return;}
    const box=button.getBoundingClientRect(),width=Math.min(264,innerWidth-16),left=Math.max(8,Math.min(innerWidth-width-8,box.left+box.width/2-width/2));
    const frame=dock.current?.getBoundingClientRect();setPosition({left:left-(frame?.left??0),width,bottom:(frame?.height??48)+10});setOpen(id);
  };
  const menu=items.find((item):item is Exclude<DockItem,'separator'>=>item!=='separator'&&item.id===open&&!!item.menu);
  return <div className="lab-dock" role="toolbar" aria-label={label} ref={dock}>{items.map((item,index)=>item==='separator'?<i key={`s${index}`} aria-hidden="true"/>:<button key={item.id} type="button" className={`${item.pressed?'active':''} ${item.menu?'has-menu':''}`} aria-label={item.label} aria-pressed={item.menu?undefined:item.pressed===undefined?undefined:item.pressed} aria-haspopup={item.menu?'menu':undefined} aria-expanded={item.menu?open===item.id:undefined} disabled={item.disabled} title={item.shortcut?`${item.label} (${item.shortcut})`:item.label} onClick={e=>{if(item.menu)toggle(item.id,e.currentTarget);else{setOpen(null);item.onClick?.();}}}>{item.icon}{item.menu?<b className="lab-dock-caret" aria-hidden="true"/>:null}<span className="lab-dock-tip">{item.label}{item.shortcut?<kbd>{item.shortcut}</kbd>:null}</span></button>)}
    {menu?.menu?<div className="lab-dock-menu" role="menu" aria-label={menu.label} style={position}>{menu.menu.map(entry=><button key={entry.id} type="button" role="menuitem" aria-current={entry.pressed?'true':undefined} className={entry.pressed?'on':''} disabled={entry.disabled} onClick={()=>{setOpen(null);entry.onClick();}}>{entry.icon}<span><strong>{entry.label}</strong>{entry.note?<small>{entry.note}</small>:null}</span>{entry.shortcut?<kbd>{entry.shortcut}</kbd>:null}</button>)}</div>:null}
  </div>;
}
export function ZoomBar({percent,onZoomIn,onZoomOut,onFit,fitLabel='Ajustar a la placa',xray,onXray,straight,onStraight}:{percent:number;onZoomIn:()=>void;onZoomOut:()=>void;onFit:()=>void;fitLabel?:string;xray?:boolean;onXray?:()=>void;straight?:boolean;onStraight?:()=>void}){
  return <div className="lab-zoombar" role="group" aria-label="Zoom del lienzo"><button type="button" aria-label="Alejar" title="Alejar" onClick={onZoomOut}><Minus size={18}/></button><output aria-label="Nivel de zoom">{percent}%</output><button type="button" aria-label="Acercar" title="Acercar" onClick={onZoomIn}><Plus size={18}/></button><i aria-hidden="true"/><button type="button" aria-label={fitLabel} title={fitLabel} onClick={onFit}><Focus size={18}/></button>{onXray?<button type="button" aria-label="Ver interior de la protoboard" title="Ver interior (láminas metálicas y redes)" aria-pressed={xray} onClick={onXray}><Eye size={18}/></button>:null}{onStraight?<button type="button" aria-label="Cables rectos" title="Cables rectos o curvos" aria-pressed={straight} onClick={onStraight}><Spline size={18}/></button>:null}</div>;
}
