# Menús plegables y navegación del laboratorio

## Instrumentos

Se conserva el diseño de círculos al costado del tester y la pinza. El acceso para cambiar de instrumento queda siempre visible; el botón «Más opciones» despliega o pliega las demás acciones. Escape pliega el grupo y devuelve el foco al botón. La expansión usa transiciones cortas y una aparición escalonada de las opciones. Se respeta `prefers-reduced-motion`.

## Selector de módulos

El selector nativo y la antigua lista horizontal de herramientas se sustituyeron por un mismo selector visual en teléfono, tablet y escritorio. El menú se despliega directamente debajo del botón, sin ventana flotante. Una sola columna presenta icono, nombre y una marca en el módulo activo. Conserva cuatro subdivisiones con separadores discretos:

- Automatización: Tableros, PLC, HMI y Procesos.
- Circuitos y montaje: Esquemas, Protoboard y Soldadura.
- Instrumentación: Temperatura y Detectores.
- Matemáticas: GeoGebra.

Seleccionar un módulo mantiene las rutas y el proyecto activo. Escape, volver a pulsar el botón y pulsar fuera cierran el selector. Flechas, Inicio y Fin permiten recorrerlo con teclado; en pantallas bajas la lista se desplaza dentro del menú. Un clic exterior solo descarta el menú, sin activar accidentalmente la pizarra.

## Barras de herramientas

Las barras compartidas incorporan una ayuda con el icono, nombre, explicación y atajo de cada acción. Al elegir una herramienta se muestra su nombre brevemente. Se conservaron los controles y sus condiciones de disponibilidad.

Se diferenciaron los iconos de Mando, Automatización y Energía; las puntas roja/negra tienen un dibujo de punta de prueba, las fichas usan documento y la fuente usa encendido. También se incorporaron iconos a controles propios de GeoGebra, soldadura y puesta en marcha HMI–PLC. Los estados activos, foco y pulsación tienen feedback coherente y movimiento reducido.

## Archivos principales

`src/components/InstrumentOptions.tsx`, `src/lab/LabModuleNavigator.tsx`, `LaboratoryBar.tsx`, `LaboratoryApp.tsx`, `CanvasControls.tsx`, `ToolbarIcons.tsx`, `EquipmentView.tsx`, `TemperatureView.tsx`, `DetectorsView.tsx`, `BreadboardView.tsx`, `CableBench.tsx`, `GeoGebraView.tsx`, `src/lab/soldering/CommissionBench.tsx`, `src/styles/laboratory-navigation.css` y `panel-meter.css`.

## Verificación

- `npm install`, `npm run check`, `npm run build`.
- `qa/verify-laboratory-navigation.cjs`: opciones plegables, teclado, movimiento reducido; diez módulos y sus categorías en Chromium 390 px; anclaje al botón, teclado y conservación del proyecto activo; barras y ayudas; WebKit 820 px y Chromium 1440 px. Sin errores de página.
- `qa/verify-module-dropdown.cjs`: anclaje, límites de pantalla, último módulo alcanzable mediante desplazamiento y teclado, Escape y plegado en 320×700 y 600×360.
- Verificaciones de la entrega anterior, sin cambios en las mediciones:
- `qa/verify-visible-instruments.cjs`: círculos laterales y cambio de instrumento en 320/390/820/1440 px.
- `qa/verify-measurement-teaching.cjs`: continuidad, medición en serie, pinza con HOLD y CSV.
- `qa/verify-machines-guide-ui.cjs`: los 34 pasos y las exportaciones de la guía.

Evidencia visual en `qa/laboratory-navigation/`. Las pruebas móviles son emuladas. Se verificó la navegación e interfaz; no se afirma haber repetido todos los ejercicios ni validado equipos físicos.

Selector compacto publicado en https://modo-lab.vercel.app; despliegue `dpl_Dnu7mT1MiFvvc5ZaPGdTp2UF8PkS`, READY. La prueba pública de pantallas estrechas y bajas pasó en 320×700 y 600×360. La matriz pública de navegación también pasó en Chromium 390/1440 y WebKit 820: diez módulos, cuatro subdivisiones, selección, anclaje al botón, teclado, cierre exterior, conservación del proyecto y ayudas de las barras. Sin errores de página.
