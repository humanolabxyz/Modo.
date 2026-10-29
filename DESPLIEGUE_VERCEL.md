# PanelLab en Vercel

Publicado el 14 de octubre de 2026 por solicitud expresa del usuario, que autoriza el despliegue de este proyecto pese a la restricción local de las instrucciones originales.

- Sitio: https://panellab-inacap.vercel.app
- Proyecto: `panellab-inacap`, cuenta/equipo `humanolabxyz-9765s-projects`.
- Despliegue actualizado: `dpl_8R8RreUCoKeymBv7CT5PxPSJkPGz`, estado READY; incorpora selector de color visible en la barra inferior, diagrama con opciones agrupadas, enchufe virtual, animaciones ON/OFF de Fuerza/Control y contactos grises NC / azules NA. Conserva un temporizador, KM2 y el aparato de KM1 centrado según las anotaciones.
- Astro estático, instalación `npm ci`, compilación `npm run build`, salida `dist`.
- `vercel.json` define la compilación. `.vercelignore` publica las fuentes necesarias y todos los recursos de `public`, incluidas las licencias; excluye respaldos, QA, fotografías de trabajo y archivos de entorno.

Verificación pública sin sesión: HTTP 200, 22 archivos públicos con SHA-256 idéntico a los locales, y `verify:routes` pasó sus ocho comprobaciones en siete tamaños de pantalla. Se probaron ramales, selección de SB2, correspondencias editables, siluetas, montaje/deshacer y 95/96 de KM2. Los bundles de aplicación del despliegue final conservan los hashes de la versión probada.

Evidencias: `qa/vercel/assets.json`, `qa/vercel/recorridos-publico.json`, `qa/vercel/desktop.png` y `qa/vercel/mobile.png`.

Las prácticas se guardan en el navegador y pertenecen a cada origen: una práctica guardada en localhost se transfiere al sitio público mediante Exportar práctica / Abrir una práctica guardada.

Para actualizar, desde esta carpeta: `npm run check`, `npm run build` y `npm exec --yes --package=vercel -- vercel deploy --prod --yes`. El proyecto quedó vinculado en `.vercel/project.json` (ignorado). No publicar `.env.local` ni otros archivos de entorno.

La revisión `?view=simulator&revision=diagrama-simple-enchufe` abre el simulador actualizado. Verificación del enchufe, estado de interruptores, desconexión de marcha retenida, contactos y diagrama: `qa/vercel/diagrama-simple-publico.json`.

Última revisión: `?view=simulator&revision=color-visible`. Control Color siempre visible, seis colores rápidos y personalizado; edita el cable seleccionado o define los nuevos. Comprobación pública: `qa/vercel/color-cables-publico.json`, siete tamaños y tacto real. Build remoto y local: App.B4tiX95R.js.

## Revisión 14 de octubre de 2026 · modo móvil y PWA

Desplegada por solicitud expresa del usuario. Despliegue `panellab-inacap-mabh9z1p2-humanolabxyz-9765s-projects.vercel.app`, estado READY, alias de producción https://panellab-inacap.vercel.app.

- Incluye el header mínimo, la hoja inferior (vertical), la ventana flotante (horizontal), la mejora de rendimiento de gestos y la PWA. Detalle en `MODO_MOVIL_PWA.md`.
- `astro.config.mjs` sella `dist/sw.js` al terminar el build (versión de caché y lista de archivos), así que no depende de `scripts/` (que `.vercelignore` excluye). `vercel.json` añade cabeceras: `sw.js` y el manifest sin caché, iconos inmutables.
- Verificación pública sin sesión: HTTP 200 en `/`, manifest, `sw.js`, iconos y modelo; `verify-pwa` pasó contra producción (manifest, iconos, service worker y arranque sin conexión); `verify-mobile` pasó en 390×844, 360×780 y 844×390; `verify-vercel` confirma 29 archivos públicos con SHA-256 idéntico a los locales, salvo `sw.js`, que se comprueba aparte porque el publicado está sellado.
- Para actualizar: `npm run check`, `npm run build` y `npm exec --yes --package=vercel -- vercel deploy --prod --yes`. Las instalaciones existentes recogen la versión nueva en la siguiente apertura con conexión.

## Revisión 14 de octubre de 2026 (2) · ventana flotante en ambas orientaciones

