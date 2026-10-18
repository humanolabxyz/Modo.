"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/study/lessonCards.ts
var lessonCards_exports = {};
__export(lessonCards_exports, {
  lessonCards: () => lessonCards
});
module.exports = __toCommonJS(lessonCards_exports);
var lessonCards = {
  "objetivos-fallas": [
    {
      kind: "learn",
      title: "Una tuber\xEDa para entender la corriente",
      body: ["Imagina el conductor como una tuber\xEDa y la corriente como el agua que pasa por ella.", "Si la carga exige m\xE1s agua de la normal, la tuber\xEDa trabaja de m\xE1s y se calienta con el tiempo. Eso es una sobrecarga.", "Si se abre un atajo sin ninguna resistencia, el agua sale disparada por ah\xED. Eso es un cortocircuito."],
      analogy: "Sobrecarga = demasiada demanda por el mismo camino. Cortocircuito = un atajo de muy baja impedancia.",
      revealHint: "Toca cada falla para ver su definici\xF3n",
      reveal: [
        { label: "Sobrecarga", text: "La corriente supera la normal de funcionamiento y el conductor se recalienta si la condici\xF3n dura." },
        { label: "Cortocircuito", text: "Aparece un camino de muy baja impedancia (por ejemplo, por p\xE9rdida de aislaci\xF3n) y la corriente de falla puede ser muy elevada." }
      ],
      takeaway: "Para distinguirlas, pregunta por la causa: \xBFla carga exige m\xE1s, o apareci\xF3 un atajo?"
    },
    {
      kind: "sort",
      title: "Clasifica cada situaci\xF3n",
      question: "\xBFQu\xE9 falla describe cada situaci\xF3n?",
      buckets: ["Sobrecarga", "Cortocircuito"],
      items: [
        { text: "Un motor arrastra una carga m\xE1s pesada de lo normal durante varios minutos.", bucket: 0 },
        { text: "Se pierde la aislaci\xF3n y dos partes conductoras quedan unidas por un camino de muy baja impedancia.", bucket: 1 },
        { text: "Se conectan demasiados equipos al mismo circuito y la corriente supera la normal.", bucket: 0 },
        { text: "Una falla provoca arco el\xE9ctrico y esfuerzos magn\xE9ticos dentro del tablero.", bucket: 1 }
      ],
      explain: "En la sobrecarga cambia la demanda de la carga; en el cortocircuito cambia el camino por donde circula la corriente."
    },
    {
      kind: "learn",
      title: "Por qu\xE9 una falla puede destruir un tablero",
      body: ["La l\xE1mina 4 distingue tres efectos de un cortocircuito. Desc\xFAbrelos uno por uno.", "Por eso la protecci\xF3n debe interrumpir la falla a tiempo, no solo avisar."],
      revealHint: "Toca cada efecto",
      reveal: [
        { label: "Arco el\xE9ctrico", text: "Puede quemar los materiales que est\xE1n en su trayectoria." },
        { label: "Calor", text: "Deteriora los conductores y su aislaci\xF3n." },
        { label: "Esfuerzos magn\xE9ticos", text: "Fuerzas que pueden deformar conductores y barras." }
      ],
      takeaway: "Los objetivos de la protecci\xF3n: cuidar a las personas, evitar da\xF1os en la instalaci\xF3n y conservar el servicio donde sea posible."
    },
    {
      kind: "choice",
      title: "\xBFAlcanza con saber que se calent\xF3?",
      question: "Un conductor se calent\xF3. \xBFPuedes decir ya qu\xE9 falla ocurri\xF3?",
      options: ["S\xED, fue una sobrecarga", "S\xED, fue un cortocircuito", "No: ambas fallas producen calor; hay que averiguar la causa"],
      correct: 2,
      explain: "El calor aparece en las dos. Lo que las distingue es la causa de la corriente: demanda excesiva o camino de baja impedancia."
    },
    {
      kind: "choice",
      title: "Cierra la idea",
      question: "\xBFCu\xE1les son los tres objetivos de una protecci\xF3n el\xE9ctrica?",
      options: ["Cuidar personas, evitar da\xF1os en la instalaci\xF3n y conservar el servicio si es posible", "Ahorrar energ\xEDa, reducir costos y hacer partir motores", "Subir la corriente, aislar el equipo y evitar mantenciones"],
      correct: 0,
      explain: "Personas, instalaci\xF3n y continuidad del servicio: esos son los tres objetivos que presenta el docente."
    }
  ],
  coordinacion: [
    {
      kind: "learn",
      title: "Una escalera de tres pelda\xF1os",
      body: ["Para que el cable quede protegido, tres corrientes deben estar ordenadas de menor a mayor: In \u2264 Ip \u2264 Iz.", "La protecci\xF3n debe admitir lo que consume la carga, pero no debe ser mayor que lo que el cable soporta."],
      analogy: "Es como un ascensor: no debe cargar menos que las personas que suben, ni m\xE1s que lo que aguantan sus cables.",
      revealHint: "Toca cada letra",
      reveal: [
        { label: "In", text: "Corriente de la carga: lo que el equipo necesita para funcionar (en esta presentaci\xF3n)." },
        { label: "Ip", text: "Corriente nominal de la protecci\xF3n: el valor del interruptor o fusible elegido." },
        { label: "Iz", text: "Capacidad corregida del cable: lo que soporta tras aplicar las correcciones de instalaci\xF3n." }
      ],
      takeaway: "Dos preguntas distintas: \xBFla protecci\xF3n admite la carga? (In \u2264 Ip) y \xBFrespeta al cable? (Ip \u2264 Iz)."
    },
    {
      kind: "match",
      title: "Une cada s\xEDmbolo con su significado",
      question: "Toca un s\xEDmbolo y luego su significado.",
      pairs: [["In", "Corriente que consume la carga"], ["Ip", "Corriente nominal de la protecci\xF3n"], ["Iz", "Capacidad corregida del cable"], ["Icc", "Corriente de cortocircuito prevista"]],
      explain: "Conserva siempre la definici\xF3n de cada s\xEDmbolo. En notaci\xF3n IEC suele escribirse Ib \u2264 In \u2264 Iz (l\xE1mina 6): cambia el s\xEDmbolo, no el criterio."
    },
    {
      kind: "learn",
      title: "Un ejemplo resuelto: 18 A, 20 A, 25 A",
      body: ["Valores de la l\xE1mina 6: carga In = 18 A, protecci\xF3n Ip = 20 A y cable Iz = 25 A. Revela cada comprobaci\xF3n."],
      revealHint: "Toca cada paso",
      reveal: [
        { label: "1 \xB7 \xBFIn \u2264 Ip?", text: "18 \u2264 20: la protecci\xF3n admite la carga." },
        { label: "2 \xB7 \xBFIp \u2264 Iz?", text: "20 \u2264 25: la protecci\xF3n no supera la capacidad del cable." },
        { label: "3 \xB7 Conclusi\xF3n", text: "Cumple las dos condiciones: 18 \u2264 20 \u2264 25. Si subieras Ip a 32 A, fallar\xEDa 32 \u2264 25." }
      ],
      takeaway: "Subir los amperes del interruptor puede resolver una condici\xF3n y romper la otra."
    },
    {
      kind: "choice",
      title: "Elige la protecci\xF3n",
      question: "La carga es In = 18 A y el cable tiene Iz = 25 A. \xBFQu\xE9 nominal Ip cumple In \u2264 Ip \u2264 Iz?",
      options: ["Ip = 16 A", "Ip = 20 A", "Ip = 32 A"],
      correct: 1,
      explain: "16 A es menor que la carga (falla In \u2264 Ip) y 32 A supera al cable (falla Ip \u2264 Iz). Solo 20 A queda entre 18 A y 25 A."
    },
    {
      kind: "choice",
      title: "\xBFYa termin\xF3 la selecci\xF3n?",
      question: "La desigualdad se cumple. \xBFEst\xE1 aprobada toda la instalaci\xF3n?",
      options: ["S\xED, la desigualdad es suficiente", "No: faltan poder de corte, disparo y energ\xEDa pasante", "Solo falta elegir el color del interruptor"],
      correct: 1,
      explain: "La coordinaci\xF3n de corrientes es solo una parte: a\xFAn hay que comprobar el poder de corte frente a Icc, la actuaci\xF3n y la energ\xEDa pasante."
    }
  ],
  termomagnetico: [
    {
      kind: "learn",
      title: "Dos guardias en un solo aparato",
      body: ["El interruptor termomagn\xE9tico re\xFAne dos mecanismos que vigilan fallas distintas.", "El t\xE9rmico es paciente: reacciona al calentamiento sostenido. El magn\xE9tico es un reflejo: act\xFAa ante una corriente muy elevada."],
      analogy: "El t\xE9rmico es como notar que la olla lleva mucho rato al fuego; el magn\xE9tico, como soltarla al instante si salta una llama.",
      revealHint: "Toca cada mecanismo",
      reveal: [
        { label: "T\xE9rmico", text: "Responde al calentamiento asociado a una sobrecarga." },
        { label: "Magn\xE9tico", text: "Responde a una corriente suficientemente elevada, asociada al cortocircuito." }
      ],
      takeaway: "T\xE9rmico \u2192 sobrecarga. Magn\xE9tico \u2192 cortocircuito."
    },
    {
      kind: "match",
      title: "Une cada concepto",
      question: "Toca un concepto y luego lo que significa.",
      pairs: [["T\xE9rmico", "Responde a la sobrecarga"], ["Magn\xE9tico", "Responde al cortocircuito"], ["Curva B, C o D", "Banda del umbral magn\xE9tico en m\xFAltiplos de la nominal"], ["Poder de corte", "Capacidad de interrumpir la corriente de falla prevista"]],
      explain: "El poder de corte es un dato distinto de la nominal: debe cubrir la corriente de cortocircuito prevista."
    },
    {
      kind: "learn",
      title: "Las curvas B, C y D",
      body: ["La letra indica cu\xE1ntas veces la nominal debe circular para que act\xFAe el magn\xE9tico. Para convertirla a amperes, multiplica por la nominal."],
      revealHint: "Toca cada curva",
      reveal: [
        { label: "Curva B", text: "3\u20135 veces la nominal. Orientada a cargas resistivas." },
        { label: "Curva C", text: "5\u201310 veces la nominal. Uso general. Con 16 A: 80\u2013160 A." },
        { label: "Curva D", text: "10\u201320 veces la nominal. Pensada para arranques altos." }
      ],
      takeaway: "Son bandas del umbral magn\xE9tico, no tiempos de disparo."
    },
    {
      kind: "number",
      title: "Calcula una banda",
      question: "Un interruptor curva B tiene nominal de 10 A. \xBFCu\xE1l es el l\xEDmite inferior de su banda magn\xE9tica?",
      given: "Curva B: 3\u20135 veces la nominal (l\xE1mina 8).",
      answer: 30,
      unit: "A",
      explain: "3 \xD7 10 A = 30 A. El l\xEDmite superior ser\xEDa 5 \xD7 10 A = 50 A. La banda es 30\u201350 A."
    },
    {
      kind: "choice",
      title: "\xBFLa curva D es siempre mejor?",
      question: "Alguien dice: \xABcon curva D protejo mejor cualquier motor\xBB. \xBFQu\xE9 respondes?",
      options: ["Tiene raz\xF3n: m\xE1s alto es m\xE1s seguro", "No: hay que justificar el arranque y verificar la desconexi\xF3n y el poder de corte", "La letra no importa"],
      correct: 1,
      explain: "Una banda m\xE1s alta no es \xABmejor\xBB en todos los casos: puede dejar de proteger al conductor si no se verifican las condiciones de desconexi\xF3n."
    }
  ],
  fusibles: [
    {
      kind: "learn",
      title: "El eslab\xF3n d\xE9bil, a prop\xF3sito",
      body: ["Un fusible protege porque su elemento se funde y abre el circuito cuando la sobrecorriente es demasiado grande.", "En la placa vienen tres datos que responden tres preguntas diferentes. No los confundas."],
      analogy: "Como la cadena que se corta por el eslab\xF3n m\xE1s d\xE9bil, antes de que se da\xF1e todo lo dem\xE1s.",
      revealHint: "Toca cada dato de la placa",
      reveal: [
        { label: "50 A", text: "Corriente nominal: la referencia de uso." },
        { label: "700 V CA/CC", text: "Dato de tensi\xF3n del ejemplo, con su tipo de corriente." },
        { label: "200 kA", text: "Capacidad de ruptura: la falla m\xE1xima que puede interrumpir." }
      ],
      takeaway: "Nominal, tensi\xF3n y ruptura no son intercambiables."
    },
    {
      kind: "match",
      title: "Lee la placa",
      question: "Une cada dato con lo que representa.",
      pairs: [["50 A", "Corriente nominal"], ["700 V CA/CC", "Tensi\xF3n"], ["200 kA", "Capacidad de ruptura"], ["aR o gR", "Clases mencionadas para semiconductores"]],
      explain: "Placa textual de la l\xE1mina 10. gG se menciona para conductores; aR y gR, para semiconductores."
    },
    {
      kind: "learn",
      title: "La forma no define la funci\xF3n",
      body: ["Que sea de vidrio o de cer\xE1mica, o que se vea r\xE1pido o lento, no basta para elegirlo. La funci\xF3n se confirma en la ficha t\xE9cnica.", "Compara cada dato de la placa con el dato equivalente de tu circuito."],
      revealHint: "Toca cada comparaci\xF3n",
      reveal: [
        { label: "Tensi\xF3n", text: "La tensi\xF3n del circuito debe estar cubierta por la tensi\xF3n del fusible (y su tipo CA o CC)." },
        { label: "Ruptura", text: "La capacidad de ruptura debe cubrir la corriente de cortocircuito prevista (Icc)." },
        { label: "Clase", text: "Elige la clase seg\xFAn el equipo que proteger\xE1s y conf\xEDrmala en la ficha." }
      ],
      takeaway: "Que el fusible quepa en el portafusible no significa que sirva."
    },
    {
      kind: "choice",
      title: "Eval\xFAa un candidato",
      question: "Circuito de 400 V CA con Icc = 10 kA. Placa: 50 A \xB7 700 V CA/CC \xB7 200 kA. \xBFQu\xE9 comparaciones de tensi\xF3n y ruptura se cumplen?",
      options: ["Ninguna", "Ambas: 700 V \u2265 400 V y 200 kA \u2265 10 kA", "Solo la tensi\xF3n"],
      correct: 1,
      explain: "Ambas se cumplen, suponiendo que esas capacidades est\xE9n declaradas para CA. A\xFAn faltan la clase, la nominal frente a la carga y la energ\xEDa pasante."
    },
    {
      kind: "choice",
      title: "Corrige una idea equivocada",
      question: "Un compa\xF1ero dice: \xAB200 kA es la corriente que consume el equipo\xBB. \xBFQu\xE9 le respondes?",
      options: ["Es la capacidad de ruptura; la nominal del ejemplo es 50 A", "Tiene raz\xF3n, es la corriente de trabajo", "Es la tensi\xF3n m\xE1xima"],
      correct: 0,
      explain: "200 kA es capacidad de ruptura: se compara con la corriente de falla prevista, no con la corriente que consume el equipo."
    }
  ],
  conductores: [
    {
      kind: "learn",
      title: "Una autopista con restricciones",
      body: ["La tabla indica cu\xE1nta corriente soporta un cable en condiciones ideales. Pero el calor y los cables agrupados le restan capacidad.", "Por eso se corrige: Iz = Itabla \xD7 fT \xD7 fG."],
      analogy: "Como una autopista que admite 100 autos, pero con lluvia y obras solo deja pasar una parte.",
      revealHint: "Toca cada t\xE9rmino",
      reveal: [
        { label: "Itabla", text: "Capacidad tabulada del cable seg\xFAn su material, aislaci\xF3n y forma de instalaci\xF3n." },
        { label: "fT", text: "Factor de temperatura: un multiplicador sin unidad." },
        { label: "fG", text: "Factor de agrupamiento: otro multiplicador sin unidad." }
      ],
      takeaway: "Los factores se multiplican; no se suman ni son amperes."
    },
    {
      kind: "number",
      title: "Calcula Iz",
      question: "Calcula la capacidad corregida del cable.",
      given: "Ejemplo de la l\xE1mina 12: Itabla = 30 A \xB7 fT = 0,9 \xB7 fG = 0,8.",
      answer: 21.6,
      unit: "A",
      explain: "0,9 \xD7 0,8 = 0,72 y 30 \xD7 0,72 = 21,6 A. Con el calor y el agrupamiento, el cable de 30 A queda utilizable hasta 21,6 A."
    },
    {
      kind: "learn",
      title: "Tres comprobaciones, no una",
      body: ["Que la corriente sea aceptable no resuelve todo el cable. Hay tres comprobaciones separadas."],
      revealHint: "Toca cada comprobaci\xF3n",
      reveal: [
        { label: "Corriente", text: "Capacidad corregida Iz frente a la carga y a la protecci\xF3n." },
        { label: "Ca\xEDda de tensi\xF3n", text: "Depende de la longitud y la carga. En el ejemplo de la l\xE1mina 12, 2 % calculado frente a 3 % adoptado." },
        { label: "Cortocircuito", text: "El cable debe soportar la energ\xEDa de la falla hasta que act\xFAe la protecci\xF3n: I\xB2t \u2264 k\xB2S\xB2." }
      ],
      takeaway: "Un resultado favorable no reemplaza a las otras dos comprobaciones."
    },
    {
      kind: "choice",
      title: "Encuentra el error",
      question: "Un compa\xF1ero calcula Iz = 30 + 0,85 + 1 = 31,85 A (Itabla = 30 A, fT = 0,85, fG = 1). \xBFCu\xE1l es el error?",
      options: ["Debi\xF3 restar los factores", "Los factores se multiplican: Iz = 30 \xD7 0,85 \xD7 1 = 25,5 A", "No hay error"],
      correct: 1,
      explain: "fT y fG son multiplicadores sin unidad. Sumarlos mezcla magnitudes distintas y entrega un valor mayor que la capacidad tabulada."
    },
    {
      kind: "choice",
      title: "Aplica la coordinaci\xF3n",
      question: "Iz = 21,6 A y se propone una protecci\xF3n de Ip = 25 A. \xBFQu\xE9 ocurre?",
      options: ["Cumple, porque 25 A es menor que los 30 A de la tabla", "Falla Ip \u2264 Iz: la protecci\xF3n supera la capacidad corregida del cable", "Cumple, porque 25 A es mayor que la carga"],
      correct: 1,
      explain: "Se coordina con la capacidad corregida (21,6 A), no con la tabulada. 25 A supera 21,6 A."
    }
  ],
  guardamotor: [
    {
      kind: "learn",
      title: "Elegir rango y ajustar son dos decisiones",
      body: ["El guardamotor protege al motor y se ajusta con la corriente de su placa.", "Primero eliges un aparato cuyo rango incluya esa corriente. Despu\xE9s fijas el ajuste dentro de ese rango."],
      analogy: "Como comprar calzado: el rango son las tallas que existen; el ajuste es tu talla exacta.",
      revealHint: "Toca cada concepto",
      reveal: [
        { label: "Corriente de placa", text: "Corriente nominal declarada del motor, con su tensi\xF3n y conexi\xF3n." },
        { label: "Rango t\xE9rmico", text: "Intervalo en el que se puede ajustar el aparato. Debe incluir la corriente de placa." },
        { label: "Ajuste", text: "Valor elegido dentro del rango, seg\xFAn las instrucciones del fabricante." }
      ],
      takeaway: "El extremo del rango no es la corriente del motor."
    },
    {
      kind: "order",
      title: "Ordena el procedimiento",
      question: "Ordena los pasos para seleccionar un guardamotor.",
      steps: ["Leer la corriente nominal, la tensi\xF3n y la conexi\xF3n de la placa del motor", "Elegir un rango t\xE9rmico que incluya esa corriente", "Ajustar el valor t\xE9rmico seg\xFAn el fabricante", "Comprobar arranque, umbral magn\xE9tico y poder de corte"],
      explain: "Primero la placa, luego el rango, luego el ajuste y, al final, las comprobaciones que el dial no resuelve."
    },
    {
      kind: "learn",
      title: "Un ejemplo con 6,3 A",
      body: ["Placa ficticia: 6,3 A. Candidatos hipot\xE9ticos: rangos 4\u20136 A y 6\u201310 A."],
      revealHint: "Toca cada paso",
      reveal: [
        { label: "Rango 4\u20136 A", text: "6,3 supera el m\xE1ximo de 6 A: no sirve." },
        { label: "Rango 6\u201310 A", text: "6 \u2264 6,3 \u2264 10: s\xED incluye la corriente de placa." },
        { label: "Ajuste", text: "En el ejercicio se ajusta a 6,3 A, no a 10 A. Si ajustaras 8 A, estar\xEDas dentro del rango pero lejos de la placa." }
      ],
      takeaway: "Rango compatible no significa ajuste correcto."
    },
    {
      kind: "choice",
      title: "Elige el rango",
      question: "Placa del motor: 6,3 A (datos ficticios). \xBFQu\xE9 rango t\xE9rmico incluye ese valor?",
      options: ["4\u20136 A", "6\u201310 A", "10\u201316 A"],
      correct: 1,
      explain: "Solo 6\u201310 A cumple 6 \u2264 6,3 \u2264 10. 4\u20136 A queda corto y 10\u201316 A empieza por encima de 6,3 A."
    },
    {
      kind: "choice",
      title: "\xBFPara qu\xE9 sirve el contactor?",
      question: "Para tener mando remoto, el guardamotor suele combinarse con\u2026",
      options: ["Un SPD", "Un contactor", "Un fusible de vidrio"],
      correct: 1,
      explain: "El guardamotor protege; el contactor aporta el mando remoto. Son funciones distintas."
    }
  ],
  "tierra-sobretension": [
    {
      kind: "learn",
      title: "Un pico no es una gotera",
      body: ["Dos problemas distintos, dos dispositivos distintos. Una sobretensi\xF3n es una elevaci\xF3n breve de la tensi\xF3n; una fuga es corriente que se va por un camino que no deb\xEDa.", "El SPD recorta el pico. El diferencial vigila que la corriente que sale sea la que vuelve."],
      analogy: "El SPD es como una v\xE1lvula de alivio que deja escapar el exceso de presi\xF3n; el diferencial es como un contador que detecta una gotera.",
      revealHint: "Toca cada dispositivo",
      reveal: [
        { label: "SPD", text: "Limita las sobretensiones transitorias y deriva su corriente." },
        { label: "Diferencial (RCD)", text: "Detecta el desequilibrio entre la corriente de ida y la de vuelta provocado por una fuga." }
      ],
      takeaway: "Estar los dos en el tablero no los hace intercambiables."
    },
    {
      kind: "match",
      title: "Une dispositivo y funci\xF3n",
      question: "Toca un elemento y luego lo que hace.",
      pairs: [["SPD", "Limita sobretensiones transitorias"], ["Diferencial RCD", "Detecta desequilibrio por fuga"], ["Termomagn\xE9tico", "Protege frente a sobrecorriente"], ["\u2264 30 mA", "Sensibilidad habitual para protecci\xF3n adicional de personas"]],
      explain: "Cada uno responde a una condici\xF3n diferente. El 30 mA es una referencia habitual bajo IEC, no una garant\xEDa absoluta."
    },
    {
      kind: "learn",
      title: "C\xF3mo se calcula una fuga",
      body: ["Compara la corriente de ida con la de vuelta y convierte la diferencia a miliamperes."],
      revealHint: "Toca cada paso",
      reveal: [
        { label: "1 \xB7 Resta", text: "|10 \u2212 9,97| = 0,03 A (ambas en amperes)." },
        { label: "2 \xB7 Convierte", text: "1 A = 1000 mA, as\xED que 0,03 A \xD7 1000 = 30 mA." },
        { label: "3 \xB7 Interpreta", text: "Es un desequilibrio por fuga: corresponde a la funci\xF3n diferencial." }
      ],
      takeaway: "Revisa siempre la unidad: no son 30 A ni 0,03 mA."
    },
    {
      kind: "number",
      title: "Calcula t\xFA",
      question: "Salen 8 A y vuelven 7,98 A. \xBFCu\xE1ntos miliamperes de desequilibrio hay?",
      given: "Datos supuestos para comprender la funci\xF3n (l\xE1mina 14).",
      answer: 20,
      unit: "mA",
      explain: "|8 \u2212 7,98| = 0,02 A y 0,02 \xD7 1000 = 20 mA. No determina por s\xED solo el tiempo de disparo."
    },
    {
      kind: "choice",
      title: "\xBFReemplaza al termomagn\xE9tico?",
      question: "\xBFUn diferencial puede reemplazar a la protecci\xF3n contra sobrecorriente?",
      options: ["S\xED, si es de 30 mA", "No: cumple una funci\xF3n distinta", "S\xED, en todas las instalaciones"],
      correct: 1,
      explain: "Detecta fuga, no limita la sobrecorriente. Ambas protecciones se complementan."
    }
  ],
  "motor-trifasico": [
    {
      kind: "learn",
      title: "Lo que entrega vs. lo que toma de la red",
      body: ["La potencia de un motor suele indicarse como la que entrega en el eje (mec\xE1nica de salida). Para entregarla, el motor toma m\xE1s de la red porque tiene p\xE9rdidas.", "Por eso la f\xF3rmula divide por el rendimiento (\u03B7) y por el factor de potencia (cos\u03C6)."],
      analogy: "Es como pedir un jugo de 1 litro: necesitas m\xE1s fruta de la que sale en el vaso, porque algo se pierde.",
      revealHint: "Toca cada dato",
      reveal: [
        { label: "Psalida", text: "Potencia mec\xE1nica de salida. Va en watts (5,5 kW = 5500 W)." },
        { label: "VLL", text: "Tensi\xF3n entre l\xEDneas, en volts." },
        { label: "\u03B7 y cos\u03C6", text: "Rendimiento y factor de potencia: fracciones sin unidad (0,88 y 0,83, no 88 y 83)." }
      ],
      takeaway: "In = Psalida / (\u221A3 VLL \u03B7 cos\u03C6)"
    },
    {
      kind: "order",
      title: "Ordena el c\xE1lculo",
      question: "Ordena los pasos para calcular la corriente.",
      steps: ["Convertir la potencia de kW a W", "Calcular \u221A3 \xD7 VLL \xD7 \u03B7 \xD7 cos\u03C6", "Dividir la potencia entre ese producto", "Comparar el resultado con la corriente de placa"],
      explain: "Primero unidades, luego el denominador, luego la divisi\xF3n y, por \xFAltimo, la comparaci\xF3n con la placa."
    },
    {
      kind: "learn",
      title: "Ejemplo: motor de 5,5 kW (supuesto)",
      body: ["Datos supuestos para practicar: Psalida = 5,5 kW, VLL = 400 V, \u03B7 = 0,88 y cos\u03C6 = 0,83."],
      revealHint: "Toca cada paso",
      reveal: [
        { label: "1 \xB7 Potencia", text: "5,5 \xD7 1000 = 5500 W." },
        { label: "2 \xB7 Denominador", text: "\u221A3 \xD7 400 \xD7 0,88 \xD7 0,83 \u2248 506,04." },
        { label: "3 \xB7 Divisi\xF3n", text: "5500 / 506,04 \u2248 10,87 A." }
      ],
      takeaway: "Con la corriente a\xFAn faltan arranque, Icc y datos del conductor para seleccionar."
    },
    {
      kind: "choice",
      title: "Predice antes de calcular",
      question: "Si el rendimiento baja de 0,88 a 0,80 y lo dem\xE1s no cambia, la corriente calculada\u2026",
      options: ["Baja", "Sube", "Queda igual"],
      correct: 1,
      explain: "Al bajar \u03B7 disminuye el denominador y el cociente aumenta: para entregar la misma potencia el motor toma m\xE1s corriente (\u2248 11,96 A)."
    },
    {
      kind: "number",
      title: "Ahora t\xFA",
      question: "Calcula la corriente del motor.",
      given: "Datos supuestos: 7,5 kW de salida \xB7 400 V entre l\xEDneas \xB7 \u03B7 = 0,9 \xB7 cos\u03C6 = 0,85.",
      answer: 14.15,
      unit: "A",
      tol: 0.05,
      explain: "7500 / (\u221A3 \xD7 400 \xD7 0,9 \xD7 0,85) \u2248 7500 / 530,0 \u2248 14,15 A. Compara con la placa antes de seleccionar protecciones."
    }
  ]
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  lessonCards
});
