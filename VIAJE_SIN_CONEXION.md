# modo. para el viaje — 25 de octubre de 2026

## Abrir en este computador

Haz doble clic en **ABRIR_MODO_SIN_CONEXION.cmd**, en la carpeta `paneldecontrol` o dentro de `PanelLab-INACAP`.

Se abre **http://127.0.0.1:4325/**. La copia compilada y el motor de GeoGebra ya están preparados en este computador. Este acceso no ejecuta npm, no recompila y no descarga nada al arrancar. Solo requiere el Node.js que ya está instalado. El servidor se inicia en segundo plano y sirve los archivos del disco; funciona con Wi-Fi desactivado.

Conserva la carpeta del proyecto, incluyendo `dist/` y `scripts/`. Para desarrollar sigue disponible `npm run dev`; para estudiar durante el viaje utiliza el acceso anterior.

## Qué está disponible

- Panel eléctrico, cables banana, diagramas, motor y multímetro.
- Esquemas, equipos eléctricos, PLC Ladder/ST, HMI y tanque de proceso.
- Protoboard y multímetro, soldadura y práctica HMI–PLC.
- Bancos de temperatura y detectores, con sus actividades y modelos existentes.
- Estudio, cuadernos, actividades integradas, documentos y tutoriales locales.
- GeoGebra Classic local: gráfica, operaciones, matrices, CAS y motor 3D.

Los enlaces externos de consulta, YouTube y las actividades que se abren directamente en geogebra.org siguen necesitando internet. Las actividades integradas de modo. utilizan el motor local.

## Preparar también el navegador

En Inicio, pulsa **Preparar viaje · sin conexión**, después **Guardar todo para el viaje**. Espera **Listo para el viaje**. La copia completa ocupa aproximadamente **156 MiB** y contiene **506 archivos** en el build verificado.

Este paso permite seguir abriendo la aplicación desde la caché aunque el servidor esté detenido. La copia local del computador funciona desde el acceso `.cmd` sin tener que esperar esta descarga. La preparación es específica de este navegador, perfil y dirección; utiliza «Comprobar archivos» después de una actualización o si el navegador ha liberado almacenamiento.

No cambies a otro navegador, modo privado, puerto o dirección si quieres continuar con los mismos avances. Los proyectos se guardan por origen: un avance que ya tengas en el enlace público o en otro localhost permanece allí y no se copia automáticamente a `127.0.0.1:4325`. Exporta/importa las prácticas y proyectos que quieras trasladar. No se borró el almacenamiento de tus navegadores.

## Cambios realizados

- GeoGebra utiliza el paquete oficial **5.4.933.1** desde `/vendor/geogebra/`. Su descarga tiene SHA-256 fijo; se conservaron sus avisos y licencias. Se utiliza el cargador normal también en localhost, porque su cargador de depuración creaba un iframe que no recibía la caché offline. El parámetro que desactiva esa depuración se añade solo en localhost: en el dominio público se omite, porque allí su mera presencia activa el cargador de depuración.
- El build genera un inventario con el tamaño real de cada archivo y una versión calculada con su contenido. Los motores alternativos `web` y `webSimple` no se descargan: la app utiliza `web3d`, que incluye Classic, CAS y 3D.
- Las páginas principales registran la caché incluso si entras directamente a Estudio o Laboratorio. Las rutas y sus parámetros funcionan desde la copia guardada.
- La navegación y los recursos guardados se leen primero de la caché. La descarga completa se hace aparte, con tres transferencias simultáneas, progreso visible, control de integridad/tamaño y reanudación de archivos pendientes.
- Los PDF y videos se guardan completos. El servidor y la caché responden a rangos de bytes para conservar la reproducción y el desplazamiento dentro del video.
- El laboratorio abre directamente la herramienta solicitada, evitando montar y descargar primero el editor de esquemas.
- Durante el paneo se pausa únicamente a los elementos animados del panel. Esto evita recalcular estilos sobre todos los descendientes SVG y las instancias de conectores. Se conservan los dibujos, sombras, animaciones y modelos.
- Se añadió un servidor local sin dependencias npm y un acceso dedicado con puerto estable.

