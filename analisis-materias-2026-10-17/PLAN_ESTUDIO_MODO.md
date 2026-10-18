# Plan para Estudio en modo.

**Mapa vigente de alcance y prioridades:** [Mapa maestro de Estudio y modos](MAPA_MAESTRO_ESTUDIO_Y_MODOS.md). Integra las tres guías prácticas nuevas, los seis ramos, las formas de aprendizaje y los bancos compartidos. Recomienda adelantar temperatura/Pt100 por su uso actual en clases; las menciones a Redes como primer prototipo más abajo corresponden al orden anterior y conservan su especificación técnica.

17 de octubre de 2026. Documento de planificación, todavía sin cambios funcionales. Integra [análisis general](INFORME_ACADEMICO.md), [inventario de Materias.rar](INVENTARIO_COMENTADO.md) y [análisis de Instrumentación](instrumentacion/ANALISIS_INSTRUMENTACION.md).

**Ajuste de alcance solicitado:** las guías de fabricación y montaje necesitan un banco manipulable, con herramientas, piezas, operaciones y comprobación del resultado. La práctica de Redes de fabricar/soldar un cable pasa a ser el **primer prototipo práctico** del plan. La Conferencia 1 de Instrumentación se conserva como primer recorrido conceptual completo. Ver [especificación del banco de cableado y soldadura](PRACTICAS_VISUALES_REDES.md).

**Revisión de todas las materias:** se clasificaron los 32 PDF en la [matriz de prácticas archivo por archivo](MATRIZ_PRACTICAS_TODAS_LAS_MATERIAS.md). El panel resuelto de Control de Máquinas Rotativas se reutiliza y vincula a su guía; también se adaptan los montajes DC existentes. El banco de Redes es el primer desarrollo práctico nuevo. La matriz separa consignas originales, experiencias añadidas, herramientas reutilizables y modelos pendientes.

**Práctica actual de Instrumentación confirmada documentalmente:** se recibieron cinco DOCX con tres guías distintas; ver [análisis completo y duplicados](guias-instrumentacion/ANALISIS_GUIAS.md). La guía de temperatura G03 pide investigar termocuplas/RTD, medir termocupla K o J y **Pt100** a temperatura ambiente, 50, 75 y 100 °C, comparar con referencias y graficar en planilla. Su dibujo distingue termocupla en mV y Pt100 en Ω. La experiencia 3 conecta específicamente la termocupla al transmisor, propone una salida de tensión como 0–10 V y pide otra curva. No convertirla automáticamente en una conexión del Pt100 al transmisor ni añadir un PLC como requisito de esa guía. Quedan por confirmar equipos físicos, bornes y rango configurado. G01 y G02 cubren detectores, medición y conexión al PLC Delta. Por el trabajo actual en clases, se recomienda adelantar el banco de temperatura; Redes conserva su alcance independiente. Las tablas genéricas de I03 siguen sin identificar el sensor como Pt100.

## 1. Decisión de producto

**Un espacio simple donde eliges un ramo, abres una clase y aprendes haciendo, paso a paso.** El orden del aula permanece reconocible. Cada clase conserva sus explicaciones, tareas y prácticas, aunque pueda enlazar conceptos de otra asignatura.

Usaremos la identidad modo. que ya existe: logo original, Inter, fondo claro, superficies blancas, texto oscuro, verde como acento y bordes definidos. Se verificaron `modo-tokens.css`, `modo-home.css` y `ENTREGA_MODO.md`; la propuesta no parte de una identidad inventada.

El alcance es Estudio y sus conexiones con las herramientas actuales. Se conserva la app local, su inicio, el panel y el laboratorio. No se requiere otra web, cuentas, un backend o publicar el material para ejecutar este plan.

## 2. Recorrido del estudiante

```text
Mis ramos
  → Instrumentación Industrial
    → Unidad 1
      → Conferencia 1
        → Explicación visual → pregunta → acción → explicación del resultado
        → Tarea de la clase
        → Comprobación y continuación
```

