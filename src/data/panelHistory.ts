import type {PracticeDocument} from './practice';
import {readPractice} from './wiring';
import {newFrame,readSession,MAX_SESSION_BYTES,type ActionSession,type SessionFrame,type StepOperation} from './session';
import {canonical,frameChanges,samePractice} from './changes';
export {samePractice} from './changes';
export const PANEL_HISTORY_KEY='modo-panel-history-v1';
export function newPanelHistory(practice:PracticeDocument,origin:ActionSession['origin']='automatic'):ActionSession{
 return {version:1,id:crypto.randomUUID(),name:'Historial del panel',createdAt:new Date().toISOString(),initial:structuredClone(newFrame(practice)),steps:[],origin};
}
export function appendPanelHistory(session:ActionSession,patch:Partial<SessionFrame>,label:string,targets:string[]=[],operation?:StepOperation):ActionSession{
 const previous=session.steps.at(-1)?.frame||session.initial,next={...previous,...structuredClone(patch)};
 if(canonical(previous)===canonical(next))return session;
 const at=Math.max(0,Date.now()-Date.parse(session.createdAt),session.steps.at(-1)?.at||0);
 let result:ActionSession={...session,steps:[...session.steps,{at,label,targets,frame:next,changes:frameChanges(previous,next),...(operation?{operation}:{})}]};
 while(result.steps.length>200||new TextEncoder().encode(JSON.stringify(result)).length+new TextEncoder().encode(JSON.stringify(next.practice)).length>MAX_SESSION_BYTES-32768&&result.steps.length>0){
  result={...result,initial:result.steps[0].frame,steps:result.steps.slice(1),truncated:true};
 }
 return result;
}
export function panelExport(practice:PracticeDocument,history:ActionSession){
 const checked=readSession(history),last=checked.steps.at(-1)?.frame||checked.initial;
 if(!samePractice(last.practice,practice))throw new Error('El circuito y su historial no coinciden. No se exportó un historial incorrecto.');
 const file={...practice,format:'modo-panel',panelHistory:checked};
 if(new TextEncoder().encode(JSON.stringify(file)).length>MAX_SESSION_BYTES)throw new Error('El panel con su historial supera 8 MB.');
 return file;
}
export function readPanelFile(raw:unknown):{practice:PracticeDocument;history:ActionSession;message:string}{
 if(!raw||typeof raw!=='object')throw new Error('Archivo de panel no válido.');
 const v=raw as Record<string,unknown>;
 if(v.version===1&&v.initial&&Array.isArray(v.steps)){
  const history=readSession(raw),practice=(history.steps.at(-1)?.frame||history.initial).practice;
  return {practice,history,message:'Circuito leído desde la grabación. '+history.steps.length+' pasos anteriores recuperados.'};
 }
 if(v.format!==undefined&&v.format!=='modo-panel')throw new Error('Formato de panel incompatible.');
 const practice=readPractice(raw);
 if(v.panelHistory!==undefined){
  const history=readSession(v.panelHistory),last=(history.steps.at(-1)?.frame||history.initial).practice;
  if(!samePractice(last,practice))throw new Error('El circuito final no coincide con el historial del archivo.');
  return {practice,history,message:'Panel importado con '+history.steps.length+' pasos anteriores. Cambios comparados con sus estados guardados.'};
 }
 return {practice,history:newPanelHistory(practice,'snapshot'),message:'Panel importado sin historial. Este JSON solo contiene el montaje: sus pasos anteriores no se pueden reconstruir.'};
}
