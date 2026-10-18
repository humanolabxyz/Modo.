# Prácticas visuales: banco de fabricación de cable de Redes

Especificación para el plan de Estudio modo. No es una función implementada.

## Objetivo

El estudiante debe poder **hacer virtualmente la práctica y consultar la explicación mientras trabaja en clase**. La guía conserva sus materiales, operaciones, comprobaciones y entrega. El banco comparte la forma de trabajo del panel/protoboard: objetos manipulables, acercamiento a conexiones, instrumentos y un estado real del montaje dentro del modelo.

Fuente: [Redes, Guía 1](fuentes/redes%20industriales/Gu%C3%ADa%201.pdf), F34, pp. 4–8. Solicita preparar materiales, soldar al DB9, terminar en conector de tornillos, comprobar continuidad, conectar HMI/PLC, comprobar marcha/paro y analizar un cambio en la velocidad de comunicación. El pelado/estañado y las escenas de diagnóstico serán desgloses explicativos añadidos, identificados como tales; no nuevas consignas atribuidas al docente.

## Banco y elementos

- Cable y conductores individualizables, con aislamiento, extremos y pertenencia al mismo hilo. El color ayuda a seguirlos, pero no determina por sí solo la señal.
- DB9 macho con contactos seleccionables, ampliación y vistas frontal/posterior inequívocas. Al girarlo cambia la vista, no la numeración ni la identidad de sus pines.
- Conector de tornillos con terminales independientes, conductor insertado y estado de sujeción.
- Herramientas: cortador, pelacables, cautín con soporte, estaño y destornillador. Se selecciona una herramienta y se actúa sobre una pieza; debe existir alternativa mediante controles para teclado/tacto.
- Multímetro con dos puntas para comprobar recorridos y detectar conexiones indeseadas.
- HMI y PLC como segunda escena de la misma práctica, que utiliza el cable construido, sin reemplazarlo automáticamente por uno correcto.

Las dimensiones, temperaturas, tiempos, colores funcionales y ajustes que dependan de un equipo se obtendrán de referencias revisadas. No inventar un tiempo universal de soldadura ni un pinout genérico de DB9.

## Secuencia práctica

| Paso | Acción del alumno | Ayuda visual | Comprobación |
|---|---|---|---|
| 1. Preparar | Elegir piezas y herramientas de la lista | Identificación y función de cada elemento | Inventario requerido completo |
| 2. Leer el conector | Inspeccionar sus dos caras y localizar un pin | Número, orientación y función según la referencia seleccionada | Identifica el mismo contacto desde ambas vistas |
| 3. Preparar el cable | Cortar/preparar cubierta y extremos, reconocer conductores | Acercamiento por etapas; aislamiento y conductor diferenciados | Extremo disponible para unir; conservar continuidad del hilo |
| 4. Ubicar | Llevar un conductor al contacto indicado | Vista ampliada y guía opcional del recorrido | Destino y conductor corresponden al esquema revisado |
| 5. Soldar | Aplicar herramienta y estaño sobre la unión elegida | Sección explicativa de contacto/unión y comparación de situaciones | Se crea una unión en el modelo; no se aprueba por animación o apariencia aislada |
| 6. Terminar | Insertar y sujetar el otro extremo | Bornes ampliados y recorrido identificable | Conexión al terminal correcto, sin unir terminales vecinos |
| 7. Medir | Colocar puntas, comprobar cada hilo y pares que deben estar aislados | Instrumento y recorrido resaltado después de la predicción | Resultado calculado desde conexiones y defectos presentes |
| 8. Diagnosticar | Encontrar y corregir circuito abierto, pin equivocado o puente no deseado | Pistas graduales, sin corregir el cable automáticamente | Tras la reparación cambian las mediciones de forma coherente |
| 9. Probar el enlace | Usar el cable en la escena HMI–PLC y probar marcha/paro | Recorrido de mensaje, salida y estado del enlace | La función depende del cable y de la configuración declarada |
| 10. Investigar | Cambiar un parámetro de comunicación y explicar el efecto | Comparación de configuración entre equipos y resultado | Distingue continuidad eléctrica de comunicación correcta |

