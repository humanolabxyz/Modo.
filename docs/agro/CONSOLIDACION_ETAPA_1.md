# modo. Agro · Consolidación 3D — Etapa 1: migración y persistencia (esquema v1 → v2)

Estado: implementada y verificada (ver «Pruebas»). Rama `agro-consolidacion`, sobre la línea base `agro-fase6-base`. Sin commit: pendiente de autorización.
No cambia el aspecto, la simulación ni los motores (hidráulica, PLC, suelo, cultivos, tiempo, economía).

## Qué cambió
| Tema | Cambio | Archivos |
|---|---|---|
| Generador V1 congelado | El algoritmo original del relieve base se movió **sin tocar una operación** a un registro versionado. `createHeightfield` elige el generador por `generatorVersion` (sin versión = 1). Una versión publicada nunca se modifica: todo cambio de algoritmo será una versión nueva. | `terrain/generators.ts` (nuevo), `terrain/heightfield.ts` |
| Esquema v2 | `Terrain.generatorVersion` y `Terrain.presetId`; `Scenario.territory` (debe coincidir con `presetId`). `CURRENT_VERSION = 2`. | `model/types.ts`, `model/defaults.ts`, `terrain/model.ts`, `world/setup.ts` |
| Migración v1 → v2 | Añade `generatorVersion: 1`, `presetId` (semilla 31 = `valley`, otra = `free`; solo una etiqueta) y `territory`. Devuelve una copia: no modifica el original. Un archivo que dice ser v1 pero ya trae campos v2 se rechaza. | `model/validate.ts` (`MIGRATIONS[1]`) |
| Validación estricta (D2) | Todo objeto de forma fija rechaza claves desconocidas nombrando la clave; versiones futuras, ausentes o no enteras, generadores desconocidos y territorios incoherentes se rechazan. Los diccionarios libres (`params`, `state`) siguen siendo libres. | `model/validate.ts` |
| Copia de seguridad | Antes de sobrescribir un registro de esquema anterior (o ilegible) se guarda una **copia exacta y verificada** (releída y comparada) en el almacén `meta` (`backup:<id>:v1`). Una copia existente **nunca se sobrescribe**: si la clave está ocupada se usa la siguiente libre (`…:v1:1`, `…:v1:2`). Si la copia falla, no se guarda nada. Abrir o listar un mundo no escribe nada. Eliminar un mundo elimina sus copias (y solo las suyas). API: `listBackups`, `restoreBackup`. | `store/worlds.ts` |
| Autoguardado | Un trazo de terreno abierto **nunca se persiste**: el autoguardado normal espera (reintenta cada 300 ms) y los guardados forzados (salir de la página, cerrar el mundo) y la exportación guardan el último terreno **confirmado**, porque `TerrainModel.toTerrain` solo serializa las ediciones confirmadas. | `store/autosave.ts` (nuevo), `ui/Workspace.tsx` |
| Pruebas | Migración (26 bloques, Node), migración en navegador con IndexedDB real (7 bloques). Tres pruebas existentes que fijaban el descarte silencioso de campos se actualizaron a la decisión D2. | `qa/verify-agro-migration.mjs`, `qa/verify-agro-migration-ui.cjs`, `qa/verify-agro-{model,plc,economy}.mjs`, `package.json` |

IndexedDB sigue en la versión 1 de la base `modo-agro` (mismos almacenes `worlds` y `meta`): no hay migración de la base, solo del contenido.

## Decisiones y límites
- **Compatibilidad:** los mundos v1 se abren y se guardan como v2. Una versión anterior de la aplicación **no** abre un v2 («versión más nueva»), como ya hacía para versiones futuras. La copia de seguridad conserva el v1 original.
- **Territorio inferido:** un mundo libre creado con la semilla 31 (probabilidad ≈ 1 entre 2 000 millones) se etiquetará `valley`. El terreno es idéntico (mismo generador y semilla); solo cambia la etiqueta.
- **Restauración:** existe como API del almacén (`restoreBackup`) y como procedimiento manual probado (ver abajo); **aún no hay botón en la interfaz**. Las copias solo se escriben en el almacenamiento del navegador.
- **Archivos exportados:** `exportWorld` escribe v2. Un v1 exportado antes se importa (se migra); un v2 no se puede abrir en una aplicación anterior.

