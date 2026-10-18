import type {KeyboardEvent,MutableRefObject,ReactNode} from 'react';
import {KIND_NAMES,OUTPUT_NAMES,TERMINALS,type Kind,type MeterRead,type Settings,type Solution,type Spec,type Terminal} from './physics';
import {JACKS,METER,OBJECT,PLC,PLC_ROW,SENSOR,STRIP,SUPPLY,TRACK,WORLD,cable,hangingCable,objectX,termPos,trackSpan} from './geometry';
import {WIRE_COLORS} from './datasheets';
import {formatMm,formatNumber,formatVolts} from './state';
export type Equipment='supply'|'sensor'|'object';
export type Tool='select'|'pan'|'wire'|'red'|'black';
export const displayText=(r:MeterRead)=>r.state==='off'?'':r.value===null?'':formatVolts(r.value);
const onKey=(run:()=>void)=>(e:KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();run();}};
/** Diámetro de rosca de cada modelo según su ficha (CR30: M30; XS118 y BR100: M18). El genérico usa M18. */
const THREAD:Record<string,number>={'CR30-15DN':30,'CR30-15DP':30,XS118BLPAL2:18,'BR100-DDT-P':18};
const BARREL_H:Record<number,number>={12:44,18:64,30:96};
const FACE:Record<Kind,string>={inductive:'#d9c25c',capacitive:'#ecece6',photo:'#3b2024'};
const LED_COLOR=(model:Settings['model'])=>model.startsWith('CR30')||model==='BR100-DDT-P'?'#ff4a4a':'#ffd23d';

