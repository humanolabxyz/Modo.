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

// src/study/classCatalog.ts
var classCatalog_exports = {};
__export(classCatalog_exports, {
  classOutlines: () => classOutlines,
  protectionClass: () => protectionClass
});
module.exports = __toCommonJS(classCatalog_exports);

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

// src/learning/functionProblems.ts
var near = (a, b) => `abs((${a})-(${b}))<0.00001`;
var geo = (title, text, commands, objects, expression, success) => ({ title, text, commands, check: { objects, expression }, success, page: 1 });
var pop = "f(x)=9.5*exp(0.06*x)+3";
var decay = "f(x)=237*0.4^(x/24)+3";
var plant = "f(x)=1+4*log(10,x+1)";
var bank1 = "f(x)=12*log(1.9,(x+16)/16)";
var bank2 = "g(x)=12*log(1.6,(x+14)/14)";
var functionProblems = [
  { id: "problema-poblacion", title: "Poblaci\xF3n de un pa\xEDs", source: "https://www.geogebra.org/m/YpZwUkA7", statement: "La poblaci\xF3n de un pa\xEDs se modela con p(t)=9,5\xB7e^(0,06t)+3. La poblaci\xF3n est\xE1 en millones de habitantes y t cuenta los a\xF1os transcurridos desde 2004. Considera t \u2265 0.", formula: "p(t) = 9,5 \xB7 e^(0,06t) + 3", variables: ["t: a\xF1os desde 2004. A\xF1o calendario = 2004 + t.", "p(t): poblaci\xF3n en millones de habitantes."], questions: [
    { id: "inicial", title: "Poblaci\xF3n inicial", prompt: "\xBFCu\xE1l ser\xE1 la poblaci\xF3n inicial?", skill: "Valor inicial: evaluar en cero", unit: "millones de habitantes", value: 12.5, tolerance: 5e-3, hint: "Inicial significa t=0, no t=2004. Recuerda que e\u2070=1.", steps: ["Sustituye t=0: p(0)=9,5\xB7e\u2070+3.", "Como e\u2070=1, queda 9,5+3=12,5.", "La poblaci\xF3n inicial es 12,5 millones de habitantes en el a\xF1o 2004."], commands: [pop, "a=f(0)", "Y=(0,a)"], geo: geo("Poblaci\xF3n inicial", "Construye f con el modelo de p(t), calcula a=f(0) y representa Y=(0,a). El eje horizontal mide a\xF1os desde 2004.", [pop, "a=f(0)", "Y=(0,a)"], ["f", "a", "Y"], `${near("f(0)", 12.5)} && ${near("f(11)", "9.5*exp(0.66)+3")} && ${near("a", 12.5)} && ${near("x(Y)", 0)} && ${near("y(Y)", 12.5)}`, "La gr\xE1fica comienza en (0;12,5): poblaci\xF3n inicial de 12,5 millones.") },
    { id: "imagen", title: "Poblaci\xF3n en 2015", prompt: "\xBFCu\xE1l ser\xE1 la poblaci\xF3n al a\xF1o 2015?", skill: "Imagen: convertir el a\xF1o y evaluar", unit: "millones de habitantes", value: 9.5 * Math.exp(0.66) + 3, tolerance: 0.01, hint: "Primero convierte 2015 a a\xF1os transcurridos: 2015\u22122004.", steps: ["t=2015\u22122004=11 a\xF1os.", "p(11)=9,5\xB7e^(0,66)+3\u224821,3805.", "En 2015 el modelo predice aproximadamente 21,38 millones de habitantes."], commands: ["b=f(11)", "P=(11,b)"], geo: geo("Poblaci\xF3n en 2015", "Usa t=11, calcula b=f(11) y representa P=(11,b). Explica por qu\xE9 no se eval\xFAa en 2015.", ["b=f(11)", "P=(11,b)"], ["f", "b", "P"], `${near("b", "9.5*exp(0.66)+3")} && ${near("x(P)", 11)} && ${near("y(P)", "f(11)")}`, "2015 corresponde a t=11; poblaci\xF3n aproximada de 21,38 millones.") },
    { id: "preimagen", title: "Encontrar el a\xF1o", prompt: "\xBFEn qu\xE9 a\xF1o la poblaci\xF3n ser\xE1 de 20,31 millones de habitantes?", skill: "Preimagen: despejar tiempo y volver al calendario", unit: "a\xF1o calendario", value: 2014, tolerance: 0.01, hint: "Plantea 9,5\xB7e^(0,06t)+3=20,31. El resultado t a\xFAn no es el a\xF1o calendario.", steps: ["Resta 3 y divide por 9,5: e^(0,06t)=(20,31\u22123)/9,5.", "Aplica ln: t=ln((20,31\u22123)/9,5)/0,06\u22489,9999.", "A\xF1o\u22482004+10=2014. La diferencia decimal se debe a que 20,31 est\xE1 redondeado."], commands: ["t=ln((20.31-3)/9.5)/0.06", "c=2004+t", "Q=(t,f(t))"], geo: geo("Encontrar el a\xF1o", "Despeja t, calcula el a\xF1o c=2004+t y representa Q en la gr\xE1fica.", ["t=ln((20.31-3)/9.5)/0.06", "c=2004+t", "Q=(t,f(t))"], ["t", "c", "Q"], `${near("t", "ln((20.31-3)/9.5)/0.06")} && ${near("c", "2004+t")} && ${near("x(Q)", "t")} && ${near("y(Q)", 20.31)}`, "El tiempo es aproximadamente 10 a\xF1os desde 2004: a\xF1o 2014.") },
    { id: "grafica", title: "Interpretar la gr\xE1fica", prompt: "Grafica e indica qu\xE9 representa cada eje y la intersecci\xF3n con el eje Y. \xBFCu\xE1l interpretaci\xF3n es correcta?", skill: "Gr\xE1fica: ejes, unidades y corte vertical", unit: "", options: ["Horizontal: a\xF1os desde 2004; vertical: millones de habitantes; corte Y=(0;12,5).", "Horizontal: a\xF1o calendario; vertical: habitantes individuales; corte Y=(2004;9,5).", "Horizontal: poblaci\xF3n; vertical: tiempo; corte Y=(0;3)."], correct: 0, hint: "Relaciona t con el eje horizontal y p(t) con el vertical. El corte Y se obtiene en t=0.", steps: ["Eje horizontal: a\xF1os transcurridos desde 2004, con t\u22650.", "Eje vertical: poblaci\xF3n en millones de habitantes.", "Corte con Y: (0;12,5). La curva es creciente. Ajusta el encuadre para ver los puntos."], commands: ["r(x)=If(x>=0,f(x))", "Y=(0,f(0))", "ZoomIn(-2,-15,25,50)"], geo: geo("Representar e interpretar", "Representa r para t\u22650, ubica Y y ajusta el encuadre. En Mis observaciones escribe los nombres y unidades de los ejes. Se comprueban curva y punto; el rotulado y encuadre se revisan visualmente.", ["r(x)=If(x>=0,f(x))", "Y=(0,f(0))", "ZoomIn(-2,-15,25,50)"], ["r", "Y"], `${near("r(0)", 12.5)} && ${near("r(11)", "9.5*exp(0.66)+3")} && ${near("x(Y)", 0)} && ${near("y(Y)", 12.5)}`, "Curva y corte comprobados. Revisa visualmente los ejes: a\xF1os desde 2004 y millones de habitantes.") }
  ] },
  { id: "problema-estroncio", title: "Desintegraci\xF3n del estroncio", source: "https://www.geogebra.org/m/fx2ZD7cy", statement: "La masa de estroncio-90 que queda despu\xE9s de t a\xF1os est\xE1 determinada por E(t)=237\xB7(0,4)^(t/24)+3, con t\u22650. E(t) est\xE1 en gramos. Trabaja con el modelo del ejercicio.", formula: "E(t) = 237 \xB7 (0,4)^(t/24) + 3", variables: ["t: tiempo transcurrido en a\xF1os.", "E(t): masa del modelo en gramos."], questions: [
    { id: "inicial", title: "Masa inicial", prompt: "\xBFCu\xE1l es la masa inicial del estroncio-90?", skill: "Valor inicial: incluir todos los t\xE9rminos", unit: "g", value: 240, tolerance: 5e-3, hint: "Eval\xFAa en t=0. El t\xE9rmino +3 tambi\xE9n forma parte de la masa inicial.", steps: ["E(0)=237\xB7(0,4)\u2070+3.", "Toda base positiva elevada a cero vale 1.", "La masa inicial del modelo es 237+3=240 g."], commands: [decay, "a=f(0)", "Y=(0,a)"], geo: geo("Masa inicial", "Construye f con el modelo de E(t), calcula a y representa el corte Y.", [decay, "a=f(0)", "Y=(0,a)"], ["f", "a", "Y"], `${near("f(0)", 240)} && ${near("f(24)", 97.8)} && ${near("a", 240)} && ${near("x(Y)", 0)} && ${near("y(Y)", 240)}`, "La masa inicial del modelo es 240 g.") },
    { id: "preimagen", title: "Tiempo hasta 12,36 g", prompt: "\xBFEn cu\xE1ntos a\xF1os quedar\xE1n 12,36 g de estroncio-90?", skill: "Preimagen: despejar una exponencial decreciente", unit: "a\xF1os", value: 24 * Math.log((12.36 - 3) / 237) / Math.log(0.4), tolerance: 0.02, hint: "Resta 3, divide por 237 y aplica logaritmos. No olvides el 24 del exponente.", steps: ["(0,4)^(t/24)=(12,36\u22123)/237.", "t=24\xB7ln((12,36\u22123)/237)/ln(0,4).", "t\u224884,64 a\xF1os. Sustituye el resultado para comprobar que quedan 12,36 g."], commands: ["t=24*ln((12.36-3)/237)/ln(0.4)", "P=(t,f(t))"], geo: geo("Tiempo hasta 12,36 g", "Despeja t con logaritmos y representa P=(t,f(t)).", ["t=24*ln((12.36-3)/237)/ln(0.4)", "P=(t,f(t))"], ["t", "P"], `${near("t", "24*ln((12.36-3)/237)/ln(0.4)")} && ${near("x(P)", "t")} && ${near("y(P)", 12.36)}`, "El modelo alcanza 12,36 g aproximadamente a los 84,64 a\xF1os.") },
    { id: "imagen", title: "Masa a los 50 a\xF1os", prompt: "\xBFCu\xE1ntos gramos quedar\xE1n despu\xE9s de 50 a\xF1os?", skill: "Imagen: evaluar el exponente completo", unit: "g", value: 237 * 0.4 ** (50 / 24) + 3, tolerance: 0.01, hint: "Sustituye t por 50. El exponente completo es 50/24.", steps: ["E(50)=237\xB7(0,4)^(50/24)+3.", "Calcula la potencia antes de multiplicar y sumar.", "E(50)\u224838,13 g. La cantidad disminuy\xF3 desde los 240 g iniciales."], commands: ["b=f(50)", "Q=(50,b)"], geo: geo("Masa a los 50 a\xF1os", "Calcula b=f(50) y representa Q=(50,b).", ["b=f(50)", "Q=(50,b)"], ["b", "Q"], `${near("b", "237*0.4^(50/24)+3")} && ${near("x(Q)", 50)} && ${near("y(Q)", "b")}`, "A los 50 a\xF1os quedan aproximadamente 38,13 g seg\xFAn el modelo.") },
    { id: "grafica", title: "Leer el decaimiento", prompt: "Grafica e indica los ejes y el corte con Y. \xBFQu\xE9 descripci\xF3n corresponde al modelo?", skill: "Gr\xE1fica: decrecimiento y desplazamiento vertical", unit: "", options: ["Tiempo en a\xF1os, masa en gramos, corte Y=(0;240); decrece y se aproxima a 3 g.", "Tiempo en d\xEDas, masa en gramos, corte Y=(0;237); se aproxima a cero.", "Masa en el eje horizontal y tiempo en el vertical; la curva crece."], correct: 0, hint: "El +3 desplaza la gr\xE1fica hacia arriba. Calcula E(0) para el corte.", steps: ["Horizontal: a\xF1os; vertical: gramos; dominio del contexto t\u22650.", "Corte vertical (0;240). La base 0,4 est\xE1 entre cero y uno, por eso decrece.", "La curva se aproxima a 3 g. No se debe borrar el +3 para hacerla llegar a cero."], commands: ["r(x)=If(x>=0,f(x))", "Y=(0,f(0))", "ZoomIn(-5,-90,120,260)"], geo: geo("Gr\xE1fica del decaimiento", "Representa r para t\u22650 y el corte Y. Ajusta el encuadre y anota ejes y unidades; se comprueban curva y corte, no el texto de los ejes.", ["r(x)=If(x>=0,f(x))", "Y=(0,f(0))", "ZoomIn(-5,-90,120,260)"], ["r", "Y"], `${near("r(0)", 240)} && ${near("r(24)", 97.8)} && ${near("x(Y)", 0)} && ${near("y(Y)", 240)}`, "Curva y corte comprobados. Verifica que se vea el decaimiento hacia 3 g.") }
  ] },
  { id: "problema-ahorro", title: "Ahorro en dos bancos", source: "https://www.geogebra.org/m/swtJStNE", statement: "Dos hermanos depositan $16.000 en Banco Chile y $14.000 en Banco Estado. El tiempo T, en meses, necesario para obtener una ganancia G se modela con funciones logar\xEDtmicas. Tanto G como el capital inicial C\u1D62 se expresan en miles de pesos: usa C\u1D62=16 y C\u1D62=14. Son las condiciones matem\xE1ticas del ejercicio.", formula: "T\u2081(G)=12\xB7log\u2081,\u2089((G+16)/16)\nT\u2082(G)=12\xB7log\u2081,\u2086((G+14)/14)", variables: ["G: ganancia en miles de pesos. No es el saldo total.", "T(G): tiempo en meses. 3 a\xF1os y medio = 42 meses."], questions: [
    { id: "grafica", title: "Graficar ambos bancos", prompt: "Grafica ambas funciones con los dep\xF3sitos indicados. \xBFQu\xE9 representan los ejes?", skill: "Modelaci\xF3n: variables y escala monetaria", unit: "", options: ["Horizontal: ganancia en miles de pesos; vertical: tiempo en meses. Ambas pasan por (0;0).", "Horizontal: meses; vertical: saldo en pesos. Ambas pasan por (0;16).", "Horizontal: ganancia en pesos; vertical: a\xF1os. No tienen corte con Y."], correct: 0, hint: "La entrada es G y la salida T. Eval\xFAa T(0); el argumento del logaritmo es 1.", steps: ["Sustituye el capital inicial: 16 y 14, pues las cantidades est\xE1n en miles de pesos.", "Grafica T\u2081 y T\u2082 con G en horizontal y meses en vertical.", "T\u2081(0)=T\u2082(0)=0. El dominio del contexto es G\u22650; no se confunde ganancia con saldo."], commands: [bank1, bank2, "O=(0,0)", "ZoomIn(-10,-30,160,72)"], geo: geo("Graficar ambos bancos", "Construye f y g con los capitales en miles. Crea O y ajusta la vista. Anota las unidades de los ejes; el texto de los ejes se revisa visualmente.", [bank1, bank2, "O=(0,0)", "ZoomIn(-10,-30,160,72)"], ["f", "g", "O"], `${near("f(0)", 0)} && ${near("g(0)", 0)} && ${near("f(32)", "12*ln(3)/ln(1.9)")} && ${near("g(47)", "12*ln(61/14)/ln(1.6)")} && ${near("x(O)", 0)} && ${near("y(O)", 0)}`, "Modelos y origen comprobados. Ejes: ganancia en miles y tiempo en meses.") },
    { id: "chile-tiempo", title: "Superar $32.000", prompt: "\xBFCu\xE1l es el m\xEDnimo de meses completos para tener una ganancia superior a $32.000 en Banco Chile?", skill: "Imagen y desigualdad: interpretar el umbral", unit: "meses completos", value: 21, tolerance: 0, hint: "G=32. Eval\xFAa T\u2081(32) y elige el primer mes entero posterior, porque pide una ganancia superior.", steps: ["T\u2081(32)=12\xB7ln((32+16)/16)/ln(1,9)\u224820,5395 meses.", "En tiempo continuo se requiere T>20,5395; la igualdad solo alcanza $32.000.", "En meses completos, el primer mes que supera el objetivo es el 21. Esta es la interpretaci\xF3n que usa el recurso original."], commands: ["a=f(32)", "m=floor(a)+1", "P=(32,a)"], geo: geo("Meses para superar $32.000", "Eval\xFAa a=f(32), calcula el primer mes completo m y representa P=(32,a).", ["a=f(32)", "m=floor(a)+1", "P=(32,a)"], ["a", "m", "P"], `${near("a", "12*ln(3)/ln(1.9)")} && ${near("m", 21)} && ${near("x(P)", 32)} && ${near("y(P)", "a")}`, "El umbral es 20,5395 meses; se necesitan 21 meses completos.") },
    { id: "estado-tiempo", title: "Superar $47.000", prompt: "\xBFCu\xE1l es el m\xEDnimo de meses completos para una ganancia superior a $47.000 en Banco Estado?", skill: "Imagen: seleccionar la funci\xF3n correcta", unit: "meses completos", value: 38, tolerance: 0, hint: "Usa T\u2082, capital 14 y base 1,6; la ganancia es G=47.", steps: ["T\u2082(47)=12\xB7ln((47+14)/14)/ln(1,6)\u224837,5780 meses.", "Para superar la ganancia el tiempo debe ser mayor que ese umbral.", "El primer mes completo que cumple es el 38."], commands: ["b=g(47)", "n=floor(b)+1", "Q=(47,b)"], geo: geo("Meses para superar $47.000", "Usa g para evaluar b=g(47), calcula n y representa Q.", ["b=g(47)", "n=floor(b)+1", "Q=(47,b)"], ["b", "n", "Q"], `${near("b", "12*ln(61/14)/ln(1.6)")} && ${near("n", 38)} && ${near("x(Q)", 47)} && ${near("y(Q)", "b")}`, "Se necesitan 38 meses completos; el umbral continuo es 37,5780.") },
    { id: "chile-ganancia", title: "Ganancia tras 3\xBD a\xF1os", prompt: "Si mantiene el dinero en Banco Chile durante 3 a\xF1os y medio, \xBFcu\xE1nta ganancia obtiene? Responde en pesos.", skill: "Preimagen: invertir el modelo logar\xEDtmico", unit: "pesos", value: 16e3 * (1.9 ** 3.5 - 1), tolerance: 1, hint: "Convierte a 42 meses y despeja G de T\u2081(G)=42. La ganancia a\xFAn estar\xE1 en miles.", steps: ["3,5\xD712=42 meses. Plantea 42=12\xB7log\u2081,\u2089((G+16)/16).", "G=16\xB7(1,9^(42/12)\u22121)\u2248135,2717 miles de pesos.", "Multiplica por 1000: ganancia aproximada de $135.272. No sumes el capital: te piden ganancia, no saldo."], commands: ["c=16*(1.9^(42/12)-1)", "pesos=1000*c", "R=(c,42)"], geo: geo("Ganancia tras 42 meses", "Despeja la ganancia c en miles, convi\xE9rtela a pesos y representa R=(c,42).", ["c=16*(1.9^(42/12)-1)", "pesos=1000*c", "R=(c,42)"], ["c", "pesos", "R"], `${near("c", "16*(1.9^(42/12)-1)")} && ${near("pesos", "1000*c")} && ${near("x(R)", "c")} && ${near("y(R)", 42)}`, "Ganancia aproximada: $135.272; el punto usa miles de pesos en el eje horizontal.") },
    { id: "estado-ganancia", title: "Ganancia tras 43 meses", prompt: "Si mantiene el dinero en Banco Estado durante 43 meses, \xBFcu\xE1nta ganancia obtiene? Responde en pesos.", skill: "Preimagen: interpretar y convertir la respuesta", unit: "pesos", value: 14e3 * (1.6 ** (43 / 12) - 1), tolerance: 1, hint: "Despeja G usando la base 1,6 y el capital inicial 14; al final convierte miles a pesos.", steps: ["43=12\xB7log\u2081,\u2086((G+14)/14).", "G=14\xB7(1,6^(43/12)\u22121)\u224861,4324 miles de pesos.", "Ganancia aproximada: $61.432. Sustituye G en T\u2082 para recuperar 43 meses."], commands: ["d=14*(1.6^(43/12)-1)", "pesos2=1000*d", "S=(d,43)"], geo: geo("Ganancia tras 43 meses", "Obt\xE9n d, convierte a pesos2 y representa S=(d,43).", ["d=14*(1.6^(43/12)-1)", "pesos2=1000*d", "S=(d,43)"], ["d", "pesos2", "S"], `${near("d", "14*(1.6^(43/12)-1)")} && ${near("pesos2", "1000*d")} && ${near("x(S)", "d")} && ${near("y(S)", 43)}`, "Ganancia aproximada: $61.432. Sustituye para recuperar los 43 meses.") }
  ] },
  { id: "problema-planta", title: "Altura de una planta", source: "https://www.geogebra.org/m/CTu9cyBj", statement: "En las condiciones del ejercicio, la altura de una planta sigue h(t)=1+4\xB7log(t+1). La altura est\xE1 en cent\xEDmetros y t en d\xEDas desde que se plant\xF3. Aqu\xED log es decimal, de base 10, y t\u22650.", formula: "h(t) = 1 + 4 \xB7 log\u2081\u2080(t + 1)", variables: ["t: d\xEDas desde que se plant\xF3. Para a\xF1os, divide entre 365.", "h(t): altura en cent\xEDmetros."], questions: [
    { id: "inicial", title: "Altura inicial", prompt: "\xBFCu\xE1l es la altura inicial de la planta?", skill: "Valor inicial: reconocer log(1)", unit: "cm", value: 1, tolerance: 5e-3, hint: "Sustituye t=0. log\u2081\u2080(1)=0, no 1.", steps: ["h(0)=1+4\xB7log\u2081\u2080(1).", "Como log\u2081\u2080(1)=0, h(0)=1.", "La altura inicial es 1 cm."], commands: [plant, "a=f(0)", "Y=(0,a)"], geo: geo("Altura inicial", "Construye f con logaritmo decimal, calcula a y representa Y.", [plant, "a=f(0)", "Y=(0,a)"], ["f", "a", "Y"], `${near("f(0)", 1)} && ${near("f(9)", 5)} && ${near("a", 1)} && ${near("x(Y)", 0)} && ${near("y(Y)", 1)}`, "Altura inicial: 1 cm; log(1)=0.") },
    { id: "imagen", title: "Altura a los 79 d\xEDas", prompt: "\xBFCu\xE1l es la altura de la planta a los 79 d\xEDas de haber sido plantada?", skill: "Imagen: evaluar un logaritmo con desplazamiento", unit: "cm", value: 1 + 4 * Math.log10(80), tolerance: 0.01, hint: "El argumento es t+1; al poner 79 queda log\u2081\u2080(80).", steps: ["h(79)=1+4\xB7log\u2081\u2080(80).", "log\u2081\u2080(80)\u22481,90309.", "Altura aproximada: 8,61 cm."], commands: ["b=f(79)", "P=(79,b)"], geo: geo("Altura a los 79 d\xEDas", "Calcula b=f(79) y representa P=(79,b).", ["b=f(79)", "P=(79,b)"], ["b", "P"], `${near("b", "1+4*log(10,80)")} && ${near("x(P)", 79)} && ${near("y(P)", "b")}`, "A los 79 d\xEDas mide aproximadamente 8,61 cm.") },
    { id: "preimagen", title: "Tiempo para medir 14,86 cm", prompt: "Si la planta mide 14,86 cm, \xBFhace cu\xE1ntos a\xF1os fue plantada aproximadamente?", skill: "Preimagen: despejar d\xEDas y convertir a a\xF1os", unit: "a\xF1os", value: (10 ** ((14.86 - 1) / 4) - 1) / 365, tolerance: 0.02, hint: "Primero despeja t en d\xEDas. La pregunta pide a\xF1os: divide al final por 365.", steps: ["14,86=1+4\xB7log\u2081\u2080(t+1) \u21D2 log\u2081\u2080(t+1)=(14,86\u22121)/4.", "t=10^((14,86\u22121)/4)\u22121\u22482916,43 d\xEDas.", "2916,43/365\u22487,99 a\xF1os: aproximadamente 8 a\xF1os. La altura dada est\xE1 redondeada."], commands: ["t=10^((14.86-1)/4)-1", "anios=t/365", "Q=(t,f(t))"], geo: geo("Tiempo para medir 14,86 cm", "Despeja t en d\xEDas, calcula anios=t/365 y representa Q.", ["t=10^((14.86-1)/4)-1", "anios=t/365", "Q=(t,f(t))"], ["t", "anios", "Q"], `${near("t", "10^((14.86-1)/4)-1")} && ${near("anios", "t/365")} && ${near("x(Q)", "t")} && ${near("y(Q)", 14.86)}`, "Son aproximadamente 8 a\xF1os. El eje horizontal de h sigue expresado en d\xEDas.") },
    { id: "grafica", title: "Ejes y cortes", prompt: "Grafica indicando cortes y nombres de los ejes. \xBFQu\xE9 interpretaci\xF3n respeta el contexto?", skill: "Gr\xE1fica: distinguir dominio algebraico y del problema", unit: "", options: ["Horizontal: d\xEDas; vertical: cent\xEDmetros; corte Y=(0;1), sin corte X para t\u22650.", "Horizontal: a\xF1os; vertical: cent\xEDmetros; corte Y=(0;5).", "Horizontal: d\xEDas; vertical: cent\xEDmetros; hay corte X en t=0."], correct: 0, hint: "La expresi\xF3n admite t>\u22121, pero el problema solo permite t\u22650. No uses un tiempo negativo como soluci\xF3n del contexto.", steps: ["Eje horizontal: d\xEDas. Vertical: altura en cent\xEDmetros. Corte vertical (0;1).", "El corte algebraico con X ser\xEDa t=10^(\u22121/4)\u22121\u2248\u22120,4377 d\xEDas: est\xE1 fuera del contexto.", "Para t\u22650 no hay corte con X. Para ver el punto de 14,86 cm ampl\xEDa el eje horizontal hasta cerca de 3000 d\xEDas."], commands: ["r(x)=If(x>=0,f(x))", "Y=(0,f(0))", "ZoomIn(-150,-6,3100,16)"], geo: geo("Gr\xE1fica y dominio del contexto", "Representa r para t\u22650, Y y ampl\xEDa la vista hasta 3100 d\xEDas. Anota nombres de ejes y por qu\xE9 no hay corte X dentro del contexto.", ["r(x)=If(x>=0,f(x))", "Y=(0,f(0))", "ZoomIn(-150,-6,3100,16)"], ["r", "Y"], `${near("r(0)", 1)} && ${near("r(79)", "1+4*log(10,80)")} && ${near("x(Y)", 0)} && ${near("y(Y)", 1)}`, "Curva y corte comprobados. Revisa el encuadre y que el tiempo est\xE9 en d\xEDas, no a\xF1os.") }
  ] }
];
var functionProblemLessons = functionProblems.map((p) => ({ id: p.id, materialId: `mtfm01-${p.id}`, title: p.title, unit: 2, source: p.source, intro: p.statement, concept: p.formula, question: p.questions.at(-1).prompt, options: p.questions.at(-1).options || ["Interpretar y comprobar"], answer: p.questions.at(-1).correct || 0, explanation: p.questions.at(-1).steps.join(" "), steps: p.questions.map((q3) => q3.geo), viewBounds: p.id === "problema-poblacion" ? [-2, -15, 25, 50] : p.id === "problema-estroncio" ? [-5, -90, 120, 260] : p.id === "problema-ahorro" ? [-10, -30, 160, 72] : [-2, -6, 100, 16] }));

