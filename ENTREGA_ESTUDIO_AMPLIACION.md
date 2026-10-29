# Continuación de Estudio · 18 de octubre de 2026

Revisión posterior de diseño y explicación previa a la acción: [ENTREGA_ESTUDIO_VISUAL.md](ENTREGA_ESTUDIO_VISUAL.md).

Implementación local sobre Astro/React y la interfaz modo. existente. No se publicó ni desplegó. Entrada: `/estudio`, en la vista previa local `http://127.0.0.1:4342/estudio` mientras ese servidor esté abierto.

## Qué se añadió

27 recorridos guiados con 90 pasos, vinculados a sus documentos originales. El catálogo reúne cinco ramos con contenido y conserva Administración como pendiente. Al sumar Protecciones, GeoGebra, temperatura, detectores y el repaso previos, hay 38 recorridos disponibles. Esto **no equivale a 38 clases académicas completas ni a toda la carrera**: algunas actividades son preparación conceptual y cuaderno de una práctica física; cada recorrido declara su alcance.

| Ramo | Nuevos recorridos | Alcance |
|---|---:|---|
| Instrumentación | 7 / 29 pasos | Fundamentos en siete bloques y Tarea 1; metrología con los dos ejercicios; caudal, presión, nivel, temperatura y proximidad |
| Electrónica | 7 / 23 pasos | Cinco clases, ajuste cero y Guía 1; tareas y laboratorios distinguidos en sus pasos y cuadernos |
| Máquinas | 3 / 10 pasos | Preparación CC/CA, relaciones línea/fase, sincronismo y arranque manual; acceso al panel libre en otra pestaña |
| Redes | 2 / 8 pasos | Codificación/errores/OSI y taller de cable con herramientas, continuidad, fallas y enlace lógico |
| Matemáticas | 8 / 20 pasos | Energía base/extensión, piedra base/extensión, servicio eléctrico, seguidores, Sueño dorado y stock |

Se copiaron 44 originales F01–F36/I01–I08 a `public/estudio/fuentes/` y se verificó su SHA-256 contra los inventarios recibidos. Se conservan títulos, duplicidades de numeración y formatos. Los tres DOCX de guías prácticas y los PDF de GeoGebra ya incorporados siguen accesibles desde sus actividades. Índices, temarios, rúbricas, resúmenes y evaluaciones son recursos de consulta: no se les asigna dominio al abrirlos. El material original pesa unos 33,8 MB y se solicita al abrirlo; no forma parte de la precarga inicial del service worker.

## Aprender y guardar

- Cada paso presenta explicación, referencia de páginas, acción o escena, pregunta, corrección y reintento. Navegar al paso siguiente no lo aprueba.
- El índice permite volver a cualquier paso y muestra las comprobaciones resueltas. La URL conserva ramo, clase y paso.
- «Repasar errores» lleva a comprobaciones intentadas y aún pendientes.
- «Usar en clase» ofrece explicación y cuaderno sin obligar a repetir el cuestionario. Las respuestas abiertas se guardan para revisión: no se califican por longitud ni por palabras clave.
- Los registros distinguen **medición física anotada** y **resultado simulado**; se registran condiciones, valor y unidad y se exportan en CSV. No se leen instrumentos físicos.
- «Desafío del ramo» añade tres preguntas de práctica con 20 variantes por ramo. Sus respuestas se guardan aparte de los pasos normales; no es un examen oficial.
- El respaldo de clases nuevas se exporta e importa desde Mis ramos. Una importación válida se presenta antes de reemplazar; las versiones desconocidas se rechazan. Un guardado incompatible no se sobrescribe al abrir ni navegar.

La nueva clave es `modo:estudio:academic:v1`. Protecciones, GeoGebra, temperatura, detectores, panel y laboratorio conservan sus claves anteriores. El respaldo nuevo incluye únicamente los recorridos nuevos; no promete sincronización ni reemplaza los respaldos propios de las herramientas existentes.

## Modelos y fidelidad

Los modelos son de apoyo didáctico y declaran sus condiciones: senoide pura, diodo de caída fija, NPN genérico por regiones, estados de puente H, AO estático con rieles, transformación afín, balance lógico de nivel, presión hidrostática, relación ideal de caudal DP, línea/fase y velocidad síncrona, codificación con convenciones explícitas, paridad y CRC-3. No se presentan como calibraciones de los componentes físicos.

