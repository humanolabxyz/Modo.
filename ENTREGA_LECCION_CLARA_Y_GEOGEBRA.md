# Lección clara y GeoGebra adaptable

## Resultado

El detalle de Matemáticas muestra el tema seleccionado, sin desplegar el repaso completo. Entender, ejemplo y práctica presentan un paso o pregunta a la vez. La gráfica, el cambio de actividad y los documentos originales se abren cuando se necesitan. El inicio de los ramos y las unidades replegadas se conservan.

Eliminación de fármacos empieza explicando los datos en palabras simples: 1000 mg al comenzar, eliminación del 10% de lo que queda cada hora y objetivo de llegar a 500 mg. Sus cinco explicaciones pasan de la pregunta y las primeras dos horas al factor 0,9, la ecuación y la interpretación del tiempo. La fórmula aparece después de los dos primeros pasos. Se explican t, M(t), mg y la operación con ln. Los valores y criterios de corrección se mantienen.

Ver la gráfica es un botón visible con icono e instrucción. La gráfica muestra una línea de referencia en 500 mg, un punto que sigue el control de horas y una frase con el resultado. Su SVG adapta las coordenadas al ancho real para conservar la legibilidad en teléfono. Los cuatro problemas del profesor conservan sus preguntas y respuestas; Resolver paso a paso muestra una sola parte del procedimiento cada vez.

GeoGebra comparte una barra compacta para título, acciones y vista en tamaños táctiles. Inicia con la gráfica completa en teléfono y tablet; Álgebra sigue disponible en el selector. Ampliar gráfica oculta las barras externas sin recrear el applet; Volver a controles restaura la navegación. El redimensionamiento conserva la construcción al girar. Los avisos de comandos permiten pulsar los controles situados debajo.

## Archivos

- `src/study/MathUnitReview.tsx`: lección por pasos, práctica de una pregunta y gráfica interactiva adaptable.
- `src/study/mathUnit2.ts`: explicación inicial y desarrollo básico de eliminación de fármacos.
- `src/study/StudyClassContext.tsx`: cambio de actividad bajo demanda y eliminación de controles vacíos.
- `src/study/FunctionProblemNotebook.tsx`: resolución guiada por pasos de los cuatro problemas.
- `src/styles/lesson-focus.css`, `src/styles/problem-notebook.css`: lectura, controles y ayuda.
- `src/lab/GeoGebraView.tsx`, `src/styles/geogebra-workspace.css`: espacio de trabajo compacto y ampliado.
- `qa/verify-lesson-focus.cjs`, `qa/verify-unit-modules.cjs`: comprobaciones de interacción y conservación.

## Validación

Instalación, TypeScript y compilación completados. `node qa/verify-lesson-focus.cjs` comprueba explicación previa a la fórmula, cambio real de la curva con el control, pasos de ejemplo, error y acierto, respuestas conservadas, cuatro procedimientos guiados, ajuste de la lección a 390/820/1440 px y orientación de GeoGebra en una misma sesión.

`verify:unit-modules` comprueba las seis tarjetas, inicio replegado y regreso al módulo. `verify-function-problems.cjs` verificó 17 preguntas y 28 actividades reales de GeoGebra, además del guardado independiente. `verify:study-navigation` pasó después de corregir el aviso que interceptaba pulsaciones en horizontal.

GeoGebra se comprobó a 820×1180, 1180×820, 390×844 y 844×390, con rotación de ida y vuelta, mismo iframe, objeto conservado y tamaño nativo ajustado al contenedor. En tablet horizontal, el área del applet pasó de unos 536 a 660 px de alto; ampliado utiliza la altura disponible salvo los 44 px del control de la actividad. Son pruebas con tamaños y tacto emulados en Chromium, no validación en dispositivos físicos.

## Capturas

- [Detalle anterior, proporcionado por el usuario](qa/lesson-focus/lesson-before-1920.png)
- [Detalle simplificado](qa/lesson-focus/lesson-after-1440.png)
- [Explicación y gráfica en teléfono](qa/lesson-focus/graph-basic-390.png)
- [GeoGebra anterior en tablet horizontal](qa/lesson-focus/geo-before-1180.png)
- [GeoGebra adaptado](qa/lesson-focus/geo-after-1180.png)
- [GeoGebra ampliado en horizontal](qa/lesson-focus/geo-expanded-landscape-clear.png)

Resultados guardados en `qa/lesson-focus/verification.json`, `qa/unit-modules/verification.json`, `qa/teacher-problems/verification.json` y `qa/study-navigation/verification.json`. Trabajo local sin publicación.
