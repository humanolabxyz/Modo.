import {useId,useState} from 'react';
import {BookOpen,Check,X} from 'lucide-react';
import {Chips,EditorWindow,Field} from '../ValueEditor';
import {AMBIENT_MAX,AMBIENT_MIN,SET_MAX,type Settings,type TcType} from './physics';
import {formatNumber,formatTemp,parseNumber} from './state';
import type {Equipment} from './BenchScene';
/** Edición contextual junto al equipo: borrador, Enter aplica, Escape cancela y el error queda junto al campo. */
type Props={id:Equipment;settings:Settings;onChange:(patch:Partial<Settings>)=>void;onClose:()=>void;onSheet:(id:Equipment)=>void};
const TITLES:Record<Equipment,string>={bath:'Horno de pozo seco',tc:'Termocupla',pt:'Pt100 (RTD)',tx:'Transmisor de temperatura',psu:'Fuente de alimentación'};
const Toggle=({pressed,onClick,children}:{pressed:boolean;onClick:()=>void;children:string})=><button type="button" className="lab-wide" aria-pressed={pressed} onClick={onClick}>{children}</button>;
const TypePick=({value,onPick,label}:{value:TcType;onPick:(t:TcType)=>void;label:string})=><div className="lab-field"><label>{label}</label><div className="lab-chips" role="group" aria-label={label}>{(['K','J'] as TcType[]).map(t=><button key={t} type="button" aria-pressed={value===t} onClick={()=>onPick(t)}>Tipo {t}</button>)}</div></div>;
const Actions=({apply,disabled}:{apply:()=>void;disabled:boolean})=><div className="lab-editor-actions"><button type="button" className="lab-apply" disabled={disabled} onClick={apply}><Check size={15}/>Aplicar</button><small>Enter aplica · Esc cancela</small></div>;

