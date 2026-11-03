// Genera src/data/cadeEstrellaTriangulo.json: transcripción fiel de la foto «CAMBIO DELTA, ESTRELLA.cad» (CADe_SIMU).
// Coordenadas en unidades de CADe medidas sobre la foto rectificada (ver qa/estrella-triangulo/LEEME.md).
// Uso: node scripts/build-estrella-triangulo.mjs
import {writeFileSync,mkdirSync} from 'node:fs';
const objects=[];let nextId=1;
const id=()=>nextId++;
const POWER='#2f343a',RED='#a64a4a',BLUE='#3d6fae';
const wire=(x,y,x2,y2,color,extra={})=>objects.push({id:id(),type:4000,reference:'',labels:[],x,y,x2,y2,color,...extra});
const dot=(x,y)=>objects.push({id:id(),type:4001,reference:'',labels:[],x,y,x2:x,y2:y});
const poly=(color,pts,extra={})=>{for(let i=1;i<pts.length;i++)wire(pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1],color,extra)};
const sym=(shape,reference,x,y,ports,box,extra={})=>objects.push({id:id(),type:9100,shape,reference,labels:ports.map(p=>p.terminal),x,y,x2:0,y2:0,ports,box,...extra});
const P=(terminal,x,y)=>({terminal,x,y});

/* ───────── Potencia ───────── */
const PX=[63,72,81];                       // columnas de los polos
sym('terminal-round','-X',63,24,[P('L1',63,26),P('L2',72,26),P('L3',81,26),P('PE',90,26)],[54,18,94,27],{pins:['L1','L2','L3','PE']});
sym('breaker3','Q1',63,45,[...PX.map((x,i)=>P(['1','3','5'][i],x,45)),...PX.map((x,i)=>P(['2','4','6'][i],x,69))],[44,43,88,71]);
sym('contactor3','KM1',63,96,[...PX.map((x,i)=>P(['1','3','5'][i],x,96)),...PX.map((x,i)=>P(['2','4','6'][i],x,114))],[52,95,86,115]);
sym('thermal3','F1',63,137,[...PX.map((x,i)=>P(['1','3','5'][i],x,137)),...PX.map((x,i)=>P(['2','4','6'][i],x,146))],[50,134,88,149]);
sym('motor','M1',72,184,[P('U1',63,176),P('V1',72,172),P('W1',81,176),P('W2',63,192),P('U2',72,196),P('V2',81,192),P('PE',84,184)],[56,168,92,200]);
const KM2=[117,126,135],KM3=[165,174,183];
sym('contactor3','KM2',117,111,[...KM2.map((x,i)=>P(['1','3','5'][i],x,111)),...KM2.map((x,i)=>P(['2','4','6'][i],x,129))],[105,110,140,130],{pitch:9});
sym('contactor3','KM3',165,111,[...KM3.map((x,i)=>P(['1','3','5'][i],x,111)),...KM3.map((x,i)=>P(['2','4','6'][i],x,129))],[153,110,188,130],{pitch:9});
// Alimentación → Q1
PX.forEach(x=>wire(x,26,x,45,POWER));
wire(90,26,90,184,POWER,{dashed:true});wire(90,184,84,184,POWER);
// Q1 → KM1 → F1 → motor
PX.forEach(x=>{wire(x,69,x,96,POWER);wire(x,114,x,137,POWER)});
wire(63,146,63,176,POWER);wire(72,146,72,172,POWER);wire(81,146,81,176,POWER);
// Derivaciones de Q1 hacia KM2 (triángulo)
dot(63,78);dot(72,87);dot(81,90);
poly(POWER,[[63,78],[117,78],[117,111]]);poly(POWER,[[72,87],[126,87],[126,111]]);poly(POWER,[[81,90],[135,90],[135,111]]);
// KM3: puente de la estrella
KM3.forEach(x=>wire(x,111,x,104,POWER));wire(165,104,183,104,POWER);dot(174,104);
// KM2 y KM3 → bornes del motor (W2/U2/V2) por tres buses anidados
wire(81,192,81,201,POWER);wire(81,201,165,201,POWER);
wire(72,196,72,207,POWER);wire(72,207,174,207,POWER);
wire(63,192,63,213,POWER);wire(63,213,183,213,POWER);
wire(117,129,117,213,POWER);wire(126,129,126,207,POWER);wire(135,129,135,201,POWER);
wire(165,129,165,201,POWER);wire(174,129,174,207,POWER);wire(183,129,183,213,POWER);
dot(117,213);dot(126,207);dot(135,201);

