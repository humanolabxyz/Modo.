import {useEffect,useId,useLayoutEffect,useRef,useState,type KeyboardEvent} from 'react';
import {createPortal} from 'react-dom';
import {Check,ChartNoAxesCombined,ChevronDown,CircuitBoard,Cpu,Flame,GitBranch,LoaderCircle,Monitor,PanelsTopLeft,Radar,Thermometer,Workflow} from 'lucide-react';
import {TOOLS,type Tool} from './model';
import '../styles/laboratory-navigation.css';
export const MODULE_INFO={
 schematic:{Icon:GitBranch,detail:'Dibujar circuitos de mando y probar relés.'},
 equipment:{Icon:PanelsTopLeft,detail:'Distribuir equipos y cablear el tablero.'},
 plc:{Icon:Cpu,detail:'Programar la lógica, contactos y temporizadores.'},
 hmi:{Icon:Monitor,detail:'Diseñar la pantalla de operación.'},
 process:{Icon:Workflow,detail:'Probar el tanque, la bomba y sus señales.'},
 breadboard:{Icon:CircuitBoard,detail:'Montar componentes y medir el circuito DC.'},
 soldering:{Icon:Flame,detail:'Preparar y soldar el cable HMI–PLC.'},
 temperature:{Icon:Thermometer,detail:'Practicar termocupla, Pt100 y transmisor.'},
 detectors:{Icon:Radar,detail:'Conectar y comprobar sensores de proximidad.'},
 geogebra:{Icon:ChartNoAxesCombined,detail:'Explorar gráficas, geometría y cálculo.'}
};
const groups:{name:string;tools:Tool[]}[]=[
 {name:'Automatización',tools:['equipment','plc','hmi','process']},
 {name:'Circuitos y montaje',tools:['schematic','breadboard','soldering']},
 {name:'Instrumentación',tools:['temperature','detectors']},
 {name:'Matemáticas',tools:['geogebra']}
];
export function LabModuleNavigator({tool,onTool}:{tool:Tool;onTool:(tool:Tool)=>void|Promise<void>}){
 const [open,setOpen]=useState(false),[pending,setPending]=useState<Tool|null>(null),[position,setPosition]=useState({left:0,top:0,width:300,maxHeight:500}),trigger=useRef<HTMLButtonElement>(null),menu=useRef<HTMLDivElement>(null),menuId=useId(),current=TOOLS.find(t=>t.id===tool)!,Icon=MODULE_INFO[tool].Icon;
 const close=()=>{setOpen(false);trigger.current?.focus({preventScroll:true});};
 useLayoutEffect(()=>{if(!open)return;const place=()=>{const rect=trigger.current?.getBoundingClientRect();if(!rect)return;const width=Math.min(310,window.innerWidth-24),top=rect.bottom+7;setPosition({left:Math.max(12,Math.min(rect.left,window.innerWidth-width-12)),top,width,maxHeight:Math.max(80,window.innerHeight-top-12)});};place();window.addEventListener('resize',place);window.addEventListener('scroll',place,true);return()=>{window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);};},[open]);
 useEffect(()=>{if(!open)return;const outside=(e:PointerEvent)=>{const target=e.target as Node;if(menu.current?.contains(target)||trigger.current?.contains(target))return;e.preventDefault();e.stopPropagation();setOpen(false);};const escape=(e:globalThis.KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}};document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',escape,true);return()=>{document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',escape,true);};},[open]);
 const navigate=(e:KeyboardEvent)=>{if(e.key==='Tab'){setOpen(false);trigger.current?.focus({preventScroll:true});return;}const items=Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')??[]);if(!items.length)return;const index=items.indexOf(document.activeElement as HTMLButtonElement);let next:number;if(e.key==='ArrowDown')next=(index+1)%items.length;else if(e.key==='ArrowUp')next=(index-1+items.length)%items.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=items.length-1;else return;e.preventDefault();items[next].focus();};
 const choose=async(id:Tool)=>{if(id===tool){close();return;}setPending(id);try{await onTool(id);close();}finally{setPending(null);}};
 return <><button ref={trigger} type="button" className="lab-module-trigger" aria-label={`Cambiar módulo: ${current.name}`} aria-haspopup="menu" aria-controls={open?menuId:undefined} aria-expanded={open} onClick={()=>setOpen(v=>!v)} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const focusItem=()=>{const items=menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');items?.[e.key==='ArrowUp'?items.length-1:0]?.focus();};if(open)focusItem();else{setOpen(true);requestAnimationFrame(focusItem);}}}}><Icon size={21} aria-hidden="true"/><span>{current.name}</span><ChevronDown className={open?'is-open':''} size={16} aria-hidden="true"/></button>{open&&createPortal(<div ref={menu} id={menuId} role="menu" aria-label="Módulos del laboratorio" aria-busy={pending!==null} className="lab-module-dropdown" style={position} onKeyDown={navigate}>{groups.map((g,i)=><div role="group" aria-labelledby={`${menuId}-${i}`} className="lab-module-category" key={g.name}><div id={`${menuId}-${i}`} className="lab-module-heading">{g.name}</div>{g.tools.map(id=>{const item=TOOLS.find(t=>t.id===id)!,ItemIcon=MODULE_INFO[id].Icon;return <button type="button" role="menuitem" tabIndex={-1} className="lab-module-item" key={id} aria-label={`Abrir ${item.name}`} aria-current={tool===id?'page':undefined} disabled={pending!==null} onClick={()=>void choose(id)}><span className="lab-module-item-icon"><ItemIcon size={18} aria-hidden="true"/></span><span>{item.name}</span>{pending===id?<LoaderCircle className="lab-module-loading" size={16} aria-hidden="true"/>:tool===id&&<Check size={16} aria-hidden="true"/>}</button>})}</div>)}</div>,document.body)}</>;
}
