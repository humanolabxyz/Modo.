# Historial verificable y panel JSON — 15 de octubre de 2026

## Uso
- El historial del panel se registra automáticamente mientras trabajas. La grabación manual sigue disponible para guardar procedimientos con nombre.
- Abrir **Procedimientos → Grabación → Historial del panel**.
- Expandir **Ver todos los pasos anteriores** y elegir un paso. La comparación muestra cables añadidos, retirados o modificados, sus bornes, color y recorrido anterior/posterior, además del mando virtual y el ejercicio LOTO.
- **Ver antes del cambio / Ver después del cambio** muestra ambos montajes en la vista previa. La práctica activa permanece intacta.
- **Leer circuito** enumera las conexiones entre bornes y las redes formadas exclusivamente por cables.
- **Opciones de práctica → Exportar**, o **Exportar panel con historial**, descarga modo-panel-con-historial.json.
- **Abrir panel JSON** en Procedimientos, o **Abrir práctica guardada** desde Inicio, recupera el circuito y los pasos conservados.
- También puedes abrir el JSON de una grabación anterior como panel: se lee su último circuito y se conservan sus pasos. Las grabaciones manuales se siguen importando/exportando por separado.
- Recuperar un montaje anterior sigue siendo reversible con Deshacer. Al importar, el mando virtual queda detenido.

## Qué contiene el JSON
Conserva el formato de práctica version 2 (wires, diagram, steps, mode, etc.) y agrega:
- format: modo-panel.
- panelHistory: estado inicial y secuencia temporal de estados posteriores.
- Cada paso contiene changes.added, changes.removed, changes.modified, los objetos de cable completos antes/después, los campos modificados, cambios de mando virtual y LOTO.
- operation distingue edición, Deshacer/Rehacer, mando y LOTO en el historial automático.
- Los IDs completos permanecen en el archivo. En la interfaz se usa una referencia corta para identificar cada cable.

## Comprobación de cambios
Se comparan los cables por su ID estable y por contenido, sin depender del orden de las claves JSON. El retiro conserva todos los datos del cable anterior. Cambiar color, extremos, recorrido u orden visual conserva ambos valores.
Al importar, se recalculan las diferencias de cada transición. Si el JSON aporta cambios que no coinciden con sus estados, o su montaje final difiere del final del historial, se rechaza antes de cambiar la práctica. Las etiquetas de cambios de cable se reconstruyen desde los estados.
Las grabaciones anteriores sin differences estructuradas se actualizan al leerlas comparando los estados ya existentes.
Esta comprobación verifica coherencia de los datos, no autenticidad de un archivo ni validez eléctrica del montaje.

## Límites y continuidad
- Historial automático: conserva hasta los últimos 200 pasos, o el tramo que cabe dentro del límite de tamaño. Cuando recorta, avisa y actualiza el estado inicial al comienzo del tramo conservado.
- Grabación manual: continúa con su límite de 200 pasos y diez grabaciones.
- Archivo máximo: 8 MB.
- Los JSON antiguos sin historial recuperan su montaje, pero no permiten inferir las acciones anteriores. El aviso lo explica; los cambios posteriores sí se registran.
- El historial automático se guarda con el panel y se recupera al recargar. Abrir una sesión no reactiva los mandos guardados.
- Cámara, selección, movimiento de módulos y alias personales siguen fuera del historial.
- Trabajo exclusivamente local, sin despliegue.

## Archivos principales
- src/data/changes.ts: comparación estructurada de estados.
- src/data/session.ts: validación y migración de grabaciones.
- src/data/panelHistory.ts: historial acotado, exportación e importación del panel.
- src/hooks/usePractice.ts: historial automático y persistencia.
- src/hooks/useActionRecorder.ts: cambios estructurados en grabaciones manuales.
- src/components/App.tsx, ProcedureTools.tsx y src/styles/procedures.css: integración, importación, lectura y comparación.
- qa/verify-panel-history.mjs y qa/verify-panel-history-ui.cjs: modelo y flujo completo en navegador.
- Respaldo anterior: qa/historial-panel-2026-10-15/before/.

## Evidencia
Pasaron pruebas de modelo e interfaz: alta, color, recorrido, retiro, Deshacer/Rehacer; exportar desde el menú habitual; recargar; abrir el JSON desde Inicio; recuperar cables ya retirados en pasos previos; rechazo de archivos incoherentes; compatibilidad con archivos anteriores; límites de 200 pasos y capturas en escritorio, 390, 360 y horizontal.
También pasaron verify:procedures y verify:simulation-ui, sin errores de navegador.
Pruebas nuevas:
- npm run verify:panel-history
- npm run verify:panel-history-ui
Resultados y capturas: qa/historial-panel-2026-10-15/.
