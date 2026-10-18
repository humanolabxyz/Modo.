import {Suspense,lazy,useCallback,useEffect,useMemo,useRef,useState,type ReactElement} from 'react';
import {Cable,CheckCircle2,CircleHelp,Compass,Download,Eye,EyeOff,Focus,LayoutGrid,Minus,Plus,Route,ScanSearch,X,Zap} from 'lucide-react';
import {ToolDock,type BoardTool} from './ToolDock';
import {Board,FULL} from './Board';
import {Home} from './Home';
import {LogoModo} from './LogoModo';
const DiagramPane=lazy(()=>import('./DiagramPane').then(module=>({default:module.DiagramPane})));
const SimulatorInspector=lazy(()=>import('./SimulatorInspector').then(module=>({default:module.SimulatorInspector})));
import {StudyGuide} from './StudyGuide';
import {CadeRouteToolbar,CadeRouteDetails,CadeRouteOptions} from './CadeRoute';
import {ConnectionLesson} from './ConnectionLesson';
import {CONFIRMED_MODULE_ALIASES} from '../data/panelCorrespondence';
import {CADE_WIRES,CADE_SYMBOLS,cadePorts} from '../data/cade';
import {assessCable,completedDiagramLines,learningModel,newLearning,netForLine,nextPair,portKey,routePairs,type LearningState} from '../data/learning';
import {MODULES,TERMINALS,matchesTerminal,type PanelModule} from '../data/panel';
import {boardFrame,fitView,getLayout,loadLayout,modulePos,resetLayout} from '../data/layout';
import {BANANA_COLOR,CLASS_DIAGRAMS,IDENTIFICATION_STEPS,emptyPractice,type AssistanceLevel,type BananaCable,type StudyMode} from '../data/practice';
import {connectedByCables,createCable,networkFor,readPractice,TERMINAL_BY_ID} from '../data/wiring';
import {useSimulation} from '../hooks/useSimulation';
import {SimulationControls} from './SimulationControls';
import {PowerStatus} from './PowerStatus';
import {ProcedureTools} from './ProcedureTools';
import {useActionRecorder} from '../hooks/useActionRecorder';
import {practiceChange,type SessionFrame} from '../data/session';
import {SIMULATION_EXAMPLES} from '../data/simulation';
import {usePractice} from '../hooks/usePractice';
import {useCompactLayout} from '../hooks/useCompactLayout';
import {DiagramWindow} from './DiagramWindow';
import {freeRegion,viewForModule} from '../layout/focusView';
import {CompactBar} from './CompactBar';
import {CablesMenu} from './CablesMenu';
import {SearchBox,type TerminalMatch} from './SearchBox';
import {motion} from '../motion/transition';
const GROUPS=[['todos','Todos'],['alimentacion','Alimentación'],['botoneras','Botoneras'],['contactores','Contactores'],['temporizadores','Temporizador'],['motor','Motor']];
const modes:Record<StudyMode,string>={explore:'Explorar',free:'Cableado libre',identify:'Reconocimiento guiado',guided:'Guía de mi diagrama'};
const MODE_ICONS={explore:Compass,free:Cable,identify:ScanSearch,guided:Route} as const;
const MODE_SHORT:Record<StudyMode,string>={explore:'Explorar',free:'Libre',identify:'Reconocer',guided:'Guía'};
type View={x:number;y:number;w:number;h:number};
function App(){
 const recorder=useActionRecorder();
 const practice=usePractice((before,after,action)=>{const change=practiceChange(before,after);recorder.capture({practice:after},(action==='undo'?'Deshacer · ':action==='redo'?'Rehacer · ':'')+change.label,change.targets);}),doc=practice.document;
 const [loto,setLoto]=useState(0),[procedureTargets,setProcedureTargets]=useState<string[]>([]);
 const renderCount=useRef(0);renderCount.current++;
 useEffect(()=>{if(import.meta.env.DEV)document.documentElement.dataset.appRenders=String(renderCount.current)});
 const {compact,portrait}=useCompactLayout(),[maximized,setMaximized]=useState(false),practiceMenu=useRef<HTMLDetailsElement>(null);
 const [selected,setSelected]=useState<string|null>('BOTONERAS:S1:1'),[filter,setFilter]=useState('todos'),[query,setQuery]=useState('');
 const [view,setView]=useState<View>(()=>fitView()),[aliases,setAliases]=useState<Record<string,string>>({...CONFIRMED_MODULE_ALIASES}),[storageReady,setStorageReady]=useState(false);
 const [isIntro,setIsIntro]=useState(true),[showDiagram,setShowDiagram]=useState(false),[mobileView,setMobileView]=useState<'panel'|'diagram'>('panel');
 const [diagramMounted,setDiagramMounted]=useState(false);
 useEffect(()=>{if(showDiagram)setDiagramMounted(true)},[showDiagram]);
 const [readingOnly,setReadingOnly]=useState(false);
 const [routeSymbol,setRouteSymbol]=useState<number|null>(null),[allRoutes,setAllRoutes]=useState(false);
 const [material,setMaterial]=useState<'cade'|'learn'|'image'>('cade');
 const [showInspector,setShowInspector]=useState(false);
 const [tool,setTool]=useState<BoardTool>('inspect'),[pending,setPending]=useState<string|null>(null),[selectedWire,setSelectedWire]=useState<string|null>(null);
 const [wireColor,setWireColor]=useState(BANANA_COLOR),[showWires,setShowWires]=useState(true);
 const [notice,setNotice]=useState(''),[assistance,setAssistance]=useState<AssistanceLevel>(1),[feedback,setFeedback]=useState('');
 const [modal,setModal]=useState<'photo'|'help'|null>(null);
 const [lessonMessage,setLessonMessage]=useState(''),[errorWires,setErrorWires]=useState<string[]>([]);
 const learning=doc.mode==='free'?doc.learning:undefined,exam=learning?.mode==='exam';
 const simulation=useSimulation(doc.wires,!isIntro&&!exam,(input,label)=>recorder.capture({simulation:input},label));
 const procedureFrame:SessionFrame={practice:doc,simulation:simulation.input,loto};
 const learningActive=!!learning&&material==='cade';
 const model=useMemo(()=>learningModel(learning?.bindings),[learning?.bindings]);
 const line=learning?CADE_WIRES[learning.index]?.id:null,net=line!=null?netForLine(line,model):undefined;
 const symbol=CADE_SYMBOLS.find(o=>o.id===routeSymbol);
 const symbolKeys=symbol?cadePorts(symbol).map(portKey):[];
 const selectionNets=allRoutes?model:symbol?model.filter(n=>n.ports.some(p=>symbolKeys.includes(portKey(p)))):net?[net]:[];
 const routes=routePairs(selectionNets,doc.wires);
 const routeTitle=allRoutes?'Todo PERFECTO':symbol?`Componente ${symbol.reference}`:line!=null?`Línea ${line}`:'PERFECTO · CADe';
 const pair=net?nextPair(net,doc.wires):undefined;
 const manualGhost=!learning&&doc.mode==='guided'&&assistance===3?doc.steps[doc.stepIndex]:undefined;
 const ghost=!exam&&learningActive&&learning?.assistance===3?pair:manualGhost&&!connectedByCables(manualGhost.from,manualGhost.to,doc.wires)?{from:manualGhost.from,to:manualGhost.to}:undefined;
 const ghosts=!exam&&learningActive&&learning?.mode==='free'&&learning.assistance===3?routes.filter(r=>!r.installed):ghost?[ghost]:[];
 const routeWireIds=!exam&&learningActive&&learning?.mode==='free'?doc.wires.filter(w=>selectionNets.some(n=>n.terminals.includes(w.from.terminalId)&&n.terminals.includes(w.to.terminalId))).map(w=>w.id):[];
 const completedLines=useMemo(()=>learning&&!exam?completedDiagramLines(doc.wires,model,learning.bindings):[],[doc.wires,model,learning?.bindings,!!learning,exam]);
 const terminalLines=useMemo(()=>!exam?model.filter(n=>n.terminals.includes(selected||'')).flatMap(n=>n.lineIds):[],[selected,model,exam]);
 const changeLearning=(patch:Partial<LearningState>)=>{if(patch.index!=null||patch.mode&&patch.mode!=='free'){setRouteSymbol(null);setAllRoutes(false)}practice.commit(p=>({...p,mode:'free',learning:{...(p.learning||newLearning()),...patch}}));setLessonMessage('');setErrorWires([]);if(patch.mode){setShowInspector(false);setPending(null)}};
 const selectLine=(id:number)=>{const index=CADE_WIRES.findIndex(w=>w.id===id);if(index>=0){setRouteSymbol(null);setAllRoutes(false);setFilter('todos');setQuery('');changeLearning({index,...(!learning||learning.mode==='free'?{assistance:3 as const}:{})});if(!learning||learning.mode==='free')fitBoard()}};
 const selectSymbol=(id:number)=>{setRouteSymbol(id);setAllRoutes(false);setFilter('todos');setQuery('');if(!learning||learning.mode==='free'){changeLearning({assistance:3});fitBoard()}};
 const learn=()=>{practice.commit(p=>({...p,mode:'free',learning:{...(p.learning||{...newLearning(),index:CADE_WIRES.findIndex(w=>w.id===77)}),mode:'guided'}}));setTool('connect');setReadingOnly(false);setShowDiagram(true);setShowInspector(false)};
 const showRoute=()=>{setMaximized(false);setShowWires(true);setReadingOnly(false);setMobileView('panel');setFilter('todos');setQuery('');fitBoard();if(!routes.some(r=>!r.installed)){const details=document.getElementById('cade-route-details') as HTMLDetailsElement|null;if(details){details.open=true;details.scrollIntoView({block:'start'})}setLessonMessage(net?.missing.length?'Esta línea tiene bornes sin correspondencia confirmada. Revisa las correspondencias antes de mostrar el cable.':'No quedan conexiones comprobables pendientes en esta red.');return;}changeLearning({assistance:3});setTool('connect');setShowInspector(false);setReadingOnly(false)};
 const checkLesson=()=>{const results=doc.wires.map(w=>assessCable(w,doc.wires,model,learning?.bindings||{}));setErrorWires(doc.wires.filter((w,i)=>results[i]==='incorrect'||results[i]==='short').map(w=>w.id));setLessonMessage(`${results.filter(v=>v==='correct').length} correctas · ${results.filter(v=>v==='incorrect').length} no corresponden · ${results.filter(v=>v==='unknown').length} sin información · ${results.filter(v=>v==='short').length} posibles cortocircuitos.`)};
 useEffect(()=>{if(!errorWires.length)return;const timer=setTimeout(()=>setErrorWires([]),3500);return()=>clearTimeout(timer)},[errorWires]);
 const record=TERMINAL_BY_ID.get(selected||''),currentModule=record?.module||MODULES[1];
 const activeWire=doc.wires.find(w=>w.id===selectedWire);
 const identification=doc.mode==='identify'?IDENTIFICATION_STEPS[doc.stepIndex]:undefined;
 const manual=doc.mode==='guided'?doc.steps[doc.stepIndex]:undefined;
 const guided=doc.mode==='identify'||doc.mode==='guided';
 const targetIds=identification?[identification.terminalId]:manual?[manual.from,manual.to]:[];
 const lessonTargets=learning?.mode==='free'?selectionNets.flatMap(n=>n.terminals):pair?[pair.from,pair.to]:net?.terminals||[];
 const highlightedModules=learningActive&&learning?(!exam&&learning.assistance>=2?[...new Set(lessonTargets.map(id=>TERMINAL_BY_ID.get(id)!.module.id))]:[]):assistance>=2&&guided?[...new Set(targetIds.map(id=>TERMINAL_BY_ID.get(id)!.module.id))]:[];
 const highlightedTerminals=learningActive&&learning?(!exam&&learning.assistance===3?lessonTargets:[]):[...(assistance>=3&&guided?targetIds:[]),...networkFor(activeWire?.from.terminalId||selected,doc.wires)];
 useEffect(()=>{try{
  const raw=localStorage.getItem('panellab-fase1-v1');if(raw){const v=JSON.parse(raw);if(TERMINAL_BY_ID.has(v.selected))setSelected(v.selected);if(v.aliases&&typeof v.aliases==='object')setAliases({...CONFIRMED_MODULE_ALIASES,...Object.fromEntries(Object.entries(v.aliases).filter(([id,a])=>MODULES.some(m=>m.id===id)&&typeof a==='string').map(([id,a])=>[id,String(a).toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,14)]))})}
  if(new URLSearchParams(location.search).get('view')==='simulator'){setIsIntro(false);setTool('inspect');}
 }catch{}finally{loadLayout();setView(fitView(getLayout()));setStorageReady(true)}},[]);
 useEffect(()=>{document.body.classList.toggle('canvas-active',!isIntro);return ()=>document.body.classList.remove('canvas-active')},[isIntro]);
 useEffect(()=>{if(storageReady)document.documentElement.classList.remove('modo-boot-simulator')},[storageReady]);
 useEffect(()=>{if(storageReady)try{localStorage.setItem('panellab-fase1-v1',JSON.stringify({selected,aliases}))}catch{}},[storageReady,selected,aliases]);
 useEffect(()=>{setFeedback('');setPending(null)},[doc.mode,doc.stepIndex]);
 useEffect(()=>{if(compact&&readingOnly){setReadingOnly(false);setMaximized(true)}},[compact,readingOnly]);
 useEffect(()=>{if(doc.mode==='guided')setFeedback('')},[doc.wires,doc.steps,doc.diagram]);
 useEffect(()=>{if(selectedWire&&!doc.wires.some(w=>w.id===selectedWire))setSelectedWire(null)},[doc.wires,selectedWire]);
 useEffect(()=>{
  if(!modal)return;const previous=document.activeElement as HTMLElement|null;const dialog=document.querySelector<HTMLElement>('[role="dialog"]');dialog?.querySelector<HTMLButtonElement>('button')?.focus();
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setModal(null);if(e.key==='Tab'&&dialog){const controls=Array.from(dialog.querySelectorAll<HTMLElement>('button,[href],input,[tabindex="0"]')),first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}};
  document.addEventListener('keydown',key);return ()=>{document.removeEventListener('keydown',key);previous?.focus()};
 },[modal]);
 const deleteWire=useCallback((id:string)=>{practice.commit(p=>({...p,wires:p.wires.filter(w=>w.id!==id)}));setSelectedWire(null);setShowInspector(false);setNotice('Cable retirado. Puedes recuperarlo con Deshacer.')},[practice.commit]);
 const removeWire=()=>{if(selectedWire)deleteWire(selectedWire)};
 const changeTool=(next:BoardTool)=>{setTool(next);setPending(null);setNotice('');if(next!=='inspect'){setSelectedWire(null);setShowInspector(false)}};
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{if(isIntro||modal||(e.target as HTMLElement).closest('input,textarea,select,.simulation-control,.procedure-drawer,[contenteditable]'))return;if(e.key==='Escape'){setPending(null);setNotice('Conexión cancelada.')}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?practice.redo():practice.undo();setPending(null);setNotice(e.shiftKey?'Última acción rehecha.':'Última acción deshecha.')}if((e.key==='Delete'||e.key==='Backspace')&&selectedWire){e.preventDefault();removeWire()}if(!e.ctrlKey&&!e.metaKey&&!e.altKey){const next=({v:'inspect',h:'pan',c:'connect',e:'erase'} as const)[e.key.toLowerCase() as 'v'|'h'|'c'|'e'];if(next&&(next!=='connect'||doc.mode!=='identify')){e.preventDefault();changeTool(next)}}};
  document.addEventListener('keydown',key);return ()=>document.removeEventListener('keydown',key);
 });
 const matches=useMemo(()=>query.trim()?TERMINALS.filter(t=>matchesTerminal(t.module,t.terminal,query,aliases[t.module.id])):[],[query,aliases]);
 const lastFit=useRef<View|null>(null);
 /* En móvil el encuadre se calcula sobre la parte del banco que la ventana del diagrama no tapa. */
 const placeView=(box:{x:number;y:number;w:number;h:number},legacy:View,remember=false)=>{
  const run=()=>{const stage=document.querySelector('.stage-wrap')?.getBoundingClientRect();
   if(compact&&stage){const v=viewForModule(box,FULL,stage,freeRegion(stage,document.querySelector('.diagram-window:not([hidden])')?.getBoundingClientRect()||null));if(remember)lastFit.current=v;setView(v);return}
   if(remember)lastFit.current=legacy;setView(legacy)};
  if(compact&&maximized)requestAnimationFrame(()=>requestAnimationFrame(run));else run()};
 const focus=(m:PanelModule)=>{const p=modulePos(m),w=Math.max(m.w+110,440);placeView({...p,w:m.w,h:m.h},{x:p.x+m.w/2-w/2,y:p.y+m.h/2-w*FULL.h/FULL.w/2,w,h:w*FULL.h/FULL.w});setFilter('todos')};
 const fitBoard=()=>{const layout=getLayout(),f=boardFrame(layout),fit=fitView(layout);placeView({x:f.x,y:f.y,w:f.w,h:f.h},fit,true)};
 const tidyBoard=()=>{resetLayout();fitBoard();setNotice('Módulos acomodados en su disposición base. Puedes volver a moverlos desde el asa de cada módulo.')};
 /* Si el banco estaba encuadrado y la ventana aparece, se oculta o cambia la orientación, se vuelve a encuadrar en lo visible. */
 const viewRef=useRef(view);viewRef.current=view;
 useEffect(()=>{
  if(!compact)return;
  const same=(a:View,b:View)=>Math.abs(a.x-b.x)<2&&Math.abs(a.y-b.y)<2&&Math.abs(a.w-b.w)<2;
  let id2=0;const id1=requestAnimationFrame(()=>{id2=requestAnimationFrame(()=>{const cur=viewRef.current;if(same(cur,lastFit.current??fitView(getLayout()))||same(cur,FULL))fitBoard()})});
  return ()=>{cancelAnimationFrame(id1);cancelAnimationFrame(id2)};
 },[compact,showDiagram,portrait,maximized]);
 const locate=(id:string)=>{const t=TERMINAL_BY_ID.get(id);if(!t)return;setSelected(id);setShowInspector(true);focus(t.module);setReadingOnly(false);setMobileView('panel');setMaximized(false)};
 const pick=useCallback((id:string)=>{
  if(tool==='pan')return;
  if(tool==='erase'){setNotice('Pulsa la curva o el conector del cable que quieres retirar.');return;}
  setSelected(id);setSelectedWire(null);setFilter('todos');setShowInspector(tool==='inspect'&&doc.mode!=='identify');
  if(tool!=='connect'||doc.mode==='identify')return;
  if(!pending){setPending(id);setNotice('');return;}
  if(pending===id){setPending(null);setNotice('Conexión cancelada: elige dos bornes distintos.');return;}
  const from=pending,cable=createCable(from,id,doc.wires,wireColor);
  if(learningActive&&learning?.mode==='guided'){const verdict=assessCable(cable,[...doc.wires,cable],model,learning.bindings);setLessonMessage(verdict==='correct'?'Conexión reconocida en la red del esquema. Revisa el tramo y continúa.':verdict==='short'?'Posible cortocircuito: esta red une alimentaciones distintas. Revisa el cable.':verdict==='incorrect'?'Revisa la conexión: une redes diferentes del ejercicio. El cable permanece para que puedas corregirlo.':'No hay información suficiente para comprobar esta conexión.');if(verdict==='incorrect'||verdict==='short')setErrorWires([cable.id]);}
  practice.commit(p=>({...p,wires:[...p.wires,cable]}));setPending(null);setShowWires(true);setNotice('');
 },[tool,pending,doc.mode,doc.wires,learning,learningActive,model,practice.commit,wireColor]);
 const updateWire=(wire:BananaCable)=>practice.commit(p=>({...p,wires:p.wires.map(w=>w.id===wire.id?wire:w)}));
 const layerWire=(front:boolean)=>{if(!activeWire)return;const layers=doc.wires.map(w=>w.layer);updateWire({...activeWire,layer:front?Math.max(...layers)+1:Math.min(...layers)-1})};
 const start=(mode:StudyMode,diagramId:string)=>{
  practice.replace({...emptyPractice(),mode,diagram:CLASS_DIAGRAMS.find(d=>d.id===diagramId)||null,title:mode==='identify'?'Recorrido de reconocimiento':'Mi práctica INACAP'});
  setIsIntro(false);setTool('inspect');setSelectedWire(null);setPending(null);setAssistance(1);setShowDiagram(mode==='guided');setReadingOnly(false);setShowInspector(false);setMobileView('panel');fitBoard();setNotice('');
 };
 const continuePractice=()=>{setIsIntro(false);setTool('inspect');setShowDiagram(doc.mode==='guided');setReadingOnly(false);setShowInspector(false);setPending(null);setNotice('');};
 const importPractice=async(file:File)=>{try{if(file.size>8*1024*1024)throw new Error('La práctica supera 8 MB.');const imported=readPractice(JSON.parse(await file.text()));motion(()=>{practice.replace(imported);setTool(imported.mode==='identify'||imported.mode==='explore'?'inspect':'connect');setIsIntro(false);setPending(null);setSelectedWire(null);setShowDiagram(true);fitBoard();setMobileView('panel');setNotice('Práctica importada.')},'page','forward');}catch(e){setNotice(e instanceof Error?e.message:'Archivo no válido.')}};
 const loadSimulationExample=(id:keyof typeof SIMULATION_EXAMPLES)=>{const example=SIMULATION_EXAMPLES[id],wires:BananaCable[]=[];example.pairs.forEach(([from,to])=>wires.push(createCable(from,to,wires,wireColor)));practice.commit(p=>({...p,title:`Ejemplo virtual · ${example.title}`,mode:'free',wires,learning:undefined}));simulation.enable(true);setTool('inspect');setPending(null);setSelectedWire(null);setShowInspector(false);setFilter('todos');setQuery('');setShowWires(true);fitBoard();setNotice(`Ejemplo virtual cargado. Enchufa la corriente virtual y cierra ambos interruptores CONTROL y prueba los pulsadores.${id.startsWith('motor')?' Para el motor cierra también FUERZA.':''} Deshacer recupera el cableado anterior.`);};
 const exportPractice=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(doc,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='modo-practica.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('Copia de la práctica exportada.');};
 const zoom=(factor:number)=>setView(v=>{const w=Math.max(240,Math.min(3200,v.w*factor)),h=w*FULL.h/FULL.w;return {x:v.x+(v.w-w)/2,y:v.y+(v.h-h)/2,w,h}});
 const advance=()=>{const length=doc.mode==='identify'?IDENTIFICATION_STEPS.length:doc.steps.length;practice.commit(p=>({...p,stepIndex:p.stepIndex>=length?0:p.stepIndex+1}));setAssistance(1);setFeedback('')};
 const selectWire=useCallback((id:string|null)=>{if(tool==='erase'&&id){deleteWire(id);return;}if(tool==='pan')return;setSelectedWire(id);setShowInspector(true);setPending(null);setTool('inspect')},[tool,deleteWire]);
 const wrapDiagram=(pane:ReactElement)=><DiagramWindow open={showDiagram} compact={compact} portrait={portrait} maximized={maximized}>{pane}</DiagramWindow>;
 const closeMenu=()=>practiceMenu.current?.removeAttribute('open');
 const changeMode=(mode:StudyMode)=>motion(()=>{practice.commit(p=>({...p,mode,stepIndex:0}));setTool(mode==='identify'||mode==='explore'?'inspect':'connect');setAssistance(1);setPending(null);setShowInspector(false);setShowDiagram(mode==='guided');setReadingOnly(false);setMobileView('panel');closeMenu()});
 const pickMatch=(t:TerminalMatch)=>{pick(t.key);focus(t.module);setQuery('');closeMenu()};
 const focusModule=(id:string)=>{const m=MODULES.find(m=>m.id===id);if(m){setSelected(`${m.id}:${m.terminals[0].id}`);setSelectedWire(null);focus(m)}};
 const moduleSelect=<select aria-label="Enfocar un módulo" value="" onChange={e=>{focusModule(e.target.value);closeMenu()}}><option value="" disabled>Ver módulo de cerca…</option>{MODULES.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select>;
 const simControls=!exam?<SimulationControls simulation={simulation} onExample={loadSimulationExample} hasWires={!!doc.wires.length} compact={compact}/>:null;
 return <div data-max={maximized} className={`app-shell ${!isIntro?'editor-workbench':'modo-home-shell'} ${readingOnly?'editor-reading':''} ${guided?'editor-guided':''} ${compact?`is-compact ${portrait?'is-portrait':'is-landscape'}`:''} ${compact&&showDiagram?'diagram-open':''}`}>
  <header className="topbar"><a href="/" className="brand-wrap" aria-label="modo. · inicio"><LogoModo/></a><div className="top-spacer"/><button className="home-link" aria-label={isIntro?'Simulador':'Inicio'} onClick={()=>motion(()=>{setIsIntro(!isIntro);setPending(null)},'page',isIntro?'forward':'back')}>{isIntro?'Simulador':'Inicio'}</button><button className="icon-button help-btn" aria-label="Cómo usar el panel" onClick={()=>setModal('help')}><CircleHelp size={20}/></button></header>
  <main>{!isIntro&&<ProcedureTools recorder={recorder} frame={procedureFrame} onLoto={n=>{setLoto(n);recorder.capture({loto:n},n?'LOTO · etapa '+n+' revisada':'Reiniciar ejercicio LOTO');}} onRestore={value=>{simulation.enable(false);practice.replace(structuredClone(value));setPending(null);setSelectedWire(null);setNotice('Montaje recuperado. Simulación detenida; Deshacer recupera la práctica anterior.');}} onTargets={setProcedureTargets}/>}{!isIntro&&compact&&<CompactBar showDiagram={showDiagram} sheetFull={maximized} onHome={()=>motion(()=>{setIsIntro(true);setPending(null)},'page','back')} onBank={()=>motion(()=>setMaximized(false))} onToggleDiagram={()=>motion(()=>{setShowDiagram(!showDiagram);setReadingOnly(false);setMobileView('panel')})} simulation={simControls} cables={<CablesMenu wires={doc.wires} selectedWire={selectedWire} onSelect={selectWire}/>}/>}{practice.saveError&&<div className="status-banner error" role="alert">{practice.saveError}</div>}{notice&&<div className="status-banner" role="status">{notice}<button aria-label="Cerrar aviso" onClick={()=>setNotice('')}><X size={15}/></button></div>}
   {isIntro?<Home practice={doc} onStart={(mode,diagram)=>motion(()=>start(mode,diagram),'page','forward')} onContinue={()=>motion(continuePractice,'page','forward')} onImport={importPractice} ready={practice.ready}/>:<>
    <div className="content-header compact-heading"><div><h1>{readingOnly?'Lectura de diagramas':modes[doc.mode]}</h1><p>{readingOnly?'Sigue las líneas, reconoce los símbolos y relaciona sus bornes.':doc.mode==='identify'?'Encuentra el borne indicado en el banco.':doc.mode==='guided'?'Sigue un paso y comprueba tu conexión.':doc.mode==='explore'?'Selecciona un borne para conocer su módulo.':'Elige una herramienta y trabaja sobre el banco.'}</p></div><details ref={practiceMenu} className="practice-menu disclosure"><summary aria-label="Opciones de práctica">Opciones de práctica</summary><div className="practice-settings menu-compact">{compact&&<SearchBox query={query} onQuery={setQuery} matches={matches} onPick={pickMatch}/>}<div className="menu-tiles" role="group" aria-label="Acciones rápidas">{compact&&<label className="menu-tile menu-select" title="Ver un módulo de cerca"><Focus size={22}/><span>Módulo</span>{moduleSelect}</label>}<button className="menu-tile" aria-label={showWires?'Ocultar cables':'Mostrar cables'} title={showWires?'Ocultar cables':'Mostrar cables'} aria-pressed={!showWires} onClick={()=>setShowWires(!showWires)}>{showWires?<Eye size={22}/>:<EyeOff size={22}/>}<span>Cables</span></button><button className="menu-tile" aria-label="Cómo usar el lienzo" title="Cómo usar el lienzo" onClick={()=>{setModal('help');closeMenu()}}><CircleHelp size={22}/><span>Ayuda</span></button><button className="menu-tile" aria-label="Exportar práctica" title="Exportar práctica" onClick={exportPractice}><Download size={22}/><span>Exportar</span></button></div><small className="menu-caption">Modo de práctica</small><div className="menu-modes" role="radiogroup" aria-label="Modo de la práctica">{(Object.entries(modes) as [StudyMode,string][]).map(([id,name])=>{const Icon=MODE_ICONS[id];return <button key={id} role="radio" aria-checked={doc.mode===id} aria-label={name} title={name} className="menu-tile" onClick={()=>changeMode(id)}><Icon size={22}/><span>{MODE_SHORT[id]}</span></button>})}</div>{doc.archive&&<p>Respaldo del temporizador retirado: {doc.archive.wires.length} cables y {doc.archive.steps.length} pasos. La exportación los conserva.</p>}<details className="disclosure module-filters"><summary>Filtrar módulos</summary><div className="filters-scroll" role="tablist" aria-label="Filtrar módulos">{GROUPS.map(([id,label])=><button key={id} role="tab" aria-selected={filter===id} className={`filter-pill ${filter===id?'current':''}`} onClick={()=>setFilter(id)}>{label}</button>)}</div></details></div></details></div>
    {guided&&!learning&&!readingOnly&&<StudyGuide practice={doc} selected={selected} assistance={assistance} onAssistance={setAssistance} onAdvance={advance} feedback={feedback} onFeedback={setFeedback} onLocate={()=>{if(targetIds[0])locate(targetIds[0])}}/>}
    <div className="work-card">
     {!compact&&<div className="work-toolbar workspace-navigation"><div className="workspace-views" role="group" aria-label="Vista de trabajo"><button aria-pressed={!readingOnly} onClick={()=>motion(()=>{setReadingOnly(false);setMobileView('panel')})}>Banco</button><button className="open-diagram" aria-pressed={showDiagram} onClick={()=>motion(()=>{setShowDiagram(!showDiagram);setReadingOnly(false);setMobileView('panel')})}>{showDiagram?'Cerrar diagrama':'Abrir diagrama'}</button></div></div>}{!compact&&<div className="work-tools"><CablesMenu wires={doc.wires} selectedWire={selectedWire} onSelect={selectWire}/></div>}
     {!readingOnly&&<div className="filterbar"><div className="connection-message" role="status">{tool==='connect'&&doc.mode!=='identify'?(pending?`Ahora elige el destino · ${TERMINAL_BY_ID.get(pending)?.terminal.id}`:'Elige un borne de origen y otro de destino'):tool==='erase'?'Pulsa un cable para retirarlo · Deshacer lo recupera':tool==='pan'?'Arrastra el banco para mover la vista':!exam&&learning&&selected?terminalLines.length?`${selected} · esquema: líneas ${terminalLines.join(', ')}`:`${selected} · sin correspondencia confirmada en PERFECTO`:compact?'':'Selecciona un borne o un cable · C para conectar · E para retirar'}{pending&&<button className="text-action" onClick={()=>{setPending(null);setNotice('')}}>Cancelar</button>}</div>{!compact&&<SearchBox query={query} onQuery={setQuery} matches={matches} onPick={pickMatch}/>}</div>}
     <div className="mobile-work-tabs"><button aria-pressed={mobileView==='panel'} onClick={()=>setMobileView('panel')}>Panel y conexiones</button><button aria-pressed={mobileView==='diagram'} onClick={()=>{setMobileView('diagram');setShowDiagram(true)}}>Diagrama y pasos</button></div>
     <div className={`workspace practice-workspace ${showDiagram?'has-diagram':''} ${showInspector?'has-inspector':''} ${readingOnly?'reading-only':''} mobile-${mobileView}`}>
      {(showDiagram||diagramMounted)&&wrapDiagram(<Suspense fallback={<aside className="diagram-pane" aria-label="Diagrama y material de estudio"><p role="status">Abriendo diagrama…</p></aside>}><DiagramPane learningMode={learning?.mode} routeOptions={!exam?<CadeRouteOptions all={allRoutes} onAll={()=>{setRouteSymbol(null);setAllRoutes(!allRoutes);changeLearning({mode:'free',assistance:3});setShowWires(true);fitBoard();setReadingOnly(false)}}/>:undefined} routeToolbar={!exam&&material==='cade'?<CadeRouteToolbar title={routeTitle} canDetails={!!learning&&(learning.mode==='free'||learning.assistance===3)} nets={selectionNets} wires={doc.wires} onShow={showRoute} onDetails={()=>{const el=document.getElementById('cade-route-details') as HTMLDetailsElement|null;if(el){el.open=true;el.scrollIntoView({block:'start'});el.querySelector('summary')?.focus()}}}/>:undefined} routeDetails={!exam&&learning&&(learning.mode==='free'||learning.assistance===3)?<CadeRouteDetails title={routeTitle} nets={selectionNets} wires={doc.wires} state={learning} aliases={aliases} onChange={changeLearning} onLocate={locate}/>:undefined} selectedSymbol={routeSymbol} onSelectSymbol={selectSymbol} onMaterial={setMaterial} hidden={!showDiagram} readingOnly={compact?maximized:readingOnly} onExpand={()=>motion(()=>compact?setMaximized(m=>!m):setReadingOnly(!readingOnly))} onClose={()=>motion(()=>{setShowDiagram(false);setReadingOnly(false)})} showPanelLinks={!learning||learning.mode==='free'||learning.assistance===3} selectedLine={routeSymbol===null?line:null} onSelectLine={selectLine} onLearn={learn} onShowRoute={showRoute} completedLines={completedLines} selectedTerminalLines={terminalLines} exam={exam} lesson={learning?<ConnectionLesson state={learning} model={model} wires={doc.wires} onChange={changeLearning} onFocus={()=>{if(lessonTargets[0])focus(TERMINAL_BY_ID.get(lessonTargets[0])!.module)}} onCheck={checkLesson} message={lessonMessage}/>:undefined} onLocate={id=>{setReadingOnly(false);setShowDiagram(true);setMobileView('panel');locate(id)}} activePath={manual?.path} steps={doc.steps} onSelectStep={id=>{const index=doc.steps.findIndex(s=>s.id===id);if(index>=0){practice.commit(p=>({...p,mode:'guided',stepIndex:index}));setAssistance(1)}}} diagram={doc.diagram} activeRegion={manual?.region||null} selected={selected} onDiagram={diagram=>{practice.commit(p=>({...p,diagram,steps:[],stepIndex:0}));setFeedback('');setNotice('Referencia cargada. Los pasos se vinculan a esta imagen.')}} onStep={step=>{practice.commit(p=>({...p,steps:[...p.steps,step],mode:'guided',stepIndex:p.steps.length}));setTool('connect');setReadingOnly(false);setMobileView('panel');setNotice('Paso revisado guardado. Ya puedes comprobar su par de bornes.')}} onError={setNotice} recognitionImage={identification?TERMINAL_BY_ID.get(identification.terminalId)?.module.image:undefined}/></Suspense>)}
      <div className="stage-wrap"><div className="stage-topline"><span><span className="live-dot"/> {simulation.input.enabled?(simulation.result.powered?'Control · 24 V':simulation.input.plugged?'Enchufado · control OFF':'Enchufe desconectado'):'Virtual desenergizado'}</span>{!compact&&<>{moduleSelect}{simControls}</>}</div>
       <div className={`svg-surface board-tool-${tool}`}><ToolDock color={activeWire?.color||wireColor} onColor={color=>activeWire?updateWire({...activeWire,color}):setWireColor(color)} tool={tool} onTool={changeTool} canUndo={practice.canUndo} canRedo={practice.canRedo} onUndo={()=>{practice.undo();setPending(null);setNotice('')}} onRedo={()=>{practice.redo();setPending(null);setNotice('')}} selectedWire={!!activeWire} onDelete={removeWire} connectingDisabled={doc.mode==='identify'}/><Board simulation={simulation} liveWireIds={simulation.result.liveWireIds} ghosts={ghosts} routeWireIds={routeWireIds} errorWires={exam?[]:errorWires} selected={selected} onSelect={pick} group={filter} query={query} view={view} setView={setView} aliases={aliases} wires={showWires?doc.wires:[]} selectedWire={selectedWire} onSelectWire={selectWire} highlightedTerminals={[...highlightedTerminals,...procedureTargets]} highlightedModules={highlightedModules} pendingTerminal={pending} hitConnectors={tool!=='connect'&&doc.mode!=='identify'}/>{!exam&&<PowerStatus simulation={simulation}/>}{activeWire&&<div className="selected-cable-action"><span>Cable seleccionado</span><button onClick={removeWire}><X size={15}/> Retirar cable</button></div>}<div className="zoom-toolbar"><button aria-label="Alejar" onClick={()=>zoom(1.3)}><Minus size={18}/></button><span>{Math.round(1400/view.w*100)}%</span><button aria-label="Acercar" onClick={()=>zoom(1/1.3)}><Plus size={18}/></button><i/><button aria-label="Ajustar al tablero" onClick={()=>fitBoard()}><Focus size={18}/></button><button aria-label="Acomodar módulos" title="Acomodar módulos en su disposición base" onClick={tidyBoard}><LayoutGrid size={18}/></button></div></div>
      </div>
      {showInspector&&<Suspense fallback={<aside className="inspector" role="status">Abriendo inspector…</aside>}><SimulatorInspector onClose={()=>motion(()=>{setShowInspector(false);setSelectedWire(null)})} selected={selected} module={currentModule} aliases={aliases} onAlias={(id,value)=>setAliases(a=>({...a,[id]:value}))} onPick={pick} onLocate={locate} onFocus={focus} onPhoto={()=>setModal('photo')} wires={doc.wires} selectedWire={selectedWire} onSelectWire={selectWire} onChangeWire={updateWire} onDeleteWire={removeWire} onLayer={layerWire}/></Suspense>}
     </div>
    </div>
    {doc.steps.length>0&&!exam&&<details className="reviewed-steps disclosure"><summary>Pasos de mi diagrama · {doc.steps.length}</summary>{doc.steps.map((s,i)=><div key={s.id}><button onClick={()=>{practice.commit(p=>({...p,mode:'guided',stepIndex:i}));setShowDiagram(true);setAssistance(1);setTool('connect')}}>{i+1}. {s.title}</button><span>{s.from} ↔ {s.to}</span><button aria-label={`Eliminar paso ${i+1}`} onClick={()=>practice.commit(p=>({...p,steps:p.steps.filter(step=>step.id!==s.id),stepIndex:0}))}><X size={14}/></button></div>)}</details>}
    <div className="workspace-caption"><span className="save-state"><CheckCircle2 size={14}/>{practice.saved?'Guardado local':'Guardando…'}</span><span>{simulation.input.enabled?simulation.fault?'Control detenido: revisar cableado':simulation.result.powered?'Mando virtual · 24 V':simulation.input.plugged?'Mando virtual · interruptores abiertos':'Mando virtual · enchufe desconectado':'Práctica virtual sin energía.'}</span></div>
   </>}
  </main>
  {modal&&<div className="modal-backdrop" onMouseDown={()=>setModal(null)}><div className={`dialog ${modal==='photo'?'dialog-image':''}`} role="dialog" aria-modal="true" aria-label={modal==='photo'?'Fotografía original':'Uso del panel'} onMouseDown={e=>e.stopPropagation()}><div className="dialog-top"><strong>{modal==='photo'?currentModule.title:'Cómo trabajar en modo.'}</strong><button aria-label="Cerrar" onClick={()=>setModal(null)}><X size={20}/></button></div>{modal==='photo'?<img src={currentModule.image} loading="lazy" decoding="async" alt={`Fotografía ampliada: ${currentModule.title}`}/>:<div className="help-text"><ol><li>Elige una práctica o continúa la guardada.</li><li>Usa la barra flotante: seleccionar (V), mano (H), conectar (C), retirar (E). Para cablear, selecciona origen y destino. Puedes compartir bornes entre varios cables.</li><li>Selecciona un cable por su curva o desde «Cables» para retirarlo, cambiar su recorrido o seguir sus extremos.</li><li>Deshacer/rehacer conserva el historial de esta sesión. En «Opciones de práctica» puedes exportar una copia o cambiar de modo.</li><li>Pulsa «Abrir diagrama», carga tu imagen y marca una zona, revisa sus bornes y guarda un paso. Las ayudas muestran tramo, componentes o terminales.</li><li>Arrastra el fondo, usa Espacio + arrastrar o el botón central para moverte. La rueda desplaza y Ctrl + rueda acerca alrededor del cursor. En tacto, usa dos dedos para ampliar.</li><li>El reconocimiento guiado usa las fotografías para practicar la identificación de nueve bornes.</li></ol><p>El cableado y su guía permanecen independientes. «Simular 24 V» permite probar el mando con contactos ideales: enchufa la corriente virtual en Alimentación, activa los dos interruptores CONTROL y mantén pulsado un botón. La potencia trifásica y el retardo neumático no se simulan; el modelo virtual no verifica el equipo físico.</p></div>}</div></div>}
 </div>;
}
export default App;
