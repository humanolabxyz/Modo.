import {FileText as EquipmentFileIcon} from 'lucide-react';
import {ProbeIcon} from './ToolbarIcons';
import {instrumentSample} from './temperature/instrument';
import {useCallback,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Cable,Check,ChevronDown,ChevronRight,Download,ExternalLink,Hand,MousePointer2,Trash2,Unplug,Eraser} from 'lucide-react';
import {PanStage} from './PanStage';
import {FloatingDock,type DockItem} from './CanvasControls';
import {BenchScene,displayText,type Equipment,type Tool} from './detectors/BenchScene';
import {DetectorEditor} from './detectors/DetectorEditor';
import {DetectorChart} from './detectors/DetectorChart';
import {DetectorDatasheetWindow} from './detectors/DetectorDatasheets';
import {DATASHEETS,type SheetId} from './detectors/datasheets';
import {WORLD} from './detectors/geometry';
import {KINDS,KIND_NAMES,MATERIAL_NAMES,MODELS,OUTPUT_NAMES,TERMINALS,defaultSettings,effectiveSpec,fichaComplete,levelOf,readMeter,solve,terminalLabel,type Ficha,type Kind,type Material,type ModelId,type Output,type Settings,type Terminal} from './detectors/physics';
import {addRecord,benchKey,connectionText,formatNumber,formatVolts,parseBench,parseNumber,progressKey,seriesKey,seriesName,serializeBench,toCsv,type DetRecord} from './detectors/state';
import {detStudyUrl,detectorLesson,newDetProgress,readDetProgress,type DetProgress} from '../learning/detectorLessons';
import '../styles/temperature.css';
import '../styles/detectors.css';

