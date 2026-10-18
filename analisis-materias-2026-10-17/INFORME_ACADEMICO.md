# Análisis académico de Materias.rar y propuesta para Estudio

Fecha de revisión: 17 de octubre de 2026. Carrera indicada por el estudiante: Automatización y Robótica, INACAP.

**Ampliación con guías prácticas:** posteriormente se revisaron cinco DOCX, correspondientes a tres guías distintas de Instrumentación. Ver [análisis de las guías](guias-instrumentacion/ANALISIS_GUIAS.md) y [mapa maestro de Estudio y modos](MAPA_MAESTRO_ESTUDIO_Y_MODOS.md), que integra todo el material recibido y propone el orden de construcción. Los recuentos de la actualización siguiente corresponden al conjunto anterior a esos cinco DOCX.

**Actualización posterior del mismo día:** se recibieron y analizaron ocho PDF de Instrumentación, con 206 páginas adicionales. El conjunto ahora suma 44 archivos y 32 PDF / 440 páginas. Ver [análisis de Instrumentación](instrumentacion/ANALISIS_INSTRUMENTACION.md) y [plan de Estudio modo.](PLAN_ESTUDIO_MODO.md). El inventario original F01–F36 conserva el alcance de Materias.rar; las nuevas fuentes usan I01–I08.

## 1. Mi evaluación del material

**Es una base muy útil para construir el entorno de aprendizaje que buscas.** Tiene una progresión desde comprender conceptos hasta montar circuitos, medir, graficar, diagnosticar y justificar decisiones. El valor principal está en esas acciones: permiten transformar la lectura de documentos en experiencias donde el estudiante observa, anticipa un resultado, actúa y explica lo ocurrido.

El archivo **no contiene todavía todos los contenidos de los seis ramos ni de la carrera completa**. Materias.rar aporta material desarrollado para cuatro asignaturas, una captura de Instrumentación y una carpeta vacía de Administración. Con los ocho PDF posteriores, también hay material desarrollado de Instrumentación: cinco asignaturas en total. Tampoco sería correcto tratar cada archivo como una clase nueva: algunos son extensiones, resúmenes, pautas o evaluaciones del mismo aprendizaje.

La organización adecuada es **ramo → unidad → clase o actividad original → pasos interactivos**. Las prácticas, guías y evaluaciones deben conservar su identidad. Podemos relacionar contenidos entre asignaturas sin reemplazarlos por una actividad única que oculte lo que falta estudiar.

Mi recomendación es comenzar con Electrónica, porque sus cinco clases forman la secuencia más clara; después incorporar el arranque estrella–triángulo manual, que aprovecha directamente el trabajo existente del panel. Matemáticas ofrece buenas experiencias visuales independientes, y Redes puede conectar después el PLC y el HMI con una simulación específica de comunicación.

## 2. Alcance y evidencia de la revisión

Se extrajeron y catalogaron **36 archivos**, conservando los originales del comprimido en `fuentes/`:

| Formato | Cantidad | Alcance |
|---|---:|---|
| PDF | 24 | 234 páginas, incluidas portadas y cierres |
| PowerPoint | 1 | 16 diapositivas, texto, notas y recursos gráficos |
| Word | 2 | Temario y prueba con respuestas |
| Excel | 1 | Rúbrica, 13 criterios y fórmula de suma |
| PNG | 5 | Capturas de la estructura de los cursos |
| TXT | 3 | Nueve enlaces de GeoGebra y un video de YouTube |

Se leyó el texto completo extraíble de los documentos, se renderizaron las 234 páginas de PDF y se revisaron visualmente mediante hojas de contacto y ampliaciones de esquemas. También se revisaron las cinco capturas completas, los contenidos de Word, las celdas de la rúbrica y las imágenes y fórmulas del PowerPoint. Los PDF con avisos de referencias internas se pudieron leer y renderizar; esos avisos no se interpretaron como ausencia de páginas.

No hay archivos idénticos por SHA-256. En especial, **`Actividad 2 (1).pdf` y `Actividad 2.pdf` son guías distintas**: motores de CC y motores de inducción, respectivamente. El nombre del archivo no basta para ordenarlas.

Se buscaron adjuntos dentro de los 24 PDF. Solo apareció un pequeño XML MathML con el símbolo Ω en F01. **No se encontraron los proyectos `Instruccional.dpa` e `Instruccional.isp` que menciona la guía de Redes**; sus iconos en el PDF no aportan aquí proyectos utilizables.

