# Instrucción para Codex — Continuar PanelLab localmente

Trabaja **exclusivamente en el proyecto local**. No uses Sites ni publiques la web.

Ya existe una primera entrega dentro de esta carpeta:
- `PANEL_LAB_INACAP.html`: versión autónoma funcional, sin dependencias, para comparar visualmente y validar el comportamiento.
- `src/components/Board.tsx`: representación vectorial del banco con bornes seleccionables.
- `src/components/App.tsx`: inspector, filtros, búsqueda, zoom y fotografía de referencia.
- `src/data/panel.ts`: 7 módulos, 108 terminales con identificadores y estados de verificación.
- `public/references/`: recortes de las fotografías reales del laboratorio.
- `INVENTARIO_ORIGINAL.json`: inventario técnico preliminar.

## Orden de trabajo obligatorio

1. Ejecutar y **verificar la compilación Astro** (`npm install`, `npm run dev`, `npm run build`). Corregir cualquier problema de compilación o UI, sin cambiar la información eléctrica no verificada.
2. Comparar visualmente la versión React con la versión autónoma y las fotografías reales. Ajustar layout, posiciones de bornes y etiquetas ilegibles. No usar nombres KM1/KM2 como hechos hasta verificar el panel y el esquema del docente.
3. Crear validación automática del modelo: IDs únicos (`idMod:idTerminal`), colores válidos y mapeo completo de todos los bornes.
4. Agregar interacción cómoda para ratón y tacto; preservar vista de un solo panel y un inspector contextual, sin pantallas extras.
5. Solo después de obtener aprobación visual, avanzar al sistema de cables banana apilables y puentes. Varios cables en un punto constituyen un mismo nodo lógico, pero la capacidad física de apilado depende del modelo del conector y no debe asumirse.
6. En una etapa posterior, incorporar el diagrama de control legible y el modo guiado por segmentos con 3 niveles de ayuda. No adivinar terminales de fotografías proyectadas borrosas.

## Criterio de aceptación de la fase 1
- Se ven los siete módulos, su ubicación relativa, colores y numeraciones.
- Los 108 bornes son seleccionables con mouse o toque, y al pulsarlos el inspector presenta su ID único.
- Zoom y desplazamiento sin desaparición de terminales.
- Búsqueda `A1`, `95`, `13` y `S2:3` localiza los bornes correspondientes.
- El estado NA/NC inferido se muestra **por confirmar**, nunca como certeza.
- Referencias originales accesibles en el inspector.

Este proyecto es una herramienta didáctica de simulación **desenergizada**. No generar instrucciones para energizar o manipular un banco real sin supervisión docente.
