# modo. Industria — cierre de la versión Beta (v2.18.0)

Documento de cierre del módulo. Resume qué es, cómo está construido, cómo se prueba, qué quedó resuelto de los pendientes de cada fase y qué **no** está hecho. Las entregas por fase están en `ENTREGA_INDUSTRIA_FASE2.md` … `FASE10.md` y la auditoría inicial en `docs/industria/FASE1_AUDITORIA.md`.

## Qué es

Un laboratorio industrial 3D dentro de modo.: se colocan piezas, se montan en rieles y placas con anclajes, se cablean terminales, se simula la lógica del circuito (con PLC en escalera y HMI), se mide con un multímetro, se genera la documentación técnica y se practica el diagnóstico de fallas, con tres modos pedagógicos (Libre, Aprendizaje, Prueba) y cuatro actividades evaluables. Ruta: `/industria/` (Beta, detrás de la misma contraseña que Robótica).

## Arquitectura (resumen)

Un solo **modelo de proyecto** (`src/industria/model/`, formato `modo-industria` v4 con migraciones 1→2→3→4) con ids estables y relaciones separadas: **montaje** (físico), **conexión** (netlist), **asociación** (lógica) y datos aparte para **pose 3D**, **símbolos** del diagrama, **programa PLC**, **HMI**, **fallas** y **actividad**. El estado de interfaz (cámara, paneles, selección) vive aparte (`model/ui.ts`). Toda la lógica es **pura** (sin React) y se prueba en Node:

| Capa | Carpeta | Contenido |
|---|---|---|
| Modelo | `model/` | tipos, validación, migración, comandos con confirmación, biblioteca, historial de 50 pasos, modos |
| Construcción | `build/` | formas y anclajes, vista previa alineada, deslizamiento, interferencias, grupos rígidos |
| Catálogo | `catalog/` | 16 piezas genéricas con terminales, estado y procedencia; búsqueda |
| Cableado | `wiring/` | redes, validación topológica, estado de cada cable |
| Simulación | `sim/` | propagación lógica, mandos, multímetro, PLC, ejemplos |
| PLC / HMI | `plc/`, `views/` | escalera, variables, escaneo, pantalla de operador |
| Diagramas / tablero / docs | `diagram/`, `board/`, `docs/` | esquema funcional, alzado a escala, documentación y exportaciones |
| Fallas / actividades | `faults/`, `activities/` | inyección, diagnóstico, comprobaciones por comportamiento, entrega |
| Escena y UI | `scene/`, `IndustriaApp.tsx`, `views/` | escenario R3F (carga diferida) con formas reales por tipo de aparato (`models.ts`), cables con grosor enrutados (`wiring/route.ts`), paneles, vistas, editor de actividades, sonido (`sound/`) |

Se **reutilizó** de la plataforma: `FloatingWindow` (con una propiedad nueva y opcional, `cascade`, sin efecto en los demás módulos), las clases `rb-*` y la identidad de Robótica, el patrón de biblioteca/historial de Robótica, su matemática de cuaterniones, el service worker y la CSP por página. **No** se reutilizaron `solveDC`, el multímetro ni el PLC del Laboratorio (acoplados a sus equipos y a valores de componentes que el catálogo genérico no tiene; decisión de la auditoría de la fase 1).

## Reglas que se mantuvieron en todas las fases

- **Sin datos inventados**: todo el catálogo es «Genérico · no verificado», sin fabricantes ni referencias. Una pieza solo puede ser «Verificado» con fuente y fecha (lo exige una prueba). Hoy ninguna lo es.
- **Sin cálculo eléctrico**: la simulación es lógica (energización, contactos, estados). No hay corrientes, caídas de tensión, arranques ni protecciones. Los valores del multímetro son los que configura quien simula y se rotulan así.
- **Los supuestos son visibles**: `SIM_ASSUMPTIONS`, el panel «Qué simula y qué no», los textos del catálogo y de cada exportación.
- Montaje, conexión y asociación nunca se mezclan; borrar con dependencias pide confirmación; todo cambio es un paso de historial.

## Cómo se prueba

```bash
npm run verify:industria                      # todo: tipos, build, 15 grupos de modelo en Node y 15 de interfaz sobre el build de producción
npm run verify:industria -- --no-build        # sin recompilar
npm run verify:industria -- --only node       # solo la lógica (≈5 s)
```

