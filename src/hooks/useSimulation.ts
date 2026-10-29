import {traceState,type TraceAction,type SimulationEvent,type TraceState} from '../data/activityTrace';
import {useCallback,useEffect,useMemo,useRef,useState,type SetStateAction} from 'react';
import {emptySimulation,OFF_RELAYS,sameRelays,solveSimulation,timerIds,type RelayState,type SimulationInput} from '../data/simulation';
import type {BananaCable} from '../data/practice';
import {panelAmmeterBridge,panelElectrical,type PanelAmmeter,type PanelMeterModel} from '../data/panelElectrical';
import {advanceMotor,motorEquivalent,stoppedMotion} from '../data/panelMotorDynamics';
import {advanceClock,newClock,advanceTimers,advanceThermal,coldThermal,advancePowerContacts,openPowerContacts,type TimerBank} from '../data/panelRuntime';
import {CALIBRATION_KEY,defaultCalibration,readCalibration,type PanelCalibration} from '../data/panelCalibration';
const timedIds=(bank:TimerBank)=>Object.entries(bank).filter(([,v])=>v.done).map(([id])=>id);
const freshRuntime=()=>({clock:newClock(),events:[] as SimulationEvent[],actionSeq:0,timers:{} as TimerBank,power:openPowerContacts(),motion:stoppedMotion(),thermal:coldThermal(),relays:OFF_RELAYS(),direction:1 as 1|-1,lastFeed:false,lastMake:null as number|null,unbalancePct:0,thermalAmps:[0,0,0],protectionWarning:'',peakAmps:0,peakAt:0,result:solveSimulation([],emptySimulation()),fault:null as ReturnType<typeof solveSimulation>['fault']});
function appendEvent(s:ReturnType<typeof freshRuntime>,action:TraceAction,before:TraceState,after:TraceState){s.actionSeq++;s.events=[...s.events,{...action,id:s.actionSeq,seconds:s.clock.seconds,before,after}].slice(-128);}
export function useSimulation(wires:BananaCable[],active:boolean,onAction?:(input:SimulationInput,label:string)=>void,live=true){
 const [input,setInput]=useState<SimulationInput>(emptySimulation),current=useRef(input),listener=useRef(onAction);listener.current=onAction;
 const [calibration,setCalibration]=useState<PanelCalibration>(defaultCalibration),[loaded,setLoaded]=useState(false),storageBlocked=useRef(false);
 const [message,setMessage]=useState(''),[fault,setFault]=useState<ReturnType<typeof solveSimulation>['fault']>(null),[meter,setMeter]=useState<PanelAmmeter|null>(null);
 const [timerSeconds,setTimerValue]=useState(4),[manualPaused,setManualPaused]=useState(false),pauseRef=useRef(false),[background,setBackground]=useState(false);
 const state=useRef(freshRuntime()),[snapshot,setSnapshot]=useState(state.current),publish=useRef(0);
 const config=useRef({wires,active,live,calibration,timerSeconds,meter});config.current={wires,active,live,calibration,timerSeconds,meter};
 // Reuse the unpowered, settled result until an input or topology changes.
 // Coasting, cooling and pending contacts must continue to advance normally.
 const resting=useRef<{wires:BananaCable[];input:SimulationInput;calibration:PanelCalibration;live:boolean;meter:PanelAmmeter|null}|null>(null);
 const update=useCallback((change:(s:SimulationInput)=>SimulationInput,label:string,automatic=false,action?:TraceAction)=>{
  if(pauseRef.current&&!automatic)return;const next=change(current.current);if(JSON.stringify(next)===JSON.stringify(current.current))return;
  const before=traceState(current.current,state.current.relays,state.current.motion.rpm);
  current.current=next;const c=config.current,logical={...next,enabled:next.enabled&&c.active&&!state.current.fault&&c.live};
  const bridge=panelAmmeterBridge(c.wires,{...logical,powerContacts:state.current.power.positions},state.current.relays,timedIds(state.current.timers),{...c.calibration.model,rotorRpm:state.current.motion.rpm,motorDirection:state.current.direction},c.meter);state.current.relays=solveSimulation(bridge?[...c.wires,bridge]:c.wires,logical,state.current.relays,timedIds(state.current.timers)).relays;
  if(action)appendEvent(state.current,action,before,traceState(logical,state.current.relays,state.current.motion.rpm));
  setInput(next);listener.current?.(next,label);
 },[]);
 useEffect(()=>{try{const raw=localStorage.getItem(CALIBRATION_KEY);if(raw)setCalibration(readCalibration(JSON.parse(raw)));}catch{storageBlocked.current=true;setMessage('El perfil anterior no se pudo leer y se conserva. Se usa un banco didáctico temporal.');}setLoaded(true);},[]);
 useEffect(()=>{if(!loaded||storageBlocked.current)return;try{localStorage.setItem(CALIBRATION_KEY,JSON.stringify(calibration));}catch{setMessage('No se pudo guardar el perfil; descárgalo antes de salir.');}},[calibration,loaded]);
 useEffect(()=>{
  const visibility=()=>{const hidden=document.hidden;setBackground(hidden);state.current.clock=advanceClock(state.current.clock,performance.now(),!hidden&&!pauseRef.current&&config.current.active).clock;setSnapshot({...state.current,clock:{...state.current.clock}});};
  visibility();document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',visibility);window.addEventListener('pageshow',visibility);
  const tick=setInterval(()=>{
   const c=config.current,s=state.current,now=performance.now(),clock=advanceClock(s.clock,now,!document.hidden&&!pauseRef.current&&c.active);s.clock=clock.clock;if(!clock.dt)return;
   const dt=clock.dt,t=s.clock.seconds,raw=current.current,base={...raw,enabled:raw.enabled&&c.active&&!s.fault&&c.live},settings=c.calibration;
   const settled=(!base.enabled||!raw.plugged)&&s.motion.rpm===0&&s.thermal.heat===0&&!Object.values(s.relays).some(Boolean)&&!Object.values(s.power.positions).some(Boolean)&&!Object.keys(s.power.pending).length&&!Object.keys(s.timers).length;
   const cached=resting.current;
   if(settled&&cached&&cached.wires===c.wires&&cached.input===raw&&cached.calibration===settings&&cached.live===base.enabled&&cached.meter===c.meter)return;
   resting.current=null;
   let model:PanelMeterModel={...settings.model,rotorRpm:s.motion.rpm,motorDirection:s.direction,resistanceMode:settings.resistanceMode,providedResistances:settings.resistances,simulationSeconds:t,lastMakeSeconds:s.lastMake};
   const logicalBridge=panelAmmeterBridge(c.wires,{...base,powerContacts:s.power.positions},s.relays,timedIds(s.timers),model,c.meter),logicalWires=logicalBridge?[...c.wires,logicalBridge]:c.wires;
   let command=solveSimulation(logicalWires,base,s.relays,timedIds(s.timers));
   const previouslyTimed=timedIds(s.timers),timerBefore=traceState(base,command.relays,s.motion.rpm);
   s.timers=advanceTimers(s.timers,base.enabled?command.relays:OFF_RELAYS(),timerIds(),t,c.timerSeconds);command=solveSimulation(logicalWires,base,command.relays,timedIds(s.timers));s.relays=command.relays;
   for(const id of timedIds(s.timers))if(!previouslyTimed.includes(id))appendEvent(s,{kind:'timer',control:id},timerBefore,traceState(base,command.relays,s.motion.rpm));
   const oldPositions=s.power.positions;s.power=advancePowerContacts(s.power,base.enabled?command.relays:OFF_RELAYS(),command.motor.connection,t,settings.contacts);
   const physical={...base,powerContacts:s.power.positions},timed=timedIds(s.timers);let actual=solveSimulation(logicalWires,physical,command.relays,timed);
   if(command.fault&&!s.fault){s.fault=command.fault;setFault(command.fault);update(v=>({...v,forceBreaker:false,breakers:[false,false],pressed:[]}),'Protección virtual · '+command.fault,true);}
   if(s.power.gapUntil>t&&actual.motor.status!=='running')actual={...actual,motor:{...actual.motor,status:'off',message:'Transición abierta: espera antes del cierre de la siguiente conexión.'}};
   if(command.motor.status==='running')s.direction=command.motor.direction;model={...model,motorDirection:s.direction};
   let net=panelElectrical(c.wires,physical,actual.relays,timed,model,logicalBridge?c.meter??undefined:undefined);
   const fed=base.enabled&&raw.plugged&&raw.forceBreaker&&!actual.fault&&!!net.connection&&(net.positiveVolts>1||net.negativeVolts>1);
   if(fed&&!s.lastFeed){s.lastMake=t;model={...model,lastMakeSeconds:t};net=panelElectrical(c.wires,physical,actual.relays,timed,model,logicalBridge?c.meter??undefined:undefined);}s.lastFeed=fed;
   const phase=Math.sqrt(['U','V','W'].reduce((sum,p)=>sum+(net.voltage(`BORNERA_MOTOR:${p}1`,`BORNERA_MOTOR:${p}2`)??0)**2,0)/3),direction=s.direction;
   const motionModel={...model,positiveVolts:net.positiveVolts,negativeVolts:net.negativeVolts};let motion=s.motion;const steps=Math.max(1,Math.ceil(dt/.02));for(let i=0;i<steps;i++)motion=advanceMotor(motion,motionModel,phase,fed,direction,dt/steps);s.motion=motion;
   s.unbalancePct=fed?net.unbalancePct:0;const amps=Math.max(...Object.values(net.lineAmps));if(amps>s.peakAmps||t-s.peakAt>5){s.peakAmps=amps;s.peakAt=t;}
   s.thermalAmps=net.thermalAmps;s.protectionWarning=raw.thermalTripped&&(actual.relays.CONTACTOR_TERMICO||actual.motor.status==='running')?(actual.relays.CONTACTOR_TERMICO?'El térmico está disparado y KM1 sigue energizado: revisa el circuito de mando 95–96.':'El térmico está disparado y el motor sigue alimentado: revisa el circuito de mando 95–96.'):net.thermalBypassed?'Hay una ruta paralela a los polos del térmico: la protección no queda validada.':'';
   const thermal=advanceThermal(s.thermal,base.enabled&&raw.forceBreaker&&!net.fault?Math.max(...net.thermalAmps):0,settings.thermal,dt);s.thermal=thermal;
   if(thermal.tripped&&!raw.thermalTripped){update(v=>({...v,thermalTripped:true,pressed:[]}),'Relé térmico · sobrecorriente sostenida',true);setMessage('Disparo térmico automático. Corrige la causa y espera a que la memoria térmica permita rearmar.');}
   s.result={...actual,motor:{...actual.motor,speed:settings.model.motorMode==='induction'?Math.min(1,Math.abs(motion.rpm)/motorEquivalent(model).syncRpm):actual.motor.speed}};
   if(settled)resting.current={wires:c.wires,input:raw,calibration:settings,live:base.enabled,meter:c.meter};
   if(settled||now-publish.current>=100||!sameRelays(oldPositions,s.power.positions)){publish.current=now;setSnapshot({...s,clock:{...s.clock},power:{...s.power},thermal:{...s.thermal}});}
  },40);
  return()=>{clearInterval(tick);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',visibility);window.removeEventListener('pageshow',visibility);};
 },[update]);
 const togglePause=useCallback(()=>{pauseRef.current=!pauseRef.current;setManualPaused(pauseRef.current);state.current.clock=advanceClock(state.current.clock,performance.now(),!document.hidden&&!pauseRef.current&&config.current.active).clock;setSnapshot({...state.current,clock:{...state.current.clock}});},[]);
 const setTimerSeconds=useCallback((seconds:number)=>{if(pauseRef.current)return;if(!Number.isFinite(seconds)||seconds<=0||seconds>60)return;setTimerValue(seconds);},[]);
 const enabled=input.enabled&&active&&!fault&&live;
 const canReset=snapshot.thermal.heat<=calibration.thermal.resetLevel;
 const resetThermal=useCallback(()=>{if(state.current.thermal.heat>config.current.calibration.thermal.resetLevel){setMessage('El térmico sigue caliente. Espera a que enfríe antes de RESET.');return false;}state.current.thermal={...state.current.thermal,tripped:false,reason:null};return true;},[]);
 const enable=useCallback((value:boolean)=>{if(pauseRef.current){pauseRef.current=false;setManualPaused(false);state.current.clock=advanceClock(state.current.clock,performance.now(),!document.hidden&&config.current.active).clock;}const s=state.current;s.timers={};s.power=openPowerContacts();s.relays=OFF_RELAYS();s.fault=null;s.lastFeed=false;if(!value)s.motion=stoppedMotion();setFault(null);update(v=>({...v,enabled:value,plugged:false,forceBreaker:false,breakers:[false,false],pressed:[]}),value?'Activar simulación virtual':'Detener simulación virtual');},[update]);
 const plug=useCallback((value:boolean)=>{if(pauseRef.current||!current.current.enabled||!config.current.active)return;state.current.timers={};update(s=>({...s,plugged:value,pressed:[]}),value?'Conectar enchufe virtual':'Desconectar enchufe virtual');},[update]);
 const switchForce=useCallback(()=>{if(enabled)update(s=>({...s,forceBreaker:!s.forceBreaker}),'Cambiar interruptor FUERZA');},[enabled,update]);
 const switchBreaker=useCallback((i:0|1)=>{if(enabled)update(s=>({...s,breakers:s.breakers.map((v,j)=>j===i?!v:v) as [boolean,boolean]}),'Cambiar CONTROL '+(i+1));},[enabled,update]);
 const press=useCallback((id:string,down:boolean)=>{if(enabled)update(s=>({...s,pressed:down?[...new Set([...s.pressed,id])]:s.pressed.filter(p=>p!==id)}),(down?'Pulsar ':'Soltar ')+id,false,down?{kind:'press',control:id}:undefined);},[enabled,update]);
 const trip=useCallback(()=>{if(pauseRef.current||!enabled)return;if(current.current.thermalTripped){if(!resetThermal())return;update(s=>({...s,thermalTripped:false,pressed:[]}),'RESET · rearmar térmico',false,{kind:'thermalReset'});}else{state.current.thermal={...state.current.thermal,tripped:true,reason:'TEST'};update(s=>({...s,thermalTripped:true,pressed:[]}),'TEST · disparar térmico',false,{kind:'test'});}},[enabled,resetThermal,update]);
 const reset=useCallback(()=>{if(pauseRef.current)return;if(!resetThermal())return;state.current.fault=null;state.current.timers={};state.current.relays=OFF_RELAYS();setFault(null);update(s=>({...s,breakers:[false,false],pressed:[],thermalTripped:false}),'Rearmar mando virtual');},[update,resetThermal]);
 useEffect(()=>{const release=()=>{if(current.current.pressed.length)update(s=>({...s,pressed:[]}),'Soltar pulsadores',true);};window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);window.addEventListener('blur',release);window.addEventListener('keyup',release);return()=>{window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',release);window.removeEventListener('blur',release);window.removeEventListener('keyup',release);};},[update]);
 useEffect(()=>{if(!active){update(()=>emptySimulation(),'Detener simulación al salir',true);state.current.relays=OFF_RELAYS();state.current.timers={};state.current.motion=stoppedMotion();state.current.power=openPowerContacts();state.current.fault=null;setFault(null);}},[active,update]);
 const setMeterModel=useCallback((change:SetStateAction<PanelMeterModel>)=>{if(pauseRef.current)return;setCalibration(old=>({...old,model:{...(typeof change==='function'?change(old.model):change),motorMode:'induction'}}));},[]);
 const applyCalibration=useCallback((raw:unknown)=>{if(current.current.plugged||Math.abs(state.current.motion.rpm)>1){setMessage('Desenchufa y espera a que se detenga el motor antes de aplicar el perfil.');return false;}try{const next=readCalibration(raw);if(storageBlocked.current){const previous=localStorage.getItem(CALIBRATION_KEY);if(previous)localStorage.setItem(CALIBRATION_KEY+':recovery:'+Date.now(),previous);}storageBlocked.current=false;setCalibration(next);setMessage('Perfil aplicado. Los datos ingresados requieren verificación con el equipo y el docente.');return true;}catch(e){setMessage(String(e));return false;}},[]);
 const timed=useMemo(()=>timedIds(snapshot.timers),[snapshot.timers]),timerStatus=useMemo(()=>Object.fromEntries(Object.entries(snapshot.timers).map(([id,t])=>[id,{remaining:t.done?0:Math.max(0,t.duration-(snapshot.clock.seconds-t.start)),progress:t.done?1:Math.max(0,Math.min(1,(snapshot.clock.seconds-t.start)/t.duration))}])),[snapshot.timers,snapshot.clock.seconds]);
 const meterModel:PanelMeterModel=useMemo(()=>({...calibration.model,rotorRpm:snapshot.motion.rpm,motorDirection:snapshot.direction,simulationSeconds:snapshot.clock.seconds,lastMakeSeconds:snapshot.lastMake,resistanceMode:calibration.resistanceMode,providedResistances:calibration.resistances}),[calibration,snapshot.motion,snapshot.direction,snapshot.clock.seconds,snapshot.lastMake]);
 return {events:snapshot.events,actionSeq:snapshot.actionSeq,input:{...input,powerContacts:snapshot.power.positions},result:snapshot.result,fault,timed,timerStatus,timerSeconds,setTimerSeconds,meterModel,setMeterModel,motorMotion:snapshot.motion,setMeter,enabled,enable,plug,switchForce,reset,switchBreaker,press,trip,paused:manualPaused||background||!active,togglePause,simulationSeconds:snapshot.clock.seconds,thermal:snapshot.thermal,thermalAmps:snapshot.thermalAmps,protectionWarning:snapshot.protectionWarning,canReset,calibration,applyCalibration,message,transitioning:snapshot.power.gapUntil>snapshot.clock.seconds,unbalancePct:snapshot.unbalancePct,peakAmps:snapshot.peakAmps};
}
export type SimulationController=ReturnType<typeof useSimulation>;
