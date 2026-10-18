/** Geometry is a manual front-facing reconstruction of the user's training panel photos.
 * It is NOT a verified electrical schematic or a physical wiring guide.
 */
export type ColorName = 'red'|'blue'|'black'|'gray'|'white'|'green';
export type Verification = 'foto'|'convencion_por_confirmar'|'no_verificado'|'usuario';
export type Terminal = { id: string; label: string; x: number; y: number; color: ColorName; note?: string; state?: string; verification?: Verification; labelSide?: 'top'|'bottom'|'left'|'right'; };
export type PanelModule = { id: string; title: string; subtitle?: string; x: number; y: number; w: number; h: number; image: string; category: 'alimentacion'|'botoneras'|'contactores'|'temporizadores'|'motor'; summary: string; aliasEditable?: boolean; terminals: Terminal[]; labelBands?: string[][]; };
export const terminalDisplay=(t:Terminal)=>t.id.match(/^S[123]:([1234])$/)?.[1]||t.id.replace('PILOTO_','P').replace(/^TP_.+$/,'TP');
export const terminalLabelPosition=(t:Terminal)=>({
 x:t.x+(t.labelSide==='left'?-31:t.labelSide==='right'?30:0),
 y:t.y+(t.labelSide==='top'?-20:t.labelSide==='right'?4:33)
});
const port=(id:string,x:number,y:number,color:ColorName,note?:string,state?:string,labelSide:Terminal['labelSide']='bottom',verification:Verification='foto'):Terminal=>({id,label:id,x,y,color,note,state,labelSide,verification});
const source:PanelModule={id:'FUENTE',title:'ALIMENTACIÓN Y TRANSFORMADOR',subtitle:'Transformador 220 / 24 V · 3 A',x:65,y:82,w:585,h:285,image:'/references/suministro.jpg',category:'alimentacion',summary:'Fuentes y puntos de alimentación visibles. No energizar equipos reales sin autorización docente.',labelBands:[['R','S','T'],['N','F']],terminals:[
 port('R',237,230,'blue','Fase R'),port('S',297,230,'black','Fase S'),port('T',357,230,'red','Fase T'),port('N',430,230,'white','Neutro / referencia: conexión interna por confirmar',undefined,'bottom','no_verificado'),port('F',493,230,'red','Borne marcado F: función interna por confirmar',undefined,'bottom','no_verificado'),port('TP',550,242,'green','Tierra de protección')
]};
const btn:PanelModule={id:'BOTONERAS',title:'LUCES PILOTO 24 V A.C. / BOTONERAS',x:712,y:76,w:615,h:300,image:'/references/botoneras.jpg',category:'botoneras',summary:'Cuatro pilotos y tres pulsadores. Pares rojos 1–2; pares claros 3–4. En el pulsador derecho las columnas están invertidas. NA/NC por convención, pendiente de verificación.',labelBands:[1,2,3].flatMap(s=>[[`S${s}:1`,`S${s}:3`],[`S${s}:2`,`S${s}:4`]]),terminals:[
 ...[78,228,378,530].map((x,i)=>port(`PILOTO_${i+1}`,x,105,'red',`Conector visible bajo piloto ${i+1}; retorno aún no verificado`,undefined,'bottom','no_verificado')),
 ...[115,303,488].flatMap((cx,i)=>[
 // IMG_4737 and IMG_4536: the right-hand button has its columns reversed.
 port(`S${i+1}:1`,cx+(i===2?29:-29),196,'red',`Pulsador ${i+1} · contacto 1–2`,'NC por convención · por confirmar','bottom','convencion_por_confirmar'),
 port(`S${i+1}:2`,cx+(i===2?29:-29),250,'red',`Pulsador ${i+1} · contacto 1–2`,'NC por convención · por confirmar','bottom','convencion_por_confirmar'),
 port(`S${i+1}:3`,cx+(i===2?-29:29),196,'white',`Pulsador ${i+1} · contacto 3–4`,'NA por convención · por confirmar','bottom','convencion_por_confirmar'),
 port(`S${i+1}:4`,cx+(i===2?-29:29),250,'white',`Pulsador ${i+1} · contacto 3–4`,'NA por convención · por confirmar','bottom','convencion_por_confirmar')
 ]),
 port('N',571,132,'white','Borne N visible del módulo; conexión interna no verificada',undefined,'bottom','no_verificado'),
 port('TP_IZQ',40,260,'green','Tierra de protección'),port('TP_DER',579,260,'green','Tierra de protección')
]};
const thermal:PanelModule={id:'CONTACTOR_TERMICO',title:'CONTACTOR + RELÉ TÉRMICO',subtitle:'Contactor y protección de sobrecarga',x:65,y:408,w:585,h:350,image:'/references/contactor-termico.jpg',category:'contactores',summary:'Contactor con relé térmico. Los números de bornes están identificados; referencia KM escrita a mano sin confirmar.',aliasEditable:true,labelBands:[['A2','A1'],['L1','L2','L3'],['T1','T2','T3'],['71','72'],['81','82'],['95','96'],['13','14'],['63','64'],['93','94'],['97','98']],terminals:[
 port('A2',176,64,'red','Bobina, borne A2',undefined,'right'),port('A1',176,108,'white','Bobina, borne A1',undefined,'right'),
 ...['L1','L2','L3'].map((id,i)=>port(id,264+i*77,70,(['blue','black','red'] as ColorName[])[i],'Entrada de potencia',undefined,'bottom')),
 ...['T1','T2','T3'].map((id,i)=>port(id,264+i*77,309,(['blue','black','red'] as ColorName[])[i],'Salida de potencia',undefined,'bottom')),
 ...['71','72','81','82','95','96'].map((id,i)=>port(id,178+(i%2)*74,164+Math.floor(i/2)*54,'black',`${i>=4?'Protección térmica':'Auxiliar'} · contacto ${['71–72','71–72','81–82','81–82','95–96','95–96'][i]}`,'NC probable','top','convencion_por_confirmar')),
 ...['13','14','63','64','93','94','97','98'].map((id,i)=>port(id,449+(i%2)*70,128+Math.floor(i/2)*54,'blue',`${i>=6?'Protección térmica':'Auxiliar'} · contacto ${['13–14','13–14','63–64','63–64','93–94','93–94','97–98','97–98'][i]}`,'NA probable','top','convencion_por_confirmar')),
 port('TP_IZQ',170,309,'green','Tierra de protección'),port('TP_DER',551,309,'green','Tierra de protección')
]};
const tri:PanelModule={id:'CONTACTOR_TRIFASICO',title:'CONTACTOR TRIFÁSICO',subtitle:'Referencia escrita KM… por confirmar',x:712,y:408,w:615,h:350,image:'/references/contactor-trifasico.jpg',category:'contactores',summary:'Contactor trifásico con bobina, bornes de potencia y contactos auxiliares. Etiqueta KM manuscrita aún no legible por completo.',aliasEditable:true,labelBands:[['A2','A1'],['L1','L2','L3'],['T1','T2','T3'],['71','72'],['81','82'],['13','14'],['63','64'],['93','94']],terminals:[
 port('A2',52,65,'red','Bobina, borne A2',undefined,'right'),port('A1',52,112,'white','Bobina, borne A1',undefined,'right'),
 ...['L1','L2','L3'].map((id,i)=>port(id,184+i*78,71,(['blue','black','red'] as ColorName[])[i],'Entrada de potencia',undefined,'bottom')),
 ...['T1','T2','T3'].map((id,i)=>port(id,184+i*78,309,(['blue','black','red'] as ColorName[])[i],'Salida de potencia',undefined,'bottom')),
 ...['71','72','81','82'].map((id,i)=>port(id,i===0?80:72+(i%2)*65,157+Math.floor(i/2)*60,'black',`Auxiliar · contacto ${i<2?'71–72':'81–82'}`,'NC probable','top','convencion_por_confirmar')),
 port('95',72,277,'black','Borne 95 de KM2: presencia indicada por ti. Posición y color de referencia; función interna por confirmar.',undefined,'top','usuario'),
 port('96',137,277,'black','Borne 96 de KM2: presencia indicada por ti. Posición y color de referencia; función interna por confirmar.',undefined,'top','usuario'),
 ...['13','14','63','64','93','94'].map((id,i)=>port(id,473+(i%2)*65,149+Math.floor(i/2)*54,'blue',`Contacto ${['13–14','13–14','63–64','63–64','93–94','93–94'][i]}`,'NA probable','top','convencion_por_confirmar')),
 port('TP_IZQ',55,309,'green','Tierra de protección'),port('TP_DER',580,309,'green','Tierra de protección')
]};
function timer(id:'TEMPORIZADOR_1'|'TEMPORIZADOR_2',x:number,image:string):PanelModule{return {id,title:'TEMPORIZADOR NEUMÁTICO',subtitle:'BOBINA 24 V A.C.',x,y:787,w:485,h:270,image,category:'temporizadores',aliasEditable:true,summary:'Temporizador neumático de 24 V CA. Antes de simularlo hay que confirmar el modo de retardo y su referencia.',labelBands:[['A2','A1'],['L1','L2','L3'],['T1','T2','T3'],['55','56'],['13','14'],['67','68']],terminals:[
 port('A2',33,59,'red','Bobina A2',undefined,'right'),port('A1',33,102,'white','Bobina A1',undefined,'right'),
 ...['L1','L2','L3'].map((id,i)=>port(id,152+i*63,58,(['blue','black','red'] as ColorName[])[i],'Bornes superiores',undefined,'bottom')),
 ...['T1','T2','T3'].map((id,i)=>port(id,152+i*63,222,(['blue','black','red'] as ColorName[])[i],'Bornes inferiores',undefined,'bottom')),
 port('55',45,169,'black','Contacto 55–56, retardo no verificado','NC probable','top','convencion_por_confirmar'),port('56',96,169,'black','Contacto 55–56, retardo no verificado','NC probable','top','convencion_por_confirmar'),
 port('13',365,135,'blue','Auxiliar 13–14','NA probable','top','convencion_por_confirmar'),port('14',427,135,'blue','Auxiliar 13–14','NA probable','top','convencion_por_confirmar'),
 port('67',365,191,'blue','Contacto 67–68, retardo no verificado','NA probable','top','convencion_por_confirmar'),port('68',427,191,'blue','Contacto 67–68, retardo no verificado','NA probable','top','convencion_por_confirmar'),
 port('TP_IZQ',49,224,'green','Tierra de protección'),port('TP_DER',452,224,'green','Tierra de protección')
]};}
const motor:PanelModule={id:'BORNERA_MOTOR',title:'MOTOR TRIFÁSICO',subtitle:'Motor con bornera U1 V1 W1 · W2 U2 V2',x:65,y:798,w:715,h:285,image:'/references/motor.jpg',category:'motor',summary:'Motor trifásico con su bornera: seis extremos de bobinado y tierra de protección. Estrella o triángulo se define con los puentes entre bornes.',labelBands:[['U1','V1','W1'],['W2','U2','V2']],terminals:[
 port('U1',532,109,'blue','Terminal de motor U1',undefined,'top'),port('V1',581,109,'black','Terminal de motor V1',undefined,'top'),port('W1',630,109,'red','Terminal de motor W1',undefined,'top'),
 port('W2',532,176,'red','Terminal de motor W2',undefined,'bottom'),port('U2',581,176,'blue','Terminal de motor U2',undefined,'bottom'),port('V2',630,176,'black','Terminal de motor V2',undefined,'bottom'),
 port('TP',499,144,'green','Tierra de protección',undefined,'bottom')
]};
// User clarification: only numbered auxiliary/protection contacts use gray NC / blue NO.
for(const m of [thermal,tri])for(const t of m.terminals){
 if(['71','72','81','82','95','96'].includes(t.id)){
  t.color='gray';t.state='NC · normalmente cerrado';t.verification='usuario';
  t.note=(m===tri&&['95','96'].includes(t.id)?'Contacto 95–96: NC indicado por ti; accionamiento interno por confirmar.':t.note||'')+' Gris = normalmente cerrado, indicado por ti.';
 }
 if(['13','14','63','64','93','94','97','98'].includes(t.id)){
  t.state='NA · normalmente abierto';t.verification='usuario';t.note=(t.note||'')+' Azul = normalmente abierto, indicado por ti.';
 }
}
tri.labelBands!.push(['95','96']);
// Disposición base compacta: dos columnas alineadas, sin huecos. El usuario puede acoplar los módulos donde quiera (ver data/layout.ts).
source.x=65;source.y=76;btn.x=674;btn.y=76;
thermal.x=65;thermal.y=412;tri.x=674;tri.y=412;
const pneumatic=timer('TEMPORIZADOR_1',65,'/references/temporizador-1.jpg');pneumatic.y=798;
motor.x=574;motor.y=798;
export const RETIRED_MODULES:PanelModule[]=[timer('TEMPORIZADOR_2',831,'/references/temporizador-2.jpg')];
export const MODULES:PanelModule[]=[source,btn,thermal,tri,motor,pneumatic];
export const RETIRED_TERMINAL_IDS=new Set(RETIRED_MODULES.flatMap(m=>m.terminals.map(t=>`${m.id}:${t.id}`)));
export const PORT_COUNT=MODULES.reduce((n,m)=>n+m.terminals.length,0);
export const terminalKey=(module:PanelModule,terminal:Terminal)=>`${module.id}:${terminal.id}`;
export const TERMINALS=MODULES.flatMap(module=>module.terminals.map(terminal=>({key:terminalKey(module,terminal),module,terminal})));
/** Shared by search and canvas highlighting; aliases remain unverified study labels. */
export function matchesTerminal(module:PanelModule,terminal:Terminal,query:string,alias=''){
 const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();
 return normalize(`${module.title} ${module.id} ${alias} ${terminal.id} ${terminalKey(module,terminal)}`).includes(normalize(query));
}
export const VERIFICATION_INFO:Record<Verification,string>={
 foto:'Etiqueta o color reconocible en las fotografías aportadas.',
 convencion_por_confirmar:'Interpretación basada en numeración industrial; aún requiere confirmar el estado eléctrico del equipo real.',
 no_verificado:'No se puede determinar con certeza la función o relación interna usando solamente las fotografías.'
 ,usuario:'Información indicada por ti; revisa la nota del borne para distinguir lo confirmado de lo pendiente.'
};
export const COLOR_HEX:Record<ColorName,string>={red:'#bd142a',blue:'#17509a',black:'#24272c',gray:'#6a747c',white:'#f5f1e7',green:'#00865b'};
