# Corrección de Laboratorio para tablet

Publicado en https://modo-lab.vercel.app/laboratorio/ el 16 de octubre de 2026.
Despliegue `dpl_EQRAGZnf1fbAg3ZiUsD8HRtNe1ov`, proyecto existente `modo-lab`, estado READY, promovido al dominio público.

## Resultado

Laboratorio usa una pizarra continua a pantalla completa en móviles y tablets. Una barra superior compacta permite cambiar de herramienta y simular; la barra inferior conserva las acciones de la herramienta. El botón de tres puntos abre Mi proyecto, con los proyectos guardados, importación, exportación y ejemplos.

Las propiedades se abren en una ventana movible y cerrable al seleccionar una pieza, y se pueden reabrir desde el botón de la pizarra. El fondo admite paneo y pellizco. PLC conserva su editor con desplazamiento interno y sus variables en una ventana independiente. La protoboard ajusta el encuadre al cambiar de orientación.

La distribución compacta se aplica hasta 1100 px y a dispositivos táctiles hasta 1366 px. El escritorio de 1440 px conserva las medidas anteriores. No se modificaron el modelo eléctrico, los proyectos guardados, el solver, las lecciones ni el diagrama original.

## Archivos

- `src/hooks/useCompactLayout.ts`: consulta opcional; el simulador conserva la consulta existente.
- `src/lab/workspaceLayout.ts`: criterio compacto específico del laboratorio.
- `src/lab/LaboratoryBar.tsx`: navegación compacta y ventana Mi proyecto.
- `src/lab/LaboratoryApp.tsx`: selección de la composición adecuada al dispositivo.
- `src/lab/InspectorSheet.tsx`: propiedades en ventanas para móvil/tablet.
- `src/lab/BreadboardView.tsx`: encuadre y controles compactos en tablet.
- `src/styles/laboratory-compact.css`, `src/pages/laboratorio.astro`: pizarra completa y controles flotantes.
- `qa/verify-tablet-laboratory.cjs`: geometría e interacción táctil; pruebas existentes del laboratorio y seguridad actualizadas para las nuevas ventanas.

## Verificación

- `npm install`: sin vulnerabilidades; `npm run check` y `npm run build`: correctos.
- `npm run verify:lab`: 38/38; `npm run verify:float`: correcto.
- `npm run verify:lab-ui`: edición, historial, instrumentos, PLC, HMI, proceso y móvil correctos.
- `node qa/verify-assessment-windows.cjs`: simulador y ventanas de las pruebas correctos en cuatro tamaños.
- `node qa/verify-tablet-laboratory.cjs`: cinco herramientas en ocho tamaños de 320×740 a 1366×1024; sin desbordamiento ni controles superpuestos. Paneo, pellizco, teclado, ventanas movibles, edición, Deshacer, rotación, simulación, exportación, recarga e importación comprobados. Geometría de escritorio comparada con la captura anterior.
- Producción: compilación remota correcta; rutas HTTP 200 y assets de Laboratorio idénticos por SHA-256 al build local. `verify:security` pasó con los encabezados reales de Vercel, CSP, enlaces legales y uso sin conexión. El servidor de desarrollo no incorpora esos encabezados; su ensayo inicial de seguridad se repitió correctamente en producción.
- Pruebas de tablet con emulación táctil de Chromium. Pendiente: comprobación manual en la tablet física del usuario.

## Comparación visual

| Vista | Antes | Después publicado |
| --- | --- | --- |
| Esquemas vertical | [Antes](qa/tablet-laboratory/before/schematic-820.png) | [Después](qa/release-2026-10-16-tablet/browser/schematic-820x1180.png) |
| PLC horizontal | [Antes](qa/tablet-laboratory/before/plc-1024.png) | [Después](qa/release-2026-10-16-tablet/browser/plc-1024x768.png) |
| Protoboard vertical | [Antes](qa/tablet-laboratory/before/breadboard-820.png) | [Después](qa/release-2026-10-16-tablet/browser/breadboard-820x1180.png) |

Ventanas: [Propiedades](qa/release-2026-10-16-tablet/browser/properties-820x1180.png) y [Mi proyecto](qa/release-2026-10-16-tablet/browser/project-820x1180.png).

Evidencias: `qa/tablet-laboratory/results.json`, `qa/laboratory-results/ui.json`, `qa/release-2026-10-16-tablet/` y `qa/proteccion/verification.json`.
