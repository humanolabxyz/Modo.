# Banco de temperatura y lecciones de la guía G03

17 de octubre de 2026. Implementación local; no se desplegó nada.

## Qué se hizo

**Laboratorio → Temperatura** (`/laboratorio?tool=temperature`): horno de pozo seco (calibrador de bloque seco), termocupla (K o J) y Pt100 como **varillas largas con cable e hilos** (el Pt100 de 3 o 4 hilos, rojos y blancos), multímetro de mano con puntas roja y negra, transmisor azul de riel DIN y fuente de laboratorio, sobre el mismo pizarrón del simulador. Los dibujos son propios y se hicieron mirando fotos comerciales de cada equipo; no se incrustaron imágenes de terceros. La temperatura del horno, la lectura del multímetro y la configuración del transmisor se ven junto a cada equipo. Al pulsar un equipo se abre su edición contextual (valor con borrador, valores frecuentes, error junto al campo, Enter aplica y Escape cancela). Entre un hilo rojo y uno blanco del Pt100 se mide R(T); entre dos del mismo color solo el cable (≈ 0 Ω), como en un sensor real. Hay **fichas de los seis equipos** (botón del libro en el dock o «Ver ficha del equipo» en cada edición, y en la clase de Estudio) con valores de fabricantes y normas y sus enlaces. Hay tarjetas de Multímetro, Registro (Preparación / En clase) y Curva, tabla con la referencia de tabla y exportación CSV.

**Estudio → Instrumentación Industrial → Unidad 2** contiene las tres experiencias de G03 como actividades distintas: investigar y explicar (5 preguntas), medir y comparar sensores (6 pasos) y medir mediante transmisor (5 pasos). El resto del ramo sigue marcado como pendiente.

Diseño y decisiones: [`docs/superpowers/specs/2026-10-17-banco-temperatura-design.md`](docs/superpowers/specs/2026-10-17-banco-temperatura-design.md).

## Repaso de la guía G03

Estudio → Instrumentación → Unidad 2 → **Temperatura · Repaso de la guía G03** (`/estudio?curso=s2-3&clase=instrumentacion-g03-repaso`). 15 conceptos de las tres experiencias, 2 preguntas por concepto (30), distintas de las de las lecciones.

- **Qué cuenta como error:** una respuesta incorrecta en las preguntas de las clases o del repaso (una sola vez por respuesta), un paso de la práctica que no se cumple, o un montaje sin sentido físico en el banco: medir la termocupla en Ω, el Pt100 en mV, entre dos hilos del mismo color, con las puntas en sensores distintos, el transmisor sin alimentar o con el tipo equivocado.
- **Cómo repasa:** empieza por los conceptos con más errores (uno por concepto, rotando la pregunta), sin repetir preguntas, explica cada respuesta y, al terminar, enlaza a la práctica o a las preguntas de cada concepto fallado. Un concepto pasa a «Repasado» tras dos aciertos seguidos; un nuevo error lo devuelve a pendiente.
- **Límites:** no es una calificación ni evalúa razonamientos abiertos. El historial vive solo en este navegador (`modo:temperature:review:v1`), se puede borrar y no toca los datos del banco ni el avance de las clases. No hay programación automática de repasos.

## Qué se comprueba y qué no

- Los pasos de la práctica se comprueban contra el estado real del banco: no basta abrirlo. Los cálculos se comparan con los datos que registró el estudiante.
- **Las respuestas abiertas y las conclusiones no se evalúan.** La presentación grupal de la experiencia 1 y la comparación en planilla se conservan como tareas propias.
- Los valores son **simulados e ideales**: NIST ITS-90 (K y J) e IEC 60751 (Pt100) coinciden con las tablas publicadas en los puntos probados, pero no hay tolerancia de sensor ni resistencia de cables, y el Pt100 se modela a dos hilos.
- Las mediciones reales las teclea el estudiante en la pestaña «En clase»; el programa no lee ningún instrumento físico y no las mezcla con las simuladas.
- Las **fichas son genéricas por tipo de equipo**: la guía no nombra marcas ni modelos. Los colores de los hilos (IEC 60584-3 para la termocupla; rojo y blanco para el Pt100) son los habituales y pueden diferir en tu sala. El multímetro del banco muestra más cifras que uno real de 3 dígitos.
- Quedan por confirmar con el docente o la sala: el tipo de termocupla usado en clase, el modelo y bornes del Pt100 y del transmisor, y el rango configurado del transmisor. El banco no inventa bornes ni colores de equipos físicos.

## Archivos

Nuevos: `src/lab/TemperatureView.tsx`, `src/learning/temperatureReview.ts`, `temperatureReviewStore.ts`, `src/study/TemperatureReviewStudy.tsx`, `src/styles/temperature-review.css`, `src/lab/temperature/` (`physics.ts`, `state.ts`, `geometry.ts`, `BenchScene.tsx`, `TemperatureEditor.tsx`, `TemperatureChart.tsx`, `datasheets.ts`, `TemperatureDatasheets.tsx`), `src/learning/temperatureLessons.ts`, `src/study/TemperatureLessonStudy.tsx`, `src/styles/temperature.css`, `public/estudio/instrumentacion/guia-temperatura-g03.docx` (copia idéntica de la guía recibida), `qa/verify-temperature.mjs`, `qa/verify-temperature-ui.cjs`.

Modificados (cambios pequeños): `src/lab/model.ts`, `LaboratoryApp.tsx`, `LaboratoryBar.tsx`, `HomeTools.tsx`, `ValueEditor.tsx` (se exportan `Field` y `Chips`), `src/study/classCatalog.ts`, `courseCatalog.ts`, `CourseOutline.tsx` (la unidad abierta por defecto es la primera con material), `StudyHub.tsx`, `package.json`.

No se tocaron el panel, la protoboard, el solver DC, el PLC ni el almacenamiento eléctrico.

## Verificación

- `npm run check` y `npm run build`: sin errores.
- `npm run verify:temperature`: 37/37 (valores NIST/IEC, tiempos, lecturas del multímetro, transmisor, registro, persistencia y reglas de cada lección).
- `npm run verify:temperature-ui` (servidor local en 4341): recorrido real en Chromium a 1440 px y 390 px, con las tres lecciones completas, regreso a Estudio, datos reales y simulados separados, CSV, recarga, guardado incompatible conservado y consola sin errores. Informe y capturas en `qa/temperatura/`.
- Sin regresiones en `node qa/verify-laboratory.mjs` (38/38), `npm run verify:data` y `verify-laboratory-ui.cjs`.
- Ya fallaban **antes** de esta entrega y siguen igual: `qa/verify-study-campus.cjs` (espera 1 ramo disponible; con GeoGebra ya eran 2), `qa/verify-study-classes.cjs` (compara hashes de archivos que GeoGebra ya había modificado), `qa/verify-modo.cjs` (altura de controles del inicio; falla igual sin mi cambio) y `qa/verify-security.cjs` contra `astro preview` (espera cabeceras de `vercel.json`).
- No se probó en un teléfono físico, con lector de pantalla ni con 1920 px. No hay aprobación visual del usuario.

## Pendiente

Conferencias y otras guías de Instrumentación (G01 y G02: detectores y PLC), repaso vinculado a los conceptos fallados, y confirmar los datos de equipos físicos listados arriba.
