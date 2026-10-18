// Lección guiada por tarjetas. Cada tema alterna explicación corta, analogía e
// interacciones con respuesta inmediata. Las cifras y reglas provienen del
// material docente (láminas indicadas) o de ejemplos marcados como supuestos.
export type Learn = {
  kind: "learn";
  title: string;
  body: string[];
  analogy?: string;
  revealHint?: string;
  reveal?: { label: string; text: string }[];
  takeaway?: string;
};
export type Choice = { kind: "choice"; title: string; question: string; options: string[]; correct: number; explain: string };
export type Sort = { kind: "sort"; title: string; question: string; buckets: [string, string]; items: { text: string; bucket: 0 | 1 }[]; explain: string };
export type Match = { kind: "match"; title: string; question: string; pairs: [string, string][]; explain: string };
export type Order = { kind: "order"; title: string; question: string; steps: string[]; explain: string };
export type NumberQ = { kind: "number"; title: string; question: string; given?: string; answer: number; unit: string; tol?: number; explain: string };
export type Card = Learn | Choice | Sort | Match | Order | NumberQ;

export const lessonCards: Record<string, Card[]> = {
  "objetivos-fallas": [
    {
      kind: "learn", title: "Una tubería para entender la corriente",
      body: ["Imagina el conductor como una tubería y la corriente como el agua que pasa por ella.", "Si la carga exige más agua de la normal, la tubería trabaja de más y se calienta con el tiempo. Eso es una sobrecarga.", "Si se abre un atajo sin ninguna resistencia, el agua sale disparada por ahí. Eso es un cortocircuito."],
      analogy: "Sobrecarga = demasiada demanda por el mismo camino. Cortocircuito = un atajo de muy baja impedancia.",
      revealHint: "Toca cada falla para ver su definición",
      reveal: [
        { label: "Sobrecarga", text: "La corriente supera la normal de funcionamiento y el conductor se recalienta si la condición dura." },
        { label: "Cortocircuito", text: "Aparece un camino de muy baja impedancia (por ejemplo, por pérdida de aislación) y la corriente de falla puede ser muy elevada." },
      ],
      takeaway: "Para distinguirlas, pregunta por la causa: ¿la carga exige más, o apareció un atajo?",
    },
    {
      kind: "sort", title: "Clasifica cada situación", question: "¿Qué falla describe cada situación?",
      buckets: ["Sobrecarga", "Cortocircuito"],
      items: [
        { text: "Un motor arrastra una carga más pesada de lo normal durante varios minutos.", bucket: 0 },
        { text: "Se pierde la aislación y dos partes conductoras quedan unidas por un camino de muy baja impedancia.", bucket: 1 },
        { text: "Se conectan demasiados equipos al mismo circuito y la corriente supera la normal.", bucket: 0 },
        { text: "Una falla provoca arco eléctrico y esfuerzos magnéticos dentro del tablero.", bucket: 1 },
      ],
      explain: "En la sobrecarga cambia la demanda de la carga; en el cortocircuito cambia el camino por donde circula la corriente.",
    },
    {
      kind: "learn", title: "Por qué una falla puede destruir un tablero",
      body: ["La lámina 4 distingue tres efectos de un cortocircuito. Descúbrelos uno por uno.", "Por eso la protección debe interrumpir la falla a tiempo, no solo avisar."],
      revealHint: "Toca cada efecto",
      reveal: [
        { label: "Arco eléctrico", text: "Puede quemar los materiales que están en su trayectoria." },
        { label: "Calor", text: "Deteriora los conductores y su aislación." },
        { label: "Esfuerzos magnéticos", text: "Fuerzas que pueden deformar conductores y barras." },
      ],
      takeaway: "Los objetivos de la protección: cuidar a las personas, evitar daños en la instalación y conservar el servicio donde sea posible.",
    },
    {
      kind: "choice", title: "¿Alcanza con saber que se calentó?", question: "Un conductor se calentó. ¿Puedes decir ya qué falla ocurrió?",
      options: ["Sí, fue una sobrecarga", "Sí, fue un cortocircuito", "No: ambas fallas producen calor; hay que averiguar la causa"], correct: 2,
      explain: "El calor aparece en las dos. Lo que las distingue es la causa de la corriente: demanda excesiva o camino de baja impedancia.",
    },
    {
      kind: "choice", title: "Cierra la idea", question: "¿Cuáles son los tres objetivos de una protección eléctrica?",
      options: ["Cuidar personas, evitar daños en la instalación y conservar el servicio si es posible", "Ahorrar energía, reducir costos y hacer partir motores", "Subir la corriente, aislar el equipo y evitar mantenciones"], correct: 0,
      explain: "Personas, instalación y continuidad del servicio: esos son los tres objetivos que presenta el docente.",
    },
  ],
  coordinacion: [
    {
      kind: "learn", title: "Una escalera de tres peldaños",
      body: ["Para que el cable quede protegido, tres corrientes deben estar ordenadas de menor a mayor: In ≤ Ip ≤ Iz.", "La protección debe admitir lo que consume la carga, pero no debe ser mayor que lo que el cable soporta."],
      analogy: "Es como un ascensor: no debe cargar menos que las personas que suben, ni más que lo que aguantan sus cables.",
      revealHint: "Toca cada letra",
      reveal: [
        { label: "In", text: "Corriente de la carga: lo que el equipo necesita para funcionar (en esta presentación)." },
        { label: "Ip", text: "Corriente nominal de la protección: el valor del interruptor o fusible elegido." },
        { label: "Iz", text: "Capacidad corregida del cable: lo que soporta tras aplicar las correcciones de instalación." },
      ],
      takeaway: "Dos preguntas distintas: ¿la protección admite la carga? (In ≤ Ip) y ¿respeta al cable? (Ip ≤ Iz).",
    },
    {
      kind: "match", title: "Une cada símbolo con su significado", question: "Toca un símbolo y luego su significado.",
      pairs: [["In", "Corriente que consume la carga"], ["Ip", "Corriente nominal de la protección"], ["Iz", "Capacidad corregida del cable"], ["Icc", "Corriente de cortocircuito prevista"]],
      explain: "Conserva siempre la definición de cada símbolo. En notación IEC suele escribirse Ib ≤ In ≤ Iz (lámina 6): cambia el símbolo, no el criterio.",
    },
    {
      kind: "learn", title: "Un ejemplo resuelto: 18 A, 20 A, 25 A",
      body: ["Valores de la lámina 6: carga In = 18 A, protección Ip = 20 A y cable Iz = 25 A. Revela cada comprobación."],
      revealHint: "Toca cada paso",
      reveal: [
        { label: "1 · ¿In ≤ Ip?", text: "18 ≤ 20: la protección admite la carga." },
        { label: "2 · ¿Ip ≤ Iz?", text: "20 ≤ 25: la protección no supera la capacidad del cable." },
        { label: "3 · Conclusión", text: "Cumple las dos condiciones: 18 ≤ 20 ≤ 25. Si subieras Ip a 32 A, fallaría 32 ≤ 25." },
      ],
      takeaway: "Subir los amperes del interruptor puede resolver una condición y romper la otra.",
    },
    {
      kind: "choice", title: "Elige la protección", question: "La carga es In = 18 A y el cable tiene Iz = 25 A. ¿Qué nominal Ip cumple In ≤ Ip ≤ Iz?",
      options: ["Ip = 16 A", "Ip = 20 A", "Ip = 32 A"], correct: 1,
      explain: "16 A es menor que la carga (falla In ≤ Ip) y 32 A supera al cable (falla Ip ≤ Iz). Solo 20 A queda entre 18 A y 25 A.",
    },
    {
      kind: "choice", title: "¿Ya terminó la selección?", question: "La desigualdad se cumple. ¿Está aprobada toda la instalación?",
      options: ["Sí, la desigualdad es suficiente", "No: faltan poder de corte, disparo y energía pasante", "Solo falta elegir el color del interruptor"], correct: 1,
      explain: "La coordinación de corrientes es solo una parte: aún hay que comprobar el poder de corte frente a Icc, la actuación y la energía pasante.",
    },
  ],
  termomagnetico: [
    {
      kind: "learn", title: "Dos guardias en un solo aparato",
      body: ["El interruptor termomagnético reúne dos mecanismos que vigilan fallas distintas.", "El térmico es paciente: reacciona al calentamiento sostenido. El magnético es un reflejo: actúa ante una corriente muy elevada."],
      analogy: "El térmico es como notar que la olla lleva mucho rato al fuego; el magnético, como soltarla al instante si salta una llama.",
      revealHint: "Toca cada mecanismo",
      reveal: [
        { label: "Térmico", text: "Responde al calentamiento asociado a una sobrecarga." },
        { label: "Magnético", text: "Responde a una corriente suficientemente elevada, asociada al cortocircuito." },
      ],
      takeaway: "Térmico → sobrecarga. Magnético → cortocircuito.",
    },
    {
      kind: "match", title: "Une cada concepto", question: "Toca un concepto y luego lo que significa.",
      pairs: [["Térmico", "Responde a la sobrecarga"], ["Magnético", "Responde al cortocircuito"], ["Curva B, C o D", "Banda del umbral magnético en múltiplos de la nominal"], ["Poder de corte", "Capacidad de interrumpir la corriente de falla prevista"]],
      explain: "El poder de corte es un dato distinto de la nominal: debe cubrir la corriente de cortocircuito prevista.",
    },
    {
      kind: "learn", title: "Las curvas B, C y D",
      body: ["La letra indica cuántas veces la nominal debe circular para que actúe el magnético. Para convertirla a amperes, multiplica por la nominal."],
      revealHint: "Toca cada curva",
      reveal: [
        { label: "Curva B", text: "3–5 veces la nominal. Orientada a cargas resistivas." },
        { label: "Curva C", text: "5–10 veces la nominal. Uso general. Con 16 A: 80–160 A." },
        { label: "Curva D", text: "10–20 veces la nominal. Pensada para arranques altos." },
      ],
      takeaway: "Son bandas del umbral magnético, no tiempos de disparo.",
    },
    {
      kind: "number", title: "Calcula una banda", question: "Un interruptor curva B tiene nominal de 10 A. ¿Cuál es el límite inferior de su banda magnética?",
      given: "Curva B: 3–5 veces la nominal (lámina 8).", answer: 30, unit: "A",
      explain: "3 × 10 A = 30 A. El límite superior sería 5 × 10 A = 50 A. La banda es 30–50 A.",
    },
    {
      kind: "choice", title: "¿La curva D es siempre mejor?", question: "Alguien dice: «con curva D protejo mejor cualquier motor». ¿Qué respondes?",
      options: ["Tiene razón: más alto es más seguro", "No: hay que justificar el arranque y verificar la desconexión y el poder de corte", "La letra no importa"], correct: 1,
      explain: "Una banda más alta no es «mejor» en todos los casos: puede dejar de proteger al conductor si no se verifican las condiciones de desconexión.",
    },
  ],
  fusibles: [
    {
      kind: "learn", title: "El eslabón débil, a propósito",
      body: ["Un fusible protege porque su elemento se funde y abre el circuito cuando la sobrecorriente es demasiado grande.", "En la placa vienen tres datos que responden tres preguntas diferentes. No los confundas."],
      analogy: "Como la cadena que se corta por el eslabón más débil, antes de que se dañe todo lo demás.",
      revealHint: "Toca cada dato de la placa",
      reveal: [
        { label: "50 A", text: "Corriente nominal: la referencia de uso." },
        { label: "700 V CA/CC", text: "Dato de tensión del ejemplo, con su tipo de corriente." },
        { label: "200 kA", text: "Capacidad de ruptura: la falla máxima que puede interrumpir." },
      ],
      takeaway: "Nominal, tensión y ruptura no son intercambiables.",
    },
    {
      kind: "match", title: "Lee la placa", question: "Une cada dato con lo que representa.",
      pairs: [["50 A", "Corriente nominal"], ["700 V CA/CC", "Tensión"], ["200 kA", "Capacidad de ruptura"], ["aR o gR", "Clases mencionadas para semiconductores"]],
      explain: "Placa textual de la lámina 10. gG se menciona para conductores; aR y gR, para semiconductores.",
    },
    {
      kind: "learn", title: "La forma no define la función",
      body: ["Que sea de vidrio o de cerámica, o que se vea rápido o lento, no basta para elegirlo. La función se confirma en la ficha técnica.", "Compara cada dato de la placa con el dato equivalente de tu circuito."],
      revealHint: "Toca cada comparación",
      reveal: [
        { label: "Tensión", text: "La tensión del circuito debe estar cubierta por la tensión del fusible (y su tipo CA o CC)." },
        { label: "Ruptura", text: "La capacidad de ruptura debe cubrir la corriente de cortocircuito prevista (Icc)." },
        { label: "Clase", text: "Elige la clase según el equipo que protegerás y confírmala en la ficha." },
      ],
      takeaway: "Que el fusible quepa en el portafusible no significa que sirva.",
    },
    {
      kind: "choice", title: "Evalúa un candidato", question: "Circuito de 400 V CA con Icc = 10 kA. Placa: 50 A · 700 V CA/CC · 200 kA. ¿Qué comparaciones de tensión y ruptura se cumplen?",
      options: ["Ninguna", "Ambas: 700 V ≥ 400 V y 200 kA ≥ 10 kA", "Solo la tensión"], correct: 1,
      explain: "Ambas se cumplen, suponiendo que esas capacidades estén declaradas para CA. Aún faltan la clase, la nominal frente a la carga y la energía pasante.",
    },
    {
      kind: "choice", title: "Corrige una idea equivocada", question: "Un compañero dice: «200 kA es la corriente que consume el equipo». ¿Qué le respondes?",
      options: ["Es la capacidad de ruptura; la nominal del ejemplo es 50 A", "Tiene razón, es la corriente de trabajo", "Es la tensión máxima"], correct: 0,
      explain: "200 kA es capacidad de ruptura: se compara con la corriente de falla prevista, no con la corriente que consume el equipo.",
    },
  ],
  conductores: [
    {
      kind: "learn", title: "Una autopista con restricciones",
      body: ["La tabla indica cuánta corriente soporta un cable en condiciones ideales. Pero el calor y los cables agrupados le restan capacidad.", "Por eso se corrige: Iz = Itabla × fT × fG."],
      analogy: "Como una autopista que admite 100 autos, pero con lluvia y obras solo deja pasar una parte.",
      revealHint: "Toca cada término",
      reveal: [
        { label: "Itabla", text: "Capacidad tabulada del cable según su material, aislación y forma de instalación." },
        { label: "fT", text: "Factor de temperatura: un multiplicador sin unidad." },
        { label: "fG", text: "Factor de agrupamiento: otro multiplicador sin unidad." },
      ],
      takeaway: "Los factores se multiplican; no se suman ni son amperes.",
    },
    {
      kind: "number", title: "Calcula Iz", question: "Calcula la capacidad corregida del cable.",
      given: "Ejemplo de la lámina 12: Itabla = 30 A · fT = 0,9 · fG = 0,8.", answer: 21.6, unit: "A",
      explain: "0,9 × 0,8 = 0,72 y 30 × 0,72 = 21,6 A. Con el calor y el agrupamiento, el cable de 30 A queda utilizable hasta 21,6 A.",
    },
    {
      kind: "learn", title: "Tres comprobaciones, no una",
      body: ["Que la corriente sea aceptable no resuelve todo el cable. Hay tres comprobaciones separadas."],
      revealHint: "Toca cada comprobación",
      reveal: [
        { label: "Corriente", text: "Capacidad corregida Iz frente a la carga y a la protección." },
        { label: "Caída de tensión", text: "Depende de la longitud y la carga. En el ejemplo de la lámina 12, 2 % calculado frente a 3 % adoptado." },
        { label: "Cortocircuito", text: "El cable debe soportar la energía de la falla hasta que actúe la protección: I²t ≤ k²S²." },
      ],
      takeaway: "Un resultado favorable no reemplaza a las otras dos comprobaciones.",
    },
    {
      kind: "choice", title: "Encuentra el error", question: "Un compañero calcula Iz = 30 + 0,85 + 1 = 31,85 A (Itabla = 30 A, fT = 0,85, fG = 1). ¿Cuál es el error?",
      options: ["Debió restar los factores", "Los factores se multiplican: Iz = 30 × 0,85 × 1 = 25,5 A", "No hay error"], correct: 1,
      explain: "fT y fG son multiplicadores sin unidad. Sumarlos mezcla magnitudes distintas y entrega un valor mayor que la capacidad tabulada.",
    },
    {
      kind: "choice", title: "Aplica la coordinación", question: "Iz = 21,6 A y se propone una protección de Ip = 25 A. ¿Qué ocurre?",
      options: ["Cumple, porque 25 A es menor que los 30 A de la tabla", "Falla Ip ≤ Iz: la protección supera la capacidad corregida del cable", "Cumple, porque 25 A es mayor que la carga"], correct: 1,
      explain: "Se coordina con la capacidad corregida (21,6 A), no con la tabulada. 25 A supera 21,6 A.",
    },
  ],
  guardamotor: [
    {
      kind: "learn", title: "Elegir rango y ajustar son dos decisiones",
      body: ["El guardamotor protege al motor y se ajusta con la corriente de su placa.", "Primero eliges un aparato cuyo rango incluya esa corriente. Después fijas el ajuste dentro de ese rango."],
      analogy: "Como comprar calzado: el rango son las tallas que existen; el ajuste es tu talla exacta.",
      revealHint: "Toca cada concepto",
      reveal: [
        { label: "Corriente de placa", text: "Corriente nominal declarada del motor, con su tensión y conexión." },
        { label: "Rango térmico", text: "Intervalo en el que se puede ajustar el aparato. Debe incluir la corriente de placa." },
        { label: "Ajuste", text: "Valor elegido dentro del rango, según las instrucciones del fabricante." },
      ],
      takeaway: "El extremo del rango no es la corriente del motor.",
    },
    {
      kind: "order", title: "Ordena el procedimiento", question: "Ordena los pasos para seleccionar un guardamotor.",
      steps: ["Leer la corriente nominal, la tensión y la conexión de la placa del motor", "Elegir un rango térmico que incluya esa corriente", "Ajustar el valor térmico según el fabricante", "Comprobar arranque, umbral magnético y poder de corte"],
      explain: "Primero la placa, luego el rango, luego el ajuste y, al final, las comprobaciones que el dial no resuelve.",
    },
    {
      kind: "learn", title: "Un ejemplo con 6,3 A",
      body: ["Placa ficticia: 6,3 A. Candidatos hipotéticos: rangos 4–6 A y 6–10 A."],
      revealHint: "Toca cada paso",
      reveal: [
        { label: "Rango 4–6 A", text: "6,3 supera el máximo de 6 A: no sirve." },
        { label: "Rango 6–10 A", text: "6 ≤ 6,3 ≤ 10: sí incluye la corriente de placa." },
        { label: "Ajuste", text: "En el ejercicio se ajusta a 6,3 A, no a 10 A. Si ajustaras 8 A, estarías dentro del rango pero lejos de la placa." },
      ],
      takeaway: "Rango compatible no significa ajuste correcto.",
    },
    {
      kind: "choice", title: "Elige el rango", question: "Placa del motor: 6,3 A (datos ficticios). ¿Qué rango térmico incluye ese valor?",
      options: ["4–6 A", "6–10 A", "10–16 A"], correct: 1,
      explain: "Solo 6–10 A cumple 6 ≤ 6,3 ≤ 10. 4–6 A queda corto y 10–16 A empieza por encima de 6,3 A.",
    },
    {
      kind: "choice", title: "¿Para qué sirve el contactor?", question: "Para tener mando remoto, el guardamotor suele combinarse con…",
      options: ["Un SPD", "Un contactor", "Un fusible de vidrio"], correct: 1,
      explain: "El guardamotor protege; el contactor aporta el mando remoto. Son funciones distintas.",
    },
  ],
  "tierra-sobretension": [
    {
      kind: "learn", title: "Un pico no es una gotera",
      body: ["Dos problemas distintos, dos dispositivos distintos. Una sobretensión es una elevación breve de la tensión; una fuga es corriente que se va por un camino que no debía.", "El SPD recorta el pico. El diferencial vigila que la corriente que sale sea la que vuelve."],
      analogy: "El SPD es como una válvula de alivio que deja escapar el exceso de presión; el diferencial es como un contador que detecta una gotera.",
      revealHint: "Toca cada dispositivo",
      reveal: [
        { label: "SPD", text: "Limita las sobretensiones transitorias y deriva su corriente." },
        { label: "Diferencial (RCD)", text: "Detecta el desequilibrio entre la corriente de ida y la de vuelta provocado por una fuga." },
      ],
      takeaway: "Estar los dos en el tablero no los hace intercambiables.",
    },
    {
      kind: "match", title: "Une dispositivo y función", question: "Toca un elemento y luego lo que hace.",
      pairs: [["SPD", "Limita sobretensiones transitorias"], ["Diferencial RCD", "Detecta desequilibrio por fuga"], ["Termomagnético", "Protege frente a sobrecorriente"], ["≤ 30 mA", "Sensibilidad habitual para protección adicional de personas"]],
      explain: "Cada uno responde a una condición diferente. El 30 mA es una referencia habitual bajo IEC, no una garantía absoluta.",
    },
    {
      kind: "learn", title: "Cómo se calcula una fuga",
      body: ["Compara la corriente de ida con la de vuelta y convierte la diferencia a miliamperes."],
      revealHint: "Toca cada paso",
      reveal: [
        { label: "1 · Resta", text: "|10 − 9,97| = 0,03 A (ambas en amperes)." },
        { label: "2 · Convierte", text: "1 A = 1000 mA, así que 0,03 A × 1000 = 30 mA." },
        { label: "3 · Interpreta", text: "Es un desequilibrio por fuga: corresponde a la función diferencial." },
      ],
      takeaway: "Revisa siempre la unidad: no son 30 A ni 0,03 mA.",
    },
    {
      kind: "number", title: "Calcula tú", question: "Salen 8 A y vuelven 7,98 A. ¿Cuántos miliamperes de desequilibrio hay?",
      given: "Datos supuestos para comprender la función (lámina 14).", answer: 20, unit: "mA",
      explain: "|8 − 7,98| = 0,02 A y 0,02 × 1000 = 20 mA. No determina por sí solo el tiempo de disparo.",
    },
    {
      kind: "choice", title: "¿Reemplaza al termomagnético?", question: "¿Un diferencial puede reemplazar a la protección contra sobrecorriente?",
      options: ["Sí, si es de 30 mA", "No: cumple una función distinta", "Sí, en todas las instalaciones"], correct: 1,
      explain: "Detecta fuga, no limita la sobrecorriente. Ambas protecciones se complementan.",
    },
  ],
  "motor-trifasico": [
    {
      kind: "learn", title: "Lo que entrega vs. lo que toma de la red",
      body: ["La potencia de un motor suele indicarse como la que entrega en el eje (mecánica de salida). Para entregarla, el motor toma más de la red porque tiene pérdidas.", "Por eso la fórmula divide por el rendimiento (η) y por el factor de potencia (cosφ)."],
      analogy: "Es como pedir un jugo de 1 litro: necesitas más fruta de la que sale en el vaso, porque algo se pierde.",
      revealHint: "Toca cada dato",
      reveal: [
        { label: "Psalida", text: "Potencia mecánica de salida. Va en watts (5,5 kW = 5500 W)." },
        { label: "VLL", text: "Tensión entre líneas, en volts." },
        { label: "η y cosφ", text: "Rendimiento y factor de potencia: fracciones sin unidad (0,88 y 0,83, no 88 y 83)." },
      ],
      takeaway: "In = Psalida / (√3 VLL η cosφ)",
    },
    {
      kind: "order", title: "Ordena el cálculo", question: "Ordena los pasos para calcular la corriente.",
      steps: ["Convertir la potencia de kW a W", "Calcular √3 × VLL × η × cosφ", "Dividir la potencia entre ese producto", "Comparar el resultado con la corriente de placa"],
      explain: "Primero unidades, luego el denominador, luego la división y, por último, la comparación con la placa.",
    },
    {
      kind: "learn", title: "Ejemplo: motor de 5,5 kW (supuesto)",
      body: ["Datos supuestos para practicar: Psalida = 5,5 kW, VLL = 400 V, η = 0,88 y cosφ = 0,83."],
      revealHint: "Toca cada paso",
      reveal: [
        { label: "1 · Potencia", text: "5,5 × 1000 = 5500 W." },
        { label: "2 · Denominador", text: "√3 × 400 × 0,88 × 0,83 ≈ 506,04." },
        { label: "3 · División", text: "5500 / 506,04 ≈ 10,87 A." },
      ],
      takeaway: "Con la corriente aún faltan arranque, Icc y datos del conductor para seleccionar.",
    },
    {
      kind: "choice", title: "Predice antes de calcular", question: "Si el rendimiento baja de 0,88 a 0,80 y lo demás no cambia, la corriente calculada…",
      options: ["Baja", "Sube", "Queda igual"], correct: 1,
      explain: "Al bajar η disminuye el denominador y el cociente aumenta: para entregar la misma potencia el motor toma más corriente (≈ 11,96 A).",
    },
    {
      kind: "number", title: "Ahora tú", question: "Calcula la corriente del motor.",
      given: "Datos supuestos: 7,5 kW de salida · 400 V entre líneas · η = 0,9 · cosφ = 0,85.", answer: 14.15, unit: "A", tol: 0.05,
      explain: "7500 / (√3 × 400 × 0,9 × 0,85) ≈ 7500 / 530,0 ≈ 14,15 A. Compara con la placa antes de seleccionar protecciones.",
    },
  ],
};
