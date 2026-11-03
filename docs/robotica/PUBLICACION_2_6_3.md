# Publicación 2.6.3 · brazo, arena y robots de empuje

30/10/2026. Publicación solicitada expresamente por el usuario sobre el proyecto existente, autorizando el despliegue pese a las restricciones locales originales de AGENTS.md.

- Producción: https://modo-lab.vercel.app/robotica/
- Proyecto: `modo-lab`, equipo `humanolabxyz-9765s-projects`, ID `prj_tqclHzAbuZzPqfAwvDETHjG8sa7L`.
- Despliegue final: `dpl_8X6ojACA3PNJbwjCddz1bLM6y4Qk`, estado READY, entorno producción.
- URL inmutable: https://modo-2zk7n8mra-humanolabxyz-9765s-projects.vercel.app.
- Carpeta de trabajo actual subida por CLI, base Git `4fd72f582ce9e0b625c9b6836fb86676b383b987` con cambios locales, sin commit ni push. El conector MCP devolvió 404 con su sesión; se confirmó el proyecto vinculado y se usó Vercel CLI 65.8.0 con el alcance explícito del equipo.

## Incluido

Brazo E6 de seis ejes, enseñanza de puntos y operación; arena con dos robots y programas/circuitos independientes; minisumo de práctica; nuevos robots con cuña, pala 4WD y defensa; catálogo de 23 piezas. Las tres piezas de empuje también están disponibles individualmente y su geometría participa en el contacto físico. Se conservan las construcciones anteriores.

Versión y novedades actualizadas en `src/data/releases.ts`, `package.json` y lockfile. Se agregó una declaración de tipo local a `middleware.ts` para corregir el diagnóstico TS2580 de `process` detectado durante la primera compilación remota; no cambia el código ejecutado ni la contraseña.

## Evidencia y alcance

- `npm run check` y `npm run build` correctos antes de publicar; compilación de ocho páginas en Vercel y estado READY.
- Prueba de la protección: cierra sin configuración, rechaza claves/cookies falsas y admite la clave de prueba; no imprime ni recupera secretos de producción.
- Las pruebas locales de esta entrega cubren modelo, física, circuitos, montaje, conservación de proyectos y escritorio/móvil con toque emulado. Ver informes de [brazo](FASE_1_BRAZO_E6_OPERACION.md), [arena](FASE_2_ARENA_SUMO.md) y [piezas de empuje](AMPLIACION_SUMO_PALAS_CUNAS_2026-10-30.md).
- Verificación remota final: [`qa/release-2.6.3/public-verification.json`](../../qa/release-2.6.3/public-verification.json). Siete rutas públicas devuelven 200 y la versión 2.6.3 es visible. `/robotica/` devuelve 401 sin sesión y muestra su formulario de contraseña.
- 188 archivos comprobados: recursos JS/CSS/WASM enumerados por el manifiesto remoto, 23 miniaturas y siete mallas E6 con licencia. Los recursos con nombre idéntico al local coinciden por SHA-256. Tres bundles JS tienen nombres distintos entre la compilación Windows y Linux por el orden de importación/minificación; no se afirma identidad binaria de esos tres archivos.
- El identificador del service worker coincide con el manifiesto de producción. El cálculo existente incluye rutas dependientes de la plataforma, por lo que no se exige que su ID coincida con el generado en Windows.
- Comprobación adicional de los bundles publicados mediante Playwright: se proporciona únicamente el documento HTML local en el contexto de prueba y se cargan JS/CSS/workers/modelos del dominio público, sin recuperar o modificar la contraseña de la beta. Es una comprobación de la aplicación con archivos de producción, no una sesión autenticada de la beta. Evidencia: [`remote-bundles-ui.json`](../../qa/release-2.6.3/remote-bundles-ui.json).

Permanecen las advertencias existentes de tamaño de paquetes y cuatro vulnerabilidades altas de dependencias. No se repitió la descarga offline completa ni se probaron dispositivos físicos. Quedan pendientes daño/desprendimiento, partidas en red y elevación de la pala por servo.

Para usar: entrar a Robótica con la contraseña existente y abrir las plantillas o **Opciones del proyecto → Arena de sumo**. Si la PWA tenía una versión abierta, cerrarla y volver a abrirla con conexión para que recoja la actualización.
