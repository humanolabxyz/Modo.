import type {MutableRefObject} from 'react';
import type {ViewName} from './BuildCanvas';

/** Cubo de vistas: un cubo CSS que gira con la cámara (BuildCanvas escribe su `transform` en cada cuadro). Cada cara orienta la cámara. */
const FACES: {name: string; view: ViewName; label: string; className: string}[] = [
  {name: 'front', view: 'front', label: 'Frente', className: 'f-front'},
  {name: 'back', view: 'back', label: 'Atrás', className: 'f-back'},
  {name: 'right', view: 'side', label: 'Lateral', className: 'f-right'},
  {name: 'left', view: 'left', label: 'Izq.', className: 'f-left'},
  {name: 'top', view: 'top', label: 'Arriba', className: 'f-top'},
  {name: 'bottom', view: 'bottom', label: 'Abajo', className: 'f-bottom'},
];

export function ViewCube({cubeRef, onView}: {cubeRef: MutableRefObject<HTMLDivElement | null>; onView(view: ViewName): void}) {
  return <div className="rb-viewcube rb-canvas-overlay" role="group" aria-label="Cubo de vistas">
    <div className="rb-viewcube-scene">
      <div ref={cubeRef} className="rb-viewcube-cube">
        {FACES.map(f => <button key={f.name} type="button" data-view-face={f.name} className={`rb-viewcube-face ${f.className}`} aria-label={`Vista ${f.label}`} onClick={() => onView(f.view)}>{f.label}</button>)}
      </div>
    </div>
    <button type="button" className="rb-viewcube-iso" aria-label="Vista isométrica" title="Vista isométrica (0)" onClick={() => onView('iso')}>ISO</button>
  </div>;
}
