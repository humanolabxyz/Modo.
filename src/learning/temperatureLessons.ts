import type {Reading,Settings,Temps} from '../lab/temperature/physics';
import type {ConceptId} from './temperatureReview';
import {progressKey,matchesTempSeries,type TempRecord} from '../lab/temperature/state';
/** Guía práctica de laboratorio 2 · Sensores continuos: sensor de temperatura (G03). Las tres experiencias se conservan
 *  como actividades distintas. Las mediciones simuladas (preparación) nunca se mezclan con las reales de la clase. */
export type Ctx={settings:Settings;temps:Temps;reading:Reading;records:TempRecord[];notes?:string;viewed?:string[]};
export type Ask={prompt:string;unit:string;tolerance:number;expected:(c:Pick<Ctx,'settings'|'records'>)=>number|null;missing:string};
export type Quiz={question:string;options:string[];answer:number;explanation:string;concept?:ConceptId};
export type TempStep={title:string;text:string;success:string;concept?:ConceptId;resource?:'curves'|'spreadsheet';check?:(c:Ctx)=>boolean;ask?:Ask;quiz?:Quiz};
export type TempLesson={id:string;materialId:string;title:string;experience:1|2|3;unit:2;source:string;bench:boolean;intro:string;concept:string;review?:Quiz;steps:TempStep[]};

const POINTS=(ambient:number)=>[ambient,50,75,100];
const hasPoints=(c:Pick<Ctx,'settings'|'records'>,sensor:'tc'|'pt'|'tx')=>POINTS(c.settings.ambient).every(t=>c.records.some(r=>r.source==='simulada'&&r.sensor===sensor&&matchesTempSeries(r,c.settings)&&Math.abs(r.temp-t)<=0.6));
const SOURCE='/estudio/instrumentacion/guia-temperatura-g03.docx';
const needPoints='Registra antes los puntos: temperatura ambiente, 50, 75 y 100 °C.';

