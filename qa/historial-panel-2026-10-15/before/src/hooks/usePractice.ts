import {useCallback,useEffect,useRef,useState} from 'react';
import {emptyPractice,type PracticeDocument} from '../data/practice';
import {readPractice} from '../data/wiring';
type History={past:PracticeDocument[];present:PracticeDocument;future:PracticeDocument[]};
type Action={type:'edit';apply:(p:PracticeDocument)=>PracticeDocument}|{type:'restore';value:PracticeDocument}|{type:'undo'|'redo'};
function reducer(h:History,a:Action):History{
 if(a.type==='restore')return {past:[],present:a.value,future:[]};
 if(a.type==='edit'){const next=a.apply(h.present);return next===h.present?h:{past:[...h.past,h.present],present:next,future:[]}}
 if(a.type==='undo'&&h.past.length)return {past:h.past.slice(0,-1),present:h.past.at(-1)!,future:[h.present,...h.future]};
 if(a.type==='redo'&&h.future.length)return {past:[...h.past,h.present],present:h.future[0],future:h.future.slice(1)};
 return h;
}
export const PRACTICE_KEY='panellab-practice-v2';
export function usePractice(onChange?:(before:PracticeDocument,after:PracticeDocument,action:string)=>void){
 const [history,setHistory]=useState<History>(()=>({past:[],present:emptyPractice(),future:[]}));
 const current=useRef(history),listener=useRef(onChange);listener.current=onChange;
 const dispatch=useCallback((action:Action)=>{const previous=current.current,next=reducer(previous,action);if(next===previous)return;current.current=next;setHistory(next);if(action.type!=='restore')listener.current?.(previous.present,next.present,action.type);},[]);
 const [ready,setReady]=useState(false),[saved,setSaved]=useState(false),[saveError,setSaveError]=useState('');
 useEffect(()=>{try{const raw=localStorage.getItem(PRACTICE_KEY);if(raw){dispatch({type:'restore',value:readPractice(JSON.parse(raw))});setSaved(true)}}catch{setSaveError('No se pudo recuperar la práctica guardada. Puedes importar una copia.')}finally{setReady(true)}},[dispatch]);
 useEffect(()=>{if(!ready)return;try{localStorage.setItem(PRACTICE_KEY,JSON.stringify(history.present));setSaved(true);setSaveError('')}catch{setSaved(false);setSaveError('El navegador no pudo guardar. Exporta tu práctica antes de cerrar.')}},[history.present,ready]);
 const commit=useCallback((apply:(p:PracticeDocument)=>PracticeDocument)=>dispatch({type:'edit',apply}),[dispatch]);
 const replace=useCallback((value:PracticeDocument)=>dispatch({type:'edit',apply:()=>value}),[dispatch]);
 return {document:history.present,commit,replace,undo:()=>dispatch({type:'undo'}),redo:()=>dispatch({type:'redo'}),canUndo:!!history.past.length,canRedo:!!history.future.length,ready,saved,saveError};
}
