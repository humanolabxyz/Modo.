import {learningChecks} from '../world/learning.ts';
import type {WorldSession} from '../world/session.ts';
export function LearningPanel({session,onClose,onLocate}:{session:WorldSession;onClose():void;onLocate(id:string):void}) {
 const rows=learningChecks(session);
 return <section className="agro-learning" aria-label="Comprobaciones guiadas" data-testid="agro-learning-guide">
  <header><strong>Guía de aprendizaje</strong><button type="button" aria-label="Cerrar guía" onClick={onClose}>×</button></header>
  <p>Revisa tu finca con estas pistas. Puedes seguir construyendo mientras completas los pasos.</p>
  <ol>{rows.map(row=><li key={row.id} data-check={row.id} data-status={row.status}>
   <strong><span aria-label={row.status==='ready'?'Completado':row.status==='review'?'Revisar':'Por hacer'}>{row.status==='ready'?'✓':row.status==='review'?'!':'○'}</span> {row.label}</strong><p>{row.detail}</p>
   {row.entityId&&<button type="button" onClick={()=>onLocate(row.entityId!)}>Localizar</button>}
  </li>)}</ol>
 </section>;
}
