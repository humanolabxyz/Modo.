/** Física del banco de detectores. Sin dependencias: se prueba por separado (qa/verify-detectors.mjs).
 *  Modelo ideal y declarado: detector de 3 hilos (+V, 0 V, OUT) con salida PNP o NPN todo/nada, fuente de 24 V, multímetro de 10 MΩ en
 *  tensión continua y una entrada digital de PLC con los datos de la hoja DVP-SS2 de Delta (4,7 kΩ, ON sobre 15 V). No hay corrientes de fuga, caídas de tensión, histéresis, límites de corriente
 *  ni protecciones. Los cuatro modelos de la guía G02 no se conocen: solo se simulan con los datos que el estudiante copie de su ficha. */
export type Kind='inductive'|'capacitive'|'photo';
export type Output='pnp'|'npn';
export type Material='none'|'metal'|'plastic';
export type Terminal='g+'|'g-'|'s+'|'s-'|'so'|'px'|'pc';
export type ModelId='CR30-15DN'|'CR30-15DP'|'XS118BLPAL2'|'BR100-DDT-P';
export type MeterMode='off'|'V';
export const KINDS:Kind[]=['inductive','capacitive','photo'];
export const KIND_NAMES:Record<Kind,string>={inductive:'Inductivo',capacitive:'Capacitivo',photo:'Fotoeléctrico'};
export const OUTPUT_NAMES:Record<Output,string>={pnp:'PNP',npn:'NPN'};
export const MATERIAL_NAMES:Record<Material,string>={none:'Sin objeto',metal:'Metal (acero)',plastic:'No metálico (plástico)'};
export const MODELS:ModelId[]=['CR30-15DN','CR30-15DP','XS118BLPAL2','BR100-DDT-P'];
export const TERMINALS:{id:Terminal;label:string;device:'supply'|'sensor'|'plc'}[]=[
  {id:'g+',label:'Fuente +24 V',device:'supply'},{id:'g-',label:'Fuente 0 V',device:'supply'},
  {id:'s+',label:'Detector +V',device:'sensor'},{id:'s-',label:'Detector 0 V',device:'sensor'},{id:'so',label:'Detector OUT',device:'sensor'},
  {id:'px',label:'PLC entrada X0',device:'plc'},{id:'pc',label:'PLC S/S (común)',device:'plc'},
];
export const terminalLabel=(t:Terminal)=>TERMINALS.find(x=>x.id===t)!.label;
export const SUPPLY_V=24,METER_OHMS=1e7,PLC_OHMS=4700,PLC_ON_VOLTS=15,HIGH_FRACTION=0.8,LOW_FRACTION=0.2;
/** Alcance nominal del detector genérico del banco (mm). Es un valor del modelo declarado, no de ningún detector comercial. */
export const GENERIC_RANGE:Record<Kind,number>={inductive:10,capacitive:10,photo:100};
export const DIST_MAX=200;

export type Ficha={brand:string;wires:''|'2'|'3'|'4';principle:''|Kind;output:''|Output|'other';supply:string;range:string};
export const emptyFicha=():Ficha=>({brand:'',wires:'',principle:'',output:'',supply:'',range:''});
export const FICHA_FIELDS:(keyof Ficha)[]=['brand','wires','principle','output','supply','range'];
export const fichaComplete=(f:Ficha)=>FICHA_FIELDS.every(k=>String(f[k]).trim()!=='');
export type Settings={kind:Kind;output:Output;model:'generic'|ModelId;supplyOn:boolean;object:Material;distance:number;wires:[Terminal,Terminal][];mode:MeterMode;red:Terminal|null;black:Terminal|null;fichas:Record<ModelId,Ficha>};
export const defaultSettings=():Settings=>({kind:'inductive',output:'pnp',model:'generic',supplyOn:false,object:'metal',distance:50,wires:[],mode:'off',red:null,black:null,fichas:{'CR30-15DN':emptyFicha(),'CR30-15DP':emptyFicha(),'XS118BLPAL2':emptyFicha(),'BR100-DDT-P':emptyFicha()}});

