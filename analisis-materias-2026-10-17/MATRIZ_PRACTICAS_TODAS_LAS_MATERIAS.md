# Dónde aplicar prácticas manipulables en todas las materias

**Complemento posterior:** las tres guías distintas recibidas en DOCX se analizan en [Guías de Instrumentación](guias-instrumentacion/ANALISIS_GUIAS.md). El [mapa maestro](MAPA_MAESTRO_ESTUDIO_Y_MODOS.md) integra esos documentos con esta matriz de 32 PDF y define los bancos y modos propuestos.

Revisión de los 32 PDF recibidos (440 páginas). Se utiliza el análisis completo anterior y se contrasta la reutilización con el código actual del panel, laboratorio y enseñanza estrella–triángulo. Esto es un mapa de implementación, no una declaración de que las experiencias propuestas ya estén construidas. No se repitieron pruebas de navegador ni se cambiaron modelos en esta revisión.

## Decisión central

**Lo resuelto en Control de Máquinas Rotativas se conserva y se conecta a su guía.** El panel estrella–triángulo es la referencia de interacción: leer el esquema, identificar, conectar, operar, observar y explicar. No se construye otro panel para el mismo trabajo.

Cada documento se adapta según lo que realmente pide: fabricación, montaje eléctrico, experimento de medida, configuración/programación, modelación matemática o explicación conceptual. Las experiencias añadidas para facilitar la comprensión se identifican como adaptación; no se presentan como consignas originales del docente.

El estado principal indica la parte dominante que falta para esa fuente. **Un PDF puede contener varias prácticas, y un mismo banco puede servir a varios PDF**, conservando cada clase y sus consignas por separado.

## Resultado global

| Estado principal | PDF | Qué significa |
|---|---:|---|
| Reutilizar lo resuelto | 1 | El recorrido de montaje ya está representado por el panel; vincularlo y contrastarlo con la guía. |
| Adaptar herramientas existentes | 4 | Existe el banco o escena principal; faltan guion, parámetros y comprobaciones de la actividad. |
| Añadir elementos o modelos | 11 | Hay que añadir piezas, operaciones o cálculo físico que el sistema todavía no modela. |
| Práctica visual, cálculo o software | 15 | Se aprende manipulando gráficos, lecturas, bits, categorías o software; no exige fabricar un objeto. |
| Referencia del ramo | 1 | Programa del ramo; conservar para consulta, sin inventar una práctica. |

Las 11 fuentes clasificadas como “añadir elementos o modelos” no requieren once aplicaciones. Comparten bancos y componentes. Las 15 fuentes de práctica visual incluyen actividades académicas exigentes, especialmente Matemáticas y Metrología; esta etiqueta no significa convertirlas en lectura pasiva.

## Mapa archivo por archivo


### Electrónica

