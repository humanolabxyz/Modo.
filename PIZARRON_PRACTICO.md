# Pizarrón práctico del laboratorio

Implementado el 15 de octubre de 2026 siguiendo `CONTINUAR_CON_CLAUDE.md`. Trabajo solo local, sin despliegue. El panel de práctica, el inicio y el estudio no se modificaron.

## Qué cambió

**Protoboard** (`/laboratorio?tool=breadboard`) pasa a un lienzo que ocupa toda el área práctica, con el mismo lenguaje del panel: fondo gris azulado con trama, controles flotantes, dock oscuro, zoom, desplazamiento y ajuste.

| Pieza | Descripción |
| --- | --- |
| Navegación | Reutiliza `useSvgNavigation` sin tocarlo: rueda desplaza, Ctrl/Cmd + rueda acerca alrededor del cursor, Espacio o botón central arrastran, pellizco en tacto. Arrastrar el fondo (o desde cualquier punto pasado un umbral de 5 px ratón / 9 px tacto) desplaza la vista y descarta el clic siguiente: navegar no coloca, selecciona ni opera nada. Teclado: flechas, `+`, `-`, Inicio. |
| Dock | Seleccionar (V), Mover vista (H), Puente (W), Resistencia (R), LED (L), Interruptor (S), Medir (M), Retirar (E), Deshacer y Rehacer. Durante RUN solo quedan activos Seleccionar, Mover vista y Medir. |
| Biblioteca | Plegable, con miniaturas. Incluye la entrada por nombre de orificio y la ayuda del modelo dentro de apartados plegables. |
| Fuente DC | Tarjeta flotante con `5 V DC`, tensión editable (0,1 a 24 V) con valores frecuentes y ubicación de polos. |
| Multímetro | Tarjeta flotante con puntas A/B, tensión A − B y corriente del componente seleccionado. Sin referencia se muestra «sin referencia», nunca 0 V. |
| Valores | Cada resistencia muestra `1 kΩ`, `4,7 kΩ`, `1 MΩ`… junto al componente, en diseño y en simulación. En RUN la corriente medida aparece como una pastilla verde aparte (`3,069 mA`). El interruptor muestra Abierto/Cerrado; el LED muestra `Vf 1,9 V` al seleccionarlo. |
| Edición contextual | Al colocar una resistencia o un LED, o al seleccionar cualquier componente, se abre un editor junto a él (hoja inferior en móvil). Valor, unidad (Ω/kΩ/MΩ), valores frecuentes (220 Ω, 330 Ω, 470 Ω, 1 kΩ, 4,7 kΩ, 10 kΩ), vista previa en la placa, «Se guardará como 4700 Ω». Enter aplica, Escape cancela. Un error permanece junto al campo y no sustituye el valor válido. Aplicar es un solo paso de deshacer; cancelar no crea historial ni guardado. |
| Bandas | Se calculan a partir del valor (dos cifras + multiplicador) solo cuando el valor es exactamente representable; si no (por ejemplo 1,234 kΩ) el cuerpo queda neutro. No se dibuja tolerancia: el modelo no la tiene. |
| Etiquetas | Siempre horizontales. Se ubican en franjas libres de orificios (sobre los rieles, entre rieles y fila a, canal central, bajo los rieles inferiores), evitando patas, puentes y otras etiquetas, con una línea guía punteada al componente. Hacer clic en la etiqueta abre el editor. |
| LED | Polaridad dibujada (+ / − y tope en el cátodo), color editable e «Invertir polaridad». La caída configurada se distingue de la tensión medida. |

**Esquemas, PLC, HMI y Procesos** adoptan en escritorio (> 800 px) la misma composición flotante: encabezado, selector de herramienta, barra de la herramienta, inspector e indicadores flotan sobre el área práctica. Solo es presentación (CSS): la lógica, los datos y las vistas no cambiaron. En móvil conservan su disposición anterior. PLC mantiene el editor de texto ST y el ladder en una tarjeta con desplazamiento.

## Archivos

Nuevos: `src/lab/units.ts` (formato, lectura y validación de Ω/V/A; bandas), `src/lab/labels.ts` (colocación de etiquetas), `src/lab/CanvasControls.tsx` (dock y zoom reutilizables), `src/lab/ValueEditor.tsx` (editor contextual), `src/lab/BreadboardParts.tsx` (placa y componentes), `src/styles/laboratory-canvas.css`.

Modificados: `src/lab/BreadboardView.tsx` (reescrito; misma lógica de montaje y solver), `src/lab/LaboratoryApp.tsx` (clase de modo, etiqueta accesible del botón de ayuda, accesos al panel y estudio en el menú Proyecto, visibles en el modo flotante), `src/pages/laboratorio.astro` (importa la hoja nueva), `qa/verify-laboratory.mjs` (5 pruebas nuevas).

