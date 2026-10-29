import {TransistorPinout} from './TransistorPinout';
import {FloatingWindow} from '../components/FloatingWindow';
import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import {ArrowLeftRight,Check,Trash2,X} from 'lucide-react';
import {IC_PIN_NAMES,parseHoleId,type ProtoComponent} from './model';
import {holeName} from './dc';
import {WIRE_PALETTE} from '../data/wireColors';
import type {BJTState,IcState} from './dc';
import {COMMON_OHMS,COMMON_SUPPLY,LED_DROP_MAX,LED_DROP_MIN,OHM_UNITS,SUPPLY_MAX,SUPPLY_MIN,formatAmps,formatOhms,formatVolts,parseGain,parseOhms,parseVolts,splitOhms,type OhmUnit,type Parsed} from './units';
export const LED_COLORS=[{name:'Rojo',hex:'#d94848'},{name:'Verde',hex:'#2f9e5f'},{name:'Amarillo',hex:'#d6a516'},{name:'Azul',hex:'#2f6fd1'},{name:'Blanco',hex:'#9aa7b0'}];
export const WIRE_COLORS=WIRE_PALETTE;

/** Campo de valor con borrador: Enter confirma, Escape cancela y el error permanece junto al campo. */
export function Field({label,value,onChange,onSubmit,error,disabled,autoFocus,children,inputMode='decimal'}:{label:string;value:string;onChange:(v:string)=>void;onSubmit:()=>void;error?:string;disabled?:boolean;autoFocus?:boolean;children?:ReactNode;inputMode?:'decimal'|'text'}){
  const id=useId(),input=useRef<HTMLInputElement>(null);
  useEffect(()=>{if(autoFocus){input.current?.focus();input.current?.select();}},[autoFocus]);
  return <div className="lab-field"><label htmlFor={id}>{label}</label><div className="lab-field-row"><input id={id} ref={input} type="text" inputMode={inputMode} autoComplete="off" spellCheck={false} disabled={disabled} value={value} maxLength={24} aria-invalid={error?true:undefined} aria-describedby={error?`${id}-error`:undefined} onChange={e=>onChange(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();onSubmit();}}}/>{children}</div>{error?<p id={`${id}-error`} className="lab-field-error" role="alert">{error}</p>:null}</div>;
}
export function Chips({values,current,format,disabled,onPick}:{values:number[];current:number|null;format:(v:number)=>string;disabled?:boolean;onPick:(v:number)=>void}){
  return <div className="lab-chips" role="group" aria-label="Valores frecuentes">{values.map(v=><button key={v} type="button" disabled={disabled} aria-pressed={current===v} onClick={()=>onPick(v)}>{format(v)}</button>)}</div>;
}
function Swatches({colors,current,label,disabled,onPick}:{colors:{name:string;hex:string}[];current:string;label:string;disabled?:boolean;onPick:(hex:string)=>void}){
  return <div className="lab-swatches" role="group" aria-label={label}>{colors.map(c=><button key={c.hex} type="button" disabled={disabled} aria-label={c.name} title={c.name} aria-pressed={c.hex.toLowerCase()===current.toLowerCase()} style={{background:c.hex}} onClick={()=>onPick(c.hex)}/>)}</div>;
}
const Actions=({apply,applyDisabled,running}:{apply:()=>void;applyDisabled:boolean;running:boolean})=><div className="lab-editor-actions"><button type="button" className="lab-apply" disabled={running||applyDisabled} onClick={apply}><Check size={15}/>Aplicar</button><small>Enter aplica · Esc cancela</small></div>;

