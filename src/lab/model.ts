import type {Board as EquipmentBoard} from './equipment/model';
export type Memory = Record<string, boolean | number>;
export type Tool = 'schematic' | 'plc' | 'hmi' | 'process' | 'breadboard' | 'geogebra' | 'temperature' | 'detectors' | 'equipment' | 'soldering';
export const TOOLS: {id: Tool; name: string; description: string}[] = [
  {id:'schematic',name:'Esquemas',description:'Dibuja y prueba circuitos de mando.'},
  {id:'equipment',name:'Tableros de control',description:'Distribuye equipos en el gabinete, cablea y programa PLC o relés lógicos.'},
  {id:'plc',name:'PLC',description:'Programa contactos, bobinas y temporizadores.'},
  {id:'hmi',name:'HMI',description:'Crea una pantalla para operar tus señales.'},
  {id:'process',name:'Procesos',description:'Controla el llenado de un tanque.'},
  {id:'breadboard',name:'Protoboard',description:'Monta un circuito y mide tensión y corriente.'},
  {id:'soldering',name:'Soldadura',description:'Prepara herramientas, suelda el DB9 HMI–PLC y comprueba el cable.'},
  {id:'temperature',name:'Temperatura',description:'Mide termocupla y Pt100 en un horno de pozo seco, con transmisor.'},
  {id:'detectors',name:'Detectores',description:'Mide detectores inductivo, capacitivo y fotoeléctrico y conéctalos a un PLC.'},
  {id:'geogebra',name:'GeoGebra',description:'Explora funciones, geometría, cálculo y matrices libremente o con una lección.'},
];
/** Herramientas de un mismo proyecto de automatización: el PLC manda al tablero, la HMI opera las mismas señales y el proceso devuelve el nivel. */
export const TOOL_GROUPS:{id:string;name:string;tools:Tool[]}[]=[{id:'automation',name:'Automatización',tools:['equipment','plc','hmi','process']}];
export type DeviceKind = 'supply'|'no'|'nc'|'coil'|'contact'|'lamp'|'motor'|'output'|'breaker'|'fuse'|'emergency'|'selector'|'contact-nc'|'terminal'|'buzzer';
export const DEVICES: {kind: DeviceKind; name: string; prefix: string}[] = [
  {kind:'supply',name:'Fuente 24 V DC',prefix:'G'}, {kind:'no',name:'Pulsador NA',prefix:'S'},
  {kind:'nc',name:'Pulsador NC',prefix:'S'}, {kind:'coil',name:'Bobina de relé',prefix:'K'},
  {kind:'contact',name:'Contacto auxiliar NA',prefix:'K'}, {kind:'lamp',name:'Piloto',prefix:'H'},
  {kind:'motor',name:'Motor DC ideal',prefix:'M'}, {kind:'output',name:'Contacto de salida PLC',prefix:'Q'},
  {kind:'breaker',name:'Interruptor de mando DC',prefix:'Q'}, {kind:'fuse',name:'Portafusible de mando',prefix:'FU'},
  {kind:'emergency',name:'Parada de emergencia NC',prefix:'S'}, {kind:'selector',name:'Selector de dos posiciones',prefix:'SA'},
  {kind:'contact-nc',name:'Contacto auxiliar NC',prefix:'K'}, {kind:'terminal',name:'Bornera de paso',prefix:'X'},
  {kind:'buzzer',name:'Zumbador 24 V DC',prefix:'HA'},
];
export type Device = {id:string;kind:DeviceKind;tag:string;x:number;y:number;signal:string;closed?:boolean};
export const isMaintainedControl=(kind:DeviceKind)=>['breaker','fuse','emergency','selector'].includes(kind);
export const initialControlClosed=(device:Device)=>device.closed??(device.kind==='fuse'||device.kind==='emergency');
export function deviceClosed(device:Device,pressed:Record<string,boolean>,controls:Record<string,boolean>,memory:Memory,relays:Record<string,boolean>):boolean {
  if(isMaintainedControl(device.kind))return controls[device.id]??initialControlClosed(device);
  switch(device.kind){case'no':return !!pressed[device.id];case'nc':return !pressed[device.id];case'contact':return !!relays[device.tag];case'contact-nc':return !relays[device.tag];case'output':return !!memory[device.signal];case'terminal':return true;default:return false;}
}
export const verticalDevice=(kind:DeviceKind)=>kind==='supply'||kind==='breaker'||kind==='fuse';
export function devicePinOffset(kind:DeviceKind,pin:0|1):{x:number;y:number}{return verticalDevice(kind)?{x:0,y:pin===0?-48:48}:{x:pin===0?-48:48,y:0};}
export function devicePinLabel(kind:DeviceKind,pin:0|1):string {
  const names:Partial<Record<DeviceKind,[string,string]>>={supply:['+','−'],coil:['A1','A2'],contact:['13','14'],'contact-nc':['21','22'],nc:['1','2'],emergency:['1','2'],no:['3','4'],selector:['3','4'],buzzer:['+','−']};
  return (names[kind]??['1','2'])[pin];
}
export type End = {device:string;pin:0|1};
export type Wire = {id:string;from:End;to:End};
export type Contact = {address:string;negated:boolean};
export type CoilMode = 'coil'|'set'|'reset'|'ton'|'tof'|'ctu';
export type Rung = {id:string;comment:string;branches:Contact[][];output:string;mode:CoilMode;preset:number};
export type Tag = {address:string;name:string;type:'bool'|'number';initial:boolean|number};
export type Widget = {id:string;kind:'toggle'|'lamp'|'number'|'bar';label:string;address:string;x:number;y:number;max:number};
export type ProtoKind = 'wire'|'resistor'|'led'|'switch'|'button'|'motor'|'l293d'|'bjt'|'diode';
export type ProtoComponent = {id:string;kind:ProtoKind;from:string;to:string;value:number;closed:boolean;color:string;polarity?:'pnp'};
export type Measurement = {id:string;kind:'voltage'|'current'|'resistance'|'continuity';a:string;b:string;value:number|null;label:string;at:string;sourceVoltage?:number};
export type BreadboardPower={plugged:boolean;enabled:boolean;redConnected:boolean;blackConnected:boolean};
export const DEFAULT_BOARD_POWER:BreadboardPower={plugged:false,enabled:false,redConnected:false,blackConnected:false};
export const boardPowered=(p:BreadboardPower)=>p.plugged&&p.enabled&&p.redConnected&&p.blackConnected;
export type LabProject = {
  format:'panellab-laboratory';version:2;id:string;name:string;
  schematic:{devices:Device[];wires:Wire[]};
  plc:{language:'ladder'|'st';tags:Tag[];rungs:Rung[];source:string};
  hmi:{widgets:Widget[]};
  process:{capacity:number;initialLevel:number;inflow:number;outflow:number;low:number;high:number;pumpSignal:string;lowSignal:string;highSignal:string;levelSignal:string};
  breadboard:{power?:BreadboardPower;voltage:number;positive:string;negative:string;components:ProtoComponent[];realistic?:boolean;log?:Measurement[];notes?:string};
  equipment?:EquipmentBoard;
};
export const uid = (prefix='id') => `${prefix}-${crypto.randomUUID()}`;
export const addressOK = (s:string) => /^(?:[IQM]\d+\.[0-7]|[TC]\d+|(?:AI|AQ|MW)\d+)$/.test(s);
export const pinKey = (end:End) => `${end.device}:${end.pin}`;
export const initialMemory = (p:LabProject):Memory => Object.fromEntries(p.plc.tags.map(t=>[t.address,t.initial]));

