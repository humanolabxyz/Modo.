import {canonical,frameChanges,type FrameChanges} from './changes';
import type {PracticeDocument} from './practice';
import {readPractice,TERMINAL_BY_ID} from './wiring';
import {emptySimulation,type SimulationInput} from './simulation';
export type SessionFrame={practice:PracticeDocument;simulation:SimulationInput;loto:number};
export type StepOperation='edit'|'undo'|'redo'|'control'|'loto';
export type SessionStep={at:number;label:string;targets:string[];frame:SessionFrame;changes:FrameChanges;operation?:StepOperation};
export type ActionSession={version:1;id:string;name:string;createdAt:string;initial:SessionFrame;steps:SessionStep[];truncated?:boolean;origin?:'automatic'|'recording'|'snapshot'};
export const SESSION_KEY='modo-action-sessions-v1';
export const MAX_SESSION_BYTES=8*1024*1024;
export const LOTO_STEPS=[
 ['Preparar y comunicar','Identificar todas las fuentes de energía, el equipo y las personas afectadas. Comunicar la intervención según el procedimiento autorizado.'],
 ['Detener','Aplicar la parada normal del equipo antes del aislamiento. Un pulsador de parada no es un dispositivo de aislamiento.'],
 ['Aislar','Identificar y operar todos los dispositivos de aislamiento según el procedimiento específico del banco. La foto muestra un seccionador en OFF; no prueba el aislamiento de todas las fuentes.'],
 ['Bloquear y etiquetar','Aplicar los dispositivos personales de bloqueo y la identificación de la persona autorizada. La foto muestra un candado: la simulación no acredita un bloqueo físico.'],
 ['Controlar energía residual','Identificar, descargar o contener las energías almacenadas y considerar su posible acumulación. Este panel no modela todas las energías del equipo real.'],
 ['Verificar el aislamiento','La persona autorizada verifica el aislamiento y la desenergización con los métodos e instrumentos previstos. Marcar este paso solo completa el ejercicio virtual.'],
 ['Intervenir y mantener el control','Mantener el bloqueo durante el trabajo y repetir la verificación cuando pueda acumularse energía.'],
 ['Restituir según el procedimiento','Revisar equipo y zona, asegurar que las personas estén fuera de peligro, retirar cada bloqueo por su responsable conforme al procedimiento y comunicar la restitución antes de reenergizar.']
] as const;
export const newFrame=(practice:PracticeDocument):SessionFrame=>({practice,simulation:emptySimulation(),loto:0});
export function practiceChange(before:PracticeDocument,after:PracticeDocument){
 const c=frameChanges(newFrame(before),newFrame(after));
 const affected=[...c.added,...c.removed,...c.modified.flatMap(w=>[w.before,w.after])];
 const targets=[...new Set(affected.flatMap(w=>[w.from.terminalId,w.to.terminalId]))];
 const names:Record<string,string>={from:'origen',to:'destino',color:'color',route:'recorrido',layer:'orden visual'};
 const wire=(w:PracticeDocument['wires'][number])=>w.from.terminalId+' → '+w.to.terminalId;
 const assessmentLabel=before.assessment?.submitted!==after.assessment?.submitted?(after.assessment?.submitted?'Entregar evaluación':'Editar evaluación'):before.assessment?.reflection!==after.assessment?.reflection?'Guardar explicación del circuito':'Guardar respuesta de evaluación';
 const label=c.added.length===1&&!c.removed.length&&!c.modified.length?'Conectar '+wire(c.added[0]):
  c.removed.length===1&&!c.added.length&&!c.modified.length?'Retirar '+wire(c.removed[0]):
  c.modified.length===1&&!c.added.length&&!c.removed.length?'Modificar cable '+wire(c.modified[0].after)+' · '+c.modified[0].fields.map(f=>names[f]||f).join(', '):
  affected.length?'Actualizar montaje · '+c.added.length+' añadidos, '+c.removed.length+' retirados, '+c.modified.length+' modificados':c.practiceFields.includes('assessment')?assessmentLabel:'Actualizar práctica o guía';
 return {label,targets};
}

function readFrame(raw:unknown):SessionFrame{
 if(!raw||typeof raw!=='object')throw new Error('Estado de grabación no válido.');
 const f=raw as SessionFrame,s=f.simulation;
 if(!Number.isInteger(f.loto)||f.loto<0||f.loto>LOTO_STEPS.length||!s||!['enabled','plugged','forceBreaker','thermalTripped'].every(k=>typeof s[k as keyof SimulationInput]==='boolean')||!Array.isArray(s.breakers)||s.breakers.length!==2||!s.breakers.every(v=>typeof v==='boolean')||!Array.isArray(s.pressed)||s.pressed.some(id=>!['S1','S2','S3'].includes(id)))throw new Error('Estado virtual no válido.');
 const practice=readPractice(f.practice);
 if(practice.wires.length!==f.practice.wires.length)throw new Error('La grabación usa módulos retirados: conserva el archivo original.');
 return {practice,simulation:{enabled:s.enabled,plugged:s.plugged,forceBreaker:s.forceBreaker,thermalTripped:s.thermalTripped,breakers:[...s.breakers],pressed:[...s.pressed]},loto:f.loto};
}
export function readSession(raw:unknown):ActionSession{
 if(!raw||typeof raw!=='object')throw new Error('Grabación no válida.');
 const s=raw as ActionSession;
 if(s.truncated!==undefined&&typeof s.truncated!=='boolean'||s.origin!==undefined&&!['automatic','recording','snapshot'].includes(s.origin))throw new Error('Metadatos de historial no válidos.');
 if(s.version!==1||typeof s.id!=='string'||s.id.length>100||typeof s.name!=='string'||s.name.length>120||typeof s.createdAt!=='string'||!Number.isFinite(Date.parse(s.createdAt))||!Array.isArray(s.steps)||s.steps.length>200)throw new Error('Formato de grabación incompatible.');
 const initial=readFrame(s.initial);let previous=initial,last=0;
 const steps=s.steps.map((step,index)=>{
  if(!step||!Number.isFinite(step.at)||step.at<last||typeof step.label!=='string'||step.label.length>500||!Array.isArray(step.targets)||step.targets.length>200||step.targets.some(id=>!TERMINAL_BY_ID.has(id)))throw new Error('Paso de grabación no válido.');
  const frame=readFrame(step.frame),changes=frameChanges(previous,frame);
  if(step.changes!==undefined&&canonical(step.changes)!==canonical(changes))throw new Error('Los cambios del paso '+(index+1)+' no coinciden con los estados del circuito.');
  if(step.operation!==undefined&&!['edit','undo','redo','control','loto'].includes(step.operation))throw new Error('Operación de historial no válida.');
  const targets=[...new Set([...step.targets,...[...changes.added,...changes.removed,...changes.modified.flatMap(w=>[w.before,w.after])].flatMap(w=>[w.from.terminalId,w.to.terminalId])])];
  const wireChanged=changes.added.length+changes.removed.length+changes.modified.length>0;
  const label=wireChanged?(step.operation==='undo'||step.label.startsWith('Deshacer · ')?'Deshacer · ':step.operation==='redo'||step.label.startsWith('Rehacer · ')?'Rehacer · ':'')+practiceChange(previous.practice,frame.practice).label:step.label;
  last=step.at;previous=frame;return {at:step.at,label,targets,frame,changes,...(step.operation?{operation:step.operation}:{})};
 });
 return {version:1,id:s.id,name:s.name,createdAt:s.createdAt,initial,steps,...(s.truncated?{truncated:true}:{}),...(s.origin?{origin:s.origin}:{})};
}
