# Tierra de protección (TP) · 31-10-2026

## Qué pasa en la realidad y qué hace ahora el banco

Un motor trifásico **sin tierra gira igual**: la tierra no lo alimenta. Lo que cambia es la seguridad.

| Situación | Resultado en el banco |
|---|---|
| Motor con TP unida a la TP de la fuente, aislación sana | Todo normal, sin avisos |
| Motor sin TP, aislación sana | Gira; aviso «sin tierra de protección» |
| Motor con TP y fuga de aislación | La fuga vuelve por TP (mA), la carcasa queda a 0 V |
| Motor sin TP y fuga de aislación | La carcasa flota cerca de la tensión del devanado; una persona (1 kΩ) recibe `V/(R_fuga+1000)`; ≥ 30 mA se marca como peligro de choque |
| Fuga muy baja con TP (≥ 2 A) | «Falla franca a tierra». El banco no tiene diferencial ni curva de disparo modelados |
| Fase o mando unidos a TP | Cortocircuito a tierra |

## Archivos

- `src/data/panelEarth.ts`: modelo de tierra (nuevo).
- `src/data/panelElectrical.ts`: calcula `earth` y `earthVoltage` con las tensiones reales del solver.
- `src/data/panelMeter.ts`: el voltímetro entre dos bornes TP lee la tensión de la carcasa.
- `src/hooks/useSimulation.ts`: el aviso va a `protectionWarning`.
- `src/data/faultCases.ts`: casos `earth-motor` (cableado) y `touch-voltage` (práctica).
- `qa/verify-panel-earth.mjs`: 37 comprobaciones.

## Supuestos del modelo (por confirmar con el banco físico)

- La TP de la fuente es la referencia de tierra (esquema TN-S: neutro de la red unido a tierra en el origen).
- Los bornes TP izquierdo y derecho de un mismo módulo son una barra común; así la cadena pasa de un aparato al siguiente.
- La fuga no se retroalimenta al solver: con aislación sana (decenas de kΩ) es despreciable.

## Hallazgo

El montaje `twoContactors` (40 cables, el de la lección principal) **no trae ningún cable de TP**. `manual` y `matias` sí. Ahora el banco avisa «sin tierra» en ese montaje. No se agregaron cables TP a la lección porque su cableado sale de las figuras del PDF.

## Pruebas

`tsc`, `npm run build`, `verify-panel-earth` (37), `verify-fault-cases` (120), `verify-panel-faults` (21), `verify-guide-pdf-nets`, `verify-estrella`, `verify-simulation`, `verify-motor`, `verify-wiring`, `verify-panel-history`, `verify-laboratory`.

No se probó la interfaz en el navegador ni en dispositivos físicos.

## Contacto de fuerza con resistencia muy alta

Un contacto con `contact-resistive` de 10 kΩ o más ahora se trata como abierto, igual que un cable cortado (`OPEN_OHMS`). Se corrige en `applyContactFaults`, que comparten los tres evaluadores: antes `solveMotor` seguía diciendo «girando en estrella» mientras el solver AC veía una fase abierta. Prueba: `qa/verify-contact-faults.mjs` (18 comprobaciones; falla sin el arreglo). Resistencias intermedias (p. ej. 5 Ω) siguen conduciendo y bajan la tensión del devanado en el solver.

## Sin hacer

- Unificar los tres evaluadores en uno solo: refactor grande; por ahora quedan cubiertos por pruebas de paridad.
- Corriente de fuga retroalimentada al solver (es despreciable con aislación sana).
- Prueba de interfaz en navegador y en teléfono/tablet reales.

## Bloqueo sin tierra (a pedido)

La tierra es **una sola**: basta un cable de TP entre el motor y la TP de la fuente. Si falta, el banco no energiza FUERZA ni CONTROL y dice qué hacer (`earthGaps` / `earthGapText` en `panelEarth.ts`). Se aplica en los tres evaluadores (`solveSimulation`, `panelElectrical`, `readPanelMeter`) mediante `SimulationInput.earthRequired`, que `useSimulation` activa por defecto. Se puede desactivar en **Banco · protección y referencias → Estado** («Exigir la tierra de protección (TP) del motor para energizar»); la preferencia se guarda en el navegador.

