# modo. Agro · Fase 0 — Contratos y esqueleto

Estado: implementada y verificada (ver «Pruebas»). **Nota:** la pantalla de esqueleto con el validador de archivos fue sustituida en la Fase 1 por el workspace 3D (`docs/agro/FASE_1_TERRENO.md`); los contratos y la validación siguen siendo los de aquí.

## Qué existe

| Pieza | Ruta | Para qué |
|---|---|---|
| Contratos (tipos) | `src/agro/model/types.ts` | Formato `modo-agro` v1, entidades, puertos, conexiones, terreno, reloj, límites, unidades |
| Compatibilidad de puertos | `src/agro/model/ports.ts` | `checkPorts(a, b)`: une o rechaza con un motivo legible |
| Validación y migración | `src/agro/model/validate.ts` | `parseWorld`, `parseWorldText`, `migrateWorld`, `exportWorld` |
| Mundo vacío | `src/agro/model/defaults.ts` | `newWorld`, `newSeed` (reutiliza `newId` de Industria) |
| Esqueleto de interfaz | `src/agro/AgroApp.tsx`, `src/pages/agro.astro`, `src/styles/agro.css` | Ruta `/agro/`, contrato visible y validador de archivos |
| Integración | `Home.tsx` (tarjeta), `middleware.ts` (clave Beta), `package.json` (scripts) | Séptima tarjeta, `/agro/` tras la clave Beta |
| Pruebas | `qa/verify-agro-model.mjs`, `qa/verify-agro-ui.cjs` | `npm run verify:agro` y `npm run verify:agro-ui` |

## Reutilizado (no duplicado)

- `newId` de `src/industria/model/defaults.ts`.
- `migrate(raw, migraciones, versiónActual)` de `src/industria/model/validate.ts`: la lógica de versiones (rechazar futuras, encadenar migraciones) es genérica y se usa tal cual.
- Patrón de página `client:only="react"` de `industria.astro`, identidad `modo-soft-ui` / `modo-identity` y clave Beta de `middleware.ts`.
- Patrón de modelo de Industria: entidades con id estable, relaciones separadas, comandos puros, `Result`.

No se reutilizó el motor de simulación, PLC ni cableado: la Fase 0 no los necesita. La Fase 5 los incrustará (proyecto Industria dentro de la entidad «tablero») sin editar `src/industria/`.

## Contrato del mundo (`WorldProject`)

- `format: 'modo-agro'`, `version: 1`. Una sola fuente de verdad por mundo; el modelo visual solo la presenta.
- **Unidades:** metros, segundos simulados, radianes, bar, L/min, kW, V, ha.
- `experience`: `learning | free | real` (mismas geometría y física; cambian permisos, costes y ayudas).
- `scenario.land`: superficies **distintas** (visible, administrada, autorizada, cultivada). El validador exige coherencia: cultivada ≤ administrada, todo ≤ visible.
- `terrain`: `sizeMeters`, `cellMeters`, `seed` y `edits[]` (deltas sobre una base procedural; el mapa no se guarda entero).
- `clock`: tiempo simulado, velocidad (`0, 1, 5, 20, 100`), semilla del PRNG y fecha inicial. Reproducibilidad: **mismo navegador y misma versión**.
- `entities[]` y `connections[]`.

## Entidad y puertos

`Entity`: `id` estable, `type`, `label`, `pose`, `params` (catálogo/ajuste), `ports[]`, `state` (lo escribe la simulación), `lifecycle` (17 estados del flujo B), `owner` (separa patrimonios de una asesoría), `provenance`.

`Port`: `kind` (`hydraulic | power | signal | mechanical`), `direction` (`in | out | bidirectional`), posición y normal **locales y estables**, y `spec` según el tipo (diámetro; corriente/fases/tensión; señal/nivel; montaje).

`Connection`: referencia dos puertos del mismo tipo; `status` (9 estados) y `reason`. Un estado **físico** (`connected`, `energized_pressurized`, `isolated`, `damaged`) no puede contradecir a los puertos: si no son compatibles, el archivo se rechaza. La misma unión es válida como `draft` o `incompatible` con su motivo.

## Validación (`parseWorld`)

Migra y normaliza (descarta campos desconocidos). Rechaza: formatos de otros módulos (indicando dónde abrirlos), versiones futuras, ids repetidos o peligrosos (`__proto__`…), `NaN`/`Infinity`, normales no unitarias, puertos repetidos, conexiones a entidades o puertos inexistentes, tipos de conexión distintos del puerto, uniones duplicadas, superficies incoherentes, terrenos fuera de rango y límites de cantidad y de tamaño (64 MB).

## Decisiones y pendientes

- **Persistencia (IndexedDB), exportar/importar de la biblioteca de mundos y comandos con historial: Fase 2.** La Fase 0 solo valida y serializa un mundo.
- Los tipos de entidad (`type`) son cadenas libres hasta que exista el catálogo (Fase 2).
- Hidráulica, reloj y suelo están solo como datos (`clock`, `terrain`); sus motores llegan en las Fases 3 y 4.
- **Home:** con siete tarjetas la inicial en escritorio pasa de Laboratorio a Comunidad para que Agro quede visible a la derecha; Panel de control queda parcialmente recortada a la izquierda (se desliza). Pendiente decidir si se reduce el tamaño de las tarjetas.
- El arte de la tarjeta (`public/images/home-approved/agro.svg`) y el icono (`Sprout` de lucide) son **provisionales** hasta contar con la ilustración y la planta-rayo aprobadas.
- `astro.config.mjs` no se tocó: `/agro/` no es «pesada» aún (sin three). Al llegar la Fase 1 hay que añadir `/agro/` a `heavyPages` para que el precaché no cargue three en las demás páginas.
- El título de la pantalla de clave Beta (`middleware.ts`) sigue diciendo «modo. Robótica (Beta)»; el nombre del módulo en el cuerpo sí es correcto.
