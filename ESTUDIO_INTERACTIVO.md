# Estudio: ramos, unidades y clases independientes

Cambios locales del 17 de octubre de 2026. Entrada en `/estudio/`.

- Nueva pantalla para elegir materia, buscar ramos o temas y filtrar por semestre.
- Entrada «Mis ramos» con las seis asignaturas y códigos de la captura aportada por el usuario: Electrónica Aplicada a la Automatización (AREA02), Redes Industriales (ARRI02), Control de Máquinas Eléctricas Rotativas (ARCM02), Administración (ATAN01), Funciones y Matrices (MTFM01) e Instrumentación Industrial (ARII02). Se respeta el orden de la captura. No se importan los porcentajes de INACAP ni se presentan como progreso de esta app.
- Entrada simplificada: título «Mis ramos», buscador y seis tarjetas compactas. Se retiraron la presentación, portadas grandes, textos repetidos y las pestañas de la entrada.
- Al abrir un ramo se mantienen sus unidades, clases y actividades. Cada material tiene un ID propio y conserva su lugar en el orden del aula.
- Electrónica reproduce lo visible en la segunda captura del usuario: tres unidades; en la primera, Clase 1 a Clase 5, Ejercicio 1 y Guía 1. Los PDF y el detalle de las unidades cerradas siguen pendientes. Los estados «Hecho» del aula no se copian.
- «Más opciones» agrupa los filtros de disponibilidad y semestre y el acceso a la malla completa de 48 ramos de referencia. La captura confirma los seis ramos actuales, no todo el plan de ingreso.
- Protecciones eléctricas es el único material de clase con recorrido interactivo disponible; se ubica en Control de Máquinas Eléctricas Rotativas, en «Material de clase disponible». Su unidad y número de clase no se conocen. No se crea una Unidad 1 ni un número de clase arbitrario.
- Los ocho temas de Protecciones permanecen dentro de una sola clase vinculada a su PDF. Se muestra cuántos temas se revisaron, acceso al original y «Empezar/Continuar/Repasar clase». El inicio propone el tema actual no revisado o el primero pendiente del material.
- Lecciones con explicación y recurso visual juntos; en móvil el recurso precede a la explicación. Se reutilizan las actividades, experimentos y evaluaciones existentes.
- Herramientas compactas, navegación de vuelta a Materias y enlaces directos con `?tema=ID&vista=lesson`. Atrás/Adelante del navegador conservan el recorrido.
- Calculadora y fórmulas conservadas, con su acceso en el flujo para evitar tapar la lectura.
- Progreso, importación y exportación mantienen el formato y clave originales. El catálogo no inicia lecciones automáticamente.

## Malla y límites del contenido

Fuente consultada y contrastada visualmente, página 3:

https://digital.inacap.cl/pdf_mallas/TECNOLOGIA-APLICADA/AUTOMATIZACION-Y-ROBOTICA/AUTOMATIZACION-Y-ROBOTICA-AR-ARO-2-IR-IRA-2-2026.pdf

El buscador y el nombre del archivo dicen 2026, pero el documento servido el 17/10/2026 indica «Mallas válidas para el período de matrícula 2027». Por eso la interfaz identifica la referencia como **2027**, pendiente de contrastarla con el plan de ingreso del usuario. Semestres 1–4 corresponden al tramo Técnico; 1–8 a Ingeniería. No se interpreta la malla como prerrequisitos ni como programa detallado de cada asignatura.

Los otros 47 ramos no tienen lecciones interactivas disponibles: muestran material pendiente o su índice conocido. El catálogo completo no significa que esos cursos estén desarrollados. Para incorporarlos faltan los programas, unidades y material del usuario/docentes, y su correspondiente contenido visual y ejercicios. No se añadió generación automática de cursos ni integración con cuentas INACAP.

## Incorporar una clase sin mezclar fuentes

Se requiere el archivo original de cada clase, ejercicio o guía. Cada clase se transforma por separado: inventariar páginas y apartados; relacionarlos con explicaciones, ejemplos, acciones y preguntas; mantener explícito cualquier apartado aún pendiente de transformar. No se considera un resumen de varios PDF como una clase completa. La captura confirma nombres y orden, no el contenido de esos archivos ni que esté cubierto por el material de Protecciones.

## Archivos de implementación

- `src/study/courseCatalog.ts`: malla, semestres y disponibilidad.
- `src/study/classCatalog.ts`: unidades y materiales separados, con relación entre el PDF y sus temas.
- `src/study/CourseOutline.tsx`: índice de unidades/clases y recorrido de cada material disponible.
- `src/study/StudyHub.tsx`: entrada, búsqueda, filtros y elección de tema.
- `src/study/StudyApp.tsx`: integración, navegación y continuidad.
- `src/study/GuidedLesson.tsx`: recurso visual durante las explicaciones.
- `src/styles/study-campus.css`: estilos exclusivos de Estudio.
- `src/pages/estudio.astro`: estilos y metadatos.

## Verificación

`npm install`, `npm run check`, `npm run build`.

`node qa/verify-study-campus.cjs` (servidor en `http://127.0.0.1:4341`; configurable mediante `PANELLAB_URL`).

`node qa/verify-study-classes.cjs`: orden de las clases, separación entre clase/ejercicio/guía, ausencia de progreso inventado, PDF original y recorridos de unidad/clase en cuatro tamaños. Evidencia y referencia en `qa/estudio-clases/`.

El script comprueba filtros, búsqueda, estados sin contenido, clasificación con errores y corrección, persistencia, ocho retos, herramientas existentes, navegación, ausencia de desbordes y errores del navegador. Comprueba hashes de los archivos previos de `src/` fuera de los tres editados. La prueba incluye móviles emulados de 320/390 px y escritorio de 768/1440 px; no reemplaza una prueba en teléfono físico ni la aprobación visual del usuario.

Capturas y reporte: `qa/estudio-campus/`. Respaldo de los archivos editados y hashes previos en esa carpeta. No se modificó ni publicó el simulador.

La entrada simple tiene respaldo en `qa/estudio-simple/`. La navegación por clases tiene respaldo de sus archivos previos en `qa/estudio-clases/before/`. La lógica de las lecciones existentes permanece igual.
