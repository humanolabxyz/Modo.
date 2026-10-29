import {ClassCircuit} from './ClassCircuit';
import {FloatingWindow} from '../components/FloatingWindow';
import {useEffect,useRef,useState} from 'react';
import {Focus,Minus,Plus} from 'lucide-react';
/** Diagramas de clase que acompañan a la protoboard (Clase 4, Electrónica Aplicada a la Automatización). */
export type ClassDiagram={id:string;title:string;note:string;src:string;alt:string};
export const CLASS_DIAGRAMS:ClassDiagram[]=[
  {id:'practica-2',title:'Práctica 2 · puente H con L293D',note:'Montaje de práctica a 5 V para lógica y motor. La lámina de 12 V requiere una alimentación lógica independiente.',src:'/diagrams/clase-4-practica-2-l293d.webp',alt:'Diagrama de la Práctica de Laboratorio 2: batería de 12 V, resistencia R1, dos pulsadores, circuito integrado L293D y motor de corriente continua.'},
  {id:'pines',title:'L293D · pines',note:'Configuración de pines del circuito integrado L293D.',src:'/diagrams/clase-4-l293d-pines.webp',alt:'Configuración de los 16 pines del L293D: ENA, IN1, OUT1, GND, OUT2, IN2, VS a la izquierda; VSS, IN4, OUT4, GND, OUT3, IN3, ENB a la derecha.'},
  {id:'practica-1',title:'Práctica 1 · puente H con transistores',note:'Cuatro transistores NPN, patas E–B–C en columnas separadas y puentes macho–macho.',src:'/diagrams/clase-4-practica-1-transistores.webp',alt:'Diagrama de la Práctica 1: puente H con cuatro transistores 2N2222, cuatro resistencias, dos pulsadores, fuente y motor.'},
];
export function DiagramViewer({diagram,onSelect,onClose}:{diagram:ClassDiagram;onSelect:(id:string)=>void;onClose:()=>void}){
  const [zoom,setZoom]=useState(1),[original,setOriginal]=useState(false),scroller=useRef<HTMLDivElement>(null);
  const change=(factor:number)=>setZoom(z=>Math.max(.3,Math.min(5,Number((z*factor).toFixed(3)))));
  const fit=()=>{const el=scroller.current;if(!el)return;const body=el.closest('.floating-window-body')?.getBoundingClientRect(),top=el.getBoundingClientRect().top,extra=(el.querySelector('.class-route-tools')?.getBoundingClientRect().height??0)+(el.querySelector('.class-device-explanation')?.getBoundingClientRect().height??0)+28,height=Math.max(160,Math.min(innerHeight*.6,(body?.bottom??innerHeight)-top-42));setZoom(original?1:Math.max(.3,Math.min(1,el.clientWidth/880,(height-extra)/(diagram.id==='pines'?620:640))));el.scrollTo({left:0,top:0});};
  useEffect(()=>{const frame=requestAnimationFrame(fit);return()=>cancelAnimationFrame(frame)},[diagram.id,original]);
  return <FloatingWindow className="class-diagram-window" title={diagram.title} eyebrow="DIAGRAMA DE CLASE" width={1050} scaleBody={false} heightFraction={.86} onClose={onClose} closeLabel="Cerrar diagrama">
    <header className="class-diagram-toolbar">
      <div className="lab-diagram-tools"><button type="button" aria-label="Alejar diagrama" onClick={()=>change(1/1.25)}><Minus size={16}/></button><output aria-label="Zoom del diagrama">{Math.round(zoom*100)}%</output><button type="button" aria-label="Acercar diagrama" onClick={()=>change(1.25)}><Plus size={16}/></button><button type="button" aria-label="Ajustar diagrama" onClick={fit}><Focus size={16}/></button></div></header>
    <div className="lab-diagram-tabs" role="tablist" aria-label="Diagramas de la clase">{CLASS_DIAGRAMS.map(d=><button key={d.id} type="button" role="tab" aria-selected={d.id===diagram.id} onClick={()=>onSelect(d.id)}>{d.title.split(' · ')[0]==='L293D'?'Pines L293D':d.title.split(' · ')[0]}</button>)}</div>
    <div className="class-diagram-options"><button type="button" aria-pressed={!original} onClick={()=>setOriginal(false)}>Diagrama claro</button><button type="button" aria-pressed={original} onClick={()=>setOriginal(true)}>Lámina original</button></div>
    <div className="lab-diagram-scroll" ref={scroller} tabIndex={0} onWheel={e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();change(e.deltaY<0?1.1:1/1.1);}}}>{original?<img src={diagram.src} alt={diagram.alt} draggable={false} style={{width:`${zoom*100}%`}}/>:<ClassCircuit key={diagram.id} kind={diagram.id} zoom={zoom}/>}</div>
    <details className="class-diagram-note"><summary>Sobre este diagrama</summary><p>{diagram.note}</p><p>Diagrama de la Clase 4 · Docente Elizabeth Morales · Electrónica Aplicada a la Automatización (INACAP). Úsalo como guía; el laboratorio no valida equipos reales.</p></details>
  </FloatingWindow>;
}
