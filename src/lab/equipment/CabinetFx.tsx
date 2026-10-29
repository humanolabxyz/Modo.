import {memo,useEffect,useMemo,useRef} from 'react';
import {Rotor} from './IndustrialArt';
import {FLOW} from './CabinetCable';
import {FAN,PUMP} from './CabinetScene';

export type FxFlow={id:string;path:string;route:string};
export type FxMotor={x:number;y:number;on:boolean;reverse:boolean;frequency:number};

/** Capa de efectos con composición propia: corriente en los cables, rotores y agua. Los rotores son <svg> independientes.
 *  Todo lo que se mueve de forma continua vive aquí, así el tablero estático no se repinta en cada fotograma. */
export const CabinetFx=memo(function CabinetFx({width,height,flows,motor,pumpOn,pumpReverse,pumpHz,fanOn=false}:{width:number;height:number;flows:FxFlow[];motor?:FxMotor|null;pumpOn:boolean;pumpReverse:boolean;pumpHz:number;fanOn?:boolean}){
 /* Un solo trazo por tipo de cable: menos nodos que repintar en cada paso. */
 const byRoute=useMemo(()=>flows.reduce<Record<string,string>>((all,f)=>({...all,[f.route]:(all[f.route]?all[f.route]+' ':'')+f.path}),{}),[flows]);
 const flowRef=useRef<SVGGElement>(null),waterRef=useRef<SVGGElement>(null),moving=flows.length>0||pumpOn;
 /* stroke-dashoffset no se compone en GPU: animarlo con CSS repinta a 60 Hz. A ~11 Hz el movimiento se lee igual y cuesta una sexta parte. */
 useEffect(()=>{
  if(!moving||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const start=performance.now(),timer=setInterval(()=>{if(document.hidden)return;const t=((performance.now()-start)/1100)%1;if(flowRef.current)flowRef.current.style.strokeDashoffset=String(-t*24.1);if(waterRef.current)waterRef.current.style.strokeDashoffset=String(-t*30);},90);
  return()=>clearInterval(timer);
 },[moving]);
 return <div className="cab-fx-layer" style={{width,height}} aria-hidden="true" data-fx-layer={flows.length?'live':'idle'}>
  <svg className="cab-fx-flow" viewBox={`0 0 ${width} ${height}`} width={width} height={height} focusable="false">
  <g ref={flowRef}>{Object.entries(byRoute).map(([route,d])=><path key={route} className="cab-cable-flow" d={d} style={{stroke:(FLOW[route]??FLOW.control).spark,strokeWidth:2.2}}/>)}</g>
  <g ref={waterRef}>{pumpOn?PUMP.pipes.map(d=><path key={d} className="fx-water" d={d}/>):null}</g>
  </svg>
  {motor?<Rotor cx={motor.x+139} cy={motor.y+77} r={12.5} on={motor.on} reverse={motor.reverse} frequency={motor.frequency||50}/>:null}
  <Rotor cx={FAN.x-1} cy={FAN.y} r={FAN.r} on={fanOn} frequency={50} blades={7}/>
  <Rotor cx={PUMP.x} cy={PUMP.y} r={PUMP.r} on={pumpOn} reverse={pumpReverse} frequency={pumpHz||50} blades={5}/>
 </div>;
});
