import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {BookOpen,ChevronDown,GraduationCap,Keyboard,ChevronRight,Eraser,Gauge,Hand,MousePointer2,Redo2,Undo2} from 'lucide-react';
import {HOLES,HOLE_BY_ID,bjtBase,componentHoles,crowdedHoles,icTo,parseHoleId,relocate,uid,type ProtoComponent,type ProtoKind} from './model';
import {holeName,measureResistance,netGroups,solveBreadboard} from './dc';
import type {Laboratory} from './useLaboratory';
import {useSvgNavigation,type CanvasView} from '../hooks/useSvgNavigation';
import {FloatingDock,ZoomBar,type DockItem} from './CanvasControls';
import {BoardArt,BoardStrips,BurntMark,ComponentShape,IcShape,PartIcon} from './BreadboardParts';
import {LogBody,meterDisplay,type MeterDisplay,type MeterMode,type Shortcut} from './MeterPanel';
import {MeterDevice,MeterLeads,jackAnchors,type LeadFrame,type Pt} from './MeterInstrument';
import {CLASS_DIAGRAMS,DiagramViewer} from './DiagramViewer';
import {SupplyEditor,ValueEditor,LED_COLORS,type EditorPatch} from './ValueEditor';
import {formatAmps,formatOhms,formatVolts} from './units';
import {labelWidth,placeLabels,wirePolyline,type Point,type Segment} from './labels';

type BoardTool='select'|'pan'|'measure'|'erase'|'positive'|'negative'|'pnp'|ProtoKind;
type PartKind=ProtoKind|'pnp';
const PLACEMENT:ProtoKind[]=['wire','resistor','led','switch','button','motor','l293d','bjt','diode'];
const isPlacement=(tool:BoardTool)=>tool==='pnp'||PLACEMENT.includes(tool as ProtoKind);
const KIND_NAMES:Record<ProtoKind,string>={diode:'Diodo',wire:'Puente',resistor:'Resistencia',led:'LED',switch:'Interruptor',button:'Pulsador',motor:'Motor',l293d:'L293D',bjt:'2N2222'};
const LIBRARY:{kind:PartKind;name:string;note:string;key:string}[]=[{kind:'wire',name:'Puente',note:'Une dos orificios',key:'W'},{kind:'resistor',name:'Resistencia',note:'Valor visible en ohmios',key:'R'},{kind:'led',name:'LED',note:'El primer extremo es el ánodo',key:'L'},{kind:'switch',name:'Interruptor',note:'Se opera durante la simulación',key:'S'},{kind:'button',name:'Pulsador',note:'Conduce solo mientras se mantiene presionado',key:'P'},{kind:'motor',name:'Motor',note:'Motor DC: el giro sigue la corriente',key:'O'},{kind:'l293d',name:'L293D',note:'Puente H: clic en el pin 1 (fila f)',key:'I'},{kind:'bjt',name:'2N2222 (NPN)',note:'Transistor NPN: E, B y C en tres orificios seguidos',key:'T'},{kind:'pnp',name:'2N2907 (PNP)',note:'Transistor PNP: E, B y C en tres orificios seguidos',key:'N'},{kind:'diode',name:'Diodo 1N4007',note:'Ánodo primero; el cátodo lleva la banda',key:'D'}];
const SHORTCUTS:Record<string,BoardTool>={v:'select',h:'pan',w:'wire',r:'resistor',l:'led',s:'switch',p:'button',o:'motor',i:'l293d',t:'bjt',n:'pnp',d:'diode',m:'measure',e:'erase'};
const BOARD={x:8,y:16,w:794,h:448};
const MIN_W=140,MAX_W=2200;
const LESSONS:{title:string;text:string}[]=[
  {title:'Columnas',text:'Cada columna une cinco orificios con una lámina metálica: a–e arriba (ámbar) y f–j abajo (verde). Los cinco orificios de una columna son un mismo punto eléctrico; las dos mitades no se tocan.'},
  {title:'Canal central',text:'El canal separa las mitades de arriba y abajo. Por eso un circuito integrado (DIP, como el L293D) se coloca sobre el canal: cada pata queda en una columna distinta y ninguna se une con su vecina.'},
  {title:'Rieles + y −',text:'Los rieles reparten la alimentación a lo largo de la placa. Aquí están partidos entre las columnas 15 y 16: la mitad izquierda y la derecha son redes distintas; si necesitas alimentar ambas, une las mitades con un puente.'},
  {title:'Una pata por orificio',text:'Cada orificio admite una sola pata. Para unir dos componentes, ponlos en orificios distintos de la misma columna (por ejemplo a5 y b5). Un orificio con dos patas se marca en rojo.'},
  {title:'Ver interior',text:'Se muestran las láminas metálicas. Pasa el cursor sobre un orificio para ver toda su red eléctrica: sus columnas, los puentes y los interruptores o pulsadores cerrados que la prolongan.'},
  {title:'Tu circuito',text:'La corriente solo circula en un camino cerrado desde el polo + hasta el polo −, pasando por las cargas. Con el interior visible, cada red resaltada es un punto con la misma tensión (sin caída en los cables ideales).'},
];
/** Colores que resaltan orificios en cada paso del tutorial. */
function lessonHoleColors(step:number|null):Record<string,string>{
  const colors:Record<string,string>={};if(step===null)return colors;
  const paint=(test:(h:typeof HOLES[number])=>boolean,color:string)=>{for(const h of HOLES)if(test(h))colors[h.id]=color;};
  if(step===0){paint(h=>h.group==='upper:5','#f7c95a');paint(h=>h.group==='lower:5','#7fd0c4');}
  if(step===1){paint(h=>h.group==='upper:8','#f7c95a');paint(h=>h.group==='lower:8','#7fd0c4');}
  if(step===2){paint(h=>h.group==='top+:left'||h.group==='bottom+:left','#ef7d78');paint(h=>h.group==='top+:right'||h.group==='bottom+:right','#f3b46b');paint(h=>h.group==='top-:left'||h.group==='bottom-:left','#6fa8d6');paint(h=>h.group==='top-:right'||h.group==='bottom-:right','#7fd0c4');}
  if(step===3){paint(h=>h.group==='upper:5','#7fd0c4');paint(h=>h.id==='a:5','#e0453a');}
  return colors;
}
const HOLE_ROWS=['top+','top-','a','b','c','d','e','f','g','h','i','j','bottom+','bottom-'];
/** Navegación con flechas entre orificios: una sola parada de tabulador y movimiento en la cuadrícula. */
function neighborHole(id:string,key:string):string|null{
  const [row,col]=id.split(':');let r=HOLE_ROWS.indexOf(row),c=Number(col);
  if(key==='ArrowLeft')c--;else if(key==='ArrowRight')c++;else if(key==='ArrowUp')r--;else if(key==='ArrowDown')r++;else if(key==='Home')c=1;else if(key==='End')c=30;else return null;
  return r<0||r>=HOLE_ROWS.length||c<1||c>30?null:`${HOLE_ROWS[r]}:${c}`;
}
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));