El orden de operaciones se puede consultar en una lista. Cada paso tiene una demostración reproducible y una acción del estudiante, con explicación del resultado. Se puede acercar, repetir, deshacer o volver al montaje. La interfaz mantiene una escena principal y muestra la herramienta pertinente al paso, sin llenar la pantalla de ventanas.

## Estado y comportamiento del montaje

Un cable dibujado no implica continuidad. Se necesita representar:

- Piezas y contactos con identidad estable: conector, terminal, conductor, extremo y unión.
- Extremos preparados o aislados, conductor íntegro o interrumpido, unión estable/abierta/intermitente y puentes no deseados.
- Conexiones efectivas entre contactos para que el multímetro consulte el montaje construido. Unir un pin equivocado puede dar continuidad y seguir siendo un cable incorrecto: se compara el recorrido, no solo un pitido.
- Fallas didácticas de soldadura como estados del modelo, con sus efectos. Una unión intermitente debe tener un escenario controlado para poder explicarla y repetirla. No afirmar que brillo/color de una unión bastan para determinar su calidad física.
- Estado de comunicación separado: interfaz, equipos, parámetros y correspondencia de señales. La memoria compartida del HMI/PLC actual no representa por sí sola una comunicación RS485.

La fabricación y la comprobación del cable constituyen la primera versión verificable. El enlace funcional se incorpora después con su modelo, sin mostrar éxito ficticio porque el estudiante terminó una animación.

## Revisión de la fuente

F34 tiene una contradicción entre pinout de comunicación y una indicación de +24 V, además de menciones mezcladas a RS232 y RS485. Está documentada en el análisis general, con el manual del modelo de HMI mostrado. La práctica usará una referencia concreta y corregida, con alimentación y datos distinguidos. La referencia del PLC y los proyectos originales de prueba también deben resolverse antes de afirmar equivalencia exacta con la maqueta del curso.

Esto permite construir piezas, operaciones y topología desde el comienzo. Los mapeos que aún no tengan evidencia permanecerán pendientes y no se aprobarán arbitrariamente.

## Tres formas de utilizarlo

1. **Aprender:** demostración breve, resaltado opcional, pregunta y acción con explicación inmediata.
2. **Acompañar la clase:** consultar un paso o acercamiento y registrar comprobaciones del trabajo físico. El avance virtual no certifica el montaje real; conservar la revisión docente de la guía.
3. **Practicar:** repetir sin conexiones resaltadas, diagnosticar fallas y guardar resultados.

La simulación entrena procedimiento, comprensión y diagnóstico; no mide destreza manual real ni sustituye la supervisión del trabajo de soldadura.

## Evidencia de aprendizaje y verificación

Guardar el montaje, correspondencia de contactos, mediciones, correcciones y breve explicación de la falla. La bitácora ayuda a revisar qué hizo el estudiante y a continuar su trabajo; no sustituye las evidencias físicas exigidas por el docente.

Casos mínimos de comprobación del banco: cable correcto; hilo abierto; unión al pin equivocado; puente entre contactos vecinos; extremo todavía aislado; unión intermitente; continuidad correcta pero parámetros de comunicación incompatibles; vuelta al montaje tras reparar; recarga con progreso; uso móvil y con teclado. Las pruebas se ejecutarán cuando exista implementación.

## Aplicación al resto de guías

Para cada guía se construirá una ficha con **materiales, herramientas, operaciones, variables, mediciones, errores posibles, resultado y evidencia**. Se reutilizarán las herramientas existentes cuando su modelo corresponda. Montar una protoboard, cablear un sensor, comprobar un motor o calibrar un canal conservará su operación específica; no se reducirá toda práctica al mismo cuestionario.
