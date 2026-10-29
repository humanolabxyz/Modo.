# Publicación de Estudio y GeoGebra

> Actualización posterior: la corrección `dpl_2iaaL9GHXvwFWNfx65eaFY3rPtSU` sustituye la vista inicial con Álgebra por Gráfica y comandos. El teclado escribe en el campo Comando y no modifica la vista. Véase `REVISION_DOCUMENTOS_Y_GRAFICA_COMANDOS.md`. Lo siguiente describe la publicación anterior.

19 de octubre de 2026. Proyecto existente de Vercel: `modo-lab`.

- Dirección pública: https://modo-lab.vercel.app
- Despliegue final: `dpl_7EgCrbY9cWfHsbC8eaWoyioLUuoW`, estado `READY`, destino `production`.
- Inspector: https://vercel.com/humanolabxyz-9765s-projects/modo-lab/7EgCrbY9cWfHsbC8eaWoyioLUuoW
- Se publicó el proyecto local autorizado, sin crear otro proyecto ni modificar el repositorio remoto.

## Cambios de la revisión final

- `src/styles/study-interface.css`: cabecera en dos filas para pantallas de hasta 370 px, evitando desbordamiento y manteniendo marca y accesos legibles.
- `src/lab/GeoGebraView.tsx`: en vertical, distribución explícita de gráfica arriba y funciones debajo. El giro conserva la construcción y el applet. El teclado se controla por separado.
- `src/styles/geogebra-workspace.css`: separa los controles replegados del panel de comandos y mantiene la guía abierta dentro del área visible en horizontal.
- `public/sw.js`: las búsquedas de recursos estáticos en caché ignoran la variación de Origin para que las precargas de módulos funcionen sin conexión.
- QA: `qa/verify-release-responsive.cjs`, `qa/verify-published-release.cjs` y ajuste del inicio de la prueba PWA para omitir únicamente la bienvenida ya revisada.

También incluye las mejoras anteriores de unidades, módulos, cuadernos, repaso, ventana flotante y teclado ABC.

## Verificación

- `npm install`: 0 vulnerabilidades conocidas.
- `npm run check` y `npm run build`: correctos.
- `npm run verify:geogebra`: preguntas, 28 comprobaciones reales, avance automático y navegación existentes correctos.
- `npm run verify:unit-modules`: portada de seis ramos, unidades replegadas y navegación correctas.
- `node qa/verify-problem-overlay.cjs`: ventana, teclado/tacto, cambios de orientación y conservación del applet correctos.
- `node qa/verify-release-responsive.cjs`: inicio, ramos, aula, repaso, simulador, laboratorio, gráfica real, teclado ABC y cuaderno flotante en 320×740, 390×844, 844×390, 820×1180, 1180×820 y 1440×960. Incluye comprobación de que la gráfica nativa tiene área utilizable.
- La misma prueba se repitió contra la dirección pública. Evidencia: `qa/release-responsive-production/verification.json`.
- `node qa/verify-published-release.cjs`: ocho rutas públicas HTTP 200, cabeceras y archivos principales coincidentes con el build local por SHA-256. Evidencia: `qa/release-production/http-and-assets.json`.
- `npm run verify:pwa`: manifiesto, iconos, service worker y arranque del simulador sin conexión; ejecutado también en producción.
- El repaso completo de cuatro actividades se verificó contra la dirección pública con `qa/verify-unit2-exam-review.cjs`.

Las comprobaciones de dispositivos usan Chromium emulado; no sustituyen pruebas en teléfonos o tablets físicos. GeoGebra necesita conexión para cargar su motor externo.

## Capturas comparativas

- Antes: [cuaderno separado](qa/problem-overlay/before-notebook.png).
- Publicado: [aula a 320 px](qa/release-responsive-production/classroom-320x740.png), [gráfica en móvil vertical](qa/release-responsive-production/geogebra-390x844.png), [gráfica en tablet vertical](qa/release-responsive-production/geogebra-820x1180.png), [cuaderno horizontal](qa/release-responsive-production/notebook-844x390.png), [teclado ABC](qa/release-responsive-production/keyboard-820x1180.png), [PC](qa/release-responsive-production/notebook-1440x960.png).
