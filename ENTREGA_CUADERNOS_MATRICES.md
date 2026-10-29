# Cuadernos de matrices y práctica directa — 19 de octubre de 2026

Implementación local en el proyecto existente; se conserva el marco visual y la navegación del cuaderno.

## Resultado

- Antes: un párrafo y, en el ejemplo, solo los comandos iniciales. Ahora: tres cuadernos con problemas contextualizados, tablas con significado de filas y columnas, tres ideas explicadas y cuatro pasos de resolución por tema.
- Doce preguntas de análisis con respuesta escrita, pista y explicación orientativa desplegables. Se guardan por lección en este navegador; no se califican ni acreditan práctica de GeoGebra.
- Practicar abre directamente GeoGebra con la lección correspondiente. Los enlaces antiguos de paso 1 siguen funcionando como pantalla de retorno y avance.
- GeoGebra conserva los comandos, verificaciones, archivos y avances existentes; incorpora las mismas preguntas de análisis junto a las observaciones.
- Ejemplos complementarios identificados como tales, sin atribuirlos al profesor. Para una adaptación literal a sus problemas se necesitan esos enunciados concretos.

## Archivos de esta intervención

- `src/study/matrixNotebooks.ts`: datos de los tres problemas, explicaciones y preguntas.
- `src/study/MatrixNotebook.tsx`: cuaderno, recorrido por pasos y persistencia de respuestas.
- `src/styles/matrix-notebook.css`: tablas, espacio de lectura y adaptación móvil, con alcance al nuevo cuaderno.
- `src/study/ToolLessonStudy.tsx`: integración del cuaderno y acceso directo al laboratorio.
- `src/learning/geogebraLessons.ts`: contexto de los problemas consistente entre cuaderno y práctica; cálculos y comandos conservados.
- `src/lab/GeoGebraView.tsx`: preguntas consultables en la guía.
- `qa/verify-matrix-notebooks.cjs`: pruebas del recorrido y guardado.

## Verificación

- `npm install`: sin vulnerabilidades informadas.
- `npm run check` y `npm run build`: correctos.
- `node qa/verify-matrix-notebooks.cjs`: ocho comprobaciones; cero errores de página. Tres lecciones, navegación directa, pasos de ejemplo, respuestas al recargar/cambiar de vista, preservación de guardado ilegible, sin progreso ficticio, regresión de acceso a funciones y tamaños 1440/820/390.
- `PANELLAB_QA_OUT=qa/matrix-notebooks/geogebra node qa/verify-geo-unified.cjs`: once actividades de matrices verificadas con GeoGebra real; rechazo de trabajo vacío, persistencia, revisión, archivo libre independiente y controles en cuatro tamaños; cero errores de página.
- Capturas finales: `qa/matrix-notebooks/notebook-1440.png`, `notebook-820.png`, `notebook-390.png`, `example-390.png`. Se revisaron visualmente escritorio y móvil. No se capturó una imagen del estado inicial durante esta intervención; la comparación anterior se basa en el código leído antes de editar.

Todo comprobado en Chromium local, con móvil/tablet emulados. Sin publicación ni prueba en teléfono físico. GeoGebra requiere conexión. El proyecto ya tenía cambios previos ajenos a esta intervención; se conservaron.