// src/learning/geogebraLessons.ts
var check = (objects, expression) => ({ objects, expression });
var near2 = (a, b) => `abs((${a})-(${b}))<10^(-5)`;
var polynomial = (name, values) => `Length(Coefficients(${name}))==${values.length} && ${values.map((v, i) => near2(`Element(Coefficients(${name}),${i + 1})`, v)).join(" && ")}`;
var geoLessons = [
  { id: "funciones-lineales", materialId: "mtfm01-lineales", title: "Funciones constantes y lineales", unit: 1, source: "/estudio/matematicas/funciones-lineales.pdf", intro: "Construye funciones, encuentra im\xE1genes y preim\xE1genes y ajusta datos con GeoGebra, siguiendo la Actividad tecnol\xF3gica 1.", concept: "En g(x) = 2x \u2212 3, x es la entrada y g(x) es la salida. La pendiente 2 indica cu\xE1nto cambia la salida cuando x aumenta una unidad. El \u22123 es el corte con el eje vertical.", question: "Si x aumenta una unidad en g(x) = 2x \u2212 3, \xBFcu\xE1nto cambia g(x)?", options: ["Aumenta 2", "Disminuye 3", "Siempre queda en 0"], answer: 0, explanation: "La pendiente es 2: cada aumento de una unidad en x produce un aumento de dos unidades en g(x).", steps: [
    { title: "Construye la constante", page: 1, text: "Actividad 2. Ingresa f(x) = \u22123. Observa que su altura no cambia al mover x.", commands: ["f(x)=-3"], check: check(["f"], polynomial("f", [-3])), success: "f es constante: todas sus im\xE1genes valen \u22123." },
    { title: "A\xF1ade la funci\xF3n lineal", page: 2, text: "Actividad 3. Conserva f y construye g(x) = 2x \u2212 3. Puedes usar la constante anterior.", commands: ["g(x)=2x+f(x)"], check: check(["f", "g"], polynomial("g", [2, -3])), success: "La recta tiene pendiente 2 y corte vertical \u22123." },
    { title: "Calcula y representa una imagen", page: 2, text: "Actividad 4. Calcula g(2) en a y coloca el punto P = (2, a). Mira c\xF3mo se relacionan la entrada y la altura.", commands: ["a=g(2)", "P=(2,a)"], check: check(["a", "P"], `${near2("a", 1)} && ${near2("x(P)", 2)} && ${near2("y(P)", 1)}`), success: "g(2) = 1. El punto (2, 1) pertenece a la recta." },
    { title: "Encuentra una preimagen", page: 3, text: "Actividad 5. Encuentra el valor de x que produce g(x) = \u22125. Usa Resuelve/Solve y representa el punto Q de la recta a esa altura.", commands: ["Solve(g(x)=-5,x)", "Q=(-1,g(-1))"], check: check(["g", "Q"], `${near2("x(Q)", -1)} && ${near2("y(Q)", -5)}`), success: "La preimagen de \u22125 es \u22121: g(\u22121) = \u22125." },
    { title: "Obt\xE9n una recta a partir de puntos", page: 3, text: "Actividad 6. Crea A = (\u22121, 3), B = (1, \u22121) y ajusta una recta h a ambos puntos.", commands: ["A=(-1,3)", "B=(1,-1)", "h=FitPoly({A,B},1)"], check: check(["A", "B", "h"], `${near2("x(A)", -1)} && ${near2("y(A)", 3)} && ${near2("x(B)", 1)} && ${near2("y(B)", -1)} && ${polynomial("h", [-2, 1])}`), success: "La recta ajustada es h(x) = \u22122x + 1 y pasa por ambos puntos." },
    { title: "Ajusta la vista gr\xE1fica", page: 4, text: "Actividad 7, p\xE1ginas 4\u20136. Ingresa u(x) = 100x + 50 y adapta los ejes desde la configuraci\xF3n de la vista gr\xE1fica: prueba un rango vertical de \u2212250 a 250. Al comprobar se revisa la funci\xF3n; confirma visualmente que el encuadre te sirve.", commands: ["u(x)=100x+50"], check: check(["u"], polynomial("u", [100, 50])), success: "Funci\xF3n comprobada. El ajuste de los ejes se revisa visualmente; no se califica autom\xE1ticamente." },
    { title: "Interseca dos funciones", page: 6, text: "Actividad 8. Conserva u, crea v(x) = \u221250x \u2212 100 y encuentra el punto I donde ambas rectas se cruzan.", commands: ["v(x)=-50x-100", "I=Intersect(u,v)"], check: check(["u", "v", "I"], `${polynomial("v", [-50, -100])} && ${near2("x(I)", -1)} && ${near2("y(I)", -50)}`), success: "Ambas funciones valen \u221250 cuando x = \u22121." },
    { title: "Compara dos ajustes", page: 7, text: "Actividad 10. Ingresa los cinco puntos de la gu\xEDa y ajusta una constante c y una recta r. Compara su relaci\xF3n con los datos; anota cu\xE1l describe mejor la tendencia.", commands: ["L={(1,2),(2,1.5),(4,2),(5,1),(7,2.5)}", "c=FitPoly(L,0)", "r=FitPoly(L,1)"], check: check(["L", "c", "r"], `Length(L)==5 && AreEqual(L,{(1,2),(2,1.5),(4,2),(5,1),(7,2.5)}) && AreEqual(c,FitPoly(L,0)) && AreEqual(r,FitPoly(L,1))`), success: "Se comprobaron los datos y los dos ajustes. Tu comparaci\xF3n y justificaci\xF3n quedan en las notas." }
  ] },
  { id: "funciones-cuadraticas", materialId: "mtfm01-cuadraticas", title: "Funciones polin\xF3micas de grado 2", unit: 1, source: "/estudio/matematicas/funciones-cuadraticas.pdf", intro: "Construye y analiza par\xE1bolas con la Actividad tecnol\xF3gica 2. Cada actividad conserva sus datos y su lugar en la gu\xEDa.", concept: "Una funci\xF3n cuadr\xE1tica puede asignar la misma salida a dos entradas. Su v\xE9rtice marca un m\xEDnimo o un m\xE1ximo seg\xFAn la apertura de la par\xE1bola.", question: "\xBFPuede una funci\xF3n cuadr\xE1tica tener dos preim\xE1genes para una misma salida?", options: ["S\xED, depende de la altura elegida", "No, siempre hay exactamente una", "Solo si es una recta"], answer: 0, explanation: "Una recta horizontal puede cortar la par\xE1bola en dos puntos, uno o ninguno.", steps: [
    { title: "Construye la par\xE1bola", page: 1, text: "Actividad 2. Ingresa f(x) = \xBDx\xB2 \u2212 2x \u2212 1. Observa su apertura.", commands: ["f(x)=0.5x^2-2x-1"], check: check(["f"], polynomial("f", [0.5, -2, -1])), success: "El coeficiente de x\xB2 es positivo: la par\xE1bola abre hacia arriba." },
    { title: "Calcula una imagen", page: 2, text: "Actividad 3. Calcula f(3) en a y representa P = (3, a).", commands: ["a=f(3)", "P=(3,a)"], check: check(["a", "P"], `${near2("a", -2.5)} && ${near2("x(P)", 3)} && ${near2("y(P)", -2.5)}`), success: "f(3) = \u22122,5. Imagen y punto coinciden." },
    { title: "Encuentra las preim\xE1genes de 5", page: 2, text: "Actividad 4. Resuelve f(x) = 5 y representa los dos puntos, Q y R, donde la par\xE1bola alcanza esa altura.", commands: ["Solve(f(x)=5,x)", "Q=(-2,5)", "R=(6,5)"], check: check(["f", "Q", "R"], `${near2("x(Q)", -2)} && ${near2("y(Q)", 5)} && ${near2("x(R)", 6)} && ${near2("y(R)", 5)}`), success: "Las dos preim\xE1genes son \u22122 y 6." },
    { title: "Localiza los puntos especiales", page: 3, text: "Actividad 5. Obt\xE9n los cortes con los ejes y el extremo. Nombra V al v\xE9rtice y Y al corte vertical; los cortes horizontales pueden tener nombres autom\xE1ticos.", commands: ["Intersect(f,xAxis)", "Y=Intersect(f,yAxis)", "V=Extremum(f)"], check: check(["f", "V", "Y"], `${near2("x(V)", 2)} && ${near2("y(V)", -3)} && ${near2("x(Y)", 0)} && ${near2("y(Y)", -1)}`), success: "El m\xEDnimo est\xE1 en (2, \u22123) y el corte vertical en (0, \u22121). Revisa tambi\xE9n los dos cortes con el eje x." },
    { title: "Ajusta tres puntos", page: 4, text: "Actividad 6. Crea A = (\u22122, 1), B = (3, 4), C = (5, \u22122) y ajusta h de grado 2.", commands: ["A=(-2,1)", "B=(3,4)", "C=(5,-2)", "h=FitPoly({A,B,C},2)"], check: check(["A", "B", "C", "h"], `AreEqual(A,(-2,1)) && AreEqual(B,(3,4)) && AreEqual(C,(5,-2)) && AreEqual(h,FitPoly({A,B,C},2))`), success: "El ajuste pasa por los tres puntos de la gu\xEDa." },
    { title: "Cruza dos par\xE1bolas", page: 5, text: "Actividad 7. Construye u(x) = x\xB2 \u2212 5x + 6 y v(x) = \u22122x\xB2 + 8x \u2212 2. Calcula los dos cruces en I y J.", commands: ["u(x)=x^2-5x+6", "v(x)=-2x^2+8x-2", "I=Intersect(u,v,1)", "J=Intersect(u,v,2)"], check: check(["u", "v", "I", "J"], `${polynomial("u", [1, -5, 6])} && ${polynomial("v", [-2, 8, -2])} && abs(x(I)-x(J))>0.01 && ${near2("u(x(I))", "y(I)")} && ${near2("v(x(I))", "y(I)")} && ${near2("u(x(J))", "y(J)")} && ${near2("v(x(J))", "y(J)")}`), success: "Se verificaron dos puntos diferentes pertenecientes a ambas par\xE1bolas." },
    { title: "Ajusta un conjunto de datos", page: 5, text: "Actividad 8. Ingresa los cinco puntos indicados y calcula r de grado 2. Observa que un ajuste con m\xE1s de tres puntos no tiene por qu\xE9 pasar exactamente por todos.", commands: ["L={(-2.5,1),(-2,3),(0,4),(1,2.5),(3,0)}", "r=FitPoly(L,2)"], check: check(["L", "r"], `AreEqual(L,{(-2.5,1),(-2,3),(0,4),(1,2.5),(3,0)}) && AreEqual(r,FitPoly(L,2))`), success: "Datos y ajuste comprobados. Describe en tus notas d\xF3nde se aparta la curva de los puntos." }
  ] },
  { id: "funciones-logaritmicas", materialId: "mtfm01-logaritmicas", title: "Funciones logar\xEDtmicas", unit: 2, source: "/estudio/matematicas/funciones-logaritmicas.pdf", intro: "Explora distintas bases, im\xE1genes, preim\xE1genes y ajustes con la gu\xEDa de funciones logar\xEDtmicas.", concept: "ln(x) es el logaritmo natural y log(x) el decimal. Para estas funciones reales, la entrada debe ser positiva. El punto (1, 0) pertenece a ambas curvas.", question: "\xBFQu\xE9 entradas admite ln(x) en los n\xFAmeros reales?", options: ["Solo x > 0", "Todos los n\xFAmeros reales", "Solo x = 0"], answer: 0, explanation: "El dominio real de ln(x) es x > 0; no contiene cero ni n\xFAmeros negativos.", steps: [
    { title: "Compara cuatro bases", page: 1, text: "Actividad 2. Construye f, g, h y p con las bases natural, 10, 2 y 4. Compara c\xF3mo crecen. En esta gu\xEDa se usa la sintaxis internacional de comandos.", commands: ["f(x)=ln(x)", "g(x)=log(10,x)", "h(x)=log(2,x)", "p(x)=log(4,x)"], check: check(["f", "g", "h", "p"], `${near2("f(3)", "ln(3)")} && ${near2("g(10)", 1)} && ${near2("h(2)", 1)} && ${near2("p(4)", 1)} && ${near2("f(1)", 0)} && ${near2("g(1)", 0)}`), success: "Las bases cambian el crecimiento; todas estas curvas pasan por (1, 0). Se comprobaron sus valores de referencia." },
    { title: "Representa una imagen", page: 2, text: "Actividad 3. Calcula f(3) en a y coloca el punto P = (3, a).", commands: ["a=f(3)", "P=(3,a)"], check: check(["f", "a", "P"], `${near2("a", "ln(3)")} && ${near2("x(P)", 3)} && ${near2("y(P)", "ln(3)")}`), success: "La imagen es ln(3), aproximadamente 1,098612." },
    { title: "Obt\xE9n una preimagen", page: 3, text: "Actividad 4. Encuentra la preimagen de 2 en ln(x). Usa Resuelve/Solve y representa Q = (exp(2), 2).", commands: ["Solve(f(x)=2,x)", "Q=(exp(2),2)"], check: check(["f", "Q"], `${near2("x(Q)", "exp(2)")} && ${near2("y(Q)", 2)}`), success: "La preimagen es e\xB2, aproximadamente 7,389056." },
    { title: "Interseca con una cuadr\xE1tica", page: 3, text: "Actividad 5. Crea q(x) = x\xB2 \u2212 9x + 14 y encuentra los dos cruces con f dentro del intervalo de la gu\xEDa. Usa I para el cruce entre 0 y 3, y J entre 6 y 8.", commands: ["q(x)=x^2-9x+14", "I=Intersect(f,q,0.01,3)", "J=Intersect(f,q,6,8)"], check: check(["f", "q", "I", "J"], `${polynomial("q", [1, -9, 14])} && abs(x(I)-x(J))>0.01 && x(I)>0 && x(J)<8 && ${near2("f(x(I))", "y(I)")} && ${near2("q(x(I))", "y(I)")} && ${near2("f(x(J))", "y(J)")} && ${near2("q(x(J))", "y(J)")}`), success: "Los dos cruces comparten la misma altura en ambas curvas." },
    { title: "Encuentra el corte horizontal", page: 4, text: "Actividad 6. Encuentra el punto K donde ln(x) corta el eje x. Explica por qu\xE9 no hay un corte con el eje y.", commands: ["K=Intersect(f,xAxis)"], check: check(["f", "K"], `${near2("x(K)", 1)} && ${near2("y(K)", 0)}`), success: "ln(1) = 0. El eje y exige x = 0, que est\xE1 fuera del dominio." },
    { title: "Ajusta datos con un logaritmo", page: 4, text: "Actividad 7. Ingresa los cuatro puntos y ajusta r con FitLog. Compara la curva con cada punto y registra tu conclusi\xF3n.", commands: ["L={(0.5,-2),(1,1),(3,3),(6,4)}", "r=FitLog(L)"], check: check(["L", "r"], `AreEqual(L,{(0.5,-2),(1,1),(3,3),(6,4)}) && AreEqual(r,FitLog(L))`), success: "El conjunto y su ajuste est\xE1n comprobados; la interpretaci\xF3n queda en tus notas." }
  ] }
];
geoLessons.push(
  { id: "matrices-operaciones", materialId: "mtfm01-matrices-operaciones", title: "Matrices: datos y operaciones", unit: 4, source: "", intro: "Pr\xE1ctica complementaria: organiza la producci\xF3n de dos equipos en dos turnos; interpreta sumas, escalas y transpuestas.", concept: "Una matriz organiza datos por filas y columnas. La suma se calcula posici\xF3n por posici\xF3n y exige matrices del mismo tama\xF1o.", question: "\xBFQu\xE9 condici\xF3n exige la suma de dos matrices?", options: ["Tener el mismo n\xFAmero de filas y columnas", "Tener determinante distinto de cero", "Ser siempre matrices cuadradas"], answer: 0, explanation: "Solo se suman entradas correspondientes de matrices de igual dimensi\xF3n.", steps: [
    { title: "Organiza las mediciones", page: 1, text: "Dos equipos producen piezas de tipo 1 y tipo 2. A registra el primer turno: filas (2, 1) y (3, 4). Cada fila corresponde a un equipo y cada columna a un tipo de pieza.", commands: ["A={{2,1},{3,4}}"], check: check(["A"], "AreEqual(A,{{2,1},{3,4}})"), success: "A contiene dos filas y dos columnas con los datos indicados." },
    { title: "Suma dos registros", page: 1, text: "B registra el segundo turno con filas (1, 3) y (2, 0). Antes de calcular S = A + B, predice el total de cada equipo y tipo de pieza.", commands: ["B={{1,3},{2,0}}", "S=A+B"], check: check(["A", "B", "S"], "AreEqual(A,{{2,1},{3,4}}) && AreEqual(B,{{1,3},{2,0}}) && AreEqual(S,{{3,4},{5,4}})"), success: "La suma es {{3,4},{5,4}}. Se sumaron entradas de la misma posici\xF3n." },
    { title: "Aplica un factor de escala", page: 1, text: "Sup\xF3n que cada equipo duplica la producci\xF3n del primer turno. Calcula D = 2A y explica qu\xE9 significa cada entrada respecto de A.", commands: ["D=2*A"], check: check(["A", "D"], "AreEqual(A,{{2,1},{3,4}}) && AreEqual(D,{{4,2},{6,8}})"), success: "Todas las cantidades de piezas se multiplicaron por 2." },
    { title: "Intercambia filas y columnas", page: 1, text: "Calcula T, la transpuesta de A. Observa que la primera fila de A pasa a ser la primera columna de T.", commands: ["T=Transpose(A)"], check: check(["A", "T"], "AreEqual(A,{{2,1},{3,4}}) && AreEqual(T,{{2,3},{1,4}})"), success: "La transpuesta es {{2,3},{1,4}}. Explica el cambio en tus observaciones." }
  ] },
  { id: "matrices-producto", materialId: "mtfm01-matrices-producto", title: "Producto de matrices y orden", unit: 4, source: "", intro: "Pr\xE1ctica complementaria: compara dos etapas que transforman una entrada (x,y). A entrega (x+2y,y) y B entrega (2x,3x+y). \xBFImporta cu\xE1l act\xFAa primero?", concept: "Cada entrada del producto se obtiene multiplicando una fila por una columna y sumando los resultados. En general, AB no coincide con BA.", question: "\xBFSiempre se cumple A\xB7B = B\xB7A?", options: ["No: el orden puede cambiar el resultado", "S\xED, igual que con n\xFAmeros reales", "Solo cambia si hay n\xFAmeros negativos"], answer: 0, explanation: "El producto matricial no es conmutativo en general.", steps: [
    { title: "Define los factores", page: 1, text: "Crea las matrices A = {{1,2},{0,1}} y B = {{2,0},{3,1}}.", commands: ["A={{1,2},{0,1}}", "B={{2,0},{3,1}}"], check: check(["A", "B"], "AreEqual(A,{{1,2},{0,1}}) && AreEqual(B,{{2,0},{3,1}})"), success: "Ambas matrices tienen dimensi\xF3n 2 \xD7 2; los dos productos est\xE1n definidos." },
    { title: "Calcula A por B", page: 1, text: "Predice la primera entrada: 1\xD72 + 2\xD73. Calcula P = A B y verifica las cuatro posiciones.", commands: ["P=A*B"], check: check(["A", "B", "P"], "AreEqual(A,{{1,2},{0,1}}) && AreEqual(B,{{2,0},{3,1}}) && AreEqual(P,{{8,2},{3,1}})"), success: "AB = {{8,2},{3,1}}; la primera entrada vale 8." },
    { title: "Invierte el orden", page: 1, text: "Calcula Q = B A y compara el resultado con P. Describe en tus notas qu\xE9 posiciones cambiaron.", commands: ["Q=B*A"], check: check(["P", "Q"], "AreEqual(P,{{8,2},{3,1}}) && AreEqual(Q,{{2,4},{3,7}})"), success: "BA = {{2,4},{3,7}}, distinto de AB. El orden importa." }
  ] },
  { id: "matrices-sistemas", materialId: "mtfm01-matrices-sistemas", title: "Determinante, inversa y sistemas", unit: 4, source: "", intro: "Pr\xE1ctica complementaria: cada pieza X usa 2 y 1 minutos en las estaciones 1 y 2; cada pieza Y usa 1 y 3 minutos. Ambas estaciones trabajaron 5 minutos. Resuelve 2x + y = 5; x + 3y = 5 e interpreta las cantidades de piezas.", concept: "En A X = b, si el determinante de A es distinto de cero, existe una soluci\xF3n \xFAnica y se obtiene con X = A\u207B\xB9b.", question: "\xBFCu\xE1ndo tiene inversa una matriz cuadrada?", options: ["Cuando su determinante es distinto de cero", "Cuando todas sus entradas son positivas", "Cuando todas sus filas son iguales"], answer: 0, explanation: "Un determinante no nulo permite invertir la matriz y obtener una soluci\xF3n \xFAnica.", steps: [
    { title: "Escribe el sistema matricial", page: 1, text: "Representa los coeficientes de 2x + y = 5 y x + 3y = 5 en A. Crea b como una columna con los t\xE9rminos independientes.", commands: ["A={{2,1},{1,3}}", "b={{5},{5}}"], check: check(["A", "b"], "AreEqual(A,{{2,1},{1,3}}) && AreEqual(b,{{5},{5}})"), success: "El sistema qued\xF3 representado como A X = b." },
    { title: "Comprueba el determinante", page: 1, text: "Calcula d = det(A). Contrasta el resultado con 2\xD73 \u2212 1\xD71. \xBFSe puede invertir A?", commands: ["d=Determinant(A)"], check: check(["A", "d"], "AreEqual(A,{{2,1},{1,3}}) && abs(d-5)<10^(-5)"), success: "El determinante vale 5; A tiene inversa." },
    { title: "Obt\xE9n la soluci\xF3n", page: 1, text: "Calcula la inversa N y luego X = N b. Interpreta la primera y la segunda fila como los valores de x e y.", commands: ["N=Invert(A)", "X=N*b"], check: check(["A", "N", "b", "X"], "AreEqual(N,{{0.6,-0.2},{-0.2,0.4}}) && AreEqual(b,{{5},{5}}) && AreEqual(X,{{2},{1}})"), success: "La soluci\xF3n es x = 2, y = 1." },
    { title: "Verifica en las ecuaciones", page: 1, text: "Calcula R = A X. Debe recuperar b. Comprueba tambi\xE9n a mano: 2\xD72+1=5 y 2+3\xD71=5.", commands: ["R=A*X"], check: check(["A", "X", "R"], "AreEqual(A,{{2,1},{1,3}}) && AreEqual(X,{{2},{1}}) && AreEqual(R,{{5},{5}})"), success: "La soluci\xF3n satisface ambas ecuaciones. Registra por qu\xE9 esta comprobaci\xF3n es necesaria." }
  ] }
);
geoLessons.push(...functionProblemLessons);

