import type {Reading,Settings} from '../lab/temperature/physics';
/** Repaso de la guía G03. Cada error del estudiante (una respuesta incorrecta, un paso que no se cumple o un montaje sin sentido físico)
 *  se asocia a un concepto. El repaso prioriza los conceptos con errores y no es una calificación: refuerza lo estudiado. */
export type ConceptId='senal-continua'|'seebeck'|'pt100-principio'|'salidas'|'pt100-valor'|'union-fria'|'funcion-medida'|'hilos-pt100'|'conexion-puntas'|'estabilidad'|'cuatro-puntos'|'sensibilidad'|'transmisor-conexion'|'transmisor-tipo'|'transmisor-rango';
export type Concept={id:ConceptId;title:string;experience:1|2|3;where:'preguntas'|'banco';summary:string};
export type ReviewQuestion={concept:ConceptId;question:string;options:string[];answer:number;explanation:string};
export const REVIEW_ID='temperatura-repaso';
export const REVIEW_MATERIAL='instrumentacion-g03-repaso';
export const reviewUrl=()=>`/estudio?curso=s2-3&clase=${REVIEW_MATERIAL}`;
export const CONCEPTS:Concept[]=[
  {id:'senal-continua',title:'Señales continuas y discretas',experience:1,where:'preguntas',summary:'Termocupla y Pt100 entregan señales continuas: cambian de forma gradual con la temperatura.'},
  {id:'seebeck',title:'Principio de la termocupla',experience:1,where:'preguntas',summary:'Dos metales distintos unidos generan una tensión pequeña que depende de la temperatura (efecto Seebeck).'},
  {id:'pt100-principio',title:'Principio del Pt100',experience:1,where:'preguntas',summary:'La resistencia del platino aumenta de forma regular con la temperatura.'},
  {id:'salidas',title:'Salida de cada sensor',experience:1,where:'preguntas',summary:'La termocupla entrega milivoltios; el Pt100, una resistencia en ohmios.'},
  {id:'pt100-valor',title:'Qué significa «100» en Pt100',experience:1,where:'preguntas',summary:'100 Ω a 0 °C; a 100 °C vale unos 138,5 Ω.'},
  {id:'union-fria',title:'Unión de referencia de la termocupla',experience:2,where:'banco',summary:'La tensión medida depende de la diferencia con la temperatura de la unión de referencia (el ambiente).'},
  {id:'funcion-medida',title:'Elegir mV, Ω o V según el sensor',experience:2,where:'banco',summary:'Termocupla en mV, Pt100 en Ω y salida del transmisor en V. Una función equivocada no informa la temperatura.'},
  {id:'hilos-pt100',title:'Hilos del Pt100: rojo y blanco',experience:2,where:'banco',summary:'La resistencia del sensor está entre un hilo rojo y uno blanco; entre dos del mismo color solo mides el cable.'},
  {id:'conexion-puntas',title:'Conectar las puntas al mismo sensor',experience:2,where:'banco',summary:'Las dos puntas deben ir al mismo sensor; si no, el circuito queda abierto.'},
  {id:'estabilidad',title:'Esperar a que se estabilice',experience:2,where:'banco',summary:'Se registra cuando el horno y la sonda llegaron a la temperatura, no antes.'},
  {id:'cuatro-puntos',title:'Los cuatro puntos pedidos',experience:2,where:'banco',summary:'Temperatura ambiente, 50, 75 y 100 °C, para cada sensor.'},
  {id:'sensibilidad',title:'Sensibilidad del Pt100',experience:2,where:'banco',summary:'Entre 0 y 100 °C el Pt100 cambia unos 0,385 Ω por grado; se calcula con tus datos.'},
  {id:'transmisor-conexion',title:'Alimentar y conectar el transmisor',experience:3,where:'banco',summary:'Sin alimentación o sin la termocupla conectada, la salida vale 0 V.'},
  {id:'transmisor-tipo',title:'Tipo de termocupla del transmisor',experience:3,where:'banco',summary:'El transmisor debe tener el mismo tipo (K o J) que la termocupla; si no, lee una temperatura errónea.'},
  {id:'transmisor-rango',title:'Rango y salida 0–10 V',experience:3,where:'banco',summary:'La salida es lineal: 0 V en el límite inferior del rango y 10 V en el superior.'},
];
export const concept=(id:ConceptId)=>CONCEPTS.find(c=>c.id===id)!;
const q=(concept:ConceptId,question:string,options:string[],answer:number,explanation:string):ReviewQuestion=>({concept,question,options,answer,explanation});
/** Dos preguntas por concepto, redactadas distinto de las de las lecciones. */
export const QUESTIONS:ReviewQuestion[]=[
  q('senal-continua','Un detector de presencia entrega 24 V o 0 V. Una termocupla entrega una tensión que cambia suavemente con la temperatura. ¿Cuál es continua?',['El detector de presencia','La termocupla','Las dos son discretas'],1,'La termocupla es continua: toma muchos valores intermedios. El detector con 24 V o 0 V es discreto.'),
  q('senal-continua','Si el horno sube de 50 a 75 °C, la lectura del Pt100…',['Salta de golpe entre dos valores fijos','Cambia de forma gradual','No cambia mientras no llegue a 100 °C'],1,'Es una señal continua: la resistencia va aumentando gradualmente con la temperatura.'),
  q('seebeck','¿Qué provoca la tensión de una termocupla?',['Dos metales distintos unidos y una diferencia de temperatura','Una corriente que le entrega el multímetro','Que el platino cambie de resistencia'],0,'Es el efecto Seebeck: la unión de dos metales distintos genera una tensión que depende de la temperatura.'),
  q('seebeck','Una termocupla K está formada por…',['Un solo hilo de platino','Dos aleaciones metálicas distintas','Un semiconductor y un condensador'],1,'Una termocupla se forma con dos metales o aleaciones distintos; en la tipo K son cromel y alumel.'),
  q('pt100-principio','¿Por qué el Pt100 sirve para medir temperatura?',['Porque su resistencia aumenta con la temperatura','Porque genera milivoltios','Porque cambia de color'],0,'El platino cambia su resistencia con la temperatura de forma regular y repetible.'),
  q('pt100-principio','Si la temperatura del Pt100 sube, su resistencia…',['Baja','Sube','Se mantiene fija'],1,'En el platino la resistencia aumenta con la temperatura.'),
  q('salidas','Quieres medir una termocupla con el multímetro. ¿Qué magnitud esperas leer?',['Unos pocos milivoltios','Cientos de ohmios','Una corriente de 4–20 mA'],0,'La termocupla entrega una tensión de milivoltios.'),
  q('salidas','El Pt100 entrega…',['Una tensión de milivoltios','Una resistencia en ohmios','Una señal digital de bits'],1,'El Pt100 es una resistencia: se mide en ohmios.'),
  q('pt100-valor','Un Pt100 mide 100 Ω. ¿A qué temperatura está?',['A 0 °C','A 100 °C','A temperatura ambiente de 22 °C'],0,'El «100» indica 100 Ω a 0 °C.'),
  q('pt100-valor','¿Qué resistencia esperas de un Pt100 a 100 °C?',['Unos 100 Ω','Unos 138,5 Ω','Unos 1000 Ω'],1,'A 100 °C el Pt100 vale unos 138,5 Ω (0,385 Ω por grado en promedio).'),
  q('union-fria','El horno está a 100 °C y sube la temperatura ambiente. La tensión medida de la termocupla…',['Disminuye, porque la referencia está más caliente','Aumenta','No cambia'],0,'La tensión depende de la diferencia entre la unión caliente y la de referencia; si la referencia sube, la diferencia baja.'),
  q('union-fria','¿Por qué importa la temperatura de la unión de referencia?',['Porque la tensión medida es una diferencia entre dos temperaturas','Porque calienta el multímetro','No importa nunca'],0,'La termocupla mide la diferencia entre la unión caliente y la de referencia; hay que conocer esta última para obtener la temperatura real.'),
  q('funcion-medida','Mides la termocupla con la función Ω y lees casi 0 Ω. ¿Qué pasó?',['La termocupla está en 0 °C','Elegiste la función equivocada: su resistencia no informa la temperatura','El horno se apagó'],1,'La termocupla es casi un conductor. Para ver su señal hay que usar mV.'),
  q('funcion-medida','Mides el Pt100 con la función mV y lees 0. ¿Por qué?',['El Pt100 no genera tensión: es una resistencia','El Pt100 está dañado','Faltan 10 minutos de espera'],0,'El Pt100 solo cambia su resistencia; para leerlo se usa la función Ω.'),
  q('hilos-pt100','En un Pt100 de 3 hilos hay dos rojos y uno blanco. ¿Entre cuáles mides la resistencia del sensor?',['Entre los dos rojos','Entre un rojo y el blanco','Entre un hilo y la vaina de acero'],1,'Los dos rojos van unidos al mismo extremo del elemento; el sensor está entre un rojo y el blanco.'),
  q('hilos-pt100','Mides entre los dos hilos rojos de un Pt100 y lees casi 0 Ω. ¿Está dañado?',['Sí, está en cortocircuito','No: los dos rojos están unidos en el mismo extremo y solo mides el cable','Sí, porque no está en el horno'],1,'Es normal. Hay que medir entre un hilo rojo y uno blanco.'),
  q('conexion-puntas','Pones la punta roja en la termocupla y la negra en el Pt100. El multímetro muestra OL. ¿Por qué?',['Los dos sensores están a la misma temperatura','El circuito queda abierto: son sensores distintos','El multímetro está en la escala más grande'],1,'Cada medición se hace entre los dos hilos del mismo sensor.'),
  q('conexion-puntas','Para medir la termocupla, las dos puntas deben ir…',['Una en cada hilo de la termocupla','Las dos en el mismo hilo','Una en la termocupla y otra en la fuente'],0,'Se mide entre el hilo + y el hilo −, que cierran el circuito del multímetro.'),
  q('estabilidad','Acabas de bajar la sonda al horno y la pantalla ya muestra 75 °C. ¿Cuándo registras?',['De inmediato','Cuando la sonda también llegó a la temperatura y el banco marca «estable»','Cuando el horno vuelva al ambiente'],1,'La sonda tarda en igualar la temperatura del pozo: la lectura solo vale cuando ya es estable.'),
  q('estabilidad','Registras mientras la sonda aún se está calentando. El valor será…',['Menor que el de equilibrio','Igual al de equilibrio','Mayor que el de equilibrio'],0,'Todavía no llegó a la temperatura del horno, así que el valor aún no es el definitivo.'),
  q('cuatro-puntos','Tienes registrados ambiente, 50 y 100 °C de un sensor. ¿Qué punto de la guía falta?',['25 °C','75 °C','150 °C'],1,'La guía pide ambiente, 50, 75 y 100 °C.'),
  q('cuatro-puntos','¿Por qué se pide registrar los mismos cuatro puntos para la termocupla y el Pt100?',['Para poder comparar sus curvas','Porque el horno solo llega a 4 temperaturas','Para gastar menos tiempo'],0,'Con los mismos puntos se comparan ambos sensores y con las tablas de referencia.'),
  q('sensibilidad','Un Pt100 pasa de 108,6 Ω a 138,5 Ω entre 22 y 100 °C. ¿Cuántos ohmios cambia por grado (promedio)?',['Aproximadamente 0,38 Ω/°C','Aproximadamente 3,8 Ω/°C','Aproximadamente 38 Ω/°C'],0,'(138,5 − 108,6) ÷ 78 ≈ 0,38 Ω/°C.'),
  q('sensibilidad','La sensibilidad se calcula como…',['Cambio de la lectura dividido por el cambio de temperatura','Temperatura dividida por la lectura','Suma de todas las lecturas'],0,'Es cuánto cambia la lectura por cada grado: Δlectura ÷ Δtemperatura.'),
  q('transmisor-conexion','El transmisor está conectado a la termocupla pero la fuente está apagada. ¿Qué tensión mides en su salida?',['0 V','10 V','La que corresponde a la temperatura'],0,'Sin alimentación el transmisor no entrega salida.'),
  q('transmisor-conexion','El transmisor está alimentado pero su entrada no está conectada a la termocupla. Su salida…',['Vale 0 V','Vale 10 V','Sigue la temperatura del horno'],0,'No recibe señal de temperatura, así que no hay salida útil.'),
  q('transmisor-tipo','La termocupla es tipo K y el transmisor está configurado como tipo J. La salida…',['Es incorrecta aunque todo esté conectado','Es exacta','Se apaga'],0,'Cada tipo tiene su propia tabla de milivoltios; con el tipo equivocado el transmisor interpreta mal la señal.'),
  q('transmisor-tipo','Antes de medir con el transmisor debes verificar que…',['Su tipo configurado coincida con el de la termocupla','La fuente esté en 0 V','El multímetro esté en Ω'],0,'El tipo de termocupla configurado debe ser el mismo del sensor.'),
  q('transmisor-rango','Rango 20–120 °C y salida 0–10 V. ¿Qué tensión corresponde a 70 °C?',['5 V','7 V','3,5 V'],0,'(70 − 20) ÷ 100 × 10 V = 5 V.'),
  q('transmisor-rango','Rango 0–50 °C y salida 0–10 V. La temperatura sube a 60 °C. La salida…',['Se limita a 10 V','Llega a 12 V','Vuelve a 0 V'],0,'La salida satura en 10 V; no pasa del máximo.'),
];

