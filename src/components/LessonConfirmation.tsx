import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {PracticeDocument} from '../data/practice';
import {connectedByCables} from '../data/wiring';
import {motionReduced} from '../motion/surface';
import '../styles/guide-confirmation.css';

/** Screen feedback remains active even while the floating guide is minimized. */
export function LessonConfirmation({practice,onAdvance,enabled,suspended=false}:{practice:PracticeDocument;onAdvance:()=>void;enabled:boolean;suspended?:boolean}){
 const step=practice.mode==='guided'&&practice.diagram?.id.startsWith('leccion-')?practice.steps[practice.stepIndex]:undefined;
 const key=step?.id,satisfied=!!step&&connectedByCables(step.from,step.to,practice.wires);
 const previous=useRef({key,wires:practice.wires,satisfied}),advance=useRef(onAdvance);advance.current=onAdvance;
 const [message,setMessage]=useState<{key:string;leaving:boolean}|null>(null);
 useEffect(()=>{
  if(suspended)return;
  const old=previous.current;previous.current={key,wires:practice.wires,satisfied};
  if(enabled&&key===old.key&&key&&satisfied&&!old.satisfied&&old.wires!==practice.wires)setMessage({key,leaving:false});
 },[key,satisfied,practice.wires,enabled,suspended]);
 useEffect(()=>{
  if(!message)return;
  if(!enabled||message.key!==key){setMessage(null);return;}
  const exit=setTimeout(()=>setMessage(m=>m?{...m,leaving:true}:null),motionReduced()?450:650);
  const next=setTimeout(()=>{setMessage(null);advance.current();},motionReduced()?600:850);
  return()=>{clearTimeout(exit);clearTimeout(next);};
 },[message?.key,key,enabled]);
 if(!message||!enabled||message.key!==key||typeof document==='undefined')return null;
 return createPortal(<div className={`guide-check-toast${message.leaving?' is-leaving':''}`} role="status" aria-live="polite" aria-atomic="true" data-guide-confirmation>
  <svg className="guide-check-mark" viewBox="0 0 80 80" aria-hidden="true"><circle className="guide-check-fill" cx="40" cy="40" r="34"/><circle className="guide-check-ring" cx="40" cy="40" r="34" pathLength="1"/><path className="guide-check-tick" d="m24 40 11 11 22-24" pathLength="1"/></svg>
  <div><strong>¡Cable correcto!</strong><span>Conexión comprobada</span></div>
 </div>,document.body);
}
