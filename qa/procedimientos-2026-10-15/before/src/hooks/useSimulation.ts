import {useCallback,useEffect,useMemo,useState} from 'react';
import {emptySimulation,OFF_RELAYS,solveSimulation,type RelayState,type SimulationInput} from '../data/simulation';
import type {BananaCable} from '../data/practice';
export function useSimulation(wires:BananaCable[],active:boolean){
 const [input,setInput]=useState<SimulationInput>(emptySimulation),[relays,setRelays]=useState<RelayState>(OFF_RELAYS),[fault,setFault]=useState<'short'|'unstable'|null>(null);
 const effective=useMemo(()=>({...input,enabled:input.enabled&&active&&!fault}),[input,active,fault]);
 const result=useMemo(()=>solveSimulation(wires,effective,relays),[wires,effective,relays]);
 useEffect(()=>{
  if(result.fault){setFault(result.fault);setInput(s=>({...s,breakers:[false,false],pressed:[]}));setRelays(OFF_RELAYS());return;}
  if(result.relays.CONTACTOR_TERMICO!==relays.CONTACTOR_TERMICO||result.relays.CONTACTOR_TRIFASICO!==relays.CONTACTOR_TRIFASICO)setRelays(result.relays);
 },[result,relays]);
 const release=useCallback(()=>setInput(s=>s.pressed.length?{...s,pressed:[]}:s),[]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key===' '||e.key==='Enter')release()};window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);window.addEventListener('blur',release);window.addEventListener('keyup',key);return()=>{window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',release);window.removeEventListener('blur',release);window.removeEventListener('keyup',key)}},[release]);
 useEffect(()=>{if(!active){setInput(emptySimulation());setRelays(OFF_RELAYS());setFault(null)}},[active]);
 const enable=(value:boolean)=>{setInput(s=>({...s,enabled:value,plugged:false,forceBreaker:false,breakers:[false,false],pressed:[]}));setRelays(OFF_RELAYS());setFault(null)};
 const plug=(value:boolean)=>{if(!input.enabled||!active)return;setInput(s=>({...s,plugged:value,pressed:[]}));setRelays(OFF_RELAYS())};
 const switchForce=()=>{if(!effective.enabled)return;setInput(s=>({...s,forceBreaker:!s.forceBreaker}))};
 const reset=()=>{setInput(s=>({...s,breakers:[false,false],pressed:[],thermalTripped:false}));setRelays(OFF_RELAYS());setFault(null)};
 const switchBreaker=(index:0|1)=>{if(!effective.enabled)return;setInput(s=>({...s,breakers:s.breakers.map((v,i)=>i===index?!v:v) as [boolean,boolean]}))};
 const press=(id:string,down:boolean)=>{if(!effective.enabled)return;setInput(s=>({...s,pressed:down?[...new Set([...s.pressed,id])]:s.pressed.filter(p=>p!==id)}))};
 return {input,result,fault,enabled:effective.enabled,enable,plug,switchForce,reset,switchBreaker,press,trip:()=>{if(effective.enabled)setInput(s=>({...s,thermalTripped:!s.thermalTripped}))}};
}
export type SimulationController=ReturnType<typeof useSimulation>;
