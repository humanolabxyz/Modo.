import perfecto from './cadePerfecto.json';
import estrella from './cadeEstrellaTriangulo.json';
import lecciones from './cadeLecciones.json';
import estrellaTemporizador from './cadeEstrellaTemporizador.json';
import {STAR_PANELS,type PanelMap} from './starPanelMap';
import {twoContactorDrawing} from './twoContactorDrawing';
/** `panel` (solo en los esquemas de las lecciones) es la clave del borne del banco que representa este borne del símbolo. */
export type CadePort={objectId:number;reference:string;terminal:string;x:number;y:number;panel?:string;anchor?:string};
/** Objeto de un dibujo CADe. Los dibujos nuevos traen `shape`, `ports` y `box`; PERFECTO usa los tipos numéricos de CADe. */
export type CadeObject={id:number;type:number;reference:string;labels:string[];x:number;y:number;x2:number;y2:number;bounds?:number[];shape?:string;ports?:{terminal:string;x:number;y:number;panel?:string;anchor?:string}[];bank?:{name:string;part?:string;note?:string;what?:string};box?:number[];color?:string;dashed?:boolean;pins?:string[];pitch?:number;ref?:boolean};
export type CadeView={x:number;y:number;w:number;h:number};
export type CadeFrame={left:number;top:number;right:number;bottom:number;header:number;band:number;columns:{first:number;width:number;letters:string};rows:{first:number;height:number;count:number}};
export type CadeDrawing={name:string;source:string;origin?:string;objects:CadeObject[];frame?:CadeFrame;views?:{all:CadeView;power:CadeView;control:CadeView};splitX?:number};
const WIRE_TYPES=[4000,4009,4010];
const onLine=(p:{x:number;y:number},w:CadeObject)=>Math.abs((w.x2-w.x)*(p.y-w.y)-(w.y2-w.y)*(p.x-w.x))<.001&&p.x>=Math.min(w.x,w.x2)&&p.x<=Math.max(w.x,w.x2)&&p.y>=Math.min(w.y,w.y2)&&p.y<=Math.max(w.y,w.y2);
/** Bornes de un símbolo. Los dibujos nuevos los traen explícitos; PERFECTO se deriva de su tipo CADe. */
export function cadePorts(o:CadeObject):CadePort[]{
 const port=(terminal:string,x:number,y:number)=>({objectId:o.id,reference:o.reference,terminal,x,y});
 if(o.ports)return o.ports.map(p=>({...port(p.terminal,p.x,p.y),...(p.panel?{panel:p.panel}:{}),...(p.anchor?{anchor:p.anchor}:{})}));
 if([6009,2001,6007].includes(o.type)){const h=o.type===6009?21:12;return [0,1,2].flatMap(i=>[port(o.labels[i],o.x+i*6,o.y),port(o.labels[i+3],o.x+i*6,o.y+h)])}
 if(o.type===1001)return [0,1,2].flatMap(i=>[port(o.labels[i],o.x+i*6,o.y),port(o.labels[i+4],o.x+i*6,o.y+24)]).concat(port('PE',o.x+18,o.y));
 if(o.type===3004)return [0,1,2].map(i=>port(['L1','L2','L3'][i],o.x+i*6,o.y));
 if([3000,3001,3002].includes(o.type))return [port(o.type===3000?'L':o.type===3001?'N':'PE',o.x,o.y)];
 if(o.type===8018)return [port(o.labels[0],o.x,o.y),port(o.labels[2],o.x,o.y+12),port(o.labels[1],o.x+9,o.y),port(o.labels[3],o.x+9,o.y+12)];
 return [port(o.labels[0],o.x,o.y),port(o.labels[1],o.x,o.y+(o.type===6010?21:12))];
}
/** Conjunto de conductores, símbolos y bornes de un dibujo, con su grafo de conductores. */
export function createCade(drawing:CadeDrawing,bank?:Record<number,NonNullable<CadeObject['bank']>>){
 const objects=drawing.objects;
 const WIRES=objects.filter(o=>WIRE_TYPES.includes(o.type));
 /* El nombre que una pieza tiene en el banco se agrega solo a los símbolos de la interfaz; el dibujo original queda intacto. */
 const SYMBOLS=objects.filter(o=>![...WIRE_TYPES,4001,20000].includes(o.type)).map(o=>bank?.[o.id]?{...o,bank:bank[o.id]}:o);
 const JUNCTIONS=objects.filter(o=>o.type===4001);
 const PORTS=SYMBOLS.flatMap(cadePorts);
 /** Conductor graph only; contacts, coils and loads never join their terminals. */
 function network(wireId:number){
  const seed=WIRES.find(w=>w.id===wireId);if(!seed)return {wires:[] as CadeObject[],ports:[] as CadePort[]};
  const included=new Set([seed.id]);let changed=true;
  while(changed){changed=false;for(const w of WIRES){if(included.has(w.id))continue;const joined=WIRES.filter(a=>included.has(a.id)).some(a=>onLine({x:w.x,y:w.y},a)||onLine({x:w.x2,y:w.y2},a)||onLine({x:a.x,y:a.y},w)||onLine({x:a.x2,y:a.y2},w)||JUNCTIONS.some(p=>onLine(p,a)&&onLine(p,w)));if(joined){included.add(w.id);changed=true}}}
  const wires=WIRES.filter(w=>included.has(w.id));const unique=new Map<string,CadePort>();for(const p of PORTS)if(wires.some(w=>onLine(p,w)))unique.set(drawing.origin?`${p.reference}:${p.terminal}:${p.x},${p.y}`:`${p.reference}:${p.terminal}`,p);
  return {wires,ports:[...unique.values()]};
 }
 return {drawing,WIRES,SYMBOLS,JUNCTIONS,PORTS,network,ports:cadePorts};
}
export type Cade=ReturnType<typeof createCade>;
/* PERFECTO: los nombres históricos se conservan para el resto de la aplicación. */
export const PERFECTO_CADE=createCade(perfecto as unknown as CadeDrawing);
export const CADE=perfecto;
export const CADE_WIRES=PERFECTO_CADE.WIRES;
export const CADE_SYMBOLS=PERFECTO_CADE.SYMBOLS;
export const CADE_JUNCTIONS=PERFECTO_CADE.JUNCTIONS;
export const CADE_PORTS=PERFECTO_CADE.PORTS;
export const cadeNetwork=PERFECTO_CADE.network;
/** Dibujos disponibles en el lector. Solo PERFECTO tiene recorridos guiados y correspondencias con el banco. */
export const ESTRELLA_CADE=createCade(estrella as unknown as CadeDrawing);
/** Esquemas de las lecciones guiadas (ver data/lessons.ts y data/lessonSchematics.ts). */
/** Copia del dibujo de estrella-triángulo con la correspondencia de sus bornes con el banco (ver starPanelMap.ts). */
const withPanels=(drawing:CadeDrawing,map:PanelMap):CadeDrawing=>({...drawing,objects:drawing.objects.map(o=>o.ports&&map[o.id]?{...o,ports:o.ports.map(p=>map[o.id][p.terminal]?{...p,panel:map[o.id][p.terminal]}:p)}:o)});
/** Nombres y funciones de los módulos en el montaje de Matías. */
const TIMER='Temporizador neumático',THERMAL='Contactor + relé térmico',TRI='Contactor trifásico';
export const TWO_CONTACTOR_BANK_NAMES:Record<number,NonNullable<CadeObject['bank']>>={
 3:{name:TIMER,part:'Contactor principal KT1 (parte contactor del módulo temporizador neumático)'},57:{name:TIMER,part:'Auxiliar 13–14 del contactor principal KT1 (retención)'},
 62:{name:THERMAL,part:'Contacto NC 81–82 de KM1 (piloto rojo)'},1001:{name:TRI,part:'Contacto NC 81–82 de KM2 (piloto rojo)'},63:{name:TIMER,part:'Bobina del contactor principal KT1 (módulo temporizador neumático)'},
 58:{name:TIMER,part:'Contacto temporizado NC 55–56 de KT1 (estrella)'},1003:{name:TIMER,part:'Contacto temporizado NA 67–68 de KT1 (triángulo)'},54:{name:THERMAL,part:'Contactos de corte y aviso del relé térmico de KM1'},
 6:{name:THERMAL,part:'Contactor de triángulo KM1 (módulo contactor + relé térmico)'},59:{name:THERMAL,part:'Contacto NC 71–72 de KM1 (enclavamiento de estrella)'},65:{name:THERMAL,part:'Bobina del contactor de triángulo KM1 (módulo contactor + relé térmico)'},
 7:{name:TRI,part:'Contactor de estrella KM2 (módulo contactor trifásico)'},61:{name:TRI,part:'Contacto NC 71–72 de KM2 (enclavamiento de triángulo)'},64:{name:TRI,part:'Bobina del contactor de estrella KM2 (módulo contactor trifásico)'},
};
/** Manual guide: retain the original post-start feed of SB3, figure 1 (p.5). */
export const LESSON_CADES={
 simple:createCade(lecciones.simple as unknown as CadeDrawing),
 inversion:createCade(lecciones.inversion as unknown as CadeDrawing),
 estrellaManual:createCade(withPanels(estrella as unknown as CadeDrawing,STAR_PANELS.estrellaManual)),
 estrellaTimer:createCade(withPanels(estrellaTemporizador as unknown as CadeDrawing,STAR_PANELS.estrellaTimer)),
 // Montaje de Matías con el formato de la guía.
 estrellaDosContactores:createCade(twoContactorDrawing(estrella as unknown as CadeDrawing),TWO_CONTACTOR_BANK_NAMES),
};
export type LessonCadeId=keyof typeof LESSON_CADES;

