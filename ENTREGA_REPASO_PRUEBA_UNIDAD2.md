# Repaso de la prueba de la Unidad 2

El ramo Funciones y Matrices tiene un acceso visible a Repasar Unidad 2. El repaso principal se basa en las cuatro actividades formativas indicadas por el usuario: población, estroncio, ahorro en bancos y altura de una planta.

Cada fila abre la lección correspondiente: contexto, significado de la fórmula, comprobación conceptual, preguntas del profesor y construcción en GeoGebra. El repaso muestra por separado las respuestas comprobadas y las actividades realizadas en GeoGebra. Recomienda la primera actividad que aún no tenga ambas partes completadas. Entrar a una pantalla no registra ninguna comprobación.

El parámetro `repaso=unidad2` mantiene el contexto al pasar entre el cuaderno y GeoGebra. Desde la lección se puede volver al repaso; después de completar las preguntas y la práctica se puede seguir a la siguiente actividad formativa. Los datos existentes se conservan en sus mismas claves. Un registro incompatible se conserva y aparece como avance que no se pudo leer.

Las cinco lecturas y sus preguntas de apoyo están en el apartado opcional Refuerza las bases. Las unidades mantienen su inicio replegado y las seis tarjetas de Mis ramos siguen visibles.

## Archivos

- `src/study/Unit2ExamReview.tsx`: recorrido, contadores validados y refuerzo opcional.
- `src/styles/unit2-exam-review.css`: acceso del ramo, lista y adaptación móvil.
- `src/study/ExamReviewContext.tsx`: enlace de regreso al repaso.
- `src/study/CourseOutline.tsx`: acceso e integración del repaso.
- `src/study/ProblemLessonIntro.tsx`, `FunctionProblemNotebook.tsx`: continuidad y paso a la siguiente actividad.
- `src/learning/geogebraLessons.ts`: conservación del contexto en los enlaces.
- `src/study/MathUnitReview.tsx`: continuidad desde las fórmulas de apoyo.
- `src/study/StudyHub.tsx`: limpieza del contexto al cambiar o salir del ramo.
- `src/study/classCatalog.ts`, `mathCourseModules.ts`: nombres y descripción del repaso.

## Validación

Instalación, TypeScript y compilación completados. `qa/verify-unit2-exam-review.cjs` pasó el recorrido real de población: cuatro respuestas, cuatro actividades comprobadas por GeoGebra, regreso con el contexto conservado y recomendación de estroncio. También comprobó los cinco temas de apoyo, ausencia de desbordamiento a 390/820/1440 px y conservación de un guardado incompatible.

`qa/verify-lesson-focus.cjs` y `verify:unit-modules` pasaron sus regresiones: lectura por pasos, fórmulas, práctica, respuestas guardadas, GeoGebra vivo al rotar, seis ramos y unidades replegadas. Las pruebas se ejecutaron en Chromium con tamaños emulados, no en dispositivos físicos.

- [Repaso en teléfono](qa/unit2-exam-review/review-390.png)
- [Repaso en escritorio](qa/unit2-exam-review/review-1440.png)
- [Resultados](qa/unit2-exam-review/verification.json)

Las capturas reflejan el avance obtenido durante la prueba automatizada, en un contexto de navegador separado. No representan ni modifican el avance del navegador del usuario. Trabajo local, sin publicación.