| Fuente | Estado principal | Qué pide el documento | Qué hará el estudiante | Reutilización y trabajo restante |
|---|---|---|---|---|
| F01: [Activadad con calculo Ajuste cero.pdf](fuentes/electricidad/Activadad%20con%20calculo%20Ajuste%20cero.pdf) | Añadir elementos o modelos | Calcular ganancia y ajuste de cero; completar tablas y montar el canal en Proteus, pp. 3–5. | Montar el canal de termopar, cambiar entrada, ajustar ganancia/offset y comprobar los dos extremos. | **Reutilizar:** Protoboard y registro de mediciones como interfaz. **Completar:** Modelo de AO/instrumentación y sensor; confirmar rango. Evidencia: montaje, tabla y salida esperada con unidades. |
| F02: [Clase 1.pdf](fuentes/electricidad/Clase%201.pdf) | Práctica visual, cálculo o software | Tarea 1: clasificar ejemplos; tarea 2: leer datasheets, pp. 13–15. | Inspeccionar componentes, clasificarlos y localizar parámetros en una ficha; explorar señales como apoyo añadido. | **Reutilizar:** Estructura de clase y preguntas. **Completar:** Catálogo visual y fichas verificadas. No exige fabricar un circuito; guardar clasificación y justificación. |
| F03: [Clase 2.pdf](fuentes/electricidad/Clase%202.pdf) | Adaptar herramientas existentes | Tarea 3 con 1N4007 y laboratorio distinto con 1N4001/LED; montaje, tablas y gráfico, pp. 14–15. | Elegir componentes, conectar, ubicar puntas, variar fuente y registrar tensión/corriente; construir la curva. | **Reutilizar:** Protoboard, diodo/LED, resistencias, fuente y mediciones DC. **Completar:** Guiones separados, valores del componente y tabla/gráfico. Declarar aproximación por tramos; no llamarla curva real medida. |
| F04: [Clase 3.pdf](fuentes/electricidad/Clase%203.pdf) | Adaptar herramientas existentes | Práctica con BC337, fuente 10 V y resistencias; identificar polarización y completar tabla, p. 22. | Colocar el transistor, identificar terminales, cablear y medir; explicar corte, activa o saturación. | **Reutilizar:** BJT, resistencias y mediciones de la protoboard. **Completar:** Contrastar pinout y parámetros BC337. Evidencia: montaje, tensiones y corrientes; no basta que circule corriente. |
| F05: [clase 4.pdf](fuentes/electricidad/clase%204.pdf) | Adaptar herramientas existentes | Dos prácticas: puente H con transistores y con L293D; medir y concluir, pp. 5 y 13–14. | Construir cada puente, accionar entradas, observar giro y medir; corregir conexión o alimentación equivocada. | **Reutilizar:** Presets hbridge-bjt y hbridge, componentes y multímetro existentes. **Completar:** Revisar alimentación lógica y límites de la fuente. Conservar dos prácticas independientes y sus conclusiones. |
| F06: [Clase 5.pdf](fuentes/electricidad/Clase%205.pdf) | Añadir elementos o modelos | Conferencia de AO, comparador, realimentación e instrumentación; no trae una guía de fabricación independiente. | Experiencia añadida: montar una configuración, cambiar entradas/resistencias y comparar ganancia/saturación. | **Reutilizar:** Interfaz de protoboard y explicación de señales. **Completar:** Agregar operacional y modelo declarado. Identificar esta experiencia como ampliación; no atribuir una tarea nueva al docente. |
| F07: [Guia 1.pdf](fuentes/electricidad/Guia%201.pdf) | Añadir elementos o modelos | Cuatro ejercicios: simular AO abierto, no inversor y dos acondicionadores de termopar, pp. 1–9. | Montar, calcular, medir y comparar salida ideal con límites; ajustar el canal y verificar extremos. | **Reutilizar:** Escenas y mediciones del banco; mismo motor analógico nuevo de F01/F06. **Completar:** Cuatro recorridos y pautas separadas; resolver contradicción 150/200 °C. Evidencia: circuito, cálculo, saturación y explicación. |

### Máquinas