La versión también está publicada en **https://modo-lab.vercel.app/** desde el 25 de octubre de 2026. Para usar la copia del enlace público sin internet, prepara la descarga desde ese mismo enlace y navegador. La caché de localhost y la del dominio público son independientes.

## Verificación

**Pasaron:** `npm install --ignore-scripts --no-audit --no-fund --prefer-offline`, `npm run check`, `npm run build`, `verify:pwa`, `verify:simulation`, `verify:lab`, `verify:temperature`, `verify:detectors`, `verify:workshop`, `verify:equipment` y `verify:motor`.

**Prueba completa:** `npm run verify:offline`. Utiliza un perfil de prueba independiente, prepara la copia desde Estudio sin visitar primero los simuladores, apaga su servidor y desactiva la red. Verifica:

- Primera apertura de las diez herramientas del laboratorio y del panel.
- Importación de cinco cables y conservación tras recargar.
- Edición y persistencia de PLC Ladder/ST y de elementos HMI, y operación de la válvula del proceso en simulación.
- GeoGebra: aritmética, función exponencial, determinante, CAS, punto 3D y restauración del archivo.
- Actividad integrada del cuaderno, PDF sin consulta previa, videos con rangos normales y de sufijo, y respuesta 416 ante un rango imposible.
- Inicio, Estudio, preparación, protoboard y GeoGebra a 390 y 820 px sin desbordamiento horizontal.
- Cierre completo y reapertura del navegador sin servidor ni red.
- Detección de un PDF retirado de la caché: un paquete incompleto deja de mostrarse como listo.
- Ausencia de peticiones externas y de errores inesperados. El diagnóstico informativo de GeoGebra sobre archivos con objetos 3D y el 416 solicitado por la prueba se registran por separado.

Resultados y capturas: `qa/offline-travel/verification.json` y `qa/offline-travel/*.png`. Estas son pruebas automatizadas en Chromium y viewports emulados, no pruebas físicas en un teléfono.

### Rendimiento

`qa/measure-offline-performance.cjs` conserva tres muestras por ruta, con CPU emulada ×4 y viewport 820×1180. La apertura inicial se mantiene en un rango parecido al anterior; se verificó que entrar a PLC, protoboard, temperatura o detectores ya no descarga `SchematicView`. No se afirma una mejora grande o uniforme de arranque.

`qa/perf-panel-cables.cjs` pasó los escenarios de 54 y 160 cables: reposo, paneo, conexión y motor estrella–triángulo en marcha. Las muestras `qa/cable-performance/offline-after/results.json` y `qa/cable-performance/offline-css/results.json` muestran menos trabajo de recálculo de estilos durante paneo; las cifras de cuadros varían entre escenarios. Las escenas extremas de 160 cables con CPU ×4 aún pueden perder fluidez: no se garantiza 60 fps en cualquier equipo y carga.

### Verificadores antiguos que no terminaron en verde

- `verify:academic` pasó sus doce grupos funcionales y se detuvo en una comparación de hashes antigua de `App.tsx`; ese archivo ya estaba modificado antes de este trabajo y no fue editado en esta entrega. Se conserva la referencia histórica, sin sustituirla para forzar un PASS.
- `verify:temperature-ui` se detuvo porque su secuencia no cierra la libreta flotante antes de pulsar un control que queda detrás.
- `verify:detectors-ui` espera el selector antiguo de botones del multímetro; la interfaz actual utiliza el instrumento Fluke.

Los modelos de ambos bancos y su primera apertura offline sí pasaron las pruebas indicadas arriba. No se presentan esos tres verificadores antiguos como aprobados.

## Reproducir la preparación después de cambiar código

```powershell
npm run prepare:offline
npm run verify:offline
```

La preparación descarga GeoGebra solo si falta el ZIP local verificado. Tras compilar una nueva versión, vuelve a preparar la caché del navegador si quieres usarla con el servidor apagado.

Referencia oficial de la integración: [GeoGebra Apps Embedding — Offline and Self-Hosted Solution](https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_Embedding/). Los avisos de GeoGebra están en `public/vendor/geogebra/README.txt` y sus archivos de licencias; es la copia para este uso personal educativo.