No se tocaron `solveBreadboard`, `dc.ts`, `model.ts`, `validation.ts`, `useLaboratory.ts` ni los archivos del panel. Respaldos de los archivos reemplazados en `qa/backups-pre-pizarron/`.

## Modelo de datos

Sin migración. `ProtoComponent.value` sigue guardando ohmios (resistencia) o voltios (LED). `4,7 kΩ` → `4700`. Los proyectos de versión 1 abren igual; la exportación/importación JSON conserva conexiones, valores y colores (comprobado con las pruebas de modelos; no se repitió el recorrido de archivos en el navegador). La lectura de números rechaza la entrada ambigua `1.000` (¿decimal o miles?) en lugar de adivinar; admite `4,7`, `4.7`, `4k7`, `1 MΩ`, `1.000.000`, `1.000,5`.

## Validación

- `npm run check` y `npm run build`: sin errores.
- `node qa/verify-laboratory.mjs`: 28/28 (23 existentes + 5 nuevas: formato, lectura de unidades, bandas, edición 4,7 kΩ → 4700 con referencia 3,069 mA, etiquetas sin cubrir orificios ni patas).
- `npm run verify:data`, `verify:simulation`, `verify:wiring`: correctas.
- Navegador local (Astro dev, puerto 4336), escritorio 1440 × 900 y 1280 × 720, móvil 390 × 844, consola sin errores:
  colocar resistencia → `1 kΩ` inmediato y editor abierto; editar a `4,7` → guardado 4700, etiqueta y bandas coinciden; texto no válido → error junto al campo y valor intacto; borrador `2,2` con vista previa y Escape → sin cambios ni historial; confirmar `2,2` + Ctrl+Z / Ctrl+Y restauran valor y etiqueta; zoom con Ctrl + rueda y desplazamiento por arrastre sin añadir componentes y colocación correcta después; RUN con fuente 5 V, 1 kΩ y LED: A−B = 5 V y 3,069 mA; nodo flotante con advertencia y sin corriente inventada; interruptor operado en RUN (corriente 6,458 mA → 0 mA) sin alterar el diseño guardado; hoja inferior en móvil.
- Capturas reales en `qa/pizarron-practico/` (800 px de ancho, tomadas del panel de navegador).

## Pendientes y límites

- ~~Mover componentes ya colocados~~ (resuelto en la ronda de mejoras de más abajo).
- ~~Esquemas, HMI y Procesos sin zoom~~ (resuelto: ahora tienen zoom; ver más abajo).
- Sin identificadores R1/R2, posición manual de etiquetas ni tolerancia: no existen en el formato.
- No ejecutado: regresión de canvas del panel (`verify:canvas` y demás scripts de navegador del panel; no se modificó navegación compartida), pruebas en dispositivo móvil físico, pellizco real con dos dedos, lectores de pantalla, 1920 px. El móvil se probó solo con el ancho emulado.
- En móvil la vista inicial amplía la mitad izquierda de la placa (columnas 1–15) para que los orificios sean tocables; «Ajustar» muestra la placa completa.
- El modelo eléctrico sigue siendo DC resistivo con LED de caída aproximada; capacitores, transistores y microcontroladores no están incluidos.

## Clase 4 · puente H con L293D (añadido)

Diagramas de `clase_4.pdf` (docente Elizabeth Morales) incorporados a la protoboard: tarjeta **Diagramas** (Práctica 2 con L293D, pines del L293D y Práctica 1 con transistores, esta última solo como referencia: los 2N2222 no están en la biblioteca). El visor se abre al lado de la placa y la reencuadra; se puede acercar y cambiar de diagrama. Imágenes en `public/diagrams/clase-4-*.png`.

Piezas nuevas (biblioteca, dock y bandeja móvil, todas con icono): **Pulsador** (conduce mientras se mantiene presionado en RUN), **Motor DC** (carga resistiva de 40 Ω por defecto, editable; el sentido de giro sigue la corriente: entrando por el primer extremo, horario, convención de este laboratorio) y **L293D** (DIP-16 sobre el canal central; clic en el pin 1, fila f, columnas 1–23).

Modelo didáctico del L293D: lectura lógica de IN/EN con umbral de 2,3 V (entrada sin conectar = baja); salidas activas a VS o GND si VSS ≥ 4,5 V, GND conectado y EN alto; sin retardos ni corriente de alimentación. Se avisa si VSS supera 7 V (hoja de datos típica), si una salida pasa de 600 mA o si una salida activa se une a otra tensión fija (falla, no se resuelve).