// src/learning/mathUnits.ts
var mathUnits = [
  { number: 1, id: "mtfm01-u1", title: "Unidad 1: Funciones polin\xF3micas" },
  { number: 2, id: "mtfm01-u2", title: "Unidad 2: Funci\xF3n exponencial y logar\xEDtmica" },
  { number: 3, id: "mtfm01-u3", title: "Unidad 3: Trigonometr\xEDa" },
  { number: 4, id: "mtfm01-u4", title: "Unidad 4: Sucesiones, sumatorias, vectores y matrices" }
];

// src/learning/temperatureLessons.ts
var POINTS = (ambient) => [ambient, 50, 75, 100];
var hasPoints = (c, sensor) => POINTS(c.settings.ambient).every((t) => c.records.some((r) => r.source === "simulada" && r.sensor === sensor && (sensor !== "pt" || Math.abs((r.ptLeadOhms ?? 0) - (c.settings.ptLeadOhms ?? 0)) < 1e-9) && Math.abs(r.temp - t) <= 0.6));
var SOURCE = "/estudio/instrumentacion/guia-temperatura-g03.docx";
var needPoints = "Registra antes los puntos: temperatura ambiente, 50, 75 y 100 \xB0C.";
var temperatureLessons = [
  {
    id: "temperatura-experiencia-1",
    materialId: "instrumentacion-g03-exp1",
    title: "Temperatura \xB7 Experiencia 1: investigar y explicar",
    experience: 1,
    unit: 2,
    source: SOURCE,
    bench: false,
    intro: "Antes de medir, aclara qu\xE9 es cada sensor, c\xF3mo funciona y qu\xE9 se\xF1al entrega. Estas preguntas siguen los puntos de investigaci\xF3n de la gu\xEDa.",
    concept: "Una termocupla y un Pt100 miden temperatura, pero de formas distintas: la primera genera una tensi\xF3n muy peque\xF1a y el segundo cambia su resistencia. Las dos var\xEDan de forma continua, no a saltos.",
    steps: [
      { title: "Se\xF1ales continuas y discretas", text: "La gu\xEDa pide definir la naturaleza de termocuplas y RTD.", success: "Correcto.", quiz: { question: "\xBFC\xF3mo es la se\xF1al de una termocupla o de un Pt100?", options: ["Discreta: solo existe encendido o apagado", "Continua (anal\xF3gica): cambia de forma gradual con la temperatura", "Digital: ya viene codificada en bits"], answer: 1, explanation: "Ambas var\xEDan de forma continua con la temperatura. Una se\xF1al discreta solo toma estados separados, como un detector de presencia con salida todo o nada.", concept: "senal-continua" } },
      { title: "Principio de la termocupla", text: "Define el principio de funcionamiento de una termocupla.", success: "Correcto.", quiz: { question: "\xBFC\xF3mo funciona una termocupla?", options: ["La resistencia de un metal aumenta con la temperatura", "Dos metales distintos unidos generan una tensi\xF3n peque\xF1a que depende de la diferencia de temperatura (efecto Seebeck)", "Un l\xEDquido se dilata y mueve una aguja"], answer: 1, explanation: "El efecto Seebeck produce milivoltios entre la uni\xF3n caliente y la referencia. Por eso una termocupla necesita conocer la temperatura de su uni\xF3n de referencia.", concept: "seebeck" } },
      { title: "Principio del Pt100", text: "Define el principio de funcionamiento de una RTD (Pt100).", success: "Correcto.", quiz: { question: "\xBFC\xF3mo funciona un Pt100?", options: ["Genera una tensi\xF3n propia al calentarse", "Cambia su temperatura seg\xFAn la corriente que lo atraviesa", "Su resistencia el\xE9ctrica aumenta de forma regular al subir la temperatura"], answer: 2, explanation: "El platino cambia su resistencia con la temperatura. Hay que medir esa resistencia (con una corriente peque\xF1a) para conocer la temperatura.", concept: "pt100-principio" } },
      { title: "Tipo de salida de cada sensor", text: "Define el tipo de salida de la termocupla y del Pt100.", success: "Correcto.", quiz: { question: "\xBFQu\xE9 magnitud entrega cada uno?", options: ["Termocupla: ohmios \xB7 Pt100: milivoltios", "Termocupla: milivoltios \xB7 Pt100: ohmios", "Los dos entregan una corriente de 4\u201320 mA directamente"], answer: 1, explanation: "La termocupla entrega una tensi\xF3n en milivoltios y el Pt100 una resistencia en ohmios. El 4\u201320 mA o 0\u201310 V aparece reci\xE9n en un transmisor.", concept: "salidas" } },
      { title: "Qu\xE9 significa \xAB100\xBB en Pt100", text: "Interpreta el nombre del sensor.", success: "Correcto.", quiz: { question: "\xBFQu\xE9 indica el 100 de Pt100?", options: ["Que mide hasta 100 \xB0C", "Que tiene 100 \u03A9 a 0 \xB0C", "Que entrega 100 mV a 100 \xB0C"], answer: 1, explanation: "Pt es platino y 100 es su resistencia a 0 \xB0C. Por eso a temperatura ambiente se espera algo m\xE1s de 100 \u03A9.", concept: "pt100-valor" } }
    ]
  },
  {
    id: "temperatura-experiencia-2",
    materialId: "instrumentacion-g03-exp2",
    title: "Temperatura \xB7 Experiencia 2: medir y comparar sensores",
    experience: 2,
    unit: 2,
    source: SOURCE,
    bench: true,
    intro: "Mide una termocupla (K o J, a tu elecci\xF3n) y un Pt100 a temperatura ambiente, 50, 75 y 100 \xB0C, y compara sus curvas. Los datos de esta pr\xE1ctica son simulados; en el laboratorio los reemplazas por tus mediciones reales.",
    concept: "La termocupla se mide en milivoltios (funci\xF3n mV) y el Pt100 en ohmios (funci\xF3n \u03A9). El horno de pozo seco necesita unos segundos para estabilizarse: lee solo cuando el banco avise que la sonda lleg\xF3 a la temperatura.",
    review: { concept: "funcion-medida", question: "\xBFPor qu\xE9 el Pt100 se mide en ohmios y la termocupla en milivoltios?", options: ["Porque el Pt100 es una resistencia y la termocupla genera una tensi\xF3n", "Porque el mult\xEDmetro solo mide ohmios en el horno", "Porque son lo mismo con otro nombre"], answer: 0, explanation: "El Pt100 cambia su resistencia con la temperatura; la termocupla genera una tensi\xF3n peque\xF1a por el efecto Seebeck. Medir con la funci\xF3n equivocada no informa la temperatura." },
    steps: [
      { title: "Introduce las dos sondas en el pozo", text: "Arrastra hacia abajo el control de cada sonda para insertarla, o toca \xABinsertar\xBB. Ambas deben quedar dentro del pozo.", success: "Las dos sondas est\xE1n en el pozo.", check: (c) => c.settings.inWell.tc && c.settings.inWell.pt },
      { title: "Mide la termocupla en milivoltios", text: "Elige la funci\xF3n mV en el mult\xEDmetro y conecta la punta roja al hilo + y la negra al hilo \u2212 de la termocupla. Cambia el tipo (K o J) si quieres comparar.", success: "Est\xE1s leyendo la tensi\xF3n de la termocupla con la funci\xF3n correcta.", concept: "funcion-medida", check: (c) => c.reading.state === "ok" && c.reading.sensor === "tc" && c.reading.meaningful },
      { title: "Registra los cuatro puntos de la termocupla", text: "Fija el horno en ambiente, 50, 75 y 100 \xB0C. En cada punto espera la estabilizaci\xF3n, toca su casilla en la libreta G03, lee la pantalla y transcribe el valor en mV. La uni\xF3n de referencia queda a la temperatura ambiente.", success: "Tienes los cuatro puntos de la termocupla.", concept: "cuatro-puntos", check: (c) => hasPoints(c, "tc") },
      { title: "Mide el Pt100 en ohmios", text: "Cambia el mult\xEDmetro a \u03A9 y conecta una punta a un hilo rojo y la otra a un hilo blanco del Pt100.", success: "Est\xE1s midiendo la resistencia del Pt100.", concept: "hilos-pt100", check: (c) => c.reading.state === "ok" && c.reading.sensor === "pt" && c.reading.meaningful },
      { title: "Registra los cuatro puntos del Pt100", text: "Repite ambiente, 50, 75 y 100 \xB0C usando los botones del horno. Lee \u03A9 en el instrumento y transcribe cada lectura en la casilla Pt100 de la libreta. Luego compara con las referencias.", success: "Tienes los cuatro puntos del Pt100.", concept: "cuatro-puntos", check: (c) => hasPoints(c, "pt") },
      {
        title: "Calcula la sensibilidad del Pt100",
        text: "Con tus datos, calcula cu\xE1ntos ohmios cambia el Pt100 por cada grado entre la temperatura ambiente y 100 \xB0C.",
        success: "La sensibilidad coincide con tus datos.",
        concept: "sensibilidad",
        ask: {
          prompt: "Sensibilidad media del Pt100 entre ambiente y 100 \xB0C",
          unit: "\u03A9/\xB0C",
          tolerance: 0.01,
          missing: needPoints,
          expected: (c) => {
            const pts = c.records.filter((r) => r.source === "simulada" && r.sensor === "pt");
            const lo = pts.find((r) => Math.abs(r.temp - c.settings.ambient) <= 0.6), hi = pts.find((r) => Math.abs(r.temp - 100) <= 0.6);
            return lo && hi ? (hi.value - lo.value) / (hi.temp - lo.temp) : null;
          }
        }
      }
    ]
  },
  {
    id: "temperatura-experiencia-3",
    materialId: "instrumentacion-g03-exp3",
    title: "Temperatura \xB7 Experiencia 3: medir mediante transmisor",
    experience: 3,
    unit: 2,
    source: SOURCE,
    bench: true,
    intro: "Conecta la termocupla de la experiencia anterior a un transmisor con salida en tensi\xF3n y construye otra curva: temperatura, salida de la termocupla y salida del transmisor en los mismos cuatro puntos.",
    concept: "Un transmisor convierte los milivoltios de la termocupla en una se\xF1al normalizada, por ejemplo 0\u201310 V. El rango de temperatura que corresponde a esa salida lo configuras t\xFA: la gu\xEDa propone 0\u201310 V como ejemplo y no fija el rango de entrada.",
    review: { concept: "transmisor-tipo", question: "Si el transmisor est\xE1 configurado para una termocupla tipo J y el sensor es tipo K, \xBFqu\xE9 ocurre?", options: ["Nada: ambos tipos son iguales", "La salida es incorrecta, porque interpreta los milivoltios con la tabla equivocada", "El transmisor se apaga solo"], answer: 1, explanation: "Cada tipo de termocupla tiene su propia tabla de milivoltios por grado. Un tipo mal configurado produce una temperatura err\xF3nea aunque todo est\xE9 conectado." },
    steps: [
      { title: "Conecta la termocupla al transmisor y alim\xE9ntalo", text: "Conecta los hilos sobre el transmisor y opera el interruptor de la fuente sobre el banco. Introduce la termocupla en el pozo.", success: "El transmisor recibe la termocupla y est\xE1 alimentado.", concept: "transmisor-conexion", check: (c) => c.settings.txConnected && c.settings.txPowered },
      { title: "Configura el transmisor", text: "Selecciona el mismo tipo de termocupla que usas y define un rango de temperatura para la salida de 0 a 10 V (por ejemplo, de 0 a 100 \xB0C o el que prefieras).", success: "El tipo coincide con la termocupla y el rango es v\xE1lido.", concept: "transmisor-tipo", check: (c) => c.settings.txType === c.settings.tcType && c.settings.txMax - c.settings.txMin >= 50 },
      { title: "Mide la salida del transmisor", text: "Elige la funci\xF3n V del mult\xEDmetro y conecta las puntas a la salida + y \u2212 del transmisor.", success: "Est\xE1s midiendo la tensi\xF3n de salida del transmisor.", concept: "transmisor-conexion", check: (c) => c.reading.state === "ok" && c.reading.sensor === "tx" && c.reading.meaningful },
      { title: "Registra los cuatro puntos de ambos sensores", text: "En ambiente, 50, 75 y 100 \xB0C registra la salida de la termocupla (mV) y la del transmisor (V). Gira el selector y mueve las puntas entre una lectura y otra. Transcribe cada valor en su casilla de la libreta G03.", success: "Tienes la curva de la termocupla y la del transmisor.", concept: "cuatro-puntos", check: (c) => hasPoints(c, "tc") && hasPoints(c, "tx") },
      {
        title: "Predice una salida con tu rango",
        text: "Con el rango que configuraste, calcula qu\xE9 tensi\xF3n deber\xEDa entregar el transmisor a 75 \xB0C y comp\xE1rala con tu registro.",
        success: "Tu c\xE1lculo coincide con el rango configurado.",
        concept: "transmisor-rango",
        ask: {
          prompt: "Tensi\xF3n esperada a 75 \xB0C",
          unit: "V",
          tolerance: 0.05,
          missing: "Configura primero un rango v\xE1lido en el transmisor.",
          expected: (c) => {
            const { txMin, txMax } = c.settings;
            return txMax > txMin ? Math.min(10, Math.max(0, 10 * (75 - txMin) / (txMax - txMin))) : null;
          }
        }
      }
    ]
  }
];

// src/lab/detectors/physics.ts
var MODELS = ["CR30-15DN", "CR30-15DP", "XS118BLPAL2", "BR100-DDT-P"];
var TERMINALS = [
  { id: "g+", label: "Fuente +24 V", device: "supply" },
  { id: "g-", label: "Fuente 0 V", device: "supply" },
  { id: "s+", label: "Detector +V", device: "sensor" },
  { id: "s-", label: "Detector 0 V", device: "sensor" },
  { id: "so", label: "Detector OUT", device: "sensor" },
  { id: "px", label: "PLC entrada X0", device: "plc" },
  { id: "pc", label: "PLC S/S (com\xFAn)", device: "plc" }
];
var SUPPLY_V = 24;
var FICHA_FIELDS = ["brand", "wires", "principle", "output", "supply", "range"];
var fichaComplete = (f) => FICHA_FIELDS.every((k) => String(f[k]).trim() !== "");
var IDS = TERMINALS.map((t) => t.id);