Este recorrido se expresa como vistas del Estudio existente, con regreso claro; no como módulos de navegación global nuevos.

**Mis ramos:** seis tarjetas sencillas, nombre del ramo, estado real y un acceso para continuar. Buscar permanece accesible; filtros secundarios van en opciones. Mostrar por separado material recibido y clase interactiva disponible: disponer del PDF no significa que la adaptación esté terminada.

**Dentro del ramo:** unidades plegables y filas de clases/actividades. Cada fila muestra nombre y estado. Recursos de consulta, guías y evaluaciones conservan su función; no se cuentan como clases nuevas para inflar progreso.

**Dentro de la clase:** cabecera pequeña, indicador de paso, una explicación breve y una escena principal. Una acción dominante por paso: identificar, ordenar, cambiar un valor, conectar o medir. “Ver material original” y “Ver índice de la clase” quedan disponibles sin competir con la acción principal.

En escritorio, explicación y escena pueden estar juntas; en móvil, escena y controles se reordenan con texto legible y objetivos táctiles de al menos 44 px. La interacción debe funcionar también con teclado, sin depender de arrastrar ni del color para responder.

La marca modo. se usará en la interfaz; la procedencia docente seguirá visible junto a las fuentes. Los esquemas didácticos nuevos tendrán referencias y supuestos. Las fotografías decorativas no se usarán como prueba de un cableado.

## 3. Estructura de una clase

Cada PDF docente conserva su identidad. Sus bloques pueden tener varios pasos y sus tareas pueden abrirse como actividades relacionadas. Una diapositiva no obliga a crear una pantalla; sí exige que su objetivo relevante quede cubierto o documentado.

| Momento | Lo que ve/hace el estudiante | Evidencia |
|---|---|---|
| Objetivo | Qué podrá explicar o hacer | Meta concreta, fuente y prerrequisitos |
| Observa | Una escena comentada | Identifica elementos y relaciones |
| Predice | Responde antes de actuar | Hipótesis y razón |
| Prueba | Manipula una variable o ejecuta una acción | Cambio registrado y resultado coherente |
| Mide | Completa una tabla o interpreta un gráfico | Valor, unidad y condiciones |
| Explica | Describe por qué ocurrió | Relación con el concepto, no solo acierto |
| Comprueba | Resuelve una variante con menos ayuda | Objetivos comprobados y dudas pendientes |

No todos los pasos requieren una simulación: clasificación, cálculo, interpretación y decisión también son acciones válidas. Las respuestas incorrectas deben aportar una pista del error y permitir reintentar. Las explicaciones abiertas se apoyarán en criterios concretos; inicialmente no se promete una corrección automática fiable de cualquier texto.

**Cuando la guía exige una operación manual, el paso incluirá esa operación sobre elementos virtuales.** Fabricar un cable debe permitir preparar sus extremos, ubicar conductores, soldar y medir; una pregunta o una animación de demostración por sí solas no cumplen ese objetivo. Cada guía se descompondrá en materiales → herramientas → operaciones → comprobaciones → prueba funcional → evidencia.

El progreso distinguirá al menos empezado, practicado y comprobado. Consultar un PDF no equivale a dominarlo. Se podrá volver a cualquier paso y consultar clases previas; un objetivo pendiente se muestra sin castigar la navegación.

## 4. Primera entrega concreta

**Prioridad práctica añadida: Redes → Unidad 1 → Guía 1 → Fabricación y comprobación del cable.** Preparar un banco con cable, DB9, terminal de tornillos, herramientas y multímetro; ejecutar preparación, soldadura y pruebas. Este recorrido comprobará que el formato permite hacer lo que solicita una guía, además de explicarlo. La validación del cable requiere el esquema revisado por las contradicciones ya registradas en F34. No se copiará automáticamente la asociación errónea entre alimentación y datos.

El recorrido conceptual siguiente permanece definido:

**Instrumentación → Unidad 1 → Conferencia 1: medir, decidir y actuar.**

