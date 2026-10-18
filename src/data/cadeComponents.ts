import {cadePorts,type Cade,type CadeObject} from './cade';
/** Qué es cada símbolo de un esquema CADe, en palabras del taller. Se deduce del símbolo dibujado y de su referencia; no inventa funciones del banco. */
export type CadeKind='motor'|'breaker3'|'breaker1'|'contactor3'|'thermal3'|'f1aux'|'push-nc'|'push-no'|'double-push'|'contact-no'|'contact-nc'|'coil'|'coil-timer'|'contact-no-timed'|'contact-nc-timed'|'lamp'|'supply-3'|'supply-L'|'supply-N'|'supply-PE';
export type SymbolInfo={kind:CadeKind;device:string;what:string;tag:string;part:string;note:string;supply:boolean};
const NUMERIC:Record<number,CadeKind>={1001:'motor',6009:'breaker3',6010:'breaker1',2001:'contactor3',6007:'thermal3',8018:'f1aux',8000:'push-no',8001:'push-nc',7000:'contact-no',7001:'contact-nc',9000:'coil',9008:'lamp',3000:'supply-L',3001:'supply-N',3002:'supply-PE',3004:'supply-3'};
export function cadeKind(o:CadeObject):CadeKind|null{
 if(o.shape){if(o.shape==='terminal-round')return 'supply-3';if(o.shape==='terminal-diamond')return o.pins?.[0]==='N'?'supply-N':'supply-L';return o.shape as CadeKind}
 return NUMERIC[o.type]??null;
}
/** Familia del aparato según la letra de su referencia (norma IEC 81346: Q, KM, F, SB/S, H, M, X). */
const DEVICES:[RegExp,string,string][]=[
 [/^KM/,'Contactor','Interruptor accionado por un electroimán: cuando su bobina recibe tensión, cierra los contactos de potencia y cambia los auxiliares.'],
 [/^(SB|S)/,'Pulsador','Botón que la persona pulsa para dar una orden (marcha, parada…). Vuelve solo a su posición al soltarlo.'],
 [/^Q/,'Disyuntor','Protege el circuito y permite cortarlo a mano. Se dispara solo si hay sobrecarga o cortocircuito.'],
 [/^F/,'Relé térmico','Protege el motor contra sobrecarga: si la corriente se mantiene alta, abre su contacto de mando.'],
 [/^H/,'Piloto','Lámpara que avisa un estado: se enciende cuando le llega tensión.'],
 [/^M/,'Motor','La máquina que gira. Sus bornes U, V, W son las entradas de sus tres bobinas.'],
 [/^X/,'Alimentación','Puntos por donde entra la red al esquema.'],
 [/^KT/,'Temporizador','Relé con retardo a la conexión: al recibir tensión empieza a contar y, cuando termina el tiempo, cambia sus contactos temporizados.'],
];
const clean=(r:string)=>r.replace(/^-/,'');
function device(o:CadeObject,kind:CadeKind){
 if(kind.startsWith('supply'))return DEVICES[6];
 return DEVICES.find(d=>d[0].test(clean(o.reference)))??[/./,'Componente','Elemento del esquema.'] as [RegExp,string,string];
}
/** Pares de bornes de un polo trifásico: 1-2, 3-4, 5-6. */
const poles=(o:CadeObject)=>[0,1,2].map(i=>`${o.labels[i]}-${o.labels[i+3]}`).join(' · ');
export function symbolInfo(o:CadeObject):SymbolInfo|null{
 const kind=cadeKind(o);if(!kind)return null;
 const [,name,what]=device(o,kind),ref=o.reference||'';
 const base={kind,device:name,what,supply:kind.startsWith('supply')};
 switch(kind){
  case 'motor':return {...base,tag:'Motor 3~',part:'Motor trifásico',note:'U1-V1-W1 y W2-U2-V2 son los extremos de sus tres bobinas; PE es la tierra de la carcasa. Cómo se unen entre sí define si trabaja en estrella o en triángulo.'};
  case 'breaker3':return {...base,tag:'Disyuntor 3P',part:'Disyuntor trifásico (3 polos)',note:`Corta las tres fases a la vez. Entra por los bornes de arriba (1, 3, 5) y sale por los de abajo (2, 4, 6). El símbolo muestra el disparo térmico y el magnético (I>).`};
  case 'breaker1':return {...base,tag:'Disyuntor 1P',part:'Disyuntor de 1 polo',note:'Corta una sola línea. En este esquema protege el circuito de mando: entra por el borne 1 y sale por el 2.'};
  case 'contactor3':return {...base,tag:'Contactor',part:'Contactor · contactos de potencia',note:`Tres contactos (${poles(o)}) que llevan la corriente al motor. Se cierran solo cuando se energiza la bobina de ${ref||'este contactor'}; la línea punteada indica que se mueven juntos.`};
  case 'thermal3':return {...base,tag:'Relé térmico',part:'Relé térmico · parte de potencia',note:`Va en serie con el motor y mide su corriente (${poles(o)}). Si hay sobrecarga mantenida, dispara y abre su contacto de mando 95-96.`};
  case 'f1aux':return {...base,tag:'Térmico (mando)',part:'Relé térmico · contactos de mando',note:'95-96 es normalmente cerrado (NC): se abre cuando el térmico dispara y corta la bobina. 97-98 es normalmente abierto (NA): se cierra al disparar, por ejemplo para una señal.'};
  case 'push-nc':return {...base,tag:'Pulsador NC',part:'Pulsador normalmente cerrado (NC)',note:'En reposo deja pasar la corriente; mientras lo pulsas, la corta. Por eso se usa típicamente para parar.'};
  case 'push-no':return {...base,tag:'Pulsador NA',part:'Pulsador normalmente abierto (NA)',note:'En reposo no deja pasar la corriente; mientras lo pulsas, la deja pasar. Por eso se usa típicamente para arrancar.'};
  case 'double-push':return {...base,tag:'Pulsador doble',part:'Pulsador doble (NC + NA)',note:'Dos contactos en un mismo botón: el NC (11-12) se abre y el NA (13-14) se cierra al pulsar.'};
  case 'contact-no':return {...base,tag:'Contacto NA',part:`Contacto auxiliar NA${ref?` de ${clean(ref)}`:''}`,note:`Abierto en reposo; se cierra cuando se energiza la bobina del contactor ${clean(ref)||'correspondiente'}. Puesto en paralelo con un pulsador de marcha, mantiene el circuito (enclavamiento).`};
  case 'contact-nc':return {...base,tag:'Contacto NC',part:`Contacto auxiliar NC${ref?` de ${clean(ref)}`:''}`,note:`Cerrado en reposo; se abre cuando se energiza la bobina del contactor ${clean(ref)||'correspondiente'}. Se usa para enclavar entre contactores o apagar una señal.`};
  case 'coil':return {...base,tag:'Bobina',part:`Bobina del contactor${ref?` ${clean(ref)}`:''}`,note:'Es el electroimán (bornes A1 y A2). Al recibir tensión entre A1 y A2, cierra los contactos de potencia y cambia los auxiliares NA/NC que llevan su mismo nombre.'};
  case 'coil-timer':return {...base,tag:'Bobina temporizada',part:`Bobina del temporizador${ref?` ${clean(ref)}`:''}`,note:'Es la alimentación del temporizador (bornes A1 y A2). El cuadrado con una X indica retardo a la conexión: al recibir tensión empieza a contar, y sus contactos temporizados cambian solo cuando termina el tiempo. Si se quita la tensión, el conteo se reinicia.'};
  case 'contact-nc-timed':return {...base,tag:'NC temporizado',part:`Contacto NC temporizado${ref?` de ${clean(ref)}`:''}`,note:'Cerrado en reposo. El arco con doble trazo indica que no abre al instante: lo hace cuando termina el tiempo del temporizador. Mientras cuenta sigue dejando pasar la corriente.'};
  case 'contact-no-timed':return {...base,tag:'NA temporizado',part:`Contacto NA temporizado${ref?` de ${clean(ref)}`:''}`,note:'Abierto en reposo. El arco con doble trazo indica que no cierra al instante: lo hace cuando termina el tiempo del temporizador y entonces deja pasar la corriente.'};
  case 'lamp':return {...base,tag:'Piloto',part:`Lámpara piloto${ref?` ${clean(ref)}`:''}`,note:'Se enciende cuando hay tensión entre X1 y X2. Solo señaliza; no acciona nada.'};
  case 'supply-3':return {...base,tag:'',part:'Red trifásica',note:'Fases L1, L2 y L3 (y tierra PE si aparece).'};
  case 'supply-L':return {...base,tag:'',part:'Fase (L)',note:'Línea viva que alimenta el circuito de mando.'};
  case 'supply-N':return {...base,tag:'',part:'Neutro (N)',note:'Retorno común del circuito de mando.'};
  case 'supply-PE':return {...base,tag:'',part:'Tierra (PE)',note:'Conductor de protección: no lleva corriente en servicio normal.'};
 }
}
/** Foto real para reconocer el aparato. Las del banco son del laboratorio; el resto son imágenes de referencia ya incluidas en la app. */
export type CadePhoto={src:string;alt:string;caption:string};
const BANK=(src:string,alt:string,caption:string):CadePhoto=>({src,alt,caption});
const PHOTOS:Record<CadeKind,CadePhoto>={
 motor:BANK('/estudio/assets/motor-v2.webp','Motor eléctrico trifásico acoplado a su base','Motor trifásico (imagen de referencia). En el banco se conecta por la bornera U1 V1 W1 W2 U2 V2.'),
 breaker3:BANK('/estudio/assets/termomagnetico-v2.webp','Disyuntor termomagnético de tres polos','Disyuntor de 3 polos (imagen de referencia): arriba entra la red, abajo sale hacia la carga.'),
 breaker1:BANK('/estudio/assets/termomagnetico-v2.webp','Disyuntor termomagnético; el de un polo es una sola de estas tres columnas','Disyuntor (imagen de referencia, de 3 polos). El de 1 polo es una sola de estas columnas.'),
 contactor3:BANK('/references/contactor-trifasico.jpg','Contactor trifásico del banco de laboratorio con sus bornes A1, A2, L1 a L3','Contactor del banco: bobina A1-A2 y contactos de potencia L1-T1, L2-T2, L3-T3.'),
 thermal3:BANK('/references/contactor-termico.jpg','Contactor con relé térmico del banco de laboratorio','Relé térmico montado bajo el contactor (foto del banco). Sus bornes 95-96 salen al panel.'),
 f1aux:BANK('/references/contactor-termico.jpg','Relé térmico del banco con sus bornes 95, 96, 97 y 98','Relé térmico del banco: 95-96 y 97-98 son sus contactos de mando (foto del banco).'),
 'push-nc':BANK('/references/botoneras.jpg','Pulsadores verde y rojo del banco de laboratorio','Botoneras del banco (foto): cada pulsador tiene un par 1-2 y otro 3-4.'),
 'push-no':BANK('/references/botoneras.jpg','Pulsadores verde y rojo del banco de laboratorio','Botoneras del banco (foto): cada pulsador tiene un par 1-2 y otro 3-4.'),
 'double-push':BANK('/references/botoneras.jpg','Pulsadores verde y rojo del banco de laboratorio','Botoneras del banco (foto): cada pulsador tiene un par 1-2 y otro 3-4.'),
 'contact-no':BANK('/references/contactor-trifasico.jpg','Contactor del banco; sus contactos auxiliares están en el frente','Contactos auxiliares del contactor (foto del banco). Por su numeración, 13-14, 63-64 y 93-94 serían NA; falta confirmarlo en el banco.'),
 'contact-nc':BANK('/references/contactor-trifasico.jpg','Contactor del banco; sus contactos auxiliares están en el frente','Contactos auxiliares del contactor (foto del banco). Por su numeración, 71-72 y 81-82 serían NC; falta confirmarlo en el banco.'),
 coil:BANK('/references/contactor-trifasico.jpg','Contactor del banco con los bornes A1 y A2 de su bobina','La bobina está dentro del contactor; en el panel sale a los bornes A1 y A2 (foto del banco).'),
 'coil-timer':BANK('/references/temporizador-1.jpg','Temporizador del banco de laboratorio','Temporizador del banco (foto): su alimentación son los bornes A1 y A2.'),
 'contact-no-timed':BANK('/references/temporizador-1.jpg','Temporizador del banco de laboratorio','Temporizador del banco (foto): 67-68 es su contacto temporizado NA.'),
 'contact-nc-timed':BANK('/references/temporizador-1.jpg','Temporizador del banco de laboratorio','Temporizador del banco (foto): 55-56 es su contacto temporizado NC.'),
 lamp:BANK('/references/botoneras.jpg','Luces piloto verde, roja y ámbar del banco de laboratorio','Luces piloto 24 V del banco (foto).'),
 'supply-3':BANK('/references/suministro.jpg','Módulo de alimentación del banco con bornes R, S, T, N y F','Alimentación del banco (foto): bornes R, S, T, N y F.'),
 'supply-L':BANK('/references/suministro.jpg','Módulo de alimentación del banco con bornes R, S, T, N y F','Alimentación del banco (foto): bornes R, S, T, N y F.'),
 'supply-N':BANK('/references/suministro.jpg','Módulo de alimentación del banco con bornes R, S, T, N y F','Alimentación del banco (foto): bornes R, S, T, N y F.'),
 'supply-PE':BANK('/references/suministro.jpg','Módulo de alimentación del banco con borne de tierra','Alimentación del banco (foto).'),
};
export const photoFor=(kind:CadeKind)=>PHOTOS[kind];
/** Dónde está escrita la referencia de cada símbolo (desplazamiento desde su origen, texto alineado a la derecha). */
const REF_AT:Partial<Record<CadeKind,[number,number]>>={breaker3:[-17.6,6.4],contactor3:[-5,8.6],thermal3:[-6.4,5],motor:[-14,1.5],breaker1:[-16.8,9.8],f1aux:[-11.8,9.4],'push-nc':[-10.6,9],'push-no':[-10.6,9],'double-push':[-10.6,9],'contact-no':[-6.4,9],'contact-nc':[-6.8,9],coil:[-9,9.4],'coil-timer':[-13.4,9.4],'contact-nc-timed':[-13.6,9],'contact-no-timed':[-13.6,9],lamp:[-8.6,9.8]};
/** Posición del rótulo del nombre: justo debajo de la referencia. */
export function nameTagAt(o:CadeObject,kind:CadeKind){const at=o.shape?REF_AT[kind]??[-6,9]:[-5,6];return {x:o.x+at[0],y:o.y+at[1]+3.3}}
export type LegendPart={id:number;info:SymbolInfo;terminals:string};
export type LegendGroup={key:string;reference:string;device:string;what:string;supply:boolean;parts:LegendPart[]};
const ORDER=['Disyuntor','Contactor','Relé térmico','Pulsador','Piloto','Temporizador','Motor','Alimentación'];
/** Componentes del dibujo agrupados por aparato: un contactor aparece como bobina, contactos de potencia y contactos auxiliares. */
export function legendGroups(cade:Cade):LegendGroup[]{
 const groups=new Map<string,LegendGroup>(),seen=new Set<string>();
 for(const o of cade.SYMBOLS){
  const info=symbolInfo(o);if(!info)continue;
  const where=`${o.reference}|${info.kind}|${o.x}|${o.y}`;if(seen.has(where))continue;seen.add(where);
  const key=info.supply?'supply':`${info.device}|${clean(o.reference)}`;
  const g=groups.get(key)??{key,reference:info.supply?'':o.reference,device:info.device,what:info.what,supply:info.supply,parts:[]};
  const terminals=cadePorts(o).map(p=>p.terminal).filter(t=>t&&t!=='PE').join(' · ');
  g.parts.push({id:o.id,info,terminals});groups.set(key,g);
 }
 const rank=(g:LegendGroup)=>ORDER.indexOf(g.device);
 return [...groups.values()].sort((a,b)=>rank(a)-rank(b)||a.reference.localeCompare(b.reference,'es',{numeric:true}));
}