export type Spec={kind:Kind;output:Output;range:number;label:string};
export type SpecInfo={spec:Spec|null;pending:string};
const rangeOf=(text:string)=>{const t=text.trim(),n=Number(t.replace(',','.'));return /^\d+([.,]\d+)?$/.test(t)&&n>0&&n<=DIST_MAX?n:null;};
/** Especificación que usa la simulación: la del modelo genérico, o la que el estudiante copió de la ficha técnica de su modelo. */
export function effectiveSpec(s:Settings):SpecInfo{
  if(s.model==='generic')return {spec:{kind:s.kind,output:s.output,range:GENERIC_RANGE[s.kind],label:`${KIND_NAMES[s.kind]} ${OUTPUT_NAMES[s.output]} (genérico)`},pending:''};
  const f=s.fichas[s.model];
  if(!fichaComplete(f))return {spec:null,pending:`${s.model}: pendiente de ficha técnica. Completa su ficha para poder simularlo.`};
  if(f.wires==='2')return {spec:null,pending:`${s.model}: este banco solo simula detectores de 3 hilos (con un 4.º hilo de control sin conectar) y tu ficha indica 2.`};
  if(f.principle===''||f.output==='other'||f.output==='')return {spec:null,pending:`${s.model}: este banco solo simula salidas PNP o NPN todo/nada.`};
  const range=rangeOf(f.range);if(range===null)return {spec:null,pending:`${s.model}: la distancia de detección de la ficha no es un número entre 0 y ${DIST_MAX} mm.`};
  return {spec:{kind:f.principle,output:f.output,range,label:`${s.model} (según tu ficha${f.wires==='4'?'; 4.º hilo sin modelar':''})`},pending:''};
}
/** ¿Está el objeto dentro del alcance y es de un material que este principio detecta? Inductivo: solo metales. Capacitivo y fotoeléctrico (difuso): ambos materiales. */
export function detects(kind:Kind,material:Material,distance:number,range:number):boolean{
  if(material==='none'||distance<0||distance>range)return false;
  return kind==='inductive'?material==='metal':true;
}

export type Solution={powered:boolean;polarity:'ok'|'reversed'|'open';active:boolean;short:boolean;warnings:string[];v:Record<Terminal,number>;meterVolts:number|null;plcVolts:number;plcOn:boolean};
const IDS=TERMINALS.map(t=>t.id);
/** Resuelve el montaje: uniones por cables ideales, salida del detector como interruptor ideal a +V (PNP) o a 0 V (NPN), y nodos flotantes por resistencias. */
export function solve(s:Settings,spec:Spec|null):Solution{
  const parent=new Map<string,string>(IDS.map(i=>[i,i]));
  const find=(a:string):string=>{let r=a;while(parent.get(r)!==r)r=parent.get(r)!;return r;};
  const join=(a:string,b:string)=>{const x=find(a),y=find(b);if(x!==y)parent.set(x,y);};
  s.wires.forEach(([a,b])=>join(a,b));
  const warnings:string[]=[];
  const out:Solution={powered:false,polarity:'open',active:false,short:false,warnings,v:Object.fromEntries(IDS.map(i=>[i,0])) as Record<Terminal,number>,meterVolts:null,plcVolts:0,plcOn:false};
  if(s.supplyOn&&find('g+')===find('g-')){out.short=true;warnings.push('Cortocircuito: la fuente +24 V y 0 V están unidas por cables. Una fuente real se protegería o se dañaría; aquí queda sin tensión.');}
  const live=s.supplyOn&&!out.short;
  if(live&&spec){
    if(find('s+')===find('g+')&&find('s-')===find('g-'))out.polarity='ok';
    else if(find('s+')===find('g-')&&find('s-')===find('g+')){out.polarity='reversed';warnings.push('Alimentación invertida: el detector no funciona. Muchos detectores reales traen protección, pero no todos: confírmalo en su ficha.');}
    out.powered=out.polarity==='ok';
  }
  out.active=out.powered&&detects(spec!.kind,s.object,s.distance,spec!.range);
  if(out.active){
    const rail=spec!.output==='pnp'?'s+':'s-';
    if(find('so')!==find(rail)){
      const a=find('so'),b=find(rail);
      /* Si unir OUT con el riel uniera +24 V con 0 V, el detector real limitaría o se dañaría: no se modela y se avisa. */
      const shorts=(a===find('g+')&&b===find('g-'))||(a===find('g-')&&b===find('g+'));
      if(shorts)warnings.push('La salida activa quedaría en cortocircuito con la otra línea de alimentación. Un detector real se protegería o se dañaría; el banco no lo modela.');else join('so',rail);
    }
  }
  /* Resistencias entre nodos: entrada del PLC y multímetro. */
  const res:{a:string;b:string;r:number}[]=[{a:'px',b:'pc',r:PLC_OHMS}];
  const meterOn=s.mode==='V'&&!!s.red&&!!s.black;
  if(meterOn)res.push({a:s.red!,b:s.black!,r:METER_OHMS});
  const fixed=new Map<string,number>();
  if(live){fixed.set(find('g+'),SUPPLY_V);fixed.set(find('g-'),0);}
  const pot=new Map<string,number>(),roots=[...new Set(IDS.map(find))];
  roots.forEach(r=>pot.set(r,fixed.get(r)??0));
  const edges=res.map(e=>({a:find(e.a),b:find(e.b),g:1/e.r})).filter(e=>e.a!==e.b);
  /* Componentes conectados por resistencias: solo los que tocan un nodo fijo tienen tensión; el resto no tiene fuente y queda en 0. */
  const seen=new Set<string>();
  for(const root of roots){
    if(seen.has(root)||fixed.has(root))continue;
    const comp=new Set<string>([root]),queue=[root];let touches=false;
    while(queue.length){const cur=queue.pop()!;for(const e of edges){const m=e.a===cur?e.b:e.b===cur?e.a:null;if(m===null)continue;if(fixed.has(m))touches=true;else if(!comp.has(m)){comp.add(m);queue.push(m);}}}
    comp.forEach(c=>seen.add(c));
    if(!touches)continue;
    const nodes=[...comp],idx=new Map(nodes.map((c,i)=>[c,i])),n=nodes.length,A=Array.from({length:n},()=>new Array<number>(n+1).fill(0));
    for(const e of edges){
      for(const [x,y] of [[e.a,e.b],[e.b,e.a]] as const){
        const i=idx.get(x);if(i===undefined)continue;A[i][i]+=e.g;
        const j=idx.get(y);if(j!==undefined)A[i][j]-=e.g;else if(fixed.has(y))A[i][n]+=e.g*fixed.get(y)!;
      }
    }
    for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;[A[c],A[p]]=[A[p],A[c]];
      for(let r=0;r<n;r++){if(r===c||A[c][c]===0)continue;const f=A[r][c]/A[c][c];for(let k=c;k<=n;k++)A[r][k]-=f*A[c][k];}}
    nodes.forEach((node,i)=>pot.set(node,A[i][i]?A[i][n]/A[i][i]:0));
  }
  out.v=Object.fromEntries(IDS.map(i=>[i,pot.get(find(i))!])) as Record<Terminal,number>;
  if(meterOn)out.meterVolts=out.v[s.red!]-out.v[s.black!];
  out.plcVolts=Math.abs(out.v.px-out.v.pc);out.plcOn=out.plcVolts>=PLC_ON_VOLTS;
  return out;
}

