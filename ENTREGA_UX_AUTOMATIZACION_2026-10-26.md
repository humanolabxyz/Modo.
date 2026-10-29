# Automatización: una misma pizarra en escritorio y móvil

Implementación local del 26 de octubre de 2026, sobre el laboratorio existente.

## Criterio final

El lienzo ocupa el espacio de trabajo. Actividad, propiedades y menús se abren en ventanas superpuestas con el mismo diseño sencillo del simulador. Se pueden mover por la cabecera, redimensionar por bordes o esquina, maximizar, restaurar y cerrar. Se conserva posición y tamaño también en móvil. No se deja un panel lateral fijo ni una guía apilada que reduzca permanentemente el lienzo.

Este criterio recoge la aclaración del usuario posterior al análisis inicial. Las capturas intermedias en `output/ux-automatizacion-2026-10-26/after/` corresponden a una propuesta descartada; las capturas finales están en `verification/` y `whiteboard/`.

## Cambios

- Inicio con acción visible para elegir práctica y opciones PLC, mando cableado o relé programable. La explicación extensa se puede desplegar.
- Una ventana de actividad con un selector de etapa. Un selector de zona sobre la pizarra. Se eliminan las barras duplicadas de etapas y ejecución.
- Un único control «Simular proyecto» / «Detener» en la barra superior. Las propiedades del equipo seleccionado abren su propia ventana.
- Inspector de herramientas del laboratorio en ventanas también en escritorio, compartiendo el patrón del simulador.
- Ventanas con bordes simples, botones legibles y controles de movimiento, tamaño y cierre disponibles con tacto.
- Se eliminan los bloqueos CSS que convertían las ventanas táctiles en paneles anclados. Se evita que las esquinas de redimensionamiento intercepten los botones de cerrar y maximizar.
- Se corrige el salto de altura al comenzar a redimensionar una ventana con contenido largo.
- El encuadre reconoce los márgenes del lienzo incluso cuando usan `calc()`, y puede cambiar según la etapa. Se conservan zoom, paneo y colocación manual.
- El PLC del taller muestra marcha, paro disponible, disparo térmico y permiso de proceso. Los nombres personalizados existentes se conservan.
- El programa vacío se identifica expresamente. La compilación correcta se distingue de una prueba funcional superada.
- HMI y Procesos explican su relación con el tablero; los interruptores de pantalla no se ofrecen como accionamiento de las entradas físicas del PLC del taller.

No se cambian las direcciones, el formato de los proyectos ni el motor eléctrico. Se conserva el montaje anterior al crear una práctica y se mantiene el proyecto al cambiar entre herramientas.

## Archivos principales

- `src/components/FloatingWindow.tsx`: movimiento, persistencia y ajuste sin saltos.
- `src/styles/floating-window-touch.css`: mismo comportamiento libre y presentación simple en tamaños táctiles.
- `src/lab/InspectorSheet.tsx`: ventanas de propiedades consistentes.
- `src/lab/PanStage.tsx`: lectura de márgenes resueltos para el encuadre.
- `src/lab/LaboratoryApp.tsx`: contexto de Automatización y estilos compartidos.
- `src/lab/EquipmentView.tsx`: inicio, pizarra, selector de zona y ventanas del taller.
- `src/lab/equipment/CabinetGuide.tsx`: ventanas de actividad y propiedades.
- `src/lab/equipment/CabinetIntroduction.tsx`: comienzo directo y ayuda desplegable.
- `src/lab/equipment/CabinetWorkshop.tsx`: actividades sin navegación repetida.
- `src/lab/plcContext.ts`, `PLCView.tsx`, `HMIView.tsx`, `ProcessView.tsx`: contexto de señales y mensajes de estado.
- `src/styles/automation-workspace.css`: controles sobre el lienzo y contenido de las ventanas.
- `qa/verify-automation-ux.cjs`, `qa/verify-whiteboard-windows.cjs`: recorridos de navegador y gestos táctiles.

## Verificación

Pasaron:

- `npm install`: instalación al día, sin vulnerabilidades informadas.
- `npm run check` y `npm run build`.
- `npm run verify:cabinet`: 24 comprobaciones del modelo, incluyendo PLC y relé en Ladder y ST.
- `npm run verify:cabinet-cables`: 7 comprobaciones de geometría y conservación de conexiones.
- `npm run verify:float`: geometría de movimiento y redimensionamiento.
- `node qa/verify-automation-ux.cjs`: práctica completa a 1440×960, 390×844, 1024×768 y 844×390. Se colocan 16 equipos, se conectan 36 hilos, se programa, se superan ocho pruebas funcionales y se acciona marcha/paro. Se comprueba continuidad al cambiar de herramienta y conservación de nombres personalizados. Incluye WebKit móvil.
- `node qa/verify-whiteboard-windows.cjs`: gestos táctiles de arrastre y redimensionamiento, persistencia al reabrir, maximizar/restaurar y zoom a 320×740, 390×844, 844×390 y 1024×768. Comprueba tanto taller como simulador.

No se registraron errores JavaScript de página en esos recorridos ni desbordamiento horizontal del documento en los tamaños comprobados. Las pruebas táctiles usan emulación de navegador; no equivalen a validación en un dispositivo físico ni a aprobación visual del usuario.

## Capturas comparativas

| Vista | Antes | Resultado final |
|---|---|---|
| Escritorio | [Entrada original](output/ux-automatizacion-2026-10-26/01-entrada-desktop.png) | [Inicio de práctica](output/ux-automatizacion-2026-10-26/verification/1440-start.png) · [Ventana sobre pizarra](output/ux-automatizacion-2026-10-26/verification/1440-initial.png) |
| Móvil | [Guía original](output/ux-automatizacion-2026-10-26/09-mobile-guia.png) | [Actividad movible](output/ux-automatizacion-2026-10-26/whiteboard/390-floating.png) · [Mismo patrón en simulador](output/ux-automatizacion-2026-10-26/whiteboard/390-simulator.png) |
| Horizontal | — | [Ventana ajustada](output/ux-automatizacion-2026-10-26/whiteboard/844-floating.png) |
| Tableta | — | [Pizarra y ventana](output/ux-automatizacion-2026-10-26/whiteboard/1024-floating.png) |

Informes reproducibles: `output/ux-automatizacion-2026-10-26/verification/report.json` y `output/ux-automatizacion-2026-10-26/whiteboard/report.json`. Los scripts aceptan `PANELLAB_URL`; por defecto utilizan el servidor local en el puerto 4327. No se publicó ningún despliegue.
