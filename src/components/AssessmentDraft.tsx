import {useEffect,useState} from 'react';
import {Check,ArrowRight} from 'lucide-react';
/** Saving creates one assessment/history action; typing preserves the local draft. */
export function AssessmentDraft({storageKey,value,onSave,label,maxLength=3000,formId,onReadyChange}:{storageKey:string;value:string;onSave:(text:string)=>void;label:string;maxLength?:number;formId?:string;onReadyChange?:(ready:boolean)=>void}){
 const [text,setText]=useState(()=>{try{return localStorage.getItem(storageKey)?.slice(0,maxLength)??value}catch{return value}}),[error,setError]=useState('');
 const saved=!!text.trim()&&text===value,ready=!!text.trim()&&!saved;
 useEffect(()=>onReadyChange?.(ready),[ready]);
 return <form id={formId} className="assessment-draft" onSubmit={e=>{e.preventDefault();if(!ready)return;onSave(text);try{localStorage.removeItem(storageKey)}catch{}setError('')}}><label>{label}<textarea aria-label={label} placeholder="Escribe tu razonamiento aquí…" value={text} maxLength={maxLength} rows={4} required onChange={e=>{setText(e.target.value);try{localStorage.setItem(storageKey,e.target.value);setError('')}catch{setError('No se pudo conservar el borrador. Guarda antes de cerrar.')}}}/></label><div className="assessment-draft-status"><span data-saved={saved}>{saved?<><Check size={13}/>Guardada</>:text.trim()?'Borrador conservado':'Sin responder'}</span><small>{text.length}/{maxLength}</small></div>{error&&<p role="alert">{error}</p>}{!formId&&<button type="submit" className="lesson-action is-primary" disabled={!ready}>Guardar respuesta <ArrowRight size={16}/></button>}</form>;
}