export type EditorPatch=Partial<Pick<ProtoComponent,'value'|'color'|'closed'>>;
export type EditorProps={component:ProtoComponent;position:string;running:boolean;closed:boolean;amps?:number;onApply:(patch:EditorPatch)=>void;onSwitch:(closed:boolean)=>void;onSwap:()=>void;onRemove:()=>void;onClose:()=>void;onPreview:(value:number|null)=>void;ic?:IcState;bjt?:BJTState;failure?:string;onMove:(change:{from?:string;to?:string;anchor?:string})=>string|null};
const TITLES:Record<ProtoComponent['kind'],string>={wire:'Puente',resistor:'Resistencia',led:'LED',switch:'Interruptor',button:'Pulsador',motor:'Motor DC',l293d:'L293D · puente H',bjt:'Transistor',diode:'Diodo 1N4007'};
const PIN_ROLES:Record<string,string>={EN1:'habilita canales 1 y 2',IN1:'entrada del canal 1',OUT1:'salida del canal 1',GND:'tierra',OUT2:'salida del canal 2',IN2:'entrada del canal 2',VS:'alimentación de las salidas (motor)',EN2:'habilita canales 3 y 4',IN3:'entrada del canal 3',OUT3:'salida del canal 3',OUT4:'salida del canal 4',IN4:'entrada del canal 4',VSS:'alimentación lógica'};