/* Registro por concepto. «wrong» cuenta los errores; «streak», los aciertos seguidos desde el último error. */
export type ConceptLog={wrong:number;right:number;streak:number;last:number};
export type ReviewLog={version:1;concepts:Partial<Record<ConceptId,ConceptLog>>};
export const MASTERED_STREAK=2;
export const newReviewLog=():ReviewLog=>({version:1,concepts:{}});
export const reviewKey='modo:temperature:review:v1';
const touch=(log:ReviewLog,id:ConceptId)=>log.concepts[id]??{wrong:0,right:0,streak:0,last:0};
export const recordWrong=(log:ReviewLog,id:ConceptId,now=Date.now()):ReviewLog=>{const c=touch(log,id);return {version:1,concepts:{...log.concepts,[id]:{...c,wrong:c.wrong+1,streak:0,last:now}}};};
export const recordRight=(log:ReviewLog,id:ConceptId,now=Date.now()):ReviewLog=>{const c=touch(log,id);return {version:1,concepts:{...log.concepts,[id]:{...c,right:c.right+1,streak:c.streak+1,last:now}}};};
export type Status='pendiente'|'dominado'|'sin-errores';
/** Pendiente: tiene errores y menos de dos aciertos seguidos desde el último. Dominado: errores previos ya revisados. */
export const statusOf=(log:ReviewLog,id:ConceptId):Status=>{const c=log.concepts[id];return !c||c.wrong===0?'sin-errores':c.streak>=MASTERED_STREAK?'dominado':'pendiente';};
/** Conceptos con errores pendientes, de más a menos errores (a igualdad, el más reciente primero). */
export const pendingConcepts=(log:ReviewLog):ConceptId[]=>CONCEPTS.map(c=>c.id).filter(id=>statusOf(log,id)==='pendiente').sort((a,b)=>log.concepts[b]!.wrong-log.concepts[a]!.wrong||log.concepts[b]!.last-log.concepts[a]!.last);
/** Elige hasta `count` preguntas: primero conceptos pendientes (uno por concepto, rotando la pregunta), luego el resto. Sin repeticiones. */
export function pickQuestions(log:ReviewLog,count:number,all=false):ReviewQuestion[]{
  const order=all?CONCEPTS.map(c=>c.id):[...pendingConcepts(log),...CONCEPTS.map(c=>c.id).filter(id=>statusOf(log,id)!=='pendiente')];
  const chosen:ReviewQuestion[]=[];
  for(const pass of [0,1])for(const id of order){
    if(chosen.length>=count)return chosen;
    const bank=QUESTIONS.filter(x=>x.concept===id),c=log.concepts[id],start=(c?c.right+c.wrong:0)%bank.length,item=bank[(start+pass)%bank.length];
    if(item&&!chosen.includes(item))chosen.push(item);
  }
  return chosen;
}
export function parseReview(raw:string):ReviewLog{
  const data:unknown=JSON.parse(raw);
  if(typeof data!=='object'||data===null||(data as {version?:unknown}).version!==1||typeof (data as {concepts?:unknown}).concepts!=='object'||(data as {concepts:unknown}).concepts===null)throw new Error('Guardado incompatible');
  const concepts:ReviewLog['concepts']={};
  for(const [id,value] of Object.entries((data as {concepts:Record<string,unknown>}).concepts)){
    const c=value as Partial<ConceptLog>;
    if(!CONCEPTS.some(x=>x.id===id)||typeof c!=='object'||c===null||![c.wrong,c.right,c.streak,c.last].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<1e15))throw new Error('Guardado incompatible');
    concepts[id as ConceptId]=c as ConceptLog;
  }
  return {version:1,concepts};
}

/** Qué concepto se está usando mal con el montaje actual (null si nada anda mal). */
export function misuseConcept(s:Settings,r:Reading):ConceptId|null{
  if(r.state==='off'||!s.red||!s.black)return null;
  if(s.red===s.black||r.state==='open')return 'conexion-puntas';
  if(r.state!=='ok')return null;
  if(r.sensor==='tc')return r.meaningful?null:'funcion-medida';
  if(r.sensor==='pt')return r.meaningful?null:s.mode==='ohm'?'hilos-pt100':'funcion-medida';
  if(r.sensor==='tx'){if(!s.txPowered||!s.txConnected)return 'transmisor-conexion';return s.txType!==s.tcType?'transmisor-tipo':null;}
  return null;
}
