import {Fragment,useLayoutEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {ArrowLeft,ArrowRight,Crosshair} from 'lucide-react';
import {FloatingWindow} from './FloatingWindow';
import type {Cade,CadeObject} from '../data/cade';
import {cadeKind,WIRE_ROLES,WIRE_ROLE_ORDER,type CadeKind} from '../data/cadeComponents';
import {LETTERS,LINE_GUIDE,SYMBOL_GUIDE,type Tour} from '../data/cadeLearn';
import '../styles/cade-help.css';

/** Texto con **negritas** simples, sin HTML. */
export function Rich({text}:{text:string}){return <>{text.split(/\*\*(.+?)\*\*/g).map((t,i)=>i%2?<strong key={i}>{t}</strong>:<Fragment key={i}>{t}</Fragment>)}</>}

/** Dibujo de un símbolo encuadrado a su propio tamaño. */
function Thumb({children,id}:{children:ReactNode;id:number}){
 const g=useRef<SVGGElement>(null),[box,setBox]=useState<string|null>(null);
 useLayoutEffect(()=>{
  const measure=()=>{const b=g.current?.getBBox();if(b&&b.width>0&&b.height>0){const m=3,w=b.width+2*m,h=b.height+2*m,s=Math.max(w,h*1.4);setBox(`${b.x-m-(s-w)/2} ${b.y-m} ${s} ${h}`)}};
  // Repetir la medida cuando la ventana y sus símbolos ya están visibles.
  measure();const frame=requestAnimationFrame(measure);return ()=>cancelAnimationFrame(frame);
 },[id]);
 return <svg className="cade-symbol-thumb" viewBox={box??'0 0 40 30'} aria-hidden="true"><g ref={g} color="#2f4f61">{children}</g></svg>;
}

const ORDER:CadeKind[]=['supply-3','supply-L','supply-N','supply-PE','breaker3','breaker1','contactor3','thermal3','f1aux','motor','coil','contact-no','contact-nc','push-no','push-nc','double-push','lamp'];

/** Diccionario de símbolos: cada símbolo que aparece en este esquema, cómo se reconoce y qué hace al conectarlo. */
export function CadeSymbolGuide({cade,title,render,onPick,onClose}:{cade:Cade;title:string;render:(o:CadeObject)=>ReactNode;onPick:(id:number)=>void;onClose:()=>void}){
 const items=useMemo(()=>ORDER.flatMap(kind=>{const all=cade.SYMBOLS.filter(o=>cadeKind(o)===kind);return all.length?[{kind,sample:all[0],refs:[...new Set(all.map(o=>o.reference.replace(/^-/,'')).filter(Boolean))]}]:[]}),[cade]);
 return <FloatingWindow title="¿Qué significa cada símbolo?" eyebrow={`Diccionario · ${title}`} onClose={onClose} closeLabel="Cerrar diccionario" width={960}><div className="cade-guide"><p>Cada dibujo es un aparato o una parte de él. Pulsa «Ver en el esquema» para encontrarlo.</p>
   <section className="cade-guide-grid" aria-label="Símbolos del esquema">{items.map(({kind,sample,refs})=>{const g=SYMBOL_GUIDE[kind];return <article key={kind} className="cade-guide-card">
    <figure><Thumb id={sample.id}>{render(sample)}</Thumb></figure>
    <div><h3>{g.name}</h3>{refs.length>0&&<p className="cade-guide-refs">En este esquema: {refs.join(', ')}</p>}
     <p><b>Cómo reconocerlo:</b> {g.looks}</p><p><b>Qué hace:</b> {g.does}</p>
     <button className="text-action" onClick={()=>{onPick(sample.id);onClose()}}><Crosshair size={14}/> Ver en el esquema</button></div>
   </article>})}</section>
   <section className="cade-guide-extra"><div><h3>Las letras del nombre</h3><dl>{LETTERS.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div>
    <div><h3>Líneas y marcas</h3><dl>{LINE_GUIDE.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div>
    <div><h3>Colores de los cables</h3><dl>{WIRE_ROLE_ORDER.map(r=><div key={r}><dt>{WIRE_ROLES[r].label} · {WIRE_ROLES[r].colorName}</dt><dd>{WIRE_ROLES[r].note}</dd></div>)}</dl></div>
    <div><h3>Potencia y mando</h3><p><b>Potencia</b> es el camino de la corriente fuerte que mueve el motor. <b>Mando</b> es el circuito pequeño de pulsadores, bobinas y pilotos que decide cuándo se cierran los contactores.</p></div></section>
  </div></FloatingWindow>;
}

/** Tarjeta del recorrido «¿Cómo funciona?»: un paso a la vez, el esquema resalta lo que se explica. */
export function CadeTourCard({tour,index,onIndex,onClose}:{tour:Tour;index:number;onIndex:(i:number)=>void;onClose:()=>void}){
 const step=tour.steps[index],last=index===tour.steps.length-1;
 return <FloatingWindow title={step.title} eyebrow={`¿Cómo funciona? · Paso ${index+1} de ${tour.steps.length}`} onClose={onClose} closeLabel="Cerrar recorrido" anchor="bottom"><div className="cade-tour" role="region" aria-label="Cómo funciona el circuito"><p aria-live="polite"><Rich text={step.text}/></p>
  <div className="cade-tour-dots" aria-hidden="true">{tour.steps.map((_,i)=><i key={i} className={i===index?'is-on':i<index?'is-done':''}/>)}</div>
  <div className="cade-tour-nav"><button className="text-action" disabled={index===0} onClick={()=>onIndex(index-1)}><ArrowLeft size={15}/> Anterior</button>{last?<button className="primary-action" onClick={onClose}>Terminar</button>:<button className="primary-action" onClick={()=>onIndex(index+1)}>Siguiente <ArrowRight size={15}/></button>}</div>
  {(index===0||last)&&tour.note&&<p className="cade-tour-note">{tour.note}</p>}
 </div></FloatingWindow>;
}