type CardKey='guide'|'meter'|'log'|'chart'|'wires'|'sheets';
function Card({title,summary,open,onToggle,className,children}:{title:string;summary?:ReactNode;open:boolean;onToggle:()=>void;className?:string;children:ReactNode}){
  return <section className={`lab-float ${className??''}`} aria-label={title}><header><button type="button" className="lab-card-toggle" aria-expanded={open} onClick={onToggle}>{open?<ChevronDown size={15}/>:<ChevronRight size={15}/>}<span>{title}</span></button>{summary?<strong>{summary}</strong>:null}</header>{open?<div className="lab-float-body">{children}</div>:null}</section>;
}
const newId=()=>`r${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;
const FICHA_LABELS:Record<keyof Ficha,string>={brand:'Marca',wires:'Hilos',principle:'Principio',output:'Salida',supply:'Alimentación',range:'Distancia (mm)'};
const sameWire=(a:[Terminal,Terminal],b:[Terminal,Terminal])=>(a[0]===b[0]&&a[1]===b[1])||(a[0]===b[1]&&a[1]===b[0]);

export default function DetectorsView(){
  const [lesson]=useState(()=>detectorLesson(new URLSearchParams(location.search).get('leccion')));
  const storageKey=benchKey(lesson?.id);
  const [settings,setSettings]=useState<Settings>(defaultSettings),[records,setRecords]=useState<DetRecord[]>([]);
  const [ready,setReady]=useState(false),[saveNote,setSaveNote]=useState(''),[tool,setTool]=useState<Tool>('select'),[selected,setSelected]=useState<Equipment|null>(null),[notice,setNotice]=useState(''),[wireFrom,setWireFrom]=useState<Terminal|null>(null);
  const narrow=()=>typeof matchMedia==='function'&&matchMedia('(max-width:800px)').matches;
  const [open,setOpen]=useState<Record<CardKey,boolean>>(()=>({guide:!!lesson,meter:!narrow(),log:false,chart:false,wires:false,sheets:false})),[tab,setTab]=useState<'simulada'|'real'>('simulada');
  const [chartSeries,setChartSeries]=useState(''),[chartRef,setChartRef]=useState<'0v'|'plus'>('0v');
  const [readoutState,setReadoutState]=useState<string|null>(null),[captureOpen,setCaptureOpen]=useState(false),[entry,setEntry]=useState(''),[entryError,setEntryError]=useState('');
  const [real,setReal]=useState({model:'generic' as Settings['model'],kind:'inductive' as Kind,output:'pnp' as Output,object:'metal' as Material,detected:'yes',ref:'0v' as '0v'|'plus',value:'',error:''});
  const [progress,setProgress]=useState<DetProgress>(newDetProgress),[feedback,setFeedback]=useState(''),[passed,setPassed]=useState(false),[answer,setAnswer]=useState('');
  const blocked=useRef(false),progressBlocked=useRef(false),latest=useRef({settings,records,ready}),refs=useRef<Partial<Record<Equipment,SVGGElement|null>>>({}),wrap=useRef<HTMLDivElement>(null);
  latest.current={settings,records,ready};
  const [anchor,setAnchor]=useState<{left:number;top:number}|null>(null),[sheet,setSheet]=useState<{focus:SheetId|null}|null>(null);

  /* Carga y guardado independientes por lección (el banco libre tiene el suyo). Un guardado incompatible se conserva sin sobrescribir. */
  useEffect(()=>{
    try{const raw=localStorage.getItem(storageKey);if(raw){const data=parseBench(raw);setSettings(data.settings);setRecords(data.records);}}
    catch{blocked.current=true;setSaveNote('El guardado anterior se conserva porque no se pudo leer. Puedes trabajar, pero los cambios nuevos no se guardarán.');}
    if(lesson){try{setProgress(readDetProgress(lesson));}catch{progressBlocked.current=true;setSaveNote('El avance anterior se conserva porque no se pudo leer. El nuevo avance no se guardará.');}}
    setReady(true);
  },[storageKey,lesson]);
  const save=useCallback(()=>{
    const {settings:s,records:r,ready:ok}=latest.current;if(!ok||blocked.current)return;
    try{localStorage.setItem(storageKey,serializeBench(s,r));setSaveNote('');}catch{setSaveNote('No se pudo guardar en este navegador. Descarga tus datos en CSV antes de salir.');}
  },[storageKey]);
  useEffect(()=>{if(!ready)return;const timer=setTimeout(save,300);return()=>clearTimeout(timer);},[settings,records,ready,save]);
  useEffect(()=>{window.addEventListener('pagehide',save);return()=>{window.removeEventListener('pagehide',save);save();};},[save]);
  useEffect(()=>{if(!notice)return;const id=setTimeout(()=>setNotice(''),5000);return()=>clearTimeout(id);},[notice]);

  const info=useMemo(()=>effectiveSpec(settings),[settings]),spec=info.spec;
  const sol=useMemo(()=>solve(settings,spec),[settings,spec]),reading=useMemo(()=>readMeter(settings,sol),[settings,sol]);
  const toggle=(key:CardKey)=>setOpen(o=>narrow()?{guide:false,meter:false,log:false,chart:false,wires:false,sheets:false,[key]:!o[key]}:{...o,[key]:!o[key]});
  const change=useCallback((patch:Partial<Settings>)=>setSettings(prev=>({...prev,...patch})),[]);
  const onTerminal=(id:Terminal)=>{
    if(tool==='red'){change({red:id});if(!settings.black)setTool('black');else setTool('select');}
    else if(tool==='black'){change({black:id});setTool('select');}
    else if(tool==='wire'){
      if(!wireFrom){setWireFrom(id);return;}
      if(wireFrom===id){setWireFrom(null);return;}
      const wire:[Terminal,Terminal]=[wireFrom,id];setWireFrom(null);
      setSettings(prev=>prev.wires.some(w=>sameWire(w,wire))?{...prev,wires:prev.wires.filter(w=>!sameWire(w,wire))}:prev.wires.length>=40?prev:{...prev,wires:[...prev.wires,wire]});
    }else setNotice('Elige «Cable», «Punta roja» o «Punta negra» en la barra inferior y luego pulsa un borne.');
  };
  const pickTool=(t:Tool)=>{setTool(t);setWireFrom(null);};

  /* La edición contextual sigue al equipo seleccionado aunque se desplace o acerque la vista. */
  useEffect(()=>{
    if(!selected){setAnchor(null);return;}
    let frame=0,last='';
    const measure=()=>{
      const el=refs.current[selected],box=wrap.current;
      if(el&&box){const r=el.getBoundingClientRect(),b=box.getBoundingClientRect(),width=292;let left=r.right-b.left+12;if(left+width>b.width-12)left=r.left-b.left-width-12;left=Math.max(8,Math.min(b.width-width-8,left));const top=Math.max(76,Math.min(Math.max(76,b.height-360),r.top-b.top)),key=`${Math.round(left)}|${Math.round(top)}`;if(key!==last){last=key;setAnchor({left,top});}}
      frame=requestAnimationFrame(measure);
    };
    measure();return()=>cancelAnimationFrame(frame);
  },[selected]);
  useEffect(()=>{
    const keys=(e:KeyboardEvent)=>{
      if(e.ctrlKey||e.metaKey||e.altKey||(e.target as Element)?.closest('input,textarea,select,[contenteditable]'))return;
      const map:Record<string,()=>void>={v:()=>pickTool('select'),h:()=>pickTool('pan'),c:()=>pickTool('wire'),r:()=>pickTool('red'),n:()=>pickTool('black'),q:()=>change({red:null,black:null}),x:()=>change({wires:[]}),f:()=>setSheet(w=>w?null:{focus:null})};
      const run=map[e.key.toLowerCase()];if(run){e.preventDefault();run();}
    };
    window.addEventListener('keydown',keys);return()=>window.removeEventListener('keydown',keys);
  },[change]);

  /* Registro de una lectura de la salida con sentido físico. */
  const why=readoutState?`Suelta ${readoutState} para registrar una lectura directa.`:reading.state==='off'?'Enciende el multímetro con la función V.':!spec?(info.pending||'El detector no tiene datos.'):!sol.powered?(sol.short?'Hay un cortocircuito en la fuente.':!settings.supplyOn?'Enciende la fuente (pulsa la fuente).':'Alimenta el detector: +V a +24 V y 0 V a 0 V, con la polaridad correcta.'):!reading.out?'Mide la salida: una punta en OUT y la otra en 0 V o en +V.':'';
  const record=()=>{setCaptureOpen(true);setEntry('');setEntryError('');setTab('simulada');setOpen(o=>({...o,log:true}));};
  const capture=()=>{
    if(why||!spec||!reading.out||reading.value===null)return;
    const typed=parseNumber(entry),sample=instrumentSample(reading.value,'V');if(typed===null||Math.abs(typed-sample.value)>sample.step*.49+1e-9){setEntryError('Transcribe la lectura de la pantalla, con su signo y decimal.');return;}
    const item:DetRecord={id:newId(),source:'simulada',model:settings.model,kind:spec.kind,output:spec.output,object:settings.object,detected:sol.active,ref:reading.out.ref,value:sample.value,at:Date.now()};
    setRecords(list=>addRecord(list,item));setTab('simulada');setCaptureOpen(false);
    setNotice(`Registrado: ${seriesName(item)} · ${MATERIAL_NAMES[item.object]} → ${formatVolts(item.value)}`);
  };
  const addReal=()=>{
    const v=parseNumber(real.value);
    if(v===null||Math.abs(v)>60){setReal(r=>({...r,error:'Escribe la tensión medida en volts (entre −60 y 60), por ejemplo 23,9.'}));return;}
    setRecords(list=>addRecord(list,{id:newId(),source:'real',model:real.model,kind:real.kind,output:real.output,object:real.object,detected:real.detected==='yes'&&real.object!=='none',ref:real.ref,value:v,at:Date.now()}));
    setReal(r=>({...r,value:'',error:''}));
  };
  const download=()=>{const url=URL.createObjectURL(new Blob(['﻿'+toCsv(records)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='modo-detectores-datos.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};

  /* Guía de la lección. */
  const step=lesson?.steps[progress.step],done=!!lesson&&lesson.steps.every((_,i)=>progress.completed.includes(i));
  const updateProgress=(next:DetProgress)=>{setProgress(next);if(!lesson||progressBlocked.current)return;try{localStorage.setItem(progressKey(lesson.id),JSON.stringify(next));}catch{setSaveNote('No se pudo guardar el avance de la guía.');}};
  const check=()=>{
    if(!step||!lesson)return;let ok=false;const ctx={settings,spec,sol,reading,records};
    if(step.ask){
      const expected=step.ask.expected(ctx);if(expected===null){setPassed(false);setFeedback(step.ask.missing);return;}
      const given=parseNumber(answer);ok=given!==null&&Math.abs(given-expected)<=step.ask.tolerance;
      if(!ok){setPassed(false);setFeedback(given===null?'Escribe tu resultado como número (puedes usar coma decimal).':'Todavía no coincide. Revisa tu registro y tu montaje.');return;}
    }else ok=!!step.check?.(ctx);
    setPassed(ok);setFeedback(ok?step.success:'Todavía no se cumple. Revisa las indicaciones del paso y el estado del banco.');
    if(ok)updateProgress({...progress,completed:[...new Set([...progress.completed,progress.step])]});
  };
  const move=(index:number)=>{updateProgress({...progress,step:index});setFeedback('');setPassed(false);setAnswer('');};

  const dock:DockItem[]=[
    {id:'select',label:'Seleccionar',shortcut:'V',icon:<MousePointer2 size={20}/>,pressed:tool==='select',onClick:()=>pickTool('select')},
    {id:'pan',label:'Mover vista',shortcut:'H',icon:<Hand size={20}/>,pressed:tool==='pan',onClick:()=>{pickTool('pan');setSelected(null);}},
    'separator',
    {id:'wire',label:'Cable',shortcut:'C',icon:<Cable size={20}/>,pressed:tool==='wire',onClick:()=>pickTool('wire')},
    {id:'unwire',label:'Quitar todos los cables',shortcut:'X',icon:<Eraser size={20}/>,disabled:!settings.wires.length,onClick:()=>{change({wires:[]});pickTool('select');}},
    'separator',
    {id:'red',label:'Punta roja',shortcut:'R',icon:<ProbeIcon color="red"/>,pressed:tool==='red',onClick:()=>pickTool('red')},
    {id:'black',label:'Punta negra',shortcut:'N',icon:<ProbeIcon color="black"/>,pressed:tool==='black',onClick:()=>pickTool('black')},
    {id:'unplug',label:'Quitar las puntas',shortcut:'Q',icon:<Unplug size={20}/>,disabled:!settings.red&&!settings.black,onClick:()=>{change({red:null,black:null});pickTool('select');}},
    'separator',
    {id:'sheets',label:'Fichas de los equipos',shortcut:'F',icon:<EquipmentFileIcon size={20}/>,pressed:!!sheet,onClick:()=>setSheet(sheet?null:{focus:null})},
  ];
  const hint=tool==='wire'?(wireFrom?`Pulsa el segundo borne para unirlo con «${terminalLabel(wireFrom)}».`:'Pulsa un borne y luego otro para unirlos con un cable. Repetir un cable lo quita.'):tool==='red'?'Pulsa el borne donde va la punta roja.':tool==='black'?'Pulsa el borne donde va la punta negra.':tool==='pan'?'Arrastra para mover la vista; Ctrl y rueda para acercar.':'Arrastra de un borne a otro para cablear. Mueve el objeto y lleva las puntas al montaje.';
  const shown=records.filter(r=>r.source===tab);
  const seriesList=[...new Map(records.map(r=>[seriesKey(r),seriesName(r)])).entries()];
  const activeSeries=seriesList.some(([k])=>k===chartSeries)?chartSeries:seriesList[0]?.[0]??'';
  const terminalOptions=[<option key="" value="">Sin conectar</option>,...TERMINALS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)];
  const status=!spec?'Detector sin datos':sol.active?'Detecta el objeto: salida activa':sol.powered?'Alimentado · sin detección':'Sin alimentación válida';

  return <section ref={wrap} className={`lab-canvas-workspace tool-temperature tool-detectors ${lesson?'has-guide':''}`} data-tool={tool} data-detectors-ready={ready} aria-label="Banco de detectores">
    <PanStage width={WORLD.w} height={WORLD.h} label="Banco de detectores" fitLabel="Ajustar el banco" focus={()=>innerWidth<700?{x:30,y:60,w:720,h:560}:null} onBackground={()=>{setSelected(null);setWireFrom(null);}}>
      <BenchScene settings={settings} spec={spec} pending={info.pending} sol={sol} reading={reading} tool={tool} wireFrom={wireFrom} selected={selected} onSelect={id=>setSelected(prev=>prev===id?null:id)} onTerminal={onTerminal} refs={refs} onChange={change} onRecord={record} onLog={()=>toggle('log')} recordReady={!why} onReadoutState={setReadoutState}/>
    </PanStage>

    {lesson?<div className="temp-left"><Card className="temp-guide" title="Guía de la práctica" summary={<span className="lab-count">{progress.completed.length}/{lesson.steps.length}</span>} open={open.guide} onToggle={()=>toggle('guide')}>
      <a className="temp-back" href={detStudyUrl(lesson)} onClick={save}><ArrowLeft size={15}/>Volver a la clase</a>
      {step?<>
        <p className="temp-eyebrow">PASO {progress.step+1} DE {lesson.steps.length}</p><h2>{step.title}</h2><p>{step.text}</p>
        {step.ask?<div className="lab-field"><label htmlFor="temp-answer">{step.ask.prompt}</label><div className="lab-field-row"><input id="temp-answer" type="text" inputMode="decimal" autoComplete="off" value={answer} maxLength={24} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();check();}}}/><span className="lab-suffix">{step.ask.unit}</span></div></div>:null}
        <button type="button" className="lab-apply" onClick={check}>Comprobar mi trabajo <Check size={15}/></button>
        {feedback?<p className={`temp-feedback ${passed?'ok':''}`} role="status">{feedback}</p>:null}
        <div className="temp-steps"><button type="button" aria-label="Paso anterior" disabled={progress.step===0} onClick={()=>move(progress.step-1)}><ArrowLeft size={16}/></button><span>{progress.completed.length}/{lesson.steps.length} comprobados</span><button type="button" aria-label="Paso siguiente" disabled={progress.step===lesson.steps.length-1||!progress.completed.includes(progress.step)} onClick={()=>move(progress.step+1)}><ArrowRight size={16}/></button></div>
        {done?<a className="lab-apply temp-finish" href={detStudyUrl(lesson,2)} onClick={save}>Práctica completada · volver a Estudio <ArrowRight size={15}/></a>:null}
        <label className="temp-notes">Mis observaciones<textarea value={progress.notes} maxLength={20000} placeholder="Qué observaste, qué cambió y por qué…" onChange={e=>updateProgress({...progress,notes:e.target.value})}/></label>
        <a className="temp-source" href={lesson.source} target="_blank" rel="noreferrer">Guía original ({lesson.guide}) <ExternalLink size={13}/></a>
        <a className="temp-source" href="/laboratorio?tool=detectors" onClick={save}>Abrir mi banco libre ↗</a>
      </>:null}
    </Card></div>:null}

    <div className="temp-right">
      <div className="lab-float detector-bench-status"><p role="status">{status}</p>{sol.warnings.map(w=><p key={w} role="alert">{w}</p>)}</div>
      <Card className="temp-log-card" title="Registro" summary={<span className="lab-count">{shown.length}</span>} open={open.log} onToggle={()=>toggle('log')}>
        {captureOpen&&tab==='simulada'?<form className="notebook-entry" onSubmit={e=>{e.preventDefault();capture();}}><strong>Anota la salida del detector</strong><label>Lectura del Fluke (V)<input aria-label="Transcribir lectura del detector" inputMode="decimal" value={entry} onChange={e=>{setEntry(e.target.value);setEntryError('');}}/></label><button type="submit">Guardar medición del detector</button><small role="status">{why||entryError||'Lee la pantalla y transcribe el valor medido.'}</small></form>:null}
        <div className="temp-tabs" role="tablist" aria-label="Origen de los datos">{(['simulada','real'] as const).map(k=><button key={k} role="tab" type="button" aria-selected={tab===k} onClick={()=>setTab(k)}>{k==='simulada'?'Preparación':'En clase'}</button>)}</div>
        {tab==='real'?<form className="temp-real" onSubmit={e=>{e.preventDefault();addReal();}}>
          <small>Escribe las mediciones que tomaste con tus equipos. Se guardan aparte de las simuladas.</small>
          <label className="temp-select">Modelo<select aria-label="Modelo medido" value={real.model} onChange={e=>setReal(r=>({...r,model:e.target.value as Settings['model']}))}><option value="generic">Otro / genérico</option>{MODELS.map(m=><option key={m} value={m}>{m}</option>)}</select></label>
          <label className="temp-select">Principio<select aria-label="Principio medido" value={real.kind} onChange={e=>setReal(r=>({...r,kind:e.target.value as Kind}))}>{KINDS.map(k=><option key={k} value={k}>{KIND_NAMES[k]}</option>)}</select></label>
          <label className="temp-select">Salida<select aria-label="Salida medida" value={real.output} onChange={e=>setReal(r=>({...r,output:e.target.value as Output}))}>{(['pnp','npn'] as Output[]).map(o=><option key={o} value={o}>{OUTPUT_NAMES[o]}</option>)}</select></label>
          <label className="temp-select">Objeto<select aria-label="Objeto medido" value={real.object} onChange={e=>setReal(r=>({...r,object:e.target.value as Material}))}>{(['none','metal','plastic'] as Material[]).map(m=><option key={m} value={m}>{MATERIAL_NAMES[m]}</option>)}</select></label>
          <label className="temp-select">¿Detectó el objeto?<select aria-label="Detección real" value={real.detected} onChange={e=>setReal(r=>({...r,detected:e.target.value}))}><option value="yes">Sí</option><option value="no">No</option></select></label>
          <label className="temp-select">Medida entre<select aria-label="Medida entre" value={real.ref} onChange={e=>setReal(r=>({...r,ref:e.target.value as '0v'|'plus'}))}><option value="0v">OUT y 0 V</option><option value="plus">OUT y +V</option></select></label>
          <label className="temp-select">Tensión (V)<input aria-label="Tensión medida" inputMode="decimal" value={real.value} maxLength={12} onChange={e=>setReal(r=>({...r,value:e.target.value,error:''}))}/></label>
          {real.error?<p className="lab-field-error" role="alert">{real.error}</p>:null}
          <button type="submit" className="lab-apply">Agregar medición real</button>
        </form>:<small>Lecturas del banco. Repetir la misma condición reemplaza al registro anterior.</small>}
        {shown.length?<div className="temp-table-wrap"><table className="temp-table"><thead><tr><th scope="col">Detector</th><th scope="col">Objeto</th><th scope="col">Medida</th><th scope="col">V</th><th scope="col">Nivel</th><th><span className="lab-sr-only">Quitar</span></th></tr></thead><tbody>{shown.map(r=>
          <tr key={r.id}><td>{seriesName(r)}</td><td>{r.object==='none'?'sin objeto':`${r.object==='metal'?'metal':'plástico'} · ${r.detected?'detectado':'no detectado'}`}</td><td>{r.ref==='0v'?'OUT–0 V':'OUT–+V'}</td><td>{formatNumber(r.value,2)}</td><td>{levelOf(r.value,r.ref)}</td><td><button type="button" className="lab-icon-button" aria-label={`Quitar registro de ${seriesName(r)}, ${MATERIAL_NAMES[r.object]}`} onClick={()=>setRecords(l=>l.filter(x=>x.id!==r.id))}><Trash2 size={14}/></button></td></tr>)}</tbody></table></div>:<p className="temp-empty">Todavía no hay datos {tab==='simulada'?'de preparación':'de clase'}.</p>}
        <div className="temp-log-actions"><button type="button" disabled={!records.length} onClick={download}><Download size={14}/>CSV para planilla</button><button type="button" disabled={!shown.length} onClick={()=>{if(confirm(`Se borrarán los datos ${tab==='simulada'?'de preparación':'de clase'}. ¿Continuar?`))setRecords(l=>l.filter(r=>r.source!==tab));}}>Vaciar {tab==='simulada'?'preparación':'clase'}</button></div>
      </Card>
      <Card className="temp-chart-card" title="Gráfica" open={open.chart} onToggle={()=>toggle('chart')}>
        {seriesList.length?<>
          <label className="temp-select">Detector<select aria-label="Detector de la gráfica" value={activeSeries} onChange={e=>setChartSeries(e.target.value)}>{seriesList.map(([k,n])=><option key={k} value={k}>{n}</option>)}</select></label>
          <div className="temp-tabs" role="tablist" aria-label="Medida de la gráfica">{([['0v','OUT–0 V'],['plus','OUT–+V']] as const).map(([k,n])=><button key={k} role="tab" type="button" aria-selected={chartRef===k} onClick={()=>setChartRef(k)}>{n}</button>)}</div>
          <DetectorChart series={activeSeries} records={records} measure={chartRef}/>
          <small>Tensión de salida (V) según el objeto. 24 V es nivel alto y 0 V nivel bajo.</small>
        </>:<p className="temp-empty">Registra puntos para ver la gráfica de la salida.</p>}
      </Card>
      <Card className="det-wires-card" title="Conexiones" summary={<span className="lab-count">{settings.wires.length}</span>} open={open.wires} onToggle={()=>toggle('wires')}>
        {settings.wires.length?<ol className="det-wire-list" aria-label="Diagrama de conexión">{settings.wires.map((w,i)=><li key={`${w[0]}${w[1]}`}><span>{connectionText(w)}</span><button type="button" className="lab-icon-button" aria-label={`Quitar cable ${connectionText(w)}`} onClick={()=>setSettings(p=>({...p,wires:p.wires.filter((_,j)=>j!==i)}))}><Trash2 size={14}/></button></li>)}</ol>:<p className="temp-empty">Todavía no hay cables. Usa la herramienta «Cable» y pulsa dos bornes.</p>}
        <small>Esta lista es el diagrama de conexión de tu montaje. Los bornes son genéricos del banco; los de cada modelo y los de la maqueta Delta siguen pendientes de ficha.</small>
      </Card>
      <Card className="det-sheets-card" title="Fichas" summary={<span className="lab-count">{MODELS.filter(m=>fichaComplete(settings.fichas[m])).length}/{MODELS.length}</span>} open={open.sheets} onToggle={()=>toggle('sheets')}>
        <small>Tu ficha de cada modelo de la guía G02. Puedes escribirla desde el manual o copiar los datos de la ficha citada (de fabricante o distribuidor, con enlaces); el banco no verifica que coincidan con tu equipo.</small>
        {MODELS.map((m:ModelId)=>{
          const f=settings.fichas[m],set=(patch:Partial<Ficha>)=>setSettings(p=>({...p,fichas:{...p.fichas,[m]:{...p.fichas[m],...patch}}}));
          const cited=DATASHEETS.find(d=>d.id===m);
          return <details key={m} className="det-ficha" open={m===settings.model}><summary>{m}<span className={fichaComplete(f)?'ok':''}>{fichaComplete(f)?'completa':'pendiente de ficha técnica'}</span></summary>
            {cited?.fill?<><button type="button" className="lab-wide" aria-label={`${m} · usar los datos de la ficha citada`} onClick={()=>set(cited.fill!)}>Usar los datos de la ficha citada</button><button type="button" className="lab-wide" onClick={()=>setSheet({focus:m})}>Ver la ficha con sus fuentes</button></>:null}
            <label className="temp-select">{FICHA_LABELS.brand}<input aria-label={`${m} · marca`} value={f.brand} maxLength={60} onChange={e=>set({brand:e.target.value})}/></label>
            <label className="temp-select">{FICHA_LABELS.wires}<select aria-label={`${m} · hilos`} value={f.wires} onChange={e=>set({wires:e.target.value as Ficha['wires']})}><option value="">—</option><option value="2">2 hilos</option><option value="3">3 hilos</option><option value="4">4 hilos</option></select></label>
            <label className="temp-select">{FICHA_LABELS.principle}<select aria-label={`${m} · principio`} value={f.principle} onChange={e=>set({principle:e.target.value as Ficha['principle']})}><option value="">—</option>{KINDS.map(k=><option key={k} value={k}>{KIND_NAMES[k]}</option>)}</select></label>
            <label className="temp-select">{FICHA_LABELS.output}<select aria-label={`${m} · salida`} value={f.output} onChange={e=>set({output:e.target.value as Ficha['output']})}><option value="">—</option><option value="pnp">PNP</option><option value="npn">NPN</option><option value="other">Otra</option></select></label>
            <label className="temp-select">{FICHA_LABELS.supply}<input aria-label={`${m} · alimentación`} value={f.supply} maxLength={60} placeholder="según el manual" onChange={e=>set({supply:e.target.value})}/></label>
            <label className="temp-select">{FICHA_LABELS.range}<input aria-label={`${m} · distancia de detección`} inputMode="decimal" value={f.range} maxLength={12} onChange={e=>set({range:e.target.value})}/></label>
          </details>;
        })}
      </Card>
    </div>

    {selected&&anchor?<div className="lab-editor-anchor temp-pop-anchor" style={{left:anchor.left,top:anchor.top}}><DetectorEditor key={selected} id={selected} settings={settings} spec={spec} pending={info.pending} onChange={change} onClose={()=>setSelected(null)} onSheet={id=>setSheet({focus:id})}/></div>:null}
    {sheet?<DetectorDatasheetWindow open={sheet.focus} onClose={()=>setSheet(null)}/>:null}
    <div className="lab-hint temp-hint" role="status">{notice||hint}{saveNote?<span className="temp-save"> · {saveNote}</span>:null}</div>
    <FloatingDock items={dock} label="Herramientas del banco de detectores"/>
  </section>;
}
