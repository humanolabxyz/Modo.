# Estudio y preparación de la prueba del lunes 19 de octubre

Implementación local para presentar Estudio y dar prioridad a Álgebra/Funciones y Matrices, Unidad 2: funciones exponenciales y logarítmicas. No se publicó ni desplegó.

Entrada directa: http://127.0.0.1:4342/estudio?curso=s2-5&unidad=mtfm01-u2&clase=mtfm01-repaso-u2 .

## Resultado

- El inicio cambia «Estudiar protecciones» por **Estudio**, con descripción del espacio completo.
- Inicio, catálogo de Estudio y ramo de matemáticas destacan **Preparar la prueba · lunes 19 OCT**.
- La Unidad 2 se abre por defecto en Funciones y Matrices y admite enlaces directos mediante `unidad=mtfm01-u2`.
- Repaso con cinco temas: exponenciales, bacterias, eliminación, logaritmos y seguidores/tasas medias. Cada tema incorpora explicación, gráfica calculada con control de entrada y ejemplo resuelto.
- Diez preguntas de repaso con comprobación, pistas tras error, interpretación del resultado y filtro de pendientes. Se conserva coma decimal.
- El avance usa `modo:estudio:unidad2:v1`, independiente de Protecciones, GeoGebra y las 27 clases/90 pasos anteriores. Al regresar se propone el primer tema pendiente. Editar una respuesta retira su comprobación.
- Exportación de las respuestas del repaso a JSON. Es una exportación independiente del respaldo de clases anteriores; esta vista no incorpora importación de ese JSON.
- Los controles del laboratorio en el inicio se distribuyen sin superponer sus textos.
- Se conserva la interfaz neutra acordada: papel, gris, grafito y verde funcional.

## Fuentes incorporadas

| ID | Documento recibido | Páginas | Acceso |
|---|---|---|---|
| F37 | Actividad tecnológica 1 Funciones exponenciales | 6 | Actividad tecnológica 1 · Funciones exponenciales |
| F38 | Situación de modelación 1 Crecimiento de bacterias | 3 | Modelación 1 · Crecimiento de bacterias |
| F39 | ARPA 1 Eliminación de fármacos | 1 | ARPA 1 · Eliminación de fármacos |

Se guardan originales intactos en `analisis-materias-2026-10-17/fuentes/matrices/`, sus registros se añaden al inventario y se sirven como `public/estudio/fuentes/F37.pdf`, `F38.pdf`, `F39.pdf`. El registro total pasa de 44 a 47 fuentes. Los hashes se compararon con los tres archivos de Downloads. Se revisaron texto y páginas renderizadas para preservar exponentes, tablas y condiciones.

F20 (guía logarítmica) y F30 (seguidores) siguen disponibles con sus recorridos anteriores; el repaso añade accesos directos. Los comandos de ajuste en la guía exponencial se contrastaron con el manual oficial: [FitGrowth](https://geogebra.github.io/docs/manual/en/commands/FitGrowth/), [AjusteExp](https://geogebra.github.io/docs/manual/es/commands/AjusteExp/).

## Detalle docente señalado

F38, página 3, imprime el denominador `K + P₀(e^(rt) + 1)`. Con sus valores K=10000 y P₀=100, al evaluar en cero devuelve aproximadamente 98,0392, no P₀. Se muestra la discrepancia y se identifica por separado la variante con signo menos que sí conserva la condición inicial. También se distingue r=0,20 continuo del factor compuesto 1,20: para equivalencia exacta r=ln(1,2).

No se corrige el PDF ni se atribuye una pauta al profesor. La actividad 5 se deja para contrastar con el docente, sin calificar automáticamente esa decisión. La práctica de eliminación se presenta como el modelo matemático del enunciado, sin orientar una medicación.

El repaso es selectivo: diez comprobaciones no representan todas las preguntas de los cinco PDF ni una prueba oficial. El contenido completo permanece enlazado. Los problemas abiertos, la actividad 5 y los procedimientos de GeoGebra requieren su revisión correspondiente.

## Archivos

- `src/components/Home.tsx`, `src/styles/modo-home.css`: acceso Estudio, foco de prueba y distribución de herramientas.
- `src/study/studyFocus.ts`, `StudyFocusBanner.tsx`: acceso destacado compartido.
- `src/study/mathUnit2.ts`, `MathUnitReview.tsx`, `src/styles/study-focus-unit2.css`: materia, modelos de gráfica, práctica y persistencia independiente.
- `StudyHub.tsx`, `CourseOutline.tsx`, `classCatalog.ts`: integración de navegación y Unidad 2.
- Inventario, textos F37–F39, originales y `academic-sources.json`: fuentes verificadas.
- `qa/verify-unit2.cjs`, `verify:unit2`: verificación nueva. `qa/verify-academic.mjs` actualiza solo las dos expectativas de cantidad de fuentes a 47 y mantiene el control de hashes.

## Verificación

```powershell
npm install --ignore-scripts
npm run check
npm run build
npm run verify:academic
npm run verify:unit2
node qa/verify-academic-integration.cjs
```

Resultados en `qa/unidad2/verification.json`, `qa/estudio-ampliacion/models.json` e `integration.json`. La suite nueva cubre los tres originales, preservación de archivos principales, modelos contrastados con datos, acceso desde inicio, los cinco temas, diez respuestas, error/corrección, recarga, edición, exportación, rechazo de un avance desconocido, móvil 390/768 y repaso/PDF previamente consultado sin conexión.

Resultado final: instalación sin dependencias nuevas, TypeScript y build correctos; 13 grupos de modelos/preservación, 10 comprobaciones nuevas de Unidad 2 y 4 de integración aprobados. Las dos suites de navegador finalizaron con cero errores. Los 27 recorridos y 90 pasos académicos anteriores mantienen sus datos y sus modelos.

Capturas actuales: `qa/unidad2/inicio-desktop.png`, `repaso-desktop.png`, `bacterias-original.png`, `practica-desktop.png` y variantes móviles. La referencia anterior del inicio se conserva en `qa/modo/inicio-1440x900.png`. No se atribuye su diferencia completa a esta revisión: esa captura también antecede a cambios de Estudio ya realizados.

La fecha del destacado es una convocatoria concreta para el 19 de octubre de 2026; no es un calendario sincronizado. La validación táctil es emulada en Chromium, no una prueba en un teléfono físico. El alcance de la evaluación lo confirma el docente.