export function newProject(kind:'motor'|'tank'|'blank'|'hbridge'|'hbridge-bjt'='motor'):LabProject {
  const empty=kind==='blank'||kind==='hbridge'||kind==='hbridge-bjt';
  const devices:Device[] = [
    {id:'g1',kind:'supply',tag:'G1',x:85,y:115,signal:''},
    {id:'stop',kind:'nc',tag:'S0',x:260,y:115,signal:'I0.1'},
    {id:'start',kind:'no',tag:'S1',x:450,y:115,signal:'I0.0'},
    {id:'aux',kind:'contact',tag:'K1',x:450,y:285,signal:''},
    {id:'k1',kind:'coil',tag:'K1',x:660,y:115,signal:''},
    {id:'h1',kind:'lamp',tag:'H1',x:660,y:285,signal:''},
  ];
  const ends=(device:string,pin:0|1):End=>({device,pin});
  const wire=(id:string,a:string,ap:0|1,b:string,bp:0|1):Wire=>({id,from:ends(a,ap),to:ends(b,bp)});
  const wires:Wire[]=[wire('w1','g1',0,'stop',0),wire('w2','stop',1,'start',0),wire('w3','start',1,'k1',0),wire('w4','k1',1,'g1',1),wire('w5','stop',1,'aux',0),wire('w6','aux',1,'k1',0),wire('w7','h1',0,'k1',0),wire('w8','h1',1,'g1',1)];
  const tags:Tag[]=[
    {address:'I0.0',name:'Marcha',type:'bool',initial:false}, {address:'I0.1',name:'Paro pulsado',type:'bool',initial:false},
    {address:'I0.2',name:'Nivel bajo',type:'bool',initial:true}, {address:'I0.3',name:'Nivel alto',type:'bool',initial:false},
    {address:'Q0.0',name:'Bomba / marcha',type:'bool',initial:false}, {address:'M0.0',name:'Memoria auxiliar',type:'bool',initial:false},
    {address:'T1',name:'Temporizador',type:'bool',initial:false}, {address:'C1',name:'Contador',type:'bool',initial:false},
    {address:'AI0',name:'Nivel del tanque (%)',type:'number',initial:20},
  ];
  const rungs:Rung[]=kind==='tank' ? [
    {id:'low',comment:'Nivel bajo: memorizar marcha de la bomba',branches:[[{address:'I0.2',negated:false}]],output:'Q0.0',mode:'set',preset:1},
    {id:'high',comment:'Nivel alto o paro: detener bomba',branches:[[{address:'I0.3',negated:false}],[{address:'I0.1',negated:false}]],output:'Q0.0',mode:'reset',preset:1},
  ] : [{id:'r1',comment:'Marcha con retención y prioridad de paro',branches:[[{address:'I0.0',negated:false},{address:'I0.1',negated:true}],[{address:'Q0.0',negated:false},{address:'I0.1',negated:true}]],output:'Q0.0',mode:'coil',preset:1}];
  return {format:'panellab-laboratory',version:2,id:uid('project'),name:kind==='hbridge'?'Puente H con L293D':kind==='hbridge-bjt'?'Puente H con transistores':kind==='blank'?'Proyecto nuevo':kind==='tank'?'Llenado automático':'Marcha y retención',
    schematic:empty?{devices:[],wires:[]}:{devices,wires},
    plc:{language:'ladder',tags,rungs:empty?[]:rungs,source:'IF I0.1 THEN\n  Q0.0 := FALSE;\nELSE\n  Q0.0 := I0.0 OR Q0.0;\nEND_IF;'},
    hmi:{widgets:empty?[]:[
      {id:'hm1',kind:'toggle',label:'Marcha',address:'I0.0',x:45,y:65,max:100},
      {id:'hm2',kind:'toggle',label:'Paro',address:'I0.1',x:250,y:65,max:100},
      {id:'hm3',kind:'lamp',label:'Bomba en marcha',address:'Q0.0',x:455,y:65,max:100},
      {id:'hm4',kind:'bar',label:'Nivel del tanque',address:'AI0',x:45,y:260,max:100},
      {id:'hm5',kind:'number',label:'Nivel (%)',address:'AI0',x:455,y:260,max:100},
    ]},
    process:{capacity:100,initialLevel:20,inflow:6,outflow:1,low:20,high:80,pumpSignal:'Q0.0',lowSignal:'I0.2',highSignal:'I0.3',levelSignal:'AI0'},
    breadboard:kind==='hbridge-bjt'?{voltage:12,positive:'top+:1',negative:'bottom-:1',components:[
      ...([['bj-q2','c:9','c:11'],['bj-q1','c:14','c:16'],['bj-q3','h:9','h:11'],['bj-q4','h:14','h:16']] as const).map(([id,from,to])=>({id,kind:'bjt' as const,from,to,value:100,closed:true,color:'#1f2327'})),
      ...([['bj-r1','b:4','b:7'],['bj-r2','g:4','g:7'],['bj-r3','b:15','b:19'],['bj-r4','g:15','g:19']] as const).map(([id,from,to])=>({id,kind:'resistor' as const,from,to,value:1000,closed:true,color:'#0f766e'})),
      {id:'bj-s1',kind:'button',from:'a:1',to:'d:4',value:0,closed:false,color:'#d94848'},
      {id:'bj-s2',kind:'button',from:'f:1',to:'i:4',value:0,closed:false,color:'#d94848'},
      {id:'bj-m',kind:'motor',from:'c:23',to:'c:27',value:40,closed:true,color:'#4b5563'},
      ...([['bj-p1','top+:11','a:11'],['bj-p2','top+:17','a:16'],['bj-supply1','top+:2','e:1'],['bj-supply2','top+:3','j:1'],['bj-positive-rail','top+:15','top+:16'],
      ['bj-g1','bottom-:9','j:9'],['bj-g2','bottom-:14','j:14'],['bj-negative-rail','bottom-:15','bottom-:16'],
      ['bj-ma','a:9','f:11'],['bj-ma-motor','g:11','a:23'],['bj-mb','a:14','f:16'],['bj-mb-motor','g:16','a:27'],
      ['bj-input1a','a:7','a:10'],['bj-input1b','e:4','j:19'],['bj-input2a','j:4','a:19'],['bj-input2b','j:7','j:10']] as const).map(([id,from,to])=>({id,kind:'wire' as const,from,to,value:0,closed:true,color:'#0f766e'})),
    ]}:kind==='hbridge'?{voltage:5,positive:'top+:1',negative:'bottom-:1',components:[
      {id:'hb-ic',kind:'l293d',from:'f:10',to:'e:17',value:0,closed:true,color:'#2b3035'},
      {id:'hb-s1',kind:'button',from:'e:2',to:'f:5',value:0,closed:false,color:'#d94848'},
      {id:'hb-s2',kind:'button',from:'e:24',to:'f:27',value:0,closed:false,color:'#d94848'},
      {id:'hb-m',kind:'motor',from:'h:12',to:'h:15',value:40,closed:true,color:'#4b5563'},
      {id:'hb-pull1',kind:'resistor',from:'i:11',to:'i:7',value:10000,closed:true,color:'#0f766e'},
      {id:'hb-pull2',kind:'resistor',from:'i:16',to:'i:20',value:10000,closed:true,color:'#0f766e'},
      ...([['hb-vss','top+:10','a:10'],['hb-vs','top+:14','j:17'],['hb-en','top+:12','j:10'],['hb-sp1','top+:2','a:2'],['hb-sp2','top+:24','a:24'],['hb-rail','top+:15','top+:16']] as const).map(([id,from,to])=>({id,kind:'wire' as const,from,to,value:0,closed:true,color:'#c53943'})),
      ...([['hb-g1','bottom-:13','i:13'],['hb-g2','bottom-:14','i:14'],['hb-g3','top-:13','a:13'],['hb-g4','top-:14','a:14'],['hb-grail','top-:1','bottom-:2'],['hb-grail2','bottom-:15','bottom-:16'],['hb-gpull1','bottom-:7','j:7'],['hb-gpull2','bottom-:20','j:20']] as const).map(([id,from,to])=>({id,kind:'wire' as const,from,to,value:0,closed:true,color:'#343b42'})),
      ...([['hb-in1','j:5','h:11'],['hb-in2','j:27','h:16']] as const).map(([id,from,to])=>({id,kind:'wire' as const,from,to,value:0,closed:true,color:'#2978c8'})),
    ]}:{voltage:5,positive:'top+:1',negative:'top-:1',components:empty?[]:[
      {id:'pr1',kind:'wire',from:'top+:1',to:'a:5',value:0,closed:true,color:'#0f766e'},
      {id:'pr2',kind:'resistor',from:'b:5',to:'b:10',value:1000,closed:true,color:'#0f766e'},
      {id:'pr3',kind:'led',from:'c:10',to:'f:10',value:1.9,closed:true,color:'#d94848'},
      {id:'pr4',kind:'wire',from:'g:10',to:'top-:5',value:0,closed:true,color:'#334155'},
    ]},
  };
}

