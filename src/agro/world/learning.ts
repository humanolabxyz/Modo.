import {TERRAIN_ISSUE} from './pipeElevation.ts';
import type {WorldSession} from './session.ts';
export type GuidedCheck={id:string;label:string;status:'ready'|'todo'|'review';detail:string;entityId?:string};
/** Lecturas derivadas. No guarda progreso, no cambia la red ni bloquea acciones. */
export function learningChecks(session:WorldSession):GuidedCheck[] {
 const entities=session.entities,analysis=session.analyze(),alerts=session.alerts();
 const equipment=['estanque','bomba','emisor','tablero'];
 const names=['estanque','bomba','aspersor','tablero'];
 const missing=equipment.flatMap((type,i)=>entities.some(e=>e.type===type)?[]:[names[i]]);
 const pump=entities.find(e=>e.type==='bomba');
 const pumpReading=pump?analysis.elements[pump.id]:undefined;
 const running=entities.some(e=>{const r=analysis.elements[e.id];return r?.kind==='bomba'&&r.running&&r.flowLmin>0;});
 const crop=entities.find(e=>e.type==='parcela'&&!!e.state.cultivo&&e.state.vivo!==false);
 const parcel=entities.find(e=>e.type==='parcela');
 const board=entities.find(e=>e.type==='tablero'&&!!session.parts.plc?.[e.id]?.rungs.length);
 const support=entities.find(e=>typeof e.state[TERRAIN_ISSUE]==='string');
 return [
  {id:'equipment',label:'1 · Preparar el conjunto de riego',status:missing.length?'todo':'ready',detail:missing.length?'Añade '+missing.join(', ')+'.':'Estanque, bomba, aspersor y tablero presentes.'},
  {id:'support',label:'2 · Revisar apoyos y conexiones',status:support||analysis.stretched.length?'review':'ready',detail:support?'Revisa el apoyo de '+support.label+'.':analysis.stretched.length?'Hay conexiones separadas: vuelve a acoplar sus puertos.':'No hay apoyos señalados ni uniones separadas.',entityId:support?.id},
  {id:'power',label:'3 · Alimentar y operar la bomba',status:running?'ready':'todo',detail:running?'Una bomba está funcionando con caudal.':(pumpReading?.kind==='bomba'&&pumpReading.reason?pumpReading.reason:'Conecta la alimentación y revisa el interruptor y el modo del tablero.'),entityId:pump?.id},
  {id:'water',label:'4 · Comprobar agua en el aspersor',status:analysis.balance.emittersLmin>0?'ready':'todo',detail:analysis.balance.emittersLmin>0?`Caudal total: ${analysis.balance.emittersLmin.toLocaleString('es-CL',{maximumFractionDigits:1})} L/min.`:'Revisa nivel de agua, válvulas y continuidad de las tuberías.'},
  {id:'crop',label:'5 · Preparar suelo y sembrar',status:crop?'ready':'todo',detail:crop?'Hay un cultivo vivo. Revisa humedad y evolución en su inspector.':parcel?'Selecciona la parcela y siembra un cultivo.':'Delimita o coloca una parcela para cultivar.',entityId:(crop??parcel)?.id},
  {id:'automation',label:'6 · Explorar la automatización',status:board?'ready':'todo',detail:board?'Hay un programa en el tablero. Revisa sus entradas y salidas en Automatizar.':'Opcional: añade una sonda y prepara un programa de riego.',entityId:board?.id},
  {id:'alerts',label:'Avisos del mundo',status:alerts.length?'review':'ready',detail:alerts.length?`${alerts.length} aviso(s): ${alerts[0].text}`:'No hay avisos activos.',entityId:alerts[0]?.entityId},
 ];
}