// src/learning/detectorLessons.ts
var HIGH = SUPPLY_V * 0.8;
var LOW = SUPPLY_V * 0.2;
var sim = (c) => c.records.filter((r) => r.source === "simulada");
var generic = (c, kind, output) => sim(c).filter((r) => r.model === "generic" && r.kind === kind && r.output === output);
var SOURCE_G01 = "/estudio/instrumentacion/guia-detectores-g01.docx";
var SOURCE_G02 = "/estudio/instrumentacion/guia-proximidad-plc-g02.docx";
var detectorLessons = [
  {
    id: "detectores-experiencia-1",
    materialId: "instrumentacion-g01-exp1",
    title: "Detectores \xB7 Gu\xEDa 1, experiencia 1: investigar y explicar",
    guide: "G01",
    unit: 2,
    source: SOURCE_G01,
    bench: false,
    intro: "Antes de montar nada, aclara qu\xE9 es un detector de presencia, qu\xE9 se\xF1al entrega y c\xF3mo se clasifican. Estas preguntas siguen los puntos de investigaci\xF3n de la gu\xEDa.",
    concept: "Un detector de presencia entrega una se\xF1al discreta: solo tiene dos estados, con objeto o sin objeto. Se clasifican por cantidad de hilos, por principio de detecci\xF3n (inductivo, capacitivo, fotoel\xE9ctrico) y por tipo de salida (PNP o NPN).",
    steps: [
      { title: "Se\xF1al discreta o continua", text: "La gu\xEDa pide definir la naturaleza de los detectores de presencia.", success: "Correcto.", quiz: { question: "\xBFC\xF3mo es la se\xF1al de un detector de presencia?", options: ["Continua: cambia gradualmente con la distancia", "Discreta: tiene dos estados, detecta o no detecta", "Anal\xF3gica de 4\u201320 mA"], answer: 1, explanation: "La salida solo toma dos niveles, por ejemplo 24 V o 0 V. Eso es una se\xF1al discreta. Un sensor de temperatura, en cambio, entrega una se\xF1al continua." } },
      { title: "Clasificaci\xF3n por cantidad de hilos", text: "Los detectores se clasifican por cantidad de hilos.", success: "Correcto.", quiz: { question: "\xBFQu\xE9 conexiones tiene un detector de tres hilos de corriente continua?", options: ["Fase, neutro y tierra", "Positivo de alimentaci\xF3n, 0 V y se\xF1al de salida", "Tres se\xF1ales de salida independientes"], answer: 1, explanation: "Dos hilos alimentan al detector (positivo y 0 V) y el tercero entrega la salida." } },
      { title: "Detector inductivo", text: "Define el principio de detecci\xF3n del detector inductivo.", success: "Correcto.", quiz: { question: "\xBFQu\xE9 puede detectar un detector inductivo?", options: ["Cualquier material, incluidos pl\xE1sticos y l\xEDquidos", "Solo objetos met\xE1licos", "Solo objetos transparentes"], answer: 1, explanation: "El detector inductivo genera un campo electromagn\xE9tico que cambia cuando se acerca un metal. Un pl\xE1stico no lo altera." } },
      { title: "Detector capacitivo", text: "Define el principio de detecci\xF3n del detector capacitivo.", success: "Correcto.", quiz: { question: "\xBFQu\xE9 diferencia al detector capacitivo del inductivo?", options: ["Detecta tambi\xE9n materiales no met\xE1licos", "Solo detecta metales ferrosos", "No necesita alimentaci\xF3n"], answer: 0, explanation: "El capacitivo responde a cambios de capacitancia que producen metales y tambi\xE9n materiales no met\xE1licos, como pl\xE1sticos, madera o l\xEDquidos." } },
      { title: "Tipo de salida PNP y NPN", text: "Define el tipo de salida de los detectores.", success: "Correcto.", quiz: { question: "Un detector PNP se activa. \xBFQu\xE9 hace su salida?", options: ["La conecta a 0 V", "La conecta al positivo de alimentaci\xF3n", "La deja siempre abierta"], answer: 1, explanation: "La salida PNP entrega positivo (source) cuando se activa. La NPN conecta la salida a 0 V (sink). La carga o el PLC debe ser compatible con el tipo de salida." } }
    ]
  },
  {
    id: "detectores-experiencia-2",
    materialId: "instrumentacion-g01-exp2",
    title: "Detectores \xB7 Gu\xEDa 1, experiencia 2: montar y medir detectores",
    guide: "G01",
    unit: 2,
    source: SOURCE_G01,
    bench: true,
    intro: "Monta un detector de tres hilos con fuente de 24 V y mult\xEDmetro, mide su salida con y sin objeto, y compara los detectores inductivo, capacitivo y fotoel\xE9ctrico con objetos met\xE1licos y no met\xE1licos. Los datos de esta pr\xE1ctica son simulados; en el laboratorio los reemplazas por tus mediciones reales.",
    concept: "La salida de un detector PNP medida contra 0 V sube a 24 V cuando detecta. En un NPN esa misma medida queda en 0 V, y es entre +V y la salida donde aparecen los 24 V. El inductivo solo detecta metales; el capacitivo y el fotoel\xE9ctrico tambi\xE9n detectan no met\xE1licos. El banco usa un detector gen\xE9rico declarado: no es un modelo comercial.",
    review: { question: "\xBFPor qu\xE9 un detector inductivo no responde a un objeto de pl\xE1stico?", options: ["Porque el pl\xE1stico est\xE1 demasiado caliente", "Porque su campo electromagn\xE9tico solo cambia con un material met\xE1lico", "Porque el pl\xE1stico no refleja la luz"], answer: 1, explanation: "El principio inductivo depende de corrientes inducidas en un metal. Un pl\xE1stico no altera el campo, aunque est\xE9 dentro del alcance. El capacitivo y el fotoel\xE9ctrico usan otros principios." },
    steps: [
      { title: "Conecta y alimenta el detector", text: "Con la herramienta \xABCable\xBB, une +24 V con +V del detector y 0 V con 0 V del detector. Luego enciende la fuente (pulsa la fuente). El detector inductivo PNP est\xE1 seleccionado.", success: "El detector est\xE1 alimentado con la polaridad correcta.", check: (c) => c.sol.powered && c.settings.model === "generic" },
      { title: "Mide la salida sin objeto", text: "En el mult\xEDmetro elige V, punta roja en OUT y punta negra en 0 V. Retira el objeto (pulsa el objeto y elige \xABSin objeto\xBB) y registra el punto.", success: "Tienes la salida sin objeto.", check: (c) => generic(c, "inductive", "pnp").some((r) => r.object === "none" && !r.detected && r.ref === "0v") },
      { title: "Acerca un objeto met\xE1lico", text: "Coloca un objeto de metal dentro del alcance del detector (elige la distancia \xABDentro\xBB). El LED del detector debe encenderse. Registra la salida.", success: "El inductivo detecta el metal y su salida sube a 24 V.", check: (c) => generic(c, "inductive", "pnp").some((r) => r.object === "metal" && r.detected && r.ref === "0v" && r.value >= HIGH) },
      { title: "Prueba un objeto no met\xE1lico", text: "Cambia el material a pl\xE1stico, tambi\xE9n dentro del alcance, y registra de nuevo. Observa si el inductivo lo detecta.", success: "El inductivo no detecta el pl\xE1stico: su salida sigue en 0 V.", check: (c) => generic(c, "inductive", "pnp").some((r) => r.object === "plastic" && !r.detected && r.ref === "0v" && r.value <= LOW) },
      { title: "Repite con un detector capacitivo", text: "En el detector, elige el principio capacitivo (mant\xE9n PNP) y registra la salida con metal y con pl\xE1stico dentro del alcance.", success: "El capacitivo detecta ambos materiales.", check: (c) => {
        const r = generic(c, "capacitive", "pnp");
        return r.some((x) => x.object === "metal" && x.detected && x.value >= HIGH) && r.some((x) => x.object === "plastic" && x.detected && x.value >= HIGH);
      } },
      { title: "Repite con un detector fotoel\xE9ctrico", text: "Elige el principio fotoel\xE9ctrico. Registra la salida sin objeto y con un objeto dentro de su alcance, que es mayor que el de los otros dos.", success: "Tienes el fotoel\xE9ctrico con y sin objeto.", check: (c) => {
        const r = generic(c, "photo", "pnp");
        return r.some((x) => x.object === "none" && !x.detected && x.value <= LOW) && r.some((x) => x.object !== "none" && x.detected && x.value >= HIGH);
      } },
      { title: "Compara con una salida NPN", text: "Cambia la salida a NPN. Con el objeto dentro del alcance, mide con la punta roja en +V y la negra en OUT y registra. Luego mide tambi\xE9n entre OUT y 0 V y registra: abre la tarjeta Gr\xE1fica para ver ambas medidas.", success: "Tienes el NPN medido contra +V.", check: (c) => sim(c).some((r) => r.output === "npn" && r.model === "generic" && r.detected && r.ref === "plus" && r.value >= HIGH) },
      {
        title: "Interpreta la medida contra 0 V",
        text: "Mira tu registro del detector NPN activado.",
        success: "Correcto: la salida NPN activa queda en 0 V, no en 24 V.",
        ask: {
          prompt: "Tensi\xF3n entre OUT y 0 V con el NPN activado",
          unit: "V",
          tolerance: 0.5,
          missing: "Registra primero el NPN con objeto detectado midiendo entre OUT y 0 V.",
          expected: (c) => {
            const r = sim(c).find((x) => x.output === "npn" && x.model === "generic" && x.detected && x.ref === "0v");
            return r ? r.value : null;
          }
        }
      }
    ]
  },
  {
    id: "proximidad-plc-g02",
    materialId: "instrumentacion-g02",
    title: "Proximidad y PLC \xB7 Gu\xEDa 2: funcionamiento y conexi\xF3n al PLC",
    guide: "G02",
    unit: 2,
    source: SOURCE_G02,
    bench: true,
    intro: "Re\xFAne la ficha t\xE9cnica de tus detectores, comprueba la salida con mult\xEDmetro con y sin objeto y conecta el detector asignado a la entrada digital de un PLC para que lea 24 V con el objeto presente.",
    concept: "Los modelos de la gu\xEDa (CR30-15DN, CR30-15DP, XS118BLPAL2 y BR100-DDT-P) no est\xE1n en el banco: faltan sus fichas t\xE9cnicas. Copia de cada manual lo que pide la gu\xEDa y el banco simular\xE1 tu detector con esos datos. Los bornes, colores y distancias reales de cada modelo no se inventan. La entrada del PLC del banco es gen\xE9rica: confirma los bornes de la maqueta Delta del laboratorio.",
    review: { question: "Tu detector tiene salida NPN. Para que la entrada del PLC reciba 24 V con el objeto presente, \xBFqu\xE9 debes revisar?", options: ["Nada: todos los detectores se conectan igual", "Que el com\xFAn del PLC vaya al positivo de la fuente, porque la salida NPN baja a 0 V al activarse", "Que la salida se conecte al 0 V de la fuente"], answer: 1, explanation: "Una salida NPN activa conecta la salida a 0 V; la entrada necesita su com\xFAn al positivo para que circule corriente. Con un PNP el com\xFAn va a 0 V. La compatibilidad PNP/NPN de la entrada la fija la maqueta y su ficha." },
    steps: [
      { title: "Completa la ficha t\xE9cnica de los cuatro modelos", text: "Abre la tarjeta \xABFichas\xBB y copia de cada manual: marca, cantidad de hilos, principio, tipo de salida, alimentaci\xF3n y distancia de detecci\xF3n. El banco no trae estos datos: mientras falten, el modelo queda pendiente de ficha t\xE9cnica.", success: "Las cuatro fichas tienen sus seis datos. El programa no eval\xFAa si coinciden con el manual.", check: (c) => MODELS.every((m) => fichaComplete(c.settings.fichas[m])) },
      { title: "Conecta tu detector asignado a la fuente", text: "En el detector elige el modelo que te asign\xF3 el docente, une +V y 0 V con la fuente y enci\xE9ndela. Debe ser de tres hilos y salida PNP o NPN para que el banco pueda simularlo.", success: "Tu detector est\xE1 alimentado seg\xFAn tu ficha.", check: (c) => c.settings.model !== "generic" && c.spec !== null && c.sol.powered },
      { title: "Mide la salida sin objeto", text: "Con el mult\xEDmetro en V, mide la salida del detector sin objeto y registra. Si tu detector es NPN, mide tambi\xE9n con la punta roja en +V y la negra en OUT.", success: "Tienes la salida sin objeto.", check: (c) => c.settings.model !== "generic" && sim(c).some((r) => r.model === c.settings.model && r.object === "none" && !r.detected) },
      { title: "Mide la salida con objeto", text: "Coloca un objeto que tu detector pueda detectar, dentro del alcance de tu ficha, y registra. Revisa en la tabla si la salida qued\xF3 en nivel alto (24 V) o bajo (0 V).", success: "Tienes la salida con objeto detectado.", check: (c) => c.settings.model !== "generic" && sim(c).some((r) => r.model === c.settings.model && r.detected) },
      { title: "Conecta la salida a la entrada del PLC", text: "Une la salida OUT con X0 del PLC y el COM del PLC con la l\xEDnea que corresponda a tu tipo de salida (PNP: 0 V; NPN: +24 V). Con el objeto presente, la entrada X0 debe leer 24 V y quedar en ON.", success: "X0 lee 24 V y est\xE1 en ON con el objeto presente.", check: (c) => c.sol.plcOn && c.sol.active && c.settings.wires.some((w) => w.includes("so") && w.includes("px")) },
      { title: "Retira el objeto", text: "Quita el objeto o al\xE9jalo fuera del alcance. La entrada debe pasar a OFF con las conexiones intactas.", success: "La entrada vuelve a OFF sin objeto.", check: (c) => c.settings.model !== "generic" && c.sol.powered && !c.sol.active && !c.sol.plcOn && c.settings.wires.some((w) => w.includes("so") && w.includes("px")) },
      {
        title: "Presenta el diagrama de conexi\xF3n",
        text: "La tarjeta \xABConexiones\xBB lista cada cable de tu montaje: c\xF3piala en el documento de la gu\xEDa. Escribe tambi\xE9n tu conclusi\xF3n individual en \xABMis observaciones\xBB.",
        success: "Cuentas bien las conexiones de tu montaje.",
        ask: { prompt: "Cantidad de cables de tu montaje", unit: "cables", tolerance: 0, missing: "Todav\xEDa no hay cables en el banco.", expected: (c) => c.settings.wires.length ? c.settings.wires.length : null }
      }
    ]
  }
];

// src/learning/temperatureReview.ts
var REVIEW_ID = "temperatura-repaso";
var REVIEW_MATERIAL = "instrumentacion-g03-repaso";
var q = (concept, question, options, answer, explanation) => ({ concept, question, options, answer, explanation });
var QUESTIONS = [
  q("senal-continua", "Un detector de presencia entrega 24 V o 0 V. Una termocupla entrega una tensi\xF3n que cambia suavemente con la temperatura. \xBFCu\xE1l es continua?", ["El detector de presencia", "La termocupla", "Las dos son discretas"], 1, "La termocupla es continua: toma muchos valores intermedios. El detector con 24 V o 0 V es discreto."),
  q("senal-continua", "Si el horno sube de 50 a 75 \xB0C, la lectura del Pt100\u2026", ["Salta de golpe entre dos valores fijos", "Cambia de forma gradual", "No cambia mientras no llegue a 100 \xB0C"], 1, "Es una se\xF1al continua: la resistencia va aumentando gradualmente con la temperatura."),
  q("seebeck", "\xBFQu\xE9 provoca la tensi\xF3n de una termocupla?", ["Dos metales distintos unidos y una diferencia de temperatura", "Una corriente que le entrega el mult\xEDmetro", "Que el platino cambie de resistencia"], 0, "Es el efecto Seebeck: la uni\xF3n de dos metales distintos genera una tensi\xF3n que depende de la temperatura."),
  q("seebeck", "Una termocupla K est\xE1 formada por\u2026", ["Un solo hilo de platino", "Dos aleaciones met\xE1licas distintas", "Un semiconductor y un condensador"], 1, "Una termocupla se forma con dos metales o aleaciones distintos; en la tipo K son cromel y alumel."),
  q("pt100-principio", "\xBFPor qu\xE9 el Pt100 sirve para medir temperatura?", ["Porque su resistencia aumenta con la temperatura", "Porque genera milivoltios", "Porque cambia de color"], 0, "El platino cambia su resistencia con la temperatura de forma regular y repetible."),
  q("pt100-principio", "Si la temperatura del Pt100 sube, su resistencia\u2026", ["Baja", "Sube", "Se mantiene fija"], 1, "En el platino la resistencia aumenta con la temperatura."),
  q("salidas", "Quieres medir una termocupla con el mult\xEDmetro. \xBFQu\xE9 magnitud esperas leer?", ["Unos pocos milivoltios", "Cientos de ohmios", "Una corriente de 4\u201320 mA"], 0, "La termocupla entrega una tensi\xF3n de milivoltios."),
  q("salidas", "El Pt100 entrega\u2026", ["Una tensi\xF3n de milivoltios", "Una resistencia en ohmios", "Una se\xF1al digital de bits"], 1, "El Pt100 es una resistencia: se mide en ohmios."),
  q("pt100-valor", "Un Pt100 mide 100 \u03A9. \xBFA qu\xE9 temperatura est\xE1?", ["A 0 \xB0C", "A 100 \xB0C", "A temperatura ambiente de 22 \xB0C"], 0, "El \xAB100\xBB indica 100 \u03A9 a 0 \xB0C."),
  q("pt100-valor", "\xBFQu\xE9 resistencia esperas de un Pt100 a 100 \xB0C?", ["Unos 100 \u03A9", "Unos 138,5 \u03A9", "Unos 1000 \u03A9"], 1, "A 100 \xB0C el Pt100 vale unos 138,5 \u03A9 (0,385 \u03A9 por grado en promedio)."),
  q("union-fria", "El horno est\xE1 a 100 \xB0C y sube la temperatura ambiente. La tensi\xF3n medida de la termocupla\u2026", ["Disminuye, porque la referencia est\xE1 m\xE1s caliente", "Aumenta", "No cambia"], 0, "La tensi\xF3n depende de la diferencia entre la uni\xF3n caliente y la de referencia; si la referencia sube, la diferencia baja."),
  q("union-fria", "\xBFPor qu\xE9 importa la temperatura de la uni\xF3n de referencia?", ["Porque la tensi\xF3n medida es una diferencia entre dos temperaturas", "Porque calienta el mult\xEDmetro", "No importa nunca"], 0, "La termocupla mide la diferencia entre la uni\xF3n caliente y la de referencia; hay que conocer esta \xFAltima para obtener la temperatura real."),
  q("funcion-medida", "Mides la termocupla con la funci\xF3n \u03A9 y lees casi 0 \u03A9. \xBFQu\xE9 pas\xF3?", ["La termocupla est\xE1 en 0 \xB0C", "Elegiste la funci\xF3n equivocada: su resistencia no informa la temperatura", "El horno se apag\xF3"], 1, "La termocupla es casi un conductor. Para ver su se\xF1al hay que usar mV."),
  q("funcion-medida", "Mides el Pt100 con la funci\xF3n mV y lees 0. \xBFPor qu\xE9?", ["El Pt100 no genera tensi\xF3n: es una resistencia", "El Pt100 est\xE1 da\xF1ado", "Faltan 10 minutos de espera"], 0, "El Pt100 solo cambia su resistencia; para leerlo se usa la funci\xF3n \u03A9."),
  q("hilos-pt100", "En un Pt100 de 3 hilos hay dos rojos y uno blanco. \xBFEntre cu\xE1les mides la resistencia del sensor?", ["Entre los dos rojos", "Entre un rojo y el blanco", "Entre un hilo y la vaina de acero"], 1, "Los dos rojos van unidos al mismo extremo del elemento; el sensor est\xE1 entre un rojo y el blanco."),
  q("hilos-pt100", "Mides entre los dos hilos rojos de un Pt100 y lees casi 0 \u03A9. \xBFEst\xE1 da\xF1ado?", ["S\xED, est\xE1 en cortocircuito", "No: los dos rojos est\xE1n unidos en el mismo extremo y solo mides el cable", "S\xED, porque no est\xE1 en el horno"], 1, "Es normal. Hay que medir entre un hilo rojo y uno blanco."),
  q("conexion-puntas", "Pones la punta roja en la termocupla y la negra en el Pt100. El mult\xEDmetro muestra OL. \xBFPor qu\xE9?", ["Los dos sensores est\xE1n a la misma temperatura", "El circuito queda abierto: son sensores distintos", "El mult\xEDmetro est\xE1 en la escala m\xE1s grande"], 1, "Cada medici\xF3n se hace entre los dos hilos del mismo sensor."),
  q("conexion-puntas", "Para medir la termocupla, las dos puntas deben ir\u2026", ["Una en cada hilo de la termocupla", "Las dos en el mismo hilo", "Una en la termocupla y otra en la fuente"], 0, "Se mide entre el hilo + y el hilo \u2212, que cierran el circuito del mult\xEDmetro."),
  q("estabilidad", "Acabas de bajar la sonda al horno y la pantalla ya muestra 75 \xB0C. \xBFCu\xE1ndo registras?", ["De inmediato", "Cuando la sonda tambi\xE9n lleg\xF3 a la temperatura y el banco marca \xABestable\xBB", "Cuando el horno vuelva al ambiente"], 1, "La sonda tarda en igualar la temperatura del pozo: la lectura solo vale cuando ya es estable."),
  q("estabilidad", "Registras mientras la sonda a\xFAn se est\xE1 calentando. El valor ser\xE1\u2026", ["Menor que el de equilibrio", "Igual al de equilibrio", "Mayor que el de equilibrio"], 0, "Todav\xEDa no lleg\xF3 a la temperatura del horno, as\xED que el valor a\xFAn no es el definitivo."),
  q("cuatro-puntos", "Tienes registrados ambiente, 50 y 100 \xB0C de un sensor. \xBFQu\xE9 punto de la gu\xEDa falta?", ["25 \xB0C", "75 \xB0C", "150 \xB0C"], 1, "La gu\xEDa pide ambiente, 50, 75 y 100 \xB0C."),
  q("cuatro-puntos", "\xBFPor qu\xE9 se pide registrar los mismos cuatro puntos para la termocupla y el Pt100?", ["Para poder comparar sus curvas", "Porque el horno solo llega a 4 temperaturas", "Para gastar menos tiempo"], 0, "Con los mismos puntos se comparan ambos sensores y con las tablas de referencia."),
  q("sensibilidad", "Un Pt100 pasa de 108,6 \u03A9 a 138,5 \u03A9 entre 22 y 100 \xB0C. \xBFCu\xE1ntos ohmios cambia por grado (promedio)?", ["Aproximadamente 0,38 \u03A9/\xB0C", "Aproximadamente 3,8 \u03A9/\xB0C", "Aproximadamente 38 \u03A9/\xB0C"], 0, "(138,5 \u2212 108,6) \xF7 78 \u2248 0,38 \u03A9/\xB0C."),
  q("sensibilidad", "La sensibilidad se calcula como\u2026", ["Cambio de la lectura dividido por el cambio de temperatura", "Temperatura dividida por la lectura", "Suma de todas las lecturas"], 0, "Es cu\xE1nto cambia la lectura por cada grado: \u0394lectura \xF7 \u0394temperatura."),
  q("transmisor-conexion", "El transmisor est\xE1 conectado a la termocupla pero la fuente est\xE1 apagada. \xBFQu\xE9 tensi\xF3n mides en su salida?", ["0 V", "10 V", "La que corresponde a la temperatura"], 0, "Sin alimentaci\xF3n el transmisor no entrega salida."),
  q("transmisor-conexion", "El transmisor est\xE1 alimentado pero su entrada no est\xE1 conectada a la termocupla. Su salida\u2026", ["Vale 0 V", "Vale 10 V", "Sigue la temperatura del horno"], 0, "No recibe se\xF1al de temperatura, as\xED que no hay salida \xFAtil."),
  q("transmisor-tipo", "La termocupla es tipo K y el transmisor est\xE1 configurado como tipo J. La salida\u2026", ["Es incorrecta aunque todo est\xE9 conectado", "Es exacta", "Se apaga"], 0, "Cada tipo tiene su propia tabla de milivoltios; con el tipo equivocado el transmisor interpreta mal la se\xF1al."),
  q("transmisor-tipo", "Antes de medir con el transmisor debes verificar que\u2026", ["Su tipo configurado coincida con el de la termocupla", "La fuente est\xE9 en 0 V", "El mult\xEDmetro est\xE9 en \u03A9"], 0, "El tipo de termocupla configurado debe ser el mismo del sensor."),
  q("transmisor-rango", "Rango 20\u2013120 \xB0C y salida 0\u201310 V. \xBFQu\xE9 tensi\xF3n corresponde a 70 \xB0C?", ["5 V", "7 V", "3,5 V"], 0, "(70 \u2212 20) \xF7 100 \xD7 10 V = 5 V."),
  q("transmisor-rango", "Rango 0\u201350 \xB0C y salida 0\u201310 V. La temperatura sube a 60 \xB0C. La salida\u2026", ["Se limita a 10 V", "Llega a 12 V", "Vuelve a 0 V"], 0, "La salida satura en 10 V; no pasa del m\xE1ximo.")
];

