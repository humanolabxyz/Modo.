# Fotos, LOTO y grabación de procedimientos — 15/10/2026

Trabajo exclusivamente local en PanelLab-INACAP. No se desplegó ni se modificó la versión alojada.

## Cómo probarlo
1. Abrir el panel: http://127.0.0.1:4326/?view=simulator
2. Pulsar **Procedimientos → Grabación**, escribir un nombre y pulsar **Grabar acciones**.
3. Cerrar el panel flotante y construir el circuito. Se registran conexiones, retiro/cambio de cables, Deshacer/Rehacer, cambios de práctica/guía y operaciones del mando virtual. Cámara, búsqueda, selección de bornes y movimiento de módulos no se graban.
4. En **Procedimientos → LOTO**, revisar las ocho etapas en orden. La grabación activa también guarda estas revisiones.
5. Volver a **Grabación → Detener grabación**. Reproducir, mover el deslizador o recorrer los pasos.
6. **Guía de bornes** señala los extremos del siguiente paso. El avance es manual; no comprueba que se haya realizado correctamente.
7. **Usar este montaje en mi práctica** recupera el estado seleccionado del cableado con la simulación detenida. Deshacer recupera el montaje anterior.
8. Exportar la grabación para conservar una copia o importarla en otro navegador.

## Alcance de la grabación
- Biblioteca local de hasta 10 grabaciones, 200 pasos por grabación; importación máxima de 8 MB.
- Guarda estado inicial, tiempos relativos, descripción, IDs completos de bornes y estado posterior de práctica, mando virtual y ejercicio LOTO.
- Los pasos se capturan en cada acción; una pulsación y su liberación son eventos separados.
- Reproducción en vista previa de solo lectura, sin modificar la práctica activa ni calcular/recrear el funcionamiento eléctrico. Las esperas mayores a 4 segundos se acortan.
- La vista previa representa cableado y muestra estado guardado de enchufe e interruptores. No ejecuta mandos en el banco físico.
- Tras recargar se recupera la biblioteca; la grabación y la reproducción quedan detenidas.
- Si falla el almacenamiento se avisa y se conserva la grabación en la pestaña para exportarla.
- Ningún envío a servidores, entrenamiento de IA ni asistente automático. Base preparada para revisión docente y futura asistencia que compare acciones reales con pasos revisados.
- La disposición física de módulos, alias personales, selección, zoom y paneo quedan fuera de la grabación.

## Qué aportan las fotos
- Se conservan los seis JPG originales en public/photos-2026-10-15/.
- Fotos 1–2: seccionador en OFF con candado; no prueban ausencia de tensión ni aislamiento de todas las fuentes.
- Fotos 3–5: referencia del contactor trifásico; se mejora el frente con UT-AX4, S-T12 y numeración legible de su bloque auxiliar.
- Foto 6: referencia del módulo con relé térmico; A1 pasa arriba de A2 según esta fotografía. El contactor trifásico mantiene A2 arriba de A1.
- Las fotos se consultan en Procedimientos → Fotos y desde el inspector de los dos contactores.
- Se conservan los 6 módulos y 94 bornes activos de la versión actual, incluyendo 95–96 del contactor trifásico añadidos previamente por el usuario. Estos dos bornes no aparecen en las nuevas fotos y ahora lo indican en su nota; no se retiran sin resolver la diferencia.
- El gris NC conserva la indicación anterior del usuario; las fotos muestran conectores negros. Referencias KM manuscritas no se confirman usando estas imágenes.
- Inventario público y tabla CSV sincronizados.

## LOTO
Ejercicio educativo secuencial: preparación/comunicación, parada, aislamiento, bloqueo/etiquetado, energía residual, verificación, intervención/control y restitución. Es una revisión educativa; el checklist no bloquea el mando virtual ni acredita condiciones físicas.
Referencia general: [OSHA — Application of Energy Control](https://www.osha.gov/etools/lockout-tagout/tutorial/application-energy-control).
El docente o responsable debe adaptar y validar el procedimiento específico del banco de INACAP antes de usarlo como instrucción de trabajo real.

## Archivos
- src/data/session.ts: formato y validación de las grabaciones, diferencia de cableado y contenido educativo LOTO.
- src/hooks/useActionRecorder.ts: biblioteca, captura inmediata, persistencia y exportación/importación.
- src/hooks/usePractice.ts y src/hooks/useSimulation.ts: captura de acciones sin efectos secundarios dentro de actualizadores React.
- src/components/ProcedureTools.tsx y src/styles/procedures.css: acceso flotante, fotos, LOTO, reproducción y guía manual.
- src/components/App.tsx, Board.tsx y src/data/panel.ts: integración, mejoras fotográficas y conservación de los bornes existentes.
- src/pages/index.astro, public/panel-model.json, TABLA_DE_BORNES.csv y public/photos-2026-10-15/: estilos, inventario y referencias.
- qa/verify-procedures.cjs: prueba completa; ejecutar npm run verify:procedures.
- Respaldo anterior a los cambios en qa/procedimientos-2026-10-15/before/.

## Verificación
Pasaron npm install --offline --ignore-scripts --no-audit --no-fund, npm run check, npm run build, sync:data, verify:wiring, verify:simulation, verify:learning, verify:simulation-ui, verify:cable-color y qa/verify-procedures.cjs.
El flujo nuevo verificó: registrar cable/Deshacer/Rehacer; enchufe e interruptores; pulsación y liberación; ocho etapas LOTO en orden; reproducción sin modificar el trabajo; exportación/importación con nuevo ID y rechazo de archivo inválido; recuperación reversible y simulación OFF; biblioteca tras recarga; escritorio, 390, 360 y horizontal, con tacto emulado y sin errores de navegador.
Capturas y resultado: qa/procedimientos-2026-10-15/. Falta probar en un teléfono físico y revisar el procedimiento LOTO con el docente.

## Actualización: historial automático y panel JSON

La práctica exportada ahora incluye su historial. Los cambios de cable se comparan entre estados y pueden leerse antes/después. Consulta [HISTORIAL_Y_PANEL_JSON.md](HISTORIAL_Y_PANEL_JSON.md) para compatibilidad, límites y uso.
