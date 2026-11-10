# modo. Agro · Etapa 0 — Línea base verificable de la Fase 6
Fecha: 2026-11-10 · Estado: **Etapa 0 terminada. No se inició la Etapa 1.** Código del producto sin cambios.

## 1. Git
| Elemento | Valor |
|---|---|
| Rama de consolidación | `agro-consolidacion` (creada desde `agro-fase6`, activa) |
| Tag de referencia | `agro-fase6-base` → `77058b30c577c31262773e9ecaf58a302a0f4d70` |
| Diferencia tracked contra el tag | **ninguna** (`git diff agro-fase6-base` vacío) |
| Archivos nuevos sin versionar (nada commiteado) | `qa/make-v1-fixtures.mjs`, `qa/fixtures/v1/`, `qa/baseline/` |
| Commits / push | **ninguno** |

## 2. Cómo se probó (aislamiento)
Todas las pruebas se ejecutaron sobre una **copia exacta del tag** (`git archive agro-fase6-base`) en la carpeta temporal de la sesión, con `dist` (build del 2026-11-09 14:12) y `node_modules` enlazado en modo lectura. Servidor de vista previa propio en `127.0.0.1:4386`, perfiles de navegador de Playwright desechables y salida de capturas fuera del repo. Se evitó así que las suites de Robótica (que escriben archivos) o las de UI (que guardan capturas) tocaran el árbol de trabajo. El servidor se detuvo al terminar.

## 3. Pruebas ejecutadas y resultados (reales)
| Suite | Resultado | Notas |
|---|---|---|
| `npm run check` (tsc --noEmit) | **OK** | repo real |
| `npm run verify:agro` (7 scripts de Node) | **OK · 266 PASS · 0 FAIL** | repo real; 27 + 21 + 10 bloques en sim/PLC/economía |
| `verify:agro-ui` | **OK · 54 bloques** | copia del tag, GPU por software (SwiftShader), 29 capturas |
| Industria · tsc + 21 grupos de modelo | **OK · 227 comprobaciones** | `run-industria.mjs --no-build` |
| Industria · UI (18 scripts) | **17 OK · 1 FALLA** | ver §6-R1; el ejecutor no pudo levantar su propio servidor, se corrió cada script contra mi servidor |
| Robótica · 26 scripts de modelo (`.mjs`) | **22 OK · 4 FALLAN** · 180 PASS | ver §6-R2 |
| Robótica · scripts de UI (`.cjs`) | **NO EJECUTADOS** | pendiente de decisión (muy largos; no afectan a Agro) |
Logs completos en `qa/baseline/logs/`.

## 4. Mundos de referencia V1 y checksums
Generados con `qa/make-v1-fixtures.mjs` (usa `createConfiguredWorld`, `WorldSession` y el exportador reales del producto) en `qa/fixtures/v1/`. Ids y fechas fijados. Generados **dos veces**: los checksums de terreno coinciden; los archivos difieren solo en los ids aleatorios de las piezas (`newId` del producto), por eso la huella estable es el checksum de terreno + recuentos, y el SHA-256 vale para estos archivos concretos.

| Archivo | Exp. | Semilla | Ediciones terreno | Piezas | Conex. | PLC | Economía | Seg. simulados | **Checksum terreno (FNV-1a)** | SHA-256 (12) | Ida y vuelta idéntica |
|---|---|---|---|---|---|---|---|---|---|---|---|
| v1-01-libre-vacio | free | 12345 | 0 | 0 | 0 | no | no | 0 | `a44f1259` | 3bea724b4a72 | sí |
| v1-02-valle-granja | free | 31 (valle) | 0 | 9 | 6 | no | no | 0 | `07a6dc42` | 15d4c962ab94 | sí |
| v1-03-real-economia | real | 4242 | 0 | 8 | 6 | no | sí | 259 200 | `35e3036e` | 619c965bdc74 | sí |
| v1-04-terreno-editado-conectado | free | 9001 | 30 | 9 | 6 | no | no | 172 800 | `b78212f8` | 063a7f5c229c | sí |
| v1-05-plc-automatico | free | 31415 | 0 | 8 | 6 | sí | no | 864 000 | `717a4496` | 830b40962fff | sí |
Nota: las 30 ediciones de v1-04 están lejos de la finca a propósito; la edición **bajo** instalaciones se probará en la Etapa 2. Los 5 se validan con `parseWorld` y releen sin pérdida.

## 5. Rendimiento medido (GPU real)
Equipo: **NVIDIA GeForce GTX 1660 SUPER** (ANGLE/D3D11), Chromium headless 1440×900, vsync desactivado. Mundo «Granja productiva» de 1000 m y de 1200 m, tras crear el mundo desde el asistente. Script: `qa/baseline/scripts/measure.cjs`; datos: `rendimiento-gpu.json`.

