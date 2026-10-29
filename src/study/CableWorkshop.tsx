import {CableMeter} from './CableMeter';
import {SerialPractice} from './SerialPractice';
import {useRef,useState} from 'react';
import {cableTargets,cableValid,freshCable,cableSignature,type CableState,type CableWire} from './academicModels';
import {WIRE_PALETTE,isWireColor,wireColor,wireColorName} from '../data/wireColors';
type Measurement={a:string;b:string;connected:boolean;signature:string;ohms?:number|null};
export {cableSignature} from './academicModels';
function readMeasurements(raw?:string):Measurement[]{try{const rows=JSON.parse(raw||'[]');return Array.isArray(rows)?rows.filter(m=>m&&typeof m.a==='string'&&typeof m.b==='string'&&typeof m.connected==='boolean'&&typeof m.signature==='string'&&(m.ohms===undefined||m.ohms===null||(typeof m.ohms==='number'&&Number.isFinite(m.ohms)&&m.ohms>=0))).slice(-100):[];}catch{return [];}}
export function readCable(raw?:string):CableState{
  if(!raw)return freshCable();
  try{const s=JSON.parse(raw) as CableState; if(typeof s.cut!=='boolean'||!Array.isArray(s.wires)||s.wires.length!==3||s.wires.some(w=>!Number.isInteger(w.pin)||w.pin<0||w.pin>9||!Number.isInteger(w.terminal)||w.terminal<0||w.terminal>3||['stripped','tinned','soldered','tight','broken','cold'].some(k=>typeof w[k as keyof CableWire]!=='boolean'))||['bridge','flex','running'].some(k=>typeof s[k as keyof CableState]!=='boolean')||![s.hmiBaud,s.plcBaud].every(v=>[4800,9600,19200,38400,57600,115200].includes(v))||![s.hmiAddress,s.plcAddress].every(v=>[1,2,3].includes(v)))throw Error();return {...s,wires:s.wires.map(w=>({...w,color:isWireColor(w.color)?w.color:undefined})),revision:Number.isSafeInteger(s.revision)&&s.revision>=0?s.revision:0};}catch{return freshCable();}
}
export function verifiedCable(draft:Record<string,string>){
  if(!draft.cable)return false;const state=readCable(draft.cable);if(!cableValid(state))return false;
  try {const tests=readMeasurements(draft.measurements),sig=cableSignature(state);
    return cableTargets.every(t=>tests.some(m=>m.signature===sig&&((m.a===`p${t.pin}`&&m.b===`t${t.terminal}`)||(m.b===`p${t.pin}`&&m.a===`t${t.terminal}`))&&m.connected))&&[[1,6],[1,5],[6,5]].every(([a,b])=>tests.some(m=>m.signature===sig&&((m.a===`p${a}`&&m.b===`p${b}`)||(m.b===`p${a}`&&m.a===`p${b}`))&&!m.connected));
  }catch{return false;}
}
export function CableWorkshop({draft,onChange,manualSolder=false,showSerial=true}:{draft:Record<string,string>;onChange:(d:Record<string,string>)=>void;manualSolder?:boolean;showSerial?:boolean}){
  const s=readCable(draft.cable),[wire,setWire]=useState(0),[tool,setTool]=useState('strip'),[back,setBack]=useState(false),[message,setMessage]=useState('');
  const notebook=useRef<HTMLDetailsElement>(null);
  const measures=readMeasurements(draft.measurements);
  const set=(next:CableState)=>onChange({...draft,cable:JSON.stringify({...next,revision:cableSignature({...next,revision:s.revision})===cableSignature(s)?s.revision:s.revision+1,running:s.running}),_touched:'yes'});
  const edit=(patch:Partial<CableWire>)=>set({...s,wires:s.wires.map((w,i)=>i===wire?{...w,...patch}:w)});
  const useTool=()=>{
    const w=s.wires[wire];
    if(tool==='cut'){set({...s,cut:true});setMessage('Cubierta preparada. Ahora pela los extremos de cada conductor.');return;}
    if(!s.cut){setMessage('Prepara primero la cubierta con el cortador.');return;}
    if(tool==='strip'){edit({stripped:true});setMessage('Extremos pelados; ahora puedes estañar y preparar la unión.');}
    if(tool==='tin'){if(!w.stripped){setMessage('El aislamiento impide estañar: pela primero.');return;}edit({tinned:true});setMessage('Extremo estañado en el modelo de operaciones.');}
    if(tool==='solder'){if(!w.stripped||!w.tinned||!w.pin){setMessage('Pela, estaña y selecciona un pin antes de soldar.');return;}edit({soldered:true,cold:false});setMessage('Unión soldada. Comprueba su recorrido con el instrumento.');}
    if(tool==='tight'){if(!w.stripped||!w.terminal){setMessage('Pela e inserta el conductor en un terminal antes de apretar.');return;}edit({tight:true});setMessage('Conductor sujeto al terminal seleccionado.');}
  };
  const endpoints=[...Array.from({length:9},(_,i)=>({id:`p${i+1}`,label:`DB9 pin ${i+1}`})),...Array.from({length:3},(_,i)=>({id:`t${i+1}`,label:`Terminal T${i+1}`}))];
  const positions=Array.from({length:9},(_,i)=>({pin:i+1,x:back?285-(i<5?i: i-5)*40:85+(i<5?i:i-5)*40,y:i<5?65:112}));
  return <section className="academic-cable" aria-label="Taller virtual de cable">
    <p className="academic-limits"><strong>Referencia HMI DOP-107EG · COM2 MODE2 (RS485).</strong> Pin 1 D+→T1, pin 6 D−→T2, pin 5 GND→T3. T1/T2/T3 son una bornera genérica de ensayo; no identifican los bornes del PLC real. La alimentación del equipo es independiente y no está conectada aquí. <a href="https://filecenter.deltaww.com/Products/download/06/060302/Manual/DELTA_IA-HMI_DOP-107EG_TC-SC-EN-TUR_20191016.pdf" target="_blank" rel="noreferrer">Manual oficial Delta ↗</a></p>
    <p className="academic-limits">La guía F34 mezcla RS-232/RS-485 y rotula +24 V en el pin 1. Ese rótulo contradice la referencia de datos usada aquí: confirma modelo, puerto y manual antes de preparar el cable físico.</p>
    <div className="academic-actions"><button onClick={()=>setBack(!back)}>Ver {back?'frente de contactos':'cara de soldadura'}</button><span>{back?'Cara de soldadura · numeración reflejada':'Frente de contactos · DB9 macho'}</span></div>
    <svg viewBox="0 0 540 230" role="img" aria-label="DB9 con nueve pines y tres conductores hacia terminales; la numeración cambia de posición al girar el conector">
      <path d="M50 30H315L290 145H75Z" fill="#e0e5e0" stroke="#65736b" strokeWidth="3"/>
      {s.wires.map((w,i)=>{const p=positions.find(p=>p.pin===w.pin);return p&&w.terminal?<path key={i} d={`M${p.x} ${p.y} C${p.x} 220, 380 210, 460 ${45+w.terminal*43}`} fill="none" stroke={wireColor(w,i)} strokeWidth={i===wire?5:3} strokeDasharray={w.broken||!w.soldered?'7 5':undefined}/>:null;})}
      {positions.map(p=><g key={p.pin} role="button" tabIndex={0} aria-label={`Colocar conductor en pin ${p.pin}`} onClick={()=>edit({pin:p.pin,soldered:false})} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();edit({pin:p.pin,soldered:false});}}}><circle cx={p.x} cy={p.y} r="10" fill={s.wires[wire].pin===p.pin?'#237768':'#fafbf8'} stroke="#56675e"/><text x={p.x} y={p.y+4} textAnchor="middle" fill={s.wires[wire].pin===p.pin?'white':'#26362e'} fontSize="12">{p.pin}</text></g>)}
      {[1,2,3].map(t=><g key={t} role="button" tabIndex={0} aria-label={`Insertar conductor en T${t}`} onClick={()=>edit({terminal:t,tight:false})} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();edit({terminal:t,tight:false});}}}><rect x="440" y={70+t*34-25} width="70" height="30" rx="5" fill="#e1e8dd" stroke="#697a6c"/><text x="475" y={70+t*34-5} textAnchor="middle" fontSize="14">T{t}</text></g>)}
    </svg>
    {manualSolder?<div className="academic-actions"><label>Conductor a conectar en la bornera<select aria-label="Conductor" value={wire} onChange={e=>setWire(Number(e.target.value))}>{[0,1,2].map(i=><option key={i} value={i}>Conductor {i+1}</option>)}</select></label><button onClick={()=>{if(!s.wires[wire].stripped||!s.wires[wire].terminal){setMessage('Inserta primero el extremo pelado en T1, T2 o T3.');return;}edit({tight:true});setMessage('Tornillo apretado; comprueba el recorrido con las puntas.');}}>Apretar tornillo del borne</button><p role="status">{message}</p></div>:<>    <div className="academic-fields">
      <label>Conductor<select aria-label="Conductor" value={wire} onChange={e=>setWire(Number(e.target.value))}>{[0,1,2].map(i=><option key={i} value={i}>Conductor {i+1}</option>)}</select></label>
      <label>Pin DB9<select aria-label="Pin DB9" value={s.wires[wire].pin} onChange={e=>edit({pin:Number(e.target.value),soldered:false})}><option value="0">Sin colocar</option>{Array.from({length:9},(_,i)=><option key={i} value={i+1}>Pin {i+1}</option>)}</select></label>
      <label>Terminal de tornillos<select aria-label="Terminal de tornillos" value={s.wires[wire].terminal} onChange={e=>edit({terminal:Number(e.target.value),tight:false})}><option value="0">Sin insertar</option>{[1,2,3].map(t=><option key={t} value={t}>T{t}</option>)}</select></label>
      <label>Herramienta<select aria-label="Herramienta" value={tool} onChange={e=>setTool(e.target.value)}><option value="cut">Cortador · preparar cubierta</option><option value="strip">Pelacables · ambos extremos</option><option value="tin">Estaño · preparar unión</option><option value="solder">Cautín · soldar / rehacer unión</option><option value="tight">Destornillador · sujetar terminal</option></select></label>
    </div>
    <button onClick={useTool}>Aplicar herramienta</button><p role="status">{message}</p>
</>}
    <div className="academic-wire-colors" role="group" aria-label="Color del conductor seleccionado"><strong>Color del conductor {wire+1}</strong><div className="wire-color-swatches">{WIRE_PALETTE.map(c=><button key={c.hex} type="button" aria-label={`Conductor ${wire+1} · color ${c.name.toLocaleLowerCase('es')}`} aria-pressed={wireColor(s.wires[wire],wire)===c.hex} onClick={()=>edit({color:c.hex})}><i style={{background:c.hex}}/>{c.name}</button>)}</div><label>Otro color<input type="color" aria-label="Color personalizado del conductor" value={wireColor(s.wires[wire],wire)} onChange={e=>edit({color:e.target.value})}/></label><p>El color identifica el hilo, no determina su función. Comprueba sus extremos con continuidad.</p></div>
    <ul className="academic-wire-status">{s.wires.map((w,i)=><li key={i}>Conductor {i+1} ({wireColorName(wireColor(w,i))}): {w.stripped?'pelado':'aislado'} · {w.tinned?'estañado':'sin estañar'} · {w.soldered?`soldado a ${w.pin}`:'sin soldar'} · {w.tight?`sujeto a T${w.terminal}`:'sin sujetar'}</li>)}</ul>
    <details><summary>Provocar o reparar una falla</summary><div className="academic-actions"><button onClick={()=>edit({broken:!s.wires[wire].broken})}>{s.wires[wire].broken?'Reparar hilo abierto':'Interrumpir hilo seleccionado'}</button><button onClick={()=>edit({cold:!s.wires[wire].cold})}>{s.wires[wire].cold?'Rehacer unión intermitente':'Unión intermitente'}</button><button onClick={()=>set({...s,bridge:!s.bridge})}>{s.bridge?'Retirar puente 1–6':'Puente indeseado 1–6'}</button><button aria-pressed={s.flex} onClick={()=>set({...s,flex:!s.flex})}>{s.flex?'Soltar flexión':'Flexionar cable'}</button></div><p>La intermitencia es repetible: una unión marcada intermitente abre al flexionar. No se infiere su calidad física por su aspecto.</p></details>
    <CableMeter state={s} count={measures.length} onLog={()=>{if(notebook.current){notebook.current.open=true;notebook.current.scrollIntoView({block:'nearest'});}}} onMeasure={(a,b,connected,ohms)=>onChange({...draft,measurements:JSON.stringify([...measures,{a,b,connected,ohms,signature:cableSignature(s)}].slice(-100)),_touched:'yes'})}/>
    <p>Comprueba 1–T1, 6–T2, 5–T3 y aislamiento 1–6, 1–5, 6–5 (el orden de las puntas no altera la continuidad). Las pruebas anteriores a una modificación no validan el montaje nuevo.</p>
    <details ref={notebook}><summary>Mediciones registradas ({measures.length})</summary><ol>{measures.map((m,i)=><li key={i}>{m.a} → {m.b}: {m.ohms===undefined?(m.connected?'Continuidad':'Abierto'):m.ohms===null?'OL':`${m.ohms.toFixed(1).replace('.',',')} Ω`}{m.signature!==cableSignature(s)?' · montaje anterior':''}</li>)}</ol></details>
    <p role="status">{verifiedCable(draft)?'Cable comprobado: tres recorridos y tres pruebas de aislamiento.':'Pendiente: fabricar, comprobar correspondencias y medir aislamiento.'}</p>
    {showSerial?<><h3>HMI–PLC · enlace lógico de entrenamiento</h3><p>Comprueba primero el cable; luego la velocidad y el destinatario. El banco transmite una trama RTU de entrenamiento con CRC16; no ejecuta el proyecto propietario de la maqueta.</p>
    <div className="academic-fields">{(['hmi','plc'] as const).map(device=><div key={device}><label>Baud {device.toUpperCase()}<select aria-label={`Baud ${device.toUpperCase()}`} value={s[`${device}Baud`]} onChange={e=>set({...s,[`${device}Baud`]:Number(e.target.value)})}>{[4800,9600,19200,38400,57600,115200].map(v=><option key={v}>{v}</option>)}</select></label><label>Dirección {device.toUpperCase()}<select aria-label={`Dirección ${device.toUpperCase()}`} value={s[`${device}Address`]} onChange={e=>set({...s,[`${device}Address`]:Number(e.target.value)})}>{[1,2,3].map(v=><option key={v}>{v}</option>)}</select></label></div>)}</div>
    <SerialPractice wired={cableValid(s)} baud={s.hmiBaud} serverBaud={s.plcBaud} destination={s.hmiAddress} server={s.plcAddress} coil={s.running} draft={draft} onChange={patch=>{const {_coil,...rest}=patch;onChange({...draft,...rest,cable:JSON.stringify({...s,running:_coil==='true'})});}}/>
    </>:null}
  </section>;
}
