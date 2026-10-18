import type {Board as EquipmentBoard} from './equipment/model';
export type Memory = Record<string, boolean | number>;
export type Tool = 'schematic' | 'plc' | 'hmi' | 'process' | 'breadboard' | 'geogebra' | 'temperature' | 'detectors' | 'equipment';
export const TOOLS: {id: Tool; name: string; description: string}[] = [
  {id:'schematic',name:'Esquemas',description:'Dibuja y prueba circuitos de mando.'},
  {id:'equipment',name:'Equipos eléctricos',description:'Monta mando, automatización y energía con equipos y bornes interactivos.'},
  {id:'plc',name:'PLC',description:'Programa contactos, bobinas y temporizadores.'},
  {id:'hmi',name:'HMI',description:'Crea una pantalla para operar tus señales.'},
  {id:'process',name:'Procesos',description:'Controla el llenado de un tanque.'},
  {id:'breadboard',name:'Protoboard',description:'Monta un circuito y mide tensión y corriente.'},
  {id:'temperature',name:'Temperatura',description:'Mide termocupla y Pt100 en un horno de pozo seco, con transmisor.'},
  {id:'detectors',name:'Detectores',description:'Mide detectores inductivo, capacitivo y fotoeléctrico y conéctalos a un PLC.'},
  {id:'geogebra',name:'GeoGebra',description:'Explora funciones, geometría, cálculo y matrices libremente o con una lección.'},
];
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
export type Measurement = {id:string;kind:'voltage'|'current'|'resistance'|'continuity';a:string;b:string;value:number|null;label:string;at:string};
export type LabProject = {
  format:'panellab-laboratory';version:2;id:string;name:string;
  schematic:{devices:Device[];wires:Wire[]};
  plc:{language:'ladder'|'st';tags:Tag[];rungs:Rung[];source:string};
  hmi:{widgets:Widget[]};
  process:{capacity:number;initialLevel:number;inflow:number;outflow:number;low:number;high:number;pumpSignal:string;lowSignal:string;highSignal:string;levelSignal:string};
  breadboard:{voltage:number;positive:string;negative:string;components:ProtoComponent[];realistic?:boolean;log?:Measurement[];notes?:string};
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
    breadboard:kind==='hbridge-bjt'?{voltage:12,positive:'top+:1',negative:'top-:1',components:[
      ...(['e:2','e:6','e:10','e:14'] as const).map((from,i)=>({id:`bj-q${[2,3,1,4][i]}`,kind:'bjt' as const,from,to:`e:${[4,8,12,16][i]}`,value:100,closed:true,color:'#1f2327'})),
      {id:'bj-r1',kind:'resistor',from:'c:3',to:'c:5',value:1000,closed:true,color:'#0f766e'},
      {id:'bj-r2',kind:'resistor',from:'c:7',to:'c:9',value:1000,closed:true,color:'#0f766e'},
      {id:'bj-r3',kind:'resistor',from:'d:11',to:'d:9',value:1000,closed:true,color:'#0f766e'},
      {id:'bj-r4',kind:'resistor',from:'c:15',to:'c:13',value:1000,closed:true,color:'#0f766e'},
      {id:'bj-s1',kind:'button',from:'b:4',to:'b:5',value:0,closed:false,color:'#d94848'},
      {id:'bj-s2',kind:'button',from:'d:4',to:'e:9',value:0,closed:false,color:'#d94848'},
      {id:'bj-m',kind:'motor',from:'h:3',to:'h:9',value:40,closed:true,color:'#4b5563'},
      {id:'bj-p1',kind:'wire',from:'top+:4',to:'a:4',value:0,closed:true,color:'#d94848'},
      {id:'bj-p2',kind:'wire',from:'top+:12',to:'a:12',value:0,closed:true,color:'#d94848'},
      {id:'bj-g1',kind:'wire',from:'top-:6',to:'a:6',value:0,closed:true,color:'#334155'},
      {id:'bj-g2',kind:'wire',from:'top-:14',to:'a:14',value:0,closed:true,color:'#334155'},
      {id:'bj-ml',kind:'wire',from:'a:2',to:'a:8',value:0,closed:true,color:'#e07b2a'},
      {id:'bj-mr',kind:'wire',from:'a:10',to:'a:16',value:0,closed:true,color:'#d6a516'},
      {id:'bj-na',kind:'wire',from:'a:5',to:'a:13',value:0,closed:true,color:'#2f6fd1'},
      {id:'bj-ma',kind:'wire',from:'d:2',to:'g:3',value:0,closed:true,color:'#e07b2a'},
      {id:'bj-mb',kind:'wire',from:'d:10',to:'g:9',value:0,closed:true,color:'#d6a516'},
    ]}:kind==='hbridge'?{voltage:12,positive:'top+:1',negative:'bottom-:1',components:[
      {id:'hb-r1',kind:'resistor',from:'top+:4',to:'a:10',value:330,closed:true,color:'#0f766e'},
      {id:'hb-vs',kind:'wire',from:'top+:14',to:'j:17',value:0,closed:true,color:'#d94848'},
      {id:'hb-ic',kind:'l293d',from:'f:10',to:'e:17',value:0,closed:true,color:'#2b3035'},
      {id:'hb-s1',kind:'button',from:'c:10',to:'g:11',value:0,closed:false,color:'#d94848'},
      {id:'hb-s2',kind:'button',from:'d:10',to:'g:16',value:0,closed:false,color:'#d94848'},
      {id:'hb-en',kind:'wire',from:'h:10',to:'h:16',value:0,closed:true,color:'#2f6fd1'},
      {id:'hb-m',kind:'motor',from:'h:12',to:'h:15',value:40,closed:true,color:'#4b5563'},
      {id:'hb-g1',kind:'wire',from:'bottom-:13',to:'i:13',value:0,closed:true,color:'#334155'},
      {id:'hb-g2',kind:'wire',from:'bottom-:14',to:'i:14',value:0,closed:true,color:'#334155'},
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
  for(const [row,y] of [['top+',62],['top-',86],['bottom+',366],['bottom-',390]] as const)HOLES.push({id:`${row}:${col}`,x,y,group:`${row}:${col<=15?'left':'right'}`});
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

/** Orificios que ocupan las patas de un componente (una pata por orificio en una protoboard real). */
export function componentHoles(c:{kind:ProtoKind;from:string;to:string}):string[] {
  if(c.kind==='l293d')return icPinHoles(c.from)??[c.from];
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
    else if(c.kind==='bjt'){const row=/^([a-j]):\d+$/.exec(change.anchor);if(!row)return {ok:false,error:'El transistor va en las filas a–j, no en un riel.'};from=change.anchor;to=`${row[1]}:${holeCol(change.anchor)+holeCol(c.to)-holeCol(c.from)}`;}
    else from=change.anchor;
  }
  if(!HOLE_BY_ID.has(from)||!HOLE_BY_ID.has(to))return {ok:false,error:c.kind==='bjt'?'El transistor necesita tres orificios seguidos dentro de la placa.':'Ese orificio no existe.'};
  if(c.kind==='l293d'){const end=icTo(from);if(!end)return {ok:false,error:'El L293D empieza en la fila f, columnas 1 a 23, y cruza el canal central.'};to=end;}
  else if(c.kind==='bjt'){if(!bjtBase(from,to))return {ok:false,error:'El transistor ocupa tres orificios seguidos de una misma fila (emisor, base y colector).'};}
  else if(from===to)return {ok:false,error:'Elige dos orificios diferentes.'};
  const next={...c,from,to},mine=new Set(componentHoles(c));
  const taken=new Map<string,string>();for(const o of components)if(o.id!==id)for(const h of componentHoles(o))taken.set(h,o.kind);
  const clash=componentHoles(next).find(h=>taken.has(h)&&!mine.has(h));
  if(clash)return {ok:false,error:`El orificio ${clash.replace(':','')} ya tiene una pata. Cada orificio admite una sola.`};
  return {ok:true,component:next};
}
