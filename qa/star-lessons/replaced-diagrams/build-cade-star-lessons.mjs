// Esquemas exclusivos de los dos archivos aportados. No reutiliza el ejemplo virtual antiguo.
import {writeFileSync} from 'node:fs';
import sources from '../src/data/starDeltaSources.json' with {type:'json'};
const F='FUENTE:',B='BOTONERAS:',K1='CONTACTOR_TERMICO:',K2='CONTACTOR_TRIFASICO:',K3='CONTACTOR_TRIFASICO_3:',KT='TEMPORIZADOR_1:',M='BORNERA_MOTOR:';
function build(key){
 const timed=key==='estrellaTimer',source=sources[key],ks=timed?K2:K3,kd=timed?K3:K2;
 const objects=[];let id=1;
 const wire=(x,y,x2,y2,color='#a64a4a',extra={})=>{if(x!==x2||y!==y2)objects.push({id:id++,type:4000,reference:'',labels:[],x,y,x2,y2,color,...extra})};
 const path=(points,color,extra)=>points.slice(1).forEach((p,i)=>wire(...points[i],...p,color,extra));
 const dot=(x,y)=>objects.push({id:id++,type:4001,reference:'',labels:[],x,y,x2:x,y2:y});
 const port=(terminal,x,y,panel)=>({terminal,x,y,...(panel?{panel}:{})});
 const sym=(shape,reference,x,y,ports,extra={})=>objects.push({id:id++,type:9100,shape,reference,x,y,x2:0,y2:0,ports,labels:ports.map(p=>p.terminal),box:[x-25,y-5,x+30,y+25],...extra});
 const terminal=(x,y,label,panel)=>sym('terminal-diamond','',x,y,[port(label,x,y,panel)],{pins:[label]});
 const contact=(shape,ref,x,y,a,b,module)=>sym(shape,ref,x,y,[port(a,x,y,module+a),port(b,x,y+18,module+b)]);
 const coil=(ref,x,module)=>contact('coil',ref,x,230,'A1','A2',module);
 const lamp=(ref,x,y,panel)=>sym('lamp',ref,x,y,[port('X1',x,y,panel),port('X2',x,y+18)]);
 const power='#2f343a',blue='#3d6fae',earth='#2a8a62';
 // Fuerza: KM1 a U1/V1/W1; el contactor delta toma las mismas fases de entrada.
 sym('terminal-round','Fuente',63,24,[0,1,2].map((i)=>port(['R','S','T'][i],63+i*9,26,F+['R','S','T'][i])),{pins:['R','S','T']});
 const poles=(ref,x,y,module)=>sym('contactor3',ref,x,y,[...[0,1,2].map(i=>port(`L${i+1}`,x+i*9,y,module+`L${i+1}`)),...[0,1,2].map(i=>port(`T${i+1}`,x+i*9,y+18,module+`T${i+1}`))]);
 poles('KM1',63,60,K1);poles(source.delta,120,60,kd);poles(source.star,184,200,ks);
 [0,1,2].forEach(i=>{const x=63+i*9,y=40+i*6;path([[x,26],[x,y],[x,60]],power);path([[x,y],[120+i*9,y],[120+i*9,60]],power);dot(x,y)});
 sym('motor','M1',72,150,[port('U1',63,142,M+'U1'),port('V1',72,138,M+'V1'),port('W1',81,142,M+'W1'),port('W2',63,158,M+'W2'),port('U2',72,162,M+'U2'),port('V2',81,158,M+'V2')]);
 [0,1,2].forEach(i=>wire(63+i*9,78,63+i*9,i===1?138:142,power));
 [0,1,2].forEach(i=>{const mx=63+i*9,y=180+i*4,sx=202-i*9;path([[120+i*9,78],[120+i*9,y],[mx,y],[mx,i===1?162:158]],power);path([[sx,218],[sx,230+i*8],[mx,230+i*8],[mx,y]],power);dot(mx,y)});
 path([[184,200],[184,190],[193,190],[202,190],[202,200]],power);wire(193,190,193,200,power);dot(193,190);
 // Mando común, paro y retención de KM1.
 terminal(230,26,'F',F+'F');terminal(800,26,'N',F+'N');
 sym('f1aux','F1',230,40,[port('95',230,40,K1+'95'),port('96',230,58,K1+'96'),port('97',243.5,40,K1+'97'),port('98',243.5,58,K1+'98')]);
 path([[230,26],[230,32],[230,40]]);path([[230,32],[243.5,32],[243.5,40]]);dot(230,32);
 wire(230,58,230,80);contact('push-nc','S2',230,80,'1','2',B+'S2:');
 path([[230,98],[230,108],[280,108],[320,108],...(!timed?[[500,108]]:[])]);[280,320].forEach(x=>{wire(x,108,x,118);dot(x,108)});
 contact('push-no','S1',280,118,'3','4',B+'S1:');contact('contact-no','KM1',320,118,'13','14',K1);
 path([[280,136],[280,146],[320,146]]);wire(320,136,320,146);wire(280,146,280,230);dot(280,146);dot(320,146);coil('KM1',280,K1);
 if(timed){
  // Archivo (3): KM2 estrella por 55–56; KM3 triángulo por 67–68.
  path([[320,146],[400,146],[530,146],[650,146]]);[400,530,650].forEach(x=>dot(x,146));
  wire(400,146,400,164);contact('contact-nc','KT1 · retardo',400,164,'55','56',KT);wire(400,182,400,194);
  wire(530,146,530,164);contact('contact-no','KT1 · retardo',530,164,'67','68',KT);wire(530,182,530,194);
  wire(650,146,650,230);coil('KT1',650,KT);
  wire(320,146,320,230);lamp('P1',320,230,B+'PILOTO_1');
 }else{
  // Archivo (2): S3 abre estrella y ordena triángulo, retenido por KM2.
  path([[320,146],[400,146],[560,146]]);dot(400,146);wire(400,146,400,164);contact('push-nc','S3',400,164,'1','2',B+'S3:');wire(400,182,400,194);
  wire(500,108,500,118);contact('push-no','S3',500,118,'3','4',B+'S3:');path([[500,136],[500,182],[530,182],[560,182]]);wire(530,182,530,194);dot(530,182);
  wire(560,146,560,164);contact('contact-no','KM2',560,164,'13','14',K2);
 }
 contact('contact-nc',source.delta,400,194,'71','72',kd);wire(400,212,400,230);coil(source.star,400,ks);
 contact('contact-nc',source.star,530,194,'71','72',ks);wire(530,212,530,230);coil(source.delta,530,kd);
 const returns=[280,400,530];
 if(timed){returns.push(320,650)}else{
  path([[400,220],[450,220],[450,230]]);dot(400,220);lamp('P1',450,230,B+'PILOTO_1');returns.push(450);
  path([[530,220],[600,220],[600,230]]);dot(530,220);lamp('P4',600,230,B+'PILOTO_4');returns.push(600);
 }
 returns.forEach(x=>wire(x,248,x,310,blue,{internal:(!timed&&[450,600].includes(x))||(timed&&x===320)}));
 // Señalización: el archivo manual tiene un NC; el temporizado, tres NC en serie.
 const restX=690;
 path([[230,32],[restX,32],[restX,80]]);
 contact('contact-nc','KM1',restX,80,timed?'81':'71',timed?'82':'72',K1);
 let restBottom=98;
 if(timed){wire(restX,98,restX,108);contact('contact-nc','KM2',restX,108,'81','82',K2);wire(restX,126,restX,136);contact('contact-nc','KM3',restX,136,'81','82',K3);restBottom=154}
 wire(restX,restBottom,restX,restBottom+12);lamp('P2',restX,restBottom+12,B+'PILOTO_2');wire(restX,restBottom+30,restX,310,blue,{internal:true});
 path([[243.5,58],[243.5,64],[750,64],[750,80]]);lamp('P3',750,80,B+'PILOTO_3');wire(750,98,750,310,blue,{internal:true});
 terminal(250,310,'N · BOT',B+'N');wire(250,310,800,310,blue);wire(800,26,800,310,blue);[...returns,690,750,800].forEach(x=>dot(x,310));
 // Solo el archivo (2) incluye conductores TP. Se muestran todos, sin añadirlos al (3).
 if(!timed){
  const taps=[[F+'TP',44],[B+'TP_IZQ',76],[K1+'TP_DER',108],[K2+'TP_IZQ',140],[K2+'TP_DER',172],[M+'TP',204],[K3+'TP_IZQ',236]];
  taps.forEach(([panel,x],i)=>{terminal(x,340,'TP',panel);if(i&&i!==4)wire(taps[i-1][1],340,x,340,earth,{dashed:true})});
 }
 return {name:source.title,source:`Cableado del archivo ${source.source}; funciones según el modelo virtual.`,origin:'lesson',splitX:215,objects,views:{all:{x:20,y:10,w:810,h:timed?318:344},power:{x:20,y:14,w:195,h:timed?280:340},control:{x:215,y:14,w:615,h:310}}};
}
writeFileSync('src/data/cadeStarLessons.json',JSON.stringify(Object.fromEntries(Object.keys(sources).map(k=>[k,build(k)])),null,1)+'\n');
console.log('Esquemas estrella-triángulo: manual y temporizado generados.');
