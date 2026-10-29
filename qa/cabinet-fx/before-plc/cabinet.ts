import {dimensions,emptyBoard,key,makePart,type Board,type Cabinet,type CabinetFault,type CabinetProbe,type CabinetStep,type CableRoute,type End,type Kind,type CabinetRole,type MountRail,type MountDuct,type Wire} from './model';
import {freshEquipment,stepEquipment,type State} from './engine';
import {compilePLC,emptyRuntime,tick} from '../engine';
import {type LabProject} from '../model';

export const CABINET_STEPS:{id:CabinetStep;name:string}[]=[{id:'brief',name:'Comprender'},{id:'mount',name:'Montar'},{id:'wire',name:'Cablear'},{id:'program',name:'Programar'},{id:'verify',name:'Verificar'},{id:'test',name:'Probar'},{id:'diagnose',name:'Diagnosticar'}];
export const CABINET_PROFILES:{id:Cabinet['scenario'];name:string;detail:string}[]=[{id:'pump-direct',name:'Mando cableado',detail:'Contactores, auxiliares y protección de práctica.'},{id:'pump-plc',name:'PLC industrial',detail:'Entradas y salidas físicas con programación Ladder/ST.'},{id:'pump-relay',name:'Relé programable',detail:'Lógica compacta para una maniobra acotada; perfil genérico.'}];
export type Zone='plate'|'door'|'field';
export const ZONES={plate:{x:100,y:160,w:1020,h:880,name:'Placa de montaje'},door:{x:1180,y:160,w:440,h:880,name:'Puerta y mandos'},field:{x:1680,y:160,w:580,h:880,name:'Campo · alimentación y bomba'}};
export const SLOTS:{role:CabinetRole;kind:Kind;tag:string;name:string;zone:Zone;x:number;y:number}[]=[
 {role:'supply',kind:'dc',tag:'G1',name:'Fuente de mando 24 V DC',zone:'plate',x:220,y:300},
 {role:'fuse',kind:'fuse',tag:'FU1',name:'Portafusible de mando',zone:'plate',x:410,y:300},
 {role:'guard',kind:'guard',tag:'QM1',name:'Guardamotor de práctica',zone:'plate',x:600,y:300},
 {role:'contactor',kind:'contactor',tag:'K1',name:'Contactor con auxiliares',zone:'plate',x:820,y:300},
 {role:'thermal',kind:'thermal',tag:'F1',name:'Relé térmico de práctica',zone:'plate',x:820,y:560},
 {role:'u',kind:'terminal',tag:'X1:U',name:'Borne de salida U',zone:'plate',x:220,y:790},
 {role:'v',kind:'terminal',tag:'X1:V',name:'Borne de salida V',zone:'plate',x:410,y:790},
 {role:'w',kind:'terminal',tag:'X1:W',name:'Borne de salida W',zone:'plate',x:600,y:790},
 {role:'earth',kind:'earth',tag:'PE1',name:'Punto de protección de masas',zone:'plate',x:890,y:790},
 {role:'stop',kind:'push-nc',tag:'S0',name:'Paro NC del ejercicio',zone:'door',x:1230,y:300},
 {role:'start',kind:'push-no',tag:'S1',name:'Marcha NA del ejercicio',zone:'door',x:1420,y:300},
 {role:'lamp',kind:'lamp',tag:'H1',name:'Piloto de mando activo',zone:'door',x:1320,y:570},
 {role:'feed',kind:'threephase',tag:'RED',name:'Alimentación equivalente 400 V',zone:'field',x:1750,y:300},
 {role:'motor',kind:'motor3',tag:'M1',name:'Bomba · motor equivalente',zone:'field',x:1980,y:610},
];
export const assignedArea=(b:Board)=>({x:157,y:218,...b.cabinet?.area??{width:900,height:780}});
export const railsFor=(b:Board):MountRail[]=>b.cabinet?.rails??[{id:'rail-1',x:230,y:400,width:760},{id:'rail-2',x:230,y:660,width:760},{id:'rail-3',x:230,y:880,width:760}];
export const ductsFor=(b:Board):MountDuct[]=>b.cabinet?.ducts??[{id:'duct-1',x:175,y:245,width:38,height:740},{id:'duct-2',x:1015,y:245,width:38,height:740},{id:'duct-3',x:213,y:245,width:802,height:30},{id:'duct-4',x:213,y:525,width:802,height:30},{id:'duct-5',x:213,y:955,width:802,height:30}];
export const programmed=(b:Board)=>!!b.cabinet&&b.cabinet.scenario!=='pump-direct';
export const slotsFor=(b:Board)=>programmed(b)?[...SLOTS,{role:'plc' as const,kind:'plc' as const,tag:b.cabinet!.scenario==='pump-relay'?'LOGIC1':'PLC1',name:b.cabinet!.scenario==='pump-relay'?'Relé programable genérico':'PLC genérico · 8 DI / 4 DO',zone:'plate' as const,x:340,y:560},{role:'permit' as const,kind:'selector' as const,tag:'B1',name:'Permiso de proceso virtual',zone:'field' as const,x:1750,y:610}]:SLOTS;
export const ROUTES:{id:CableRoute;name:string;color:string}[]=[{id:'power',name:'Potencia',color:'#765e53'},{id:'control',name:'Mando',color:'#397f95'},{id:'pe',name:'Protección PE',color:'#729248'}];
export type PlannedWire={label:string;from:End;to:End;route:CableRoute;purpose:string};
export const pair=(a:End,b:End)=>[key(a),key(b)].sort().join('|');
export const partFor=(b:Board,role:CabinetRole)=>b.parts.find(p=>p.id===b.cabinet?.roles[role]);
export function createPumpBoard(scenario:Cabinet['scenario']='pump-direct'):Board{
 const b=emptyBoard(),roles={} as Cabinet['roles'];
 b.cabinet={version:1,scenario,roles,step:'brief',fixtures:{rail:false,duct:false,bond:false},understood:false,notes:'',repairs:[]};
 slotsFor(b).forEach((s,i)=>{const p=makePart(s.kind,b.parts,140+(i%8)*270,1170+Math.floor(i/8)*220);p.tag=s.tag;if(s.role==='guard'||s.role==='permit')p.closed=true;if(s.role==='plc')p.params.text=scenario==='pump-relay'?'relay':'plc';b.parts.push(p);roles[s.role]=p.id;});
 return b;
}
export function wiringPlan(b:Board):PlannedWire[]{
 if(!b.cabinet)return [];
 const result:PlannedWire[]=[],end=(role:CabinetRole,port:string)=>({part:b.cabinet!.roles[role]!,port});
 const add=(a:CabinetRole,ap:string,z:CabinetRole,zp:string,route:CableRoute,purpose:string)=>result.push({label:'W'+String(result.length+1).padStart(2,'0'),from:end(a,ap),to:end(z,zp),route,purpose});
 for(let i=1;i<=3;i++)add('feed','L'+i,'guard',String(i*2-1),'power','Entrada de potencia');
 for(let i=1;i<=3;i++)add('guard',String(i*2),'contactor','L'+i,'power','Potencia hacia el contactor');
 for(let i=1;i<=3;i++)add('contactor','T'+i,'thermal','L'+i,'power','Potencia hacia el relé térmico');
 for(const [i,role]of ['u','v','w'].entries())add('thermal','T'+(i+1),role as CabinetRole,'1','power','Llegada a bornera de salida');
 for(const [i,role]of ['u','v','w'].entries())add(role as CabinetRole,'2','motor',['U1','V1','W1'][i],'power','Salida de campo al motor');
 add('motor','W2','motor','U2','power','Puente estrella del modelo');add('motor','U2','motor','V2','power','Puente estrella del modelo');
 add('feed','PE','earth','PE','pe','Llegada de protección');add('earth','PE','motor','PE','pe','Protección del motor');
 if(programmed(b)){
  add('supply','+','fuse','1','control','Alimentación del mando');add('fuse','2','plc','L+','control','Alimentación del controlador');add('supply','−','plc','M','control','Referencia del controlador');
  add('fuse','2','stop','1','control','Alimentación de paro');add('stop','2','plc','I2','control','I0.1 · paro disponible');
  add('fuse','2','start','3','control','Alimentación de marcha');add('start','4','plc','I1','control','I0.0 · marcha');
  add('fuse','2','thermal','97','control','Señal de disparo');add('thermal','98','plc','I3','control','I0.2 · fallo térmico');
  add('fuse','2','permit','3','control','Alimentación de permiso');add('permit','4','plc','I4','control','I0.3 · permiso de proceso');
  add('stop','2','plc','C1','control','Común de la salida interrumpido por paro');add('plc','Q1','thermal','95','control','Q0.0 · orden a la bobina');add('thermal','96','contactor','A1','control','Permiso térmico cableado');
  add('contactor','A2','supply','−','control','Retorno de bobina');add('contactor','A1','lamp','1','control','Indicación de mando');add('lamp','2','supply','−','control','Retorno de piloto');return result;
 }
 add('supply','+','fuse','1','control','Alimentación del mando');add('fuse','2','stop','1','control','Mando hacia paro');
 add('stop','2','thermal','95','control','Permiso de paro');add('thermal','96','start','3','control','Permiso térmico hacia marcha');
 add('start','4','contactor','A1','control','Orden de marcha');add('contactor','A2','supply','−','control','Retorno de bobina');
 add('thermal','96','contactor','13','control','Alimentación de retención');add('contactor','14','contactor','A1','control','Retención por auxiliar');
 add('contactor','A1','lamp','1','control','Indicación de mando');add('lamp','2','supply','−','control','Retorno de piloto');
 return result;
}
export const plannedConnection=(b:Board,w:Wire)=>wiringPlan(b).find(p=>pair(p.from,p.to)===pair(w.from,w.to));
export const connectionName=(b:Board,e:End)=>`${b.parts.find(p=>p.id===e.part)?.tag??'Equipo ausente'} · ${e.port}`;
export function physicalBounds(p:Board['parts'][number]){const d=dimensions(p.kind);return p.kind==='terminal'||p.kind==='earth'?{x:p.x+d.w/2-20,y:p.y+10,w:40,h:d.h-20}:p.kind==='fuse'?{x:p.x+29,y:p.y+10,w:58,h:d.h-20}:{x:p.x+10,y:p.y+10,w:d.w-20,h:d.h-20};}
export function atSlot(b:Board,role:CabinetRole){const p=partFor(b,role),s=slotsFor(b).find(s=>s.role===role);if(!p||!s||p.kind!==s.kind)return false;const r=physicalBounds(p),a=assignedArea(b),z=s.zone==='plate'?{x:a.x,y:a.y,w:a.width,h:a.height}:ZONES[s.zone];return r.x>=z.x&&r.y>=z.y+ (s.zone==='plate'?0:75)&&r.x+r.w<=z.x+z.w&&r.y+r.h<=z.y+z.h-20;}
export type CabinetCheck={id:string;name:string;pass:boolean;detail:string};
export function cabinetChecks(b:Board,project?:LabProject):CabinetCheck[]{
 if(!b.cabinet)return [];
 const c=b.cabinet,plan=wiringPlan(b),missing=plan.filter(p=>!b.wires.some(w=>pair(p.from,p.to)===pair(w.from,w.to))),extra=b.wires.filter(w=>!plan.some(p=>pair(p.from,p.to)===pair(w.from,w.to)));
 const absent=slotsFor(b).filter(s=>!atSlot(b,s.role)),area=assignedArea(b);
 const intersects=(a:{x:number;y:number;w:number;h:number},z:{x:number;y:number;w:number;h:number})=>a.x<z.x+z.w&&a.x+a.w>z.x&&a.y<z.y+z.h&&a.y+a.h>z.y;
 const overlap=b.parts.some((p,i)=>b.parts.slice(i+1).some(q=>intersects(physicalBounds(p),physicalBounds(q))));
 const inside=(r:{x:number;y:number;width:number;height:number})=>r.x>=area.x&&r.y>=area.y&&r.x+r.width<=area.x+area.width&&r.y+r.height<=area.y+area.height;
 const supports=railsFor(b),ducts=ductsFor(b),plate=slotsFor(b).filter(s=>s.zone==='plate').map(s=>partFor(b,s.role));
 const supportOK=supports.length>0&&supports.every(r=>inside({...r,height:32}))&&plate.every(p=>p&&supports.some(r=>{const f=physicalBounds(p);return r.x<=f.x&&r.x+r.width>=f.x+f.w&&r.y+16>=f.y&&r.y+16<=f.y+f.h;}));
 const accessOK=ducts.length>0&&ducts.every(inside)&&plate.every(p=>p&&!ducts.some(d=>intersects(physicalBounds(p),{x:d.x,y:d.y,w:d.width,h:d.height})));
 const pe=plan.filter(p=>p.route==='pe').every(p=>b.wires.some(w=>pair(w.from,w.to)===pair(p.from,p.to)));
 const names=plan.every(p=>b.wires.some(w=>pair(p.from,p.to)===pair(w.from,w.to)&&w.label===p.label));
 const routes=plan.every(p=>b.wires.some(w=>pair(p.from,p.to)===pair(w.from,w.to)&&w.route===p.route));
 const nominal=(['supply','contactor','lamp'] as CabinetRole[]).every(role=>partFor(b,role)?.params.voltage===24)&&(['feed','motor']as CabinetRole[]).every(role=>partFor(b,role)?.params.voltage===400);
 return [
  {id:'brief',name:'Encargo comprendido',pass:c.understood,detail:'Comprueba la función del auxiliar de retención en Comprender.'},
  {id:'rail',name:'Soporte sobre rieles',pass:c.fixtures.rail&&supportOK,detail:'Cada equipo de placa debe apoyarse en un riel dentro del espacio asignado.'},
  {id:'duct',name:'Canaletas y espacio de acceso',pass:c.fixtures.duct&&accessOK,detail:'Las canaletas deben quedar dentro del área útil y libres de cuerpos de equipos.'},
  {id:'mount',name:'Equipos colocados',pass:absent.length===0&&!overlap,detail:absent.length?absent.map(s=>s.tag).join(', ')+' pendientes de colocación.':overlap?'Hay cuerpos de equipos superpuestos.':'Equipos dentro de sus zonas y sin cuerpos superpuestos.'},
  {id:'wire',name:'Conexiones según el esquema',pass:missing.length===0&&extra.length===0,detail:`${missing.length} conexiones pendientes · ${extra.length} conexiones fuera del encargo.`},
  {id:'label',name:'Identificación de hilos',pass:names&&new Set(b.wires.map(w=>w.label)).size===b.wires.length,detail:'Cada hilo debe conservar la identificación de la lista de conexiones del encargo.'},
  {id:'route',name:'Recorridos identificados',pass:routes,detail:'Asigna a cada hilo su canalización del ejercicio.'},
  {id:'pe',name:'Protección de masas',pass:pe&&c.fixtures.bond,detail:'Comprueba las dos conexiones PE y la unión virtual de placa y puerta.'},
  {id:'nominal',name:'Datos del modelo coherentes',pass:nominal,detail:'Encargo didáctico: mando 24 V DC y alimentación/motor equivalentes de 400 V.'},
  ...programmed(b)?[{id:'program',name:'Programa del controlador',pass:!!project&&compilePLC(project).diagnostics.length===0&&(project.plc.language==='st'?project.plc.source.trim().length>0:project.plc.rungs.length>0),detail:'Carga o escribe el programa, revisa sus diagnósticos y comprueba la función.'}]:[],
 ];
}
export function designSignature(b:Board,project?:LabProject):string{
 const value=JSON.stringify({parts:[...b.parts].sort((a,z)=>a.id.localeCompare(z.id)),wires:[...b.wires].sort((a,z)=>a.id.localeCompare(z.id)),fixtures:b.cabinet?.fixtures,roles:b.cabinet?.roles,area:b.cabinet?.area,rails:b.cabinet?.rails,ducts:b.cabinet?.ducts,program:programmed(b)?project?.plc:undefined});let h=2166136261;
 for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}
 return (h>>>0).toString(16);
}
function experiment(b:Board,project?:LabProject){
 let state=freshEquipment(),p=project?{...project,equipment:b}:null,runtime=p?emptyRuntime(p):null;
 const compiled=p?compilePLC(p):null;
 return {step(pressed:Record<string,boolean>={},controls:Record<string,boolean>={}){for(let n=0;n<4;n++){if(programmed(b)&&p&&runtime){runtime=tick(p,runtime,pressed,{},.1,compiled!.st,controls);state={...runtime.equipment,fault:runtime.fault??runtime.equipment.fault};}else state=stepEquipment(b,state,{},controls,pressed,.1);}return state;},state:()=>state};
}
export const CONTROL_ST='Q0.0 := I0.1 AND NOT I0.2 AND I0.3 AND (I0.0 OR Q0.0);';
export function controllerProgram(project:LabProject,language:'ladder'|'st'='ladder',holding=true):LabProject['plc']{
 const permissions=[{address:'I0.1',negated:false},{address:'I0.2',negated:true},{address:'I0.3',negated:false}];
 return {...project.plc,language,source:holding?CONTROL_ST:'Q0.0 := I0.1 AND NOT I0.2 AND I0.3 AND I0.0;',rungs:[{id:'cab-pump-control',comment:'Marcha con retención, paro, térmico y permiso',branches:[[...permissions,{address:'I0.0',negated:false}],...holding?[[...permissions,{address:'Q0.0',negated:false}]]:[]],output:'Q0.0',mode:'coil',preset:1}]};
}
export function functionalTest(b:Board,project?:LabProject){
 const start=partFor(b,'start'),stop=partFor(b,'stop'),thermal=partFor(b,'thermal'),guard=partFor(b,'guard'),motor=partFor(b,'motor');
 if(!start||!stop||!thermal||!guard||!motor)return [{id:'equipment',pass:false,detail:'Falta un equipo del encargo.'}];
 if(programmed(b)&&(!project||compilePLC(project).diagnostics.length))return [{id:'program',pass:false,detail:'Falta un programa válido del controlador.'}];
 let state=freshEquipment();const run=experiment(b,project),frame=(pressed:Record<string,boolean>={},controls:Record<string,boolean>={})=>{state=run.step(pressed,controls);return !state.fault&&!!state.readings[motor.id]?.active;};
 const results=[{id:'idle',pass:!frame()&&!state.fault,detail:'Al iniciar, la bomba permanece detenida.'},
  {id:'start',pass:frame({[start.id]:true}),detail:'Marcha activa la bobina y el motor.'},
  {id:'hold',pass:frame(),detail:programmed(b)?'Al soltar marcha, el programa mantiene la salida.':'Al soltar marcha, el auxiliar mantiene el mando.'},
  {id:'stop',pass:!frame({[stop.id]:true})&&!state.fault,detail:'Paro detiene el motor.'},
  {id:'restart',pass:!frame()&&!state.fault,detail:'Soltar paro no provoca un rearranque.'},
  {id:'thermal',pass:!frame({[start.id]:true},{[thermal.id]:false})&&!state.fault,detail:'El disparo térmico de práctica impide la marcha.'},
  {id:'guard',pass:!frame({[start.id]:true},{[guard.id]:false})&&!state.fault,detail:'El guardamotor abierto interrumpe la potencia.'}];
 const permit=partFor(b,'permit');if(permit)results.push({id:'permit',pass:!frame({[start.id]:true},{[permit.id]:false})&&!state.fault,detail:'Sin permiso del proceso, el programa impide la marcha.'});
 return results;
}
export function testCurrent(b:Board,project?:LabProject){return !!b.cabinet?.test&&b.cabinet.test.signature===designSignature(b,project)&&b.cabinet.test.results.length===(programmed(b)?8:7)&&b.cabinet.test.results.every(r=>r.pass);}
export const FAULTS:{id:CabinetFault;title:string;symptom:string;wire:string;probe:CabinetProbe;explanation:string}[]=[
 {id:'return',title:'Retorno de bobina abierto',symptom:'Al pulsar marcha, la bobina no actúa y la bomba sigue detenida.',wire:'W25',probe:'coil',explanation:'La ruta de retorno de A2 no llega al polo negativo del mando.'},
 {id:'holding',title:'Ruta de retención abierta',symptom:'La bomba funciona mientras mantienes marcha, pero se detiene al soltar.',wire:'W27',probe:'retention',explanation:'El auxiliar no completa la ruta que mantiene alimentada la bobina.'},
 {id:'phase',title:'Salida de una fase abierta',symptom:'La bobina actúa, pero el modelo detecta alimentación incompleta del motor.',wire:'W14',probe:'windings',explanation:'La salida V de la bornera no llega al devanado correspondiente.'},
 {id:'earth',title:'Protección PE incompleta',symptom:'La función parece responder, pero no se supera la comprobación de protección.',wire:'W19',probe:'pe',explanation:'El motor queda sin el enlace PE previsto. La marcha no acredita esta conexión.'},
 {id:'program',title:'Retención ausente del programa',symptom:'Las conexiones están completas, pero la salida del controlador se pierde al soltar marcha.',wire:'',probe:'retention',explanation:'El programa debe conservar la orden mientras se cumplan los permisos.'},
];
export const faultsFor=(b:Board)=>FAULTS.filter(f=>programmed(b)?f.id!=='holding':f.id!=='program');
export function injectFault(b:Board,kind:CabinetFault,project?:LabProject):Board{
 if(!b.cabinet||b.cabinet.fault||!faultsFor(b).some(f=>f.id===kind)||!cabinetChecks(b,project).every(c=>c.pass)||!testCurrent(b,project))throw new Error('Completa las verificaciones y una prueba vigente antes de introducir otra falla.');
 const target=kind==='program'?null:kind==='return'?wiringPlan(b).find(w=>w.from.part===b.cabinet!.roles.contactor&&w.from.port==='A2')!:wiringPlan(b).find(w=>w.label===FAULTS.find(f=>f.id===kind)!.wire)!;
 const {test:_test,...cabinet}=b.cabinet;
 return {...b,wires:target?b.wires.filter(w=>pair(w.from,w.to)!==pair(target.from,target.to)):b.wires,cabinet:{...cabinet,step:'diagnose',fault:{kind}}};
}
export const PROBES:{id:CabinetProbe;title:string}[]=[{id:'coil',title:'Medir bobina con marcha'},{id:'retention',title:'Probar al soltar marcha'},{id:'windings',title:'Consultar devanados'},{id:'pe',title:'Comprobar ruta PE'}];
export function probe(b:Board,id:CabinetProbe,project?:LabProject):string{
 const start=partFor(b,'start'),coil=partFor(b,'contactor'),motor=partFor(b,'motor');if(!start||!coil||!motor)return 'Faltan equipos del encargo.';
 const run=experiment(b,project);let s=run.step({[start.id]:true});
 if(s.fault)return 'El cálculo detecta: '+s.fault;
 const voltage=(part:string,a:string,z:string)=>{const x=s.volts[key({part,port:a})],y=s.volts[key({part,port:z})];return x&&y?Math.hypot(x.r-y.r,x.i-y.i).toFixed(1)+' V':'sin referencia suficiente';};
 if(id==='coil')return 'A1-A2 con marcha: '+voltage(coil.id,'A1','A2')+'. Lectura virtual del modelo.';
 if(id==='windings')return ['U','V','W'].map(p=>p+'1-'+p+'2: '+voltage(motor.id,p+'1',p+'2')).join(' · ')+'. Valores equivalentes.';
 if(id==='retention'){const during=!!s.readings[motor.id]?.active;s=run.step();return `Durante marcha: ${during?'activo':'detenido'}. Al soltar: ${s.readings[motor.id]?.active?'activo':'detenido'}.`;}
 const pe=wiringPlan(b).filter(w=>w.route==='pe').every(p=>b.wires.some(w=>pair(p.from,p.to)===pair(w.from,w.to)));
 return pe&&b.cabinet?.fixtures.bond?'Ruta PE del encargo completa en el modelo.':'Ruta PE del encargo incompleta. Esta comprobación virtual no es una medición física.';
}
export function finishRepair(b:Board,project?:LabProject):Board{
 const c=b.cabinet,f=c?.fault,expected=f&&FAULTS.find(item=>item.id===f.kind);
 if(!c||!f||!expected||f.answer!==f.kind||f.probe!==expected.probe)throw new Error('Relaciona la hipótesis con la comprobación adecuada antes de cerrar el diagnóstico.');
 if(!cabinetChecks(b,project).every(c=>c.pass))throw new Error('La corrección todavía no cumple todas las verificaciones del encargo.');
 const results=functionalTest(b,project);if(!results.every(r=>r.pass))throw new Error('La función todavía no supera la prueba posterior a la reparación.');
 const {fault:_fault,...cabinet}=c;
 return {...b,cabinet:{...cabinet,test:{signature:designSignature(b,project),at:new Date().toISOString(),results},repairs:[...c.repairs.slice(-19),{kind:f.kind,probe:f.probe,at:new Date().toISOString()}]}};
}
