import {validConditions,validActionProof,type MeasurementConditions,type ActionProof} from './activityTrace';
import matias from './activity2Matias.json';
import {LESSONS} from './lessons';
import {TERMINALS} from './panel';
import {ratingCompatibility} from './machinePreparation';
import {BANANA_COLOR,emptyPractice,type PracticeDocument,type BananaCable} from './practice';
import {readPanelMeter,type PanelReading} from './panelMeter';
import {panelElectrical,type PanelMeterModel} from './panelElectrical';
import type {SimulationInput,SimulationResult} from './simulation';
import {ACTIVITY_PROFILES,activityRoles,type ActivityProfile} from './measurementProfiles';
export {ACTIVITY_PROFILES,activityRoles,type ActivityProfile} from './measurementProfiles';
export type Phase='R'|'S'|'T';
export type ActivityStage='cold'|'control'|'control-rest'|'control-star'|'control-delta'|'control-trip'|'control-reset'|'powered-rest'|'supply'|'star'|'delta'|'trip'|'reset'|'off';
export type ActivityStep={id:string;title:string;page:number;point:string;why:string;task:string;stage:ActivityStage;kind:'meter'|'clamp'|'action'|'compare';mode?:'V'|'R'|'C';red?:string;black?:string;phase?:Phase;table?:string;expected?:'open'|'low'};

