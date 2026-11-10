# modo. Agro · Etapa 4: herramientas de edición del terreno

Fecha: 10 de noviembre de 2026. Implementación local de 4A a 4F, verificada progresivamente. Pendiente de revisión del usuario. No se inició la Etapa 5 ni se hicieron commits, push o despliegues.

Continuación posterior autorizada: la Etapa 5 se documenta por separado en [su informe](CONSOLIDACION_ETAPA_5.md). El paquete visual de esta Etapa 4 conserva el corte anterior.

## Punto de partida: Etapa 3

Antes de modificar el editor pasaron las 312 comprobaciones de modelo existentes y la revisión de cámaras: seis territorios, cuatro esquinas, seis posiciones de superficie y 48 barridos estratégicos en escritorio/vertical móvil. Se conservaron el perímetro compartido entre LOD, el horizonte refinado, la atmósfera y la comprobación de cámara contra la malla exterior.

Al terminar, el mismo escenario de referencia de 150 entidades y 10 parcelas conserva **1.118 llamadas y 267.136 triángulos** desde su cámara inicial. No es una medición nueva de FPS. El [desglose anterior](CONSOLIDACION_ETAPA_3_REVISION_VISUAL.md#de-dónde-salen-las-1118-llamadas) permanece como entrada para la integración de modelos de la Etapa 6.

Pendientes anteriores, separados de las herramientas nuevas:

- `AbortError: Transition was skipped`, reproducido antes de la Etapa 3 al redimensionar durante Inicio → Agro. Volvió a aparecer en el cierre de consola de la regresión general de esta revisión. No se filtró ni se modificaron las transiciones: [diagnóstico previo](CONSOLIDACION_ETAPA_3_TRANSICIONES_Y_ENTREGA.md).
- Validación en teléfono físico y otra GPU; las pruebas táctiles siguen siendo emuladas.
- Colisión al caminar contra construcciones, modelos ambientales provisionales y cambio perceptible de densidad entre LOD.
- Costo de los equipos repetidos: el análisis de 1.118 llamadas sigue pendiente de aplicar durante la Etapa 6, no en esta entrega.

## Editor de escenario y partida

**Editar mapa** es un contexto explícito del workspace. Entrar pausa la simulación; sus controles de tiempo permanecen inactivos mientras se personaliza el escenario. **Volver a partida** sale del editor y conserva la pausa hasta que el usuario reanude. Los pinceles históricos también entran en este contexto. Las reglas económicas existentes de la partida se conservan.

Las operaciones nuevas son descriptores serializables validados por `terrain/operations.ts`. No dependen de React, dinero, maquinaria ni trabajadores. El editor solicita una operación y la aplica dentro de una transacción de `WorldSession`; un ejecutor futuro de obras podrá reutilizar el mismo descriptor y cálculo geométrico cuando termine un trabajo. En esta etapa no se implementa ese ejecutor ni se afirma que exista una acción física de juego equivalente.

No hay tala, despeje ni trabajadores nuevos. La vegetación sigue siendo la decoración de las etapas anteriores. Tampoco se añadió importación de terrenos desde imágenes ni ubicaciones reales.

## Flujo común y persistencia

1. Elegir la herramienta en el panel contextual.
2. Marcar un centro, una línea o los vértices de una región. Se dibujan puntos y contorno en la escena; se puede quitar el último punto o limpiar el trazado.
3. **Previsualizar edición** modifica solo la vista temporal. El autoguardado y la exportación conservan el documento confirmado.
4. Si cambian apoyos o conexiones, se abre la revisión de impactos de la Etapa 2, con localización y opciones de cancelar, reasentar o señalar incidencias. Pintar no mueve instalaciones.
5. Aplicar confirma una sola entrada del historial. Cancelar o Escape descarta la vista previa. Deshacer y rehacer restituyen terreno y piezas en el orden del historial.

Las operaciones de relieve permanecen en `terrain.edits`; la pintura se guarda aparte en `terrain.surfaceEdits`. Las operaciones nuevas declaran `algorithmVersion: 1`, independiente de `generatorVersion`. Los generadores V1/V2 no se modificaron. Las parcelas poligonales siguen siendo entidades `parcela`, con el mismo ID, estado científico y ciclo de vida.

La validación rechaza versiones de operación desconocidas, campos incompatibles, geometrías fuera de límites, polígonos cruzados y archivos que se declaren v1 pero contengan características nuevas. Los documentos antiguos sin estas extensiones mantienen su forma y sus resultados. Los mundos nuevos requieren una versión del editor que reconozca sus campos; una app antigua debe rechazarlos explícitamente.

## 4A · Suavizar

**Cambios.** Suavizado local por promedio 3 × 3, con lectura del mismo estado anterior en todas las muestras —no depende del orden de recorrido—, intensidad 0–1 y radio 2–120 m. El borde se atenúa. Algoritmo versionado para que la reapertura reproduzca el resultado.

**Pruebas.** Determinismo, rechazo fuera del contexto editor, vista previa no serializada, cancelar con checksum exacto, aplicar, deshacer/rehacer y reapertura. Interfaz completa comprobada antes de 4B y repetida al cerrar la etapa.

**Capturas.** `capturas/4A-preview.png` y `capturas/4A-final.png`.

**Límites.** Una pasada por operación; se puede repetir sobre la región. Es una herramienta de autoría, sin costo ni maquinaria de juego. No se observaron errores funcionales en los casos probados.

## 4B · Restaurar región

**Cambios.** Recupera el relieve procedural del generador, semilla y parámetros del mundo dentro del radio, con transición suave en el borde. Añade una operación reversible; no borra a escondidas los registros anteriores. Requiere previsualizar y confirmar.

**Pruebas.** Centro restaurado a la base exacta, cancelación sin pérdida de modificaciones, historial y reapertura. Comprobación de impactos bajo un equipo y flujo completo en navegador antes de 4C.

**Capturas.** `capturas/4B-preview.png` y `capturas/4B-final.png`.

**Límites.** Restaura altura; no borra la capa de pintura ni entidades, cultivos o conexiones. La franja exterior del radio mezcla ambas alturas para evitar un corte. No se observaron errores funcionales en los casos probados.

## 4C · Pintar superficies

**Cambios.** Capa visual persistente de hierba, tierra, grava y arena, con intensidad y radio. Su paleta se comparte con terreno y minimapa. La pintura se compone sobre el aspecto base de caminos/zanjas, sin cambiar su geometría. No escribe humedad, infiltración ni tipo científico del suelo.

**Pruebas.** Alturas y estado científico intactos, almacenamiento en capa separada, deshacer/rehacer, round-trip y materiales desconocidos rechazados. Un mismo cultivo avanzó un día con y sin pintura y produjo estados idénticos. Interfaz completa comprobada antes de 4D.

**Capturas.** `capturas/4C-preview.png` y `capturas/4C-final.png`.

**Rendimiento específico.** El primer método recorría todas las marcas por cada vértice. Se añadió un índice derivado por regiones, no persistido. En un Ryzen 5 3600, terreno de 1.200 m y cuatro bloques a máximo detalle:

| Marcas | Antes del índice | Con índice |
|---:|---:|---:|
| 100 | 50,6 ms | 20,5 ms |
| 1.000 | 249,5 ms | 18,1 ms |
| 5.000 | 1.082,0 ms | 30,0 ms |

Los buffers de color de los cuatro bloques fueron idénticos por SHA-256 en los tres casos. Son tiempos de preparación de geometría/color en Node, no FPS ni una garantía para cualquier distribución de trazados. La creación de 5.000 operaciones tomó 369,4 ms en esa pasada, sin incluir la generación inicial del mundo.

**Límites.** Cuatro apariencias de autoría; no son materiales científicos ni una biblioteca definitiva de texturas. Se mantiene el límite combinado de 5.000 operaciones.

## 4D · Pendientes y terrazas

**Cambios.** Regiones poligonales simples de 3–64 vértices, también cóncavas. La pendiente se indica en porcentaje; el primer y segundo vértice definen la dirección y la cota de referencia fija el plano. Las terrazas cuantizan el relieve por cotas, con escalón ajustable. Ambas se mezclan con el entorno mediante una franja de borde.

La previsualización muestra corte y relleno aproximados en m³. La lectura de pendiente del puntero también incorpora porcentaje, conservando grados.

**Pruebas.** Plano con cota y pendiente conocidas, terrazas reproducibles, polígonos cruzados rechazados, impacto sobre bomba, cancelación exacta, historial y persistencia. Las dos variantes pasaron el flujo de navegador antes de 4E.

**Capturas.** `4D-preview/final.png` para pendiente y `4D-terraza-preview/final.png` para terrazas.

**Límites.** El volumen es una estimación por celdas, sin balance geotécnico ni presupuesto de obra. Todavía no se asignan máquinas, trabajo humano o tiempos de construcción.

## 4E · Zanjas y caminos

**Cambios.** Trazados persistentes de 2–64 puntos, ancho 2–40 m y extremos redondeados. Las zanjas excavan el heightfield; su profundidad se controla entre 0,1 y 20 m. Los caminos guardan las cotas de sus puntos y gradúan la franja siguiendo ese perfil. Ambos tienen apariencia derivada sobre la malla y se reconstruyen al abrir el mundo.

**Pruebas.** Geometría de altura realmente modificada, deshacer/rehacer y checksum de reapertura idénticos. Conexiones y entidades intactas; impactos detectados si hay instalaciones. Las dos variantes pasaron la interfaz antes de 4F.

**Capturas.** `4E-preview/final.png` para zanja y `4E-camino-preview/final.png` para camino.

**Límites.** No hay grafo de navegación ni hidráulica de canales. Son operaciones de terreno, no tuberías ni trabajadores. Una operación posterior puede volver a modificar esa misma franja; el orden de operaciones define el relieve final. Los detalles estrechos se aprecian mejor cerca, según el LOD existente.

## 4F · Parcelas poligonales

**Cambios.** Huella local opcional `entity.parcelPolygon`, con área y perímetro reales. Ausente esa propiedad, se conserva el rectángulo histórico, sin conversión automática destructiva. Se validan límites, cruces, superficie mínima y solapes con otras parcelas. La parcela conserva su estado de suelo/cultivo y usa los controles existentes para mover, girar y eliminar.

El render triangula la forma cóncava, acompaña el relieve y recorta las hileras de plantas. La selección y las sondas usan la huella real. El reparto del riego mantiene el muestreo determinista de 160 puntos existente, cambiando la prueba de pertenencia al polígono. La conversión a mm y la cosecha usan su área real, sin cambiar parámetros de suelo, clima o tomate.

**Pruebas.** Parcela cóncava de 450 m² y perímetro 100 m; su entrante queda fuera de selección y riego. Un aspersor interior riega con el denominador de 450 m² y su cosecha potencial corresponde a 3.600 kg, no al rectángulo envolvente. Un rectángulo descrito por cuatro vértices conserva exactamente la cobertura y el estado de suelo/cultivo del rectángulo original. Se comprobaron cancelar, historial, rotación, persistencia, solapes y geometría inválida. En navegador se verificaron selección dentro/fuera de la concavidad, inspector y editor a 390 × 844.

**Capturas.** `4F-preview.png`, `4F-final.png`, `4F-inspector.png` y `4F-movil.png`.

**Límites.** Polígonos simples sin agujeros, 3–64 vértices y dimensiones envolventes de hasta 200 m por lado, según el catálogo. No hay edición de vértices de una parcela ya confirmada mediante arrastre; se puede mover/girar la entidad o delimitar otra. Se conservan los modelos científicos agregados y su aproximación de cobertura; no se introduce una simulación por planta.

## Verificación conjunta

- Instalación, TypeScript y compilación completados.
- `npm run verify:agro` conserva las 312 comprobaciones anteriores y ahora incluye nueve grupos nuevos de verificación del editor.
- Ocho flujos UI nuevos: 4A, 4B, 4C, pendiente, terraza, zanja, camino y parcela poligonal. Cada uno verifica preview, cancelar, aplicar, deshacer, rehacer, autoguardado y recarga, con capturas y sin excepciones de página.
- Trece bloques UI de migración e impactos aprobados, incluidos restauración de copia v1 y toque emulado a 320 × 568. La prueba se adaptó para comprobar la pausa automática al entrar al editor, en lugar de volver a pulsar Pausar.
- Cincuenta y tres bloques funcionales generales aprobados; el cierre de consola sigue fallando por el aviso preexistente de transición, registrado al entrar desde Inicio a `/agro/`. No se marca esa suite como completamente verde ni se añade una excepción al aviso.
- El control de 150 entidades conserva las 1.118 llamadas de la Etapa 3. El editor puede añadir llamadas temporales por sus puntos y contornos; no se presenta como una optimización de equipos.

Los mundos del usuario no se usaron para las pruebas: se ejecutaron perfiles de navegador desechables y fixtures. No se probó hardware móvil real. No hay un nuevo problema funcional confirmado de 4A–4F en los escenarios ejecutados; los límites anteriores siguen documentados y requieren revisión visual del usuario.

## Archivos y evidencia

Operaciones y geometría: `terrain/{operations,geometry,heightfield,model,surface}.ts`, `world/{session,placement,impact,parcelGeometry}.ts`, `model/{types,validate}.ts`.

Interfaz y escena: `ui/{TerrainEditor,Workspace,Inspector,SimPanels}.tsx`, `scene/{AgroCanvas,EntityLayer,Crops}.tsx`, `scene/ParcelGeometry.ts`, `styles/agro-workflow.css`.

Compatibilidad científica: cambios geométricos de área/pertenencia en `sim/{irrigation,step}.ts`, sin sustituir sus motores. QA y scripts en `qa/verify-agro-editor{.mjs,-ui.cjs}`, `qa/measure-agro-editor.mjs`, suites UI existentes y `package.json`.

La evidencia está fuera del repositorio:

`C:/Users/HUMANO LAB/.codex/visualizations/2026/11/10/01a1c66a-f292-72a0-a7db-720b23b3c7b2/agro-etapa4/`

`galeria.html` reúne las capturas; `editor-modelo.log`, `regresion-modelo.log`, `editor-ui-cierre.log`, `agro-ui.log`, `agro-migration-ui.log`, `etapa3-camaras/`, `pintura-*-indice.json` y `control-150-entidades.json` conservan resultados y datos. `git-inicial.txt` y `git-final.txt` registran el estado local sin descartar el trabajo previo. Se mantiene la rama `agro-consolidacion`, sin commit ni push; la Etapa 5 espera revisión.