| Fuente | Estado principal | Qué pide el documento | Qué hará el estudiante | Reutilización y trabajo restante |
|---|---|---|---|---|
| F10: [Actividad 1 U2.pdf](fuentes/maquinas%20rotativas/Actividad%201%20U2.pdf) | Reutilizar lo resuelto | Dibujar y simular partida manual estrella–triángulo; reposo, marcha, cambio, sobrecarga y recuperación, pp. 5–17. | Cablear mando/fuerza, seguir cada conexión, operar pulsadores y comprobar estados, enclavamientos y falla. | **Reutilizar:** Panel y enseñanza estrellaManual ya presentes: reutilizar el recorrido resuelto. **Completar:** Vincular esta guía y su evidencia al recorrido, sin rehacer el banco. Una versión temporizada sigue siendo una variante distinta. |
| F11: [Actividad 2 (1).pdf](fuentes/maquinas%20rotativas/Actividad%202%20%281%29.pdf) | Añadir elementos o modelos | Montajes CC serie/shunt/compound en banco EMS; variar par, medir corriente/velocidad, graficar y concluir, pp. 6–14. | Conectar los módulos, ubicar instrumentos, variar carga y comparar las tres curvas. | **Reutilizar:** Lenguaje visual del banco y herramientas de montaje/medición. **Completar:** Modelo de excitación/dinamómetro y parámetros del motor. No inventar mediciones Lab-Volt ni confundirlo con el panel de arranque ya resuelto. |
| F12: [Actividad 2.pdf](fuentes/maquinas%20rotativas/Actividad%202.pdf) | Añadir elementos o modelos | Experiencias trifásicas y monofásicas: Y/Δ, línea/fase, inversión, carga, condensador e interruptor centrífugo, pp. 6–14. | Reutilizar conexiones y cambio de fases; agregar instrumentos, carga y montaje monofásico donde corresponde. | **Reutilizar:** Panel existente para topología Y/Δ e inversión. **Completar:** Extender modelo de corrientes, velocidad/par y monofásico. La animación de giro actual no llena las tablas experimentales. |

### Matemáticas

