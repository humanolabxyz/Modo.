# Pinza, lección visual y cabecera de PC

La pinza incorpora los controles de tamaño del tester: achicar, agrandar y reducir a una lectura compacta. Usa el mismo intervalo de 40–130 %, recuerda su tamaño por separado y permite restaurarlo. La lectura, HOLD, conductor seleccionado y registros sobreviven a los cambios de presentación. Al cambiar el tamaño, la mordaza sigue el punto del cable seleccionado. La vista compacta se arrastra sin cambiar la selección.

«Aprender a medir» destaca Configura → Conecta/Abraza → Registra y la acción inmediata. Las explicaciones y preguntas quedan ampliables. Un dibujo muestra roja en V Ω y negra en COM, o una mordaza alrededor de una sola fase; las tarjetas conservan los números de bornes de la actividad. La captura se presenta antes de la revisión de la lectura; las condiciones guardadas se amplían a petición. Los pasos del tutorial de serie tienen tarjetas numeradas. Iniciar, cambiar de paso o volver a la lección restaura el desplazamiento al encabezado; se conserva un único desplazamiento nativo para alcanzar los controles en tablet vertical.

En PC el selector de módulos se integra en la cabecera. Los controles del proyecto ocupan su propia fila dentro del mismo contenedor, sin superponerse con la franja de Automatización. Se conservan las cuatro subdivisiones y el desplegable sale del botón. Escape cierra primero el menú aunque haya una ventana del laboratorio abierta.

## Archivos

- `src/components/PanelClampInstrument.tsx`, `PanelMeasurementCoach.tsx`, `PanelMeterLesson.tsx`, `PanelMultimeter.tsx` y nuevo `MeasurementConnection.tsx`.
- `src/styles/measurement-visual.css`, `src/lab/LaboratoryApp.tsx`, `LabModuleNavigator.tsx` y `src/styles/laboratory-navigation.css`.
- Pruebas añadidas: `qa/verify-clamp-size.cjs` y `qa/verify-desktop-laboratory-header.cjs`. Prueba ampliada: `qa/verify-measurement-teaching.cjs`.

## Verificación

- `npm install`, `npm run check`, `npm run build`.
- Tamaño, límites, controles sin superposición al achicar, persistencia, foco y restauración: WebKit 390 y Chromium 820/1440.
- Conductor y HOLD conservados al cambiar tamaño, reducir y restaurar; continuidad, serie, pinza, captura, regreso al mismo paso y CSV: Chromium escritorio, WebKit móvil y tablet táctil emulada.
- Cabecera y desplegable: Tableros, HMI y Temperatura a 1101/1280/1440/1920 px. Navegación general por los diez módulos y conservación del proyecto: Chromium 390/1440 y WebKit 820.
- Recorrido completo de la guía: 34 pasos, 15 mediciones tabuladas, 21 capturas con condiciones, ocho pruebas de acciones, preparación, esquema, comparación y exportaciones.
- Opciones laterales: 320/390/820/1440 px. Sin errores de página registrados en las matrices terminadas.

Comparación del menú: `qa/laboratory-navigation/desktop-menu-before.png` y `qa/desktop-laboratory-header/hmi-1440.png`. Pinza compacta y completa: `qa/clamp-size/`. Lecciones: `qa/measurement-teaching/` y `qa/machines-guide-complete/`.

Las pruebas de teléfono y tablet usan emulación. No equivalen a validación de equipos eléctricos físicos.

Publicado en https://modo-lab.vercel.app, despliegue `dpl_6iWnDrJxiD2AZPrHXmfw2edqBVfh`, READY. Verificación pública completada: cabecera en 1101/1280/1440/1920; pinza en WebKit 390 y Chromium 820/1440; enseñanza, reinicio del desplazamiento, regreso a la lección, serie, conservación de HOLD/conductor al cambiar tamaño, pinza táctil y CSV. Sin errores de página registrados.
