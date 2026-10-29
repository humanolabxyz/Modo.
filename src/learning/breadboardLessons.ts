import {HOLE_BY_ID,newProject,type LabProject,type ProtoComponent} from '../lab/model';
import {netGroups,type BreadboardResult} from '../lab/dc';
import type {MeterDisplay,MeterMode} from '../lab/MeterPanel';

type Board=LabProject['breadboard'];
export type BreadboardContext={board:Board;running:boolean;probes:[string|null,string|null];dial:MeterMode|'OFF';redJack:'vo'|'a10';result:BreadboardResult|null;reading:MeterDisplay['record'];meterReady:boolean;startedAt:number};
type Verdict={ok:boolean;message:string};
export type BreadboardStep={id:string;title:string;explain:string;action:string;targets?:[string,string];check?:(c:BreadboardContext)=>Verdict;ask?:{label:string;unit:string;expected:(c:BreadboardContext)=>number|null;tolerance:number};quiz?:{question:string;options:string[];answer:number;why:string}};
export type BreadboardLesson={id:string;title:string;subtitle:string;source?:string;sourceLabel:string;template:()=>Board;steps:BreadboardStep[]};
const verdict=(ok:boolean,message:string):Verdict=>({ok,message});
const intrinsic=(a:string,b:string)=>!!HOLE_BY_ID.get(a)&&HOLE_BY_ID.get(a)?.group===HOLE_BY_ID.get(b)?.group;
const pair=(a:string,b:string,x:string,y:string)=>(intrinsic(a,x)&&intrinsic(b,y))||(intrinsic(a,y)&&intrinsic(b,x));
const part=(id:string,kind:ProtoComponent['kind'],from:string,to:string,value:number):ProtoComponent=>({id,kind,from,to,value,closed:true,color:'#2a7169'});
const base=(components:ProtoComponent[],voltage=5,realistic=false):Board=>({components,voltage,positive:'top+:1',negative:'top-:1',realistic});
const supply=()=>[part('wp','wire','c:5','top+:2',0),part('wn','wire','c:15','top-:2',0)];
const divider=()=>base([part('r1','resistor','a:5','a:10',1000),part('r2','resistor','b:10','b:15',1000),...supply()]);
const junction=(led:boolean)=>base([part('r','resistor','a:5','a:10',led?220:330),part('d',led?'led':'diode','b:10','b:15',led?2:.7),...supply()],.5,true);
const bjt=()=>base([part('q','bjt','e:5','e:7',100),part('rb','resistor','a:6','a:10',100000),part('rc','resistor','a:7','a:12',270),part('we','wire','a:5','top-:2',0),part('wb','wire','a:10','top+:2',0),part('wc','wire','a:12','top+:3',0)],10,true);
const bridge=():Board=>{const b=newProject('hbridge').breadboard;return {...b,voltage:5,components:b.components.map(p=>p.kind==='button'?{...p,kind:'switch'}:p)};};
const series=()=>base([part('r','resistor','a:10','a:15',100),...supply()]);
function prepared(c:BreadboardContext,kinds:string[],reference:Board){const groups=netGroups(c.board,{}),referenceGroups=netGroups(reference,{}),ends=[...new Set(reference.components.flatMap(p=>[p.from,p.to]).concat(reference.positive,reference.negative))],topology=ends.every(a=>ends.every(b=>(groups[a]===groups[b])===(referenceGroups[a]===referenceGroups[b])))&&groups[c.board.positive]===groups[reference.positive]&&groups[c.board.negative]===groups[reference.negative],matches=reference.components.every(p=>p.kind==='wire'?groups[p.from]===groups[p.to]:c.board.components.some(q=>q.kind===p.kind&&Math.abs(q.value-p.value)<1e-8&&pair(q.from,q.to,p.from,p.to)));return verdict(!c.running&&topology&&matches&&Math.abs(c.board.voltage-reference.voltage)<.001&&kinds.every(k=>c.board.components.some(p=>p.kind===k)),'Detén la simulación y monta los componentes indicados. Puedes construirlos a mano o cargar la referencia.');}
function measure(c:BreadboardContext,kind:'voltage'|'current'|'continuity',a:string,b:string,open=false):Verdict{
 if(!c.meterReady)return verdict(false,'Desactiva HOLD, REL y MIN/MAX para comprobar una lectura directa.');
 if(!c.probes[0]||!c.probes[1]||!pair(c.probes[0],c.probes[1],a,b))return verdict(false,`Lleva las puntas a ${a.replace(':','')} y ${b.replace(':','')}, o a orificios de sus mismas tiras.`);
 if(c.reading?.kind!==kind)return verdict(false,kind==='continuity'?'Con la fuente detenida, gira a continuidad y usa COM y V Ω.':kind==='current'?'Abre la rama, conecta la toma roja a A, gira a A y energiza.':'Conecta la toma roja a V Ω, gira a V y energiza.');
 if(kind==='continuity')return verdict(!c.running&&(open?c.reading.value===null:c.reading.value!==null&&c.reading.value<50),open?'Debe indicar OL: las tiras están separadas. Revisa si hay un puente que las una.':'Debe haber continuidad. Revisa las columnas y el puente, sin alimentación.');
 if(!c.running||c.result?.fault||c.result?.tripped||Object.keys(c.result?.failures??{}).length)return verdict(false,'El circuito debe estar energizado, sin fallas ni componentes dañados.');
 if(kind==='current'&&c.redJack!=='a10')return verdict(false,'Mueve la toma roja a A para insertar el shunt en la rama.');
 if(kind==='voltage'&&c.redJack!=='vo')return verdict(false,'Devuelve la toma roja a V Ω antes de medir tensión.');
 if(c.reading.value===null)return verdict(false,'Necesitas una lectura numérica válida.');
 const logged=c.board.log?.some(m=>Date.parse(m.at)>=c.startedAt&&m.kind===kind&&pair(m.a,m.b,a,b)&&m.sourceVoltage!==undefined&&Math.abs(m.sourceVoltage-c.board.voltage)<.001&&m.value!==null&&Math.abs(m.value!-c.reading!.value!)<Math.max(.0001,Math.abs(c.reading!.value!)*.002));
 return verdict(!!logged,'Lee el instrumento y pulsa «Anotar lectura». Necesitas una medición nueva de esta lección, a la tensión actual.');
}
const measured=(c:BreadboardContext,a:string,b:string)=>c.board.log?.filter(m=>m.kind==='voltage'&&Date.parse(m.at)>=c.startedAt&&pair(m.a,m.b,a,b)&&m.sourceVoltage!==undefined&&Math.abs(m.sourceVoltage-c.board.voltage)<.001&&m.value!==null).at(-1)?.value??null;
const voltageStep=(id:string,title:string,a:string,b:string,explain:string,voltage=5):BreadboardStep=>({id,title,explain,action:`Gira a V, conecta las puntas en ${a.replace(':','')} y ${b.replace(':','')}, lee y anota.`,targets:[a,b],check:c=>Math.abs(c.board.voltage-voltage)>.001?verdict(false,`Detén la simulación y ajusta la fuente a ${voltage} V para este paso.`):measure(c,'voltage',a,b)});
const currentAsk=(resistance:number):BreadboardStep=>({id:'calculate',title:'Calcula con tus mediciones',explain:'La corriente de una resistencia se obtiene de su caída de tensión y su resistencia. Aquí usamos R nominal; con tolerancia, el cálculo es una estimación.',action:'Usa la última caída anotada entre a5 y a10. Calcula I = VR / R y convierte A a mA.',ask:{label:'Corriente estimada con R nominal',unit:'mA',tolerance:.1,expected:c=>{const v=measured(c,'a:5','a:10');return v===null?null:Math.abs(v)/resistance*1000;}}});