| Fuente | Estado principal | Qué pide el documento | Qué hará el estudiante | Reutilización y trabajo restante |
|---|---|---|---|---|
| F19: [Actividad tecnológica 1 Funciones polinómicas de grados 0 y 1.pdf](fuentes/matrices/Actividad%20tecnol%C3%B3gica%201%20Funciones%20polin%C3%B3micas%20de%20grados%200%20y%201.pdf) | Práctica visual, cálculo o software | Tutorial GeoGebra de constantes/rectas, imágenes, preimágenes, ajuste y cruces, pp. 1–7. | Introducir funciones, colocar puntos, mover ejes y resolver cada operación con gráfico visible. | **Reutilizar:** GeoGebra como recurso externo disponible; marco de clase propio. **Completar:** Editor gráfico propio si se integra. Es práctica de software matemático, no fabricación de objetos. |
| F20: [Actividad tecnológica 2 Funciones logarítmicas.pdf](fuentes/matrices/Actividad%20tecnol%C3%B3gica%202%20Funciones%20logar%C3%ADtmicas.pdf) | Práctica visual, cálculo o software | Tutorial GeoGebra de logaritmos, distintas bases, imágenes, cruces y ajuste, pp. 1–4. | Cambiar base/entrada, localizar imágenes y resolver preimágenes e intersecciones. | **Reutilizar:** Marco gráfico reutilizable de Matemáticas; GeoGebra externo. **Completar:** Dominio, funciones y tolerancias. Conservar cada consigna y sus datos. |
| F21: [Actividad tecnológica 2 Funciones polinómicas de grado 2.pdf](fuentes/matrices/Actividad%20tecnol%C3%B3gica%202%20Funciones%20polin%C3%B3micas%20de%20grado%202.pdf) | Práctica visual, cálculo o software | Tutorial GeoGebra de cuadráticas, raíces, extremos y ajustes, pp. 1–6. | Construir parábolas, ubicar vértice/raíces y ajustar puntos con comprobación visual. | **Reutilizar:** Mismo marco gráfico, sin mezclar esta actividad con logaritmos por compartir número. **Completar:** Operaciones de ajuste e intersección; evidencia: puntos, expresión y razonamiento. |
| F22: [ARPA 1 Consumo de energía (extensión).pdf](fuentes/matrices/ARPA%201%20Consumo%20de%20energ%C3%ADa%20%28extensi%C3%B3n%29.pdf) | Práctica visual, cálculo o software | Obtener la expresión de cobro desde dos consumos de una infografía; extensión independiente, p. 1. | Convertir la imagen en pares de datos, construir recta y explicar pendiente/cargo fijo. | **Reutilizar:** Gráfico y tabla compartidos como herramientas. **Completar:** Datos/respuesta propios de la extensión; no copiar la pauta de F23. |
| F23: [ARPA 1 Consumo de energía.pdf](fuentes/matrices/ARPA%201%20Consumo%20de%20energ%C3%ADa.pdf) | Práctica visual, cálculo o software | Encontrar consumo para un cobro dado a partir de la infografía, p. 1. | Construir tabla y expresión, variar consumo y resolver la pregunta inversa. | **Reutilizar:** Mismo recurso gráfico de funciones afines. **Completar:** Mostrar unidades y razonamiento; los controles manipulables son una adaptación del problema. |
| F24: [ARPA 2 Lanzamiento de una piedra (extensión).pdf](fuentes/matrices/ARPA%202%20Lanzamiento%20de%20una%20piedra%20%28extensi%C3%B3n%29.pdf) | Práctica visual, cálculo o software | Comparar una segunda trayectoria con la piedra original, p. 1. | Mover el tiempo y superponer las dos trayectorias para comparar alturas y momentos. | **Reutilizar:** Escena matemática de F25. **Completar:** Mantener la extensión como recurso separado con su ecuación y preguntas; no cambiar las condiciones originales. |
| F25: [ARPA 2 Lanzamiento de una piedra.pdf](fuentes/matrices/ARPA%202%20Lanzamiento%20de%20una%20piedra.pdf) | Práctica visual, cálculo o software | Estimar altura máxima y momento a partir de una tabla de tiempo/altura, p. 1. | Colocar puntos, construir la parábola y observar el máximo entre muestras. | **Reutilizar:** Gráfico, tabla y control temporal. **Completar:** Animación nueva de apoyo, derivada del modelo; no sustituir el trabajo con la tabla por reproducir una animación. |
| F29: [Situación de modelación 1 Servicio eléctrico.pdf](fuentes/matrices/Situaci%C3%B3n%20de%20modelaci%C3%B3n%201%20Servicio%20el%C3%A9ctrico.pdf) | Práctica visual, cálculo o software | Modelar y contrastar cobros eléctricos y comparar empresas de un problema, pp. 2–4. | Completar tablas, introducir modelos, comparar cruces y explicar discrepancias. | **Reutilizar:** Herramientas de gráficos y ecuaciones. **Completar:** Conservar los datos del problema y diferencias intencionales; no convertirlos en tarifas reales vigentes. |
| F30: [Situación de modelación 2 Seguidores en Instagram.pdf](fuentes/matrices/Situaci%C3%B3n%20de%20modelaci%C3%B3n%202%20Seguidores%20en%20Instagram.pdf) | Práctica visual, cálculo o software | Ajuste logarítmico, dominio, predicción y tasas medias de seguidores, pp. 2–3. | Elegir tiempo, ajustar y comparar modelos, calcular intervalos y justificar dominio. | **Reutilizar:** Motor gráfico de logaritmos. **Completar:** Pauta y contexto revisados. Una cuenta social real o API no forman parte de la práctica. |
| F31: [Situación de modelación 2 Sueño dorado.pdf](fuentes/matrices/Situaci%C3%B3n%20de%20modelaci%C3%B3n%202%20Sue%C3%B1o%20dorado.pdf) | Práctica visual, cálculo o software | Completar ingresos, analizar costos/utilidad y equilibrio, pp. 2–3. | Cambiar cantidad del producto, construir curvas y localizar equilibrio/extremos. | **Reutilizar:** Gráficos/tabla compartidos. **Completar:** Dominio contextual y datos originales. La acción es modelar; no requiere fabricar el producto del relato. |
| F32: [Situación de modelación 3 Desabastecimiento.pdf](fuentes/matrices/Situaci%C3%B3n%20de%20modelaci%C3%B3n%203%20Desabastecimiento.pdf) | Práctica visual, cálculo o software | Ajustar stock mediante modelos lineal/cuadrático/cúbico y argumentar agotamiento, pp. 2–3. | Construir los tres modelos, avanzar el tiempo y comparar predicciones/residuos. | **Reutilizar:** Gráficos y tablas compartidos. **Completar:** Criterios para extrapolación y explicación; evitar una fecha única impuesta para todos los modelos. |