- Los ejemplos virtuales y los montajes de las lecciones de mediciones agregan solo el cable TP del motor si falta (`earthCompletion`); `twoContactors` pasa de 40 a 41 cables.
- Las pruebas que llaman a `solveSimulation` sin `earthRequired` no cambian.
- `qa/verify-panel-earth.mjs`: 58 comprobaciones, incluido el bloqueo y que el multímetro explique el motivo.

No verificado: pruebas de interfaz que cuenten 40 cables en la lección de dos contactores, ni el estado bloqueado en pantalla.

## Tablero de Electrodesk (Equipos eléctricos)

- Las protecciones del motor de equipos ya disparaban solas (magnético 10×In, térmico inverso, diferencial de 30 mA, rearme OFF/ON); el traspaso `CONTINUAR_ELECTRODESK_CON_CLAUDE.md` estaba desactualizado en ese punto.
- Nuevo: en el **tablero** (`board.cabinet`), si la PE de un motor no llega a la PE de la alimentación, no se energiza ninguna fuente y aparece «Falta la tierra de protección (PE) de M1…». Basta un cable (`motorsWithoutEarth` en `src/lab/equipment/engine.ts`). El banco libre de Equipos no cambia.
- La prueba «Una ruta PE abierta impide la verificación aunque el motor funcione» pasó a «Sin la PE del motor el tablero no energiza…» y se reescribió el texto de la falla `earth`.
- Pruebas: `verify-cabinet` (24), `verify-equipment` (27), `verify-cabinet-cables`, `tsc` y build correctos. No probado en navegador.
- Sin hacer: fallas de aislación en el motor del tablero con tensión de carcasa, iconos pendientes y el parche PLC. No se publicó.

## Iconos y símbolos (Equipos eléctricos)

Variantes visuales de tipos existentes, guardadas en `params.text` (sin tipos nuevos ni cambios eléctricos; el JSON anterior sigue válido). Se eligen en **Parámetros del equipo → Variante visual** (`VARIANTS` en `model.ts`).

| Tipo | Variantes |
|---|---|
| Piloto | verde, rojo, ámbar, amarillo, azul, blanco y **bombillo** (vidrio, filamento y brillo al encender) |
| Pulsador NA / NC | verde, rojo, amarillo, azul, blanco, negro |
| Selector | **interruptor de pared** (placa y balancín I/O) |
| Barra | **neutro** (azul, N) y **tierra** (verde-amarillo, PE) |
| Riel DIN | **8 y 12 posiciones** numeradas |
| Disyuntor 1P / 2P | **corriente continua** (franja azul, polaridad +/−, «DISYUNTOR DC») |
| Contactor / relé térmico | **símbolo IEC** en la vista simbólica: tres polos alineados con los bornes, bobina A1–A2 y bimetales |

Comprobado: `tsc`, build, `verify-equipment` (27), `verify-cabinet` y `qa/render-icon-variants.mjs` (66 dibujos sin error; HTML de revisión en `qa/icons-variants/variantes.html`, revisados a ojo en el navegador).

No comprobado: `qa/verify-equipment-icons.cjs` (espera un botón «Mando y protecciones» dentro de la barra de herramientas, que hoy está en el catálogo; el selector quedó desactualizado). Las miniaturas del catálogo muestran la variante estándar. La polaridad del disyuntor DC es pequeña. No se publicó.

## Robótica: ventanas de guías y código copiado

- **Causas del «recompilar» al copiar:**
  1. Al copiar el bloque de código de «Programar paso a paso» salían líneas en blanco entre cada línea (un `\n` sobrante dentro de elementos de bloque), así que el texto pegado ya no coincidía con el paso.
  2. «Poner este código en mi programa» dejaba un borrador anterior del editor por encima: el editor no se rellenaba y el estado pasaba a «Hay que recompilar». Ahora limpia el borrador.
  3. El sitio publicado no tiene servicio de compilación, así que cualquier diferencia exigía un `.hex`.