// src/study/academicContent.ts
var q2 = (id, title, pages, body, question, options, correct, explanation, scene, task) => ({ id, title, pages, body, question, options, correct, explanation, hint: "Revisa la relaci\xF3n que explica el paso y prueba otra vez. " + explanation, scene, task });
var n = (id, title, pages, body, question, value, tolerance, unit, explanation, scene, task) => ({ id, title, pages, body, question, value, tolerance, unit, explanation, hint: "Comprueba las unidades y sustituye en la expresi\xF3n del paso.", scene, task });
var academicLessons = [
  { id: "ii-fundamentos", sourceId: "I02", title: "Conferencia 1 \xB7 Fundamentos de instrumentaci\xF3n", courseId: "s2-3", unitId: "ii-u1", scope: "Siete bloques de la conferencia y cuaderno de la Tarea 1.", steps: [
    q2("automatizar", "Automatizaci\xF3n y supervisi\xF3n", "2\u20136", "La automatizaci\xF3n combina equipos y conocimiento del proceso. El operador sigue supervisando condiciones, alarmas y objetivos.", "\xBFQu\xE9 describe mejor una automatizaci\xF3n?", ["Instalar cualquier equipo electr\xF3nico", "Coordinar medici\xF3n, decisiones y acciones para un objetivo", "Eliminar toda supervisi\xF3n"], 1, "El objetivo del proceso organiza la medici\xF3n, el control y la actuaci\xF3n."),
    q2("lazo", "Medir, decidir y actuar", "7\u20138", "Un sensor obtiene informaci\xF3n, un controlador compara con el objetivo y un actuador modifica el proceso. La se\xF1al y la energ\xEDa cumplen funciones distintas.", "En un lazo de nivel, \xBFqui\xE9n compara la medida con la consigna?", ["El sensor", "El controlador", "La v\xE1lvula"], 1, "El controlador decide; el sensor mide y el actuador ejecuta.", "loop"),
    q2("nivel", "El lazo de nivel", "9\u201310", "Explora el modelo did\xE1ctico de tanque: una bomba llena cuando el nivel est\xE1 bajo la consigna y se detiene al alcanzarla. Es una decisi\xF3n simplificada sin hist\xE9resis.", "Si sube la consigna sobre el nivel actual, \xBFqu\xE9 orden entrega este modelo?", ["Llenar", "Detener siempre", "Invertir la medida"], 0, "La comparaci\xF3n con el objetivo modifica la orden, no la identidad de la variable medida.", "loop"),
    q2("equipos", "Familias de equipos", "11\u201315", "Un transmisor acondiciona una medida y entrega una se\xF1al. Un indicador presenta un valor; un controlador decide y una v\xE1lvula modifica el proceso.", "Un equipo que muestra una temperatura y tambi\xE9n la transmite puede ser\u2026", ["Solo indicador", "Indicador y transmisor a la vez", "Solo actuador"], 1, "La funcionalidad admite categor\xEDas m\xFAltiples; clasificar por una funci\xF3n no excluye las dem\xE1s."),
    q2("funciones", "Clasificar por funcionalidad", "16\u201325", "Un interruptor cambia entre estados ante una condici\xF3n. Un transductor convierte una magnitud; un transmisor comunica una medida acondicionada. No son nombres intercambiables en todo contexto.", "\xBFQu\xE9 distingue una indicaci\xF3n continua de un interruptor de nivel?", ["La continua entrega un valor; el interruptor indica una condici\xF3n", "El interruptor siempre mide m\xE1s exactamente", "PNP significa normalmente abierto"], 0, "Valor continuo y condici\xF3n discreta responden a preguntas diferentes."),
    q2("variables", "Elegir la variable", "26\u201337", "Caudal es cantidad por tiempo; nivel es posici\xF3n o altura; presi\xF3n relaciona fuerza y superficie; temperatura describe el estado t\xE9rmico. Selecciona la variable seg\xFAn la necesidad.", "Para conocer cu\xE1ntos litros pasan cada minuto, \xBFqu\xE9 necesitas?", ["Presi\xF3n", "Caudal volum\xE9trico", "Nivel"], 1, "El caudal volum\xE9trico tiene unidades de volumen por tiempo."),
    q2("tarea", "Tarea 1 \xB7 Instrumentos de tu entorno", "Tarea 1", "Busca instrumentos y clasif\xEDcalos por variable y funcionalidad. Conserva su fuente y permite m\xE1s de una categor\xEDa cuando corresponda.", "\xBFCu\xE1l es la evidencia m\xE1s \xFAtil para clasificar?", ["Solo el color de la carcasa", "La funci\xF3n descrita y una fuente identificable", "El precio"], 1, "La clasificaci\xF3n se justifica con la funci\xF3n del equipo y su documentaci\xF3n.", void 0, "Anota ejemplos: nombre/modelo, variable, funciones, fuente y raz\xF3n de tu clasificaci\xF3n. La revisi\xF3n de estos ejemplos sigue siendo docente.")
  ] },
  { id: "ii-metrologia", sourceId: "I03", title: "Conferencia 2 \xB7 Caracter\xEDsticas y metrolog\xEDa", courseId: "s2-3", unitId: "ii-u1", scope: "Cadena de medida, rango, errores y los dos ejercicios de diez lecturas.", limitations: "Se usa desviaci\xF3n est\xE1ndar muestral (n\u22121). La media no sustituye al patr\xF3n externo. No se declara aptitud sin tolerancia.", steps: [
    q2("cadena", "Cadena de medici\xF3n", "2\u201310", "Sensor, acondicionamiento, transmisi\xF3n e indicaci\xF3n pueden aportar errores. Rango son los extremos; span es su diferencia.", "En un rango de \u221220 a 80 \xB0C, \xBFcu\xE1l es el span?", ["60 \xB0C", "100 \xB0C", "80 \xB0C"], 1, "Span = l\xEDmite superior \u2212 l\xEDmite inferior = 100 \xB0C."),
    q2("precision", "Exactitud, precisi\xF3n y repetibilidad", "11\u201317", "Lecturas muy agrupadas pueden estar lejos de la referencia. La repetibilidad describe precisi\xF3n bajo las mismas condiciones, sin garantizar ausencia de sesgo.", "Un conjunto muy agrupado en 98,82 \xB0C con referencia 100 \xB0C\u2026", ["Prueba exactitud perfecta", "Puede ser repetible y tener sesgo", "Permite reemplazar el patr\xF3n por su media"], 1, "Dispersi\xF3n y error respecto al patr\xF3n son propiedades diferentes.", "metrology"),
    n("temp-media", "Temperatura \xB7 promedio", "18\u201325", "Las diez lecturas de la fuente est\xE1n en la tabla. Calcula su media antes de consultar los resultados.", "Media de las diez temperaturas", 98.82, 5e-3, "\xB0C", "Suma 988,2 \xB0C / 10 = 98,82 \xB0C.", "metrology"),
    n("temp-error", "Temperatura \xB7 error respecto al patr\xF3n", "18\u201325", "La referencia es 100 \xB0C. El error firmado de la media es media menos referencia.", "Error de la media", -1.18, 5e-3, "\xB0C", "98,82 \u2212 100 = \u22121,18 \xB0C. Un signo negativo indica lectura inferior a la referencia.", "metrology"),
    n("temp-dispersion", "Temperatura \xB7 dispersi\xF3n", "22\u201325", "La desviaci\xF3n muestral usa la ra\xEDz de \u03A3(x\u2212media)\xB2/(n\u22121). Su unidad es la de la medida.", "Desviaci\xF3n est\xE1ndar muestral", 0.10327956, 6e-4, "\xB0C", "El resultado es aproximadamente 0,10328 \xB0C; no es el error respecto a 100 \xB0C.", "metrology"),
    n("nivel-media", "Nivel \xB7 promedio", "26\u201329", "La segunda tabla tiene referencia 1,5 m. Usa todos los datos, sin redondear cada lectura.", "Media de los diez niveles", 1.497, 5e-4, "m", "La media es 1,497 m y su error firmado es \u22120,003 m.", "metrology"),
    n("nivel-dispersion", "Nivel \xB7 dispersi\xF3n", "26\u201329", "Calcula la desviaci\xF3n muestral de la segunda tabla. No combines temperaturas y niveles.", "Desviaci\xF3n est\xE1ndar muestral de nivel", 0.01636392, 6e-5, "m", "El resultado es aproximadamente 0,016364 m.", "metrology"),
    q2("conclusion", "\xBFSirve este instrumento?", "25 y 29", "La decisi\xF3n exige conocer la tolerancia y las condiciones de uso. No basta con una dispersi\xF3n peque\xF1a ni una lectura estable.", "\xBFQu\xE9 falta para decidir aptitud en una aplicaci\xF3n cr\xEDtica?", ["La marca del cuaderno", "La tolerancia y las condiciones exigidas", "Nada, basta la media"], 1, "Compara sesgo, dispersi\xF3n e incertidumbre con requisitos expl\xEDcitos.", void 0, "Redacta tu conclusi\xF3n para cada tabla, indicando referencia, sesgo, dispersi\xF3n y qu\xE9 informaci\xF3n falta.")
  ] },
  { id: "ii-caudal", sourceId: "I04", title: "Conferencia 3 \xB7 Medidas de caudal", courseId: "s2-3", unitId: "ii-u1", scope: "Principios de medida, comparaci\xF3n de tecnolog\xEDas y c\xE1lculo ideal de apoyo.", steps: [
    n("volumen", "Volumen por unidad de tiempo", "2\u20138", "El caudal volum\xE9trico Q = volumen / tiempo. El m\xE1sico usa masa / tiempo; para relacionarlos hace falta la densidad.", "Si pasan 12 L en 3 min, \xBFcu\xE1l es Q?", 4, 1e-3, "L/min", "12 / 3 = 4 L/min.", "flow"),
    q2("dp", "Presi\xF3n diferencial", "9\u201315", "En un elemento primario ideal y con densidad constante, Q es proporcional a \u221A\u0394p. Los tramos rectos ayudan al perfil; no hacen que todo flujo sea laminar.", "Si \u0394p se multiplica por 4, Q en este modelo\u2026", ["Se duplica", "Se cuadruplica", "No cambia"], 0, "\u221A4 = 2. Es una relaci\xF3n de apoyo, no dimensionamiento de una instalaci\xF3n.", "flow"),
    q2("tecnologia", "Elegir tecnolog\xEDa", "16\u201328", "Rot\xE1metro, desplazamiento positivo y Coriolis no son equivalentes. La selecci\xF3n depende del fluido, rango y montaje; hay medidores Coriolis adecuados para gases.", "\xBFQu\xE9 necesitas para convertir caudal volum\xE9trico en m\xE1sico?", ["Color del tubo", "Densidad en las condiciones de operaci\xF3n", "Solo la presi\xF3n atmosf\xE9rica"], 1, "\u1E41 = \u03C1 Q, con unidades coherentes.", void 0, "Compara dos tecnolog\xEDas: principio, fluido, rango y limitaci\xF3n; usa las p\xE1ginas originales como fuente.")
  ] },
  { id: "ii-presion", sourceId: "I05", title: "Conferencia 4 \xB7 Medidas de presi\xF3n", courseId: "s2-3", unitId: "ii-u1", scope: "Referencias, unidades, presi\xF3n hidrost\xE1tica y transmisi\xF3n ideal.", steps: [
    q2("referencia", "Absoluta, manom\xE9trica y diferencial", "3\u20138", "La presi\xF3n manom\xE9trica toma la atm\xF3sfera local como referencia; la absoluta toma el vac\xEDo ideal. Una diferencia de presi\xF3n compara dos puntos.", "Si la manom\xE9trica vale cero, la absoluta\u2026", ["Siempre vale cero", "Es igual a la presi\xF3n atmosf\xE9rica local", "Es negativa"], 1, "p absoluta = p manom\xE9trica + p atmosf\xE9rica.", "pressure"),
    n("hidrostatica", "Columna de agua", "9\u201316", "Modelo a\xF1adido: l\xEDquido inm\xF3vil, densidad 1000 kg/m\xB3 y g = 9,81 m/s\xB2. La diferencia de presi\xF3n es \u03C1gh.", "\u0394p de una columna de 2 m", 19.62, 0.01, "kPa", "1000 \xD7 9,81 \xD7 2 = 19620 Pa = 19,62 kPa.", "pressure"),
    n("transmisor", "Escalar una se\xF1al", "17\u201322", "Ejemplo a\xF1adido: transmisor lineal ideal de 0\u2013100 kPa a 4\u201320 mA. El cero del rango corresponde a 4 mA.", "Salida para 50 kPa", 12, 0.01, "mA", "4 + (50/100) \xD7 16 = 12 mA.", void 0, "Elige un instrumento de la conferencia y describe su referencia, rango y condiciones de uso.")
  ] },
  { id: "ii-nivel", sourceId: "I06", title: "Conferencia 5 \xB7 Medidas de nivel", courseId: "s2-3", unitId: "ii-u1", scope: "Medici\xF3n directa/indirecta, nivel discreto/continuo y modelo geom\xE9trico.", steps: [
    q2("discreto", "Nivel y condici\xF3n de nivel", "2\u201310", "Un interruptor informa si se alcanz\xF3 una condici\xF3n; un transmisor entrega un valor del rango. LT transmite y LI indica; un dispositivo puede integrar funciones.", "\xBFCu\xE1l permite seguir el llenado continuo?", ["Un \xFAnico interruptor de alto nivel", "Un transmisor de nivel", "Un pulsador de marcha"], 1, "El transmisor proporciona informaci\xF3n continua.", "level"),
    n("eco", "Distancia y tiempo de vuelo", "17\u201319", "Modelo a\xF1adido: sensor superior a 3 m del fondo; superficie a 2 m. La distancia al l\xEDquido es 3\u22122. Para ultrasonido se usa ida y vuelta t = 2d/c.", "Distancia del sensor a la superficie", 1, 1e-3, "m", "Al subir el nivel disminuyen la distancia al sensor superior y el tiempo de vuelo.", "level"),
    q2("seleccion", "Medio y montaje", "11\u201324", "Densidad afecta la inferencia hidrost\xE1tica. Espuma, vapor, geometr\xEDa y propiedades el\xE9ctricas afectan tecnolog\xEDas espec\xEDficas.", "\xBFPuede elegirse ultrasonido o radar sin revisar el proceso?", ["S\xED, funcionan para cualquier l\xEDquido", "No, hay que revisar medio y montaje", "S\xED, solo importa la altura"], 1, "Las limitaciones dependen del principio y del equipo.", void 0, "Justifica dos alternativas de medida para un tanque; indica qu\xE9 datos del proceso necesitas.")
  ] },
  { id: "ii-temperatura-teoria", sourceId: "I07", title: "Conferencia 6 \xB7 Medidas de temperatura", courseId: "s2-3", unitId: "ii-u1", scope: "Escalas, familias de sensores y relaci\xF3n con G03.", steps: [
    n("kelvin", "Escalas de temperatura", "2\u20135", "La conversi\xF3n correcta es T(K) = t(\xB0C) + 273,15. La precisi\xF3n corrige el 273,16 de la l\xE1mina.", "25 \xB0C en kelvin", 298.15, 5e-3, "K", "25 + 273,15 = 298,15 K."),
    q2("sensor", "RTD, termistor y termocupla", "6\u201325", "RTD y termistores cambian resistencia; una termocupla produce una se\xF1al termoel\xE9ctrica dependiente de la diferencia de temperatura y de su referencia.", "\xBFQu\xE9 magnitud medir\xEDas directamente en un Pt100 pasivo?", ["Resistencia", "Tensi\xF3n de 0\u201310 V sin transmisor", "Caudal"], 0, "Pt100 se caracteriza por resistencia. La salida del transmisor es otra magnitud."),
    q2("montaje", "Del sensor al proceso", "26\u201335", "Un termopozo protege y permite montaje, pero modifica la respuesta din\xE1mica. Un pir\xF3metro necesita considerar emisividad y campo de visi\xF3n.", "\xBFQu\xE9 debe acompa\xF1ar una lectura infrarroja?", ["Solo el color del cable", "Condiciones de emisividad y superficie observada", "Un contacto el\xE9ctrico con el l\xEDquido"], 1, "La tecnolog\xEDa de medida tiene condiciones de uso.", void 0, "Relaciona estas familias con las tres experiencias G03. Mant\xE9n separadas la lectura de sonda y la salida del transmisor.")
  ] },
  { id: "ii-proximidad-teoria", sourceId: "I08", title: "Conferencia 2 U2 \xB7 Sensores de proximidad", courseId: "s2-3", unitId: "ii-u2", scope: "Principios y salida el\xE9ctrica; complementa G01 y G02.", steps: [
    q2("principios", "Qu\xE9 objeto se detecta", "3\u20136", "El principio inductivo detecta metal; el capacitivo puede detectar otros materiales en condiciones adecuadas. El fotoel\xE9ctrico depende del recorrido y la interacci\xF3n de la luz.", "\xBFQu\xE9 dato permite escoger un principio?", ["Material y condiciones del objeto", "Solo el color de los bornes", "El nombre del curso"], 0, "Material, distancia, entorno y montaje condicionan la elecci\xF3n."),
    q2("salida", "PNP/NPN y NA/NC son ejes distintos", "7\u20139", "PNP y NPN describen la topolog\xEDa de salida. NA/NC describe la funci\xF3n de conmutaci\xF3n. La l\xE1mina los asocia de forma incorrecta; existen combinaciones de ambos ejes.", "Un detector PNP\u2026", ["Es siempre NA", "Puede tener funci\xF3n NA o NC seg\xFAn modelo", "Es siempre NC"], 1, "Consulta ambas especificaciones en la ficha, por separado.", void 0, "Abre las gu\xEDas G01/G02 del ramo para probar alimentaci\xF3n, objeto y salida en el banco de detectores.")
  ] },
  { id: "ea-clase-1", sourceId: "F02", title: "Clase 1 \xB7 Se\xF1ales y componentes", courseId: "s2-1", unitId: "area02-u1", scope: "Se\xF1ales, par\xE1metros y cuaderno de las dos tareas de clasificaci\xF3n y fichas.", steps: [
    q2("electronica", "Qu\xE9 hace la electr\xF3nica", "3\u20138", "Los dispositivos permiten controlar, procesar informaci\xF3n y convertir energ\xEDa. Anal\xF3gico y digital describen c\xF3mo se representa la informaci\xF3n, no si el equipo es moderno.", "Una se\xF1al de temperatura que var\xEDa continuamente es\u2026", ["Anal\xF3gica", "Siempre binaria", "Una alimentaci\xF3n de potencia"], 0, "La representaci\xF3n continua corresponde a una se\xF1al anal\xF3gica.", "signal"),
    n("rms", "Pico, media y valor eficaz", "9\u201311", "Para una senoide pura centrada en cero: RMS = pico/\u221A2. La media sobre un per\xEDodo completo es cero. Estas reglas no valen para cualquier forma de onda.", "RMS de una senoide con pico 10 V", 7.071, 5e-3, "V", "10 / \u221A2 \u2248 7,071 V.", "signal"),
    q2("ficha", "Componentes y hoja de datos", "12\u201316", "La ficha especifica variante, encapsulado, terminales y condiciones. Un valor t\xEDpico no es un l\xEDmite garantizado para toda la familia.", "Para identificar las patillas de un transistor conviene\u2026", ["Suponer que todos usan el mismo orden", "Revisar fabricante, variante y encapsulado", "Mirar solo el color"], 1, "La identificaci\xF3n necesita una ficha aplicable al componente concreto.", void 0, "Tarea 1: clasifica los componentes solicitados. Tarea 2: registra fichas de Zener 1N4733/1N4742 y BJT PN2222A/2N3906 con fabricante, encapsulado, terminales, l\xEDmites y enlace.")
  ] },
  { id: "ea-clase-2", sourceId: "F03", title: "Clase 2 \xB7 Diodos y medici\xF3n", courseId: "s2-1", unitId: "area02-u1", scope: "Polarizaci\xF3n, modelo por tramos y cuadernos distintos para Tarea 3 y laboratorio.", limitations: "La ca\xEDda fija de 0,7 V es un modelo did\xE1ctico; no reproduce una curva de fabricante ni tensi\xF3n de ruptura.", steps: [
    q2("polaridad", "Polarizaci\xF3n del diodo", "3\u20137", "El modelo conduce en directa al superar una ca\xEDda fija y bloquea en inversa dentro de este ejemplo. No se modela ruptura.", "Al invertir el diodo de este modelo DC, la corriente\u2026", ["Se mantiene igual", "Se anula", "Crece sin l\xEDmite"], 1, "La orientaci\xF3n modifica la conducci\xF3n.", "diode"),
    n("corriente", "Resistencia y corriente", "8\u201311", "Ejemplo a\xF1adido: fuente 5 V, diodo en directa con ca\xEDda 0,7 V y resistencia serie de 1000 \u03A9.", "Corriente del circuito", 4.3, 0.01, "mA", "(5 \u2212 0,7) / 1000 = 0,0043 A = 4,3 mA.", "diode"),
    q2("tarea-3", "Tarea 3 \xB7 1N4007", "12\u201313", "Consulta el circuito y la lista de la fuente. Mide tensi\xF3n del diodo y resistencia y relaciona corriente con ca\xEDda resistiva. Usa la protoboard libre solo si quieres construir una adaptaci\xF3n identificada.", "La corriente se obtiene de la tensi\xF3n en la resistencia mediante\u2026", ["I = VR/R", "I = VR \xD7 R", "I = R/VR"], 0, "Aplica Ohm sobre la resistencia, no usando toda la fuente como su ca\xEDda.", void 0, "Registra montaje 1N4007, valores, VD, VR, I, instrumento y conclusi\xF3n. La ficha y el circuito f\xEDsico requieren revisi\xF3n propia."),
    q2("laboratorio", "Laboratorio \xB7 1N4001 y LED", "14\u201316", "Esta pr\xE1ctica es distinta de Tarea 3. Completa sus tablas y construye I frente a VD, conservando componente y condiciones de cada serie.", "Para comparar ambas curvas debes registrar\u2026", ["Solo el color del LED", "Tensi\xF3n y corriente por componente y condici\xF3n", "Solo la fuente nominal"], 1, "Cada punto de la curva es una pareja (VD, I) con sus condiciones.", void 0, "Tabla 1N4001 y tabla LED: fuente, resistencia, VD, VR, I y procedencia real/simulada. A\xF1ade gr\xE1fica y comparaci\xF3n; no llames curva medida al modelo de ca\xEDda fija.")
  ] },
  { id: "ea-clase-3", sourceId: "F04", title: "Clase 3 \xB7 Transistores", courseId: "s2-1", unitId: "area02-u1", scope: "BJT y regiones, configuraciones, familias FET y preparaci\xF3n de pr\xE1ctica BC337.", limitations: "Ejemplo NPN gen\xE9rico: \u03B2=100, VBE=0,7 V y VCEsat=0,2 V. No es un modelo de fabricante BC337.", steps: [
    q2("regiones", "Corte, activa y saturaci\xF3n", "3\u201310", "En activa se aproxima IC = \u03B2 IB. El circuito de colector limita la corriente y lleva a saturaci\xF3n; no puede crecer sin l\xEDmite.", "\xBFQu\xE9 limita IC cuando el transistor satura?", ["Solo \u03B2", "La fuente y la carga del colector", "El nombre NPN"], 1, "El circuito exterior impone un m\xE1ximo.", "bjt"),
    q2("configuracion", "Configuraciones y FET", "11\u201318", "Emisor, base y colector com\xFAn se distinguen por el terminal compartido entre entrada y salida. Los FET controlan un canal mediante tensi\xF3n de puerta y no equivalen a un BJT.", "\xBFQu\xE9 puede afirmarse de un MOSFET?", ["Su puerta es la base de un BJT", "Necesita una ficha y un modelo de puerta propios", "Siempre usa \u03B2=100"], 1, "Familias distintas requieren modelos y par\xE1metros distintos."),
    q2("bc337", "Pr\xE1ctica BC337 a 10 V", "19\u201323", "La gu\xEDa pide identificar terminales, medir tensiones y calcular corrientes con resistencias de 270 \u03A9 y 100 k\u03A9. El modelo de apoyo usa esas resistencias con par\xE1metros declarados.", "Antes de cablear el BC337 debes\u2026", ["Confirmar encapsulado y pinout aplicable", "Copiar el orden de cualquier transistor", "Omitir la resistencia de base"], 0, "Identificaci\xF3n y condiciones del componente son parte del montaje.", "bjt", "Registra VBE, VCE, ca\xEDdas resistivas, IB e IC, regi\xF3n inferida y conclusi\xF3n; separa valores reales y los del modelo gen\xE9rico.")
  ] },
  { id: "ea-clase-4", sourceId: "F05", title: "Clase 4 \xB7 Puente H y L293D", courseId: "s2-1", unitId: "area02-u1", scope: "Dos puentes como actividades distintas, estados y cuaderno de medidas.", limitations: "La escena representa estados ideales del puente. No calcula temperatura, corriente de motor ni conmutaci\xF3n real.", steps: [
    q2("diagonales", "Puente de cuatro transistores", "3\u20136", "Dos diagonales aplican polaridades opuestas. Encender los dos interruptores de una misma rama une los rieles y no es un estado de giro.", "\xBFQu\xE9 permite invertir la polaridad sobre el motor?", ["Activar la diagonal opuesta", "Cerrar toda una rama vertical", "Cambiar el nombre del motor"], 0, "La diagonal determina qu\xE9 terminal queda a cada riel.", "bridge", "Pr\xE1ctica discreta: conserva el esquema, registra estados, medidas y conclusi\xF3n. Confirma los valores contradictorios de resistencias de la fuente."),
    q2("integrado", "Alimentaciones y habilitaci\xF3n L293D", "7\u201312", "El integrado distingue l\xF3gica VCC1 y potencia VCC2. La ficha TI fija 600 mA continuos por canal bajo sus condiciones; los 800 mA de la l\xE1mina no se trasladan como l\xEDmite v\xE1lido.", "\xBFLa alimentaci\xF3n l\xF3gica y la del motor son el mismo concepto?", ["S\xED, siempre son intercambiables", "No, hay rieles y l\xEDmites diferentes", "La l\xF3gica se alimenta con cualquier resistencia"], 1, "Las condiciones de alimentaci\xF3n se revisan por pin y por funci\xF3n.", "bridge"),
    q2("practica", "Pr\xE1ctica del integrado", "13\u201315", "Con EN habilitado, entradas opuestas invierten la salida. Con EN deshabilitado, las salidas quedan en alta impedancia; no equivale a frenar activamente.", "Con EN=0, \xBFqu\xE9 representa el modelo de salidas?", ["Alta impedancia", "Giro m\xE1ximo", "Cortocircuito obligado"], 0, "Deshabilitar desconecta el mando de salida; el movimiento real depende de la carga.", void 0, "Mant\xE9n esta pr\xE1ctica separada de la discreta. Registra EN, entradas, salidas, alimentaci\xF3n y observaci\xF3n; usa la ficha TI para revisar l\xEDmites.")
  ] },
  { id: "ea-clase-5", sourceId: "F06", title: "Clase 5 \xB7 Amplificadores operacionales", courseId: "s2-1", unitId: "area02-u1", scope: "Diferencial, comparador, realimentaci\xF3n y saturaci\xF3n con l\xEDmites declarados.", limitations: "Modelo est\xE1tico ideal limitado por rieles; no representa LM741, ancho de banda, slew rate ni excursi\xF3n real de salida.", steps: [
    q2("abierto", "Diferencia de entrada y saturaci\xF3n", "3\u20137", "En lazo abierto Vout ideal = A(V+ \u2212 V\u2212). La alimentaci\xF3n limita la salida incluso si la multiplicaci\xF3n arroja miles de voltios.", "Una predicci\xF3n fuera de los rieles implica\u2026", ["Saturaci\xF3n del modelo", "Salida real infinita", "Que desaparece la alimentaci\xF3n"], 0, "Primero calcula y luego contrasta con los l\xEDmites.", "opamp"),
    n("ganancia", "Realimentaci\xF3n negativa", "8\u201311", "No inversor ideal: G = 1 + Rf/Rg. Si Rf=20 k\u03A9 y Rg=10 k\u03A9, la ganancia es 3.", "Salida ideal con entrada 2 V", 6, 0.01, "V", "G=3; Vout=3\xD72=6 V, dentro de los rieles \xB112 V del ejemplo.", "opamp"),
    q2("acondicionar", "Acondicionamiento", "12\u201313", "Ganancia y desplazamiento son operaciones diferentes. Ajustar cero requiere una referencia, adem\xE1s del factor de escala.", "Para mapear una entrada cuyo m\xEDnimo no es cero a salida 0 V necesitas\u2026", ["Solo multiplicar siempre", "Ganancia y desplazamiento adecuados", "Eliminar el sensor"], 1, "El modelo af\xEDn y=mx+b ajusta ambos extremos.", "calibration")
  ] },
  { id: "ea-ajuste-cero", sourceId: "F01", title: "Ajuste cero \xB7 Canal de termopar T", courseId: "s2-1", unitId: "area02-u1", scope: "Dos rangos originales de acondicionamiento, c\xE1lculo af\xEDn y cuaderno para Proteus.", limitations: "Se usan los pares de tensi\xF3n de la gu\xEDa, sin extenderlos como curva universal del termopar. El circuito completo de AO debe comprobarse en la herramienta pedida.", steps: [
    n("rango-1", "Canal 0\u2013100 \xB0C", "3\u20134", "La gu\xEDa da 0 mV a 0 \xB0C y 4,28 mV a 100 \xB0C. Para una salida 0\u20135 V, calcula G=5/0,00428.", "Ganancia del primer rango", 1168.2243, 0.01, "V/V", "G \u2248 1168,2243; offset de salida cero.", "calibration"),
    n("rango-2", "Canal 50\u2013200 \xB0C", "5", "La gu\xEDa da 2,04 mV a 50 \xB0C y 9,29 mV a 200 \xB0C. El span es 7,25 mV.", "Ganancia para salida 0\u20135 V", 689.65517, 0.01, "V/V", "G=5/(0,00929\u22120,00204) \u2248 689,65517.", "calibration"),
    n("offset", "Ajustar el cero del segundo rango", "5", "En y=Gx+b imp\xF3n y=0 cuando x=0,00204 V; por tanto b=\u2212G\xD70,00204.", "Desplazamiento de salida", -1.4068966, 1e-3, "V", "b\u2248\u22121,406897 V. Este offset de salida no es autom\xE1ticamente la tensi\xF3n de un pin del circuito.", void 0, "Completa las tablas y monta en Proteus seg\xFAn la gu\xEDa. Calcula RG usando la ecuaci\xF3n del circuito concreto, no una ganancia de topolog\xEDa supuesta.")
  ] },
  { id: "ea-guia-ao", sourceId: "F07", title: "Gu\xEDa 1 \xB7 Actividad pr\xE1ctica 2 \xB7 AO", courseId: "s2-1", unitId: "area02-u1", scope: "Cuatro ejercicios originales con verificaci\xF3n de rieles y aclaraci\xF3n del rango contradictorio.", steps: [
    q2("ej1", "Ejercicio 1 \xB7 Lazo abierto", "2\u20133", "Una ganancia abierta de 10\u2076 obliga a contrastar el resultado ideal con los rieles del esquema. Lee las entradas y alimentaci\xF3n del original antes de concluir.", "Si el c\xE1lculo supera el riel positivo\u2026", ["La salida ideal ilimitada es f\xEDsicamente v\xE1lida", "El modelo est\xE1 saturado en positivo", "El AO invierte su alimentaci\xF3n"], 1, "La salida no puede alcanzar arbitrariamente el valor de la multiplicaci\xF3n.", "opamp"),
    n("ej2", "Ejercicio 2 \xB7 No inversor", "4\u20135", "El ejercicio usa ganancia 3. Como comprobaci\xF3n a\xF1adida, aplica 1 V y verifica que el c\xE1lculo queda dentro de rieles \xB112 V.", "Salida ideal de esta comprobaci\xF3n", 3, 1e-3, "V", "Vout=G\xD7Vin=3 V. Contrasta los valores espec\xEDficos del original.", "opamp"),
    n("ej3", "Ejercicio 3 \xB7 Primer canal", "6", "Para el canal 0\u2013100 \xB0C se toman 0\u20134,28 mV y se pide salida 0\u20135 V.", "Ganancia requerida", 1168.2243, 0.01, "V/V", "El span de entrada debe convertirse de mV a V.", "calibration"),
    q2("ej4", "Ejercicio 4 \xB7 Rango por confirmar", "7\u20139", "El texto menciona 50\u2013150 \xB0C, pero la tabla y los c\xE1lculos usan 200 \xB0C / 9,29 mV. Se conserva el original y no se aprueba una pauta ambigua.", "\xBFQu\xE9 hacer antes de fijar ganancia y offset?", ["Mezclar 150 \xB0C y 9,29 mV sin explicar", "Confirmar un \xFAnico juego coherente de extremos", "Omitir las unidades"], 1, "La correcci\xF3n depende de extremos consistentes; confirma el rango con el docente.", void 0, "Resuelve los cuatro ejercicios, registra c\xE1lculo ideal, alimentaci\xF3n, salida limitada y observaciones. Para el cuarto, deja expl\xEDcito el rango elegido y su confirmaci\xF3n.")
  ] },
  { id: "cm-cc", sourceId: "F11", title: "Gu\xEDa de Actividad 1 \xB7 Motores CC", courseId: "s2-2", unitId: "cm-u1", scope: "Preparaci\xF3n conceptual y cuaderno para el banco EMS Lab-Volt.", limitations: "No se simulan curvas de serie/shunt/compound ni mediciones del dinam\xF3metro sin par\xE1metros del banco. La consigna de vac\xEDo del motor serie requiere aclaraci\xF3n docente.", steps: [
    q2("excitacion", "Serie, shunt y compound", "2\u20135", "En shunt el campo est\xE1 en paralelo con la armadura; en serie comparten corriente; compound combina campos. Estas conexiones modifican las curvas de funcionamiento.", "\xBFC\xF3mo se conecta el campo shunt?", ["En paralelo con la armadura", "Solo a tierra", "En serie siempre"], 0, "La excitaci\xF3n permite distinguir las familias."),
    q2("carga", "Carga y velocidad", "6\u201310", "La gu\xEDa advierte sobre el motor serie en vac\xEDo y tambi\xE9n incluye un punto sin carga. Ese procedimiento debe aclararse con el docente del banco concreto.", "\xBFSe debe convertir el punto 0 Nm en una instrucci\xF3n f\xEDsica universal?", ["S\xED", "No; requiere aclaraci\xF3n del banco y supervisi\xF3n", "Solo cambiando el color del cable"], 1, "La contradicci\xF3n se conserva visible y no se transforma en una pauta autom\xE1tica."),
    q2("evidencia", "Medir y graficar", "11\u201315", "La curva debe asociar velocidad, par y corriente a una configuraci\xF3n y unas condiciones. La animaci\xF3n del motor del panel no mide esas magnitudes.", "Una tabla \xFAtil conserva\u2026", ["Solo si el rotor se ve girar", "Unidades, carga, conexi\xF3n, valores e instrumento", "Una captura sin condiciones"], 1, "La evidencia experimental permite comparar curvas.", void 0, "Registra por tipo de motor: excitaci\xF3n, alimentaci\xF3n, par (Nm), velocidad (rpm), corrientes, procedencia y conclusi\xF3n. La pr\xE1ctica f\xEDsica y sus curvas siguen requiriendo el banco identificado.")
  ] },
  { id: "cm-ca", sourceId: "F12", title: "Gu\xEDa de Actividad 2 \xB7 Motores de inducci\xF3n", courseId: "s2-2", unitId: "cm-u1", scope: "L\xEDnea/fase, sincronismo, inversi\xF3n y preparaci\xF3n de tablas trif\xE1sicas/monof\xE1sicas.", limitations: "Se calculan relaciones ideales de un sistema equilibrado; no par/corriente ni curvas de un equipo Lab-Volt.", steps: [
    n("sincronismo", "Frecuencia, polos y deslizamiento", "2\u20135", "Velocidad s\xEDncrona ns=120f/p. El rotor as\xEDncrono gira con deslizamiento s=(ns\u2212n)/ns.", "ns para 50 Hz y 4 polos", 1500, 0.01, "rpm", "120\xD750/4=1500 rpm. No es autom\xE1ticamente la velocidad del rotor.", "motor"),
    n("estrella", "L\xEDnea y fase", "6\u20138", "En estrella equilibrada, Vfase=Vl\xEDnea/\u221A3. En tri\xE1ngulo Vfase=Vl\xEDnea. La selecci\xF3n del montaje depende de la placa confirmada.", "Vfase con 400 V de l\xEDnea en estrella", 230.9401, 0.01, "V", "400/\u221A3\u2248230,94 V.", "motor"),
    q2("inversion", "Inversi\xF3n y placa", "8\u201310", "Intercambiar dos fases cambia la secuencia del campo. No basta mirar las dos tensiones de placa sin identificar a qu\xE9 conexi\xF3n corresponde cada una.", "Antes de pasar a 380 V en la gu\xEDa necesitas\u2026", ["Confirmar placa y conexi\xF3n del banco", "Suponer que toda placa es id\xE9ntica", "Usar la escala gr\xE1fica del giro"], 0, "La gu\xEDa deja condiciones que requieren verificaci\xF3n del equipo."),
    q2("monofasico", "Motor monof\xE1sico", "11\u201314", "El devanado auxiliar, el condensador y el interruptor de arranque dependen del dise\xF1o. No se fija un porcentaje universal de desconexi\xF3n sin ficha.", "\xBFQu\xE9 dato permite comprobar la desconexi\xF3n de arranque?", ["La ficha del dise\xF1o y sus condiciones", "Un valor \xFAnico para todo motor", "La animaci\xF3n de estrella"], 0, "El motor monof\xE1sico necesita su propio modelo y documentaci\xF3n.", void 0, "Completa las tablas del original con conexi\xF3n, l\xEDnea/fase, carga, velocidad y corriente; mant\xE9n separada la experiencia monof\xE1sica.")
  ] },
  { id: "cm-arranque-manual", sourceId: "F10", title: "Actividad 1 U2 \xB7 Arranque manual estrella\u2013tri\xE1ngulo", courseId: "s2-2", unitId: "cm-u2", scope: "Preparaci\xF3n y secuencia conceptual vinculadas al panel existente; evidencias del esquema original.", steps: [
    q2("mando", "Mando y fuerza", "2\u20136", "El circuito de mando entrega \xF3rdenes; el de fuerza alimenta la carga. Localiza ambos en la gu\xEDa antes de seguir la secuencia manual.", "\xBFD\xF3nde se procesa la orden de los pulsadores?", ["En mando", "En el eje mec\xE1nico", "Solo en la placa"], 0, "Distinguir circuitos evita confundir \xF3rdenes con trayectos de potencia."),
    q2("secuencia", "Estrella y transici\xF3n manual", "7\u201312", "La transici\xF3n requiere abrir la conexi\xF3n anterior antes de cerrar la siguiente. El enclavamiento impide estrella y tri\xE1ngulo simult\xE1neos.", "\xBFQu\xE9 estado debe impedir el enclavamiento?", ["Reposo", "Estrella y tri\xE1ngulo al mismo tiempo", "Paro por sobrecarga"], 1, "Las conexiones no pueden cerrarse simult\xE1neamente.", "motor"),
    q2("falla", "Sobrecarga y recuperaci\xF3n", "13\u201317", "Conserva los estados pedidos: reposo, marcha estrella, transici\xF3n, marcha tri\xE1ngulo, falla y recuperaci\xF3n. El cambio es manual; una temporizaci\xF3n ser\xEDa otra adaptaci\xF3n.", "\xBFLa animaci\xF3n de giro permite llenar una tabla real de rpm?", ["S\xED, usando su porcentaje visual", "No, hace falta medir o un modelo calibrado", "S\xED, siempre es 1500 rpm"], 1, "Un movimiento de representaci\xF3n no acredita velocidad f\xEDsica.", void 0, "Abre el Panel de control en otra pesta\xF1a, reproduce el esquema de referencia y guarda evidencias de los estados. Las correspondencias f\xEDsicas no confirmadas conservan su aviso.")
  ] },
  { id: "ri-teoria", sourceId: "F33", title: "Clase te\xF3rica \xB7 Redes industriales", courseId: "s2-4", unitId: "ri-u1", scope: "Medios, codificaci\xF3n, detecci\xF3n/correcci\xF3n de errores y OSI; resumen original accesible aparte.", limitations: "Las ondas explicitan su convenci\xF3n. CRC es una demostraci\xF3n x\xB3+x+1; la escena de bits conserva ese ejemplo; el taller de cable a\xF1ade un subconjunto Modbus RTU con CRC16.", steps: [
    q2("red", "Medio, protocolo y aplicaci\xF3n", "2\u201310", "El medio transporta se\xF1ales; un protocolo define reglas y una aplicaci\xF3n usa el intercambio. RS485 describe una capa f\xEDsica y no define por s\xED sola comandos de marcha/paro.", "\xBFUn cable con continuidad demuestra que la aplicaci\xF3n comunica?", ["S\xED", "No; faltan configuraci\xF3n y reglas compatibles", "Solo si tiene DB9"], 1, "Continuidad, enlace y aplicaci\xF3n deben comprobarse por separado."),
    q2("codigos", "Codificaci\xF3n de bits", "11\u201321", "En esta escena NRZ-L usa 1 alto; NRZ-I invierte con 1; Manchester usa 1 bajo\u2192alto; diferencial tiene transici\xF3n central y 0 invierte al inicio. Estado inicial bajo.", "Para interpretar un c\xF3digo diferencial necesitas\u2026", ["Solo contar picos", "Convenci\xF3n y estado inicial", "El color del cable"], 1, "Sin esas condiciones no se determina una \xFAnica secuencia.", "bits"),
    q2("errores", "Detecci\xF3n y correcci\xF3n", "22\u201334", "Paridad, LRC, checksum y CRC detectan ciertos errores; Hamming puede corregir dentro de su capacidad. Un control coincidente no demuestra ausencia de cualquier error.", "Si cambian dos bits y la paridad coincide\u2026", ["Se demuestra que no hubo error", "Puede haber un error no detectado por esa paridad", "Se corrigi\xF3 autom\xE1ticamente"], 1, "La paridad par no detecta todos los patrones de errores.", "bits"),
    q2("osi", "Funciones de las siete capas", "35\u201343", "F\xEDsica: se\xF1ales; enlace: tramas; red: direccionamiento/enrutamiento; transporte: comunicaci\xF3n entre extremos; sesi\xF3n: di\xE1logo; presentaci\xF3n: representaci\xF3n; aplicaci\xF3n: servicio al usuario.", "\xBFEn qu\xE9 capa se estudia la representaci\xF3n el\xE9ctrica del bit?", ["F\xEDsica", "Presentaci\xF3n", "Aplicaci\xF3n"], 0, "La capa f\xEDsica trata la se\xF1al y el medio.", void 0, "Usa el Resumen te\xF3rico para responder sus nueve preguntas. Distingue detecci\xF3n/correcci\xF3n y explica un caso de fallo por capa.")
  ] },
  { id: "ri-cable", sourceId: "F34", title: "Gu\xEDa 1 \xB7 Fabricaci\xF3n, continuidad y enlace", courseId: "s2-4", unitId: "ri-u1", scope: "Fabricaci\xF3n y continuidad de la gu\xEDa; extensi\xF3n RTU con solicitudes, respuestas, CRC y diagn\xF3stico de configuraci\xF3n.", limitations: "La gu\xEDa mezcla RS232/RS485 y alimentaci\xF3n/datos. Se contrasta el lado HMI con el manual DOP-107EG COM2 MODE2; el otro extremo es una bornera gen\xE9rica de ensayo, no los bornes confirmados del PLC de sala. Faltan proyectos DPA/ISP y confirmar la maqueta. No ejecuta DOPSoft/ISPSoft.", steps: [
    q2("leer", "Leer el conector y la gu\xEDa", "2\u20134", "Un DB9 es un conector, no un protocolo ni un pinout universal. Identifica caras y n\xFAmero de pin; al cambiar de vista la identidad permanece.", "\xBFSe puede asociar +24 V a un pin de datos por la forma DB9?", ["S\xED", "No; hace falta una referencia de puerto concreta", "Solo si el cable es rojo"], 1, "La contradicci\xF3n del original impide convertir su conexi\xF3n en una soluci\xF3n f\xEDsica aprobada."),
    q2("fabricar", "Fabricar y comprobar", "4\u20137", "Selecciona herramienta y conductor, prepara extremos, asigna contactos, esta\xF1a, suelda y sujeta. El mult\xEDmetro consulta la topolog\xEDa construida. Prueba abiertos, pin equivocado, puente y uni\xF3n intermitente.", "\xBFUn pitido en un par de contactos basta para aprobar todo el cable?", ["S\xED", "No; hay que verificar correspondencia y aislamiento entre pares", "S\xED, sin importar el esquema"], 1, "Un pin equivocado puede tener continuidad. Debes comprobar los recorridos esperados y los que deben permanecer aislados.", "cable"),
    q2("enlace", "Enlace y marcha/paro", "7\u20138", "El taller a\xF1adido env\xEDa solicitudes Modbus RTU, verifica CRC16 y solo actualiza la bobina cuando recibe una orden v\xE1lida. Cambia la velocidad HMI a 115200 como pide la gu\xEDa: un timeout no ordena paro al PLC. No emula los proyectos propietarios de la maqueta.", "Con continuidad correcta y baud diferente, \xBFqu\xE9 falla?", ["La compatibilidad de configuraci\xF3n", "Necesariamente la soldadura", "La numeraci\xF3n impresa del DB9"], 0, "El nivel de configuraci\xF3n es independiente de la continuidad.", "cable"),
    q2("entrega", "Evidencia y revisi\xF3n", "8\u20139", "La carga de proyectos de HMI/PLC y la comprobaci\xF3n f\xEDsica de la gu\xEDa siguen en las herramientas y equipos del curso. Guarda tus pruebas y explicaci\xF3n.", "\xBFQu\xE9 acredita el taller virtual?", ["Destreza f\xEDsica de soldadura", "Pr\xE1ctica del procedimiento y diagn\xF3stico dentro del modelo", "Compatibilidad f\xEDsica garantizada con el PLC real"], 1, "Las evidencias describen acciones y resultados virtuales, no una habilitaci\xF3n del montaje real.", void 0, "Adjunta correspondencia validada por el docente, tabla de continuidad/aislamiento, capturas o video, efecto de cambiar baud y conclusi\xF3n. No est\xE1n incluidos los proyectos DPA/ISP originales.")
  ] },
  { id: "mt-piedra", sourceId: "F25", title: "ARPA 2 \xB7 Lanzamiento de una piedra", courseId: "s2-5", unitId: "mtfm01-u1", scope: "Tabla original, ajuste cuadr\xE1tico y m\xE1ximo entre muestras.", steps: [
    q2("tabla", "De los datos al modelo", "1", "La tabla original contiene (0,40),(1,60),(2,70),(3,70),(4,60),(5,40),(6,10). La cuadr\xE1tica que pasa por esos puntos es h(t)=\u22125t\xB2+25t+40.", "\xBFEl m\xE1ximo de la tabla es necesariamente el del modelo?", ["S\xED, siempre ocurre en un segundo entero", "No, puede ocurrir entre dos muestras", "La tabla no contiene unidades"], 1, "La curva permite estudiar valores intermedios.", "quadratic"),
    n("vertice", "Momento de altura m\xE1xima", "1", "Para at\xB2+bt+c con a<0, el v\xE9rtice est\xE1 en t=\u2212b/(2a).", "Tiempo del m\xE1ximo", 2.5, 1e-3, "s", "\u221225/(2\xD7\u22125)=2,5 s.", "quadratic"),
    n("altura", "Altura m\xE1xima", "1", "Sustituye el tiempo del v\xE9rtice en h(t). Mant\xE9n el dominio f\xEDsico desde el lanzamiento hasta tocar el suelo.", "Altura m\xE1xima", 71.25, 0.01, "m", "\u22125\xD72,5\xB2+25\xD72,5+40=71,25 m.", void 0, "Explica por qu\xE9 las muestras a 2 y 3 s dan ambas 70 m sin ser el m\xE1ximo.")
  ] },
  { id: "mt-piedra-extension", sourceId: "F24", title: "ARPA 2 \xB7 Piedra \xB7 Extensi\xF3n", courseId: "s2-5", unitId: "mtfm01-u1", scope: "Segunda trayectoria original; se conserva separada de la base.", steps: [
    n("tiempo", "La segunda piedra", "1", "La extensi\xF3n usa h(t)=\u22125t\xB2+30t+40. Compara sus coeficientes con el caso base.", "Tiempo de altura m\xE1xima", 3, 1e-3, "s", "\u221230/(2\xD7\u22125)=3 s.", "quadratic"),
    n("altura", "Comparar alturas", "1", "Eval\xFAa la segunda trayectoria en su v\xE9rtice y contrasta con 71,25 m de la base.", "Altura m\xE1xima de la extensi\xF3n", 85, 0.01, "m", "\u22125\xD79+30\xD73+40=85 m.", "quadratic", "Compara altura inicial, m\xE1ximo y ca\xEDda de las dos trayectorias; conserva las preguntas del original.")
  ] },
  { id: "mt-servicio", sourceId: "F29", title: "Modelaci\xF3n 1 \xB7 Servicio el\xE9ctrico", courseId: "s2-5", unitId: "mtfm01-u1", scope: "Costos fijos/variables, discrepancias y cuaderno de las cinco actividades.", limitations: "Empresas y cobros pertenecen al problema original; no son tarifas vigentes. Se conserva la discrepancia entre columnas y totales.", steps: [
    n("columnas", "Construir y contrastar", "2", "La primera tabla da administraci\xF3n 1324 y 144 por kWh. La suma de esas dos columnas modela C(x)=1324+144x; no coincide con todos los totales publicados.", "Suma de esas columnas para 234 kWh", 35020, 0.5, "pesos", "1324+144\xD7234=35020. La fuente publica 35595; hay que analizar la diferencia.", "affine"),
    q2("ajuste", "Elegir datos de ajuste", "3", "La actividad 4 aporta otra tabla de consumo y total. Identifica los pares elegidos y revisa residuos; no fuerces a todos los datos a coincidir con el modelo anterior.", "Si una tabla y un modelo discrepan, conviene\u2026", ["Ocultar los datos", "Comparar residuos y revisar qu\xE9 costos incluye", "Declarar exactitud sin revisar"], 1, "La discrepancia es parte del objetivo de modelaci\xF3n.", void 0, "Resuelve actividades 1\u20134 con tablas y expresiones, dejando indicados los datos usados para cada ajuste."),
    n("chispita", "Comparar empresas", "3\u20134", "CHISPITA pide sumar administraci\xF3n, electricidad y transporte. Para 70 kWh, los valores son 685, 8164 y 1124.", "Total del primer hogar", 9973, 0.5, "pesos", "685+8164+1124=9973.", void 0, "Actividad 5: completa los hogares; ajusta con 2, 3, 4 y 5 pares; compara en GeoGebra con LUMINUS y explica la intersecci\xF3n.")
  ] },
  { id: "mt-energia", sourceId: "F23", title: "ARPA 1 \xB7 Consumo de energ\xEDa", courseId: "s2-5", unitId: "mtfm01-u1", scope: "Infograf\xEDa original, funci\xF3n af\xEDn y consumo inverso.", steps: [
    n("pendiente", "Leer la infograf\xEDa", "1", "Cada ampolleta equivale a 1 kWh: 1 kWh cuesta $1100; 2 kWh $1300; 3 kWh $1500. El incremento por kWh es constante.", "Costo por cada kWh a\xF1adido", 200, 1e-3, "pesos/kWh", "(1300\u22121100)/(2\u22121)=200 pesos/kWh.", "energy"),
    n("fijo", "Separar el cargo fijo", "1", "Con C(x)=200x+b y el par (1,1100), despeja b.", "Cargo fijo", 900, 1e-3, "pesos", "1100\u2212200\xD71=900 pesos.", "energy"),
    n("inversa", "Resolver el consumo", "1", "La pregunta original pide el consumo si el cobro es $8300. Usa C(x)=200x+900.", "Consumo para $8300", 37, 1e-3, "kWh", "(8300\u2212900)/200=37 kWh.", "energy", "Deja el despeje y verifica reemplazando el consumo en la expresi\xF3n del cobro.")
  ] },
  { id: "mt-energia-extension", sourceId: "F22", title: "ARPA 1 \xB7 Consumo de energ\xEDa \xB7 Extensi\xF3n", courseId: "s2-5", unitId: "mtfm01-u1", scope: "Infograf\xEDa propia de la extensi\xF3n, con datos diferentes a la actividad base.", steps: [
    n("pendiente", "Dos pares de la extensi\xF3n", "1", "La extensi\xF3n indica 2 kWh por $1400 y 5 kWh por $1800. No uses los datos de la base.", "Pendiente del modelo", 400 / 3, 5e-3, "pesos/kWh", "(1800\u22121400)/(5\u22122)=400/3\u2248133,3333 pesos/kWh.", "energy"),
    n("fijo", "La expresi\xF3n af\xEDn", "1", "Calcula b=1400\u2212(400/3)\xD72. El modelo es C(x)=(400/3)x+3400/3.", "Cargo fijo", 3400 / 3, 5e-3, "pesos", "b=3400/3\u22481133,3333 pesos.", "energy", "Verifica la expresi\xF3n con ambos pares originales antes de redondear.")
  ] },
  { id: "mt-instagram", sourceId: "F30", title: "Modelaci\xF3n 2 \xB7 Seguidores en Instagram", courseId: "s2-5", unitId: "mtfm01-u2", scope: "Dominio, crecimiento logar\xEDtmico, ajuste y tasas medias.", steps: [
    q2("dominio", "Dominio y origen temporal", "2", "Un logaritmo requiere argumento positivo. Si se desplaza el origen de tiempo, se debe justificar c\xF3mo se transforma la variable.", "Para log(t), los valores reales exigen\u2026", ["t>0", "Cualquier t real", "t=0 siempre"], 0, "El dominio es parte del modelo.", "followers"),
    q2("crecimiento", "Crecimiento y tasa", "2\u20133", "Crecimiento sostenido no significa incremento constante. Un modelo logar\xEDtmico creciente suele aumentar cada vez menos en intervalos iguales.", "\xBFQu\xE9 compara una tasa media?", ["Solo el \xFAltimo valor", "Cambio de seguidores / cambio de tiempo", "La base del tel\xE9fono"], 1, "La tasa media necesita un intervalo y sus unidades.", "followers", "Compara el ajuste de los cinco pares con g(x)=600+1157,28 ln(2x\u22121). Documenta predicciones de actividad 3, dominio y las dos tasas medias de actividad 5. No se usa una cuenta real.")
  ] },
  { id: "mt-sueno", sourceId: "F31", title: "Modelaci\xF3n 2 \xB7 Sue\xF1o dorado", courseId: "s2-5", unitId: "mtfm01-u1", scope: "Ingreso, costo, utilidad y equilibrio con ecuaciones originales.", limitations: "La cuadr\xE1tica de costos no se extrapola indefinidamente; cantidades son enteras no negativas y el dominio debe justificarse.", steps: [
    n("ingreso", "Ingresos", "2", "La fuente fija precio $80000 por almohada, por tanto I(x)=80000x.", "Ingresos por 100 unidades", 8e6, 0.5, "pesos", "80000\xD7100=8000000.", "business"),
    n("costo", "Costo y producci\xF3n", "3", "C(x)=\u22120,14x\xB2+1580x+805000000. Un costo cuadr\xE1tico c\xF3ncavo no crece para siempre; limita su uso al contexto.", "Costo de producir cero unidades", 805e6, 0.5, "pesos", "C(0)=805000000.", "business"),
    q2("utilidad", "Equilibrio y ganancias", "3", "U(x)=I(x)\u2212C(x)=0,14x\xB2+78420x\u2212805000000. El equilibrio satisface U(x)=0, sujeto al dominio.", "Hay ganancias cuando\u2026", ["Ingresos mayores que costos", "Costos mayores que ingresos", "Las curvas tienen el mismo color"], 0, "La diferencia I\u2212C determina el signo de la utilidad.", "business", "Completa todas las tablas y preguntas de ingresos/costos; calcula equilibrio y justifica el dominio antes de interpretar extremos.")
  ] },
  { id: "mt-stock", sourceId: "F32", title: "Modelaci\xF3n 3 \xB7 Desabastecimiento", courseId: "s2-5", unitId: "mtfm01-u1", scope: "Comparaci\xF3n de modelos y criterios de extrapolaci\xF3n; datos originales en el PDF.", steps: [
    q2("ajustes", "Una tabla, varios ajustes", "2", "La gu\xEDa pide ajustes lineal, cuadr\xE1tico y c\xFAbico para siete d\xEDas de stock. Un ajuste con m\xE1s par\xE1metros puede seguir mejor las muestras sin predecir mejor fuera de ellas.", "\xBFMenor residuo en la muestra garantiza mejor extrapolaci\xF3n?", ["S\xED", "No", "Solo con curva c\xFAbica"], 1, "Eval\xFAa residuos, dominio y comportamiento fuera del intervalo.", "stock"),
    q2("agotamiento", "Argumentar el agotamiento", "3", "La ra\xEDz del modelo estima un agotamiento solo bajo sus supuestos. No se fuerza una \xFAnica fecha para todos los ajustes.", "Una conclusi\xF3n revisable debe incluir\u2026", ["Solo un d\xEDa", "Modelo, datos, ra\xEDz estimada y l\xEDmites", "Solo la curva m\xE1s vistosa"], 1, "La predicci\xF3n depende del modelo y sus supuestos.", "stock", "Contrasta los tres ajustes con GeoGebra, registra residuos y ra\xEDces y recomienda un momento de reposici\xF3n con los supuestos y el margen que hayas justificado.")
  ] }
];