### Redes

| Fuente | Estado principal | Qué pide el documento | Qué hará el estudiante | Reutilización y trabajo restante |
|---|---|---|---|---|
| F33: [Clase Teorica.pdf](fuentes/redes%20industriales/Clase%20Teorica.pdf) | Práctica visual, cálculo o software | Clase teórica de redes, codificación, errores y OSI, pp. 1–43. | Experiencias añadidas: codificar bits, alterar un bit y observar comprobación; seguir un mensaje por funciones. | **Reutilizar:** Preguntas y escenas del formato Estudio. **Completar:** Visor nuevo de bits/códigos y errores; fijar convención y estado inicial. No contiene una consigna de soldadura. |
| F34: [Guía 1.pdf](fuentes/redes%20industriales/Gu%C3%ADa%201.pdf) | Añadir elementos o modelos | Fabricar cable DB9/terminal, soldar, medir continuidad y probar HMI–PLC; alterar comunicación, pp. 4–8. | Preparar cable, soldar contactos, terminar en bornera, medir y reparar; después probar comunicación. | **Reutilizar:** Forma de uso del panel/protoboard; PLC/HMI y medidor como referencias de interfaz. **Completar:** Banco de fabricación y topología nuevos; resolver pinout contradictorio y modelo de comunicación. Detalle en PRACTICAS_VISUALES_REDES.md. |
| F35: [Resumen Teorico.pdf](fuentes/redes%20industriales/Resumen%20Teorico.pdf) | Práctica visual, cálculo o software | Resumen del mismo tema y nueve preguntas orientativas, pp. 1–4. | Repasar con el visor de bits/errores y explicar casos OSI. | **Reutilizar:** Mismas escenas de F33 y su pauta precisada. **Completar:** Recurso de apoyo de la clase, no banco adicional ni otra unidad. |

### Instrumentación

