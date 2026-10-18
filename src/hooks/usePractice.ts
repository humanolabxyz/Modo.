import {useCallback,useEffect,useRef,useState} from 'react';
import {emptyPractice,type PracticeDocument} from '../data/practice';
import {readPractice} from '../data/wiring';
import {loadExtraModules} from '../data/layout';
import {appendPanelHistory,newPanelHistory,PANEL_HISTORY_KEY,samePractice} from '../data/panelHistory';
import {practiceChange,readSession,type ActionSession,type SessionFrame,type StepOperation} from '../data/session';
import {canonical} from '../data/changes';
import {emptySimulation} from '../data/simulation';
type History={past:PracticeDocument[];present:PracticeDocument;future:PracticeDocument[]};
const topology=(p:PracticeDocument)=>canonical(p.wires.map(w=>[w.id,...[w.from.terminalId,w.to.terminalId].sort()]).sort((a,b)=>a[0].localeCompare(b[0])));
type Action={type:'edit';apply:(p:PracticeDocument)=>PracticeDocument;preserveAssessment?:boolean}|{type:'restore';value:PracticeDocument}|{type:'undo'|'redo'};
function reducer(h:History,a:Action):History{
 if(a.type==='restore')return {past:[],present:a.value,future:[]};
 if(a.type==='edit'){let next=a.apply(h.present);if(!a.preserveAssessment&&next.assessment?.submitted&&topology(next)!==topology(h.present))next={...next,assessment:{...next.assessment,submitted:false}};return next===h.present?h:{past:[...h.past,h.present],present:next,future:[]}}
 if(a.type==='undo'&&h.past.length)return {past:h.past.slice(0,-1),present:h.past.at(-1)!,future:[h.present,...h.future]};
 if(a.type==='redo'&&h.future.length)return {past:[...h.past,h.present],present:h.future[0],future:h.future.slice(1)};
 return h;
}
export const PRACTICE_KEY='panellab-practice-v2';
export function usePractice(onChange?:(before:PracticeDocument,after:PracticeDocument,action:string)=>void){
 const [history,setHistory]=useState<History>(()=>({past:[],present:emptyPractice(),future:[]}));
 const [timeline,setTimeline]=useState(()=>newPanelHistory(history.present)),[historyMessage,setHistoryMessage]=useState('');
 const current=useRef(history),journal=useRef(timeline),listener=useRef(onChange),hydrated=useRef(false);listener.current=onChange;
 const [ready,setReady]=useState(false),[saved,setSaved]=useState(false),[saveError,setSaveError]=useState('');
 const recordFrame=useCallback((patch:Partial<SessionFrame>,label:string,targets:string[]=[],operation?:StepOperation)=>{
  if(!hydrated.current)return;
  const next=appendPanelHistory(journal.current,patch,label,targets,operation);
  if(next===journal.current)return;journal.current=next;setTimeline(next);
 },[]);
 const dispatch=useCallback((action:Action)=>{
  const previous=current.current,next=reducer(previous,action);if(next===previous)return;current.current=next;setHistory(next);
  if(action.type!=='restore'){
   const change=practiceChange(previous.present,next.present);
   recordFrame({practice:next.present},(action.type==='undo'?'Deshacer · ':action.type==='redo'?'Rehacer · ':'')+change.label,change.targets,action.type);
   listener.current?.(previous.present,next.present,action.type);
  }
 },[recordFrame]);
 useEffect(()=>{
  loadExtraModules();
  let value=current.current.present;
  try{const raw=localStorage.getItem(PRACTICE_KEY);if(raw){value=readPractice(JSON.parse(raw));dispatch({type:'restore',value});setSaved(true);}}
  catch{setSaveError('No se pudo recuperar la práctica guardada. Puedes importar una copia.');}
  let recovered=newPanelHistory(value,'snapshot');
  try{const raw=localStorage.getItem(PANEL_HISTORY_KEY);if(raw){const candidate=readSession(JSON.parse(raw));if(!samePractice((candidate.steps.at(-1)?.frame||candidate.initial).practice,value))throw new Error();recovered=candidate;}}
  catch{setHistoryMessage('El historial anterior no coincide con el montaje guardado. Se inicia un historial desde este circuito, sin inventar pasos previos.');}
  // Opening a panel never reactivates saved control states.
  recovered=appendPanelHistory(recovered,{simulation:emptySimulation()},'Detener mando virtual al abrir el panel',[],'control');
  journal.current=recovered;setTimeline(recovered);hydrated.current=true;setReady(true);
 },[dispatch]);
 useEffect(()=>{if(!ready)return;try{
  localStorage.setItem(PRACTICE_KEY,JSON.stringify(history.present));
  localStorage.setItem(PANEL_HISTORY_KEY,JSON.stringify(timeline));
  setSaved(true);setSaveError('');
 }catch{setSaved(false);setSaveError('El navegador no pudo guardar el panel y su historial. Exporta una copia antes de cerrar.');}},[history.present,timeline,ready]);
 const commit=useCallback((apply:(p:PracticeDocument)=>PracticeDocument)=>dispatch({type:'edit',apply}),[dispatch]);
 const replace=useCallback((value:PracticeDocument)=>dispatch({type:'edit',apply:()=>value,preserveAssessment:true}),[dispatch]);
 const load=useCallback((value:PracticeDocument,imported?:ActionSession)=>{
  const previous=current.current,next=reducer(previous,{type:'edit',apply:()=>value,preserveAssessment:true});current.current=next;setHistory(next);
  const base=imported||newPanelHistory(value,'snapshot');
  const nextJournal=appendPanelHistory(base,{simulation:emptySimulation()},'Detener mando virtual al importar',[],'control');
  journal.current=nextJournal;setTimeline(nextJournal);setHistoryMessage(imported?'Historial importado y comprobado.':'Historial iniciado desde este montaje. No contiene pasos anteriores.');
 },[]);
 return {document:history.present,timeline,historyMessage,recordFrame,load,commit,replace,undo:()=>dispatch({type:'undo'}),redo:()=>dispatch({type:'redo'}),canUndo:!!history.past.length,canRedo:!!history.future.length,ready,saved,saveError};
}