Metrología conserva las 10 lecturas originales de cada tabla. Resultados revisados: temperatura media 98,82 °C, sesgo −1,18 °C y desviación muestral 0,10327956 °C; nivel media 1,497 m, sesgo −0,003 m y desviación muestral 0,01636392 m. Se acepta coma decimal. La media no sustituye al patrón y no se declara aptitud sin requisitos de tolerancia.

Matemáticas conserva los pares de las infografías de energía: F23 (1,1100),(2,1300),(3,1500), modelo 200x+900, consumo para $8300 = 37 kWh; F22 (2,1400),(5,1800), modelo (400/3)x+3400/3. Se contrastaron visualmente las imágenes originales. La piedra base usa −5t²+25t+40, máximo 71,25 m a 2,5 s; la extensión usa −5t²+30t+40, máximo 85 m a 3 s. Seguidores y stock usan sus tablas originales con ajustes logarítmico y polinomiales. Se mantienen las discrepancias de Servicio eléctrico, el dominio de cada modelo y las limitaciones de extrapolación.

### Taller de Redes

Permite seleccionar conductor y herramienta, preparar cubierta, pelar, estañar, ubicar, soldar y sujetar. La numeración conserva identidad al ver frente/cara de soldadura del DB9. Las operaciones cambian la topología: un extremo aislado o sin unir no conduce. El multímetro calcula recorridos por el grafo; un pitido en un pin incorrecto no aprueba la correspondencia. Hay hilo abierto, pin equivocado, puente y unión intermitente reproducible mediante flexión. La comprobación requiere tres recorridos y tres pruebas de aislamiento de la revisión actual del cable.

