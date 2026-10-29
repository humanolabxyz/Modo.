# GeoGebra adaptable e interactivo · 18 de octubre de 2026

Mejora local posterior a la publicación 2.1.0. No se desplegó esta revisión. Vista de desarrollo: http://127.0.0.1:4344/laboratorio?tool=geogebra. Compilación verificada: http://localhost:4350/laboratorio?tool=geogebra.

## Comportamiento

- Móvil vertical: controles Trabajo / Lección. La guía ocupa una superficie de lectura propia; no tapa un área de trabajo visible. Al trabajar, una barra mantiene el título de la actividad, la comprobación y el acceso al paso siguiente.
- Tablet y móvil horizontal: guía y herramienta lado a lado. La guía tiene desplazamiento propio y mantiene visibles Comprobar, Anterior y Siguiente. En horizontal bajo, vista y controles comparten una fila para liberar altura.
- Selector de Álgebra, Gráfica, ambas o CAS. Matrices inicia en Álgebra, sin barra de geometría innecesaria. Las herramientas geométricas vuelven al seleccionar Gráfica o ambas.
- Archivo agrupa guardado, descarga e importación .ggb en la ventana común. Catálogo dividido en Matrices y Funciones, con la lección actual identificada.
- Los comandos de ayuda se llevan a la entrada para revisar y ejecutar; no resuelven ni aprueban automáticamente. Un resultado que vuelve a comprobarse como incorrecto retira la aprobación de ese paso.
- La entrada en vista CAS crea una fila nueva, conserva las anteriores y guarda los resultados en el archivo. Preparar comandos de una lección desde CAS vuelve a Álgebra para construir los objetos que comprueba la actividad.
- Cambiar orientación conserva el mismo iframe, la instancia del motor, los objetos, notas y paso actual. ResizeObserver ajusta el área nativa y visualViewport adapta el alto disponible cuando aparece el teclado.
- Se desactiva el autoescalado de la integración: antes el contenedor podía medir 818 px mientras el motor aparecía reducido a unos 172 px. Ahora se comprueba una escala 1:1 y coincidencia entre dimensiones del iframe y del motor tras cada giro. El teclado matemático interno no se abre automáticamente sobre la entrada exterior.

## Archivos

- src/lab/GeoGebraView.tsx: flujo de lectura/trabajo, vistas, archivos, catálogo, comandos, CAS y ajuste al viewport.
- src/styles/geogebra-responsive.css: adaptación limitada a GeoGebra, conservando el tema soft UI común.
- src/lab/geogebra/api.ts: tipo de showToolBar.
- public/geogebra-frame.html: el contenedor del motor ocupa el iframe sin escalado adicional. Se mantiene la política CSP aislada, sin ampliar permisos de la aplicación principal.
- QA: verify-geogebra-responsive.cjs, verify-geogebra-native-touch.cjs y actualización de los selectores de archivo/guía en verify-geo-unified.cjs.

Respaldos en qa/geogebra-responsive/before/. Las otras herramientas, el inicio, los modelos eléctricos y el contenido de las lecciones no se modifican en esta revisión.

## Verificación final

- npm install --ignore-scripts --no-audit --no-fund: dependencias al día. Sin dependencias nuevas.
- npm run check y npm run build: correctos.
- Contra la compilación estática en http://localhost:4350: verify-geogebra-responsive.cjs pasa en 360×800, 390×844, 820×1180, 1180×820, 844×390 y 1440×960, girando cada uno al formato inverso. Comprueba lectura/trabajo sin solapamiento, controles accesibles, geometría interna 1:1, comandos, error/corrección, avance, notas y recarga. Incluye una reducción del viewport mientras se edita la entrada para comprobar el espacio de teclado.
- verify-geogebra-native-touch.cjs pasa en 390×844, 844×390 y 820×1180: toque sobre el lienzo real de GeoGebra crea un punto; la entrada CAS crea dos filas, calcula resultados reales y los conserva al recargar.
- verify-geo-unified.cjs: las 11 actividades de matrices, revisión desde Estudio, cambio de herramienta, archivo libre independiente y actividad de funciones anterior siguen pasando. Catálogo, entrada y comprobación táctil comprobados también en móvil y tablet.
- Los tres reportes finales no contienen errores JavaScript capturados. Capturas y resultados en qa/geogebra-responsive/, incluida integracion/.

Las comprobaciones táctiles y de teclado son emuladas en Chromium; no equivalen a ensayos físicos de iOS/Android. GeoGebra necesita conexión. No se afirma una publicación de esta revisión.

## Referencias técnicas

- https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_API/
- https://geogebra.github.io/docs/reference/en/GeoGebra_App_Parameters/
- https://geogebra.github.io/docs/manual/en/commands/SetPerspective/
- Integración oficial https://www.geogebra.org/apps/deployggb.js (parámetro disableAutoScale y ajuste del contenedor).

## Catálogo por unidades

Las lecciones ahora se separan por las cuatro unidades de Estudio. Los títulos y el orden proceden de src/learning/mathUnits.ts, compartido con classCatalog.ts. La unidad actual se selecciona al abrir el catálogo desde una lección. Cada unidad ofrece un enlace a su lugar en Estudio.

Distribución de las lecciones existentes: Unidad 1, funciones polinómicas (2); Unidad 2, funciones exponenciales y logarítmicas (1); Unidad 3, funciones trigonométricas (sin lecciones GeoGebra, indicado explícitamente); Unidad 4, sucesiones, vectores y matrices (3). Se conservan los IDs, enlaces y datos de progreso.

check y build correctos. qa/geogebra-responsive/verify-units.cjs comprueba los cuatro grupos, el estado vacío, el enlace de unidad, la selección de la lección actual y el ajuste de la ventana en 390x844, 844x390, 820x1180, 1180x820 y 1440x960. Capturas unidades-*.png en qa/geogebra-responsive/. Revisión local.