function ResistorForm({component,running,onApply,onPreview,onClose}:Pick<EditorProps,'component'|'running'|'onApply'|'onPreview'|'onClose'>){
  const initial=splitOhms(component.value),[text,setText]=useState(initial.text),[unit,setUnit]=useState<OhmUnit>(initial.unit),[touched,setTouched]=useState(false);
  const parsed:Parsed=parseOhms(text,unit),changed=parsed.ok&&parsed.value!==component.value,error=touched&&!parsed.ok?parsed.error:undefined;
  useEffect(()=>{onPreview(parsed.ok&&parsed.value!==component.value?parsed.value:null);},[parsed.ok?parsed.value:NaN,component.value]);
  useEffect(()=>()=>onPreview(null),[]);
  const edit=(next:string)=>{setText(next);setTouched(true);};
  const apply=()=>{setTouched(true);if(!parsed.ok||running)return;if(parsed.value!==component.value)onApply({value:parsed.value});onClose();};
  const pick=(ohms:number)=>{const s=splitOhms(ohms);setText(s.text);setUnit(s.unit);setTouched(true);};
  return <><Field label="Valor" value={text} onChange={edit} onSubmit={apply} error={error} disabled={running} autoFocus={!running}><select aria-label="Unidad" disabled={running} value={unit} onChange={e=>{setUnit(e.target.value as OhmUnit);setTouched(true);}}>{OHM_UNITS.map(u=><option key={u.unit} value={u.unit}>{u.unit}</option>)}</select></Field>
    <Chips values={COMMON_OHMS} current={parsed.ok?parsed.value:null} format={formatOhms} disabled={running} onPick={pick}/>
    <p className="lab-saved-as" aria-live="polite">{parsed.ok?<>Se guardará como <strong>{parsed.value} Ω</strong>{changed?' · vista previa en la placa':''}</>:'Corrige el valor para poder aplicarlo.'}</p>
    <Actions apply={apply} applyDisabled={!parsed.ok} running={running}/></>;
}
function LedForm({component,running,onApply,onClose}:Pick<EditorProps,'component'|'running'|'onApply'|'onClose'>){
  const [text,setText]=useState(String(component.value).replace('.',',')),[color,setColor]=useState(component.color),[touched,setTouched]=useState(false);
  const parsed=parseVolts(text,LED_DROP_MIN,LED_DROP_MAX),error=touched&&!parsed.ok?parsed.error:undefined;
  const apply=()=>{setTouched(true);if(!parsed.ok||running)return;const patch:EditorPatch={};if(parsed.value!==component.value)patch.value=parsed.value;if(color!==component.color)patch.color=color;if(Object.keys(patch).length)onApply(patch);onClose();};
  return <><Field label="Caída directa aproximada" value={text} onChange={v=>{setText(v);setTouched(true);}} onSubmit={apply} error={error} disabled={running} autoFocus={!running}><span className="lab-suffix">V</span></Field>
    <Swatches colors={LED_COLORS} current={color} label="Color del LED" disabled={running} onPick={hex=>{setColor(hex);setTouched(true);}}/>
    <p className="lab-saved-as">El primer extremo es el ánodo (+). La caída configurada no es la tensión medida.</p>
    <Actions apply={apply} applyDisabled={!parsed.ok} running={running}/></>;
}
function MotorForm({component,running,onApply,onClose}:Pick<EditorProps,'component'|'running'|'onApply'|'onClose'>){
  const initial=splitOhms(component.value),[text,setText]=useState(initial.text),[unit,setUnit]=useState<OhmUnit>(initial.unit),[touched,setTouched]=useState(false);
  const parsed:Parsed=parseOhms(text,unit,1,1e4),error=touched&&!parsed.ok?parsed.error:undefined;
  const apply=()=>{setTouched(true);if(!parsed.ok||running)return;if(parsed.value!==component.value)onApply({value:parsed.value});onClose();};
  return <><Field label="Resistencia del bobinado" value={text} onChange={v=>{setText(v);setTouched(true);}} onSubmit={apply} error={error} disabled={running} autoFocus={!running}><select aria-label="Unidad" disabled={running} value={unit} onChange={e=>{setUnit(e.target.value as OhmUnit);setTouched(true);}}>{OHM_UNITS.slice(0,2).map(u=><option key={u.unit} value={u.unit}>{u.unit}</option>)}</select></Field>
    <p className="lab-saved-as">Modelo didáctico: el motor es una carga resistiva de {parsed.ok?<strong>{parsed.value} Ω</strong>:'…'}. El sentido de giro sigue el sentido de la corriente: entrando por el primer extremo, horario (convención de este laboratorio).</p>
    <Actions apply={apply} applyDisabled={!parsed.ok} running={running}/></>;
}
function IcInfo({ic,running}:{ic?:IcState;running:boolean}){
  const names:Record<string,string>={high:'alto',low:'bajo',off:'desactivada',none:''};
  return <><p className="lab-saved-as">Se coloca sobre el canal central: el pin 1 queda en la fila f y la muesca a la izquierda. Una entrada sin conectar se lee como baja. Modelo didáctico de lógica y salidas; no incluye retardos ni corrientes de alimentación.</p>
    <ol className="lab-pin-list" aria-label="Pines del L293D">{IC_PIN_NAMES.map((name,i)=>{const level=running?ic?.pins[i]?.level:undefined;return <li key={i} className={level?`is-${level}`:''}><b>{i+1}</b><span>{name}</span>{level&&level!=='none'?<em>{names[level]}</em>:null}</li>;})}</ol>
    {running&&ic&&!ic.powered?<p className="lab-lock-note">Sin alimentación lógica válida: las salidas están desactivadas.</p>:null}</>;
}
function DiodeForm({component,running,onApply,onClose}:Pick<EditorProps,'component'|'running'|'onApply'|'onClose'>){
  const [text,setText]=useState(String(component.value).replace('.',',')),[touched,setTouched]=useState(false);
  const parsed=parseVolts(text,.1,2),error=touched&&!parsed.ok?parsed.error:undefined;
  const apply=()=>{setTouched(true);if(!parsed.ok||running)return;if(parsed.value!==component.value)onApply({value:parsed.value});onClose();};
  return <><Field label="Caída directa aproximada" value={text} onChange={v=>{setText(v);setTouched(true);}} onSubmit={apply} error={error} disabled={running} autoFocus={!running}><span className="lab-suffix">V</span></Field>
    <p className="lab-saved-as">El primer extremo es el ánodo; el cátodo lleva la banda plateada. Conduce solo de ánodo a cátodo (≈ 0,7 V). En un motor real se coloca en paralelo e inverso como diodo de rueda libre; en este modelo de corriente continua no tiene efecto visible.</p>
    <Actions apply={apply} applyDisabled={!parsed.ok} running={running}/></>;
}
function BjtForm({component,running,bjt,onApply,onClose}:Pick<EditorProps,'component'|'running'|'bjt'|'onApply'|'onClose'>){
  const [text,setText]=useState(String(component.value)),[touched,setTouched]=useState(false);
  const parsed:Parsed=parseGain(text),error=touched&&!parsed.ok?parsed.error:undefined;
  const apply=()=>{setTouched(true);if(!parsed.ok||running)return;if(parsed.value!==component.value)onApply({value:parsed.value});onClose();};
  return <><TransistorPinout component={component}/><details className="lab-help"><summary>Parámetros del modelo</summary><Field label="Ganancia de corriente (hFE)" value={text} onChange={v=>{setText(v);setTouched(true);}} onSubmit={apply} error={error} disabled={running}><span className="lab-suffix">β</span></Field><p className="lab-saved-as">Modelo didáctico: |Vbe| ≈ 0,7 V, Ic = β·Ib en región activa y |Vce| ≈ 0,2 V en saturación.</p></details>
    {running&&bjt?<dl className="lab-bjt-readout"><div><dt>Región</dt><dd>{bjt.region}</dd></div><div><dt>Ib</dt><dd>{formatAmps(bjt.ib)}</dd></div><div><dt>Ic</dt><dd>{formatAmps(bjt.ic)}</dd></div><div><dt>Vbe</dt><dd>{formatVolts(Number(bjt.vbe.toFixed(3)))}</dd></div><div><dt>Vce</dt><dd>{formatVolts(Number(bjt.vce.toFixed(3)))}</dd></div></dl>:null}
    <Actions apply={apply} applyDisabled={!parsed.ok} running={running}/></>;
}
function MoveForm({component,running,onMove}:Pick<EditorProps,'component'|'running'|'onMove'>){
  const single=component.kind==='l293d',[a,setA]=useState(holeName(component.from)),[b,setB]=useState(holeName(component.to)),[error,setError]=useState('');
  const names=single?['Pin 1']:component.kind==='bjt'?['Emisor (E)','Colector (C)']:component.kind==='led'||component.kind==='diode'?['Ánodo (+)','Cátodo (−)']:['Extremo 1','Extremo 2'];
  const submit=()=>{const from=parseHoleId(a.replace(/\s/g,'')),to=single?component.to:parseHoleId(b.replace(/\s/g,''));if(!from||!to){setError('Usa un orificio como a5, f10, top+:1 o bottom-:20 (columnas 1 a 30).');return;}const problem=onMove(single?{anchor:from}:{from,to});setError(problem??'');};
  return <details className="lab-help lab-move"><summary>Mover sin arrastrar</summary>
    <div className="lab-move-fields"><label>{names[0]}<input value={a} maxLength={20} disabled={running} aria-label={names[0]} onChange={e=>setA(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();submit();}}}/></label>{single?null:<label>{names[1]}<input value={b} maxLength={20} disabled={running} aria-label={names[1]} onChange={e=>setB(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();submit();}}}/></label>}</div>
    {error?<p className="lab-field-error" role="alert">{error}</p>:null}<button type="button" disabled={running} onClick={submit}>Mover</button>
  </details>;
}
/** Los editores son ventanas: se mueven, se ajustan por los bordes y recuerdan su lugar. */
export function EditorWindow({title,subtitle,onClose,children}:{title:string;subtitle?:string;onClose:()=>void;children:ReactNode}){
  return <FloatingWindow title={title} eyebrow={subtitle} width={340} side="right" top={104} className="lab-editor-window" scope=".lab-canvas-workspace" closeLabel="Cerrar edición" onClose={onClose}>{children}</FloatingWindow>;
}
export function ValueEditor({component,position,running,closed,amps,ic,bjt,failure,onMove,onApply,onSwitch,onSwap,onRemove,onClose,onPreview}:EditorProps){
  return <EditorWindow title={TITLES[component.kind]} subtitle={position} onClose={onClose}><div className="lab-editor-pop">
    {failure?<p className="lab-failure" role="alert"><strong>Componente dañado</strong>{failure}. Se comporta como circuito abierto; se repone al detener la simulación.</p>:null}
    {component.kind==='resistor'?<ResistorForm component={component} running={running} onApply={onApply} onPreview={onPreview} onClose={onClose}/>:null}
    {component.kind==='led'?<LedForm component={component} running={running} onApply={onApply} onClose={onClose}/>:null}
    {component.kind==='motor'?<MotorForm component={component} running={running} onApply={onApply} onClose={onClose}/>:null}
    {component.kind==='diode'?<DiodeForm component={component} running={running} onApply={onApply} onClose={onClose}/>:null}
    {component.kind==='bjt'?<BjtForm component={component} running={running} bjt={bjt} onApply={onApply} onClose={onClose}/>:null}
    {component.kind==='l293d'?<IcInfo ic={ic} running={running}/>:null}
    {component.kind==='button'?<p className="lab-saved-as">Pulsador normalmente abierto: conduce solo mientras lo mantienes presionado durante la simulación (pulsa y mantén sobre el componente o con Espacio).</p>:null}
    {component.kind==='switch'?<><p className="lab-saved-as">{closed?'Cerrado: conduce.':'Abierto: no conduce.'}{running?' Durante la simulación el cambio es temporal y no modifica el diseño guardado.':''}</p><button type="button" className="lab-wide" aria-pressed={closed} onClick={()=>running?onSwitch(!closed):onApply({closed:!component.closed})}>{closed?'Abrir interruptor':'Cerrar interruptor'}</button></>:null}
    {component.kind==='wire'?<section className="lab-bridge-colors"><h4>Cambiar color del puente</h4><p className="lab-bridge-current" aria-live="polite"><i style={{backgroundColor:component.color}} aria-hidden="true"/>Actual: {WIRE_COLORS.find(c=>c.hex.toLowerCase()===component.color.toLowerCase())?.name??'Personalizado'}</p><div className="lab-bridge-palette" role="group" aria-label="Color del puente">{WIRE_COLORS.map(c=><button key={c.hex} type="button" disabled={running} aria-pressed={c.hex.toLowerCase()===component.color.toLowerCase()} onClick={()=>onApply({color:c.hex})}><i style={{backgroundColor:c.hex}} aria-hidden="true"/><span>{c.name}</span>{c.hex.toLowerCase()===component.color.toLowerCase()?<Check size={16} aria-hidden="true"/>:null}</button>)}</div></section>:null}
    {running&&amps!==undefined&&(component.kind==='resistor'||component.kind==='led'||component.kind==='motor'||component.kind==='diode')?<div className="lab-reading"><span>Corriente medida</span><strong>{formatAmps(component.kind==='motor'?amps:Math.abs(amps))}</strong>{component.kind==='motor'?<small>{Math.abs(amps)<1e-6?'parado':amps>0?'giro horario ↻':'giro antihorario ↺'}</small>:null}{component.kind==='resistor'?<small>{formatOhms(component.value)} · {(amps*amps*component.value*1000).toFixed(2).replace('.',',')} mW</small>:null}</div>:null}
    {running?<p className="lab-lock-note">Detén la simulación para editar el circuito.</p>:null}
    {running?null:<MoveForm key={`${component.from}|${component.to}`} component={component} running={running} onMove={onMove}/>}
    <footer>{component.kind==='led'||component.kind==='motor'||component.kind==='diode'?<button type="button" disabled={running} onClick={onSwap}><ArrowLeftRight size={15}/>Invertir polaridad</button>:null}<button type="button" className="lab-danger" disabled={running} onClick={onRemove}><Trash2 size={15}/>Retirar</button></footer>
  </div></EditorWindow>;
}

