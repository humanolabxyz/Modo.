# Revisión de rendimiento y publicación · 16 de octubre de 2026

Se revisó el build de producción antes de publicar los cambios de lecciones, ventanas y Comunidad. Se mantienen las fuentes WOFF2 recortadas, las imágenes WebP responsivas, la carga diferida del tablero/diagrama/inspector y el precache limitado a tres descargas simultáneas.

## Mejora de esta revisión

La guía de estudio y su esquema se cargan mediante `React.lazy` al entrar en una práctica guiada. La ventana muestra un estado de carga accesible mientras llega el módulo. Esto evita incluir ese código en el grafo inicial de JavaScript del inicio y del simulador libre; la PWA sigue conservándolo para uso offline.

| Grafo inicial de JavaScript | Antes | Después |
| --- | ---: | ---: |
| Bytes sin comprimir | 500.598 | 478.045 |
| Estimación gzip por archivo | 152.601 | 146.244 |

Reducción: 22.553 bytes (4,5 %) sin comprimir; 6.357 bytes (4,2 %) en la estimación gzip. La medición recorre imports estáticos a partir de las entradas del HTML; excluye imports dinámicos. No representa el peso total de la aplicación, el tráfico de instalación offline, una puntuación Lighthouse ni una mejora medida en segundos. No se extrapolan resultados históricos de otra publicación.

Evidencia reproducible: `node qa/release-community/measure-bundle.mjs <etiqueta>` después de compilar; resultados `bundle-before.json` y `bundle-after.json` en esa carpeta.

## Validación previa

- `npm install`: sin vulnerabilidades reportadas.
- `npm run check` y `npm run build`: correctos; cinco páginas estáticas.
- `npm run verify:learning` y `npm run verify:simulation`: PASS.
- Navegador sobre build de producción local: Inicio no solicita StudyGuide/CadeSheet en su grafo de recursos de página; al elegir lección se carga StudyGuide y aparece el esquema.
- Cable del primer paso comprobado automáticamente; se muestra la confirmación y avanza al paso 2 de 24.
- Escritorio (1281 px) y móvil (391 px efectivos): sin desborde horizontal. Capturas en `qa/release-community/lesson-desktop.png` y `lesson-mobile.png`.

La publicación utiliza el proyecto Vercel vinculado `modo-lab`. El usuario autorizó explícitamente este despliegue; las restricciones históricas de trabajo local no se interpretan como una prohibición de esta entrega solicitada.

## Resultado publicado

Producción READY: `dpl_HSbi9FSe8dM9CvJhRaEL8KdtDgtM`, asignada a https://modo-lab.vercel.app/. Inicio, Comunidad, Estudio, Laboratorio, Legal, manifest y service worker responden HTTP 200. Los 57 archivos de `/_astro/` del precache coinciden byte a byte con el build local. El agradecimiento corregido a Matías está presente en la página pública.

Se comprobaron Inicio y simulador públicos en móvil sin desborde y Comunidad en escritorio sin errores de consola. El service worker se instaló y Comunidad quedó almacenada en caché. La prueba adicional de recarga con la red desactivada mostró la página de desconexión del navegador de pruebas y quedó sin confirmar; no se registra como PASS ni se atribuye una causa sin evidencia. La pestaña de emulación es temporal y no modifica la configuración de red del equipo.

Evidencia: `qa/release-community/production.json`, `production-community.png`, `production-home-mobile.png` y `production-simulator-mobile.png`.
