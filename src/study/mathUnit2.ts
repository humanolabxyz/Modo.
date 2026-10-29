import {decimal} from './academicModels';
export type Unit2TopicId='exp'|'bacteria'|'elimination'|'logs'|'followers';
export type Unit2Question={id:string;prompt:string;value?:number;tolerance?:number;unit?:string;options?:string[];correct?:number;hint:string;explanation:string};
export type Unit2Topic={id:Unit2TopicId;title:string;source:string;pages:string;lead:string;formula:string;ideas:[string,string][];example:[string,string][];remember:string;questions:Unit2Question[];commands?:string[]};
const n=(id:string,prompt:string,value:number,unit:string,hint:string,explanation:string,tolerance=.005):Unit2Question=>({id,prompt,value,unit,hint,explanation,tolerance});
const q=(id:string,prompt:string,options:string[],correct:number,hint:string,explanation:string):Unit2Question=>({id,prompt,options,correct,hint,explanation});
export const unit2Topics:Unit2Topic[]=[
 {id:'exp',title:'Funciones exponenciales',source:'F37',pages:'1–6',lead:'Parte de la función de la guía: f(x)=2ˣ. Relaciona su expresión, su gráfica y las operaciones que pide GeoGebra.',formula:'f(x) = 2ˣ',ideas:[
  ['Qué cambia al aumentar x','En a·bˣ, a es el valor en cero y b es el factor por unidad. Para a>0, una base b>1 produce crecimiento y 0<b<1 produce decrecimiento. El factor multiplica la cantidad anterior: no añade siempre la misma cantidad.'],
  ['Imagen y preimagen','Calcular una imagen significa sustituir x: f(2)=2²=4. Buscar la preimagen de 5 significa resolver 2ˣ=5. Aplicas logaritmos y obtienes x=ln(5)/ln(2), aproximadamente 2,321928.'],
  ['Cruces y ajustes de la guía','Las curvas 2ˣ y x+2 se cortan cerca de (−1,690;0,310) y exactamente en (2;4). Una intersección hallada por el software no garantiza que sea la única: revisa los intervalos. El ajuste de los puntos (1,1),(3,2),(5,4),(6,8) se puede escribir como a·bˣ o a·eᶜˣ, con b=eᶜ; conserva cifras antes de redondear.'],
 ],example:[['Calcular la imagen','Sustituye x=2: 2²=4. El punto es (2,4).'],['Buscar una preimagen','2ˣ=5 ⇒ x·ln(2)=ln(5) ⇒ x≈2,321928.'],['Verificar el cruce derecho','En x=2: 2²=4 y 2+2=4. La misma entrada produce la misma salida.']],remember:'La exponencial 2ˣ es positiva, pasa por (0,1) y no corta el eje x.',questions:[
  n('exp-image','Para f(x)=2ˣ, calcula f(2).',4,'', 'Sustituye la entrada en el exponente.','2²=4.'),
  n('exp-preimage','¿Qué x cumple 2ˣ=5? Usa al menos cuatro decimales.',Math.log(5)/Math.log(2),'','Aplica ln a ambos lados y despeja x.','x=ln(5)/ln(2)≈2,321928.',.0001),
 ],commands:['f(x)=2^x','a=f(2)','P=(2,a)','Solve(f(x)=5,x)','g(x)=x+2','Intersect(f,g,-2,0)','Intersect(f,g,1,3)','Y=Intersect(f,yAxis)','L={(1,1),(3,2),(5,4),(6,8)}','p=FitGrowth(L)','r=FitExp(L)']},
 {id:'bacteria',title:'Crecimiento de bacterias',source:'F38',pages:'2–3',lead:'El ejercicio empieza con 100 bacterias y aumenta un 20% respecto de la hora anterior. Las preguntas distinguen calcular población, despejar tiempo y cambiar una condición inicial.',formula:'N(t) = 100 · 1,2ᵗ',ideas:[
  ['Del porcentaje al factor','Conservar el 100% y añadir 20% da 1+0,20=1,20. Por eso N(t)=100·1,2ᵗ. Las primeras horas dan 100;120;144;172,8;207,36;248,832. Son valores del modelo; la población real es un conteo.'],
  ['Tiempo continuo y observaciones por hora','Para N(t)=2800 resuelves 1,2ᵗ=28: t=ln(28)/ln(1,2)≈18,2765 h. Si se observa solo en horas enteras, la primera hora con al menos 2800 es la 19. Esas respuestas corresponden a preguntas distintas.'],
  ['Las dos condiciones de la actividad 4 son independientes','Para alcanzar 5000 en 10 h manteniendo el 20%, la cantidad inicial sería 5000/1,2¹⁰≈807,5279. Si se mantiene la cantidad inicial 100, el factor requerido sería 50^(1/10), y la tasa (factor−1)·100≈47,8758%. No cambies simultáneamente ambas condiciones.'],
 ],example:[['Definir el modelo','N(t)=100·1,2ᵗ. El tiempo t está en horas.'],['Evaluar a las ocho horas','N(8)=100·1,2⁸≈429,981696. Comunica aproximadamente 430 bacterias según el modelo.'],['Despejar el umbral','N(t)=2800 ⇒ t≈18,2765 h. La primera observación horaria que supera el umbral es t=19.']],remember:'El 20% se aplica a la cantidad anterior. El crecimiento compuesto no es sumar 20 bacterias por hora.',questions:[
  n('bacteria-eight','¿Qué valor entrega el modelo a las ocho horas? Redondea a dos decimales.',100*1.2**8,'bacterias','Evalúa 100·1,2⁸.','N(8)≈429,98; el conteo aproximado es 430.'),
  n('bacteria-hour','Si se observa solo a horas enteras, ¿cuál es la primera hora con al menos 2800?',19,'h','Distingue el tiempo continuo de la primera hora entera posterior.','El umbral continuo es 18,2765 h; la primera hora entera es 19.'),
 ]},
 {id:'elimination',title:'Eliminación de fármacos',source:'F39',pages:'1',lead:'Al comenzar hay 1000 miligramos (mg) de un fármaco. Cada hora se elimina el 10% de la cantidad que todavía queda. Queremos saber cuántas horas deben pasar para que queden 500 mg, es decir, la mitad.',formula:'M(t) = 1000 · 0,9ᵗ',ideas:[
  ['Primero, entiende qué te preguntan','No tenemos que averiguar cuánto había al comienzo: eso ya lo sabemos, son 1000 mg. Buscamos un tiempo. La pregunta es: ¿después de cuántas horas quedarán 500 mg?'],
  ['Mira qué pasa durante la primera hora','El 10% de 1000 es 100. Se eliminan esos 100 mg, así que quedan 1000 − 100 = 900 mg. En la segunda hora se elimina el 10% de 900, que es 90: quedan 810 mg. Cada hora calculamos el porcentaje sobre lo que queda, no sobre los 1000 del comienzo.'],
  ['Ahora escribe lo mismo con una fórmula','Si se elimina el 10%, se conserva el 90%. Escribir 90% como número decimal da 0,9. Por eso multiplicamos por 0,9 una vez por cada hora: 1000 · 0,9 después de una hora, y 1000 · 0,9 · 0,9 después de dos. El exponente t resume esas multiplicaciones.'],
  ['Pide a la fórmula que te dé 500 mg','M(t) significa la cantidad que queda y t significa horas. Como queremos 500 mg, escribimos 1000 · 0,9ᵗ = 500. Dividimos ambos lados por 1000 y queda 0,9ᵗ = 0,5. Para encontrar ese exponente usamos la tecla ln de la calculadora: t = ln(0,5) ÷ ln(0,9).'],
  ['Explica el resultado con palabras','La calculadora da 6,5788 horas: aproximadamente 6 horas y 35 minutos. Compruébalo en la gráfica: a las 6 horas quedan unos 531 mg y a las 7, unos 478 mg. Los 500 mg se alcanzan entre esas dos horas. Si solo se revisa a horas completas, la primera con 500 mg o menos es la hora 7.'],
 ],example:[['Elegir el factor correcto','Se conserva 90%: M(t)=1000·0,9ᵗ.'],['Despejar el tiempo','M(t)=500 ⇒ 0,9ᵗ=0,5 ⇒ t=ln(0,5)/ln(0,9).'],['Interpretar el resultado','t≈6,5788 h, aproximadamente 6 h 35 min. La primera hora entera con 500 mg o menos es la 7.']],remember:'Es el modelo matemático del documento, sin considerar dosis adicionales ni usarlo para decidir una medicación.',questions:[
  n('elimination-factor','Si se elimina 10% cada hora, ¿qué factor multiplica la cantidad?',.9,'','Resta la fracción eliminada a 1.','1−0,10=0,90.'),
  n('elimination-half','¿Cuántas horas tarda en quedar la mitad? Usa cuatro decimales.',Math.log(.5)/Math.log(.9),'h','Iguala a 500 y aplica logaritmos.','ln(0,5)/ln(0,9)≈6,578813 h.',.0001),
 ]},
 {id:'logs',title:'Funciones logarítmicas',source:'F20',pages:'1–4',lead:'La guía compara bases, imágenes, preimágenes, cruces y ajustes. El dominio forma parte de la respuesta antes de usar la calculadora.',formula:'logᵦ(x)=y ⇔ bʸ=x',ideas:[
  ['Qué pregunta un logaritmo','logᵦ(x) pregunta a qué exponente hay que elevar b para obtener x. Se exige b>0, b≠1 y x>0. ln usa la base e; log decimal usa la base 10.'],
  ['Imágenes y preimágenes de la guía','Para f(x)=ln(x), la imagen de 3 es ln(3)≈1,098612. Si f(x)=2, la preimagen es e²≈7,389056. No intercambies la entrada y la salida al escribir el punto de la gráfica.'],
  ['Dominio, cortes y ajustes','ln(1)=0: el corte horizontal es (1,0). No hay corte con el eje y porque exigiría x=0. La guía ajusta los pares (0,5;−2),(1;1),(3;3),(6;4); un ajuste no tiene por qué pasar exactamente por todos los puntos.'],
 ],example:[['Leer la pregunta','Se pide la entrada x cuando ln(x)=2.'],['Usar la operación inversa','Eleva e a ambos lados: x=e²≈7,389056.'],['Representar y comprobar','El punto es (e²,2). Al sustituir, ln(e²)=2.']],remember:'Antes de evaluar ln(argumento), impón argumento>0.',questions:[
  n('logs-preimage','¿Qué entrada produce ln(x)=2? Usa cuatro decimales.',Math.exp(2),'','Usa la operación inversa del logaritmo natural.','x=e²≈7,389056.',.0001),
  q('logs-domain','¿Cuál es el dominio real de ln(2x−1)?',['x>0','x>0,5','Todos los reales'],1,'El argumento completo debe ser positivo.','2x−1>0 ⇒ x>0,5.'),
 ]},
 {id:'followers',title:'Seguidores y tasas medias',source:'F30',pages:'2–3',lead:'La situación de Instagram compara un ajuste de cinco pares con el modelo de Richard. Se interpretan dominio, origen temporal, predicciones y tasas medias.',formula:'g(x) = 600 + 1157,28 ln(2x−1)',ideas:[
  ['Conservar los datos y el origen','Los cinco pares originales son (1,485),(2,1353),(3,2307),(4,2689),(5,3005). Si renombras el mes 1 como mes 0, debes transformar la variable: no basta cambiar la etiqueta ni evaluar ln(0).'],
  ['Separar aumento de incremento constante','Los seguidores aumentan en la tabla, pero los incrementos son 868,954,382 y 316. No son iguales. Un crecimiento sostenido no implica una tasa constante; la interpretación debe comprobarse con los pares.'],
  ['Calcular una tasa sobre un intervalo','Para [7,10], calcula (g(10)−g(7))/(10−7). El resultado es aproximadamente 146,3919 seguidores/mes. Para comparar con [10,12], vuelve a evaluar los extremos y divide por 2; no copies el resultado anterior.'],
 ],example:[['Revisar el dominio','2x−1>0 ⇒ x>0,5.'],['Evaluar el primer mes','g(1)=600+1157,28·ln(1)=600.'],['Calcular la tasa media','[g(10)−g(7)]/3≈146,391916 seguidores/mes.']],remember:'Una tasa media necesita dos extremos y sus unidades. No es el total de seguidores de un mes.',questions:[
  n('followers-first','¿Cuánto vale g(1)?',600,'seguidores','ln(1)=0.','g(1)=600.'),
  n('followers-rate','Calcula la tasa media de g entre 7 y 10. Redondea a dos decimales.',1157.28*Math.log(19/13)/3,'seguidores/mes','Evalúa los dos extremos y divide la diferencia entre 3.','[g(10)−g(7)]/3≈146,3919 seguidores/mes.'),
 ]},
];
export const unit2Questions=unit2Topics.flatMap(t=>t.questions);
export const correctUnit2=(question:Unit2Question,answer:string)=>question.options?answer===String(question.correct):decimal(answer)!==null&&Math.abs(decimal(answer)!-question.value!)<=(question.tolerance??.005);
export const unit2StorageKey='modo:estudio:unidad2:v1';
export type Unit2Save={version:1;answers:Record<string,string>;checked:string[]};
export const freshUnit2=():Unit2Save=>({version:1,answers:{},checked:[]});
export function readUnit2(raw:unknown):Unit2Save{
 if(!raw||typeof raw!=='object')throw Error('Formato no reconocido');
 const p=raw as Unit2Save,ids=unit2Questions.map(q=>q.id);
 if(p.version!==1||!p.answers||typeof p.answers!=='object'||Array.isArray(p.answers)||!Array.isArray(p.checked)||!Object.entries(p.answers).every(([id,v])=>ids.includes(id)&&typeof v==='string'&&v.length<=100)||!p.checked.every(id=>ids.includes(id)&&correctUnit2(unit2Questions.find(q=>q.id===id)!,p.answers[id]||'')))throw Error('Avance incompatible');
 return {version:1,answers:{...p.answers},checked:[...new Set(p.checked)]};
}
export function unit2Curve(topic:Unit2TopicId,x:number){return topic==='exp'?2**x:topic==='bacteria'?100*1.2**x:topic==='elimination'?1000*.9**x:topic==='logs'?Math.log(x):600+1157.28*Math.log(2*x-1);}
