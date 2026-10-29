# Entender la fórmula → resolver → practicar

Se incorporó una entrada de lección para los cuatro problemas de las capturas: población, estroncio, bancos y planta. El alumno empieza por el contexto y el objetivo, abre los significados de los símbolos y responde una pregunta conceptual antes de pasar a resolver. Las fórmulas muestran exponentes y bases como notación matemática.

La comprobación conceptual permite corregir una respuesta equivocada. Al acertar aparece «Ya comprobaste la idea. Llevémosla a la práctica»: el alumno abre las preguntas originales, con la resolución paso a paso disponible. Al comprobar todas las respuestas aparece la transición a la lección correspondiente de GeoGebra. Esta transición no marca la construcción ni la práctica como realizadas. Las respuestas, observaciones y archivos mantienen sus claves existentes.

Las cinco lecturas de la Unidad 2 también permiten tocar la fórmula para abrir explicaciones de sus símbolos: función, entrada, potencias, factores, logaritmos y unidades. Al terminar sus preguntas ofrecen aplicar la idea a un problema del profesor. Esta transferencia identifica que cambian el contexto y los datos; no presenta el ejercicio de estroncio como si fuera el documento de fármacos.

## Archivos de implementación

- `teacherProblemTeaching.ts`: explicación básica y comprobación conceptual de los cuatro problemas.
- `ProblemLessonIntro.tsx`: recorrido de entrada, significados interactivos y paso a las preguntas.
- `ProblemFormula.tsx`: notación matemática compartida.
- `FormulaMeaning.tsx`: significados de símbolos de las cinco lecturas de la Unidad 2.
- `FunctionProblemNotebook.tsx`: integración, repaso voluntario y transición a GeoGebra.
- `MathUnitReview.tsx`: fórmula interactiva y transferencia a ejercicios del profesor.
- `lesson-focus.css`: controles, símbolos y composición adaptable.

Los archivos anteriores están en `src/study/`, salvo la hoja de estilos, en `src/styles/`. Se actualizaron las pruebas de regresión para que el atajo visible «Ir a las preguntas» no simule haber superado la comprobación conceptual.

## Material del profesor

La auditoría local encontró 17 fuentes de Matemáticas: 14 PDF, dos archivos de enlaces y una captura del aula. Los archivos registrados existen y no se encontraron discrepancias frente a los hashes registrados. Evidencia: `qa/problem-lessons/source-audit.json`.

Los cinco documentos de la Unidad 2 están incorporados:

| Fuente | Documento | Trabajo disponible |
| --- | --- | --- |
| F37 | Funciones exponenciales, 6 páginas | Lectura, ejemplo, dos preguntas de repaso, gráfica y comandos de apoyo; aplicación a población |
| F38 | Crecimiento de bacterias, 3 páginas | Modelo, ejemplo, dos preguntas, gráfica y observación sobre la fórmula logística impresa |
| F39 | Eliminación de fármacos, 1 página | Cinco explicaciones básicas, ejemplo, dos preguntas, gráfica y aplicación a otro modelo de disminución |
| F20 | Funciones logarítmicas, 4 páginas | Lectura y guía existente de GeoGebra; repaso del dominio, imágenes y preimágenes |
| F30 | Seguidores en Instagram, 3 páginas | Actividad existente y repaso de dominio, datos y tasa media |

Esto describe las adaptaciones implementadas; no equivale a afirmar que todos los ítems de todos los documentos tienen corrección automática. Los cuatro problemas de las capturas mantienen 17 preguntas y sus 17 actividades en GeoGebra. Las tres prácticas complementarias de matrices añaden 11 actividades. El encuadre, el rotulado y las explicaciones abiertas conservan su revisión visual o docente.

Siguen faltando los enunciados de los módulos de trigonometría, Proyecto ABPro y evaluación sumativa indicados en el aula. No se inventó ese contenido ni se marcó la asignatura completa.

## Validación y capturas

- Instalación, TypeScript y compilación completados.
- `qa/verify-problem-lessons.cjs`: cuatro introducciones, botones de símbolos, respuesta incorrecta/correcta, regreso sin respuestas inventadas, enlace al GeoGebra real y adaptación a 390/820/1440 px.
- `qa/verify-lesson-focus.cjs`: lectura, ejemplo, práctica, transferencia, respuestas conservadas, gráfica interactiva y rotación del applet vivo.
- `verify:unit-modules`: inicio de ramos, unidades replegadas y regreso al módulo conservados.
- `verify:geogebra`: preguntas, construcción real, avance y persistencia; resultados detallados en sus informes JSON.

[Lección en teléfono](qa/problem-lessons/lesson-390.png), [significados en escritorio](qa/problem-lessons/poblacion-symbols-1440.png), [bancos](qa/problem-lessons/ahorro-symbols-1440.png).

Pruebas en Chromium con tamaños emulados; no realizadas en dispositivos físicos. Trabajo local, sin publicación.
