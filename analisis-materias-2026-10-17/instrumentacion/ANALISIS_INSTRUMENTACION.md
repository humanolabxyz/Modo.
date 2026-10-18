# Instrumentación Industrial: análisis de las ocho fuentes

Revisión: 17 de octubre de 2026. Complemento de [Materias.rar](../INFORME_ACADEMICO.md). Alcance: análisis y planificación; no se cambió la aplicación.

## Resultado

Los ocho PDF aportan **206 páginas**. Con el archivo anterior, el conjunto recibido suma **44 archivos, de los cuales 32 son PDF con 440 páginas**. Los originales se copiaron a `fuentes/` sin cambios; se extrajo el texto y se renderizaron las 206 páginas para revisar diagramas, fórmulas y tablas. `inventario.json` conserva los hashes y las páginas; `revision-visual/` contiene las imágenes.

Ahora hay material desarrollado de Instrumentación, además de Electrónica, Máquinas, Matemáticas y Redes. **Administración continúa sin archivos.**

La aportación es especialmente buena para aprender a relacionar **proceso físico → sensor → señal → decisión → actuador**. También introduce una competencia que debe mantenerse en todo Estudio: una lectura estable puede estar equivocada, y seleccionar un instrumento exige justificar su rango, principio de medida y condiciones de uso.

No son ocho clases consecutivas equivalentes: hay una presentación administrativa, seis conferencias sobre fundamentos/variables y otra conferencia de sensores discretos. **Los dos archivos llamados Conferencia 2 son distintos y deben conservarse.**

## 1. Programa que confirman los documentos

La presentación I01 define una asignatura presencial y práctica, orientada a utilizar e instalar instrumentación analógica/digital y diseñar e interpretar planos, considerando trabajo colaborativo y comunicación.

| Unidad | Horas indicadas | Resultado visible |
|---|---:|---|
| U1. Clasificación y características de instrumentos | 16 | Clasificar según características técnicas, variable y funcionalidad |
| U2. Instrumentos de medida y actuación de variables discretas y análogas | 36 | Seleccionar instrumentos discretos y analógicos según el proceso |
| U3. Interpretación de diagramas de Instrumentación y Control | 20 | Reconocer variables, instrumentos y lazos en planos P&ID |
| Total | **72** | Suma de las horas de las tres unidades; no es una estimación de duración de la futura app |

La evaluación anunciada distribuye **15 %, 20 %, 35 % y 30 %**, mediante laboratorio/taller y escala de apreciación. Las fechas aparecen por definir. Estos porcentajes describen el documento docente; las prácticas de modo. no serán notas oficiales ni un reemplazo de esas evaluaciones. No se trasladarán automáticamente a la interfaz las condiciones administrativas de asistencia de una diapositiva.

La captura anterior F09 sitúa Conferencias 1 y 2 y una carpeta de consulta de variables en U1, y Conferencia 2 de sensores discretos en U2. Es la referencia para el orden. Las conferencias 3–6 deben figurar como recursos de consulta con su identidad, no renumerarse como nuevas clases de U2 solo por su tema.

## 2. Análisis por archivo

### I01. Presentación de la Asignatura — 13 páginas

[Fuente](fuentes/Presentaci%C3%B3n%20de%20la%20Asignatura%20%281%29.pdf)

Contiene presentación del curso, canales institucionales, ubicación curricular, propósito, unidades, horas, esquema evaluativo y bibliografía. Las páginas 4 y 6 son imágenes de malla y condiciones administrativas: fueron revisadas visualmente, aunque no aporten texto extraíble.

**Uso en modo.:** una introducción breve del ramo, objetivos y mapa de unidades. La bibliografía permanece como referencia. No convertir la presentación completa en una clase obligatoria con preguntas sobre contactos o normas administrativas.

### I02. Conferencia 1 — 38 páginas

[Fuente](fuentes/Conf.%201%20%281%29.pdf)

Explica automatización, sus elementos físicos y conocimientos teóricos, beneficios, ciclo sensar/decidir/actuar y lazo de control. Distingue referencia, error, señal de control, variable manipulada, variable controlada, medición y perturbación. Clasifica instrumentos por función y por variable. Incluye ejemplos reales y **Tarea 1: buscar instrumentos y clasificarlos por su funcionalidad**. Advierte acertadamente que un instrumento puede pertenecer a varias categorías.

