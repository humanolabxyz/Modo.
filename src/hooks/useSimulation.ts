import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {emptySimulation,OFF_RELAYS,sameRelays,solveSimulation,timerIds,type RelayState,type SimulationInput} from '../data/simulation';
import type {BananaCable} from '../data/practice';
export function useSimulation(wires:BananaCable[],active:boolean,onAction?:(input:SimulationInput,label:string)=>void,live=true){
 const [input,setInput]=useState<SimulationInput>(emptySimulation),[relays,setRelays]=useState<RelayState>(OFF_RELAYS),[fault,setFault]=useState<'short'|'unstable'|null>(null);
 /* Temporizadores: `timed` guarda los que ya cumplieron su retardo. Se calcula con tiempo real, no se registra en el historial. */
 const [timed,setTimed]=useState<string[]>([]),[timerSeconds,setTimerSeconds]=useState(4),pending=useRef(new Map<string,ReturnType<typeof setTimeout>>());
 const current=useRef(input),listener=useRef(onAction);listener.current=onAction;
 const update=useCallback((change:(s:SimulationInput)=>SimulationInput,label:string)=>{const next=change(current.current);if(JSON.stringify(next)===JSON.stringify(current.current))return;current.current=next;setInput(next);listener.current?.(next,label);},[]);
 const effective=useMemo(()=>({...input,enabled:input.enabled&&active&&!fault&&live}),[input,active,fault,live]);
 const result=useMemo(()=>solveSimulation(wires,effective,relays,timed),[wires,effective,relays,timed]);
 useEffect(()=>{
  const energized=new Set(effective.enabled?timerIds().filter(id=>result.relays[id]):[]);
  for(const [id,handle] of pending.current)if(!energized.has(id)){clearTimeout(handle);pending.current.delete(id)}
  for(const id of energized)if(!pending.current.has(id)&&!timed.includes(id))pending.current.set(id,setTimeout(()=>{pending.current.delete(id);setTimed(t=>t.includes(id)?t:[...t,id])},timerSeconds*1000));
  setTimed(t=>{const keep=t.filter(id=>energized.has(id));return keep.length===t.length?t:keep});
 },[result.relays,timed,effective.enabled,timerSeconds]);
 useEffect(()=>()=>{pending.current.forEach(clearTimeout)},[]);
 useEffect(()=>{
  if(result.fault){setFault(result.fault);update(s=>({...s,breakers:[false,false],pressed:[]}),'Protección virtual · '+result.fault);setRelays(OFF_RELAYS());return;}
  if(!sameRelays(result.relays,relays))setRelays(result.relays);
 },[result,relays,update]);
 const release=useCallback(()=>update(s=>s.pressed.length?{...s,pressed:[]}:s,'Soltar pulsadores'),[update]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key===' '||e.key==='Enter')release()};window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);window.addEventListener('blur',release);window.addEventListener('keyup',key);return()=>{window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',release);window.removeEventListener('blur',release);window.removeEventListener('keyup',key)}},[release]);
 useEffect(()=>{if(!active){update(()=>emptySimulation(),'Detener simulación al salir');setRelays(OFF_RELAYS());setFault(null)}},[active,update]);
 const enable=(value:boolean)=>{update(s=>({...s,enabled:value,plugged:false,forceBreaker:false,breakers:[false,false],pressed:[]}),value?'Activar simulación virtual':'Detener simulación virtual');setRelays(OFF_RELAYS());setFault(null)};
 const plug=(value:boolean)=>{if(!current.current.enabled||!active)return;update(s=>({...s,plugged:value,pressed:[]}),value?'Conectar enchufe virtual':'Desconectar enchufe virtual');setRelays(OFF_RELAYS())};
 const switchForce=()=>{if(!effective.enabled)return;update(s=>({...s,forceBreaker:!s.forceBreaker}),'Cambiar interruptor FUERZA')};
 const reset=()=>{update(s=>({...s,breakers:[false,false],pressed:[],thermalTripped:false}),'Rearmar mando virtual');setRelays(OFF_RELAYS());setFault(null)};
 const switchBreaker=(index:0|1)=>{if(!effective.enabled)return;update(s=>({...s,breakers:s.breakers.map((v,i)=>i===index?!v:v) as [boolean,boolean]}),'Cambiar interruptor CONTROL '+(index+1))};
 const press=(id:string,down:boolean)=>{if(!effective.enabled)return;update(s=>({...s,pressed:down?[...new Set([...s.pressed,id])]:s.pressed.filter(p=>p!==id)}),(down?'Pulsar ':'Soltar ')+id)};
 return {input,result,fault,timed,timerSeconds,setTimerSeconds,enabled:effective.enabled,enable,plug,switchForce,reset,switchBreaker,press,trip:()=>{if(effective.enabled)update(s=>({...s,thermalTripped:!s.thermalTripped}),'Cambiar estado del relé térmico virtual')}};
}
export type SimulationController=ReturnType<typeof useSimulation>;
