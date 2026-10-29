# Unidades con botones y módulos del aula INACAP

Implementación local del 19 de octubre de 2026.

Se revisaron visualmente las cinco capturas originales F08, F09, F17, F28 y F36, ya conservadas en public/estudio/fuentes. F28 muestra módulos numerados dentro de Funciones y Matrices; las otras capturas presentan clases o actividades directamente bajo sus unidades. No se inventaron módulos para esos otros ramos.

## Cambios

- Botones de unidad con título completo, estado seleccionado y uso con teclado/tacto. El ramo mantiene su selector; el usuario pidió sustituir los de unidad.
- Ramo → unidad → módulo/grupo del aula → actividad en matemáticas.
- Unidad 1: Módulos 1, 2 y 3; Actividades formativas con los cinco enlaces originales de F27; Evaluación sumativa 1 como recurso pendiente.
- Unidad 2: Módulo 1 (Eliminación de fármacos, Exponenciales, Bacterias); Módulo 2 (Logarítmicas, Seguidores en Instagram); Actividades formativas con los cuatro problemas incorporados. Repaso identificado como apoyo complementario.
- Unidad 3: los tres módulos visibles en la captura, con su material pendiente.
- Unidad 4: Proyecto ABPro pendiente; prácticas de matrices identificadas como complementarias.
- Se conservan todos los IDs, contenidos, enlaces y claves de progreso. La propiedad materials sigue disponible; modules añade la organización y el orden del aula.
- Las URL guardan modulo; el regreso desde una clase o desde las URL antiguas de GeoGebra recupera la unidad y el módulo. Anterior/siguiente dentro de una clase de matemáticas recorre el módulo seleccionado.

## Archivos

src/study/mathCourseModules.ts, classCatalog.ts, StudyRoutePlanner.tsx, StudyClassContext.tsx, CourseOutline.tsx, StudyHub.tsx; src/learning/mathUnits.ts; src/styles/study-navigation.css. Pruebas: qa/verify-unit-modules.cjs y actualización de qa/verify-study-navigation.cjs. Comando añadido: npm run verify:unit-modules.

## Validación

- npm install, npm run check y npm run build correctos.
- qa/verify-unit-modules.cjs: nueve comprobaciones, cero errores de página. Jerarquía y orden contrastados con F28; todos los materiales existentes aparecen exactamente una vez; navegación, recarga, regreso, originales, pendientes y otros ramos.
- qa/verify-study-navigation.cjs: regresión de navegación, estados rojo/verde, última actividad y paneles de GeoGebra, sin cambiar el tamaño ni recrear el applet.
- Capturas revisadas a 1440, 820 y 390 px: qa/unit-modules/units-modules-*.png y formativas-*.png. Comparación previa: before-1440.png y before-390.png. Estas dos capturas previas proceden de la verificación de la intervención inmediatamente anterior.
- Pruebas locales sobre la versión compilada en 127.0.0.1:4345; versión de desarrollo en 4344. Móvil y tablet emulados, sin prueba física. Sin despliegue.
