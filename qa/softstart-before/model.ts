export type Family='mando'|'automatizacion'|'energia';
export type Kind='dc'|'ac'|'threephase'|'earth'|'terminal'|'busbar'|'breaker'|'breaker2'|'breaker3'|'fuse'|'differential'|'guard'|'thermal'|'contactor'|'aux-no'|'aux-nc'|'push-no'|'push-nc'|'emergency'|'selector'|'lamp'|'buzzer'|'motor'|'motor3'|'plc'|'vfd'|'vfd3'|'voltmeter'|'ammeter'|'wattmeter'|'energy'|'pv'|'battery'|'controller'|'inverter'|'micro300'|'micro600'|'micro1200'|'dcdc'|'rail'|'text';
export type Params={voltage:number;power:number;current:number;capacity:number;soc:number;irradiance:number;frequency:number;target:number;ramp:number;poles:number;tariff:number;text:string};
export type Part={id:string;kind:Kind;tag:string;x:number;y:number;closed:boolean;params:Params};
export type End={part:string;port:string};
export type CableRoute='power'|'control'|'pe';
export type Wire={id:string;from:End;to:End;label?:string;route?:CableRoute;via?:{x:number;y:number}};
export const PUMP_ROLES=['supply','fuse','guard','contactor','thermal','u','v','w','earth','stop','start','lamp','feed','motor'] as const;
export type PumpRole=typeof PUMP_ROLES[number];
export type CabinetRole=PumpRole|'plc'|'permit';
export type CabinetStep='brief'|'mount'|'wire'|'program'|'verify'|'test'|'diagnose';
export type CabinetFault='return'|'holding'|'phase'|'earth'|'program';
export type CabinetProbe='coil'|'retention'|'windings'|'pe';
export type CabinetTest={signature:string;at:string;results:{id:string;pass:boolean;detail:string}[]};
export type MountRail={id:string;x:number;y:number;width:number};
export type MountDuct={id:string;x:number;y:number;width:number;height:number};
export type Cabinet={version:1;layout?:'compact';scenario:'pump-direct'|'pump-plc'|'pump-relay';roles:Record<PumpRole,string>&{plc?:string;permit?:string};step:CabinetStep;fixtures:{rail:boolean;duct:boolean;bond:boolean};area?:{width:number;height:number};rails?:MountRail[];ducts?:MountDuct[];understood:boolean;notes:string;test?:CabinetTest;fault?:{kind:CabinetFault;probe?:CabinetProbe;answer?:CabinetFault};repairs:{kind:CabinetFault;probe:CabinetProbe;at:string}[]};
export type Board={version:1;parts:Part[];wires:Wire[];cabinet?:Cabinet};
export type Port={id:string;x:number;y:number};
export type Definition={kind:Kind;name:string;family:Family;prefix:string;detail:string};
export const CATALOG:Definition[]=[
 {kind:'dc',name:'Fuente DC regulada',family:'mando',prefix:'G',detail:'Alimentación de mando con polos + y −.'},
 {kind:'ac',name:'Fuente monofásica',family:'mando',prefix:'G',detail:'Fuente AC ideal, valores eficaces.'},
 {kind:'threephase',name:'Fuente trifásica',family:'automatizacion',prefix:'G',detail:'Tres fases a 120°, neutro y PE separado.'},
 {kind:'earth',name:'Tierra de protección',family:'mando',prefix:'PE',detail:'Punto de protección; no se une a N automáticamente.'},
 {kind:'terminal',name:'Bornera de paso',family:'mando',prefix:'X',detail:'Dos bornes de una misma red.'},
 {kind:'busbar',name:'Barra de distribución',family:'mando',prefix:'X',detail:'Cuatro puntos del mismo nodo.'},
 {kind:'breaker',name:'Disyuntor de un polo',family:'mando',prefix:'Q',detail:'Maniobra manual ideal; sin curva de disparo.'},
 {kind:'breaker2',name:'Disyuntor de dos polos',family:'mando',prefix:'Q',detail:'Apertura simultánea de ambos polos.'},
 {kind:'breaker3',name:'Disyuntor de tres polos',family:'mando',prefix:'Q',detail:'Tres polos vinculados mecánicamente.'},
 {kind:'fuse',name:'Portafusible',family:'mando',prefix:'FU',detail:'Inserta o extrae el cartucho; continuidad ideal.'},
 {kind:'differential',name:'Diferencial didáctico',family:'mando',prefix:'ID',detail:'Maniobra y disparo de prueba; no calcula corriente residual.'},
 {kind:'guard',name:'Guardamotor',family:'mando',prefix:'QM',detail:'Maniobra tripolar y disparo de práctica.'},
 {kind:'thermal',name:'Relé térmico',family:'mando',prefix:'F',detail:'Tres vías de potencia y auxiliares 95–96/97–98. Disparo de práctica.'},
 {kind:'contactor',name:'Contactor de potencia',family:'automatizacion',prefix:'K',detail:'Bobina A1–A2, tres polos y auxiliares vinculados.'},
 {kind:'aux-no',name:'Auxiliar NA',family:'mando',prefix:'K',detail:'Sigue al contactor con la misma designación.'},
 {kind:'aux-nc',name:'Auxiliar NC',family:'mando',prefix:'K',detail:'Abre al actuar el contactor con la misma designación.'},
 {kind:'push-no',name:'Pulsador NA',family:'mando',prefix:'S',detail:'Cierra mientras se mantiene pulsado.'},
 {kind:'push-nc',name:'Pulsador NC',family:'mando',prefix:'S',detail:'Abre mientras se mantiene pulsado.'},
 {kind:'emergency',name:'Parada de emergencia',family:'mando',prefix:'S',detail:'Enclavada: pulsa para abrir; vuelve a accionar para rearmar.'},
 {kind:'selector',name:'Selector de dos posiciones',family:'mando',prefix:'SA',detail:'Conserva su posición al soltar.'},
 {kind:'lamp',name:'Piloto',family:'mando',prefix:'H',detail:'Se ilumina por tensión entre sus dos bornes.'},
 {kind:'buzzer',name:'Zumbador',family:'mando',prefix:'HA',detail:'Carga equivalente con señal visual de activación; sin audio automático.'},
 {kind:'motor',name:'Motor monofásico',family:'automatizacion',prefix:'M',detail:'Carga resistiva equivalente; movimiento ilustrativo.'},
 {kind:'motor3',name:'Motor trifásico de seis bornes',family:'automatizacion',prefix:'M',detail:'Cablea las bobinas y los puentes estrella/triángulo.'},
 {kind:'plc',name:'PLC del proyecto',family:'automatizacion',prefix:'PLC',detail:'Q1–Q4 siguen Q0.0–Q0.3 del programa actual. Cada salida tiene su común C.'},
 {kind:'vfd',name:'Variador con entrada monofásica',family:'automatizacion',prefix:'VFD',detail:'Salida trifásica equivalente, consigna, rampa y sentido.'},
 {kind:'vfd3',name:'Variador con entrada trifásica',family:'automatizacion',prefix:'VFD',detail:'Valida las tres fases y genera salida trifásica equivalente.'},
 {kind:'voltmeter',name:'Voltímetro',family:'energia',prefix:'V',detail:'Mide tensión eficaz o DC entre sus puntas.'},
 {kind:'ammeter',name:'Amperímetro',family:'energia',prefix:'A',detail:'Se conecta en serie; shunt de medida idealizado.'},
 {kind:'wattmeter',name:'Vatímetro',family:'energia',prefix:'W',detail:'I1–I2 en serie; V+ y V− en paralelo a la carga.'},
 {kind:'energy',name:'Medidor de energía',family:'energia',prefix:'E',detail:'Integra potencia activa y tarifa durante el tiempo simulado.'},
 {kind:'pv',name:'Panel fotovoltaico',family:'energia',prefix:'PV',detail:'Equivalente lineal dependiente de irradiancia; no es un modelo MPPT.'},
 {kind:'battery',name:'Batería',family:'energia',prefix:'BAT',detail:'Fuente con resistencia interna y SOC integrado por corriente.'},
 {kind:'controller',name:'Controlador de carga',family:'energia',prefix:'CC',detail:'Conversión DC idealizada con límite de potencia y salida de carga.'},
 {kind:'inverter',name:'Inversor DC/AC',family:'energia',prefix:'INV',detail:'Salida AC equivalente; consumo DC según la carga y eficiencia fija del modelo.'},
 {kind:'micro300',name:'Microinversor 300 W',family:'energia',prefix:'MI',detail:'Inyección idealizada: requiere panel DC y red AC presentes.'},
 {kind:'micro600',name:'Microinversor 600 W',family:'energia',prefix:'MI',detail:'Inyección idealizada limitada a 600 W.'},
 {kind:'micro1200',name:'Microinversor 1200 W',family:'energia',prefix:'MI',detail:'Inyección idealizada limitada a 1200 W.'},
 {kind:'dcdc',name:'Regulador DC/DC',family:'energia',prefix:'DC',detail:'Salida DC regulada equivalente.'},
 {kind:'rail',name:'Riel DIN',family:'mando',prefix:'DIN',detail:'Soporte visual; no crea conexiones eléctricas.'},
 {kind:'text',name:'Rótulo de montaje',family:'mando',prefix:'TXT',detail:'Anotación independiente del circuito.'},
];
export const definition=(kind:Kind)=>CATALOG.find(d=>d.kind===kind)!;
export const key=(end:End)=>`${end.part}:${end.port}`;
export const maintained=(kind:Kind)=>['breaker','breaker2','breaker3','fuse','differential','guard','thermal','emergency','selector'].includes(kind);
export const momentary=(kind:Kind)=>kind==='push-no'||kind==='push-nc';
export const converter=(kind:Kind)=>['controller','inverter','dcdc','micro300','micro600','micro1200'].includes(kind);
export const defaults=(kind:Kind):Params=>({voltage:kind==='ac'||kind==='vfd'||kind==='motor'?230:kind==='threephase'||kind==='vfd3'||kind==='motor3'?400:kind==='pv'?36:24,power:kind==='micro1200'?1200:kind==='micro600'?600:kind==='inverter'?1000:kind==='motor3'?1500:kind==='pv'||kind==='micro300'?300:kind==='lamp'?2:kind==='buzzer'?1:100,current:10,capacity:100,soc:50,irradiance:1000,frequency:50,target:30,ramp:3,poles:4,tariff:0,text:kind==='text'?'Mi montaje':''});
export function dimensions(kind:Kind):{w:number;h:number}{
 if(kind==='rail')return {w:270,h:44};if(kind==='text')return {w:190,h:50};if(kind==='plc')return {w:260,h:156};
 if(['contactor','thermal','vfd','vfd3','controller'].includes(kind))return {w:180,h:178};
 if(['inverter','micro300','micro600','micro1200','dcdc','pv','battery','motor3'].includes(kind))return {w:166,h:150};
 return {w:116,h:126};
}
function rows(top:string[],bottom:string[],w:number,h:number):Port[]{return [...top.map((id,i)=>({id,x:(i+1)*w/(top.length+1),y:0})),...bottom.map((id,i)=>({id,x:(i+1)*w/(bottom.length+1),y:h}))];}
export function ports(kind:Kind):Port[]{
 const {w,h}=dimensions(kind);
 switch(kind){
  case'rail':case'text':return [];
  case'dc':case'battery':case'pv':return rows([],['+','−'],w,h);
  case'ac':return rows([],['L','N','PE'],w,h);
  case'threephase':return rows([],['L1','L2','L3','N','PE'],w,h);
  case'earth':return [{id:'PE',x:w/2,y:0}];
  case'busbar':return rows(['1','2'],['3','4'],w,h);
  case'breaker2':case'differential':return rows(['1','3'],['2','4'],w,h);
  case'breaker3':case'guard':return rows(['1','3','5'],['2','4','6'],w,h);
  case'thermal':return [...rows(['L1','L2','L3'],['T1','T2','T3'],w,h),{id:'95',x:0,y:65},{id:'96',x:0,y:110},{id:'97',x:w,y:65},{id:'98',x:w,y:110}];
  case'contactor':return [...rows(['L1','L2','L3'],['T1','T2','T3'],w,h),{id:'A1',x:0,y:40},{id:'A2',x:0,y:140},{id:'13',x:w,y:32},{id:'14',x:w,y:66},{id:'21',x:w,y:110},{id:'22',x:w,y:144}];
  case'plc':return rows(['L+','M','I1','I2','I3','I4','I5','I6','I7','I8'],['C1','Q1','C2','Q2','C3','Q3','C4','Q4'],w,h);
  case'vfd':case'vfd3':return [...rows(kind==='vfd'?['L','N','PE']:['L1','L2','L3','PE'],['U','V','W','PEo'],w,h),{id:'24',x:w,y:45},{id:'DI1',x:w,y:80},{id:'DI2',x:w,y:115},{id:'COM',x:w,y:145}];
  case'motor3':return rows(['U1','V1','W1'],['W2','U2','V2','PE'],w,h);
  case'motor':return rows(['L','N'],['PE'],w,h);
  case'controller':return rows(['PV+','PV−'],['BAT+','BAT−','LOAD+','LOAD−'],w,h);
  case'inverter':case'micro300':case'micro600':case'micro1200':return rows(['DC+','DC−'],['L','N','PE'],w,h);
  case'dcdc':return rows(['IN+','IN−'],['OUT+','OUT−'],w,h);
  case'wattmeter':case'energy':return rows(['I1','I2'],['V+','V−'],w,h);
  case'voltmeter':return rows([],['V+','V−'],w,h);
  case'ammeter':return rows(['A1'],['A2'],w,h);
  case'aux-no':return rows(['13'],['14'],w,h);case'aux-nc':return rows(['21'],['22'],w,h);
  case'push-no':case'selector':return rows(['3'],['4'],w,h);
  default:return rows(['1'],['2'],w,h);
 }
}
export function makePart(kind:Kind,existing:Part[],x:number,y:number):Part{const def=definition(kind);let n=1;while(existing.some(p=>p.tag===def.prefix+n))n++;return {id:crypto.randomUUID(),kind,tag:def.prefix+n,x,y,closed:['fuse','emergency','differential','guard','thermal'].includes(kind),params:defaults(kind)};}
export const emptyBoard=():Board=>({version:1,parts:[],wires:[]});
export function parseBoard(raw:unknown):Board{
 if(typeof raw!=='object'||raw===null)throw new Error('Montaje de equipos inválido.');const b=raw as Record<string,unknown>;
 if(b.version!==1||!Array.isArray(b.parts)||!Array.isArray(b.wires)||b.parts.length>80||b.wires.length>400)throw new Error('Montaje de equipos incompatible.');
 const string=(v:unknown,max:number)=>{if(typeof v!=='string'||!v.length||v.length>max)throw new Error('Texto de equipo inválido.');return v;};
 const numeric=(v:unknown,min:number,max:number)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new Error('Parámetro de equipo fuera de rango.');return v;};
 const ranges:Record<Exclude<keyof Params,'text'>,[number,number]>={voltage:[1,690],power:[.1,20000],current:[.01,1000],capacity:[.01,10000],soc:[0,100],irradiance:[0,1200],frequency:[1,100],target:[0,100],ramp:[.1,120],poles:[2,12],tariff:[0,1e6]};
 const parts:Part[]=b.parts.map(value=>{if(typeof value!=='object'||value===null)throw new Error('Equipo inválido.');const p=value as Record<string,unknown>,kind=string(p.kind,40) as Kind;if(!CATALOG.some(d=>d.kind===kind)||typeof p.closed!=='boolean'||typeof p.params!=='object'||p.params===null)throw new Error('Tipo o estado de equipo inválido.');const params={...defaults(kind)},source=p.params as Record<string,unknown>;
  for(const [k,range]of Object.entries(ranges))params[k as Exclude<keyof Params,'text'>]=numeric(source[k],...range);
  if(![2,4,6,8,10,12].includes(params.poles))throw new Error('Número de polos inválido.');if((kind==='vfd'||kind==='vfd3')&&params.target>params.frequency)throw new Error('La consigna del variador supera la frecuencia nominal.');if(typeof source.text!=='string'||source.text.length>160)throw new Error('Rótulo inválido.');params.text=source.text;
  return {id:string(p.id,100),kind,tag:string(p.tag,32),x:numeric(p.x,20,2200),y:numeric(p.y,35,1400),closed:p.closed,params};});
 const ids=new Set(parts.map(p=>p.id));if(ids.size!==parts.length)throw new Error('Identidades de equipos duplicadas.');
 const end=(v:unknown):End=>{if(typeof v!=='object'||v===null)throw new Error('Terminal inválido.');const e=v as Record<string,unknown>,part=parts.find(p=>p.id===e.part);if(!part||!ports(part.kind).some(p=>p.id===e.port))throw new Error('Cable de equipo con borne inexistente.');return {part:part.id,port:e.port as string};};
 const wires:Wire[]=b.wires.map(v=>{if(typeof v!=='object'||v===null)throw new Error('Cable inválido.');const w=v as Record<string,unknown>;if(w.route!==undefined&&!['power','control','pe'].includes(String(w.route)))throw new Error('Canalización de cable inválida.');let via:Wire['via'];if(w.via!==undefined){if(typeof w.via!=='object'||w.via===null)throw new Error('Recorrido de cable inválido.');const p=w.via as Record<string,unknown>;via={x:numeric(p.x,20,2380),y:numeric(p.y,20,1630)};}return {id:string(w.id,100),from:end(w.from),to:end(w.to),...w.label===undefined?{}:{label:string(w.label,24)},...w.route===undefined?{}:{route:w.route as CableRoute},...via?{via}:{}};});
 const pairs=wires.map(w=>[key(w.from),key(w.to)].sort().join('|'));if(new Set(wires.map(w=>w.id)).size!==wires.length||new Set(pairs).size!==pairs.length||wires.some(w=>key(w.from)===key(w.to)))throw new Error('Cables de equipo duplicados.');
 return {version:1,parts,wires,...b.cabinet===undefined?{}:{cabinet:parseCabinet(b.cabinet)}};
}
function parseCabinet(raw:unknown):Cabinet{
 const object=(v:unknown):Record<string,unknown>=>{if(!v||typeof v!=='object'||Array.isArray(v))throw new Error('Datos del taller inválidos.');return v as Record<string,unknown>;};
 const text=(v:unknown,max:number)=>{if(typeof v!=='string'||v.length>max)throw new Error('Texto del taller inválido.');return v;};
 const choice=<T extends string>(v:unknown,values:readonly T[]):T=>{if(!values.includes(v as T))throw new Error('Estado del taller desconocido.');return v as T;};
 const flag=(v:unknown)=>{if(typeof v!=='boolean')throw new Error('Comprobación del taller inválida.');return v;};
 const c=object(raw),r=object(c.roles),f=object(c.fixtures),roles={} as Record<PumpRole,string>;
 if(c.version!==1||!['pump-direct','pump-plc','pump-relay'].includes(String(c.scenario)))throw new Error('Versión del taller incompatible.');
 for(const role of PUMP_ROLES){roles[role]=text(r[role],100);if(!roles[role])throw new Error('Identidad del taller vacía.');}
 if(new Set(Object.values(roles)).size!==PUMP_ROLES.length)throw new Error('Identidades del taller duplicadas.');
 const controllerRoles=roles as Cabinet['roles'];
 if(c.scenario!=='pump-direct')for(const name of ['plc','permit']as const){controllerRoles[name]=text(r[name],100);if(!controllerRoles[name]||Object.values(controllerRoles).filter(id=>id===controllerRoles[name]).length>1)throw new Error('Identidad de controlador inválida.');}
 const faults=['return','holding','phase','earth','program'] as const,probes=['coil','retention','windings','pe'] as const;
 const size=(v:unknown,min:number,max:number)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw new Error('Medida del espacio de montaje inválida.');return v;};
 let area:Cabinet['area'];if(c.area!==undefined){const a=object(c.area);area={width:size(a.width,400,900),height:size(a.height,400,780)};}
 const hardware=(raw:unknown,duct:boolean)=>{if(!Array.isArray(raw)||raw.length>8)throw new Error('Soportes del gabinete inválidos.');const items=raw.map(v=>{const item=object(v);return {id:text(item.id,40),x:size(item.x,157,1057),y:size(item.y,218,998),width:size(item.width,24,900),...duct?{height:size(item.height,24,780)}:{}};});if(new Set(items.map(i=>i.id)).size!==items.length)throw new Error('Soportes del gabinete duplicados.');return items;};
 const rails=c.rails===undefined?undefined:hardware(c.rails,false) as MountRail[],ducts=c.ducts===undefined?undefined:hardware(c.ducts,true) as MountDuct[];
 const repair=(v:unknown)=>{const i=object(v);return {kind:choice(i.kind,faults),probe:choice(i.probe,probes),at:text(i.at,40)};};
 if(!Array.isArray(c.repairs)||c.repairs.length>20)throw new Error('Bitácora del taller inválida.');
 let test:CabinetTest|undefined;
 if(c.test!==undefined){const t=object(c.test);if(!Array.isArray(t.results)||t.results.length>12)throw new Error('Prueba del taller inválida.');test={signature:text(t.signature,32),at:text(t.at,40),results:t.results.map(v=>{const item=object(v);return {id:text(item.id,40),pass:flag(item.pass),detail:text(item.detail,240)};})};}
 let fault:Cabinet['fault'];
 if(c.fault!==undefined){const item=object(c.fault);fault={kind:choice(item.kind,faults),...item.probe===undefined?{}:{probe:choice(item.probe,probes)},...item.answer===undefined?{}:{answer:choice(item.answer,faults)}};}
 return {version:1,...c.layout==='compact'?{layout:'compact' as const}:{},scenario:c.scenario as Cabinet['scenario'],roles:controllerRoles,step:choice(c.step,['brief','mount','wire','program','verify','test','diagnose']),fixtures:{rail:flag(f.rail),duct:flag(f.duct),bond:flag(f.bond)},...area?{area}:{},...rails?{rails}:{},...ducts?{ducts}:{},understood:flag(c.understood),notes:text(c.notes,2000),repairs:c.repairs.map(repair),...test?{test}:{},...fault?{fault}:{}};
}
export function appendBoard(current:Board,incoming:Board):Board{
 const next=parseBoard(incoming);
 if(current.cabinet||next.cabinet){if(!current.parts.length)return next;throw new Error('Los talleres se abren en un proyecto propio. Importa el expediente completo desde Proyecto para conservar su gabinete.');}
 if(current.parts.length+next.parts.length>80||current.wires.length+next.wires.length>400)throw new Error('El montaje combinado supera la capacidad.');
 const offset=current.parts.length&&next.parts.length?Math.max(...current.parts.map(p=>p.y+dimensions(p.kind).h))+90-Math.min(...next.parts.map(p=>p.y)):0;
 if(next.parts.some(p=>p.y+offset>1400))throw new Error('El montaje no cabe debajo de las piezas actuales. Ábrelo en un proyecto vacío.');
 const used=new Set(current.parts.map(p=>p.tag)),tags=new Map<string,string>(),ids=new Map(next.parts.map(p=>[p.id,crypto.randomUUID()]));
 const parts=next.parts.map(p=>{
  let tag=tags.get(p.tag);
  if(tag===undefined){tag=p.tag;let n=1;while(used.has(tag)){const suffix='_'+n++;tag=p.tag.slice(0,32-suffix.length)+suffix;}used.add(tag);tags.set(p.tag,tag);}
  return {...p,id:ids.get(p.id)!,tag,y:p.y+offset};
 });
 const wires=next.wires.map(w=>({...w,id:crypto.randomUUID(),from:{...w.from,part:ids.get(w.from.part)!},to:{...w.to,part:ids.get(w.to.part)!}}));
 return parseBoard({version:1,parts:[...current.parts,...parts],wires:[...current.wires,...wires]});
}
export function exampleBoard(kind:'control'|'drive'|'solar'):Board{
 const board=emptyBoard();const add=(type:Kind,x:number,y:number)=>{const p=makePart(type,board.parts,x,y);board.parts.push(p);return p;};
 const wire=(a:Part,pa:string,b:Part,pb:string)=>board.wires.push({id:crypto.randomUUID(),from:{part:a.id,port:pa},to:{part:b.id,port:pb}});
 if(kind==='drive'){const supply=add('ac',100,120),vfd=add('vfd',420,120),motor=add('motor3',800,120);motor.params.voltage=230;wire(supply,'L',vfd,'L');wire(supply,'N',vfd,'N');wire(vfd,'U',motor,'U1');wire(vfd,'V',motor,'V1');wire(vfd,'W',motor,'W1');wire(motor,'W2',motor,'U2');wire(motor,'U2',motor,'V2');wire(supply,'PE',vfd,'PE');wire(vfd,'PEo',motor,'PE');}
 else if(kind==='solar'){const pv=add('pv',90,100),controller=add('controller',410,100),battery=add('battery',420,480),lamp=add('lamp',850,480),meter=add('energy',840,100);wire(pv,'+',controller,'PV+');wire(pv,'−',controller,'PV−');wire(controller,'BAT+',battery,'+');wire(controller,'BAT−',battery,'−');wire(controller,'LOAD+',meter,'I1');wire(meter,'I2',lamp,'1');wire(lamp,'2',controller,'LOAD−');wire(meter,'V+',lamp,'1');wire(meter,'V−',lamp,'2');}
 else{const supply=add('dc',90,100),breaker=add('breaker',300,100),stop=add('emergency',510,100),start=add('push-no',730,100),coil=add('contactor',950,100),aux=add('aux-no',730,460),lamp=add('lamp',1130,460);breaker.closed=true;wire(supply,'+',breaker,'1');wire(breaker,'2',stop,'1');wire(stop,'2',start,'3');wire(start,'4',coil,'A1');wire(coil,'A2',supply,'−');aux.tag=coil.tag;wire(stop,'2',aux,'13');wire(aux,'14',coil,'A1');wire(coil,'A1',lamp,'1');wire(lamp,'2',supply,'−');}
 return board;
}
