# Revisión de interacción y ventanas — 2.2.14

## Correcciones

- Estilo de menús portalizados: los selectores anteriores dependían de estar bajo .lab-page; al salir a body perdían el tema. Se aplica el mismo blanco, tinta, selección y foco a todos los menús del dock.
- Tipografía compartida disponible también fuera del laboratorio: las ventanas podían heredar una fuente serif y cabeceras del estilo anterior.
- Panel de control: el modo compacto se extiende a tablets táctiles hasta 1366 px, conservando escritorio a 1440 px. Abrir diagrama mantiene la ventana arrastrable, redimensionable y con posición recordada. Agarre visible y movimiento por flechas.
- El contenedor de protoboard permite desplazamiento nativo en editores; el SVG mantiene los gestos del banco. Las puntas tienen su propia frontera táctil de bloque para evitar pointercancel. Una cancelación ya no conecta accidentalmente la punta.
- Los cuerpos de ventanas admiten desplazamiento en ambos ejes. Los menús no reducen la tipografía al cambiar su tamaño; agarres más accesibles en tacto.
- Diagrama de clase: un área principal desplazable, menos encabezados repetidos, nota plegable y ajuste inicial. Conserva diagrama claro y lámina original.
- Catálogo de soldadura: tocar la tarjeta coloca; deslizar explora; un botón separado inicia el arrastre. Se conserva la colocación manual sobre la pizarra.
- Los temporizadores de supresión de clic empiezan sin evento previo, evitando ignorar clics en los primeros 700 ms.

## Verificación y alcance

qa/verify-app-2.2.14.cjs recorre los diez modos de laboratorio y las seis rutas públicas en Chromium/WebKit con móvil 393, tablet horizontal 1180 y escritorio 1440. Abre ocho menús por caso, propiedades, opciones, herramientas y diagramas. Verifica estilos, límites, arrastre y ausencia de errores JavaScript. Gestos reales CDP en Chromium: listas largas, opciones de proyecto, tarjeta de herramientas, desplazamiento horizontal del diagrama y cabecera del diagrama de panel. WebKit usa emulación con tacto y arrastres con ratón; no prueba un iPad físico.

Regresiones: inventario/IDs, solver del panel, aprendizaje, taller/protoboard, temperatura, detectores, equipos; simulación de panel con marcha/paro, térmico, corto, persistencia y siete tamaños; paridad del multímetro; puntas, motor y pulsadores; fuente física; navegación de Estudio y módulos por unidad. TypeScript/build y npm install sin vulnerabilidades.

Dos verificaciones académicas históricas completan sus comprobaciones funcionales pero fallan al comparar hashes de archivos anteriores a cambios ya publicados (App.tsx). No se actualiza esa referencia ni se presenta como prueba superada. El recorrido académico antiguo de interfaz también presupone una lista plana de clases; se detiene antes de abrir la unidad del catálogo actual. La navegación vigente por unidades sí pasa verify-unit-modules y verify-study-navigation. La prueba de cabeceras de seguridad requiere Vercel: Astro preview no aplica vercel.json. Se comprueba sobre el dominio público después de publicar.

No se afirma que cada combinación posible de ejercicios y acciones haya sido probada. Los modelos y las correspondencias eléctricas se conservan; los resultados no certifican equipos físicos.

## Evidencia

- qa/app-2.2.14/verification.json y capturas por navegador/tamaño.
- before-menu.png / after-menu.png: comparación con 2.2.13 antes de publicar.
- qa/verify-simulation-ui.cjs ahora comprueba los límites de la ventana visible de simulación, cuyo cuerpo tiene desplazamiento, en vez de exigir que todo el contenido desplegado quepa sin desplazarse.


Publicada en https://modo-lab.vercel.app/ — dpl_FDNvargJiGe1tMXmTtXbWsWq2SN3, estado READY. La auditoría completa de interfaz pasa también sobre el dominio público. verify-release-2.2.14 comprueba versión, siete rutas HTTP 200 y cabeceras DENY/nosniff/CSP/noindex. verify-switching-2.2.14 comprueba carga sucesiva de estilos sin recargar y límites tras girar tablets. La prueba histórica verify-security se detiene además en un botón de inicio retirado; las cabeceras y rutas se verifican en el nuevo comprobador sin alterar la referencia histórica.
