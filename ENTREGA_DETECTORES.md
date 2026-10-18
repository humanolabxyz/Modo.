# Banco de detectores y lecciones de las guías G01 y G02

18 de octubre de 2026. Implementación local; no se desplegó nada. Es la entrega D del mapa maestro.

## Qué se hizo

**Laboratorio → Detectores** (`/laboratorio?tool=detectors`): fuente de 24 V, un detector de tres hilos (inductivo, capacitivo o fotoeléctrico; salida PNP o NPN), objeto de metal o de plástico con distancia ajustable, entrada digital de PLC (X0 y COM) y multímetro en tensión continua, sobre el mismo pizarrón del simulador (lienzo con pan/zoom, dock oscuro, tarjetas flotantes y edición contextual). Los bornes se unen con la herramienta **Cable** (pulsar dos bornes; repetir un cable lo quita) y las puntas roja y negra del multímetro van a cualquier borne. Tarjetas: Multímetro, Registro (Preparación / En clase), Gráfica (tensión de salida por condición del objeto), **Conexiones** (lista de cables = diagrama de conexión del montaje) y **Fichas** (datos de los cuatro modelos de G02).

**Estudio → Instrumentación Industrial → Unidad 2** suma tres clases junto a las tres de temperatura:

| Clase | Tipo | Contenido |
|---|---|---|
| G01 · experiencia 1: investigar y explicar | 5 preguntas | Señal discreta, hilos, inductivo, capacitivo, PNP/NPN. La búsqueda, la presentación grupal y el debate quedan como tarea propia: solo hay un cuadro opcional para planear la exposición, que no se evalúa. |
| G01 · experiencia 2: montar y medir | banco, 8 pasos | Alimentar, medir con y sin objeto, metal y plástico con el inductivo, repetir con capacitivo y fotoeléctrico, comparar con NPN y leer la propia tabla. |
| G02 · proximidad y PLC | banco, 7 pasos | Fichas de los cuatro modelos, detector asignado, medición con y sin objeto, conexión a X0 (ON con objeto, OFF sin él) y diagrama de conexión. Conclusión individual en «Mis observaciones». |

## Modelo físico (y sus límites)

- Detección: el **inductivo** solo detecta metal; el **capacitivo** y el **fotoeléctrico** (difuso) detectan metal y plástico. Dentro del alcance (borde incluido) detecta; fuera no. Salida normalmente abierta.
- Salida: PNP conecta OUT a +V al detectar; NPN la conecta a 0 V. Cuando no detecta, la salida queda abierta. Por eso un NPN medido contra 0 V marca 0 V siempre, y los 24 V aparecen entre +V y OUT.
- Los cables son ideales y se resuelve la red completa: polaridad invertida (el detector no funciona), cortocircuito de la fuente y salida activa unida al otro riel se avisan en pantalla.
- Multímetro de 10 MΩ. Entrada de PLC genérica: resistencia de 3,3 kΩ entre X0 y COM, ON desde 15 V de diferencia. Con PNP el COM va a 0 V; con NPN va a +24 V; con el común equivocado la entrada no se activa.
- **Modelo genérico declarado, no un detector comercial.** Alcances 10 mm (inductivo y capacitivo) y 100 mm (fotoeléctrico). No hay corrientes de fuga, caídas de tensión, histéresis, límites de corriente ni protecciones, ni salida normalmente cerrada, ni detectores de 2 o 4 hilos.
- Los valores simulados son ideales; los reales los teclea el estudiante en «En clase». El programa no lee ningún instrumento y no mezcla ambos orígenes (registro, tabla, gráfica y CSV los distinguen).

## Modelos de G02: pendientes de ficha técnica

CR30-15DN, CR30-15DP, XS118BLPAL2 y BR100-DDT-P **no se simulan por sí solos**. La tarjeta Fichas parte vacía (marca, hilos, principio, salida, alimentación y distancia) y cada modelo aparece «pendiente de ficha técnica» hasta que el estudiante copia los datos de su manual. Entonces el banco lo simula como detector genérico de tres hilos con esos datos; con 2 o 4 hilos, salida que no sea PNP/NPN o distancia inválida, avisa que no lo simula. Los bornes, colores y distancias reales de esos modelos **no están en el programa** (ninguna fuente del banco los nombra; `qa/verify-detectors.mjs` lo comprueba). La entrada del PLC es genérica: faltan la identificación exacta de la maqueta Delta y sus bornes, y su compatibilidad sink/source.

