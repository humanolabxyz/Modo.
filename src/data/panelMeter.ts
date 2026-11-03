import {formatReading} from '../lab/units';
import {TERMINALS} from './panel';
import {simulationContacts,relayIds,type SimulationInput,type SimulationResult} from './simulation';
import type {BananaCable} from './practice';
import {solveDC} from '../lab/dc';
import {AMMETER_RATED,DEFAULT_PANEL_METER_MODEL,jackLimit,panelElectrical,type MeterJack,type PanelMeterModel} from './panelElectrical';
import {resistanceKey} from './panelCalibration';
import {MOTOR_EQUIVALENT} from './panelMotorDynamics';
import {contactOhms,effectiveWires,faultsOf,pairKey} from './panelFaults';
import {earthGaps,earthGapText} from './panelEarth';
export type PanelReading={text:string;note:string;value?:number|null;kind:'voltage'|'current'|'resistance'|'continuity'};
/** AC magnitudes use explicit teaching equivalents; Ω never claims undocumented equipment resistance. */
export function readPanelMeter(wires:BananaCable[],input:SimulationInput,result:SimulationResult,timed:string[],mode:'V'|'A'|'R'|'C'|'OFF',red:string|null,black:string|null,model:PanelMeterModel=DEFAULT_PANEL_METER_MODEL,redJack:MeterJack='vo',fuse:{a10?:boolean;ma?:boolean}={}):PanelReading{
 const kind=mode==='V'?'voltage':mode==='A'?'current':mode==='C'?'continuity':'resistance',answer=(text:string,note:string,value?:number|null):PanelReading=>({text,note,value,kind});
 if(mode==='OFF')return answer('','Selecciona V~, A~, Ω o continuidad.');
 if(mode==='A'&&redJack==='vo')return answer('USA A Y COM','Conecta el cable rojo a A (o a mA µA para corrientes pequeñas) y el negro a COM. Abre una rama del circuito e inserta las puntas en sus dos extremos.');
 if(mode==='A'&&redJack!=='vo'&&fuse[redJack])return answer('FUSIBLE','Se quemó el fusible de esta entrada: '+(redJack==='ma'?'0,44 A':'11 A')+'. Cámbialo con el botón «Fusible» junto al multímetro para volver a medir corriente.');
 if(mode!=='A'&&redJack!=='vo')return answer('USA V Ω','Vuelve a conectar el cable rojo a V Ω para medir tensión, resistencia o continuidad.');
 if(!red||!black||![red,black].every(id=>TERMINALS.some(t=>t.key===id)))return answer('Pon las puntas','Arrastra cada punta a un borne real del panel.');
 const earthGap=input.earthRequired&&input.enabled&&input.plugged?earthGaps(wires,faultsOf(input)):[],energized=input.enabled&&input.plugged&&!earthGap.length,contacts=simulationContacts(input,result.relays,timed),parent=new Map<string,string>();
 const root=(x:string):string=>{const p=parent.get(x);if(!p){parent.set(x,x);return x;}if(p!==x)parent.set(x,root(p));return parent.get(x)!;},join=(a:string,b:string)=>parent.set(root(a),root(b));
 const faults=faultsOf(input),eff=effectiveWires(wires,faults),contactR=contactOhms(faults);
 /* Cada cable y cada contacto cerrado es una rama; una falla (falso contacto, contacto sucio) sube su resistencia, un cable cortado desaparece. */
 const edgeList=[...eff.ideal.map(w=>({a:w.from.terminalId,b:w.to.terminalId,r:.01})),...eff.resistive.map(w=>({a:w.a,b:w.b,r:.01+w.ohms})),...contacts.map(([a,b])=>({a,b,r:contactR.get(pairKey(a,b))??.02}))],edges=edgeList.map(e=>[e.a,e.b] as [string,string]);edges.forEach(([a,b])=>join(a,b));
 if(mode==='R'||mode==='C'){
  if(energized)return answer('DESENERGIZA','Desconecta el enchufe virtual antes de medir Ω o continuidad, también si los interruptores están abiertos.');
  if(root(red)===root(black)){
   const branches=edgeList.map((e,i)=>({id:String(i),a:e.a,b:e.b,resistance:e.r})).filter(b=>root(b.a)===root(red)),r=red===black?0:(()=>{const solved=solveDC(branches,{[red]:1,[black]:0});return solved.fault?0:1/Math.abs(branches.reduce((sum,b)=>b.a===red?sum+(solved.amps[b.id]??0):b.b===red?sum-(solved.amps[b.id]??0):sum,0));})();
   const value=.4+(Number.isFinite(r)?r:0);return answer(`${value.toFixed(1).replace('.',',')} Ω`,'Modelo de prueba: 0,2 Ω por punta, 0,01 Ω por cable y 0,02 Ω por contacto cerrado; valores didácticos.',value);
  }
 }
 /* Componentes dañados: una bobina o devanado abierto o una lámpara quemada no ofrecen camino; una fuga de aislación sí, hacia TP. */
 const openCoil=new Set(faults.flatMap(f=>f.kind==='coil-open'?[f.relay]:[])),openWinding=new Set(faults.flatMap(f=>f.kind==='winding-open'?[f.phase]:[])),burnt=new Set(faults.flatMap(f=>f.kind==='pilot-burnt'?[f.n]:[]));
 const loadDefs:{a:string;b:string;def:number|'coil'|'pilot'|'winding';fixed?:number}[]=[...['U','V','W'].filter(p=>!openWinding.has(p as 'U')).map(p=>({a:`BORNERA_MOTOR:${p}1`,b:`BORNERA_MOTOR:${p}2`,def:'winding' as const})),...relayIds().filter(id=>!openCoil.has(id)).map(id=>({a:`${id}:A1`,b:`${id}:A2`,def:'coil' as const})),...[1,2,3,4].filter(n=>!burnt.has(n)).map(n=>({a:`BOTONERAS:PILOTO_${n}`,b:'BOTONERAS:N',def:'pilot' as const})),...faults.flatMap(f=>f.kind==='insulation'?[{a:f.terminal,b:'BORNERA_MOTOR:TP',def:f.ohms,fixed:f.ohms}]:[])];
 const loads=loadDefs.map(d=>[d.a,d.b] as [string,string]),loadGraph=new Map<string,Set<string>>();
 loads.forEach(([a,b])=>{a=root(a);b=root(b);if(a===b)return;if(!loadGraph.has(a))loadGraph.set(a,new Set());if(!loadGraph.has(b))loadGraph.set(b,new Set());loadGraph.get(a)!.add(b);loadGraph.get(b)!.add(a);});
 const reachable=(start:string)=>{const origin=root(start),seen=new Set([origin]),queue=[origin];while(queue.length){const a=queue.pop()!;for(const b of loadGraph.get(a)??[])if(!seen.has(b)){seen.add(b);queue.push(b);}}return seen;};
 if(mode==='R'||mode==='C'){
  if(!reachable(red).has(root(black)))return answer('OL','No hay camino por cables, contactos o cargas modeladas.',null);
  if(!model.resistanceMode)return answer('SIN DATOS','Resistencia física sin documentar. Elige explícitamente un perfil didáctico o aporta una medición de referencia.');
  const unknown:string[]=[],dcLoads=loads.flatMap(([a,b],i)=>{const def=loadDefs[i],datum=model.providedResistances?.[resistanceKey(a,b)],ohms=def.fixed!==undefined?def.fixed:model.resistanceMode==='model'?(datum?.ohms??(def.def==='winding'?(model.motorParameters??MOTOR_EQUIVALENT).statorOhms:def.def==='coil'?model.coilOhms:model.pilotOhms)):datum?.ohms;
   if(ohms===undefined){if(reachable(red).has(root(a))||reachable(red).has(root(b)))unknown.push(a+'–'+b);return [];}return [{id:'load-'+i,a,b,resistance:ohms}];});
  if(unknown.length)return answer('SIN DATOS','Hay resistencias pendientes de referencia en este circuito. Aísla el componente o completa los datos aportados.');
  const branches=[...edgeList.map((e,i)=>({id:'path-'+i,a:e.a,b:e.b,resistance:e.r})),...dcLoads],solved=solveDC(branches,{[red]:1,[black]:0});
  if(solved.fault)return answer('SIN DATOS',solved.fault);const amps=Math.abs(branches.reduce((sum,b)=>sum+(b.a===red?(solved.amps[b.id]??0):b.b===red?-(solved.amps[b.id]??0):0),0));
  if(amps<1e-12)return answer('OL','Circuito abierto para la corriente de prueba.',null);const value=.4+1/amps,shown=formatReading('resistance',value);
  return answer(`${shown.text} ${shown.unit}`,model.resistanceMode==='model'?'Ω del perfil didáctico, incluidos caminos en paralelo y 0,2 Ω por punta. No es una resistencia medida del equipo físico.':'Ω calculados con datos aportados por el usuario y 0,2 Ω por punta; la validación física sigue pendiente.',value);
 }
 if(!energized)return answer(mode==='A'?'0,000 A':'0,000 V',earthGap.length?earthGapText(earthGap):'Fuente virtual desconectada. Esta lectura pertenece al modelo, no verifica el equipo físico.',0);
 if(result.fault)return answer('REVISAR','Resuelve la falla de la simulación antes de medir.');
 const solved=panelElectrical(wires,input,result.relays,timed,model,mode==='A'?{red,black}:undefined);
 if(solved.fault)return answer(mode==='A'?'REVISAR SERIE':'REVISAR',solved.fault);
 const note=(model.motorMode==='induction'?`Inducción RMS: ${Math.round(model.rotorRpm??0)} rpm, carga ${model.loadTorqueNm??4} N·m. `:'Equivalente resistivo. ')+`Modelo didáctico: mando 24 V~, fuerza ${model.lineVolts} V~ entre fases; bobina ${model.coilOhms} Ω, piloto ${model.pilotOhms} Ω y ${model.motorMode==='induction'?'devanados con impedancia de inducción':`devanado ${model.windingOhms} Ω resistivo`}. Valores ajustables, no datos de placa.`;
 if(mode==='A'){
  if(root(red)===root(black))return answer('ABRE LA RAMA','Las puntas están unidas por un cable o contacto. Retira un extremo del cable e intercala el tester en ese corte.');
  if(solved.current>jackLimit(redJack))return answer('SOBRECARGA',redJack==='ma'?'La entrada mA µA supera 600 mA: se quemaría su fusible. Revisa que el tester esté en serie y no entre dos fuentes.':'La entrada A supera 20 A: se quemaría su fusible de 11 A. Revisa que el tester esté en serie y no entre dos fuentes.');
  if(redJack==='ma'){const ma=solved.current*1000,t=ma.toFixed(ma<40?2:1).replace('.',',');return answer(`${t} mA`,note+' El tester cierra la rama con una carga de 0,1 Ω.',solved.current);}
  const shown=formatReading('current',solved.current);return answer(`${shown.text} ${shown.unit}`,note+' El tester cierra la rama con una carga de 0,1 Ω.',solved.current);
 }
 const earthValue=solved.earthVoltage(red,black);
 if(earthValue!==null){const shown=formatReading('voltage',earthValue);return answer(`${shown.text} ${shown.unit}`,'Entre bornes de tierra de protección. Con la tierra conectada vale 0 V; sin tierra y con una fuga de aislación, la carcasa del motor flota a la tensión de la fuga y es la que tocaría una persona. '+note,earthValue);}
 const value=solved.voltage(red,black);if(value===null)return answer('SIN REFERENCIA','Punto flotante o fuentes aisladas entre sí. Usa dos puntos de mando o dos puntos de fuerza; TP no es el retorno de medida.');
 const shown=formatReading('voltage',value);return answer(`${shown.text} ${shown.unit}`,note,value);
}
export type MeterHazard={level:'danger'|'warn';title:string;text:string;action?:{label:string;run:()=>void}};
/** Avisos de seguridad del multímetro: lo que dañaría el instrumento o al operador en un banco real. */
export function meterHazard(input:SimulationInput,result:SimulationResult,mode:'V'|'A'|'R'|'C'|'OFF',red:string|null,black:string|null,redJack:MeterJack,reading:PanelReading):MeterHazard|null{
 const energized=input.enabled&&input.plugged,placed=!!red&&!!black;
 if(mode==='OFF')return null;
 if(result.fault&&energized)return {level:'danger',title:'Cortocircuito en el banco',text:'Hay una falla en el montaje. Abre FUERZA y CONTROL, desenchufa y revisa los cables antes de medir.'};
 if((mode==='R'||mode==='C')&&energized&&placed)return {level:'danger',title:'No midas Ω ni continuidad con tensión',text:'El circuito está energizado: en un tester real esto quema el fusible o daña el instrumento. Desenchufa y abre FUERZA y CONTROL antes de medir.'};
 if(mode!=='A'&&redJack!=='vo'&&placed&&energized)return {level:'danger',title:redJack==='ma'?'Cable rojo en la entrada mA µA':'Cable rojo en la entrada A',text:'Las entradas de corriente son un cortocircuito casi directo: queman su fusible ('+(redJack==='ma'?'0,44 A':'11 A')+'). Pasa el cable rojo a V Ω para medir tensión, Ω o continuidad.'};
 if(mode==='A'&&redJack==='vo'&&placed&&energized)return {level:'warn',title:'Función A con el cable rojo en V Ω',text:'Para medir corriente el rojo va en A y el tester en serie. Así no mide y puede inducir errores.'};
 if(mode==='A'&&redJack!=='vo'&&placed&&energized&&reading.text==='ABRE LA RAMA')return {level:'warn',title:'Aún no pasa corriente por el tester',text:'Para medir corriente, la corriente tiene que pasar por el tester. Aquí las puntas están unidas por un cable o contacto y la corriente sigue su camino sin entrar. Retira un extremo del cable y conecta el tester en ese corte.'};
 if(mode==='A'&&redJack!=='vo'&&placed&&energized&&reading.text==='SOBRECARGA')return {level:'danger',title:'Haz que la corriente pase por el tester',text:'Entre dos puntos con tensión el tester actúa como un cortocircuito. Desenchufa, abre una rama del circuito y conecta el tester en ese hueco para que la corriente lo atraviese.'};
 if(mode==='A'&&redJack==='a10'&&placed&&energized&&typeof reading.value==='number'&&reading.value>AMMETER_RATED)return {level:'warn',title:'Sobre 10 A en la entrada A',text:'El tester aguanta hasta 20 A solo 30 segundos. Anota la lectura rápido y vuelve a abrir la rama; sobre 20 A se quema el fusible.'};
 if(mode==='V'&&placed&&energized&&typeof reading.value==='number'&&Math.abs(reading.value)>50)return {level:'warn',title:'Tensión peligrosa',text:'Más de 50 V: riesgo de choque eléctrico. Usa puntas aisladas, una sola mano y no toques partes metálicas.'};
 return null;
}