Se abrieron las nueve páginas de GeoGebra y se observó el ejercicio inicial de cada recurso. Esto permite identificar su tema, pero no equivale a auditar todas sus variantes aleatorias ni su corrección automática. Del video de YouTube se comprobó la página y su título; **no se obtuvo ni revisó su contenido audiovisual completo o una transcripción**. Los enlaces de descarga de software se trataron como referencias; no se instalaron programas ni se ejecutaron archivos aportados.

Las capacidades del proyecto se contrastaron con su código actual. No se hicieron nuevas pruebas físicas, ensayos de equipos ni validaciones de precisión del simulador. **Esta entrega es un análisis: no se modificaron las clases ni la interfaz de la aplicación.**

El [inventario comentado](INVENTARIO_COMENTADO.md) identifica los 36 archivos con enlaces y destino académico. `inventario.json` conserva metadatos, páginas, textos, notas y hashes; `texto/` y `revision-visual/` permiten rastrear las observaciones.

## 3. Qué hay por asignatura

| Asignatura | Archivos | PDF / páginas | Cobertura real |
|---|---:|---:|---|
| Electrónica Aplicada a la Automatización | 8 | 7 / 98 | Cinco clases y actividades de electrónica analógica; estructura de tres unidades en captura |
| Control de Máquinas Eléctricas Rotativas | 9 | 3 / 46 | Motores CC y CA, arranque manual, protecciones, temario, prueba y rúbrica |
| Funciones y Matrices | 14 | 11 / 34 | Funciones polinómicas y logarítmicas, modelación y enlaces formativos; faltan otras unidades |
| Redes Industriales | 4 | 3 / 56 | Fundamentos, codificación, errores, OSI y una práctica HMI–PLC |
| Instrumentación Industrial, incluida entrega posterior | 9 | 8 / 206 | Presentación, fundamentos, metrología, cuatro variables y sensores discretos; ver complemento I01–I08 |
| Administración | 0 | 0 | Carpeta vacía |

### Electrónica Aplicada a la Automatización

La carpeta se llama `electricidad`, pero sus documentos corresponden a **Electrónica Aplicada a la Automatización**. La captura F08 sitúa las clases 1 a 5, Ejercicio 1 y Guía 1 en la Unidad 1: Principios de Electrónica y Electrónica Analógica. Las unidades 2 y 3 aparecen como Electrónica Digital y Electrónica de Potencia, sin documentos desarrollados en este archivo.

| Recurso | Aprendizajes principales | Qué debe hacer el estudiante |
|---|---|---|
| Clase 1, F02 | Electrónica, señales analógicas/digitales, ruido, valor instantáneo, pico, medio y eficaz; componentes y datasheets | Clasificar ejemplos y buscar características de componentes. La tarea de fichas incluye diodos Zener y transistores |
| Clase 2, F03 | Diodo PN, polarización, curva I–V, multímetro y familias de diodos | Tarea 3: montar y medir un circuito con 1N4007. Laboratorio: comparar 1N4001 y LED, completar tablas y graficar corriente frente a tensión del diodo |
| Clase 3, F04 | BJT NPN/PNP, corte/activa/saturación, emisor/colector/base común; FET, JFET, MOSFET y potencia | Identificar la polarización de un BC337, montar el circuito a 10 V, medir tensiones y calcular corrientes |
| Clase 4, F05 | Puente H e inversión del giro; driver L293D, alimentación, entradas, salidas y habilitación | Dos prácticas independientes: puente con cuatro transistores y puente integrado. Medir y escribir una conclusión técnica breve |
| Clase 5, F06 | Amplificador operacional, entradas, alimentación, idealización, comparador, inversor/no inversor e instrumentación | Comprender la realimentación y el acondicionamiento de señales; preparar los ejercicios posteriores |
| Ajuste cero, F01 | Termopar tipo T, ganancia y desplazamiento de una señal pequeña a 0–5 V | Calcular el canal, completar tablas y plantear el montaje en Proteus para dos rangos |
| Guía 1, F07 | Cuatro ejercicios de amplificadores operacionales e instrumentación | Comparar cálculo ideal y saturación, calcular ganancia y ajuste de cero, verificar extremos del rango |