export type Hole = {id:string;x:number;y:number;group:string};
export const HOLES:Hole[] = [];
for(let col=1;col<=30;col++) {
  const x=55+(col-1)*24;
  for(const [row,y] of [['top+',62],['top-',86],['bottom+',386],['bottom-',410]] as const)HOLES.push({id:`${row}:${col}`,x,y,group:`${row}:${col<=15?'left':'right'}`});
  for(const [i,row] of [...'abcdefghij'].entries())HOLES.push({id:`${row}:${col}`,x,y:135+i*20+(i>=5?35:0),group:`${i<5?'upper':'lower'}:${col}`});
}
export const HOLE_BY_ID = new Map(HOLES.map(h=>[h.id,h]));
export function parseHoleId(input:string):string|null {const match=/^(top[+-]|bottom[+-]|[a-j]):?([1-9]|[12]\d|30)$/.exec(input.trim().toLowerCase());if(!match)return null;const id=`${match[1]}:${match[2]}`;return HOLE_BY_ID.has(id)?id:null;}

export class Nets {
  private parent=new Map<string,string>();
  find(x:string):string {const p=this.parent.get(x);if(p===undefined){this.parent.set(x,x);return x;}if(p===x)return x;const root=this.find(p);this.parent.set(x,root);return root;}
  join(a:string,b:string){this.parent.set(this.find(a),this.find(b));}
}

