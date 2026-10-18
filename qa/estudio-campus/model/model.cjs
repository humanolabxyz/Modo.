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

// src/study/model.ts
var model_exports = {};
__export(model_exports, {
  STORAGE_KEY: () => STORAGE_KEY,
  alternatives: () => alternatives,
  cableCapacity: () => cableCapacity,
  cases: () => cases,
  coordination: () => coordination,
  developments: () => developments,
  fmt: () => fmt,
  freshState: () => freshState,
  lessonStatus: () => lessonStatus,
  lessons: () => lessons,
  motorCurrent: () => motorCurrent,
  newExam: () => newExam,
  numberValue: () => numberValue,
  readState: () => readState,
  themeFor: () => themeFor,
  topicFor: () => topicFor
});
module.exports = __toCommonJS(model_exports);

// src/study/content/lecciones.json
var lecciones_default = {
  metadata: {
    course: "M\xE1quinas Rotativas / Protecciones el\xE9ctricas",
    source: "protecciones.pptx, J. A. Lepin Quezada, 7-10-2026",
    source_type: "docente",
    user_exam_format: "8 alternativas + 3 desarrollo (informado por estudiante; no consignado en presentaci\xF3n)",
    caveat: "Ninguna lecci\xF3n constituye procedimiento para manipular equipos energizados."
  },
  lessons: [
    {
      id: "objetivos-fallas",
      title: "Reconocer las fallas",
      slides: [
        2,
        3,
        4
      ],
      duration_min: 12,
      concepts: [
        "protecci\xF3n de personas, instalaciones y servicio",
        "sobrecarga",
        "cortocircuito",
        "arco, calor y esfuerzo magn\xE9tico"
      ],
      visual: "Circuito did\xE1ctico con selector de situaci\xF3n: normal / sobrecarga / cortocircuito. Gr\xE1fica temporal cualitativa de corriente y consecuencias sin datos ficticios.",
      actions: [
        "cambiar escenario",
        "se\xF1alar consecuencias",
        "clasificar fen\xF3menos"
      ],
      learning_outcome: "Explica por qu\xE9 una sobrecarga no equivale a un cortocircuito y enumera los tres efectos descritos en la diapositiva 4.",
      note: "El gr\xE1fico de diapositiva 3 es conceptual; sus barras no son escala ni medici\xF3n de un equipo real."
    },
    {
      id: "coordinacion",
      title: "Coordinar carga, protecci\xF3n y conductor",
      slides: [
        5,
        6
      ],
      duration_min: 14,
      concepts: [
        "datos de carga",
        "cortocircuito previsto",
        "corriente soportada por conductor",
        "In \u2264 Ip \u2264 Iz",
        "poder de corte"
      ],
      visual: "Tres bloques dimensionados por corriente, con valores editables In, Ip, Iz; evaluar desigualdad y explicar cada incumplimiento.",
      actions: [
        "ajustar valores",
        "verificar desigualdad",
        "inspeccionar datos faltantes"
      ],
      learning_outcome: "Justifica la selecci\xF3n did\xE1ctica 18 A \u2264 20 A \u2264 25 A sin confundir esa condici\xF3n con aprobaci\xF3n completa de la instalaci\xF3n.",
      note: "El poder de corte y energ\xEDa pasante se comprueban por separado."
    },
    {
      id: "termomagnetico",
      title: "Interruptor termomagn\xE9tico",
      slides: [
        7,
        8
      ],
      duration_min: 15,
      concepts: [
        "funci\xF3n t\xE9rmica",
        "funci\xF3n magn\xE9tica",
        "polos",
        "tensi\xF3n",
        "curva B 3\u20135 \xD7 In",
        "curva C 5\u201310 \xD7 In",
        "curva D 10\u201320 \xD7 In",
        "poder de corte"
      ],
      visual: "Ilustraci\xF3n vectorial explotable del interruptor, sus dos mecanismos e interacci\xF3n con tres bandas de disparo B/C/D.",
      actions: [
        "alternar sobrecarga/cortocircuito",
        "seleccionar curva",
        "ver rangos",
        "elegir poder de corte adecuado en un ejemplo completo"
      ],
      learning_outcome: "Distingue los dos mecanismos y explica qu\xE9 revisa antes de seleccionar un termomagn\xE9tico.",
      note: "Rangos de disparo magn\xE9tico seg\xFAn IEC 60898-1 y la presentaci\xF3n; no sustituir curvas del fabricante."
    },
    {
      id: "fusibles",
      title: "Fusibles",
      slides: [
        9,
        10
      ],
      duration_min: 12,
      concepts: [
        "tipo r\xE1pido/retardado",
        "corriente nominal",
        "tensi\xF3n m\xE1xima",
        "capacidad de ruptura",
        "gG",
        "aR",
        "gR"
      ],
      visual: "Cartuchos comparables seleccionables con ficha de datos; identificar la etiqueta 50 A, 700 V CA/CC, 200 kA como ejemplo de placa (NO del objeto de la foto).",
      actions: [
        "leer datos de placa",
        "elegir clase de aplicaci\xF3n",
        "comparar opciones"
      ],
      learning_outcome: "Explica qu\xE9 datos de un fusible deben revisarse, m\xE1s all\xE1 de su forma externa.",
      note: "El ejemplo 50 A / 700 V / 200 kA de diapositiva 10 no identifica los fusibles fotografiados."
    },
    {
      id: "conductores",
      title: "Conductores y verificaciones",
      slides: [
        11,
        12
      ],
      duration_min: 16,
      concepts: [
        "Iz = Itabla\xB7fT\xB7fG",
        "temperatura y agrupamiento",
        "ca\xEDda de tensi\xF3n",
        "I\xB2t \u2264 k\xB2S\xB2",
        "material/aislaci\xF3n/instalaci\xF3n"
      ],
      visual: "Cable ilustrado y tres verificaciones independientes con c\xE1lculo editable de ampacidad corregida.",
      actions: [
        "cambiar Itabla, fT y fG",
        "evaluar corriente de protecci\xF3n",
        "revisar otros criterios pendientes"
      ],
      learning_outcome: "Calcula 30\xD70,9\xD70,8 = 21,6 A y explica qu\xE9 otras verificaciones exige el profesor.",
      note: "La ca\xEDda de tensi\xF3n y la verificaci\xF3n t\xE9rmica requieren datos no incluidos en el ejemplo corto."
    },
    {
      id: "guardamotor",
      title: "Guardamotor y placa de motor",
      slides: [
        13
      ],
      duration_min: 18,
      concepts: [
        "corriente nominal de placa",
        "tensi\xF3n y conexi\xF3n",
        "rango del t\xE9rmico",
        "arranque y disparo magn\xE9tico",
        "poder de corte",
        "contactor para mando remoto"
      ],
      visual: "Motor con placa ampliable y guardamotor ilustrado con dial que permite ajustes compatibles con su rango ficticio etiquetado como ejercicio.",
      actions: [
        "leer placa de ejemplo",
        "ajustar dial",
        "detectar rangos incompatibles",
        "ver diferencia con contactor"
      ],
      learning_outcome: "Describe las tres etapas de selecci\xF3n: placa, ajuste del t\xE9rmico y verificaci\xF3n del arranque.",
      note: "El magn\xE9tico puede ser fijo; los rangos reales deben depender del fabricante."
    },
    {
      id: "tierra-sobretension",
      title: "Falla a tierra y sobretensi\xF3n",
      slides: [
        14
      ],
      duration_min: 12,
      concepts: [
        "SPD",
        "sobretensi\xF3n transitoria",
        "RCD/GFCI",
        "fuga",
        "30 mA protecci\xF3n adicional seg\xFAn presentaci\xF3n",
        "no sustituci\xF3n protecci\xF3n sobrecorriente"
      ],
      visual: "Dos escenas lado a lado: sobretensi\xF3n por maniobra y fuga a tierra; al activar cada una, resaltar dispositivo correspondiente.",
      actions: [
        "identificar falla",
        "comparar SPD/diferencial",
        "ver advertencia de compatibilidad con variadores"
      ],
      learning_outcome: "Explica por qu\xE9 SPD y RCD resuelven fen\xF3menos distintos.",
      note: "La diapositiva indica sensibilidad \u226430 mA habitual bajo IEC para protecci\xF3n adicional de personas y exige normativa vigente."
    },
    {
      id: "motor-trifasico",
      title: "C\xE1lculo de motor trif\xE1sico",
      slides: [
        15,
        16
      ],
      duration_min: 20,
      concepts: [
        "corriente de potencia mec\xE1nica de salida",
        "Pout / (\u221A3\xB7VLL\xB7\u03B7\xB7cos \u03C6)",
        "comparar con placa",
        "seleccionar protecciones",
        "verificar cable",
        "documentar supuestos"
      ],
      visual: "Motor ilustrado, placa simulada de ejercicio, calculadora con cuatro datos y comparaci\xF3n guiada con criterio de selecci\xF3n.",
      actions: [
        "ingresar datos",
        "ver f\xF3rmula con unidades",
        "calcular corriente",
        "continuar con coordinaci\xF3n",
        "marcar verificaciones pendientes"
      ],
      learning_outcome: "Calcula corriente trif\xE1sica cuando se conocen todos los datos y justifica verificaciones posteriores.",
      note: "La presentaci\xF3n deja vac\xEDos los datos num\xE9ricos de la diapositiva 15; los valores de los ejercicios deben se\xF1alarse como supuestos."
    }
  ]
};