Ejemplo cargable (menú Proyecto o tarjeta Diagramas): «Práctica 2 armada», con R1 = 330 Ω según la lista de materiales (el dibujo rotula 650 Ω) y la fuente de 12 V. Está montado tal como se dibuja: EN1 (pin 1) y IN2 (pin 7) comparten el pulsador S2; IN1 (pin 2) va a S1. Por eso solo S2 hace girar el motor (S1 solo no habilita el canal; S1 y S2 juntos dejan ambas salidas en VS y el motor parado). El formato de archivo sigue en versión 1 con tres tipos de componente nuevos: un proyecto con ellos no abre en una versión anterior de la aplicación.

Pruebas: 29/29 (prueba nueva del puente H: sin pulsar, S2, S1, S1+S2, sin tierra, VSS bajo, conflicto de salidas, L293D mal ubicado). Navegador: ejemplo cargado, S2 → motor ↺ 300 mA y aviso de VSS = 12 V; bandeja móvil con 7 componentes y Diagramas.

Pendiente: transistores (2N2222) y Práctica 1, medición de «voltaje en la resistencia» con la caída por consumo del integrado (el modelo no consume corriente en VSS, así que R1 no cae), los canales 3 y 4 del L293D están modelados pero el ejemplo no los usa; nada de esto se ha contrastado con un circuito físico.

## Transistor 2N2222, funcionamiento de la protoboard y fidelidad de las piezas (añadido)

**Transistor NPN 2N2222** en la biblioteca (tecla T, icono TO-92). Ocupa tres orificios seguidos de una misma fila: emisor, base (el del medio) y colector; cara plana al frente, E · B · C de izquierda a derecha (patillaje típico del 2N2222/PN2222 en TO-92; confirma con tu hoja de datos, la versión metálica TO-18 se numera distinto). Ganancia β editable (10 a 1000, 100 por defecto).

Modelo didáctico de tres regiones: **corte**, **activa** (Vbe = 0,7 V, Ic = β·Ib) y **saturación** (Vce ≈ 0,2 V). Sin efecto Early, capacidades ni temperatura. Una unión en corte no une sus nodos: lo que queda sin camino a la fuente se muestra «sin referencia» en lugar de inventar una tensión. Avisos: Ic mayor de 600 mA, potencia mayor de 0,625 W (TO-92) y corriente de base alta por falta de resistencia de base. El editor muestra región, Ib, Ic, Vbe y Vce durante la simulación.

**Práctica 1 armada** (menú Proyecto o tarjeta Diagramas): el puente H con cuatro 2N2222, cuatro resistencias de 1 kΩ, dos pulsadores, motor de 40 Ω y fuente de 12 V, cableado como en el diagrama de la clase. S1 hace conducir Q2 (activa, emisor seguidor) y Q4 (saturado) y el motor gira en un sentido (≈ 213 mA); S2 acciona Q1 y Q3 y gira al revés. Con S1 y S2 a la vez el puente conduce de +12 V a tierra y se avisa de la sobrecorriente.

**Cómo funciona la protoboard** (tarjeta «Cómo funciona» y botón del ojo en la barra de zoom):
- Seis pasos que resaltan en la placa: columnas de cinco orificios, canal central y circuitos integrados, rieles partidos entre las columnas 15 y 16, una pata por orificio, interior y circuito.
- **Ver interior** dibuja las láminas metálicas bajo los orificios. Con él activo, pasar el cursor sobre un orificio resalta toda su red eléctrica (columnas, rieles, puentes e interruptores o pulsadores cerrados) y dice cuántos orificios la forman.
- **Una pata por orificio**, como en una protoboard real: un orificio con dos patas se marca en rojo y se avisa; al colocar sobre un orificio ocupado se avisa sin bloquear (los proyectos guardados siguen abriendo). La plantilla de referencia pasó a usar b5, b10 y c10 para cumplirlo: mismo circuito y misma corriente (3,069 mA).

**Fidelidad visual:** transistor TO-92 con cúpula, cara plana, rótulo 2N2222 y letras E B C; motor con carcasa metálica, tapa, eje, terminales y su flecha de giro; pulsador táctil con marco, patas y casquete que se hunde al presionarlo; LED con brida, lente y tope en el cátodo; L293D con muesca, patas y nombres de pines; resistencia con bandas calculadas.