**Valor académico:** reconocer componentes no es suficiente; aquí se pide leer fichas, relacionar mediciones con modelos y explicar resultados. La interacción debe conservar tablas, unidades, condiciones de alimentación y conclusiones, además del dibujo del circuito.

Un buen enlace con Matemáticas es la calibración `salida = pendiente × entrada + desplazamiento`. El alumno puede entender visualmente por qué se amplifica una señal y por qué amplificar no elimina un desplazamiento inicial. Esta relación complementa las clases originales de ambos ramos.

**Ubicación por confirmar:** la captura muestra “Ejercicio 1”, pero no permite asegurar que ese ítem sea exactamente F01. Su contenido pertenece a acondicionamiento analógico; debe conservarse con su nombre hasta confirmar la correspondencia. F07 se llama Guía 1 en el archivo y “Actividad práctica 2” en el contenido: registrar ambos nombres.

### Control de Máquinas Eléctricas Rotativas

Es el conjunto más orientado al trabajo experimental y a la justificación técnica.

**Unidad 1: fundamentos.** F11 estudia el motor de corriente continua: partes, principio de funcionamiento y excitación serie, shunt y compound. La práctica utiliza módulos EMS de Lab-Volt, dinamómetro, instrumentos y tablas de corriente, velocidad y par. El resultado esperado es comparar curvas, no simplemente encender un motor.

F12 trata motores de inducción: estructura, campo giratorio, rotor jaula/bobinado, conexiones estrella/triángulo, inversión del giro y efectos de la carga. Incluye una experiencia con motor monofásico, devanado auxiliar, condensador e interruptor centrífugo. Se solicitan mediciones y respuestas justificadas. Las mediciones del banco deben seguir siendo mediciones del banco: no corresponde rellenarlas con resultados inventados del simulador.

**Unidad 2: control electromecánico.** F10 desarrolla el arranque **manual** estrella–triángulo en CADe_SIMU, con circuitos de mando y fuerza, contactores, pilotos, paro, sobrecarga y recuperación. Su secuencia y sus 12 instrucciones de desarrollo deben conservarse. Una versión temporizada sería una extensión identificada como tal.

La captura F17 sitúa **Protecciones en esta Unidad 2**. F14 aporta 16 diapositivas de selección de protecciones: tipos de falla, coordinación carga/protección/conductor, termomagnéticos, fusibles, conductores, guardamotor, sobretensiones y diferenciales. El ejercicio final tiene datos de motor por completar; no existe una respuesta numérica única sin esos datos. Su estructura coincide con el PDF de 16 páginas ya utilizado en Estudio; no debe duplicarse como un ramo nuevo.

**Evaluación.** F18 especifica una prueba de **70 puntos: 5 alternativas de 5 puntos y tres desarrollos de 10, 15 y 20**. F15 contiene preguntas y una resolución que requiere revisión. F16 es una **rúbrica de informe**, con 13 criterios y niveles de 6/4/1 puntos: el máximo aritmético es 78. Son instrumentos diferentes, aunque compartan EVA1. Tampoco deben mezclarse con el simulacro anterior de Protecciones del proyecto.

**Valor académico:** interpretar partes y esquemas, seleccionar instrumentos, comparar curvas, diagnosticar fallas y defender decisiones. La evaluación del informe incluye la interpretación y la conclusión; no se resuelve solo con preguntas de alternativas.

### Funciones y Matrices

El nombre de la carpeta puede confundir: **los PDF aportados se concentran en funciones y modelación; no contienen aún un desarrollo de matrices**.

La captura F28 permite reconstruir esta secuencia:

| Unidad / momento visible | Material disponible |
|---|---|
| U1 Funciones polinómicas, momento 1 | ARPA Consumo de energía y extensión; actividad tecnológica de grados 0 y 1; Servicio eléctrico |
| U1, momento 2 | ARPA Lanzamiento de una piedra y extensión; actividad tecnológica de grado 2; Sueño dorado |
| U1, momento 3 | Desabastecimiento; cinco enlaces formativos asociados a U1 |
| U2 Función exponencial y logarítmica, momento 1 | La captura menciona Eliminación de fármacos, actividad exponencial y Crecimiento de bacterias; sus PDF no están |
| U2, momento 2 | Actividad tecnológica de funciones logarítmicas, Seguidores en Instagram y cuatro enlaces formativos asociados a U2 |
| U3 Trigonometría | Solo títulos de momentos visibles; sin material desarrollado |
| U4 Sucesiones, sumatorias, vectores y matrices | Referencia a Proyecto ABPro; sin documento del proyecto ni desarrollo de la unidad |