/** Función de cada conductor según su color: fase (rojo), neutro (azul), tierra (verde) y, en el dibujo de estrella-triángulo, potencia (negro). */
export type WireRole='phase'|'neutral'|'pe'|'power';
export const WIRE_ROLE_ORDER:WireRole[]=['phase','neutral','pe','power'];
export const WIRE_ROLES:Record<WireRole,{label:string;colorName:string;note:string}>={
 phase:{label:'Fase',colorName:'rojo',note:'Conductor con tensión. Parte de la red (L1, L2, L3 o L) y sigue hacia las cargas pasando por los aparatos.'},
 neutral:{label:'Neutro',colorName:'azul',note:'Retorno común del circuito de mando: cierra el camino de la corriente de bobinas y pilotos.'},
 pe:{label:'Tierra (PE)',colorName:'verde',note:'Conductor de protección. No lleva corriente en servicio normal.'},
 power:{label:'Potencia',colorName:'negro',note:'Conductor del circuito de potencia: lleva L1, L2 y L3 desde la red hasta el motor.'},
};
export function wireRole(w:CadeObject):WireRole{
 if(w.color)return w.color==='#3d6fae'?'neutral':w.color==='#a64a4a'?'phase':'power';
 return w.type===4009?'neutral':w.type===4010?'pe':'phase';
}
/** Color con que se dibuja un conductor. */
export const wireColor=(w:CadeObject)=>w.color??(w.type===4009?'#5a89b9':w.type===4010?'#719359':'#a36264');
/** Nombre de la alimentación a la que llega una red de conductores («L1», «L», «N»…), si la hay. */
export function supplyName(cade:Cade,wireId:number){
 return cade.network(wireId).ports.find(p=>/^-?X$/.test(p.reference)&&['L1','L2','L3','L','N','PE'].includes(p.terminal))?.terminal;
}
