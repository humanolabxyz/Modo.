/** Física del banco de temperatura. Sin dependencias: se prueba por separado (qa/verify-temperature.mjs).
 *  Modelos ideales y declarados: termocupla K/J con los polinomios NIST ITS-90, Pt100 con Callendar–Van Dusen (IEC 60751)
 *  y un transmisor ideal con compensación de unión fría. No hay tolerancias de sensor ni resistencia de cables. */
export type TcType='K'|'J';
export type Sensor='tc'|'pt'|'tx';
export type Terminal='tc+'|'tc-'|'pt1'|'pt2'|'pt3'|'pt4'|'tx+'|'tx-';
export type MeterMode='off'|'mV'|'ohm'|'V';
export const TERMINALS:{id:Terminal;label:string;sensor:Sensor}[]=[
  {id:'tc+',label:'Termocupla +',sensor:'tc'},{id:'tc-',label:'Termocupla −',sensor:'tc'},
  {id:'pt1',label:'Pt100 · hilo rojo 1',sensor:'pt'},{id:'pt2',label:'Pt100 · hilo rojo 2',sensor:'pt'},{id:'pt3',label:'Pt100 · hilo blanco 3',sensor:'pt'},{id:'pt4',label:'Pt100 · hilo blanco 4',sensor:'pt'},
  {id:'tx+',label:'Salida del transmisor +',sensor:'tx'},{id:'tx-',label:'Salida del transmisor −',sensor:'tx'},
];
export const terminalSensor=(t:Terminal):Sensor=>TERMINALS.find(x=>x.id===t)!.sensor;
/** Los dos hilos rojos del Pt100 van unidos al mismo extremo del elemento; el blanco (o los dos blancos) al otro. */
export const ptSide=(t:Terminal):'red'|'white'|null=>t==='pt1'||t==='pt2'?'red':t==='pt3'||t==='pt4'?'white':null;

/* Coeficientes NIST ITS-90 (mV con T en °C). */
const K_NEG=[0,3.9450128025e-2,2.3622373598e-5,-3.2858906784e-7,-4.9904828777e-9,-6.7509059173e-11,-5.7410327428e-13,-3.1088872894e-15,-1.0451609365e-17,-1.9889266878e-20,-1.6322697486e-23];
const K_POS=[-1.7600413686e-2,3.8921204975e-2,1.8558770032e-5,-9.9457592874e-8,3.1840945719e-10,-5.6072844889e-13,5.6075059059e-16,-3.2020720003e-19,9.7151147152e-23,-1.2104721275e-26];
const J_ALL=[0,5.0381187815e-2,3.0475836930e-5,-8.5681065720e-8,1.3322931740e-10,-1.7022405966e-13,2.0954753418e-16,-1.2538395336e-19,1.5631725697e-23];
const horner=(c:number[],t:number)=>{let s=0;for(let i=c.length-1;i>=0;i--)s=s*t+c[i];return s;};
/** Tensión de una termocupla con su unión de referencia a 0 °C, en mV. Válida de −100 a 760 °C en este banco. */
export function tcEmf(type:TcType,celsius:number):number{
  if(type==='J')return horner(J_ALL,celsius);
  if(celsius<0)return horner(K_NEG,celsius);
  return horner(K_POS,celsius)+1.185976e-1*Math.exp(-1.183432e-4*(celsius-126.9686)**2);
}
/** Temperatura que corresponde a una tensión (referencia 0 °C), por bisección: ambas curvas son crecientes en el rango del banco. */
export function tcTemperature(type:TcType,mv:number):number{
  let lo=-100,hi=760;
  if(mv<=tcEmf(type,lo))return lo;if(mv>=tcEmf(type,hi))return hi;
  for(let i=0;i<60;i++){const mid=(lo+hi)/2;if(tcEmf(type,mid)<mv)lo=mid;else hi=mid;}
  return (lo+hi)/2;
}
/** Resistencia de un Pt100 (α = 0,00385) en Ω. */
export function ptOhms(celsius:number):number{
  const R0=100,A=3.9083e-3,B=-5.775e-7,C=-4.183e-12;
  return celsius>=0?R0*(1+A*celsius+B*celsius*celsius):R0*(1+A*celsius+B*celsius*celsius+C*(celsius-100)*celsius**3);
}