Pruebas: 32/32 (nuevas: regiones del transistor, base en el orificio del medio, Práctica 1 completa, una pata por orificio en todas las plantillas). Navegador: colocación del 2N2222 (con aviso si los orificios no sirven), Práctica 1 con S1 (Q2 activa, Q4 saturación, motor ↻ 213 mA), tutorial, láminas y red de a4 = 25 orificios, bandeja móvil.

Pendiente: el modelo no incluye PNP, MOSFET ni diodos de rueda libre (el motor real los necesita); el motor es una carga resistiva sin inercia ni fuerza contraelectromotriz; ninguna medida se ha contrastado con circuitos físicos.

## Simulador «como en la vida real» (añadido)

**Multímetro de banco** (tarjeta Multímetro): cuatro funciones con la pantalla de cristal líquido y las puntas roja y negra que se colocan en los orificios (herramienta Medir o «Atajos: poner las puntas en…»).
- **V⎓ Tensión**: con la simulación en marcha; el signo negativo indica puntas invertidas; «SIN REFERENCIA» si una punta toca una parte aislada de la fuente.
- **A⎓ Corriente en serie**: el amperímetro se inserta en el circuito (0,1 Ω de carga). Colocado en paralelo cortocircuita el tramo, como uno real: en la prueba, sobre una resistencia de 1 kΩ deja pasar ~307 mA por el LED y lo quema; entre los polos de la fuente funde el fusible de 10 A («FUSIBLE FUNDIDO», se repone al detener).
- **Ω Resistencia** y **•)) Continuidad**: solo con la simulación detenida (circuito sin energía), con 0,4 V de prueba: un LED marca OL, un circuito abierto marca OL, un cable marca 0 Ω y la continuidad se enciende por debajo de 50 Ω. Las lecturas usan cuatro dígitos con la unidad y el rango que elegiría un instrumento automático.

**Fallas y consecuencias** (solo con la simulación en marcha; la pieza dañada actúa como circuito abierto, queda marcada «Quemado» con humo y se repone al detener): LED por más de 50 mA o tensión inversa de más de 5 V; resistencia por más de 0,5 W; 2N2222 por Ic de más de 1 A, más de 1 W o Ib de más de 100 mA; L293D por más de 1,2 A en una salida; fusible del multímetro a 10 A. La fuente tiene protección a 3 A: si el circuito la excede sin que antes se queme algo, se apaga («Protección de la fuente»). En la Práctica 1, presionar S1 y S2 a la vez quema transistores del puente. Las advertencias previas (20 mA del LED, 0,25 W, 600 mA) siguen mostrándose antes de que algo falle.

**Valores reales** (casilla «Componentes reales» de la tarjeta Fuente, desactivada por defecto para que las prácticas coincidan con los cálculos): resistencias y motor con ±5 %, LED con ±3 % en Vf y β del transistor ±30 %, estables por pieza (no cambian al repetir la simulación ni al recargar). Las etiquetas muestran el valor nominal; el óhmetro y las corrientes muestran el real (por ejemplo, 1 kΩ lee 1,028 kΩ).

**Tabla de mediciones y conclusiones** (tarjeta Mediciones): «Anotar medida» guarda tipo, puntas, valor con unidad y una descripción editable (por ejemplo «Resistencia 330 Ω» o «Fuente de alimentación», detectadas por las puntas). Se puede copiar al portapapeles, exportar a CSV (separador «;», coma decimal) y borrar. Incluye un cuadro de conclusiones con contador de las diez líneas que pide la práctica. La bitácora se guarda con el proyecto, no entra en el historial de deshacer y se puede anotar durante la simulación. El formato de archivo sigue en versión 1 con tres campos opcionales nuevos (`realistic`, `log`, `notes`).

Pruebas: 35/35 (nuevas: óhmetro, tolerancias estables y formato, amperímetro en serie/paralelo y fusible, fallas, protección de la fuente, bitácora). Navegador: ohmios de la plantilla (1,000 kΩ; con valores reales 1,028 kΩ), continuidad, tensión de fuente 5,000 V y de R 3,069 V, amperímetro en paralelo que quema el LED, tabla con la medición anotada y vista móvil del multímetro.

Límites: modelo de corriente continua en régimen permanente; los daños son por umbral instantáneo (sin acumulación térmica ni tiempo); sin osciloscopio ni medición de potencia; la exactitud del multímetro es ideal salvo el redondeo a cuatro dígitos y la carga de 0,1 Ω del amperímetro.

## Menús más compactos y multímetro en su propia pantalla (añadido)

