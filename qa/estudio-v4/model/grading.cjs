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

// src/study/grading.ts
var grading_exports = {};
__export(grading_exports, {
  answerBank: () => answerBank,
  developmentBank: () => developmentBank,
  gradeAlternative: () => gradeAlternative
});
module.exports = __toCommonJS(grading_exports);

// src/study/content/preguntas_alternativas_32.json
var preguntas_alternativas_32_default = {
  description: "32 preguntas originales de pr\xE1ctica, rotaci\xF3n sugerida por tema y dificultad; no corresponden a la prueba oficial.",
  count: 32,
  questions: [
    {
      id: "ALT-01",
      theme: "fallas",
      slides: [
        3
      ],
      question: "Un motor exige m\xE1s corriente de la normal durante un tiempo y el conductor se calienta. \xBFQu\xE9 falla describe?",
      options: [
        "Cortocircuito, porque el calentamiento es el mismo.",
        "Sobrecarga, porque la carga exige m\xE1s de lo normal.",
        "Sobretensi\xF3n, porque aumenta la corriente de la red.",
        "Falla a tierra, porque el conductor se calienta."
      ],
      correct_index: 1,
      explanation: "Es sobrecarga: la causa es una exigencia de la carga superior a la normal. El calor tambi\xE9n aparece en un cortocircuito, as\xED que no basta para clasificar. L\xE1mina 3.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-02",
      theme: "fallas",
      slides: [
        3
      ],
      question: "\xBFQu\xE9 caracteriza a un cortocircuito?",
      options: [
        "Camino de muy baja impedancia con corriente potencialmente elevada.",
        "Aumento gradual de la corriente porque la carga pide m\xE1s potencia.",
        "Elevaci\xF3n breve de la tensi\xF3n por una maniobra o una descarga.",
        "Corriente que retorna por tierra y desequilibra ida y vuelta."
      ],
      correct_index: 0,
      explanation: "El cortocircuito crea un camino de baja impedancia, seg\xFAn la diapositiva 3.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-03",
      theme: "fallas",
      slides: [
        4
      ],
      question: "\xBFQu\xE9 efectos menciona la presentaci\xF3n para un cortocircuito?",
      options: [
        "Arco el\xE9ctrico, humedad y oxidaci\xF3n del conductor.",
        "Calor, vibraci\xF3n mec\xE1nica y ruido del contactor.",
        "Arco el\xE9ctrico, calor y esfuerzos magn\xE9ticos.",
        "Sobretensi\xF3n, calor y esfuerzos de torsi\xF3n."
      ],
      correct_index: 2,
      explanation: "En la diapositiva 4 se explican estos tres efectos.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-04",
      theme: "fallas",
      slides: [
        2
      ],
      question: "\xBFCu\xE1les son objetivos de las protecciones el\xE9ctricas?",
      options: [
        "Reducir el consumo de energ\xEDa y el costo de la instalaci\xF3n.",
        "Facilitar el arranque de motores sin limitar la corriente.",
        "Evitar toda interrupci\xF3n del servicio, aunque la falla contin\xFAe.",
        "Cuidar personas e instalaciones y dar continuidad si es posible."
      ],
      correct_index: 3,
      explanation: "La diapositiva 2 divide objetivos en personas, instalaciones y continuidad.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-05",
      theme: "coordinacion",
      slides: [
        6
      ],
      question: "Con una carga In = 18 A y un cable con Iz = 21,6 A, \xBFqu\xE9 nominal Ip cumple In \u2264 Ip \u2264 Iz?",
      options: [
        "Ip = 16 A",
        "Ip = 20 A",
        "Ip = 25 A",
        "Ip = 32 A"
      ],
      correct_index: 1,
      explanation: "Ip debe estar entre 18 A y 21,6 A: solo 20 A cumple. 16 A es menor que la carga; 25 A y 32 A superan la capacidad corregida del cable. Todav\xEDa faltan poder de corte y energ\xEDa pasante. L\xE1mina 6.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-06",
      theme: "coordinacion",
      slides: [
        6
      ],
      question: "Si In=18 A, Ip=20 A e Iz=25 A, \xBFqu\xE9 ocurre con la regla b\xE1sica de coordinaci\xF3n?",
      options: [
        "No cumple, porque Ip deber\xEDa ser igual a In.",
        "No cumple, porque Ip supera la corriente de carga.",
        "Cumple las dos condiciones: 18 \u2264 20 y 20 \u2264 25.",
        "Cumple, y por eso la selecci\xF3n completa ya queda aprobada."
      ],
      correct_index: 2,
      explanation: "18 \u2264 20 \u2264 25 satisface la desigualdad did\xE1ctica. No verifica por s\xED sola poder de corte.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-07",
      theme: "coordinacion",
      slides: [
        6
      ],
      question: "Si In=22 A, Ip=20 A e Iz=25 A, \xBFqu\xE9 falla?",
      options: [
        "Falla In \u2264 Ip: la protecci\xF3n es menor que la carga.",
        "Falla Ip \u2264 Iz: la protecci\xF3n supera el cable.",
        "Fallan In \u2264 Ip e Ip \u2264 Iz a la vez.",
        "No falla ninguna: 20 A queda entre 22 A y 25 A."
      ],
      correct_index: 0,
      explanation: "Debe cumplirse In \u2264 Ip. Aqu\xED 22 > 20.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-08",
      theme: "coordinacion",
      slides: [
        6
      ],
      question: "Adem\xE1s de la desigualdad de corriente, \xBFqu\xE9 debe cubrir el poder de corte?",
      options: [
        "La corriente de carga durante el servicio normal.",
        "La capacidad de corriente corregida del conductor.",
        "La corriente nominal elegida para la protecci\xF3n.",
        "La corriente de cortocircuito prevista en el punto."
      ],
      correct_index: 3,
      explanation: "La diapositiva 6 exige poder de corte adecuado.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-09",
      theme: "termomagnetico",
      slides: [
        8
      ],
      question: "\xBFQu\xE9 elemento del termomagn\xE9tico responde a sobrecargas?",
      options: [
        "Magn\xE9tico.",
        "T\xE9rmico.",
        "SPD.",
        "Diferencial."
      ],
      correct_index: 1,
      explanation: "La diapositiva 8 indica t\xE9rmico para sobrecarga.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-10",
      theme: "termomagnetico",
      slides: [
        8
      ],
      question: "\xBFQu\xE9 elemento responde a un cortocircuito suficientemente elevado?",
      options: [
        "Magn\xE9tico.",
        "T\xE9rmico.",
        "Diferencial.",
        "SPD."
      ],
      correct_index: 0,
      explanation: "El mecanismo magn\xE9tico responde a corrientes elevadas.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-11",
      theme: "termomagnetico",
      slides: [
        8
      ],
      question: "Un interruptor curva C de 16 A tiene banda magn\xE9tica de 5\u201310 veces la nominal. \xBFQu\xE9 banda resulta?",
      options: [
        "48\u201380 A",
        "160\u2013320 A",
        "80\u2013160 A",
        "5\u201310 A"
      ],
      correct_index: 2,
      explanation: "5 \xD7 16 = 80 A y 10 \xD7 16 = 160 A. 48\u201380 A corresponde a la curva B (3\u20135\xD7) y 160\u2013320 A a la D (10\u201320\xD7). Es una banda magn\xE9tica, no un tiempo de disparo. L\xE1mina 8.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-12",
      theme: "termomagnetico",
      slides: [
        8
      ],
      question: "\xBFQu\xE9 curva se asocia con arranques de corriente elevados?",
      options: [
        "B, asociada a cargas resistivas.",
        "C, asociada a uso general.",
        "Las tres, sin diferencia.",
        "D, asociada a arranques altos."
      ],
      correct_index: 3,
      explanation: "La curva D aparece para altos arranques (10\u201320\xD7), sin reemplazar an\xE1lisis del fabricante.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-13",
      theme: "fusibles",
      slides: [
        10
      ],
      question: "Un fusible indica 50 A \xB7 700 V CA/CC \xB7 200 kA y se eval\xFAa para un circuito de 400 V CA con Icc = 10 kA. \xBFQu\xE9 comparaciones se cumplen?",
      options: [
        "La de tensi\xF3n; la ruptura debe ser igual a la nominal.",
        "Ambas: 700 V \u2265 400 V y 200 kA \u2265 10 kA.",
        "La de ruptura; la tensi\xF3n se compara con 50 A.",
        "Ninguna, porque 50 A no puede compararse con 10 kA."
      ],
      correct_index: 1,
      explanation: "700 \u2265 400 V y 200 \u2265 10 kA se cumplen, suponiendo valores declarados para CA. A\xFAn faltan clase, nominal frente a la carga y energ\xEDa pasante: no es una selecci\xF3n completa. L\xE1mina 10.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-14",
      theme: "fusibles",
      slides: [
        10
      ],
      question: "\xBFQu\xE9 clases se mencionan para proteger semiconductores?",
      options: [
        "gG, la misma clase de conductores.",
        "gG o aR, seg\xFAn el formato.",
        "aR o gR, seg\xFAn la ficha t\xE9cnica.",
        "Ninguna: se elige por la forma exterior."
      ],
      correct_index: 2,
      explanation: "La diapositiva 10 distingue gG (conductores) de aR/gR (semiconductores).",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-15",
      theme: "fusibles",
      slides: [
        9,
        10
      ],
      question: "\xBFPor qu\xE9 no basta con la forma exterior del fusible?",
      options: [
        "Porque la forma no define su clase, su rapidez ni su funci\xF3n.",
        "Porque el formato solo importa en corriente continua.",
        "Porque la ficha t\xE9cnica cubre la nominal pero no la clase.",
        "Porque el material de la carcasa fija la rapidez de actuaci\xF3n."
      ],
      correct_index: 0,
      explanation: "La diapositiva 9 advierte que la forma exterior no define la funci\xF3n.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-16",
      theme: "fusibles",
      slides: [
        10
      ],
      question: "En la diapositiva 10, \xBFqu\xE9 representa 200 kA en el ejemplo de placa?",
      options: [
        "La corriente nominal de uso continuo.",
        "La tensi\xF3n m\xE1xima de servicio.",
        "El tiempo de actuaci\xF3n del fusible.",
        "La capacidad de ruptura declarada."
      ],
      correct_index: 3,
      explanation: "La l\xE1mina rotula expl\xEDcitamente 200 kA como ruptura m\xE1xima del ejemplo de placa.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-17",
      theme: "conductores",
      slides: [
        12
      ],
      question: "Un compa\xF1ero calcula Iz = 30 + 0,85 + 1 = 31,85 A con Itabla = 30 A, fT = 0,85 y fG = 1. \xBFCu\xE1l es el error?",
      options: [
        "Debi\xF3 restar los factores en lugar de sumarlos.",
        "Los factores son multiplicadores sin unidad: Iz = Itabla \xD7 fT \xD7 fG.",
        "Debi\xF3 dividir 30 A entre cada factor.",
        "No hay error: Iz debe quedar mayor que Itabla."
      ],
      correct_index: 1,
      explanation: "Los factores no se suman ni son amperes: Iz = 30 \xD7 0,85 \xD7 1 = 25,5 A. Una capacidad corregida por temperatura nunca deber\xEDa superar la tabulada si fT < 1. L\xE1mina 12.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-18",
      theme: "conductores",
      slides: [
        12
      ],
      question: "Si Itabla=30 A, fT=0,9 y fG=0,8, \xBFcu\xE1l es Iz?",
      options: [
        "27,0 A",
        "28,3 A",
        "21,6 A",
        "30,0 A"
      ],
      correct_index: 2,
      explanation: "30 \xD7 0,9 \xD7 0,8 = 21,6 A.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-19",
      theme: "conductores",
      slides: [
        12
      ],
      question: "Adem\xE1s de la corriente, \xBFqu\xE9 otras comprobaciones del cable aparecen?",
      options: [
        "Ca\xEDda de tensi\xF3n y energ\xEDa de cortocircuito.",
        "Poder de corte de la protecci\xF3n y tensi\xF3n del tablero.",
        "Ca\xEDda de tensi\xF3n y sensibilidad del diferencial.",
        "Temperatura del motor y n\xFAmero de polos."
      ],
      correct_index: 0,
      explanation: "La diapositiva 12 muestra verificaciones de corriente, ca\xEDda de tensi\xF3n y cortocircuito.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-20",
      theme: "conductores",
      slides: [
        12
      ],
      question: "\xBFQu\xE9 representa la expresi\xF3n I\xB2t \u2264 k\xB2S\xB2?",
      options: [
        "La ruptura del fusible frente a la Icc prevista.",
        "El ajuste t\xE9rmico del guardamotor frente a la placa.",
        "La ca\xEDda de tensi\xF3n admisible para la longitud.",
        "Comprobaci\xF3n t\xE9rmica del cable frente al cortocircuito."
      ],
      correct_index: 3,
      explanation: "Se trata de modelo adiab\xE1tico bajo condiciones se\xF1aladas, diapositiva 12.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-21",
      theme: "guardamotor",
      slides: [
        13
      ],
      question: "Un motor tiene 6,3 A de placa (datos ficticios). \xBFQu\xE9 rango t\xE9rmico del guardamotor incluye ese valor?",
      options: [
        "4\u20136 A",
        "6\u201310 A",
        "10\u201316 A",
        "1,6\u20132,5 A"
      ],
      correct_index: 1,
      explanation: "6 \u2264 6,3 \u2264 10: solo 6\u201310 A incluye la corriente de placa. 4\u20136 A queda corto y 10\u201316 A empieza por encima de 6,3 A. Luego se ajusta seg\xFAn fabricante y se comprueban arranque y magn\xE9tico. L\xE1mina 13.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-22",
      theme: "guardamotor",
      slides: [
        13
      ],
      question: "\xBFQu\xE9 se verifica despu\xE9s de seleccionar el rango t\xE9rmico?",
      options: [
        "Que el rango elegido sea el m\xE1s alto disponible.",
        "Que el ajuste quede en el extremo superior del rango.",
        "El arranque, el umbral magn\xE9tico y el poder de corte.",
        "El mando remoto, que reemplaza las dem\xE1s comprobaciones."
      ],
      correct_index: 2,
      explanation: "Es la tercera etapa indicada por el profesor.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-23",
      theme: "guardamotor",
      slides: [
        13
      ],
      question: "Para control remoto, \xBFcon qu\xE9 suele combinarse el guardamotor?",
      options: [
        "Un contactor.",
        "Un diferencial.",
        "Un SPD.",
        "Un fusible gG."
      ],
      correct_index: 0,
      explanation: "El guardamotor normalmente se combina con contactor para mando remoto.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-24",
      theme: "guardamotor",
      slides: [
        13
      ],
      question: "El disparo magn\xE9tico del guardamotor...",
      options: [
        "Se regula con el mismo dial del ajuste t\xE9rmico.",
        "Se regula en cualquier modelo de guardamotor.",
        "No existe: el guardamotor protege contra sobrecarga.",
        "Puede venir fijo de f\xE1brica, seg\xFAn el modelo."
      ],
      correct_index: 3,
      explanation: "La diapositiva 13 lo advierte expresamente.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-25",
      theme: "tierra-sobretension",
      slides: [
        14
      ],
      question: "\xBFQu\xE9 dispositivo limita sobretensiones transitorias?",
      options: [
        "Rel\xE9 t\xE9rmico.",
        "SPD.",
        "Diferencial RCD.",
        "Termomagn\xE9tico."
      ],
      correct_index: 1,
      explanation: "La diapositiva 14 identifica los SPD para sobretensiones.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-26",
      theme: "tierra-sobretension",
      slides: [
        14
      ],
      question: "Salen 10 A y regresan 9,97 A por el circuito conceptual. \xBFQu\xE9 desequilibrio hay y qu\xE9 funci\xF3n lo detecta?",
      options: [
        "30 A \xB7 RCD diferencial",
        "30 mA \xB7 SPD",
        "30 mA \xB7 RCD diferencial",
        "0,03 mA \xB7 RCD diferencial"
      ],
      correct_index: 2,
      explanation: "|10 \u2212 9,97| = 0,03 A = 30 mA. El desequilibrio por fuga lo detecta la funci\xF3n diferencial; el SPD limita sobretensiones transitorias. El c\xE1lculo no determina tiempo de disparo. L\xE1mina 14.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-27",
      theme: "tierra-sobretension",
      slides: [
        14
      ],
      question: "\xBFQu\xE9 sensibilidad habitual menciona la presentaci\xF3n para protecci\xF3n adicional de personas?",
      options: [
        "\u2264 30 mA, seg\xFAn condiciones y normativa.",
        "\u2264 30 A, seg\xFAn condiciones y normativa.",
        "\u2265 300 mA en toda instalaci\xF3n.",
        "\u2264 30 mA, y garantiza protecci\xF3n absoluta."
      ],
      correct_index: 0,
      explanation: "Se menciona \u226430 mA de forma habitual bajo IEC, no como regla universal de todas las instalaciones.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-28",
      theme: "tierra-sobretension",
      slides: [
        14
      ],
      question: "\xBFEl diferencial sustituye la protecci\xF3n de sobrecorriente?",
      options: [
        "S\xED, cuando su sensibilidad es de 30 mA o menos.",
        "S\xED, en los circuitos que alimentan variadores.",
        "S\xED, si hay un SPD instalado aguas arriba.",
        "No: cumple una funci\xF3n distinta, la de la fuga."
      ],
      correct_index: 3,
      explanation: "La diapositiva 14 lo establece.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-29",
      theme: "motor-trifasico",
      slides: [
        15
      ],
      question: "Si P es potencia mec\xE1nica de salida, \xBFqu\xE9 f\xF3rmula utiliza el ejercicio?",
      options: [
        "In = Psalida \xD7 \u221A3 \xD7 VLL \xD7 \u03B7 \xD7 cos\u03C6",
        "In = Psalida / (\u221A3 VLL \u03B7 cos\u03C6)",
        "In = Psalida / (VLL \u03B7 cos\u03C6)",
        "In = Psalida / (\u221A3 VLL)"
      ],
      correct_index: 1,
      explanation: "La diapositiva 15 presenta esta relaci\xF3n para potencia mec\xE1nica de salida.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-30",
      theme: "motor-trifasico",
      slides: [
        15
      ],
      question: "Un motor de 5,5 kW de salida, 400 V entre l\xEDneas, \u03B7 = 0,88 y cos\u03C6 = 0,83 (datos supuestos): \xBFqu\xE9 corriente resulta?",
      options: [
        "7,94 A",
        "18,83 A",
        "10,87 A",
        "13,75 A"
      ],
      correct_index: 2,
      explanation: "5500 / (\u221A3 \xD7 400 \xD7 0,88 \xD7 0,83) \u2248 10,87 A. 13,75 A divide solo por la tensi\xF3n; 7,94 A omite \u03B7 y cos\u03C6; 18,83 A omite \u221A3. Luego se compara con la placa. L\xE1mina 15.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-31",
      theme: "motor-trifasico",
      slides: [
        15
      ],
      question: "Despu\xE9s del c\xE1lculo de corriente, \xBFqu\xE9 indica hacer el profesor?",
      options: [
        "Comparar con la placa y justificar la selecci\xF3n.",
        "Fijar el ajuste con ese valor y omitir la placa.",
        "Elegir el fusible por la potencia en kW.",
        "Omitir el conductor porque la corriente ya est\xE1 calculada."
      ],
      correct_index: 0,
      explanation: "La diapositiva 15 pide comparar la corriente calculada con la de placa y justificar.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    },
    {
      id: "ALT-32",
      theme: "motor-trifasico",
      slides: [
        16
      ],
      question: "\xBFQu\xE9 incluye la lista final de verificaci\xF3n?",
      options: [
        "Potencia, tensi\xF3n, rendimiento y factor de potencia.",
        "Secci\xF3n del cable, longitud y color de la aislaci\xF3n.",
        "Curva del termomagn\xE9tico y n\xFAmero de bornes.",
        "Tensi\xF3n, polos, curva, poder de corte, cable y arranque."
      ],
      correct_index: 3,
      explanation: "La diapositiva 16 resume las verificaciones de selecci\xF3n.",
      origin: "Ejercicio elaborado para estudiar; NO es pregunta oficial"
    }
  ]
};

// src/study/content/preguntas_desarrollo_12.json
var preguntas_desarrollo_12_default = {
  description: "12 preguntas originales de desarrollo con pautas orientativas y respuestas modelo; no corresponden a prueba oficial.",
  count: 12,
  questions: [
    {
      id: "DES-01",
      theme: "fallas",
      slides: [
        3,
        4
      ],
      prompt: "Explica la diferencia entre una sobrecarga y un cortocircuito y menciona sus consecuencias.",
      rubric: [
        "Explico que la sobrecarga es una corriente superior a la normal que recalienta el conductor porque la carga exige m\xE1s.",
        "Explico que el cortocircuito es un camino de muy baja impedancia, por ejemplo por p\xE9rdida de aislaci\xF3n, con una corriente de falla elevada.",
        "Menciono las consecuencias de la l\xE1mina 4: arco el\xE9ctrico, calor y esfuerzos magn\xE9ticos."
      ],
      model_answer: "En una sobrecarga la corriente supera la normal y puede recalentar el conductor. En un cortocircuito aparece un camino de baja impedancia por el que puede circular una corriente muy alta, causando arco el\xE9ctrico, calentamiento y fuerzas magn\xE9ticas capaces de da\xF1ar materiales.",
      grading_policy: "Autoevaluaci\xF3n guiada por conceptos; no usar coincidencia literal ni calificaci\xF3n autom\xE1tica como definitiva.",
      origin: "Simulacro elaborado, no pregunta oficial."
    },
    {
      id: "DES-02",
      theme: "coordinacion",
      slides: [
        5,
        6
      ],
      prompt: "Describe qu\xE9 datos revisar\xEDas antes de seleccionar una protecci\xF3n e interpreta In \u2264 Ip \u2264 Iz.",
      rubric: [
        "Nombro los datos previos: corriente, tensi\xF3n y tipo de carga, y la corriente de cortocircuito prevista.",
        "Incluyo los datos del cable: material, secci\xF3n y capacidad corregida seg\xFAn la instalaci\xF3n.",
        "Interpreto In \u2264 Ip \u2264 Iz (carga, nominal de la protecci\xF3n, capacidad del cable) y aclaro que cumplirla no completa la selecci\xF3n."
      ],
      model_answer: "Primero conozco corriente y tipo de carga, tensi\xF3n, cortocircuito previsto y datos del cable y ambiente. En la notaci\xF3n del profesor In es la corriente de carga, Ip la corriente de protecci\xF3n e Iz la capacidad corregida del cable. La protecci\xF3n debe soportar la carga sin exceder la capacidad del cable. Tambi\xE9n reviso disparo y poder de corte.",
      grading_policy: "Autoevaluaci\xF3n guiada por conceptos; no usar coincidencia literal ni calificaci\xF3n autom\xE1tica como definitiva.",
      origin: "Simulacro elaborado, no pregunta oficial."
    },
    {
      id: "DES-03",
      theme: "termomagnetico",
      slides: [
        7,
        8
      ],
      prompt: "Explica c\xF3mo funciona un interruptor termomagn\xE9tico y los criterios de selecci\xF3n.",
      rubric: [
        "Explico que el elemento t\xE9rmico responde a la sobrecarga.",
        "Explico que el elemento magn\xE9tico responde a un cortocircuito suficientemente elevado.",
        "Enumero los criterios de selecci\xF3n: corriente nominal, tensi\xF3n, polos, curva B/C/D y poder de corte frente a la Icc prevista."
      ],
      model_answer: "El disyuntor termomagn\xE9tico combina un mecanismo t\xE9rmico para sobrecargas y uno magn\xE9tico para cortocircuitos. Seleccionar\xEDa corriente nominal, tensi\xF3n y polos adecuados a la carga, una curva B, C o D seg\xFAn el comportamiento de arranque y un poder de corte no menor que el corto previsto.",
      grading_policy: "Autoevaluaci\xF3n guiada por conceptos; no usar coincidencia literal ni calificaci\xF3n autom\xE1tica como definitiva.",
      origin: "Simulacro elaborado, no pregunta oficial."
    },
    {
      id: "DES-04",
      theme: "fusibles",
      slides: [
        9,
        10
      ],
      prompt: "\xBFC\xF3mo eliges un fusible y por qu\xE9 no basta con su apariencia?",
      rubric: [
        "Digo que la forma exterior no define la funci\xF3n y que hay que identificar la clase seg\xFAn el equipo protegido.",
        "Distingo corriente nominal, tensi\xF3n (CA/CC) y capacidad de ruptura como tres datos diferentes.",
        "Menciono la rapidez de actuaci\xF3n y las clases gG (conductores) y aR o gR (semiconductores), confirmadas en la ficha."
      ],
      model_answer: "La apariencia externa no indica la funci\xF3n. Debo revisar clase de aplicaci\xF3n y tipo de actuaci\xF3n, corriente nominal, tensi\xF3n admisible, poder de ruptura y las caracter\xEDsticas del fabricante. En el material gG se menciona para conductores y aR o gR para semiconductores.",
      grading_policy: "Autoevaluaci\xF3n guiada por conceptos; no usar coincidencia literal ni calificaci\xF3n autom\xE1tica como definitiva.",
      origin: "Simulacro elaborado, no pregunta oficial."
    },
    {
      id: "DES-05",
      theme: "conductores",
      slides: [
        11,
        12
      ],
      prompt: "Calcula Iz con Itabla=30 A, fT=0,9 y fG=0,8; explica qu\xE9 verificaciones faltan.",
      rubric: [
        "Calculo Iz = 30 \xD7 0,9 \xD7 0,8 = 21,6 A, multiplicando los factores y sin sumarlos.",
        "Distingo la capacidad corregida del conductor (Iz) de la corriente nominal de la protecci\xF3n.",
        "Se\xF1alo que faltan la ca\xEDda de tensi\xF3n y la resistencia t\xE9rmica al cortocircuito."
      ],
      model_answer: "La capacidad corregida es Iz=30\xD70,9\xD70,8=21,6 A. Despu\xE9s debo verificar coordinaci\xF3n entre corriente de carga, protecci\xF3n y cable, comprobar ca\xEDda de tensi\xF3n para la longitud y revisar la energ\xEDa de cortocircuito mediante el criterio t\xE9rmico aplicable.",
      grading_policy: "Autoevaluaci\xF3n guiada por conceptos; no usar coincidencia literal ni calificaci\xF3n autom\xE1tica como definitiva.",
      origin: "Simulacro elaborado, no pregunta oficial."
    },
    {
      id: "DES-06",
      theme: "guardamotor",
      slides: [
        13
      ],
      prompt: "Describe c\xF3mo seleccionas y ajustas un guardamotor para un motor.",
      rubric: [
        "Parto de la placa del motor: corriente nominal, tensi\xF3n y conexi\xF3n.",
        "Elijo un rango t\xE9rmico que incluya la corriente de placa y ajusto dentro de \xE9l seg\xFAn el fabricante, sin tomar el extremo del rango.",
        "Indico que faltan arranque, umbral magn\xE9tico y poder de corte, y que el contactor aporta el mando remoto."
      ],
      model_answer: "Leo los datos de placa, especialmente corriente nominal. Elijo un guardamotor cuyo rango t\xE9rmico incluya esa corriente y lo ajusto de acuerdo con el fabricante. Despu\xE9s compruebo tiempo de arranque, disparo magn\xE9tico y poder de corte. Si necesito mando remoto normalmente utilizo contactor.",
      grading_policy: "Autoevaluaci\xF3n guiada por conceptos; no usar coincidencia literal ni calificaci\xF3n autom\xE1tica como definitiva.",
      origin: "Simulacro elaborado, no pregunta oficial."
    },
    {
      id: "DES-07",
      theme: "tierra-sobretension",
      slides: [
        14
      ],
      prompt: "Compara las funciones de SPD y diferencial.",
      rubric: [
        "Explico que el SPD limita sobretensiones transitorias y deriva su corriente.",
        "Explico que el diferencial detecta el desequilibrio entre ida y vuelta provocado por una fuga.",
        "Aclaro que son funciones distintas y que el diferencial no reemplaza la protecci\xF3n contra sobrecorriente."
      ],
      model_answer: "Un SPD limita sobretensiones transitorias y deriva corriente de impulso. El diferencial detecta desequilibrio por fuga a tierra y puede aportar protecci\xF3n adicional a personas con sensibilidad adecuada. Son funciones diferentes; el diferencial no sustituye protecci\xF3n contra sobrecorrientes.",
      grading_policy: "Autoevaluaci\xF3n guiada por conceptos; no usar coincidencia literal ni calificaci\xF3n autom\xE1tica como definitiva.",
      origin: "Simulacro elaborado, no pregunta oficial."
    },
    {
      id: "DES-08",
      theme: "motor-trifasico",
      slides: [
        15
      ],
      prompt: "Escribe y explica la f\xF3rmula de corriente de un motor trif\xE1sico cuando P es potencia mec\xE1nica de salida.",
      rubric: [
        "Escribo In = Psalida / (\u221A3 VLL \u03B7 cos\u03C6).",
        "Indico las unidades: potencia en W, tensi\xF3n entre l\xEDneas en V, y \u03B7 y cos\u03C6 como fracciones.",
        "Comparo el resultado con la placa y menciono lo que sigue: guardamotor, termomagn\xE9tico y conductor."
      ],
      model_answer: "La corriente se calcula como In = Psalida / (\u221A3 VLL \u03B7 cos\u03C6), usando potencia en watts, tensi\xF3n entre l\xEDneas en volts, rendimiento y factor de potencia. Luego comparo con placa y verifico guardamotor, termomagn\xE9tico, cable y corriente de falla.",
      grading_policy: "Autoevaluaci\xF3n guiada por conceptos; no usar coincidencia literal ni calificaci\xF3n autom\xE1tica como definitiva.",
      origin: "Simulacro elaborado, no pregunta oficial."
    },
    {
      id: "DES-09",
      theme: "coordinacion",
      slides: [
        6,
        12
      ],
      prompt: "Para In=18 A, Ip=20 A, Iz=21,6 A, comprueba coordinaci\xF3n y explica qu\xE9 no valida todav\xEDa.",
      rubric: [
        "Compruebo las dos relaciones: 18 \u2264 20 y 20 \u2264 21,6.",
        "Concluyo que la coordinaci\xF3n b\xE1sica de corrientes se cumple.",
        "Aclaro que faltan poder de corte, disparo, energ\xEDa pasante y ca\xEDda de tensi\xF3n."
      ],
      model_answer: "La relaci\xF3n de coordinaci\xF3n se cumple porque 18 \u2264 20 \u2264 21,6 A. Sin embargo, eso no demuestra por s\xED solo una instalaci\xF3n segura: faltan verificar poder de corte, condiciones de disparo, cortocircuito, ca\xEDda de tensi\xF3n y condiciones reales del conductor.",
      grading_policy: "Autoevaluaci\xF3n guiada por conceptos; no usar coincidencia literal ni calificaci\xF3n autom\xE1tica como definitiva.",
      origin: "Simulacro elaborado, no pregunta oficial."
    },
    {
      id: "DES-10",
      theme: "termomagnetico",
      slides: [
        8
      ],
      prompt: "Compara las curvas B, C y D y explica por qu\xE9 importa la corriente de arranque.",
      rubric: [
        "Indico que la curva B act\xFAa entre 3 y 5 veces la nominal.",
        "Indico que la curva C act\xFAa entre 5 y 10 veces la nominal.",
        "Indico que la D va de 10 a 20 veces y explico que la curva se elige seg\xFAn los picos de arranque, verificando la ficha del fabricante."
      ],
      model_answer: "Las curvas muestran distintos umbrales de disparo magn\xE9tico: B 3\u20135 veces la nominal, C 5\u201310, D 10\u201320. Elegirla depende del tipo de carga y los picos de arranque; siempre deben verificarse curvas y condiciones reales del fabricante.",
      grading_policy: "Autoevaluaci\xF3n guiada por conceptos; no usar coincidencia literal ni calificaci\xF3n autom\xE1tica como definitiva.",
      origin: "Simulacro elaborado, no pregunta oficial."
    },
    {
      id: "DES-11",
      theme: "conductores",
      slides: [
        11,
        12
      ],
      prompt: "Explica qu\xE9 factores influyen en elegir la secci\xF3n de un cable.",
      rubric: [
        "Menciono que la capacidad depende del material, la aislaci\xF3n y el m\xE9todo de instalaci\xF3n.",
        "Menciono la correcci\xF3n por temperatura y por agrupamiento.",
        "Separo tres comprobaciones: corriente, ca\xEDda de tensi\xF3n y cortocircuito."
      ],
      model_answer: "Se revisa capacidad de corriente seg\xFAn material, aislaci\xF3n y m\xE9todo de instalaci\xF3n, corrigiendo por temperatura y agrupamiento. Luego se comprueba ca\xEDda de tensi\xF3n y resistencia t\xE9rmica frente al cortocircuito hasta la actuaci\xF3n de la protecci\xF3n.",
      grading_policy: "Autoevaluaci\xF3n guiada por conceptos; no usar coincidencia literal ni calificaci\xF3n autom\xE1tica como definitiva.",
      origin: "Simulacro elaborado, no pregunta oficial."
    },
    {
      id: "DES-12",
      theme: "objetivos",
      slides: [
        2,
        16
      ],
      prompt: "Resume los criterios que seguir\xEDas al revisar una selecci\xF3n final de protecciones.",
      rubric: [
        "Reviso corriente, tensi\xF3n, polos, curva y poder de corte de la protecci\xF3n.",
        "Verifico la coordinaci\xF3n con la carga y las comprobaciones del cable: corriente, ca\xEDda de tensi\xF3n y cortocircuito.",
        "Considero guardamotor y arranque, y el SPD o el diferencial seg\xFAn el riesgo y la normativa."
      ],
      model_answer: "Comprobar\xEDa corriente, tensi\xF3n, polos, curva y poder de corte; verificar\xEDa coordinaci\xF3n con carga y cable; revisar\xEDa ca\xEDda de tensi\xF3n y energ\xEDa de cortocircuito; confirmar\xEDa ajustes y arranque del motor, riesgos de fuga y sobretensi\xF3n, normativa y ficha de fabricante.",
      grading_policy: "Autoevaluaci\xF3n guiada por conceptos; no usar coincidencia literal ni calificaci\xF3n autom\xE1tica como definitiva.",
      origin: "Simulacro elaborado, no pregunta oficial."
    }
  ]
};

// src/study/grading.ts
var answerBank = preguntas_alternativas_32_default.questions;
var developmentBank = preguntas_desarrollo_12_default.questions;
function gradeAlternative(id, answer) {
  const q = answerBank.find((q2) => q2.id === id);
  return !!q && answer === String(q.correct_index);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  answerBank,
  developmentBank,
  gradeAlternative
});
