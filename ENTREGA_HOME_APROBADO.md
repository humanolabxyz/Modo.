# Home de modo. · 23 de octubre de 2026

Implementación en Astro/React sobre la aplicación existente; publicada como v2.3.0 tras autorización del usuario. Vista: http://127.0.0.1:4344/ (`npm run dev -- --port 4344`).

Se siguieron las referencias adjuntas de escritorio y móvil, con la última indicación aplicada: **sin flechas de navegación en PC y sin estadísticas en móvil**. Se mantuvieron las flechas dentro de las tarjetas como acceso a cada módulo.

## Cambios

- `src/components/Home.tsx`: nuevo Home con logo SVG original fijo, reloj real de nueve láminas con letras independientes, ciclo ESTUDIO → LAB → CONTROL → ROBÓTICA → CIRCUITOS → PRÁCTICA, pausa, movimiento reducido y suspensión del avance en pestañas ocultas. Nueve posiciones permiten conservar las dimensiones de CIRCUITOS y del resto de palabras.
- Carrusel de cuatro módulos: escala, perspectiva y desplazamiento; arrastre táctil y puntos en móvil; selección accesible con teclado y foco coherente. Las tarjetas abren las rutas existentes. Se conservó el protagonismo inicial de Estudio y la distribución de cuatro tarjetas de la referencia de escritorio.
- `src/styles/modo-home-approved.css`: composición responsive y estilos limitados al Home. Los demás archivos de `src/` existentes conservan exactamente sus hashes de entrada.
- `public/images/home-approved/`: cuatro ilustraciones 3D con transparencia optimizadas a WebP. Prompts y procedencia en `qa/home-approved/assets.md`.
- Footer con © 2026 Félix Levancini Toledo, derechos reservados, créditos y políticas, Comunidad e historial real procedente de `src/data/releases.ts`. Versión actual del proyecto: 2.3.0. El desplegable enlaza a cada versión real, cierra con Escape o al pulsar fuera.
- Importación y continuación de prácticas, instalación como app y navegación a Panel, Estudio, Laboratorio y Comunidad conservadas. Continuar utiliza el callback existente del panel: conserva cables, pasos y diagrama y entra en modo libre como antes.
- `package-lock.json`: npm sincronizó la versión raíz con el package.json existente (2.2.22), sin cambiar dependencias.

## Verificación

- `npm install --ignore-scripts`: completado; cero vulnerabilidades reportadas.
- `npm run check`, `npm run build`: completados.
- `npm run verify:data`: aprobado, 6 módulos y 94 IDs activos; los IDs retirados del temporizador ya estaban documentados en el proyecto.
- `npm run verify:wiring`: aprobado, nodos, conectividad, múltiples conexiones y exportación/importación.
- `node qa/verify-approved-home.cjs`: aprobado. Evidencia completa en `qa/home-approved/verification.json`.
- Chromium: 320, 360, 390, 430, 768, 1024, 1440, 1672 y 1920 px; sin desbordamiento horizontal; selector, rutas reales, historial, importación y continuación comprobados.
- Gesto táctil de Chromium: deslizar, seleccionar con puntos y abrir por toque, sin navegación accidental durante el arrastre.
- Ciclo completo de seis palabras, caracteres acentuados, láminas individuales, pausa y geometría invariable del reloj y del carrusel.
- WebKit con viewport móvil 390 × 844: Home, assets y selección táctil comprobados. Es emulación de navegador, no prueba en un teléfono físico.
- Cero errores de JavaScript/consola y cero respuestas HTTP fallidas durante la suite.

## Comparación visual

Abrir `qa/home-approved/comparison.html` para ver referencias e implementación lado a lado. Capturas finales: `qa/home-approved/home-1672.png`, `home-390.png` y `home-webkit-390.png`. Se revisaron visualmente y se corrigieron espaciados, texto móvil y solapamiento de cables con el nombre del módulo.

La referencia móvil incluye un marco de teléfono y barra de estado; la aplicación utiliza el viewport real del dispositivo. Las ilustraciones son assets nuevos basados en los motivos aprobados. El logo es el vector original del proyecto.

La implementación inicial quedó local según AGENTS.md. Posteriormente el usuario autorizó expresamente publicarla y pidió incluir las correcciones existentes de medición. La entrega pública v2.3.0 está en https://modo-lab.vercel.app/. Evidencia de publicación en qa/release-2.3.0/. Los cambios del Home preservaron las rutas y la lógica de otros módulos.

## Correcciones del reloj y de la preferencia de movimiento

Se detectó en la pestaña real el modo `modo-reduced`. El Home ahora respeta la activación explícita de movimiento completo que ya admite la aplicación. La opción visible «Activar animaciones» permite salir del estado reducido; se verificó que la elección persiste al recargar. El primer giro comienza a los 1,8 segundos y los siguientes cada 4,2 segundos. Entrada suave del carrusel y elevación discreta al pasar el mouse.

Se corrigió además un destello anterior al giro: las caras estáticas usaban directamente la nueva letra durante el render, antes de que el efecto montara las láminas. Ahora cada casilla conserva la letra asentada y actualiza ambas caras solamente con el giro preparado o al finalizarlo.

Validación específica: `node qa/verify-home-motion-preference.cjs` y `node qa/verify-clock-no-flash.cjs`. El segundo comprueba el primer commit del cambio y el fotograma inicial del giro en Chromium y WebKit: todavía se ve ESTUDIO, y LAB aparece tras la rotación. Evidencia en `qa/home-approved/clock-no-flash.json`, `clock-chromium-before-turn.png` y `clock-chromium-settled.png`.

## Carrusel móvil: deslizar y seleccionar antes de entrar

Se agregó arrastre con mouse además de tacto y lápiz, para que también funcione en la vista móvil del navegador integrado. Los gestos horizontales consumen el clic; los desplazamientos cortos tampoco abren módulos por accidente. La decisión de cambio usa el desplazamiento registrado directamente en el gesto para no depender del último render de React.

En pantallas de hasta 1100 px, tocar una tarjeta lateral primero la centra; tocar nuevamente la tarjeta central abre el módulo. Los indicadores siguen seleccionando tarjetas. En escritorio se mantiene la apertura directa con un clic. Se incluye una indicación discreta bajo el carrusel.

Prueba: `node qa/verify-home-card-gestures.cjs`, con Chromium y WebKit, arrastre con mouse, deslizamientos táctiles en ambas direcciones, gestos cortos, selección previa, apertura real de Panel/Laboratorio/Comunidad y conservación de la apertura directa en escritorio. Evidencia: `qa/home-approved/card-gestures.json` y `qa/home-approved/mobile-card-selection.png`.
