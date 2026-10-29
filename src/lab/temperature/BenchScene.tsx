import {BenchMeter,ManualLeads,svgPoint} from '../ManualBench';
import type {KeyboardEvent,MutableRefObject,ReactNode} from 'react';
import {STABLE_BAND,TERMINALS,isStable,type Reading,type Settings,type Temps,type Terminal} from './physics';
import {BATH,METER,PROBE_X,PSU,PSU_JACKS,STEM,TX,TX_IN,TX_PWR,WORLD,headTop,riseCable,termPos} from './geometry';
import {formatTemp,formatValue,type Unit} from './state';
/** Escena del banco dibujada a partir de equipos reales: calibrador de bloque seco, sondas con cabezal de aluminio, transmisor azul de riel DIN,
 *  fuente de laboratorio y multímetro de mano. Son dibujos propios hechos con fotos comerciales como referencia. */
export type Equipment='bath'|'tc'|'pt'|'tx'|'psu';
export type Tool='select'|'pan'|'red'|'black';
export const displayText=(r:Reading)=>r.state==='off'?'':r.state==='open'?'OL':r.value===null?'':formatValue(r.value,r.unit as Unit);
const onKey=(run:()=>void)=>(e:KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();run();}};
const IEC_PLUS:Record<string,string>={K:'#2f9e44',J:'#2b2f33'};

