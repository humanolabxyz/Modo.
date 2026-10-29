# Inicio sin hueco y GeoGebra integrado

Cambios locales del 18 de octubre de 2026. Sin despliegue.

- En móvil y tablet táctiles, la vista ampliada reemplaza la tarjeta original dentro del flujo. No se reserva un espacio vacío ni se muestran ambas tarjetas. Se mantienen Entrar, cierre y animaciones; escritorio conserva el despliegue superpuesto.
- GeoGebra usa LaboratoryBar, la mesa continua, los controles agrupados y la ventana flotante común. El área matemática se adapta al alto disponible. La interfaz interna de GeoGebra conserva sus herramientas originales.
- El botón Lecciones abre un catálogo de funciones y matrices desde cualquier práctica.
- Tres prácticas complementarias, 11 actividades: datos y operaciones (4), producto y orden (3), determinante/inversa/sistemas (4). Cada actividad explica el problema, permite consultar comandos y comprueba objetos reales. Se añaden a la unidad 4 de Funciones y Matrices en Estudio, con comprensión, práctica y revisión conceptual.
- Estas prácticas nuevas se identifican como complementarias; no se atribuyen a una guía docente inexistente. Referencia de sintaxis: https://geogebra.github.io/docs/manual/en/Matrices/
- Los archivos y avances siguen separados por lección y del archivo libre.

## Archivos

src/styles/modo-launchpad.css; src/lab/LaboratoryApp.tsx; src/lab/GeoGebraView.tsx; src/styles/geogebra.css; src/learning/geogebraLessons.ts; src/study/classCatalog.ts; src/study/ToolLessonStudy.tsx.

## Verificación

- npm run check y npm run build: correctos.
- node qa/verify-touch-card-overlay.cjs: reemplazo en la posición original, sin hueco, entrada y cierre en 390×844, 820×1180, 1180×820 y 844×390.
- node qa/verify-home-preview-motion.cjs: apertura, retorno, cambio de sección y movimiento reducido correctos.
- node qa/verify-geo-unified.cjs: las 11 actividades pasan con GeoGebra real; el trabajo vacío se rechaza, el avance se conserva al recargar y la revisión conceptual funciona desde Estudio. Cambio de herramienta sin perder archivo, comprobación de una actividad de funciones anterior y archivo libre preservado. Entrada de comandos y comprobación táctil en móvil. Catálogo y superficie dentro de las cuatro pantallas anteriores.
- Evidencias: qa/geo-unificado/verification.json, catalog-desktop.png, matrices-operaciones.png, matrices-producto.png, matrices-sistemas.png, matrices-mobile.png, geo-390.png y capturas tablet/horizontal. Inicio: qa/entrada-directa/touch-overlay-390.png.
- Pruebas de navegador con tamaños y tacto emulados; no ensayos en dispositivos físicos. Respaldos previos en qa/geo-unificado/.
