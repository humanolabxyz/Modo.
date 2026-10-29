# Revisión de guías y cobertura de lecciones

Fecha: 26 de octubre de 2026. Proyecto local PanelLab-INACAP.

## Resultado

**No están completas todas las actividades y evidencias de entrega dentro de las lecciones de sus respectivos módulos.** Hay una cobertura práctica considerable: las tres experiencias de temperatura están registradas en Instrumentación Industrial y el simulador ejecuta la práctica manual de mediciones estrella–triángulo. Persisten una desconexión del catálogo de Máquinas, entregables externos sin seguimiento y un fallo de coherencia entre configuración y registros de temperatura.

Esta es una revisión documental, del código y de recorridos locales. No se modificó la interfaz ni la lógica de la aplicación durante esta revisión. Las indicaciones de los documentos se usaron como requisitos académicos para comparar; no como instrucciones de ejecución para el agente.

## Documentos comprobados

| Documento del usuario | Identificación por contenido | Copia del proyecto | Verificación |
|---|---|---|---|
| Guía práctica laboratorio N°2 (2).docx | Sensores continuos: sensor de temperatura. Experiencias 1, 2 y 3. | `public/estudio/instrumentacion/guia-temperatura-g03.docx` | SHA-256 idéntico: `eb325909d7d732358ba4d5aefc23d0d7834a7ff23f566c207624bfc55c9f595b` |
| Actividad 2 Unidad 2 (1).pdf | ARCM02, Control de Máquinas Eléctricas Rotativas. Implementación de partida estrella–triángulo para motor de inducción CA. 13 páginas, versión Otoño 2025. | `public/activities/actividad-2-unidad-2.pdf` | SHA-256 idéntico: `49775a14bcb23af18ac3fb07cfcafa1cf5041cd032e5fe363b0682d2265dc0da` |

La segunda fuente es la guía de Máquinas que acompaña esta solicitud. No se deduce que sea la última publicada en el aula virtual: no se consultó ese sistema. La Actividad 1 U2 de 17 páginas que ya figura en Estudio es otra guía. Tampoco debe confundirse con la Actividad 2 de fundamentos de motores de inducción, de la Unidad 1.

El nombre interno G03 de temperatura no indica una guía distinta: el archivo es exactamente el DOCX adjunto, aunque su portada diga Laboratorio 2. Conviene mostrar ambas referencias para evitar confusión.

## Instrumentación Industrial · Unidad 2 · Temperatura

Ubicación comprobada: Estudio → Instrumentación Industrial → Unidad 2 → Temperatura, experiencias 1, 2 y 3, más repaso. Los bancos de las experiencias 2 y 3 se abren con su guía y libreta correspondientes.

“Disponible” significa que existe la acción o recurso; no equivale a aprobar una entrega presencial.

