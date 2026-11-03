# Portada de Robótica en el inicio

29 de octubre de 2026. Ajuste local de la tarjeta del Home, integrado en el diseño aprobado.

## Cambio

La tarjeta de Robótica ya tiene una ilustración 3D propia: rover de cuatro ruedas, placa de control, protoboard, cableado y sensor ultrasónico. Sigue el acabado de las demás portadas: materiales claros, acentos azules, volumen y fondo transparente. Es una ilustración editorial generada, no una captura del simulador ni una ficha técnica.

Se eliminó la regla provisional que agrandaba el icono y lo situaba en el centro. Ahora aparece en la esquina superior izquierda como en las otras tarjetas. Se mantienen el nombre, Beta, flecha, enlace a /robotica/, colores, carrusel y animaciones existentes. No cambia el simulador.

## Archivos

- `src/components/Home.tsx`: activa la quinta ilustración y elimina la excepción sin portada.
- `src/styles/modo-home-approved.css`: ajuste exclusivo del encuadre de Robótica y retirada del icono central provisional.
- `public/images/home-approved/robotics.webp`: portada de 900×900 con transparencia, 129 104 bytes. Generada con imagegen y optimizada en WebP; el PNG original se conserva en `.codex/generated_images/`.
- `qa/verify-robotics-cover.cjs`: comprobación visual, enlace, título y Beta, dimensiones, overflow y hashes de los recursos preservados.

## Validación

`npm install --ignore-scripts --no-audit --no-fund`, `npm run check` y `npm run build`. Pruebas en Chromium (320, 390, 768, 1024, 1440 y 1920 px) y WebKit móvil emulado (390 px). La nueva imagen carga y el acceso abre el simulador existente. Las otras cuatro imágenes, RoboticsApp.tsx y robotics.css conservan los hashes registrados antes del ajuste. `qa/verify-home-card-gestures.cjs` conserva selección, arrastre, gesto táctil, apertura de módulos y navegación en Chromium y WebKit.

Evidencia en `qa/robotics-cover/verification.json` y capturas. Las comparaciones «antes controlado» ocultan la nueva imagen y restauran temporalmente el icono central en el navegador para aislar el cambio; no son capturas históricas previas al trabajo.

Alcance de esta entrega: portada del inicio. No se han implementado brazos ni nuevos robots y no se ha publicado este ajuste de portada. El pulido del interior de Robótica puede continuar sobre esta base.
