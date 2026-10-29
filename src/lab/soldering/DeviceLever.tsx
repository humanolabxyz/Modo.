import {useRef,type PointerEvent} from 'react';
export function DeviceLever({label,on,onToggle,upper='ON',lower='OFF'}:{label:string;on:boolean;onToggle:()=>void;upper?:string;lower?:string}){
 const start=useRef<{y:number}|null>(null),handled=useRef(-Infinity);
 const up=(e:PointerEvent<HTMLButtonElement>)=>{if(!start.current)return;e.preventDefault();e.stopPropagation();const dy=e.clientY-start.current.y;start.current=null;handled.current=performance.now();if(Math.abs(dy)<8||(dy<0&&!on)||(dy>0&&on))onToggle();};
 return <button className={`device-lever lab-hmi-button ${on?'lever-on':''}`} type="button" aria-label={label} aria-pressed={on} onPointerDown={e=>{e.stopPropagation();start.current={y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerUp={up} onPointerCancel={()=>{start.current=null;}} onClick={e=>{if(e.detail>0&&performance.now()-handled.current<700)return;onToggle();}}><span>{upper}</span><i className="lever-slot"><b/></i><span>{lower}</span></button>;
}