Las actividades tecnológicas enseñan GeoGebra: ingresar funciones, calcular imágenes y preimágenes, encontrar intersecciones, ajustar puntos y leer extremos. Es importante enseñar el concepto junto con la herramienta; reproducir clics sin interpretar el gráfico no cumple el objetivo académico.

Los problemas contextualizados aportan aprendizajes distintos:

- **Consumo de energía:** reconocer cargo fijo y variable, construir una expresión e invertirla para encontrar consumo. La actividad base y su extensión usan datos distintos; no compartir la misma respuesta.
- **Servicio eléctrico:** construir y contrastar modelos, comparar tablas y expresiones y analizar diferencias. Las discrepancias entre datos y modelos forman parte de las preguntas: no deben “corregirse” automáticamente como simples errores. Los valores son datos del ejercicio, no tarifas vigentes.
- **Lanzamiento de una piedra:** reconocer una parábola, altura inicial, vértice y tiempo de vuelo; comparar con una segunda trayectoria. De la tabla de F25 se obtiene `h(t) = −5t² + 25t + 40`, con máximo de 71,25 m en 2,5 s. Son resultados calculados para el análisis, no una pauta independiente aportada.
- **Sueño dorado:** ingresos, costos, utilidad, equilibrio y extremos. Hay que explicitar el dominio válido; extrapolar un costo cuadrático indefinidamente pierde sentido en el contexto.
- **Desabastecimiento:** comparar ajustes lineal, cuadrático y cúbico y argumentar una predicción. La mejor coincidencia con puntos disponibles no garantiza la mejor predicción futura.
- **Seguidores en Instagram:** ajuste logarítmico, dominio, tasa media de crecimiento y comparación de modelos.

La captura muestra además una evaluación de polinómicas con **90 puntos y 80 minutos**. No se aportó aquí un documento completo con sus preguntas; la captura no permite reconstruir la prueba.

### Redes Industriales

F33 reúne 43 páginas sobre comunicación industrial, codificación NRZ-L, NRZ-I, Manchester y Manchester diferencial; detección de errores mediante LRC, checksum, CRC y Hamming; y las siete capas del modelo OSI. Los protocolos aparecen como ejemplos industriales: conviene diferenciar medio físico, protocolo y funciones de cada capa.

F35 es un resumen de cuatro páginas del mismo contenido con preguntas orientativas. Introduce precisiones útiles: un checksum coincidente no demuestra ausencia de errores; la corrección de errores depende del código; la forma de onda requiere una convención y, en códigos diferenciales, un estado inicial. Debe funcionar como apoyo de la clase, no como una segunda unidad independiente.

F34 propone fabricar y verificar un cable RS485 entre HMI Delta y PLC DVP-SX2, comprobar continuidad, cargar una pantalla y un programa ladder, operar marcha/paro y alterar la velocidad de comunicación para diagnosticar la pérdida del enlace. Incluye un checklist de evidencias.

**Valor académico:** conecta tres planos que deben distinguirse: continuidad del cable, configuración de comunicación y funcionamiento de la aplicación. Un botón HMI que cambia una variable dentro de la app no demuestra por sí solo una implementación de RS485.

Las unidades 2 —medios y protocolos basados en Ethernet— y 3 —implementación de redes— aparecen en F36, sin documentos desarrollados en el comprimido.

### Instrumentación Industrial y Administración

F09 permite identificar tres unidades de Instrumentación:

1. Clasificación y características de instrumentos. Aparecen conferencias y una carpeta de consulta con caudal, presión, nivel y temperatura.
2. Instrumentos de medida y actuación de variables discretas y análogas. Aparecen conferencias y guías de laboratorio 1, una versión 2026 y laboratorio 2.
3. Interpretación de diagramas de Instrumentación y Control.

En Materias.rar solo estaba la captura. **La entrega posterior I01–I08 incorpora la presentación, Conferencias 1 y 2 de fundamentos/metrología, cuatro conferencias de variables y Conferencia 2 de sensores discretos.** Su análisis está en el complemento enlazado al inicio. Todavía faltan las guías prácticas y el desarrollo completo de P&ID. El ejercicio de termopar de Electrónica y el tanque existente son buenos puentes, y se deben relacionar con las clases concretas sin sustituirlas.

