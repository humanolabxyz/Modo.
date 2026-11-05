import {useCompactLayout} from '../hooks/useCompactLayout';
import {FloatingDisclosure} from '../components/FloatingDisclosure';
import '../styles/automation-workspace.css';
import '../styles/lab-polish.css';
import {LAB_COMPACT_QUERY} from './workspaceLayout';
import {LaboratoryBar} from './LaboratoryBar';
import {LabModuleNavigator} from './LabModuleNavigator';
import {LogoModo} from '../components/LogoModo';
import {LegalLink} from '../components/LegalLink';
import {TutorialHelp} from '../components/TutorialHelp';
import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {ArrowLeft,BookOpen,Check,ChevronDown,ChevronRight,CircuitBoard,Copy,Cpu,Download,Droplets,FilePlus2,FolderOpen,Layers,Pause,Play,Plus,Redo2,Undo2,X,Zap} from 'lucide-react';
import {TOOLS,TOOL_GROUPS,type Tool} from './model';
import {useLaboratory} from './useLaboratory';
import type {GeoGebraHandle} from './GeoGebraView';
import {direction,motion} from '../motion/transition';
const LOADERS={equipment:()=>import('./EquipmentView'),schematic:()=>import('./SchematicView'),plc:()=>import('./PLCView'),hmi:()=>import('./HMIView'),process:()=>import('./ProcessView'),breadboard:()=>import('./BreadboardView'),geogebra:()=>import('./GeoGebraView'),temperature:()=>import('./TemperatureView'),detectors:()=>import('./DetectorsView'),soldering:()=>import('./CableBench')};
const CableBenchView=lazy(()=>LOADERS.soldering().then(m=>({default:m.CableBench})));
const EquipmentView=lazy(()=>LOADERS.equipment().then(m=>({default:m.EquipmentView})));
const SchematicView=lazy(()=>LOADERS.schematic().then(m=>({default:m.SchematicView})));
const PLCView=lazy(()=>LOADERS.plc().then(m=>({default:m.PLCView})));
const HMIView=lazy(()=>LOADERS.hmi().then(m=>({default:m.HMIView})));
const ProcessView=lazy(()=>LOADERS.process().then(m=>({default:m.ProcessView})));
const BreadboardView=lazy(()=>LOADERS.breadboard().then(m=>({default:m.BreadboardView})));
const GeoGebraView=lazy(LOADERS.geogebra);
const TemperatureView=lazy(LOADERS.temperature);
const DetectorsView=lazy(LOADERS.detectors);
const VIEWS={equipment:EquipmentView,schematic:SchematicView,plc:PLCView,hmi:HMIView,process:ProcessView};
export default function LaboratoryApp(){
  const {compact:smallLayout}=useCompactLayout(LAB_COMPACT_QUERY);
  const lab=useLaboratory(),[tool,setTool]=useState<Tool>(()=>{const requested=new URLSearchParams(location.search).get('tool');return TOOLS.some(t=>t.id===requested)?requested as Tool:'schematic';}),[help,setHelp]=useState(false);const menu=useRef<HTMLDetailsElement>(null);
  const compact=smallLayout||tool==='geogebra';
  /* Ctrl+Z / Ctrl+Y en las superficies de trabajo; la protoboard escucha sus propios atajos. */
  useEffect(()=>{
    if(tool==='breadboard'||tool==='geogebra'||tool==='temperature'||tool==='detectors')return;
    const keys=(e:KeyboardEvent)=>{if(!(e.ctrlKey||e.metaKey)||!['z','y'].includes(e.key.toLowerCase())||(e.target as Element)?.closest('input,textarea,select,[contenteditable]'))return;e.preventDefault();if(e.key.toLowerCase()==='y'||e.shiftKey)lab.redo();else lab.undo();};
    window.addEventListener('keydown',keys);return()=>window.removeEventListener('keydown',keys);
  });
  /* Temperatura, Detectores, Soldadura y GeoGebra no usan el proyecto del PLC: al entrar en ellas la simulación del proyecto se detiene en vez de seguir corriendo (y repintando) detrás. */
  const OUTSIDE_PROJECT:readonly Tool[]=['temperature','detectors','soldering','geogebra'];
  const changeTool=(id:Tool)=>{if(lab.running&&OUTSIDE_PROJECT.includes(id))lab.stop();setTool(id);const url=new URL(location.href);url.searchParams.set('tool',id);if(id!=='geogebra'&&id!=='temperature'&&id!=='detectors'&&id!=='breadboard')url.searchParams.delete('leccion');history.replaceState(null,'',url);};
  const toolRequest=useRef(0);
  const [opening,setOpening]=useState<Tool|null>(null);
  const geoNavigation=useRef<GeoGebraHandle>(null);
  const openTool=async(id:Tool,index:number)=>{
    const request=++toolRequest.current;
    if(id===tool){setOpening(null);return;}
    setOpening(id);
    try{
      await Promise.all([LOADERS[id](),new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())))]);
      if(request!==toolRequest.current)return;
      if(tool==='geogebra'&&geoNavigation.current)await new Promise<void>(resolve=>geoNavigation.current!.save(resolve));
      if(request===toolRequest.current)motion(()=>{changeTool(id);setOpening(null);},'stage',direction(TOOLS.findIndex(x=>x.id===tool),index));
    }catch{
      if(request===toolRequest.current){setOpening(null);lab.setMessage('No se pudo abrir la herramienta. Vuelve a intentarlo.');}
    }
  };
  /* Tableros, PLC, HMI y Procesos comparten un mismo proyecto: se muestran como un grupo que se abre al estar dentro de él. */
  const inGroup=TOOL_GROUPS[0].tools.includes(tool);
  const View=tool==='breadboard'||tool==='geogebra'||tool==='temperature'||tool==='detectors'||tool==='soldering'?null:VIEWS[tool];
  return <div data-lab-ready={lab.ready} className={`lab-page ${tool==='breadboard'||tool==='temperature'||tool==='detectors'||tool==='soldering'?'lab-canvas-mode':tool==='geogebra'?'lab-math-mode':'lab-surface-mode'} ${compact?'lab-compact':''} ${tool==='geogebra'?'lab-geogebra-mode':''} ${inGroup?'lab-automation':''} ${tool==='equipment'?'lab-tableros':''}`}>{compact?<LaboratoryBar lab={lab} tool={tool} onTool={id=>openTool(id,TOOLS.findIndex(t=>t.id===id))} onHelp={()=>setHelp(h=>!h)}/>:<div className="lab-desktop-chrome"><header className="lab-topbar"><a href="/" className="lab-brand" aria-label="modo. · inicio"><LogoModo/></a><span className="lab-header-divider"/><nav className="lab-module-nav" aria-label="Herramientas del laboratorio"><LabModuleNavigator tool={tool} onTool={id=>openTool(id,TOOLS.findIndex(t=>t.id===id))}/><p>{TOOLS.find(t=>t.id===tool)?.description}</p><button className="lab-help-toggle" aria-label="Cómo se conectan" aria-expanded={help} onClick={()=>setHelp(!help)}><Layers size={17}/><strong>Cómo se conectan</strong></button></nav><div className="lab-heading"><span>LABORATORIO DE DISEÑO</span>{tool==='temperature'||tool==='detectors'||tool==='soldering'?<strong>{({temperature:'Instrumentación · Temperatura',detectors:'Instrumentación · Detectores',soldering:'Taller · Soldadura'} as const)[tool]}</strong>:<label className="lab-project-name"><span className="lab-sr-only">Nombre del proyecto</span><input disabled={lab.running||!lab.ready} aria-label="Nombre del proyecto" value={lab.project.name} maxLength={100} onChange={e=>lab.update(p=>({...p,name:e.target.value}))}/></label>}</div><div className="lab-header-links"><a href="/?view=simulator">Panel de práctica</a><a href="/estudio"><BookOpen size={15}/>Estudio</a></div><LegalLink/><TutorialHelp context="laboratory"/><a className="lab-back" href="/" aria-label="Inicio"><ArrowLeft size={16}/><span>Inicio</span></a></header>
    {tool!=='temperature'&&tool!=='detectors'&&tool!=='soldering'&&<div className="lab-projectbar"><div className="lab-project-picker"><FolderOpen size={17}/><select aria-label="Proyecto activo" disabled={!lab.ready||lab.running} value={lab.project.id} onChange={e=>lab.select(e.target.value)}>{lab.projects.map(p=><option key={p.id} value={p.id}>{p.name||'Sin nombre'}</option>)}</select></div>
      <FloatingDisclosure detailsRef={menu} className="lab-project-menu" title="Proyecto" summaryLabel="Proyecto" summary={<><Plus size={16}/>Proyecto<ChevronDown size={13}/></>}><div className="lab-project-window-list"><button disabled={lab.running||!lab.ready} onClick={()=>{lab.add('blank');if(menu.current)menu.current.open=false;}}><FilePlus2 size={16}/>Nuevo proyecto vacío</button><button disabled={lab.running||!lab.ready} onClick={()=>{lab.add('motor');if(menu.current)menu.current.open=false;}}><Zap size={16}/>Ejemplo · marcha y retención</button><button disabled={lab.running||!lab.ready} onClick={()=>{lab.add('tank');changeTool('process');if(menu.current)menu.current.open=false;}}><Droplets size={16}/>Ejemplo · llenado automático</button><button disabled={lab.running||!lab.ready} onClick={()=>{lab.add('hbridge');changeTool('breadboard');if(menu.current)menu.current.open=false;}}><Cpu size={16}/>Ejemplo · puente H con L293D</button><button disabled={lab.running||!lab.ready} onClick={()=>{lab.add('hbridge-bjt');changeTool('breadboard');if(menu.current)menu.current.open=false;}}><CircuitBoard size={16}/>Ejemplo · puente H con transistores</button><button disabled={lab.running||!lab.ready||lab.projects.length>=30} onClick={()=>{lab.duplicate();if(menu.current)menu.current.open=false;}}><Copy size={16}/>Duplicar proyecto</button><button onClick={lab.exportProject}><Download size={15}/>Exportar proyecto</button><a className="lab-menu-nav" href="/?view=simulator">Panel de práctica</a><a className="lab-menu-nav" href="/estudio"><BookOpen size={15}/>Estudio</a><label className={lab.running?'disabled':''}><FolderOpen size={15}/>Importar proyecto<input type="file" accept=".json,application/json" disabled={lab.running} onChange={e=>{const file=e.target.files?.[0];if(file)void lab.importProject(file);e.target.value='';if(menu.current)menu.current.open=false;}}/></label></div></FloatingDisclosure>
      <div className="lab-history"><button title="Deshacer" aria-label="Deshacer" disabled={!lab.canUndo||lab.running} onClick={lab.undo}><Undo2 size={17}/></button><button title="Rehacer" aria-label="Rehacer" disabled={!lab.canRedo||lab.running} onClick={lab.redo}><Redo2 size={17}/></button></div><span className="lab-save-state" role="status">{lab.saved?<Check size={13}/>:null}{!lab.ready?'Abriendo biblioteca…':lab.storageBlocked?'Guardado desactivado':lab.saved?'Guardado en este navegador':'Guardando…'}</span>
      <div className="lab-run-controls"><label><span className="lab-sr-only">Velocidad de simulación</span><select aria-label="Velocidad de simulación" value={lab.speed} onChange={e=>lab.setSpeed(Number(e.target.value))}>{[.2,.5,1,2,5].map(s=><option key={s} value={s}>×{s}</option>)}</select></label><button className={`lab-run ${lab.running?'running':''}`} disabled={!lab.ready} onClick={()=>{if(lab.running)lab.stop();else if(!lab.start())changeTool('plc');}}>{lab.running?<Pause size={16}/>:<Play size={16}/>}<span>{lab.running?'Detener':'Simular proyecto'}</span></button></div>
    </div>}
    </div>}<div className="lab-workspace">
      <div className="lab-editor"><div className="lab-editor-title"><div><span className="lab-eyebrow">TU ESPACIO DE TRABAJO</span><h1>{TOOLS.find(t=>t.id===tool)!.name}</h1></div><div className={`lab-state ${lab.running?'is-on':''}`}><i/>{tool==='geogebra'||tool==='temperature'||tool==='detectors'?'Herramienta libre':lab.running?'Simulación activa':'Modo diseño'}{lab.running?<small>{lab.runtime.seconds.toFixed(1)} s</small>:null}</div></div>
        {opening&&<div className="lab-opening" role="status"><span>Abriendo {TOOLS.find(t=>t.id===opening)?.name}…</span><progress aria-label="Cargando herramienta"/></div>}
        {lab.message?<div className="lab-notice" role="status"><span>{lab.message}</span><button aria-label="Cerrar aviso" onClick={()=>lab.setMessage('')}><X size={16}/></button></div>:null}
        {help?<section className="lab-explanation"><button aria-label="Cerrar explicación" onClick={()=>setHelp(false)}><X size={16}/></button><h2>Un proyecto, varias herramientas</h2><p>El esquema prueba la maniobra de relés. El PLC controla la bomba; la planta devuelve el nivel y la HMI permite operar las mismas señales. La protoboard utiliza un modelo DC separado y se guarda en el mismo proyecto.</p><p>Tu panel de práctica y el material de estudio conservan sus recorridos. Puedes volver a ellos desde la barra superior.</p></section>:null}
        {inGroup?<div className="automation-context" role="note"><strong>Automatización</strong><span>{lab.project.equipment?.cabinet?'Control de una bomba · Tablero y PLC comparten el montaje. HMI y Procesos son vistas complementarias.':'Un proyecto compartido · Montaje, programa, pantalla y proceso.'}</span></div>:null}
        <Suspense fallback={<div className="lab-loading" role="status">Abriendo {TOOLS.find(t=>t.id===tool)?.name}…</div>}>{View?<View key={`${lab.project.id}:${tool}`} lab={lab}/>:tool==='geogebra'?<GeoGebraView navigationRef={geoNavigation}/>:tool==='temperature'?<TemperatureView/>:tool==='detectors'?<DetectorsView/>:tool==='soldering'?<CableBenchView standalone onClose={()=>changeTool('breadboard')}/>:<BreadboardView key={`${lab.project.id}:breadboard`} lab={lab.board}/>}</Suspense>
      </div>
    </div>
  </div>;
}

