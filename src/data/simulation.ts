import {MODULES,TERMINALS} from './panel';
import type {BananaCable} from './practice';
import {INVERSION_LESSON,SIMPLE_LESSON,TWO_CONTACTOR_LESSON} from './lessons';
import {applyContactFaults,coilHolds,effectiveWires,faultsOf,hasFault,needsNumericControl,type PanelFault} from './panelFaults';
import {controlVoltages} from './panelFaultControl';
import {earthGaps,earthGapText} from './panelEarth';

/** Contactores del banco: KM1, KM2 y los que se añadan (KM3…). Se consulta cada vez porque el usuario puede añadir paneles. */
export const contactorIds=():string[]=>MODULES.filter(m=>m.category==='contactores').map(m=>m.id);
/** Temporizadores neumáticos (retardo a la conexión): el base y los que se añadan. */
export const timerIds=():string[]=>MODULES.filter(m=>m.category==='temporizadores').map(m=>m.id);
/** Bobinas del banco: contactores y temporizadores. Los dos siguen el mismo ciclo de energizado. */
export const relayIds=():string[]=>[...contactorIds(),...timerIds()];
export type ContactorId=string;
export type SimulationInput={enabled:boolean;plugged:boolean;forceBreaker:boolean;breakers:[boolean,boolean];pressed:string[];thermalTripped:boolean;powerContacts?:RelayState;/** El banco no energiza mientras la TP de algún módulo no llegue a la de la fuente. */earthRequired?:boolean;/** Fallas de laboratorio inyectadas (ya resueltas en el tiempo). */faults?:readonly PanelFault[]};
export type RelayState=Record<ContactorId,boolean>;
export const OFF_RELAYS=():RelayState=>Object.fromEntries(relayIds().map(id=>[id,false]));
export const sameRelays=(a:RelayState,b:RelayState)=>relayIds().every(id=>!!a[id]===!!b[id]);
export const emptySimulation=():SimulationInput=>({enabled:false,plugged:false,forceBreaker:false,breakers:[false,false],pressed:[],thermalTripped:false});
/** Estado del motor trifásico: gira solo si las tres fases llegan a U1 V1 W1 y las bobinas forman estrella o triángulo. */
export type MotorState={status:'off'|'running'|'fault';connection:'star'|'delta'|null;direction:1|-1;speed:number;message:string;lines:('R'|'S'|'T'|null)[]};
export const IDLE_MOTOR:MotorState={status:'off',connection:null,direction:1,speed:0,message:'Sin tensión de fuerza.',lines:[null,null,null]};
export type SimulationResult={powered:boolean;fault:'short'|'unstable'|'phase-short'|null;relays:RelayState;pilots:boolean[];liveTerminals:string[];liveWireIds:string[];closedContacts:[string,string][];motor:MotorState};

/** Explicit teaching model, separate from cable-only topology and source-photo confidence. */
/**
 * `timed` lista los temporizadores cuyo retardo ya transcurrió. Retardo a la conexión (ON DELAY): al energizar la bobina,
 * 13-14 cierra al instante y, pasado el tiempo, 55-56 (NC) abre y 67-68 (NA) cierra; al perder la bobina todo vuelve a reposo.
 */
