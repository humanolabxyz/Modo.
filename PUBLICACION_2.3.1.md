# v2.3.1 · Centrado de las tarjetas del Home

Publicada el 23 de octubre de 2026 en https://modo-lab.vercel.app/.

Despliegue READY y promovido: `dpl_JAwYyJcduCuqTVF72Lvt19xoEqvd`. El anterior es `dpl_HAwGV2Kc1Nd1rrZSYHNNNfACVWMZ` (v2.3.0).

El anclaje de escritorio estaba al 43 % y aplicaba una reducción mayor a Comunidad, a dos posiciones de la tarjeta seleccionada. Ahora el conjunto se centra con `50% - medio paso`, y las tarjetas no seleccionadas usan el mismo límite de escala y una perspectiva simétrica.

Se modificó únicamente la regla visual de las tarjetas en escritorios de más de 1100 px, además del registro de la versión. El código de `Home.tsx` y las fuentes de mediciones mantienen los mismos hashes de la entrega 2.3.0. Se conservan las correcciones de tensión/corriente publicadas, el reloj y el carrusel móvil.

## Comprobación

- `npm run check` y `npm run build`: aprobados.
- `qa/verify-desktop-centering.cjs`: aprobado sobre la compilación local y la web pública en 1101, 1180, 1280, 1440, 1672, 1917, 1920 y 2560 px; también se comprobó móvil de 390 px.
- Márgenes del conjunto a 1917 × 943: 204,765 px a la izquierda y 204,766 px a la derecha. Error de centrado menor de 0,02 px en todos los tamaños de escritorio probados.
- Panel y Comunidad tienen el mismo ancho lateral. Se comprobó el centrado al seleccionar cualquiera de los cuatro módulos y que no hay desbordamiento horizontal.
- CSS y aplicación del despliegue comprobados por SHA-256 antes de promoverlo. Verificación pública de las seis rutas, versión, CSS, ilustraciones, service worker y fuentes: aprobada.

Evidencia: `qa/release-2.3.1/centering.json`, `public-verification.json`, `deployment.json`, `source-hashes.json` y capturas `home-1917x943.png` / `home-390x844.png`.
