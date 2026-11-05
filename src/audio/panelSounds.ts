/**
 * Sonidos de los elementos del banco, sintetizados con Web Audio (no hay archivos de audio: funcionan sin conexión).
 * Cada elemento suena distinto, como en el equipo real:
 *  · pulsador: «tac» seco al apretar y un «tic» más suave al soltar;
 *  · contactor: golpe del núcleo y choque de la armadura al cerrar, y un «clac» más corto al abrir; cada módulo tiene su tono
 *    (el temporizador es el más grave, por ser el más pesado);
 *  · temporizador neumático: golpe de carcasa y chasquido seco del mecanismo al conmutar;
 *  · relé térmico: chasquido metálico al dispararse (TEST) y clic al rearmarse (RESET);
 *  · interruptores FUERZA y CONTROL: golpe grave y clic doble; enchufe: clac de plástico.
 *  · cables banana: «tuc» del plástico al entrar en el borne con el resorte metálico, y un «plop» más suave al sacarlo;
 *  · motor: zumbido continuo que sube de tono con las revoluciones; si el montaje está mal (falta de fase, desequilibrio, rotor frenado) suena áspero, con gruñido y vibración.
 * Se puede silenciar (se recuerda en el navegador). Los sonidos solo se emiten cuando la persona actúa o cuando el circuito cambia de estado.
 */
import {useSyncExternalStore} from 'react';
import type {MotorState,SimulationInput} from '../data/simulation';

export type ElementSound='pulsador-abajo'|'pulsador-arriba'|'contactor-cierra'|'contactor-abre'|'temporizador-inicia'|'temporizador-ajuste'|'temporizado'|'termico-dispara'|'termico-rearma'|'interruptor'|'enchufe'|'cable-conecta'|'cable-desconecta'|'paso-correcto';

const KEY='panellab.sonidos.v1';
let enabled=true;
try{enabled=localStorage.getItem(KEY)!=='0';}catch{/* sin almacenamiento: queda activado */}
const listeners=new Set<()=>void>();
export const soundsEnabled=()=>enabled;
export function setSoundsEnabled(value:boolean){
 enabled=value;
 try{localStorage.setItem(KEY,value?'1':'0');}catch{/* no se pudo recordar */}
 listeners.forEach(l=>l());
 if(value)playElementSound('pulsador-abajo');
}
export const useSoundsEnabled=()=>useSyncExternalStore(cb=>{listeners.add(cb);return()=>{listeners.delete(cb);};},soundsEnabled,()=>true);

let ctx:AudioContext|null=null,bus:GainNode|null=null,noise:AudioBuffer|null=null;
/** Registro de los últimos sonidos pedidos (para las pruebas y para depurar). */
const log:string[]=[];

function audio():AudioContext|null{
 if(ctx)return ctx;
 try{
  const Ctor=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
  if(!Ctor)return null;
  ctx=new Ctor();
  const compressor=ctx.createDynamicsCompressor();
  bus=ctx.createGain();bus.gain.value=.7;
  bus.connect(compressor);compressor.connect(ctx.destination);
  noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);
  const data=noise.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
 }catch{ctx=null;}
 return ctx;
}

/** Ráfaga de ruido filtrado: el «golpe» de los choques mecánicos. */
function burst(c:AudioContext,at:number,duration:number,gain:number,filter:BiquadFilterType,freq:number,q=1){
 const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
 src.buffer=noise;f.type=filter;f.frequency.value=freq;f.Q.value=q;
 g.gain.setValueAtTime(.0001,at);
 g.gain.exponentialRampToValueAtTime(gain,at+.001);
 g.gain.exponentialRampToValueAtTime(.0001,at+duration);
 src.connect(f);f.connect(g);g.connect(bus!);
 src.start(at,Math.random()*.5);src.stop(at+duration+.02);
}