export const temperatureLessons:TempLesson[]=[
  {id:'temperatura-experiencia-1',materialId:'instrumentacion-g03-exp1',title:'Temperatura · Experiencia 1: investigar y explicar',experience:1,unit:2,source:SOURCE,bench:false,
    intro:'Antes de medir, aclara qué es cada sensor, cómo funciona y qué señal entrega. Estas preguntas siguen los puntos de investigación de la guía.',
    concept:'Una termocupla y un Pt100 miden temperatura, pero de formas distintas: la primera genera una tensión muy pequeña y el segundo cambia su resistencia. Las dos varían de forma continua, no a saltos.',
    steps:[
      {title:'Señales continuas y discretas',text:'La guía pide definir la naturaleza de termocuplas y RTD.',success:'Correcto.',quiz:{question:'¿Cómo es la señal de una termocupla o de un Pt100?',options:['Discreta: solo existe encendido o apagado','Continua (analógica): cambia de forma gradual con la temperatura','Digital: ya viene codificada en bits'],answer:1,explanation:'Ambas varían de forma continua con la temperatura. Una señal discreta solo toma estados separados, como un detector de presencia con salida todo o nada.',concept:'senal-continua'}},
      {title:'Principio de la termocupla',text:'Define el principio de funcionamiento de una termocupla.',success:'Correcto.',quiz:{question:'¿Cómo funciona una termocupla?',options:['La resistencia de un metal aumenta con la temperatura','Dos metales distintos unidos generan una tensión pequeña que depende de la diferencia de temperatura (efecto Seebeck)','Un líquido se dilata y mueve una aguja'],answer:1,explanation:'El efecto Seebeck produce milivoltios entre la unión caliente y la referencia. Por eso una termocupla necesita conocer la temperatura de su unión de referencia.',concept:'seebeck'}},
      {title:'Principio del Pt100',text:'Define el principio de funcionamiento de una RTD (Pt100).',success:'Correcto.',quiz:{question:'¿Cómo funciona un Pt100?',options:['Genera una tensión propia al calentarse','Cambia su temperatura según la corriente que lo atraviesa','Su resistencia eléctrica aumenta de forma regular al subir la temperatura'],answer:2,explanation:'El platino cambia su resistencia con la temperatura. Hay que medir esa resistencia (con una corriente pequeña) para conocer la temperatura.',concept:'pt100-principio'}},
      {title:'Tipo de salida de cada sensor',text:'Define el tipo de salida de la termocupla y del Pt100.',success:'Correcto.',quiz:{question:'¿Qué magnitud entrega cada uno?',options:['Termocupla: ohmios · Pt100: milivoltios','Termocupla: milivoltios · Pt100: ohmios','Los dos entregan una corriente de 4–20 mA directamente'],answer:1,explanation:'La termocupla entrega una tensión en milivoltios y el Pt100 una resistencia en ohmios. El 4–20 mA o 0–10 V aparece recién en un transmisor.',concept:'salidas'}},
      {title:'Qué significa «100» en Pt100',text:'Interpreta el nombre del sensor.',success:'Correcto.',quiz:{question:'¿Qué indica el 100 de Pt100?',options:['Que mide hasta 100 °C','Que tiene 100 Ω a 0 °C','Que entrega 100 mV a 100 °C'],answer:1,explanation:'Pt es platino y 100 es su resistencia a 0 °C. Por eso a temperatura ambiente se espera algo más de 100 Ω.',concept:'pt100-valor'}},
    ]},
  {id:'temperatura-experiencia-2',materialId:'instrumentacion-g03-exp2',title:'Temperatura · Experiencia 2: medir y comparar sensores',experience:2,unit:2,source:SOURCE,bench:true,
    intro:'Mide una termocupla (K o J, a tu elección) y un Pt100 a temperatura ambiente, 50, 75 y 100 °C, y compara sus curvas. Los datos de esta práctica son simulados; en el laboratorio los reemplazas por tus mediciones reales.',
    concept:'La termocupla se mide en milivoltios (función mV) y el Pt100 en ohmios (función Ω). El horno de pozo seco necesita unos segundos para estabilizarse: lee solo cuando el banco avise que la sonda llegó a la temperatura.',
    review:{concept:'funcion-medida',question:'¿Por qué el Pt100 se mide en ohmios y la termocupla en milivoltios?',options:['Porque el Pt100 es una resistencia y la termocupla genera una tensión','Porque el multímetro solo mide ohmios en el horno','Porque son lo mismo con otro nombre'],answer:0,explanation:'El Pt100 cambia su resistencia con la temperatura; la termocupla genera una tensión pequeña por el efecto Seebeck. Medir con la función equivocada no informa la temperatura.'},
    steps:[
      {title:'Introduce las dos sondas en el pozo',text:'Arrastra hacia abajo el control de cada sonda para insertarla, o toca «insertar». Ambas deben quedar dentro del pozo.',success:'Las dos sondas están en el pozo.',check:c=>c.settings.inWell.tc&&c.settings.inWell.pt},
      {title:'Mide la termocupla en milivoltios',text:'Elige la función mV en el multímetro y conecta la punta roja al hilo + y la negra al hilo − de la termocupla. Cambia el tipo (K o J) si quieres comparar.',success:'Estás leyendo la tensión de la termocupla con la función correcta.',concept:'funcion-medida',check:c=>c.reading.state==='ok'&&c.reading.sensor==='tc'&&c.reading.meaningful},
      {title:'Registra los cuatro puntos de la termocupla',text:'Fija el horno en ambiente, 50, 75 y 100 °C. En cada punto espera la estabilización, toca su casilla en la libreta G03, lee la pantalla y transcribe el valor en mV. La unión de referencia queda a la temperatura ambiente.',success:'Tienes los cuatro puntos de la termocupla.',concept:'cuatro-puntos',check:c=>hasPoints(c,'tc')},
      {title:'Mide el Pt100 en ohmios',text:'Cambia el multímetro a Ω y conecta una punta a un hilo rojo y la otra a un hilo blanco del Pt100.',success:'Estás midiendo la resistencia del Pt100.',concept:'hilos-pt100',check:c=>c.reading.state==='ok'&&c.reading.sensor==='pt'&&c.reading.meaningful},
      {title:'Registra los cuatro puntos del Pt100',text:'Repite ambiente, 50, 75 y 100 °C usando los botones del horno. Lee Ω en el instrumento y transcribe cada lectura en la casilla Pt100 de la libreta. Luego compara con las referencias.',success:'Tienes los cuatro puntos del Pt100.',concept:'cuatro-puntos',check:c=>hasPoints(c,'pt')},
      {title:'Calcula la sensibilidad del Pt100',text:'Con tus datos, calcula cuántos ohmios cambia el Pt100 por cada grado entre la temperatura ambiente y 100 °C.',success:'La sensibilidad coincide con tus datos.',concept:'sensibilidad',
        ask:{prompt:'Sensibilidad media del Pt100 entre ambiente y 100 °C',unit:'Ω/°C',tolerance:0.01,missing:needPoints,
          expected:c=>{const pts=c.records.filter(r=>r.source==='simulada'&&r.sensor==='pt'&&matchesTempSeries(r,c.settings));const lo=pts.filter(r=>Math.abs(r.temp-c.settings.ambient)<=0.6).at(-1),hi=pts.filter(r=>Math.abs(r.temp-100)<=0.6).at(-1);return lo&&hi?(hi.value-lo.value)/(hi.temp-lo.temp):null;}}},
    ]},
  {id:'temperatura-experiencia-3',materialId:'instrumentacion-g03-exp3',title:'Temperatura · Experiencia 3: medir mediante transmisor',experience:3,unit:2,source:SOURCE,bench:true,
    intro:'Conecta la termocupla de la experiencia anterior a un transmisor con salida en tensión y construye otra curva: temperatura, salida de la termocupla y salida del transmisor en los mismos cuatro puntos.',
    concept:'Un transmisor convierte los milivoltios de la termocupla en una señal normalizada, por ejemplo 0–10 V. El rango de temperatura que corresponde a esa salida lo configuras tú: la guía propone 0–10 V como ejemplo y no fija el rango de entrada.',
    review:{concept:'transmisor-tipo',question:'Si el transmisor está configurado para una termocupla tipo J y el sensor es tipo K, ¿qué ocurre?',options:['Nada: ambos tipos son iguales','La salida es incorrecta, porque interpreta los milivoltios con la tabla equivocada','El transmisor se apaga solo'],answer:1,explanation:'Cada tipo de termocupla tiene su propia tabla de milivoltios por grado. Un tipo mal configurado produce una temperatura errónea aunque todo esté conectado.'},
    steps:[
      {title:'Conecta la termocupla al transmisor y aliméntalo',text:'Conecta los hilos sobre el transmisor y opera el interruptor de la fuente sobre el banco. Introduce la termocupla en el pozo.',success:'El transmisor recibe la termocupla y está alimentado.',concept:'transmisor-conexion',check:c=>c.settings.txConnected&&c.settings.txPowered},
      {title:'Configura el transmisor',text:'Selecciona el mismo tipo de termocupla que usas y define un rango de temperatura para la salida de 0 a 10 V (por ejemplo, de 0 a 100 °C o el que prefieras).',success:'El tipo coincide con la termocupla y el rango es válido.',concept:'transmisor-tipo',check:c=>c.settings.txType===c.settings.tcType&&c.settings.txMax-c.settings.txMin>=50},
      {title:'Mide la salida del transmisor',text:'Elige la función V del multímetro y conecta las puntas a la salida + y − del transmisor.',success:'Estás midiendo la tensión de salida del transmisor.',concept:'transmisor-conexion',check:c=>c.reading.state==='ok'&&c.reading.sensor==='tx'&&c.reading.meaningful},
      {title:'Registra los cuatro puntos de ambos sensores',text:'En ambiente, 50, 75 y 100 °C registra la salida de la termocupla (mV) y la del transmisor (V). Gira el selector y mueve las puntas entre una lectura y otra. Transcribe cada valor en su casilla de la libreta G03.',success:'Tienes la curva de la termocupla y la del transmisor.',concept:'cuatro-puntos',check:c=>hasPoints(c,'tc')&&hasPoints(c,'tx')},
      {title:'Predice una salida con tu rango',text:'Con el rango que configuraste, calcula qué tensión debería entregar el transmisor a 75 °C y compárala con tu registro.',success:'Tu cálculo coincide con el rango configurado.',concept:'transmisor-rango',
        ask:{prompt:'Tensión esperada a 75 °C',unit:'V',tolerance:0.05,missing:'Configura primero un rango válido en el transmisor.',
          expected:c=>{const {txMin,txMax}=c.settings;return txMax>txMin?Math.min(10,Math.max(0,10*(75-txMin)/(txMax-txMin))):null;}}},
    ]},
];
for(const lesson of temperatureLessons.filter(l=>l.bench)){
 const sensors=lesson.experience===2?['tc','pt']:['tc','tx'];
 lesson.steps.push(
  {title:'Revisar las curvas y referencias',text:'Abre cada curva con los botones de este paso. Observa las unidades y compara tus puntos con la referencia de tabla. Las series de otras configuraciones se conservan por separado.',success:'Has abierto las curvas de esta experiencia.',concept:'cuatro-puntos',resource:'curves',check:c=>sensors.every(s=>c.viewed?.includes('curve:'+s))},
  {title:'Explicar los resultados',text:lesson.experience===2?'En «Mis observaciones», compara el comportamiento de la termocupla y del Pt100. Explica qué magnitud cambia, sus unidades y qué observas respecto a la tabla.':'En «Mis observaciones», explica cómo los milivoltios de la termocupla se convierten a voltios. Indica el rango elegido y justifica tu resultado a 75 °C.',success:'Tu explicación quedó registrada para revisión; no se califica automáticamente.',concept:'sensibilidad',check:c=>(c.notes?.trim().length??0)>=35},
  {title:'Preparar la planilla de la guía',text:'Descarga la planilla Excel con tus mediciones y gráficos. Cada tipo de sensor, origen y configuración tiene una serie separada. Puedes completarla y revisarla en clase.',success:'Planilla generada con los registros de esta experiencia.',concept:'cuatro-puntos',resource:'spreadsheet',check:c=>!!c.viewed?.includes('spreadsheet')&&sensors.every(s=>hasPoints(c,s as 'tc'|'pt'|'tx'))}
 );
}
export const temperatureLesson=(id:string|null|undefined)=>temperatureLessons.find(l=>l.id===id);
export const temperatureLessonByMaterial=(id:string|null|undefined)=>temperatureLessons.find(l=>l.materialId===id);
export const tempStudyUrl=(lesson:TempLesson,step=0)=>`/estudio?curso=s2-3&clase=${lesson.materialId}&paso=${step}`;
export const tempLabUrl=(lesson:TempLesson)=>`/laboratorio?tool=temperature&leccion=${lesson.id}`;

