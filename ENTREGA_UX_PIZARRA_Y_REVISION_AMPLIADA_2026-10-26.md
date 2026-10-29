# Pizarra: correcciones UX/UI y evaluación ampliada

26 de octubre de 2026. Implementación local sobre el laboratorio existente. Se conserva la pizarra con ventanas superpuestas, movibles y ajustables en escritorio y móvil.

## Correcciones del análisis

| Hallazgo | Resultado |
|---|---|
| Nombres partidos letra por letra | Las filas de equipos reservan espacio para texto y acción. Responden al ancho de la ventana, incluso al redimensionarla. |
| Identificar no mostraba el cable | Selecciona el cable, marca los dos bornes, muestra sus extremos y encuadra el recorrido. La selección tiene un trazo visible independiente del zoom. Identificar no modifica el proyecto. |
| Acciones bajo demasiado texto | La pregunta y sus respuestas aparecen primero. El encargo completo, contexto y explicación adicional se despliegan cuando se necesitan. Cablear reúne selector, extremos y acción. |
| Propiedades invadía el zoom | Dock y zoom se distribuyen en un mismo contenedor adaptable. Se comprobaron las áreas de los botones para evitar superposiciones. |
| Herramientas distintas entre pizarras | Selección y Mano mantienen significado y estado visible en Tableros, Esquemas, HMI y Procesos. Tableros añade conexión de bornes, deshacer, rehacer y ajuste de selección. |
| Ventanas acumuladas | Actividad, propiedades e inspectores se pueden minimizar y recuperar conservando su contenido. Sus disparadores traen la ventana al frente. En disposición compacta, abrir Propiedades minimiza la actividad. |
| Ladder fragmentado | Las ramas y la bobina permanecen en una superficie horizontal continua. Hay desplazamiento y controles de zoom/ajuste. La vista general se identifica como tal y permite acercarse para editar. |
| Bandeja vacía y estados ambiguos | La bandeja desaparece del encuadre cuando queda vacía. Las entradas físicas sin simulación muestran estado neutro, sin un LED verde asociado al valor «—». |

Medición a 390 px: el nombre de la primera pieza pasó de unos **11 px a 178 px** de ancho útil; la fila pasó de unos **379 px a 83 px** de alto. Se comprobó también la legibilidad al estrechar manualmente la ventana.

## Mejoras encontradas durante la revisión adicional

- El dock del PLC tenía que separarse del diagnóstico: ahora ocupa su espacio sobre el fondo de la pizarra, sin tapar el resultado de compilación.
- La ventana de un cable necesitaba información útil: muestra identificación, origen, destino y ruta, y permite encuadrarlo. Conserva las acciones de edición y retirada con simulación detenida.
- Identificar también es una consulta durante la simulación; no requiere detener el proyecto.
- El límite anterior de alejamiento podía recortar una selección extensa en móvil. El encuadre admite una vista general más amplia y se comprobó que el cable identificado queda completo dentro de la pantalla.
- El modo Conectar no se activa por atajo durante RUN. Al iniciar la simulación, Tableros y Esquemas recuperan la selección para poder operar los mandos.
- Los indicadores de ventanas minimizadas y los nombres accesibles de sus disparadores reflejan su estado.

## Qué se evaluó además de la apariencia

1. **Separación de modos:** tocar bornes en Seleccionar no añade cables; Conectar sí une los dos bornes elegidos.
2. **Paneo:** arrastrar sobre un equipo con Mano desplaza la pizarra y conserva las posiciones del proyecto.
3. **Historial:** mover equipos y añadir una conexión se pueden deshacer y rehacer.
4. **Lectura sin efectos secundarios:** identificar un cable conserva exactamente los datos del proyecto.
5. **Continuidad de ventanas:** la conexión elegida y un formulario en preparación sobreviven a minimizar/restaurar.
6. **Lectura del programa:** bobina y ramas conservan su relación espacial; el ajuste muestra el segmento completo.
7. **Estados:** una entrada física sin lectura no aparece activa en el inspector.
8. **Controles táctiles:** se revisaron movimiento, tamaño, reapertura, maximizar/restaurar y ausencia de solapamientos entre botones del dock y zoom.
9. **Práctica completa:** se conservan montaje, 36 conexiones, programación, ocho comprobaciones funcionales y operación de marcha/paro al cambiar entre herramientas.

