import {useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {useCompactLayout} from '../hooks/useCompactLayout';
import {LAB_COMPACT_QUERY} from '../lab/workspaceLayout';
import {createPortal} from 'react-dom';
import {FloatingWindow} from './FloatingWindow';
import {MeterDevice,MeterLeads,jackAnchors,type LeadFrame,type Pt} from '../lab/MeterInstrument';
import type {MeterDisplay,MeterMode} from '../lab/MeterPanel';
import {TERMINALS} from '../data/panel';
import {terminalPoint} from '../data/wiring';
import {useLayout} from '../data/layout';
import {readPanelMeter} from '../data/panelMeter';
import type {BananaCable} from '../data/practice';
import type {SimulationController} from '../hooks/useSimulation';
import '../styles/laboratory-canvas.css';
import '../styles/manual-bench.css';
import '../styles/panel-meter.css';

const PANEL_DIAL=[{id:'OFF' as const,angle:-130,label:'OFF',name:'Apagado'},{id:'V' as const,angle:-85,label:'V~',name:'Tensión alterna de mando y fuerza'},{id:'A' as const,angle:65,label:'A~',name:'Corriente alterna (en serie)'},{id:'R' as const,angle:0,label:'\u03a9',name:'Resistencia'},{id:'C' as const,angle:30,label:'\u2022))',name:'Continuidad'}];
/** Same device, drag surface, sizing and spring leads as the breadboard. Only the electrical adapter differs. */
export function PanelMultimeter({simulation,wires}:{simulation:SimulationController;wires:BananaCable[]}){
 const layout=useLayout();const {compact}=useCompactLayout(LAB_COMPACT_QUERY);
 const anchor=useRef<SVGGElement>(null),surface=useRef<SVGSVGElement|null>(null),workspace=useRef<HTMLDivElement>(null);
 const [host,setHost]=useState<HTMLElement|null>(null),[size,setSize]=useState({w:1,h:1});
 const [mode,setMode]=useState<MeterMode|'OFF'>('OFF'),[probes,setProbes]=useState<[string|null,string|null]>([null,null]),[held,setHeld]=useState<MeterDisplay|null>(null),[frozen,setFrozen]=useState<string|null>(null),[collapsed,setCollapsed]=useState(false);
 const [log,setLog]=useState<{text:string;red:string;black:string;at:string}[]>([]),[showLog,setShowLog]=useState(false),[snap,setSnap]=useState<Pt|null>(null);
 const [redJack,setRedJack]=useState<'vo'|'a10'>('vo'),[showInfo,setShowInfo]=useState(false);
 const drag=useRef<{which:0|1;pt:Pt;offset:Pt}|null>(null);
 const reading=useMemo(()=>readPanelMeter(wires,{...simulation.input,enabled:simulation.enabled},simulation.result,simulation.timed,mode,...probes,simulation.meterModel,redJack),[wires,simulation,mode,probes,redJack]);
 const {setMeter}=simulation;
 useEffect(()=>{setMeter(mode==='A'&&redJack==='a10'&&probes[0]&&probes[1]?{red:probes[0],black:probes[1]}:null);},[mode,redJack,probes,setMeter]);
 useEffect(()=>()=>setMeter(null),[setMeter]);
 const display:MeterDisplay={text:reading.text,note:reading.note,tone:reading.value!==undefined?'ok':'idle',record:reading.value!==undefined?{kind:reading.kind,value:reading.value}:undefined};
 const live=useRef({mode,probes,collapsed,redJack});live.current={mode,probes,collapsed,redJack};
 useLayoutEffect(()=>{
  const svg=anchor.current?.ownerSVGElement,parent=svg?.parentElement;if(!svg||!parent)return;surface.current=svg;setHost(parent);
  const measure=()=>{const r=parent.getBoundingClientRect();setSize(old=>old.w===r.width&&old.h===r.height?old:{w:r.width,h:r.height});};
  measure();const observer=new ResizeObserver(measure);observer.observe(parent);return()=>observer.disconnect();
 },[]);
 const visible=useRef(new Set<string>());
 useLayoutEffect(()=>{visible.current=new Set(Array.from(surface.current?.querySelectorAll('[data-terminal-id]')??[]).map(el=>el.getAttribute('data-terminal-id')!).filter(Boolean));},[host,layout]);
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
 const changeMode=(next:MeterMode|'OFF')=>{setHeld(null);setMode(next);};
 return <><g ref={anchor} className="panel-meter-anchor"/>{host&&createPortal(<div ref={workspace} className={`panel-meter-workspace panel-multimeter simulation-control${compact?' is-compact':''}`} onKeyDown={e=>e.stopPropagation()}>
  <MeterLeads navigation={surface.current} probeLabel="borne" connections={probes} size={size} getFrame={frame} snap={snap}
   onGrab={(which,e)=>{e.preventDefault();e.stopPropagation();const r=workspace.current!.getBoundingClientRect(),f=frame();if(!f)return;e.currentTarget.setPointerCapture(e.pointerId);const tip=f.tips[which];drag.current={which,pt:tip,offset:{x:tip.x-(e.clientX-r.left),y:tip.y-(e.clientY-r.top)}};}}
   onMove={e=>{const d=drag.current,r=workspace.current?.getBoundingClientRect();if(!d||!r)return;d.pt={x:e.clientX-r.left+d.offset.x,y:e.clientY-r.top+d.offset.y};setSnap(closest(d.pt).at);}}
   onDrop={e=>{const d=drag.current;if(!d)return;if(e.type!=='pointercancel'){const r=workspace.current!.getBoundingClientRect();d.pt={x:e.clientX-r.left+d.offset.x,y:e.clientY-r.top+d.offset.y};connect(d.which,closest(d.pt).id);}drag.current=null;setSnap(null);}}
   onProbeKey={(which,key)=>{if(key==='Delete'||key==='Backspace'){connect(which,null);return;}const ids=TERMINALS.filter(t=>point(t.key)).map(t=>t.key),at=ids.indexOf(probes[which]??'');const next=(at+(key==='ArrowRight'||key==='ArrowDown'?1:ids.length-1)+ids.length)%ids.length;connect(which,ids[next]??null);}}/>
  <MeterDevice dial={PANEL_DIAL} caption="MODELO DIDÁCTICO · AC / Ω" onInfo={()=>setShowInfo(true)} redJack={redJack} onJack={jack=>{setHeld(null);setRedJack(jack);}} mode={mode} onMode={changeMode} display={held??display} held={!!held} onHold={()=>setHeld(v=>v?null:display)} onReadoutState={setFrozen} collapsed={collapsed} onCollapsed={setCollapsed} logCount={log.length} logOpen={showLog} onLog={()=>setShowLog(v=>!v)} hasProbes={!!probes[0]&&!!probes[1]} shortcuts={[]} onShortcut={()=>{}} onRect={()=>{}}
   onRecord={()=>{if(probes[0]&&probes[1]&&reading.value!==undefined&&!frozen&&!held)setLog(rows=>[...rows,{text:reading.text,red:probes[0]!,black:probes[1]!,at:new Date().toLocaleTimeString('es-CL')}].slice(-50));}}/>
  {showLog?<FloatingWindow title="Libreta del multímetro del panel" onClose={()=>setShowLog(false)} width={440} anchor="top" side="right" scaleBody={false}><p>{reading.note}</p>{log.length?<ol>{log.map((row,i)=><li key={i}>{row.at} · {row.red} → {row.black}: {row.text}</li>)}</ol>:<p>Aún no hay medidas anotadas.</p>}</FloatingWindow>:null}
  {showInfo?<FloatingWindow title="Medición del panel" onClose={()=>setShowInfo(false)} width={460} anchor="top" side="right" scaleBody={false}><div className="panel-meter-info"><p role="status">{reading.note}</p><p><strong>Para medir A~:</strong> desenchufa, retira un extremo de un cable de la rama y conecta las puntas en ese corte. Negro a COM, rojo a A. Selecciona A~ y vuelve a enchufar: el tester completa el circuito. En paralelo a la carga o a la fuente provoca sobrecarga.</p><p><strong>Para medir V~:</strong> rojo a V Ω y negro a COM; coloca las puntas entre dos puntos de mando o entre dos fases. TP y el secundario de mando no son el neutro de fuerza.</p><p>Equivalentes resistivos para practicar: no representan el arranque, desfase ni consumo real de un motor de inducción. Las resistencias reales de bobinas siguen sin estar documentadas.</p>{([{key:'lineVolts',label:'Tensión entre fases (V)',min:24,max:690},{key:'coilOhms',label:'Bobina equivalente (Ω)',min:10,max:100000},{key:'pilotOhms',label:'Piloto equivalente (Ω)',min:10,max:100000},{key:'windingOhms',label:'Devanado equivalente (Ω)',min:10,max:100000}] as const).map(f=><label key={f.key}>{f.label}<input type="number" min={f.min} max={f.max} step="any" value={simulation.meterModel[f.key]} onChange={e=>{const n=e.target.valueAsNumber;if(Number.isFinite(n)&&n>=f.min&&n<=f.max){setHeld(null);simulation.setMeterModel(old=>({...old,[f.key]:n}));}}}/></label>)}</div></FloatingWindow>:null}
 </div>,host)}</>;
}