| Fuente | Estado principal | Qué pide el documento | Qué hará el estudiante | Reutilización y trabajo restante |
|---|---|---|---|---|
| I01: [Presentación de la Asignatura (1).pdf](instrumentacion/fuentes/Presentaci%C3%B3n%20de%20la%20Asignatura%20%281%29.pdf) | Referencia del ramo | Programa, resultados de aprendizaje, horas, evaluación y bibliografía, pp. 1–13. | Consultar objetivos y mapa del ramo. | **Reutilizar:** Índice del ramo. **Completar:** No necesita simulador ni preguntas obligatorias sobre datos administrativos. |
| I02: [Conf. 1 (1).pdf](instrumentacion/fuentes/Conf.%201%20%281%29.pdf) | Adaptar herramientas existentes | Fundamentos, lazo, clasificación y Tarea 1 de buscar/clasificar instrumentos, pp. 2–37. | Asignar funciones en el tanque, seguir señales y clasificar instrumentos con categorías múltiples. | **Reutilizar:** Tanque, bomba, entradas, PLC y HMI existentes. **Completar:** Guion visual y tarea; la manipulación del tanque es apoyo añadido a la conferencia, no una guía física que el PDF obligue a ejecutar. |
| I03: [Conf. 2 (2).pdf](instrumentacion/fuentes/Conf.%202%20%282%29.pdf) | Práctica visual, cálculo o software | Dos ejercicios con diez lecturas: errores, promedio, desviación y argumentación, pp. 18–29. | Tomar cada dato, completar tabla y explicar nube de lecturas, sesgo y dispersión. | **Reutilizar:** Calculadoras y estructura de preguntas como base. **Completar:** Banco visual de metrología y cálculos revisados; histéresis como ampliación. No exige pelar/soldar componentes. |
| I04: [Conf. 3 Medidas de caudal.pdf](instrumentacion/fuentes/Conf.%203%20Medidas%20de%20caudal.pdf) | Añadir elementos o modelos | Conferencia de tecnologías de caudal y selección; esquemas y fórmulas, pp. 2–28. | Experiencias añadidas: variar caudal, observar Δp/flotador, contar volúmenes y comparar masa. | **Reutilizar:** Tanque y flujos volumétricos como escena base. **Completar:** Sensores/modelos DP, rotámetro y contador nuevos; la conferencia no contiene una guía completa de montaje de banco. |
| I05: [Conf. 4 Medidas de Presión.pdf](instrumentacion/fuentes/Conf.%204%20Medidas%20de%20Presi%C3%B3n.pdf) | Añadir elementos o modelos | Conferencia de presión, referencias, unidades, instrumentos y transmisores, pp. 3–22. | Experiencias añadidas: elegir referencia, comparar dos puntos, observar mecanismo y convertir señales. | **Reutilizar:** Tanque como dibujo e interfaz de instrumentos. **Completar:** Modelo de presión e instrumentos; el proceso actual solo calcula volumen. No inventar terminales ni procedimiento físico del curso. |
| I06: [Conf. 5 Medidas de nivel.pdf](instrumentacion/fuentes/Conf.%205%20Medidas%20de%20nivel.pdf) | Añadir elementos o modelos | Conferencia de tecnologías de nivel, condiciones y LT/LI, pp. 2–24. | Experiencias añadidas: colocar un sensor, comparar discreto/continuo, cambiar densidad y observar eco. | **Reutilizar:** Nivel y umbrales del tanque. **Completar:** Modelos de cada sensor y geometría; aprovechar el tanque sin duplicarlo. Las guías de laboratorio reales siguen pendientes. |
| I07: [Conf. 6 Medidas de temperatura.pdf](instrumentacion/fuentes/Conf.%206%20Medidas%20de%20temperatura.pdf) | Añadir elementos o modelos | Conferencia de RTD, NTC/PTC, termopar, termopozo y pirómetro, pp. 2–35. | Experiencias añadidas: elegir/montar sensor en un modelo didáctico, cambiar temperatura e interpretar señal. | **Reutilizar:** Acondicionamiento analógico a desarrollar para Electrónica y formato del banco. **Completar:** Modelos térmicos y referencias; no hay hoy banco de temperatura. Corregir Celsius/Kelvin y fijar norma de colores. |
| I08: [Conf. 2 (3).pdf](instrumentacion/fuentes/Conf.%202%20%283%29.pdf) | Añadir elementos o modelos | Conferencia de proximidad, representación y conexión PNP/NPN, pp. 3–9. | Experiencias añadidas: conectar sensor/carga, acercar un objeto y observar salida/entrada PLC. | **Reutilizar:** Entradas PLC y herramientas de cableado como base. **Completar:** Sensor/objeto/topología de salida nuevos. PNP/NPN independiente de NA/NC; parámetros y bornes según referencia concreta. |


## Qué está resuelto en Máquinas y qué se reutiliza

- **F10, arranque manual estrella–triángulo:** reutilizar el panel, sus conexiones, identificación y explicaciones de mando/fuerza, operación y falla. El código incluye `estrellaManual`; mantener la versión manual de la guía y la temporizada como variante.
- **Protecciones, F14 (PowerPoint):** reutilizar el Estudio existente, las actividades y comparaciones conceptuales. La selección numérica necesita datos del ejercicio y fichas; el documento deja datos por completar.
- **F11 y F12:** reutilizar también el lenguaje del banco y las conexiones aplicables. Sus tablas de par/corriente/velocidad y experiencias monofásicas necesitan ampliar el modelo. El panel de arranque resuelto no equivale a un dinamómetro de motores.

La comprobación actual es de código y alcance: `starDeltaTeaching.ts`, `starDeltaSources.json`, `simulation.ts`, `lab/model.ts` y `lab/dc.ts`. No convierte la velocidad gráfica del motor en rpm medidas ni acredita el banco físico del curso.

## Bancos comunes que conviene construir o ampliar

