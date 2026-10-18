import type {PracticeDocument} from './practice';
import {readPractice,TERMINAL_BY_ID} from './wiring';
import {emptySimulation,type SimulationInput} from './simulation';
export type SessionFrame={practice:PracticeDocument;simulation:SimulationInput;loto:number};
export type SessionStep={at:number;label:string;targets:string[];frame:SessionFrame};
export type ActionSession={version:1;id:string;name:string;createdAt:string;initial:SessionFrame;steps:SessionStep[]};
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
 const added=after.wires.filter(w=>!before.wires.some(old=>old.id===w.id));
 const removed=before.wires.filter(w=>!after.wires.some(next=>next.id===w.id));
 const changed=after.wires.filter(w=>before.wires.some(old=>old.id===w.id&&JSON.stringify(old)!==JSON.stringify(w)));
 const affected=[...added,...removed,...changed];
 const targets=[...new Set(affected.flatMap(w=>[w.from.terminalId,w.to.terminalId]))];
 const describe=(w:PracticeDocument['wires'][number])=>w.from.terminalId+' → '+w.to.terminalId;
 const label=added.length===1&&!removed.length&&!changed.length?'Conectar '+describe(added[0]):removed.length===1&&!added.length&&!changed.length?'Retirar '+describe(removed[0]):changed.length===1&&!added.length&&!removed.length?'Modificar cable '+describe(changed[0]):affected.length?'Actualizar montaje · '+added.length+' añadidos, '+removed.length+' retirados, '+changed.length+' modificados':'Actualizar práctica o guía';
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
 if(s.version!==1||typeof s.id!=='string'||s.id.length>100||typeof s.name!=='string'||s.name.length>120||typeof s.createdAt!=='string'||!Number.isFinite(Date.parse(s.createdAt))||!Array.isArray(s.steps)||s.steps.length>200)throw new Error('Formato de grabación incompatible.');
 let last=0;
 const steps=s.steps.map(step=>{
  if(!step||!Number.isFinite(step.at)||step.at<last||typeof step.label!=='string'||step.label.length>500||!Array.isArray(step.targets)||step.targets.length>200||step.targets.some(id=>!TERMINAL_BY_ID.has(id)))throw new Error('Paso de grabación no válido.');
  last=step.at;return {at:step.at,label:step.label,targets:step.targets,frame:readFrame(step.frame)};
 });
 return {version:1,id:s.id,name:s.name,createdAt:s.createdAt,initial:readFrame(s.initial),steps};
}
