/* Genera src/data/cadeEstrellaTemporizador.json: el dibujo «CAMBIO DELTA, ESTRELLA» con el mando de la variante con temporizador (KT1).
 * Se conservan tal cual la potencia y la cabecera de mando; el resto se redibuja con los mismos símbolos y medidas. */
const fs=require('fs'),path=require('path');
const src=require('../src/data/cadeEstrellaTriangulo.json');
const PHASE='#a64a4a',NEUT='#3d6fae';
let id=200;const nid=()=>id++;
const keep=src.objects.filter(o=>o.id<=50||[51,52,53,54,55,56,57,63,70,71,72,77,78,79,80,81,85,86,87,88,89,90,91,92,93,94,95,96,97].includes(o.id)).map(o=>({...o}));
/* En esta variante KM2 es la estrella y KM3 el triángulo (en el dibujo de partida era al revés). */
for(const o of keep){if(o.id===6)o.reference='KM3';if(o.id===7)o.reference='KM2'}
const objs=[...keep];
const wire=(x,y,x2,y2,color=PHASE)=>objs.push({id:nid(),type:4000,reference:'',labels:[],x,y,x2,y2,color});
const junc=(x,y)=>objs.push({id:nid(),type:4001,reference:'',labels:[],x,y,x2:x,y2:y});
const sym=(shape,reference,labels,x,y,ports,box,extra={})=>{const o={id:nid(),type:9100,shape,reference,labels,x,y,x2:0,y2:0,ports:ports.map(([terminal,px,py])=>({terminal,x:px,y:py})),box,...extra};objs.push(o);return o.id};
const two=(shape,ref,labels,x,y,h=18,box)=>sym(shape,ref,labels,x,y,[[labels[0],x,y],[labels[1],x,y+h]],box??[x-14,y-1,x+8,y+h+1]);
/* Alimentación y cabecera de mando (como en el original, con la lámpara de aviso de térmico más a la derecha). */
wire(339,75,250,75);wire(352.5,99,490,99);wire(490,99,490,166);wire(490,184,490,249);
/* Reposo (P2): contactos 81-82 de KM1, KM2 y KM3 en serie con la lámpara. */
two('contact-nc','KM1',['81','82'],250,90);wire(250,75,250,90);wire(250,108,250,118);
two('contact-nc','KM2',['81','82'],250,118);wire(250,136,250,146);
two('contact-nc','KM3',['81','82'],250,146);wire(250,164,250,174);
const lamp=(ref,x,y)=>sym('lamp',ref,['X1','X2'],x,y,[['X1',x,y],['X2',x,y+18]],[x-16,y-1,x+9,y+19]);
lamp('H2',250,174);wire(250,192,250,249);
/* Bobina de KM1 con su lámpara de marcha (P1) en paralelo. */
junc(305,186);wire(305,186,272,186);wire(272,186,272,190);lamp('H1',272,190);wire(272,208,272,249);
/* Aviso de térmico disparado (P3). */
lamp('H3',490,166);
/* Barra de marcha y sus tres ramas. */
wire(305,165,440,165);
/* KT1: temporizador a la conexión. */
junc(345,165);wire(345,165,345,198);
sym('coil-timer','KT1',['A1','A2'],345,198,[['A1',345,198],['A2',345,216]],[325,197,357,217]);wire(345,216,345,249);
/* Rama de estrella: KT1 55-56 → NC 71-72 del triángulo (KM3) → bobina de la estrella (KM2). */
junc(390,165);wire(390,165,390,174);
two('contact-nc-timed','KT1',['55','56'],390,174,18,[364,173,398,193]);wire(390,192,390,201);
two('contact-nc','KM3',['71','72'],390,201);wire(390,219,390,222);
sym('coil','KM2',['A1','A2'],390,222,[['A1',390,222],['A2',390,240]],[374,221,398,241]);wire(390,240,390,249);
/* Rama de triángulo: KT1 67-68 → NC 71-72 de la estrella (KM2) → bobina del triángulo (KM3). */
junc(440,165);wire(440,165,440,174);
two('contact-no-timed','KT1',['67','68'],440,174,18,[414,173,448,193]);wire(440,192,440,201);
two('contact-nc','KM2',['71','72'],440,201);wire(440,219,440,222);
sym('coil','KM3',['A1','A2'],440,222,[['A1',440,222],['A2',440,240]],[424,221,448,241]);wire(440,240,440,249);
/* Neutro y retorno común. */
wire(351,26,351,36,NEUT);wire(351,36,510,36,NEUT);wire(510,36,510,249,NEUT);wire(250,249,510,249,NEUT);
for(const x of [250,272,305,345,390,440,490])junc(x,249);
const out={...src,name:'ESTRELLA-TRIÁNGULO CON TEMPORIZADOR',source:'Redibujado al estilo de CADe_SIMU a partir del montaje con temporizador (KT1) y del dibujo «CAMBIO DELTA, ESTRELLA»; no es una copia de un archivo .cad',origin:'lesson',views:{...src.views,control:{x:238,y:8,w:285,h:250}},objects:objs};
fs.writeFileSync(path.join(__dirname,'../src/data/cadeEstrellaTemporizador.json'),JSON.stringify(out));
console.log('objetos',objs.length);