function BathForm({settings:s,onChange,onClose}:Pick<Props,'settings'|'onChange'|'onClose'>){
  const [target,setTarget]=useState(formatNumber(s.setpoint,s.setpoint%1?1:0)),[ambient,setAmbient]=useState(formatNumber(s.ambient,s.ambient%1?1:0)),[touched,setTouched]=useState(false);
  const a=parseNumber(ambient),t=parseNumber(target);
  const ambientError=a===null?'Escribe un número, por ejemplo 22.':a<AMBIENT_MIN||a>AMBIENT_MAX?`La temperatura ambiente debe estar entre ${AMBIENT_MIN} y ${AMBIENT_MAX} °C.`:undefined;
  const targetError=t===null?'Escribe un número, por ejemplo 75.':t>SET_MAX?`El horno llega hasta ${SET_MAX} °C en este banco.`:a!==null&&!ambientError&&t<a?`El horno no enfría por debajo del ambiente (${formatTemp(a)}).`:undefined;
  const apply=()=>{setTouched(true);if(targetError||ambientError||t===null||a===null)return;onChange({setpoint:t,ambient:a});onClose();};
  const ok=a!==null&&!ambientError?a:s.ambient;
  return <>
    <Field label="Temperatura objetivo" value={target} onChange={v=>{setTarget(v);setTouched(true);}} onSubmit={apply} error={touched?targetError:undefined} autoFocus><span className="lab-suffix">°C</span></Field>
    <Chips values={[ok,50,75,100]} current={t} format={v=>v===ok?`Ambiente · ${formatNumber(v,v%1?1:0)}`:`${v} °C`} onPick={v=>{setTarget(formatNumber(v,v%1?1:0));setTouched(true);}}/>
    <details className="lab-help"><summary>Escenario del laboratorio</summary><Field label="Temperatura ambiente" value={ambient} onChange={v=>{setAmbient(v);setTouched(true);}} onSubmit={apply} error={touched?ambientError:undefined}><span className="lab-suffix">°C</span></Field><small>La unión de referencia de la termocupla queda a esta temperatura.</small></details>
    <p className="lab-saved-as" aria-live="polite">{t!==null&&!targetError?<>El horno buscará <strong>{formatTemp(t)}</strong> y tardará unos segundos (tiempo acelerado).</>:'Corrige el valor para poder aplicarlo.'}</p>
    <Actions apply={apply} disabled={t===null||a===null||!!targetError||!!ambientError}/>
  </>;
}
function TxForm({settings:s,onChange,onClose}:Pick<Props,'settings'|'onChange'|'onClose'>){
  const [min,setMin]=useState(String(s.txMin).replace('.',',')),[max,setMax]=useState(String(s.txMax).replace('.',',')),[touched,setTouched]=useState(false);
  const lo=parseNumber(min),hi=parseNumber(max);
  const error=lo===null||hi===null?'Escribe los dos límites del rango como números.':lo<-50||hi>400?'El rango debe estar entre −50 y 400 °C.':hi<=lo?'El límite superior debe ser mayor que el inferior.':undefined;
  const apply=()=>{setTouched(true);if(error||lo===null||hi===null)return;onChange({txMin:lo,txMax:hi});onClose();};
  return <>
    <TypePick label="Tipo de termocupla configurado" value={s.txType} onPick={t=>onChange({txType:t})}/>
    <Field label="Rango: desde" value={min} onChange={v=>{setMin(v);setTouched(true);}} onSubmit={apply} autoFocus><span className="lab-suffix">°C</span></Field>
    <Field label="Rango: hasta" value={max} onChange={v=>{setMax(v);setTouched(true);}} onSubmit={apply} error={touched?error:undefined}><span className="lab-suffix">°C</span></Field>
    <p className="lab-saved-as">{lo!==null&&hi!==null&&!error?<>La salida será <strong>0 V a {formatNumber(lo,0)} °C</strong> y <strong>10 V a {formatNumber(hi,0)} °C</strong>.</>:'Corrige el rango para poder aplicarlo.'}</p>
    <Toggle pressed={s.txConnected} onClick={()=>onChange({txConnected:!s.txConnected})}>{s.txConnected?'Entrada conectada a la termocupla':'Conectar entrada a la termocupla'}</Toggle>
    <Toggle pressed={s.txPowered} onClick={()=>onChange({txPowered:!s.txPowered})}>{s.txPowered?'Alimentación encendida':'Encender alimentación'}</Toggle>
    <Actions apply={apply} disabled={!!error}/>
  </>;
}
export function TemperatureEditor({id,settings:s,onChange,onClose,onSheet}:Props){
  return <EditorWindow title={TITLES[id]} subtitle={id==='tc'?`Tipo ${s.tcType}`:id==='bath'?`Ambiente ${formatTemp(s.ambient)}`:id==='tx'?'Salida en tensión':id==='psu'?'Alimenta al transmisor':'Platino · 100 Ω a 0 °C'} onClose={onClose}><div className="lab-editor-pop temp-pop">
    {id==='bath'?<BathForm settings={s} onChange={onChange} onClose={onClose}/>:null}
    {id==='tx'?<TxForm settings={s} onChange={onChange} onClose={onClose}/>:null}
    {id==='tc'?<><TypePick label="Tipo de termocupla" value={s.tcType} onPick={t=>onChange({tcType:t})}/><Toggle pressed={s.inWell.tc} onClick={()=>onChange({inWell:{...s.inWell,tc:!s.inWell.tc}})}>{s.inWell.tc?'Sacar del pozo':'Introducir en el pozo'}</Toggle><p className="lab-saved-as">Genera milivoltios entre sus dos hilos (+ y −). Mídela con la función mV. K y J usan tablas distintas.</p></>:null}
    {id==='psu'?<><Toggle pressed={s.txPowered} onClick={()=>onChange({txPowered:!s.txPowered})}>{s.txPowered?'Apagar la fuente':'Encender la fuente'}</Toggle><p className="lab-saved-as">Rojo (+) a V + y negro (−) a V − del transmisor. El 24 V es el valor típico de estos transmisores; tu sala puede usar otro.</p></>:null}
    {id==='pt'?<><div className="lab-field"><label>Cable del sensor</label><div className="lab-chips" role="group" aria-label="Hilos del Pt100">{([3,4] as const).map(n=><button key={n} type="button" aria-pressed={s.ptWires===n} onClick={()=>onChange({ptWires:n})}>{n} hilos</button>)}</div></div><Toggle pressed={s.inWell.pt} onClick={()=>onChange({inWell:{...s.inWell,pt:!s.inWell.pt}})}>{s.inWell.pt?'Sacar del pozo':'Introducir en el pozo'}</Toggle><p className="lab-saved-as">Es una resistencia: a 0 °C vale 100 Ω y aumenta con la temperatura. Mídela con la función Ω entre un hilo rojo y uno blanco; entre dos del mismo color solo mides el cable.</p></>:null}
    <footer><button type="button" onClick={()=>onSheet(id)}><BookOpen size={15}/>Ver ficha del equipo</button></footer>
  </div></EditorWindow>;
}