export const isForceTerminal=(id:string)=>/^FUENTE:[RST]$|^BORNERA_MOTOR:|:[LT][123]$|:TP/.test(id);
export const isForceWire=(w:BananaCable)=>isForceTerminal(w.from.terminalId)||isForceTerminal(w.to.terminalId);
export function activityDocument(profile:ActivityProfile,scope:'control'|'full'='full'):PracticeDocument{
 const wires:BananaCable[]=[];
 if(profile!=='matias')for(const [from,to] of (profile==='twoContactors'?LESSONS.estrellaDosContactores:LESSONS.estrellaManual).pairs)wires.push({id:crypto.randomUUID(),from:{terminalId:from},to:{terminalId:to},color:BANANA_COLOR,route:{sag:130},layer:wires.length+1});
 else wires.push(...structuredClone(matias.wires));
 return {...emptyPractice(),title:`Actividad 2 · mediciones · ${profile==='twoContactors'?'panel de dos contactores':profile==='manual'?'guía manual':'Matías'}`,wires:scope==='control'?wires.filter(w=>!isForceWire(w)):wires,diagram:profile==='twoContactors'?LESSONS.estrellaDosContactores.diagram:profile==='manual'?LESSONS.estrellaManual.diagram:emptyPractice().diagram};
}
/** Compare cable-only partitions. No internal contact or winding is merged. */
export function matchesActivity(profile:ActivityProfile,wires:BananaCable[],scope:'control'|'full'='full'){
 const reference=profile!=='matias'?(profile==='twoContactors'?LESSONS.estrellaDosContactores:LESSONS.estrellaManual).pairs.map(([from,to])=>({from:{terminalId:from},to:{terminalId:to}})):matias.wires;
 const ids=[...new Set([...TERMINALS.map(t=>t.key),...reference.flatMap(w=>[w.from.terminalId,w.to.terminalId])])],known=new Set(ids);
 if(wires.some(w=>!known.has(w.from.terminalId)||!known.has(w.to.terminalId)))return false;
 const domain=scope==='control'?ids.filter(id=>!isForceTerminal(id)):ids;
 if(scope==='control'&&wires.some(w=>isForceTerminal(w.from.terminalId)!==isForceTerminal(w.to.terminalId)))return false;
 const partition=(ws:{from:{terminalId:string};to:{terminalId:string}}[])=>{const parent=new Map(ids.map(id=>[id,id]));const root=(id:string):string=>{const p=parent.get(id)!;if(p!==id)parent.set(id,root(p));return parent.get(id)!;};ws.forEach(w=>parent.set(root(w.from.terminalId),root(w.to.terminalId)));const groups=new Map<string,string[]>();domain.forEach(id=>{const key=root(id);groups.set(key,[...(groups.get(key)??[]),id]);});return [...groups.values()].map(g=>g.sort().join('|')).sort().join(';');};
 return partition(wires)===partition(reference);
}
const meter=(id:string,title:string,page:number,point:string,stage:ActivityStage,mode:'V'|'R'|'C',red:string,black:string,why:string,table?:string,expected?:'open'|'low'):ActivityStep=>({id,title,page,point,stage,mode,red,black,why,table,expected,kind:'meter',task:`Selecciona ${mode==='V'?'V~':mode==='R'?'Ω':'continuidad'}. Coloca las puntas en los dos bornes indicados y escribe lo que lees.`});
export const ACTIVITY_STEPS:ActivityStep[]=[
 meter('thermal','Continuidad del térmico',4,'4 y 11','cold','C','CONTACTOR_TERMICO:95','CONTACTOR_TERMICO:96','Antes de energizar, comprueba el contacto NC 95–96 en reposo. El tono y la baja resistencia indican un camino cerrado.',undefined,'low'),
 meter('stop','Continuidad del paro',4,'4','cold','C','BOTONERAS:S2:1','BOTONERAS:S2:2','SB1 del dibujo es S2 en el banco. Su par NC 1–2 está cerrado en reposo.',undefined,'low'),
 meter('start-open','Reconocer un auxiliar NA libre',4,'Preparación adicional','cold','C','CONTACTOR_TRIFASICO:63','CONTACTOR_TRIFASICO:64','El auxiliar NA de reserva 63–64 de KM2 está sin cablear en ambos montajes y abierto en reposo. Así evitas confundir el contacto abierto con rutas paralelas del circuito: OL no significa un fallo del instrumento.',undefined,'open'),
 meter('contact-ohms','Resistencia de un contacto cerrado',4,'Preparación adicional','cold','R','CONTACTOR_TERMICO:95','CONTACTOR_TERMICO:96','Práctica adicional de Ω: la guía pide continuidad, no una tabla de resistencias. El modelo incluye 0,2 Ω por punta y 0,02 Ω por contacto; no es una resistencia real de placa.',undefined,'low'),
 meter('control-volts','Voltaje de alimentación del mando',5,'5','control','V','FUENTE:F','FUENTE:N','En el banco virtual el secundario F–N es de 24 V~. La guía usa alimentación monofásica; no confundas estos 24 V didácticos con su red monofásica.'),
 {id:'control-rest',title:'Mando · piloto de motor detenido',page:6,point:'6',stage:'control-rest',kind:'action',why:'La guía comprueba primero el circuito de mando, sin habilitar fuerza. El piloto rojo P2 debe indicar reposo.',task:'Mantén FUERZA abierta. Con el mando alimentado y sin pulsar marcha, observa P2 rojo encendido.'},
 {id:'control-star',title:'Mando · orden de partir en estrella',page:6,point:'7',stage:'control-star',kind:'action',why:'En el esquema del profesor, SB2 activa KM1 y KM3. Se apaga el rojo y se enciende el verde de estrella; con FUERZA abierta el motor aún no gira.',task:'Sin cerrar FUERZA, pulsa y suelta S1 (SB2 del profesor). Comprueba las bobinas y el piloto de estrella.'},
 {id:'control-delta',title:'Mando · orden de conexión triángulo',page:7,point:'8',stage:'control-delta',kind:'action',why:'En la guía, KM1 se mantiene, KM3 cae y entra KM2. La señal pasa del verde de estrella al de triángulo, todavía sin fuerza.',task:'En el manual pulsa S3 (SB3). En la variante opcional de Matías espera el temporizador. Mantén FUERZA abierta.'},
 {id:'control-trip',title:'Mando · prueba TEST del térmico',page:7,point:'9',stage:'control-trip',kind:'action',why:'El profesor comprueba el disparo antes de montar fuerza: caen las bobinas, se apagan los verdes y se encienden amarillo y rojo.',task:'Pulsa TEST del térmico y verifica el corte de las bobinas y los dos pilotos de aviso.'},
 {id:'control-reset',title:'Mando · RESET y vuelta al reposo',page:7,point:'10',stage:'control-reset',kind:'action',why:'RESET apaga el amarillo y mantiene el rojo. Rearmar no es una nueva orden de marcha.',task:'Rearma el térmico. Comprueba que solo el piloto rojo queda encendido y las bobinas siguen desactivadas.'},
 meter('force-continuity','Fuerza · comprobar continuidad antes de energizar',8,'11','cold','C','FUENTE:R','CONTACTOR_TERMICO:L1','Con las alimentaciones desconectadas, comprueba el cable desde R a la entrada L1 del contactor principal. No confundas este cable con el polo interno L1–T1.',undefined,'low'),
 ...([['R','S'],['R','T'],['S','T']] as const).map(([a,b])=>meter(`line-${a}${b}`,`Voltaje entre fases ${a}–${b}`,8,'12','supply','V',`FUENTE:${a}`,`FUENTE:${b}`,'Las dos puntas van entre fases, en paralelo. No uses TP ni el N del mando como referencia de fuerza. El modelo parte de 380 V entre fases.','Tabla 1')),
 {id:'powered-rest',title:'Fuerza y mando · motor detenido',page:8,point:'13',stage:'powered-rest',kind:'action',why:'Después de medir la alimentación trifásica, el profesor vuelve a habilitar el mando y verifica el piloto rojo antes de arrancar.',task:'Mantén FUERZA cerrada, vuelve a cerrar ambos CONTROL y verifica P2 rojo y el motor detenido.'},
 {id:'start-star',title:'Poner el motor en estrella',page:8,point:'14',stage:'star',kind:'action',why:'Reconoce primero qué contactores actúan. La lectura siguiente solo es válida cuando el motor está en estrella.',task:'Conecta la corriente virtual, cierra FUERZA y los dos CONTROL. Pulsa y suelta S1 (SB2 en la guía).'},
 ...(['U','V','W'] as const).map(p=>meter(`star-${p}`,`Estrella · devanado ${p}1–${p}2`,9,'15','star','V',`BORNERA_MOTOR:${p}1`,`BORNERA_MOTOR:${p}2`,'Mide entre los dos extremos de una misma bobina, no entre dos bornes superiores. En el modelo equilibrado esperas V de línea / √3.','Tabla 3')),
 ...(['R','S','T'] as const).map(phase=>({id:`star-current-${phase}`,title:`Estrella · corriente de línea ${phase}`,page:9,point:'16',stage:'star' as const,kind:'clamp' as const,phase,table:'Tabla 4',why:'La guía pide amperímetro de tenazas: abraza un solo conductor de entrada, antes de sus derivaciones. No conectes un multímetro en A entre fases.',task:'En la pinza virtual, elige el conductor de entrada solicitado y registra su lectura.'})),
 {id:'change-delta',title:'Cambiar a triángulo',page:9,point:'17',stage:'delta',kind:'action',why:'La guía manual mantiene KM1, desactiva KM3 y activa KM2. En Matías, KT1 permanece y el temporizador cambia de KM1 a KM2.',task:'En el montaje manual pulsa y suelta S3 (SB3). En Matías, reduce el retardo del temporizador y espera el cambio automático.'},
 ...(['U','V','W'] as const).map(p=>meter(`delta-${p}`,`Triángulo · devanado ${p}1–${p}2`,10,'18','delta','V',`BORNERA_MOTOR:${p}1`,`BORNERA_MOTOR:${p}2`,'Conserva la medición entre los extremos de la misma bobina. En triángulo cada devanado queda entre dos fases y recibe la tensión de línea.','Tabla 5')),
 ...(['R','S','T'] as const).map(phase=>({id:`delta-current-${phase}`,title:`Triángulo · corriente de línea ${phase}`,page:10,point:'19',stage:'delta' as const,kind:'clamp' as const,phase,table:'Tabla 6',why:'Vuelve a medir el mismo conductor de entrada, antes de las bifurcaciones. Compara con la corriente que registraste en estrella.',task:'Selecciona una sola fase en la pinza virtual y anota la corriente.'})),
 {id:'compare',title:'Comparar estrella y triángulo',page:10,point:'20',stage:'delta',kind:'compare',why:'Usa tus tablas para explicar cómo cambia la tensión de cada bobina y la corriente de entrada. El motor de inducción cambia su corriente con velocidad, carga y conexión. Registra en qué condición hiciste cada medición.',task:'Explica la relación VY ≈ VL/√3 y VΔ ≈ VL. Calcula IΔ/IY con tus datos. La relación 3 solo corresponde a la misma impedancia y tensión de red; no es universal entre dos estados de marcha.'},
 {id:'overload',title:'Comprobar la sobrecarga virtual',page:11,point:'21',stage:'trip',kind:'action',why:'TEST abre 95–96, corta el mando y debe detener el motor. El contacto 97–98 señaliza el disparo.',task:'Activa TEST del térmico y observa la parada y el aviso de sobrecarga.'},
 {id:'reset',title:'Rearmar el relé térmico',page:12,point:'22',stage:'reset',kind:'action',why:'RESET elimina el estado de disparo, pero no debe arrancar el motor por sí mismo.',task:'Rearma el térmico y verifica que el motor permanezca detenido.'},
 {id:'shutdown',title:'Desenergizar el banco',page:12,point:'23–24',stage:'off',kind:'action',why:'Guarda los resultados para revisión docente y deja el banco sin alimentación. La revisión del profesor se registra por separado en el cuaderno de entrega.',task:'Abre FUERZA y ambos CONTROL y desconecta el enchufe virtual. Descarga tus resultados en la pestaña Resultados.'},
 {id:'dismantle',title:'Desmontar y ordenar el panel',page:12,point:'25',stage:'off',kind:'action',why:'La guía termina desconectando los elementos. Tus mediciones se conservan al retirar los cables. Deshacer recupera el circuito.',task:'Con el banco sin alimentación, retira todos los cables o usa «Desmontar circuito». Después comprueba el cierre.'}
];
export function activityStep(profile:ActivityProfile,index:number):ActivityStep{
 const step=ACTIVITY_STEPS[index];
 if(profile==='twoContactors'){
  const changes:Record<string,Partial<ActivityStep>>={
   'start-open':{why:'El auxiliar NA 63–64 de KM2 queda libre en los 37 cables de este montaje y está abierto en reposo. Comprueba OL sin confundirlo con una falla del instrumento.'},
   'control-rest':{title:'Mando · reposo del montaje de dos contactores',why:'KT1, KM1 y KM2 están desactivados. P2 no está cableado en el montaje recibido; en reposo no hay pilotos activos.',task:'Alimenta solo el mando, sin cerrar FUERZA. Comprueba las bobinas desactivadas y los pilotos apagados.'},
   'control-star':{why:'S1 alimenta y retiene KT1. El contacto temporizado 55–56 da la orden a KM2, que conecta estrella; P1 indica esa orden. Con FUERZA abierta el motor todavía no gira.',task:'Con FUERZA abierta, pulsa y suelta S1. Comprueba KT1 y KM2 activos, KM1 desactivado y P1 encendido.'},
   'control-delta':{why:'KT1 se mantiene y su temporización abre estrella KM2 y ordena triángulo KM1. P1 se apaga y P4 se enciende; FUERZA sigue abierta.',task:'Espera el temporizador o reduce su retardo. Comprueba KT1 + KM1, KM2 desactivado y P4 encendido.'},
   'control-trip':{why:'TEST abre 95–96 y desactiva las bobinas. El contacto 97–98 enciende P3 amarillo; P2 no está cableado.',task:'Pulsa TEST: deben caer KT1, KM1 y KM2, apagarse P1/P4 y encenderse solamente P3.'},
   'control-reset':{why:'RESET rearma el térmico y apaga P3. No da marcha ni enciende un piloto rojo de reposo, porque P2 no está cableado.',task:'Rearma el térmico. Comprueba bobinas desactivadas y todos los pilotos apagados.'},
   'force-continuity':{black:'TEMPORIZADOR_1:L1',why:'El cable de entrada R llega a L1 del conjunto de línea KT1. Comprueba ese conductor sin confundirlo con el polo interno L1–T1.',task:'Desenchufa y abre FUERZA y los dos CONTROL. Mide continuidad entre R y KT1:L1.'},
   'powered-rest':{why:'Con las alimentaciones habilitadas, el montaje permanece detenido hasta dar marcha con S1. Los pilotos siguen apagados; no se añade P2 al circuito.',task:'Habilita FUERZA y ambos CONTROL sin pulsar marcha. Comprueba el motor y las bobinas en reposo.'},
   'start-star':{why:'En este montaje S1 inicia KT1 y KM2 (estrella). KM1 permanece desactivado hasta el cambio temporizado.',task:'Conecta la corriente, cierra FUERZA y los dos CONTROL. Pulsa y suelta S1; comprueba la retención en estrella.'},
   'change-delta':{why:'El temporizador mantiene KT1, desactiva KM2 y activa KM1 para triángulo. No interviene un tercer contactor.',task:'Reduce el retardo o espera el cambio automático. Comprueba estrella desactivada y triángulo activo.'},
   'overload':{why:'TEST abre 95–96 y corta el mando. P3 señaliza el disparo mediante 97–98; no se espera un piloto rojo.',task:'Desde triángulo, pulsa TEST y comprueba la parada y solamente P3 amarillo encendido.'}
  };
  return {...step,...changes[step.id]};
 }
 if(step.id!=='force-continuity')return step;return {...step,task:'Desenchufa, abre ambos CONTROL y FUERZA. '+step.task,...(profile==='matias'?{black:'TEMPORIZADOR_1:L1',why:'En el proyecto opcional de Matías el conjunto KT1 es el contactor principal. Desconecta las alimentaciones y comprueba el cable R → KT1:L1.'}:{})}}