/** L293D en la protoboard: `from` es el pin 1 (fila f) y `to` el pin 9 (fila e, siete columnas a la derecha). Muesca a la izquierda. */
export const IC_PIN_NAMES=['EN1','IN1','OUT1','GND','GND','OUT2','IN2','VS','EN2','IN3','OUT3','GND','GND','OUT4','IN4','VSS'] as const;
export function icPinHoles(from:string):string[]|null {
  const match=/^f:(\d+)$/.exec(from);if(!match)return null;
  const col=Number(match[1]);if(col<1||col>23)return null;
  return [...Array.from({length:8},(_,i)=>`f:${col+i}`),...Array.from({length:8},(_,i)=>`e:${col+7-i}`)];
}
export const icTo=(from:string)=>{const pins=icPinHoles(from);return pins?pins[8]:null;};

/** Transistor en la protoboard: `from` = emisor y `to` = colector, en la misma fila y separados por dos columnas; la base es el orificio del medio.
 *  Cara plana al frente: E-B-C de izquierda a derecha (patillaje típico de un 2N2222 / PN2222 en TO-92; confirma con tu hoja de datos). */
export function bjtBase(from:string,to:string):string|null {
  const a=/^([a-j]):(\d+)$/.exec(from),b=/^([a-j]):(\d+)$/.exec(to);
  if(!a||!b||a[1]!==b[1]||Math.abs(Number(a[2])-Number(b[2]))!==2)return null;
  return `${a[1]}:${(Number(a[2])+Number(b[2]))/2}`;
}

