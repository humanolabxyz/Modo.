import {ArrowRight, Cable, CircuitBoard, Cpu, FlaskConical, Monitor, Workflow} from 'lucide-react';

const tools = [
  {id: 'schematic', name: 'Esquemas', Icon: Cable},
  {id: 'plc', name: 'PLC', Icon: Cpu},
  {id: 'hmi', name: 'HMI', Icon: Monitor},
  {id: 'process', name: 'Procesos', Icon: Workflow},
  {id: 'breadboard', name: 'Protoboard', Icon: CircuitBoard},
];

export function HomeTools() {
  return <article className="modo-card modo-laboratory" aria-label="Laboratorio de herramientas">
    <a className="modo-laboratory-open" href="/laboratorio" aria-labelledby="laboratory-heading">
      <img className="modo-card-photo" src="/images/modo/laboratorio.webp" srcSet="/images/modo/laboratorio-640.webp 640w, /images/modo/laboratorio-1024.webp 1024w, /images/modo/laboratorio.webp 1536w" sizes="(max-width: 760px) calc(100vw - 24px), 38vw" alt="" width="1536" height="1024" decoding="async"/>
      <div className="modo-card-heading"><span className="modo-module-icon"><FlaskConical aria-hidden="true"/></span><div><p className="modo-eyebrow">LABORATORIO</p><h2 id="laboratory-heading">Tu laboratorio</h2><p>Diseña, programa y experimenta. Crea proyectos con esquemas, PLC, HMI y un tanque de proceso.</p></div></div>
      <span className="modo-round-arrow modo-lab-arrow" aria-hidden="true"><ArrowRight size={25}/></span>
    </a>
    <nav className="modo-laboratory-tools" aria-label="Herramientas del laboratorio">
      {tools.map(({id, name, Icon}) => <a key={id} href={`/laboratorio?tool=${id}`}><Icon size={20} aria-hidden="true"/><span>{name}</span></a>)}
      <a className="modo-tools-arrow" href="/laboratorio" aria-label="Abrir laboratorio"><ArrowRight size={24} aria-hidden="true"/></a>
    </nav>
  </article>;
}
