import {FileText as EquipmentFileIcon} from 'lucide-react';
import {ProbeIcon} from './ToolbarIcons';
import {TemperatureNotebook,type CaptureCell} from './temperature/TemperatureNotebook';
import {instrumentSample,measurementTemperature} from './temperature/instrument';
import {useCallback,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Check,ChevronDown,ChevronRight,Download,ExternalLink,FastForward,Hand,MousePointer2,Trash2,Unplug} from 'lucide-react';
import {FloatingWindow} from '../components/FloatingWindow';
import {PanStage} from './PanStage';
import {FloatingDock,type DockItem} from './CanvasControls';
import {BenchScene,displayText,type Equipment,type Tool} from './temperature/BenchScene';
import {TemperatureEditor} from './temperature/TemperatureEditor';
import {TemperatureChart} from './temperature/TemperatureChart';
import {DatasheetWindow} from './temperature/TemperatureDatasheets';
import type {SheetId} from './temperature/datasheets';
import {WORLD} from './temperature/geometry';
import {SET_MAX,TERMINALS,defaultSettings,isStable,normalizeSettings,readMeter,reference,settledTemps,startTemps,stepTemps,type MeterMode,type Sensor,type Settings,type Temps,type Terminal} from './temperature/physics';
import {SENSOR_NAMES,UNIT_OF,addRecord,benchKey,formatNumber,formatTemp,formatValue,parseBench,parseNumber,progressKey,sensorName,serializeBench,toCsv,matchesTempSeries,type TempRecord} from './temperature/state';
import {newTempProgress,readTempProgress,tempStudyUrl,temperatureLesson,type TempProgress} from '../learning/temperatureLessons';
import {misuseConcept,reviewUrl} from '../learning/temperatureReview';
import {noteWrong} from '../learning/temperatureReviewStore';
import '../styles/temperature.css';
import {exportGuideSpreadsheet} from '../study/guideSpreadsheet';
import {temperatureSeries} from '../study/guideWorkbookData';