/* ───────── Mando ───────── */
const XL=339,XN=351,XLEFT=265,XSB=305,XKM1=331,XS_NC=331,XS_NO=344,XF1NO=352.5,XBUS=391,XH2=352,XH3=417,XH4=440,XNR=456;
const RAIL=249;
sym('terminal-diamond','-X',XL,24,[P('L',XL,26)],[XL-9,18,XL+3,28],{pins:['L'],ref:true});
sym('terminal-diamond','',XN,24,[P('N',XN,26)],[XN-3,18,XN+3,28],{pins:['N']});
sym('breaker1','-Q',XL,42,[P('1',XL,42),P('2',XL,67.5)],[XL-24,41,XL+8,69]);
sym('f1aux','F1',XL,81,[P('95',XL,81),P('96',XL,99),P('97',XF1NO,81),P('98',XF1NO,99)],[XL-18,80,XF1NO+8,100]);
sym('push-nc','SB1',XSB,105,[P('11',XSB,105),P('12',XSB,123)],[XSB-24,104,XSB+8,124]);
sym('push-no','SB2',XSB,135,[P('13',XSB,135),P('14',XSB,153)],[XSB-24,134,XSB+8,154]);
sym('contact-no','KM1',XKM1,135,[P('13',XKM1,135),P('14',XKM1,153)],[XKM1-14,134,XKM1+8,154]);
sym('double-push','-S',XS_NC,174,[P('11',XS_NC,174),P('12',XS_NC,192),P('13',XS_NO,174),P('14',XS_NO,192)],[XS_NC-24,173,XS_NO+8,193]);
sym('contact-nc','KM2',XS_NC,201,[P('11',XS_NC,201),P('12',XS_NC,219)],[XS_NC-14,200,XS_NC+8,220]);
sym('contact-no','KM2',XBUS,171,[P('13',XBUS,171),P('14',XBUS,189)],[XBUS-14,170,XBUS+8,190]);
sym('contact-nc','KM3',XBUS,201,[P('11',XBUS,201),P('12',XBUS,219)],[XBUS-14,200,XBUS+8,220]);
sym('contact-nc','KM1',XLEFT,129,[P('11',XLEFT,129),P('12',XLEFT,147)],[XLEFT-14,128,XLEFT+8,148]);
sym('coil','KM1',XSB,198,[P('A1',XSB,198),P('A2',XSB,216)],[XSB-16,197,XSB+8,217]);
sym('coil','KM3',XKM1,222,[P('A1',XKM1,222),P('A2',XKM1,240)],[XKM1-16,221,XKM1+8,241]);
sym('coil','KM2',XBUS,222,[P('A1',XBUS,222),P('A2',XBUS,240)],[XBUS-16,221,XBUS+8,241]);
sym('lamp','H1',XLEFT,162,[P('X1',XLEFT,162),P('X2',XLEFT,180)],[XLEFT-16,161,XLEFT+9,181]);
sym('lamp','H2',XH2,224,[P('X1',XH2,224),P('X2',XH2,242)],[XH2-16,223,XH2+9,243]);
sym('lamp','H3',XH3,224,[P('X1',XH3,224),P('X2',XH3,242)],[XH3-16,223,XH3+9,243]);
sym('lamp','H4',XH4,166,[P('X1',XH4,166),P('X2',XH4,184)],[XH4-16,165,XH4+9,185]);
// Fase (L) hasta Q, nudo N1 y rama izquierda hacia H1
wire(XL,26,XL,42,RED);wire(XL,67.5,XL,75,RED);dot(XL,75);
poly(RED,[[XL,75],[XLEFT,75],[XLEFT,129]]);
wire(XLEFT,147,XLEFT,162,RED);wire(XLEFT,180,XLEFT,RAIL,BLUE);
// F1: NC (95-96) en serie con el control; NO (97-98) alimenta H4
wire(XL,75,XL,81,RED);poly(RED,[[XL,75],[XF1NO,75],[XF1NO,81]]);
poly(RED,[[XL,99],[XSB,99],[XSB,105]]);poly(RED,[[XF1NO,99],[XH4,99],[XH4,166]]);wire(XH4,184,XH4,RAIL,BLUE);
// SB1 → nodo N2 → SB2 ∥ KM1(13-14) → nodo N3 → N4
wire(XSB,123,XSB,129,RED);dot(XSB,129);wire(XSB,129,XSB,135,RED);wire(XSB,153,XSB,156,RED);dot(XSB,156);
poly(RED,[[XSB,129],[XKM1,129],[XKM1,135]]);poly(RED,[[XKM1,153],[XKM1,156],[XSB,156]]);
wire(XSB,156,XSB,165,RED);dot(XSB,165);wire(XSB,165,XSB,198,RED);wire(XSB,216,XSB,RAIL,BLUE);
// Barra de mando: -S (11 y 13) y -KM2 (13)
wire(XSB,165,XBUS,165,RED);wire(XS_NC,165,XS_NC,174,RED);wire(XS_NO,165,XS_NO,174,RED);wire(XBUS,165,XBUS,171,RED);
// -S:12 → -KM2(11-12) → bobina KM3 (+H2)
wire(XS_NC,192,XS_NC,201,RED);wire(XS_NC,219,XS_NC,222,RED);wire(XS_NC,240,XS_NC,RAIL,BLUE);
poly(RED,[[XS_NC,222],[XH2,222],[XH2,224]]);wire(XH2,242,XH2,RAIL,BLUE);
// -S:14 y -KM2(13-14) → nudo → -KM3(11-12) → bobina KM2 (+H3)
poly(RED,[[XS_NO,192],[XBUS,192]]);dot(XBUS,192);wire(XBUS,189,XBUS,192,RED);wire(XBUS,192,XBUS,201,RED);wire(XBUS,219,XBUS,222,RED);wire(XBUS,240,XBUS,RAIL,BLUE);
poly(RED,[[XBUS,222],[XH3,222],[XH3,224]]);wire(XH3,242,XH3,RAIL,BLUE);
// Neutro: borne N → derecha → bajada → carril inferior
poly(BLUE,[[XN,26],[XN,36],[XNR,36],[XNR,RAIL]]);wire(XLEFT,RAIL,XNR,RAIL,BLUE);
[XSB,XKM1,XH2,XBUS,XH3,XH4].forEach(x=>dot(x,RAIL));

const drawing={
 name:'CAMBIO DELTA, ESTRELLA',source:'Transcripción de una fotografía de CADe_SIMU · «CAMBIO DELTA, ESTRELLA.cad» · salidas del contactor de triángulo corregidas según la figura Nº2 de la guía (2→W2, 4→U2, 6→V2)',origin:'photo',
 frame:{left:30,top:12,right:539,bottom:270,header:5,band:4,columns:{first:31,width:63.5,letters:'ABCDEFGH'},rows:{first:18,height:60,count:4}},
 views:{all:{x:20,y:6,w:535,h:272},power:{x:26,y:8,w:190,h:222},control:{x:252,y:8,w:216,h:250}},splitX:225,
 objects
};
mkdirSync('src/data',{recursive:true});
writeFileSync('src/data/cadeEstrellaTriangulo.json',JSON.stringify(drawing,null,1));
console.log(`Estrella-triángulo: ${objects.filter(o=>o.type===9100).length} símbolos, ${objects.filter(o=>o.type===4000).length} conductores, ${objects.filter(o=>o.type===4001).length} puntos`);
