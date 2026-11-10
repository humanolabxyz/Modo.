# Biblioteca 3D de modo. Agro

Sistema para que las piezas, la vegetación y los cultivos del simulador se dibujen con modelos glTF/GLB reales **sin tocar** su lógica. Los modelos son solo imagen: no entran en el archivo del mundo, el catálogo, los puertos ni la simulación.

## Piezas

| Archivo | Qué hace |
|---|---|
| `src/agro/models/types.ts` | Tipos del manifiesto: familia, estado (`listo`/`adaptar`/`descartar`/`pendiente`), procedencia, ajuste, tono/paleta, `simplify`, `anchors` y `movable` (reservados). |
| `src/agro/models/library.ts` | **Manifiesto** de los modelos integrados (18), la relación entidad ↔ modelo, `CROP_STAGE_MODELS` (etapa del motor → modelo) y `VEGETATION_SETS` (vegetación por territorio). |
| `src/agro/models/normalize.ts` | Escala y pivote (puro, probado en Node): origen al centro de la huella, base en y = 0. |
| `src/agro/models/loader.ts` | Carga con `GLTFLoader`, normaliza, armoniza materiales (liso, sin metal, sombreado plano como el resto del mundo), fusiona por material y cachea. Un fallo devuelve `null` (un aviso, una sola vez) y nunca lanza. |
| `src/agro/scene/GlbModels.tsx` | `GlbObject` (pieza única con `fallback`), `GlbInstances` (instancias; una malla por material), `useModel`, `useReadyModels`. |
| `src/agro/gallery/` + `src/pages/agro-galeria-3d.astro` | Galería de revisión en `/agro-galeria-3d/` (solo útil en local: necesita `public/agro/_galeria/`). |
| `tools/agro-assets/` | `inventory.mjs`, `convert-batch.py`, `analyze.mjs`, `build-library.mjs`, `report.mjs`. |

## Dónde se usan (todo con respaldo)

| Objeto | Modelo | Respaldo |
|---|---|---|
| Granero, Molino | `estructura-granero`, `estructura-molino` vía `EntityMesh` | `BarnMesh`, `WindmillMesh` |
| Cerca | `estructura-cerca` en tramos de 5,9 m estirados solo a lo largo (≥ 3,5 m) | `FenceMesh` |
| Árboles y arbustos del Oasis nortino y del desierto (a menos de 170 m del sitio) | palmas, cítricos, cactus, arbustos | árboles procedurales de siempre |
| Rocas de esos territorios (a menos de 170 m) | `roca-a/b/c` | rocas procedurales |
| Cultivo de tomate (a menos de 100 m de la cámara) | `cultivo-tomate-1…4` según la etapa del motor | follaje procedural |
| Fantasma de colocación | — | siempre la forma sencilla coloreada |

Estanque, bomba, tuberías, válvula, T, aspersor, tablero, sensor, panel solar, acometida, invernadero y parcela **no tienen modelo en el kit** y conservan su geometría propia.

## Interruptor

`localStorage['modo-agro-modelos'] = 'off'` o `?modelos=off` desactiva todos los modelos (equipos lentos, comparaciones, diagnóstico).

## Añadir un modelo

1. Convertirlo con `tools/agro-assets/convert-batch.py` (Blender) y medirlo con `analyze.mjs`.
2. Revisarlo en la galería (escala real, colores, triángulos). Anotar el estado y el motivo.
3. Añadir su entrada en `library.ts` con `source` (paquete, autor, licencia, original), `fit` (`height`, `contain` o `scale`) y, si hace falta, `palette`/`tone`/`simplify`.
4. `node --experimental-strip-types tools/agro-assets/build-library.mjs` copia (y simplifica) a `public/agro/models/`; luego `report.mjs`.
5. Enlazarlo: `entity` (pieza del catálogo), `CROP_STAGE_MODELS` (nuevo cultivo: solo su fila) o `VEGETATION_SETS`.
6. `npm run verify:agro-models` y `verify-agro-models-ui.cjs`. La prueba exige licencia CC0 registrada, procedencia, presupuesto de triángulos, ausencia de texturas y que las dimensiones funcionales del catálogo no cambien.

## Presupuesto por modelo (verificado por la prueba)

Estructuras ≤ 3.200 triángulos · vegetación ≤ 1.300 · rocas ≤ 700 · planta de cultivo ≤ 700.
