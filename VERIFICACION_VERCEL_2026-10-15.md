> Actualización posterior: el usuario solicitó publicar. La versión modo. ya está en producción, despliegue dpl_BQgjXf4BZWWYDuKWT3QAheMJb33B, READY. verify:modo y verify:pwa pasaron contra https://panellab-inacap.vercel.app/. El informe de abajo conserva el diagnóstico previo a esa publicación. Consulta DESPLIEGUE_VERCEL.md y qa/vercel-modo-publicado/deployment.json para el estado actualizado.

# Verificación de Vercel y continuación del cierre de Claude

Fecha: 15 de octubre de 2026. Alcance: inspección del despliegue existente y verificación de la versión local, sin publicar una actualización ni modificar src/.

## Resultado

El despliegue de producción está Ready, pero todavía sirve la versión anterior de PanelLab. La marca modo. y el sistema de animaciones de Claude permanecen en la versión local. No se puede dar por verificado ese sistema en producción hasta publicar y probar el nuevo build.

- Sitio: https://panellab-inacap.vercel.app/
- Equipo: humanolabxyz-9765s-projects (`team_iNJdFEbhcCf5nImzqTiX9CYD`).
- Proyecto: panellab-inacap (`prj_jFwuKEluKsxNM8isdUnCjNMh7xtZ`).
- Última producción listada por la CLI: https://panellab-inacap-3u5bbu9yb-humanolabxyz-9765s-projects.vercel.app — Ready, build de 21 s.
- Página pública comprobada con caché y service worker omitidos: título `PanelLab INACAP v2 — Banco de trabajo`, encabezado `Practica en el banco.`, componente `/_astro/App.BaW9_Fj6.js`, sin `.modo-logo`.
- Build local comprobado: título `modo. — Tu espacio de trabajo`, encabezado `Tu espacio de trabajo.`, componente `/_astro/App.BmizZgpg.js`.
- No existe repositorio Git en esta carpeta: no se atribuye un commit al contenido local.

El conector de Vercel devolvió 403/404 para este equipo/proyecto. La CLI local sí pudo consultar el proyecto y sus despliegues; la comprobación pública se hizo en navegador.

## Compilación y pruebas

`npm run check` y `npm run build`: PASS. Astro genera las tres páginas estáticas y sella el service worker. Preview de ese build: http://127.0.0.1:4325/.

Se ejecutaron los 25 scripts `verify:*` de package.json. Resultado: **17 PASS y 8 FAIL**. Logs completos y códigos de salida: [test-results.json](qa/verificacion-2026-10-15/test-results.json).

Pasan: datos, cableado, CADe, aprendizaje y su interfaz, simulación y su interfaz, recorridos, disposición de diagrama, color de cables, ventana flotante, estrella-triángulo, foco, PWA, laboratorio y su interfaz, e inicio modo.

`verify:modo` comprueba ocho tamaños (360, 390, 430, 768, 1024, 1440, 1672 y 1920 px), imágenes, cuatro modos de aprendizaje, importación/continuación de prácticas, ayuda, estudio, cinco herramientas del laboratorio y recursos de marca. Su informe termina en PASS, sin errores recogidos. El modelo del laboratorio pasa 38/38 comprobaciones.

| Script que falla | Evidencia y estado |
| --- | --- |
| verify:ui | Comprueba visibilidad del selector del inicio inmediatamente después de volver; las transiciones ahora aplican el estado de forma asíncrona. Debe esperar la llegada del inicio antes de afirmar una regresión. |
| verify:practice | Lee 0 terminales inmediatamente después de pulsar Abrir panel; el panel termina cargando 94. Debe esperar el montaje tras la transición. |
| verify:interface | Espera `.home-options button`, selector de una interfaz anterior que no está en el inicio modo. |
| verify:reading | La prueba de navegación no observa el cambio de viewBox esperado. Requiere revisar foco, gestos y esperas de animación; no se declara resuelto. |
| verify:canvas | Falla una aserción geométrica del diagrama expandido. Requiere revisar la geometría actual y esperar la transición antes de medir. |
| verify:diagram-simple | Detecta overflow al cambiar de 1920 a 1440 px. Una inspección estable posterior del cuerpo del diagrama dio clientWidth=scrollWidth=408, sin overflow horizontal. Falta reproducir el fallo con esperas correctas de transición y resize. |
| verify:mobile | Comprueba que la ventana esté oculta inmediatamente después de cerrar. Debe esperar el cierre; no se afirma que toda la suite móvil haya pasado. |
| verify:modo-preservation | App.tsx ya no coincide con el hash de la instantánea anterior a las animaciones. Debe revisar el cambio de Claude y actualizar la evidencia de preservación, sin sustituir ciegamente el hash. |

Los 8 fallos no se presentan como 8 errores confirmados del producto. Tampoco se consideran pruebas aprobadas. Esta ejecución no cambió los scripts para hacerlos pasar.

## Revisión del sistema de movimiento

Se revisaron MotionHead.astro, ModoSplash.astro, indicators.ts, transition.ts y modo-motion.css. En el navegador se comprobó la llegada Inicio → Panel, apertura/ampliación/regreso del diagrama móvil, indicadores de las vistas y modos, entrada al estudio y cambio a Practicar, y entrada al laboratorio.

- A 390×844, el diagrama flotante y ampliado permanecen dentro del viewport; no se observó desbordamiento horizontal de la página.
- `.menu-modes` recibe un indicador del tamaño del modo activo. No se retiró ni modificó porque no se confirmó un defecto que lo justificase.
- Con movimiento reducido emulado y `?movimiento=sistema`, aparece `html.modo-reduced`, no aparece el splash y la transición del botón es `0s`.
- Con el mismo sistema reducido y `?movimiento=completo`, se elimina `modo-reduced`, pero las transiciones del botón y tarjeta del inicio siguen en `0s`. Las reglas antiguas de canvas.css y modo-home.css siguen dependiendo directamente de la preferencia del sistema, tal como advertía Claude. Es un pendiente real de coherencia del override.
- La lectura del código confirma la entrada de marca por sesión y la capa sin pointer events. No se declara validación visual exhaustiva de cada fotograma ni comprobación física en iOS/Safari.

## Capturas de esta ejecución

- [Escritorio 1672×941](qa/modo/viewport-1672x941.png)
- [Móvil 390×844](qa/modo/viewport-390x844.png)
- [Informe y capturas de los ocho tamaños](qa/modo/verification.json)

Los scripts existentes regeneraron archivos de evidencia bajo qa/. No se modificó la interfaz ni se realizó un despliegue.

## Continuación concreta

1. Adaptar las esperas y selectores de las pruebas que quedaron desactualizadas; reproducir los fallos de lectura y geometría antes de atribuirlos a la aplicación.
2. Revisar la preservación contra el respaldo previo a animaciones.
3. Unificar la política de movimiento reducido para que el override completo sea coherente, conservando el modo sistema como predeterminado.
4. Tras esas comprobaciones y con autorización para actualizar producción, publicar en el mismo proyecto y volver a verificar la URL pública, los hashes del build y la actualización de la PWA.