| Páginas | Bloque que debe conservarse | Interacción propuesta |
|---|---|---|
| 2–6 | Definición, elementos y beneficios de automatizar | Analizar una tarea industrial y justificar qué se automatiza y qué supervisa una persona |
| 7–8 | Medir, controlar y actuar | Ordenar tres funciones e identificar sensor, controlador y actuador |
| 9–10 | Lazo y variables | Seguir una señal en el tanque; distinguir referencia, medición y perturbación |
| 11–15 | Sensores, controladores y actuadores | Identificar equipos por su función en el proceso |
| 16–25 | Ciego/indicador/registrador, primario, transmisor, transductor, convertidor, receptor, controlador, final, interruptor; tarea | Clasificación con selección múltiple y justificación. Mantener la tarea como actividad propia |
| 26–37 | Presión, caudal, temperatura, nivel y principios de medición | Elegir una variable y anticipar qué instrumento se necesita; enlazar a su conferencia de consulta |

**Valor académico:** interpretar un sistema completo antes de memorizar tipos de sensores. Es el mejor punto de entrada a una experiencia visual basada en el tanque existente. Su portada dice 2023; se conserva esa edición como procedencia, aunque se use como apoyo del curso actual.

### I03. Conferencia 2: esquema interno y metrología — 30 páginas

[Fuente](fuentes/Conf.%202%20%282%29.pdf)

Presenta la cadena interna de medición y un ejemplo de Pt100 con transmisor y regulador. Explica características estáticas/dinámicas, rango, span, histéresis, exactitud, precisión, error y sensibilidad. Incluye dos ejercicios completos con datos de mediciones: temperatura con referencia 100 °C y nivel con referencia 1,5 m.

El estudiante debe calcular errores individuales, promedio, error medio y desviación estándar muestral, y argumentar precisión, exactitud y repetibilidad. La pregunta sobre una aplicación crítica requiere condiciones y tolerancias adicionales: no corresponde generar un sí/no universal a partir de diez números.

**Interacción propuesta:** conservar cada tabla, introducir resultados con unidades, mostrar una nube de puntos respecto al patrón y separar dos controles didácticos: desplazamiento sistemático y dispersión. Animar histéresis al subir/bajar una variable; no confundirla con ruido aleatorio ni con retardo temporal.

Resultados recalculados para preparar la pauta, **no una pauta oficial aportada**:

| Ejercicio | Promedio | Error medio respecto al patrón | Desviación estándar muestral |
|---|---:|---:|---:|
| Temperatura, 10 lecturas | 98,82 °C | −1,18 °C | 0,103280 °C |
| Nivel, 10 lecturas | 1,497 m | −0,003 m | 0,016364 m |

Se calcularon con los diez datos de cada tabla y denominador `n−1`. El ejemplo de tres lecturas de la página 23 es una demostración parcial, no la solución de las diez. El archivo `calculos-revisados.json` registra valores y errores individuales.

### I04. Conferencia 3: Medidas de caudal — 29 páginas

[Fuente](fuentes/Conf.%203%20Medidas%20de%20caudal.pdf)

Distingue contabilidad de materia y control de procesos. Desarrolla medidores por presión diferencial y sus elementos —Venturi, tobera, Pitot, orificio y Annubar—, rotámetro, desplazamiento positivo, medición másica y magnética. Incluye esquemas de operación, ventajas y limitaciones, `Q = Vu × N / t`, relación masa/volumen/densidad, lazo y etiquetas FT/FI.

Ultrasonido y vortex aparecen en la lista inicial, **sin un desarrollo equivalente al de las otras tecnologías**. La gráfica de uso industrial cita una fuente de 1992; se tratará como ilustración histórica, no como cuota de mercado actual.

**Interacción propuesta:** variar caudal y observar presión diferencial; mover el flotador del rotámetro; contar volúmenes/pulsos durante un intervalo; comparar caudal volumétrico y másico al cambiar densidad; elegir tecnología por fluido y condiciones. Cada principio tendrá su bloque dentro de esta conferencia.

Los modelos cuantitativos requerirán unidades, parámetros y condiciones explícitas. Una relación simplificada de raíz cuadrada no acredita un cálculo de instalación completo.

