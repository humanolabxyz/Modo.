export type ProblemTeaching={context:string;goal:string;reading:string;symbols:{label:string;meaning:string;example:string}[];question:string;options:string[];correct:number;hint:string};
export const teacherProblemTeaching:Record<string,ProblemTeaching>={
 'problema-poblacion':{
  context:'Queremos estudiar cuántas personas viven en un país. El punto de partida es el año 2004. La fórmula permite estimar la población cuando pasa el tiempo.',
  goal:'Vamos a buscar la población al comienzo, la población en 2015 y el año en que se llega a una población dada. Después lo representaremos en GeoGebra.',
  reading:'Una función es una regla: le das un dato de entrada y te devuelve un resultado. Aquí entra el tiempo y sale la población. p(t) se lee «p de t», no «p multiplicado por t».',
  symbols:[
   {label:'t',meaning:'Es la cantidad de años que han pasado desde 2004. No es el año del calendario.',example:'En 2004, t=0. En 2005, t=1. En 2015, t=2015−2004=11.'},
   {label:'p(t)',meaning:'Es la población que devuelve la fórmula para el tiempo que elegiste. Está expresada en millones de personas.',example:'Si el resultado fuera 12,5, significa 12,5 millones de personas.'},
   {label:'e y el exponente',meaning:'e es un número fijo, aproximadamente 2,718. La cantidad escrita arriba indica la potencia. En GeoGebra, exp(0.06*x) significa e elevado a 0,06x.',example:'Cualquier número positivo elevado a cero vale 1. Por eso, cuando t=0, e elevado a 0 también vale 1.'},
   {label:'9,5 y +3',meaning:'Primero se calcula la potencia, luego se multiplica por 9,5 y al final se suma 3. Hay que respetar ese orden.',example:'Al comienzo: 9,5 · 1 + 3 = 12,5. El 9,5 solo no es la población inicial.'},
   {label:'ln',meaning:'ln es el logaritmo natural. Ayuda a encontrar un exponente desconocido. No es multiplicar por las letras l y n.',example:'Si e elevado a z da 2, entonces z=ln(2). Lo usaremos al buscar el tiempo, después de dejar sola la potencia.'},
  ],question:'Para calcular la población en 2015, ¿qué valor de t debes usar?',options:['2015, porque ese es el año','11, porque han pasado 11 años desde 2004','2004, porque es el año inicial'],correct:1,hint:'t cuenta los años transcurridos. Resta 2015−2004 antes de usar la fórmula.'
 },
 'problema-estroncio':{
  context:'Tenemos una sustancia cuya cantidad disminuye con los años. La fórmula indica cuántos gramos quedan. Nuestro trabajo es interpretar ese modelo matemático.',
  goal:'Calcularemos cuánto hay al comienzo, cuánto tiempo pasa hasta una cantidad indicada y cuánto queda después de 50 años. Luego dibujaremos y comprobaremos la curva.',
  reading:'E(t) se lee «E de t»: la cantidad que queda después de t años. No multiplicamos E por t. El tiempo entra en la fórmula y los gramos son el resultado.',
  symbols:[
   {label:'t y E(t)',meaning:'t es el tiempo en años. E(t) es la cantidad que queda, medida en gramos.',example:'E(50) significa «la cantidad que queda después de 50 años»: reemplazamos cada t por 50.'},
   {label:'0,4',meaning:'0,4 es lo mismo que 40%. En esta fórmula, la parte que multiplica a 237 conserva el 40% cada 24 años. El +3 se suma por separado.',example:'Cuando pasan 24 años, la potencia es 0,4 elevado a 1, que vale 0,4.'},
   {label:'t/24',meaning:'La barra significa dividir. Primero dividimos los años entre 24 y ese resultado es el exponente.',example:'Si t=0, t/24=0. Si t=24, t/24=1. Si t=48, t/24=2.'},
   {label:'237 y +3',meaning:'La cantidad inicial se obtiene usando t=0 en toda la fórmula. También debemos sumar el 3.',example:'0,4 elevado a cero es 1. Entonces E(0)=237 · 1 + 3 = 240 gramos.'},
   {label:'ln al buscar tiempo',meaning:'Cuando el tiempo está en un exponente, los logaritmos permiten despejarlo. Primero restaremos 3 y dividiremos entre 237.',example:'Si 0,4 elevado a u = v, entonces u=ln(v)/ln(0,4). Después recuperamos los años multiplicando por 24.'},
  ],question:'Si han pasado 24 años, ¿cuánto vale el exponente t/24?',options:['24','0,4','1, porque 24 dividido entre 24 es 1'],correct:2,hint:'Reemplaza solamente t por 24: el exponente es 24/24.'
 },
 'problema-ahorro':{
  context:'Dos hermanos ahorran en bancos distintos. No buscamos el saldo total: la pregunta usa la ganancia, es decir, el dinero extra que obtienen sobre lo que depositaron.',
  goal:'Compararemos cuánto tiempo exige cada banco para conseguir una ganancia y cuánto se gana después de un tiempo dado. Usaremos las dos funciones en GeoGebra.',
  reading:'Estas funciones van al revés de lo que quizás esperabas: tú eliges una ganancia G y la fórmula entrega el tiempo T para conseguirla. La entrada es dinero y la salida son meses.',
  symbols:[
   {label:'G',meaning:'Es la ganancia, expresada en miles de pesos. Para pasar de pesos a miles de pesos, divide entre 1000.',example:'Una ganancia de $32000 se escribe G=32. Una ganancia de $47000 se escribe G=47.'},
   {label:'16 y 14',meaning:'Son los depósitos iniciales en miles de pesos: 16 corresponde a $16000 y 14 a $14000.',example:'En el primer banco, (G+16)/16 compara el dinero final con el depósito inicial. Si G=0, esa división vale 1.'},
   {label:'T₁(G) y T₂(G)',meaning:'Son los tiempos que entrega cada banco para la ganancia elegida. El resultado está en meses, no en pesos.',example:'Si el resultado fuera T₁(G)=24, significa que se requieren 24 meses en el primer banco.'},
   {label:'log y su base',meaning:'Un logaritmo busca un exponente. La base es el número pequeño junto a log: aquí es 1,9 o 1,6. No debes usar log decimal sin cambiar la base.',example:'log en base 10 de 100 vale 2, porque 10²=100. Para otra base puedes usar log(b,x) en GeoGebra o ln(x)/ln(b).'},
   {label:'12 · log',meaning:'Después de calcular el logaritmo, se multiplica su resultado por 12. Así obtenemos los meses del modelo.',example:'3 años y medio son 3,5 · 12 = 42 meses. Usa meses antes de comparar con T.'},
  ],question:'¿Qué representa el resultado de T₁(G)?',options:['La ganancia en pesos','El tiempo necesario, medido en meses','El depósito inicial'],correct:1,hint:'En este modelo introduces una ganancia G y obtienes cuánto debes esperar.'
 },
 'problema-planta':{
  context:'Una planta va aumentando su altura después de ser plantada. El tiempo se mide en días y la altura en centímetros. La fórmula describe ese crecimiento bajo las condiciones del problema.',
  goal:'Buscaremos su altura inicial, su altura a los 79 días y el tiempo para alcanzar 14,86 cm. Finalmente interpretaremos los ejes y los cortes de la gráfica.',
  reading:'h(t) se lee «h de t»: la altura después de t días. h(79) significa la altura a los 79 días. Para calcularla, reemplazamos t por 79.',
  symbols:[
   {label:'t y h(t)',meaning:'t indica días desde que se plantó. h(t) devuelve centímetros. El día en que se planta corresponde a t=0.',example:'Si h(79) fuera 8,61, la respuesta sería una altura aproximada de 8,61 cm al día 79.'},
   {label:'log₁₀',meaning:'Este logaritmo pregunta a qué exponente hay que elevar 10 para obtener el número del paréntesis.',example:'log₁₀(100)=2 porque 10²=100. log₁₀(1)=0 porque 10⁰=1.'},
   {label:'t+1',meaning:'Primero se calcula lo que está dentro del paréntesis. No calculamos log(t) y después sumamos 1.',example:'Al día 79, el número dentro del logaritmo es 79+1=80. Al día cero, es 0+1=1.'},
   {label:'1 + 4 · log',meaning:'Calcula el logaritmo, multiplícalo por 4 y al final suma 1. El 1 es la altura al comienzo porque log₁₀(1)=0.',example:'h(0)=1+4 · 0=1 cm. No comienza con altura cero.'},
   {label:'Días y años',meaning:'Al despejar t obtendrás días. Si la pregunta pide años, debes convertir el resultado al final.',example:'365 días son aproximadamente un año. Para convertir días a años, divide entre 365.'},
  ],question:'Para calcular la altura a los 79 días, ¿qué número va dentro del logaritmo?',options:['79','80, porque primero calculamos 79+1','1'],correct:1,hint:'En la fórmula aparece log₁₀(t+1). Sustituye t por 79 y resuelve el paréntesis primero.'
 },
};
