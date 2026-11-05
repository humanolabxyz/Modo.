import type {CadeDrawing,CadeObject} from './cade';

const POWER_TERMINALS=['L1','L2','L3','T1','T2','T3'];
const BANK_REFERENCE:Record<string,string>={KM1:'KT1',KM2:'KM1',KM3:'KM2'};
const LABELS:Record<number,string>={54:'FR1',55:'S2',56:'S1',58:'KT1',62:'KM1',66:'P2',67:'P1',68:'P4',69:'P3',1001:'KM2',1003:'KT1'};
const TERMINALS:Record<number,string[]>={
 1:['R','S','T','TP'],3:POWER_TERMINALS,5:['U1','V1','W1','W2','U2','V2','TP'],6:POWER_TERMINALS,7:POWER_TERMINALS,
 51:['F'],55:['1','2'],56:['3','4'],58:['55','56'],59:['71','72'],61:['71','72'],
 62:['81','82'],1001:['81','82'],1003:['67','68'],
};
// Cada puerto se vincula con el borne del banco que aparece en el guardado.
const PANEL:Record<number,string[]>={
 1:['FUENTE:R','FUENTE:S','FUENTE:T','FUENTE:TP'],
 5:['U1','V1','W1','W2','U2','V2','TP'].map(t=>'BORNERA_MOTOR:'+t),
 51:['FUENTE:F'],52:['FUENTE:N'],55:['BOTONERAS:S2:1','BOTONERAS:S2:2'],
 56:['BOTONERAS:S1:3','BOTONERAS:S1:4'],
 66:['BOTONERAS:PILOTO_2'],67:['BOTONERAS:PILOTO_1'],68:['BOTONERAS:PILOTO_4'],69:['BOTONERAS:PILOTO_3'],
 1004:['BOTONERAS:N'],
};
const MODULE:Record<number,string>={
 3:'TEMPORIZADOR_1',57:'TEMPORIZADOR_1',58:'TEMPORIZADOR_1',63:'TEMPORIZADOR_1',1003:'TEMPORIZADOR_1',
 6:'CONTACTOR_TERMICO',54:'CONTACTOR_TERMICO',59:'CONTACTOR_TERMICO',62:'CONTACTOR_TERMICO',65:'CONTACTOR_TERMICO',
 7:'CONTACTOR_TRIFASICO',61:'CONTACTOR_TRIFASICO',64:'CONTACTOR_TRIFASICO',1001:'CONTACTOR_TRIFASICO',
};
const OMIT=new Set([2,4,8,9,10,14,16,18,53,60,70,100,108,109,110]);
const WIRES:Record<number,Partial<CadeObject>>={
 11:{type:4010,color:'#32834b'},12:{type:4010,color:'#32834b'},
 13:{y:26},15:{y:26},17:{y:26},71:{y:26},
 19:{y:114},20:{y:114},21:{y:114},
 75:{y2:152},76:{y:193},98:{x2:391},101:{y2:174},111:{y:192},
};

/** Mantiene la disposición de las figuras 1 y 2 de la guía con las redes
 * del último armado de Matías y la numeración de bornes del banco. */
export function twoContactorDrawing(guide:CadeDrawing):CadeDrawing{
 const object=(id:number)=>guide.objects.find(o=>o.id===id)!;
 const redContact=object(62),redLamp=object(66),timed=object(58);
 const additions:CadeObject[]=[
  {...redContact,id:1001,y:152,box:[251,151,274,171],ports:redContact.ports!.map(p=>({...p,y:p.y+23}))},
  {...object(75),id:1002,x:265,y:170,x2:265,y2:175},
  {...timed,id:1003,x:391,shape:'contact-no-timed',box:[374,173,400,193],ports:timed.ports!.slice(2).map(p=>({...p,x:391}))},
  {...object(52),id:1004,x:474,y:249,reference:'Botoneras',box:[468,241,480,253],ports:[{terminal:'N',x:472,y:249}]},
  {...object(120),id:1005,x:456,x2:472},
  {...object(95),id:1007,x:331,x2:331},
 ];
 const objects=guide.objects.filter(o=>!OMIT.has(o.id)).concat(additions).map(o=>{
  const {id}=o;
  const n={...o,...WIRES[id],reference:LABELS[id]??BANK_REFERENCE[o.reference]??o.reference};
  if(id===58){n.shape='contact-nc-timed';n.ports=timed.ports!.slice(0,2);n.box=[311,173,340,193];}
  if(id===66){n.y=175;n.box=redLamp.box!.map((v,i)=>i%2?v+13:v);n.ports=redLamp.ports!.map(p=>({...p,y:p.y+13}));}
  if(o.type===4000&&o.x<200&&id!==11&&id!==12)n.color='#a64a4a';
  n.labels=TERMINALS[id]??o.labels;
  if(n.pins)n.pins=TERMINALS[id]??o.pins;
  if(n.ports)n.ports=n.ports.map((p,i)=>{
   const terminal=TERMINALS[id]?.[i]??p.terminal;
   const panel=PANEL[id]?.[i]||(MODULE[id]?MODULE[id]+':'+terminal:undefined);
   return {...p,terminal,panel};
  });
  return n;
 });
 return {...guide,name:'Estrella-triángulo con temporizador · montaje de Matías',
  source:'Guardado de Matías · Actividad 2 UA2, figuras 1 y 2 como referencia de formato',
  views:{...guide.views!,control:{x:250,y:8,w:235,h:250}},objects};
}
