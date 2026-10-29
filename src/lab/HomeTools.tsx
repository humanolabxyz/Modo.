import {ArrowRight, Cable, CircuitBoard, Cpu, FlaskConical, Monitor, Workflow,ChartNoAxesCombined,Thermometer,Radar} from 'lucide-react';
import '../styles/home-tools.css';

const tools = [
  {id: 'schematic', name: 'Esquemas', Icon: Cable},
  {id: 'plc', name: 'PLC', Icon: Cpu},
  {id: 'hmi', name: 'HMI', Icon: Monitor},
  {id: 'process', name: 'Procesos', Icon: Workflow},
  {id: 'breadboard', name: 'Protoboard', Icon: CircuitBoard},
  {id: 'temperature', name: 'Temperatura', Icon: Thermometer},
  {id: 'detectors', name: 'Detectores', Icon: Radar},
  {id: 'geogebra', name: 'GeoGebra', Icon: ChartNoAxesCombined},
];

export function HomeTools() {
  return <article className="modo-card modo-laboratory" aria-label="Laboratorio de herramientas">
    <a className="modo-laboratory-open" href="/laboratorio" aria-labelledby="laboratory-heading">
      <img className="modo-card-photo" src="/images/modo/laboratorio.webp" srcSet="/images/modo/laboratorio-640.webp 640w, /images/modo/laboratorio-1024.webp 1024w, /images/modo/laboratorio.webp 1536w" sizes="(max-width: 760px) calc(100vw - 24px), 38vw" alt="" width="1536" height="1024" decoding="async"/>
      <div className="modo-card-heading"><span className="modo-module-icon"><FlaskConical aria-hidden="true"/></span><div><p className="modo-eyebrow">03 / EXPERIMENTA</p><h2 id="laboratory-heading">Tu laboratorio</h2><p>Diseña circuitos y experimenta con las herramientas del laboratorio.</p></div></div>
      <span className="modo-round-arrow modo-lab-arrow" aria-hidden="true"><ArrowRight size={25}/></span>
    </a>
    <nav className="modo-laboratory-tools" aria-label="Herramientas del laboratorio">
      {tools.map(({id, name, Icon}) => <a key={id} href={`/laboratorio?tool=${id}`}><Icon size={20} aria-hidden="true"/><span>{name}</span></a>)}
    </nav>
  </article>;
}
