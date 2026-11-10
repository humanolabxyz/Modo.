# modo. Agro · Etapa 5: tres experiencias sobre un único motor

10 de noviembre de 2026. Continuación autorizada con «ya vamos a la siguiente etapa», después del corte de la Etapa 4. Implementación local, pendiente de revisión. Sin commit, push ni despliegue. La Etapa 6 no se ha iniciado.

## Resultado

El asistente de creación ofrece **Aprendizaje**, **Construcción libre** y **Entorno real**. En un mundo abierto se cambia desde **Archivo**. El nombre de la experiencia aparece en el encabezado de escritorio y en la biblioteca de mundos.

| Experiencia | Piezas | Economía y montaje | Ayuda |
|---|---|---|---|
| Aprendizaje | Disponibles al instante | Sin cobros ni esperas | Comprobaciones informativas del mundo actual |
| Construcción libre | Disponibles al instante | Sin cobros ni esperas | Herramientas habituales |
| Entorno real | Requieren existencias | Compras, entregas y montaje existentes | Avisos e inspectores habituales |

Una política inmutable en `src/agro/world/experience.ts` centraliza estas diferencias. Las tres experiencias mantienen la misma sesión, identificador, terreno, instalaciones, conexiones, reloj, PLC y motores de simulación. No se crea una copia del mapa al cambiar de experiencia ni se añade un esquema de archivo nuevo.

Se conservan las reglas anteriores: al abandonar Entorno real las obras en curso quedan terminadas, porque los otros modos son inmediatos. La economía ya existente queda guardada; regresar a Entorno real recupera los fondos y pedidos, sin reiniciar el capital. Las piezas añadidas en libre/aprendizaje cuentan como colocadas al regresar al inventario real. Los precios y plazos siguen siendo ilustrativos del escenario.

## Aprendizaje

La guía comprueba equipo de riego, incidencias de apoyo y uniones separadas, bomba funcionando con caudal, agua en los aspersores, cultivo vivo, programa de tablero y avisos. Muestra causas proporcionadas por el motor cuando están disponibles: por ejemplo, el interruptor apagado del tablero que alimenta la bomba.

No impone secuencias ni bloquea colocar o conectar. Sus marcas describen el estado actual; encender, apagar o sembrar actualiza las comprobaciones. No otorga puntuaciones, guarda progreso artificial ni modifica parámetros científicos. «Localizar» lleva a la pieza y abre su inspector. La guía se cierra y se recupera desde Archivo. Su visibilidad se reinicia al abrir el mundo; no constituye progreso persistente.

El panel se oculta mientras se usa el editor de mapas, un inspector, Automatizar, Gestión o las vistas específicas de redes. En escritorio deja espacio al minimapa y dispone de desplazamiento interno. La vista móvil conserva los controles de construcción y permite recorrer la guía.

## Separación entre editor y partida

El contexto **Editar mapa** y las operaciones serializables de 4A–4F permanecen intactos. Un cambio de experiencia se rechaza mientras existe una previsualización pendiente de terreno o parcela; se debe aplicar o cancelar primero.

Aprendizaje no incorpora trabajos de trabajadores, tala, maquinaria ni obras de transformación física del terreno. Los sistemas de montaje e inventario anteriores siguen funcionando. No se han incorporado modelos de la biblioteca definitiva ni importación de terrenos reales.

## Archivos de esta etapa

- Nuevos: `world/experience.ts`, `world/learning.ts`, `ui/LearningPanel.tsx`, `qa/verify-agro-experience.mjs`, `qa/verify-agro-experience-ui.cjs`.
- Integración: `world/session.ts`, `ui/Workspace.tsx`, `ui/WorldWizard.tsx`, `ui/Lobby.tsx`, `ui/ManagePanel.tsx`, `src/styles/agro-workflow.css`, `package.json`.
- La lógica de `economy/economy.ts` y su prueba `verify-agro-economy.mjs` no se modificaron.
- Los demás cambios locales corresponden a las etapas anteriores y permanecen sin descartar.

## Verificación

Los resultados y las capturas están en la carpeta de evidencia `agro-etapa5`, junto al paquete congelado de la Etapa 4.

- `npm install`, `npm run check` y `npm run build`: ejecutados satisfactoriamente. El build mantiene el aviso de chunks mayores de 500 kB; no se elevó el umbral ni se ocultó el aviso.
- `npm run verify:agro`: **327 comprobaciones aprobadas** (321 anteriores + 6 grupos de experiencias). La prueba de economía original pasó sin modificaciones.
- Prueba nueva del modelo: tabla de políticas, creación en los tres modos, ausencia de costes en aprendizaje, transición sin perder terreno editado, red conectada o cultivo, exportación/reapertura, economía y pedidos, rechazo durante previsualizaciones y guía sin escrituras.
- Prueba nueva de interfaz: creación de tres mundos desde el asistente; cada creación añade exactamente uno. El mismo cuarto mundo cambia entre las tres experiencias, conserva su economía y reaparece correctamente tras recargar. Cierre, reapertura y localización desde la guía; editor e inspector; escritorio 1440 × 900 y móvil emulado 390 × 844. Consola y HTTP sin errores en esta prueba.
- Revisión visual directa de las capturas de escritorio y móvil, además de las comprobaciones de límites y desborde.
- Regresión general `verify-agro-ui.cjs`: **54 bloques aprobados**, sin errores de consola ni respuestas 4xx/5xx. El aviso anterior de transición no se produjo en esta ejecución; la prueba conserva su comprobación estricta de errores.
- Regresión adicional `verify-agro-editor-ui.cjs 4F`: previsualizar, cancelar, aplicar parcela cóncava, deshacer/rehacer, persistir y recargar; selección del interior y exclusión de la concavidad; editor móvil. Aprobada, sin errores de página.
- `git diff --check`: aprobado.

## Pendientes anteriores, conservados por separado

- **1.118 llamadas de dibujo / 267.136 triángulos:** referencia de la Etapa 3, reconfirmada al cierre de la Etapa 4. No se presenta como una nueva medición de esta etapa. El desglose de equipos repetidos permanece en [la revisión visual de la Etapa 3](CONSOLIDACION_ETAPA_3_REVISION_VISUAL.md) para la integración de modelos de la Etapa 6.
- **`AbortError: Transition was skipped`:** diagnóstico anterior reproducido también en el build previo a la Etapa 3. La nueva prueba de experiencias no lo produjo. No se ocultó, filtró ni alteró el sistema general de transiciones. Véase [origen y evidencia](CONSOLIDACION_ETAPA_3_TRANSICIONES_Y_ENTREGA.md).
- Teléfono físico y otras GPU sin validar; móvil significa emulación en Chromium. Se mantienen las limitaciones de modelos ambientales provisionales, cambios perceptibles de densidad entre LOD y colisión al caminar contra construcciones.

## Entrega visual

`galeria.html` y `entrega-etapa5.zip` reúnen cinco capturas PNG originales: configuración, Aprendizaje, Construcción libre, Entorno real con compra y vista móvil de Aprendizaje. Incluyen el informe y el estado final de Git. El paquete de la Etapa 4 se conserva separado con sus 18 capturas y mediciones.

## Estado final de Git

Rama `agro-consolidacion`, HEAD `397848e5fde29b82c3c71fd393e5bfe48068b25b`, conservado. 38 archivos modificados y 35 sin seguimiento, acumulados de las etapas 2–5. Índice vacío. El detalle está en `git-final.txt`. No se creó ningún commit ni se ejecutó push o despliegue.
