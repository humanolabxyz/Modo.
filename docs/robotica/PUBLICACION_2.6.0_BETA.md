# Publicación 2.6.0 Beta — Robótica con contraseña

**Fecha:** 29/10/2026 · **Autorizada por el usuario** («publicar esta versión … como beta, para ingresar tiene que pedirte una contraseña»).
**Sitio:** https://modo-lab.vercel.app (proyecto Vercel `modo-lab`) · **Despliegue:** `modo-8zmltmgc5-humanolabxyz-9765s-projects.vercel.app`, READY, producción.

## Qué incluye
- Versión 2.6.0 con su listado en `/versiones/` (`src/data/releases.ts`) y `CHANGELOG.md`.
- Tarjeta Robótica (Beta) en el inicio, cinco tarjetas centradas en escritorio.
- `/robotica/` protegida por `middleware.ts` (Vercel Routing Middleware): formulario de contraseña, cookie `modo-beta` (HttpOnly, Secure, 30 días, guarda un hash, no la clave).
- La clave vive solo en la variable de entorno `ROBOTICA_BETA_PASSWORD` (producción, sensible). Sin ella la ruta se cierra con 503. Para cambiarla: `vercel env rm` / `vercel env add ROBOTICA_BETA_PASSWORD production` y volver a desplegar.

## Verificado en público
Inicio 200 · `/robotica/` sin clave 401 con formulario · clave mala 401 · clave correcta 303 + cookie · con cookie 200 («Robótica · modo.») · `/robotica/` fuera del precache del service worker · `/versiones/` muestra 2.6.0. Prueba local: `node qa/verify-robotica-gate.mjs`.

## Límites declarados
- No hay compilador en línea: en esta publicación se programa y se **importa un .hex** (el compilador solo corre con `astro dev`).
- Los archivos con hash de `/_astro/` que usa Robótica no están protegidos (no son navegables sin la página). No hay límite de intentos de contraseña.
- Falta la física (etapa 5) y la prueba en tablet/teléfono reales: esta Beta es para eso.
- La página se guarda en el service worker tras una visita autorizada; sin conexión se abre sin pedir clave en ese dispositivo.