export const CADE_DRAWINGS=[
 {id:'perfecto',title:'PERFECTO',cade:PERFECTO_CADE,guided:true},
 {id:'estrella',title:'Estrella-triángulo',cade:ESTRELLA_CADE,guided:false},
 {id:'simple',title:'Lección · Marcha y paro',cade:LESSON_CADES.simple,guided:false},
 {id:'inversion',title:'Lección · Inversión de giro',cade:LESSON_CADES.inversion,guided:false},
 {id:'estrellaTimer',title:'Lección · Estrella-triángulo con temporizador',cade:LESSON_CADES.estrellaTimer,guided:false},
 {id:'estrellaDosContactores',title:'Lección · Estrella-triángulo · 2 contactores y temporizador',cade:LESSON_CADES.estrellaDosContactores,guided:false},
] as const;
export const CADE_QUESTIONS=[
 {question:'Potencia: sigue L1 hasta la entrada 1 de -Q.',wire:103,scope:'power',hint:'El primer conductor de la columna de potencia.'},
 {question:'Potencia: ¿qué línea une -Q:2 con -KM1:1?',wire:106,scope:'power',hint:'Está entre -Q y los contactos principales de -KM1.'},
 {question:'Potencia: sigue -KM1:2 hasta la protección -F:1.',wire:109,scope:'power',hint:'Baja desde el contactor hasta el bloque -F.'},
 {question:'Potencia: identifica el conductor que llega a U1 del motor.',wire:112,scope:'power',hint:'El tramo de la izquierda entre -F y -M.'},
 {question:'Mando: encuentra el conductor que llega al borne 95 de -F.',wire:83,scope:'control',hint:'Es el tramo corto entre la salida de -Q y el contacto 95.'},
 {question:'Mando: sigue la salida 96 hacia la parada -SB1:11.',wire:23,scope:'control',hint:'Desde -F:96, la línea gira a la izquierda antes de -SB1.'},
 {question:'Mando: ¿qué línea llega a -SB2:13 desde la salida de -SB1?',wire:25,scope:'control',hint:'El tramo vertical que alimenta la marcha; también nace la rama auxiliar.'},
 {question:'Mando: identifica la entrada de la rama auxiliar -KM1:13.',wire:41,scope:'control',hint:'Busca la derivación a la derecha, en paralelo con -SB2.'},
 {question:'Mando: encuentra la línea que llega a A1 de la bobina -KM1.',wire:47,scope:'control',hint:'Baja desde la unión de las ramas hasta la bobina.'},
 {question:'Mando: sigue A2 hasta el retorno común.',wire:94,scope:'control',hint:'Es el tramo azul debajo de la bobina.'},
 {question:'Señalización: ¿qué línea llega a X1 del piloto -H2?',wire:52,scope:'control',hint:'Sigue la rama que sale del contacto 97–98 hacia la derecha.'},
 {question:'Señalización: sigue -KM1:12 hacia X1 de -H3.',wire:90,scope:'control',hint:'Busca el contacto auxiliar a la izquierda de la parada.'},
] as const;
