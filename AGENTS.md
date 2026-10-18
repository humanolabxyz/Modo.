# Reglas de trabajo para Codex — PanelLab INACAP

- Trabajar **solo en este proyecto local**. No usar Sites, no desplegar, no modificar repos remotos ni montar una web distinta.
- Preservar el prototipo aprobado (`PANEL_LAB_INACAP.html` y captura de referencia). Mejorar, no rediseñar. Dos pantallas como máximo: inicio simple y simulador; priorizar la vista del simulador.
- **Fuente de verdad:** `src/` Astro/React y modelo de datos con IDs únicos. No reemplazar por una maqueta estática, ni sobrescribir el HTML autónomo aprobado sin una versión de respaldo.
- Revisar primero `INSTRUCCION_CODEX_V1_1.md`, `TABLA_TECNICA_PANEL_V1_1.md`, `REFERENCIAS_FOTOGRAFICAS_V1_1.md`, `PRUEBAS_Y_APROBACION_V1_1.md`.
- Conservar los 7 módulos y los 108 bornes del inventario base hasta identificar correcciones verificadas con las fotos. No mezclar bornes que repiten un número en distintos módulos.
- Colores de conectores ≠ color de cables. Los cables del laboratorio en las fotos nuevas son verde petróleo; los bornes tienen colores propios.
- Usar estados de confianza: visto en fotografía / por convención pendiente de verificación / desconocido. No afirmar definitivamente NA/NC, funcionamiento de pilotos ni nombre KM si no hay confirmación.
- En la botonera hay 3 pulsadores verde–rojo–verde; cada uno tiene 1–2 rojo y 3–4 crema. Par NA/NC solo provisional por nomenclatura, sujeto a verificación física/documentación docente.
- Los módulos son **móviles** en el banco: las fotografías muestran diferentes posiciones entre sesiones. Acordar una distribución base coherente, inspirada en la preview aprobada, sin mezclar distintas fotos en una única geometría 'real' imposible.
- Mantener interacción con mouse, teclado y tacto; preservar inspector, búsqueda y zoom.
- En v1.1 solo preparar una **apariencia visual** de cables banana verde petróleo, curvas y conectores visibles. No agregar cables como si estuvieran eléctricamente conectados sin implementar su modelo de nodos.
- Antes de terminar: `npm install`, `npm run check`, `npm run build`, comprobar interfaz desktop/móvil; si algo no puede probarse, documentar el bloqueo sin fingir que pasó.
- Entregar resumen de archivos modificados, pruebas ejecutadas, pendientes y captura comparativa. No energizar equipos reales basándose en el simulador.
