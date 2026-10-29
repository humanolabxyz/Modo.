import {useEffect,useState} from 'react';
export const ACADEMIC_KEY='modo:estudio:academic:v1';
export type StepRecord={answer:string;checked:boolean;attempts:number;draft:Record<string,string>;note:string};
export type AcademicProgress={step:number;updated:string;steps:Record<string,StepRecord>};
export type AcademicState={version:1;lessons:Record<string,AcademicProgress>};
export const freshAcademic=():AcademicState=>({version:1,lessons:{}});
const record=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const safeKey=(key:string)=>/^[\w-]{1,100}$/.test(key)&&!['__proto__','prototype','constructor'].includes(key);
export function readAcademic(raw:unknown):AcademicState {
  if(!record(raw)||raw.version!==1||!record(raw.lessons)||Object.keys(raw.lessons).length>200)throw Error('Formato o versión incompatible');
  const lessons:AcademicState['lessons']={};
  for(const [id,entry] of Object.entries(raw.lessons)){
    if(!safeKey(id)||!record(entry)||!Number.isInteger(entry.step)||Number(entry.step)<0||Number(entry.step)>200||typeof entry.updated!=='string'||!Number.isFinite(Date.parse(entry.updated))||!record(entry.steps))throw Error('Clase inválida');
    const steps:AcademicProgress['steps']={};
    if(Object.keys(entry.steps).length>200)throw Error('Demasiados pasos');
    for(const [key,s] of Object.entries(entry.steps)){
      if(!safeKey(key)||!record(s)||typeof s.answer!=='string'||s.answer.length>10000||typeof s.checked!=='boolean'||!Number.isInteger(s.attempts)||Number(s.attempts)<0||typeof s.note!=='string'||s.note.length>10000||!record(s.draft)||Object.keys(s.draft).length>100)throw Error('Paso inválido');
      const draft:Record<string,string>={};
      for(const [k,v] of Object.entries(s.draft)){if(!safeKey(k)||typeof v!=='string'||v.length>20000)throw Error('Dato inválido');draft[k]=v;}
      steps[key]={answer:s.answer,checked:s.checked,attempts:Number(s.attempts),note:s.note,draft};
    }
    lessons[id]={step:Number(entry.step),updated:entry.updated,steps};
  }
  return {version:1,lessons};
}
export const freshStep=():StepRecord=>({answer:'',checked:false,attempts:0,draft:{},note:''});
export function useAcademicState(){
  const [state,setState]=useState<AcademicState>(freshAcademic),[ready,setReady]=useState(false),[error,setError]=useState(''),[blocked,setBlocked]=useState(false);
  useEffect(()=>{const sync=()=>{try{const raw=localStorage.getItem(ACADEMIC_KEY);setState(raw?readAcademic(JSON.parse(raw)):freshAcademic());setBlocked(false);setError('');}catch{setBlocked(true);setError('No se pudo leer el respaldo de estas clases. Se conserva el original; expórtalo antes de reemplazarlo.');}setReady(true);};sync();const listener=(e:StorageEvent)=>{if(e.key===ACADEMIC_KEY)sync();};window.addEventListener('storage',listener);window.addEventListener('modo-academic-update',sync);return()=>{window.removeEventListener('storage',listener);window.removeEventListener('modo-academic-update',sync);};},[]);
  const commit=(next:AcademicState)=>{if(blocked)return;try{localStorage.setItem(ACADEMIC_KEY,JSON.stringify(next));setState(next);setError('');window.dispatchEvent(new Event('modo-academic-update'));}catch{setState(next);setError('No se pudo guardar. Exporta el respaldo antes de salir.');}};
  const update=(id:string,step:number,key?:string,change?:Partial<StepRecord>)=>{
    const old=state.lessons[id]||{step:0,updated:'',steps:{}};
    commit({...state,lessons:{...state.lessons,[id]:{...old,step,updated:new Date().toISOString(),steps:key?{...old.steps,[key]:{...(old.steps[key]||freshStep()),...change}}:old.steps}}});
  };
  const restore=(text:string)=>{const next=readAcademic(JSON.parse(text));localStorage.setItem(ACADEMIC_KEY,JSON.stringify(next));setState(next);setBlocked(false);setError('');window.dispatchEvent(new Event('modo-academic-update'));};
  const download=()=>{let text=JSON.stringify(state,null,2);if(blocked){try{text=localStorage.getItem(ACADEMIC_KEY)||text;}catch{/* export current memory */}}const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='modo-estudio-clases.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  return {state,ready,error,blocked,update,restore,download};
}