// src/study/content/preguntas-publicas.json
var preguntas_publicas_default = {
  alternatives: [
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
    }
  ],
  developments: [
    {
      id: "DES-01",
      theme: "fallas",
      slides: [
        3,
        4
      ],
      prompt: "Explica la diferencia entre una sobrecarga y un cortocircuito y menciona sus consecuencias."
    },
    {
      id: "DES-02",
      theme: "coordinacion",
      slides: [
        5,
        6
      ],
      prompt: "Describe qu\xE9 datos revisar\xEDas antes de seleccionar una protecci\xF3n e interpreta In \u2264 Ip \u2264 Iz."
    },
    {
      id: "DES-03",
      theme: "termomagnetico",
      slides: [
        7,
        8
      ],
      prompt: "Explica c\xF3mo funciona un interruptor termomagn\xE9tico y los criterios de selecci\xF3n."
    },
    {
      id: "DES-04",
      theme: "fusibles",
      slides: [
        9,
        10
      ],
      prompt: "\xBFC\xF3mo eliges un fusible y por qu\xE9 no basta con su apariencia?"
    },
    {
      id: "DES-05",
      theme: "conductores",
      slides: [
        11,
        12
      ],
      prompt: "Calcula Iz con Itabla=30 A, fT=0,9 y fG=0,8; explica qu\xE9 verificaciones faltan."
    },
    {
      id: "DES-06",
      theme: "guardamotor",
      slides: [
        13
      ],
      prompt: "Describe c\xF3mo seleccionas y ajustas un guardamotor para un motor."
    },
    {
      id: "DES-07",
      theme: "tierra-sobretension",
      slides: [
        14
      ],
      prompt: "Compara las funciones de SPD y diferencial."
    },
    {
      id: "DES-08",
      theme: "motor-trifasico",
      slides: [
        15
      ],
      prompt: "Escribe y explica la f\xF3rmula de corriente de un motor trif\xE1sico cuando P es potencia mec\xE1nica de salida."
    },
    {
      id: "DES-09",
      theme: "coordinacion",
      slides: [
        6,
        12
      ],
      prompt: "Para In=18 A, Ip=20 A, Iz=21,6 A, comprueba coordinaci\xF3n y explica qu\xE9 no valida todav\xEDa."
    },
    {
      id: "DES-10",
      theme: "termomagnetico",
      slides: [
        8
      ],
      prompt: "Compara las curvas B, C y D y explica por qu\xE9 importa la corriente de arranque."
    },
    {
      id: "DES-11",
      theme: "conductores",
      slides: [
        11,
        12
      ],
      prompt: "Explica qu\xE9 factores influyen en elegir la secci\xF3n de un cable."
    },
    {
      id: "DES-12",
      theme: "objetivos",
      slides: [
        2,
        16
      ],
      prompt: "Resume los criterios que seguir\xEDas al revisar una selecci\xF3n final de protecciones."
    }
  ]
};