// src/study/content/academic-sources.json
var academic_sources_default = [
  {
    id: "F01",
    title: "Activadad con calculo Ajuste cero.pdf",
    courseId: "s2-1",
    url: "/estudio/fuentes/F01.pdf",
    pages: 6,
    format: "pdf",
    sha256: "1fecba56f6af9c9e5798c2ddd716cf66330f6d5cef23df682bce19066232c5eb"
  },
  {
    id: "F02",
    title: "Clase 1.pdf",
    courseId: "s2-1",
    url: "/estudio/fuentes/F02.pdf",
    pages: 16,
    format: "pdf",
    sha256: "fedc701febb302339bc5b2113b8598a47cfab0b87bc19d9ab627f2ee7a98d4b1"
  },
  {
    id: "F03",
    title: "Clase 2.pdf",
    courseId: "s2-1",
    url: "/estudio/fuentes/F03.pdf",
    pages: 16,
    format: "pdf",
    sha256: "c4d8b92546bc3e54618ac81d0f962ce0251fb6bc164050744605cbba95ba832c"
  },
  {
    id: "F04",
    title: "Clase 3.pdf",
    courseId: "s2-1",
    url: "/estudio/fuentes/F04.pdf",
    pages: 23,
    format: "pdf",
    sha256: "3622fc261a80f27edc65789f62d4adce05a1a1c5bdf201e68bf504d62346da90"
  },
  {
    id: "F05",
    title: "clase 4.pdf",
    courseId: "s2-1",
    url: "/estudio/fuentes/F05.pdf",
    pages: 15,
    format: "pdf",
    sha256: "f5163412512142563de7dccb45cfea33343245a37f63cb2e1dc0813c08073f4e"
  },
  {
    id: "F06",
    title: "Clase 5.pdf",
    courseId: "s2-1",
    url: "/estudio/fuentes/F06.pdf",
    pages: 13,
    format: "pdf",
    sha256: "ffda256efc1afa28fbb9ad65a320d4e40b9e6fd5f6c93a3818fce5f8935ef3fc"
  },
  {
    id: "F07",
    title: "Guia 1.pdf",
    courseId: "s2-1",
    url: "/estudio/fuentes/F07.pdf",
    pages: 9,
    format: "pdf",
    sha256: "ed3545b78c6a2f8f45fb53315462169f691ecd0ee871f1e47ba2f9c2d51a05fc"
  },
  {
    id: "F08",
    title: "screencapture-aai-inacap-cl-course-view-2026-10-17-21_17_54.png",
    courseId: "s2-1",
    url: "/estudio/fuentes/F08.png",
    pages: null,
    format: "png",
    sha256: "66c9f0cde04c5f4d17e41dcbbb96e5224bc40f30b9cb0a487497b2e0bc81d7c8"
  },
  {
    id: "F09",
    title: "screencapture-aai-inacap-cl-course-view-2026-10-17-21_17_03.png",
    courseId: "s2-3",
    url: "/estudio/fuentes/F09.png",
    pages: null,
    format: "png",
    sha256: "d12d6fc38a73219f2d3cead42d519cb1dbc2b6b1e7fbbb0615358731fa6c2751"
  },
  {
    id: "F10",
    title: "Actividad 1 U2.pdf",
    courseId: "s2-2",
    url: "/estudio/fuentes/F10.pdf",
    pages: 17,
    format: "pdf",
    sha256: "2f66c9f2503865c2bdc04b0a34d0049e998a815d0d00db8c9a88ddf76ce0499b"
  },
  {
    id: "F11",
    title: "Actividad 2 (1).pdf",
    courseId: "s2-2",
    url: "/estudio/fuentes/F11.pdf",
    pages: 15,
    format: "pdf",
    sha256: "7904d787994d2563df9eeb351ed91f181de3475460ffa6e5f24d0fc0cc91cdbb"
  },
  {
    id: "F12",
    title: "Actividad 2.pdf",
    courseId: "s2-2",
    url: "/estudio/fuentes/F12.pdf",
    pages: 14,
    format: "pdf",
    sha256: "4e5959f14936273c1e5e2fc8fcfb446fd25ff13688ceec11e5bd9ea9b3319cd6"
  },
  {
    id: "F13",
    title: "linkdevideo.txt",
    courseId: "s2-2",
    url: "/estudio/fuentes/F13.txt",
    pages: null,
    format: "txt",
    sha256: "4f7bbc80e96e53f0201ac98f138b914652566b037ac3f8a2740957448d26d9be"
  },
  {
    id: "F14",
    title: "protecciones (1).pptx",
    courseId: "s2-2",
    url: "/estudio/fuentes/F14.pptx",
    pages: 16,
    format: "pptx",
    sha256: "38d11c0b35bf320dc6739c2b4ea4c3d3f37de20300d6e6457480b550bd00240a"
  },
  {
    id: "F15",
    title: "Resolucion Prueba (1).docx",
    courseId: "s2-2",
    url: "/estudio/fuentes/F15.docx",
    pages: null,
    format: "docx",
    sha256: "dd28269e85f0b304015e1147897963bae8d6f4bd1e7558c5440565a27555f1d4"
  },
  {
    id: "F16",
    title: "Rubrica 1 (1).xlsx",
    courseId: "s2-2",
    url: "/estudio/fuentes/F16.xlsx",
    pages: null,
    format: "xlsx",
    sha256: "04d854ac6266be6de61d14cbe2e38bd899a864fcf8dc5100cad0f4e61b3a3b9a"
  },
  {
    id: "F17",
    title: "screencapture-aai-inacap-cl-course-view-2026-10-17-21_17_24.png",
    courseId: "s2-2",
    url: "/estudio/fuentes/F17.png",
    pages: null,
    format: "png",
    sha256: "94d5b347abe3b8d0f0ce4189b7a4c9802963b3c4ebd1b95e3390082459444db9"
  },
  {
    id: "F18",
    title: "Temario Evaluacion.docx",
    courseId: "s2-2",
    url: "/estudio/fuentes/F18.docx",
    pages: null,
    format: "docx",
    sha256: "b6a70e7d47a2403e19c157b87da101dce841a240d8059fb618592087ead01f20"
  },
  {
    id: "F19",
    title: "Actividad tecnol\xF3gica 1 Funciones polin\xF3micas de grados 0 y 1.pdf",
    courseId: "s2-5",
    url: "/estudio/fuentes/F19.pdf",
    pages: 7,
    format: "pdf",
    sha256: "e2586d0d71f42096d4e6fe04738d3dd2bf0aa6252b481c6a50b05154d6afd9da"
  },
  {
    id: "F20",
    title: "Actividad tecnol\xF3gica 2 Funciones logar\xEDtmicas.pdf",
    courseId: "s2-5",
    url: "/estudio/fuentes/F20.pdf",
    pages: 4,
    format: "pdf",
    sha256: "3aa6f6e46d342ca36d1774827612078ec4a48456a23cdd893e15f9d066c6a686"
  },
  {
    id: "F21",
    title: "Actividad tecnol\xF3gica 2 Funciones polin\xF3micas de grado 2.pdf",
    courseId: "s2-5",
    url: "/estudio/fuentes/F21.pdf",
    pages: 6,
    format: "pdf",
    sha256: "d96b0140050bd6c4ad0110dd4771dce06ce72231c6730479e2b6cba95d735f13"
  },
  {
    id: "F22",
    title: "ARPA 1 Consumo de energ\xEDa (extensi\xF3n).pdf",
    courseId: "s2-5",
    url: "/estudio/fuentes/F22.pdf",
    pages: 1,
    format: "pdf",
    sha256: "fcf6d1e243f7914f862487ef4669664997a6d4d7c7e3c20e23ec36f2bdfb0ac4"
  },
  {
    id: "F23",
    title: "ARPA 1 Consumo de energ\xEDa.pdf",
    courseId: "s2-5",
    url: "/estudio/fuentes/F23.pdf",
    pages: 1,
    format: "pdf",
    sha256: "2505ef3e048e9c433f26971083631213e098d9f8b511f63ca815f86e9483f884"
  },
  {
    id: "F24",
    title: "ARPA 2 Lanzamiento de una piedra (extensi\xF3n).pdf",
    courseId: "s2-5",
    url: "/estudio/fuentes/F24.pdf",
    pages: 1,
    format: "pdf",
    sha256: "f444fbf67c4a306a9cb3b5bf54e603d24c75acb6d8fb9930c08e80ffad9ea342"
  },
  {
    id: "F25",
    title: "ARPA 2 Lanzamiento de una piedra.pdf",
    courseId: "s2-5",
    url: "/estudio/fuentes/F25.pdf",
    pages: 1,
    format: "pdf",
    sha256: "ce468bdab3bd42ec1a0afee9bcff5eb79e3aeaab49b437e3d199b68610cc80b8"
  },
  {
    id: "F26",
    title: "link de actividades formativas 2.txt",
    courseId: "s2-5",
    url: "/estudio/fuentes/F26.txt",
    pages: null,
    format: "txt",
    sha256: "45afa797962295365f4f8bf4a8c6d9918fb5a44a0db581fe109d50fe5dfd366e"
  },
  {
    id: "F27",
    title: "link de actividades formativas.txt",
    courseId: "s2-5",
    url: "/estudio/fuentes/F27.txt",
    pages: null,
    format: "txt",
    sha256: "3049629efdb3fc2f1208967b48c3d1f7bbc28ec610a7d228605859e8b8382b31"
  },
  {
    id: "F28",
    title: "screencapture-aai-inacap-cl-course-view-2026-10-17-21_16_40.png",
    courseId: "s2-5",
    url: "/estudio/fuentes/F28.png",
    pages: null,
    format: "png",
    sha256: "1a1fc3433ef5d9942ca0b29634f5c3553a160c7ad3677354ad3749d0692de266"
  },
  {
    id: "F29",
    title: "Situaci\xF3n de modelaci\xF3n 1 Servicio el\xE9ctrico.pdf",
    courseId: "s2-5",
    url: "/estudio/fuentes/F29.pdf",
    pages: 4,
    format: "pdf",
    sha256: "8d3b66932b8fce4a7586658aacfc3840a8510225fe47d4652e5d52cabb7d218d"
  },
  {
    id: "F30",
    title: "Situaci\xF3n de modelaci\xF3n 2 Seguidores en Instagram.pdf",
    courseId: "s2-5",
    url: "/estudio/fuentes/F30.pdf",
    pages: 3,
    format: "pdf",
    sha256: "c92c03d5ea8c77100aeb2bb8c0591236cf34868f1fa9d9f033ceedbe5fe4a035"
  },
  {
    id: "F31",
    title: "Situaci\xF3n de modelaci\xF3n 2 Sue\xF1o dorado.pdf",
    courseId: "s2-5",
    url: "/estudio/fuentes/F31.pdf",
    pages: 3,
    format: "pdf",
    sha256: "9c00f68a1c68c1194d403df8cdad89a93835430577df168782f180cc339319bd"
  },
  {
    id: "F32",
    title: "Situaci\xF3n de modelaci\xF3n 3 Desabastecimiento.pdf",
    courseId: "s2-5",
    url: "/estudio/fuentes/F32.pdf",
    pages: 3,
    format: "pdf",
    sha256: "7f41a9092c2433b87242b3cca7f83d115aa456ab149d5f75d9c9b23830ed41df"
  },
  {
    id: "F33",
    title: "Clase Teorica.pdf",
    courseId: "s2-4",
    url: "/estudio/fuentes/F33.pdf",
    pages: 43,
    format: "pdf",
    sha256: "f488c45276f849f5483f769b121b0ae91e7549f1d8dec6f57e41f2cdce468ad6"
  },
  {
    id: "F34",
    title: "Gu\xEDa 1.pdf",
    courseId: "s2-4",
    url: "/estudio/fuentes/F34.pdf",
    pages: 9,
    format: "pdf",
    sha256: "3db3a83c67d160ee075eafb83229a086efa64738037e27acb021f5f12cafdafb"
  },
  {
    id: "F35",
    title: "Resumen Teorico.pdf",
    courseId: "s2-4",
    url: "/estudio/fuentes/F35.pdf",
    pages: 4,
    format: "pdf",
    sha256: "e11fecf41f70810744c4722cffc309ed29ef46caae31c3513336234bd3f97910"
  },
  {
    id: "F36",
    title: "screencapture-aai-inacap-cl-course-view-2026-10-17-21_17_38.png",
    courseId: "s2-4",
    url: "/estudio/fuentes/F36.png",
    pages: null,
    format: "png",
    sha256: "e62e31b44e36e1ace22b512befb59e830d7b62104270749e88a1d8d47a33adac"
  },
  {
    id: "F37",
    title: "Actividad tecnol\xF3gica 1 Funciones exponenciales.pdf",
    courseId: "s2-5",
    url: "/estudio/fuentes/F37.pdf",
    pages: 6,
    format: "pdf",
    sha256: "baeb9ee1c850d87ff639d43961f49a66cc4f8f6ea5c0bae1edff5cfc7a08580d"
  },
  {
    id: "F38",
    title: "Situaci\xF3n de modelaci\xF3n 1 Crecimiento de bacterias.pdf",
    courseId: "s2-5",
    url: "/estudio/fuentes/F38.pdf",
    pages: 3,
    format: "pdf",
    sha256: "f7b60bab31f2a89ff7ee4cfa7df066a017f270d1684426132b1273b2e9123e7a"
  },
  {
    id: "F39",
    title: "ARPA 1 Eliminaci\xF3n de f\xE1rmacos.pdf",
    courseId: "s2-5",
    url: "/estudio/fuentes/F39.pdf",
    pages: 1,
    format: "pdf",
    sha256: "8e19deb09ddf74af00ea4f8ad0df257848216cba68414cd2c24719334f4f2726"
  },
  {
    id: "I01",
    title: "Presentaci\xF3n de la Asignatura (1).pdf",
    courseId: "s2-3",
    url: "/estudio/fuentes/I01.pdf",
    pages: 13,
    format: "pdf",
    sha256: "0355238d25b7e344932d39ae3d33ed5079f0fd4931be9feae9356a0e6a9f1a58"
  },
  {
    id: "I02",
    title: "Conf. 1 (1).pdf",
    courseId: "s2-3",
    url: "/estudio/fuentes/I02.pdf",
    pages: 38,
    format: "pdf",
    sha256: "a68df2d507d18de369f75d312dd7c88ed4a6c86e1edb771db125a327d98a5fb9"
  },
  {
    id: "I03",
    title: "Conf. 2 (2).pdf",
    courseId: "s2-3",
    url: "/estudio/fuentes/I03.pdf",
    pages: 30,
    format: "pdf",
    sha256: "725723fa82efd628e478a41aa6e599fcb2367420187eec3ff7460869a941f635"
  },
  {
    id: "I04",
    title: "Conf. 3 Medidas de caudal.pdf",
    courseId: "s2-3",
    url: "/estudio/fuentes/I04.pdf",
    pages: 29,
    format: "pdf",
    sha256: "3a8e95e2db99a60b9a5d3fcdc9bdecfb55a3881be3ec78ad136bfa24189e71da"
  },
  {
    id: "I05",
    title: "Conf. 4 Medidas de Presi\xF3n.pdf",
    courseId: "s2-3",
    url: "/estudio/fuentes/I05.pdf",
    pages: 23,
    format: "pdf",
    sha256: "4bccb3711ac28b722e5ec7e24a1a0d5858029472c0f6b048b54ac96056726d1b"
  },
  {
    id: "I06",
    title: "Conf. 5 Medidas de nivel.pdf",
    courseId: "s2-3",
    url: "/estudio/fuentes/I06.pdf",
    pages: 25,
    format: "pdf",
    sha256: "7eb6b334877a4d370e58ca79501533523a74cfccb16727cd854a486598e0bd22"
  },
  {
    id: "I07",
    title: "Conf. 6 Medidas de temperatura.pdf",
    courseId: "s2-3",
    url: "/estudio/fuentes/I07.pdf",
    pages: 36,
    format: "pdf",
    sha256: "cdfdd35e152356851260a1672abad6a321782f4a4e3215481f78da24427c8b20"
  },
  {
    id: "I08",
    title: "Conf. 2 (3).pdf",
    courseId: "s2-3",
    url: "/estudio/fuentes/I08.pdf",
    pages: 12,
    format: "pdf",
    sha256: "2173bff4f606599f02c3a0fd472d504ec84bde357c491a51caec6a13ad5271d9"
  }
];