Desplegada por solicitud expresa del usuario. Despliegue `panellab-inacap-qrnp2zwbx-humanolabxyz-9765s-projects.vercel.app`, estado READY, alias de producción https://panellab-inacap.vercel.app (bundle `App.CT3PfHwH.js`, idéntico al compilado localmente).

- El diagrama es una ventana que se mueve y se redimensiona en vertical y en horizontal (sustituye a la hoja inferior de tres posiciones). El banco se encuadra en la parte que la ventana no tapa. Detalle en `MODO_MOVIL_PWA.md`.
- Verificación pública sin sesión: HTTP 200 en `/`, manifest, `sw.js`, iconos y modelo; `verify-pwa` y `verify-mobile` (barra, ventana en ambas orientaciones, giro, toques reales, encuadre y foco) pasaron contra producción; `verify-vercel` confirma 29 archivos públicos con SHA-256 idéntico (`sw.js` se comprueba aparte por estar sellado).
- Las instalaciones de la PWA recogen la versión nueva al abrirla con conexión; si se queda abierta en segundo plano, cerrarla del todo y abrirla dos veces.

## Revisión 14 de octubre de 2026 (3) · diagrama estrella-triángulo

Desplegada por solicitud expresa del usuario. Despliegue `panellab-inacap-29gz7upt7-humanolabxyz-9765s-projects.vercel.app`, estado READY, alias de producción https://panellab-inacap.vercel.app (bundle `App.jAi7wWdR.js`, idéntico al compilado localmente).

- Añade el diagrama estrella-triángulo (transcripción de la foto de CADe_SIMU), accesible con el selector del panel Diagrama y con la entrada «Estrella-triángulo · CADe» del material de estudio. Detalle y puntos por confirmar en `ESTRELLA_TRIANGULO.md`.
- Verificación pública sin sesión: HTTP 200 en `/`, manifest, `sw.js`, iconos y modelo; `verify-pwa`, `verify-estrella-ui` (escritorio y móvil) y `verify-mobile` pasaron contra producción; `verify-vercel` confirma 29 archivos públicos con SHA-256 idéntico (`sw.js` se comprueba aparte).
- Las instalaciones de la PWA recogen la versión nueva al abrirla con conexión; si se queda abierta en segundo plano, cerrarla del todo y abrirla dos veces.

## Publicación 15 de octubre de 2026 · modo. y animaciones

Publicada por solicitud expresa del usuario. Estado **READY**, destino **producción**.

- URL principal: https://panellab-inacap.vercel.app/
- URL del despliegue: https://panellab-inacap-hbphaf1zt-humanolabxyz-9765s-projects.vercel.app
- Despliegue: `dpl_BQgjXf4BZWWYDuKWT3QAheMJb33B`.
- Proyecto/equipo conservados: `panellab-inacap` / `humanolabxyz-9765s-projects`.
- Compilación remota correcta con `npm ci` y `npm run build`; TypeScript local también correcto.
- Página pública confirmada: `modo. — Tu espacio de trabajo`, logo modo. y bundle `App.BmizZgpg.js`.
- `verify:modo` PASS contra producción: ocho tamaños, cuatro modos del panel, 94 bornes, importación y continuación de prácticas, ayuda, estudio, cinco herramientas del laboratorio y recursos de marca. Sin errores recogidos por la suite.
- `verify:pwa` PASS contra producción: manifest, iconos, service worker y arranque sin conexión.
- Evidencias de esta publicación: [deployment.json](qa/vercel-modo-publicado/deployment.json), [verification.json](qa/vercel-modo-publicado/verification.json), [escritorio](qa/vercel-modo-publicado/desktop.png) y [móvil](qa/vercel-modo-publicado/mobile.png).

Los ocho fallos de la ejecución completa anterior y la coherencia de la anulación de movimiento reducido siguen documentados en VERIFICACION_VERCEL_2026-10-15.md; esta publicación no los presenta como resueltos. Las comprobaciones públicas anteriores son las repetidas en esta actualización.

Si una pestaña o PWA abierta conserva la apariencia anterior, cerrarla y volver a abrirla con conexión para recoger la versión nueva.


## Optimización de apertura · 15 de octubre de 2026

Producción READY: dpl_98D9fPMXUU43BwDBqQtNfKto2fdF, https://panellab-inacap.vercel.app/. Fuentes e imágenes reducidas, diagrama/inspector bajo demanda y caché offline esencial con recuperación de navegación a 2 s. Detalle, comparación y límites: [RENDIMIENTO_APERTURA.md](RENDIMIENTO_APERTURA.md). Conserva el diseño y las prácticas guardadas.