## Restaurar una copia de seguridad (mientras no haya opción visible)
Las copias viven en el mismo navegador que tus mundos (IndexedDB `modo-agro`, almacén `meta`). Si un mundo migrado a v2 no se comporta bien, se puede devolver a su estado v1 original:
1. Abre modo. Agro (`/agro/`) **en el mismo navegador y perfil** donde guardaste el mundo y abre la consola de desarrollador (F12 → Consola).
2. Pega el contenido completo de [`docs/agro/restaurar-copia.js`](restaurar-copia.js) y pulsa Enter (define `restaurarCopiaAgro`; algunos navegadores piden escribir «permitir pegado» la primera vez).
3. Lista las copias: `await restaurarCopiaAgro()` (muestra clave, mundo, nombre, versión original, fecha y motivo). El `id` del mundo es la columna «mundo».
4. Restaura: `await restaurarCopiaAgro('ID-DEL-MUNDO')` (la copia anterior a la migración) o `await restaurarCopiaAgro('ID-DEL-MUNDO', 'CLAVE-DE-LA-COPIA')` para elegir una.
5. Recarga la página. El mundo se abre desde el registro v1 restaurado (se migrará en memoria y volverá a v2 en cuanto cambies algo; se guardará una copia nueva solo si la anterior no es idéntica).
- **Seguro:** antes de reemplazar el mundo actual guarda su estado en una copia nueva (`antes-de-restaurar`), en la misma transacción; usa `add`, que falla si la clave existe; no borra ni modifica copias; verifica que el registro restaurado es idéntico a la copia.
- **Probado:** `qa/verify-agro-migration-ui.cjs` pega ese mismo archivo en el navegador y comprueba byte a byte el resultado.
- **Otra vía:** exportar el mundo desde «Mis mundos» antes de restaurar guarda un archivo `.modoagro.json` (v2) con el estado actual.
- **Límite:** el script no valida el contenido de la copia (lo hace la aplicación al abrirla; un mundo ilegible se muestra marcado y no se modifica).

## Mejoras pendientes (registradas, no incluidas en la Etapa 1)
1. **Gestión del espacio ocupado por las copias de seguridad.** Hoy cada migración guarda una copia del tamaño del mundo (hasta decenas de KB por cada 30 ediciones; crecen con las piezas y ediciones) y **no hay límite de cantidad, ni poda, ni indicador de espacio, ni botón para borrarlas** salvo eliminar el mundo. Pendiente: mostrar el espacio ocupado, política de retención (p. ej. conservar siempre la copia v1 original y limitar las `antes-de-restaurar`), borrado manual con confirmación y aviso de cuota del navegador.
2. **Inferencia del Valle central basada solo en la semilla 31.** La migración etiqueta `presetId = 'valley'` cuando `terrain.seed === 31`; un mundo libre con esa semilla se etiquetaría igual (probabilidad ≈ 1 en 2 000 millones). No cambia el terreno (mismo generador y semilla), solo la etiqueta. Pendiente: reforzar la inferencia con otras pistas del archivo (p. ej. plantilla/escenario y tamaño) o permitir corregir el territorio, antes de que la Etapa 3 use `presetId` para comportamientos distintos.
3. Botón de restauración en la interfaz (hoy: procedimiento manual probado).

## Problemas visuales registrados (NO corregidos en la Etapa 1)
Corresponden a la **Etapa 3** (territorios y entorno); la migración no los adelanta.
1. **Límites rectangulares visibles y sin paisaje exterior (V2 §8.2, MAP-021):** en la vista estratégica alejada al máximo el mapa es un parche rectangular que flota sobre un fondo claro con nubes, sin terreno exterior no jugable ni horizonte. Evidencia: `qa/baseline/capturas/07-cenital-alejado-maximo.png` (informe de la Etapa 0, R3).
2. Río y camino decorativos: el río flota en pendientes fuertes y no tiene función hidráulica (F5d); se rotulará en la Etapa 3.

## Pruebas
- `npm run verify:agro` suma `qa/verify-agro-migration.mjs` (26 bloques): suma de verificación del generador V1 en 8 terrenos y altura bit a bit en 5 puntos, medidos con el código **original** del tag; los 5 mundos de referencia (checksum de terreno, recuentos, entidades, conexiones, PLC, economía, reloj y ediciones idénticos); idempotencia; validación estricta; copia previa, fallo de copia, restauración, registros ilegibles; protección del autoguardado.
- `npm run verify:agro-migration-ui` (7 bloques, navegador real con IndexedDB): abrir v1 no escribe; el primer cambio migra con copia idéntica byte a byte; un trazo abierto no se guarda a medias; recargar conserva; un mundo nuevo nace v2. Requiere el servidor de vista previa (`AGRO_URL`).