export const AMBIENT_MIN=5,AMBIENT_MAX=40,SET_MAX=150,TX_OUT_MAX=10;
export type Settings={
  ptLeadOhms?:number;ptWires:3|4;ambient:number;tcType:TcType;setpoint:number;
  txType:TcType;txMin:number;txMax:number;txConnected:boolean;txPowered:boolean;
  mode:MeterMode;red:Terminal|null;black:Terminal|null;inWell:{tc:boolean;pt:boolean};
};
export type Temps={bath:number;tc:number;pt:number};
export const defaultSettings=():Settings=>({ptWires:3,ambient:22,tcType:'K',setpoint:22,txType:'K',txMin:0,txMax:100,txConnected:false,txPowered:false,mode:'off',red:null,black:null,inWell:{tc:false,pt:false}});
/** El Pt100 de 3 hilos no tiene el cuarto: una punta conectada a él se suelta. */
export function normalizeSettings(s:Settings):Settings{
  s={...s,ptLeadOhms:Math.max(0,Math.min(10,s.ptLeadOhms??0))};
  if(s.ptWires===4)return s;
  return {...s,red:s.red==='pt4'?null:s.red,black:s.black==='pt4'?null:s.black};
}
export const startTemps=(s:Settings):Temps=>({bath:s.ambient,tc:s.ambient,pt:s.ambient});

/** Constantes de tiempo acelerado (s). Un horno real tarda minutos; aquí se espera segundos. */
export const TAU={bath:3,tc:1,pt:2,out:5};
export function stepTemps(s:Settings,t:Temps,dt:number):Temps{
  const approach=(cur:number,target:number,tau:number)=>target+(cur-target)*Math.exp(-dt/tau);
  const bath=approach(t.bath,s.setpoint,TAU.bath);
  return {bath,tc:approach(t.tc,s.inWell.tc?bath:s.ambient,s.inWell.tc?TAU.tc:TAU.out),pt:approach(t.pt,s.inWell.pt?bath:s.ambient,s.inWell.pt?TAU.pt:TAU.out)};
}
/** Equilibrio completo (para «esperar a que se estabilice»). */
export const settledTemps=(s:Settings):Temps=>({bath:s.setpoint,tc:s.inWell.tc?s.setpoint:s.ambient,pt:s.inWell.pt?s.setpoint:s.ambient});
export const STABLE_BAND=0.2;
/** Una sonda se puede leer cuando está en el pozo y ella y el horno llegaron a la consigna. */
export function isStable(s:Settings,t:Temps,sensor:Sensor):boolean{
  const probe=sensor==='pt'?'pt':'tc';
  return s.inWell[probe]&&Math.abs(t.bath-s.setpoint)<STABLE_BAND&&Math.abs(t[probe]-t.bath)<STABLE_BAND;
}

/** Temperatura que el transmisor deduce: compensa la unión fría con el tipo que tiene configurado, de modo que un tipo equivocado da un error. */
export function txTemperature(s:Settings,t:Temps):number{
  const measured=tcEmf(s.tcType,t.tc)-tcEmf(s.tcType,s.ambient);
  return tcTemperature(s.txType,measured+tcEmf(s.txType,s.ambient));
}
export function txVolts(s:Settings,t:Temps):number{
  if(!s.txPowered||!s.txConnected||s.txMax<=s.txMin)return 0;
  const v=TX_OUT_MAX*(txTemperature(s,t)-s.txMin)/(s.txMax-s.txMin);
  return Math.min(TX_OUT_MAX,Math.max(0,v));
}
/** Valor de referencia (tabla) de cada sensor a una temperatura de consigna, con las condiciones actuales del banco. */
export function reference(s:Settings,sensor:Sensor,celsius:number):number{
  if(sensor==='pt')return ptOhms(celsius);
  if(sensor==='tc')return tcEmf(s.tcType,celsius)-tcEmf(s.tcType,s.ambient);
  const v=TX_OUT_MAX*(celsius-s.txMin)/(s.txMax-s.txMin);return s.txMax<=s.txMin?0:Math.min(TX_OUT_MAX,Math.max(0,v));
}