## Revisión 16 de octubre de 2026 · ayudas para leer el diagrama estrella-triángulo

Desplegada por solicitud expresa del usuario. Estado **READY**, destino **producción**: https://panellab-inacap.vercel.app/ (despliegue `dpl_C1rEt5CyjGB9zkddkkiVzCRMMpYg`, `panellab-inacap-d3xriyrfp-humanolabxyz-9765s-projects.vercel.app`). Bundles `App.DIkVgezC.js` y `DiagramPane.y7N7VHue.js`, idénticos a los compilados y verificados en local.

- **Símbolos** (ambos diagramas): diccionario con el dibujo real de cada símbolo del esquema, cómo reconocerlo, qué hace al conectarlo y «Ver en el esquema»; además, las letras de las referencias (Q, KM, F, SB/S, H, M, X), líneas y marcas, colores de cables y la diferencia entre potencia y mando. Contenido en `src/data/cadeLearn.ts`.
- **¿Cómo funciona?** (solo estrella-triángulo): recorrido de 8 pasos (idea, potencia línea, estrella o triángulo, reposo, marcha en estrella, cambio a triángulo, enclavamiento, parada y protección). Cada paso resalta las piezas y los conductores que explica, atenúa el resto y encuadra la zona; al terminar se restaura la vista anterior. Avisa que explica la secuencia prevista sin simular energía y que siguen por confirmar el rótulo 13-«12» de KM2 y el orden U2/V2/W2.
- En pantallas angostas la ventana del recorrido se acopla abajo (`FloatingWindow anchor="bottom"`) para dejar el esquema visible; si se arrastra, queda donde la persona la deja.
- PERFECTO conserva su práctica guiada y no muestra el recorrido.
- Verificación: `npm run check` y `npm run build` correctos. Prueba manual sobre una copia compilada fija, a 1440×900 y 375×812: los 8 pasos, Anterior/Siguiente/Terminar, restauración de la vista, diccionario, «Ver en el esquema» y Escape. Sin errores de consola. En producción: HTTP 200 en `/`, `sw.js` sellado (`mvajfiww`) y el bundle publicado contiene el recorrido.

## Migración 16 de octubre de 2026 · modo-lab.vercel.app

Por solicitud expresa del usuario, el sitio pasó a un proyecto nuevo y el antiguo se eliminó.

- **URL actual:** https://modo-lab.vercel.app/ — proyecto `modo-lab` (`prj_tqclHzAbuZzPqfAwvDETHjG8sa7L`), mismo equipo. Despliegue de producción `modo-1f0lozyav-humanolabxyz-9765s-projects.vercel.app`, bundle `App.CBktdcbK.js`.
- **Eliminado:** el proyecto `panellab-inacap` con todos sus despliegues; `panellab-inacap.vercel.app` ya responde 404. Su vínculo anterior quedó en `.vercel/project.old-panellab-inacap.json` (solo referencia).
- **Vista previa de enlaces:** etiquetas Open Graph/Twitter en `src/pages/index.astro` e imagen `public/brand/og-modo.jpg` (1200×630, 128 KB; fuente en `qa/og/`, regenerable con `node qa/og/render.cjs`). No se precarga en la caché offline.
- Las prácticas guardadas en el navegador pertenecen al origen: las de panellab-inacap.vercel.app no aparecen en el dominio nuevo; pasarlas con Exportar práctica / Abrir una práctica guardada si se exportaron antes.
- WhatsApp guarda en caché la vista previa de cada enlace: si aún muestra la tarjeta vieja, compartir el enlace con `?v=2` al final.

## Revisión 16 de octubre de 2026 · pantalla de apertura e instalación como app