export const breadboardLessons:BreadboardLesson[]=[
 {id:'fundamentals',title:'1 · Conoce la protoboard',subtitle:'Tiras, canal, rieles y puentes',sourceLabel:'Fundamentos del banco',template:()=>base([]),steps:[
  {id:'column',title:'Cinco orificios, un nodo',explain:'a–e de cada columna comparten una lámina. Dos agujeros vecinos en la misma fila no están unidos por defecto.',action:'Sin alimentación, gira a continuidad. Lleva una punta a a5 y otra a e5.',targets:['a:5','e:5'],check:c=>measure(c,'continuity','a:5','e:5')},
  {id:'channel',title:'El canal central separa',explain:'La columna superior a–e está separada de f–j. Un DIP cruza el canal para que sus patas enfrentadas no queden en el mismo nodo.',action:'Mueve una punta de e5 a f5. La otra queda en a5; debe marcar OL.',targets:['a:5','f:5'],check:c=>measure(c,'continuity','a:5','f:5',true)},
  {id:'rails',title:'Comprueba el corte del riel',explain:'En esta placa el riel se interrumpe entre 15 y 16. En una placa física compruébalo; la línea pintada no garantiza continuidad.',action:'Mide continuidad entre + superior 15 y + superior 16. Debe indicar OL.',targets:['top+:15','top+:16'],check:c=>measure(c,'continuity','top+:15','top+:16',true)},
  {id:'bridge',title:'Une las dos mitades',explain:'Un puente crea un camino eléctrico entre las tiras. Usa un orificio libre para cada extremo.',action:'Con Puente (W), une + superior 14 con + superior 17. Vuelve a medir entre 15 y 16.',targets:['top+:15','top+:16'],check:c=>measure(c,'continuity','top+:15','top+:16')},
  {id:'understand',title:'Explica la conexión',explain:'Un nodo reúne puntos conectados por metal y cables ideales. Su forma en pantalla no define la conexión.',action:'Responde después de comprobar la placa.',quiz:{question:'¿Qué comparten a5 y e5?',options:['El mismo nodo eléctrico','Solo el número, sin conexión','Todas las columnas de la placa'],answer:0,why:'La tira metálica une los cinco orificios de esa columna.'}},
 ]},
 {id:'divider',title:'2 · Tensión y ley de Ohm',subtitle:'Dos resistencias y tus primeras lecturas',sourceLabel:'Preparación para F03',template:divider,steps:[
  {id:'prepare',title:'Monta un divisor',explain:'Dos resistencias de 1 kΩ en serie reparten 5 V. La referencia empieza sin tolerancias para comparar con el cálculo ideal.',action:'Detén la simulación. Coloca R1 entre a5–a10 y R2 entre b10–b15. Une c5 a + y c15 a −; fija 5 V.',check:c=>prepared(c,['resistor'],divider())},
  voltageStep('upper','Mide la caída de R1','a:5','a:10','V se mide en paralelo. La punta negra no tiene que estar siempre en el negativo de la fuente: mide la diferencia entre las puntas.'),
  voltageStep('lower','Mide la caída de R2','a:10','a:15','Cambia las puntas sobre el banco. Al invertirlas, cambia el signo de la lectura.'),
  currentAsk(1000),
  {id:'sum',title:'Comprueba el recorrido de tensión',explain:'La suma de las dos caídas debe aproximarse a la tensión aplicada. La entrada del voltímetro carga ligeramente el circuito.',action:'Suma los valores absolutos de tus dos caídas.',ask:{label:'Suma de caídas medidas',unit:'V',tolerance:.03,expected:c=>{const a=measured(c,'a:5','a:10'),b=measured(c,'a:10','a:15');return a===null||b===null?null:Math.abs(a)+Math.abs(b);}}},
 ]},
 {id:'diode',title:'3 · Diodo y resistencia',subtitle:'Montar, medir VD/VR y calcular I',source:'/estudio/fuentes/F03.pdf#page=15',sourceLabel:'F03 · Clase 2 · p.15',template:()=>junction(false),steps:[
  {id:'prepare',title:'Prepara el montaje sin energía',explain:'La guía utiliza 330 Ω y 1N4001. Este banco usa una unión de silicio genérica, con la banda en el cátodo. No es un modelo de fabricante.',action:'Monta R entre a5–a10 y diodo entre b10–b15. Une c5 al + y c15 al −. Empieza en 0,5 V.',check:c=>prepared(c,['resistor','diode'],junction(false))},
  voltageStep('vd','Mide la tensión del diodo','b:10','b:15','Con la fuente detenida fija 5 V; luego energiza. La caída del diodo depende de su corriente en Valores reales.'),
  voltageStep('vr','Mide la caída de la resistencia','a:5','a:10','El resto de la tensión cae en la resistencia que limita corriente. Anota la lectura con su fuente aplicada.'),
  currentAsk(330),
  {id:'safe',title:'Interpreta el barrido de la guía',explain:'F03 propone fuentes de 0,5 a 30 V. También hay que observar corriente, potencia y daño; no todas las condiciones sirven para cualquier componente.',action:'Comprueba tu criterio antes de repetir la tabla.',quiz:{question:'Si subes la fuente, ¿la caída del diodo es siempre exactamente 0,7 V?',options:['Sí, es un valor invariable','No: cambia con corriente, temperatura y dispositivo','La resistencia deja de limitar corriente'],answer:1,why:'0,7 V es una aproximación. La curva de una unión de silicio es no lineal.'}},
 ]},
 {id:'led',title:'4 · LED y polaridad',subtitle:'Resistencia de 220 Ω y caída directa',source:'/estudio/fuentes/F03.pdf#page=15',sourceLabel:'F03 · Clase 2 · p.15',template:()=>junction(true),steps:[
  {id:'prepare',title:'Reconoce ánodo y cátodo',explain:'El primer extremo del LED es el ánodo. Usa la resistencia de 220 Ω en serie; nunca conectes directamente el LED a la fuente.',action:'Detén la simulación y monta el LED entre b10–b15 con la resistencia entre a5–a10.',check:c=>prepared(c,['resistor','led'],junction(true))},
  voltageStep('vd','Mide el LED encendido','b:10','b:15','Detén, fija 3 V y vuelve a energizar. Si no conduce, revisa polaridad y camino cerrado.',3),
  voltageStep('vr','Mide la limitación de corriente','a:5','a:10','Mide la tensión sobre la resistencia; no uses la caída del LED para calcular la corriente en R.',3),
  currentAsk(220),
  {id:'safe',title:'Elige cómo comprobar resistencia',explain:'El óhmetro inyecta su propia señal; necesita el circuito sin alimentación. Una rama paralela puede cambiar lo que mide.',action:'Responde antes de cambiar el selector.',quiz:{question:'Para medir la resistencia sin alterar el resultado por otras ramas, debes…',options:['Dejar la fuente encendida','Desenergizar y, si hay caminos paralelos, aislar la resistencia','Usar la toma A con el circuito encendido'],answer:1,why:'Una medición en Ω requiere ausencia de tensión externa y revisar caminos paralelos.'}},
 ]},
 {id:'current',title:'5 · Corriente en serie',subtitle:'Abrir la rama y cambiar la toma roja',sourceLabel:'Uso práctico del multímetro',template:series,steps:[
  {id:'prepare',title:'Abre la rama',explain:'El amperímetro se convierte en parte del camino de corriente. La referencia deja abierta la unión entre a5 y a10.',action:'Detén la simulación. Prepara 5 V y R=100 Ω entre a10–a15; la fuente llega a a5 y sale por a15.',check:c=>prepared(c,['resistor'],series())},
  {id:'series',title:'Inserta el instrumento',explain:'La toma A agrega el shunt de 0,1 Ω del ejercicio. En paralelo produciría una carga muy baja y podría fundir el fusible.',action:'Con la fuente detenida, mueve la toma roja a A y gira a A. Pon las puntas en a5–a10, energiza y anota la corriente.',targets:['a:5','a:10'],check:c=>measure(c,'current','a:5','a:10')},
  {id:'read',title:'Lee y convierte unidades',explain:'Una lectura de 0,05 A equivale a 50 mA. Usa el valor real que obtuviste; el shunt también produce caída.',action:'Convierte a mA tu última corriente anotada en a5–a10.',ask:{label:'Corriente medida',unit:'mA',tolerance:.1,expected:c=>{const m=c.board.log?.filter(m=>m.kind==='current'&&Date.parse(m.at)>=c.startedAt&&pair(m.a,m.b,'a:5','a:10')&&m.value!==null).at(-1);return m?.value===null||m?.value===undefined?null:Math.abs(m.value)*1000;}}},
  {id:'finish',title:'Devuelve el instrumento a V Ω',explain:'Terminar en la toma de corriente favorece un cortocircuito en la siguiente medición de tensión.',action:'Detén la simulación, mueve la toma roja a V Ω y deja el selector en V.',check:c=>verdict(!c.running&&c.redJack==='vo'&&c.dial==='V','Detén, devuelve la toma roja a V Ω y gira a V.')},
 ]},
 {id:'bjt',title:'6 · Transistor en emisor común',subtitle:'VBE, VCE y caídas en base/colector',source:'/estudio/fuentes/F04.pdf#page=22',sourceLabel:'F04 · Clase 3 · p.22',template:bjt,steps:[
  {id:'prepare',title:'Distingue E, B y C',explain:'F04 utiliza BC337, 10 V, RB=100 kΩ y RC=270 Ω. La representación es NPN genérica; E/B/C son e5/e6/e7 en este montaje.',action:'Detén y monta la referencia. No supongas que el encapsulado físico tiene el mismo pinout.',check:c=>prepared(c,['bjt','resistor'],bjt())},
  voltageStep('vbe','Mide base respecto de emisor','e:6','e:5','Energiza a 10 V. VBE es la diferencia entre base y emisor; no es la tensión total de alimentación.',10),
  voltageStep('vce','Mide colector respecto de emisor','e:7','e:5','La tensión VCE ayuda a interpretar el estado del transistor junto a sus corrientes.',10),
  voltageStep('vrb','Mide la caída de RB','a:10','a:6','La corriente de base estimada es VRB / 100 kΩ.',10),
  voltageStep('vrc','Mide la caída de RC','a:12','a:7','La corriente de colector estimada es VRC / 270 Ω. No uses VCE en esa división.',10),
  {id:'calculate',title:'Calcula la corriente de colector',explain:'Utiliza la caída de la resistencia de colector que acabas de medir y su valor nominal.',action:'Calcula IC estimada = VRC / 270 Ω. Expresa el resultado en mA.',ask:{label:'IC estimada',unit:'mA',tolerance:.1,expected:c=>{const v=measured(c,'a:12','a:7');return v===null?null:Math.abs(v)/270*1000;}}},
 ]},
 {id:'bridge',title:'7 · Puente H con L293D',subtitle:'Alimentaciones, mando y salida al motor',source:'/estudio/fuentes/F05.pdf#page=13',sourceLabel:'F05 · Clase 4 · pp.13–14',template:bridge,steps:[
  {id:'prepare',title:'Reconoce las dos alimentaciones',explain:'VCC1 alimenta la lógica y VCC2 el motor. Esta preparación usa 5 V para ambos y mandos mantenidos para poder medir. El montaje docente de motor a 12 V requiere alimentación lógica independiente: no lleves 12 V a VCC1. El puente de cuatro transistores es otro ejemplo.',action:'Detén y fija 5 V. Revisa los pines con los diagramas de clase; el L293D cruza el canal.',check:c=>prepared(c,['l293d','motor'],bridge())},
  {id:'operate',title:'Opera el mando sobre el banco',explain:'No basta con elegir un estado en un menú: opera los interruptores/pulsadores del circuito para cerrar el recorrido.',action:'Energiza y cierra el mando S2; el motor debe tener corriente. Comprueba este paso mientras está accionado.',check:c=>{const motor=c.board.components.find(p=>p.kind==='motor');return verdict(!!motor&&c.running&&!c.result?.fault&&!c.result?.tripped&&!Object.keys(c.result?.failures??{}).length&&Math.abs(c.result?.amps[motor.id]??0)>.001,'Revisa alimentación, EN, entradas y mando; el motor debe tener corriente sin fallas.');}},
  {id:'measure',title:'Mide entre los terminales del motor',explain:'La polaridad entre terminales determina el sentido. No confundas la tensión de la fuente con la caída real de la etapa de salida.',action:'Coloca las puntas en los extremos del motor, gira a V y anota con el mando accionado.',check:c=>{const motor=c.board.components.find(p=>p.kind==='motor');if(!motor)return verdict(false,'Monta el motor antes de medir.');if(Math.abs(c.result?.amps[motor.id]??0)<.001)return verdict(false,'Acciona el mando para medir con el motor activo.');return measure(c,'voltage',motor.from,motor.to);}},
  {id:'stop',title:'Detén antes de recablear',explain:'Las mediciones hechas durante el mando se conservan en la libreta. Para cambiar conexiones, detén la fuente.',action:'Detén la simulación y devuelve la toma roja a V Ω.',check:c=>verdict(!c.running&&c.redJack==='vo','Detén la simulación y comprueba la toma V Ω.')},
 ]},
];
export const breadboardLesson=(id:string|null|undefined)=>breadboardLessons.find(l=>l.id===id)||null;
export function checkBreadboardStep(step:BreadboardStep,c:BreadboardContext,input:string,choice:number|null):Verdict{
 if(step.quiz)return verdict(choice===step.quiz.answer,step.quiz.why);
 if(step.ask){const expected=step.ask.expected(c);if(expected===null)return verdict(false,'Primero realiza y anota las mediciones de esta lección.');const number=input.trim().replace(',','.');if(!number||!Number.isFinite(Number(number)))return verdict(false,`Escribe un número en ${step.ask.unit}; puedes usar coma decimal.`);return verdict(Math.abs(Number(number)-expected)<=step.ask.tolerance,`Revisa el cálculo y la conversión a ${step.ask.unit}. Usa tus lecturas, con su tensión aplicada.`);}
 return step.check?.(c)??verdict(false,'Realiza la acción indicada.');
}

export type LessonProgress={step:number;startedAt:number;completed:string[];notes:string};
export type BreadboardProgress={version:1;lessons:Record<string,LessonProgress>};
export const newBreadboardProgress=():BreadboardProgress=>({version:1,lessons:{}});
export const freshLesson=():LessonProgress=>({step:0,startedAt:Date.now(),completed:[],notes:''});
export function readBreadboardProgress(raw:string|null):BreadboardProgress{
 if(!raw)return newBreadboardProgress();const data=JSON.parse(raw);if(data?.version!==1||!data.lessons||typeof data.lessons!=='object'||Array.isArray(data.lessons))throw Error('Progreso incompatible');
 for(const [id,row] of Object.entries(data.lessons)){const l=breadboardLesson(id),p=row as LessonProgress;if(!l||!p||!Number.isInteger(p.step)||p.step<0||p.step>=l.steps.length||typeof p.startedAt!=='number'||!Number.isFinite(p.startedAt)||p.startedAt<0||!Array.isArray(p.completed)||p.completed.some(s=>!l.steps.some(step=>step.id===s))||new Set(p.completed).size!==p.completed.length||typeof p.notes!=='string'||p.notes.length>4000)throw Error('Progreso incompatible');}
 return data;
}
