# Comprobación final de la guía de Máquinas Rotativas — 27 de octubre de 2026

Fuente revisada: Actividad 2 UA2 ARCM02, 13 páginas, Otoño 2025, Juan Carlos Toro Cornejo. La copia integrada en `public/activities/actividad-2-unidad-2.pdf` es idéntica al archivo del usuario. SHA-256: `49775a14bcb23af18ac3fb07cfcafa1cf5041cd032e5fe363b0682d2265dc0da`.

Se leyó el PDF completo y se contrastaron visualmente las figuras de mando/fuerza y las tablas. Se revisó el código, se ejecutaron pruebas del modelo y el recorrido en navegador. La guía se trata como material docente; sus instrucciones presenciales no se presentan como acciones ejecutadas en equipos físicos.

## Corrección encontrada

La revisión detectó una diferencia con la figura 1 de la página 5: la copia del proyecto recibido alimentaba el contacto NA de S3 desde S2:2, antes de la partida. Pulsar únicamente S3 desde reposo iniciaba KM1 y KM2 y mantenía el motor en triángulo. El recorrido normal S1 → S3 no detectaba ese caso.

La guía manual ahora toma esa alimentación desde S1:4, después de la partida y del auxiliar de retención de KM1. Se retiró también la adaptación del dibujo que representaba la conexión anterior. Se conserva el archivo original recibido y su hash; solo se adapta la copia de la lección manual. No se modifica el circuito de Matías ni otras lecciones.

Se añadieron pruebas independientes del recorrido normal: S3 solo desde reposo, S3 después del paro, prioridad de S2 y correspondencia del par de bornes con el esquema. Se verifican todos los pares de mando/fuerza trazables frente al dibujo. No se añadió un bloqueo artificial: el resultado depende del cableado corregido.

Los montajes o esquemas antiguos con esa toma reciben un mensaje localizado para corregirla. Las mediciones guardadas se conservan; no se modifica silenciosamente el trabajo del estudiante.

## Correspondencia con los 25 puntos de la guía

| Punto | Cobertura actual | Comprobación presencial |
| --- | --- | --- |
| 1 | Seguridad y puesto sin energía declarados en el cuaderno; el circuito virtual inicia sin alimentación | EPP y ausencia de tensión del banco real con el docente |
| 2 | Esquemas de mando/fuerza, nombres de dispositivos y explicación de conexiones | Interpretación evaluada por el docente |
| 3 | Inventario de elementos en el cuaderno, componentes del banco virtual | Disponibilidad y estado de los elementos físicos |
| 4 | Mando separado: 24 conexiones, continuidad, montaje guiado desde vacío y conservación de montaje equivalente | Revisión docente del montaje real |
| 5 | Alimentación de mando y medida AC F–N | Confirmar alimentación real; el equivalente virtual usa 24 V~ |
| 6 | Piloto rojo de reposo | Comprobar señalización del equipo físico |
| 7 | S1/SB2 activa KM1 + KM3 y verde de estrella | Ejecución y revisión del montaje real |
| 8 | S3/SB3 mantiene KM1, cambia KM3 por KM2 y cambia verdes | Ejecución y revisión del montaje real |
| 9 | TEST de mando: caída de contactores y avisos rojo/amarillo | Prueba del relé del equipo según instrucciones docentes |
| 10 | RESET vuelve a reposo sin dar marcha con pulsadores liberados | Rearme del dispositivo real según su estado |
| 11 | Añadir fuerza después de probar mando; comprobación sin energía | Revisión docente del circuito real |
| 12 | Tabla 1: R–S, R–T y S–T, tres lecturas | Repetir medidas físicas con supervisión |
| 13 | Reposo con mando/fuerza: rojo, contactores desactivados | Verificación en el banco real |
| 14 | Arranque en estrella con KM1 + KM3 y motor | Verificación en el banco real |
| 15 | Tabla 3: U1–U2, V1–V2 y W1–W2 en estrella | Tres medidas reales |
| 16 | Tabla 4: corrientes R/S/T antes de bifurcaciones; colocación de mordaza | Uso de pinza física y tres medidas reales |
| 17 | Cambio manual a triángulo; temporizador conservado como variante adicional | Maniobra en el banco real |
| 18 | Tabla 5: tres voltajes de devanados en triángulo | Tres medidas reales |
| 19 | Tabla 6: tres corrientes de línea en triángulo | Tres medidas reales |
| 20 | Comparación matemática, explicación y condiciones de velocidad/carga registradas | Interpretación y evaluación docente |
| 21 | TEST con fuerza: pérdida de alimentación del motor, inercia y pilotos | Prueba del equipo real |
| 22 | RESET, espera térmica si procede y sin nueva orden de marcha automática | Confirmar causa y estado del dispositivo real |
| 23 | Registro de observaciones y solicitud de revisión en cuaderno | Aprobación docente pendiente; el simulador no la concede |
| 24 | Apertura de CONTROL/FUERZA y enchufe virtual desconectado | Desenergización física con el procedimiento docente |
| 25 | Esquema conservado, desmontaje y resultados guardados | Desmontaje y orden físico del puesto |