export type Reading={state:'off'|'open'|'ok';value:number|null;unit:'mV'|'Ω'|'V'|'';sensor:Sensor|null;meaningful:boolean;note:string};
const reading=(r:Partial<Reading>&Pick<Reading,'state'>):Reading=>({value:null,unit:'',sensor:null,meaningful:false,note:'',...r});
/** Lo que mostraría el multímetro con las puntas y la función elegidas. */
export function readMeter(s:Settings,t:Temps):Reading{
  if(s.mode==='off')return reading({state:'off',note:'El multímetro está apagado. Elige mV, Ω o V.'});
  if(!s.red||!s.black)return reading({state:'open',note:'Conecta las dos puntas a los bornes del sensor.'});
  const a=terminalSensor(s.red),b=terminalSensor(s.black);
  if(s.red===s.black)return reading({state:'ok',value:0,unit:s.mode==='ohm'?'Ω':s.mode==='V'?'V':'mV',note:'Las dos puntas están en el mismo borne: no mides nada.'});
  if(a!==b)return reading({state:'open',note:'Las puntas están en sensores distintos: el circuito queda abierto.'});
  if(a==='tc'){
    const mv=(tcEmf(s.tcType,t.tc)-tcEmf(s.tcType,s.ambient))*(s.red==='tc+'?1:-1);
    if(s.mode==='mV')return reading({state:'ok',value:mv,unit:'mV',sensor:'tc',meaningful:true,note:`Tensión de la termocupla ${s.tcType} con la unión de referencia a la temperatura ambiente.`});
    if(s.mode==='V')return reading({state:'ok',value:mv/1000,unit:'V',sensor:'tc',note:'Es una señal de milivoltios: en la escala de voltios casi no se ve. Usa mV.'});
    return reading({state:'ok',value:0,unit:'Ω',sensor:'tc',note:'Una termocupla es casi un conductor: su resistencia no informa la temperatura. Usa mV.'});
  }
  if(a==='pt'){
    if(s.mode!=='ohm')return reading({state:'ok',value:0,unit:s.mode==='V'?'V':'mV',sensor:'pt',note:'El Pt100 no genera tensión: es una resistencia. Usa Ω.'});
    if(ptSide(s.red)===ptSide(s.black))return reading({state:'ok',value:2*(s.ptLeadOhms??0),unit:'Ω',sensor:'pt',note:`Los dos hilos ${ptSide(s.red)==='red'?'rojos':'blancos'} van unidos al mismo extremo del elemento: solo mides los dos hilos de cable del mismo lado. Mide entre un hilo rojo y uno blanco.`});
    return reading({state:'ok',value:ptOhms(t.pt)+2*(s.ptLeadOhms??0),unit:'Ω',sensor:'pt',meaningful:true,note:`Resistencia del Pt100 entre un hilo rojo y uno blanco (${s.ptWires} hilos). El DMM usa dos puntas: suma los dos hilos del lazo; tener una sonda de 3/4 hilos no compensa automáticamente.`});
  }
  if(s.mode==='V'){
    const v=txVolts(s,t)*(s.red==='tx+'?1:-1);
    const note=!s.txPowered?'El transmisor no está alimentado: su salida vale 0 V.':!s.txConnected?'El transmisor no recibe la termocupla: su salida vale 0 V.':s.txType!==s.tcType?`El transmisor está configurado para tipo ${s.txType} y la termocupla es ${s.tcType}: la lectura es incorrecta.`:'Salida en tensión del transmisor.';
    return reading({state:'ok',value:v,unit:'V',sensor:'tx',meaningful:s.txPowered&&s.txConnected,note});
  }
  return reading({state:'open',note:s.mode==='mV'?'Sobrerango: la salida del transmisor es de voltios. Usa V.':'No midas resistencia en una salida energizada. Usa V.'});
}
