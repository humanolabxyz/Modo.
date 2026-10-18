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

// src/study/journeyContent.ts
var journeyContent_exports = {};
__export(journeyContent_exports, {
  journeys: () => journeys
});
module.exports = __toCommonJS(journeyContent_exports);
var journeys = {
  "objetivos-fallas": {
    title: "\xBFSobrecarga o cortocircuito?",
    hook: "El cable se calienta en ambos casos. La pista est\xE1 en qu\xE9 provoc\xF3 la corriente.",
    idea: "Sobrecarga: la carga exige m\xE1s corriente de la normal. Cortocircuito: aparece un camino de muy baja impedancia, por ejemplo al perderse la aislaci\xF3n.",
    experiment: "Compara la corriente en sobrecarga y cortocircuito, como en la l\xE1mina 3 del profesor.",
    question: "Se pierde la aislaci\xF3n del motor. \xBFQu\xE9 falla describe un camino de muy baja impedancia?",
    given: "Caso conceptual del material docente.",
    options: ["Sobrecarga", "Cortocircuito", "Sobretensi\xF3n"],
    correct: "1",
    explanation: "Es cortocircuito: la pista es el camino de muy baja impedancia. El calor puede aparecer tambi\xE9n en una sobrecarga, as\xED que no basta para distinguirlos."
  },
  coordinacion: {
    title: "\xBFEste interruptor cuida el cable?",
    hook: "Subir los amperes del interruptor puede resolver una condici\xF3n y romper otra.",
    idea: "La nominal debe admitir la carga sin superar la capacidad corregida del cable: In \u2264 Ip \u2264 Iz. En la gu\xEDa, In es la corriente de carga.",
    experiment: "Cambia solo la nominal de la protecci\xF3n. La carga y el cable permanecen iguales.",
    question: "Con estos valores, \xBFqu\xE9 condici\xF3n falla?",
    given: "Carga 18 A \xB7 Protecci\xF3n 32 A \xB7 Cable corregido 25 A. Variante did\xE1ctica.",
    options: ["La protecci\xF3n es menor que la carga", "La protecci\xF3n supera la capacidad del cable", "Las dos condiciones se cumplen"],
    correct: "1",
    explanation: "18 \u2264 32 se cumple, pero 32 \u2264 25 es falso. La protecci\xF3n supera la capacidad corregida del conductor. Cumplir la regla tampoco sustituye las verificaciones de corte y energ\xEDa pasante."
  },
  termomagnetico: {
    title: "\xBFQu\xE9 cambia al elegir B, C o D?",
    hook: "La letra cambia la banda magn\xE9tica. No indica que un interruptor sea mejor para todo.",
    idea: "El t\xE9rmico responde a sobrecarga; el magn\xE9tico, a cortocircuito suficientemente elevado. Las bandas B/C/D son m\xFAltiplos de la nominal, no tiempos de disparo.",
    experiment: "Elige una curva y mueve la corriente nominal. Observa los dos extremos de la banda.",
    question: "Un ejemplo C de 16 A: \xBFqu\xE9 banda magn\xE9tica obtienes?",
    given: "Curva C = 5\u201310 \xD7 nominal, seg\xFAn l\xE1mina 8. Nominal supuesta: 16 A.",
    options: ["80\u2013160 A", "48\u201380 A", "160\u2013320 A"],
    correct: "0",
    explanation: "5 \xD7 16 = 80 A y 10 \xD7 16 = 160 A. Es una banda magn\xE9tica. Para tiempos, arranque y selecci\xF3n necesitas la curva completa y las condiciones del fabricante."
  },
  fusibles: {
    title: "\xBFQu\xE9 significa 200 kA en un fusible?",
    hook: "Tres cifras de la placa responden a tres preguntas diferentes.",
    idea: "Nominal, tensi\xF3n y ruptura no son intercambiables. La forma del cartucho tampoco determina su clase ni su rapidez: eso se confirma en ficha.",
    experiment: "Toca cada dato de la placa did\xE1ctica y descubre qu\xE9 debes comparar.",
    question: "\xBFQu\xE9 representa 200 kA en este ejemplo?",
    given: "Placa textual de la l\xE1mina 10: 50 A \xB7 700 V CA/CC \xB7 200 kA. No identifica los objetos fotografiados.",
    options: ["La corriente continua de funcionamiento", "La tensi\xF3n m\xE1xima", "La capacidad de ruptura"],
    correct: "2",
    explanation: "200 kA es capacidad de ruptura: se compara con la corriente de falla prevista y las capacidades espec\xEDficas aplicables. La nominal del ejemplo es 50 A; la tensi\xF3n se expresa en V."
  },
  conductores: {
    title: "\xBFPor qu\xE9 un cable de 30 A queda en 21,6 A?",
    hook: "La temperatura y el agrupamiento cambian la capacidad disponible.",
    idea: "La coordinaci\xF3n usa la capacidad corregida: Iz = Itabla \xD7 fT \xD7 fG. Los factores se multiplican; no se suman ni son corrientes en amperes.",
    experiment: "Mueve el factor de temperatura. Comprueba cu\xE1nto cambia la capacidad del mismo cable.",
    question: "Calcula la capacidad corregida Iz.",
    given: "Ejemplo de la l\xE1mina 12: Itabla = 30 A \xB7 fT = 0,9 \xB7 fG = 0,8.",
    correct: "21.6",
    unit: "A",
    explanation: "0,9 \xD7 0,8 = 0,72; despu\xE9s 30 \xD7 0,72 = 21,6 A. Es la capacidad corregida. Ca\xEDda de tensi\xF3n y resistencia al cortocircuito siguen siendo comprobaciones separadas."
  },
  guardamotor: {
    title: "\xBFQu\xE9 rango necesita este motor?",
    hook: "Elegir el rango y ajustar el t\xE9rmico son dos decisiones diferentes.",
    idea: "Lee la corriente de placa, elige un rango que la incluya y ajusta seg\xFAn fabricante. Despu\xE9s comprueba arranque, magn\xE9tico y poder de corte.",
    experiment: "Alterna los dos rangos y compara sus l\xEDmites con la placa ficticia de 6,3 A.",
    question: "\xBFQu\xE9 rango incluye los 6,3 A de placa?",
    given: "Motor y rangos ficticios. M\xE9todo de selecci\xF3n de la l\xE1mina 13.",
    options: ["6\u201310 A", "4\u20136 A", "10\u201316 A"],
    correct: "0",
    explanation: "6 \u2264 6,3 \u2264 10. El rango 4\u20136 A no llega a 6,3 A y el 10\u201316 A empieza por encima. En el ejemplo se ajusta a 6,3 A, no al m\xE1ximo del rango. El dial t\xE9rmico no representa un magn\xE9tico ajustable universal."
  },
  "tierra-sobretension": {
    title: "\xBFPico de tensi\xF3n o corriente de fuga?",
    hook: "SPD y diferencial est\xE1n en el tablero, pero responden a fen\xF3menos distintos.",
    idea: "El SPD limita sobretensiones transitorias. El diferencial detecta desequilibrio por fuga; no sustituye la protecci\xF3n contra sobrecorriente.",
    experiment: "Elige fuga y cambia la corriente de vuelta. Compara la diferencia con la corriente de ida.",
    question: "Si salen 10 A y vuelven 9,97 A, \xBFcu\xE1ntos mA de desequilibrio hay?",
    given: "Datos supuestos para comprender la funci\xF3n de la l\xE1mina 14.",
    correct: "30",
    unit: "mA",
    explanation: "|10 \u2212 9,97| = 0,03 A. Multiplica por 1000: 30 mA. Es un c\xE1lculo conceptual; no determina tiempo ni garantiza actuaci\xF3n de un equipo real."
  },
  "motor-trifasico": {
    title: "De 5,5 kW a la corriente del motor",
    hook: "No basta dividir potencia por tensi\xF3n. Primero identifica qu\xE9 potencia tienes.",
    idea: "Para potencia mec\xE1nica de salida: In = Psalida / (\u221A3 VLL \u03B7 cos\u03C6). La potencia va en W; rendimiento y factor de potencia, como fracciones.",
    experiment: "Cambia solo el rendimiento. Predice si la corriente sube o baja y compru\xE9balo.",
    question: "Calcula la corriente de este motor supuesto.",
    given: "5,5 kW de salida \xB7 400 V entre l\xEDneas \xB7 \u03B7 = 0,88 \xB7 cos\u03C6 = 0,83. La l\xE1mina 15 deja los valores por completar.",
    correct: "10.87",
    unit: "A",
    explanation: "5,5 kW = 5500 W. \u221A3 \xD7 400 \xD7 0,88 \xD7 0,83 \u2248 506,04; 5500 / 506,04 \u2248 10,87 A. Compara con placa; todav\xEDa faltan arranque, Icc y datos del conductor."
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  journeys
});