/** Four-pin tactile package across the channel. Each side pair is permanently connected. */
export function buttonPins(from:string,to:string):[string,string,string,string]|null{
  const a=/^([a-j]):(\d+)$/.exec(from),b=/^([a-j]):(\d+)$/.exec(to);if(!a||!b||Math.abs(+a[2]-+b[2])!==3||!HOLE_BY_ID.has(from)||!HOLE_BY_ID.has(to))return null;
  const ar='abcdefghij'.indexOf(a[1]),br='abcdefghij'.indexOf(b[1]),across=(a[1]==='e'&&b[1]==='f')||(a[1]==='f'&&b[1]==='e'),sameHalf=Math.floor(ar/5)===Math.floor(br/5)&&Math.abs(ar-br)===3;
  if(!across&&!sameHalf)return null;
  return [from,`${b[1]}:${a[2]}`,`${a[1]}:${b[2]}`,to];
}
export function joinBoardParts(nets:Nets,components:ProtoComponent[],switches:Record<string,boolean>){for(const c of components){const pins=c.kind==='button'?buttonPins(c.from,c.to):null;if(pins){nets.join(pins[0],pins[1]);nets.join(pins[2],pins[3]);}if(c.kind==='wire'||(c.kind==='switch'||c.kind==='button')&&(switches[c.id]??(c.kind==='button'?false:c.closed)))nets.join(c.from,c.to);}}

