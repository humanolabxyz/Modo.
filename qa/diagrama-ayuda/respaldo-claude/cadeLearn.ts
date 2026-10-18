import type {CadeKind} from './cadeComponents';
/** Ayudas de lectura: qué significa cada símbolo y cómo funciona el circuito, en palabras simples.
 *  Las explicaciones de símbolos son convención eléctrica general; el recorrido se deduce del cableado dibujado. */

/** Cómo reconocer cada símbolo y qué hace al conectarlo. */
export const SYMBOL_GUIDE:Record<CadeKind,{name:string;looks:string;does:string}>={
 'contact-no':{name:'Contacto normalmente abierto (NA)',looks:'El trazo queda interrumpido: la cuchilla no toca el otro lado.',does:'No deja pasar corriente hasta que se activa la bobina con su mismo nombre (por ejemplo KM1). Entonces se cierra.'},
 'contact-nc':{name:'Contacto normalmente cerrado (NC)',looks:'El trazo está unido: la cuchilla se apoya en el otro lado (o lo cruza una diagonal).',does:'Deja pasar corriente en reposo. Cuando se activa la bobina con su mismo nombre, se abre y corta.'},
 'push-no':{name:'Pulsador NA (marcha)',looks:'Un contacto abierto con un botón «[» unido por una línea punteada.',does:'Mientras lo mantienes presionado deja pasar corriente; al soltarlo vuelve a abrirse. Se usa para dar marcha.'},
 'push-nc':{name:'Pulsador NC (parada)',looks:'Un contacto cerrado con un botón «[» unido por una línea punteada.',does:'Deja pasar corriente hasta que lo presionas: en ese momento corta. Se usa para parar.'},
 'double-push':{name:'Pulsador doble (NC + NA)',looks:'Un contacto cerrado y uno abierto movidos por el mismo botón (línea punteada).',does:'Al presionarlo, a la vez abre su contacto NC y cierra su contacto NA. Sirve para cambiar de un circuito a otro.'},
 coil:{name:'Bobina de contactor',looks:'Un rectángulo con los bornes A1 y A2.',does:'Cuando recibe tensión entre A1 y A2 se activa y mueve todos los contactos que llevan su nombre: los NA se cierran y los NC se abren.'},
 lamp:{name:'Lámpara piloto',looks:'Un círculo con una X dentro y bornes X1 y X2.',does:'Se enciende cuando le llega tensión. Solo avisa un estado (en marcha, detenido, falla); no acciona nada.'},
 breaker1:{name:'Disyuntor de 1 polo',looks:'Un interruptor con su mecanismo de disparo y la marca I>.',does:'Deja pasar la corriente y la corta solo si hay sobrecarga o cortocircuito. Protege el circuito de mando.'},
 breaker3:{name:'Disyuntor de 3 polos',looks:'Tres interruptores iguales, con el bloque de disparo (I>) y el mecanismo unidos por línea punteada.',does:'Protege y permite cortar las tres fases a la vez. Entra por 1-3-5 y sale por 2-4-6.'},
 contactor3:{name:'Contactor (contactos de potencia)',looks:'Tres contactos abiertos iguales, uno por fase.',does:'Se cierran juntos cuando se activa su bobina, y llevan la energía de la red al motor.'},
 thermal3:{name:'Relé térmico (parte de potencia)',looks:'Tres líneas con un quiebre dentro de un rectángulo: el elemento que se calienta.',does:'Mide la corriente del motor. Si es demasiado alta por mucho tiempo, hace actuar sus contactos de mando 95-96 y 97-98.'},
 f1aux:{name:'Relé térmico (contactos de mando)',looks:'Un contacto cerrado (95-96) y uno abierto (97-98) que comparten mecanismo.',does:'95-96 está cerrado y se abre si el motor se sobrecarga (detiene todo). 97-98 está abierto y se cierra en ese caso (por ejemplo, para encender un aviso de falla).'},
 motor:{name:'Motor trifásico',looks:'Un círculo con «M 3~»; arriba U1-V1-W1 y abajo U2-V2-W2.',does:'Recibe las tres fases y gira. Según cómo se unan sus bornes U2, V2 y W2 trabaja en estrella o en triángulo.'},
 'supply-3':{name:'Red trifásica',looks:'Círculos marcados L1, L2, L3 (y PE) en el borde del esquema.',does:'Es por donde entra la energía de la red al circuito de potencia.'},
 'supply-L':{name:'Fase (L)',looks:'Un rombo (o borne) marcado L.',does:'Alimenta el circuito de mando: de aquí sale la corriente que activa bobinas y pilotos.'},
 'supply-N':{name:'Neutro (N)',looks:'Un rombo (o borne) marcado N.',does:'Es el retorno común: cierra el camino de la corriente de bobinas y pilotos.'},
 'supply-PE':{name:'Tierra (PE)',looks:'Tres rayitas cada vez más cortas, o el borne PE.',does:'Protección de las personas: une las carcasas metálicas a tierra. No lleva corriente en servicio normal.'},
};

/** Las letras de las referencias dicen qué aparato es (norma IEC 81346). */
export const LETTERS=[
 ['Q','Disyuntor: protege y corta.'],['KM','Contactor: interruptor que se acciona con una bobina.'],['F','Relé térmico: protege el motor.'],
 ['SB / S','Pulsador: lo acciona la persona.'],['H','Piloto: lámpara de aviso.'],['M','Motor.'],['X','Alimentación: entrada de la red.'],
] as const;

