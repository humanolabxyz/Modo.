# modo. 2.1.0 · Publicación del 18 de octubre de 2026

- Sitio público: https://modo-lab.vercel.app/
- Historial completo: https://modo-lab.vercel.app/versiones/
- Registro local: CHANGELOG.md. Fuente de notas y versión: src/data/releases.ts.
- Proyecto existente: humanolabxyz-9765s-projects/modo-lab, prj_tqclHzAbuZzPqfAwvDETHjG8sa7L.
- Despliegue: dpl_FEUrmuGmM3799qE4mCaVV7kwcBKe, producción, READY.
- URL inmutable: https://modo-dv0objs3z-humanolabxyz-9765s-projects.vercel.app (protegida según la configuración existente de Vercel; el dominio público sigue abierto).
- Alias público comprobado mediante Vercel y HTTP sin autenticación. Despliegue público anterior: dpl_GRKPCD5syxWZwPbjRPX6q3HLt8tn.
- Se desplegó el checkout actual con los cambios de la conversación; no se creó commit, etiqueta Git ni se modificó un repositorio remoto.

## Contenido

La versión de paquete y lock pasa de 2.0.0 a 2.1.0. Se añade el historial público con versiones 2.1.0, 2.0.0 y 1.1 documentadas. Las entregas antiguas sin número propio se resumen sin inventar versiones ni fechas de publicación. El inicio enlaza el historial y muestra la versión actual. El service worker incluye /versiones/ como página independiente.

La entrega reúne el inicio soft UI con vistas previas animadas y fotografías integradas, entrada directa libre conservando la práctica, adaptación táctil sin tarjeta duplicada ni hueco, paleta neutra con acento negro y colores funcionales, barras comunes, contraste y ayudas corregidas, estudio unificado, fuentes académicas y repaso de Unidad 2, GeoGebra integrado y tres prácticas complementarias de matrices con 11 actividades. Detalle en CHANGELOG.md y /versiones/.

## Comprobaciones actuales

- npm run check y npm run build correctos. Vercel ejecutó npm ci y build; informó cero vulnerabilidades.
- npm run verify:simulation: seis grupos de comprobaciones correctos.
- qa/release-2.1.0/verify-ui.cjs en local y producción: 390×844, 820×1180, 1180×820 y 1440×960. Historial accesible, sin overflow, entrada libre sin selector, sustitución táctil sin hueco y circuito conservado. Deshacer recupera el modo anterior. Cero errores JavaScript capturados.
- qa/release-2.1.0/verify-public.cjs: seis rutas HTTP 200 sin autenticación y con cabeceras de seguridad; los 89 recursos compilados coinciden por SHA-256 con dist local; las 47 fuentes están disponibles; F37/F38/F39 conservan sus hashes; service worker renovado y política separada del marco GeoGebra.
- qa/verify-geo-unified.cjs ejecutado en producción: 11 actividades de matrices comprobadas con GeoGebra real, rechazo de trabajo vacío, persistencia al recargar, revisión conceptual desde Estudio y archivo libre preservado. Cambio de herramienta y comprobación de una función anterior correctos. Entrada de comandos y comprobación táctil en móvil; catálogo y área de trabajo adaptados también a 820×1180, 1180×820 y 844×390.
- Las pruebas visuales usan Chromium con tamaños y tacto emulados, no dispositivos físicos. No se afirma una nueva validación offline completa.

## Pruebas históricas y límites

- npm run verify:academic aprobó doce grupos de fuentes, modelos y persistencia. Se detuvo en el grupo final de preservación por comparar App.tsx contra un hash anterior al cambio autorizado de entrada libre. No se cambió la referencia para producir un PASS. El comportamiento actual de entrada y conservación de datos se valida en verify-ui.cjs; el solver se comprueba mediante verify:simulation.
- El comando histórico verify:security usa por defecto el puerto 4338, que no estaba abierto, y no llegó a ejecutar su suite. La verificación de seguridad publicada de esta entrega se hizo con verify-public.cjs sobre las seis rutas reales y sus cabeceras/CSP.
- La vista previa local se reinició en el mismo puerto 4344 después de que Vite invalidara su caché de dependencias al cambiar la versión del paquete. Las comprobaciones funcionales volvieron a pasar.

Evidencias: qa/release-2.1.0/deployment.json, production-inspect.json, deploy-inputs.json, public-verification.json, local-ui.json, production-ui.json y geogebra/verification.json. Capturas en esa carpeta. No se incluyeron .env, .vercel, qa ni documentos de análisis en la subida.
