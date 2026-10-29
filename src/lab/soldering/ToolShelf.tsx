import {useRef,useState,type PointerEvent} from 'react';
import {createPortal} from 'react-dom';
import {FloatingWindow} from '../../components/FloatingWindow';
import {IronShape,SolderReel,StripperShape,HeatGunShape,Sponge,BrassCleaner,FluxPot} from './Tools';
export const SHELF_TOOLS=[
 {id:'stripper',name:'Pelacables',category:'Preparar'}, {id:'sleeve',name:'Termorretráctil',category:'Preparar'},
 {id:'iron',name:'Cautín',category:'Soldar'}, {id:'tin',name:'Estaño',category:'Soldar'},
 {id:'flux',name:'Flux',category:'Soldar'}, {id:'station',name:'Estación',category:'Soldar'},
 {id:'sponge',name:'Esponja',category:'Limpiar'}, {id:'brass',name:'Limpiador de latón',category:'Limpiar'},
 {id:'restorer',name:'Restaurador de punta',category:'Limpiar'},
 {id:'gun',name:'Aire caliente',category:'Acabar'}, {id:'polish',name:'Pasta de pulir',category:'Acabar'},
] as const;
export type ShelfTool=typeof SHELF_TOOLS[number]['id'];
function Preview({id}:{id:ShelfTool}){
 const box=id==='iron'?'-10 -10 210 250':id==='stripper'?'-10 -55 140 145':id==='gun'?'-10 -25 140 180':id==='tin'?'-50 -70 160 145':'-60 -35 120 125';
 return <svg viewBox={box} aria-hidden="true">{id==='iron'?<IronShape clean tinned/>:id==='stripper'?<StripperShape/>:id==='gun'?<HeatGunShape/>:id==='tin'?<SolderReel label=""/>:id==='sponge'?<Sponge moist/>:id==='brass'?<BrassCleaner/>:id==='sleeve'?<rect x="-35" width="70" height="28" rx="7" fill="#354753"/>:id==='station'?<g><rect x="-45" y="-20" width="90" height="70" rx="10" fill="#2c4656"/><rect x="-34" y="-10" width="68" height="30" rx="4" fill="#152b30"/><text y="10" textAnchor="middle" fill="#9ee2a0" fontSize="15">330 °C</text></g>:<FluxPot label={id==='flux'?'FLUX':id==='restorer'?'TIP':'PULIDOR'}/>}</svg>;
}
export function ToolShelf({visible,onClose,onDragBegin,onPlace,placed}:{visible:boolean;onClose:()=>void;onDragBegin:()=>void;onPlace:(id:ShelfTool,point?:{x:number;y:number})=>void;placed:Partial<Record<ShelfTool,unknown>>}){
 const [category,setCategory]=useState('Preparar'),[ghost,setGhost]=useState<{id:ShelfTool;x:number;y:number}|null>(null),drag=useRef<{id:ShelfTool;x:number;y:number;active:boolean}|null>(null),suppress=useRef(false);
 const move=(e:PointerEvent<HTMLButtonElement>)=>{const d=drag.current;if(!d)return;if(!d.active&&Math.hypot(e.clientX-d.x,e.clientY-d.y)>9){d.active=true;suppress.current=true;onDragBegin();}if(d.active){e.preventDefault();setGhost({id:d.id,x:e.clientX,y:e.clientY});}};
 const up=(e:PointerEvent<HTMLButtonElement>)=>{const d=drag.current;drag.current=null;setGhost(null);if(d?.active)onPlace(d.id,{x:e.clientX,y:e.clientY});if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);};
 return <><FloatingWindow visible={visible} title="Herramientas" eyebrow="TOCA PARA COLOCAR · DESLIZA PARA EXPLORAR" onClose={onClose} width={480} side="left" anchor="bottom" dockFraction={.62} scaleBody={false} className={`solder-tool-shelf${ghost?' is-dragging':''}`}>
  <div className="solder-shelf-tabs" role="group" aria-label="Tipo de herramienta">{['Preparar','Soldar','Limpiar','Acabar'].map(c=><button key={c} type="button" aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div>
  <div className="solder-shelf-grid">{SHELF_TOOLS.filter(t=>t.category===category).map(t=><div key={t.id} className="solder-shelf-card">
   <button type="button" className="solder-shelf-place" aria-label={`Colocar ${t.name.toLocaleLowerCase('es')}`} onClick={()=>onPlace(t.id)}><Preview id={t.id}/><strong>{t.name}</strong><small>{placed[t.id]?'Ya en la mesa · seleccionar':'Tocar para colocar'}</small></button>
   <button type="button" className="solder-shelf-drag" aria-label={`Arrastrar ${t.name.toLocaleLowerCase('es')} a la mesa`} onPointerDown={e=>{if(e.button!==0)return;suppress.current=false;drag.current={id:t.id,x:e.clientX,y:e.clientY,active:false};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={move} onPointerUp={up} onPointerCancel={()=>{drag.current=null;setGhost(null);suppress.current=true;}} onClick={()=>{if(suppress.current){suppress.current=false;return;}onPlace(t.id);}}>⠿ Arrastrar a la mesa</button>
  </div>)}</div>
 </FloatingWindow>{ghost?createPortal(<div className="solder-shelf-ghost" style={{left:ghost.x,top:ghost.y}}><Preview id={ghost.id}/><span>Suelta sobre la mesa</span></div>,document.body):null}</>;
}