- **Barra de herramientas reducida:** Seleccionar, Mover vista, **Componentes ▾**, Multímetro, Retirar, Deshacer, Rehacer y **Aprender ▾**. El botón de Componentes muestra el último componente usado y, al pulsarlo, abre la lista (icono, nombre, nota y tecla de acceso); se cierra al elegir, con Escape o al tocar fuera. Los atajos de teclado (W, R, L, S, P, O, I, T) siguen funcionando. Desaparecieron la biblioteca lateral y la bandeja móvil.
- **Aprender ▾:** reúne «Cómo funciona», «Diagramas de la clase» y «Puntos por nombre»; cada uno se abre como tarjeta solo cuando se pide y libera la placa mientras no se usa.
- **Multímetro en pantalla:** en la barra derecha queda una tarjeta compacta con la lectura; tocarla (o el botón del dock) abre el instrumento: carcasa amarilla, pantalla de cristal líquido, selector giratorio (V⎓, A⎓, Ω, continuidad) y conectores COM, VΩ y 10 A; la punta roja pasa al conector de 10 A en el modo de corriente. Pestañas «Medir» y «Tabla». «Colocar las puntas en la placa» cierra la pantalla para tocar los orificios y la lectura sigue visible en la tarjeta compacta. En móvil ocupa casi toda la pantalla.

## Formularios en móvil: de páginas interminables a pantallas fijas (añadido)

Antes, en 390 px de ancho, Esquemas medía 1452 px de alto, HMI 1471, PLC 1784 y Procesos 2281 (hasta 2,7 pantallas). Ahora las cuatro herramientas son una **pantalla fija** de la altura del teléfono (comprobado: 844 px de alto de documento en las cuatro):

- Cabecera compacta de una fila, selector de herramienta desplazable y, debajo, el área de trabajo (esquema, ladder, pantalla HMI o planta) con su propio desplazamiento.
- Los formularios viven en una **hoja inferior plegable** (`InspectorSheet`): cerrada muestra solo el título y un resumen («G1 seleccionado», «9 variables»); se abre al tocarla y **se abre sola al seleccionar** un componente, un cable o un elemento de la pantalla. Primero salen las propiedades del elemento seleccionado y después la lista para añadir otros.
- Campos en dos columnas, con etiquetas cortas, tamaño de 16 px (evita el zoom automático de iOS) y alto táctil de 42 px. En Procesos, los seis parámetros y los cuatro vínculos con el PLC caben en una hoja en lugar de una página larga.
- La planta del proceso se ajusta al ancho; el esquema y la pantalla HMI siguen desplazándose porque sus elementos deben seguir siendo tocables.
- Escritorio sin cambios de comportamiento: la hoja es la misma tarjeta flotante de siempre.

Límites: no se probó en un teléfono real; la hoja ocupa hasta el 58 % de la altura al abrirse, por lo que el esquema queda parcialmente tapado mientras se edita (se pliega con el encabezado).


## Ronda de mejoras tras la revisión (añadido)

**Pruebas**
- `npm run verify:lab-ui` (nuevo, Playwright): 18 comprobaciones en escritorio 1440×900 y móvil 390×844 sin errores de consola: colocar y editar una resistencia (4,7 kΩ → 4700 Ω), cancelar, error visible, deshacer/rehacer, mover un extremo arrastrando, óhmetro, continuidad, tabla de mediciones, voltímetro (5,000 V y 3,069 V), amperímetro en paralelo que quema el LED, Práctica 2 con S2, teclado entre orificios, cables rectos, las cuatro herramientas en una pantalla en móvil, el protoboard a todo el ancho, el menú de componentes y el multímetro en pantalla. `npm run verify:lab` ejecuta las 37 pruebas de modelos.
- Regresión del panel (servidor de `npm run preview` y `PANELLAB_URL`): **pasan** `verify:mobile`, `verify:routes`, `verify:practice`, `verify:cade`, `verify:pwa`, `verify:data`, `verify:simulation`, `verify:wiring`. **Fallan** `verify:canvas`, `verify:ui`, `verify:interface` y `verify:reading`, todos en pasos del panel de práctica (por ejemplo el botón «Mi diagrama», que ahora vive dentro de un desplegable de `DiagramPane.tsx`). Esos archivos del panel no se tocaron en este trabajo (su última modificación es del 14 de octubre) y las pruebas llevan pasos desactualizados; **no se corrigieron** porque no son del laboratorio. Conviene actualizarlas aparte.

**Archivo versión 2.** Los proyectos nuevos se guardan como versión 2; la aplicación lee las versiones 1 y 2. Una aplicación anterior rechaza un archivo versión 2 con un mensaje claro en lugar de abrirlo a medias.

**Piezas nuevas:** **diodo 1N4007** (ánodo primero, banda en el cátodo, caída de 0,7 V; se quema por encima de 2 A) y **transistor PNP 2N2907** (mismo modelo de tres regiones con polaridad invertida). Para moverlos y para cualquier pieza: ver siguiente punto.