/** Fuente DC: valor visible y editable con el mismo flujo de borrador y confirmación. */
export function SupplyEditor({voltage,running,onApply}:{voltage:number;running:boolean;onApply:(v:number)=>void}){
  const [text,setText]=useState(String(voltage).replace('.',',')),[touched,setTouched]=useState(false);
  useEffect(()=>{setText(String(voltage).replace('.',','));setTouched(false);},[voltage]);
  const parsed=parseVolts(text,SUPPLY_MIN,SUPPLY_MAX),error=touched&&!parsed.ok?parsed.error:undefined;
  const apply=()=>{setTouched(true);if(parsed.ok&&!running&&parsed.value!==voltage)onApply(parsed.value);};
  return <><Field label="Tensión" value={text} onChange={v=>{setText(v);setTouched(true);}} onSubmit={apply} error={error} disabled={running}><span className="lab-suffix">V DC</span><button type="button" className="lab-apply" disabled={running||!parsed.ok||(parsed.ok&&parsed.value===voltage)} onClick={apply} aria-label="Aplicar tensión"><Check size={15}/></button></Field>
    <Chips values={COMMON_SUPPLY} current={parsed.ok?parsed.value:null} format={formatVolts} disabled={running} onPick={v=>{setText(String(v).replace('.',','));setTouched(true);}}/></>;
}
