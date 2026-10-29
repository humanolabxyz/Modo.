# Estudio: explicación, ejemplo y práctica

Actualización posterior: [preparación de la Unidad 2 y fuentes exponenciales recibidas](ENTREGA_UNIDAD_2.md).

Implementación local en el proyecto existente. Esta revisión responde a la falta de diseño y, sobre todo, de explicación antes de pedir una acción. Entrada de revisión: http://127.0.0.1:4342/estudio?curso=s2-4&clase=ri-teoria .

## Qué cambia

- Inicio y ramos con la identidad modo., tipografía Inter, ilustraciones por materia, jerarquía, índice de pasos, fuentes y progreso.
- Las 27 clases académicas y sus 90 pasos abren en **Entender**. Cada tema tiene explicación por ideas, conceptos definidos, recordatorio y **Ver un ejemplo**, con procedimiento y conclusión. **Poner en práctica** conserva la actividad y su comprobación.
- Explorar un esquema o consultar el PDF no aprueba una respuesta. Las comprobaciones, anotaciones, mediciones, desafíos y respaldos mantienen su formato de datos.
- Redes F33: función de una red, medio/protocolo/aplicación, cuatro codificaciones, detección/corrección y las siete capas OSI. La explicación enlaza las páginas pertinentes de F33 y el resumen F35. Se contrastaron las láminas originales y el texto extraído.
- Los apoyos permiten seguir 10110 bit a bit, comparar una alteración con LRC, conservar una suma con datos alterados, verificar el resto de CRC y localizar un único error Hamming. Se declaran las convenciones y los límites de cada demostración.
- Electrónica: señales, diodo, BJT, puente H y límite de amplificación tienen apoyos diferenciados. Instrumentación incorpora el lazo y la distinción entre sesgo y dispersión. Los apoyos matemáticos distinguen relación afín, logaritmo, calibración, utilidad y ajuste de stock.
- Las entradas anteriores de GeoGebra, temperatura y detectores incorporan lectura y ejemplo en su introducción. Protecciones conserva su recorrido docente anterior.

## Archivos de esta revisión

`src/study/lessonTeachings.ts` contiene los textos de apoyo y su selección por tema. `TeachingReader.tsx`, `TeachingVisual.tsx`, `StudyArt.tsx` y `ToolTeaching.tsx` presentan lectura, ejemplos y esquemas. Integración en `AcademicLessonView.tsx`, `AcademicScenes.tsx`, `StudyHub.tsx`, `CourseOutline.tsx` y las introducciones de las tres herramientas anteriores. Los estilos están acotados a Estudio en `src/styles/study-experience.css`, importado por `src/pages/estudio.astro`.

El panel, su cableado, los solvers y los archivos de datos/modelo/progreso académico se comparan con los hashes previos de `qa/estudio-visual/before-hashes.json`.

## Comprobación reproducible

```powershell
npm install --ignore-scripts
npm run check
npm run build
# En otra terminal, si la vista previa no está abierta:
npm run preview -- --port 4342
$env:PANELLAB_URL='http://127.0.0.1:4342'
npm run verify:study-teaching
npm run verify:academic-ui
node qa/verify-academic-integration.cjs
```

Las suites de navegador se ejecutan en secuencia. En el recorrido intensivo, Chromium devolvió `ERR_INSUFFICIENT_RESOURCES` tras numerosas recargas. Las suites docente y académica renuevan su página cada doce rutas conservando el contexto y los datos; mantienen todas las expectativas y registran errores. Los resultados finales se guardan en `qa/estudio-visual/teaching.json`, `qa/estudio-ampliacion/ui.json` e `integration.json`.

Resultado de esta revisión: comprobación de TypeScript y build correctos, 13 grupos de modelos/preservación, 10 comprobaciones docentes, 12 comprobaciones de navegador académico y 4 de integración aprobados. Se recorrieron las 27 clases y 90 pasos, incluido error/corrección, cuaderno tras recarga, CSV, cable, fallas, desafíos y respaldo. La integración verificó tacto emulado, accesos anteriores, los ocho temas de Protecciones y uso sin conexión de una clase y un PDF previamente consultados. Las tres suites de navegador terminaron con cero errores de aplicación.

Capturas comparativas: `qa/estudio-visual/antes-clase.png` / `despues-redes.png`, `antes-inicio.png` / `despues-inicio.png`; ejemplos, códigos, errores y variantes de 390/768 px en la misma carpeta. La revisión visual técnica no equivale a aprobación docente.

## Alcance pendiente

Los bloques de explicación se reutilizan por tema: no constituyen una transcripción ni una adaptación exhaustiva de cada lámina de los 44 originales. Los ejercicios físicos y las tareas abiertas conservan revisión docente. Administración continúa pendiente de material. P&ID, pinouts físicos, proyectos de software industrial y modelos físicos detallados conservan los pendientes documentados en `ENTREGA_ESTUDIO_AMPLIACION.md`.

Los dibujos de apoyo son conceptuales. Las curvas cualitativas se identifican; los cálculos y los datos originales permanecen en la práctica. Los rieles de amplificador, caída del diodo y animación del motor no caracterizan componentes comerciales ni equipos reales.
