# Revisión de números y fotografías

Corrección solicitada tras revisar v1.1: números como 95 y 96 no se distinguían bien en la vista general. Existían en el modelo, pero la fuente superior de 11 unidades SVG resultaba insuficiente. La validación anterior de IDs e interacción no garantizaba su legibilidad.

## Correcciones aplicadas

- Los **108 rótulos** se dibujan en una capa final independiente de los conectores: ningún borne dibujado después puede tapar un número.
- Tamaño uniforme de **16 unidades SVG**, negro sobre franjas claras. Los pares y tríos conservan las agrupaciones fotografiadas.
- Mayor separación entre filas y altura de las placas de contactores, sin cambiar la composición general del banco.
- **95–96:** tercera fila de jacks negros, debajo de 81–82, en el contactor con relé térmico.
- **97–98:** última fila de jacks azules de la columna derecha de ese mismo módulo.
- En el contactor trifásico, 71–72 y 81–82 tienen la franja debajo de sus jacks, como en IMG_4532 e IMG_4536.
- Temporizadores: 55–56, 13–14 y 67–68 más legibles; posición ajustada para evitar superposición.
- Botoneras: filas 1/3 y 2/4 separadas; en el pulsador derecho se conserva 3/1 arriba y 4/2 abajo.
- R/S/T/N/F/TP, A1/A2, L1/L2/L3, T1/T2/T3 y la bornera del motor utilizan la misma mejora de contraste.

## Contraste por módulo

| Módulo | Identificaciones revisadas | Fotografías originales |
|---|---|---|
| Fuente | R, S, T, N, F, TP; transformador y fusible | IMG_4738(1), IMG_4536(1) |
| Botoneras | Cuatro conexiones de pilotos; 1,2,3,4 en cada pulsador; N y ambos TP | IMG_4737(1), IMG_4536(1) |
| Contactor + térmico | A2/A1, L1/L2/L3, T1/T2/T3, 71/72, 81/82, **95/96**, 13/14, 63/64, 93/94, **97/98**, ambos TP | IMG_4532(1), IMG_4534(1), IMG_4739(1) |
| Contactor trifásico | A2/A1, L1/L2/L3, T1/T2/T3, 71/72, 81/82, 13/14, 63/64, 93/94, ambos TP | IMG_4532(1), IMG_4536(1) |
| Temporizador 1 | A2/A1, L1/L2/L3, T1/T2/T3, 55/56, 13/14, 67/68, ambos TP | IMG_4533(1), IMG_4537(1) |
| Temporizador 2 | Mismo inventario, con cuerpo distinto; las fotos complementarias permiten revisar bornes ocultos en una toma | IMG_4533(1), IMG_4535(1) |
| Motor | U1/V1/W1 sobre W2/U2/V2 y TP lateral | IMG_4538(1) |

La transcripción manual independiente usada para comprobar nombres, colores y agrupaciones está en `qa/photo-audit.json`. No se ha utilizado reconocimiento automático de texto ni se han considerado los estados NA/NC como comprobados eléctricamente. P1…P4 y S1…S3 siguen siendo identificadores de estudio del inventario, no referencias físicas confirmadas.

## Evidencia

- [Contactor térmico actualizado, con 95–96 y 97–98 visibles](qa/actual-contactor_termico.png).
- [Foto, revisión anterior y revisión actual](qa/revision-rotulos/comparacion-termico.jpg).
- [Los siete módulos: fotografía, prototipo y versión actual](qa/comparacion-modulos.jpg).
- [Escritorio](qa/despues-desktop.png) y [móvil ampliado](qa/mobile-botoneras.png).
- [Resultado de las pruebas de navegador](qa/verification.json).

`npm run check`, `npm run build`, `npm run verify:data` y `npm run verify:ui` pasan. Se seleccionaron los 108 bornes; se comprobaron sus 108 textos visibles, tamaño, ausencia de solapamientos con jacks, límites de cada placa, inspector, búsqueda individual 95/96/97/98/55/56/67/68, zoom, persistencia y tacto. La vista completa en móvil necesita ampliación para leer todos los rótulos.

La versión local actualizada continúa en **http://127.0.0.1:4322/?revision=rotulos**. Recargar una pestaña anterior permite obtener el nuevo build. Los HTML autónomos del ZIP siguen siendo la referencia anterior conservada, no la versión actual.