export type MeterRead={state:'off'|'idle'|'ok';value:number|null;note:string;/** Mide la salida respecto a una línea de alimentación. */out:null|{ref:'0v'|'plus'}};
const RAIL_OF:Record<Terminal,'0v'|'plus'|null>={'g+':'plus','s+':'plus','g-':'0v','s-':'0v',so:null,px:null,pc:null};
export function readMeter(s:Settings,sol:Solution):MeterRead{
  if(s.mode==='off')return {state:'off',value:null,note:'El multímetro está apagado. Elige la función V (tensión continua).',out:null};
  if(!s.red||!s.black)return {state:'idle',value:null,note:'Conecta las dos puntas a bornes del montaje.',out:null};
  if(s.red===s.black)return {state:'ok',value:0,note:'Las dos puntas están en el mismo borne: no hay diferencia de tensión.',out:null};
  const value=sol.meterVolts??0,pair=[s.red,s.black];
  let out:MeterRead['out']=null;
  if(pair.includes('so')){const other=RAIL_OF[pair.find(p=>p!=='so')!];if(other)out={ref:other};}
  const note=out?`Mides la salida del detector respecto a ${out.ref==='0v'?'0 V':'+V'}.`:'Esta medición no es la salida del detector contra una línea de alimentación.';
  return {state:'ok',value,note,out};
}
/** Nivel lógico que informa una lectura de la salida. Con referencia 0 V: ≈24 V alto y ≈0 V bajo. Con referencia +V se invierte (una salida NPN activa baja a 0 V). */
export function levelOf(value:number,ref:'0v'|'plus'):string{
  const hi=value>=SUPPLY_V*HIGH_FRACTION,lo=Math.abs(value)<=SUPPLY_V*LOW_FRACTION;
  if(ref==='0v')return hi?'Alto (24 V)':lo?'Bajo (0 V)':'Indefinido';
  return hi?'Bajo (0 V)':lo?'Alto (24 V) o abierta':'Indefinido';
}