export type ActivityContext={profile:ActivityProfile;wires:BananaCable[];input:SimulationInput;result:SimulationResult;timed:string[];model:PanelMeterModel;mode:'OFF'|'V'|'A'|'R'|'C';redJack:'vo'|'a10'|'ma';probes:[string|null,string|null];frozen:boolean;clamp:Phase|null};
export function checkActivity(step:ActivityStep,c:ActivityContext):{ready:boolean;message:string;reading?:PanelReading}{
 const fail=(message:string)=>({ready:false,message});
 if(step.id==='dismantle'){if(c.input.plugged||c.input.forceBreaker||c.input.breakers.some(Boolean))return fail('Desconecta toda la alimentación antes de desmontar.');return c.wires.length?fail('Retira los cables para dejar el panel desmontado. Tus resultados se conservan.'):{ready:true,message:'Panel sin alimentación y sin cables; cierre virtual comprobado.'};}
 if(!matchesActivity(c.profile,c.wires,ACTIVITY_STEPS.findIndex(s=>s.id===step.id)<10?'control':'full'))return fail(c.profile==='manual'&&c.wires.some(w=>[w.from.terminalId,w.to.terminalId].includes('BOTONERAS:S2:2')&&[w.from.terminalId,w.to.terminalId].includes('BOTONERAS:S3:3'))?'Referencia antigua: la entrada NA S3:3 debe alimentarse desde S1:4, después de la partida (figura 1, pág. 5). Desenergiza el banco virtual y corrige ese cable, o prepara el montaje actualizado; tus mediciones se conservan.':'El cableado ya no coincide con la práctica elegida. Revisa las conexiones; Deshacer conserva tu trabajo anterior.');
 const energized=c.input.enabled&&c.input.plugged;
 if(['star','delta'].includes(step.stage)&&c.model.nameplate&&!ratingCompatibility(c.model.nameplate,c.model.lineVolts,step.stage==='delta'?'delta':'star').ok)return fail(ratingCompatibility(c.model.nameplate,c.model.lineVolts,step.stage==='delta'?'delta':'star').message);
 if(step.stage==='cold'&&energized)return fail('Desconecta el enchufe virtual antes de medir continuidad o resistencia. Abrir solo los interruptores no basta.');
 if(step.stage.startsWith('control')&&(!energized||!c.input.breakers.every(Boolean)))return fail('Conecta la corriente virtual y cierra ambos interruptores CONTROL.');
 if(step.stage.startsWith('control')&&c.input.forceBreaker)return fail('En esta parte el profesor comprueba solo el mando: abre FUERZA.');
 if(step.id==='force-continuity'&&(c.input.forceBreaker||c.input.breakers.some(Boolean)))return fail('Desenchufa y abre FUERZA y los dos CONTROL antes de comprobar fuerza.');
 const pilots=(values:boolean[])=>c.result.pilots.every((v,i)=>v===values[i]),allOff=Object.values(c.result.relays).every(v=>!v),roles=activityRoles(c.profile),{main,star,delta}=roles;
 if(['control-rest','control-reset','powered-rest'].includes(step.stage)&&(!allOff||c.input.thermalTripped||!pilots([false,roles.restPilot,false,false])))return fail(roles.restPilot?'Se esperan bobinas desactivadas, térmico rearmado y solo el piloto rojo encendido.':'Se esperan bobinas desactivadas y pilotos apagados. P2 no está cableado en este montaje.');
 if(step.stage==='powered-rest'&&(!energized||!c.input.forceBreaker||!c.input.breakers.every(Boolean)))return fail('Conecta fuerza y ambos interruptores CONTROL para verificar el reposo antes de arrancar.');
 if(step.stage==='control-star'&&(!c.result.relays[main]||!c.result.relays[star]||c.result.relays[delta]||!pilots([true,false,false,false])))return fail(`Pulsa ${roles.start}: deben entrar el conjunto principal y estrella, con P1 encendido.`);
 if(step.stage==='control-delta'&&(!c.result.relays[main]||!c.result.relays[delta]||c.result.relays[star]||!pilots([false,false,false,true])))return fail('Se espera principal + triángulo, con estrella desactivada y su verde apagado.');
 if(step.stage==='control-trip'&&(!c.input.thermalTripped||!allOff||!pilots([false,roles.restPilot,true,false])))return fail(roles.restPilot?'Activa TEST y comprueba bobinas desactivadas, rojo y amarillo encendidos.':'Activa TEST: bobinas desactivadas y solo P3 amarillo encendido.');
 if(['trip','reset'].includes(step.stage)&&(!energized||!c.input.forceBreaker||!c.input.breakers.every(Boolean)))return fail('Mantén mando y fuerza alimentados para comprobar el térmico. Cortar la alimentación no sustituye TEST o RESET.');
 if(step.kind==='action'&&c.input.pressed.length)return fail('Suelta los pulsadores antes de comprobar el estado.');
 if(['supply','star','delta'].includes(step.stage)&&(!energized||!c.input.forceBreaker))return fail('Conecta la corriente virtual y cierra FUERZA.');
 if(step.stage==='supply'&&c.result.motor.status!=='off')return fail('Detén el motor con S2 antes de comprobar la alimentación.');
 if((step.stage==='star'||step.stage==='delta')&&(c.input.thermalTripped||!c.input.breakers.every(Boolean)||c.result.motor.status!=='running'||c.result.motor.connection!==step.stage))return fail(step.stage==='star'?`El motor debe estar en estrella. Si ya cambió, detén con S2 y vuelve a iniciar con ${roles.start}.`:roles.automatic?'El motor debe estar en triángulo. Espera el cambio automático del temporizador.':'El motor debe estar en triángulo. Pulsa S3 para cambiar desde estrella.');
 if(step.stage==='trip'&&(!c.input.thermalTripped||!allOff||!pilots([false,roles.restPilot,true,false])||c.result.motor.status!=='off'))return fail(roles.restPilot?'Activa TEST: el térmico debe estar disparado y el motor detenido.':'Activa TEST: bobinas y motor detenidos, con solamente P3 encendido.');
 if(step.stage==='reset'&&(c.input.thermalTripped||!allOff||!pilots([false,roles.restPilot,false,false])||c.result.motor.status!=='off'))return fail('Rearma el térmico y deja el motor detenido.');
 if(step.stage==='off'&&(c.input.plugged||c.input.forceBreaker||c.input.breakers.some(Boolean)))return fail('Abre FUERZA y los dos CONTROL y desenchufa la corriente virtual.');
 if(c.result.fault)return fail('La simulación informa una falla. Revisa el montaje antes de registrar.');
 if(step.kind==='meter'){
  if(c.mode!==step.mode)return fail(`Selecciona ${step.mode==='V'?'V~':step.mode==='R'?'Ω':'continuidad'} en el selector del multímetro.`);
  if(c.redJack!=='vo')return fail('Conecta el cable rojo a V Ω y el negro a COM.');
  if(c.frozen)return fail('Quita HOLD y cualquier retención de la pantalla para observar la lectura actual.');
  if(!((c.probes[0]===step.red&&c.probes[1]===step.black)||(c.probes[1]===step.red&&c.probes[0]===step.black)))return fail('Las puntas todavía no están en los dos bornes pedidos. Consulta «Dónde poner las puntas».');
  const reading=readPanelMeter(c.wires,c.input,c.result,c.timed,c.mode,...c.probes,c.model,c.redJack);
  if(reading.value===undefined)return {...fail(reading.note),reading};
  if(step.expected==='open'&&reading.value!==null)return {...fail('Se esperaba un contacto abierto (OL). Suelta el pulsador de marcha.'),reading};
  if(step.expected==='low'&&(reading.value===null||reading.value>2))return {...fail('Se esperaba baja resistencia en este contacto cerrado.'),reading};
  return {ready:true,message:'Puntas, función y estado correctos. Escribe la lectura que observas.',reading};
 }
 if(step.kind==='clamp'){
  if(c.clamp!==step.phase)return fail(`Selecciona solo el conductor de entrada ${step.phase} en la pinza virtual.`);
  const solved=panelElectrical(c.wires,c.input,c.result.relays,c.timed,c.model);if(solved.fault)return fail(solved.fault);
  const value=solved.lineAmps[step.phase!];return {ready:true,message:'Pinza en la entrada de la fase solicitada, antes de las derivaciones.',reading:{value,text:`${value.toFixed(3).replace('.',',')} A`,kind:'current',note:c.model.motorMode==='induction'?`Corriente RMS de inducción a ${Math.round(c.model.rotorRpm??0)} rpm; carga ${c.model.loadTorqueNm??4} N·m. Parámetros didácticos.`:'Corriente RMS del equivalente resistivo didáctico.'}};
 }
 return {ready:true,message:'Estado verificado en el banco virtual.'};
}
export function observedMatches(text:string,value:number|null){
 if(value===null)return text.trim().toUpperCase()==='OL';
 const entered=Number(text.trim().replace(',','.'));return text.trim()!==''&&Number.isFinite(entered)&&Math.abs(entered-value)<=Math.max(.06,Math.abs(value)*.025);
}
export type ActivityRecord={id:string;observed:string;text:string;value:number|null;red?:string;black?:string;phase?:Phase;at:string;rpm?:number;loadTorqueNm?:number;motorMode?:'induction'|'resistive';displayUnit?:string;capturedAt?:string;conditions?:MeasurementConditions;action?:ActionProof};
export type ActivityProgress={version:1;profile:ActivityProfile;index:number;records:ActivityRecord[];reflection:string;analysis?:{voltage?:string;current?:string};complete:boolean};
export const LEGACY_ACTIVITY_KEY='modo-meter-activity2-v1';
export const ACTIVITY_KEY='modo-meter-two-contactors-v1';
export const newActivity=(profile:ActivityProfile):ActivityProgress=>({version:1,profile,index:0,records:[],reflection:'',complete:false});
export function readActivity(raw:unknown):ActivityProgress|null{
 if(!raw||typeof raw!=='object')return null;const v=raw as ActivityProgress;
 if(v.version!==1||!['manual','matias','twoContactors'].includes(v.profile)||!Number.isInteger(v.index)||v.index<0||v.index>=ACTIVITY_STEPS.length||typeof v.complete!=='boolean'||typeof v.reflection!=='string'||v.reflection.length>5000||!Array.isArray(v.records)||v.records.length>ACTIVITY_STEPS.length)return null;
 if(v.analysis&&((v.analysis.voltage!==undefined&&(typeof v.analysis.voltage!=='string'||v.analysis.voltage.length>30))||(v.analysis.current!==undefined&&(typeof v.analysis.current!=='string'||v.analysis.current.length>30))))return null;
 if(v.records.some(r=>!r||(r.rpm!==undefined&&!Number.isFinite(r.rpm))||(r.loadTorqueNm!==undefined&&(!Number.isFinite(r.loadTorqueNm)||r.loadTorqueNm<0||r.loadTorqueNm>40))||(r.motorMode!==undefined&&!['induction','resistive'].includes(r.motorMode))))return null;
 if(v.records.some(r=>r&&(r.conditions!==undefined&&!validConditions(r.conditions)||r.action!==undefined&&!validActionProof(r.action)||r.displayUnit!==undefined&&(typeof r.displayUnit!=='string'||r.displayUnit.length>10)||r.capturedAt!==undefined&&(typeof r.capturedAt!=='string'||r.capturedAt.length>50))))return null;
 if(v.records.some(r=>!r||!ACTIVITY_STEPS.some(s=>s.id===r.id)||typeof r.observed!=='string'||r.observed.length>80||typeof r.text!=='string'||r.text.length>120||r.value!==null&&!Number.isFinite(r.value)||typeof r.at!=='string'))return null;
 // A previous draft may have recorded measurements before the guide's control
 // checks were added. Keep its readings, but require every current step to finish.
 const firstMissing=ACTIVITY_STEPS.findIndex(s=>!v.records.some(r=>r.id===s.id));
 return v.complete&&firstMissing>=0?{...v,index:firstMissing,complete:false}:v;
}