Es una primera entrega completa porque prueba identidad, navegación, explicación visual, pregunta, acción, tarea, progreso y referencia al PDF. Además aprovecha la escena de tanque que ya existe. Su objetivo es aprender a reconocer el lazo y clasificar instrumentos, sin exigir todavía un modelo físico nuevo de presión o temperatura.

| Bloque dentro de la conferencia | Acción propuesta | Criterio de cierre |
|---|---|---|
| Automatización y beneficios, pp. 2–6 | Elegir qué actividad automatizar y justificar el beneficio | Distingue hardware/conocimiento y el rol de supervisión |
| Medir/decidir/actuar, pp. 7–8 | Ordenar funciones y asignar equipos | Relaciona sensor, controlador y actuador |
| Lazo de nivel, pp. 9–10 | Cambiar una consigna/umbral y observar el recorrido de la señal | Distingue valor deseado, medición y acción. Las decisiones concretas usan un modelo declarado |
| Familias de equipos, pp. 11–15 | Identificar sensor/controlador/actuador sobre la escena | Explica la función del equipo seleccionado |
| Funcionalidad, pp. 16–25 | Clasificar varios instrumentos, aceptando categorías múltiples | No confunde transmisor, indicador, transductor e interruptor |
| Variables, pp. 26–37 | Elegir qué variable se necesita medir en distintos casos | Relaciona instrumento, variable y proceso |
| Tarea 1 y comprobación | Registrar ejemplos propios con su fuente y resolver un caso con menos ayuda | Conserva la actividad docente y sus criterios |

Las portadas y cierres se conservan en el PDF. El índice mostrará todos los bloques para no reducir la conferencia a una demostración del tanque.

Para usar la simulación: abrir una copia de práctica identificada, proteger la sesión libre existente, disponer de reinicio local y retorno al punto de la clase. Las acciones permitidas se limitan al objetivo del paso. Cualquier adaptación de consigna o control distinta del banco original debe indicarse como modelo didáctico.

## 5. Etapas y entregables

| Etapa | Trabajo | Resultado revisable | Terminado cuando… |
|---|---|---|---|
| 0. Fuentes y pautas | Identificar cada archivo, confirmar ubicación, resolver observaciones que afecten al primer bloque | Catálogo y registro de correcciones | Hay referencia por bloque y no se usan soluciones contradictorias |
| 1. Marco visual modo. | Simplificar tarjetas, unidades y vista de clase con componentes existentes | Recorrido navegable de la primera entrega | Se entiende qué elegir y cómo volver; escritorio/móvil legibles |
| 1B. Primer banco de fabricación | Adaptar Redes U1 Guía 1 con piezas y operaciones manipulables | Cable virtual preparado, soldado y comprobado | La topología y los defectos cambian las mediciones; no basta pulsar “terminado”. Después incorporar prueba funcional HMI–PLC con modelo de comunicación explícito |
| 2. Primera conferencia completa | Guion, escenas, preguntas, tarea y progreso de I02 | Conferencia 1 funcional | Todos los bloques relevantes tienen cobertura y la práctica libre permanece intacta |
| 3. Metrología | Adaptar I03 con sus dos ejercicios y pauta numérica revisada | Segunda clase y gráficos de lectura | Diferencia referencia/media, sesgo/dispersión y valida datos/unidades/redondeo |
| 4. Biblioteca de Instrumentación | Conferencias de caudal, presión, nivel y temperatura como recursos independientes; sensores discretos en U2 | Clases visuales y modelos necesarios | No se confunde una animación conceptual con un cálculo físico ni PNP/NPN con NA/NC |
| 5. Extender a los otros ramos | Reutilizar la estructura en Electrónica, Máquinas, Matemáticas y Redes | Nuevos bloques completos por clase | Fuentes y actividades conservan su identidad y no se omiten temas |
| 6. Completar lo pendiente | Guías de laboratorio, P&ID, Administración y unidades restantes al recibir fuentes | Mapa de cobertura actualizado | La interfaz distingue material disponible de pendiente |