export function simulationContacts(input:SimulationInput,relays:RelayState,timed:readonly string[]=[]):[string,string][]{
 const pairs:[string,string][]=[];
 for(const s of ['S1','S2','S3'])pairs.push(input.pressed.includes(s)?[`BOTONERAS:${s}:3`,`BOTONERAS:${s}:4`]:[`BOTONERAS:${s}:1`,`BOTONERAS:${s}:2`]);
 // With `powerContacts`, a pole still in its pickup delay or open-transition gap is open: never fall back to the coil.
 for(const id of contactorIds()){
  const closed=!!relays[id];
  for(const [a,b] of closed?[['13','14'],['63','64'],['93','94']]:[['71','72'],['81','82']])pairs.push([`${id}:${a}`,`${id}:${b}`]);
  if(input.powerContacts?!!input.powerContacts[id]:closed)for(const i of [1,2,3])pairs.push([`${id}:L${i}`,`${id}:T${i}`]);
 }
 for(const id of timerIds()){
  const on=!!relays[id],done=on&&timed.includes(id);
  // This bank module is a contactor with a pneumatic timing attachment: its power poles act immediately.
  if(input.powerContacts?!!input.powerContacts[id]:on)for(const i of [1,2,3])pairs.push([`${id}:L${i}`,`${id}:T${i}`]);
  if(on)pairs.push([`${id}:13`,`${id}:14`]);
  pairs.push(done?[`${id}:67`,`${id}:68`]:[`${id}:55`,`${id}:56`]);
 }
 pairs.push(input.thermalTripped?['CONTACTOR_TERMICO:97','CONTACTOR_TERMICO:98']:['CONTACTOR_TERMICO:95','CONTACTOR_TERMICO:96']);
 // KM2 95/96 presence is user-confirmed; their internal function remains unmodelled.
 // Pilot returns are loads against BOTONERAS:N, never a conductor shorting a lamp.
 return applyContactFaults(pairs,faultsOf(input));
}
function graph(wires:BananaCable[],pairs:[string,string][],faults:readonly PanelFault[]=[]){
 const parent=new Map(TERMINALS.map(t=>[t.key,t.key]));
 const root=(id:string):string=>{const p=parent.get(id);if(!p)return id;if(p!==id)parent.set(id,root(p));return parent.get(id)!};
 const join=(a:string,b:string)=>{if(parent.has(a)&&parent.has(b))parent.set(root(b),root(a))};
 const eff=effectiveWires(wires,faults);eff.ideal.forEach(w=>join(w.from.terminalId,w.to.terminalId));eff.resistive.forEach(w=>join(w.a,w.b));pairs.forEach(([a,b])=>join(a,b));
 const phase=root('FUENTE:F'),neutral=root('FUENTE:N'),phases=['FUENTE:R','FUENTE:S','FUENTE:T'].map(root);
 const voltage=(a:string,b:string)=>phase!==neutral&&((root(a)===phase&&root(b)===neutral)||(root(a)===neutral&&root(b)===phase));
 return {root,phase,neutral,phases,voltage};
}
type ControlResult=Omit<SimulationResult,'motor'>;
function solveControl(wires:BananaCable[],input:SimulationInput,previous:RelayState=OFF_RELAYS(),timed:readonly string[]=[]):ControlResult{
 const off=(fault:ControlResult['fault']=null):ControlResult=>({powered:false,fault,relays:OFF_RELAYS(),pilots:[false,false,false,false],liveTerminals:[],liveWireIds:[],closedContacts:[]});
 if(!input.enabled||!input.plugged||!input.breakers.every(Boolean))return off();
 let relays={...previous};const seen=new Set<string>(),faults=faultsOf(input);
 for(let i=0;i<16;i++){
  const ids=relayIds(),signature=ids.map(id=>Number(!!relays[id])).join('');
  if(seen.has(signature))return off('unstable');seen.add(signature);
  const contacts=simulationContacts(input,relays,timed),g=graph(wires,contacts,faults);
  if(g.phase===g.neutral)return off('short');
  const next=Object.fromEntries(ids.map(id=>[id,g.voltage(`${id}:A1`,`${id}:A2`)])) as RelayState;
  /* Fallas de bobina: abierta no cierra nunca; con tensión degradada cierra solo si alcanza (≈85 %) y se mantiene hasta ≈50 %. */
  let lamps:(number|null)[]|null=null;
  if(faults.length){for(const f of faults)if(f.kind==='coil-open')next[f.relay]=false;if(needsNumericControl(faults)){const v=controlVoltages(wires,input,relays,timed);lamps=v.pilot;for(const id of ids)if(next[id])next[id]=coilHolds(v.relay[id],!!relays[id]);}}
  if(ids.every(id=>next[id]===!!relays[id])){
   const pilots=[1,2,3,4].map(n=>g.voltage(`BOTONERAS:PILOTO_${n}`,'BOTONERAS:N')&&!faults.some(f=>f.kind==='pilot-burnt'&&f.n===n)&&(!lamps||coilHolds(lamps[n-1],true)));
   const liveTerminals=TERMINALS.filter(t=>g.root(t.key)===g.phase).map(t=>t.key);
   return {powered:true,fault:null,relays,pilots,liveTerminals,liveWireIds:wires.filter(w=>liveTerminals.includes(w.from.terminalId)).map(w=>w.id),closedContacts:contacts};
  }
  relays=next;
 }
 return off('unstable');
}

