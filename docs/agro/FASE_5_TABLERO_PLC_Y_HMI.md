# modo. Agro · Fase 5 — Tablero con PLC, HMI y cableado

Estado: implementada y verificada (ver «Pruebas»). El tablero deja de ser un simple interruptor: lleva un **PLC genérico** con programa en escalera, una **pantalla HMI** y recibe por cable la señal de la **sonda de humedad**. Con eso el riego puede ser **automático**: la bomba arranca cuando el suelo se seca y se detiene cuando se humedece.

## Qué se puede hacer
- **Modo de mando del tablero:** *Manual* (como en las fases 3 y 4: el interruptor general energiza la bomba) o *Automático (PLC)*: además del interruptor general, la bomba solo recibe energía cuando el PLC activa su salida **Y0**.
- **Cablear la sonda:** la sonda de humedad se une con un cable a «Entrada de sensor» del tablero. Sin ese cable el PLC no ve nada y se avisa.
- **Entradas que calcula el mundo** (no se escriben): `X0` suelo seco (agua útil de la sonda < umbral «seco», 50 % por defecto), `X1` suelo húmedo (> umbral «húmedo», 85 %), `X2` dentro de la franja horaria de riego (0–24 h por defecto; admite cruzar la medianoche, p. ej. 22–6), `X3` reservada. Los umbrales y la franja son parámetros del tablero.
- **Salidas:** `Y0` contactor de la bomba, `Y1` piloto de riego (`Y2`, `Y3` reservadas).
- **Programa en escalera:** hasta 12 líneas, con ramas en paralelo (hasta 4), hasta 6 contactos por rama (normalmente abiertos o cerrados) y bobinas de salida, *set*, *reset*, temporizador (`ton`, en ms) y contador (`ctu`, `ctr`). Se arma desde el inspector (añadir línea, contacto, rama, cambiar bobina) y se dibuja con el mismo componente de escalera de Industria. Hay un **programa de ejemplo** («riego por humedad con histéresis y franja horaria»).
- **Pantalla HMI:** pilotos (leen cualquier dirección), interruptores (escriben una marca interna `M`) y textos. El ejemplo trae el interruptor «Riego automático» (`M0`) y los pilotos de suelo seco, suelo húmedo y bomba.
- **Alertas** del tablero en automático: sin programa, interruptor general apagado, sin sonda cableada o sonda fuera de toda parcela. El registro de sucesos anota cada arranque y parada de la bomba por el PLC.
- **Vista 3D:** dos pilotos en el tablero (modo automático y bomba activada por el PLC).

## Direccionamiento (estilo Delta, genérico)
| Tipo | Direcciones | Uso |
|---|---|---|
| Entradas | `X0`–`X3` | calculadas por el mundo |
| Salidas | `Y0`–`Y3` | `Y0` contactor de bomba, `Y1` piloto |
| Marcas | `M0`–`M15` | memoria interna; las pantalla las puede escribir |
| Temporizadores | `T0`–`T7` | bit de «cumplido» |
| Contadores | `C0`–`C3` | bit de «cumplido» |

Es una **convención de nombres para aprender**. No se afirma ni se intenta emular un PLC Delta real: no hay sus instrucciones, rangos, tiempos de escaneo ni su software de programación.

## Cómo se reutiliza Industria
- **Motor de escaneo:** `scanStep` de `src/industria/plc/program.ts` (contactos NA/NC en serie y en paralelo, *set/reset*, temporizador, contador). No se copió ni se modificó.
- **Tipos del programa:** `Rung`, `Contact`, `CoilMode`, `COIL_MODES`, `MAX_PRESET` de `src/industria/model/types.ts`.
- **Dibujo de la escalera:** `LadderNetwork` de `src/industria/views/LadderNetwork.tsx` (sus reglas de estilo se repiten acotadas a `.agro-rung` en `agro-fase5.css`, porque la página de Agro no carga `industria.css`).
- **Lo que es propio de Agro** (`src/agro/plc/program.ts`, `src/agro/sim/plc.ts`): las direcciones fijas, la edición validada sobre esas direcciones, la pantalla HMI, el empaquetado del estado en la pieza y las entradas que salen de la sonda y del reloj. Las funciones de edición de Industria están atadas a su `IndustryProject` (bindings, definiciones de componente), por eso no se reutilizan.
- **No se tocó** nada de `src/industria/` ni de `src/robotics/`.