### I05. Conferencia 4: Medidas de presión — 23 páginas

[Fuente](fuentes/Conf.%204%20Medidas%20de%20Presi%C3%B3n.pdf)

Desarrolla presión como fuerza por superficie, unidades, presión absoluta, relativa, diferencial, atmosférica y vacío. Clasifica instrumentos y explica Bourdon, diafragma y fuelle. Introduce transmisores, señales de 3–15 psi y 4–20 mA, y etiquetas PT/PI.

**Interacción propuesta:** un mismo recipiente con diferentes referencias de cero; comparar dos puntos; convertir unidades; observar deformación conceptual de un elemento elástico; explicar por qué dos instrumentos pueden mostrar valores distintos sin contradecirse.

No se usará el tanque actual como si ya calculase presión: hoy su modelo es de volumen. La propuesta de presión hidrostática requiere una extensión física separada y declarada.

### I06. Conferencia 5: Medidas de nivel — 25 páginas

[Fuente](fuentes/Conf.%205%20Medidas%20de%20nivel.pdf)

Clasifica métodos directos e indirectos y desarrolla medición hidrostática, manométrica, membrana, burbujeo, presión diferencial, conductiva/resistiva, capacitiva, ultrasónica y radar. Incluye selección según producto y condiciones, ejemplos SITRANS y etiquetas LT/LI.

**Interacción propuesta:** reutilizar el dibujo del tanque para comparar tecnologías sobre un mismo nivel. Mostrar diferencia entre interruptores alto/bajo y una medición continua. Variar densidad en una experiencia hidrostática; visualizar ida/vuelta del pulso ultrasónico; introducir una limitación de proceso y justificar el sensor elegido.

El tanque existente aporta nivel, volumen, caudales de entrada/salida y umbrales. **No incluye aún física de ultrasonido, presión, radar o capacitancia.** El tiempo de vuelo mide distancia al líquido: para obtener nivel se requiere la referencia geométrica del tanque. En un tanque ideal y con sensor superior, una ampliación didáctica puede usar `distancia = c × tiempo / 2` y `nivel = altura de referencia − distancia`, explicando sus supuestos.

### I07. Conferencia 6: Medidas de temperatura — 36 páginas

[Fuente](fuentes/Conf.%206%20Medidas%20de%20temperatura.pdf)

Incluye escalas, dilatación, RTD/Pt100, construcción de sondas y conexión al proceso, termistores NTC/PTC, termopares, tipos, polaridad y códigos de color, fundas/termopozos, pirómetros, emisividad y etiquetas TT/TI.

**Interacción propuesta:** comparar respuesta de resistencia y tensión al cambiar temperatura; distinguir Pt100, NTC, PTC y termopar; seleccionar una sonda según el caso; interpretar colores con la norma de referencia explícita. En pirometría, mostrar por qué importa la emisividad.

**Práctica actual indicada por el estudiante: Pt100.** Se concreta como posible banco de sensor, conexiones, variable térmica e instrumento de lectura. I03, p. 4, permite relacionarlo con un transmisor y regulador; I07, p. 16, define su resistencia nominal. El montaje exacto, el número de hilos, la operación y la evidencia exigida deben contrastarse con la actividad actual. No confundir una lectura directa de resistencia con la salida del transmisor, ni atribuir al Pt100 los datos de un ejercicio genérico de temperatura sin que la fuente lo identifique.

El puente con Electrónica está en el acondicionamiento de pequeñas señales. Se mantendrán separadas la elección del sensor en Instrumentación y la ganancia/offset del circuito en Electrónica. El precio comercial ilustrado no se trasladará como precio actual. Rangos, materiales y fichas se atribuirán al modelo/edición del documento hasta verificarlos para una actividad concreta.

### I08. Conferencia 2: sensores discretos y proximidad — 12 páginas

[Fuente](fuentes/Conf.%202%20%283%29.pdf)

Es un documento distinto de I03: detectores inductivos, capacitivos y fotoeléctricos, representación de sensores de uno a cuatro hilos, salidas PNP/NPN y conexión de carga. Incluye referencia a dos videos y un catálogo Siemens.