/** Modo de resonancia: un objeto golpeado suena como una suma de parciales que se apagan solos (síntesis modal). `decay` es la constante de tiempo en segundos. */
function ring(c:AudioContext,at:number,freq:number,decay:number,gain:number){
 const osc=c.createOscillator(),g=c.createGain();
 osc.type='sine';osc.frequency.value=freq;
 g.gain.setValueAtTime(.0001,at);
 g.gain.linearRampToValueAtTime(gain,at+.0006);
 g.gain.setTargetAtTime(.0001,at+.0006,decay);
 osc.connect(g);g.connect(bus!);
 osc.start(at);osc.stop(at+.0006+decay*7);
}
/** Varios modos a la vez, con la frecuencia de todos desplazada por `k` (cada pieza es un poco distinta). */
const rings=(c:AudioContext,at:number,k:number,modes:[number,number,number][])=>modes.forEach(([f,d,g])=>ring(c,at,f*k,d,g));
/** Deslizamiento de un metal sobre otro: ruido filtrado cuyo timbre sube o baja mientras roza. */
function slide(c:AudioContext,at:number,duration:number,from:number,to:number,gain:number){
 const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
 src.buffer=noise;f.type='bandpass';f.Q.value=1.6;
 f.frequency.setValueAtTime(from,at);f.frequency.exponentialRampToValueAtTime(to,at+duration);
 g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(gain,at+duration*.25);g.gain.linearRampToValueAtTime(.0001,at+duration);
 src.connect(f);f.connect(g);g.connect(bus!);
 src.start(at,Math.random()*.5);src.stop(at+duration+.02);
}

/** `k` desplaza el tono: cada módulo y cada pulsador suena un poco distinto. Todos suenan como objetos reales golpeados (plástico, metal, bobina). */
const SOUNDS:Record<ElementSound,(c:AudioContext,t:number,k:number,element?:string)=>void>={
 /* Pulsador industrial: chasquido del resorte, tope del émbolo y golpe del plástico contra la base. */
 'pulsador-abajo':(c,t,k)=>{
  burst(c,t,.007,.46,'bandpass',1700*k,1);
  rings(c,t,k,[[460,.006,.17],[1140,.004,.12],[2690,.003,.10],[4310,.0018,.05]]);
  burst(c,t+.006,.004,.15,'highpass',2700*k);
 },
 'pulsador-arriba':(c,t,k)=>{
  burst(c,t,.004,.27,'bandpass',2500*k,1);
  rings(c,t,k,[[690,.004,.095],[1960,.003,.09],[3620,.002,.055]]);
 },
 /* Contactor que cierra: el núcleo y la armadura chocan (golpe grave que retumba en la carcasa), «clac» metálico y rebote de los contactos. */
 'contactor-cierra':(c,t,k,element)=>{
  if(element?.startsWith('TEMPORIZADOR_')){
   burst(c,t,.012,.58,'bandpass',910*k,.8);
   rings(c,t,k,[[155,.018,.40],[376,.011,.32],[880,.007,.23],[2140,.004,.14]]);
   burst(c,t+.008,.005,.32,'bandpass',2850*k,1);
   return;
  }
  rings(c,t,k,[[66,.17,.75],[132,.12,.5],[305,.07,.32],[640,.05,.26],[1180,.05,.22]]);
  burst(c,t,.018,.75,'bandpass',1700*k,.9);
  rings(c,t,k,[[2300,.035,.2],[3700,.022,.13]]);
  rings(c,t+.006,k,[[4300,.012,.1]]);rings(c,t+.012,k,[[4800,.01,.07]]);rings(c,t+.017,k,[[5200,.008,.05]]);
 },
 /* Al abrir: el resorte devuelve la armadura, más seco y ligero. */
 'contactor-abre':(c,t,k,element)=>{
  if(element?.startsWith('TEMPORIZADOR_')){
   burst(c,t,.008,.34,'bandpass',1360*k,.9);
   rings(c,t,k,[[225,.011,.24],[708,.007,.15],[1990,.004,.11]]);
   return;
  }
  burst(c,t,.012,.4,'bandpass',1100*k,1);
  rings(c,t,k,[[95,.07,.38],[210,.045,.22],[900,.04,.3],[2100,.022,.18]]);
 },
 /* Temporizador: el ajuste tiene un pequeño trinquete y la conmutación golpea la carcasa. */
 'temporizador-ajuste':(c,t,k)=>{
  burst(c,t,.004,.19,'bandpass',2800*k,1.2);
  rings(c,t+.003,k,[[1130,.004,.075],[2620,.002,.055]]);
 },
 'temporizador-inicia':(c,t,k)=>{
  burst(c,t,.006,.27,'bandpass',1250*k,1);
  rings(c,t,k,[[290,.009,.15],[810,.006,.12],[2270,.003,.065]]);
 },
 'temporizado':(c,t,k)=>{
  burst(c,t,.009,.52,'bandpass',1620*k,1);
  rings(c,t,k,[[235,.012,.29],[595,.009,.25],[1470,.006,.19],[3320,.003,.12]]);
  burst(c,t+.011,.005,.22,'highpass',2340*k);
 },
 /* Relé térmico: la lámina bimetálica salta de golpe — chasquido agudo y metálico. */
 'termico-dispara':(c,t,k)=>{
  burst(c,t,.004,.85,'highpass',3000);
  rings(c,t,k,[[2350,.085,.34],[3900,.055,.25],[1250,.11,.2],[5800,.025,.1]]);
  rings(c,t+.002,k,[[180,.045,.3]]);
 },
 'termico-rearma':(c,t,k)=>{burst(c,t,.003,.35,'highpass',2800);rings(c,t,k,[[2800,.014,.22],[380,.04,.3],[1500,.02,.12]]);},
 /* Interruptor magnetotérmico: palanca pesada y enganche del mecanismo. */
 'interruptor':(c,t,k)=>{
  rings(c,t,k,[[118,.09,.6],[245,.06,.4],[560,.04,.22],[1900,.04,.3]]);burst(c,t,.008,.5,'bandpass',2400,1.2);
  burst(c,t+.055,.004,.4,'highpass',3000);rings(c,t+.055,k,[[3000,.014,.24],[420,.03,.2]]);
 },
 /* Enchufe: las clavijas rozan los contactos y el cuerpo de plástico topa con la base. */
 'enchufe':(c,t,k)=>{
  slide(c,t,.035,2200,4200,.1);
  burst(c,t+.03,.012,.5,'bandpass',1000*k,1);rings(c,t+.03,k,[[430,.05,.5],[900,.03,.3],[1750,.02,.16],[3800,.012,.08]]);
 },
 /* Banana en su borne: roza el resorte de contacto, entra y topa con un «tuc» de plástico y un leve brillo metálico. */
 'cable-conecta':(c,t,k)=>{
  slide(c,t,.03,2600,5600,.13);
  burst(c,t+.028,.005,.5,'highpass',2800);
  rings(c,t+.028,k,[[780,.03,.5],[1650,.02,.3],[2900,.012,.18]]);
  rings(c,t+.03,k,[[4200,.05,.11],[6100,.03,.06]]);
  rings(c,t+.03,k,[[140,.05,.28]]);
 },
 /* Al sacarlo: el resorte suelta el vástago (brillo corto) y la clavija sale con un «plop» suave. */
 'cable-desconecta':(c,t,k)=>{
  rings(c,t,k,[[3800,.018,.1]]);
  slide(c,t+.004,.026,5000,2200,.1);
  burst(c,t+.028,.018,.28,'bandpass',700*k,1.1);rings(c,t+.028,k,[[520,.04,.3],[1100,.02,.12]]);
 },
 /* Campana suave de acierto (dos notas con parciales inarmónicos, como un vibráfono pequeño). */
 'paso-correcto':(c,t)=>{
  rings(c,t,1,[[1046.5,.14,.07],[2887,.04,.03],[5400,.02,.015]]);
  rings(c,t+.09,1,[[1318.5,.2,.07],[3640,.05,.03],[6800,.02,.015]]);
 },
};
/** Tono propio de cada elemento (1 = el de referencia). */
const PITCH:Record<string,number>={TEMPORIZADOR_1:.82,CONTACTOR_TERMICO:1,CONTACTOR_TRIFASICO:1.1,CONTACTOR_TRIFASICO_3:1.18,S1:1,S2:.88,S3:1.06};

