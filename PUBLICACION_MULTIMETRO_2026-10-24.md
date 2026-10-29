# Publicación del multímetro y menú de mediciones — 24 de octubre de 2026

- Producción: https://modo-lab.vercel.app/?view=simulator
- Proyecto: modo-lab, prj_tqclHzAbuZzPqfAwvDETHjG8sa7L.
- Equipo: humanolabxyz-9765s-projects, team_iNJdFEbhcCf5nImzqTiX9CYD.
- Despliegue: dpl_22smn5Fh9kHnnJ4ZBT4HQ5hKgcU3, READY, target production.
- URL: https://modo-b6anupp40-humanolabxyz-9765s-projects.vercel.app
- Se publicó la carpeta local actual, incluidos los cambios de esta conversación. HEAD de referencia a66b0389fa77d92a95fe6fa36e4e67207e64786b; el checkout tenía cambios locales, por lo que ese commit no representa por sí solo la versión publicada.
- Autorización expresa del usuario para desplegar; prevalece sobre la restricción de despliegue de AGENTS.md. No se modificaron repos remotos.

## Procedimiento y comprobaciones

El conector MCP devolvió 404 para el proyecto vinculado. La CLI autenticada confirmó el mismo ID de proyecto/equipo y configuración Astro. Se creó un despliegue de producción con --skip-domain, se comprobó que PanelMeterLesson.CsVAuexD.js era idéntico al local y se promovió ese despliegue a producción sin recompilar.

La revisión anterior pasó npm run check y npm run build. Antes de promover se repitió node qa/verify-meter-activity.mjs: 33 pasos correctos en los perfiles manual y Matías. El archivo de lección, App y dos CSS coinciden por SHA-256 con dist; PDF y proyecto JSON también coinciden. Ocho rutas/entradas públicas comprobadas devuelven HTTP 200 sin autenticación; el HTML carga el App actual. Evidencia: qa/vercel-meter-lesson/public-verification.json.

En el navegador integrado se abrió Medir en el sitio público, se verificaron sus ocho bordes de ajuste y el control de esquina, y se arrastró la ventana de x≈8/y≈28 a x≈58/y≈48. Se comprobó la introducción y la disponibilidad del botón para comenzar la guía. No se alteró el cableado ni se registraron mediciones en producción. Captura: qa/vercel-meter-lesson/public-menu.png. No se repitieron los 33 pasos mediante interfaz en producción ni se probó un teléfono físico.

La implementación se describe en ENTREGA_MULTIMETRO_ACTIVIDAD2_2026-10-24.md. No se cambió la versión 2.4.1 ni la configuración de protección o dominios.
