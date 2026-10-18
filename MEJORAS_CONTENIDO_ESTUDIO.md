# PanelLab · revisión educativa y de lectura

Esta revisión amplía las explicaciones de los ocho temas y reorganiza la interfaz de estudio para leer, calcular y responder con claridad. Se ejecutó exclusivamente en el proyecto local. No se publicó.

## Recorrido de aprendizaje

Cada lección conserva la imagen o esquema del tema y una síntesis inicial. A continuación presenta tres vistas:

- **Explicación:** objetivo, tres secciones desarrolladas, comparación de conceptos y glosario desplegable.
- **Ejemplo resuelto:** procedencia de los datos, situación, tres pasos razonados, conclusión y comprobaciones pendientes.
- **Errores y repaso:** dos ideas equivocadas con su corrección, una pregunta para explicar con palabras propias, respuesta razonada desplegable y experimento sugerido.

Las reflexiones y la vista de lectura elegida se guardan con el progreso existente. Las reflexiones no reciben una nota automática. Cambiar de caso conserva estas notas.

La actividad se trasladó a una sección de ancho completo debajo de la lectura. Los accesos «Comprender el tema» y «Explorar y resolver» permiten saltar entre ambas partes. Esto evita comprimir simultáneamente fotografías, texto y controles en columnas estrechas.

## Cálculos y respuestas

- Campos numéricos con ayuda sobre significado, unidades y formato; admiten coma o punto decimal y solicitan teclado decimal en móvil.
- Datos del problema y respuesta del estudiante separados visualmente. Las respuestas numéricas explican que debe escribirse solamente el número en A.
- En aprendizaje se muestran resultado y procedimiento actualizado con los datos actuales. En práctica, motor y conductores muestran el procedimiento después de comprobar.
- Motor: conversión de kW a W, denominador con √3, tensión entre líneas, rendimiento y factor de potencia, división e interpretación.
- Conductores: producto de factores, capacidad corregida y distinción de las otras verificaciones pendientes. El procedimiento conserva precisión intermedia para evitar presentar operaciones inconsistentes por redondeo.
- Termomagnético: multiplicación de ambos extremos de la banda por la nominal, aclarando que no son tiempos de disparo.
- Fuga: resta de magnitudes en A y conversión a mA.
- Correcciones específicas para olvidar la conversión de kW, omitir η/cosφ o responder con Itabla sin aplicar factores.
- La corrección de una actividad recibe foco y se desplaza a la vista. Las alternativas y los desarrollos del simulacro tienen instrucciones explícitas de ingreso, sin mostrar pautas durante el intento.

## Lectura en PC y móvil

Texto oscuro, títulos jerarquizados, bordes visibles, selección marcada con color y borde, respuestas grandes y foco de teclado visible. Lectura con ancho limitado; datos en dos columnas en PC y una en móvil. Navegación móvil con cuatro botones que caben desde 360 px, sin depender de desplazamiento horizontal.

Se midió contraste de texto en explicaciones, ejemplos, tablas, ayudas, respuestas y correcciones. Las muestras comprobadas cumplen los umbrales AA de contraste de texto. Esto no equivale a una certificación integral de accesibilidad.

## Fidelidad al material

Fuente principal: PDF local de José Alfredo Lepin Quezada, 07/10/2026. Las lecciones enlazan sus láminas correspondientes. La ampliación pedagógica desarrolla los criterios del material; no se presenta como transcripción literal del profesor.

Se distinguen los valores del docente de las variantes añadidas. En particular, los casos de coordinación 02/03 se identifican como variantes didácticas; las placas de motor son ficticias. Las bandas B/C/D son magnéticas, no curvas completas de tiempo. La coordinación básica no se presenta como aprobación integral. El 3 % de caída de tensión pertenece al ejemplo de la lámina 12.

## Comprobaciones

- `npm run check` y `npm run build`.
- `qa/verify-study-learning.cjs`: contenido de los ocho temas, navegación de lectura, reflexiones y recuperación, cálculos con coma, diagnóstico de errores, procedimiento posterior a comprobación, contraste, toque real y capturas a 360/375/390/768/1280/1920 px.
- `qa/verify-study.cjs`: ocho actividades, banco de preguntas, casos, generación y envío de simulacros, resultados, revisión, persistencia y conservación del progreso del panel.
- `qa/verify-study-polish.cjs`: navegación, imágenes, menús, foco, pantallas adaptadas, contraste y ausencia de pautas en el intento.
- `qa/verify-study-storage.cjs`: importación/exportación, recuperación, reinicio, cuota agotada y aislamiento del caché offline.
- `npm run verify:simulation-ui`: regresión del panel práctico, controles, conexiones, protecciones simuladas, recuperación y siete tamaños de pantalla.

Evidencia nueva: `qa/estudio-v3/verification.json` y sus 24 capturas. Los hashes de `qa/estudio-v3/baseline-hashes.json` confirman que esta revisión no modificó el Inicio, el simulador práctico, sus conexiones/diagramas/Comparar, los estilos compartidos, el modelo de cálculo, el banco de preguntas ni los materiales originales.

## Archivos principales

`src/study/teachingContent.ts`, `LessonGuide.tsx`, `CalculationSteps.tsx`, `Activity.tsx`, `TermExplorer.tsx`, `StudyApp.tsx`, `Practice.tsx`, `ExamView.tsx`, `src/styles/study-learning.css` y la importación exclusiva en `src/pages/estudio.astro`.

Vista local: http://127.0.0.1:4331/estudio/?v=3