function record(name:string){
 log.push(name);
 if(log.length>60)log.shift();
 (window as unknown as {__panelSounds?:string[]}).__panelSounds=log;
}

export function playElementSound(kind:ElementSound,element?:string){
 if(!enabled||typeof document==='undefined'||document.hidden)return;
 record(element?`${kind}:${element}`:kind);
 const c=audio();
 if(!c)return;
 if(c.state==='suspended')void c.resume().catch(()=>{});
 const k=(PITCH[element??'']??1)*(.97+Math.random()*.06);
 try{SOUNDS[kind](c,c.currentTime+.005,k,element);}catch{record('error:'+kind);/* un sonido que falla no debe afectar al simulador */}
}

/** Sonidos de las acciones de la persona sobre el banco: pulsadores, interruptores, enchufe y relé térmico. */
export function soundsForInputChange(prev:SimulationInput,next:SimulationInput){
 if(prev.enabled!==next.enabled)return;
 for(const id of next.pressed)if(!prev.pressed.includes(id))playElementSound('pulsador-abajo',id);
 for(const id of prev.pressed)if(!next.pressed.includes(id))playElementSound('pulsador-arriba',id);
 if(prev.forceBreaker!==next.forceBreaker)playElementSound('interruptor','FUERZA');
 next.breakers.forEach((on,i)=>{if(on!==prev.breakers[i])playElementSound('interruptor','CONTROL'+(i+1));});
 if(prev.plugged!==next.plugged)playElementSound('enchufe');
 if(next.thermalTripped!==prev.thermalTripped)playElementSound(next.thermalTripped?'termico-dispara':'termico-rearma');
}