// src/study/mathCourseModules.ts
var mathCourseModules = {
  "mtfm01-u1": [
    { id: "mtfm01-u1-m1", title: "M\xF3dulo 1", summary: "Consumo de energ\xEDa \xB7 Funciones de grados 0 y 1 \xB7 Servicio el\xE9ctrico", origin: "classroom", materialIds: ["mt-energia", "mt-energia-extension", "mtfm01-lineales", "mt-servicio"] },
    { id: "mtfm01-u1-m2", title: "M\xF3dulo 2", summary: "Lanzamiento de una piedra \xB7 Funciones de grado 2 \xB7 Sue\xF1o dorado", origin: "classroom", materialIds: ["mt-piedra", "mt-piedra-extension", "mtfm01-cuadraticas", "mt-sueno"] },
    { id: "mtfm01-u1-m3", title: "M\xF3dulo 3", summary: "Desabastecimiento", origin: "classroom", materialIds: ["mt-stock"] },
    { id: "mtfm01-u1-formativas", title: "Actividades formativas", summary: "Los cinco recursos de la Unidad 1", origin: "classroom", materialIds: [], resources: [
      { title: "Actividad Formativa N\xB01", href: "https://www.geogebra.org/m/QQDHQvNH" },
      { title: "Actividad Formativa N\xB02", href: "https://www.geogebra.org/m/BfUw2CSU" },
      { title: "Actividad Formativa N\xB03", href: "https://www.geogebra.org/m/MztWSeeH" },
      { title: "Actividad Formativa N\xB04", href: "https://www.geogebra.org/m/qxb2nWSA" },
      { title: "Actividad Formativa N\xB05", href: "https://www.geogebra.org/m/hkAFJD3D" }
    ] },
    { id: "mtfm01-u1-evaluacion", title: "Evaluaci\xF3n sumativa 1", summary: "Funciones polin\xF3micas", origin: "classroom", materialIds: [], pending: "La evaluaci\xF3n aparece en tu aula, pero todav\xEDa no se dispone de su enunciado completo." }
  ],
  "mtfm01-u2": [
    { id: "mtfm01-u2-m1", title: "M\xF3dulo 1", summary: "Eliminaci\xF3n de f\xE1rmacos \xB7 Funciones exponenciales \xB7 Crecimiento de bacterias", origin: "classroom", materialIds: ["mtfm01-eliminacion", "mtfm01-exponenciales", "mtfm01-bacterias"] },
    { id: "mtfm01-u2-m2", title: "M\xF3dulo 2", summary: "Funciones logar\xEDtmicas \xB7 Seguidores en Instagram", origin: "classroom", materialIds: ["mtfm01-logaritmicas", "mt-instagram"] },
    { id: "mtfm01-u2-formativas", title: "Actividades formativas", summary: "Poblaci\xF3n \xB7 Estroncio \xB7 Ahorro \xB7 Altura de una planta", origin: "classroom", materialIds: ["mtfm01-problema-poblacion", "mtfm01-problema-estroncio", "mtfm01-problema-ahorro", "mtfm01-problema-planta"] },
    { id: "mtfm01-u2-repaso", title: "Repaso de la prueba \xB7 Unidad 2", summary: "Las cuatro actividades formativas y las f\xF3rmulas de apoyo", origin: "support", materialIds: ["mtfm01-repaso-u2"] }
  ],
  "mtfm01-u3": [1, 2, 3].map((n2) => ({ id: `mtfm01-u3-m${n2}`, title: `M\xF3dulo ${n2}`, summary: "Material pendiente", origin: "classroom", materialIds: [], pending: "Este m\xF3dulo aparece en la captura de tu aula. Su contenido todav\xEDa no est\xE1 disponible en el proyecto." })),
  "mtfm01-u4": [
    { id: "mtfm01-u4-abpro", title: "Proyecto ABPro", summary: "Proyecto de la Unidad 4", origin: "classroom", materialIds: [], pending: "El Proyecto ABPro aparece en tu aula. Falta incorporar su documento e instrucciones." },
    { id: "mtfm01-u4-practicas", title: "Pr\xE1cticas complementarias de matrices", summary: "Datos y operaciones \xB7 Producto \xB7 Sistemas", origin: "support", materialIds: ["mtfm01-matrices-operaciones", "mtfm01-matrices-producto", "mtfm01-matrices-sistemas"] }
  ]
};

