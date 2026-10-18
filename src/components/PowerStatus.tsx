import {useState} from 'react';
import {Zap} from 'lucide-react';
import type {SimulationController} from '../hooks/useSimulation';
import {FloatingWindow} from './FloatingWindow';
/** Estado de energía del tablero: fuerza (R·S·T), control de 24 V, motor y cuántos cables llevan corriente.
 *  Es una ventana como las demás del simulador: se mueve por la cabecera, se ajusta de tamaño y se oculta; al ocultarla queda un botón para volver a abrirla.
 *  En pantallas estrechas se acopla abajo al abrirse (para no tapar los módulos) y en las anchas aparece arriba a la derecha. Es «pasiva»: aparece sola al simular, así que no toma el foco ni responde a Escape. */
export function PowerStatus({simulation:s}:{simulation:SimulationController}){
 const [open,setOpen]=useState(true);
 if(!s.input.enabled)return null;
 const force=s.enabled&&s.input.plugged&&s.input.forceBreaker,control=s.result.powered,m=s.result.motor,live=s.result.liveWireIds.length;
 const motor=m.status==='running'?`Girando · ${m.connection==='star'?'estrella':'triángulo'} · ${m.direction===1?'horario ↻':'antihorario ↺'}`:m.status==='fault'?'Revisar conexión':'Detenido';
 const status=<div className="power-status" role="status" aria-live="polite" aria-label="Estado de energía del tablero">
  <span className={force?'is-on is-force':''} data-power="force"><i/><b>FUERZA</b>R · S · T <em>{force?'con tensión':'sin tensión'}</em></span>
  <span className={control?'is-on is-control':''} data-power="control"><i/><b>CONTROL</b>24 V <em>{control?'con tensión':'sin tensión'}</em></span>
  <span className={m.status==='running'?'is-on is-motor':m.status==='fault'?'is-fault':''} data-power="motor"><i/><b>MOTOR</b><em>{motor}</em></span>
  {live>0&&<span className="is-on is-flow" data-power="flow"><i/><em>{live} {live===1?'cable con corriente':'cables con corriente'}</em></span>}
 </div>;
 return open
  ?<FloatingWindow passive title="Estado de energía" onClose={()=>setOpen(false)} closeLabel="Ocultar el estado de energía" anchor="bottom" dockFraction={.4} side="right" top={128} width={310} className="floating-power">{status}</FloatingWindow>
  :<button type="button" className="power-status-chip" aria-label="Mostrar el estado de energía" onClick={()=>setOpen(true)}><Zap size={15} aria-hidden="true"/><i className={force||control||m.status==='running'?'is-on':''} aria-hidden="true"/>Estado</button>;
}