// src/study/content/casos_interactivos_7.json
var casos_interactivos_7_default = {
  cases: [
    {
      id: "COORD-01",
      topic: "coordinacion",
      slides: [
        6
      ],
      given: {
        In_A: 18,
        Ip_A: 20,
        Iz_A: 25
      },
      formula: "In \u2264 Ip \u2264 Iz",
      expected: {
        basic_coordination: true
      },
      missing: [
        "Icc",
        "poder de corte",
        "desconexi\xF3n",
        "energ\xEDa pasante"
      ],
      explanation: "18\u226420\u226425; otros criterios pendientes."
    },
    {
      id: "COORD-02",
      topic: "coordinacion",
      slides: [
        6
      ],
      given: {
        In_A: 18,
        Ip_A: 32,
        Iz_A: 25
      },
      formula: "In \u2264 Ip \u2264 Iz",
      expected: {
        basic_coordination: false,
        reason: "Ip supera Iz"
      },
      explanation: "32 A > 25 A, riesgo de dejar el cable sin protecci\xF3n adecuada ante sobrecorrientes."
    },
    {
      id: "COORD-03",
      topic: "coordinacion",
      slides: [
        6
      ],
      given: {
        In_A: 22,
        Ip_A: 20,
        Iz_A: 25
      },
      formula: "In \u2264 Ip \u2264 Iz",
      expected: {
        basic_coordination: false,
        reason: "Ip inferior a In"
      },
      explanation: "La protecci\xF3n tiene corriente nominal inferior a la corriente de carga."
    },
    {
      id: "CABLE-01",
      topic: "conductores",
      slides: [
        12
      ],
      given: {
        Itabla_A: 30,
        fT: 0.9,
        fG: 0.8
      },
      formula: "Iz=Itabla\xB7fT\xB7fG",
      expected: {
        Iz_A: 21.6
      },
      explanation: "Se aplica la correcci\xF3n por temperatura y agrupamiento."
    },
    {
      id: "CABLE-02",
      topic: "conductores",
      slides: [
        12
      ],
      given: {
        Itabla_A: 40,
        fT: 0.85,
        fG: 0.75
      },
      formula: "Iz=Itabla\xB7fT\xB7fG",
      expected: {
        Iz_A: 25.5
      },
      origin: "Supuesto did\xE1ctico adicional",
      explanation: "40\xD70,85\xD70,75=25,5 A; quedan otras verificaciones."
    },
    {
      id: "MOTOR-01",
      topic: "motor-trifasico",
      slides: [
        15
      ],
      given: {
        Pout_kW: 5.5,
        VLL_V: 400,
        eta: 0.88,
        cosphi: 0.83
      },
      formula: "I=Pout/(sqrt(3)\xB7VLL\xB7eta\xB7cosphi)",
      expected: {
        In_A_rounded_2dec: 10.87
      },
      origin: "Supuesto did\xE1ctico adicional; datos no provienen de la diapositiva 15",
      explanation: "Usar 5500 W, 400 V, 0,88 y 0,83. Comparar con placa del motor real, no inferir protecci\xF3n final sin dem\xE1s datos."
    },
    {
      id: "MOTOR-02",
      topic: "motor-trifasico",
      slides: [
        15
      ],
      given: {
        Pout_kW: 2.2,
        VLL_V: 380,
        eta: 0.85,
        cosphi: 0.8
      },
      formula: "I=Pout/(sqrt(3)\xB7VLL\xB7eta\xB7cosphi)",
      expected: {
        In_A_rounded_2dec: 4.92
      },
      origin: "Supuesto did\xE1ctico adicional",
      explanation: "Potencia mec\xE1nica de salida 2200 W; faltan placa, condiciones de instalaci\xF3n y corto previsto."
    }
  ],
  safety: "C\xE1lculos solo educativos; no usar para especificar protecciones de instalaciones energizadas sin evaluaci\xF3n profesional."
};