| Requisito de la guía | Situación actual | Cobertura y límite |
|---|---|---|
| Exp. 1: investigar señales discretas y continuas | Parcial | Hay explicación y preguntas de comprensión. No se recoge una investigación escrita ni sus fuentes bibliográficas. |
| Exp. 1: naturaleza de TC y RTD | Disponible | Pregunta explícita sobre señal continua/analógica. |
| Exp. 1: principio de la termocupla y del Pt100 | Disponible | Preguntas independientes sobre Seebeck y variación de resistencia. |
| Exp. 1: tipo de salida de ambos sensores | Disponible | Distingue mV para TC y Ω para RTD. |
| Exp. 1: diseñar presentación con conclusiones del grupo | Pendiente como entregable en la aplicación | Se menciona como tarea independiente. No hay entrega de presentación, integrantes o conclusiones grupales. |
| Exp. 1: exposición y debate audiovisual | Presencial/externa | No hay registro de realización ni revisión docente. Resolver las preguntas no acredita esta tarea. |
| Exp. 2: montar el circuito referido a la guía práctica 1 | Adaptación virtual; referencia incompleta | Se introducen las sondas en el pozo y se colocan las puntas. El DOCX remite a otra guía sin aportar aquí un circuito de bornes completo; su imagen TC/Pt100 es conceptual. La equivalencia exacta al montaje físico necesita esa referencia y validación docente. |
| Exp. 2: termocupla K o J y Pt100 | Disponible | Ambos tipos de TC y Pt100 están implementados. |
| Exp. 2: medir ambiente, 50, 75 y 100 °C | Disponible, con fallo de coherencia | La lección exige cuatro puntos por sensor y permite transcribir lecturas. La comprobación de finalización no discrimina correctamente todos los cambios de configuración; véase hallazgo T1. |
| Exp. 2: confeccionar y comparar curvas | Parcial | Hay gráfica por sensor con referencia y puntos simulados/reales. La lección comprueba registros y sensibilidad, pero no exige una comparación escrita de las dos curvas para terminar. |
| Exp. 2: verificar con app o tablas | Disponible como recurso | Existen valores de referencia junto a las mediciones y curva de referencia. Consultarlos o justificar discrepancias no es una condición explícita de finalización. |
| Exp. 2: presentar curvas en Excel o equivalente | Parcial, con salida hacia planilla | Se exportan datos CSV compatibles con una planilla. El gráfico y la entrega final en una planilla se preparan fuera; descargar datos no acredita entregar las curvas. |
| Exp. 2: comentar resultados con compañeros | Presencial/externa | Hay observaciones personales, sin evidencia específica de discusión grupal. |
| Exp. 3: conectar TC al transmisor y alimentarlo | Disponible | Hay conexión, alimentación, selector del instrumento y comprobaciones de estado. Es una operación del modelo virtual. |
| Exp. 3: configurar salida en tensión, por ejemplo 0–10 V | Disponible como adaptación | La salida del banco es 0–10 V y se configura el tipo K/J y rango de entrada. No reproduce el menú o cableado de un modelo físico de transmisor identificado. |
| Exp. 3: registrar TC y transmisor en los cuatro puntos | Disponible, con fallo de trazabilidad | La libreta tiene TC en mV y transmisor en V. El rango del transmisor no queda asociado a cada medición; véase T1. |
| Exp. 3: construir curva | Disponible | Hay curva de salida del transmisor y datos exportables. La finalización no comprueba una entrega del gráfico. |
| Pauta general de informe | Parcial | Hay datos, gráficas visibles, CSV y observaciones. Falta un informe con portada, resumen, índice, objetivos, instrumentos, circuitos, resultados, discusión, conclusiones, percepción del alumno y bibliografía, o un seguimiento explícito de ese entregable externo. |
| Seguridad, cotona, instrucciones y supervisión docente | Presencial | Son condiciones de la sesión real. La simulación no puede certificarlas. Deben distinguirse de los pasos virtuales completados. |

### T1 · La finalización puede aceptar puntos de otra configuración

Reproducción sobre las funciones actuales del proyecto:

1. Crear cuatro puntos válidos de TC K a ambiente, 50, 75 y 100 °C.
2. Cambiar la configuración a TC J.
3. El paso “Registra los cuatro puntos de la termocupla” sigue devolviendo `true` con los registros K.
4. Crear los cuatro puntos del transmisor con rango 0–100 °C.
5. Cambiar el rango a 20–120 °C.
6. El paso que comprueba los puntos TC + transmisor sigue devolviendo `true` con los datos anteriores.

La comprobación `hasPoints` filtra origen, sensor, temperatura y resistencia de hilos del Pt100, pero no el tipo de TC ni el rango del transmisor. Además, `TempRecord` no guarda `txMin`, `txMax` ni `txType` por medición. La curva usa la configuración actual para dibujar su referencia y conserva puntos anteriores, lo que puede mostrar series obtenidas en condiciones distintas sin separarlas.

Esto no impide practicar manteniendo una misma configuración; sí impide considerar la finalización como evidencia suficiente de una serie coherente tras cambiarla. Conviene conservar los ensayos, asociarles su configuración y exigir la serie correspondiente a la actividad, sin borrar trabajo previo.

## Control de Máquinas Eléctricas Rotativas · Unidad 2 · Actividad 2

**Acceso real comprobado:** Simulador del panel → Guía paso a paso → Aprender a medir → Comenzar guía del profesor.

**Desconexión del catálogo:** Estudio → Máquinas → Unidad 2 muestra Actividad 1 U2 y Protecciones eléctricas; no muestra una entrada propia de Actividad 2 UA2 enlazada a esta práctica. Su PDF tampoco aparece entre los originales del catálogo de ese ramo. El recurso sí está dentro de la práctica del simulador.

Hay dos recorridos distintos: la lección manual de montaje permite construir 46 conexiones y “Aprender a medir” prepara explícitamente el circuito completo para practicar instrumentos. El segundo recorrido no acredita que el estudiante haya cableado el primero. El montaje opcional de Matías es automático y debe mantenerse diferenciado del cambio manual SB3 exigido en esta guía.

