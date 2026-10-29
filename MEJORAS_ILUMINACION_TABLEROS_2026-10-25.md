# Taller de tableros: iluminación, animaciones y rendimiento

Cambios locales sobre el taller. No se publicó un despliegue nuevo. El modelo eléctrico, los programas y los otros simuladores no se tocaron.

## Qué cambió

- **Iluminación**: carcasas con bisel, brillo superior y sombra escalonada (sin filtros SVG); placa, puerta y gabinete con luz direccional y viñeta; bornes en latón; pilotos y LED con halo que se enciende con retardo.
- **Animaciones físicas** (solo CSS, apagadas con `prefers-reduced-motion`): rotor del motor y rodete de la bomba con arranque por inercia, régimen con desenfoque de movimiento y frenado; armadura del contactor que baja al energizarse; pulsadores con recorrido; guardamotor, selector y fusible con palanca animada; térmico con indicador de disparo.
- **Corriente visible**: los cables energizados muestran resplandor y flujo de carga (amarillo en potencia, cian en mando, verde en PE). La bomba tiene tubería con agua en movimiento y manómetro.
- **Iconos**: nueva familia bitono (`CabinetIcons.tsx`) para la barra de acciones y las vistas Conjunto/Placa/Puerta/Campo, con luz propia al pasar el cursor y al estar activos. Botón Accionar/Detener con estado iluminado.

## Rendimiento

- Las carcasas industriales se redibujan solo si cambia algo visible (la simulación publica lecturas cada 100 ms).
- Al arrastrar un equipo solo se recalculan los cables que llegan a él.
- Se eliminaron los 14 filtros SVG; canaletas con patrón en vez de cientos de rectángulos (2555 → 2464 nodos).
- Lo que se mueve de forma continua vive en una capa aparte (`CabinetFx.tsx`): los rotores son `<svg>` con rotación en el compositor y el flujo de corriente avanza a ~11 Hz, porque `stroke-dashoffset` no se compone en GPU.
- Medición local (Chromium headless, CPU 4× más lenta, simulación en marcha, vista Placa): versión anterior 17 % de tiempo de tarea, nueva 23 % con toda la animación activa; script 12,6 % → 10,5 %. Es una medición de este entorno, sin GPU.

## Archivos

Nuevos: `CabinetFx.tsx`, `CabinetIcons.tsx`, `cabinet-fx.css`, `qa/cabinet-fx/` (medición y capturas antes/después).
Modificados: `IndustrialArt.tsx`, `CabinetScene.tsx`, `CabinetCable.tsx`, `EquipmentView.tsx`. Copia de los originales en `qa/cabinet-fx/before/` (excepto `IndustrialArt.tsx`: esa copia se sobrescribió con una versión ya mejorada y el original no se conserva).

## Verificación

`npm run check` y `npm run build` correctos. Pasan `verify:cabinet` , `verify:cabinet-cables`, `verify:cabinet-controls` (14), `verify:cabinet-plc`, `verify:cabinet-usability` (9), `verify:cabinet-ui` y `verify:float`, sin errores de navegador ni peticiones externas.