Estado al cierre: **32 de 32 grupos en verde, 309 comprobaciones**. Las pruebas de interfaz usan Playwright con ratón y toques reales sobre el build de producción con su CSP real y exigen **cero errores de consola, de JavaScript, de CSP y de HTTP**. Playwright se carga con `qa/lib/playwright.cjs` (paquete del proyecto, `PLAYWRIGHT_MODULE` o el de Codex); no se añadió como dependencia (decisión pendiente del proyecto).

| Tipo | Qué cubre |
|---|---|
| Lógica (Node) | modelo y migraciones, anclajes, catálogo, cableado, simulación, PLC/HMI, diagramas, fallas y diagnóstico, documentación y alzado, actividades y modos, **endurecimiento** (ids peligrosos, inyección en CSV/Markdown, 600 proyectos mutados al azar sin una excepción) y **rendimiento** (≈300 piezas/700 cables en milisegundos; presupuesto del paquete) |
| Interfaz | carcasa, constructor, biblioteca, cableado, simulación, vistas 2D, documentación y fallas, modos, **pulido**, **adaptable** (390/768/1024/1440 px, 9 paneles y 6 vistas), **accesibilidad automática** (nombres, contraste AA, foco, Tab), **táctil** (eventos de toque reales por CDP), **sin conexión** (service worker) y **resiliencia** (escenario 3D que no descarga, sin WebGL, estado dañado, dos pestañas) |

## Rendimiento medido

Lógica con 301 piezas y 720 cables: validar 4 ms, evaluar 4 ms, simular 5 ms, diagnosticar 9 ms, documentación 15 ms. La simulación crece de forma lineal (×2,0 al duplicar los circuitos). **Carga inicial de `/industria/`: 127 KB de JavaScript y 38 KB de CSS (gzip)**; three y el escenario 3D (253 KB gzip) se cargan aparte, bajo demanda.

## Pendientes de cada fase: qué se cerró

| Fase | Pendiente | Estado |
|---|---|---|
| 2 | Contraseña de la Beta para `/industria/` | **Hecho**: misma compuerta y cookie que Robótica (`middleware.ts`), con prueba. Para quitarla basta eliminar las dos rutas de `config.matcher`. |
| 2 | Dependencia de Playwright en una ruta de Codex | **Parcial**: cargador portable; no se instaló como dependencia. |
| 2 | Uso sin conexión no verificado | **Hecho**: prueba con el service worker (166 archivos, recarga, simulación y guardado sin red). |
| 2 | `verify:security` y `verify:offline-travel` | `verify:offline` pasa; `verify:security` **sigue fallando** por un selector obsoleto de otra pantalla (`.modo-primary`), ajeno a Industria; no se tocó. Industria tiene sus propias comprobaciones de CSP, endurecimiento y exportaciones. |
| 2–9 | Teléfono y tablet **reales** | **No se puede cerrar desde aquí.** Se probó con emulación de teléfono/tablet, toques reales del navegador (CDP) y 4 tamaños; falta probar en un aparato físico. |
| 3 | Pieza montada que no se arrastra sin explicación | **Hecho**: aviso que explica cómo moverla. |
| 3 | Giro solo en pasos de 90° | **Parcial**: giro en grados X/Y/Z en el inspector; no hay gizmo de rotación en el escenario. |
| 3, 9 | Ventanas apiladas que se tapan | **Hecho**: paneles escalonados, altura limitada para no tapar el dock, verificados. |
| 4 | Panel Piezas estrecho | **Hecho** (300 px). Las familias sin piezas siguen vacías **a propósito** (no hay datos verificados). |
| 5 | Terminales pequeños con el dedo | **Parcial**: puntos más grandes con puntero táctil y aviso para acercar la cámara o usar el panel. |
| 5 | Cables sin grosor ni enrutado | **Hecho (fase 11)**: tubos con grosor que salen perpendiculares al terminal, rodean placas y piezas y no atraviesan ninguna (comprobado en los ejemplos); 540 cables en ≈0,2 s. |
| 6 | Sin animación del motor | **Hecho** (marcador que gira, respeta «reducir movimiento»). **Sonido hecho (fase 11)**: contactores, interruptores, pulsadores, disparo del relé y zumbido del motor con WebAudio; apagado por defecto. |
| 6 | Sin contactos NC, temporizadores, contadores ni térmicos | **Hecho (fases 10–11)**: pulsador NC; temporizador TON y contador CTU/reset en la escalera con reloj de simulación; relé térmico (se dispara a mano, **no** modela la sobrecarga). |
| 7 | Exportar o imprimir el diagrama, cruces y hojas | **Hecho (fases 10–11)**: SVG autónomo e impresión por hoja; esquema en hojas (Fuerza y Mando, y las que se creen) con referencias «→ hoja n · destino»; orden por vecinos que reduce los cruces (de 6 a 1 en el ejemplo con PLC). |
| 8 | Tablero con rótulos recortados y desplazamiento | **Hecho**: se ajusta a la pantalla y los aparatos angostos llevan el rótulo girado. |
| 8 | Impresión no verificada | **Hecho**: con medios de impresión solo queda el documento/esquema y el navegador genera un PDF real. |
| 9 | Accesibilidad no auditada | **Parcial**: auditoría automática (nombres, contraste AA, ids, foco, Tab) en 6 vistas y 9 paneles, con correcciones. **No** se probó con un lector de pantalla. |
| 9 | Solo cuatro actividades | **Hecho (fase 11)**: editor de actividades propias con comprobaciones como datos (montaje, estado tras una secuencia de mandos, variable del PLC, redes, sin errores) y exportación de una copia para alumnos sin cables, sin programa o sin montajes. |

