import layout from './leccionInversion.layout.json';
import type {DiagramReference,DiagramRegion,ManualStep} from './practice';
/** Lecciones guiadas hechas a partir de circuitos reales armados en el banco. El orden de los pasos es el orden en que el compañero
 *  conectó los cables (capas 1–41 de su archivo `modo-panel-con-historial`), agrupado por función. */
type Seed=[from:string,to:string,title:string,explanation:string];
const K1='CONTACTOR_TERMICO:',K2='CONTACTOR_TRIFASICO:',BT='BOTONERAS:',FU='FUENTE:',MO='BORNERA_MOTOR:';
/** Inversión de giro con enclavamiento y paro. S1 = marcha 1 (KM1, giro directo), S3 = marcha 2 (KM2, giro inverso), S2 = paro. */
const INVERSION:Seed[]=[
 // — Mando de KM1 (marcha 1) —
 [FU+'F',K1+'95','Fase al mando por el térmico','La fase F entra al mando pasando por el contacto 95–96 del relé térmico, que es NC. Si el térmico dispara, este contacto abre y corta todo el mando.'],
 [K1+'96',BT+'S2:1','Del térmico al paro (S2)','Desde 96 la fase va al pulsador rojo S2. Su contacto 1–2 es NC: el mando queda alimentado mientras no pulses el paro.'],
 [BT+'S2:2',BT+'S1:3','Del paro a marcha 1 (S1)','S2:2 es el punto «protegido por el paro»: todo lo que sale de aquí se apaga al pulsar S2. Llévalo al borne 3 de S1 (verde izquierdo), contacto NA 3–4.'],
 [BT+'S1:4',K2+'71','Enclavamiento: S1 pasa por KM2','Al pulsar S1 la fase sale por el borne 4 y debe cruzar el contacto NC 71–72 de KM2. Si KM2 está activo, ese contacto abre e impide que KM1 entre al mismo tiempo.'],
 [K2+'72',K1+'A1','Hacia la bobina de KM1','Pasado el enclavamiento, la fase llega al borne A1 de la bobina de KM1.'],
 [BT+'PILOTO_1',K1+'A1','Lámpara de KM1 (P1)','El piloto 1 toma la fase del mismo punto que la bobina: se enciende cuando KM1 está activo. Su retorno a N se cablea más adelante.'],
 [BT+'S2:2',K1+'13','Retención de KM1: entrada','El contacto auxiliar NA 13–14 de KM1 hace de memoria. Su entrada 13 recibe la fase desde S2:2, después del paro.'],
 [K1+'14',BT+'S1:4','Retención de KM1: salida en paralelo con S1','14 devuelve la fase a S1:4, en paralelo con el pulsador. Cuando KM1 entra, 13–14 cierra y mantiene la bobina aunque sueltes S1.'],
 // — Mando de KM2 (marcha 2) —
 [BT+'S2:2',BT+'S3:3','Del paro a marcha 2 (S3)','Misma idea para el giro contrario: la fase protegida por el paro llega al borne 3 de S3 (verde derecho).'],
 [BT+'S3:4',K1+'71','Enclavamiento: S3 pasa por KM1','Ahora la fase de S3 cruza el contacto NC 71–72 de KM1: con KM1 activo, KM2 no puede entrar.'],
 [K1+'72',K2+'A1','Hacia la bobina de KM2','Pasado el enclavamiento, la fase llega a A1 de la bobina de KM2.'],
 [BT+'PILOTO_4',K2+'A1','Lámpara de KM2 (P4)','El piloto 4 comparte punto con la bobina de KM2: indica que KM2 (giro inverso) está activo.'],
 [BT+'S2:2',K2+'13','Retención de KM2: entrada','El NA 13–14 de KM2 hace la retención del giro inverso; 13 recibe la fase desde S2:2.'],
 [K2+'14',BT+'S3:4','Retención de KM2: salida en paralelo con S3','14 devuelve la fase a S3:4, en paralelo con el pulsador. KM2 queda retenido hasta que pulses S2.'],
 // — Retornos y señalización —
 [K1+'A2',FU+'N','Retorno de la bobina de KM1','A2 va al neutro N: la bobina de 24 V CA queda entre la fase (A1) y el neutro (A2).'],
 [K2+'A2',FU+'N','Retorno de la bobina de KM2','Igual que KM1: A2 de KM2 va al neutro, de modo que su bobina de 24 V CA queda entre A1 (fase) y A2 (neutro).'],
 [BT+'N',FU+'N','Neutro para las lámparas','Los pilotos retornan por el borne N de las botoneras; únelo al neutro de la fuente para cerrar sus circuitos.'],
 [FU+'F',K1+'97','Fase al aviso de térmico disparado','El contacto 97–98 de KM1 es NA: cierra cuando el relé térmico dispara. Alimenta 97 con la fase.'],
 [K1+'98',BT+'PILOTO_3','Lámpara de térmico disparado (P3)','Al disparar el térmico, 97–98 cierra y enciende el piloto 3 (amarillo).'],
 [K1+'96',K1+'81','Fase de reposo hacia la cadena de avisos','Desde 96 (fase si el térmico está bien) se arma una cadena de contactos NC: primero el 81–82 de KM1.'],
 [K1+'82',K2+'81','Cadena de reposo: de KM1 a KM2','La fase sigue por el NC 81–82 de KM2. Solo llegará al final si ninguno de los dos contactores está activo.'],
 [K2+'82',BT+'PILOTO_2','Lámpara de reposo (P2)','El piloto 2 (rojo) se enciende únicamente con KM1 y KM2 en reposo y el térmico sano.'],
 // — Fuerza —
 [FU+'R',K1+'L1','Fuerza: R a KM1','Las tres fases entran al contactor de giro directo. R va a L1.'],
 [FU+'S',K1+'L2','Fuerza: S a KM1','La fase S (negra) va a L2. Mantén el orden R–S–T en L1–L2–L3 para que el giro directo sea el esperado.'],
 [FU+'T',K1+'L3','Fuerza: T a KM1','La fase T (roja) va a L3. Con las tres fases en KM1 ya solo falta que su bobina cierre los contactos.'],
 [K1+'L1',K2+'L1','Las mismas fases a KM2: L1','KM2 recibe las fases en el mismo orden que KM1; el cambio de giro se hace a la salida.'],
 [K1+'L2',K2+'L2','Las mismas fases a KM2: L2','La fase S también llega a L2 de KM2, tomada de L2 de KM1 (la fase central no se intercambia después).'],
 [K1+'L3',K2+'L3','Las mismas fases a KM2: L3','La fase T llega a L3 de KM2. Con las tres fases en KM2, solo falta cruzar dos a su salida.'],
 [K1+'T1',MO+'U1','KM1 al motor: U1','Con KM1 el motor recibe R, S y T en U1, V1 y W1: giro directo.'],
 [K1+'T2',MO+'V1','KM1 al motor: V1','T2 (negro) va a V1: la fase S queda en el borne central del motor.'],
 [K1+'T3',MO+'W1','KM1 al motor: W1','T3 (rojo) va a W1. Con KM1 cerrado el motor recibe R–S–T en U1–V1–W1.'],
 [K2+'T1',K1+'T3','KM2 invierte: T1 a W1','Para invertir el giro basta intercambiar dos fases. La salida T1 de KM2 (fase R) se une con T3 de KM1, que va a W1.'],
 [K2+'T3',K1+'T1','KM2 invierte: T3 a U1','La salida T3 de KM2 (fase T) se une con T1 de KM1, que va a U1. Con KM2 activo el motor recibe T, S y R: gira al revés.'],
 [K2+'T2',K1+'T2','KM2: T2 queda igual','La fase central no se cambia: T2 de KM2 con T2 de KM1.'],
 [MO+'W2',MO+'U2','Motor en estrella (1)','Unir W2 con U2 es la primera mitad del puente de estrella.'],
 [MO+'V2',MO+'U2','Motor en estrella (2)','Con W2, U2 y V2 unidos las tres bobinas quedan en estrella y el motor puede girar en los dos sentidos.'],
 // — Tierras de protección —
 [MO+'TP',K2+'TP_DER','Tierra del motor','Las tierras de protección (TP, verdes) se unen entre los módulos y terminan en la tierra de la fuente. No cambian el funcionamiento del simulador.'],
 [K2+'TP_IZQ',K1+'TP_DER','Tierra entre KM2 y KM1','Continúa la cadena de tierras: la tierra izquierda de KM2 se une con la tierra derecha de KM1.'],
 [K1+'TP_DER',FU+'TP','Tierra de KM1 a la fuente','La cadena llega a la tierra de protección de la fuente.'],
 [K2+'TP_DER',K2+'TP_IZQ','Tierra de KM2: lado derecho','Une las dos tierras del módulo de KM2 entre sí, de modo que toda la hilera de tierras queda unida.'],
 [BT+'TP_DER',FU+'TP','Tierra de las botoneras','Última conexión: las botoneras también quedan a tierra.'],
];
/** Marcha y paro con retención de un solo contactor (KM1 con térmico). S1 = marcha, S2 = paro. El circuito más simple del banco. */
const SIMPLE:Seed[]=[
 // — Mando de KM1 —
 [FU+'F',K1+'95','Fase al mando por el térmico','La fase F entra al mando pasando por el contacto 95–96 del relé térmico, que es NC. Si el térmico dispara, este contacto abre y corta todo el mando.'],
 [K1+'96',K1+'71','Fase hacia el aviso de reposo','Desde 96 (hay fase mientras el térmico esté sano) se alimenta el contacto NC 71–72 de KM1. Cuando KM1 esté en reposo, ese contacto estará cerrado.'],
 [K1+'72',BT+'PILOTO_2','Lámpara de reposo (P2)','El piloto 2 (rojo) se enciende solo con KM1 en reposo: la fase llega por 71–72, que está cerrado. Cuando KM1 entra, 71–72 abre y P2 se apaga.'],
 [BT+'N',FU+'N','Neutro para las lámparas','Los pilotos retornan por el borne N de las botoneras; únelo al neutro de la fuente para cerrar sus circuitos.'],
 [K1+'96',BT+'S2:1','Del térmico al paro (S2)','Desde 96 la fase va al pulsador rojo S2. Su contacto 1–2 es NC: el mando queda alimentado mientras no pulses el paro.'],
 [BT+'S2:2',BT+'S1:3','Del paro a la marcha (S1)','S2:2 es el punto «protegido por el paro»: todo lo que sale de aquí se apaga al pulsar S2. Llévalo al borne 3 de S1 (verde izquierdo), contacto NA 3–4.'],
 [BT+'S1:4',K1+'A1','A la bobina de KM1','Al pulsar S1 la fase sale por el borne 4 y llega a A1, el borne de la bobina de KM1.'],
 [K1+'A2',FU+'N','Retorno de la bobina','A2 va al neutro N: la bobina de 24 V CA queda entre la fase (A1) y el neutro (A2). Con S1 pulsado, KM1 ya debería entrar.'],
 [BT+'S2:2',K1+'13','Retención: entrada','El contacto auxiliar NA 13–14 de KM1 hace de memoria. Su entrada 13 recibe la fase desde S2:2, después del paro.'],
 [K1+'14',BT+'S1:4','Retención: salida en paralelo con S1','14 devuelve la fase a S1:4, en paralelo con el pulsador. Cuando KM1 entra, 13–14 cierra y mantiene la bobina aunque sueltes S1; solo el paro la suelta.'],
 [K1+'A1',BT+'PILOTO_1','Lámpara de KM1 (P1)','El piloto 1 toma la fase del mismo punto que la bobina: se enciende cuando KM1 está activo.'],
 [FU+'F',K1+'97','Fase al aviso de térmico disparado','El contacto 97–98 de KM1 es NA: cierra cuando el relé térmico dispara. Alimenta 97 con la fase.'],
 [K1+'98',BT+'PILOTO_3','Lámpara de térmico disparado (P3)','Al disparar el térmico, 97–98 cierra y enciende el piloto 3 (amarillo).'],
 // — Fuerza —
 [FU+'R',K1+'L1','Fuerza: R a KM1','Las tres fases entran al contactor. R (azul) va a L1.'],
 [FU+'S',K1+'L2','Fuerza: S a KM1','La fase S (negra) va a L2. Mantén el orden R–S–T en L1–L2–L3.'],
 [FU+'T',K1+'L3','Fuerza: T a KM1','La fase T (roja) va a L3. Con las tres fases en KM1, solo falta que su bobina cierre los contactos.'],
 [K1+'T1',MO+'U1','KM1 al motor: U1','Con KM1 cerrado, T1 entrega la fase R al borne U1 del motor.'],
 [K1+'T2',MO+'V1','KM1 al motor: V1','T2 (negro) va a V1: la fase S queda en el borne central del motor.'],
 [K1+'T3',MO+'W1','KM1 al motor: W1','T3 (rojo) va a W1. Con KM1 cerrado el motor recibe R–S–T en U1–V1–W1.'],
 [MO+'W2',MO+'U2','Motor en estrella (1)','Unir W2 con U2 es la primera mitad del puente de estrella.'],
 [MO+'V2',MO+'U2','Motor en estrella (2)','Con W2, U2 y V2 unidos las tres bobinas quedan en estrella y el motor puede girar.'],
 // — Tierras de protección —
 [MO+'TP',K1+'TP_DER','Tierra del motor','Las tierras de protección (TP, verdes) se unen entre los módulos y terminan en la tierra de la fuente. No cambian el funcionamiento del simulador.'],
 [K1+'TP_DER',FU+'TP','Tierra de KM1 a la fuente','La cadena llega a la tierra de protección de la fuente.'],
 [BT+'TP_DER',FU+'TP','Tierra de las botoneras','Última conexión: las botoneras también quedan a tierra.'],
];
const point=(id:string)=>{
 const [module,...rest]=id.split(':'),terminal=rest.join(':'),found=layout.modules.find(m=>m.id===module)?.terminals.find(t=>t.id===terminal);
 if(!found)throw new Error(`Terminal sin posición en el mapa de la lección: ${id}`);
 return found;
};
const clamp=(v:number)=>Math.max(0,Math.min(1000,v));
/** Zona del mapa que enmarca los dos bornes de un cable (coordenadas 0–1000 de la imagen). */
function regionFor(from:string,to:string):DiagramRegion{
 const a=point(from),b=point(to),pad=62,x0=Math.min(a.x,b.x)-pad,x1=Math.max(a.x,b.x)+pad,y0=Math.min(a.y,b.y)-pad,y1=Math.max(a.y,b.y)+pad;
 const nx=(v:number)=>clamp(v/layout.width*1000),ny=(v:number)=>clamp(v/layout.height*1000);
 return {x:Math.round(nx(x0)),y:Math.round(ny(y0)),w:Math.round(nx(x1)-nx(x0)),h:Math.round(ny(y1)-ny(y0))};
}
export type Lesson={id:string;title:string;summary:string;/** Esquema CADe de la lección (ver lessonSchematics.ts). */schematic:'simple'|'inversion';diagram:DiagramReference;steps:ManualStep[];pairs:[string,string][]};
function buildLesson(id:string,schematic:Lesson['schematic'],title:string,summary:string,diagram:DiagramReference,seeds:Seed[]):Lesson{
 return {id,schematic,title,summary,diagram,pairs:seeds.map(([from,to])=>[from,to]),
  steps:seeds.map(([from,to,stepTitle,explanation],i)=>({id:`${id}-${String(i+1).padStart(2,'0')}`,title:stepTitle,from,to,region:regionFor(from,to),explanation,review:'user_reviewed'}))};
}
export const INVERSION_LESSON=buildLesson('inversion','inversion','Lección · Inversión de giro con enclavamiento','Marcha 1 (KM1), marcha 2 (KM2) y paro, con enclavamiento y lámparas. Basada en el circuito armado por un compañero.',
 {id:'leccion-inversion-giro',name:'Mapa de bornes · inversión de giro',src:'/diagrams/leccion-inversion-giro.png',origin:'class_photo'},INVERSION);