Dentro de la etapa 5, priorizar: Electrónica clases 1–4 y sus prácticas DC; arranque manual estrella–triángulo y Protecciones; funciones con gráficos; codificación/errores y luego comunicación HMI–PLC. AO, motores con curvas y comunicación serial requieren sus modelos específicos; su inclusión se planifica con esos desarrollos, sin simularlos solo cambiando etiquetas.

No se fijan fechas académicas ni una duración artificial por página. Cada etapa se puede revisar por su resultado concreto.

## 6. Organización técnica propuesta

Esto es una dirección de implementación, no un cambio ya realizado:

- Ampliar `classCatalog.ts` con fuentes verificadas y sus funciones: clase, tarea, guía, presentación y consulta. Evitar colisiones entre las dos Conferencias 2 mediante identificadores que incluyan unidad y tema.
- Revisar el indicador actual de disponibilidad del ramo: hoy está vinculado principalmente a Protecciones. Debe distinguir recibido, adaptado y comprobado en cada material, en vez de habilitar todo un ramo con un único booleano.
- Construir la vista guiada en `src/study/`, reutilizando tarjetas, explicaciones y herramientas válidas. El recorrido de Protecciones seguirá funcionando con sus identificadores y progreso anteriores.
- Separar datos docentes, pasos y componentes de escena. Registrar fuente/página, objetivo, acción, criterio, limitaciones del modelo y referencias de corrección para cada bloque.
- Persistir progreso por ramo/unidad/clase/actividad sin borrar los datos anteriores ni los proyectos del laboratorio. Definir una migración compatible antes de tocar almacenamiento.
- Reutilizar los tokens de modo. en los estilos del campus y la clase. Evitar estilos globales que afecten el panel o el laboratorio libre.
- Cargar contenido, PDF y escenas al entrar en la clase; no importar todas las páginas renderizadas como recursos de producción. Las imágenes de revisión son evidencia de análisis, no assets finales obligatorios.
- Introducir modelos nuevos con contratos y unidades explícitos. El tanque actual es un balance de volumen; presión, temperatura, propiedades de sensor y RS485 necesitan cálculo propio cuando se enseñen cuantitativamente.

## 7. Plan de verificación

Para la primera implementación se verificará el recorrido completo: elegir ramo → abrir unidad → empezar clase → responder → actuar → recibir explicación → completar → recargar → continuar en el punto guardado.

| Área | Criterio |
|---|---|
| Cobertura | Cada objetivo de la conferencia tiene un paso o actividad identificable; tarea independiente conservada |
| Corrección | No aceptar una categoría única donde la fuente permite varias; los ejemplos explican por qué son válidos |
| Navegación | Regresar, consultar PDF y retomar no pierden las respuestas ni desorientan |
| Datos | La práctica guiada no sobrescribe el proyecto libre y la migración conserva el progreso de Protecciones |
| Accesibilidad | Teclado, foco visible, alternativa al arrastre, textos/estados sin dependencia exclusiva de color |
| Pantallas | 390 px y escritorio; sin controles ocultos, desbordamiento ni contenido ilegible |
| Modelos | Unidades, límites, referencias y condiciones coherentes; el gráfico refleja las acciones |
| Proyecto | Ejecutar `npm run check` y `npm run build`; pruebas de navegador del flujo afectado y comprobación de preservación |

En Metrología se añadirán comprobaciones numéricas con los datos reales de las dos tablas: 98,82 °C / −1,18 °C / 0,103280 °C, y 1,497 m / −0,003 m / 0,016364 m. Aceptar coma decimal, unidades y redondeo razonable; no usar un texto idéntico a la pauta como única respuesta válida.

## 8. Situación al cerrar esta planificación

Preparados: análisis de los ocho documentos, ubicación y cobertura, observaciones técnicas, pauta de los ejercicios de metrología y plan de la primera entrega.

Pendiente de implementación: interfaz y clases guiadas, incluidos los bancos de temperatura y detectores descritos en las tres guías prácticas recién recibidas. Pendiente de fuentes: P&ID, fichas de los equipos físicos y demás vacíos registrados. La primera entrega está definida para poder construirla sobre el proyecto actual, con la identidad modo. y el orden docente reconocibles.