/** Orificios que ocupan las patas de un componente (una pata por orificio en una protoboard real). */
export function componentHoles(c:{kind:ProtoKind;from:string;to:string}):string[] {
  if(c.kind==='l293d')return icPinHoles(c.from)??[c.from];
  if(c.kind==='button')return buttonPins(c.from,c.to)??[c.from,c.to];
  if(c.kind==='bjt'){const base=bjtBase(c.from,c.to);return base?[c.from,base,c.to]:[c.from,c.to];}
  return [c.from,c.to];
}
/** Orificios con más de una pata, con la lista de componentes que los comparten. */
export function crowdedHoles(components:{id:string;kind:ProtoKind;from:string;to:string}[]):Record<string,string[]> {
  const used=new Map<string,string[]>();
  for(const c of components)for(const hole of new Set(componentHoles(c)))used.set(hole,[...(used.get(hole)??[]),c.id]);
  return Object.fromEntries([...used].filter(([,ids])=>ids.length>1));
}

export type Relocation={ok:true;component:ProtoComponent}|{ok:false;error:string};
const holeCol=(id:string)=>Number(id.split(':')[1]);
/** Mueve las patas de un componente a otros orificios comprobando que existan, que cumplan la forma de la pieza
 *  (L293D sobre el canal, transistor en tres orificios seguidos) y que no pisen la pata de otro componente. */
export function relocate(components:ProtoComponent[],id:string,change:{from?:string;to?:string;anchor?:string}):Relocation {
  const c=components.find(x=>x.id===id);if(!c)return {ok:false,error:'Ese componente ya no existe.'};
  let from=change.from??c.from,to=change.to??c.to;
  if(change.anchor!==undefined){
    if(c.kind==='l293d'){from=change.anchor;}
    else if(c.kind==='button'&&buttonPins(c.from,c.to)){
      const col=holeCol(change.anchor),row=change.anchor.split(':')[0],rows='abcdefghij',oldA=c.from.split(':')[0],oldB=c.to.split(':')[0];
      if(!rows.includes(row)||row.length!==1)return {ok:false,error:'El pulsador necesita filas a–j.'};
      const across=['e','f'].includes(oldA)&&['e','f'].includes(oldB);
      if(across&&!['e','f'].includes(row))return {ok:false,error:'Este pulsador cruza el canal central (e–f).'};
      const endRow=across?(row==='e'?'f':'e'):rows[rows.indexOf(row)+rows.indexOf(oldB)-rows.indexOf(oldA)];
      from=change.anchor;to=`${endRow}:${col+holeCol(c.to)-holeCol(c.from)}`;
    }
    else if(c.kind==='bjt'){const row=/^([a-j]):\d+$/.exec(change.anchor);if(!row)return {ok:false,error:'El transistor va en las filas a–j, no en un riel.'};from=change.anchor;to=`${row[1]}:${holeCol(change.anchor)+holeCol(c.to)-holeCol(c.from)}`;}
    else from=change.anchor;
  }
  if(!HOLE_BY_ID.has(from)||!HOLE_BY_ID.has(to))return {ok:false,error:c.kind==='bjt'?'El transistor necesita tres orificios seguidos dentro de la placa.':'Ese orificio no existe.'};
  if(c.kind==='l293d'){const end=icTo(from);if(!end)return {ok:false,error:'El L293D empieza en la fila f, columnas 1 a 23, y cruza el canal central.'};to=end;}
  else if(c.kind==='bjt'){if(!bjtBase(from,to))return {ok:false,error:'El transistor ocupa tres orificios seguidos de una misma fila (emisor, base y colector).'};}
  else if(c.kind==='button'&&buttonPins(c.from,c.to)&&!buttonPins(from,to))return {ok:false,error:'Conserva la separación de las cuatro patas: tres columnas y el canal central, o tres filas dentro de la misma mitad.'};
  else if(from===to)return {ok:false,error:'Elige dos orificios diferentes.'};
  const next={...c,from,to},mine=new Set(componentHoles(c));
  const taken=new Map<string,string>();for(const o of components)if(o.id!==id)for(const h of componentHoles(o))taken.set(h,o.kind);
  const clash=componentHoles(next).find(h=>taken.has(h)&&!mine.has(h));
  if(clash)return {ok:false,error:`El orificio ${clash.replace(':','')} ya tiene una pata. Cada orificio admite una sola.`};
  return {ok:true,component:next};
}
