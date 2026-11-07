# ENTREGA — modo. Industria · Fase 13: mini fábrica y piezas de planta (v2.20.0)

Fecha: 2026-11-07 · Rama: `industria-fase2`.

## Qué hay
- **Ejemplo «mini fábrica»** (Proyecto → Ejemplo: mini fábrica; `exampleMiniFactory` en `src/industria/sim/examples.ts`): 31 piezas de 25 tipos. Es el tablero con PLC del marcha/paro más una planta: piso con franjas, cinta con su motor y tres cajas, sensor fotoeléctrico en la cinta, brazo robótico, tres vallas, mesa de estación (sensor inductivo, electroválvula, cilindro, paro de emergencia), compresor, tanque y torre luminosa. 35 cables (3 conductos de aire).
- **14 piezas nuevas** del catálogo (genéricas, «no verificado»), cada una con forma propia en `src/industria/scene/models.ts` y anclajes de montaje en `src/industria/catalog/items.ts`: piso de planta, mesa de trabajo, valla de seguridad, cinta transportadora, caja de producto, brazo robótico, compresor, electroválvula de cinco vías, cilindro neumático, tanque, sensor inductivo, sensor fotoeléctrico, torre luminosa, paro de emergencia.
- **Montaje**: todas se apoyan en el suelo por su base; el piso, la mesa y la cinta ofrecen cara superior para montar cajas y sensores con el imán. Terminales de aire (P, A, B, E, S) de tipo `pipe`, hilos de sensor (BN, BU, BK) y bobina (A1/A2).

## Límites (importante)
- Las piezas nuevas **no tienen simulación propia**: la cinta no gira sola (la mueve el motor trifásico que ya se simulaba), la válvula no mueve el cilindro, el robot no tiene cinemática, los sensores no detectan, el paro de emergencia no corta nada. Sirven para armar la planta, montarla y tender cables/conductos (topología).
- Son formas por tipo de equipo, **no réplicas de un fabricante**; las medidas son de ejemplo. «Basadas en equipos reales» queda como pendiente: exige hojas de datos/planos de fabricantes que no están en el repositorio.
- Cada terminal admite 2 cables (límite didáctico), por eso la alimentación de los sensores se encadena.

## Pendiente
Simulación de cinta con productos, neumática (válvula → cilindro), sensores que detecten cajas, cinemática del robot y paro de emergencia con enclavamiento; familia Hidráulica (vacía); catálogo verificado con documentos reales; colocar piezas del escenario desde la biblioteca con el imán sobre el piso (ya posible) y plantillas de estación.

## Pruebas
`npm run verify:industria`: nuevo grupo `factory` (5 comprobaciones); `models` cubre las 30 piezas (caben en su caja, un tornillo por terminal, forma única).