## Defectos encontrados y corregidos en esta fase

Contrastes bajos (estado «Guardado», chip «DETENIDO», fila seleccionada, cabeceras de tabla); campo «Añadir» colapsado; con el dock más ancho, el panel Piezas lo tapaba; a 768 px el panel Piezas tapaba los botones de vistas (ahora arranca cerrado hasta 900 px); sin WebGL el aviso bloqueaba las vistas 2D; si el archivo del escenario 3D no se descargaba se caía toda la aplicación (ahora hay aviso con «Reintentar» y el proyecto sigue intacto); un `id` llamado `__proto__` o similar podía contaminar diccionarios del proyecto (ahora se rechaza); un nombre que empezara con `=`, `+`, `-` o `@` se interpretaría como fórmula al abrir el CSV exportado (ahora se neutraliza) y el Markdown exportado podía llevar HTML sin escapar.

## Límites conocidos (lo que Industria **no** es)

- No es un simulador eléctrico ni una herramienta de diseño certificable; no calcula valores reales y no sustituye documentación de ingeniería ni energiza nada real.
- No tiene cuentas, servidor ni envío de entregas: todo vive en el navegador (o en archivos `.industria.json`). Las fallas ocultas y la entrega de «Prueba» son una disciplina de uso, no una protección.
- El ErrorBoundary protege vistas, paneles y escenario, pero solo el caso del escenario 3D tiene prueba automática.
- No se probó en un teléfono ni una tablet reales ni con un lector de pantalla.

## Hoja de ruta sugerida (no comprometida)

1. Prueba en dispositivos físicos y con lector de pantalla.
2. Catálogo verificado: incorporar piezas con datasheet/norma/medición y fecha, para usar el estado «Verificado» (**requiere documentos de fabricante que no están en el repositorio; no se puede hacer inventando datos**).
3. Enrutado y grosor de cables; varias páginas de diagrama con referencias cruzadas; simbología normalizada (con licencia/fuente).
4. Temporizadores y contadores en el PLC; relés térmicos; sonido.
5. Editor/importación de actividades; informes para docentes.
6. Decidir si Playwright pasa a ser dependencia de desarrollo del proyecto.

## Fase 11 (v2.18.0): formas reales y funciones que faltaban

Formas 3D por tipo de aparato (carril omega con ranuras, interruptor con palancas, contactor, PLC con LED, motor con aletas y eje, pulsadores con cabezal, piloto con lente, placa con agujeros, red con tablero de bornes, relé térmico), un tornillo por terminal; cables con grosor y enrutado; temporizador TON y contador CTU en el PLC; relé térmico; sonido; hojas del esquema; editor de actividades; contraseña local en `.env.local` (el valor no se versiona) (ver `ENTREGA_INDUSTRIA_FASE11.md`).
**Siguen sin hacerse**: catálogo verificado (faltan documentos), prueba en dispositivos físicos y con lector de pantalla, simbología normalizada y modelo de sobrecarga.
