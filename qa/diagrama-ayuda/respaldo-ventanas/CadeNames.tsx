import {useEffect,useLayoutEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {X} from 'lucide-react';
import type {Cade,CadeObject} from '../data/cade';
import {cadeKind,legendGroups,nameTagAt,photoFor,symbolInfo,type SymbolInfo} from '../data/cadeComponents';
/** Nombre del aparato escrito junto a su referencia («Disyuntor 3P», «Contactor», «Pulsador NC»…). */
export function CadeNameTag({o}:{o:CadeObject}){
 const kind=cadeKind(o),info=symbolInfo(o);
 if(!kind||!info||info.supply||!info.tag)return null;
 const {x,y}=nameTagAt(o,kind);
 return <text className="cade-name-tag" x={x} y={y} textAnchor="end" dominantBaseline="central" fontSize="2.5" fontFamily="Arial, Helvetica, sans-serif" fontWeight="600" fill="#0b6f8f" stroke="#fff" strokeWidth=".9" paintOrder="stroke" pointerEvents="none">{info.tag}</text>;
}
/** Lista de componentes del esquema: qué es cada aparato y dónde aparecen sus partes. */
export function CadeLegend({cade,activeId,onPick,open,onToggle}:{cade:Cade;activeId?:number;onPick:(id:number)=>void;open:boolean;onToggle:(open:boolean)=>void}){
 const groups=useMemo(()=>legendGroups(cade),[cade]);
 return <details className="cade-legend" open={open} onToggle={e=>onToggle(e.currentTarget.open)}>
  <summary>Componentes del esquema <span>{groups.length}</span></summary>
  <div className="cade-legend-body">{groups.map((g,i)=><section key={g.key} className="cade-legend-group">
   <h4>{g.reference&&<b>{g.reference}</b>}<span>{g.device}</span></h4>
   {groups[i-1]?.device!==g.device&&<p>{g.what}</p>}
   <div>{g.parts.map(p=><button key={p.id} className={activeId===p.id?'is-active':''} aria-pressed={activeId===p.id} onClick={()=>onPick(p.id)}><span>{p.info.part}</span>{p.terminals&&<small>{p.terminals}</small>}</button>)}</div>
  </section>)}</div>
 </details>;
}
/** Ficha del componente: cómo se dibuja en el esquema, cómo se ve de verdad y qué hace. `children` es el propio símbolo. */
export function CadeDetail({o,info,onClose,children}:{o:CadeObject;info:SymbolInfo;onClose:()=>void;children:ReactNode}){
 const g=useRef<SVGGElement>(null),[box,setBox]=useState<{x:number;y:number;w:number;h:number}|null>(null),[photoOk,setPhotoOk]=useState(true);
 useLayoutEffect(()=>{const b=g.current?.getBBox();if(b&&b.width>0)setBox({x:b.x-3,y:b.y-3,w:b.width+6,h:b.height+6})},[o.id]);
 useEffect(()=>{setPhotoOk(true)},[o.id]);
 useEffect(()=>{const h=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',h);return ()=>window.removeEventListener('keydown',h)},[onClose]);
 useEffect(()=>{const h=(e:PointerEvent)=>{const t=e.target as Element|null;if(t&&!t.closest('.cade-sheet,.cade-symbol,.cade-legend-group button'))onClose()};document.addEventListener('pointerdown',h);return ()=>document.removeEventListener('pointerdown',h)},[onClose]);
 const photo=photoFor(info.kind);
 return <aside className="cade-sheet" role="dialog" aria-label={`Detalle de ${o.reference||info.part}`}>
  <header><div><small>{o.reference?`${o.reference} · ${info.device}`:info.device}</small><h3>{info.part}</h3></div><button aria-label="Cerrar detalle" onClick={onClose}><X size={17}/></button></header>
  <div className="cade-sheet-media">
   <figure><svg viewBox={box?`${box.x} ${box.y} ${box.w} ${box.h}`:'0 0 40 40'} role="img" aria-label={`Símbolo de ${info.part} en el esquema`}><g ref={g} color="#2f4f61">{children}</g></svg><figcaption>Así se dibuja en el esquema</figcaption></figure>
   {photoOk&&<figure><img src={photo.src} alt={photo.alt} loading="lazy" onError={()=>setPhotoOk(false)}/><figcaption>{photo.caption}</figcaption></figure>}
  </div>
  <p>{info.note}</p>
  <p className="cade-sheet-device"><b>{info.device}.</b> {info.what}</p>
 </aside>;
}