- **Pantalla de apertura** (`ModoSplash.astro`, `src/motion/opening.ts`, sección 6 de `modo-motion.css`): al pulsar Laboratorio, Estudio, Simulador o Inicio aparece un fondo blanco con el rayo de la marca; si la carga tarda, a los 0,4 s suma una barra y el texto «Abriendo…». Se retira cuando la app terminó de montarse. Es un aviso funcional, así que se muestra también con movimiento reducido (Windows con animaciones apagadas). Prueba: `qa/verify-opening.cjs` (red lenta, con y sin movimiento reducido).
- **Instalación** (`src/pwa/install.ts`, `src/components/InstallApp.tsx`, `src/styles/install.css`): botón «Instalar como app» en el pie del inicio; aviso «¿Instalar modo. en este equipo?» en PC y Android (usa el aviso nativo del navegador); aviso con instrucciones en iPhone/iPad; diálogo con pasos por dispositivo (iPhone/iPad, Android, Computador). «Ahora no» se recuerda 14 días; no aparece si la app ya está instalada. Prueba: `qa/verify-install.cjs`.
- `estudio` y `laboratorio` ahora declaran el manifiesto y las metas de iOS (antes solo el inicio).
- Si en el iPhone se ve la barra de Safari con una X, la página se abrió desde un chat (visor de WhatsApp/Instagram), no desde el ícono instalado. En iPhone solo se puede instalar desde Safari: Compartir → Añadir a pantalla de inicio.

## Publicación 16 de octubre de 2026 · paneles adicionales, guías y compatibilidad con tablets

Publicada por solicitud expresa del usuario. Estado **READY**, destino **producción**, proyecto vinculado `modo-lab` (equipo `humanolabxyz-9765s-projects`).

- URL principal: https://modo-lab.vercel.app/
- URL del despliegue: https://modo-b2br39m1c-humanolabxyz-9765s-projects.vercel.app (`dpl_2iKCo1ingNqCGUwfgJinHL3QD48H`).
- Incluye: paneles adicionales (KM3, temporizadores) con intercambio y acople, cables con peso, multímetro a escala, temporizador y arranque estrella-triángulo, lecciones guiadas con esquema CADe (marcha y paro, inversión de giro) y arreglo de la pantalla en blanco en tablets (`Compat.astro`). Detalle en `PANELES_ADICIONALES.md`.
- Verificación pública: HTTP 200 en inicio, estudio, laboratorio, comunidad, el mapa de la lección y `sw.js`; el HTML publicado trae el arreglo de compatibilidad; `verify:compat` y `verify:modulos-extra-ui` pasaron contra producción.
- Las instalaciones de la PWA recogen la versión nueva al abrirla con conexión: recargar dos veces o cerrar la app del todo y abrirla de nuevo.
- Para actualizar: `npm run check`, `npm run build` y `npm exec --yes --package=vercel -- vercel deploy --prod --yes`.

## Publicación 24 de octubre de 2026 · versión 2.4.0

Publicada por solicitud expresa del usuario. Estado **READY**, destino **producción**: https://modo-lab.vercel.app/ (despliegue `dpl_De73mMT1c1DcUKc5t3Hm3DHwmzSS`, `modo-iyup3m7h7-humanolabxyz-9765s-projects.vercel.app`), proyecto `modo-lab`.

- Identidad del Home en todas las interfaces, ventanas ajustables (bordes, maximizar, memoria de tamaño), menús convertidos en ventanas y estados con color. Detalle en `CHANGELOG.md` y `/versiones/`.
- Antes de publicar: `npm run check`, `npm run build`, `verify:data` y `verify:wiring` correctos. `verify:routes` y `verify:study-unified` no se ejecutaron con éxito en este entorno (ya fallaban sin los cambios de esta versión) y no se presentan como aprobados.
- En producción: HTTP 200 en rutas principales, `sw.js` y manifest; las hojas de estilo publicadas son idénticas a las del build local; la prueba de ventanas y la de estados (rayo, candado) pasaron contra el dominio público. Evidencia: `qa/release-2.4.0/deployment.json`.

## Publicación 24 de octubre de 2026 · versión 2.4.1 (rendimiento)

Publicada por solicitud expresa del usuario. Estado **READY**, destino **producción**: https://modo-lab.vercel.app/ (despliegue `dpl_A6nPokThjek5sKqvrhQWcK6Cj47X`, `modo-80jlxh7jz-humanolabxyz-9765s-projects.vercel.app`), proyecto `modo-lab`.

