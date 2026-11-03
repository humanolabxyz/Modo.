# Modelos 3D de robótica y protoboard — 29 de octubre de 2026

Se mejoró el modelado procedural del catálogo existente usando las seis fotografías del robot entregadas por el usuario y referencias comerciales. El catálogo incorpora ahora una protoboard de 400 puntos. Trabajo local, sin publicación.

## Uso

En Robótica, abrir **Piezas → Pasivos → Protoboard 400 puntos** o buscar **protoboard**. Agregarla, ubicarla y usar **Cable** o **Medir** sobre sus orificios. Las etiquetas distinguen A1–J30 y los cuatro rieles L+/L−/R+/R−. La plantilla anterior conserva su montaje; la nueva pieza se agrega desde el catálogo.

## Archivos

- `src/robotics/build/PartMesh.tsx`: chasis perforado con bordes redondeados, motores con carcasa y terminales, ruedas con cinco radios y tacos, rueda loca, placas con conectores individuales y etiquetas, disipador y tornillos del L298N, rejillas del HC-SR04, portapilas con celdas, soportes perforados, LED y resistencia cilíndrica con bandas según su valor. Añade la protoboard con canal, numeración y rieles; sus 400 zócalos usan dos mallas instanciadas para limitar llamadas de dibujo. Texturas de etiquetas locales, con liberación al desmontar y geometrías estáticas memorizadas.
- `src/robotics/build/BuildCanvas.tsx`: extremos negros tipo Dupont en conexiones a cabeceras, con orientación según el cable y puntos eléctricos conservados. Los bornes de tornillo no reciben fundas Dupont. Marcadores pequeños en placas densas; conserva el radio de selección táctil.
- `src/robotics/catalog/index.ts`: definición `breadboard-400`, 400 puntos, 60 grupos independientes de cinco contactos y cuatro rieles continuos de 25 contactos. Usa `internalNet` del grafo existente, sin cambiar los solvers ni el formato del proyecto. Las marcas +/− no generan tensión ni unen rieles automáticamente.
- `package.json`: comandos `verify:robotics-breadboard` y `verify:robotics-breadboard-ui`, incluidos en la verificación de robótica.
- `qa/verify-robotics-breadboard.mjs`, `qa/verify-robotics-breadboard-ui.cjs` y `qa/verify-robotics-models.cjs`: pruebas nuevas de continuidad, tensión, persistencia, cableado y revisión visual. Los contadores de catálogo en las verificaciones de montaje e interfaz se actualizan a 13.

## Verificación

- Instalación de dependencias, `npm run check` y `npm run build`.
- `npm run verify:robotics-breadboard`: aislamiento entre filas, canal, rieles e instancias; 5 V del UNO propagados mediante riel y fila; puente explícito para cruzar el canal; movimiento, serialización, importación y eliminación.
- `npm run verify:robotics-breadboard-ui`: buscar, agregar, identificar A1, conectar A1→F1 y L+1→R+25, guardar y recargar en 1440×900 y 390×844. Sin errores de página ni desbordamiento horizontal.
- `npm run verify:robotics-assembly`: 17 bloques de montaje y conservación del proyecto.
- `npm run verify:robotics-circuit`: 10 bloques de redes, diagnóstico y medición.
- `npm run verify:robotics-wiring-ui`: escritorio, tablet y teléfono; cableado, seguimiento del extremo al desplazar 50 mm, borrar/deshacer y recarga; sin errores de consola ni de página.
- `npm run verify:robotics-template-ui`: la plantilla conserva 11 piezas y 18 cables, avanza, gira y evita el obstáculo.
- `node qa/verify-robotics-models.cjs`: revisión visual individual y plantilla en escritorio/móvil. Resultados en `qa/robotics-models/visual-report.json`.

Las comprobaciones de móvil son emuladas en Chromium/Playwright con WebGL por SwiftShader; no sustituyen una prueba de rendimiento en teléfono físico. Build avisa de paquetes mayores de 500 kB, sin impedir la compilación.

## Capturas

En `qa/robotics-models/`: `antes.png`, `despues-escritorio.png`, `despues-movil.png`, `pieza-01.png` a `pieza-13.png`, `protoboard-escritorio.png` y `protoboard-cableada-movil.png`. `comparacion.html` presenta antes/después y la protoboard. Informes: `visual-report.json` y `breadboard-ui-report.json`.

## Referencias y límites

- Fotografías 1–6 aportadas por el usuario: forma y color de ruedas, dibujo del neumático, cables con conectores negros, placas, portapilas y protoboard.
- [Arduino UNO R3](https://docs.arduino.cc/hardware/uno-rev3/): disposición general de la placa, conectores y componentes. Los pines y anclajes que ya existían conservan sus coordenadas e IDs; no se declara una réplica CAD completa ni se añaden interfaces eléctricas que el simulador no modelaba.
- [Motor TT de Adafruit](https://www.adafruit.com/product/3777), [HC-SR04 de SparkFun](https://www.sparkfun.com/ultrasonic-distance-sensor-hc-sr04.html) y [L298N de HandsOn](https://handsontec.com/dataspecs/L298N%20Motor%20Driver.pdf): referencias visuales de piezas comerciales.
- [Protoboard comercial de 400 puntos de Adafruit](https://www.adafruit.com/product/64) y [conexiones internas de SparkFun](https://learn.sparkfun.com/tutorials/how-to-use-a-breadboard/all): formato y topología. Se eligió la variante de rieles continuos, declarada en el catálogo; las dimensiones permanecen marcadas como aproximadas para el kit del usuario.

Pendiente para una réplica completa del robot fotografiado: modelar las piezas adicionales que no existen en este catálogo, como los sensores inferiores, y cotejar medidas del kit físico. Esta entrega mejora las piezas disponibles y agrega una protoboard funcional; no reproduce todo el montaje de las fotos ni valida un equipo físico.

## Ampliación posterior del kit

El catálogo se amplió a 17 definiciones y se incorporaron sensores infrarrojos funcionales, soporte, interruptor y regulador. El ejemplo ahora contiene 14 piezas y 28 cables; hay tres plantillas. Ver [Guía actual del kit y los robots](GUIA_ROBOTS_CON_PROTOBOARD.md). Este informe conserva el registro de la mejora visual inicial.