**Mover piezas colocadas.** Con la herramienta Seleccionar, la pieza elegida muestra manejadores: uno por extremo en las piezas de dos patas, y uno para todo el cuerpo en el transistor y el L293D (que conservan su forma). Mientras se arrastra se ve la pieza fantasma, el orificio de destino en verde o rojo y el motivo si no es válido (orificio inexistente, ocupado por otra pata, L293D fuera del canal). Soltar es un paso de deshacer. El editor incluye «Mover sin arrastrar» con los nombres de orificio, para teclado y lectores de pantalla.

**Cables.** Botón «Cables rectos» en la barra de zoom (se recuerda en el navegador) y los puentes se dibujan por debajo del resto de las piezas, de modo que ya no cruzan por encima del L293D.

**Zoom en Esquemas, HMI y Procesos** (barra con acercar, alejar y tamaño original; Ctrl/Cmd + rueda; teclas +, − y 0). En el esquema y en la pantalla HMI el arrastre de elementos sigue al cursor con zoom.

**Accesibilidad.** Los 420 orificios son ahora una sola parada de tabulador: las flechas se mueven por la cuadrícula (Inicio y Fin saltan a la primera y última columna) y enfocar un orificio muestra su red. La barra de zoom y la ayuda suben en pantallas de 801 a 1100 px para no chocar con el dock. No se probó con un lector de pantalla.

**Peso y modo sin conexión.** Los diagramas pasaron de PNG (~1 MB) a WebP (~150 KB). `dist/sw.js` precarga `/laboratorio/` y los tres diagramas, así que el laboratorio funciona sin conexión; `verify:pwa` pasa.

**Corrección de un error de diseño en móvil:** el contenedor del banco se encogía a una columna estrecha en ciertos anchos (por un margen automático heredado); ahora ocupa todo el ancho y hay una comprobación automática. CSS sin uso de rondas anteriores retirado.

**Pendiente (no hecho):**
- **Simulación en el tiempo (PWM, capacitores, inductancia del motor, osciloscopio) y MOSFET.** Exigen un motor de cálculo distinto del actual (régimen permanente); es un proyecto aparte, no una mejora del actual.
- **Confirmar con la docente** el R1 de 650 Ω del dibujo (el ejemplo usa 330 Ω de la lista de materiales) y que EN1 comparta el pulsador con IN2.
- **Pruebas en un teléfono real y con lector de pantalla.**
- **Actualizar las cuatro pruebas del panel que fallan** (`verify:canvas`, `verify:ui`, `verify:interface`, `verify:reading`).

## Multímetro como objeto del banco, con cables y puntas visibles (sustituye al panel anterior)

El panel «Multímetro» (pantalla con pestañas y tarjeta compacta) se retiró. Ahora el multímetro es un **instrumento sobre el lienzo**, junto a la placa:

- **Carcasa y pantalla reales:** cuerpo amarillo con funda negra, pantalla de cristal líquido (símbolo de la función, AUTO/HOLD y lectura con unidad), selector giratorio con cinco posiciones (OFF, V⎓, A⎓, Ω y continuidad) que gira al elegir, botones **REC** (anotar medida), **HOLD** (congela la lectura) y **TABLA** (abre la tabla de mediciones y las conclusiones), y los tres conectores **COM**, **VΩ** y **10 A**. En el modo de corriente el cable rojo pasa al conector de 10 A.
- **Cables y puntas:** de los conectores salen un cable rojo y uno negro (con sombra y brillo) hasta dos puntas de prueba dibujadas con su mango y su aguja metálica. Cuando una punta toca un orificio, la aguja queda sobre él y el orificio se resalta; las puntas sin colocar descansan junto al multímetro. Los cables siguen a la placa al desplazar o hacer zoom.
- **Colocar las puntas:** se **arrastra el mango de la punta** hasta un orificio (se ve un círculo verde del orificio al que se acoplará; si se suelta fuera, la punta vuelve a su sitio), o se usan los clics de la herramienta Medir y el selector «Poner las puntas en…» (fuente, resistencias, motor…). Arrastrar el cuerpo del multímetro lo mueve; el botón de la esquina lo reduce a una **píldora** con la lectura (en móvil empieza reducido) y el del dock lo oculta o lo muestra.
- Las lecturas, el óhmetro sin energía, el amperímetro en serie, el fusible, las fallas y la tabla son las mismas de antes: solo cambió la presentación.