/** Cómo leer las líneas y marcas del dibujo. */
export const LINE_GUIDE=[
 ['Punto en un cruce','Las líneas están unidas: la corriente puede seguir por ambas.'],
 ['Cruce sin punto','Las líneas solo se cruzan en el dibujo: no están conectadas.'],
 ['Línea punteada entre símbolos','Esas piezas se mueven juntas (mismo mecanismo o mismo botón).'],
 ['Mismo nombre en varios símbolos','Son partes de un mismo aparato: la bobina KM1 mueve todos los contactos KM1, aunque estén lejos en el dibujo.'],
 ['Números junto a cada símbolo','Son los bornes: el punto exacto donde se conecta cada cable (A1, 13, 95…).'],
] as const;

/** Recorrido guiado: cada paso enciende en el dibujo las piezas (`symbols`) y los conductores (`nets`: borne de un símbolo). */
export type TourStep={title:string;text:string;scope:'all'|'power'|'control';symbols:number[];nets:[number,string][]};
export type Tour={intro:string;steps:TourStep[];note?:string};

/** Estrella-triángulo con cambio manual (dibujo «CAMBIO DELTA, ESTRELLA»). IDs de símbolos del dibujo transcrito. */
const ESTRELLA_TOUR:Tour={
 intro:'Así se arranca un motor trifásico en estrella y se pasa a triángulo.',
 note:'Dibujo transcrito de una fotografía: el rótulo 13-«12» del contacto NA de KM2 y el orden de U2, V2 y W2 están por confirmar con el archivo original.',
 steps:[
  {title:'La idea',scope:'all',symbols:[3,7,6,5],nets:[],
   text:'Al arrancar, un motor trifásico pide mucha corriente. Este circuito lo arranca en **estrella**, que pide menos, y luego lo pasa a **triángulo**, donde entrega toda su fuerza. Lo hacen tres contactores: **KM1** (línea), **KM3** (estrella) y **KM2** (triángulo).'},
  {title:'Potencia: la línea',scope:'power',symbols:[2,3,4,5],nets:[[2,'1'],[2,'3'],[2,'5'],[3,'2'],[3,'4'],[3,'6'],[4,'2'],[4,'4'],[4,'6']],
   text:'Las fases L1, L2 y L3 entran por el disyuntor **Q1**, pasan por los contactos de **KM1** y por el relé térmico **F1**, y llegan a U1, V1 y W1 del motor.'},
  {title:'Potencia: estrella o triángulo',scope:'power',symbols:[7,6,5],nets:[[7,'1'],[7,'2'],[7,'4'],[7,'6']],
   text:'El otro extremo de las bobinas del motor (U2, V2, W2) va a dos contactores. **KM3** las une entre sí: eso es la **estrella**. **KM2** las conecta a las fases: eso es el **triángulo**. Nunca deben cerrarse a la vez.'},
  {title:'En reposo',scope:'control',symbols:[53,62,66],nets:[[62,'11'],[62,'12']],
   text:'Con el circuito alimentado y sin pulsar nada, la corriente pasa por el contacto cerrado (NC) 11-12 de **KM1** y enciende **H1**: el motor está detenido y listo.'},
  {title:'Marcha: arranca en estrella',scope:'control',symbols:[56,57,63,58,59,64,67],nets:[[56,'13'],[56,'14'],[58,'12'],[59,'12']],
   text:'Al pulsar **SB2** se activa la bobina de **KM1**. Su contacto 13-14, en paralelo con SB2, la mantiene activa aunque sueltes el botón (**retención**). A la vez, por el contacto cerrado de **-S** y el NC de **KM2**, se activa **KM3**: el motor arranca en **estrella** y se enciende **H2**.'},
  {title:'Cambio a triángulo',scope:'control',symbols:[58,64,61,65,60,68],nets:[[58,'14'],[61,'12']],
   text:'Cuando el motor ya tomó velocidad, pulsa **-S**. Su contacto NC se abre y suelta **KM3**; al soltarse, el NC de KM3 vuelve a cerrar y el NA de -S activa **KM2**: el motor pasa a **triángulo**. KM2 se mantiene con su propio contacto NA y se enciende **H3**.'},
  {title:'Seguridad: enclavamiento',scope:'control',symbols:[59,61],nets:[],
   text:'Los contactos NC de **KM2** y **KM3** se cruzan: mientras uno está activo, el otro no puede activarse. Así la estrella y el triángulo nunca se cierran juntos, lo que sería un cortocircuito.'},
  {title:'Parada y protección',scope:'control',symbols:[55,54,69],nets:[[55,'11'],[54,'98']],
   text:'**SB1** (parada, NC) corta el mando y todo vuelve al reposo. Si el motor se sobrecarga, **F1** dispara: 95-96 se abre y detiene todo, y 97-98 se cierra y enciende **H4**, el aviso de falla.'},
 ]};

/** Recorridos disponibles por dibujo (id de CADE_DRAWINGS). */
export const TOURS:Record<string,Tour>={estrella:ESTRELLA_TOUR};
