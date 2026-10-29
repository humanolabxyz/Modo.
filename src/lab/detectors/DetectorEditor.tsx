import {useId,useState} from 'react';
import {BookOpen,Check,X} from 'lucide-react';
import {Chips,EditorWindow,Field} from '../ValueEditor';
import {DIST_MAX,GENERIC_RANGE,KINDS,KIND_NAMES,MATERIAL_NAMES,MODELS,OUTPUT_NAMES,type Kind,type Material,type Output,type Settings,type Spec} from './physics';
import {formatMm,formatNumber,parseNumber} from './state';
import type {Equipment} from './BenchScene';
import type {SheetId} from './datasheets';
/** Edición contextual junto al equipo: borrador, Enter aplica, Escape cancela y el error queda junto al campo. */
type Props={id:Equipment;settings:Settings;spec:Spec|null;pending:string;onChange:(patch:Partial<Settings>)=>void;onClose:()=>void;onSheet:(id:SheetId)=>void};
const TITLES:Record<Equipment,string>={supply:'Fuente de 24 V',sensor:'Detector',object:'Objeto'};
const Toggle=({pressed,onClick,children}:{pressed:boolean;onClick:()=>void;children:string})=><button type="button" className="lab-wide" aria-pressed={pressed} onClick={onClick}>{children}</button>;
const Actions=({apply,disabled}:{apply:()=>void;disabled:boolean})=><div className="lab-editor-actions"><button type="button" className="lab-apply" disabled={disabled} onClick={apply}><Check size={15}/>Aplicar</button><small>Enter aplica · Esc cancela</small></div>;

function ObjectForm({settings:s,spec,onChange,onClose}:Pick<Props,'settings'|'spec'|'onChange'|'onClose'>){
  const [text,setText]=useState(formatNumber(s.distance,s.distance%1?1:0)),[touched,setTouched]=useState(false);
  const d=parseNumber(text),range=spec?.range??GENERIC_RANGE.inductive;
  const error=d===null?'Escribe una distancia en milímetros, por ejemplo 5.':d<0||d>DIST_MAX?`La distancia debe estar entre 0 y ${DIST_MAX} mm.`:undefined;
  const apply=()=>{setTouched(true);if(error||d===null)return;onChange({distance:d});onClose();};
  const near=Math.round(range/2*10)/10,out=Math.min(DIST_MAX,range*2);
  return <>
    <div className="lab-field"><label>Material</label><div className="lab-chips" role="group" aria-label="Material del objeto">{(['none','metal','plastic'] as Material[]).map(m=><button key={m} type="button" aria-pressed={s.object===m} onClick={()=>onChange({object:m})}>{MATERIAL_NAMES[m]}</button>)}</div></div>
    <Field label="Distancia al detector" value={text} onChange={v=>{setText(v);setTouched(true);}} onSubmit={apply} error={touched?error:undefined} autoFocus><span className="lab-suffix">mm</span></Field>
    <Chips values={[near,range,out]} current={d} format={v=>v===near?`Dentro · ${formatNumber(v,v%1?1:0)}`:v===range?`Límite · ${formatNumber(v,v%1?1:0)}`:`Fuera · ${formatNumber(v,v%1?1:0)}`} onPick={v=>{setText(formatNumber(v,v%1?1:0));setTouched(true);}}/>
    <p className="lab-saved-as" aria-live="polite">{spec?<>Alcance del detector actual: <strong>{formatMm(range)}</strong>{s.model==='generic'?' (valor del modelo genérico del banco).':' (el de tu ficha).'}</>:'El detector actual no tiene datos: completa su ficha técnica.'}</p>
    <Actions apply={apply} disabled={error!==undefined||d===null}/>
  </>;
}
export function DetectorEditor({id,settings:s,spec,pending,onChange,onClose,onSheet}:Props){
  return <EditorWindow title={TITLES[id]} subtitle={id==='supply'?'Tensión fija de 24 V':id==='sensor'?'3 hilos · salida todo/nada':'Material y posición'} onClose={onClose}><div className="lab-editor-pop temp-pop">
    {id==='supply'?<><Toggle pressed={s.supplyOn} onClick={()=>onChange({supplyOn:!s.supplyOn})}>{s.supplyOn?'Apagar la fuente':'Encender la fuente'}</Toggle><p className="lab-saved-as">Entrega 24 V entre +24 V y 0 V. Si unes esos dos bornes con un cable hay un cortocircuito.</p></>:null}
    {id==='sensor'?<>
      <label className="temp-select">Modelo<select aria-label="Modelo del detector" value={s.model} onChange={e=>onChange({model:e.target.value as Settings['model']})}><option value="generic">Genérico del banco</option>{MODELS.map(m=><option key={m} value={m}>{m} (según tu ficha)</option>)}</select></label>
      {s.model==='generic'?<>
        <div className="lab-field"><label>Principio de detección</label><div className="lab-chips" role="group" aria-label="Principio de detección">{KINDS.map((k:Kind)=><button key={k} type="button" aria-pressed={s.kind===k} onClick={()=>onChange({kind:k})}>{KIND_NAMES[k]}</button>)}</div></div>
        <div className="lab-field"><label>Salida</label><div className="lab-chips" role="group" aria-label="Tipo de salida">{(['pnp','npn'] as Output[]).map(o=><button key={o} type="button" aria-pressed={s.output===o} onClick={()=>onChange({output:o})}>{OUTPUT_NAMES[o]}</button>)}</div></div>
        <p className="lab-saved-as">Detector genérico de 3 hilos, normalmente abierto, con alcance {formatMm(GENERIC_RANGE[s.kind])}. Es un modelo del banco: no corresponde a ningún detector comercial.</p>
      </>:<p className={spec?'lab-saved-as':'lab-field-error'} role={spec?undefined:'alert'}>{spec?<>Simulado con los datos de tu ficha: {spec.label}, alcance {formatMm(spec.range)}. Los bornes, colores y distancias del modelo real siguen pendientes de su ficha técnica.</>:pending}</p>}
    </>:null}
    {id==='object'?<ObjectForm settings={s} spec={spec} onChange={onChange} onClose={onClose}/>:null}
    <footer><button type="button" onClick={()=>onSheet(id==='supply'?'psu':id==='object'?'target':s.model!=='generic'?s.model:s.kind)}><BookOpen size={15}/>Ver ficha del equipo</button></footer>
  </div></EditorWindow>;
}