| Medida | 1000 m | 1200 m |
|---|---|---|
| Crear mundo → primer cuadro 3D | 1 187 ms | 1 286 ms |
| Órbita: triángulos / dibujos | 135 051 / 120 | 136 691 / 132 |
| Estratégica: triángulos / dibujos | 89 123 / 181 | 97 963 / 213 |
| Caminar: triángulos / dibujos | 121 288 / 42 | 124 788 / 52 |
| Memoria de JS tras cargar | 23 MB | 25 MB |
| Cuadros dibujados por segundo, arrastrando la cámara (órbita) | 40,2 | 40,5 |
| Mayor intervalo entre cuadros dibujados (órbita) | 76 ms | 78 ms |
| Cuadros dibujados, caminando (continuo, sin vsync) | 1 775 /s | 1 589 /s |
| Cuadros dibujados, vista estratégica sin interacción | 0 /s (render bajo demanda) | 0 /s |
| Errores de consola | 0 | 0 |

**Límites de estas cifras (no son FPS de pantalla):** (1) cuentan cuadros en los que la página emitió llamadas de dibujo, con vsync apagado: en «caminar» muestran capacidad de envío de la CPU, no fluidez percibida; (2) el valor de órbita viene de mis eventos de ratón sintéticos (≈20 por segundo), por lo que refleja el ritmo de la entrada, y el intervalo de 76–78 ms coincide con ese ritmo; (3) la memoria es del montón de JS, **no** de la GPU; (4) los triángulos varían entre ejecuciones (121–137 k en órbita) según la posición de la cámara y el LOD. **No medido:** tablet, 150 objetos + 10 parcelas, 5 000 ediciones de terreno, escena con vegetación densa propia del Etapa 7, tiempo de edición/autoguardado y memoria de GPU. Con SwiftShader (prueba de UI) los límites de las aserciones fueron <150 k triángulos y <200 dibujos y se cumplieron (126 k / 49).

## 6. Errores, riesgos y hallazgos
- **R1 · Industria `verify-industria-resilience`**: falla esperando el botón «Imán». Ese texto ya no existe en `src/industria` (solo lo cita la prueba): prueba desactualizada tras cambios de interfaz de Industria (v2.25.0 «menús más claros»). Estado previo, ajeno a Agro.
- **R2 · Robótica (assemblies, kit, program-guide, guides-e2e)**: fallan en la copia del tag (comparan código esperado y `.hex`). No se pudo confirmar si ocurre igual en el árbol original porque estas suites escriben archivos y no se ejecutaron allí; podría deberse a archivos ignorados por git ausentes en la copia. Pendiente de confirmar. Ajeno a Agro.
- **R3 · Borde blanco confirmado (MAP-021)**: en vista estratégica alejada al máximo, el mapa aparece como un parche flotando sobre un fondo claro con nubes, sin terreno exterior ni horizonte (`capturas/07-cenital-alejado-maximo.png`). El requisito de V2 no se cumple hoy.
- **R4 · Edición del terreno**: sigue vigente el riesgo de re-asentamiento silencioso de piezas (auditoría, hallazgo 4); no se probó dinámicamente en Etapa 0 por no ser alcance.
- **R5 · IDs de pieza no deterministas** (`newId`): los fixtures no son byte a byte reproducibles; para la Etapa 1 se comparará por checksum de terreno, recuentos y contenido normalizado.
- **R6 · Ejecutor de Industria**: no logra arrancar su servidor en este entorno Windows (`npm.cmd` con `shell`), por eso se corrió por separado.

## 7. Capturas y evidencias
`qa/baseline/capturas/`: lobby; asistente (plantilla, territorio, emplazamiento, revisión); Workspace en órbita; cenital alejado al máximo; órbita cerca del suelo; primera persona; y capturas de las mediciones (órbita, estratégica y caminar, 1000 y 1200 m). `qa/baseline/capturas-ui-prueba/`: las 29 capturas de `verify-agro-ui`. Los datos de la prueba de UI están en `agro-ui-verification.json`.

## 8. No se alteraron datos existentes
- Tus mundos guardados viven en el almacenamiento del navegador (IndexedDB) y **no se abrieron ni leyeron**: las pruebas usaron perfiles desechables de Playwright y el origen `127.0.0.1:4386` con navegadores sin historial.
- El repositorio: ningún archivo versionado modificado (`git diff agro-fase6-base` vacío); solo hay 3 rutas nuevas sin versionar (§1).
- `dist`, `node_modules` y demás se usaron en modo lectura; el único proceso lanzado (servidor 4386) se cerró.

## 9. Recomendaciones para comenzar la Etapa 1
1. Autorizar el commit de `qa/fixtures/v1`, `qa/make-v1-fixtures.mjs` y `qa/baseline` en `agro-consolidacion` (una sola entrega «línea base»).
2. Etapa 1: congelar `baseHeight` actual como `generatorVersion 1` y comprobar con estos 5 checksums de terreno que no cambia ni un bit.
3. Añadir una prueba `verify-agro-migration` que abra los 5 fixtures v1, guarde como v2, reabra y compare checksum, recuentos, economía, PLC y reloj; y que verifique la copia de seguridad `backup-v1:<id>`.
4. Decidir si se tratan R1/R2 (pruebas obsoletas de Industria/Robótica) antes o fuera de la consolidación, y si se necesita ejecutar los scripts de UI de Robótica.
5. Pendiente de medición adicional recomendada (puedes autorizarla dentro de Etapa 0 o hacerla en la 9): tablet, y escena de estrés V2 (150 objetos, 10 parcelas, 5 000 ediciones).
