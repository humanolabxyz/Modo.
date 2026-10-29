# Navegación en teléfono — Diagramas y Aprender a medir — 28 de octubre de 2026

## Fallos reproducidos

- En 844 × 390, Opciones de práctica dejaba solo 130 px de altura interna para desplazarse.
- Material de estudio del diagrama quedaba a y=616, fuera de una pantalla de 390 px de alto; el dibujo interceptaba arrastres para su propia navegación.
- Un toque de cierre sobre un submenú podía cerrar también su ventana padre: el cierre en pointerup desmontaba la ventana antes del click táctil posterior.
- Las zonas de movimiento y redimensionado de las ventanas libres interferían con la navegación en los bordes del teléfono.
- En pantallas pequeñas, la cabecera y lectura fijas de la guía dejaban muy poco espacio para configurar bornes y recorrer ayudas.

## Cambios

- Ventanas adaptadas al área visible y márgenes seguros del teléfono, con cierre siempre accesible. En horizontal se usa un panel lateral con toda la altura disponible.
- Se ignoran posiciones/tamaños libres guardados al entrar en teléfono. Se reajustan al girar o cambiar el área visual; escritorio y tableta mantienen ventanas libres.
- Se desactivan los bordes de redimensionado y el arrastre de cabecera en teléfono; el contenido mantiene el desplazamiento nativo.
- Cierre mediante click/tap único para que cerrar una ventana hija devuelva al menú padre.
- Diagramas se adapta al teléfono y dispone de Menú en la cabecera. Se conservan navegación del dibujo, selección de material y apartados Cómo leer / Componentes / Herramientas.
- Aprender a medir desplaza como una sola superficie los ajustes y la vista horizontal. En vertical, cuando la medición ya está preparada, conserva una vista compacta de bornes y lectura. Mostrar bornes sigue minimizando la guía para descubrir el tablero.

## Pruebas

Se usan secuencias táctiles de Chromium/CDP para desplazar de verdad el contenido, sin asignar scrollTop ni simular navegación mediante rueda en la prueba de navegación. Se prueban filtros anidados, cierre al menú padre, añadir módulo, material y apartados del diagrama, referencia larga de 25 puntos, preparación de motor, mostrar bornes y giro con la guía abierta.

WebKit: toques, submenús, preparación y giro en 390 × 844 y 844 × 390, sin errores. No se presentan estas pruebas como validación en dispositivos físicos.

Regresión: 34 pasos de medición y exportaciones completos en escritorio y teléfono emulado.

Fuentes: src/components/FloatingWindow.tsx, src/components/DiagramWindow.tsx, src/components/DiagramPane.tsx, src/components/PanelMeterLesson.tsx, src/layout/phoneViewport.ts y src/styles/phone-window-navigation.css. Evidencias: qa/mobile-menu-navigation/.

El resultado final de los tamaños pequeños y la publicación se añaden al completar.

## Resultado final y publicación

Navegación táctil Chromium/CDP completada sin errores en 390 × 844, 844 × 390, 320 × 568 y 568 × 320. Se verificaron también los tres apartados del diagrama: Cómo leer, Componentes y Herramientas. En 844 × 390, el cuerpo del menú pasó de 130 a 315 px; en 568 × 320 hay 245 px para desplazarse.

La preparación de medición y Revisar conexiones usan desplazamiento completo en el teléfono, para que los bornes y las ayudas no queden atrapados entre una cabecera y una lectura fija. La vista compacta se conserva cuando la medición está lista en vertical.

TypeScript y compilación correctos. Recorrido completo de 34 pasos y exportaciones comprobado en escritorio y teléfono emulado.

Publicado en https://modo-lab.vercel.app/, despliegue dpl_7vZ9MV4pXZfYv5LsYMVTNXAzkLJh, READY. Destino confirmado: modo-lab / humanolabxyz-9765s-projects. Despliegue anterior: dpl_4gr2RoqtZqJ5HALbZaB5PRuXYu9z.

Prueba pública: Chromium táctil en vertical y horizontal pasó filtros anidados, regreso al padre, material y apartados del diagrama, navegación larga de mediciones, preparación, minimizado para ver bornes y giro. WebKit pasó cierres anidados, material de estudio, preparación y giro en ambas orientaciones. Sin errores de página. Catorce recursos iniciales, incluido App, coinciden con el build local; service worker sin caché. Evidencias: qa/mobile-menu-navigation/public/.

No se ha probado un dispositivo físico. Si una pestaña o PWA abierta conserva el menú anterior, cerrarla y abrirla nuevamente con conexión para cargar la actualización.