## Decisiones
- **Dónde vive el programa:** campo opcional `plc` del mundo (`id de tablero → {rungs, hmi}`), dentro del historial de deshacer: programar se deshace y se rehace. Se omite del archivo cuando no hay ninguno, así que un mundo sin PLC se guarda **idéntico al de la Fase 4**. Una versión anterior del programa que reciba un archivo con `plc` ignoraría el campo (el formato `modo-agro` sigue en versión 1).
- **Estado en ejecución** (variables, acumulado de temporizadores y cuenta de contadores) en tres claves vivas del estado de la pieza (`plcBits`, `plcAcc`, `plcCnt`): son tiempo ya transcurrido, **no entran en el historial**; deshacer y rehacer los conservan. Si el programa cambia (editar, quitar, deshacer), las salidas, temporizadores y contadores se reinician y se conservan las marcas `M`.
- **Escaneo:** una vez por paso de simulación (hasta 5 min con agua en movimiento; hasta 10 min en reposo si hay un PLC con energía en automático), y de nuevo —sin avanzar el tiempo— tras cualquier cambio del jugador (interruptor, modo, pantalla, cable, deshacer). Es muy distinto del escaneo de milisegundos de un PLC real: **los temporizadores y las reacciones tienen la resolución del paso**.
- **Sin energía el PLC no corre:** hace falta acometida conectada a «Red de entrada» e interruptor general encendido. Al perderla se apagan las salidas, temporizadores y contadores y se conservan las marcas `M`.
- **Modo manual intacto:** los mundos de las fases 3 y 4 se abren igual. Su tablero recibe los parámetros nuevos (umbrales y franja) y el estado nuevo por defecto al abrirse.
- **Seguridad del archivo:** cada programa se valida al abrir (pieza que existe y es tablero, direcciones, modos, presets, límites, ids únicos, interruptores solo sobre marcas `M`), se copian solo los campos conocidos y un archivo dañado se rechaza con un mensaje.

## Qué NO es
Un PLC real ni el de ningún fabricante; sin lenguajes IEC 61131-3 distintos de la escalera, sin números ni comparadores (la «comparación» con umbrales la hace el mundo antes de la entrada), sin comunicaciones, sin protecciones eléctricas, corrientes ni caídas de tensión (la energía sigue siendo booleana), sin pulsador momentáneo en la pantalla (solo interruptores), una sola sonda por tablero y una sola salida de potencia (`Y0`, la bomba). La interfaz repite estas limitaciones.

## Pendientes conocidos
- Sin lectura analógica en el PLC (hoy solo dos umbrales digitales); llegaría con registros numéricos.
- Una sola bomba por tablero; varias salidas de potencia y contactores quedan para la fase de ampliación del catálogo.
- El diseño en móvil (barra de tiempo, inspector y lista de piezas) sigue pendiente, y el inspector del tablero es ahora más largo.
- Los FPS reales siguen sin medirse en un equipo con GPU ni en una tablet.
- Avanzar el reloj en tramos que no sean múltiplos del paso puede mover unos minutos el instante en que el PLC decide; sigue siendo reproducible si se avanza igual, en el mismo navegador y versión.

## Pruebas
`npm run verify:agro` suma **21 bloques de PLC** (`qa/verify-agro-plc.mjs`): direcciones, empaquetado exacto del estado (300 combinaciones), edición y validación del programa, pantalla HMI, el escaneo de Industria (enclavamientos, temporizador de 10 min, contador), entradas (umbrales y franja que cruza la medianoche), potencia manual contra automática, **riego automático en lazo cerrado durante 40 días** (la bomba trabaja solo una parte del tiempo y el agua útil se mantiene entre los umbrales), interruptor de la pantalla, franja nocturna, sonda sin cable, pérdida de energía, marcas desde la pantalla, deshacer/rehacer, guardar y reabrir (dos mundos evolucionan idénticos 10 días), mundo de la Fase 4 sin cambios, archivos dañados, eliminar el tablero y rendimiento (un año simulado con PLC en ≈ 1 s).
`npm run verify:agro-ui` suma 7 bloques con ratón y teclado reales: tablero vacío en manual, cargar el ejemplo, editar con deshacer, modo automático con la pantalla, arranque y parada de la bomba por el PLC con su registro, y recarga conservando programa y modo.

