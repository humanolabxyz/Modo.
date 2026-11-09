# modo. Agro · Fase 2 — Entidades, colocación y guardado

Estado: implementada y verificada (ver «Pruebas»). Las conexiones **físicas** y su simulación son la Fase 3; aquí solo existe la unión lógica.

## Qué se puede hacer
- **Lobby** (`/agro/`): Continuar (último mundo), Crear nuevo mundo, **Mis mundos** (piezas, ediciones y última sesión; abrir, exportar, duplicar y eliminar con doble confirmación) e Importar. Primer ingreso sin mundos: invitación a crear el primero. Ruta de cada mundo: `/agro/#/mundo/<id>`; recargar o usar «atrás» no pierde nada.
- **Catálogo piloto (8 piezas):** estanque, bomba centrífuga, tubería, válvula, sensor de humedad, tablero de control, panel solar y parcela. Medidas en metros, puertos tipados con posiciones estables y límites de colocación por pieza.
- **Colocar** con fantasma verde/rojo sobre el terreno (pendiente máxima, bordes del mapa y solapes con motivo legible), imán a rejilla de 0,5 m, giro con Q/E o en el inspector. La pieza se apoya en el suelo.
- **Seleccionar** (clic) con inspector: nombre editable, posición, cota, medidas, giro, parámetros (largo y diámetro de la tubería; ancho y largo de la parcela), estado, puertos y conexiones. **Mover** arrastrando; **eliminar** con Supr o el botón.
- **Eliminar con dependencias:** una pieza con conexiones pide confirmación diciendo cuántas; sin conexiones se elimina directo. Todo se deshace.
- **Medir** entre dos puntos del terreno: distancia, horizontal, desnivel y pendiente, con etiqueta en 3D.
- **Deshacer/Rehacer unificado** (botones, Ctrl+Z, Ctrl+Y): piezas y trazos de terreno en el orden en que ocurrieron.
- **Guardado automático** en IndexedDB (700 ms tras el último cambio, al ocultar la pestaña y al salir), con estados «Cambios sin guardar → Guardando… → Guardado · hh:mm» y «No se pudo guardar» si el navegador falla. Exportar/Importar archivos `.modoagro.json`.

## Arquitectura
| Capa | Ruta | Notas |
|---|---|---|
| Catálogo | `src/agro/catalog/items.ts` | Medidas, parámetros validados, `portsFor` (los ids de puerto no cambian al editar parámetros) |
| Colocación | `src/agro/world/placement.ts` | Huellas orientadas, solape por eje separador, pendiente bajo la huella, picking rayo-caja, parcela bajo un punto, medición |
| Comandos | `src/agro/world/commands.ts` | Inmutables, validados, con `Result`; `removeEntity` exige `confirm` si hay conexiones (mismo patrón que Industria) |
| Sesión | `src/agro/world/session.ts` | Terreno + piezas + conexiones + **historial unificado** (cada paso guarda dos referencias; la compartición estructural lo hace barato) |
| Almacenamiento | `src/agro/store/backend.ts`, `worlds.ts` | `Backend` abstracto: IndexedDB en el navegador, memoria en Node. `WorldStore`: listar, cargar, guardar, importar, duplicar, eliminar |
| Escena | `src/agro/scene/EntityMesh.tsx`, `EntityLayer.tsx`, `AgroCanvas.tsx` | Modelos de primitivas a escala real, parcelas que siguen el relieve, fantasma, medición, interacción por picking analítico |
| Interfaz | `src/agro/ui/Lobby.tsx`, `Workspace.tsx`, `Panels.tsx` | Lobby, workspace, catálogo, inspector y diálogo de confirmación |

**Reutilizado:** contratos y validación de la Fase 0, terreno de la Fase 1, patrón de comandos puros e historial de Industria (`src/industria/model/commands.ts`, `library.ts`), `newId`. No se duplicó ningún motor; la Fase 2 no necesita PLC ni cableado.

## Decisiones
- **La pieza sigue al terreno:** al terminar un trazo de terreno, las piezas apoyadas en la zona editada se vuelven a asentar y se avisa si la pendiente ya no es válida («quedó en una pendiente de N°»). Deshacer el trazo devuelve también la altura de las piezas.
- **Reglas de guardado (heredadas de Industria):** nunca se sobrescribe ni se borra lo que no se pudo leer; un guardado fallido nunca se presenta como exitoso; un mundo inválido no se guarda; importar un archivo cuyo id ya existe crea una copia «(importado)».
- **Sin IndexedDB** (ventana privada): se trabaja en memoria con aviso visible y se puede exportar.
- **Selección cómoda:** la caja de selección mide al menos 0,5 m, así que una tubería delgada o un sensor se pueden pulsar.
- El estado `connected` solo lo admite el validador si los puertos son compatibles; la Fase 2 crea uniones lógicas «compatible» o «incompatible» (con motivo) mediante `session.connect`, sin interfaz todavía.

## Pendientes conocidos
- No hay interfaz para **conectar** puertos (Fase 3); las conexiones solo existen al importar un archivo o por código.
- Las piezas se renderizan una por una (sin instancing): bien para cientos, no para miles.
- Dos pestañas abiertas sobre el mismo mundo: gana el último guardado (sin aviso de conflicto).
- Las tuberías se apoyan en el suelo en su centro: sobre una pendiente sus extremos pueden quedar en el aire hasta que la Fase 3 las enrute.
- Modelos y colores son provisionales hasta el kit artístico; las medidas son didácticas, no de un producto real.

## Pruebas
`npm run verify:agro` → modelo (67), terreno (39) y mundo/persistencia (56 comprobaciones, con copia en memoria de IndexedDB). `npm run verify:agro-ui` → 22 bloques con ratón y teclado reales sobre IndexedDB real: lobby, creación, terreno, colocar, mover, girar, parámetros, eliminar con y sin conexiones, medir, recarga, Mis mundos, importar/exportar, mundo dañado, móvil y Home.
