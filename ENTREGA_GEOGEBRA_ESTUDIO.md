# GeoGebra y lecciones vinculadas a Estudio

17 de octubre de 2026. Implementación local sobre el proyecto existente. El usuario corrigió el alcance: integrar GeoGebra real, en lugar de crear una herramienta de álgebra propia.

## Resultado

GeoGebra Classic se abre en `/laboratorio?tool=geogebra` usando el cargador y la API oficiales. Conserva menú, herramientas, entrada, CAS y opciones de vistas. Es libre: no exige una lección para construir funciones, geometría o matrices. El ejemplo de matrices `A={{1,2},{3,4}}` y `M=A*A` se comprobó con el motor real.

Estudio → Funciones y Matrices contiene tres recorridos independientes:

| Fuente original | Actividades guiadas | Pasos |
|---|---|---:|
| Actividad tecnológica 1 Funciones polinómicas de grados 0 y 1 | Constante, recta, imagen, preimagen, ajuste por dos puntos, encuadre, cruce y comparación de ajustes | 8 |
| Actividad tecnológica 2 Funciones polinómicas de grado 2 | Parábola, imagen, preimágenes, puntos especiales, ajuste por tres puntos, cruces y ajuste por datos | 7 |
| Actividad tecnológica 2 Funciones logarítmicas | Bases, imagen, preimagen, cruces con cuadrática, corte horizontal y ajuste logarítmico | 6 |

Las actividades iniciales de abrir GeoGebra se resuelven con el propio acceso al banco. La numeración docente visible se conserva, incluida la actividad 10 de la guía lineal. Las copias públicas de los tres PDF son idénticas a los originales recibidos.

Cada clase contiene Comprender → Hacer en GeoGebra → Comprobar. En el momento de practicar, abre una guía junto a GeoGebra. El estudiante crea los objetos, solicita comprobación y recibe una explicación. El enlace de regreso recupera la clase y el momento; al terminar puede responder la comprobación conceptual y consultar sus notas.

La corrección usa objetos y resultados del GeoGebra real. No se marca completada una actividad solo por abrirla. Hay límites explícitos: el encuadre de ejes se revisa visualmente; las conclusiones y observaciones no reciben una evaluación automática de su razonamiento. Se comprueban las construcciones y resultados concretos definidos por cada paso; los puntos de referencia de logaritmos no constituyen una demostración simbólica de identidad de funciones.

## Conservación y archivos

Cada lección y el archivo libre utilizan espacios de guardado diferentes. El cambio de herramienta solicita guardar antes de desmontar GeoGebra. Se puede descargar y abrir `.ggb`. Las notas y avances tienen claves versionadas independientes del estudio de Protecciones y de la biblioteca eléctrica. Un guardado incompatible se conserva sin sobrescribirlo.

No se modificaron las implementaciones del panel, protoboard, solver DC, motor PLC ni el almacenamiento eléctrico. Se añadió la opción GeoGebra a las herramientas y se adaptó la cuadrícula de accesos del inicio para mantener los seis enlaces legibles.

Los módulos nuevos son `src/learning/geogebraLessons.ts`, `src/lab/GeoGebraView.tsx`, `src/lab/geogebra/api.ts`, `src/study/ToolLessonStudy.tsx` y sus estilos. Se conectan mediante los catálogos, `StudyHub`, `CourseOutline`, `LaboratoryApp`, `LaboratoryBar` y `HomeTools`. Los respaldos previos están en `qa/geogebra/before/`.

El motor se monta en `public/geogebra-frame.html`. La política de ese documento permite los recursos oficiales y los scripts inline generados por GeoGebra, además de compilación WebAssembly; no habilita `unsafe-eval` general. Las cinco páginas principales conservan su política de scripts propios y hashes exactos. `astro.config.mjs` aplica esta excepción exclusivamente al marco, y `vercel.json` permite enmarcar ese archivo solo desde el mismo origen; las otras rutas mantienen `DENY` y `frame-ancestors 'none'`. No se realizó un despliegue.

## Alcance y dependencias

GeoGebra se carga bajo demanda desde su servicio oficial y necesita Internet. El resto del laboratorio mantiene sus herramientas existentes. No se añadió otro sitio ni se publicó el proyecto. El guardado es local al navegador y no sincroniza dispositivos. Archivos de más de 3 MB deben abrirse desde el menú de GeoGebra; el guardado local de este módulo limita la representación a 4 millones de caracteres y avisa si falla o excede la capacidad.

La unidad de matrices permanece pendiente de sus fuentes docentes: GeoGebra ya permite trabajar matrices libremente, pero no se inventaron lecciones oficiales de esa unidad. Tampoco se adaptaron todavía todas las situaciones de modelación, extensiones u otros ramos al nuevo puente.

## Verificación

`npm install --no-audit --no-fund`, `npm run check`, `npm run build`, `npm run verify:data` y `npm run verify:lab`. El modelo del panel conserva 94 IDs activos y las correcciones previas; los 38 casos del laboratorio eléctrico pasan.

La prueba `npm run verify:geogebra` usa Chromium con el GeoGebra real, sin sustituir el motor por un mock. Revisa las 21 actividades mediante la interfaz, rechazo de un trabajo incorrecto, avance/recarga, notas, regreso a Estudio, comprobación conceptual, separación de archivos, matrices libres, descarga `.ggb`, conservación de datos anteriores, apertura de Protecciones/panel/protoboard, móvil emulado de 390 px, acceso a los controles inferiores y recuperación ante un fallo deliberado de red. También conserva un guardado deliberadamente incompatible. Los errores de red del caso provocado se registran separados de los errores de aplicación.

Informe y capturas: `qa/geogebra/verification.json` y PNG de la misma carpeta. Las capturas se toman después de terminar la apertura, no durante la animación. Se verificó escritorio y emulación móvil; no se afirma una prueba en un teléfono físico ni aprobación visual del usuario.

`node qa/verify-geogebra-security.cjs` verifica además la separación de políticas y ejecuta GeoGebra/CAS con cabeceras de `vercel.json` emuladas localmente. Comprueba que una inyección de script en la página principal sigue bloqueada. Su informe está en `qa/geogebra/security.json`. Esa emulación no equivale a comprobar las cabeceras de un despliegue real. La batería funcional utiliza movimiento reducido y deja terminar las navegaciones antes de sustituir una página por otra. Con movimiento completo y navegación automatizada muy rápida se observaron cancelaciones nativas «Transition was skipped»; las animaciones no se modificaron ni se declaran auditadas en esta entrega.

Para repetir sobre un servidor local: iniciar `npm run dev -- --port 4341` y ejecutar `npm run verify:geogebra`. Para otro origen configurar `PANELLAB_URL`.

Referencias técnicas: [integración oficial](https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_Embedding/), [API](https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_API/) y [parámetros](https://geogebra.github.io/docs/reference/en/GeoGebra_App_Parameters/).
