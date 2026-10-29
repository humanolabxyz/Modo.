# Protoboard: canal central y prueba de fallos

Cambios locales del 27 de octubre de 2026. Sin publicación ni cambios remotos.

## Resultado

- Canal central entre e y f confirmado por el usuario: separación visual con profundidad entre ambos bloques. Se conservan coordenadas, conexiones a–e y f–j y cortes de los rieles en 15/16. No hay continuidad interna entre e y f.
- Acceso: Protoboard → Aprender y referencias → Modo prueba · buscar fallos. También aparece en el catálogo de lecciones.
- Parte del puente H del estudiante ya funcional: cuatro transistores, dos pulsadores y un motor con corriente en sentidos opuestos. Rechaza referencias con fallos, orificios compartidos o sobreesfuerzos.
- Retira un puente o cambia un extremo a otro orificio libre. Resuelve el circuito antes de aceptar el cambio para exigir un síntoma eléctrico observable. La elección aleatoria afecta al cable, no a las lecturas.
- Conserva referencia, observaciones, intentos y pistas por proyecto. La avería queda oculta hasta pedir las pistas. Permite localizar motor y conexión original sobre el banco.
- La reparación se realiza con las herramientas normales y se comprueba por redes eléctricas equivalentes y funcionamiento en ambos sentidos. Acepta cables nuevos con otros identificadores o extremos invertidos.
- Restaurar recupera el montaje guardado y conserva la libreta y las notas. Introducir o restaurar una prueba deja OUTPUT apagado; las acciones de cableado de la prueba requieren detener la simulación.

## Archivos

- `src/lab/BreadboardParts.tsx`: canal e–f.
- `src/lab/breadboardFaults.ts`: selección de averías, validación eléctrica, reparación y lectura del registro persistido.
- `src/lab/BreadboardFaultPractice.tsx`: ventana de prueba y observaciones.
- `src/lab/BreadboardView.tsx`, `src/lab/BreadboardPractice.tsx`: accesos y localización en el banco.
- `src/styles/laboratory-canvas.css`: controles y presentación de la prueba.
- `qa/verify-breadboard-fault-practice.mjs`, `qa/verify-breadboard-fault-practice-ui.cjs`: comprobaciones del modelo y del recorrido de reparación.

## Verificación

- `npm install --ignore-scripts --no-audit --no-fund`, `npm run check`, `npm run build`: completados.
- Modelo: 90 comprobaciones de continuidad y aislamiento; 36 averías de retirada/movimiento/sorpresa, persistencia, integridad de referencia y reparación equivalente. Informe: `qa/breadboard-fault-practice/model-results.json`.
- Interfaz: Chromium y WebKit, anchos 390 y 820, con tacto emulado. Retirada/movimiento, pistas, recarga, observaciones, reparación manual y restauración correctos; sin errores de página. Informe: `qa/breadboard-fault-practice/ui-results.json`.
- Guías: `qa/verify-breadboard-lessons.mjs` pasó las 15 comprobaciones de las siete lecciones. La secuencia visual de fundamentos pasó columna, canal e–f, corte de rieles, puente, respuesta y recarga.
- Panel de dos contactores: verificación del modelo y recorrido visual completo de 34 pasos y 15 mediciones, temporizador, TEST/RESET y exportaciones. Informe: `qa/two-contactor-measurements/recorrido-resultados.json`.
- Limitación del script antiguo `qa/verify-breadboard-lessons-ui.cjs`: aún busca accesos directos que ahora están en el menú. Una adaptación temporal permitió repetir fundamentos pero no completó el divisor con el flujo actual de fuente. No se presenta esa suite completa como aprobada; se conserva su código anterior.

## Capturas comparativas

- Antes del canal: [tablet anterior](qa/floating-diagnostics/chromium-820-located.png).
- Después: [canal central](qa/breadboard-fault-practice/chromium-820-channel.png).
- [Prueba y pistas en móvil](qa/breadboard-fault-practice/webkit-390-move-hint.png).
- [Reparación manual comprobada](qa/breadboard-fault-practice/chromium-820-remove-repaired.png).

## Límites y pendientes

Verificado en navegadores con tamaños y tacto emulados, sin una tablet física. Las averías usan el modelo DC existente; el motor del protoboard conserva su aproximación resistiva y esto no añade una simulación electromecánica calibrada. No certifica equipos ni debe usarse para energizar un montaje físico. Falta actualizar la suite visual antigua de lecciones a la navegación y fuente actuales. No se desplegó.