**Interacción propuesta:** acercar objetos con propiedades distintas a un detector; explicar el cambio de salida; elegir función NA/NC y diseño PNP/NPN como decisiones independientes; seguir el circuito completo de carga y comprobar la entrada del PLC. No asignar una distancia de detección universal ni inferir bornes concretos a partir de un símbolo genérico.

Hay una asociación errónea de PNP con normalmente abierto y NPN con normalmente cerrado en la página 7: es un punto prioritario de revisión antes de crear ejercicios.

## 3. Correcciones y precisiones para la adaptación

Se conservan los PDF originales. La futura explicación distinguirá lo que muestra la fuente y la precisión añadida con su referencia.

| Fuente / página | Observación comprobada | Tratamiento |
|---|---|---|
| I03, 16–17 | El promedio de las propias medidas se llama “valor verdadero” | Puede ser un estimador bajo supuestos, no un patrón independiente. Separar desviación respecto a la media de error respecto a una referencia |
| I03, 22–24 | La fórmula de desviación muestral usa `x̄`, pero la leyenda lo llama valor verdadero | En esa fórmula `x̄` es la media muestral. Mantener el patrón externo para calcular sesgo/error, sin sustituirlo por la media |
| I03, 11 y 25/29 | Precisión se iguala sin matiz a repetibilidad; se pregunta por fiabilidad crítica sin tolerancia | Explicar que la repetibilidad es precisión bajo condiciones de repetibilidad. Solicitar tolerancias/contexto o aceptar que falta información |
| I08, 7 | PNP se rotula normalmente abierto y NPN normalmente cerrado | Separar topología eléctrica y función de conmutación; existen combinaciones de ambas |
| I07, 3 | Aparece `K = °C + 273,16` | La conversión Celsius/Kelvin usa **273,15**. No confundir con el punto triple del agua |
| I04, 9 | “Flujo laminar” se equipara a disponer de tramos rectos | Distinguir régimen, perfil y condiciones de instalación; los medidores DP industriales también operan en régimen turbulento |
| I04, 23 | Limitación general de los medidores másicos para gases | No tratarla como ley de la tecnología: existen Coriolis diseñados para gases |
| I04, 27 | Texto menciona P/presión al presentar FT/FI | Corregir la letra de variable a F/caudal en ese ejemplo |
| I06, 17 | Tiempo de tránsito se describe como proporcional a cantidad de líquido | Se mide distancia al reflector; el nivel y volumen se deducen con geometría y referencias. No hacer que más nivel implique más tiempo de vuelo en un sensor superior |
| I06, 17–19 | Se presentan usos universales de ultrasonido y transparencia de espuma al radar | Usar condiciones del medio, del montaje y del modelo; la espuma puede atenuar el radar. Evitar respuestas válidas para “cualquier líquido” |
| I05, 5 | kg/cm² y kg/m² se usan como unidades de presión | Distinguir masa de fuerza: explicitar kgf en esas conversiones y privilegiar Pa/bar en ejercicios |
| I05, 10 | Se afirma caída constante de presión y vacío absoluto a 500 km | No construir una simulación atmosférica con esa afirmación. Para el objetivo del curso basta declarar la presión atmosférica de referencia del ejercicio |
| I02, 30; I07, 17–19 y 25 | Generalizaciones termoeléctricas/NTC y frase de polaridad “no riesgosa” | Distinguir NTC/PTC, termopar de bimetal mecánico y consecuencia de una señal invertida en un lazo; revisar cada ejemplo antes de automatizarlo |

Referencias primarias consultadas para precisiones puntuales:

- [JCGM VIM: valor medido](https://jcgm.bipm.org/vim/en/2.10.html) y [valor verdadero](https://jcgm.bipm.org/vim/en/2.11.html): distinguir un resultado/estimación de un valor verdadero o referencia.
- [JCGM VIM: precisión](https://jcgm.bipm.org/vim/en/2.15.html) y [repetibilidad](https://jcgm.bipm.org/vim/en/2.21.html): condiciones de medida explícitas.
- [BIPM, Brochure del SI](https://www.bipm.org/documents/d/guest/si-brochure-9-2_01): relación Celsius/Kelvin, 273,15.
- [ifm IE5202](https://www.ifm.com/na/en/product/IE5202): especifica por separado diseño PNP/NPN y función normalmente abierta/cerrada.
- [Emerson, medición por presión diferencial](https://www.emerson.com/is/content/emerson/en/measurement-instrumentation/marketing/industries/oil-and-gas/documents/doc-rosemount-00805-0100-1041.pdf): régimen y perfil de flujo.
- [Emerson, Coriolis para gas](https://www.emerson.com/is/content/emerson/en/measurement-instrumentation/marketing/products/flow-coriolis/documents/coriolis-flowmeters-for-gas-measurement.pdf): aplicación específica en gases.
- [Endress+Hauser, ultrasonido](https://www.uk.endress.com/en/field-instruments-overview/level-measurement/Ultrasonic-level-measurement): tiempo de vuelo y distancia.
- [VEGA, radar y líquidos](https://www.vega.com/-/media/PDF-files/52552-EN-The-radar-sensor-for-liquids-VEGAPULS-64.pdf): atenuación por espuma y condiciones de aplicación.

No se hizo una auditoría completa de cada afirmación histórica/comercial ni de cada ficha de producto citada. Los dos videos y el catálogo externo de I08 quedan como referencias identificadas, sin revisión audiovisual ni del catálogo completos. Los 27 adjuntos MathML de I03 contienen fórmulas; no son nuevas guías de laboratorio.

## 4. Cobertura real y material que falta

Tenemos una base amplia para U1, consulta de las cuatro variables y una clase de sensores discretos de U2. U3 recibe ejemplos iniciales de FT/FI, PT/PI, LT/LI y TT/TI, pero **esos símbolos no reemplazan una unidad completa de P&ID**.

Actualización posterior: se recibieron cinco DOCX con tres guías distintas: detectores de presencia, proximidad y conexión al PLC, y temperatura con Pt100/termocupla/transmisor. Se revisaron sus consignas, tablas e imágenes; ver [análisis de las guías y duplicados](../guias-instrumentacion/ANALISIS_GUIAS.md). Sigue pendiente una conferencia completa de diagramas, planos adicionales, rúbricas de esas prácticas y datos de los instrumentos físicos. La guía de temperatura concreta la comparación de Pt100 en Ω y termocupla en mV a temperatura ambiente, 50, 75 y 100 °C; la experiencia del transmisor se refiere expresamente a la termocupla.

## 5. Qué se puede simular

| Experiencia | Base existente | Trabajo necesario |
|---|---|---|
| Medir/decidir/actuar | Tanque, bomba, umbrales, PLC/HMI | Guion de identificación y explicación; no necesita introducir una planta nueva |
| Metrología | Tablas y cálculo como componentes de estudio | Nube de lecturas, cálculo validado, histéresis y escenarios con condiciones declaradas |
| Nivel discreto y continuo | Nivel y señales numéricas/booleanas del tanque | Distinguir señal lógica, medición e instrumento; conservar unidades y fuentes |
| Detección de proximidad | PLC y entradas lógicas | Objeto/sensor, modelo de detección, topología PNP/NPN y carga; no existe aún ese sensor completo |
| Caudal | Entrada/salida volumétrica del tanque | Modelos separados de DP, rotámetro y contador; densidad para masa. No atribuir sensores físicos al balance actual |
| Presión/nivel hidrostático | Dibujo del tanque | Geometría, densidad, referencia y modelo de presión; valores didácticos claramente identificados |
| Ultrasonido/radar | Superficie y nivel del tanque | Distancia, referencia y propagación/limitaciones. No presentar una animación como gemelo digital |
| Temperatura | Ejercicios previos de acondicionamiento de Electrónica | Modelo RTD/NTC/PTC/termopar, referencias y compensación cuando corresponda; el laboratorio no lo implementa hoy |
| P&ID | Ejemplos de etiquetas en las conferencias | Fuentes completas y actividades específicas de lectura y lazos |

La revisión del código de `ProcessView.tsx` confirma un modelo de **balance de volumen**, con nivel, caudal de entrada/salida y umbrales, que declara sus límites. El diseño debe aprovecharlo y ampliar solo los fenómenos que la clase necesite. Una sesión guiada tampoco debe sobrescribir el proyecto libre del estudiante.

El plan de ejecución y la primera entrega están en [PLAN_ESTUDIO_MODO.md](../PLAN_ESTUDIO_MODO.md).
