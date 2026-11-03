# Fallas de laboratorio, revisión de cables y guías · 30-10-2026

## Qué se revisó

**Diagramas contra el PDF** (`Actividad 2 Unidad 2`, figuras Nº1 y Nº2):

- El dibujo «Estrella-triángulo» coincidía red por red. Solo el contacto NA de KM2 estaba rotulado «13 / 12» en lugar de «13 / 14»; corregido en `scripts/build-estrella-triangulo.mjs`, `src/data/cadeEstrellaTriangulo.json`, `src/data/starPanelMap.ts` y `qa/verify-estrella.mjs`.
- `scripts/build-estrella-triangulo.mjs` había quedado atrasado respecto del JSON (las salidas del contactor de triángulo 2→W2, 4→U2, 6→V2 se habían corregido a mano en el JSON). Ahora el script las genera, así que regenerar ya no las pierde.
- La lección manual (3 contactores) es idéntica a las dos figuras: `qa/verify-guide-pdf-nets.mjs` compara sus 21 redes con las del PDF.
- La lección de dos contactores (KT1 + KM1 con térmico + KM2) es coherente con ambas figuras; no se modificó su dibujo.

**Sistema de cables y solver** (hallazgos):

1. Los cables eran uniones ideales de 0 Ω; no existía cable cortado, flojo ni con resistencia.
2. Había tres evaluadores de topología independientes (`simulation.ts`, `panelElectrical.ts`, `panelMeter.ts`). Todo cambio eléctrico debe aplicarse en los tres.
3. Una bobina se energizaba por topología, sin mirar la tensión real: no había subtensión ni caída por contacto sucio.
4. Lo que sí estaba bien: solver AC fasorial, motor de inducción con secuencia positiva/negativa, térmico I² por clase, transición abierta, desbalance de fases.

## Qué se agregó

`src/data/panelFaults.ts` define las fallas y las comparten los tres evaluadores:

| Falla | Efecto |
|---|---|
| Cable cortado, con resistencia o intermitente (falso contacto) | Se retira o pasa a ser una rama con resistencia; el óhmetro, el voltímetro y la bobina lo ven |
| Bobina abierta | No cierra; óhmetro OL |
| Contacto abierto, pegado o con resistencia | Polos, auxiliares y pulsadores |
| Lámpara quemada | No enciende, sin cargar el circuito |
| Devanado abierto | Complemento de Schur sobre la admitancia acoplada del motor |
| Aislación baja | Solo óhmetro hacia TP |
| Secuencia invertida | El motor gira al revés |
| Secundario de mando bajo | Una bobina cierra con ≥85 % de su tensión y se mantiene hasta ≈50 % |
| Térmico bajo o muerto, temporizador adelantado o trabado, rotor bloqueado | En el controlador `useSimulation` |

Las fallas viven aparte de las entradas del banco (`setFaults`), por lo que sobreviven a «Detener»; la guía de mediciones las limpia al iniciar.

`src/data/faultCases.ts` define 40 casos de diagnóstico en seis grupos (alimentación, cableado, aparatos, protecciones y temporizador, motor, errores de medición). Cada perfil muestra solo los casos que tienen sentido en su cableado (twoContactors 40, matias 39, manual 36). `src/components/PanelGuideFaults.tsx` los presenta agrupados con pista, qué medir, pregunta de diagnóstico y reparación (cablear o reemplazar la pieza).

## Pruebas

Pasan: `npx tsc --noEmit`, `npm run build`, `qa/verify-panel-faults.mjs` (21), `qa/verify-fault-cases.mjs` (115 casos construidos y comprobados), `qa/verify-guide-pdf-nets.mjs`, y la regresión eléctrica existente (dinámica, motor, cableado, simulación, lecciones de estrella y de dos contactores, guía completa, mediciones, historial).

Comprobado en el navegador (`panellab-astro`): con la bobina del contactor principal abierta el motor no arranca; tras diagnosticar y reemplazarla, arranca en estrella.

## Pruebas de interfaz actualizadas

Las siete pruebas de interfaz que fallaban estaban desfasadas respecto del producto y se actualizaron a su comportamiento actual (corridas contra el build de producción):

- La lección de mediciones es solo del panel de dos contactores; empieza con «Comenzar mediciones · 2 contactores» y monta los 40 cables, mando y fuerza (antes 24 y luego 46).
- La clave de almacenamiento pasó a `modo-meter-two-contactors-v1` y la de la preparación a `modo:machines:preparation:v1:two-contactors`.
- «Mi esquema» copia el cableado del banco y pide una explicación; ya no hay dibujo manual de conductores ni SVG en esa pestaña.
- La lectura se captura del instrumento (`Lectura capturada`); no hay campo de transcripción.
- El relé térmico va en el contactor de triángulo: solo se calienta después del cambio, y el estudio usa un retardo de 60 s que las pruebas acortan.
- La tensión medida con el motor en marcha queda un poco bajo los 380 V por la impedancia de línea del modelo.
- Las opciones del multímetro están plegadas, reemplazar cables pide una confirmación del navegador y varias ventanas táctiles nunca quedan «estables» para Playwright, por lo que esas pruebas entregan el clic como evento.

## Límites

- `qa/verify-panel-fixes.mjs` esperaba 219,39 V exactos; se actualizó con una tolerancia del 1,5 % por la impedancia de línea.
- Las pruebas de interfaz usan navegadores emulados; no se probó en un teléfono o tablet físicos.
- La fuga de aislación se ve con el óhmetro; no circula corriente de fuga hacia TP porque el banco no modela ese retorno.
- Las fallas de resistencia de contacto en polos de fuerza se reflejan en el solver AC; el estado lógico del motor (`solveMotor`) no las distingue.
- El simulador no certifica ni reemplaza el equipo físico.