const MOTOR='BORNERA_MOTOR:';
const SEQUENCES=['RST','STR','TRS'];
/** Circuito de fuerza: R, S y T llegan al motor a través de los contactos que estén cerrados. No calcula corrientes. */
function solveMotor(wires:BananaCable[],input:SimulationInput,relays:RelayState,timed:readonly string[]=[]):{motor:MotorState;live:string[];short?:boolean}{
 const idle=(message:string,status:MotorState['status']='off'):{motor:MotorState;live:string[]}=>({motor:{...IDLE_MOTOR,status,message},live:[]});
 if(!input.enabled)return idle('Simulación detenida.');
 if(!input.plugged)return idle('Enchufa la corriente virtual en el módulo de alimentación.');
 if(!input.forceBreaker)return idle('Cierra el interruptor FUERZA para energizar R, S y T.');
 const faults=faultsOf(input),g=graph(wires,simulationContacts(input,relays,timed),faults),[r,s,t]=g.phases;
 if(new Set([r,s,t]).size<3)return {...idle('Cortocircuito entre fases: algún cable une R, S o T. Retíralo.','fault'),short:true};
 const label=(id:string):'R'|'S'|'T'|null=>{const x=g.root(MOTOR+id);return x===r?'R':x===s?'S':x===t?'T':null};
 const live=TERMINALS.filter(x=>[r,s,t].includes(g.root(x.key))).map(x=>x.key);
 const lines=['U1','V1','W1'].map(label),ends=['U2','V2','W2'].map(label);
 const same=(a:string,b:string)=>g.root(MOTOR+a)===g.root(MOTOR+b);
 const fed=lines.filter(Boolean).length;
 if(!fed&&!ends.some(Boolean))return {motor:{...IDLE_MOTOR,message:'El motor no recibe tensión: lleva R, S y T al contactor y su salida a U1, V1 y W1.'},live};
 if(fed<3)return {motor:{...IDLE_MOTOR,status:'fault',lines,message:`Falta una fase: solo ${fed} de los 3 bornes U1, V1 y W1 reciben tensión.`},live};
 if(new Set(lines).size<3)return {motor:{...IDLE_MOTOR,status:'fault',lines,message:'Dos bornes reciben la misma fase: el motor necesita R, S y T distintas.'},live};
 const direction=(SEQUENCES.includes(lines.join(''))?1:-1)*(hasFault(faults,'sequence-reversed')?-1:1) as 1|-1;
 const star=same('U2','V2')&&same('V2','W2')&&ends.every(e=>e===null);
 const delta=same('U1','W2')&&same('V1','U2')&&same('W1','V2');
 const openWinding=faults.find(f=>f.kind==='winding-open');
 if(openWinding&&openWinding.kind==='winding-open'&&(star||delta))return {motor:{status:'fault',connection:star?'star':'delta',direction,speed:0,message:`Devanado ${openWinding.phase}1–${openWinding.phase}2 abierto: el motor zumba, no gira y las otras dos bobinas se recalientan.`,lines},live};
 if(star)return {motor:{status:'running',connection:'star',direction,speed:.55,message:'Girando en estrella: cada bobina recibe tensión reducida.',lines},live};
 if(delta)return {motor:{status:'running',connection:'delta',direction,speed:1,message:'Girando en triángulo: cada bobina recibe la tensión de línea.',lines},live};
 return {motor:{...IDLE_MOTOR,status:'fault',lines,message:'Bobinas sin cerrar: une W2-U2-V2 (estrella) o U1-W2, V1-U2 y W1-V2 (triángulo).'},live};
}
export function solveSimulation(wires:BananaCable[],input:SimulationInput,previous:RelayState=OFF_RELAYS(),timed:readonly string[]=[]):SimulationResult{
 if(input.earthRequired&&input.enabled&&input.plugged){const gaps=earthGaps(wires,faultsOf(input));if(gaps.length)return {powered:false,fault:null,relays:OFF_RELAYS(),pilots:[false,false,false,false],liveTerminals:[],liveWireIds:[],closedContacts:[],motor:{...IDLE_MOTOR,message:earthGapText(gaps)}};}
 const base=solveControl(wires,input,previous,timed),force=solveMotor(wires,input,base.relays,timed);
 if(force.short)return {...base,powered:false,fault:'phase-short',relays:OFF_RELAYS(),pilots:[false,false,false,false],liveTerminals:[],liveWireIds:[],closedContacts:[],motor:force.motor};
 if(!force.live.length)return {...base,motor:force.motor};
 const liveTerminals=[...new Set([...base.liveTerminals,...force.live])];
 return {...base,motor:force.motor,liveTerminals,liveWireIds:wires.filter(w=>liveTerminals.includes(w.from.terminalId)).map(w=>w.id)};
}