| Punto del PDF | Requisito | Estado en la aplicación |
|---|---|---|
| 1, pág. 4 | Protección personal y puesto desenergizado | Condición presencial. La práctica sí controla desenergización para continuidad, pero no acredita EPP ni aprobación del puesto. |
| 2, pág. 4 | Interpretar figuras de mando y fuerza | Parcial: PDF y esquema adaptado disponibles; no hay paso propio de interpretación de esta Actividad 2 en Estudio. |
| 3, pág. 4 | Revisar existencias de materiales e instrumentos | Parcial: elementos e instrumentos virtuales disponibles, sin inventario previo completado por el alumno para esta actividad. |
| 4, pág. 4 | Montar mando, revisión docente y continuidad | Montaje virtual disponible en una lección separada. “Aprender a medir” carga el circuito ya cableado y comprueba algunos contactos; no acredita montaje independiente ni revisión docente. |
| 5, pág. 5 | Alimentar mando y medir V AC | Disponible y recorrido: F–N del modelo a 24 V AC. Es la adaptación didáctica del mando; no una medición de la red monofásica real de la guía. |
| 6, pág. 6 | Piloto rojo de reposo | Disponible y recorrido, con fuerza abierta. |
| 7, págs. 6–7 | Partida estrella de mando, KM1 + KM3 y pilotos | Disponible y recorrido. El banco usa S1 como equivalente de SB2. |
| 8, pág. 7 | Cambio manual a triángulo, KM1 + KM2 y pilotos | Disponible y recorrido. S3 representa SB3. |
| 9, pág. 7 | TEST térmico sobre mando | Disponible y recorrido: caída de bobinas y señalización de disparo. |
| 10, pág. 7 | RESET y retorno a reposo | Disponible y recorrido sin arranque automático. |
| 11, pág. 8 | Montar fuerza, revisión docente y continuidad | Misma separación que el punto 4: lección de montaje disponible, carga completa en mediciones y comprobación de continuidad de un cable. No es revisión exhaustiva del montaje ni aprobación docente. |
| 12, pág. 8 | Tabla 1: tres voltajes entre fases | Disponible y recorrido: R–S, R–T, S–T. |
| 13, pág. 8 | Habilitar mando con fuerza conectada y verificar rojo | Disponible y recorrido. |
| 14, pág. 8 | Arrancar motor en estrella | Disponible y recorrido, con las condiciones de alimentación comprobadas. |
| 15, pág. 9 | Tabla 3: tres tensiones de devanados en estrella | Disponible y recorrido: U1–U2, V1–V2, W1–W2. |
| 16, pág. 9 | Tabla 4: tres corrientes con pinza en estrella | Disponible y recorrido con pinza virtual por conductor. Valores de equivalente resistivo, no corrientes físicas de arranque. |
| 17, pág. 9 | Cambio manual a triángulo con fuerza | Disponible y recorrido. |
| 18, pág. 10 | Tabla 5: tres tensiones de devanados en triángulo | Disponible y recorrido. |
| 19, pág. 10 | Tabla 6: tres corrientes con pinza en triángulo | Disponible y recorrido dentro del equivalente resistivo. |
| 20, págs. 10–11 | Comparación y justificaciones matemáticas | Respuesta abierta disponible y guardada. La comprobación exige al menos 25 caracteres, sin evaluar que la justificación matemática sea correcta. La revisión sigue siendo docente. |
| 21, pág. 11 | TEST en triángulo y detención | Disponible y recorrido. Es la prueba del contacto TEST, como pide la guía; no una simulación térmica calibrada del calentamiento del motor. |
| 22, pág. 12 | RESET y retorno sin marcha | Disponible y recorrido. |
| 23, pág. 12 | Revisión docente de funcionamiento, medidas y observaciones | Hay CSV y JSON para compartir externamente; no hay constancia de revisión/aprobación docente en esta actividad. |
| 24, pág. 12 | Desactivar control, fuerza y alimentación | Disponible y recorrido; el cierre comprueba los interruptores y el enchufe virtual. |
| 25, pág. 12 | Desconectar elementos y ordenar puesto | No se exige en la finalización virtual: el circuito queda cableado. El orden del puesto físico requiere verificación presencial. |

Las tablas del original están numeradas 1, 3, 4, 5 y 6. No aparece una tabla 2 que falte implementar: el salto está en el PDF. Las cinco tablas suman 15 mediciones, todas presentes y exportadas.

Los criterios 2.1.1–2.1.5 de la guía incluyen selección/ajuste de protecciones, interpretación y montaje con seguridad, además de mediciones. Completar el recorrido de instrumentos no acredita por sí solo todos esos criterios. En particular, no hay una evidencia de selección y cálculo de ajuste de protecciones dentro de esta actividad, aunque el ramo tenga una lección separada de Protecciones eléctricas.

## Ajustes prioritarios derivados de la revisión