## Archivos de implementación

- `src/components/FloatingWindow.tsx` y `FloatingDisclosure.tsx`: minimización, recuperación y activación de ventanas.
- `src/lab/InspectorSheet.tsx`: inspectores recuperables y ubicación del disparador del PLC.
- `src/lab/PanStage.tsx`: encuadre de selección, alejamiento y ubicación compartida del zoom.
- `src/lab/EquipmentView.tsx`: modos de trabajo, identificación, propiedades y dock común.
- `src/lab/equipment/CabinetGuide.tsx`: ventanas de actividad/propiedades y sus estados.
- `src/lab/equipment/CabinetWorkshop.tsx`: tareas visibles, filas adaptables y consultas de cableado.
- `src/lab/equipment/CabinetScene.tsx`: bandeja vacía.
- `src/lab/PLCView.tsx`: continuidad visual, zoom del programa y entradas neutras.
- `src/lab/SurfaceDock.tsx`, `HMIView.tsx`, `ProcessView.tsx`, `SchematicView.tsx`: navegación común de las pizarras.
- `src/styles/automation-workspace.css` y `floating-window.css`: distribución y adaptación al tamaño de las ventanas.

Se conservan el formato de importación/exportación, las direcciones del PLC y el motor de simulación. Las piezas no cambian de posición por identificar o encuadrar una selección.

## Verificación

- `npm install`: dependencias al día, sin vulnerabilidades informadas.
- `npm run check` y `npm run build`.
- `npm run verify:cabinet`: 24 comprobaciones del modelo.
- `npm run verify:cabinet-cables`: 7 comprobaciones de geometría y conexiones.
- `npm run verify:float`: límites geométricos de ventanas.
- `node qa/verify-ux-complete.cjs`: 13 grupos de comprobaciones, incluyendo 320×740, 390×844, 768×1024, 844×390 y 1440×960.
- `node qa/verify-automation-ux.cjs`: recorrido completo en cuatro tamaños, conservación de proyectos y nombres personalizados, y comprobación móvil con WebKit.
- `node qa/verify-whiteboard-windows.cjs`: gestos táctiles emulados de arrastre y tamaño, persistencia y operación de ventanas del simulador y taller en cuatro tamaños.

Los recorridos de navegador registran errores JavaScript de página y guardan informes JSON. La verificación utiliza emulación, sin atribuirla a un ensayo en un teléfono físico ni a aceptación por estudiantes.

## Capturas comparativas

| Revisión | Antes | Después |
|---|---|---|
| Lista de montaje móvil | [Texto roto](output/ux-reevaluacion-2026-10-26/320-seleccion.png) | [Fila legible](output/ux-aplicacion-2026-10-26/320-mount.png) |
| Primera actividad | [Acción bajo explicaciones](output/ux-reevaluacion-2026-10-26/390-primera-actividad.png) | [Pregunta y respuesta visibles](output/ux-aplicacion-2026-10-26/390-brief.png) |
| Controles inferiores | [Superposición](output/ux-reevaluacion-2026-10-26/320-dos-ventanas.png) | [Dock y zoom distribuidos](output/ux-aplicacion-2026-10-26/320-identify.png) |
| Propiedades de cable | — | [Identificación, extremos y ruta](output/ux-aplicacion-2026-10-26/390-properties.png) |
| Ladder | [Bobina en otra fila](output/ux-reevaluacion-2026-10-26/390-plc.png) | [Segmento continuo y vista general](output/ux-aplicacion-2026-10-26/390-ladder-fit.png) |

Informe de la revisión ampliada: `output/ux-aplicacion-2026-10-26/report.json`. Los informes de práctica completa y gestos están en `output/ux-automatizacion-2026-10-26/verification/report.json` y `whiteboard/report.json`.

## Límites de la evaluación

La vista general del Ladder prioriza la continuidad del segmento; para editar se usa Acercar y se mantiene el desplazamiento horizontal. La precisión táctil al trabajar con muchos bornes próximos sigue dependiendo del zoom elegido y debe contrastarse en un dispositivo físico. Las ventanas siguen siendo libres: el usuario puede moverlas hasta superponerlas, y puede recuperar la que necesite desde su disparador.

No se desplegó. El servidor local utiliza el puerto 4327.