/* ── Motor ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 * Un solo motor sintetizado que sigue al simulador cada 40 ms: el zumbido magnético de 100 Hz (el doble de la frecuencia de red), el silbido de las ranuras
 * que sube con las revoluciones y el soplo del ventilador. La falta de fase produce un traqueteo pulsante y el rotor frenado un zumbido grave sostenido. */
export type MotorSoundState={fed:boolean;rpm:number;syncRpm:number;/** 0 = sano, 1 = muy mal conectado */rough:number;stalled:boolean;missingPhase?:boolean;connection?:MotorState['connection']};
type Engine={master:GainNode;humG:GainNode;humFilter:BiquadFilterNode;amp:GainNode;whineG:GainNode;whine:OscillatorNode;fanG:GainNode;fanF:BiquadFilterNode;buzzG:GainNode;buzzFilter:BiquadFilterNode;lfoDepth:GainNode;hum:OscillatorNode;lfo:OscillatorNode;nodes:AudioScheduledSourceNode[]};
let engine:Engine|null=null,motorMode:'off'|'ok'|'rough'='off',stallTime=0,lastMotorAt=0,quietSince=0;
let lastConnection:MotorState['connection']=null,lastFeedAt=0,deltaMakeAt=-Infinity;

function buildEngine(c:AudioContext):Engine{
 const master=c.createGain(),humG=c.createGain(),amp=c.createGain(),whineG=c.createGain(),fanG=c.createGain(),buzzG=c.createGain(),lfoDepth=c.createGain();
 master.gain.value=0;humG.gain.value=0;whineG.gain.value=0;fanG.gain.value=0;buzzG.gain.value=0;amp.gain.value=1;lfoDepth.gain.value=0;
 const hum=c.createOscillator(),sub=c.createOscillator(),lp=c.createBiquadFilter(),whine=c.createOscillator(),buzz=c.createOscillator(),buzzBp=c.createBiquadFilter(),lfo=c.createOscillator();
 hum.type='sawtooth';hum.frequency.value=100;sub.type='sine';sub.frequency.value=50;lp.type='lowpass';lp.frequency.value=520;lp.Q.value=.8;
 whine.type='sine';whine.frequency.value=120;buzz.type='square';buzz.frequency.value=100.6;buzzBp.type='bandpass';buzzBp.frequency.value=850;buzzBp.Q.value=2.5;lfo.type='sine';lfo.frequency.value=9;
 hum.connect(lp);sub.connect(lp);lp.connect(humG);humG.connect(amp);amp.connect(master);
 whine.connect(whineG);whineG.connect(master);
 buzz.connect(buzzBp);buzzBp.connect(buzzG);buzzG.connect(master);
 const fanF=c.createBiquadFilter();fanF.type='bandpass';fanF.frequency.value=500;fanF.Q.value=.7;
 const src=c.createBufferSource();src.buffer=noise;src.loop=true;src.connect(fanF);fanF.connect(fanG);fanG.connect(master);
 lfo.connect(lfoDepth);lfoDepth.connect(amp.gain);master.connect(bus!);
 const nodes:AudioScheduledSourceNode[]=[hum,sub,whine,buzz,lfo,src];
 nodes.forEach(n=>n.start());
 return {master,humG,humFilter:lp,amp,whineG,whine,fanG,fanF,buzzG,buzzFilter:buzzBp,lfoDepth,hum,lfo,nodes};
}
function stopEngine(){
 if(!engine)return;
 const e=engine;engine=null;
 try{e.master.gain.setTargetAtTime(0,ctx!.currentTime,.05);}catch{/* ya cerrado */}
 setTimeout(()=>{e.nodes.forEach(n=>{try{n.stop();}catch{/* ya detenido */}});e.master.disconnect();},400);
}
/** Actualiza el motor; `null` lo apaga. Se llama en cada paso de la simulación. */
export function setMotorSound(state:MotorSoundState|null){
 const now=typeof performance!=='undefined'?performance.now():0,dt=lastMotorAt?Math.min(.2,(now-lastMotorAt)/1000):.04;lastMotorAt=now;
 const k=state?Math.min(1,Math.abs(state.rpm)/Math.max(1,state.syncRpm)):0;
 const audible=!!state&&enabled&&typeof document!=='undefined'&&!document.hidden&&(state.fed||Math.abs(state.rpm)>25);
 stallTime=state?.fed&&state.stalled?stallTime+dt:0;
 const missingPhase=!!(state?.fed&&state.missingPhase);
 const blocked=stallTime>=.30&&!missingPhase;
 const rough=state?.fed?Math.max(state.rough,Math.min(1,(stallTime-.35)/.5)):0;
 const mode:'off'|'ok'|'rough'=!audible?'off':rough>.35?'rough':'ok';
 if(mode!==motorMode){if(enabled)record(mode==='off'?'motor:para':mode==='rough'?'motor:falla':motorMode==='off'?'motor:arranca':'motor:normal');motorMode=mode;}
 if(!audible){
  lastConnection=null;deltaMakeAt=-Infinity;
  if(engine){engine.master.gain.setTargetAtTime(0,ctx!.currentTime,.12);quietSince||=now;if(now-quietSince>1500){stopEngine();quietSince=0;}}
  return;
 }
 quietSince=0;
 const c=audio();if(!c)return;
 if(c.state==='suspended')void c.resume().catch(()=>{});
 if(!engine)engine=buildEngine(c);
 const e=engine,t=c.currentTime,fed=!!state!.fed,connection=fed?state!.connection:null;
 if(connection){
  // El motor sigue girando durante el intervalo abierto entre contactores.
  if(connection==='delta'&&lastConnection==='star'&&now-lastFeedAt<1000){
   deltaMakeAt=now;record('motor:cambio-triangulo');
  }
  lastConnection=connection;lastFeedAt=now;
 }
 const make=connection==='delta'?Math.exp(-(now-deltaMakeAt)/145):0;
 const set=(p:AudioParam,v:number,tc=.07)=>p.setTargetAtTime(v,t,tc);
 /* sano: el zumbido es más fuerte al arrancar (corriente de arranque) y se aplaca cuando el motor toma velocidad */
 const load=fed?1-.45*k:.55*k;
 set(e.master.gain,.2*(fed?1:.7)*(.5+.5*Math.max(k,.35))*(1+.7*rough));
 // En estrella hay menos cuerpo magnético. Al entrar triángulo se oye un
 // refuerzo breve, separado del sonido de giro y de la velocidad del ventilador.
 const magneticBody=connection==='star'?.66:1+.40*make;
 set(e.whine.frequency,90+k*640+rough*Math.sin(now/180)*25);
 set(e.whineG.gain,blocked?0:(.015+.09*k)*(1-.5*rough),.08);
 set(e.fanF.frequency,350+k*1700);
 set(e.fanG.gain,blocked?0:.02+.14*k*k,.1);
 if(missingPhase){
  // Pulsos irregulares de par: sobresale el traqueteo metálico por encima del giro.
  const pulse=(.5+.5*Math.sin(now/83+.28*Math.sin(now/197)))**2;
  set(e.humG.gain,.33+.24*pulse,.023);
  set(e.humFilter.frequency,570,.045);
  set(e.hum.frequency,100+2*pulse);
  set(e.buzzFilter.frequency,1110,.045);
  set(e.buzzG.gain,.07+.87*pulse,.018);
  set(e.lfo.frequency,13);set(e.lfoDepth.gain,.48,.1);
 }else if(blocked){
  // Corriente con el eje quieto: cuerpo grave fijo, sin cadencia ni ventilador.
  set(e.humG.gain,.98,.055);
  set(e.humFilter.frequency,260,.045);
  set(e.hum.frequency,100);
  set(e.buzzFilter.frequency,310,.045);
  set(e.buzzG.gain,.34,.05);
  set(e.lfoDepth.gain,0,.05);
 }else{
  set(e.humG.gain,(.35+.45*load)*(1+.5*rough)*magneticBody,.035);
  set(e.humFilter.frequency,connection==='star'?395:520+230*make,.045);
  set(e.hum.frequency,100+rough*Math.sin(now/260)*3);
  set(e.buzzFilter.frequency,850,.045);
  set(e.buzzG.gain,rough*(.5+.3*Math.sin(now/310)),.06);
  set(e.lfo.frequency,6+rough*8);set(e.lfoDepth.gain,rough*.65,.1);
 }
}
