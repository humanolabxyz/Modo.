import type {CapturedMeasurement} from '../data/activityTrace';
import {Suspense,lazy,useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {useCompactLayout} from '../hooks/useCompactLayout';
import {LAB_COMPACT_QUERY} from '../lab/workspaceLayout';
import {BookOpen,Cable,NotebookPen,PencilLine,SlidersHorizontal,Zap} from 'lucide-react';
import {InstrumentOptions} from './InstrumentOptions';
import {parseMeterReadout} from '../lab/meterReadout';
import {createPortal} from 'react-dom';
import {FloatingWindow} from './FloatingWindow';
import {MeterDevice,MeterLeads,jackAnchors,type LeadFrame,type Pt} from '../lab/MeterInstrument';
import type {MeterDisplay,MeterMode} from '../lab/MeterPanel';
import {TERMINALS} from '../data/panel';
import {terminalPoint} from '../data/wiring';
import {useLayout} from '../data/layout';
import {readPanelMeter,meterHazard,type MeterHazard} from '../data/panelMeter';
import {jackLimit,panelElectrical,type MeterJack} from '../data/panelElectrical';
import type {BananaCable} from '../data/practice';
import type {SimulationController} from '../hooks/useSimulation';
import '../styles/laboratory-canvas.css';
import '../styles/manual-bench.css';
import '../styles/panel-meter.css';
import '../styles/panel-meter-lesson.css';
import '../styles/measurement-visual.css';
import {MeterToast} from './MeterToast';
import {activityDocument,type ActivityProfile} from '../data/meterActivity';
import type {PracticeDocument} from '../data/practice';
const PanelBenchOptions=lazy(()=>import('./PanelBenchOptions').then(m=>({default:m.PanelBenchOptions})));
const PanelMeterLesson=lazy(()=>import('./PanelMeterLesson').then(m=>({default:m.PanelMeterLesson})));
const PanelClampInstrument=lazy(()=>import('./PanelClampInstrument').then(m=>({default:m.PanelClampInstrument})));
const PanelCurrentTutorial=lazy(()=>import('./PanelCurrentTutorial').then(m=>({default:m.PanelCurrentTutorial})));

const PANEL_DIAL=[{id:'OFF' as const,angle:-130,label:'OFF',name:'Apagado'},{id:'V' as const,angle:-85,label:'V~',name:'Tensión alterna de mando y fuerza'},{id:'A' as const,angle:65,label:'A~',name:'Corriente alterna (en serie)'},{id:'R' as const,angle:0,label:'\u03a9',name:'Resistencia'},{id:'C' as const,angle:30,label:'\u2022))',name:'Continuidad'}];
/** Same device, drag surface, sizing and spring leads as the breadboard. Only the electrical adapter differs. */
/** Alerta sonora de entrada equivocada, como la «Input Alert» del Fluke 87V: tres pitidos cortos. */
function inputAlert(){try{const Ctx=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!Ctx)return;const ctx=new Ctx();[0,.18,.36].forEach(delay=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),t=ctx.currentTime+delay;osc.frequency.value=2000;osc.connect(gain);gain.connect(ctx.destination);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.12,t+.01);gain.gain.exponentialRampToValueAtTime(.0001,t+.12);osc.start(t);osc.stop(t+.14);});window.setTimeout(()=>{ctx.close().catch(()=>{});},900);}catch{/* sin audio disponible: el aviso visual sigue activo */}}
export function PanelMultimeter({twoContactorsOnly=false,simulation,wires,lessonOpen,onLessonOpen,onPrepareLesson,onLocateTerminals,onOpenBranch,onRestoreBranch,meterVisible,clampOpen,onClampOpen,onMeterOpen,onSwitchInstrument}:{twoContactorsOnly?:boolean;onSwitchInstrument:(kind:'meter'|'clamp')=>void;meterVisible:boolean;clampOpen:boolean;onClampOpen:(open:boolean)=>void;onMeterOpen:()=>void;simulation:SimulationController;wires:BananaCable[];lessonOpen:boolean;onLessonOpen:(open:boolean)=>void;onPrepareLesson:(profile:ActivityProfile,document:PracticeDocument)=>boolean;onLocateTerminals:(ids:string[])=>void;onOpenBranch:(id:string)=>boolean;onRestoreBranch:(wire:BananaCable)=>boolean}){
 const [activityProfile,setActivityProfile]=useState<ActivityProfile>('twoContactors');
 const prepareActivity=(profile:ActivityProfile,document:PracticeDocument)=>{if(!onPrepareLesson(profile,document))return false;setActivityProfile(profile);return true;};
 const [lessonMounted,setLessonMounted]=useState(lessonOpen);
 useEffect(()=>{if(lessonOpen)setLessonMounted(true)},[lessonOpen]);
 const layout=useLayout();const {compact}=useCompactLayout(LAB_COMPACT_QUERY);
 const anchor=useRef<SVGGElement>(null),surface=useRef<SVGSVGElement|null>(null),workspace=useRef<HTMLDivElement>(null);
 const [host,setHost]=useState<HTMLElement|null>(null),[size,setSize]=useState({w:1,h:1});
 const [mode,setMode]=useState<MeterMode|'OFF'>('OFF'),[probes,setProbes]=useState<[string|null,string|null]>([null,null]),[held,setHeld]=useState<MeterDisplay|null>(null),[frozen,setFrozen]=useState<string|null>(null),[collapsed,setCollapsed]=useState(false);
 const [log,setLog]=useState<{text:string;red:string;black:string;at:string;mode:string}[]>([]),[showLog,setShowLog]=useState(false),[snap,setSnap]=useState<Pt|null>(null);
 /* Cables del multímetro: puntas normales (V, Ω, continuidad) o cables banana, necesarios para intercalar el tester en serie (A). */
 const [leads,setLeadsState]=useState<'punta'|'banana'>(()=>{try{return localStorage.getItem('panellab.meterLeads')==='banana'?'banana':'punta'}catch{return 'punta'}});
 const setLeads=(next:(v:'punta'|'banana')=>'punta'|'banana')=>setLeadsState(v=>{const n=next(v);try{localStorage.setItem('panellab.meterLeads',n)}catch{}return n;});
 const [redJack,setRedJack]=useState<MeterJack>('vo'),[showInfo,setShowInfo]=useState(false),[showBench,setShowBench]=useState(false);
 /* Fusibles del Fluke 87V: A (11 A) y mA µA (0,44 A). Al primer error hay un aviso; al segundo se quema y se cambia con un toque. */
 const [fuse,setFuse]=useState<{a10:boolean;ma:boolean}>({a10:false,ma:false}),[fuseNotice,setFuseNotice]=useState<MeterHazard|null>(null);
 const strikes=useRef({a10:0,ma:0}),episode=useRef(false);
 const replaceFuse=(jack:'a10'|'ma')=>{strikes.current[jack]=0;episode.current=false;setFuse(f=>({...f,[jack]:false}));setFuseNotice({level:'warn',title:'Fusible nuevo puesto',text:'La entrada '+(jack==='ma'?'mA µA':'A')+' vuelve a medir. Recuerda: la corriente se mide en serie, nunca entre dos puntos con tensión.'});};
 const [clampPacket,setClampPacket]=useState<Omit<CapturedMeasurement,'stepId'>|null>(null),[clampMounted,setClampMounted]=useState(clampOpen),[clampSelection,setClampSelection]=useState<string[]>([]),[clampAttachment,setClampAttachment]=useState<{id:string;ratio:number}|null>(null);
 const selectClamp=(ids:string[])=>{setClampPacket(null);setClampSelection(ids);};
 const [currentTutorial,setCurrentTutorial]=useState<'series'|'clamp'>('series'),[currentVisible,setCurrentVisible]=useState(false),[currentMounted,setCurrentMounted]=useState(false),returnToLesson=useRef(false);
 const showClamp=()=>{setClampMounted(true);onClampOpen(true);};
 const openCurrent=(tab:'series'|'clamp')=>{if(tab==='clamp')showClamp();else onMeterOpen();if(!currentVisible)returnToLesson.current=lessonOpen;setCurrentTutorial(tab);setCurrentMounted(true);setCurrentVisible(true);onLessonOpen(false);};
 useEffect(()=>{if(clampOpen)setClampMounted(true)},[clampOpen]);
 const closeCurrent=()=>{setCurrentVisible(false);onLocateTerminals([]);if(returnToLesson.current)onLessonOpen(true);};
 useEffect(()=>{if(lessonOpen){setCurrentVisible(false);setShowBench(false);setShowInfo(false);setCollapsed(false);}},[lessonOpen]);
 useEffect(()=>{if(!meterVisible){setShowBench(false);setShowInfo(false);setShowLog(false);}},[meterVisible]);
 const drag=useRef<{which:0|1;pt:Pt;offset:Pt}|null>(null);
 const reading=useMemo(()=>mode==='A'&&leads!=='banana'?{text:'USA CABLES BANANA',note:'La corriente en serie pasa por los cables del tester: cámbialos a cables banana, como los del circuito, con el botón «Cables» junto al multímetro.',kind:'current' as const,value:undefined}:readPanelMeter(wires,{...simulation.input,enabled:simulation.enabled},simulation.result,simulation.timed,mode,...probes,simulation.meterModel,redJack,fuse),[wires,simulation,mode,probes,redJack,leads,fuse]);
 const meterState=JSON.stringify([simulation.enabled,simulation.input.plugged,simulation.input.forceBreaker,simulation.input.breakers,simulation.input.thermalTripped,simulation.input.pressed,simulation.input.powerContacts,simulation.result.relays,simulation.timed]);
 const packetNow={reading,at:new Date().toISOString(),rpm:simulation.meterModel.rotorRpm??0,loadTorqueNm:simulation.meterModel.loadTorqueNm??4,motorMode:simulation.meterModel.motorMode??'induction' as const,conditions:{simulationSeconds:simulation.simulationSeconds,lineVolts:simulation.meterModel.lineVolts,frequencyHz:simulation.meterModel.frequencyHz??50,relayAmps:simulation.calibration.thermal.amps,profile:simulation.calibration.name,connection:simulation.result.motor.connection},mode,redJack,red:probes[0],black:probes[1],wires,calibration:simulation.calibration,state:meterState};
 const packetTarget=useRef(packetNow);packetTarget.current=packetNow;const [sampledPacket,setSampledPacket]=useState(packetNow),sampledReading=sampledPacket.reading;
 // The display target and its operating conditions are sampled together.
 useEffect(()=>{const timer=setInterval(()=>setSampledPacket(previous=>{const next=packetTarget.current;return previous.reading===next.reading&&previous.state===next.state&&previous.mode===next.mode&&previous.redJack===next.redJack&&previous.red===next.red&&previous.black===next.black&&previous.wires===next.wires&&previous.calibration===next.calibration?previous:next;}),250);return()=>clearInterval(timer);},[]);
 const hazard=useMemo(()=>meterHazard({...simulation.input,enabled:simulation.enabled},simulation.result,mode,probes[0],probes[1],redJack,reading),[simulation,mode,probes,redJack,reading]);
 /* Una conexión peligrosa cuenta como error solo si se mantiene casi un segundo: arrastrar las puntas sobre otros bornes no quema nada. */
 useEffect(()=>{
  const jack=redJack==='vo'?null:redJack;
  if(!jack||mode!=='A'||leads!=='banana'||reading.text!=='SOBRECARGA'){episode.current=false;return;}
  if(episode.current)return;
  const timer=window.setTimeout(()=>{
   episode.current=true;
   const n=++strikes.current[jack],name=jack==='ma'?'mA µA':'A',amps=jack==='ma'?'0,44 A':'11 A';
   if(n>=2){setFuse(f=>({...f,[jack]:true}));setFuseNotice(null);}
   else setFuseNotice({level:'danger',title:'Cuidado: el fusible aguantó esta vez',text:'La entrada '+name+' no va entre dos puntos con tensión: es un cortocircuito. Si lo repites, su fusible de '+amps+' se quema.'});
  },800);
  return()=>window.clearTimeout(timer);
 },[mode,leads,redJack,reading.text]);
 useEffect(()=>{if(!fuseNotice)return;const timer=window.setTimeout(()=>setFuseNotice(null),9000);return()=>window.clearTimeout(timer);},[fuseNotice]);
 const alertSeen=useRef('');
 useEffect(()=>{const title=hazard?.title??'';if(/^Cable rojo en la entrada/.test(title)&&alertSeen.current!==title)inputAlert();alertSeen.current=title;},[hazard?.title]);
 const blown=redJack!=='vo'&&fuse[redJack]?redJack:null;
 const toast:MeterHazard|null=blown&&mode==='A'?{level:'danger',title:'¡Se quemó el fusible!',text:'Conectaste la entrada '+(blown==='ma'?'mA µA':'A')+' entre dos puntos con tensión por segunda vez y su fusible de '+(blown==='ma'?'0,44 A':'11 A')+' se quemó. Cámbialo con un toque para seguir midiendo.',action:{label:'Cambiar fusible',run:()=>replaceFuse(blown)}}:fuseNotice??hazard;
 const addLog=(auto:boolean)=>{
  if(!probes[0]||!probes[1]||reading.value===undefined||frozen||held||mode==='OFF'||(auto&&hazard?.level==='danger'))return;
  const shown=parseMeterReadout(displayed.current),row={text:shown?displayed.current:reading.text,red:probes[0],black:probes[1],at:new Date().toLocaleTimeString('es-CL'),mode:PANEL_DIAL.find(d=>d.id===mode)?.label??mode};
  setLog(rows=>{const last=rows[rows.length-1];return last&&last.text===row.text&&last.red===row.red&&last.black===row.black&&last.mode===row.mode?rows:[...rows,row].slice(-50)});
 };
 const autoLog=useRef(addLog);autoLog.current=addLog;
 // La lectura se anota sola cuando se asienta (≈1,5 s con las mismas puntas y función).
 useEffect(()=>{const t=window.setTimeout(()=>autoLog.current(true),1500);return()=>window.clearTimeout(t)},[reading.text,probes,mode,redJack,frozen,held]);
 const {setMeter}=simulation;
 useEffect(()=>{setMeter(meterVisible&&mode==='A'&&leads==='banana'&&redJack!=='vo'&&!fuse[redJack]&&probes[0]&&probes[1]?{red:probes[0],black:probes[1],limit:jackLimit(redJack)}:null);},[meterVisible,mode,leads,redJack,probes,fuse,setMeter]);
 useEffect(()=>()=>setMeter(null),[setMeter]);
 const display:MeterDisplay={text:sampledReading.text,note:reading.note,tone:sampledReading.value!==undefined?'ok':'idle',record:sampledReading.value!==undefined?{kind:sampledReading.kind,value:sampledReading.value}:undefined};
 const displayed=useRef('');
 const live=useRef({mode,probes,collapsed,redJack});live.current={mode,probes,collapsed,redJack};
 useLayoutEffect(()=>{
  const svg=anchor.current?.ownerSVGElement,parent=svg?.parentElement;if(!svg||!parent)return;surface.current=svg;setHost(parent);
  const measure=()=>{const r=parent.getBoundingClientRect();setSize(old=>old.w===r.width&&old.h===r.height?old:{w:r.width,h:r.height});};
  measure();const observer=new ResizeObserver(measure);observer.observe(parent);return()=>observer.disconnect();
 },[]);
 const visible=useRef(new Set<string>());
 useLayoutEffect(()=>{visible.current=new Set(Array.from(surface.current?.querySelectorAll('[data-terminal-id]')??[]).map(el=>el.getAttribute('data-terminal-id')!).filter(id=>!!id&&(!twoContactorsOnly||!id.startsWith('CONTACTOR_TRIFASICO_'))));},[host,layout,twoContactorsOnly]);
 const point=(id:string):Pt|null=>{
  const svg=surface.current,root=workspace.current,world=terminalPoint(id),matrix=svg?.getScreenCTM();
  if(!root||!matrix||!world||!visible.current.has(id))return null;
  const p=new DOMPoint(world.x,world.y).matrixTransform(matrix),r=root.getBoundingClientRect();return {x:p.x-r.left,y:p.y-r.top};
 };
 const frame=():LeadFrame|null=>{
  const root=workspace.current,face=root?.querySelector('.lab-dmm-body,.lab-dmm-pill');if(!root||!face)return null;
  const r=root.getBoundingClientRect(),f=face.getBoundingClientRect();if(!f.width)return null;
  const rect={left:f.left-r.left,top:f.top-r.top,width:f.width,height:f.height},j=jackAnchors(rect,live.current.mode,live.current.collapsed,live.current.redJack);
  const px=Math.max(28,rect.left-60),py=Math.max(150,Math.min(size.h-190,rect.top+60));
  const tips=([0,1] as const).map(i=>drag.current?.which===i?drag.current.pt:live.current.probes[i]?point(live.current.probes[i]!)??{x:px,y:py+i*85}:{x:px,y:py+i*85}) as [Pt,Pt];
  return {jacks:[j.red,j.black],tips};
 };
 const closest=(p:Pt)=>{
  let id:string|null=null,at:Pt|null=null,distance=22;
  const matrix=surface.current?.getScreenCTM(),r=workspace.current?.getBoundingClientRect();if(!matrix||!r)return {id,at};
  for(const t of TERMINALS){if(!visible.current.has(t.key))continue;const w=terminalPoint(t.key);if(!w)continue;const q0=new DOMPoint(w.x,w.y).matrixTransform(matrix),q={x:q0.x-r.left,y:q0.y-r.top},d=Math.hypot(q.x-p.x,q.y-p.y);if(d<distance){distance=d;id=t.key;at=q;}}
  return {id,at};
 };
 const connect=(which:0|1,id:string|null)=>setProbes(old=>which===0?[id,old[1]]:[old[0],id]);
 const changeMode=(next:MeterMode|'OFF')=>{setHeld(null);setMode(next);if(next==='A'){setProbes([null,null]);openCurrent('series');}};
 const phaseWire=(phase:string,principal?:string)=>{
  const candidates=wires.filter(w=>w.from.terminalId===`FUENTE:${phase}`||w.to.terminalId===`FUENTE:${phase}`);
  // A phase can feed separate star/delta branches. Resolve only on the lesson
  // shortcut, never on pointer movement or when rendering disabled buttons.
  if(principal&&candidates.length>1&&simulation.enabled&&simulation.input.plugged){
   const net=panelElectrical(wires,{...simulation.input,enabled:simulation.enabled},simulation.result.relays,simulation.timed,simulation.meterModel);
   const ranked=candidates.map(w=>({id:w.id,amps:net.wireClampAmps([w.id])})).filter((v):v is {id:string;amps:number}=>v.amps!==null).sort((a,b)=>b.amps-a.amps);
   if(ranked[0]&&ranked[0].amps>0)return ranked[0].id;
  }
  return (principal?candidates.find(w=>[w.from.terminalId,w.to.terminalId].some(id=>id.startsWith(principal+':L'))):candidates[0])?.id;
 };
 const wirePoint=(id:string):Pt|null=>{const path=Array.from(surface.current?.querySelectorAll<SVGPathElement>('.interactive-wire .wire-hit')??[]).find(path=>path.closest('[data-wire-id]')?.getAttribute('data-wire-id')===id),matrix=path?.getScreenCTM();if(!path||!matrix)return null;const point=path.getPointAtLength(path.getTotalLength()*(clampAttachment?.id===id?clampAttachment.ratio:.4)),client=new DOMPoint(point.x,point.y).matrixTransform(matrix);return {x:client.x,y:client.y};};
 const findClampWires=(point:Pt,wide:boolean)=>{
  const found:{id:string;distance:number;ratio:number}[]=[],radius=wide?32:16;
  for(const path of surface.current?.querySelectorAll<SVGPathElement>('.interactive-wire .wire-hit')??[]){
   // Reject distant conductors before the costly SVG arc-length queries.
   const bounds=path.getBoundingClientRect();
   if(point.x<bounds.left-radius||point.x>bounds.right+radius||point.y<bounds.top-radius||point.y>bounds.bottom+radius)continue;
   const matrix=path.getScreenCTM(),id=path.closest('[data-wire-id]')?.getAttribute('data-wire-id');if(!matrix||!id)continue;
   const length=path.getTotalLength();let distance=Infinity,ratio=.4;
   const test=(t:number)=>{const p=path.getPointAtLength(length*t),x=matrix.a*p.x+matrix.c*p.y+matrix.e,y=matrix.b*p.x+matrix.d*p.y+matrix.f,gap=Math.hypot(x-point.x,y-point.y);if(gap<distance){distance=gap;ratio=t;}};
   for(let i=0;i<=12;i++)test(i/12);
   const center=ratio;for(let i=-6;i<=6;i++)test(Math.max(0,Math.min(1,center+i/72)));
   if(distance<radius)found.push({id,distance,ratio});
  }
  found.sort((a,b)=>a.distance-b.distance);setClampAttachment(found.length?{id:found[0].id,ratio:found[0].ratio}:null);return (wide?found:found.slice(0,1)).map(v=>v.id);
 };
 const clampPhases=clampOpen?clampSelection.map(id=>{const wire=wires.find(w=>w.id===id),source=wire&&[wire.from.terminalId,wire.to.terminalId].find(id=>/^FUENTE:[RST]$/.test(id));return source?.slice(-1);}).filter((v):v is 'R'|'S'|'T'=>!!v):[];
 useEffect(()=>{setClampSelection(ids=>ids.every(id=>wires.some(w=>w.id===id))?ids:ids.filter(id=>wires.some(w=>w.id===id)));},[wires]);
 const sampleCurrent=():Omit<CapturedMeasurement,'stepId'>|null=>{const p=sampledPacket;if(p.state!==meterState||p.mode!==mode||p.redJack!==redJack||p.red!==probes[0]||p.black!==probes[1]||p.wires!==wires||p.calibration!==simulation.calibration)return null;const parsed=parseMeterReadout(displayed.current),ok=parsed&&typeof p.reading.value==='number'&&Math.abs(parsed.value-p.reading.value)<=parsed.step*parsed.factor/2+1e-9;if(!ok&&!(p.reading.value===null&&displayed.current==='OL'))return null;return {reading:{...p.reading,text:displayed.current,value:parsed?.value??null},at:p.at,capturedAt:new Date().toISOString(),rpm:p.rpm,loadTorqueNm:p.loadTorqueNm,motorMode:p.motorMode,conditions:p.conditions};};
 return <><g ref={anchor} className="panel-meter-anchor"/>{host&&createPortal(<div ref={workspace} className={`panel-meter-workspace panel-multimeter simulation-control${lessonOpen?' is-learning':''}${compact?' is-compact':''}`} onKeyDown={e=>e.stopPropagation()}>
  {clampMounted&&<Suspense fallback={null}><PanelClampInstrument navigation={surface.current} visible={clampOpen} wires={wires} simulation={simulation} selection={clampSelection} onSelection={selectClamp} onReading={setClampPacket} onClose={()=>onClampOpen(false)} onLearn={()=>openCurrent('clamp')} onSwitchMeter={()=>onSwitchInstrument('meter')} onSettings={()=>setShowBench(true)} wirePoint={wirePoint} findWires={findClampWires} phaseWire={phaseWire}/></Suspense>}
  {currentMounted&&<Suspense fallback={null}><PanelCurrentTutorial profile={activityProfile} visible={currentVisible} initial={currentTutorial} wires={wires} simulation={simulation} mode={mode} redJack={redJack} probes={probes} onJack={()=>{onMeterOpen();setHeld(null);setRedJack('a10');setMode('A');}} onOpenBranch={id=>{if(!onOpenBranch(id))return false;setProbes([null,null]);return true;}} onRestoreBranch={wire=>{if(!onRestoreBranch(wire))return false;setProbes([null,null]);return true;}} onExample={scope=>prepareActivity(activityProfile,activityDocument(activityProfile,scope))} onLocate={onLocateTerminals} onClose={closeCurrent} returnToLesson={returnToLesson.current} onShowClamp={showClamp} onClampPhase={phase=>{showClamp();const id=phaseWire(phase);selectClamp(id?[id]:[]);}}/></Suspense>}
  {lessonMounted&&<Suspense fallback={null}><PanelMeterLesson hazard={hazard} liveLog={log} visible={lessonOpen} context={{wires,input:{...simulation.input,enabled:simulation.enabled},result:simulation.result,timed:simulation.timed,model:simulation.meterModel,mode,probes,redJack,frozen:!!frozen||!!held}} simulation={simulation} onPrepare={prepareActivity} onOpenBench={()=>setShowBench(true)} displayText={displayed.current} canSample={!!sampleCurrent()} onSample={sampleCurrent} onModeChange={changeMode} clampPhases={clampPhases} clampSample={clampPacket} clampWireIds={clampSelection.join(',')} onClampPhase={(phase,principal)=>{showClamp();const id=phaseWire(phase,principal);selectClamp(id?[id]:[]);}} onOpenClamp={showClamp} onCurrentTutorial={()=>openCurrent('clamp')} onLocate={onLocateTerminals} onClose={()=>onLessonOpen(false)}/></Suspense>}
  {meterVisible&&<MeterLeads banana={leads==='banana'} navigation={surface.current} probeLabel="borne" connections={probes} size={size} getFrame={frame} snap={snap}
   onGrab={(which,e)=>{e.preventDefault();e.stopPropagation();const r=workspace.current!.getBoundingClientRect(),f=frame();if(!f)return;e.currentTarget.setPointerCapture(e.pointerId);const tip=f.tips[which];drag.current={which,pt:tip,offset:{x:tip.x-(e.clientX-r.left),y:tip.y-(e.clientY-r.top)}};}}
   onMove={e=>{const d=drag.current,r=workspace.current?.getBoundingClientRect();if(!d||!r)return;d.pt={x:e.clientX-r.left+d.offset.x,y:e.clientY-r.top+d.offset.y};const next=closest(d.pt).at;setSnap(old=>old?.x===next?.x&&old?.y===next?.y?old:next);}}
   onDrop={e=>{const d=drag.current;if(!d)return;if(e.type!=='pointercancel'){const r=workspace.current!.getBoundingClientRect();d.pt={x:e.clientX-r.left+d.offset.x,y:e.clientY-r.top+d.offset.y};connect(d.which,closest(d.pt).id);}drag.current=null;setSnap(null);}}
   onProbeKey={(which,key)=>{if(key==='Delete'||key==='Backspace'){connect(which,null);return;}const ids=TERMINALS.filter(t=>point(t.key)).map(t=>t.key),at=ids.indexOf(probes[which]??'');const next=(at+(key==='ArrowRight'||key==='ArrowDown'?1:ids.length-1)+ids.length)%ids.length;connect(which,ids[next]??null);}}/>}
  {meterVisible&&<MeterDevice above={<MeterToast hazard={lessonOpen&&toast===hazard?null:toast}/>} sideActions={<InstrumentOptions actions={[
    {id:'clamp',label:'Pinza amperimétrica',caption:'Pinza',icon:<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 3a6 6 0 1 0 4 0M9 13v8h6v-8M12 1v7"/></svg>,onClick:()=>onSwitchInstrument('clamp')},
    {id:'leads',label:'Cambiar cables del multímetro',tip:leads==='banana'?'Cables banana puestos (necesarios para medir corriente). Pulsa para volver a las puntas':'Puntas puestas. Pulsa para poner cables banana y medir corriente en serie',caption:'Banana',icon:<Cable size={20}/>,pressed:leads==='banana',always:true,onClick:()=>{setHeld(null);setLeads(v=>v==='banana'?'punta':'banana');}},
    ...(fuse.a10||fuse.ma?[{id:'fuse',label:'Cambiar fusible quemado',caption:'Fusible',tip:'Pone un fusible nuevo en la entrada que se quemó',icon:<Zap size={20}/>,always:true,onClick:()=>replaceFuse(fuse.a10?'a10' as const:'ma' as const)}]:[]),
    {id:'learn',label:'Aprender a medir',icon:<BookOpen size={20}/>,pressed:lessonOpen,onClick:()=>onLessonOpen(!lessonOpen)},
    {id:'record',label:'Anotar medida',icon:<PencilLine size={20}/>,disabled:reading.value===undefined||mode==='OFF'||!!held||!!frozen,onClick:()=>addLog(false)},
    {id:'log',label:`Tabla de mediciones (${log.length})`,icon:<NotebookPen size={20}/>,badge:log.length,pressed:showLog,onClick:()=>setShowLog(v=>!v)},
    {id:'settings',label:'Banco: protección y referencias',icon:<SlidersHorizontal size={20}/>,onClick:()=>setShowBench(true)}
   ]}/>} dial={PANEL_DIAL} onDisplayedReading={text=>{displayed.current=text;}} caption={mode==='R'||mode==='C'?'Ω DEL PERFIL · DIDÁCTICO':'INDUCCIÓN RMS · AC / Ω'} onInfo={()=>setShowInfo(true)} redJack={redJack} milliamps blown={fuse} onJack={jack=>{setHeld(null);setRedJack(jack);}} mode={mode} onMode={changeMode} display={held??display} held={!!held} onHold={()=>setHeld(v=>{if(v)return null;const shown=parseMeterReadout(displayed.current);return {...display,text:displayed.current,record:shown?{kind:reading.kind,value:shown.value}:display.record};})} onReadoutState={setFrozen} collapsed={collapsed} onCollapsed={setCollapsed} logCount={log.length} logOpen={showLog} onLog={()=>setShowLog(v=>!v)} hasProbes={!!probes[0]&&!!probes[1]} shortcuts={[]} onShortcut={()=>{}} onRect={()=>{}}
   onRecord={()=>addLog(false)}/>}
  {showLog?<FloatingWindow title="Libreta del multímetro del panel" onClose={()=>setShowLog(false)} width={440} anchor="top" side="right" scaleBody={false}><p>{reading.note}</p>{log.length?<ol>{log.map((row,i)=><li key={i}>{row.at} · {row.mode} · {row.red} → {row.black}: {row.text}</li>)}</ol>:<p>Aún no hay medidas anotadas.</p>}</FloatingWindow>:null}
  {showBench&&<Suspense fallback={null}><PanelBenchOptions simulation={simulation} onClose={()=>setShowBench(false)}/></Suspense>}
  {showInfo?<FloatingWindow title="Medición del panel" onClose={()=>setShowInfo(false)} width={460} anchor="top" side="right" scaleBody={false}><div className="panel-meter-info"><p role="status">{reading.note}</p><p><strong>Para medir A~:</strong> desenchufa, retira un extremo de un cable de la rama y conecta las puntas en ese corte. Negro a COM, rojo a A. Selecciona A~ y vuelve a enchufar: el tester completa el circuito. En paralelo a la carga o a la fuente provoca sobrecarga.</p><p><strong>Para medir V~:</strong> rojo a V Ω y negro a COM; coloca las puntas entre dos puntos de mando o entre dos fases. TP y el secundario de mando no son el neutro de fuerza.</p><p>El modo de inducción calcula impedancia, deslizamiento y aceleración: la corriente cambia al arrancar y al variar la carga; la red presenta caída de tensión. Los parámetros son didácticos, sin identificar el motor físico. Las resistencias de bobinas se calculan con el perfil y su referencia.</p><p>Modelo físico de inducción, con protección térmica y dinámica automáticas. Los valores del perfil se ajustan con el banco desconectado.</p><button type="button" onClick={()=>{setShowInfo(false);setShowBench(true);}}>Abrir perfil y comprobaciones del banco</button></div></FloatingWindow>:null}
 </div>,host)}</>;
}