export type TempProgress={version:1;step:number;completed:number[];notes:string;reviewed:boolean;viewed?:string[]};
export const newTempProgress=():TempProgress=>({version:1,step:0,completed:[],notes:'',reviewed:false});
export function readTempProgress(lesson:TempLesson):TempProgress{
  const raw=localStorage.getItem(progressKey(lesson.id));if(!raw)return newTempProgress();
  const p:unknown=JSON.parse(raw);
  if(typeof p==='object'&&p!==null&&'viewed'in p&&(!Array.isArray(p.viewed)||p.viewed.length>30||p.viewed.some(v=>typeof v!=='string'||v.length>80)))throw new Error('Avance de recursos incompatible');
  if(typeof p!=='object'||p===null||!('version'in p)||p.version!==1||!('step'in p)||!Number.isInteger(p.step)||Number(p.step)<0||Number(p.step)>=lesson.steps.length||!('completed'in p)||!Array.isArray(p.completed)||p.completed.some(i=>!Number.isInteger(i)||i<0||i>=lesson.steps.length)||!('notes'in p)||typeof p.notes!=='string'||p.notes.length>20000||!('reviewed'in p)||typeof p.reviewed!=='boolean')throw new Error('No se pudo leer el avance anterior.');
  return p as TempProgress;
}
