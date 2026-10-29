# Publicación v2.3.0 · modo.

Publicada el 23 de octubre de 2026 con autorización expresa del usuario para publicar la interfaz e incluir las correcciones existentes de medición.

- Público: https://modo-lab.vercel.app/
- Movimiento completo: https://modo-lab.vercel.app/?movimiento=completo
- Proyecto: `modo-lab` / `prj_tqclHzAbuZzPqfAwvDETHjG8sa7L`.
- Equipo: `team_iNJdFEbhcCf5nImzqTiX9CYD`.
- Despliegue: `dpl_HAwGV2Kc1Nd1rrZSYHNNNfACVWMZ`, estado READY y promovido a producción.
- URL del despliegue: https://modo-o7tsfa9s1-humanolabxyz-9765s-projects.vercel.app/
- Anterior: `dpl_EeT9WpmzKyAe3hkMJytBpY8gU84y`.

## Incluido

Nuevo Home responsive aprobado, cuatro ilustraciones 3D, reloj de palabras sin destello previo, preferencia de movimiento, carrusel táctil y con mouse, selección de tarjetas laterales antes de entrar en móvil, footer de Félix Levancini Toledo e historial real. Se mantienen las indicaciones posteriores: sin flechas de navegación en PC y sin estadísticas en móvil.

Incluye además las correcciones locales documentadas en `ENTREGA_FALLOS_PANEL_2026-10-23.md`: V~ de mando/fuerza, medición entre fases, A~ en serie, tomas A/COM, sobrecarga, parámetros didácticos ajustables y ejemplo estrella-triángulo con conjunto contactor-temporizador. No se presentan los valores del modelo como mediciones confirmadas del banco físico.

## Evidencia de inclusión y funcionamiento

`/_astro/App.CZWOmH4t.js` integra el Home y los mensajes y cálculos de medición corregidos. Su SHA-256 público coincide byte a byte con la compilación local probada:

`ecfe19b671ef9f87f4b003f17ddd994c9fe1df8c60b5ed272dac90bb43218bc8`

Los CSS y cuatro WebP públicos también coinciden con sus archivos locales. Las seis rutas públicas responden HTTP 200 y conservan sus encabezados de seguridad. El nuevo service worker incorpora las cuatro ilustraciones al precache; identificador de build `mvlggffn`.

Pruebas aprobadas:

- `npm run check` y `npm run build`.
- `node qa/verify-panel-fixes.mjs`: ocho grupos del modelo, incluyendo mando/fuerza, referencias aisladas, A/COM, corriente en serie, sobrecarga y estrella-triángulo.
- `node qa/verify-meter-precision.mjs`: 20 comprobaciones de resolución y unidades.
- `qa/verify-panel-fixes-ui.cjs` sobre la compilación final local: Chromium y WebKit, 1440 y 390 px. Lecturas 380/400 V, libreta, retirada de cable e inserción de A/COM, 0,050 A, sobrecarga, retorno V Ω y continuidad. Sin errores.
- `qa/verify-approved-home.cjs` sobre la compilación final: nueve tamaños, rutas reales, importación/continuación, gesto táctil, seis palabras, pausa, geometría fija, WebKit móvil y cero errores.
- `node qa/verify-release-public.cjs`: seis rutas públicas, versión 2.3.0, hashes de aplicación/CSS/ilustraciones, service worker y hashes de fuentes.
- `qa/release-2.3.0/verify-public-measurements.cjs` contra https://modo-lab.vercel.app/: Chromium 1440 y 390 px, con las mismas comprobaciones reales del multímetro. Ambas aprobadas.

Una primera ejecución paralela contra el servidor de desarrollo agotó recursos del navegador (`ERR_INSUFFICIENT_RESOURCES`); se repitió secuencialmente contra la compilación estática y pasó. No se aceptó ese intento como una prueba correcta.

Los navegadores móviles fueron emulados; no se realizó una prueba en teléfono físico.

## Archivos de evidencia

- `qa/release-2.3.0/deployment.json`: destino, despliegue anterior/nuevo y procedencia.
- `qa/release-2.3.0/source-hashes.json`: fuentes de interfaz y mediciones incluidas.
- `qa/release-2.3.0/public-verification.json`: HTTP, hashes públicos y caché.
- `qa/release-2.3.0/measurements-local.json`: medición en Chromium/WebKit y escritorio/móvil.
- `qa/release-2.3.0/measurements-public/ui-results.json`: prueba directa de mediciones publicadas.
- `qa/release-2.3.0/home-local.json`: Home completo sobre build final.

Se usó la carpeta de trabajo local con sus correcciones existentes. La publicación no implicó un push ni cambios en el repositorio remoto. La autorización de publicación del usuario prevaleció sobre la instrucción local anterior de mantener el trabajo sin desplegar.