- **Arreglo:** el código que coincide con un paso de las guías (ignorando CRLF, espacios al final y líneas vacías sobrantes) usa su programa ya compilado al instante, también al pegarlo a mano (`precompiledHex` en `guide/programCheck.ts`, aplicado en `setSource`). Nuevo botón **Copiar código** en cada paso.
- **Código propio** (distinto de la guía): sigue necesitando compilador. Sin servicio de compilación solo queda importar un `.hex`; no se inventó otra vía.
- **Ventanas:** «Cableado paso a paso» y «Programar paso a paso» pasaron de paneles fijos sobre el lienzo a `FloatingWindow`: se mueven, se ajustan por los bordes, se maximizan y recuerdan su lugar (`robotica:wiring`, `robotica:program`; «Restablecer disposición» también las restablece).
- **Pruebas:** `qa/verify-robotics-paste.mjs` (169), `qa/verify-robotics-guide-windows.cjs` (ventanas flotantes, código puesto y pegado, sin errores de consola), más `verify-robotics-guides-ui`, `wire-guide-ui`, `build-ui`, `code-ui`, `wiring-ui`, `program-guide` y `guides-e2e` correctas. `verify-robotics-ui.cjs` falla en «sin ilustración (D-09 pendiente)», ajena a estos cambios.

## Robótica: espectro del código

En «Programar paso a paso», el botón **Escribirlo yo, con espectro** abre Programación y muestra el código del paso en gris detrás de lo escrito (`ghostField` en `windows/CodeEditor.tsx`, lógica en `windows/ghost.ts`). Cada letra correcta reemplaza al espectro; **Tab** o «Escribir la siguiente línea» escribe la línea siguiente; si lo escrito se aparta del paso, el aviso nombra la línea y ofrece «Empezar de cero». Si el editor tiene solo la plantilla inicial se vacía solo. Al cambiar de paso el espectro cambia; al cerrar la guía se quita. Tab solo se intercepta mientras hay espectro. Prueba: `qa/verify-robotics-ghost.cjs`.

## PLC del laboratorio (avance pendiente terminado)

El parche guardado (`handoff-claude/plc-incompleto`) no se aplicó entero: los cinco archivos habían cambiado desde su base, así que se portó a mano, sin jsPDF (nunca se implementó un exportador). Lo que quedó:

- **Bloques nuevos:** TP (no se redispara durante el pulso), flancos ↑/↓ (un ciclo), CTD (inicia en PV, baja y no pasa de 0) y CTUD (subida y bajada simultáneas se anulan). CTU/CTD/CTUD aceptan **Reset** (prioridad 1), **Carga PV** (prioridad 2) y **cuenta descendente**; estado independiente por segmento. Diagnósticos L006 (señal del bloque inexistente) y L007 (ajuste de contador no entero).
- **Programa aplicado:** `plc.active` es lo que corre en RUN; el borrador se puede editar sin afectarlo y uno con errores no sustituye al activo. «Aplicar programa» solo con la simulación detenida y el próximo arranque reinicia memoria, temporizadores y contadores. Se guarda, exporta e importa validado (un activo inválido o anidado se rechaza).
- **Pausa** (conserva el estado) y **Detener** (lo reinicia): botón nuevo en la barra; Detener pasa a un cuadrado.
- **Segmentos:** botones ↑ / ↓ para reordenarlos (se ejecutan de arriba abajo; la última escritura gana).
- **Alcance:** ST conserva su subconjunto actual; no se amplió ni se anuncia completo.
- **Pruebas:** `qa/verify-plc-blocks.mjs` (21), `verify-cabinet` (24), `verify-equipment` (27), `verify-laboratory` (38), `tsc` y build correctos. En el navegador: modos nuevos en la lista, «Programa aplicado», Pausa/Reanudar sin avanzar los contadores durante la pausa y Detener.
- **No pasan por estar desactualizadas:** `verify-cabinet-plc.cjs` y `verify-cabinet-ui.cjs` buscan un botón «Taller de tableros» que ya no existe en la pantalla de inicio de Equipos.
