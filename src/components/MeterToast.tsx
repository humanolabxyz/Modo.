import {createPortal} from 'react-dom';
import type {MeterHazard} from '../data/panelMeter';
import '../styles/guide-confirmation.css';
import '../styles/meter-toast.css';

/** Aviso del multímetro con el mismo estilo que «¡Cable correcto!» de la lección; se mantiene mientras la situación siga igual. */
export function MeterToast({hazard}:{hazard:MeterHazard|null}){
 if(!hazard||typeof document==='undefined')return null;
 const danger=hazard.level==='danger';
 return createPortal(<div key={hazard.title} className={`guide-check-toast meter-toast is-${hazard.level}`} role={danger?'alert':'status'} aria-live={danger?'assertive':'polite'} aria-atomic="true" data-meter-hazard={hazard.level}>
  <svg className="guide-check-mark" viewBox="0 0 80 80" aria-hidden="true"><circle className="guide-check-fill" cx="40" cy="40" r="34"/><circle className="guide-check-ring" cx="40" cy="40" r="34" pathLength="1"/><path className="guide-check-tick" d="M40 24v20" pathLength="1"/><circle className="meter-toast-dot" cx="40" cy="55" r="3.2"/></svg>
  <div><strong>{hazard.title}</strong><span>{hazard.text}</span>{hazard.action?<button type="button" className="meter-toast-action" onPointerDown={e=>{e.stopPropagation();hazard.action?.run();}} onClick={e=>{if(e.detail===0)hazard.action?.run();}}>{hazard.action.label}</button>:null}</div>
 </div>,document.body);
}