// src/study/classCatalog.ts
var academic = (courseId, unitId) => academicLessons.filter((l) => l.courseId === courseId && l.unitId === unitId).map((l) => ({ id: l.id, title: l.title, kind: l.sourceId === "F34" || l.sourceId === "F07" || l.sourceId === "F10" || l.sourceId === "F11" || l.sourceId === "F12" ? "guide" : "class", pdfUrl: academic_sources_default.find((s) => s.id === l.sourceId)?.url, academicLessonId: l.id }));
var original = (id, title) => {
  const s = academic_sources_default.find((s2) => s2.id === id);
  return { id: `fuente-${id}`, title: title || s.title, kind: "guide", pdfUrl: s.url };
};
var protectionClass = {
  id: "protecciones-docente-2026-10-07",
  title: "Protecciones el\xE9ctricas",
  kind: "class",
  pdfUrl: "/estudio/profesor.pdf",
  topicIds: lessons.map((lesson) => lesson.id)
};
var classOutlines = {
  "s2-1": {
    units: [
      {
        id: "area02-u1",
        title: "Unidad 1: Principios de Electr\xF3nica y Electr\xF3nica Anal\xF3gica",
        materials: [
          ...academic("s2-1", "area02-u1"),
          { id: "area02-u1-ejercicio-1", title: "Ejercicio 1", kind: "exercise" }
        ]
      },
      { id: "area02-u2", title: "Unidad 2: Fundamentos de Electr\xF3nica Digital", materials: [] },
      { id: "area02-u3", title: "Unidad 3: Introducci\xF3n a Electr\xF3nica de Potencia", materials: [] }
    ],
    unassigned: []
  },
  "s2-2": { units: [
    { id: "cm-u1", title: "Unidad 1: Fundamentos de m\xE1quinas el\xE9ctricas rotativas", materials: [...academic("s2-2", "cm-u1"), original("F18", "Temario de Evaluaci\xF3n 1"), original("F16", "R\xFAbrica del informe \xB7 EVA1"), original("F15", "Resoluci\xF3n de prueba \xB7 contiene pauta en revisi\xF3n")] },
    { id: "cm-u2", title: "Unidad 2: Control electromec\xE1nico", materials: [...academic("s2-2", "cm-u2"), protectionClass] },
    { id: "cm-u3", title: "Unidad 3: Control electr\xF3nico de motores CA", materials: [] }
  ], unassigned: [] },
  // Unidades según la captura del aula. Tienen lección G01, G02 y G03; las conferencias y demás guías siguen pendientes.
  "s2-3": { units: [
    { id: "ii-u1", title: "Unidad 1: Clasificaci\xF3n y caracter\xEDsticas de la instrumentaci\xF3n", materials: academic("s2-3", "ii-u1") },
    { id: "ii-u2", title: "Unidad 2: Medici\xF3n y actuaci\xF3n discreta y anal\xF3gica", materials: [...academic("s2-3", "ii-u2"), ...detectorLessons.map((l) => ({ id: l.materialId, title: l.title, kind: "guide", pdfUrl: l.source, detLessonId: l.id })), ...temperatureLessons.map((l) => ({ id: l.materialId, title: l.title, kind: "guide", pdfUrl: l.source, tempLessonId: l.id })), { id: REVIEW_MATERIAL, title: "Temperatura \xB7 Repaso de la gu\xEDa G03", kind: "guide", tempLessonId: REVIEW_ID }] },
    { id: "ii-u3", title: "Unidad 3: Interpretaci\xF3n de instrumentaci\xF3n y control", materials: [] }
  ], unassigned: [] },
  "s2-5": { units: [
    { id: mathUnits[0].id, title: mathUnits[0].title, materials: [...geoLessons.filter((l) => l.unit === 1).map((l) => ({ id: l.materialId, title: l.title, kind: "guide", pdfUrl: l.source, toolLessonId: l.id })), ...academic("s2-5", "mtfm01-u1")] },
    { id: mathUnits[1].id, title: mathUnits[1].title, materials: [...geoLessons.filter((l) => l.id.startsWith("problema-")).map((l) => ({ id: l.materialId, title: `Problema de clase \xB7 ${l.title}`, kind: "exercise", toolLessonId: l.id })), { id: "mtfm01-repaso-u2", title: "Repaso de la prueba \xB7 Unidad 2", kind: "guide", mathReview: "all" }, { id: "mtfm01-exponenciales", title: "Actividad tecnol\xF3gica 1 \xB7 Funciones exponenciales", kind: "guide", pdfUrl: "/estudio/fuentes/F37.pdf", mathReview: "exp" }, { id: "mtfm01-bacterias", title: "Modelaci\xF3n 1 \xB7 Crecimiento de bacterias", kind: "class", pdfUrl: "/estudio/fuentes/F38.pdf", mathReview: "bacteria" }, { id: "mtfm01-eliminacion", title: "ARPA 1 \xB7 Eliminaci\xF3n de f\xE1rmacos", kind: "exercise", pdfUrl: "/estudio/fuentes/F39.pdf", mathReview: "elimination" }, ...geoLessons.filter((l) => l.unit === 2 && !l.id.startsWith("problema-")).map((l) => ({ id: l.materialId, title: l.title, kind: "guide", pdfUrl: l.source, toolLessonId: l.id })), ...academic("s2-5", "mtfm01-u2")] },
    { id: mathUnits[2].id, title: mathUnits[2].title, materials: [] },
    { id: mathUnits[3].id, title: mathUnits[3].title, materials: geoLessons.filter((l) => l.unit === 4).map((l) => ({ id: l.materialId, title: l.title, kind: "exercise", toolLessonId: l.id })) }
  ], unassigned: [] },
  "s2-4": { units: [
    { id: "ri-u1", title: "Unidad 1: Fundamentos de redes industriales", materials: [...academic("s2-4", "ri-u1"), original("F35", "Resumen te\xF3rico \xB7 apoyo de la clase")] },
    { id: "ri-u2", title: "Unidad 2: Medios y protocolos basados en Ethernet", materials: [] },
    { id: "ri-u3", title: "Unidad 3: Implementaci\xF3n de redes", materials: [] }
  ], unassigned: [] }
};
for (const unit of classOutlines["s2-5"].units) unit.modules = mathCourseModules[unit.id];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  classOutlines,
  protectionClass
});