Las cinco tablas originales suman 15 lecturas. El PDF numera las tablas 1, 3, 4, 5 y 6: no hay una tabla 2 omitida en la aplicación.

## Criterios de evaluación

- 2.1.1: ejercicios comprobables de placa, función de dispositivos y ajuste/rango del relé. La selección/ajuste físico requiere placa, rango y documentación reales, todavía no disponibles.
- 2.1.2: identificación de maniobra, protección, retención, enclavamiento y señalización en esquema y explicación de cables.
- 2.1.3: esquema editable del estudiante, comprobación de conectividad, explicación y SVG. Su corrección gráfica e interpretación se entregan a revisión docente.
- 2.1.4: montaje desde vacío, rutas de mando/fuerza y secuencia sin energía. La preparación automática explícita no acredita montaje físico por el estudiante.
- 2.1.5: voltímetro, continuidad, pinza, comparación, pruebas de diagnóstico y exportación.

## Pruebas de esta revisión

- Fuente PDF íntegra y comparación de figuras/tablas.
- `qa/verify-star-lessons.mjs`: procedencia de archivos, 46 conexiones de la guía adaptadas en una toma, 42 de la otra lección sin modificación, esquemas y secuencias.
- `qa/verify-machines-guide-complete.mjs`: nueve grupos, incluido S3 desde reposo y trazado de todos los pares representados.
- `qa/verify-meter-activity.mjs`: 34 pasos y 15 lecturas en perfiles manual y Matías.
- `qa/verify-machines-guide-ui.cjs`: 34 pasos, preparación, esquema, cinco tablas y CSV/JSON/HTML; ahora prueba S3 desde reposo tanto con solo mando como con fuerza; vista móvil 390 px.
- `qa/verify-guides-class.mjs`: regresión de diagnóstico, cuaderno y temperatura en escritorio/móvil.
- `qa/verify-panel-dynamic.mjs`: 11 grupos de cálculo eléctrico y dinámica.
- `npm install`, `npm run check` y `npm run build`: completados.

Evidencias actualizadas en `qa/machines-guide-complete/`. El esquema corregido se renderizó en `esquema-corregido-2026-10-27.png`.

## Conclusión y límites

El recorrido virtual de la guía tiene cobertura tras corregir la alimentación de S3. No se detectaron otras actividades operativas omitidas en esta revisión. La presencia de pasos no implica certificación del modelo ni aprobación docente.

Siguen pendientes la placa del motor físico, el modelo/rango/ajuste real del térmico y las comprobaciones presenciales. Los ejemplos de placa y corrientes del simulador no sustituyen esas mediciones. La red de mando virtual de 24 V y el modelo RMS/de inducción son adaptaciones identificadas.

Archivos modificados por la corrección: `src/data/lessons.ts`, `src/data/cade.ts`, `src/data/starDeltaTeaching.ts`, `src/data/meterActivity.ts`, `src/components/PanelMachinePreparation.tsx` y las pruebas de lecciones/guía. No se modificaron los archivos fuente originales del usuario.

## Publicación comprobada

Corrección publicada en https://modo-lab.vercel.app, despliegue `dpl_GPhcrzocMWMoPNuhnsFhrsSfsvJn`, READY.

La verificación posterior en navegadores nuevos sin sesión de Vercel completó los 34 pasos y las 15 mediciones. Las dos pruebas de S3 desde reposo —solo mando y luego mando/fuerza— pasaron. Descargas CSV, JSON, HTML y SVG comprobadas. Chromium 820 px y WebKit 390 px pasaron preparación, pinza, persistencia y diagnóstico. Sin errores de página registrados.