Pruebas: `verify:lab-ui` (18 comprobaciones, incluida la de arrastrar la punta roja con el ratón y la del multímetro reducido en móvil) y 37 pruebas de modelos pasan.

Límites: el cable es un dibujo (no choca con otras piezas ni se enreda); sin lector de pantalla se probó solo con etiquetas accesibles (las puntas tienen botón con nombre, el selector es un grupo de opciones y la lectura está en una salida de texto).

## Cables con peso y placa con inercia (añadido)

- **Cables con física** (`src/lab/cords.ts`): cada cable del multímetro es una cadena de 16 puntos (integración de Verlet) con gravedad, amortiguación y holgura (≈ 16 % más largo que la distancia, nunca tensado de golpe). El último tramo es el mango de la punta: rígido, clavado por la aguja en el orificio y con una ligera tendencia a mantenerse en pie, de modo que se inclina cuando el cable tira de él. Se simula fotograma a fotograma leyendo la vista **en vivo**, no el estado de React, así que al desplazar, acercar o arrastrar el multímetro las puntas clavadas siguen su orificio sin retraso (comprobado: separación máxima menor de 2,5 px en cada fotograma) y el cable se balancea y se asienta. Con «reducir movimiento» activado el balanceo se amortigua.
- **Inercia de la placa:** al soltar un arrastre rápido, la vista sigue un instante y se frena sola (constante de frenado de 240 ms); tocar la placa la detiene. Los cables reaccionan a ese movimiento.
- Pruebas: 38 de modelos (incluida la del cable: conserva su longitud, cuelga, se balancea al mover la punta y se asienta) y 20 comprobaciones de navegador (cuadro a cuadro y de inercia).

Límite: el cable no choca con otras piezas ni con el otro cable.

## Esquemas, PLC, HMI y Procesos con el mismo pulido, y calculadora en Estudio (añadido)

**Panel de control (`/?view=simulator`): no se tocó**, por indicación expresa. Solo cambian el laboratorio y Estudio.

**Pizarrón compartido (`src/lab/PanStage.tsx`)** para Esquemas, HMI y Procesos, con el comportamiento de la protoboard: se desplaza arrastrando el fondo (ratón, lápiz o dedo) con **inercia** al soltar, acerca con Ctrl/⌘ + rueda, pellizco o botones (zoom centrado en el puntero, con animación), flechas y `0` por teclado, y «Ajustar» encuadra la zona donde están los componentes (en un teléfono prioriza que se lea: ≥ 55 % y se alinea al inicio). Reemplaza al antiguo `ZoomArea` (copia en `qa/backups-pre-pizarron/`).

**Barra flotante (dock) con menús** en los cuatro módulos, con los mismos botones oscuros de la protoboard:
- Esquemas: Seleccionar (V), Cablear (W), **Componentes ▾** (ocho símbolos con icono y una línea de explicación), Retirar (Supr), Deshacer/Rehacer.
- HMI: **Elementos ▾** (interruptor, piloto, valor, barra), Retirar, Deshacer/Rehacer.
- Procesos: abrir/cerrar la descarga (solo en simulación) y Deshacer/Rehacer.
- PLC: Ladder, Texto estructurado, Añadir segmento, Compilar, Deshacer/Rehacer.
Los componentes nuevos aparecen **en el centro de lo que se ve** (no en una cuadrícula fija) y quedan seleccionados. El inspector ya no lleva listas largas de botones: solo propiedades. Ctrl+Z / Ctrl+Y funcionan en estos módulos.

**Aspecto real y con estado:** pulsador con capuchón (verde NA, rojo NC) que se hunde, cuchilla que abre y cierra el contacto; fuente como pila; bobina con A1/A2 que se ilumina al energizarse; piloto que brilla; motor que gira; cables que se marcan con tensión; tanque con graduación y reflejo, rotor de la bomba que gira; símbolos de escalera dibujados (contacto NA/NC, bobina, SET/RESET, TON/TOF/CTU) que se iluminan al conducir.

**Móvil:** pantalla fija sin página interminable; barra flotante dentro de la pantalla; lienzo legible; el PLC apila la bobina bajo los contactos y pone su barra arriba.

**Estudio:** barra de herramientas «Herramientas de estudio» disponible en **todas las pantallas** (antes solo en la evaluación) con **Calculadora** y **Fórmulas**. La calculadora se abre superpuesta (Alt+C, Escape cierra), se **arrastra desde su cabecera** en escritorio, sube como hoja inferior en móvil y conserva la operación al cerrar y abrir. En la pantalla de Cálculos no se duplica.

