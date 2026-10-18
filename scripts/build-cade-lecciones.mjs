// Genera src/data/cadeLecciones.json: esquemas de mando y fuerza (estilo CADe) de las lecciones guiadas.
// Cada borne de un símbolo trae `panel`, la clave del borne del banco que representa; así la guía ilumina la línea que
// corresponde a cada cable que se está armando (ver src/data/lessonSchematics.ts).
// Uso: node scripts/build-cade-lecciones.mjs
import {writeFileSync} from 'node:fs';
const POWER='#2f343a',RED='#a64a4a',BLUE='#3d6fae',EARTH='#2a8a62';
function sheet(name,build,views,splitX){
 const objects=[];let nextId=1;const id=()=>nextId++;
 const wire=(x,y,x2,y2,color,extra={})=>objects.push({id:id(),type:4000,reference:'',labels:[],x,y,x2,y2,color,...extra});
 const dot=(x,y)=>objects.push({id:id(),type:4001,reference:'',labels:[],x,y,x2:x,y2:y});
 const poly=(color,pts,extra={})=>{for(let i=1;i<pts.length;i++)wire(pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1],color,extra)};
 const sym=(shape,reference,x,y,ports,box,extra={})=>objects.push({id:id(),type:9100,shape,reference,labels:ports.map(p=>p.terminal),x,y,x2:0,y2:0,ports,box,...extra});
 const P=(terminal,x,y,panel)=>({terminal,x,y,...(panel?{panel}:{})});
 build({wire,dot,poly,sym,P});
 return {name,source:'Esquema de la lección guiada, redibujado a partir del circuito armado en el banco.',origin:'lesson',splitX,objects,views};
}
/** Puesta a tierra: cadena de bornes TP unidos por una línea discontinua. */
const earthTap=({wire,dot,sym,P},x,y,reference,panel,side=10)=>{dot(x,y);wire(x,y,x+side,y,EARTH,{dashed:true});sym('terminal-diamond',reference,x+side,y,[P('TP',x+side,y,panel)],[x+side-3,y-3,x+side+3,y+3],{pins:['TP '+reference]})};
const star=({wire,dot},cx,y)=>{ // puente de estrella bajo el motor: W2, U2 y V2 unidos
 wire(cx-9,y,cx-9,y+14,POWER);wire(cx-9,y+14,cx,y+14,POWER);wire(cx,y+4,cx,y+14,POWER);wire(cx+9,y,cx+9,y+14,POWER);wire(cx+9,y+14,cx,y+14,POWER);dot(cx,y+14);
};

