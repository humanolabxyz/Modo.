# Estudio: problemas de clase, navegación y GeoGebra

Cambios locales en el proyecto existente, 19 de octubre de 2026. No se publicó ni desplegó.

## Resultado y alcance

Las capturas corresponden a funciones exponenciales y logarítmicas del ramo Funciones y Matrices, no a operaciones matriciales. Se incorporaron los cuatro problemas con los valores fijados de las capturas: población, estroncio, ahorro en dos bancos y altura de una planta. El recurso original genera otros valores con Nuevo ejercicio; estos no cambian silenciosamente las respuestas locales.

- 17 preguntas con respuesta numérica o interpretación, pista, procedimiento resuelto y razonamiento escrito opcional. Se presenta una pregunta activa. En móvil hay dos paneles: Ver enunciado y Responder pregunta.
- La respuesta incorrecta se distingue en rojo, la correcta en verde, ambas con texto; los campos numéricos usan aria-invalid. El razonamiento libre se conserva pero no se califica automáticamente.
- Las tres prácticas complementarias de matrices conservan sus claves de respuestas y ahora presentan una idea o pregunta por vez.
- Estudio muestra ramo, unidad, intención (aprender/resolver/repasar), actividad siguiente y progreso local existente. Registra la última clase abierta para retomarla; abrir una clase no acredita completarla.
- La unidad 4 indica explícitamente que los cuatro problemas de las capturas están en la unidad 2. El programa completo y los originales siguen disponibles en un desplegable.
- GeoGebra abre con la gráfica como superficie principal. Guía, Comandos y Resultados son controles superpuestos que se despliegan y repliegan sin sustituir el applet. Se reutiliza lab-card-toggle, el patrón de los otros módulos. Resultados usa la ventana flotante compartida, movible y escalable.
- Una comprobación correcta muestra un tick breve y avanza a la siguiente actividad en 700 ms. El último paso queda completo con acceso al cuaderno. Los errores no avanzan y conservan la construcción. Las animaciones respetan reduced-motion.
- Se ajustó el encuadre inicial de cada nuevo problema con espacio para los paneles. El dominio matemático se distingue del encuadre de la cámara.

## Decisiones de contenido contrastadas

- Población: el origen temporal es 2004; para 2015 se usa t=11. El valor inicial incluye +3 y vale 12,5 millones.
- Estroncio: se transcribe el modelo de la captura 237·(0,4)^(t/24)+3. El desplazamiento +3 pertenece al ejercicio y no se elimina.
- Bancos: capitales y ganancias se calculan en miles de pesos. El recurso original responde en meses completos para superar el objetivo; se diferencia del umbral continuo y se usa 21/38 meses completos.
- Planta: se confirmó el logaritmo decimal del applet original. Se despeja el tiempo en días y se divide por 365 porque la pregunta pide años. La altura 14,86 cm está redondeada: aproximadamente 8 años.
- La corrección automática de GeoGebra comprueba objetos y resultados. El texto de los ejes, el encuadre y las justificaciones se revisan visualmente; no se presenta su mera apertura como dominio de la materia.

Originales de Ciencias Básicas Puente Alto: [Población](https://www.geogebra.org/m/YpZwUkA7), [Estroncio](https://www.geogebra.org/m/fx2ZD7cy), [Bancos](https://www.geogebra.org/m/swtJStNE), [Planta](https://www.geogebra.org/m/CTu9cyBj). Se inspeccionó además el XML público de sus applets para contrastar base logarítmica, unidades y criterio de meses completos; las cifras activas se tomaron de las capturas del usuario.

## Archivos principales

- src/learning/functionProblems.ts: enunciados, 17 preguntas, soluciones y actividades de GeoGebra.
- src/learning/geogebraLessons.ts: registro de las nuevas prácticas y límites iniciales de vista.
- src/study/FunctionProblemNotebook.tsx y src/styles/problem-notebook.css: espacio de resolución y guardado independiente.
- src/study/MatrixNotebook.tsx y src/styles/matrix-notebook.css: sustitución del contenido apilado por paneles con una pregunta activa.
- src/study/StudyRoutePlanner.tsx, StudyHub.tsx, CourseOutline.tsx, StudyClassContext.tsx y src/styles/study-navigation.css: navegación, última actividad y colores semánticos.
- src/study/classCatalog.ts, ToolLessonStudy.tsx, MathUnitReview.tsx y src/pages/estudio.astro: integración dentro del ramo existente.
- src/lab/GeoGebraView.tsx, src/lab/geogebra/api.ts y src/styles/geogebra-workspace.css: paneles superpuestos, comandos, confirmación y avance automático. ZoomIn con cuatro límites se ejecuta mediante setCoordSystem porque evalCommand puede devolver false aun después de cambiar la vista.

## Validación

- npm install, npm run check y npm run build correctos.
- qa/verify-function-problems.cjs: 17 preguntas, 28 actividades con GeoGebra real (17 de funciones y 11 de matrices), rechazo de respuestas incorrectas/trabajo vacío, posición y respuestas persistentes, separación del archivo libre, progreso al recargar y regresión de una lección lineal existente.
- qa/verify-study-navigation.cjs: ruta de estudio, unidades sin contenido, última actividad, rojo/verde calculados, aria-invalid y plegado de paneles sin cambio de tamaño ni recreación del applet.
- Tamaños comprobados: 390×844, 820×1180, 1180×820 y 844×390 en Chromium emulado. Sin prueba en dispositivo físico. GeoGebra requiere conexión.
- npm run verify:academic: pasan sus primeras 12 comprobaciones, incluyendo los 47 originales íntegros, catálogo, cálculos, circuitos y persistencia. Falla la comprobación histórica de hashes en src/components/App.tsx. Ese archivo ya tenía cambios al inicio de esta intervención y no se editó aquí; no se alteró el fixture para ocultar la diferencia.
- Los scripts antiguos de QA que presuponen una guía fija y avance manual describen la interfaz anterior. npm run verify:geogebra ejecuta las dos verificaciones nuevas y verify:study-navigation permite revisar la navegación por separado; no se afirma que toda la batería histórica haya pasado.

Informes: qa/teacher-problems/verification.json y qa/study-navigation/verification.json. Capturas finales en ambas carpetas. La comparación de matrices dispone de before-matrix-1440.png y matrix-after-1440.png; no se fabricó una captura inicial de la nueva navegación.