/** Encuadre de la placa dentro del área libre de controles flotantes (relleno en píxeles de pantalla). */
function fitView(size:{w:number;h:number},pad:{l:number;r:number;t:number;b:number},overview:boolean):CanvasView{
  const availW=Math.max(120,size.w-pad.l-pad.r),availH=Math.max(120,size.h-pad.t-pad.b),compact=size.w<700&&!overview;
  const scale=compact?Math.max(1,Math.min(availW/BOARD.w,availH/BOARD.h)):Math.min(availW/BOARD.w,availH/BOARD.h);
  const w=size.w/scale,h=size.h/scale,cx=pad.l+availW/2,cy=pad.t+availH/2;
  return {x:compact?BOARD.x-pad.l/scale+4:BOARD.x+BOARD.w/2-cx/scale,y:BOARD.y+BOARD.h/2-cy/scale,w,h};
}
function Card({title,summary,open,onToggle,className,children}:{title:string;summary:ReactNode;open:boolean;onToggle:()=>void;className?:string;children:ReactNode}){
  return <section className={`lab-float ${className??''}`} aria-label={title}><header><button type="button" className="lab-card-toggle" aria-expanded={open} onClick={onToggle}>{open?<ChevronDown size={15}/>:<ChevronRight size={15}/>}<span>{title}</span></button><strong>{summary}</strong></header>{open?<div className="lab-float-body">{children}</div>:null}</section>;
}
type Tone='fail'|'value'|'preview'|'reading'|'state'|'plus'|'minus'|'probe-a'|'probe-b';
type LabelSpec={id:string;anchor:Point;parts:{text:string;tone:Tone}[];component?:string};