/* ───────── Marcha y paro con retención (solo KM1) ───────── */
const simple=sheet('Marcha y paro con retención',k=>{
 const {wire,dot,poly,sym,P}=k,PX=[63,72,81];
 // Fuerza
 sym('terminal-round','-X',63,24,[P('R',63,26,'FUENTE:R'),P('S',72,26,'FUENTE:S'),P('T',81,26,'FUENTE:T'),P('PE',90,26,'FUENTE:TP')],[54,18,94,27],{pins:['R','S','T','PE']});
 sym('contactor3','KM1',63,60,[...PX.map((x,i)=>P(['1','3','5'][i],x,60,`CONTACTOR_TERMICO:L${i+1}`)),...PX.map((x,i)=>P(['2','4','6'][i],x,78))],[52,59,86,79]);
 sym('thermal3','F1',63,100,[...PX.map((x,i)=>P(['1','3','5'][i],x,100)),...PX.map((x,i)=>P(['2','4','6'][i],x,109,`CONTACTOR_TERMICO:T${i+1}`))],[50,97,88,112]);
 sym('motor','M1',72,150,[P('U1',63,142,'BORNERA_MOTOR:U1'),P('V1',72,138,'BORNERA_MOTOR:V1'),P('W1',81,142,'BORNERA_MOTOR:W1'),P('W2',63,158,'BORNERA_MOTOR:W2'),P('U2',72,162,'BORNERA_MOTOR:U2'),P('V2',81,158,'BORNERA_MOTOR:V2'),P('PE',84,150,'BORNERA_MOTOR:TP')],[56,134,92,166]);
 PX.forEach(x=>{wire(x,26,x,60,POWER);wire(x,78,x,100,POWER,{internal:true})}); // 78→100: unión interna contactor → térmico del mismo módulo
 wire(63,109,63,142,POWER);wire(72,109,72,138,POWER);wire(81,109,81,142,POWER);
 star(k,72,158);
 // Tierras
 wire(90,26,90,70,EARTH,{dashed:true});wire(90,70,90,110,EARTH,{dashed:true});wire(90,110,90,150,EARTH,{dashed:true});wire(90,150,84,150,EARTH,{dashed:true});
 earthTap(k,90,70,'KM1','CONTACTOR_TERMICO:TP_DER');earthTap(k,90,110,'BOT','BOTONERAS:TP_DER');
 // Mando
 sym('terminal-diamond','-X',150,24,[P('F',150,26,'FUENTE:F')],[147,21,153,29],{pins:['F']});
 sym('terminal-diamond','',320,24,[P('N',320,26,'FUENTE:N')],[317,21,323,29],{pins:['N']});
 sym('f1aux','F1',150,40,[P('95',150,40,'CONTACTOR_TERMICO:95'),P('96',150,58,'CONTACTOR_TERMICO:96'),P('97',163.5,40,'CONTACTOR_TERMICO:97'),P('98',163.5,58,'CONTACTOR_TERMICO:98')],[132,39,172,59]);
 wire(150,26,150,32,RED);wire(150,32,150,40,RED);wire(150,32,163.5,32,RED);wire(163.5,32,163.5,40,RED);dot(150,32);
 // 96 → paro S2 y aviso de reposo
 wire(150,58,150,70,RED);dot(150,70);wire(150,70,150,80,RED);
 sym('push-nc','S2',150,80,[P('1',150,80,'BOTONERAS:S2:1'),P('2',150,98,'BOTONERAS:S2:2')],[126,79,158,99]);
 wire(150,70,190,70,RED);wire(190,70,190,80,RED);
 sym('contact-nc','KM1',190,80,[P('71',190,80,'CONTACTOR_TERMICO:71'),P('72',190,98,'CONTACTOR_TERMICO:72')],[176,79,198,99]);
 wire(190,98,190,112,RED);
 sym('lamp','P2',190,112,[P('X1',190,112,'BOTONERAS:PILOTO_2'),P('X2',190,130)],[174,111,199,131]);
 wire(190,130,190,200,BLUE,{internal:true});
 // S2:2 → marcha S1 ∥ retención KM1
 wire(150,98,150,108,RED);dot(150,108);wire(150,108,210,108,RED);dot(210,108);wire(210,108,210,118,RED);wire(210,108,250,108,RED);wire(250,108,250,118,RED);
 sym('push-no','S1',210,118,[P('3',210,118,'BOTONERAS:S1:3'),P('4',210,136,'BOTONERAS:S1:4')],[186,117,218,137]);
 sym('contact-no','KM1',250,118,[P('13',250,118,'CONTACTOR_TERMICO:13'),P('14',250,136,'CONTACTOR_TERMICO:14')],[236,117,258,137]);
 wire(210,136,210,146,RED);wire(210,146,230,146,RED);wire(250,136,250,146,RED);wire(250,146,230,146,RED);dot(230,146);wire(250,146,290,146,RED);dot(250,146);
 // bobina KM1 y lámpara P1
 wire(230,146,230,158,RED);
 sym('coil','KM1',230,158,[P('A1',230,158,'CONTACTOR_TERMICO:A1'),P('A2',230,176,'CONTACTOR_TERMICO:A2')],[214,157,238,177]);
 wire(290,146,290,158,RED);
 sym('lamp','P1',290,158,[P('X1',290,158,'BOTONERAS:PILOTO_1'),P('X2',290,176)],[274,157,299,177]);
 wire(230,176,230,200,BLUE);wire(290,176,290,200,BLUE,{internal:true});
 // aviso de térmico disparado (P3)
 wire(163.5,58,163.5,64,RED);wire(163.5,64,350,64,RED);wire(350,64,350,70,RED);
 sym('lamp','P3',350,70,[P('X1',350,70,'BOTONERAS:PILOTO_3'),P('X2',350,88)],[334,69,359,89]);
 wire(350,88,350,200,BLUE,{internal:true});
 // Neutro
 wire(320,26,320,200,BLUE);dot(320,200);
 sym('terminal-diamond','BOT',172,200,[P('N',172,200,'BOTONERAS:N')],[169,197,175,203],{pins:['N'],ref:true});
 wire(172,200,190,200,BLUE);wire(190,200,230,200,BLUE);wire(230,200,290,200,BLUE);wire(290,200,320,200,BLUE);wire(320,200,350,200,BLUE,{internal:true});
 [190,230,290,350].forEach(x=>dot(x,200));
},{all:{x:34,y:10,w:340,h:214},power:{x:34,y:14,w:112,h:176},control:{x:142,y:14,w:238,h:204}},140);