- Mejoras de rendimiento sin cambios funcionales: ventanas ocultas fuera del layout, arrastre de ventanas por capa, animaciones decorativas de Estudio solo al apuntar, caché de fuentes e imágenes (`vercel.json`).
- Antes de publicar: `npm run check`, `npm run build` y `verify:data` correctos; pruebas de ventanas, estados y contraste en local sin regresiones.
- En producción: HTTP 200 en rutas principales, 32 de 32 archivos de `_astro` idénticos al build local, cabeceras de caché nuevas activas, prueba de ventanas sin errores de JavaScript y layout de Soldadura medido en 63 ms (476 ms antes, CPU 4×). Evidencia: `qa/release-2.4.1/deployment.json`.
- Límites conocidos, sin resolver: pan/zoom del tablero del Panel y de la Protoboard, y el texto SVG de Temperatura y Detectores.


## Publicación 24 de octubre de 2026 · lección del multímetro

Producción actualizada por solicitud expresa: https://modo-lab.vercel.app/?view=simulator. Despliegue READY `dpl_22smn5Fh9kHnnJ4ZBT4HQ5hKgcU3`. Lección de la Actividad 2, acceso Medir y ventana movible/ajustable. Archivos públicos comparados por SHA-256 con el build local; menú abierto y arrastrado en producción. Detalles: `PUBLICACION_MULTIMETRO_2026-10-24.md`; evidencias: `qa/vercel-meter-lesson/`.


## Publicación 25 de octubre de 2026 · simuladores sin conexión

Producción actualizada por solicitud expresa del usuario: **https://modo-lab.vercel.app/**. Proyecto existente `modo-lab`; despliegue **READY** `dpl_36yDu4Jw4w8hAdi4RqpttAezMSxz`, URL `https://modo-87807ifzu-humanolabxyz-9765s-projects.vercel.app`.

- Incluye GeoGebra Classic local, descarga completa de 506 recursos (~156 MiB), preparación del viaje, rangos de video/PDF, caché en las rutas principales y mejoras de carga/paneo.
- Corrección de publicación: la exclusión heredada `offline` coincidía con `src/offline`; ahora está anclada a `/offline`. Se incluyen el controlador y los recursos de GeoGebra `web3d`; se excluyen los motores alternativos duplicados.
- El cargador de GeoGebra usa el parámetro que desactiva su depuración solo en localhost. En el dominio público se omite para mantener las peticiones bajo el service worker.
- `npm run check` y `npm run build` correctos. HTTP 200 sin autenticación en once rutas/recursos públicos; cinco archivos críticos comparados por SHA-256 con el build local.
- **22/22 comprobaciones offline pasaron contra el dominio público**, con red desactivada y cierre/reapertura del navegador: diez herramientas, importación y persistencia del panel, edición PLC/HMI, operación de proceso, GeoGebra (gráfica/matrices/CAS/punto 3D), cuaderno integrado, PDF y video con rangos, y viewports 390/820 px. Sin peticiones externas ni errores inesperados.
- Evidencias: `qa/offline-deployment/deployment.json`, `public-verification.json`, `verification.json` y capturas en esa carpeta. Uso: abrir `/sin-conexion/`, guardar todo y esperar «Listo para el viaje» en el mismo navegador antes de desconectar.


## Publicación 27 de octubre de 2026 · protoboard y mediciones

Desplegada por solicitud expresa del usuario. Proyecto `modo-lab`, equipo `humanolabxyz-9765s-projects`. Estado **READY**, entorno **producción**. Dominio: https://modo-lab.vercel.app/.

- Despliegue: `dpl_CLM3pjzf2jP3okBHaPceYxk6Z2X8`; URL inmutable: https://modo-nqvc3b9jp-humanolabxyz-9765s-projects.vercel.app.
- Se publicó la carpeta de trabajo actual mediante CLI (base Git a66b038 con cambios locales); no se hizo push ni se creó un commit.
- Incluye canal central e–f, modo prueba con cables retirados/movidos, diagnósticos, guía de dos contactores y botón Color con paleta de nombres y selección visible.
- `npm run check` y compilación local aprobados. Compilación remota READY, 19 segundos. Se comprobó el HTML autenticado del candidato antes de promoverlo al dominio público.
- Producción: HTTP 200 sin sesión en inicio, laboratorio, estudio, sin-conexion, sw.js y manifest. Los 21 archivos JS/CSS referenciados en el HTML del laboratorio coinciden por SHA-256 con el build local.
- Revisión visual pública: botón Color, paleta con nombres, canal central y entrada Modo prueba visibles. No se repitieron todas las suites offline ni pruebas de dispositivo físico durante la publicación.
- Evidencia: `qa/release-2026-10-27/public-verification.json`, `qa/release-2026-10-27/public-color.png`.
- Los pendientes de usabilidad de `REVISION_USO_PROTOBOARD_Y_COLOR_2026-10-27.md` siguen documentados; la publicación no los declara corregidos.