type Props={settings:Settings;spec:Spec|null;pending:string;sol:Solution;reading:MeterRead;tool:Tool;wireFrom:Terminal|null;selected:Equipment|null;onSelect:(id:Equipment)=>void;onTerminal:(id:Terminal)=>void;refs:MutableRefObject<Partial<Record<Equipment,SVGGElement|null>>>};
export function BenchScene({settings:s,spec,pending,sol,reading,tool,wireFrom,selected,onSelect,onTerminal,refs}:Props){
  const equipment=(id:Equipment,label:string,children:ReactNode)=><g ref={el=>{refs.current[id]=el;}} className={`temp-equipment ${selected===id?'selected':''}`} role="button" tabIndex={0} aria-pressed={selected===id} aria-label={label} onClick={()=>{if(tool!=='pan')onSelect(id);}} onKeyDown={onKey(()=>onSelect(id))}>{children}</g>;
  const terminal=(id:Terminal,text:string)=>{
    const pos=termPos(id),used=s.red===id?'red':s.black===id?'black':'',joined=s.wires.some(w=>w.includes(id));
    return <g key={id} className={`det-terminal t-${id.replace('+','p').replace('-','m')} ${used} ${joined?'wired':''} ${wireFrom===id?'pending':''}`} role="button" tabIndex={0} aria-label={`${TERMINALS.find(x=>x.id===id)!.label}${used?` · punta ${used==='red'?'roja':'negra'} conectada`:''}${joined?' · con cable':''}${wireFrom===id?' · primer extremo del cable elegido':''}`} onClick={e=>{e.stopPropagation();onTerminal(id);}} onKeyDown={onKey(()=>onTerminal(id))}>
      <circle className="hit" cx={pos.x} cy={pos.y} r="19"/><circle className="screw" cx={pos.x} cy={pos.y} r="12"/><circle className="hole" cx={pos.x} cy={pos.y} r="4.5"/><text x={pos.x} y={pos.y-17} textAnchor="middle">{text}</text>
    </g>;
  };
  const range=spec?.range??0,span=trackSpan(spec?spec.range:null),ox=objectX(s.distance,span),zoneW=Math.min(span,range)*TRACK.w/span;
  const cy=SENSOR.y+SENSOR.h/2,sensorFace=SENSOR.x+SENSOR.w;
  const thread=THREAD[s.model]??18,bh=BARREL_H[thread],kind=spec?.kind??'inductive';
  const brWires=s.model==='BR100-DDT-P',cx=STRIP.x+125;
  const wireColor=(k:'plus'|'minus'|'out')=>brWires?'#98a3a9':WIRE_COLORS[k];
  const sensorLabel=spec?spec.label:pending?'sin ficha':'';
  const barrelX=SENSOR.x+46,barrelW=SENSOR.w-46-14;
  const supplyOnShown=s.supplyOn&&!sol.short;
  const plcX=(n:number)=>PLC_ROW.first+n*PLC_ROW.s;
  return <svg className="temp-bench det-bench" viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} width={WORLD.w} height={WORLD.h} role="group" aria-label="Banco de detectores: fuente, detector, objeto, PLC Delta y multímetro">
    <defs>
      <linearGradient id="det-metal" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#f3f5f6"/><stop offset=".45" stopColor="#cfd5d9"/><stop offset="1" stopColor="#97a1a8"/></linearGradient>
      <linearGradient id="det-body" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#fbfcfd"/><stop offset="1" stopColor="#e3e9ed"/></linearGradient>
      <linearGradient id="det-dark" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#46535c"/><stop offset="1" stopColor="#262f35"/></linearGradient>
      <linearGradient id="det-plc" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#eef0ee"/><stop offset="1" stopColor="#cdd2cf"/></linearGradient>
    </defs>
    <path className="temp-floor" d={`M20 ${WORLD.h-12}H${WORLD.w-20}`}/>

    {equipment('supply',`Fuente de 24 voltios, ${s.supplyOn?'encendida':'apagada'}. Abre su edición.`,<>
      <rect className="psu-body" x={SUPPLY.x} y={SUPPLY.y} width={SUPPLY.w} height={SUPPLY.h} rx="12"/>
      <rect className="psu-bezel" x={SUPPLY.x+14} y={SUPPLY.y+14} width={SUPPLY.w-28} height="30" rx="5"/>
      <text className="psu-brand" x={SUPPLY.x+26} y={SUPPLY.y+34}>FUENTE DC DE LABORATORIO</text>
      <rect className="det-screen" x={SUPPLY.x+22} y={SUPPLY.y+58} width={SUPPLY.w-44} height="62" rx="6"/>
      <text className="det-lcd" x={SUPPLY.x+SUPPLY.w-34} y={SUPPLY.y+102} textAnchor="end">{supplyOnShown?'24,00':'0,00'}</text><text className="det-lcd unit" x={SUPPLY.x+34} y={SUPPLY.y+102}>V</text>
      <circle className="psu-knob" cx={SUPPLY.x+64} cy={SUPPLY.y+156} r="22"/><circle className="psu-knob" cx={SUPPLY.x+SUPPLY.w-64} cy={SUPPLY.y+156} r="22"/>
      <path className="psu-pointer" d={`M${SUPPLY.x+64} ${SUPPLY.y+156}l9 -14`}/><path className="psu-pointer" d={`M${SUPPLY.x+SUPPLY.w-64} ${SUPPLY.y+156}l-12 -12`}/>
      <text className="det-small light" x={SUPPLY.x+64} y={SUPPLY.y+194} textAnchor="middle">TENSIÓN</text><text className="det-small light" x={SUPPLY.x+SUPPLY.w-64} y={SUPPLY.y+194} textAnchor="middle">CORRIENTE</text>
      <rect className="psu-switch" x={SUPPLY.x+SUPPLY.w/2-11} y={SUPPLY.y+140} width="22" height="34" rx="4"/><rect className={`psu-rocker ${s.supplyOn?'on':''}`} x={SUPPLY.x+SUPPLY.w/2-8} y={SUPPLY.y+(s.supplyOn?143:158)} width="16" height="13" rx="3"/>
      <circle className={`det-led ${supplyOnShown?'on':''}`} cx={SUPPLY.x+SUPPLY.w/2} cy={SUPPLY.y+126} r="5"/>
      <circle className="psu-gnd" cx={SUPPLY.x+120} cy={SUPPLY.y+222} r="10"/><text className="det-small light" x={SUPPLY.x+120} y={SUPPLY.y+248} textAnchor="middle">GND</text>
    </>)}
    <text className="det-small light" x={termPos('g-').x} y={termPos('g-').y+26} textAnchor="middle" aria-hidden="true">− 0 V</text><text className="det-small light" x={termPos('g+').x} y={termPos('g+').y+26} textAnchor="middle" aria-hidden="true">+ 24 V</text>
    <text className="temp-name" x={SUPPLY.x+SUPPLY.w/2} y={SUPPLY.y+SUPPLY.h+26} textAnchor="middle">{sol.short?'FUENTE · CORTOCIRCUITO':s.supplyOn?'FUENTE · ENCENDIDA':'FUENTE · APAGADA'}</text>

    <g className="det-zone" aria-hidden="true">{spec?<><rect x={sensorFace} y={cy-bh/2-4} width={zoneW} height={bh+8} rx="6"/><text x={sensorFace+4} y={cy-bh/2-10}>alcance {formatMm(range)}</text></>:null}</g>
    <path className="det-track" d={`M${sensorFace} ${cy+66}H${TRACK.x+TRACK.w+20}`} aria-hidden="true"/>
    {Array.from({length:5},(_,i)=>i*span/4).map(mm=><g key={mm} aria-hidden="true"><path className="det-tick" d={`M${objectX(mm,span)} ${cy+66}v8`}/><text className="det-small" x={objectX(mm,span)} y={cy+90} textAnchor="middle">{formatNumber(mm,mm%1?1:0)}</text></g>)}
    <text className="det-small" x={TRACK.x+TRACK.w+20} y={cy+108} textAnchor="end" aria-hidden="true">distancia al detector (mm)</text>

    <path className="det-sheath" d={`M${SENSOR.x+6} ${cy} C${SENSOR.x-44} ${cy} ${cx} ${STRIP.y-66} ${cx} ${STRIP.y+4}`} aria-hidden="true"/>
    {equipment('sensor',`Detector ${sensorLabel||'sin datos'}, ${sol.active?'detecta el objeto':sol.powered?'sin detección':'sin alimentación válida'}. Abre su edición.`,<>
      <rect className="det-gland" x={SENSOR.x+4} y={cy-bh/2+6} width="46" height={bh-12} rx="9"/>
      <rect className="det-barrel" x={barrelX} y={cy-bh/2} width={barrelW} height={bh} rx="5"/>
      {Array.from({length:Math.floor((barrelW-96)/7)},(_,i)=><path key={i} className="det-thread" d={`M${barrelX+92+i*7} ${cy-bh/2+1}v${bh-2}`}/>)}
      {[barrelX+30,barrelX+58].map(nx=><rect key={nx} className="det-nut" x={nx} y={cy-bh/2-6} width="18" height={bh+12} rx="3"/>)}
      <circle className="det-led out" cx={barrelX+12} cy={cy} r="5.5" style={sol.active?{fill:LED_COLOR(s.model),filter:`drop-shadow(0 0 6px ${LED_COLOR(s.model)})`}:undefined}/>
      <rect className="det-face" x={sensorFace-14} y={cy-bh/2+3} width="14" height={bh-6} rx="4" style={{fill:FACE[kind]}}/>
      {kind==='photo'?<><circle className="det-lens" cx={sensorFace-7} cy={cy-bh*0.16} r={bh*0.12}/><circle className="det-lens" cx={sensorFace-7} cy={cy+bh*0.16} r={bh*0.12}/></>:null}
    </>)}
    <text className="det-title" x={SENSOR.x+SENSOR.w/2} y={cy-bh/2-28} textAnchor="middle">{spec?`${KIND_NAMES[spec.kind].toUpperCase()} · ${OUTPUT_NAMES[spec.output]} · M${thread}`:'SIN DATOS'}</text>
    <text className="det-small" x={SENSOR.x+SENSOR.w/2} y={cy-bh/2-12} textAnchor="middle">{spec?(s.model==='generic'?'modelo genérico del banco':s.model):'pendiente de ficha técnica'}</text>
    <rect className="det-strip" x={STRIP.x} y={STRIP.y} width={STRIP.w} height={STRIP.h} rx="8" aria-hidden="true"/>
    <g className="det-wirefan" aria-hidden="true">{(['plus','minus','out'] as const).map((k,i)=>{const t=termPos(i===0?'s+':i===1?'s-':'so');return <path key={k} d={`M${cx} ${STRIP.y+4} C${cx} ${STRIP.y+24} ${t.x} ${STRIP.y+16} ${t.x} ${t.y}`} style={{stroke:wireColor(k)}}/>;})}</g>
    {([['s+','+V',brWires?'color pendiente':'marrón'],['s-','0 V',brWires?'color pendiente':'azul'],['so','OUT',brWires?'color pendiente':'negro']] as const).map(([id,text,color])=><text key={id} className="det-small" x={termPos(id).x} y={termPos(id).y+34} textAnchor="middle" aria-hidden="true">{text} · {color}</text>)}
    <text className="temp-name" x={STRIP.x+STRIP.w/2} y={STRIP.y+STRIP.h+28} textAnchor="middle">BORNERA DEL DETECTOR (3 HILOS)</text>

    {s.object!=='none'?equipment('object',`Objeto ${s.object==='metal'?'metálico':'no metálico'} a ${formatMm(s.distance)} del detector, ${sol.active?'detectado':'no detectado'}. Abre su edición.`,<>
      <rect className={`det-object ${s.object}`} x={ox} y={cy-OBJECT.h/2} width={OBJECT.w} height={OBJECT.h} rx="5"/>
      {s.object==='metal'?<path className="det-shine" d={`M${ox+8} ${cy-OBJECT.h/2+6}v${OBJECT.h-12}`}/>:null}
      <text className="det-small" x={ox+OBJECT.w/2} y={cy+OBJECT.h/2+14} textAnchor="middle">{s.object==='metal'?'metal':'plástico'}</text>
    </>):equipment('object','Sin objeto frente al detector. Abre su edición para colocar uno.',<g><rect className="det-object-none" x={TRACK.x+20} y={cy-OBJECT.h/2} width={OBJECT.w} height={OBJECT.h} rx="6"/><text className="det-small" x={TRACK.x+20+OBJECT.w/2} y={cy+4} textAnchor="middle">sin objeto</text></g>)}

    <g className="det-plc">
      <rect className="plc-body" x={PLC.x} y={PLC.y} width={PLC.w} height={PLC.h} rx="10"/>
      <rect className="plc-rail" x={PLC.x+24} y={PLC.y+14} width={PLC.w-48} height="74" rx="6"/>
      {Array.from({length:7},(_,i)=><g key={i} aria-hidden="true"><rect className="plc-dummy" x={plcX(i+2)-12} y={PLC_ROW.y-12} width="24" height="24" rx="4"/><text className="plc-tag" x={plcX(i+2)} y={PLC_ROW.y-17} textAnchor="middle">X{i+1}</text></g>)}
      {[0,1,2,3,4,5,6,7,8].map(n=><circle key={n} className={`plc-led ${n===1&&sol.plcOn?'on':''}`} cx={plcX(n)} cy={PLC_ROW.y+32} r="4" aria-hidden="true"/>)}
      <text className="plc-brand" x={PLC.x+40} y={PLC.y+130}>DELTA</text><text className="plc-model" x={PLC.x+40} y={PLC.y+152}>DVP · entrada digital (valores de la hoja DVP-SS2)</text>
      <text className="det-small" x={PLC.x+40} y={PLC.y+172}>maqueta del laboratorio: modelo y bornes pendientes de ficha</text><text className="det-small" x={PLC.x+40} y={PLC.y+188}>alimentación del PLC no modelada</text>
      <circle className={`det-led plc ${sol.plcOn?'on':''}`} cx={PLC.x+PLC.w-190} cy={PLC.y+126} r="10"/>
      <text className="det-lcd small" x={PLC.x+PLC.w-170} y={PLC.y+133}>X0 {sol.plcOn?'ON':'OFF'}</text>
      <text className="det-small" x={PLC.x+PLC.w-190} y={PLC.y+158}>tensión de entrada {formatVolts(sol.plcVolts)}</text>
      {[0,1,2,3].map(n=><rect key={n} className="plc-dummy out" x={PLC.x+PLC.w-170+n*36} y={PLC.y+PLC.h-30} width="26" height="16" rx="3" aria-hidden="true"/>)}
    </g>

    <g className="temp-meter">
      <rect className="meter-body" x={METER.x} y={METER.y} width={METER.w} height={METER.h} rx="22"/>
      <rect className="meter-screen" x={METER.x+20} y={METER.y+22} width={METER.w-40} height="96" rx="8"/>
      <text className={`meter-text ${reading.state}`} x={METER.x+METER.w-32} y={METER.y+84} textAnchor="end">{displayText(reading)}</text>
      <text className="meter-sub" x={METER.x+32} y={METER.y+48}>{s.mode==='off'?'APAGADO':'DC V'}</text>
      <circle className="meter-dial" cx={METER.x+METER.w/2} cy={METER.y+235} r="62"/>
      <text className={`meter-dial-label ${s.mode==='off'?'on':''}`} x={METER.x+METER.w/2-70} y={METER.y+190} textAnchor="middle">OFF</text><text className={`meter-dial-label ${s.mode==='V'?'on':''}`} x={METER.x+METER.w/2+70} y={METER.y+190} textAnchor="middle">V⎓</text>
      <line className="meter-pointer" x1={METER.x+METER.w/2} y1={METER.y+235} x2={METER.x+METER.w/2+(s.mode==='V'?36:-36)} y2={METER.y+235-36} /><circle className="meter-hub" cx={METER.x+METER.w/2} cy={METER.y+235} r="9"/>
      <text className="meter-jack-label" x={JACKS.black.x} y={JACKS.black.y-22} textAnchor="middle">COM</text><text className="meter-jack-label" x={JACKS.red.x} y={JACKS.red.y-22} textAnchor="middle">V</text>
      <circle className="jack black" cx={JACKS.black.x} cy={JACKS.black.y} r="13"/><circle className="jack red" cx={JACKS.red.x} cy={JACKS.red.y} r="13"/>
    </g>
    <text className="temp-name" x={METER.x+METER.w/2} y={METER.y+METER.h+30} textAnchor="middle">MULTÍMETRO DIGITAL (10 MΩ)</text>

    <g className="temp-wires det-wires" aria-hidden="true">{s.wires.map(([a,b],i)=><path key={`${a}${b}`} d={cable(a,b,i%4)}/>)}</g>
    <g className="temp-leads" aria-hidden="true">
      {s.black?<path className="lead black" d={hangingCable(JACKS.black,termPos(s.black),90)}/>:null}
      {s.red?<path className="lead red" d={hangingCable(JACKS.red,termPos(s.red),70)}/>:null}
    </g>
    {([['g+','+'],['g-','−'],['s+','+'],['s-','−'],['so','O'],['px','X0'],['pc','S/S']] as [Terminal,string][]).map(([id,text])=>terminal(id,text))}
  </svg>;
}