type Props={settings:Settings;temps:Temps;reading:Reading;tool:Tool;selected:Equipment|null;onSelect:(id:Equipment)=>void;onTerminal:(id:Terminal)=>void;onChange:(patch:Partial<Settings>)=>void;onRecord:()=>void;onLog:()=>void;recordReady:boolean;onReadoutState:(state:string|null)=>void;refs:MutableRefObject<Partial<Record<Equipment,SVGGElement|null>>>};
export function BenchScene({settings:s,temps:t,reading,tool,selected,onSelect,onTerminal,onChange,onRecord,onLog,recordReady,onReadoutState,refs}:Props){
  const heating=Math.abs(t.bath-s.setpoint)>=STABLE_BAND;
  const equipment=(id:Equipment,label:string,children:ReactNode)=><g data-pan-surface ref={el=>{refs.current[id]=el;}} className={`temp-equipment ${selected===id?'selected':''}`} role="button" tabIndex={0} aria-pressed={selected===id} aria-label={label} onClick={()=>{if(tool!=='pan')onSelect(id);}} onKeyDown={onKey(()=>onSelect(id))}>{children}</g>;
  const terminal=(id:Terminal,text:string,light=false)=>{
    const pos=termPos(id,s),used=s.red===id?'red':s.black===id?'black':'';
    return <g key={id} className={`temp-terminal ${used} ${id.startsWith('tx')?'on-blue':''} ${light?'tip':''}`} role="button" tabIndex={0} aria-label={`${TERMINALS.find(x=>x.id===id)!.label}${used?` · punta ${used==='red'?'roja':'negra'} conectada`:''}`} onClick={e=>{e.stopPropagation();onTerminal(id);}} onKeyDown={onKey(()=>onTerminal(id))}>
      <circle className="hit" cx={pos.x} cy={pos.y} r="16"/><circle className="screw" cx={pos.x} cy={pos.y} r={light?7:10}/>{light?null:<path className="slot" d={`M${pos.x-5} ${pos.y-3}L${pos.x+5} ${pos.y+3}`}/>}<text x={pos.x} y={pos.y-(light?13:15)} textAnchor="middle">{text}</text>
    </g>;
  };
  /* Sonda de varilla: vaina de acero, manguito, cable y, al final, hilos de colores con la punta pelada. */
  const probe=(sensor:'tc'|'pt')=>{
    const x=PROBE_X[sensor],top=headTop(sensor,s),inWell=s.inWell[sensor],stable=isStable(s,t,sensor);
    const label=sensor==='tc'?`Termocupla ${s.tcType}`:s.ptWires===4?'Pt100 · 4 hilos':'Pt100 · 3 hilos';
    const ids:Terminal[]=sensor==='tc'?['tc+','tc-']:s.ptWires===4?['pt1','pt2','pt3','pt4']:['pt1','pt2','pt3'];
    const colorOf=(id:Terminal)=>id==='tc+'?IEC_PLUS[s.tcType]:id==='tc-'?'#f3f3f3':id==='pt3'||id==='pt4'?'#f3f3f3':'#d94848';
    const fan=top-6;
    return <g key={sensor} className={`temp-probe ${inWell?'in-well':'lifted'}`}>
      {equipment(sensor,`${label}, ${inWell?'dentro del pozo':'fuera del pozo'}. Abre su edición.`,<>
        <rect className="sheath" x={x-4.5} y={top+54} width="9" height={STEM} rx="4"/><path className="sheath-shine" d={`M${x-1.5} ${top+58}V${top+54+STEM-6}`}/>
        <rect className="sleeve" x={x-8} y={top+30} width="16" height="26" rx="3"/><path className="nut-line" d={`M${x-8} ${top+38}H${x+8}M${x-8} ${top+44}H${x+8}`}/>
        <rect className={`relief ${sensor}`} x={x-5.5} y={top+12} width="11" height="22" rx="5"/>
        <path className={`cable ${sensor}`} d={`M${x} ${top+14}C${x} ${top+4} ${x} ${top+2} ${x} ${fan}`}/>
        {ids.map(id=>{const tip=termPos(id,s);return <path key={id} className="lead-wire" d={`M${x} ${fan}C${x} ${fan-12} ${tip.x} ${tip.y+14} ${tip.x} ${tip.y}`} stroke={colorOf(id)}/>;})}
      </>)}
      <text className="temp-tag" x={x} y={top-64} textAnchor="middle">{label}</text>
      {inWell?<g className={`temp-pill ${stable?'ok':'wait'}`}><rect x={x-48} y={top-98} width="96" height="18" rx="9"/><text x={x} y={top-85} textAnchor="middle">{stable?'estable':'estabilizando…'}</text></g>:null}
      <g className="manual-action" role="button" tabIndex={0} aria-label={`${inWell?'Retirar':'Insertar'} ${label} en el pozo`} onClick={e=>{if(e.currentTarget.dataset.moved==='yes'){e.currentTarget.dataset.moved='';return;}onChange({inWell:{...s.inWell,[sensor]:!inWell}});}} onKeyDown={onKey(()=>onChange({inWell:{...s.inWell,[sensor]:!inWell}}))} onPointerDown={e=>{e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.dataset.start=String(svgPoint(e).y);}} onPointerUp={e=>{const dy=svgPoint(e).y-Number(e.currentTarget.dataset.start);if(Math.abs(dy)>12){e.preventDefault();e.currentTarget.dataset.moved='yes';onChange({inWell:{...s.inWell,[sensor]:dy>0}});}}}><rect x={x-44} y={top+60} width="88" height="38" rx="8"/><text x={x} y={top+83} textAnchor="middle">{inWell?'↑ retirar':'↓ insertar'}</text></g>
      {ids.map((id,i)=>terminal(id,sensor==='tc'?(i?'−':'+'):String(i+1),true))}
    </g>;
  };
  const bx=BATH.x,by=BATH.y,bw=BATH.w,bh=BATH.h;
  return <svg className="temp-bench" viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} width={WORLD.w} height={WORLD.h} role="group" aria-label="Banco de temperatura: horno de pozo seco, sondas, multímetro, transmisor y fuente">
    <defs>
      <linearGradient id="temp-metal" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#e1e6e9"/><stop offset="1" stopColor="#a9b4bb"/></linearGradient>
      <linearGradient id="temp-alu" x1="0" x2="1" y1="0" y2="0"><stop stopColor="#aab4bb"/><stop offset=".35" stopColor="#eef2f4"/><stop offset="1" stopColor="#97a2aa"/></linearGradient>
      <linearGradient id="temp-dark" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#4a545b"/><stop offset="1" stopColor="#252c31"/></linearGradient>
      <linearGradient id="temp-blue" x1="0" x2="1" y1="0" y2="0"><stop stopColor="#2f86d6"/><stop offset=".5" stopColor="#58a8ee"/><stop offset="1" stopColor="#2478c9"/></linearGradient>
      <linearGradient id="temp-yellow" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#f6c13c"/><stop offset="1" stopColor="#dd9f18"/></linearGradient>
    </defs>
    <path className="temp-floor" d={`M30 600H${WORLD.w-30}`}/>

    {equipment('bath',`Horno de pozo seco a ${formatTemp(t.bath)}, objetivo ${formatTemp(s.setpoint)}. Abre su edición.`,<>
      <rect className="bath-foot" x={bx+26} y={by+bh-8} width="64" height="12" rx="4"/><rect className="bath-foot" x={bx+bw-90} y={by+bh-8} width="64" height="12" rx="4"/>
      <rect className="bath-body" x={bx+8} y={by+12} width={bw-16} height={bh-18} rx="16"/>
      <rect className="bath-top" x={bx} y={by} width={bw} height="30" rx="12"/>
      <ellipse className="bath-insert" cx={bx+bw/2} cy={by+14} rx={bw/2-22} ry="12"/>
      {[PROBE_X.tc,PROBE_X.pt].map(x=><g key={x}><ellipse className="bath-hole-rim" cx={x} cy={by+14} rx="16" ry="7"/><ellipse className="bath-hole" cx={x} cy={by+14} rx="12" ry="5"/></g>)}
      {[0,1,2,3,4].map(i=><rect key={i} className="bath-vent" x={bx+24} y={by+bh-70+i*10} width="30" height="4" rx="2"/>)}
      <rect className="bath-panel" x={bx+22} y={by+50} width={bw-44} height="118" rx="10"/>
      <rect className="bath-screen" x={bx+34} y={by+62} width="168" height="76" rx="6"/>
      <text className="bath-caption" x={bx+44} y={by+78}>TEMPERATURA</text>
      <text className="bath-value" x={bx+44} y={by+114}>{formatTemp(t.bath)}</text>
      <text className="bath-set" x={bx+44} y={by+130}>objetivo {formatTemp(s.setpoint)}</text>
      {([[0,0,'▲'],[1,0,'▼'],[0,1,'◀'],[1,1,'▶']] as const).map(([c,r,g])=><g key={`${c}${r}`} className="bath-btn" role="button" tabIndex={0} aria-label={g==='▲'?'Subir consigna 5 °C':g==='▼'?'Bajar consigna 5 °C':g==='◀'?'Bajar consigna 1 °C':'Subir consigna 1 °C'} onClick={e=>{e.stopPropagation();onChange({setpoint:s.setpoint+(g==='▲'?5:g==='▼'?-5:g==='◀'?-1:1)});}} onKeyDown={onKey(()=>onChange({setpoint:s.setpoint+(g==='▲'?5:g==='▼'?-5:g==='◀'?-1:1)}))}><circle cx={bx+212+c*26} cy={by+76+r*28} r="12.5"/><text x={bx+212+c*26} y={by+80+r*28} textAnchor="middle">{g}</text></g>)}
      <circle className={`bath-led ${heating?'on':''}`} cx={bx+bw-50} cy={by+76} r="7"/><text className="bath-led-text" x={bx+bw-50} y={by+98} textAnchor="middle">{heating?'calienta':'estable'}</text>
      <rect className="bath-switch" x={bx+bw-84} y={by+128} width="50" height="24" rx="5"/><path className="bath-switch-mark" d={`M${bx+bw-70} ${by+134}V${by+146}`}/><circle className="bath-switch-mark ring" cx={bx+bw-48} cy={by+140} r="5"/>
    </>)}
    <text className="temp-name" x={bx+bw/2} y={by+bh+30} textAnchor="middle">HORNO DE POZO SECO</text>
    {probe('pt')}{probe('tc')}

    <g className="manual-action" role="button" tabIndex={0} aria-label="Cambiar resistencia de hilos Pt100" onClick={()=>onChange({ptLeadOhms:((s.ptLeadOhms??0)+.25)%1.25})} onKeyDown={onKey(()=>onChange({ptLeadOhms:((s.ptLeadOhms??0)+.25)%1.25}))}><rect x="235" y="600" width="210" height="30" rx="5"/><text x="340" y="620" textAnchor="middle">Hilo Pt100: {(s.ptLeadOhms??0).toFixed(2)} Ω · cambiar</text></g>
    <BenchMeter x={METER.x} y={METER.y} mode={s.mode==='off'?'OFF':s.mode==='ohm'?'R':s.mode==='mV'?'C':'V'} text={displayText(reading)} note={reading.note} onMode={m=>onChange({mode:m==='OFF'?'off':m==='R'?'ohm':m==='C'?'mV':'V'})} record={recordReady} onRecord={onRecord} onLog={onLog} onReadoutState={onReadoutState} millivolts/>


    <rect className="din-rail" x={TX.x-36} y={TX.y+TX.h/2-12} width={TX.w+72} height="24" rx="3"/>
    {equipment('tx',`Transmisor de temperatura, entrada tipo ${s.txType} de ${s.txMin} a ${s.txMax} grados Celsius, ${s.txPowered?'alimentado':'sin alimentación'}. Abre su edición.`,<>
      <rect className="tx-body" x={TX.x} y={TX.y} width={TX.w} height={TX.h} rx="10"/>
      <rect className="tx-strip" x={TX.x+6} y={TX.y+6} width={TX.w-12} height="46" rx="6"/><rect className="tx-strip" x={TX.x+6} y={TX.y+TX.h-52} width={TX.w-12} height="46" rx="6"/>
      <rect className="tx-label" x={TX.x+12} y={TX.y+64} width={TX.w-24} height="170" rx="4"/>
      <text className="tx-title" x={TX.x+TX.w/2} y={TX.y+82} textAnchor="middle">TRANSMISOR</text><text className="tx-sub" x={TX.x+TX.w/2} y={TX.y+95} textAnchor="middle">DE TEMPERATURA</text>
      <text className="tx-key" x={TX.x+20} y={TX.y+118}>ENTRADA</text><text className="tx-val" x={TX.x+20} y={TX.y+132}>TC tipo {s.txType}</text>
      <text className="tx-key" x={TX.x+20} y={TX.y+150}>RANGO</text><text className="tx-val" x={TX.x+20} y={TX.y+164}>{s.txMin}–{s.txMax} °C</text>
      <text className="tx-key" x={TX.x+20} y={TX.y+182}>SALIDA</text><text className="tx-val" x={TX.x+20} y={TX.y+196}>0–10 V DC</text>
      <circle className={`tx-led ${s.txPowered?'on':''}`} cx={TX.x+26} cy={TX.y+218} r="5"/><text className="tx-key" x={TX.x+36} y={TX.y+221}>{s.txPowered?'ALIMENTADO':'SIN ALIM.'}</text>
    </>)}
    <g aria-hidden="true">{([['plus','IN +',TX_IN],['minus','IN −',TX_IN],['plus','V +',TX_PWR],['minus','V −',TX_PWR]] as const).map(([k,label,set],i)=>{const p=set[k];return <g key={i} className={`tx-in ${i<2&&s.txConnected?'wired':''} ${i>=2&&s.txPowered?'wired':''}`}><circle cx={p.x} cy={p.y} r="9"/><path d={`M${p.x-4} ${p.y-2}L${p.x+4} ${p.y+2}`}/><text className="tx-in-label" x={p.x} y={p.y-14} textAnchor="middle">{label}</text></g>;})}</g>
    {terminal('tx+','+')}{terminal('tx-','−')}<text className="tx-in-label" x={TX.x+TX.w-14} y={TX.y+TX.h-26} textAnchor="end">SALIDA</text>
    <text className="temp-name" x={TX.x+TX.w/2} y={TX.y+TX.h+30} textAnchor="middle">{s.txConnected?'ENTRADA CONECTADA A LA TERMOCUPLA':'ENTRADA SIN CONECTAR'}</text>

    {equipment('psu',`Fuente de alimentación, ${s.txPowered?'encendida':'apagada'}. Abre su edición.`,<>
      <rect className="psu-body" x={PSU.x} y={PSU.y} width={PSU.w} height={PSU.h} rx="12"/>
      <rect className="psu-screen" x={PSU.x+12} y={PSU.y+14} width={PSU.w-24} height="52" rx="6"/>
      <text className={`psu-value ${s.txPowered?'on':''}`} x={PSU.x+PSU.w/2} y={PSU.y+48} textAnchor="middle">{s.txPowered?'24,0 V':'— — —'}</text>
      <text className="psu-sub" x={PSU.x+PSU.w/2} y={PSU.y+80} textAnchor="middle">FUENTE DC</text>
      <circle className="psu-knob" cx={PSU.x+PSU.w/2} cy={PSU.y+128} r="24"/><path className="psu-knob-mark" d={`M${PSU.x+PSU.w/2} ${PSU.y+128}V${PSU.y+108}`}/>
      <circle className={`psu-led ${s.txPowered?'on':''}`} cx={PSU.x+22} cy={PSU.y+172} r="5"/>
      <circle className="jack red" cx={PSU_JACKS.red.x} cy={PSU_JACKS.red.y} r="11"/><circle className="jack black" cx={PSU_JACKS.black.x} cy={PSU_JACKS.black.y} r="11"/>
      <text className="psu-jack-label" x={PSU_JACKS.red.x} y={PSU_JACKS.red.y-17} textAnchor="middle">+</text><text className="psu-jack-label" x={PSU_JACKS.black.x} y={PSU_JACKS.black.y-17} textAnchor="middle">−</text>
    </>)}
    <text className="temp-name" x={PSU.x+PSU.w/2} y={PSU.y+PSU.h+30} textAnchor="middle">FUENTE</text>

    <g className="manual-action" role="button" tabIndex={0} aria-label="Conectar o retirar termocupla del transmisor" onClick={()=>onChange({txConnected:!s.txConnected})} onKeyDown={onKey(()=>onChange({txConnected:!s.txConnected}))}><rect x={TX.x-8} y={TX.y-44} width="148" height="32" rx="6"/><text x={TX.x+66} y={TX.y-23} textAnchor="middle">{s.txConnected?'Retirar hilos TC':'Conectar hilos TC'}</text></g>
    <g className="manual-action" role="button" tabIndex={0} aria-label="Interruptor de la fuente" onClick={()=>onChange({txPowered:!s.txPowered})} onKeyDown={onKey(()=>onChange({txPowered:!s.txPowered}))}><rect x={PSU.x+30} y={PSU.y+108} width="60" height="40" rx="6"/><text x={PSU.x+60} y={PSU.y+132} textAnchor="middle">{s.txPowered?'I · ON':'O · OFF'}</text></g>
    <g className="temp-wires" aria-hidden="true">
      {s.txConnected?<><path d={riseCable(termPos('tc+',s),TX_IN.plus,60)}/><path d={riseCable(termPos('tc-',s),TX_IN.minus,40)}/></>:null}
      {s.txPowered?<><path className="red" d={riseCable(PSU_JACKS.red,TX_PWR.plus,120)}/><path className="black" d={riseCable(PSU_JACKS.black,TX_PWR.minus,140)}/></>:null}
    </g>
    <ManualLeads x={METER.x} y={METER.y} red={s.red} black={s.black} terminals={TERMINALS.filter(t=>t.id!=='pt4'||s.ptWires===4).map(t=>({...t,point:termPos(t.id,s)}))} onConnect={(color,id)=>onChange({[color]:id})}/>
  </svg>;
}