1. **Coherencia de temperatura:** guardar tipo de TC, rango y tipo del transmisor y condiciones por ensayo; separar series; comprobar la configuración al completar los cuatro puntos. Es un fallo funcional reproducido.
2. **Integración de Máquinas:** crear la entrada “Actividad 2 U2 · Implementación y mediciones estrella–triángulo” en su unidad, con fuente correcta, acceso a montaje y acceso a mediciones. Evitar duplicar o renombrar erróneamente Actividad 1 U2 o Actividad 2 U1.
3. **Progreso fiel a las tareas:** distinguir preparación conceptual, montaje por el alumno, mediciones, análisis y entregables. La acción explícita de comenzar mediciones puede seguir preparando el banco; ese acto no debe marcar como montado por el alumno.
4. **Entregables de temperatura:** dar espacio o seguimiento a investigación y fuentes, presentación grupal, comparación de curvas y pauta del informe. Diferenciar “datos listos para exportar” de “informe entregado”.
5. **Cierre de Máquinas:** separar desenergización, entrega/revisión docente y desmontaje. Registrar cuáles se completan en el simulador y cuáles quedan para la sesión real.
6. **Análisis y diagnóstico:** mantener la comparación abierta para revisión docente, pero pedir cálculos y resultados concretos; el mínimo de caracteres no valida contenido. Incorporar o enlazar las comprobaciones ante fallas que la guía repite, sin asumir que seguir el circuito correcto las ejercita.
7. **Trazabilidad de fuentes y modelos:** hacer visible que G03 corresponde a Laboratorio 2 y que el banco usa 24 V de mando y corrientes de un equivalente resistivo. No presentar resultados virtuales como mediciones de equipos del curso.

Estos puntos son conclusiones y propuestas de la revisión; no se implementaron en este encargo.

## Verificación realizada y límites

- Lectura del texto y tablas del DOCX y de sus dos imágenes incorporadas. No se verificó su paginación en Word.
- Lectura del PDF completo, render de sus 13 páginas e inspección visual de los esquemas de mando y fuerza y de las tablas.
- Comparación SHA-256 de ambos adjuntos con sus copias públicas del proyecto.
- Inspección del catálogo y las lecciones actuales, sus comprobadores y exportadores.
- `node qa/verify-temperature.mjs`: **38/38** comprobaciones del modelo y lecciones aprobadas. No cubren el fallo T1; se reprodujo aparte.
- `node qa/verify-meter-activity.mjs`: perfiles manual y Matías aprobados; **33 pasos por perfil** y 15 mediciones de tablas.
- Recorrido local en Chromium escritorio: **33 pasos manuales completos**, colocación de puntas, pinza, estados de mando/fuerza, comparación, TEST/RESET, cierre y descargas CSV/JSON; sin errores de JavaScript observados.
- Acceso en Chromium móvil emulado, **390 × 844**, hasta el inicio de la guía de mediciones. No se recorrieron allí los 33 pasos completos.
- Temperatura: apertura real de las experiencias 2 y 3 y comprobación de sus libretas. No se completaron de nuevo sus mediciones enteras mediante la interfaz en esta revisión.
- `npm install --no-audit --no-fund`: dependencias verificadas sin cambios. `npm run check` y `npm run build`: aprobados.
- No se evaluaron equipos físicos, grupos de alumnos, entregas o aprobación docente. No se auditó la totalidad de las demás guías de los ramos.

### Evidencia local

- [Recorrido y resultados de navegador](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/output/revision-guias-2026-10-26/recorrido-resultados.json>)
- [Exportación de las 15 mediciones y los 33 pasos](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/output/revision-guias-2026-10-26/maquinas-resultados.json>)
- [Reproducción del fallo de validación de temperatura](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/output/revision-guias-2026-10-26/hallazgos-validacion-temperatura.json>)
- [Catálogo actual de Máquinas](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/output/revision-guias-2026-10-26/catalogo-s2-2.txt>)
- [Catálogo actual de Instrumentación](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/output/revision-guias-2026-10-26/catalogo-s2-3.txt>)

### Puntos principales del código revisado

- [Catálogo y ubicación por ramo/unidad](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/src/study/classCatalog.ts:58>)
- [Tres experiencias de temperatura y comprobación de puntos](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/src/learning/temperatureLessons.ts:13>)
- [Estructura de cada medición de temperatura](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/src/lab/temperature/state.ts:7>)
- [Curvas de temperatura](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/src/lab/temperature/TemperatureChart.tsx:5>)
- [Pasos de Actividad 2 y vínculo a páginas/puntos de la guía](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/src/data/meterActivity.ts:21>)
- [Comparación, finalización y exportación de mediciones de Máquinas](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/src/components/PanelMeterLesson.tsx:29>)