---

# Fase 5b — Nueva interfaz del workspace (según las referencias del bloque 03, 04 y 06)

Estado: implementada y verificada. Se aplicó lo que se pidió tras ver las referencias: HUD superior, barra de modos inferior, dock de piezas por categoría, inspector con pestañas, panel grande **Automatizar** (escalera + pantalla HMI), tarjeta de redes, barra contextual y etiquetas sobre los equipos. No se quitó ningún control de las fases anteriores (riel de herramientas, catálogo «Objetos», lista de piezas, minimapa).

## Qué cambió
- **HUD superior:** chips de temperatura estimada, ET₀, lluvia y suelo de la primera parcela; cámara (órbita, estratégica, caminar) y la barra de tiempo (fecha, pausa, velocidades y alertas) a la derecha.
- **Barra de modos inferior:** Construir, Inspeccionar, Riego, Electricidad, Automatizar y Capas.
- **Dock de piezas:** categorías a la izquierda y fichas a la derecha (Construir: Riego, Electricidad, Control, Cultivo; Riego: agua y cultivo; Electricidad: energía y control). Elegir una ficha deja la pieza lista para colocar (el fantasma y las reglas de colocación son los de siempre); Esc la suelta.
- **Inspector con pestañas** «General» y «Conexiones»; el tablero muestra un resumen y el botón «Abrir Automatizar».
- **Panel Automatizar** (referencias 06D y 06E): pestaña *Escalera* con las líneas dibujadas con el componente de Industria y la lista de entradas y salidas con su valor en vivo; pestaña *Pantalla HMI* con una pantalla oscura (caudal, presión, nivel del estanque, humedad del suelo, temperatura y potencia), botones Automático, Manual, Alarmas e Histórico, y los widgets del programa. Todos los valores salen del modelo; la temperatura es una estimación del modelo.
- **Barra contextual** de la pieza elegida (girar, eliminar y, en el tablero, Automatizar), **tarjeta de redes** (riego y eléctrica) y **etiquetas** sobre los equipos con su nombre y estado (se activan en «Capas»).
- **Capas:** etiquetas, puertos de conexión, minimapa y lista de piezas.

## Decisiones y límites
- **No se muestran datos que el modelo no simula:** no hay viento ni humedad del aire (las referencias los traen). Cuando exista un modelo para ellos se agregan.
- **Etiquetas como *sprites* 3D** (textura dibujada en un canvas 2D) y no como elementos HTML: las primeras pruebas con HTML dentro de la escena dejaban errores de limpieza al cerrar el mundo.
- **Nombres de producto de las referencias** («Delta DVP20SX2», «DOP-107EG», «Modbus RTU») **no se usan**: el PLC sigue siendo genérico con direcciones tipo Delta, sin emulación, y la pantalla dice «Origen del dato: simulado».
- **Arte 3D:** el terreno sigue siendo el del clima árido y las piezas son de primitivas; el nivel de las ilustraciones de referencia (vegetación, cielo, modelos detallados) es una tarea de arte aparte que aún no se ha hecho.
- **Móvil:** el HUD, la barra de modos y el dock se reordenan en pantallas angostas (los chips se ocultan y la barra de modos muestra solo íconos), pero no se probó en un teléfono real.

## Pruebas
`npm run verify:agro-ui` queda en **48 bloques** (los 7 de la Fase 5 se rehicieron para el panel Automatizar, más 2 nuevos: barra de modos con dock, y capas con etiquetas y barra contextual). Los ajustes a las pruebas anteriores fueron abrir la pestaña «Conexiones» antes de tocar puertos y hacer más robusta la espera del fantasma de colocación, que fallaba de forma intermitente desde antes de esta fase.