La referencia del **lado HMI** es DOP-107EG, COM2 MODE2 (RS485): 1 D+, 6 D−, 5 GND. El extremo T1/T2/T3 es una bornera **genérica de ensayo**, no los bornes confirmados del PLC del aula. La alimentación del equipo es independiente y no se conecta a los pines de datos del taller. Fuente primaria contrastada: [manual oficial Delta, asignación de puertos](https://filecenter.deltaww.com/Products/download/06/060302/Manual/DELTA_IA-HMI_DOP-107EG_TC-SC-EN-TUR_20191016.pdf).

El enlace HMI–PLC añadido es lógico: requiere cable válido, baud y dirección iguales. Marcha/paro cambia una salida; perder compatibilidad la detiene. No emula RS485 eléctrico, Modbus, un PLC DVP-SX2 completo ni la carga de proyectos DOPSoft/ISPSoft. No utiliza la memoria compartida del laboratorio como prueba de comunicación física. Las operaciones de soldadura son estados didácticos, sin simular su física térmica o certificar destreza manual.

Otras precisiones conservadas: [L293D TI](https://www.ti.com/lit/ds/symlink/l293.pdf), 600 mA continuos bajo condiciones de ficha; [SI BIPM](https://www.bipm.org/documents/d/guest/si-brochure-9-2_01), conversión Celsius/Kelvin de 273,15. No se convierte una pauta contradictoria en respuesta automática.

## Archivos

- Catálogo/navegación: `src/study/classCatalog.ts`, `courseCatalog.ts`, `CourseOutline.tsx`, `StudyHub.tsx`.
- Clases y modelos: `academicContent.ts`, `academicModels.ts`, `AcademicLessonView.tsx`, `AcademicScenes.tsx`, `CableWorkshop.tsx`.
- Persistencia y desafíos: `academicState.ts`, `AcademicBackup.tsx`, `academicChallenges.ts`, `AcademicChallenge.tsx`.
- Estilo local: `src/styles/academic.css`. Escenas y taller se cargan al abrir un recorrido nuevo mediante importación diferida.
- Fuentes: `src/study/content/academic-sources.json`, `public/estudio/fuentes/` y `qa/prepare-academic-sources.py`.
- Pruebas: `qa/verify-academic.mjs`, `qa/verify-academic-ui.cjs` y scripts `verify:academic` / `verify:academic-ui` en `package.json`.

## Verificación y capturas

Resultados reproducibles en `qa/estudio-ampliacion/`: `models.json`, `ui.json`, respaldo descargado, CSV, hashes de preservación y capturas antes/después. Los hashes del panel, su cableado, simulación, solver, modelo del laboratorio y guardado antiguo de Protecciones se comparan con el inicio de esta entrega.

```powershell
npm run check
npm run build
npm run verify:academic
$env:PANELLAB_URL='http://127.0.0.1:4342'
npm run verify:academic-ui
node qa/verify-academic-integration.cjs
```

Resultado final: `check` y `build` correctos; **13 grupos de comprobaciones de modelos/preservación**, **12 comprobaciones de navegador** y **4 de integración** aprobados. `ui.json` e `integration.json` registran cero errores de aplicación. La suite completa se ejecutó contra el build estático en 4342. Un recorrido intensivo previo de muchas recargas en Vite agotó recursos de Chromium (`ERR_INSUFFICIENT_RESOURCES`); al usar el build estático pasó el recorrido completo, sin ocultar errores de aplicación ni cambiar expectativas para aprobarlo.

La prueba adicional usa tacto emulado a 390 px y comprueba el control, selección y respuesta. También verifica los accesos previos a GeoGebra, G03, G01 y repaso, los ocho temas de Protecciones y la recuperación **sin conexión** de una clase, su escena, avance y un PDF consultado previamente. Abrir Estudio directamente por primera vez sin conexión no descarga mágicamente contenido: el service worker se instala al visitar Inicio y los originales grandes se cachean al consultarlos.

También se ejecutan las pruebas existentes de datos, temperatura (37), detectores (44), laboratorio (38) y cableado. Los scripts históricos de campus/clases que exigen cero clases de Electrónica o solo Protecciones disponible corresponden a estados anteriores del producto; la prueba nueva comprueba el catálogo ampliado y la preservación real. No se cambian esos snapshots para aparentar que describían esta entrega.

La revisión funcional del navegador cubre las 27 clases/90 pasos, respuestas incorrectas y corrección, escenas, herramientas de fabricación, continuidad y fallas, guardado/recarga, registros físicos/simulados, CSV, desafíos, respaldo y rechazo de versiones desconocidas. Las pantallas se revisan a 1440, 768 y 390 px, con pruebas de teclado. No equivale a aceptación visual del usuario, ensayo en teléfono físico ni validación de equipos reales.

Capturas comparativas: [antes escritorio](qa/estudio-ampliacion/antes-desktop.png), [después escritorio](qa/estudio-ampliacion/despues-desktop.png), [antes móvil](qa/estudio-ampliacion/antes-movil.png), [después móvil](qa/estudio-ampliacion/despues-390.png), [taller](qa/estudio-ampliacion/taller-redes-desktop.png).

## Lo que sigue pendiente

| Pendiente | Motivo concreto |
|---|---|
| Administración y unidades sin documentos | No se recibieron sus fuentes; no se inventa el programa |
| P&ID completo y guías adicionales | Las etiquetas de los ejemplos no sustituyen los planos y las consignas faltantes |
| Réplica física completa de Redes | Confirmar equipo/puerto y bornes PLC; faltan los proyectos `.dpa` y `.isp` referidos por la guía |
| Curvas de motores CC/CA/monofásicos del banco EMS | Faltan parámetros y condiciones confirmadas; las relaciones ideales nuevas no completan sus tablas experimentales |
| Montaje completo de AO y componentes de fabricante | El modelo estático no simula LM741 real, dinámica, MOSFET ni todos los instrumentos de las prácticas; Proteus y la revisión del esquema siguen siendo parte de la consigna |
| Contradicciones docentes | F07 rango 150/200 °C; F11 motor serie sin carga; F12 placa/conexión; F15 desarrollo que cambia enunciado; ajustes y datos físicos ya registrados en el análisis |
| Revisión de respuestas abiertas y evidencia física | El cuaderno conserva el trabajo; la evaluación docente no se automatiza de forma ficticia |

La integración de fuentes y los recorridos nuevos están implementados. La cobertura académica y los bancos físicos completos **siguen siendo parciales** en los puntos anteriores.