Pruebas: `verify:lab` 38/38; `verify:lab-ui` 31 comprobaciones (incluye Esquemas, HMI, Procesos, PLC, Estudio y móvil); `qa/touch-modules.cjs` (pan y pellizco táctiles con eventos reales); `npm run check` y `npm run build` correctos; `verify-study-calc`, `-lessons` y `-storage` pasan. Los scripts `verify-study`, `-focus`, `-polish`, `-learning`, `-professor` y `-schematic` fallan porque comparan la lista de archivos modificados con una instantánea antigua (mencionan `src/components/App.tsx`); no dependen de estos cambios.
Capturas: `qa/modulos-lab/antes` y `qa/modulos-lab/despues` (`node qa/shots-modules.cjs <carpeta>`).

Límites: sin prueba en un teléfono real ni con lector de pantalla; los módulos de proceso siguen siendo un modelo didáctico 2D.

## Estudio · Cálculos como banco de trabajo y chuleta de fórmulas (añadido)

La pantalla Cálculos se leía como una página de documentación (siete secciones numeradas en una columna larga). Ahora es una herramienta:
- **«¿Qué quieres calcular?»** a la izquierda: ocho tareas agrupadas, cada una con su pregunta («¿Sirve esta protección?», «¿Cuánto aguanta el cable?»…).
- **Banco de trabajo** en el centro: título y una línea de para qué sirve, la **fórmula a la vista**, «Tus datos» con unidades dentro del campo y **resultado en vivo** (verde si cumple, rojo si no). La explicación queda a un toque en cuatro pestañas: Paso a paso, Símbolos, Para qué sirve y Ejemplo.
- **Calculadora al lado**, fija, y conectada: «Pasar a la calculadora» y «Escribir ahí» (la operación que comprueba el resultado) llevan datos a la calculadora, y **«Usar 10,8688»** trae el último resultado de la calculadora a cualquier dato de la ficha. Funciona igual con la calculadora superpuesta (mismos eventos).
- **Chuleta de fórmulas** (botón «Fórmulas» de la barra de estudio, en cualquier pantalla): lista con cada fórmula visible; **al tocarla muestra qué significa cada símbolo** y un botón «Abrir la ficha y calcular». **No se ofrece durante la evaluación.**
- En menos de 1100 px la calculadora sale de la página y se usa desde la ventana superpuesta; el selector pasa a tarjetas/fila desplazable.

Archivos: `src/study/CalcModule.tsx` (rehecho; respaldo en `qa/backups-pre-pizarron/`), `FormulaSheet.tsx` (nuevo), `CalculatorDock.tsx` (pestañas Calcular/Fórmulas), `Calculator.tsx` (eventos compartidos), `study-calc.css`. Pruebas: `verify-study-calc.cjs` actualizado (incluye «Usar», chuleta y flujo móvil táctil), `verify-laboratory-ui` 31 comprobaciones, `verify-study-lessons` y `-storage` pasan. Capturas: `qa/calculos/antes` y `despues`.

## Menús del panel de práctica con iconos (añadido, a petición expresa)

Tras indicar que los menús del panel en móvil «invaden toda la escena» y no son de un toque, se rehicieron **solo esos menús** (el banco, los bornes y el modelo no cambian):
- **Menú de simulación 24 V** (`SimulationControls.tsx`): estado en una línea; cuatro interruptores de un toque con icono (Enchufe, Fuerza, Control 1, Control 2) que se ponen verdes al activarse; KM1/KM2 como etiquetas, botones redondos de «Disparar térmico» y «Restablecer»; ejemplos y explicación del modelo plegados con icono. Ocupa ≈ 330 px de ancho y como máximo el 60 % de la altura, se cierra al tocar fuera, con Escape o al cargar un ejemplo.
- **Menú «⋯» de opciones de práctica** (`App.tsx`): fichas con icono para Módulo (selector nativo bajo el icono), Cables (ver/ocultar), Ayuda y Exportar; modos como cuatro fichas (Explorar, Libre, Reconocer, Guía) en lugar de un desplegable; el filtro de módulos queda plegado.
- **Menú Proyecto del laboratorio**: cada acción lleva su icono.
Las etiquetas accesibles se conservaron (p. ej. «FUERZA · OFF», «Enchufar corriente virtual»), por lo que `verify-simulation-ui`, `verify-mobile`, `verify-diagram-simple`, `verify-cable-color`, `verify-routes` y `verify-focus` pasan. `verify-practice` y `verify-clean-interface` ya fallaban antes (buscan textos que no existen, como «Empezar práctica») y usaban el desplegable de modo, que ahora es un grupo de fichas. Respaldos en `qa/backups-pre-pizarron/`; capturas en `qa/menus/`.