## 28 de octubre de 2026 · guía del profesor y flujo de medición

Por solicitud expresa del usuario, publicado en producción https://modo-lab.vercel.app/, despliegue dpl_4gr2RoqtZqJ5HALbZaB5PRuXYu9z, estado READY. Proyecto y equipo conservados: modo-lab / humanolabxyz-9765s-projects.

Incluye el montaje completo con motor, vista compacta de medición con bornes visibles/localizables e iluminados, una acción por etapa, registro de la muestra sin transcripción, menú simplificado y correspondencia auditada de los 25 puntos del profesor. Resultados e informe conservan tablas 1, 3, 4, 5 y 6, con 15 lecturas. La referencia explica que el montaje de dos contactores y KT1 es una adaptación del original manual de tres contactores.

Verificación pública: HTTP 200, PDF con SHA-256 idéntico al original revisado y 14 recursos iniciales idénticos al build local; 34/34 pasos en escritorio y móvil emulado; exportaciones JSON/CSV/HTML comprobadas y menú de siete vistas correcto. Evidencias y detalles en AUDITORIA_GUIA_PROFESOR_2026-10-28.md y qa/guide-audit-2026-10-28/. No hubo prueba en equipo físico.

## 28 de octubre de 2026 · navegación de menús en teléfono

Producción READY: dpl_7vZ9MV4pXZfYv5LsYMVTNXAzkLJh, https://modo-lab.vercel.app/. Se mantienen proyecto y equipo existentes.

Ventanas limitadas al área visible del teléfono, cierre táctil sin doble acción sobre ventanas anidadas, bordes libres desactivados en teléfono y adaptación al giro. Diagrama con acceso al menú en la cabecera; Aprender a medir con desplazamiento completo en ajustes y horizontal, conservando bornes y captura de la guía.

Pruebas locales con gestos táctiles emulados en cuatro tamaños y WebKit en dos orientaciones; regresión de 34 pasos y exportaciones correcta. Prueba pública de navegación táctil en ambas orientaciones y WebKit sin errores, 14 recursos iniciales idénticos al build local. Alcance y evidencias en REVISION_NAVEGACION_TELEFONO_2026-10-28.md y qa/mobile-menu-navigation/. Sin validación en dispositivo físico.

## 29 de octubre de 2026 · tester en serie en el cambio a triángulo y KM3 oculto

Por solicitud expresa del usuario, publicado en producción https://modo-lab.vercel.app/, despliegue `dpl_DwickQ6nqZZrAzt3MiQB2yHmQtkz` (`modo-abitzekgu-humanolabxyz-9765s-projects.vercel.app`), estado READY. Proyecto y equipo conservados: modo-lab / humanolabxyz-9765s-projects. Sin commit ni push.

- `src/data/simulation.ts`: con `powerContacts`, un polo que espera su retardo de cierre o la pausa de transición cuenta como abierto (antes tomaba el estado de la bobina). Estrella y triángulo ya no quedan cerrados a la vez y el tester en serie no ve el cortocircuito (subía a 15–26 A y quemaba el fusible).
- `src/components/Board.tsx`: el contactor añadido que la práctica de dos contactores deja fuera se oculta entero; antes quedaban sus números de bornes flotando y el marco reservaba su espacio.
- Verificación: `npm run check`, `npm run build` y siete scripts de modelo correctos. Interfaz con el tester entre FUENTE:R y L1 de KT1, temporizador 4 s, en 1440, 820 (táctil) y 390 (táctil): estrella 1,701 A, triángulo 3,694 A con pico breve de 4,5–4,7 A, 0 etiquetas del KM3 y sin errores de JavaScript. Repetido contra producción en 1440 y 390 con el mismo resultado.
- Producción: HTTP 200 en `/`, `/laboratorio/` y `sw.js`; 116 de 117 JS de `_astro` idénticos por SHA-256 al build local. El restante, `RoboticsApp`, pertenece a la Beta de Robótica protegida por contraseña y no se pudo comparar.
- Evidencias: `qa/serie-triangulo-2026-10-29/`. Sin prueba en dispositivo físico.