La carpeta de Administración está vacía. Los ejemplos de costos e inventario de Matemáticas no son evidencia suficiente para inventar su programa académico.

## 4. Observaciones que deben resolverse antes de enseñar o corregir automáticamente

Estas observaciones distinguen contradicciones comprobables del material y aspectos que requieren revisión técnica. No invalidan el conjunto; sirven para que la adaptación sea más rigurosa.

| Prioridad | Fuente y ubicación | Hallazgo | Tratamiento propuesto |
|---|---|---|---|
| Alta | F34, pp. 2 y 4–5 | El pinout mostrado identifica pin 1 como D+ y pin 6 como D− en COM2 RS485; después el texto y un esquema asocian el pin 1 con +24 V. Además, la descripción menciona RS232 | No copiar ese cableado como solución correcta. Separar alimentación y datos; confirmar equipo y puerto exactos. El manual oficial DOP-107EG confirma la contradicción |
| Alta | F15, desarrollo 2 y respuesta | El caso plantea red 440 V, placa 440/760 V y conexión estrella; la solución responde otro caso: red 380 V, placa 220/380 V y conexión triángulo | Rehacer la pauta para el enunciado real y confirmar la identificación Δ/Y de la placa. No invertir preguntas y respuestas de forma automática |
| Alta | F15, dibujo ASCII de bornera | Las líneas dibujadas unen visualmente U1–V1–W1, contradiciendo la explicación escrita de estrella | Sustituir por un diagrama inequívoco, revisado. No convertir ese dibujo en una red de cables |
| Alta | F05, pp. 7 y 13–14 | La tabla dice 800 mA por canal para L293D; TI especifica 600 mA continuos. Lista de resistencias y valor del esquema ampliado difieren. La alimentación lógica mediante una resistencia desde 12 V necesita revisión | Fijar variante del integrado, alimentación lógica y potencia, límites y estados definidos de entradas. No trasladar el esquema literalmente al montaje físico |
| Alta | F11, pp. 6–7 | Advierte no arrancar el motor serie en vacío y luego incluye un punto de 0 Nm y retiro de acoplamiento | Aclarar con el docente el procedimiento y la carga mínima del banco. En simulación, explicar la tendencia al embalamiento sin presentar ese paso como rutina física segura |
| Media | F07, p. 7, frente a tabla y F01 | El ejercicio 4 dice 50–150 °C, pero utiliza el extremo 200 °C / 9,29 mV en la tabla y los cálculos | Confirmar el rango. Conservar un único juego de extremos y unidades para cálculo y corrección |
| Media | F12, pp. 7–8 | Tras la experiencia en triángulo aparece alimentación a 380 V sin explicitar una nueva conexión o placa del banco | Verificar el módulo concreto antes de fijar estados válidos o un montaje; no inferir una conexión por costumbre |
| Media | F12, pp. 2–3; F16, fila 20 | La clasificación de motores de inducción introduce síncronos; un criterio de monofásicos/trifásicos se evalúa con síncrono/asíncrono | Ordenar los ejes de clasificación y alinear cada criterio con lo que realmente se pregunta |
| Media | F02–F06 | Varias afirmaciones son simplificaciones: constantes de seno, saturación BJT, características ideales de AO, valores típicos LED y pinouts | Explicitar las condiciones y el modelo usado. No extender un dato de un componente a todos los de su familia |
| Media | F33 frente a F35 | La presentación simplifica sincronización, detección y corrección; algunas reglas requieren convención explícita | Usar las precisiones de F35 y revisar ejemplos antes de generar respuestas únicas |
| Editorial | F30, actividad 1 | “Aumento constante” se usa junto a datos con incrementos desiguales y una propuesta no lineal | Distinguir crecimiento sostenido de incremento constante; conservar el análisis de la tabla |
| Editorial | F12 y F18 | Encabezado de actividad 1 en una guía 2; torque escrito N/m en una tabla; “Lorenz” en el temario | Registrar títulos de portada, corregir unidades a Nm y confirmar que se refiere a la fuerza de Lorentz |

Las recomendaciones de aislamiento y otros umbrales de la resolución F15 tampoco deben convertirse en criterios universales de aprobación: faltan condiciones del equipo y referencias aplicables.

Comprobaciones externas puntuales:

