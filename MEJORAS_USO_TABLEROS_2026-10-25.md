# Nuevo taller de tableros: orientación, ventanas y cables

Cambios locales sobre el taller existente. No se publicó un despliegue nuevo.

## Experiencia

- La entrada desde Inicio abre una explicación opcional: qué se construye, qué se aprende y qué puede revisar un profesor. Recomienda comenzar con mando cableado y conserva los perfiles PLC y relé programable.
- Cada etapa muestra una tarea concreta y su resultado esperado. La orientación se puede volver a abrir desde la guía.
- La guía de escritorio dejó de ser un lateral fijo. Se puede arrastrar, redimensionar por bordes y esquina, maximizar y restaurar. Al cerrarla y abrirla conserva su geometría. Selección de taller, orientación, distribución y esquema usan la misma ventana, con indicación visible para mover y ajustar.
- Los cables incorporan aislamiento con volumen, curvas de salida, punteras, collar aislante y marcadores en ambos extremos. El recorrido responde a las canaletas y a la orientación del borne. El conductor de protección tiene una franja continua.
- Se mantienen la edición manual del recorrido, los extremos eléctricos, la exportación/importación y los mandos interactivos del tablero.

## Archivos

Nuevos: `CabinetIntroduction.tsx`, `CabinetCable.tsx`, `cable.ts`, `cabinet-guidance.css`, las dos verificaciones y este documento.

Actualizados: `EquipmentView.tsx`, `InspectorSheet.tsx`, `CabinetWorkshop.tsx`, `CabinetScene.tsx`, `FloatingWindow.tsx`, `floating-window.css`, el enlace del taller en `Home.tsx` y scripts en `package.json`.

La comparación con la copia tomada al comenzar esta mejora conserva sin cambios 356 archivos existentes de `src/`; los siete modificados son los indicados arriba. El modelo eléctrico, los programas y los otros simuladores no se modificaron en esta mejora. Los controles nuevos de ventana son opcionales para no alterar las otras ventanas.

## Verificación

- `npm install`, `npm run check`, `npm run build`: correctos.
- `verify:cabinet-cables`: siete comprobaciones de bornes, orientación, canaletas, edición, persistencia y equivalencia funcional.
- `verify:cabinet-usability`: nueve comprobaciones de primera visita, roles, actividad, arrastre, tamaño, cierre/reapertura, otras ventanas y móvil sin conexión.
- `verify:cabinet`: 24 comprobaciones del modelo.
- `verify:cabinet-controls`: 14 comprobaciones, incluidos Marcha/Paro, térmico, guardamotor, cableado, teclado y tacto sin red.
- `verify:cabinet-plc`: 14 comprobaciones, incluidos programa, entradas/salida físicas, distribución y relé programable móvil sin red.
- `verify:float`: geometría de las ventanas correcta.
- Sin errores de navegador ni peticiones externas en las pruebas nuevas.
- Muestreo local Chromium 1440 × 960 con simulación activa: mediana 16,7 ms y percentil 95 de 16,8 ms entre fotogramas. Es una medición de este entorno; móvil se comprobó por emulación de pantalla y tacto.

Informes: `qa/cabinet-usability/`, `qa/cabinet/controls-report.json`, `qa/cabinet/plc-browser-report.json`.

## Capturas comparativas

- [Antes: tablero PLC](qa/cabinet-usability/before/tablero-plc.png).
- [Después: cableado y edición del recorrido](qa/cabinet-usability/realistic-cables.png).
- [Orientación para el profesor](qa/cabinet-usability/teacher-start.png).
- [Guía movida y redimensionada](qa/cabinet-usability/guide-resized.png).
- [Móvil sin conexión](qa/cabinet-usability/mobile-guide.png).
- [Inicio del taller en móvil](qa/cabinet-usability/mobile-start.png).

Para abrirlo: `http://127.0.0.1:4325/laboratorio?tool=equipment&start=taller`. Si ya hay un tablero activo, se conserva y se puede reabrir su guía.
