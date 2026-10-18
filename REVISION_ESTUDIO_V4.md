# PanelLab · estudio por pasos

La revisión anterior mostraba demasiada información antes de permitir una acción: índice permanente, encabezados repetidos, tarjetas de resumen, pestañas de lectura y una actividad extensa. Esta revisión reorganiza el recorrido inicial. Conserva las explicaciones completas como material de consulta.

## Recorrido actual

Cada uno de los ocho temas tiene tres pasos:

1. **Mira:** una pregunta concreta, una idea breve, el componente o referencia visual y un botón para empezar.
2. **Prueba:** una interacción acotada. Se cambia una variable o condición y se explica el efecto observado.
3. **Resuelve:** un reto de cierre con respuesta, corrección razonada y avance al siguiente tema.

Los experimentos incluyen clasificación de fallas, coordinación de corrientes, bandas B/C/D, lectura de placa de fusible, corrección del conductor, rango de guardamotor, desequilibrio de ida/vuelta y corriente del motor al cambiar el rendimiento.

La nominal de protección, nominal didáctica del interruptor, temperatura, corriente de vuelta y rendimiento se modifican con controles de rango utilizables con teclado y tacto. Los resultados se calculan con el modelo existente. Los valores supuestos y los límites de la comprobación siguen identificados.

## Navegación y detalle

El índice permanente pasa a un menú buscable. La navegación Aprender/Practicar/Evaluarme/Progreso se concentra en una barra. No hay barras superpuestas mientras se responde.

«Entenderlo con más detalle» y «Necesito una explicación» abren la consulta del tema: desarrollo completo, ejemplos, errores, glosario y reflexión escrita. El diálogo mantiene el foco de teclado, permite Escape y conserva las notas anteriores. Los pasos y respuestas del recorrido se guardan en el esquema existente sin borrar el progreso anterior.

La práctica de alternativas muestra **una pregunta de las cuatro** cada vez. Conserva navegación entre preguntas, respuestas guardadas, pistas y correcciones. Los ocho ejercicios con campos libres se mantienen en «Ejercicio interactivo». El simulacro conserva sus 8 alternativas y 3 desarrollos, envío explícito, corrección y rúbrica posterior.

## Evidencia visual

Antes: [entrada de la revisión anterior](qa/estudio-v3/desktop-top.png).

Después: [entrada actual](qa/estudio-v4/inicio-desktop.png), [primer paso en móvil](qa/estudio-v4/mira-390.png), [experimento de motor](qa/estudio-v4/prueba-390.png), [reto y corrección](qa/estudio-v4/reto-390.png).

Las capturas anteriores permiten comparar la densidad y jerarquía. No sustituyen la aceptación visual del usuario.

## Verificación

- `npm install`: dependencias al día. Permanecen los tres avisos de auditoría ya presentes; no se aplicaron actualizaciones forzadas ajenas a esta revisión.
- `npm run check` y `npm run build`.
- `node qa/verify-study-focus.cjs`: ocho recorridos completos; experimentos y teclado; respuestas faltantes, incorrectas y correctas; coma decimal; recarga; ocho ejercicios libres; 32 alternativas de una en una; simulacro 8+3; progreso y notas conservados; cinco tamaños entre 360 y 1920 px; foco en consulta; búsqueda; recorrido táctil real; recursos y errores de navegador.
- `node qa/verify-study-storage.cjs`: teclado, exportación/importación, reinicio con cancelación, archivo inválido, cuota agotada, toque y caché offline aislado. Sus accesos se actualizaron a la navegación actual.
- `npm run verify:simulation-ui`: regresión del panel práctico en siete tamaños, controles, conexiones, pilotos, protecciones simuladas y recuperación.

Para las pruebas estáticas se utiliza `PANELLAB_URL=http://127.0.0.1:4331/`. Los scripts visuales de las revisiones V1–V3 documentan sus interfaces anteriores; la prueba del recorrido vigente es `qa/verify-study-focus.cjs`.

Reporte: `qa/estudio-v4/verification.json`. La comparación de hashes usa `qa/estudio-v4/baseline-hashes.json` y comprueba que el panel práctico, Inicio, conexiones/Comparar, modelos, banco de preguntas y materiales originales no cambiaron.

## Alcance de archivos

Nuevos: `LessonJourney.tsx`, `QuickExperiment.tsx`, `journeyContent.ts`, `study-focus.css` y pruebas/capturas V4.

Integración: `StudyApp.tsx`, `StudyNavigation.tsx`, `Practice.tsx`, enlace opcional de retorno desde `LessonGuide.tsx` e importación de estilo exclusiva en `src/pages/estudio.astro`.

Trabajo exclusivamente local. No se desplegó. La mejora de claridad y motivación debe confirmarse con el usuario; las pruebas verifican funcionamiento y disposición, no interés subjetivo.