const MODES:{id:MeterMode;label:string;name:string}[]=[{id:'off',label:'OFF',name:'Apagado'},{id:'mV',label:'mV',name:'Milivoltios continuos'},{id:'ohm',label:'Ω',name:'Resistencia'},{id:'V',label:'V',name:'Voltios continuos'}];
const SENSORS:Sensor[]=['tc','pt','tx'];
function Card({title,summary,open,onToggle,className,children}:{title:string;summary?:ReactNode;open:boolean;onToggle:()=>void;className?:string;children:ReactNode}){
  return <section className={`lab-float ${className??''}`} aria-label={title}><header><button type="button" className="lab-card-toggle" aria-expanded={open} onClick={onToggle}>{open?<ChevronDown size={15}/>:<ChevronRight size={15}/>}<span>{title}</span></button>{summary?<strong>{summary}</strong>:null}</header>{open?<div className="lab-float-body">{children}</div>:null}</section>;
}
const newId=()=>`r${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;

export default function TemperatureView(){
  const [lesson]=useState(()=>temperatureLesson(new URLSearchParams(location.search).get('leccion')));
  const storageKey=benchKey(lesson?.id);
  const [settings,setSettings]=useState<Settings>(defaultSettings),[records,setRecords]=useState<TempRecord[]>([]),[temps,setViewTemps]=useState<Temps>(()=>startTemps(defaultSettings()));
  const tempsRef=useRef(temps);
  const setTemps=useCallback((next:Temps)=>{tempsRef.current=next;setViewTemps(next);},[]);
  const [ready,setReady]=useState(false),[saveNote,setSaveNote]=useState(''),[tool,setTool]=useState<Tool>('select'),[selected,setSelected]=useState<Equipment|null>(null),[notice,setNotice]=useState('');
  const narrow=()=>typeof matchMedia==='function'&&matchMedia('(max-width:800px)').matches;
  const [open,setOpen]=useState(()=>({guide:!!lesson,meter:false,log:false,chart:false})),[tab,setTab]=useState<'simulada'|'real'>('simulada'),[chartSensor,setChartSensor]=useState<Sensor>('tc');
  const [readoutState,setReadoutState]=useState<string|null>(null);
  const [captureCell,setCaptureCell]=useState<CaptureCell|null>(null);
  const [real,setReal]=useState({sensor:'pt' as Sensor,temp:'',value:'',error:''});
  const [progress,setProgress]=useState<TempProgress>(newTempProgress),[feedback,setFeedback]=useState(''),[passed,setPassed]=useState(false),[answer,setAnswer]=useState('');
  const blocked=useRef(false),progressBlocked=useRef(false),settingsRef=useRef(settings),latest=useRef({settings,records,ready}),refs=useRef<Partial<Record<Equipment,SVGGElement|null>>>({}),wrap=useRef<HTMLDivElement>(null);
  settingsRef.current=settings;latest.current={settings,records,ready};
  const [anchor,setAnchor]=useState<{left:number;top:number}|null>(null),[sheet,setSheet]=useState<{focus:SheetId|null}|null>(null);

  /* Carga y guardado independientes por lección (el banco libre tiene el suyo). Un guardado incompatible se conserva sin sobrescribir. */
  useEffect(()=>{
    try{const raw=localStorage.getItem(storageKey);if(raw){const data=parseBench(raw);setSettings(data.settings);setRecords(data.records);setTemps(startTemps(data.settings));}}
    catch{blocked.current=true;setSaveNote('El guardado anterior se conserva porque no se pudo leer. Puedes trabajar, pero los cambios nuevos no se guardarán.');}
    if(lesson){try{setProgress(readTempProgress(lesson));}catch{progressBlocked.current=true;setSaveNote('El avance anterior se conserva porque no se pudo leer. El nuevo avance no se guardará.');}}
    setReady(true);
  },[storageKey,lesson]);
  const save=useCallback(()=>{
    const {settings:s,records:r,ready:ok}=latest.current;if(!ok||blocked.current)return;
    try{localStorage.setItem(storageKey,serializeBench(s,r));setSaveNote('');}catch{setSaveNote('No se pudo guardar en este navegador. Descarga tus datos en CSV antes de salir.');}
  },[storageKey]);
  useEffect(()=>{if(!ready)return;const timer=setTimeout(save,300);return()=>clearTimeout(timer);},[settings,records,ready,save]);
  useEffect(()=>{window.addEventListener('pagehide',save);return()=>{window.removeEventListener('pagehide',save);save();};},[save]);

  /* Tiempo del horno y de las sondas (acelerado). Al llegar al equilibrio se fija el valor exacto. */
  useEffect(()=>{
    let published=0;const mobile=matchMedia('(pointer:coarse)').matches;
    const id=setInterval(()=>{
      if(document.hidden)return;
      const prev=tempsRef.current,s=settingsRef.current,goal=settledTemps(s),next=stepTemps(s,prev,0.1);
      (Object.keys(next) as (keyof Temps)[]).forEach(k=>{if(Math.abs(next[k]-goal[k])<0.05)next[k]=goal[k];});
      if(Math.abs(next.bath-prev.bath)+Math.abs(next.tc-prev.tc)+Math.abs(next.pt-prev.pt)<1e-9)return;
      tempsRef.current=next;const now=performance.now();
      if(!mobile||now-published>=250||next.bath===goal.bath&&next.tc===goal.tc&&next.pt===goal.pt){published=now;setViewTemps(next);}
    },100);
    return()=>clearInterval(id);
  },[]);
  useEffect(()=>{if(!notice)return;const id=setTimeout(()=>setNotice(''),5000);return()=>clearTimeout(id);},[notice]);

  const reading=useMemo(()=>readMeter(settings,temps),[settings,temps]);
  /* Un montaje sin sentido físico (función equivocada, hilos del mismo color, transmisor sin alimentar…) se anota una vez por cambio para el repaso. */
  const misuse=useMemo(()=>misuseConcept(settings,reading),[settings,reading]),lastMisuse=useRef<string|null|undefined>(undefined);
  useEffect(()=>{if(!ready)return;if(lastMisuse.current===undefined){lastMisuse.current=misuse;return;}if(misuse&&misuse!==lastMisuse.current)noteWrong(misuse);lastMisuse.current=misuse;},[misuse,ready]);
  /* En pantallas estrechas las tarjetas se turnan para no tapar el banco. */
  const toggle=(key:'guide'|'meter'|'log'|'chart')=>setOpen(o=>narrow()?{guide:false,meter:false,log:false,chart:false,[key]:!o[key]}:{...o,[key]:!o[key]});
  const change=useCallback((patch:Partial<Settings>)=>setSettings(prev=>{const next={...prev,...patch};next.setpoint=Math.min(SET_MAX,Math.max(next.ambient,next.setpoint));return normalizeSettings(next);}),[]);
  const settle=useCallback(()=>setTemps(settledTemps(settingsRef.current)),[]);
  const onTerminal=(id:Terminal)=>{
    if(tool==='red'){change({red:id});if(!settings.black)setTool('black');else setTool('select');}
    else if(tool==='black'){change({black:id});setTool('select');}
    else setNotice('Elige «Punta roja» o «Punta negra» en la barra inferior y luego pulsa un borne.');
  };

  /* La edición contextual sigue al equipo seleccionado aunque se desplace o acerque la vista. */
  useEffect(()=>{
    if(!selected){setAnchor(null);return;}
    let frame=0,last='';
    const measure=()=>{
      const el=refs.current[selected],box=wrap.current;
      if(el&&box){const r=el.getBoundingClientRect(),b=box.getBoundingClientRect(),width=292;let left=r.right-b.left+12;if(left+width>b.width-12)left=r.left-b.left-width-12;left=Math.max(8,Math.min(b.width-width-8,left));const top=Math.max(76,Math.min(Math.max(76,b.height-360),r.top-b.top)),key=`${Math.round(left)}|${Math.round(top)}`;if(key!==last){last=key;setAnchor({left,top});}}
      frame=window.setTimeout(measure,150);
    };
    measure();return()=>clearTimeout(frame);
  },[selected]);

  useEffect(()=>{
    const keys=(e:KeyboardEvent)=>{
      if(e.ctrlKey||e.metaKey||e.altKey||(e.target as Element)?.closest('input,textarea,select,[contenteditable]'))return;
      const map:Record<string,()=>void>={v:()=>setTool('select'),h:()=>setTool('pan'),r:()=>setTool('red'),n:()=>setTool('black'),q:()=>change({red:null,black:null}),e:settle,f:()=>setSheet(v=>v?null:{focus:null})};
      const run=map[e.key.toLowerCase()];if(run){e.preventDefault();run();}
    };
    window.addEventListener('keydown',keys);return()=>window.removeEventListener('keydown',keys);
  },[change,settle]);

  /* Registro de una lectura estable y con sentido físico. */
  const sensor=reading.sensor;
  const why=readoutState?`Suelta ${readoutState} en el instrumento para anotar una lectura directa.`:reading.state==='off'?'Enciende el multímetro y elige una función.':!sensor?'Conecta las dos puntas al mismo sensor.':!reading.meaningful?(sensor==='tx'&&(!settings.txPowered||!settings.txConnected)?'El transmisor necesita estar alimentado y conectado a la termocupla.':'Esta lectura no depende de la temperatura: cambia la función o los bornes.')
    :!settings.inWell[sensor==='pt'?'pt':'tc']?'Introduce la sonda en el pozo.':!isStable(settings,temps,sensor)?'Espera a que el horno y la sonda se estabilicen (o usa «Esperar»).':'';
  const record=()=>{setTab('simulada');setOpen(o=>({...o,log:true}));if(sensor)setCaptureCell({sensor,target:settings.setpoint});};
  const capture=(value:number,cell:CaptureCell)=>{
    if(records.length>=500){setNotice('Exporta tus registros antes de seguir: máximo 500 mediciones.');return;}
    const sampled=instrumentSample(value,reading.unit);
    setRecords(list=>addRecord(list,{id:newId(),source:'simulada',sensor:cell.sensor,tcType:cell.sensor==='pt'?null:settings.tcType,temp:measurementTemperature(temps,cell.sensor),setpoint:settings.setpoint,bath:temps.bath,transcribed:true,ptLeadOhms:cell.sensor==='pt'?settings.ptLeadOhms??0:undefined,...cell.sensor==='tx'?{txType:settings.txType,txMin:settings.txMin,txMax:settings.txMax}:{},value:sampled.value,unit:reading.unit as TempRecord['unit'],ambient:settings.ambient,at:Date.now()}));
    setNotice(`Anotado: ${sensorName(cell.sensor,settings.tcType)} · ${formatTemp(measurementTemperature(temps,cell.sensor))} → ${formatValue(sampled.value,reading.unit as TempRecord['unit'])}`);
  };
  const addReal=()=>{
    const t=parseNumber(real.temp),v=parseNumber(real.value);
    if(t===null||t<-50||t>200){setReal(r=>({...r,error:'Escribe la temperatura medida en °C (entre −50 y 200).'}));return;}
    if(v===null){setReal(r=>({...r,error:`Escribe el valor medido en ${UNIT_OF[real.sensor]}.`}));return;}
    setRecords(list=>addRecord(list,{id:newId(),source:'real',sensor:real.sensor,tcType:real.sensor==='pt'?null:settings.tcType,temp:t,value:v,unit:UNIT_OF[real.sensor],ptLeadOhms:real.sensor==='pt'?settings.ptLeadOhms??0:undefined,...real.sensor==='tx'?{txType:settings.txType,txMin:settings.txMin,txMax:settings.txMax}:{},ambient:settings.ambient,at:Date.now()}));
    setReal(r=>({...r,temp:'',value:'',error:''}));
  };
  const download=()=>{const url=URL.createObjectURL(new Blob(['﻿'+toCsv(records)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='modo-temperatura-datos.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};

  /* Guía de la lección. */
  const step=lesson?.steps[progress.step],done=!!lesson&&lesson.steps.every((_,i)=>progress.completed.includes(i));
  const updateProgress=(next:TempProgress)=>{setProgress(next);if(!lesson||progressBlocked.current)return;try{localStorage.setItem(progressKey(lesson.id),JSON.stringify(next));}catch{setSaveNote('No se pudo guardar el avance de la guía.');}};
  const check=()=>{
    if(!step||!lesson)return;let ok=false;const ctx={settings,temps,reading,records,notes:progress.notes,viewed:progress.viewed};
    if(step.ask){
      const expected=step.ask.expected(ctx);if(expected===null){setPassed(false);setFeedback(step.ask.missing);return;}
      const given=parseNumber(answer);ok=given!==null&&Math.abs(given-expected)<=step.ask.tolerance;
      if(!ok){setPassed(false);setFeedback(given===null?'Escribe tu resultado como número (puedes usar coma decimal).':'Todavía no coincide. Revisa el cálculo con los datos de tu tabla.');if(given!==null&&step.concept)noteWrong(step.concept);return;}
    }else ok=!!step.check?.(ctx);
    setPassed(ok);setFeedback(ok?step.success:'Todavía no se cumple. Revisa las indicaciones del paso y el estado del banco.');
    if(!ok&&step.concept)noteWrong(step.concept);
    if(ok)updateProgress({...progress,completed:[...new Set([...progress.completed,progress.step])]});
  };
  const move=(index:number)=>{updateProgress({...progress,step:index});setFeedback('');setPassed(false);setAnswer('');};
  useEffect(()=>{
    if(!ready||!lesson||progressBlocked.current)return;
    const ctx={settings,records,temps,reading};
    const dataSteps=lesson.experience===2?[2,4]:lesson.experience===3?[3]:[];
    setProgress(prev=>{const invalid=dataSteps.filter(i=>!lesson.steps[i].check?.(ctx));const completed=prev.completed.filter(i=>!invalid.includes(i)&&!(invalid.length&&i>=(lesson.experience===2?6:5))&&!(lesson.experience===2&&i===5&&invalid.includes(4))&&!(lesson.experience===3&&i===4&&invalid.length));if(completed.length===prev.completed.length)return prev;const next={...prev,completed,reviewed:false};try{localStorage.setItem(progressKey(lesson.id),JSON.stringify(next));}catch{setSaveNote('No se pudo guardar la revisión de la serie.');}return next;});
  },[ready,lesson,settings,records]);

  const dock:DockItem[]=[
    {id:'select',label:'Seleccionar',shortcut:'V',icon:<MousePointer2 size={20}/>,pressed:tool==='select',onClick:()=>setTool('select')},
    {id:'pan',label:'Mover vista',shortcut:'H',icon:<Hand size={20}/>,pressed:tool==='pan',onClick:()=>{setTool('pan');setSelected(null);}},
    'separator',
    {id:'red',label:'Punta roja',shortcut:'R',icon:<ProbeIcon color="red"/>,pressed:tool==='red',onClick:()=>setTool('red')},
    {id:'black',label:'Punta negra',shortcut:'N',icon:<ProbeIcon color="black"/>,pressed:tool==='black',onClick:()=>setTool('black')},
    {id:'unplug',label:'Quitar las puntas',shortcut:'Q',icon:<Unplug size={20}/>,disabled:!settings.red&&!settings.black,onClick:()=>{change({red:null,black:null});setTool('select');}},
    'separator',
    {id:'notebook',label:'Abrir libreta G03',icon:<BookOpen size={20}/>,pressed:open.log,onClick:()=>toggle('log')},
    {id:'sheets',label:'Fichas de los equipos',shortcut:'F',icon:<EquipmentFileIcon size={20}/>,pressed:!!sheet,onClick:()=>setSheet(sheet?null:{focus:null})},
    {id:'settle',label:'Esperar a que se estabilice',shortcut:'E',icon:<FastForward size={20}/>,onClick:settle},
  ];
  const hint=tool==='red'?'Pulsa el borne donde va la punta roja.':tool==='black'?'Pulsa el borne donde va la punta negra.':tool==='pan'?'Arrastra para mover la vista; Ctrl y rueda para acercar.':'Arrastra las puntas a los bornes. Inserta o retira las sondas y ajusta la consigna en el horno.';
  const shown=records.filter(r=>r.source===tab);
  const terminalOptions=[<option key="" value="">Sin conectar</option>,...TERMINALS.filter(t=>t.id!=='pt4'||settings.ptWires===4).map(t=><option key={t.id} value={t.id}>{t.label}</option>)];

  return <section ref={wrap} className={`lab-canvas-workspace tool-temperature ${lesson?'has-guide':''}`} data-tool={tool} data-temperature-ready={ready} aria-label="Banco de temperatura">
    <PanStage panSurfaces interaction={tool==='pan'?'pan':'auto'} width={WORLD.w} height={WORLD.h} label="Banco de temperatura" fitLabel="Ajustar el banco" focus={()=>innerWidth<700?{x:30,y:60,w:700,h:560}:null} onBackground={()=>setSelected(null)}>
      <BenchScene settings={settings} temps={temps} reading={reading} tool={tool} selected={selected} onSelect={id=>setSelected(prev=>prev===id?null:id)} onTerminal={onTerminal} refs={refs} onChange={change} onRecord={record} onLog={()=>toggle('log')} recordReady={!why} onReadoutState={setReadoutState}/>
    </PanStage>

    {lesson?<div className="temp-left"><Card className="temp-guide" title="Guía de la práctica" summary={<span className="lab-count">{progress.completed.length}/{lesson.steps.length}</span>} open={open.guide} onToggle={()=>toggle('guide')}>
      <a className="temp-back" href={tempStudyUrl(lesson)} onClick={save}><ArrowLeft size={15}/>Volver a la clase</a>
      {step?<>
        <p className="temp-eyebrow">PASO {progress.step+1} DE {lesson.steps.length}</p><h2>{step.title}</h2><p>{step.text}</p>
        {step.ask?<div className="lab-field"><label htmlFor="temp-answer">{step.ask.prompt}</label><div className="lab-field-row"><input id="temp-answer" type="text" inputMode="decimal" autoComplete="off" value={answer} maxLength={24} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();check();}}}/><span className="lab-suffix">{step.ask.unit}</span></div></div>:null}
        {step.resource==='curves'&&<div className="temp-steps">{(lesson.experience===2?['tc','pt']:['tc','tx']).map(s=><button key={s} type="button" onClick={()=>{setChartSensor(s as Sensor);setOpen(o=>({...o,chart:true}));updateProgress({...progress,viewed:[...new Set([...(progress.viewed??[]),'curve:'+s])]});}}>Ver curva {s==='tc'?'termocupla':s==='pt'?'Pt100':'transmisor'}</button>)}</div>}
        {step.resource==='spreadsheet'&&<button type="button" className="lab-apply" onClick={()=>{try{exportGuideSpreadsheet(temperatureSeries(records));updateProgress({...progress,viewed:[...new Set([...(progress.viewed??[]),'spreadsheet'])]});}catch{setFeedback('No se pudo generar la planilla. Tus registros siguen conservados.');}}}>Descargar planilla con curvas</button>}
        <button type="button" className="lab-apply" onClick={check}>Comprobar mi trabajo <Check size={15}/></button>
        {feedback?<p className={`temp-feedback ${passed?'ok':''}`} role="status">{feedback}</p>:null}
        <div className="temp-steps"><button type="button" aria-label="Paso anterior" disabled={progress.step===0} onClick={()=>move(progress.step-1)}><ArrowLeft size={16}/></button><span>{progress.completed.length}/{lesson.steps.length} comprobados</span><button type="button" aria-label="Paso siguiente" disabled={progress.step===lesson.steps.length-1||!progress.completed.includes(progress.step)} onClick={()=>move(progress.step+1)}><ArrowRight size={16}/></button></div>
        {done?<a className="lab-apply temp-finish" href={tempStudyUrl(lesson,2)} onClick={save}>Práctica completada · volver a Estudio <ArrowRight size={15}/></a>:null}
        <label className="temp-notes">Mis observaciones<textarea aria-label="Mis observaciones" value={progress.notes} maxLength={20000} placeholder="Qué observaste, qué cambió y por qué…" onChange={e=>updateProgress({...progress,notes:e.target.value})}/></label>
        <a className="temp-source" href={lesson.source} target="_blank" rel="noreferrer">Guía original (G03) <ExternalLink size={13}/></a>
        <a className="temp-source" href={reviewUrl()} onClick={save}>Repasar lo que fallaste ↗</a>
        <a className="temp-source" href="/laboratorio?tool=temperature" onClick={save}>Abrir mi banco libre ↗</a>
      </>:null}
    </Card></div>:null}

    <div className="temp-right">
      <FloatingWindow title="Libreta G03" visible={open.log} onClose={()=>setOpen(prev=>({...prev,log:false}))} className="tool-temperature temperature-notebook-window" width={440} side="right" anchor="top" scaleBody={false}><div className="temp-log-card">
        <div className="temp-tabs" role="tablist" aria-label="Origen de los datos">{(['simulada','real'] as const).map(k=><button key={k} role="tab" type="button" aria-selected={tab===k} onClick={()=>setTab(k)}>{k==='simulada'?'Preparación':'En clase'}</button>)}</div>
        {tab==='real'?<form className="temp-real" onSubmit={e=>{e.preventDefault();addReal();}}>
          <small>Escribe las mediciones que tomaste con tus equipos. Se guardan aparte de las simuladas.</small>
          <label className="temp-select">Sensor<select aria-label="Sensor medido" value={real.sensor} onChange={e=>setReal(r=>({...r,sensor:e.target.value as Sensor}))}>{SENSORS.map(k=><option key={k} value={k}>{k==='tc'?`Termocupla ${settings.tcType} (mV)`:k==='pt'?'Pt100 (Ω)':'Salida del transmisor (V)'}</option>)}</select></label>
          <label className="temp-select">Temperatura (°C)<input aria-label="Temperatura medida" inputMode="decimal" value={real.temp} maxLength={12} onChange={e=>setReal(r=>({...r,temp:e.target.value,error:''}))}/></label>
          <label className="temp-select">Valor ({UNIT_OF[real.sensor]})<input aria-label="Valor medido" inputMode="decimal" value={real.value} maxLength={14} onChange={e=>setReal(r=>({...r,value:e.target.value,error:''}))}/></label>
          {real.error?<p className="lab-field-error" role="alert">{real.error}</p>:null}
          <button type="submit" className="lab-apply">Agregar medición real</button>
        </form>:<TemperatureNotebook settings={settings} temps={temps} reading={reading} records={records} cell={captureCell} onCell={setCaptureCell} onCapture={capture} why={why} experience={lesson?.experience}/>}
        {shown.length?<details className="notebook-records"><summary>Revisar mediciones y referencias</summary><div className="temp-table-wrap"><table className="temp-table"><thead><tr><th scope="col">°C</th><th scope="col">Sensor</th><th scope="col">Valor</th><th scope="col">Tabla</th><th><span className="lab-sr-only">Quitar</span></th></tr></thead><tbody>{shown.map(r=>{
          const ref=r.sensor==='tx'||!matchesTempSeries(r,settings)?null:reference({...settings,tcType:r.tcType??settings.tcType,ambient:r.ambient},r.sensor,r.temp);
          return <tr key={r.id}><td>{formatNumber(r.temp,r.temp%1?1:0)}</td><td>{r.sensor==='pt'?'Pt100':r.sensor==='tc'?`TC ${r.tcType}`:`TX ${r.txType??'?'} · ${r.txMin??'?'}–${r.txMax??'?'} °C`}{!matchesTempSeries(r,settings)&&<small>Otra configuración · conservado</small>}</td><td>{formatValue(r.value,r.unit)}</td><td>{ref===null?'—':formatValue(ref,r.unit)}</td><td><button type="button" className="lab-icon-button" aria-label={`Quitar registro de ${formatNumber(r.temp,0)} °C`} onClick={()=>setRecords(l=>l.filter(x=>x.id!==r.id))}><Trash2 size={14}/></button></td></tr>;})}</tbody></table></div></details>:<p className="temp-empty">Todavía no hay datos {tab==='simulada'?'de preparación':'de clase'}.</p>}
        <div className="temp-log-actions"><button type="button" disabled={!records.length} onClick={download}><Download size={14}/>CSV para planilla</button><button type="button" disabled={!shown.length} onClick={()=>{if(confirm(`Se borrarán los datos ${tab==='simulada'?'de preparación':'de clase'}. ¿Continuar?`))setRecords(l=>l.filter(r=>r.source!==tab));}}>Vaciar {tab==='simulada'?'preparación':'clase'}</button></div>
      </div></FloatingWindow>
      <Card className="temp-chart-card" title="Curva" open={open.chart} onToggle={()=>toggle('chart')}>
        <div className="temp-tabs" role="tablist" aria-label="Sensor de la curva">{SENSORS.map(k=><button key={k} role="tab" type="button" aria-selected={chartSensor===k} onClick={()=>setChartSensor(k)}>{k==='tc'?'Termocupla':k==='pt'?'Pt100':'Transmisor'}</button>)}</div>
        <TemperatureChart sensor={chartSensor} settings={settings} records={records}/>
        <small>{SENSOR_NAMES[chartSensor]}: {UNIT_OF[chartSensor]} contra °C.</small>
      </Card>
    </div>

    {selected&&anchor?<div className="lab-editor-anchor temp-pop-anchor" style={{left:anchor.left,top:anchor.top}}><TemperatureEditor key={selected} id={selected} settings={settings} onChange={change} onClose={()=>setSelected(null)} onSheet={id=>setSheet({focus:id})}/></div>:null}
    <div className="lab-hint temp-hint" role="status">{notice||hint}{saveNote?<span className="temp-save"> · {saveNote}</span>:null}</div>
    {sheet?<DatasheetWindow open={sheet.focus} onClose={()=>setSheet(null)}/>:null}
    <FloatingDock items={dock} label="Herramientas del banco de temperatura"/>
  </section>;
}
