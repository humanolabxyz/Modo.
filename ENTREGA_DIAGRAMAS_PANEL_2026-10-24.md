# Reparación de diagramas del panel · 24-10-2026

Implementado en el proyecto local. Vista para revisar: http://127.0.0.1:4336/?view=simulator

## Comportamiento

- Abrir diagrama y pulsar una línea muestra directamente su conexión en el tablero y enfoca sus bornes. Se eliminó el botón «Mostrar recorrido en el tablero».
- La línea elegida usa naranja intenso, con grosor constante al ampliar. Los números de sus extremos cambian únicamente a naranja; conservan tamaño y peso, sin fondo ni recuadros. El área táctil ampliada permanece invisible; el foco ya no dibuja un rectángulo azul sobre el circuito.
- PERFECTO usa los cables concretos de «Aprender · Marcha y paro». Por ejemplo, la línea 83 muestra Fuente F → KM1 95; no añade la rama de aviso ni confunde la fase de fuerza con el mando.
- Las correspondencias incluyen pulsadores, pilotos, retorno común, fuerza, motor y protección. Los 47 tramos originales tienen equivalencia con el banco virtual.
- Se distinguen los dos dispositivos Q, que reutilizan numeración en el dibujo. Las protecciones integradas de la fuente y del módulo térmico no generan cables banana ficticios.
- Los cuatro esquemas de lecciones usan sus propios pasos. Estrella-triángulo añade KM3 cuando se necesita para mostrar su conexión.
- Volver a pulsar la misma línea o componente, tocar el fondo vacío del diagrama o pulsar Escape quita la selección y el cable de ayuda. Arrastrar el fondo conserva la selección. La deselección no modifica el documento guardado ni sus cables.
- Cambiar de esquema limpia las ayudas anteriores. Consultar líneas conserva los cables instalados. Se mantienen las correspondencias personales probadas y se migran las antiguas claves Q:3…6 a su referencia de fuerza.

## Archivos de implementación

- `src/data/panelCorrespondence.ts`: equivalencias, separación de Q, retornos compartidos y migración de claves anteriores.
- `src/data/learning.ts`: redes equivalentes, cables exactos de la lección y recorrido específico de cada línea.
- `src/data/wiring.ts`: importación y validación de correspondencias compartidas declaradas.
- `src/components/App.tsx`: selección directa, enfoque del tablero y preparación de KM3.
- `src/components/DiagramPane.tsx`: correspondencias de estrella-triángulo y cambio de esquema.
- `src/components/CadeRoute.tsx`: retirada del botón redundante.
- `src/components/CadeDiagram.tsx`, `CadeSheet.tsx`: resaltado de conductor y de sus números, y enlaces a los bornes correctos.
- `src/components/ConnectionLesson.tsx`: explicación de las correspondencias actualizadas.
- `src/styles/diagram-layout.css`: foco y área táctil sin bloque azul.

## Verificación

Ejecutados correctamente:

- `npm install --no-audit --no-fund`
- `npm run check`
- `npm run build`
- `npm run verify:wiring`
- `node qa/verify-learning.mjs`
- `node qa/verify-star-lessons.mjs`
- `node qa/verify-diagram-recognition.mjs`
- `node qa/verify-diagram-recognition-ui.cjs`

El modelo comprueba los 47 tramos originales, igualdad de las rutas con los 24 cables de la lección, separación mando/fuerza, contactos sin puentear, retornos comunes, detección de uniones entre fuentes y exportación/importación.

La interfaz se probó en Chromium y WebKit, a 1440 y 390 px: las 47 líneas de PERFECTO en escritorio, 10 líneas representativas en móvil, selección con mouse y tacto emulado, cuatro esquemas de lecciones, incorporación de KM3, conservación del cableado guardado y ausencia del botón. Se prueban también la deselección por repetición, fondo y Escape y la conservación de la selección durante el paneo. Se verifican el color naranja de la línea, los números 2 y 95 en naranja, sin fondo ni recuadro y la ausencia de un contorno rectangular. Sin errores de página registrados.

## Evidencia

- `qa/diagram-recognition/model-results.json`
- `qa/diagram-recognition/ui-results.json`
- `qa/diagram-recognition/original-perfecto.json`: copia del dato original tomada antes del cambio, comparada por la prueba.
- `qa/diagram-recognition/*-initial.png`: antes de seleccionar una línea en esta versión.
- `qa/diagram-recognition/*-connection.png`: después de seleccionarla y mostrar su cable.
- `qa/diagram-recognition/*-diagram-detail.png`: detalle del trazo naranja y sus números en naranja.
- `qa/diagram-recognition/*-deselected.png`: el mismo diagrama después de quitar la selección.
- `qa/diagram-recognition/*-star.png`: conexión de una lección con KM3 disponible.

Las capturas initial/connection comparan estados de interacción, no versiones diferentes del proyecto. El dibujo original se conserva. La lección manual de estrella tiene cinco pasos sin trazado en el dibujo de origen; sus datos se mantienen sin inventar líneas nuevas. Las pruebas móviles usan emulación, no un teléfono físico. No se publicó un despliegue.
