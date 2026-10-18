# Despliegue de lecciones y diagrama original

Producción verificada: https://modo-lab.vercel.app/

- Proyecto existente: `modo-lab` (`prj_tqclHzAbuZzPqfAwvDETHjG8sa7L`).
- Despliegue: `dpl_H42Dq8ud3wpYT8hvYAfCPhR8zM1i`, READY, promovido a producción el 16 de octubre de 2026.
- Incluye las ventanas separadas de la prueba, las dos lecciones estrella-triángulo (46 y 42 conexiones) y el diagrama original restaurado.
- Construcción remota correcta. Se verificaron primero las rutas y el diagrama en el despliegue protegido usando el acceso autenticado de Vercel, y después se promovió el mismo despliegue al dominio público.
- Las rutas Inicio, Estudio, Laboratorio, Comunidad, Legal, service worker, referencias y módulo de lecciones respondieron HTTP 200 desde el dominio público. Las imágenes del diagrama coinciden por SHA-256 con la versión local y el service worker público coincide con el despliegue comprobado.
- Las dos lecciones pasaron el recorrido de navegador en producción a 390×844 y 1440×900: KM3 automático, lectura, avance, diagrama original, pregunta, borradores, entrega e importación de los originales. Sin errores del navegador. Pruebas móviles emuladas en Chromium.
- Se comprobó la lista de archivos antes de subir: QA, respaldos, archivos de entorno y JSON privados de referencia excluidos. El manifiesto confirma que el código publicado coincide con la versión local comprobada.

Evidencia local: `qa/release-2026-10-16-lessons/release.json`, `source-manifest.json`, `public-checks.json` y `browser/ui-results.json`.