export function BreadboardView({lab}:{lab:Laboratory}){
  const {project,update,running}=lab,board=project.breadboard,switches=lab.protoSwitches;
  const wrap=useRef<HTMLDivElement>(null),svg=useRef<SVGSVGElement>(null);
  const [size,setSize]=useState({w:1200,h:700});
  const compact=size.w<=800;
  const [tool,setTool]=useState<BoardTool>('select'),[pending,setPending]=useState<string|null>(null),[selected,setSelected]=useState<string|null>(null),[editing,setEditing]=useState(false),[preview,setPreview]=useState<number|null>(null);
  const [probeHoles,setProbeHoles]=useState<[string|null,string|null]>([null,null]),[hovered,setHovered]=useState<string|null>(null);
  const measurement=useMemo<[string,string]|null>(()=>probeHoles[0]&&probeHoles[1]?[probeHoles[0],probeHoles[1]]:null,[probeHoles]);
  const setMeasurement=(next:[string,string]|null|((m:[string,string]|null)=>[string,string]|null))=>setProbeHoles(h=>{const current:[string,string]|null=h[0]&&h[1]?[h[0],h[1]]:null,value=typeof next==='function'?next(current):next;return value?[value[0],value[1]]:[null,null];});
  const [sourceOpen,setSourceOpen]=useState(()=>typeof window==='undefined'||window.innerWidth>800);
  const [panel,setPanel]=useState<'learn'|'diagrams'|'names'|null>(null),[meterShown,setMeterShown]=useState(true),[meterCollapsed,setMeterCollapsed]=useState(()=>typeof window!=='undefined'&&window.innerWidth<=800),[logOpen,setLogOpen]=useState(false),[held,setHeld]=useState<MeterDisplay|null>(null),[deviceRect,setDeviceRect]=useState<DOMRect|null>(null),[dragProbe,setDragProbe]=useState<{which:0|1;pt:Pt;dx:number;dy:number}|null>(null),[lastPart,setLastPart]=useState<PartKind>('resistor');
  const [diagram,setDiagram]=useState<string|null>(null);
  const [lesson,setLesson]=useState<number|null>(null),[xray,setXray]=useState(false),[focusHole,setFocusHole]=useState('a:1');
  const [straight,setStraight]=useState(()=>{try{return localStorage.getItem('panellab-straight-wires')==='1';}catch{return false;}}),[moving,setMoving]=useState<{id:string;end:'from'|'to'|'body';hole:string|null}|null>(null);
  const [fromText,setFromText]=useState('a:1'),[toText,setToText]=useState('f:1');
  const [view,setView]=useState<CanvasView>({x:0,y:0,w:810,h:480});
  const firstView=useRef('0 0 810 480');
  const nav=useSvgNavigation(svg,view,setView,{min:MIN_W,max:MAX_W});
  const [dial,setDial]=useState<MeterMode|'OFF'>('V');
  const mode:MeterMode=dial==='OFF'?'V':dial;
  const damaged=lab.damaged;
  const solveOptions=useMemo(()=>({failures:true,damaged,ammeter:running&&dial==='A'&&measurement?{a:measurement[0],b:measurement[1]}:undefined}),[damaged,running,dial,measurement]);
  const result=useMemo(()=>running?solveBreadboard(board,switches,solveOptions):null,[running,board,switches,solveOptions]);
  useEffect(()=>{if(result&&Object.keys(result.failures).length)lab.damage(result.failures);},[result]);
  const ohm=useMemo(()=>!running&&measurement&&(dial==='R'||dial==='C')?measureResistance(board,switches,measurement[0],measurement[1]):null,[running,measurement,dial,board,switches]);
  useEffect(()=>{if(running)setDial(d=>d==='R'||d==='C'?'V':d);setHeld(null);},[running]);
  const liveDisplay:MeterDisplay=dial==='OFF'?{text:'',tone:'idle',note:'Multímetro apagado.'}:meterDisplay(mode,running,measurement,result,ohm,damaged);
  const display=held&&dial!=='OFF'?held:liveDisplay;
  const geo=useMemo(()=>board.components.map(c=>({c,a:HOLE_BY_ID.get(c.from)!,b:HOLE_BY_ID.get(c.to)!})),[board.components]);
  const active=geo.find(g=>g.c.id===selected);

  const padding=useCallback((w:number)=>w<=800?{l:8,r:8,t:66,b:132}:{l:diagram?486:panel?244:24,r:304,t:132,b:96},[panel,diagram]);
  const fit=useCallback((overview=true)=>{const box=wrap.current?.getBoundingClientRect();const s=box?{w:box.width,h:box.height}:size;setView(fitView(s,padding(s.w),overview));},[padding,size]);
  useLayoutEffect(()=>{
    const element=wrap.current;if(!element)return;
    const measure=()=>{const box=element.getBoundingClientRect();if(box.width>0&&box.height>0)setSize(previous=>previous.w===box.width&&previous.h===box.height?previous:{w:box.width,h:box.height});};
    const box=element.getBoundingClientRect(),initial={w:box.width||1200,h:box.height||700},v=fitView(initial,padding(initial.w),false);
    firstView.current=`${v.x} ${v.y} ${v.w} ${v.h}`;svg.current?.setAttribute('viewBox',firstView.current);setSize(initial);setView(v);
    const observer=new ResizeObserver(measure);observer.observe(element);return()=>observer.disconnect();
  },[]);
  const viewerOpen=!!diagram,viewerMounted=useRef(false);
  useEffect(()=>{if(!viewerMounted.current){viewerMounted.current=true;return;}if(size.w>800)fit(true);},[viewerOpen]);
  useEffect(()=>{setView(v=>{const h=v.w*size.h/size.w;return Math.abs(h-v.h)>1?{...v,h}:v;});},[size]);

  useEffect(()=>{setPending(null);if(running){setTool('measure');}else setTool(t=>t==='measure'?'select':t);},[running]);
  useEffect(()=>{if(selected&&!board.components.some(c=>c.id===selected)){setSelected(null);setEditing(false);}},[board.components,selected]);
  const patch=(id:string,value:EditorPatch&Partial<Pick<ProtoComponent,'from'|'to'>>)=>update(p=>({...p,breadboard:{...p.breadboard,components:p.breadboard.components.map(c=>c.id===id?{...c,...value}:c)}}));
  const remove=(id:string)=>{update(p=>({...p,breadboard:{...p.breadboard,components:p.breadboard.components.filter(c=>c.id!==id)}}));if(selected===id){setSelected(null);setEditing(false);}};
  const choose=(next:BoardTool)=>{if(isPlacement(next))setLastPart(next as PartKind);setTool(next);setPending(null);if(next!=='select'){setEditing(false);}};
  const closeEditor=()=>{setEditing(false);setPreview(null);};

  const place=(from:string,target:string)=>{
    let to=target;
    if(!isPlacement(tool)||running)return;
    if(tool==='l293d'){const end=icTo(from);if(!end){lab.setMessage('El L293D empieza en un orificio de la fila f, columnas 1 a 23: ese será el pin 1.');return;}to=end;}
    else if(tool==='bjt'||tool==='pnp'){if(!bjtBase(from,to)){lab.setMessage('El transistor ocupa tres orificios seguidos de una misma fila: elige el del emisor (E) y el del colector (C), con uno libre en medio para la base.');setPending(null);return;}}
    else if(from===to){lab.setMessage('Selecciona dos orificios diferentes.');return;}
    if(board.components.length>=128){lab.setMessage('La protoboard admite 128 elementos en esta versión.');return;}
    const kind:ProtoKind=tool==='pnp'?'bjt':tool as ProtoKind,component:ProtoComponent={id:uid('part'),kind,from,to,value:kind==='resistor'?1000:kind==='led'?1.9:kind==='diode'?.7:kind==='motor'?40:kind==='bjt'?100:0,closed:kind!=='button',...tool==='pnp'?{polarity:'pnp' as const}:{},color:kind==='bjt'?(tool==='pnp'?'#262a3a':'#1f2327'):kind==='diode'?'#1d2023':kind==='led'?LED_COLORS[0].hex:kind==='button'?'#d94848':kind==='motor'?'#4b5563':kind==='l293d'?'#2b3035':'#0f766e'};
    const occupied=new Set(board.components.flatMap(c=>componentHoles(c)));if(componentHoles(component).some(h=>occupied.has(h)))lab.setMessage('Ese orificio ya tiene una pata. En una protoboard real cada orificio admite una sola: usa otro de la misma columna.');
    update(p=>({...p,breadboard:{...p.breadboard,components:[...p.breadboard.components,component]}}));setSelected(component.id);setEditing(kind==='resistor'||kind==='led'||kind==='diode'||kind==='motor'||kind==='l293d'||kind==='bjt');setPending(null);
  };
  const applyPoints=(from:string,to:string)=>{
    if(tool==='positive'||tool==='negative'){if(!running)update(p=>({...p,breadboard:{...p.breadboard,[tool]:from}}));setTool('select');return;}
    if(tool==='measure'){setMeasurement([from,to]);setPending(null);return;}
    if(!isPlacement(tool)){lab.setMessage('Elige primero Puente, Resistencia, LED, Interruptor o Medir.');return;}
    place(from,to);
  };
  const clickHole=(id:string)=>{
    if(tool==='pan'||tool==='select'||tool==='erase')return;
    if(tool==='positive'||tool==='negative'){applyPoints(id,id);return;}
    if(running&&tool!=='measure')return;
    if(tool==='l293d'){place(id,id);return;}
    if(!pending){setPending(id);return;}
    if(pending===id){setPending(null);return;}
    applyPoints(pending,id);
  };
  const handlers=useRef({clickHole,hover:setHovered});handlers.current={clickHole,hover:setHovered};
  const activate=(c:ProtoComponent)=>{
    if(tool==='pan')return;
    if(tool==='erase'){if(!running)remove(c.id);return;}
    setSelected(c.id);
    if(running&&c.kind==='switch')lab.setProtoSwitch(c.id,!(switches[c.id]??c.closed));
    setEditing(tool==='select'||(isPlacement(tool)&&!running));
  };
  const openEditor=(id:string)=>{setSelected(id);setEditing(true);};

  /* Lectura del multímetro */
  const group=hovered?HOLE_BY_ID.get(hovered)?.group:pending?HOLE_BY_ID.get(pending)?.group:undefined;

  /* Etiquetas: valores horizontales en franjas libres de orificios */
  const scale=size.w/view.w,labelScale=11*scale>=10?1:Math.min(1.5,10/(11*scale));
  const specs=useMemo(()=>{
    const list:LabelSpec[]=[];
    for(const {c,a,b} of geo){
      if(damaged[c.id]){list.push({id:c.id,anchor:{x:(a.x+b.x)/2,y:(a.y+b.y)/2-(c.kind==='bjt'?22:0)},parts:[{text:'Quemado',tone:'fail'}],component:c.id});continue;}
      if(c.kind==='l293d')continue;
      const anchor={x:(a.x+b.x)/2,y:(a.y+b.y)/2-(c.kind==='bjt'?22:0)},amps=result?.amps[c.id],closed=switches[c.id]??c.closed,parts:LabelSpec['parts']=[];
      if(c.kind==='resistor')parts.push({text:formatOhms(preview!==null&&selected===c.id?preview:c.value),tone:preview!==null&&selected===c.id?'preview':'value'});
      if(c.kind==='led'&&selected===c.id)parts.push({text:`Vf ${formatVolts(c.value)}`,tone:'value'});
      if(c.kind==='switch')parts.push({text:closed?'Cerrado':'Abierto',tone:'state'});
      if(c.kind==='diode'){parts.push({text:'1N4007',tone:'value'});if(running&&amps!==undefined)parts.push({text:formatAmps(Math.abs(amps)),tone:'reading'});}
      if(c.kind==='bjt'){parts.push({text:c.polarity==='pnp'?'2N2907':'2N2222',tone:'value'});const t=result?.bjts[c.id];if(running&&t)parts.push({text:`${t.region} · ${formatAmps(t.ic)}`,tone:'reading'});}
      if(c.kind==='button')parts.push({text:running?(switches[c.id]?'Presionado':'Suelto'):'Pulsador',tone:'state'});
      if(c.kind==='motor'){parts.push({text:'Motor',tone:'value'});if(running&&amps!==undefined)parts.push({text:Math.abs(amps)<1e-6?'parado':`${amps>0?'↻':'↺'} ${formatAmps(Math.abs(amps))}`,tone:'reading'});}
      if(running&&amps!==undefined&&(c.kind==='resistor'||c.kind==='led'))parts.push({text:formatAmps(Math.abs(amps)),tone:'reading'});
      if(parts.length)list.push({id:c.id,anchor,parts,component:c.id});
    }
    const pos=HOLE_BY_ID.get(board.positive),neg=HOLE_BY_ID.get(board.negative);
    if(pos)list.push({id:'src+',anchor:pos,parts:[{text:`+ ${formatVolts(board.voltage)} DC`,tone:'plus'}]});
    if(neg)list.push({id:'src-',anchor:neg,parts:[{text:'−',tone:'minus'}]});
    probeHoles.forEach((id,i)=>{const h=id?HOLE_BY_ID.get(id):undefined;if(h)list.push({id:`probe-${i}`,anchor:h,parts:[{text:i===0?'A':'B',tone:i===0?'probe-a':'probe-b'}]});});
    return list;
  },[geo,result,switches,selected,preview,board.voltage,board.positive,board.negative,probeHoles,running,damaged]);
  const labels=useMemo(()=>{
    const segments:Segment[]=[];
    for(const {c,a,b} of geo){if(c.kind==='wire'){const pts=wirePolyline(a,b,14,straight);for(let i=0;i<pts.length-1;i++)segments.push([pts[i],pts[i+1]]);}else if(c.kind==='bjt'){const bx=(a.x+b.x)/2,x0=bx-15,x1=bx+15,y0=a.y-36,y1=a.y-10,box:Point[]=[{x:x0,y:y0},{x:x1,y:y0},{x:x1,y:y1},{x:x0,y:y1},{x:x0,y:y0}];for(let i=0;i<4;i++)segments.push([box[i],box[i+1]]);segments.push([a,b]);}else if(c.kind==='l293d'){const x0=a.x-12,x1=b.x+12,y0=b.y+6,y1=a.y-6,box:Point[]=[{x:x0,y:y0},{x:x1,y:y0},{x:x1,y:y1},{x:x0,y:y1},{x:x0,y:y0}];for(let i=0;i<4;i++)segments.push([box[i],box[i+1]]);}else segments.push([a,b]);}
    return placeLabels(specs.map(s=>({id:s.id,anchor:s.anchor,w:labelWidth(s.parts.map(p=>p.text))})),segments);
  },[specs,geo,straight]);

  /* Navegación del pizarrón: la arrastra el fondo; el zoom y la rueda los resuelve el hook compartido */
  /* Un arrastre mayor al umbral desplaza la vista desde cualquier punto; un toque corto sigue siendo un clic.
     Tras desplazar se descarta el clic siguiente para no colocar, seleccionar ni operar nada al soltar. */
  const drag=useRef<{id:number;x:number;y:number;view:CanvasView;scale:number;moved:boolean;background:boolean;touch:boolean}|null>(null),justDragged=useRef(false);
  const currentView=():CanvasView=>{const b=svg.current!.viewBox.baseVal;return {x:b.x,y:b.y,w:b.width,h:b.height};};
  /* Inercia al soltar el arrastre: la placa sigue un instante y se frena como un objeto con peso; tocar la detiene. */
  const trail=useRef<{t:number;x:number;y:number}[]>([]),momentum=useRef(0);
  const stopMomentum=()=>{if(momentum.current){cancelAnimationFrame(momentum.current);momentum.current=0;nav.commit();}};
  const startMomentum=(scalePx:number)=>{
    const samples=trail.current.filter(p=>performance.now()-p.t<110);trail.current=[];
    if(samples.length<2||matchMedia('(prefers-reduced-motion: reduce)').matches){nav.commit();return;}
    const first=samples[0],last=samples[samples.length-1],dt=Math.max(16,last.t-first.t);let vx=(last.x-first.x)/dt,vy=(last.y-first.y)/dt;
    if(Math.hypot(vx,vy)<.25){nav.commit();return;}
    let previous=performance.now(),view=currentView();
    const frame=(now:number)=>{
      const step=Math.min(48,now-previous);previous=now;view={...view,x:view.x-vx*step/scalePx,y:view.y-vy*step/scalePx};nav.show(view);
      const decay=Math.exp(-step/240);vx*=decay;vy*=decay;
      if(Math.hypot(vx,vy)<.02){momentum.current=0;nav.commit();return;}
      momentum.current=requestAnimationFrame(frame);
    };
    momentum.current=requestAnimationFrame(frame);
  };
  const onDown=(e:React.PointerEvent<SVGSVGElement>)=>{
    stopMomentum();trail.current=[];
    justDragged.current=false;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    if(drag.current&&drag.current.id!==e.pointerId){drag.current=null;return;}
    const onItem=!!(e.target as Element).closest('.lab-hole,.lab-proto-component,.lab-label.clickable');
    drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,view:currentView(),scale:svg.current?.getScreenCTM()?.a||1,moved:false,background:!onItem,touch:e.pointerType==='touch'};
  };
  const onMove=(e:React.PointerEvent<SVGSVGElement>)=>{
    const d=drag.current;if(!d||d.id!==e.pointerId)return;
    if(!d.moved){
      if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<=(d.touch?9:5))return;
      d.moved=true;d.view=currentView();d.x=e.clientX;d.y=e.clientY;svg.current!.dataset.dragging='true';
      try{svg.current!.setPointerCapture(e.pointerId);}catch{/* captura no disponible */}
      return;
    }
    nav.show({...d.view,x:d.view.x-(e.clientX-d.x)/d.scale,y:d.view.y-(e.clientY-d.y)/d.scale});
    trail.current=[...trail.current.slice(-5),{t:performance.now(),x:e.clientX,y:e.clientY}];
  };
  const onUp=(e:React.PointerEvent<SVGSVGElement>)=>{
    const d=drag.current;if(!d||d.id!==e.pointerId)return;
    drag.current=null;delete svg.current?.dataset.dragging;
    if(d.moved){justDragged.current=true;startMomentum(d.scale);}
    else if(d.background&&svg.current?.dataset.gesture!=='true'){setSelected(null);setEditing(false);setPending(null);}
  };
  const zoomBy=(factor:number)=>setView(v=>{const w=clamp(v.w*factor,MIN_W,MAX_W),f=w/v.w;return {x:v.x+(v.w-w)/2,y:v.y+(v.h-v.h*f)/2,w,h:v.h*f};});

  /* Teclado global del banco */
  const keys=useRef({choose,remove,selected,running,lab,setPending,closeEditor,editing,pending});keys.current={choose,remove,selected,running,lab,setPending,closeEditor,editing,pending};
  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{
      const k=keys.current,target=e.target as HTMLElement;
      if(target?.closest?.('input,textarea,select,[contenteditable]'))return;
      if(e.key==='Escape'){if(k.pending)k.setPending(null);else if(k.editing)k.closeEditor();return;}
      if((e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase())){e.preventDefault();if(e.key.toLowerCase()==='y'||e.shiftKey)k.lab.redo();else k.lab.undo();return;}
      if((e.key==='Delete'||e.key==='Backspace')&&k.selected&&!k.running){e.preventDefault();k.remove(k.selected);return;}
      if(e.ctrlKey||e.metaKey||e.altKey)return;
      const next=SHORTCUTS[e.key.toLowerCase()];
      if(next&&!(k.running&&(next==='erase'||PLACEMENT.includes(next as ProtoKind)))){e.preventDefault();k.choose(next);}
    };
    document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);
  },[]);

  const dock:DockItem[]=[
    {id:'select',label:'Seleccionar',shortcut:'V',icon:<MousePointer2 size={20}/>,pressed:tool==='select',onClick:()=>choose('select')},
    {id:'pan',label:'Mover vista',shortcut:'H',icon:<Hand size={20}/>,pressed:tool==='pan',onClick:()=>choose('pan')},
    'separator',
    {id:'parts',label:'Componentes',icon:<PartIcon kind={lastPart} size={30}/>,pressed:isPlacement(tool),disabled:running,menu:LIBRARY.map(item=>({id:item.kind,label:item.name,note:item.note,shortcut:item.key,icon:<PartIcon kind={item.kind} size={36}/>,pressed:tool===item.kind,onClick:()=>choose(item.kind)}))},
    {id:'meter',label:'Multímetro',shortcut:'M',icon:<Gauge size={20}/>,pressed:meterShown,onClick:()=>{choose('measure');setMeterShown(shown=>!shown);}},
    {id:'erase',label:'Retirar',shortcut:'E',icon:<Eraser size={20}/>,pressed:tool==='erase',disabled:running,onClick:()=>choose('erase')},
    'separator',
    {id:'undo',label:'Deshacer',shortcut:'Ctrl+Z',icon:<Undo2 size={19}/>,disabled:!lab.canUndo||running,onClick:lab.undo},
    {id:'redo',label:'Rehacer',shortcut:'Ctrl+Y',icon:<Redo2 size={19}/>,disabled:!lab.canRedo||running,onClick:lab.redo},
    'separator',
    {id:'help',label:'Aprender y referencias',icon:<GraduationCap size={20}/>,pressed:!!panel||!!diagram,menu:[
      {id:'learn',label:'Cómo funciona',note:'Columnas, canal, rieles y redes',icon:<span className="lab-menu-icon"><GraduationCap size={20}/></span>,pressed:panel==='learn',onClick:()=>{setPanel(panel==='learn'?null:'learn');}},
      {id:'diagrams',label:'Diagramas de la clase',note:'Práctica 1 y 2, pines del L293D',icon:<span className="lab-menu-icon"><BookOpen size={20}/></span>,pressed:panel==='diagrams',onClick:()=>{setPanel(panel==='diagrams'?null:'diagrams');}},
      {id:'names',label:'Puntos por nombre',note:'Colocar o medir escribiendo a5, f10…',icon:<span className="lab-menu-icon"><Keyboard size={20}/></span>,pressed:panel==='names',onClick:()=>{setPanel(panel==='names'?null:'names');}},
    ]},
  ];

  const editorAnchor=active&&editing?{x:(active.a.x+active.b.x)/2,y:(active.a.y+active.b.y)/2}:null;
  const popoverStyle=useMemo(()=>{
    if(!editorAnchor)return undefined;
    if(compact)return undefined;
    const sx=(editorAnchor.x-view.x)*scale,sy=(editorAnchor.y-view.y)*scale,width=300;
    const left=sx+30+width>size.w-12?Math.max(8,sx-30-width):sx+30;
    return {left,top:clamp(sy-60,72,Math.max(72,size.h-330)),width};
  },[editorAnchor?.x,editorAnchor?.y,view,size,compact,scale]);

  const stable=handlers;
  const crowded=useMemo(()=>crowdedHoles(board.components),[board.components]);
  const groupsNow=useMemo(()=>netGroups(board,switches),[board,switches]);
  const xrayOn=xray||lesson===4||lesson===5;
  const netOf=xrayOn&&hovered?groupsNow[hovered]:undefined;
  const lessonColors=useMemo(()=>lessonHoleColors(lesson),[lesson]);
  const netSize=netOf?HOLES.filter(h=>groupsNow[h.id]===netOf).length:0;
  const holeFill=(h:typeof HOLES[number])=>lessonColors[h.id]??(netOf&&groupsNow[h.id]===netOf?'#f6b25a':h.group===group?'#b7dfd7':'#c8c8bd');
  const describePoints=(a:string,b:string)=>{
    if((a===board.positive&&b===board.negative)||(a===board.negative&&b===board.positive))return 'Fuente de alimentación';
    const c=board.components.find(x=>x.kind!=='wire'&&x.kind!=='l293d'&&x.kind!=='bjt'&&((x.from===a&&x.to===b)||(x.from===b&&x.to===a)));
    return c?`${KIND_NAMES[c.kind]}${c.kind==='resistor'?` ${formatOhms(c.value)}`:''}`:'';
  };
  const shortcuts:Shortcut[]=useMemo(()=>[{id:'source',label:`Fuente · ${formatVolts(board.voltage)}`,a:board.positive,b:board.negative},...board.components.filter(c=>c.kind==='resistor'||c.kind==='motor'||c.kind==='led'||c.kind==='button'||c.kind==='switch').slice(0,10).map(c=>({id:c.id,label:`${KIND_NAMES[c.kind]}${c.kind==='resistor'?` ${formatOhms(c.value)}`:''} · ${holeName(c.from)}–${holeName(c.to)}`,a:c.from,b:c.to}))],[board]);
  const holeAt=(clientX:number,clientY:number)=>{const matrix=svg.current?.getScreenCTM();if(!matrix)return null;const point=new DOMPoint(clientX,clientY).matrixTransform(matrix.inverse());let best:string|null=null,nearest=15*15;for(const h of HOLES){const d=(h.x-point.x)**2+(h.y-point.y)**2;if(d<nearest){nearest=d;best=h.id;}}return best;};
  const moveChange=(m:{end:'from'|'to'|'body';hole:string|null})=>m.end==='from'?{from:m.hole??undefined}:m.end==='to'?{to:m.hole??undefined}:{anchor:m.hole??undefined};
  const relocation=moving&&moving.hole?relocate(board.components,moving.id,moveChange(moving)):null;
  const finishMove=()=>{const m=moving;setMoving(null);if(!m||!m.hole)return;const result=relocate(board.components,m.id,moveChange(m));if(!result.ok){lab.setMessage(result.error);return;}if(result.component.from!==board.components.find(c=>c.id===m.id)?.from||result.component.to!==board.components.find(c=>c.id===m.id)?.to)patch(m.id,{from:result.component.from,to:result.component.to});};
  const startMove=(event:React.PointerEvent,id:string,end:'from'|'to'|'body')=>{event.stopPropagation();event.preventDefault();try{(event.currentTarget as Element).setPointerCapture(event.pointerId);}catch{/* sin captura */}setSelected(id);setMoving({id,end,hole:null});};
  const ghostGeo=relocation?.ok?{c:relocation.component,a:HOLE_BY_ID.get(relocation.component.from)!,b:HOLE_BY_ID.get(relocation.component.to)!}:null;
  const moveGhost=moving?<g className="lab-ghost" pointerEvents="none" aria-hidden="true">{ghostGeo?(ghostGeo.c.kind==='l293d'?<IcShape a={ghostGeo.a} b={ghostGeo.b}/>:<ComponentShape c={ghostGeo.c} a={ghostGeo.a} b={ghostGeo.b} current={0} closed={ghostGeo.c.closed} straight={straight} previewValue={null}/>):null}{moving.hole&&HOLE_BY_ID.get(moving.hole)?<circle className={relocation?.ok?'lab-drop-ok':'lab-drop-bad'} cx={HOLE_BY_ID.get(moving.hole)!.x} cy={HOLE_BY_ID.get(moving.hole)!.y} r="11"/>:null}</g>:null;
  const moveHandles=active&&tool==='select'&&!running?<g className="lab-handles">{active.c.kind==='bjt'?<circle className="lab-handle" role="button" tabIndex={0} aria-label="Mover el transistor: arrastra o usa «Mover sin arrastrar»" cx={(active.a.x+active.b.x)/2+22} cy={active.a.y-30} r="8" onPointerDown={e=>startMove(e,active.c.id,'body')} onPointerMove={e=>{if(moving)setMoving(m=>m&&{...m,hole:holeAt(e.clientX,e.clientY)});}} onPointerUp={finishMove} onPointerCancel={()=>setMoving(null)}/>:active.c.kind==='l293d'?<circle className="lab-handle" role="button" tabIndex={0} aria-label="Mover el L293D: arrastra o usa «Mover sin arrastrar»" cx={active.a.x-19} cy={(active.a.y+active.b.y)/2} r="8" onPointerDown={e=>startMove(e,active.c.id,'body')} onPointerMove={e=>{if(moving)setMoving(m=>m&&{...m,hole:holeAt(e.clientX,e.clientY)});}} onPointerUp={finishMove} onPointerCancel={()=>setMoving(null)}/>:(['from','to'] as const).map(end=>{const h=end==='from'?active.a:active.b;return <circle key={end} className="lab-handle" role="button" tabIndex={0} aria-label={`Mover el ${end==='from'?'primer':'segundo'} extremo: arrastra o usa «Mover sin arrastrar»`} cx={h.x} cy={h.y} r="8" onPointerDown={e=>startMove(e,active.c.id,end)} onPointerMove={e=>{if(moving)setMoving(m=>m&&{...m,hole:holeAt(e.clientX,e.clientY)});}} onPointerUp={finishMove} onPointerCancel={()=>setMoving(null)}/>;})}</g>:null;
  const toScreen=(id:string|null):Pt|null=>{const h=id?HOLE_BY_ID.get(id):undefined;return h?{x:(h.x-view.x)*scale,y:(h.y-view.y)*scale}:null;};
  /* Posiciones en vivo para los cables: leen la vista actual del SVG, que el gesto de desplazar o acercar escribe sin pasar por React. */
  const live=useRef({dial,collapsed:meterCollapsed,probes:probeHoles,drag:null as {which:0|1;pt:Pt;dx:number;dy:number}|null});live.current={dial,collapsed:meterCollapsed,probes:probeHoles,drag:live.current.drag};
  const frameOf=():LeadFrame|null=>{
    const box=wrap.current?.getBoundingClientRect(),vb=svg.current?.viewBox.baseVal,face=wrap.current?.querySelector('.lab-dmm-body,.lab-dmm-pill');
    if(!box||!vb||!vb.width||!face)return null;
    const fr=face.getBoundingClientRect();if(!fr.width)return null;
    const rel={left:fr.left-box.left,top:fr.top-box.top,width:fr.width,height:fr.height},anchors=jackAnchors(rel,live.current.dial,live.current.collapsed),k=box.width/vb.width;
    const parked:[Pt,Pt]=[{x:rel.left-34,y:rel.top+70},{x:rel.left-34,y:rel.top+150}];
    const tip=(i:0|1):Pt=>{const d=live.current.drag;if(d&&d.which===i)return d.pt;const h=live.current.probes[i]?HOLE_BY_ID.get(live.current.probes[i]!):undefined;return h?{x:(h.x-vb.x)*k,y:(h.y-vb.y)*k}:parked[i];};
    return {jacks:[anchors.red,anchors.black],tips:[tip(0),tip(1)]};
  };
  const [snapHole,setSnapHole]=useState<string|null>(null),snapPoint=toScreen(snapHole);
  const grabProbe=(which:0|1,e:React.PointerEvent)=>{
    e.stopPropagation();e.preventDefault();const box=wrap.current?.getBoundingClientRect(),frame=frameOf();if(!box||!frame)return;
    try{(e.currentTarget as Element).setPointerCapture(e.pointerId);}catch{/* sin captura */}
    const tip=frame.tips[which];live.current.drag={which,pt:tip,dx:tip.x-(e.clientX-box.left),dy:tip.y-(e.clientY-box.top)};setDragProbe(live.current.drag);
  };
  const moveProbe=(e:React.PointerEvent)=>{
    const d=live.current.drag,box=wrap.current?.getBoundingClientRect();if(!d||!box)return;
    d.pt={x:e.clientX-box.left+d.dx,y:e.clientY-box.top+d.dy};
    const hole=holeAt(box.left+d.pt.x,box.top+d.pt.y);setSnapHole(previous=>previous===hole?previous:hole);
  };
  const dropProbe=()=>{const d=live.current.drag;if(!d)return;const target=snapHole;live.current.drag=null;setDragProbe(null);setSnapHole(null);setProbeHoles(h=>d.which===0?[target,h[1]]:[h[0],target]);setPending(null);};
  const hint=moving?(relocation?(relocation.ok?'Suelta para mover aquí':relocation.error):'Arrastra hasta el orificio de destino'):netOf&&hovered?`Red de ${holeName(hovered)}: ${netSize} orificios unidos eléctricamente (columnas, rieles, puentes e interruptores cerrados)`:tool==='positive'?'Selecciona dónde conectar el polo positivo':tool==='negative'?'Selecciona dónde conectar el polo negativo':tool==='pan'?'Arrastra para mover la vista · Ctrl + rueda acerca':tool==='erase'?'Selecciona un componente para retirarlo · Deshacer lo recupera':tool==='measure'?pending?`Punto A ${holeName(pending)} · elige el punto B`:'Medir: elige el punto A y el punto B':isPlacement(tool)?pending?`Desde ${holeName(pending)} · selecciona el segundo orificio`:`${(LIBRARY.find(i=>i.kind===tool)?.name??"Componente")}: elige dos orificios`:running?'Simulación activa · opera interruptores y mide':'Selecciona un componente para editar su valor';
  const holeLayer=useMemo(()=>HOLES.map(h=><g key={h.id} className="lab-hole" data-hole={h.id} role="button" tabIndex={focusHole===h.id?0:-1} aria-label={`Orificio ${holeName(h.id)}`} onClick={()=>stable.current.clickHole(h.id)} onPointerEnter={()=>stable.current.hover(h.id)} onPointerLeave={()=>stable.current.hover(null)} onFocus={()=>{setFocusHole(h.id);stable.current.hover(h.id);}} onBlur={()=>stable.current.hover(null)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();stable.current.clickHole(h.id);return;}const next=neighborHole(h.id,e.key);if(next){e.preventDefault();e.stopPropagation();setFocusHole(next);requestAnimationFrame(()=>(document.querySelector(`[data-hole="${next}"]`) as SVGElement|null)?.focus());}}}><circle cx={h.x} cy={h.y} r="9" fill="transparent"/><rect x={h.x-4.5} y={h.y-4.5} width="9" height="9" rx="2" fill={holeFill(h)} stroke={crowded[h.id]?'#d1453b':pending===h.id?'#e8a234':h.group===group?'#4d9e91':'#eeeee8'} strokeWidth={crowded[h.id]?2.6:pending===h.id?3:1}/><circle cx={h.x} cy={h.y} r="2.4" fill="#3f4341"/></g>),[group,pending,crowded,lessonColors,netOf,groupsNow,focusHole]);
  const specById=new Map(specs.map(s=>[s.id,s]));
  const hoverHole=hovered?HOLE_BY_ID.get(hovered):undefined,pendingHole=pending?HOLE_BY_ID.get(pending):undefined;
  const hitsOn=tool==='select'||tool==='erase'||tool==='measure'||tool==='pan';

  return <div className={`lab-canvas-workspace tool-${tool} ${diagram?'has-viewer':''}`} ref={wrap} data-tool={tool}>
    <svg ref={svg} className="lab-board-svg" viewBox={firstView.current} role="group" tabIndex={0} aria-label="Protoboard de 30 columnas con rieles partidos. Flechas para desplazar, más y menos para acercar, Inicio para ajustar." onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onClickCapture={e=>{if(justDragged.current){e.stopPropagation();e.preventDefault();justDragged.current=false;}}}
      onKeyDown={e=>{if(e.target!==e.currentTarget)return;const step=view.w*.06,moves:Record<string,[number,number]>={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]};if(e.key==='Home'){e.preventDefault();fit(true);}else if(e.key==='+'||e.key==='='){e.preventDefault();zoomBy(1/1.25);}else if(e.key==='-'){e.preventDefault();zoomBy(1.25);}else if(moves[e.key]){e.preventDefault();setView(v=>({...v,x:v.x+moves[e.key][0],y:v.y+moves[e.key][1]}));}}}>
      <BoardArt/>
      {xrayOn?<BoardStrips/>:null}
      {lesson===1?<rect className="lab-lesson-channel" x="28" y="221" width="754" height="31" rx="5" pointerEvents="none"/>:null}
      {holeLayer}
      {pendingHole&&hoverHole&&hoverHole.id!==pendingHole.id?<line className="lab-pending-preview" x1={pendingHole.x} y1={pendingHole.y} x2={hoverHole.x} y2={hoverHole.y} pointerEvents="none"/>:null}
      {[...geo].sort((x,y)=>(x.c.kind==='wire'?0:1)-(y.c.kind==='wire'?0:1)).map(({c,a,b})=>{
        const closed=switches[c.id]??(c.kind==='button'?false:c.closed),isSelected=selected===c.id,amps=result?.amps[c.id]??0,dist=Math.hypot(b.x-a.x,b.y-a.y)||1,ux=(b.x-a.x)/dist,uy=(b.y-a.y)/dist,inset=dist>30?12:0;
        const top=Math.min(a.y,b.y)-35,wirePath=straight?`M${a.x} ${a.y} L${b.x} ${b.y}`:`M${a.x} ${a.y} C${a.x} ${top} ${b.x} ${top} ${b.x} ${b.y}`,isIc=c.kind==='l293d',isBjt=c.kind==='bjt';
        const detail=c.kind==='resistor'?` ${formatOhms(c.value)}`:c.kind==='led'?` caída ${formatVolts(c.value)}`:c.kind==='switch'?closed?' cerrado':' abierto':c.kind==='button'?closed?' presionado':' suelto':c.kind==='motor'?` ${formatOhms(c.value)} de bobinado`:c.kind==='diode'?` ánodo ${holeName(c.from)}, cátodo ${holeName(c.to)}`:c.kind==='bjt'?` ${c.polarity==='pnp'?'PNP':'NPN'} ganancia ${c.value}, emisor ${holeName(c.from)}, base ${holeName(bjtBase(c.from,c.to)??c.from)}, colector ${holeName(c.to)}`:'';
        const press=(down:boolean)=>{if(running&&c.kind==='button')lab.setProtoSwitch(c.id,down);};
        return <g key={c.id} className={`lab-proto-component ${isSelected?'selected':''} ${moving?.id===c.id?'is-moving':''}`} role="button" tabIndex={0} aria-pressed={isSelected} aria-label={`${KIND_NAMES[c.kind]}${detail}, ${isIc?`pin 1 en ${holeName(c.from)}`:isBjt?'':`${holeName(c.from)} a ${holeName(c.to)}`}`} onClick={()=>activate(c)}
          onPointerDown={()=>press(true)} onPointerUp={()=>press(false)} onPointerLeave={()=>press(false)} onPointerCancel={()=>press(false)}
          onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(c.kind==='button'&&running)press(true);else activate(c);}}} onKeyUp={e=>{if((e.key==='Enter'||e.key===' ')&&c.kind==='button')press(false);}}>
          {isSelected?(isBjt?<rect className="lab-halo-box" x={(a.x+b.x)/2-17} y={a.y-38} width="34" height="42" rx="8"/>:isIc?<rect className="lab-halo-box" x={a.x-16} y={b.y+2} width={b.x-a.x+32} height={a.y-b.y-4} rx="6"/>:c.kind==='wire'?<path d={wirePath} className="lab-halo" fill="none"/>:<line className="lab-halo" x1={a.x} y1={a.y} x2={b.x} y2={b.y}/>):null}
          <g pointerEvents="none">{damaged[c.id]?<BurntMark a={a} b={b} kind={c.kind}/>:null}{isIc?<IcShape a={a} b={b} state={result?.ics[c.id]}/>:<><ComponentShape c={c} a={a} b={b} current={amps} closed={closed} straight={straight} previewValue={preview!==null&&isSelected&&c.kind==='resistor'?preview:null}/><circle cx={a.x} cy={a.y} r="3" fill="#3e4342"/><circle cx={b.x} cy={b.y} r="3" fill="#3e4342"/></>}</g>
          {hitsOn?(isBjt?<rect className="lab-proto-hit-box" x={(a.x+b.x)/2-15} y={a.y-36} width="30" height="23"/>:isIc?<rect className="lab-proto-hit-box" x={a.x-12} y={b.y+8} width={b.x-a.x+24} height={a.y-b.y-16}/>:c.kind==='wire'?<path className="lab-proto-hit" d={wirePath} fill="none" pathLength={100} strokeDasharray="0 7 86 7"/>:<line className="lab-proto-hit" x1={a.x+ux*inset} y1={a.y+uy*inset} x2={b.x-ux*inset} y2={b.y-uy*inset}/>):null}
        </g>;
      })}
      {moveGhost}
      {moveHandles}
      {labels.map(p=>{
        const spec=specById.get(p.id);if(!spec)return null;
        const widths=spec.parts.map(part=>part.text.length*6.4+14),total=widths.reduce((s,w)=>s+w,0)+(widths.length-1)*4;
        const tx=clamp(p.anchor.x,p.x-p.w/2,p.x+p.w/2),ty=p.anchor.y<p.y?p.y-9*labelScale:p.y+9*labelScale,far=Math.abs(ty-p.anchor.y)>14;
        let offset=-total/2;
        return <g key={p.id} className="lab-label-layer">
          {far?<line className="lab-leader" x1={p.anchor.x} y1={p.anchor.y} x2={tx} y2={ty}/>:null}
          <g className={`lab-label ${spec.component?'clickable':''}`} data-label={p.id} transform={`translate(${p.x} ${p.y}) scale(${labelScale})`} aria-hidden="true" onClick={spec.component?()=>{const c=board.components.find(x=>x.id===spec.component);if(c&&tool!=='erase'&&tool!=='pan')openEditor(c.id);}:undefined}>
            {spec.parts.map((part,i)=>{const x=offset;offset+=widths[i]+4;return <g key={i} className={`lab-pill ${part.tone}`}><rect x={x} y="-9" width={widths[i]} height="18" rx="5"/><text x={x+widths[i]/2} y="4" textAnchor="middle">{part.text}</text></g>;})}
          </g>
        </g>;
      })}
      {(['positive','negative'] as const).map(key=>{const h=HOLE_BY_ID.get(board[key])!;return <circle key={key} className={`lab-pole ${key}`} cx={h.x} cy={h.y} r="9.5" fill="none" pointerEvents="none"/>;})}
      {probeHoles.map((id,i)=>{const h=id?HOLE_BY_ID.get(id):undefined;return h?<circle key={`${id}-${i}`} className={`lab-probe ${i===0?'a':'b'}`} cx={h.x} cy={h.y} r="11.5" fill="none" pointerEvents="none"/>:null;})}
    </svg>

    {panel?<div className="lab-left-stack">
      {panel==='learn'?<Card className="lab-learn-card" title="Cómo funciona" summary={<GraduationCap size={16}/>} open onToggle={()=>setPanel(null)}>
        <ol className="lab-lesson-list">{LESSONS.map((l,i)=><li key={l.title}><button type="button" aria-pressed={lesson===i} onClick={()=>{setLesson(lesson===i?null:i);if(i===4)setXray(true);}}><b>{i+1}</b><span>{l.title}</span></button></li>)}</ol>
        <p className="lab-lesson-text" aria-live="polite">{lesson===null?'Elige un paso para verlo resaltado en la placa. Con el ojo de la barra de zoom ves las láminas metálicas por dentro.':LESSONS[lesson].text}</p>
      </Card>:null}
      {panel==='diagrams'?<Card className="lab-diagrams-card" title="Diagramas de la clase" summary={<span className="lab-count">{CLASS_DIAGRAMS.length}</span>} open onToggle={()=>setPanel(null)}>
        <ul className="lab-diagram-list">{CLASS_DIAGRAMS.map(d=><li key={d.id}><button type="button" aria-pressed={diagram===d.id} onClick={()=>setDiagram(diagram===d.id?null:d.id)}><img src={d.src} alt="" loading="lazy" draggable={false}/><span>{d.title}</span></button></li>)}</ul>
        <button type="button" className="lab-wide" disabled={running||!lab.ready} onClick={()=>{lab.add('hbridge');}}>Cargar la Práctica 2 armada</button>
        <button type="button" className="lab-wide" disabled={running||!lab.ready} onClick={()=>{lab.add('hbridge-bjt');}}>Cargar la Práctica 1 armada</button>
        <small>Crea un proyecto nuevo con el circuito del diagrama; tu proyecto actual no se modifica.</small>
      </Card>:null}
      {panel==='names'?<Card className="lab-names-card" title="Puntos por nombre" summary={<Keyboard size={16}/>} open onToggle={()=>setPanel(null)}>
        <form className="lab-hole-form" onSubmit={e=>{e.preventDefault();const from=parseHoleId(fromText),to=parseHoleId(toText);if(!from||!to){lab.setMessage('Usa un orificio como a5, f10, top+:1 o bottom-:20 (columnas 1 a 30).');return;}applyPoints(from,to);}}><label>Desde<input aria-label="Orificio de origen" value={fromText} maxLength={20} onChange={e=>setFromText(e.target.value)} placeholder="a5"/></label><label>Hasta<input aria-label="Orificio de destino" value={toText} maxLength={20} onChange={e=>setToText(e.target.value)} placeholder="f10"/></label><button type="submit">{tool==='measure'?'Medir entre estos puntos':'Aplicar herramienta'}</button></form>
        <details className="lab-help"><summary>Conexiones internas y límites</summary><p>Cada columna une a–e y, por separado, f–j. El canal central los separa. Los rieles se interrumpen entre las columnas 15 y 16. El modelo es una red de corriente continua con resistencias, LED, transistores NPN, motor y L293D; capacitores y microcontroladores todavía no están incluidos.</p></details>
      </Card>:null}
    </div>:null}

    {meterShown?<>
      <MeterLeads size={size} getFrame={frameOf} snap={snapPoint} onGrab={grabProbe} onMove={moveProbe} onDrop={dropProbe}/>
      <MeterDevice mode={dial} onMode={setDial} display={display} held={!!held} onHold={()=>setHeld(h=>h?null:liveDisplay)} hasProbes={!!measurement} collapsed={meterCollapsed} onCollapsed={setMeterCollapsed} logCount={board.log?.length??0} logOpen={logOpen} onLog={()=>setLogOpen(open=>!open)} onRect={rect=>setDeviceRect(previous=>previous&&rect&&Math.abs(previous.left-rect.left)<.5&&Math.abs(previous.top-rect.top)<.5&&Math.abs(previous.width-rect.width)<.5&&Math.abs(previous.height-rect.height)<.5?previous:rect)}
        shortcuts={shortcuts} onShortcut={sc=>{setMeasurement([sc.a,sc.b]);setPending(null);}}
        onRecord={()=>{if(!display.record||!measurement)return;lab.addMeasurement({kind:display.record.kind,a:measurement[0],b:measurement[1],value:display.record.value,label:describePoints(measurement[0],measurement[1])});setLogOpen(true);}}/>
    </>:null}
    {diagram?<DiagramViewer diagram={CLASS_DIAGRAMS.find(d=>d.id===diagram)!} onSelect={setDiagram} onClose={()=>setDiagram(null)}/>:null}
    <div className="lab-right-stack">
      <Card className="lab-source-card" title="Fuente DC" summary={<span className="lab-big">{formatVolts(board.voltage)} DC</span>} open={sourceOpen} onToggle={()=>setSourceOpen(!sourceOpen)}>
        <SupplyEditor voltage={board.voltage} running={running} onApply={v=>update(p=>({...p,breadboard:{...p.breadboard,voltage:v}}))}/>
        <label className="lab-check"><input type="checkbox" checked={!!board.realistic} disabled={running} onChange={e=>update(p=>({...p,breadboard:{...p.breadboard,realistic:e.target.checked}}))}/><span>Componentes reales: resistencias con ±5 %, β y Vf variables</span></label>
        <div className="lab-poles"><button type="button" aria-pressed={tool==='positive'} disabled={running} onClick={()=>choose('positive')}>Ubicar polo +</button><button type="button" aria-pressed={tool==='negative'} disabled={running} onClick={()=>choose('negative')}>Ubicar polo −</button></div>
        <small>+ en {holeName(board.positive)} · − en {holeName(board.negative)}</small>
      </Card>
      {logOpen?<Card className="lab-log-card" title="Mediciones" summary={<span className="lab-count">{board.log?.length??0}</span>} open onToggle={()=>setLogOpen(false)}>
        <LogBody log={board.log??[]} notes={board.notes??''} onRemove={lab.removeMeasurement} onLabel={lab.labelMeasurement} onClearAll={lab.clearMeasurements} onNotes={lab.setNotes} onNotice={lab.setMessage}/>
      </Card>:null}
    </div>

    {active&&editing?<div className="lab-editor-anchor" style={popoverStyle}><ValueEditor key={active.c.id} component={active.c} position={`${holeName(active.c.from)} → ${holeName(active.c.to)}`} running={running} closed={switches[active.c.id]??active.c.closed} amps={result?.amps[active.c.id]} ic={result?.ics[active.c.id]} bjt={result?.bjts[active.c.id]} failure={damaged[active.c.id]} onApply={value=>patch(active.c.id,value)} onSwitch={closed=>lab.setProtoSwitch(active.c.id,closed)} onSwap={()=>patch(active.c.id,{from:active.c.to,to:active.c.from})} onRemove={()=>remove(active.c.id)} onClose={closeEditor} onPreview={setPreview} onMove={change=>{const r=relocate(board.components,active.c.id,change);if(!r.ok)return r.error;patch(active.c.id,{from:r.component.from,to:r.component.to});return null;}}/></div>:null}

    <div className="lab-alerts" aria-live="polite">{Object.keys(crowded).length?<ul className="lab-board-warnings"><li>{Object.keys(crowded).length===1?'Dos patas comparten el orificio':'Hay patas que comparten orificio'} {Object.keys(crowded).slice(0,4).map(holeName).join(', ')}. En una protoboard real cada orificio admite una sola pata: usa otro orificio de la misma columna.</li></ul>:null}{Object.keys(damaged).length?<ul className="lab-failures" role="alert">{Object.entries(damaged).map(([id,why])=>{const c=board.components.find(x=>x.id===id);return <li key={id}><strong>{id==='meter'?'Fusible del multímetro fundido':`${c?KIND_NAMES[c.kind]:'Pieza'} dañado${c?` (${c.kind==='l293d'?`pin 1 en ${holeName(c.from)}`:`${holeName(c.from)} – ${holeName(c.to)}`})`:''}`}</strong> {why}</li>;})}<li className="lab-failure-note">Se reponen al detener la simulación.</li></ul>:null}{result?.fault?<p className="lab-error" role="alert">{result.fault}</p>:null}{result?.warnings.length?<ul className="lab-board-warnings">{[...new Set(result.warnings)].map(w=><li key={w}>{w}</li>)}</ul>:null}</div>
    <div className="lab-hint" role="status">{hint}{pending?<button type="button" onClick={()=>setPending(null)}>Cancelar</button>:null}</div>
    <FloatingDock items={dock} label="Herramientas de la protoboard"/>
    <ZoomBar percent={Math.round(scale*100)} onZoomIn={()=>zoomBy(1/1.25)} onZoomOut={()=>zoomBy(1.25)} onFit={()=>fit(true)} xray={xrayOn} onXray={()=>{setXray(!xray);if(lesson===4||lesson===5)setLesson(null);}} straight={straight} onStraight={()=>{const next=!straight;setStraight(next);try{localStorage.setItem('panellab-straight-wires',next?'1':'0');}catch{/* sin almacenamiento */}}}/>
  </div>;
}