// src/study/model.ts
var lessons = lecciones_default.lessons;
var alternatives = preguntas_publicas_default.alternatives;
var developments = preguntas_publicas_default.developments;
var cases = casos_interactivos_7_default.cases;
var STORAGE_KEY = "panellab:estudio:v1";
var themeFor = (id) => id === "objetivos-fallas" ? "fallas" : id;
var topicFor = (theme) => theme === "fallas" ? "objetivos-fallas" : theme;
var freshState = () => ({
  schemaVersion: 1,
  lesson: lessons[0].id,
  screen: "lesson",
  progress: {},
  drafts: {},
  practiceAnswers: {},
  attempts: [],
  exams: []
});
var obj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
var strings = (v) => obj(v) && Object.values(v).every((x) => typeof x === "string" && x.length <= 2e4);
function readState(raw) {
  if (!obj(raw) || raw.schemaVersion !== 1 || !lessons.some((l) => l.id === raw.lesson) || !["lesson", "practice", "exam", "progress", "calc"].includes(String(raw.screen)) || !obj(raw.progress) || !obj(raw.drafts) || !strings(raw.practiceAnswers) || !Array.isArray(raw.attempts) || !Array.isArray(raw.exams))
    throw Error("Formato de progreso incompatible.");
  for (const [key, p] of Object.entries(raw.progress))
    if (!lessons.some((l) => l.id === key) || !obj(p) || !Array.isArray(p.correct) || !p.correct.every(
      (id) => alternatives.some((q) => q.id === id && q.theme === themeFor(key))
    ) || ["started", "attempted", "reviewed", "activity"].some(
      (k) => p[k] !== void 0 && typeof p[k] !== "boolean"
    ))
      throw Error("Progreso de tema inv\xE1lido.");
  const enums = {
    curve: ["B", "C", "D"],
    mechanism: ["T\xE9rmico", "Magn\xE9tico"],
    part: ["palanca", "bornes", "etiqueta"],
    fault: ["Sobrecarga", "Cortocircuito"],
    effect: ["arco", "calor", "fuerza"],
    purpose: ["conductores", "semiconductores"],
    plate: ["50 A", "700 V CA/CC", "200 kA"],
    system: ["CA", "CC"],
    range: ["4\u20136", "6\u201310"]
  };
  for (const [topic, d] of Object.entries(raw.drafts)) {
    if (!lessons.some((l) => l.id === topic) || !strings(d))
      throw Error("Actividad guardada inv\xE1lida.");
    for (const [k, v] of Object.entries(d))
      if (enums[k] && !(k === "plate" && topic === "guardamotor") && !enums[k].includes(v))
        throw Error("Selector de actividad inv\xE1lido.");
    if (d.scenario && !(topic === "objetivos-fallas" ? ["normal", "sobrecarga", "corto"] : ["transitorio", "fuga"]).includes(d.scenario))
      throw Error("Escenario inv\xE1lido.");
  }
  for (const [id, value] of Object.entries(raw.practiceAnswers))
    if (!alternatives.some((q) => q.id === id) || !["0", "1", "2", "3"].includes(value))
      throw Error("Respuesta de pr\xE1ctica inv\xE1lida.");
  for (const a of raw.attempts)
    if (!obj(a) || typeof a.id !== "string" || typeof a.item !== "string" || !lessons.some((l) => l.id === a.topic) || typeof a.correct !== "boolean" || typeof a.at !== "string")
      throw Error("Intento inv\xE1lido.");
  for (const e of raw.exams) {
    if (!obj(e) || typeof e.id !== "string" || typeof e.started !== "string" || !Array.isArray(e.alternatives) || e.alternatives.length !== 8 || new Set(e.alternatives).size !== 8 || !e.alternatives.every((id) => alternatives.some((q) => q.id === id)) || !Array.isArray(e.developments) || e.developments.length !== 3 || new Set(e.developments).size !== 3 || !e.developments.every((id) => developments.some((q) => q.id === id)) || !strings(e.answers) || !Number.isInteger(e.index) || Number(e.index) < 0 || Number(e.index) > 10 || !["ongoing", "review", "submitted"].includes(String(e.stage)) || !obj(e.self) || !Object.values(e.self).every((v) => typeof v === "boolean") || e.stage === "submitted" && typeof e.submitted !== "string")
      throw Error("Simulacro guardado inv\xE1lido.");
    for (const [id, value] of Object.entries(e.answers)) {
      const q = alternatives.find((q2) => q2.id === id);
      if (q ? !e.alternatives.includes(id) || !["0", "1", "2", "3"].includes(value) : !e.developments.includes(id))
        throw Error("Respuesta inv\xE1lida.");
    }
  }
  if (raw.examId !== void 0 && (typeof raw.examId !== "string" || !raw.exams.some((e) => e.id === raw.examId)))
    throw Error("Simulacro seleccionado inv\xE1lido.");
  return raw;
}
function numberValue(v) {
  if (v === void 0 || v.trim() === "") return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
function coordination(load, protection, cable) {
  return load <= protection && protection <= cable;
}
function cableCapacity(table, t, g) {
  return table * t * g;
}
function motorCurrent(kw, v, eta, pf) {
  return kw * 1e3 / (Math.sqrt(3) * v * eta * pf);
}
var fmt = (n) => n.toLocaleString("es-CL", { maximumFractionDigits: 2 });
function newExam(previous, random = Math.random) {
  const pick = (all, exclude = []) => {
    const pool2 = all.filter((q) => !exclude.includes(q.id));
    const candidates = pool2.length ? pool2 : all;
    return candidates[Math.floor(random() * candidates.length)].id;
  };
  const alt = lessons.map(
    (l) => pick(
      alternatives.filter((q) => q.theme === themeFor(l.id)),
      previous?.alternatives
    )
  );
  const pool = developments.filter(
    (q) => !previous?.developments.includes(q.id)
  );
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return {
    id: crypto.randomUUID(),
    alternatives: alt,
    developments: shuffled.slice(0, 3).map((q) => q.id),
    answers: {},
    index: 0,
    stage: "ongoing",
    started: (/* @__PURE__ */ new Date()).toISOString(),
    self: {}
  };
}
function lessonStatus(p) {
  if (p?.reviewed && p.activity && p.correct.length >= 4) return "Dominada";
  if (p?.attempted || p?.correct.length || p?.activity)
    return "Pr\xE1ctica intentada";
  if (p?.reviewed) return "Revisada";
  if (p?.started) return "Estudiando";
  return "Por estudiar";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  STORAGE_KEY,
  alternatives,
  cableCapacity,
  cases,
  coordination,
  developments,
  fmt,
  freshState,
  lessonStatus,
  lessons,
  motorCurrent,
  newExam,
  numberValue,
  readState,
  themeFor,
  topicFor
});
