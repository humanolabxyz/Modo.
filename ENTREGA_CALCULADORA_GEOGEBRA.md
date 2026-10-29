# Calculadora desplegable de GeoGebra

Cambio del 19 de octubre de 2026. La corrección de Gráfica y comandos sustituye el comportamiento anterior ligado a Álgebra.

La vista inicial es Gráfica y comandos. El botón con icono de teclado despliega y repliega un teclado para el campo Comando, con pestañas 123, f(x) y ABC. Las expresiones se ejecutan mediante la API real de GeoGebra. Abrir el teclado no selecciona Álgebra ni cambia la perspectiva. Preparar un comando de ayuda tampoco cambia la vista. El gráfico, los objetos y las respuestas se conservan; las otras vistas solo se eligen mediante el selector.

El acceso al repaso se cambió a «Empezar el repaso», con fondo azul claro y texto azul oscuro. La descripción indica que se resuelven paso a paso cuatro actividades. `qa/verify-review-entry.cjs` verifica los colores calculados, la descripción y el enlace a 390, 820 y 1440 px. Archivos adicionales: `src/study/CourseOutline.tsx` y `src/styles/unit2-exam-review.css`.

Archivos: `src/lab/GeoGebraView.tsx`, `src/lab/GeoCommandKeyboard.tsx`, `src/styles/geo-command-keyboard.css`, `src/styles/geogebra-workspace.css` y `qa/verify-geogebra-keyboard.cjs`.

Validación: `npm run check` y `npm run build` correctos. `qa/verify-geogebra-keyboard.cjs` escribe a=2+3 con las teclas, confirma el resultado real 5, construye la exponencial del profesor con exp(), verifica f(0)=12,5 y comprueba tanto el selector G como la ausencia de Álgebra en el XML del motor. Revisa el mismo iframe, dimensiones, guardados anteriores con Álgebra y selección manual de otras vistas. Correcto en 320×740, 390×844, 844×390, 820×1180, 1180×820 y 1440×960, mediante Chromium emulado. No probado en dispositivos físicos.

Comparación: [teclado abierto en móvil](qa/graph-command-keyboard/open-390x844.png), [gráfica con teclado replegado](qa/graph-command-keyboard/closed-390x844.png), [teclado horizontal](qa/graph-command-keyboard/open-844x390.png).

API de referencia: [entrada y vistas de GeoGebra](https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_API/).