/* ───────── Inversión de giro con enclavamiento (KM1 directo, KM2 inverso) ───────── */
const inversion=sheet('Inversión de giro con enclavamiento',k=>{
 const {wire,dot,poly,sym,P}=k,K1=[63,72,81],K2=[120,129,138];
 // Fuerza: R, S, T → KM1 y KM2 en paralelo
 sym('terminal-round','-X',63,24,[P('R',63,26,'FUENTE:R'),P('S',72,26,'FUENTE:S'),P('T',81,26,'FUENTE:T'),P('PE',90,26,'FUENTE:TP')],[54,18,94,27],{pins:['R','S','T','PE']});
 sym('contactor3','KM1',63,60,[...K1.map((x,i)=>P(['1','3','5'][i],x,60,`CONTACTOR_TERMICO:L${i+1}`)),...K1.map((x,i)=>P(['2','4','6'][i],x,78))],[52,59,86,79]);
 sym('contactor3','KM2',120,60,[...K2.map((x,i)=>P(['1','3','5'][i],x,60,`CONTACTOR_TRIFASICO:L${i+1}`)),...K2.map((x,i)=>P(['2','4','6'][i],x,78,`CONTACTOR_TRIFASICO:T${i+1}`))],[109,59,143,79]);
 [[63,40],[72,46],[81,52]].forEach(([x,y],i)=>{wire(x,26,x,y,POWER);wire(x,y,x,60,POWER);dot(x,y);wire(x,y,K2[i],y,POWER);wire(K2[i],y,K2[i],60,POWER)});
 sym('thermal3','F1',63,100,[...K1.map((x,i)=>P(['1','3','5'][i],x,100)),...K1.map((x,i)=>P(['2','4','6'][i],x,109,`CONTACTOR_TERMICO:T${i+1}`))],[50,97,88,112]);
 K1.forEach(x=>wire(x,78,x,100,POWER,{internal:true}));
 sym('motor','M1',72,160,[P('U1',63,152,'BORNERA_MOTOR:U1'),P('V1',72,148,'BORNERA_MOTOR:V1'),P('W1',81,152,'BORNERA_MOTOR:W1'),P('W2',63,168,'BORNERA_MOTOR:W2'),P('U2',72,172,'BORNERA_MOTOR:U2'),P('V2',81,168,'BORNERA_MOTOR:V2'),P('PE',84,160,'BORNERA_MOTOR:TP')],[56,144,92,176]);
 // Del térmico al motor, con las salidas de KM2 cruzadas (T1→W1, T3→U1, T2→V1)
 wire(63,109,63,126,POWER);wire(63,126,63,152,POWER);dot(63,126);
 wire(72,109,72,132,POWER);wire(72,132,72,148,POWER);dot(72,132);
 wire(81,109,81,120,POWER);wire(81,120,81,152,POWER);dot(81,120);
 wire(120,78,120,120,POWER);wire(120,120,81,120,POWER);
 wire(129,78,129,132,POWER);wire(129,132,72,132,POWER);
 wire(138,78,138,126,POWER);wire(138,126,63,126,POWER);
 star(k,72,168);
 // Tierras
 wire(90,26,160,26,EARTH,{dashed:true});wire(160,26,160,50,EARTH,{dashed:true});wire(160,50,160,70,EARTH,{dashed:true});wire(160,70,160,90,EARTH,{dashed:true});wire(160,90,160,110,EARTH,{dashed:true});wire(160,110,160,160,EARTH,{dashed:true});wire(160,160,84,160,EARTH,{dashed:true});
 earthTap(k,160,50,'BOT','BOTONERAS:TP_DER');earthTap(k,160,70,'KM1','CONTACTOR_TERMICO:TP_DER');earthTap(k,160,90,'KM2 izq','CONTACTOR_TRIFASICO:TP_IZQ');earthTap(k,160,110,'KM2 der','CONTACTOR_TRIFASICO:TP_DER');
 // Mando: F → térmico → paro
 const RAIL=235;
 sym('terminal-diamond','-X',230,24,[P('F',230,26,'FUENTE:F')],[227,21,233,29],{pins:['F']});
 sym('terminal-diamond','',555,24,[P('N',555,26,'FUENTE:N')],[552,21,558,29],{pins:['N']});
 sym('f1aux','F1',230,40,[P('95',230,40,'CONTACTOR_TERMICO:95'),P('96',230,58,'CONTACTOR_TERMICO:96'),P('97',243.5,40,'CONTACTOR_TERMICO:97'),P('98',243.5,58,'CONTACTOR_TERMICO:98')],[212,39,252,59]);
 wire(230,26,230,32,RED);wire(230,32,230,40,RED);wire(230,32,243.5,32,RED);wire(243.5,32,243.5,40,RED);dot(230,32);
 wire(230,58,230,70,RED);dot(230,70);wire(230,70,230,80,RED);
 sym('push-nc','S2',230,80,[P('1',230,80,'BOTONERAS:S2:1'),P('2',230,98,'BOTONERAS:S2:2')],[206,79,238,99]);
 // 96 → cadena de avisos de reposo: KM1 81-82 → KM2 81-82 → P2
 wire(230,70,470,70,RED);wire(470,70,470,80,RED);
 sym('contact-nc','KM1',470,80,[P('81',470,80,'CONTACTOR_TERMICO:81'),P('82',470,98,'CONTACTOR_TERMICO:82')],[456,79,478,99]);
 wire(470,98,470,108,RED);
 sym('contact-nc','KM2',470,108,[P('81',470,108,'CONTACTOR_TRIFASICO:81'),P('82',470,126,'CONTACTOR_TRIFASICO:82')],[456,107,478,127]);
 wire(470,126,470,136,RED);
 sym('lamp','P2',470,136,[P('X1',470,136,'BOTONERAS:PILOTO_2'),P('X2',470,154)],[454,135,479,155]);
 wire(470,154,470,RAIL,BLUE,{internal:true});
 // aviso de térmico disparado (P3)
 wire(243.5,58,243.5,64,RED);wire(243.5,64,520,64,RED);wire(520,64,520,70,RED);
 sym('lamp','P3',520,70,[P('X1',520,70,'BOTONERAS:PILOTO_3'),P('X2',520,88)],[504,69,529,89]);
 wire(520,88,520,RAIL,BLUE,{internal:true});
 // S2:2 → marchas con retención y enclavamiento
 wire(230,98,230,108,RED);dot(230,108);
 wire(230,108,265,108,RED);wire(265,108,295,108,RED);wire(295,108,375,108,RED);wire(375,108,405,108,RED);
 [265,295,375,405].forEach(x=>{dot(x,108);wire(x,108,x,118,RED)});
 // Marcha 1 (S1, retención KM1 13-14) → enclavamiento KM2 71-72 → bobina KM1 + P1
 sym('push-no','S1',265,118,[P('3',265,118,'BOTONERAS:S1:3'),P('4',265,136,'BOTONERAS:S1:4')],[241,117,273,137]);
 sym('contact-no','KM1',295,118,[P('13',295,118,'CONTACTOR_TERMICO:13'),P('14',295,136,'CONTACTOR_TERMICO:14')],[281,117,303,137]);
 wire(265,136,265,146,RED);wire(265,146,280,146,RED);wire(295,136,295,146,RED);wire(295,146,280,146,RED);dot(280,146);
 wire(280,146,280,156,RED);
 sym('contact-nc','KM2',280,156,[P('71',280,156,'CONTACTOR_TRIFASICO:71'),P('72',280,174,'CONTACTOR_TRIFASICO:72')],[266,155,288,175]);
 wire(280,174,280,184,RED);dot(280,184);wire(280,184,280,194,RED);wire(280,184,310,184,RED);wire(310,184,310,194,RED);
 sym('coil','KM1',280,194,[P('A1',280,194,'CONTACTOR_TERMICO:A1'),P('A2',280,212,'CONTACTOR_TERMICO:A2')],[264,193,288,213]);
 sym('lamp','P1',310,194,[P('X1',310,194,'BOTONERAS:PILOTO_1'),P('X2',310,212)],[294,193,319,213]);
 wire(280,212,280,RAIL,BLUE);wire(310,212,310,RAIL,BLUE,{internal:true});
 // Marcha 2 (S3, retención KM2 13-14) → enclavamiento KM1 71-72 → bobina KM2 + P4
 sym('push-no','S3',375,118,[P('3',375,118,'BOTONERAS:S3:3'),P('4',375,136,'BOTONERAS:S3:4')],[351,117,383,137]);
 sym('contact-no','KM2',405,118,[P('13',405,118,'CONTACTOR_TRIFASICO:13'),P('14',405,136,'CONTACTOR_TRIFASICO:14')],[391,117,413,137]);
 wire(375,136,375,146,RED);wire(375,146,390,146,RED);wire(405,136,405,146,RED);wire(405,146,390,146,RED);dot(390,146);
 wire(390,146,390,156,RED);
 sym('contact-nc','KM1',390,156,[P('71',390,156,'CONTACTOR_TERMICO:71'),P('72',390,174,'CONTACTOR_TERMICO:72')],[376,155,398,175]);
 wire(390,174,390,184,RED);dot(390,184);wire(390,184,390,194,RED);wire(390,184,420,184,RED);wire(420,184,420,194,RED);
 sym('coil','KM2',390,194,[P('A1',390,194,'CONTACTOR_TRIFASICO:A1'),P('A2',390,212,'CONTACTOR_TRIFASICO:A2')],[374,193,398,213]);
 sym('lamp','P4',420,194,[P('X1',420,194,'BOTONERAS:PILOTO_4'),P('X2',420,212)],[404,193,429,213]);
 wire(390,212,390,RAIL,BLUE);wire(420,212,420,RAIL,BLUE,{internal:true});
 // Neutro
 wire(555,26,555,RAIL,BLUE);
 sym('terminal-diamond','BOT',250,RAIL,[P('N',250,RAIL,'BOTONERAS:N')],[247,RAIL-3,253,RAIL+3],{pins:['N'],ref:true});
 const rail=[250,280,310,390,420,470,520,555];
 for(let i=1;i<rail.length;i++)wire(rail[i-1],RAIL,rail[i],RAIL,BLUE);
 rail.slice(1).forEach(x=>dot(x,RAIL));
},{all:{x:34,y:10,w:545,h:248},power:{x:34,y:14,w:150,h:176},control:{x:196,y:14,w:388,h:240}},195);

writeFileSync('src/data/cadeLecciones.json',JSON.stringify({simple,inversion},null,1));
const count=d=>`${d.objects.filter(o=>o.type===9100).length} símbolos, ${d.objects.filter(o=>o.type===4000).length} conductores`;
console.log(`Marcha y paro: ${count(simple)} · Inversión de giro: ${count(inversion)}`);