## Qué se comprueba y qué no

- Los pasos de la práctica se comprueban contra el estado real del banco (cables, fuente, objeto, registros, entrada del PLC), no contra un clic. Un registro «real» nunca cumple un paso de preparación.
- **No se evalúa** si lo escrito en las fichas coincide con el manual, ni las respuestas abiertas, la exposición, el diagrama presentado al docente ni la conclusión individual. La clase solo confirma que existen y cuenta los cables.
- La demostración al docente de G02 sigue siendo presencial. No energizar equipos reales basándose en el simulador.

## Archivos

Nuevos: `src/lab/DetectorsView.tsx`, `src/lab/detectors/` (`physics.ts`, `state.ts`, `geometry.ts`, `BenchScene.tsx`, `DetectorEditor.tsx`, `DetectorChart.tsx`), `src/learning/detectorLessons.ts`, `src/study/DetectorLessonStudy.tsx`, `src/styles/detectors.css`, `public/estudio/instrumentacion/guia-detectores-g01.docx` y `guia-proximidad-plc-g02.docx` (copias idénticas de las guías recibidas), `qa/verify-detectors.mjs`, `qa/verify-detectors-ui.cjs`.

Modificados (cambios pequeños): `src/lab/model.ts`, `LaboratoryApp.tsx`, `LaboratoryBar.tsx`, `HomeTools.tsx`, `src/study/classCatalog.ts`, `CourseOutline.tsx`, `StudyHub.tsx`, `TemperatureLessonStudy.tsx` (solo se exporta `QuizBlock`), `src/styles/tool-lessons.css` (estilo del cuadro de notas), `package.json`, y la cuenta de clases de Unidad 2 en `qa/verify-temperature-ui.cjs` (de 3 a 6).

No se tocaron el panel, la protoboard, el solver DC, el PLC existente ni su almacenamiento: la entrada de PLC del banco es parte del propio banco y no lee ni escribe el PLC del laboratorio.

## Verificación

- `npm run check` y `npm run build`: sin errores.
- `npm run verify:detectors`: 38/38 (detección, PNP/NPN contra 0 V y +V, polaridad, cortocircuito, PLC con común correcto e incorrecto, fichas, guardado, CSV y reglas de cada paso de las lecciones).
- `npm run verify:detectors-ui` (servidor local en 4341): recorrido real en Chromium a 1440 px y 390 px con G01 experiencia 1, G01 experiencia 2 y G02 completas, regreso a Estudio, datos reales y simulados separados, CSV, recarga, guardado incompatible conservado y consola sin errores. Informe y capturas en `qa/detectores/`.
- Sin regresiones por esta entrega: `verify:temperature` 30/30 y `verify:temperature-ui` completo, `verify:lab` 38/38, `verify:data` y `verify-laboratory-ui.cjs` (contra 4341).
- Siguen fallando como antes de esta entrega: `qa/verify-modo.cjs` (altura de controles del inicio), `qa/verify-routes.cjs` (espera `.cade-controls`), y los ya listados en `ENTREGA_TEMPERATURA.md` (`verify-study-campus`, `verify-study-classes`, `verify-security`). No se investigaron.
- Mientras se trabajaba, otra sesión modificó el banco de temperatura (hojas de datos); esos cambios no son de esta entrega y se revisó que sus pruebas siguieran pasando al final.
- No se probó en un teléfono físico, con lector de pantalla ni a 1920 px. No hay aprobación visual del usuario. Los cables cruzan a veces los rótulos del banco; es solo estético.

## Pendiente

Fichas técnicas reales y bornes de los cuatro modelos de G02; identificación y bornes de la maqueta PLC Delta y su compatibilidad sink/source; confirmar con el docente el tipo de detector asignado a cada grupo y si usan normalmente abierto o cerrado; conferencias y otras guías de Instrumentación; repaso vinculado a conceptos fallados.