/** Per-session cache for the immutable cable arrays used by the React runtime.
 * The logical circuit does not depend on RPM or elapsed time. Resolved faults,
 * switches, timers, physical contacts and module inventory are all part of the key.
 * AC currents, motor dynamics and thermal integration continue at every tick. */
export function createSimulationSolver(){
 let topology:BananaCable[]|null=null;
 const cache=new Map<string,SimulationResult>();
 return (wires:BananaCable[],input:SimulationInput,previous:RelayState=OFF_RELAYS(),timed:readonly string[]=[]):SimulationResult=>{
  if(topology!==wires){topology=wires;cache.clear();}
  const key=JSON.stringify([input,previous,timed,MODULES.map(m=>[m.id,m.category]),TERMINALS.length]);
  const cached=cache.get(key);if(cached)return cached;
  const result=solveSimulation(wires,input,previous,timed);
  if(cache.size>=16)cache.delete(cache.keys().next().value!);
  cache.set(key,result);return result;
 };
}

/** Optional example: user-installed cables remain untouched unless this is explicitly loaded. */
export const SIMULATION_EXAMPLES={
 lamp:{title:'Piloto con pulsador',pairs:[['FUENTE:F','BOTONERAS:S3:3'],['BOTONERAS:S3:4','BOTONERAS:PILOTO_4'],['FUENTE:N','BOTONERAS:N']]},
 hold:{title:'Marcha, mantenimiento y parada',pairs:[
  ['FUENTE:F','CONTACTOR_TERMICO:95'],['CONTACTOR_TERMICO:96','BOTONERAS:S2:1'],['BOTONERAS:S2:2','BOTONERAS:S3:3'],
  ['BOTONERAS:S3:3','CONTACTOR_TERMICO:13'],['BOTONERAS:S3:4','CONTACTOR_TERMICO:14'],['CONTACTOR_TERMICO:14','CONTACTOR_TERMICO:A1'],
  ['CONTACTOR_TERMICO:A1','BOTONERAS:PILOTO_4'],['CONTACTOR_TERMICO:A2','FUENTE:N'],['FUENTE:N','BOTONERAS:N'],
  ['CONTACTOR_TERMICO:96','CONTACTOR_TERMICO:71'],['CONTACTOR_TERMICO:72','BOTONERAS:PILOTO_2'],
  ['FUENTE:F','CONTACTOR_TERMICO:97'],['CONTACTOR_TERMICO:98','BOTONERAS:PILOTO_3']
 ]},
 motor:{title:'Arranque del motor con KM1',pairs:[
  ['FUENTE:F','CONTACTOR_TERMICO:95'],['CONTACTOR_TERMICO:96','BOTONERAS:S2:1'],['BOTONERAS:S2:2','BOTONERAS:S3:3'],
  ['BOTONERAS:S3:3','CONTACTOR_TERMICO:13'],['BOTONERAS:S3:4','CONTACTOR_TERMICO:14'],['CONTACTOR_TERMICO:14','CONTACTOR_TERMICO:A1'],
  ['CONTACTOR_TERMICO:A2','FUENTE:N'],['FUENTE:N','BOTONERAS:N'],
  ['FUENTE:R','CONTACTOR_TERMICO:L1'],['FUENTE:S','CONTACTOR_TERMICO:L2'],['FUENTE:T','CONTACTOR_TERMICO:L3'],
  ['CONTACTOR_TERMICO:T1','BORNERA_MOTOR:U1'],['CONTACTOR_TERMICO:T2','BORNERA_MOTOR:V1'],['CONTACTOR_TERMICO:T3','BORNERA_MOTOR:W1'],
  ['BORNERA_MOTOR:W2','BORNERA_MOTOR:U2'],['BORNERA_MOTOR:U2','BORNERA_MOTOR:V2']
 ]},
 motorRev:{title:'Motor con giro invertido (dos fases cruzadas)',pairs:[
  ['FUENTE:F','CONTACTOR_TERMICO:95'],['CONTACTOR_TERMICO:96','BOTONERAS:S2:1'],['BOTONERAS:S2:2','BOTONERAS:S3:3'],
  ['BOTONERAS:S3:3','CONTACTOR_TERMICO:13'],['BOTONERAS:S3:4','CONTACTOR_TERMICO:14'],['CONTACTOR_TERMICO:14','CONTACTOR_TERMICO:A1'],
  ['CONTACTOR_TERMICO:A2','FUENTE:N'],['FUENTE:N','BOTONERAS:N'],
  ['FUENTE:R','CONTACTOR_TERMICO:L1'],['FUENTE:S','CONTACTOR_TERMICO:L2'],['FUENTE:T','CONTACTOR_TERMICO:L3'],
  ['CONTACTOR_TERMICO:T1','BORNERA_MOTOR:V1'],['CONTACTOR_TERMICO:T2','BORNERA_MOTOR:U1'],['CONTACTOR_TERMICO:T3','BORNERA_MOTOR:W1'],
  ['BORNERA_MOTOR:W2','BORNERA_MOTOR:U2'],['BORNERA_MOTOR:U2','BORNERA_MOTOR:V2']
 ]},
 simple:{title:'Marcha y paro con retención (el más simple, de un compañero)',pairs:SIMPLE_LESSON.pairs},
 inversion:{title:'Inversión de giro con enclavamiento y paro (circuito de un compañero)',pairs:INVERSION_LESSON.pairs},
 /* Mismo montaje que la lección de dos contactores y temporizador (41 cables del armado final de Matías). KT1 = principal con temporizador; KM2 = estrella; KM1 = triángulo. */
 starDelta:{title:'Estrella-triángulo de Matías · 2 contactores y temporizador',pairs:TWO_CONTACTOR_LESSON.pairs},
 starDeltaThree:{title:'Estrella-triángulo · 3 contactores + temporizador separado',needs:['CONTACTOR_TRIFASICO_3'],pairs:[
  // Mando: F → térmico → parada → marcha con retención en KM1. KM1:14 alimenta al temporizador y a los dos contactores de conmutación.
  ['FUENTE:F','CONTACTOR_TERMICO:95'],['CONTACTOR_TERMICO:96','BOTONERAS:S2:1'],['BOTONERAS:S2:2','BOTONERAS:S3:3'],
  ['BOTONERAS:S3:3','CONTACTOR_TERMICO:13'],['BOTONERAS:S3:4','CONTACTOR_TERMICO:14'],['CONTACTOR_TERMICO:14','CONTACTOR_TERMICO:A1'],
  ['CONTACTOR_TERMICO:A2','FUENTE:N'],['FUENTE:N','BOTONERAS:N'],
  ['CONTACTOR_TERMICO:14','TEMPORIZADOR_1:A1'],['TEMPORIZADOR_1:A2','FUENTE:N'],
  // Estrella (KM3): KT 55-56 (cae al terminar el retardo) y enclavamiento con KM2 71-72
  ['CONTACTOR_TERMICO:14','TEMPORIZADOR_1:55'],['TEMPORIZADOR_1:56','CONTACTOR_TRIFASICO:71'],['CONTACTOR_TRIFASICO:72','CONTACTOR_TRIFASICO_3:A1'],['CONTACTOR_TRIFASICO_3:A2','FUENTE:N'],
  // Triángulo (KM2): KT 67-68 (cierra al terminar) y enclavamiento con KM3 71-72
  ['CONTACTOR_TERMICO:14','TEMPORIZADOR_1:67'],['TEMPORIZADOR_1:68','CONTACTOR_TRIFASICO_3:71'],['CONTACTOR_TRIFASICO_3:72','CONTACTOR_TRIFASICO:A1'],['CONTACTOR_TRIFASICO:A2','FUENTE:N'],
  // Fuerza: KM1 alimenta U1 V1 W1
  ['FUENTE:R','CONTACTOR_TERMICO:L1'],['FUENTE:S','CONTACTOR_TERMICO:L2'],['FUENTE:T','CONTACTOR_TERMICO:L3'],
  ['CONTACTOR_TERMICO:T1','BORNERA_MOTOR:U1'],['CONTACTOR_TERMICO:T2','BORNERA_MOTOR:V1'],['CONTACTOR_TERMICO:T3','BORNERA_MOTOR:W1'],
  // Triángulo: KM2 une U1-W2, V1-U2, W1-V2
  ['BORNERA_MOTOR:U1','CONTACTOR_TRIFASICO:L1'],['BORNERA_MOTOR:V1','CONTACTOR_TRIFASICO:L2'],['BORNERA_MOTOR:W1','CONTACTOR_TRIFASICO:L3'],
  ['CONTACTOR_TRIFASICO:T1','BORNERA_MOTOR:W2'],['CONTACTOR_TRIFASICO:T2','BORNERA_MOTOR:U2'],['CONTACTOR_TRIFASICO:T3','BORNERA_MOTOR:V2'],
  // Estrella: KM3 cierra W2-U2-V2 entre sí
  ['BORNERA_MOTOR:W2','CONTACTOR_TRIFASICO_3:L1'],['BORNERA_MOTOR:U2','CONTACTOR_TRIFASICO_3:L2'],['BORNERA_MOTOR:V2','CONTACTOR_TRIFASICO_3:L3'],
  ['CONTACTOR_TRIFASICO_3:T1','CONTACTOR_TRIFASICO_3:T2'],['CONTACTOR_TRIFASICO_3:T2','CONTACTOR_TRIFASICO_3:T3']
 ]},
 motorDelta:{title:'Motor en triángulo',pairs:[
  ['FUENTE:F','CONTACTOR_TERMICO:95'],['CONTACTOR_TERMICO:96','BOTONERAS:S2:1'],['BOTONERAS:S2:2','BOTONERAS:S3:3'],
  ['BOTONERAS:S3:3','CONTACTOR_TERMICO:13'],['BOTONERAS:S3:4','CONTACTOR_TERMICO:14'],['CONTACTOR_TERMICO:14','CONTACTOR_TERMICO:A1'],
  ['CONTACTOR_TERMICO:A2','FUENTE:N'],['FUENTE:N','BOTONERAS:N'],
  ['FUENTE:R','CONTACTOR_TERMICO:L1'],['FUENTE:S','CONTACTOR_TERMICO:L2'],['FUENTE:T','CONTACTOR_TERMICO:L3'],
  ['CONTACTOR_TERMICO:T1','BORNERA_MOTOR:U1'],['CONTACTOR_TERMICO:T2','BORNERA_MOTOR:V1'],['CONTACTOR_TERMICO:T3','BORNERA_MOTOR:W1'],
  ['BORNERA_MOTOR:U1','BORNERA_MOTOR:W2'],['BORNERA_MOTOR:V1','BORNERA_MOTOR:U2'],['BORNERA_MOTOR:W1','BORNERA_MOTOR:V2']
 ]}
} satisfies Record<string,{title:string;pairs:[string,string][];/** Paneles adicionales que el ejemplo necesita en el banco. */needs?:string[]}>;