- [Manual oficial Delta DOP-107EG](https://filecenter.deltaww.com/Products/download/06/060302/Manual/DELTA_IA-HMI_DOP-107EG_TC-SC-EN-TUR_20191016.pdf): COM2 en modo RS485, D+ en 1, D− en 6 y GND en 5. Esto corresponde al modelo citado en la propia figura; no es un pinout universal de conectores DB9.
- [Ficha oficial TI L293/L293D](https://www.ti.com/lit/ds/symlink/l293.pdf): 600 mA continuos para L293D, 1,2 A de pico bajo condiciones especificadas y rango recomendado de 4,5–7 V para VCC1. Diferenciar valores de operación y límites absolutos.

## 5. Qué podemos aprovechar del sistema actual

La revisión de `src/lab/model.ts`, `src/lab/dc.ts`, `src/data/simulation.ts` y `src/data/starDeltaTeaching.ts` muestra una base aprovechable: panel con redes de mando/fuerza y actividades estrella–triángulo; laboratorio con esquema, PLC, HMI, proceso de tanque y protoboard; componentes resistivos, diodos/LED, BJT, motor y L293D; mediciones eléctricas didácticas.

Eso **no equivale a disponer de un simulador completo de todas las prácticas**. El modelo DC usa aproximaciones por tramos y un BJT de tres regiones. No representa todas las características físicas de 1N4001, BC337 o 2N2222 por tener un componente genérico del mismo tipo. El inventario de protoboard no incluye operacional, condensador, MOSFET, fuente AC ni osciloscopio.

En el motor trifásico, el código asigna `speed: .55` para estrella y `speed: 1` para triángulo. Son valores de representación; **no deben enseñarse como relación física fija de velocidades, ni convertirse en rpm o mediciones de Lab-Volt**.

| Práctica o contenido | Reutilización posible | Qué falta para una experiencia fiel |
|---|---|---|
| Clasificación y lectura de fichas, F02 | Interacciones de selección e identificación | Fichas verificadas de los componentes solicitados y preguntas con condiciones claras |
| Diodo/LED, F03 | Protoboard, fuente DC, resistencia y mediciones | Guion separado de tarea y laboratorio; parámetros y límites del modelo; captura de tabla y gráfico |
| BC337, F04 | BJT y circuito resistivo DC | Parámetros identificados, pinout y estados revisados; hoja de mediciones y explicación de regiones |
| Puente H con BJT, F05 | Preset existente de puente discreto | Revisar diferencias con el esquema de clase, límites de componentes y evaluación de cada diagonal |
| L293D, F05 | Preset existente del integrado | Revisar la alimentación y límites; no asumir que el preset ya resuelve las inconsistencias de la guía |
| AO y termopar, F01/F06/F07 | Interfaz y registro de acciones | Nuevo modelo de AO/ganancia/offset/saturación; distinguir ideal de LM741 real y modelo lineal del sensor |
| Motor CC serie/shunt/compound, F11 | Controles e instrumentos como base visual | Modelo de excitación, par/corriente/velocidad y parámetros o datos identificados del banco |
| Motor de inducción y carga, F12 | Panel, fases y estados de conexión | Modelo de línea/fase, frecuencia, polos, deslizamiento y curva de carga; calibración si se buscan números |
| Motor monofásico, F12 | Presentación de estados | Modelo nuevo de devanado auxiliar, condensador e interruptor centrífugo |
| Arranque manual estrella–triángulo, F10 | Es el mejor ajuste al panel actual | Guion asociado a la guía, equivalencia de símbolos y comprobación de todos sus estados y evidencias |
| Protecciones, F14 | Lección existente y comparación conceptual | Datos de placa para el ejercicio, fichas y curvas cuando se evalúen selecciones numéricas |
| Energía, rectas y tarifas educativas | Controles visuales reutilizables | Gráfico, tabla y expresión vinculados; datos y respuestas propios de cada documento |
| Piedra y cuadráticas | Animación de trayectoria | Motor matemático simple con vértice, dominio y lectura temporal; mantener base y extensión separadas |
| Ajustes y logaritmos | Componentes de preguntas y progreso | Herramienta de gráficos/ajustes con dominio, tolerancias y explicación, no solo selección de una opción |
| Codificación y errores, F33/F35 | Marco de lecciones | Línea temporal de bits, reloj, convenciones, estado inicial e inyección controlada de errores |
| Cable y diagnóstico RS485, F34 | PLC/HMI existentes como presentación | Puertos, pinout revisado, continuidad y modelo de comunicación: baud, formato, dirección/protocolo y fallas. El HMI actual comparte memoria interna, no prueba RS485 físico |
| Instrumentación, F09 e I01–I08 | Tanque y variables como apoyo; conferencias ya analizadas | Guiones de las clases disponibles, modelos de sensor y fuentes de las guías prácticas/P&ID aún pendientes |

Una actividad puede tener tres niveles explícitos: **visualización conceptual**, **simulación calculada con modelo declarado** y **registro de mediciones físicas**. Las tres sirven para aprender, pero sus resultados no deben confundirse.

## 6. Cómo convertir cada clase en una experiencia simple

La interfaz puede mostrar únicamente el ramo, sus unidades y las clases/actividades. Al entrar en una clase se abre **un paso a la vez**, con un dibujo principal, explicación breve y una acción clara. El material original permanece consultable con su página de referencia.

Secuencia recomendada dentro de cada clase:

1. **Qué aprenderás.** Objetivo concreto y conocimientos previos que puedes repasar.
2. **Observa.** Diagrama o animación con los elementos relevantes; sin información decorativa que distraiga.
3. **Predice.** Una pregunta corta antes de manipular: qué ocurrirá y por qué.
4. **Hazlo.** Conectar, variar un valor, seleccionar una herramienta, programar o mover un punto, según esa clase.
5. **Mide y compara.** Registrar el dato con unidad, contrastarlo con la predicción y visualizar la relación.
6. **Explica.** Justificar el resultado o localizar el error; una respuesta incorrecta recibe una pista concreta y permite reintentar.
7. **Comprueba lo aprendido.** Un problema breve con menos ayuda y evidencia de los objetivos cubiertos.

El progreso debe distinguir **abierto, practicado y comprobado**. Ver un PDF o pulsar “siguiente” no demuestra dominio. Se puede permitir revisar o adelantar, mostrando con claridad qué objetivos quedan pendientes, sin bloquear innecesariamente la navegación.

Cada paso debe conservar esta trazabilidad: **archivo y página → objetivo → explicación visual → acción → evidencia → criterio de corrección**. Si una afirmación no tiene fuente o una solución está en revisión, no convertirla en una respuesta obligatoria.

### Ejemplo: Clase 2 de Electrónica

Primero identificar ánodo y cátodo y predecir qué cambia al invertir el diodo. Después variar la fuente, ubicar el voltímetro, registrar tensión del diodo y la resistencia y obtener la corriente. La gráfica se construye con los valores registrados y permite explicar la conducción en el modelo usado.

Al finalizar la explicación se abren **Tarea 3** y **Laboratorio de diodo/LED** como actividades distintas, con sus respectivos componentes y tablas. Una curva calculada con caída aproximada debe identificarse como modelo didáctico; no presentarse como curva real medida del 1N4001.

### Ejemplo: Actividad 1 de la Unidad 2 de Máquinas

Mostrar reposo, identificar mando y fuerza, seguir la orden de arranque y observar qué contactos cambian. Luego ejecutar el cambio manual a triángulo, explicar el enclavamiento, provocar la condición de sobrecarga en el modelo y recuperar el circuito. El cierre debe pedir explicar la secuencia y guardar evidencia de los estados, respetando la entrega original. La animación del giro no sustituye una medición de velocidad.

### Ejemplo: ARPA de la piedra

Conservar la tabla original. Pedir anticipar la altura máxima, ubicar puntos, ajustar la parábola y mover un control de tiempo. Mostrar que el máximo ocurre entre dos tiempos de la tabla. Después abrir la extensión como otro recurso para comparar trayectorias. Esto conserva la pregunta original y añade una explicación visual verificable.

## 7. Orden propuesto para el traspaso posterior

| Etapa | Resultado concreto | Condición de cierre |
|---|---|---|
| 1. Preparar las fuentes | Catálogo con los nombres originales, unidades confirmadas, faltantes y observaciones | Cada recurso tiene destino y las contradicciones están marcadas |
| 2. Completar Electrónica U1 | Cinco clases independientes, sus tareas y prácticas, y guías de AO/ajuste cero; desarrollar el modelo de AO necesario | Todos los objetivos y ejercicios tienen correspondencia con páginas; no se omiten por un resumen general |
| 3. Vincular Máquinas U2 | Arranque manual y Protecciones en su unidad | Estados del circuito y consignas de la guía contrastados con el simulador |
| 4. Desarrollar Matemáticas | Actividades de funciones y modelación, con sus extensiones | Tablas, gráficos, expresiones, dominios y respuestas revisados; enlaces externos identificados |
| 5. Desarrollar Redes y motores | Codificación/errores/OSI y práctica virtual HMI–PLC; modelos CC/CA para las experiencias del banco | El comportamiento mostrado corresponde al fenómeno y sus limitaciones están declaradas |
| 6. Completar cobertura | Instrumentación, Administración y unidades pendientes de los otros ramos | Se dispone del material real y se verifica que cada clase esté representada |

No hace falta esperar a tener la carrera completa para empezar. Sí hace falta que una unidad pendiente aparezca como pendiente, y que una práctica adaptada conserve su objetivo, fuente y límites.

## 8. Recursos externos encontrados

Los títulos U04/U05 de GeoGebra pertenecen a sus recursos de origen; **no reemplazan la numeración U1/U2 del curso actual**. Se inspeccionó la variante inicial visible; los valores pueden cambiar con “Nuevo ejercicio”.

| Archivo | Recurso | Contenido observado |
|---|---|---|
| F27 | [U04 PPMAT07](https://www.geogebra.org/m/QQDHQvNH) | Comparación de dos modelos afines de cobro de agua: cargo fijo, pendiente e intersección |
| F27 | [U04 PPMAT05](https://www.geogebra.org/m/BfUw2CSU) | Recta que pasa por dos puntos: gráfico y expresión algebraica |
| F27 | [U04 PPMAT06](https://www.geogebra.org/m/MztWSeeH) | Ajustar una función lineal a una tabla |
| F27 | [U04 PPMAT01](https://www.geogebra.org/m/qxb2nWSA) | Temperaturas de dos ciudades con modelos lineal y cuadrático; imágenes, preimágenes y extremos |
| F27 | [U04 PPMAT03](https://www.geogebra.org/m/hkAFJD3D) | Comparación de una evolución lineal y otra cuadrática de saldos; problema matemático con datos del ejercicio |
| F26 | [U05 PPMAT01](https://www.geogebra.org/m/YpZwUkA7) | Crecimiento exponencial de una población |
| F26 | [U05 PPMAT02](https://www.geogebra.org/m/fx2ZD7cy) | Decaimiento exponencial en un problema de masa de estroncio; modelo del ejercicio |
| F26 | [U05 PPMAT03](https://www.geogebra.org/m/swtJStNE) | Tiempo y ganancia mediante funciones logarítmicas; datos educativos de ahorro |
| F26 | [U05 PPMAT04](https://www.geogebra.org/m/CTu9cyBj) | Altura de una planta con modelo logarítmico |
| F13 | [Video de motores de inducción trifásicos](https://www.youtube.com/watch?v=MuNEI1b1F4w&t=630s) | Título y enlace identificados; contenido audiovisual completo pendiente de revisión |

Los enlaces formativos aportan también ejemplos exponenciales, aunque falten los PDF exponenciales del curso. Su disponibilidad en línea no los convierte en archivos locales ni garantiza funcionamiento sin conexión. Antes de integrarlos, revisar atribución, condiciones de uso y si conviene enlazarlos o crear una actividad propia basada en el objetivo académico.

## 9. Material pendiente identificado

- Electrónica: documentos de Electrónica Digital y Electrónica de Potencia; confirmar el recurso “Ejercicio 1”.
- Máquinas: material de Control electrónico de motores de CA y datos concretos del banco/placa para modelar prácticas numéricas.
- Matemáticas: PDF de exponenciales, eliminación de fármacos y crecimiento bacteriano; Trigonometría; sucesiones, sumatorias, vectores, matrices y ABPro. No se dispone de la prueba completa de 90 puntos.
- Redes: unidades Ethernet e implementación; proyectos HMI/PLC referidos por la guía y confirmación del montaje exacto del laboratorio.
- Instrumentación: recibidas presentación y conferencias I01–I08; pendientes guías prácticas visibles en la captura, incluida su versión 2026, y desarrollo completo de P&ID.
- Administración: contenido del ramo.

Con lo recibido se puede preparar un primer bloque de estudio sólido y bien delimitado. La adaptación debe evaluarse por **cobertura de aprendizajes y calidad de las acciones del estudiante**, no por cantidad de pantallas ni por cuántos PDF se resuman.
