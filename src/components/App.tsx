import {LessonConfirmation} from './LessonConfirmation';
import type {ActivityProfile} from '../data/meterActivity';
import type {PracticeDocument} from '../data/practice';
import {ContextHint} from './ContextHint';
import {PanelMultimeter} from './PanelMultimeter';
import {LessonUnderstanding} from './LessonUnderstanding';
import {newAssessment} from '../data/assessmentState';
import {answerFor} from '../data/lessonAssessment';
import {panelExport,readPanelFile} from '../data/panelHistory';
import {Suspense,lazy,useCallback,useEffect,useMemo,useRef,useState,type ReactElement} from 'react';
import {Cable,CheckCircle2,CircleHelp,Compass,Download,Eye,EyeOff,Focus,Home as HomeIcon,LayoutGrid,Minus,Plus,Route,ScanSearch,X,Zap} from 'lucide-react';
import {ToolDock,type BoardTool} from './ToolDock';
import {FULL} from '../layout/boardViewport';
const Board=lazy(()=>import('./Board').then(module=>({default:module.Board}))); 
import {Home} from './Home';
import {TutorialHelp} from './TutorialHelp';
import {LogoModo} from './LogoModo';
import {LegalLink} from './LegalLink';
const DiagramPane=lazy(()=>import('./DiagramPane').then(module=>({default:module.DiagramPane})));
const SimulatorInspector=lazy(()=>import('./SimulatorInspector').then(module=>({default:module.SimulatorInspector})));
const LessonAssessment=lazy(()=>import('./LessonAssessment').then(module=>({default:module.LessonAssessment})));
const StudyGuide=lazy(()=>import('./StudyGuide').then(module=>({default:module.StudyGuide})));
import {CadeRouteToolbar,CadeRouteDetails,CadeRouteOptions} from './CadeRoute';
import {ConnectionLesson} from './ConnectionLesson';
import {CONFIRMED_MODULE_ALIASES} from '../data/panelCorrespondence';
import {CADE_WIRES,CADE_SYMBOLS,cadePorts} from '../data/cade';
import {assessCable,completedDiagramLines,learningModel,newLearning,netForLine,nextPair,portKey,routeForLine,routePairs,type LearningNet,type LearningState} from '../data/learning';
import {MAX_EXTRA_MODULES,MODULES,TERMINALS,matchesTerminal,type ExtraKind,type PanelModule} from '../data/panel';
import {AddPanelMenu} from './AddPanelMenu';
import {LotoBoardBox,type Isolator} from './LotoBox';
import {addExtraModule,boardFrame,fitView,getLayout,loadLayout,modulePos,removeExtraModule,resetLayout,useModules} from '../data/layout';
import {BANANA_COLOR,CLASS_DIAGRAMS,IDENTIFICATION_STEPS,emptyPractice,type AssistanceLevel,type BananaCable,type ManualStep,type StudyMode} from '../data/practice';
import {connectedByCables,createCable,networkFor,readPractice,terminalPoint,TERMINAL_BY_ID} from '../data/wiring';
import {useSimulation} from '../hooks/useSimulation';
import {SimulationControls} from './SimulationControls';
import {PowerStatus} from './PowerStatus';
const ProcedureTools=lazy(()=>import('./ProcedureTools').then(module=>({default:module.ProcedureTools}))); 
import {useActionRecorder} from '../hooks/useActionRecorder';
import {practiceChange,type SessionFrame} from '../data/session';
import {SIMULATION_EXAMPLES} from '../data/simulation';
import {LESSONS,terminalLabel} from '../data/lessons';
import {bankTerminalsForSymbol,lessonProgress,stepsForNet,stepsForSymbol,stepsForWire} from '../data/lessonSchematics';
import {usePractice} from '../hooks/usePractice';
import {useCompactLayout} from '../hooks/useCompactLayout';
import {DiagramWindow} from './DiagramWindow';
import {freeRegion,viewForModule} from '../layout/focusView';
import {CompactBar} from './CompactBar';
import {CablesMenu} from './CablesMenu';
import {FloatingDisclosure} from './FloatingDisclosure';
import {FloatingWindow} from './FloatingWindow';
import {SearchBox,type TerminalMatch} from './SearchBox';
import {motion} from '../motion/transition';
import {openingShow} from '../motion/opening';
const GROUPS=[['todos','Todos'],['alimentacion','Alimentación'],['botoneras','Botoneras'],['contactores','Contactores'],['temporizadores','Temporizador'],['motor','Motor']];
const EMPTY_IDS:string[]=[],EMPTY_WIRES:BananaCable[]=[];
const modes:Record<StudyMode,string>={explore:'Explorar',free:'Cableado libre',identify:'Reconocimiento guiado',guided:'Guía de mi diagrama'};
const MODE_ICONS={explore:Compass,free:Cable,identify:ScanSearch,guided:Route} as const;
const MODE_SHORT:Record<StudyMode,string>={explore:'Explorar',free:'Libre',identify:'Reconocer',guided:'Guía'};
const MODE_HELP:Record<StudyMode,string>={explore:'Toca un borne para conocer su módulo, sin cablear.',free:'Cablea a tu gusto sobre el banco.',identify:'Nueve retos para encontrar bornes en el banco.',guided:'Sigue los pasos de tu diagrama, una conexión a la vez.'};
type View={x:number;y:number;w:number;h:number};
function App(){
 const recorder=useActionRecorder();
 const practice=usePractice((before,after,action)=>{const change=practiceChange(before,after);recorder.capture({practice:after},(action==='undo'?'Deshacer · ':action==='redo'?'Rehacer · ':'')+change.label,change.targets);}),doc=practice.document;
 const [isolator,setIsolator]=useState<Isolator>({on:true,locked:false}),[loto,setLoto]=useState(0),[procedureTargets,setProcedureTargets]=useState<string[]>([]);
 useEffect(()=>{if(practice.ready)setLoto((practice.timeline.steps.at(-1)?.frame||practice.timeline.initial).loto);},[practice.ready]);
 const modules=useModules();
 const [modulesLocked,setModulesLocked]=useState(true);
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
 const [diagramSelectionCleared,setDiagramSelectionCleared]=useState(false);
 const [material,setMaterial]=useState<'cade'|'learn'|'image'>('cade');
 const [cadeDrawing,setCadeDrawing]=useState('perfecto');
 const [meterActivityActive,setMeterActivityActive]=useState(false),[meterActivityProfile,setMeterActivityProfile]=useState<ActivityProfile>('twoContactors');
 const twoContactorMeasurement=meterActivityActive&&meterActivityProfile==='twoContactors'&&!doc.wires.some(w=>[w.from.terminalId,w.to.terminalId].some(id=>id.startsWith('CONTACTOR_TRIFASICO_')));
 const [meterLessonOpen,setMeterLessonOpen]=useState(false),[meterTargets,setMeterTargets]=useState<string[]>([]);
 const [showInspector,setShowInspector]=useState(false),[meterOpen,setMeterOpen]=useState(false),[clampOpen,setClampOpen]=useState(false);
 useEffect(()=>{if(!meterOpen)setMeterTargets([])},[meterOpen]);
 const [tool,setTool]=useState<BoardTool>('inspect'),[pending,setPending]=useState<string|null>(null),[selectedWire,setSelectedWire]=useState<string|null>(null);
 const [wireColor,setWireColor]=useState(BANANA_COLOR),[showWires,setShowWires]=useState(true);
 const [notice,setNotice]=useState(''),[assistance,setAssistance]=useState<AssistanceLevel>(1),[feedback,setFeedback]=useState('');
 const [modal,setModal]=useState<'photo'|'help'|null>(null);
 const [lessonMessage,setLessonMessage]=useState(''),[errorWires,setErrorWires]=useState<string[]>([]);
 const assessment=doc.assessment,assessmentLesson=assessment?LESSONS[assessment.lessonId]:undefined;
 const [assessmentWire,setAssessmentWire]=useState<string|null>(null);
 const learning=doc.mode==='free'&&!assessment?doc.learning:undefined,exam=learning?.mode==='exam'||!!assessment;
 const simulation=useSimulation(doc.wires,!isIntro&&!exam,(input,label)=>{recorder.capture({simulation:input},label);practice.recordFrame({simulation:input},label,[],'control');},isolator.on);
 const procedureFrame:SessionFrame={practice:doc,simulation:simulation.input,loto};
 const learningActive=!!learning&&material==='cade'&&cadeDrawing==='perfecto';
 const model=useMemo(()=>learningModel(learning?.bindings),[learning?.bindings]);
 const line=learning?CADE_WIRES[learning.index]?.id:null,net=line!=null?netForLine(line,model):undefined;
 const symbol=CADE_SYMBOLS.find(o=>o.id===routeSymbol);
 const symbolKeys=symbol?cadePorts(symbol).map(portKey):[];
 const selectionNets=diagramSelectionCleared?[]:allRoutes?model:symbol?model.filter(n=>n.ports.some(p=>symbolKeys.includes(portKey(p)))):net?[learning?.mode==='free'?routeForLine(line!,learning.bindings)!:net]:[];
 const routes=routePairs(selectionNets,doc.wires);
 const routeTitle=allRoutes?'Todo PERFECTO':symbol?`Componente ${symbol.reference}`:line!=null?`Línea ${line}`:'PERFECTO · CADe';
 const pair=net?nextPair(net,doc.wires):undefined;
 const manualGhost=!learning&&doc.mode==='guided'&&assistance===3?doc.steps[doc.stepIndex]:undefined;
 const ghost=!exam&&learningActive&&learning?.assistance===3?pair:manualGhost&&!connectedByCables(manualGhost.from,manualGhost.to,doc.wires)?{from:manualGhost.from,to:manualGhost.to}:undefined;
 const ghosts=diagramSelectionCleared?[]:!exam&&learningActive&&learning?.mode==='free'&&learning.assistance===3?routes.filter(r=>!r.installed):ghost?[ghost]:[];
 const routeWireIds=!exam&&learningActive&&learning?.mode==='free'?doc.wires.filter(w=>selectionNets.some(n=>n.terminals.includes(w.from.terminalId)&&n.terminals.includes(w.to.terminalId))).map(w=>w.id):EMPTY_IDS;
 const moduleIds=modules.map(m=>m.id).join('|');
 const visibleWires=useMemo(()=>showWires?doc.wires.filter(w=>TERMINAL_BY_ID.has(w.from.terminalId)&&TERMINAL_BY_ID.has(w.to.terminalId)):EMPTY_WIRES,[showWires,doc.wires,moduleIds]);
 const completedLines=useMemo(()=>learning&&!exam?completedDiagramLines(doc.wires,model,learning.bindings):[],[doc.wires,model,learning?.bindings,!!learning,exam]);
 const terminalLines=useMemo(()=>!exam?model.filter(n=>n.terminals.includes(selected||'')).flatMap(n=>n.lineIds):[],[selected,model,exam]);
 const changeLearning=(patch:Partial<LearningState>)=>{setDiagramSelectionCleared(false);if(patch.index!=null||patch.mode&&patch.mode!=='free'){setRouteSymbol(null);setAllRoutes(false)}practice.commit(p=>({...p,assessment:undefined,mode:'free',learning:{...(p.learning||newLearning()),...patch}}));setLessonMessage('');setErrorWires([]);if(patch.mode){setShowInspector(false);setPending(null)}};
 const selectLine=(id:number)=>{const index=CADE_WIRES.findIndex(w=>w.id===id);if(index>=0){setRouteSymbol(null);setAllRoutes(false);setFilter('todos');setQuery('');changeLearning({index,...(!learning||learning.mode==='free'?{assistance:3 as const}:{})});if(!learning||learning.mode==='free'){const selectedNet=routeForLine(id,learning?.bindings);revealRoutes(selectedNet?[selectedNet]:[])}}};
 const selectSymbol=(id:number)=>{setRouteSymbol(id);setAllRoutes(false);setFilter('todos');setQuery('');if(!learning||learning.mode==='free'){changeLearning({assistance:3});const selected=CADE_SYMBOLS.find(o=>o.id===id),keys=selected?cadePorts(selected).map(portKey):[];revealRoutes(model.filter(n=>n.ports.some(p=>keys.includes(portKey(p)))))}};
 const learn=()=>{setDiagramSelectionCleared(false);practice.commit(p=>({...p,assessment:undefined,mode:'free',learning:{...(p.learning||{...newLearning(),index:CADE_WIRES.findIndex(w=>w.id===77)}),mode:'guided'}}));setTool('connect');setReadingOnly(false);setShowDiagram(true);setShowInspector(false)};
 const revealRoutes=(nets:LearningNet[])=>{setMaximized(false);setShowWires(true);setReadingOnly(false);setMobileView('panel');setFilter('todos');setQuery('');setDiagramGhosts([]);setPending(null);frameTerminals(nets.flatMap(n=>n.terminals));setTool('connect');setShowInspector(false);
  const shown=routePairs(nets,doc.wires),missing=[...new Set(nets.flatMap(n=>n.missing.map(portKey)))],pending=shown.filter(r=>!r.installed);
  setNotice(missing.length?`Revisa las correspondencias personales: ${missing.join(', ')}.`:pending.length?`Recorrido mostrado: ${pending.length} ${pending.length===1?'cable por montar':'cables por montar'}. Los extremos indican los bornes del tablero.`:shown.length?'Estas conexiones ya están montadas en el tablero.':'Este tramo corresponde a una conexión integrada del módulo; no requiere un cable banana.');
 };
 const checkLesson=()=>{const results=doc.wires.map(w=>assessCable(w,doc.wires,model,learning?.bindings||{}));setErrorWires(doc.wires.filter((w,i)=>results[i]==='incorrect'||results[i]==='short').map(w=>w.id));setLessonMessage(`${results.filter(v=>v==='correct').length} correctas · ${results.filter(v=>v==='incorrect').length} no corresponden · ${results.filter(v=>v==='unknown').length} sin información · ${results.filter(v=>v==='short').length} posibles cortocircuitos.`)};
 useEffect(()=>{if(!errorWires.length)return;const timer=setTimeout(()=>setErrorWires([]),3500);return()=>clearTimeout(timer)},[errorWires]);
 const record=TERMINAL_BY_ID.get(selected||''),currentModule=record?.module||MODULES[1];
 const activeWire=doc.wires.find(w=>w.id===selectedWire);
 const identification=doc.mode==='identify'?IDENTIFICATION_STEPS[doc.stepIndex]:undefined;
 const manual=doc.mode==='guided'?doc.steps[doc.stepIndex]:undefined;
 const guided=doc.mode==='identify'||doc.mode==='guided';
 const lessonActive=doc.mode==='guided'&&!!doc.diagram?.id.startsWith('leccion-');
 const guideTotal=doc.mode==='identify'?IDENTIFICATION_STEPS.length:doc.steps.length;
 const [studyOpen,setStudyOpen]=useState(false),[assessmentWindowRevision,setAssessmentWindowRevision]=useState(0);
 const [guideOpen,setGuideOpen]=useState(true),[diagramGhosts,setDiagramGhosts]=useState<{from:string;to:string}[]>([]);
 const [diagramBank,setDiagramBank]=useState<string[]>([]);
 useEffect(()=>{if(!lessonActive)setStudyOpen(false)},[lessonActive]);
 useEffect(()=>{setDiagramSelectionCleared(false)},[doc.stepIndex,doc.diagram?.id]);
 const activeLesson=lessonActive?Object.values(LESSONS).find(l=>l.diagram.id===doc.diagram?.id):undefined;
 /* Esquema de la lección: línea del paso (naranja), líneas ya armadas (verde) y los dos bornes. */
 const lessonView=useMemo(()=>assessmentLesson?{key:assessmentLesson.schematic,active:[],done:[],ends:[]}:activeLesson?{key:activeLesson.schematic as string,...lessonProgress(activeLesson,doc.stepIndex,doc.wires)}:undefined,[activeLesson,assessmentLesson,doc.stepIndex,doc.wires]);
 useEffect(()=>{if(guided||assessment)setGuideOpen(true)},[doc.mode,doc.diagram?.id,assessment?.id]);
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
 const deleteWire=useCallback((id:string)=>{practice.commit(p=>({...p,wires:p.wires.filter(w=>w.id!==id)}));setSelectedWire(null);setShowInspector(false);setNotice('Cable retirado. Puedes recuperarlo con Deshacer.')},[practice.commit]);
 const removeWire=()=>{if(selectedWire)deleteWire(selectedWire)};
 const clearWires=()=>{if(!doc.wires.length)return;practice.commit(p=>({...p,wires:[]}));setPending(null);setSelectedWire(null);setShowInspector(false);setErrorWires([]);setFeedback('');setNotice('Todos los cables retirados. Deshacer recupera el montaje completo.');};
 const changeTool=(next:BoardTool)=>{setTool(next);setPending(null);setNotice('');if(next!=='inspect'){setSelectedWire(null);setShowInspector(false)}};
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{if(isIntro||modal||(e.target as HTMLElement).closest('input,textarea,select,.simulation-control,.procedure-drawer,[contenteditable]'))return;if(e.key==='Escape'){setPending(null);setNotice('Conexión cancelada.')}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?practice.redo():practice.undo();setPending(null);setNotice(e.shiftKey?'Última acción rehecha.':'Última acción deshecha.')}if((e.key==='Delete'||e.key==='Backspace')&&selectedWire){e.preventDefault();removeWire()}if(!e.ctrlKey&&!e.metaKey&&!e.altKey){const next=({v:'inspect',h:'pan',c:'connect',e:'erase'} as const)[e.key.toLowerCase() as 'v'|'h'|'c'|'e'];if(next&&(next!=='connect'||doc.mode!=='identify')){e.preventDefault();changeTool(next)}}};
  document.addEventListener('keydown',key);return ()=>document.removeEventListener('keydown',key);
 });
 const matches=useMemo(()=>query.trim()?TERMINALS.filter(t=>matchesTerminal(t.module,t.terminal,query,aliases[t.module.id])):[],[query,aliases,modules.length]);
 const lastFit=useRef<View|null>(null);
 /* En móvil el encuadre se calcula sobre la parte del banco que la ventana del diagrama no tapa. */
 const placeView=(box:{x:number;y:number;w:number;h:number},legacy:View,remember=false)=>{
  const run=()=>{const stage=document.querySelector('.stage-wrap')?.getBoundingClientRect();
   if(compact&&stage){const obstacle=meterOpen&&meterActivityActive?document.querySelector('.panel-meter-lesson-window:not(.floating-window-hidden)'):assessment?document.querySelector('.assessment-window'):document.querySelector('.diagram-window:not([hidden])');let free=freeRegion(stage,obstacle?.getBoundingClientRect()||null);if(meterOpen&&meterActivityActive)free=freeRegion(free,document.querySelector('.panel-meter-workspace .lab-dmm-device')?.getBoundingClientRect()||null,80);const v=viewForModule(box,FULL,stage,free);if(remember)lastFit.current=v;setView(v);return}
   if(remember)lastFit.current=legacy;setView(legacy)};
  if(compact&&maximized)requestAnimationFrame(()=>requestAnimationFrame(run));else run()};
 const focus=(m:PanelModule)=>{const p=modulePos(m),w=Math.max(m.w+110,440);placeView({...p,w:m.w,h:m.h},{x:p.x+m.w/2-w/2,y:p.y+m.h/2-w*FULL.h/FULL.w/2,w,h:w*FULL.h/FULL.w});setFilter('todos')};
 /* Encuadra el banco sobre los bornes que pide el paso, para ver de un vistazo el cable que falta. */
 const frameTerminals=(ids:string[])=>{
  const points=ids.map(id=>terminalPoint(id)).filter((p):p is {x:number;y:number}=>!!p);if(!points.length)return;
  const x0=Math.min(...points.map(p=>p.x)),x1=Math.max(...points.map(p=>p.x)),y0=Math.min(...points.map(p=>p.y)),y1=Math.max(...points.map(p=>p.y)),pad=110;
  const box={x:x0-pad,y:y0-pad,w:x1-x0+2*pad,h:y1-y0+2*pad},ratio=FULL.h/FULL.w;let w=Math.max(box.w,560);if(box.h>w*ratio)w=box.h/ratio;const h=w*ratio;
  placeView(box,{x:box.x+box.w/2-w/2,y:box.y+box.h/2-h/2,w,h});setFilter('todos');
 };
 /* Al pulsar una pieza del esquema, el banco se acerca a sus bornes (que quedan iluminados). */
 useEffect(()=>{if(diagramBank.length)frameTerminals(diagramBank)},[diagramBank.join('|')]);
 /* Al elegir una línea o un símbolo en el esquema de una lección, el banco dibuja el cable que representa. */
 const showCables=(steps:ManualStep[],what:string)=>{setDiagramSelectionCleared(false);
  setMaximized(false);setReadingOnly(false);setMobileView('panel');setPending(null);setShowInspector(false);
  if(!steps.length){setDiagramGhosts([]);setNotice(`${what} no necesita un cable del banco en esta lección.`);return}
  setDiagramGhosts(steps.map(s=>({from:s.from,to:s.to})));setShowWires(true);setFilter('todos');frameTerminals(steps.flatMap(s=>[s.from,s.to]));
  const list=steps.slice(0,3).map(s=>`${terminalLabel(s.from)} ↔ ${terminalLabel(s.to)}`).join(' · ');
  setNotice(`${what} se arma con ${steps.length===1?'este cable':`${steps.length} cables`}: ${list}${steps.length>3?` y ${steps.length-3} más`:''}. Se muestra en el banco.`);
 };
 const lessonByKey=(key:string)=>Object.values(LESSONS).find(l=>l.schematic===key);
 const openMeterLesson=()=>{setMeterOpen(true);setMeterLessonOpen(true);setShowDiagram(false);setReadingOnly(false);setMaximized(false);setShowInspector(false);setGuideOpen(false);setStudyOpen(false);setNotice('')};
 const clearDiagramSelection=()=>{setDiagramSelectionCleared(true);setDiagramGhosts([]);setDiagramBank([]);setRouteSymbol(null);setAllRoutes(false);setPending(null);setNotice('')};
 const showLessonLine=(key:string,wireId:number)=>{const lesson=lessonByKey(key);if(!lesson||!prepareLessonModules(lesson))return;if(lesson.schematic==='estrellaDosContactores')setDiagramBank([]);const own=stepsForWire(lesson,wireId);if(own.length){showCables(own,'Esta línea');return}const net=stepsForNet(lesson,wireId);showCables(net,net.length?'Este tramo es parte de una red que':'Esta línea')};
 const showLessonSymbol=(key:string,symbolId:number)=>{const lesson=lessonByKey(key);if(!lesson||!prepareLessonModules(lesson))return;showCables(stepsForSymbol(lesson,symbolId),'Este componente');/* En el esquema de 2 contactores la pieza se ilumina desde aquí; en los demás lo informa el propio diagrama. */if(lesson.schematic==='estrellaDosContactores')setDiagramBank(bankTerminalsForSymbol(lesson,symbolId))};
 const fitBoard=()=>{const layout=getLayout(),f=boardFrame(layout),fit=fitView(layout);placeView({x:f.x,y:f.y,w:f.w,h:f.h},fit,true)};
 useEffect(()=>{
  if(!assessment||!compact||isIntro)return;
  let second=0;const first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>fitBoard())});
  return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second)};
 },[compact,assessment?.id,guideOpen,isIntro,assessmentWire,assessmentWindowRevision]);
 const tidyBoard=()=>{resetLayout();fitBoard();setNotice('Módulos acomodados en su disposición base. Puedes volver a moverlos arrastrándolos desde cualquier parte libre de su cara.')};
 /* Si el banco estaba encuadrado y la ventana aparece, se oculta o cambia la orientación, se vuelve a encuadrar en lo visible. */
 const viewRef=useRef(view);viewRef.current=view;
 useEffect(()=>{
  if(!compact)return;
  const same=(a:View,b:View)=>Math.abs(a.x-b.x)<2&&Math.abs(a.y-b.y)<2&&Math.abs(a.w-b.w)<2;
  let id2=0;const id1=requestAnimationFrame(()=>{id2=requestAnimationFrame(()=>{const cur=viewRef.current;if(same(cur,lastFit.current??fitView(getLayout()))||same(cur,FULL))fitBoard()})});
  return ()=>{cancelAnimationFrame(id1);cancelAnimationFrame(id2)};
 },[compact,showDiagram,portrait,maximized]);
 const addPanel=(kind:ExtraKind)=>{
  const m=addExtraModule(kind);
  if(!m){setNotice(`Ya hay ${MAX_EXTRA_MODULES} paneles adicionales: quita uno para añadir otro.`);return}
  const alias=m.defaultAlias||'';if(alias)setAliases(a=>({...a,[m.id]:alias}));
  setSelected(`${m.id}:${m.terminals[0].id}`);setSelectedWire(null);setFilter('todos');fitBoard();
  setNotice(`Panel añadido: ${m.title} ${alias}. Está en un hueco libre del banco; activa «Mover» para reubicarlo y «Fijar» al terminar.`);
 };
 const removePanel=(id:string)=>{
  const used=doc.wires.filter(w=>[w.from.terminalId,w.to.terminalId].some(t=>t.startsWith(`${id}:`))).length;
  if(used){setNotice(`Este panel tiene ${used} ${used===1?'cable conectado':'cables conectados'}. Retíralos antes de quitarlo.`);return}
  if(!removeExtraModule(id))return;
  setAliases(a=>{const {[id]:_removed,...rest}=a;return rest});
  setSelected(s=>s?.startsWith(`${id}:`)?'BOTONERAS:S1:1':s);fitBoard();
  setNotice('Panel quitado del banco.');
 };
 const locate=(id:string)=>{const t=TERMINAL_BY_ID.get(id);if(!t)return;setSelected(id);setShowInspector(!assessment);focus(t.module);setReadingOnly(false);setMobileView('panel');setMaximized(false)};
 const pick=useCallback((id:string)=>{
  if(tool==='pan')return;
  if(tool==='erase'){setNotice('Pulsa la curva o el conector del cable que quieres retirar.');return;}
  setSelected(id);setSelectedWire(null);setFilter('todos');setShowInspector(!doc.assessment&&tool==='inspect'&&doc.mode!=='identify');
  if(tool!=='connect'||doc.mode==='identify')return;
  if(!pending){setPending(id);setNotice('');return;}
  if(pending===id){setPending(null);setNotice('Conexión cancelada: elige dos bornes distintos.');return;}
  const from=pending,cable=createCable(from,id,doc.wires,wireColor);
  if(learningActive&&learning?.mode==='guided'){const verdict=assessCable(cable,[...doc.wires,cable],model,learning.bindings);setLessonMessage(verdict==='correct'?'Conexión reconocida en la red del esquema. Revisa el tramo y continúa.':verdict==='short'?'Posible cortocircuito: esta red une alimentaciones distintas. Revisa el cable.':verdict==='incorrect'?'Revisa la conexión: une redes diferentes del ejercicio. El cable permanece para que puedas corregirlo.':'No hay información suficiente para comprobar esta conexión.');if(verdict==='incorrect'||verdict==='short')setErrorWires([cable.id]);}
  practice.commit(p=>({...p,wires:[...p.wires,cable]}));if(doc.assessment){setAssessmentWire(cable.id);setGuideOpen(true)}setPending(null);setShowWires(true);setNotice('');
 },[tool,pending,doc.mode,doc.assessment,doc.wires,learning,learningActive,model,practice.commit,wireColor]);
 const updateWire=(wire:BananaCable)=>practice.commit(p=>({...p,wires:p.wires.map(w=>w.id===wire.id?wire:w)}));
 const layerWire=(front:boolean)=>{if(!activeWire)return;const layers=doc.wires.map(w=>w.layer);updateWire({...activeWire,layer:front?Math.max(...layers)+1:Math.min(...layers)-1})};
 const enterFreePanel=()=>{
  simulation.enable(false);
  if(doc.mode!=='free'||doc.learning||doc.assessment)practice.commit(p=>({...p,mode:'free',learning:undefined,assessment:undefined}));
  setIsIntro(false);setTool('inspect');setSelectedWire(null);setPending(null);setAssistance(1);setShowDiagram(false);setReadingOnly(false);setShowInspector(false);setMobileView('panel');fitBoard();setNotice('');
 };
 const importPractice=async(file:File)=>{try{if(file.size>8*1024*1024)throw new Error('La práctica supera 8 MB.');const loaded=readPanelFile(JSON.parse(await file.text())),imported=loaded.practice;motion(()=>{if(recorder.recording)recorder.stop();simulation.enable(false);practice.load(imported,loaded.history);setLoto((loaded.history.steps.at(-1)?.frame||loaded.history.initial).loto);setTool(imported.mode==='identify'||imported.mode==='explore'?'inspect':'connect');setIsIntro(false);setPending(null);setSelectedWire(null);setShowDiagram(true);fitBoard();setMobileView('panel');setNotice(loaded.message)},'page','forward');}catch(e){setNotice(e instanceof Error?e.message:'Archivo no válido.')}};
 const loadSimulationExample=(id:keyof typeof SIMULATION_EXAMPLES)=>{
  if(!confirmReplaceWires('el ejemplo elegido'))return;
  const example:{title:string;pairs:[string,string][];needs?:string[]}=SIMULATION_EXAMPLES[id],wires:BananaCable[]=[];
  /* Los ejemplos que usan un panel adicional (p. ej. KM3) lo añaden al banco si aún no está. */
  const created:PanelModule[]=[];
  for(const need of example.needs??[]){for(let guard=0;guard<MAX_EXTRA_MODULES&&!TERMINAL_BY_ID.has(`${need}:A1`);guard++){const added=addExtraModule('tri');if(!added)break;created.push(added)}}
  if(created.length)setAliases(a=>({...a,...Object.fromEntries(created.map(m=>[m.id,m.defaultAlias||'']))}));
  if((example.needs??[]).some(need=>!TERMINAL_BY_ID.has(`${need}:A1`))){setNotice('No se pudo añadir el panel que necesita este ejemplo. Quita algún panel adicional e inténtalo de nuevo.');return}
example.pairs.forEach(([from,to])=>wires.push(createCable(from,to,wires,wireColor)));practice.commit(p=>({...p,assessment:undefined,title:`Ejemplo virtual · ${example.title}`,mode:'free',wires,learning:undefined}));simulation.enable(true);setTool('inspect');setPending(null);setSelectedWire(null);setShowInspector(false);setFilter('todos');setQuery('');setShowWires(true);fitBoard();setNotice(id==='starDelta'?`Arranque estrella-triángulo cargado: KT1 es el conjunto contactor-temporizador de línea, KM2 estrella y KM1 triángulo. No necesita KM3. Retardo de ${simulation.timerSeconds} s. Enchufa, cierra FUERZA y los dos CONTROL y mantén pulsado el verde derecho (marcha): arranca en estrella y pasa solo a triángulo. Deshacer recupera el cableado anterior.`:id==='simple'?'Marcha y paro cargados. Enchufa, cierra FUERZA y los dos CONTROL: el verde izquierdo (S1) arranca KM1 y queda retenido, el rojo central (S2) lo para, y si disparas el térmico se enciende P3 y no arranca. Deshacer recupera el cableado anterior.':id==='inversion'?'Inversión de giro cargada. Enchufa, cierra FUERZA y los dos CONTROL: el verde izquierdo (S1) arranca el giro directo con KM1, el verde derecho (S3) el giro inverso con KM2 y el rojo central (S2) para. Pulsa el contrario sin parar y el enclavamiento lo ignora. Deshacer recupera el cableado anterior.':`Ejemplo virtual cargado. Enchufa la corriente virtual y cierra ambos interruptores CONTROL y prueba los pulsadores.${id.startsWith('motor')?' Para el motor cierra también FUERZA.':''} Deshacer recupera el cableado anterior.`);};
 /* Lección guiada: deja el banco sin cables y activa la guía manual con los pasos de la lección (Deshacer recupera lo anterior). */
 const prepareLessonModules=(lesson:(typeof LESSONS)[keyof typeof LESSONS])=>{
  const created:PanelModule[]=[];
  for(const need of lesson.needs??[]){if(!TERMINAL_BY_ID.has(`${need}:A1`)){const added=addExtraModule('tri');if(added)created.push(added)}}
  if(created.length)setAliases(a=>({...a,...Object.fromEntries(created.map(m=>[m.id,m.defaultAlias||'']))}));
  if((lesson.needs??[]).some(need=>!TERMINAL_BY_ID.has(`${need}:A1`))){setNotice('Esta lección necesita KM3. Libera un espacio para añadir ese panel.');return false}
  return true;
 };
 const prepareMeterLesson=(profile:ActivityProfile,document:PracticeDocument)=>{
  if(profile==='manual'&&!prepareLessonModules(LESSONS.estrellaManual))return false;
  setMeterActivityActive(true);setMeterActivityProfile(profile);practice.commit(()=>document);simulation.enable(true);simulation.reset();if(profile!=='manual')simulation.setTimerSeconds(60);
  setStudyOpen(false);setGuideOpen(false);setShowDiagram(false);setDiagramGhosts([]);setDiagramSelectionCleared(true);setPending(null);setSelectedWire(null);setShowInspector(false);setTool('inspect');setShowWires(true);setFilter('todos');setQuery('');setReadingOnly(false);setMaximized(false);fitBoard();setNotice('');return true;
 };
 /* Cargar una lección o prueba vacía el banco: si ya hay cables propios se pide confirmación (Deshacer sigue recuperándolos). */
 const confirmReplaceWires=(what:string)=>!doc.wires.length||window.confirm(`Esto reemplaza tus ${doc.wires.length} cables del banco por ${what}. Podrás recuperarlos con Deshacer. ¿Continuar?`);
 const loadLesson=(id:keyof typeof LESSONS,askFirst=true)=>{
  if(askFirst&&!confirmReplaceWires('una lección nueva sin cables'))return;
  setMeterActivityActive(false);setMeterLessonOpen(false);setDiagramSelectionCleared(false);
  const lesson=LESSONS[id];if(!prepareLessonModules(lesson))return;setStudyOpen(false);
  practice.commit(p=>({...p,assessment:undefined,title:lesson.title,mode:'guided',wires:[],diagram:lesson.diagram,steps:lesson.steps,stepIndex:0,learning:undefined}));
  /* Las lecciones arrancan con la ayuda al máximo: el cable del paso se ve desde el principio; se puede bajar el nivel. */
  simulation.enable(false);setTool('connect');setPending(null);setSelectedWire(null);setShowInspector(false);setAssistance(3);setFeedback('');setFilter('todos');setQuery('');
  setShowWires(true);setShowDiagram(false);setDiagramGhosts([]);setReadingOnly(false);setMobileView('panel');setGuideOpen(true);frameTerminals([lesson.steps[0].from,lesson.steps[0].to]);
  setNotice(`Lección lista · ${lesson.steps.length} conexiones.`);
 };
 const loadAssessment=(id:keyof typeof LESSONS)=>{
  if(!confirmReplaceWires('una prueba nueva sin cables'))return;
  const lesson=LESSONS[id];if(!prepareLessonModules(lesson))return;setStudyOpen(false);
  practice.commit(p=>({...p,title:`Armar y explicar · ${lesson.title.replace('Lección · ','')}`,mode:'free',wires:[],diagram:lesson.diagram,steps:[],stepIndex:0,learning:undefined,assessment:newAssessment(id)}));
  simulation.enable(false);setTool('connect');setPending(null);setSelectedWire(null);setShowInspector(false);setAssistance(1);setFeedback('');setFilter('todos');setQuery('');setShowWires(true);setShowDiagram(false);setDiagramGhosts([]);setReadingOnly(false);setMobileView('panel');setGuideOpen(true);setAssessmentWire(null);setNotice('');fitBoard();
 };
 const exitAssessment=()=>{practice.commit(p=>({...p,assessment:undefined,title:'Mi práctica INACAP'}));setGuideOpen(false);setPending(null);setNotice('Prueba cerrada. El montaje se conserva; Deshacer recupera la evaluación.');};
 const backStep=()=>{
  const next=Math.max(0,doc.stepIndex-1);practice.commit(p=>({...p,stepIndex:Math.max(0,p.stepIndex-1)}));setFeedback('');setDiagramGhosts([]);
  const step=doc.mode==='guided'?doc.steps[next]:undefined;if(step&&assistance>=2)frameTerminals([step.from,step.to]);
 };
 const exitGuide=()=>{
  practice.commit(p=>({...p,mode:'free',stepIndex:0,...(lessonActive?{steps:[],diagram:CLASS_DIAGRAMS[0]}:{})}));
  setShowDiagram(false);setPending(null);setAssistance(1);setFeedback('');setNotice('Guía cerrada. Tus cables siguen en el banco; puedes volver a abrir una guía desde el sombrero de la barra.');
 };
 const exportPractice=()=>{try{const file=panelExport(doc,practice.timeline),url=URL.createObjectURL(new Blob([JSON.stringify(file,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='modo-panel-con-historial.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('Panel y '+practice.timeline.steps.length+' pasos anteriores exportados.');}catch(error){setNotice(error instanceof Error?error.message:'No se pudo exportar el panel.');}};
 const zoom=(factor:number)=>setView(v=>{const w=Math.max(240,Math.min(3200,v.w*factor)),h=w*FULL.h/FULL.w;return {x:v.x+(v.w-w)/2,y:v.y+(v.h-h)/2,w,h}});
 const advance=()=>{
  const length=doc.mode==='identify'?IDENTIFICATION_STEPS.length:doc.steps.length,next=doc.stepIndex>=length?0:doc.stepIndex+1;
  practice.commit(p=>({...p,stepIndex:p.stepIndex>=length?0:p.stepIndex+1}));
  if(!lessonActive)setAssistance(1);setFeedback('');setDiagramGhosts([]);
  const step=doc.mode==='guided'?doc.steps[next]:undefined;if(step&&(lessonActive?assistance:1)>=2)frameTerminals([step.from,step.to]);
 };
 const selectWire=useCallback((id:string|null)=>{if(doc.assessment&&tool!=='erase'&&tool!=='pan'){setAssessmentWire(id);setGuideOpen(true);setSelectedWire(id);setShowInspector(false);setPending(null);return}if(tool==='erase'&&id){deleteWire(id);return;}if(tool==='pan')return;setSelectedWire(id);setShowInspector(true);setPending(null);setTool('inspect')},[tool,deleteWire,doc.assessment]);
 const guideEntryHandled=useRef(false);
 useEffect(()=>{if(!storageReady||!practice.ready||guideEntryHandled.current)return;guideEntryHandled.current=true;const params=new URLSearchParams(location.search);if(params.get('activity')==='maquinas-u2'){setIsIntro(false);if(params.get('lesson')==='estrellaManual')loadLesson('estrellaManual',false);else openMeterLesson();}},[storageReady,practice.ready]);
 const wrapDiagram=(pane:ReactElement)=><DiagramWindow open={showDiagram} compact={compact} portrait={portrait} maximized={maximized} floating={compact||!readingOnly}>{pane}</DiagramWindow>;
 const closeMenu=()=>practiceMenu.current?.removeAttribute('open');
 const changeMode=(mode:StudyMode)=>motion(()=>{practice.commit(p=>({...p,assessment:undefined,mode,stepIndex:0}));setTool(mode==='identify'||mode==='explore'?'inspect':'connect');setAssistance(1);setPending(null);setShowInspector(false);setShowDiagram(mode==='guided');setReadingOnly(false);setMobileView('panel');closeMenu()});
 const pickMatch=(t:TerminalMatch)=>{pick(t.key);focus(t.module);setQuery('');closeMenu()};
 const focusModule=(id:string)=>{const m=MODULES.find(m=>m.id===id);if(m){setSelected(`${m.id}:${m.terminals[0].id}`);setSelectedWire(null);focus(m)}};
 const moduleSelect=<select aria-label="Enfocar un módulo" value="" onChange={e=>{focusModule(e.target.value);closeMenu()}}><option value="" disabled>Ver módulo de cerca…</option>{modules.map(m=>{const alias=aliases[m.id]||m.defaultAlias;return <option key={m.id} value={m.id}>{m.title}{alias?` · ${alias}`:''}</option>})}</select>;
 const simControls=!exam?<SimulationControls simulation={simulation} onExample={loadSimulationExample} hasWires={!!doc.wires.length} compact={compact}/>:null;
 return <div data-max={maximized} className={`app-shell ${!isIntro?'editor-workbench':'modo-home-shell'} ${readingOnly?'editor-reading':''} ${guided?'editor-guided':''} ${compact?`is-compact ${portrait?'is-portrait':'is-landscape'}`:''} ${compact&&showDiagram?'diagram-open':''}`}>
  <header className="topbar"><a href="/" className="brand-wrap" aria-label="modo. · inicio"><LogoModo symbol={!isIntro}/></a><div className="top-spacer"/>{isIntro&&<LegalLink/>}{isIntro&&<TutorialHelp context={isIntro?'home':'practice'}/>}<button className="home-link" aria-label={isIntro?'Simulador':'Inicio'} title={isIntro?undefined:'Inicio'} onClick={()=>{if(isIntro)openingShow('Abriendo el panel de control');motion(()=>{if(isIntro)enterFreePanel();else{setIsIntro(true);setPending(null);setNotice('')}},'page',isIntro?'forward':'back')}}>{isIntro?'Simulador':<><HomeIcon size={18} aria-hidden="true"/><span className="sr-label">Inicio</span></>}</button>{!isIntro&&<button className="icon-button help-btn" aria-label="Cómo usar el panel" onClick={()=>setModal('help')}><CircleHelp size={20}/></button>}</header>
  <main><LessonConfirmation practice={doc} onAdvance={advance} enabled={!isIntro} suspended={studyOpen}/>{!isIntro&&<Suspense fallback={null}><ProcedureTools isolator={isolator} recorder={recorder} frame={procedureFrame} panelHistory={practice.timeline} historyMessage={practice.historyMessage} onImportPanel={importPractice} onExportPanel={exportPractice} onLoto={n=>{setLoto(n);recorder.capture({loto:n},n?'LOTO · etapa '+n+' revisada':'Reiniciar ejercicio LOTO');practice.recordFrame({loto:n},n?'LOTO · etapa '+n+' revisada':'Reiniciar ejercicio LOTO',[],'loto');}} onRestore={value=>{simulation.enable(false);practice.replace(structuredClone(value));setPending(null);setSelectedWire(null);setNotice('Montaje recuperado. Simulación detenida; Deshacer recupera la práctica anterior.');}} onTargets={setProcedureTargets}/></Suspense>}{!isIntro&&compact&&<CompactBar measurementOpen={meterLessonOpen&&meterOpen} onMeasurement={openMeterLesson} showDiagram={showDiagram} sheetFull={maximized} onHome={()=>motion(()=>{setIsIntro(true);setPending(null);setNotice('')},'page','back')} onBank={()=>motion(()=>{setMaximized(false);setMeterLessonOpen(false);setMeterTargets([])})} onToggleDiagram={()=>motion(()=>{setShowDiagram(!showDiagram);setReadingOnly(false);setMobileView('panel');setMeterLessonOpen(false);setMeterTargets([])})} simulation={simControls} cables={<CablesMenu wires={doc.wires} selectedWire={selectedWire} onSelect={selectWire}/>}/>}{practice.saveError&&<div className="status-banner error" role="alert">{practice.saveError}</div>}{notice&&<div className="status-banner" role="status">{notice}<button aria-label="Cerrar aviso" onClick={()=>setNotice('')}><X size={15}/></button></div>}
   {isIntro?<Home practice={doc} onEnterPanel={()=>{openingShow('Abriendo el panel de control');motion(enterFreePanel,'page','forward')}} onContinue={()=>{openingShow('Abriendo el panel de control');motion(enterFreePanel,'page','forward')}} onImport={importPractice} ready={practice.ready}/>:<>
    <div className="content-header compact-heading"><div><h1>{readingOnly?'Lectura de diagramas':modes[doc.mode]}</h1><p>{readingOnly?'Sigue las líneas, reconoce los símbolos y relaciona sus bornes.':doc.mode==='identify'?'Encuentra el borne indicado en el banco.':doc.mode==='guided'?'Sigue un paso y comprueba tu conexión.':doc.mode==='explore'?'Selecciona un borne para conocer su módulo.':'Elige una herramienta y trabaja sobre el banco.'}</p></div><FloatingDisclosure detailsRef={practiceMenu} className="practice-menu disclosure" title="Opciones de práctica" summaryLabel="Opciones de práctica" summary="Opciones de práctica"><div className="practice-settings menu-compact"><div className="compact-legal"><LegalLink/></div>{compact&&<SearchBox query={query} onQuery={setQuery} matches={matches} onPick={pickMatch}/>}<div className="menu-tiles" role="group" aria-label="Acciones rápidas">{compact&&<label className="menu-tile menu-select" title="Ver un módulo de cerca"><Focus size={22}/><span>Módulo</span>{moduleSelect}</label>}{compact&&<AddPanelMenu variant="tile" onAdd={addPanel} locked={modulesLocked} onLock={setModulesLocked}/>}<button className="menu-tile" aria-label={showWires?'Ocultar cables':'Mostrar cables'} title={showWires?'Ocultar cables':'Mostrar cables'} aria-pressed={!showWires} onClick={()=>setShowWires(!showWires)}>{showWires?<Eye size={22}/>:<EyeOff size={22}/>}<span>Cables</span></button><button className="menu-tile" aria-label="Cómo usar el lienzo" title="Cómo usar el lienzo" onClick={()=>{setModal('help');closeMenu()}}><CircleHelp size={22}/><span>Ayuda</span></button><TutorialHelp context="practice" variant="tile"/><button className="menu-tile" aria-label="Exportar práctica" title="Exportar práctica" onClick={exportPractice}><Download size={22}/><span>Exportar</span></button></div><small className="menu-caption">Modo de práctica</small><div className="menu-modes" role="radiogroup" aria-label="Modo de la práctica">{(Object.entries(modes) as [StudyMode,string][]).map(([id,name])=>{const Icon=MODE_ICONS[id];return <button key={id} role="radio" aria-checked={doc.mode===id} aria-label={name} title={`${name} · ${MODE_HELP[id]}`} className="menu-tile" onClick={()=>changeMode(id)}><Icon size={22}/><span>{MODE_SHORT[id]}</span></button>})}</div>{doc.archive&&<p>Respaldo del temporizador retirado: {doc.archive.wires.length} cables y {doc.archive.steps.length} pasos. La exportación los conserva.</p>}<FloatingDisclosure className="disclosure module-filters" title="Filtrar módulos" summary="Filtrar módulos"><div className="filters-scroll" role="tablist" aria-label="Filtrar módulos">{GROUPS.map(([id,label])=><button key={id} role="tab" aria-selected={filter===id} className={`filter-pill ${filter===id?'current':''}`} onClick={()=>setFilter(id)}>{label}</button>)}</div></FloatingDisclosure></div></FloatingDisclosure></div>
    {assessment&&<Suspense fallback={null}><LessonAssessment key={assessment.id} assessment={assessment} wires={doc.wires} wireId={assessmentWire} open={guideOpen} compact={compact} portrait={portrait} onChange={next=>practice.commit(p=>({...p,assessment:next}))} onChoose={setAssessmentWire} onReference={()=>{setGuideOpen(false);setShowDiagram(true);setMaximized(false);setReadingOnly(false)}} onMinimize={()=>setGuideOpen(false)} onShowMenu={()=>{setGuideOpen(false);requestAnimationFrame(()=>setGuideOpen(true))}} onLayoutChange={()=>setAssessmentWindowRevision(v=>v+1)} onExit={exitAssessment}/></Suspense>}
    {activeLesson&&manual&&<LessonUnderstanding step={manual} schematic={activeLesson.schematic} open={studyOpen} onToggle={setStudyOpen} onNext={advance}/>}
    {guided&&!learning&&!readingOnly&&guideOpen&&<FloatingWindow title={lessonActive?doc.title.replace('Lección · ',''):doc.mode==='identify'?'Reconocimiento guiado':'Guía de mi diagrama'} eyebrow={`Paso ${Math.min(doc.stepIndex+1,Math.max(1,guideTotal))} de ${guideTotal}`} className="guide-window" width={380} anchor={compact&&portrait?'bottom':'top'} side="right" top={compact?0:300} closeLabel="Ocultar la guía (se vuelve a abrir con el sombrero de la barra)" onClose={()=>setGuideOpen(false)}><Suspense fallback={<div className="guide-card" role="status">Abriendo la guía…</div>}><StudyGuide studyOpen={studyOpen} onStudyOpen={setStudyOpen} practice={doc} selected={selected} assistance={assistance} onAssistance={level=>{setAssistance(level);setDiagramGhosts([])}} onAdvance={advance} onBack={backStep} onOpenDiagram={()=>{setShowDiagram(true);setReadingOnly(false)}} feedback={feedback} onFeedback={setFeedback} onLocate={()=>{if(doc.mode==='guided'&&targetIds.length)frameTerminals(targetIds);else if(targetIds[0])locate(targetIds[0])}}/></Suspense></FloatingWindow>}
    <div className="work-card">
     {!compact&&<div className="work-toolbar workspace-navigation"><div className="workspace-views" role="group" aria-label="Vista de trabajo"><button aria-pressed={!readingOnly&&!(meterOpen&&meterLessonOpen)} onClick={()=>motion(()=>{setReadingOnly(false);setMobileView('panel');setMeterLessonOpen(false);setMeterTargets([])})}>Banco</button><button className="open-diagram" aria-pressed={showDiagram} onClick={()=>motion(()=>{setShowDiagram(!showDiagram);setReadingOnly(false);setMobileView('panel');setMeterLessonOpen(false);setMeterTargets([])})}>{showDiagram?'Cerrar diagrama':'Abrir diagrama'}</button></div></div>}{!compact&&<div className="work-tools"><CablesMenu wires={doc.wires} selectedWire={selectedWire} onSelect={selectWire}/></div>}
     {!readingOnly&&<div className="filterbar"><ContextHint key={tool} className="connection-message" message={tool==='connect'&&doc.mode!=='identify'?(pending?`Ahora elige el destino · ${TERMINAL_BY_ID.get(pending)?.terminal.id}`:compact&&typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches&&1400/view.w<1.4?'Acerca el tablero (+ o dos dedos) para tocar un borne con precisión':'Elige un borne de origen y otro de destino'):tool==='erase'?'Pulsa un cable para retirarlo · Deshacer lo recupera':tool==='pan'?'Arrastra el banco para mover la vista':!exam&&learning&&selected?terminalLines.length?`${selected} · esquema: líneas ${terminalLines.join(', ')}`:`${selected} · sin correspondencia confirmada en PERFECTO`:''}>{pending&&<button className="text-action" onClick={()=>{setPending(null);setNotice('')}}>Cancelar</button>}</ContextHint>{!compact&&<SearchBox query={query} onQuery={setQuery} matches={matches} onPick={pickMatch}/>}</div>}
     <div className="mobile-work-tabs"><button aria-pressed={mobileView==='panel'} onClick={()=>setMobileView('panel')}>Panel y conexiones</button><button aria-pressed={mobileView==='diagram'} onClick={()=>{setMobileView('diagram');setShowDiagram(true)}}>Diagrama y pasos</button></div>
     <div className={`workspace practice-workspace ${showDiagram?'has-diagram':''} ${showInspector?'has-inspector':''} ${readingOnly?'reading-only':''} mobile-${mobileView}`}>
      {(showDiagram||diagramMounted)&&wrapDiagram(<Suspense fallback={<aside className="diagram-pane" aria-label="Diagrama y material de estudio"><p role="status">Abriendo diagrama…</p></aside>}><DiagramPane onClearSelection={clearDiagramSelection} onBankTargets={setDiagramBank} panelBindings={learning?.bindings} onDrawingChange={id=>{setCadeDrawing(id);setDiagramGhosts([])}} lessonView={lessonView} onLessonLine={assessment?undefined:showLessonLine} onLessonSymbol={assessment?undefined:showLessonSymbol} learningMode={learning?.mode} routeOptions={!exam?<CadeRouteOptions all={allRoutes} onAll={()=>{setRouteSymbol(null);setAllRoutes(!allRoutes);changeLearning({mode:'free',assistance:3});setShowWires(true);fitBoard();setReadingOnly(false)}}/>:undefined} routeToolbar={!exam&&material==='cade'?<CadeRouteToolbar title={routeTitle} canDetails={!!learning&&(learning.mode==='free'||learning.assistance===3)} nets={selectionNets} wires={doc.wires} onDetails={()=>{const el=document.getElementById('cade-route-details') as HTMLDetailsElement|null;if(el){el.open=true;el.scrollIntoView({block:'start'});el.querySelector('summary')?.focus()}}}/>:undefined} routeDetails={!exam&&learning&&(learning.mode==='free'||learning.assistance===3)?<CadeRouteDetails title={routeTitle} nets={selectionNets} wires={doc.wires} state={learning} aliases={aliases} onChange={changeLearning} onLocate={locate}/>:undefined} selectedSymbol={routeSymbol} onSelectSymbol={selectSymbol} onMaterial={setMaterial} hidden={!showDiagram} readingOnly={compact?maximized:readingOnly} onExpand={()=>motion(()=>compact?setMaximized(m=>!m):setReadingOnly(!readingOnly))} onClose={()=>motion(()=>{setShowDiagram(false);setReadingOnly(false);setDiagramGhosts([])})} showPanelLinks={!learning||learning.mode==='free'||learning.assistance===3} selectedLine={!diagramSelectionCleared&&routeSymbol===null?line:null} onSelectLine={selectLine} onLearn={learn} completedLines={completedLines} selectedTerminalLines={terminalLines} exam={exam} lesson={learning?<ConnectionLesson state={learning} model={model} wires={doc.wires} onChange={changeLearning} onFocus={()=>{if(lessonTargets[0])focus(TERMINAL_BY_ID.get(lessonTargets[0])!.module)}} onCheck={checkLesson} message={lessonMessage}/>:undefined} onLocate={id=>{setReadingOnly(false);setShowDiagram(true);setMobileView('panel');locate(id)}} activePath={manual?.path} steps={doc.steps} onSelectStep={id=>{const index=doc.steps.findIndex(s=>s.id===id);if(index>=0){practice.commit(p=>({...p,mode:'guided',stepIndex:index}));if(!lessonActive)setAssistance(1);setFeedback('');const step=doc.steps[index];if(lessonActive&&assistance>=2)frameTerminals([step.from,step.to])}}} diagram={doc.diagram} activeRegion={activeLesson?.id.startsWith('estrella')?null:manual?.region||null} selected={selected} onDiagram={diagram=>{practice.commit(p=>({...p,diagram,steps:[],stepIndex:0}));setFeedback('');setNotice('Referencia cargada. Los pasos se vinculan a esta imagen.')}} onStep={step=>{practice.commit(p=>({...p,steps:[...p.steps,step],mode:'guided',stepIndex:p.steps.length}));setTool('connect');setReadingOnly(false);setMobileView('panel');setNotice('Paso revisado guardado. Ya puedes comprobar su par de bornes.')}} onError={setNotice} recognitionImage={identification?TERMINAL_BY_ID.get(identification.terminalId)?.module.image:undefined}/></Suspense>)}
      <div className="stage-wrap"><div className="stage-topline"><span><span className="live-dot"/> {!isolator.on?(isolator.locked?'Seccionador OFF · bloqueado':'Seccionador OFF · sin corriente'):simulation.input.enabled?(simulation.result.powered?'Control · 24 V':simulation.input.plugged?'Enchufado · control OFF':'Enchufe desconectado'):'Virtual desenergizado'}</span>{!compact&&<>{moduleSelect}<AddPanelMenu onAdd={addPanel} locked={modulesLocked} onLock={setModulesLocked}/>{simControls}</>}</div>
       <div className={`svg-surface board-tool-${tool}`}><ToolDock meterOpen={meterOpen} clampOpen={clampOpen} onClamp={()=>{setClampOpen(v=>!v);setMeterLessonOpen(false);}} measurementOpen={meterOpen&&meterLessonOpen} onMeter={()=>{setMeterOpen(v=>!v);setMeterLessonOpen(false);}} color={activeWire?.color||wireColor} onColor={color=>activeWire?updateWire({...activeWire,color}):setWireColor(color)} tool={tool} onTool={changeTool} canUndo={practice.canUndo} canRedo={practice.canRedo} onUndo={()=>{practice.undo();setPending(null);setNotice('')}} onRedo={()=>{practice.redo();setPending(null);setNotice('')}} selectedWire={!!activeWire} onDelete={removeWire} hasWires={doc.wires.length>0} onClearWires={clearWires} connectingDisabled={doc.mode==='identify'} guide={{active:!!assessment||guided&&!learning,open:guideOpen,current:assessment?{title:'Armar y explicar · '+assessmentLesson?.title.replace('Lección · ',''),index:doc.wires.filter(w=>answerFor(assessment,w)?.text.trim()).length,total:doc.wires.length,unit:'Respuestas'}:guided&&!learning?{title:lessonActive?doc.title.replace('Lección · ',''):doc.mode==='identify'?'Reconocimiento guiado':'Guía de mi diagrama',index:doc.stepIndex,total:guideTotal}:undefined,lessons:Object.entries(LESSONS).map(([key,l])=>({key,title:l.title.replace('Lección · ',''),steps:l.steps.length,summary:l.summary})),onToggle:()=>setGuideOpen(o=>!o),onLesson:key=>loadLesson(key as keyof typeof LESSONS),onAssessment:key=>loadAssessment(key as keyof typeof LESSONS),onMeterLesson:openMeterLesson,onIdentify:()=>{changeMode('identify');setGuideOpen(true)},onExit:assessment?exitAssessment:exitGuide}}/><Suspense fallback={<div role="status" className="modo-pending">Abriendo el panel de control…</div>}><Board omitExtraContactors={twoContactorMeasurement} overlay={<><LotoBoardBox isolator={isolator} powered={simulation.result.powered} onToggle={()=>setIsolator(v=>v.locked?v:{...v,on:!v.on})} onLock={()=>setIsolator(v=>v.on||v.locked?v:{...v,locked:true})} onUnlock={()=>setIsolator(v=>({...v,locked:false}))}/>{meterOpen||clampOpen?<PanelMultimeter twoContactorsOnly={twoContactorMeasurement} meterVisible={meterOpen} clampOpen={clampOpen} onClampOpen={setClampOpen} onMeterOpen={()=>setMeterOpen(true)} onSwitchInstrument={kind=>{setMeterOpen(kind==='meter');setClampOpen(kind==='clamp');setMeterLessonOpen(false);setMeterTargets([]);}} simulation={simulation} wires={doc.wires} lessonOpen={meterOpen&&meterLessonOpen} onLessonOpen={open=>{if(open)setMeterOpen(true);setMeterLessonOpen(open);if(!open)setMeterTargets([])}} onPrepareLesson={prepareMeterLesson} onOpenBranch={id=>{if(simulation.input.plugged||simulation.input.forceBreaker||simulation.input.breakers.some(Boolean)||Math.abs(simulation.motorMotion.rpm)>1){setNotice('Desenchufa, abre los interruptores y espera la detención antes de abrir la rama.');return false;}practice.commit(p=>({...p,wires:p.wires.filter(w=>w.id!==id)}));return true;}} onRestoreBranch={wire=>{if(simulation.input.plugged||simulation.input.forceBreaker||simulation.input.breakers.some(Boolean)||Math.abs(simulation.motorMotion.rpm)>1){setNotice('Desconecta el banco antes de reponer el cable.');return false;}practice.commit(p=>({...p,wires:p.wires.some(w=>w.id===wire.id)?p.wires:[...p.wires,wire]}));return true;}} onLocateTerminals={ids=>{setMeterTargets(ids);if(ids.length)frameTerminals(ids)}}/>:null}</>} modulesLocked={modulesLocked} simulation={simulation} liveWireIds={simulation.result.liveWireIds} ghosts={assessment?[]:[...ghosts,...diagramGhosts.filter(g=>!ghosts.some(h=>h.from===g.from&&h.to===g.to))]} routeWireIds={routeWireIds} errorWires={exam?EMPTY_IDS:errorWires} selected={selected} onSelect={pick} group={filter} query={query} view={view} setView={setView} aliases={aliases} wires={visibleWires} onRemoveModule={removePanel} selectedWire={selectedWire} onSelectWire={selectWire} highlightedTerminals={assessment?pending?[pending]:[]:[...highlightedTerminals,...procedureTargets,...meterTargets]} glowTerminals={assessment?[]:diagramBank} highlightedModules={assessment?[]:highlightedModules} pendingTerminal={pending} hitConnectors={tool!=='connect'&&doc.mode!=='identify'}/></Suspense>{!exam&&!(meterOpen&&meterActivityActive)&&<PowerStatus simulation={simulation} diagramOpen={showDiagram}/>}{activeWire&&<div className="selected-cable-action"><span>Cable seleccionado</span><button onClick={removeWire}><X size={15}/> Retirar cable</button></div>}<div className="zoom-toolbar"><button aria-label="Alejar" onClick={()=>zoom(1.3)}><Minus size={18}/></button><span>{Math.round(1400/view.w*100)}%</span><button aria-label="Acercar" onClick={()=>zoom(1/1.3)}><Plus size={18}/></button><i/><button aria-label="Ajustar al tablero" onClick={()=>fitBoard()}><Focus size={18}/></button><button aria-label="Acomodar módulos" title="Acomodar módulos en su disposición base" onClick={tidyBoard}><LayoutGrid size={18}/></button></div></div>
      </div>
      {showInspector&&<Suspense fallback={<aside className="inspector" role="status">Abriendo inspector…</aside>}><SimulatorInspector onClose={()=>motion(()=>{setShowInspector(false);setSelectedWire(null)})} selected={selected} module={currentModule} aliases={aliases} onAlias={(id,value)=>setAliases(a=>({...a,[id]:value}))} onPick={pick} onLocate={locate} onFocus={focus} onPhoto={()=>setModal('photo')} wires={doc.wires} selectedWire={selectedWire} onSelectWire={selectWire} onChangeWire={updateWire} onDeleteWire={removeWire} onLayer={layerWire}/></Suspense>}
     </div>
    </div>
    {doc.steps.length>0&&!exam&&!lessonActive&&<details className="reviewed-steps disclosure"><summary>Pasos de mi diagrama · {doc.steps.length}</summary>{doc.steps.map((s,i)=><div key={s.id}><button onClick={()=>{practice.commit(p=>({...p,mode:'guided',stepIndex:i}));setShowDiagram(true);setAssistance(1);setTool('connect')}}>{i+1}. {s.title}</button><span>{s.from} ↔ {s.to}</span><button aria-label={`Eliminar paso ${i+1}`} onClick={()=>practice.commit(p=>({...p,steps:p.steps.filter(step=>step.id!==s.id),stepIndex:0}))}><X size={14}/></button></div>)}</details>}
    <div className="workspace-caption"><span className="save-state"><CheckCircle2 size={14}/>{practice.saved?'Guardado local':'Guardando…'}</span><span>{simulation.input.enabled?simulation.fault?'Control detenido: revisar cableado':simulation.result.powered?'Mando virtual · 24 V':simulation.input.plugged?'Mando virtual · interruptores abiertos':'Mando virtual · enchufe desconectado':'Práctica virtual sin energía.'}</span></div>
   </>}
  </main>
  {modal&&<FloatingWindow title={modal==='photo'?currentModule.title:'Cómo trabajar en modo.'} onClose={()=>setModal(null)} closeLabel="Cerrar ayuda" className="floating-help" width={modal==='photo'?760:560}>{modal==='photo'?<img src={currentModule.image} loading="lazy" decoding="async" alt={`Fotografía ampliada: ${currentModule.title}`}/>:<div className="help-text"><ol><li>Elige una práctica o continúa la guardada.</li><li>Usa la barra flotante: seleccionar (V), mano (H), conectar (C), retirar (E). Para cablear, selecciona origen y destino. Puedes compartir bornes entre varios cables.</li><li>Selecciona un cable por su curva o desde «Cables» para retirarlo, cambiar su recorrido o seguir sus extremos.</li><li>Deshacer/rehacer conserva el historial de esta sesión. En «Opciones de práctica» puedes exportar una copia o cambiar de modo.</li><li>Pulsa «Abrir diagrama», carga tu imagen y marca una zona, revisa sus bornes y guarda un paso. Las ayudas muestran tramo, componentes o terminales.</li><li>Arrastra el fondo, usa Espacio + arrastrar o el botón central para moverte. La rueda desplaza y Ctrl + rueda acerca alrededor del cursor. En tacto, usa dos dedos para ampliar.</li><li>El reconocimiento guiado usa las fotografías para practicar la identificación de nueve bornes.</li></ol><p>El cableado y su guía permanecen independientes. «Simular 24 V» permite probar el mando con contactos ideales: enchufa la corriente virtual en Alimentación, activa los dos interruptores CONTROL y mantén pulsado un botón. La potencia trifásica y el retardo neumático no se simulan; el modelo virtual no verifica el equipo físico.</p></div>}</FloatingWindow>}
 </div>;
}
export default App;
