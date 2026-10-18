# Corrección del motor dibujado · fuente docente

El usuario precisó que la observación correspondía al motor dibujado en el esquema. Se revisaron visualmente las láminas 3, 8, 13 y 15 del PDF entregado y las fotografías originales.

La lámina 3 explica corriente nominal, sobrecarga, cortocircuito y pérdida de aislación con una comparación conceptual y la foto de un motor gris. La lámina 8 presenta un contacto automático simplificado. La 13 aborda selección del guardamotor y la 15 plantea el cálculo del motor trifásico con casilleros por completar y una fotografía de banco azul. El circuito multifilar Q1/M1 añadido en V5 no aparece en esas láminas.

Se retiró ese circuito del código activo. La actividad de fallas y su práctica utilizan ahora `ProfessorFaultView.tsx`: comparación interactiva de las tres condiciones, imagen original de la lámina 3 y explicación de la aislación. La gráfica no introduce amperes, múltiplos ni tiempos. No se atribuyen bornes, PE, conexiones o placa al motor del profesor. Las fotografías existentes de otros temas no se modificaron.

El componente y estilo externos anteriores quedan archivados como referencia histórica en `qa/estudio-v5/`, fuera de `src/` y del bundle activo. La prueba `qa/verify-study-schematic.cjs` documenta aquella revisión; la prueba vigente para esta corrección es `qa/verify-study-professor.cjs`.

Archivos: nuevo componente y estilo `study-professor.css`; sustitución de importaciones en `QuickExperiment.tsx` y `Activity.tsx`; instrucción de la actividad alineada con la lámina 3; importación exclusiva en `src/pages/estudio.astro`. Se retiraron de `src/` el componente y estilo del circuito V5.

Verificación: `npm install`, `npm run check`, `npm run build`, `node qa/verify-study-professor.cjs` y `node qa/verify-study-focus.cjs`. La prueba específica comprueba tres condiciones, referencia al PDF, imagen original, ausencia del circuito externo, clasificación y corrección, cuatro anchos y hashes de preservación del panel práctico y los originales.

Evidencia: `qa/estudio-v6/verification.json`, cuatro capturas `materia-*.png` y láminas originales renderizadas. Comparación visual: `qa/estudio-v5/corto-desktop.png` frente a `qa/estudio-v6/materia-1280.png`.

Trabajo local, sin publicar. Panel práctico, sus diagramas y Comparar intactos.
