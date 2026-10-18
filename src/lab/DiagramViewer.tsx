import {useRef,useState} from 'react';
import {Focus,Minus,Plus,X} from 'lucide-react';
/** Diagramas de clase que acompañan a la protoboard (Clase 4, Electrónica Aplicada a la Automatización). */
export type ClassDiagram={id:string;title:string;note:string;src:string;alt:string};
export const CLASS_DIAGRAMS:ClassDiagram[]=[
  {id:'practica-2',title:'Práctica 2 · puente H con L293D',note:'Circuito para montar en la protoboard: fuente de 12 V, R1, dos pulsadores, L293D y motor.',src:'/diagrams/clase-4-practica-2-l293d.webp',alt:'Diagrama de la Práctica de Laboratorio 2: batería de 12 V, resistencia R1, dos pulsadores, circuito integrado L293D y motor de corriente continua.'},
  {id:'pines',title:'L293D · pines',note:'Configuración de pines del circuito integrado L293D.',src:'/diagrams/clase-4-l293d-pines.webp',alt:'Configuración de los 16 pines del L293D: ENA, IN1, OUT1, GND, OUT2, IN2, VS a la izquierda; VSS, IN4, OUT4, GND, OUT3, IN3, ENB a la derecha.'},
  {id:'practica-1',title:'Práctica 1 · puente H con transistores',note:'Solo referencia: los transistores 2N2222 no están en la biblioteca de este laboratorio.',src:'/diagrams/clase-4-practica-1-transistores.webp',alt:'Diagrama de la Práctica 1: puente H con cuatro transistores 2N2222, cuatro resistencias, dos pulsadores, fuente y motor.'},
];
export function DiagramViewer({diagram,onSelect,onClose}:{diagram:ClassDiagram;onSelect:(id:string)=>void;onClose:()=>void}){
  const [zoom,setZoom]=useState(1),scroller=useRef<HTMLDivElement>(null);
  const change=(factor:number)=>setZoom(z=>Math.max(.5,Math.min(5,Number((z*factor).toFixed(3)))));
  return <section className="lab-diagram-viewer" role="dialog" aria-label={diagram.title} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();onClose();}}}>
    <header><div><strong>{diagram.title}</strong><small>{diagram.note}</small></div>
      <div className="lab-diagram-tools"><button type="button" aria-label="Alejar diagrama" onClick={()=>change(1/1.25)}><Minus size={16}/></button><output aria-label="Zoom del diagrama">{Math.round(zoom*100)}%</output><button type="button" aria-label="Acercar diagrama" onClick={()=>change(1.25)}><Plus size={16}/></button><button type="button" aria-label="Ajustar diagrama" onClick={()=>{setZoom(1);scroller.current?.scrollTo({left:0,top:0});}}><Focus size={16}/></button><button type="button" aria-label="Cerrar diagrama" onClick={onClose}><X size={17}/></button></div></header>
    <div className="lab-diagram-tabs" role="tablist" aria-label="Diagramas de la clase">{CLASS_DIAGRAMS.map(d=><button key={d.id} type="button" role="tab" aria-selected={d.id===diagram.id} onClick={()=>onSelect(d.id)}>{d.title.split(' · ')[0]==='L293D'?'Pines L293D':d.title.split(' · ')[0]}</button>)}</div>
    <div className="lab-diagram-scroll" ref={scroller} tabIndex={0} onWheel={e=>{if(e.ctrlKey||e.metaKey){e.preventDefault();change(e.deltaY<0?1.1:1/1.1);}}}><img src={diagram.src} alt={diagram.alt} draggable={false} style={{width:`${zoom*100}%`}}/></div>
    <footer>Diagrama de la Clase 4 · Docente Elizabeth Morales · Electrónica Aplicada a la Automatización (INACAP). Úsalo como guía; el laboratorio no valida equipos reales.</footer>
  </section>;
}