| Banco/herramienta | Materiales que lo usan | Prioridad y alcance |
|---|---|---|
| Panel eléctrico existente | F10; partes de F12; apoyo de Protecciones | Conservar. Añadir la entrada desde la guía y la evidencia correspondiente |
| Protoboard DC existente | F03, F04, F05 | Adaptar primero: componentes, mediciones, tablas y explicación según cada práctica |
| Fabricación de cable y soldadura | F34 | Primer banco práctico nuevo: piezas, preparación, uniones, errores y continuidad; después enlace HMI–PLC |
| Sensores y procesos sobre el tanque | I02, I04, I05, I06, I08 | Escena común, instrumentos distintos. Empezar por señales discretas/continuas y luego física específica |
| Acondicionamiento y temperatura | F01, F06, F07, I07 | AO, ganancia, offset y sensores. Misma herramienta, objetivos y actividades propios de cada ramo |
| Medidas y gráficos | I03 y F19–F32 cuando corresponde | Tablas, puntos, cálculo y comparación; datos propios de cada recurso. No unir las clases en una lección general |
| Señales digitales y comunicación | F33, F35 y segunda parte de F34 | Bits, errores y parámetros de comunicación; distinguir continuidad de enlace correcto |
| Banco ampliado de motores | F11 y partes experimentales de F12 | Agregar carga y modelos CC/CA al lenguaje del banco, sin rehacer el panel existente |

## Otros archivos que también cuentan

| Fuente | Uso |
|---|---|
| F14, presentación de Protecciones | Reutilizar lo ya desarrollado en Estudio, en la unidad de Máquinas correspondiente |
| F15, resolución de prueba | Preparar casos de diagnóstico y evaluación después de corregir las contradicciones; no importar su dibujo de bornera como conexiones válidas |
| F16, rúbrica | Usar como criterios de montaje, mediciones, interpretación y conclusiones, separada de la prueba escrita |
| F18, temario | Mapa de cobertura y repaso; no exige un simulador independiente |
| F08/F09/F17/F28/F36, capturas | Orden de unidades y recursos; no permiten reconstruir guías ausentes |
| F13, enlace de video | Apoyo de motores; revisión audiovisual completa pendiente |
| F26/F27, nueve GeoGebra | Prácticas externas de funciones ya identificadas; conservar cada enlace y verificar variantes al integrarlas |
| Administración | Sin material. No inventar prácticas a partir de su nombre |

No se han recibido las guías prácticas de Instrumentación visibles en la captura ni el desarrollo completo de P&ID. Las propuestas de experiencias para sus conferencias no sustituyen esas consignas pendientes.

## Orden de trabajo actualizado

1. Vincular a sus guías el panel de Máquinas y los montajes DC que ya tienen herramientas. Estos recorridos fijan el patrón de interfaz y aprendizaje.
2. Construir el banco de cable/soldadura de Redes, con la especificación ya preparada y el pinout revisado.
3. Adaptar Metrología y los primeros sensores al tanque, con mediciones y errores observables.
4. Incorporar las herramientas gráficas de Matemáticas y señales de Redes, manteniendo cada ejercicio.
5. Añadir los modelos analógicos, térmicos y de motores necesarios para las prácticas restantes, según sus fuentes.

El primer prototipo práctico **nuevo** sigue siendo el cable de Redes. Reutilizar lo resuelto en Máquinas/Electrónica es el paso previo de integración, no rehacer esos bancos.

## Regla de cierre por actividad

Se considera preparada cuando están identificados fuente y página, materiales, acción concreta, comprobación del montaje/modelo, explicación del resultado y evidencia guardable. La escena debe responder al trabajo del alumno: un cable abierto, un pin equivocado o un parámetro incompatible tienen efectos distintos. Cuando solo corresponde interpretar datos, se comprueba esa interpretación en vez de inventar una fabricación.

En modo acompañamiento de clase, las mediciones físicas se registran como tales y la ayuda se puede consultar por pasos. Un montaje virtual completado no valida automáticamente el montaje real. La revisión docente exigida por la guía se conserva.
