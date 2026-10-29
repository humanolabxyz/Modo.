// src/data/practice.ts
var BANANA_COLOR = "#145650";
var CONNECTOR_PENDING = { id: "laboratorio-pendiente", stackable: "unverified", capacity: null };
var CLASS_DIAGRAMS = [1, 2, 3].map((n) => ({ id: `clase-${n}`, name: `Fotograf\xEDa de clase ${n} \xB7 referencia sin validar`, src: `/diagrams/clase-${n}.jpg`, origin: "class_photo" }));
var emptyPractice = () => ({ version: 2, title: "Mi pr\xE1ctica INACAP", wires: [], diagram: CLASS_DIAGRAMS[0], steps: [], mode: "free", stepIndex: 0 });
var IDENTIFICATION_STEPS = [
  { terminalId: "CONTACTOR_TERMICO:95", title: "Encuentra el borne 95", explanation: "La foto muestra 95 junto a 96 en el m\xF3dulo con rel\xE9 t\xE9rmico. En el panel se representa gris NC seg\xFAn tu aclaraci\xF3n: normalmente cerrado en reposo." },
  { terminalId: "CONTACTOR_TERMICO:96", title: "Encuentra su pareja: 96", explanation: "96 est\xE1 a la derecha de 95 en la misma franja. Reconocer la pareja no equivale a unirla con un cable." },
  { terminalId: "CONTACTOR_TERMICO:97", title: "Localiza el borne 97", explanation: "97 inicia la \xFAltima fila azul de la columna derecha del m\xF3dulo t\xE9rmico; 98 est\xE1 a su derecha." },
  { terminalId: "CONTACTOR_TRIFASICO:A1", title: "Distingue A1 en el contactor trif\xE1sico", explanation: "A1 aparece en crema bajo A2. El ID del m\xF3dulo evita confundirlo con la bobina de otro dispositivo." },
  { terminalId: "BOTONERAS:S3:3", title: "Busca el borne 3 del pulsador derecho", explanation: "En el pulsador derecho, igual que en los otros dos, la columna crema 3\u20134 queda a la derecha de la columna roja 1\u20132." },
  { terminalId: "TEMPORIZADOR_1:55", title: "Reconoce 55 en el temporizador 1", explanation: "55 y 56 son el par negro a la izquierda del mecanismo. El tipo de retardo no est\xE1 confirmado." },
  { terminalId: "TEMPORIZADOR_1:68", title: "Reconoce 68 en el temporizador", explanation: "68 es el borne derecho del par azul 67\u201368 del \xFAnico temporizador." },
  { terminalId: "BORNERA_MOTOR:U2", title: "Encuentra U2 en el motor", explanation: "La fila inferior es W2, U2, V2: U2 es azul y ocupa la posici\xF3n central." },
  { terminalId: "FUENTE:TP", title: "Distingue tierra de protecci\xF3n", explanation: "TP es verde en el extremo inferior derecho de la fuente. N y TP no se unen por presunci\xF3n." }
];
export {
  BANANA_COLOR,
  CLASS_DIAGRAMS,
  CONNECTOR_PENDING,
  IDENTIFICATION_STEPS,
  emptyPractice
};