export const SIMPLE_LESSON=buildLesson('simple','simple','Lección · Marcha y paro con retención','El circuito más simple del banco: un contactor (KM1 con térmico), marcha, paro, retención y lámparas. Armado por un compañero.',
 {id:'leccion-marcha-paro',name:'Mapa de bornes · marcha y paro',src:'/diagrams/leccion-marcha-paro.png',origin:'class_photo'},SIMPLE);
export const LESSONS={simple:SIMPLE_LESSON,inversion:INVERSION_LESSON} as const;
/** «CONTACTOR_TERMICO:95» → «KM1 · 95»; «BOTONERAS:S1:3» → «Botoneras · S1 borne 3». */
const MODULE_NAMES:Record<string,string>={FUENTE:'Fuente',BOTONERAS:'Botoneras',CONTACTOR_TERMICO:'KM1',CONTACTOR_TRIFASICO:'KM2',BORNERA_MOTOR:'Motor'};
export function terminalLabel(id:string){
 const [module,...rest]=id.split(':'),terminal=rest.join(':'),name=MODULE_NAMES[module]??module,pushbutton=terminal.match(/^(S[123]):([1-4])$/);
 return `${name} · ${pushbutton?`${pushbutton[1]} borne ${pushbutton[2]}`:terminal.replace('PILOTO_','piloto ').replace(/^TP_.+$/,'TP')}`;
}
/** Proporción alto/ancho del mapa de bornes de las lecciones (para recortarlo en la ventana de la guía). */
export const LESSON_MAP_RATIO=layout.height/layout.width;
