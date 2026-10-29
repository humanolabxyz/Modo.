# Estudio unificado — 18 de octubre de 2026

La misma experiencia de navegación y lectura conecta las clases académicas, el repaso de Álgebra, GeoGebra, temperatura, detectores y Protecciones.

## Cambios

- `StudyClassContext.tsx`: contexto Estudio → ramo → clase; selector de clases, anterior/siguiente y regreso a la unidad correspondiente. Se usa también dentro del recorrido original de Protecciones.
- `StudySequence.tsx`: controles compartidos **Entender → Ver un ejemplo → Practicar**. Las prácticas de banco añaden **Comprobar**. Los avances y las condiciones de aprobación originales se mantienen.
- `StudyActivityProgress.tsx`: presentación común del avance de las actividades con herramientas.
- `ToolTeaching.tsx`: el ejemplo se controla desde el mismo recorrido de la clase. `lectura=ejemplo` conserva esa vista al recargar y permite volver mediante el historial del navegador.
- `AcademicLessonView.tsx`: «Usar en clase» conserva la práctica y el cuaderno al avanzar; «Repasar errores» abre la práctica; volver a «Aprender paso a paso» abre la explicación.
- `MathUnitReview.tsx`: la práctica sigue el tema seleccionado. Una opción explícita permite practicar todos los temas de la unidad. Cambiar de tema mantiene la etapa de estudio.
- `study-unified.css` y estilos de lectura: mismo marco, jerarquía, controles y paleta neutra; verde funcional. Los selectores internos y las áreas de lectura también se comparten con los bancos. Se corrigió el desborde del menú de Protecciones en móvil.
- `.vercelignore`: el archivo de análisis queda fuera del despliegue. Las fuentes públicas registradas se mantienen dentro de `public/estudio/fuentes/`.

## Publicación

- Sitio: https://modo-lab.vercel.app/estudio
- Repaso Unidad 2: https://modo-lab.vercel.app/estudio?curso=s2-5&unidad=mtfm01-u2&clase=mtfm01-repaso-u2
- Equipo/proyecto verificados: `humanolabxyz-9765s-projects/modo-lab`, `prj_tqclHzAbuZzPqfAwvDETHjG8sa7L`.
- Despliegue final: `dpl_EVpBdxvTmydUJkavr6WRgc6xM4KK`, producción, READY.
- Origen: checkout local con cambios, basado en `a66b038`. No se creó ni se publicó un commit Git.
- Se preparó producción sin asignar el dominio principal, se contrastaron sus estilos con el build probado y después se promovió ese despliegue.

## Verificación

- `npm install --ignore-scripts`: dependencias al día, cero vulnerabilidades informadas.
- `npm run check` y `npm run build`: correctos.
- `npm run verify:academic`: 13 grupos; 47 fuentes y preservación de modelos/datos.
- `qa/verify-academic-ui.cjs` con `PANELLAB_URL=http://127.0.0.1:4342`: 27 clases, 90 pasos, errores/corrección, cuaderno, taller, cinco desafíos, respaldo, teclado y móvil.
- `npm run verify:study-teaching`: explicaciones, ejemplos, controles visuales, teclado y movimiento reducido.
- `npm run verify:unit2`: diez preguntas, fuentes nuevas íntegras, persistencia, versión incompatible, móvil y consulta sin conexión.
- `qa/verify-academic-integration.cjs`: tacto emulado, accesos a herramientas, Protecciones y consulta sin conexión.
- `qa/verify-study-interface.cjs`: seis grupos; lectura visible en escritorio y comprobaciones a 390, 768 y 1280 px.
- `npm run verify:study-unified`: seis grupos en local y en producción; navegación entre clases, ejemplos recuperables, modos, seis experiencias a 390/768 px y cero errores de consola.
- `qa/verify-study-release.cjs`: cinco rutas públicas, seguridad, bundle publicado, 47 fuentes, hashes de los tres PDF nuevos y service worker.

Capturas locales: `qa/estudio-unificado/`. Capturas y reporte del dominio público: `qa/estudio-unificado/produccion/`. Registro HTTP y documentos: `qa/estudio-unificado/production-release.json`.

La prueba histórica `verify:modo-preservation`, limitada a una antigua tarea de marca, no pasa con su snapshot antiguo de cambios concurrentes (`App.tsx`). No se modificó ese snapshot para ocultar el resultado. La preservación de esta entrega se comprobó contra `qa/estudio-diseno/before-hashes.json` y mediante las pruebas académicas e integración actuales; esos hashes coinciden.

## Límites conservados

El progreso se guarda en el navegador y mantiene sus formatos existentes; no hay sincronización entre dispositivos. GeoGebra sigue necesitando conexión. Los modelos no acreditan mediciones físicas ni revisión docente. El alcance de la prueba y la discrepancia de la fórmula de F38 conservan sus notas originales en el repaso.

