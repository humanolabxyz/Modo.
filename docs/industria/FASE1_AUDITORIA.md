# modo. Industria — Fase 1: auditoría técnica y plan de integración

Fecha: 2026-11-07 · Alcance: solo lectura del repositorio `PanelLab-INACAP` (v2.8.2). No se modificó código, no se ejecutaron builds ni pruebas: todo lo de este informe sale de leer archivos. Lo no verificado en ejecución se marca como tal.

Fuente de requisitos: `modo_industria_kit_completo_para_claude.zip` (README, documento maestro UX/UI, contrato de estados, checklist, referencias visuales).

---

## 1. Estructura actual del proyecto

- Raíz de trabajo: `paneldecontrol/PanelLab-INACAP/`. **Sí es un repositorio git** (rama `main`, remoto `origin`; corrección posterior a la auditoría, que lo había dado por no-repo). Hay 35 archivos de resultados de `qa/` modificados desde antes de empezar.
- Stack real: **Astro 7.4** (salida estática), `@astrojs/react` 7.1, **React 19**, three 0.186.1, `@react-three/fiber` 9.8.2, `drei` 10.7.9, avr8js 0.21.1, CodeMirror 6, Rapier 0.21 (declarado como devDependency pero usado en runtime), TypeScript 5.9 estricto. Node 24.x.
- Páginas (`src/pages/`): `index` (monta `App`, que muestra `Home` mientras `isIntro`), `estudio`, `laboratorio`, `robotica`, `arena`, `comunidad`, `legal`, `versiones`, `sin-conexion`, `sonidos`. No hay carpeta de layouts: cada página repite su `<head>`.
- Código por área: `src/components` (panel físico, CADe, ventanas), `src/data` (modelo del panel, simulación, CADe), `src/lab` (Laboratorio, tableros/gabinete, PLC, HMI), `src/robotics` (~120 archivos, ~10 000 líneas), `src/study`, `src/styles` (~130 CSS), `qa/` (~350 scripts de verificación).
- Persistencia: solo `localStorage`; no se usa IndexedDB. Hay dos convenciones de claves (`panellab…` heredada y `modo:<área>:…:v1`).
- Despliegue/seguridad: CSP por HTML con hashes (`astro.config.mjs`), service worker sellado en build, cabeceras en `vercel.json`, contraseña beta (`middleware.ts`) solo para `/robotica` y `/arena`.

## 2. Herramientas reutilizables (con ubicación)

| Necesidad | Existe | Ubicación | Reutilización |
|---|---|---|---|
| Ventanas flotantes (arrastrar, redimensionar, persistir posición) | Sí, genérico | `src/components/FloatingWindow.tsx` | **Directa** (`storageId` propio) |
| Gestos, rueda y atajos del editor | Sí, funciones puras | `src/robotics/interaction/{tools,navigation,shortcuts}.ts` | **Directa** (importar) |
| Canvas 3D, cámara órbita, vistas, ViewCube, vuelo 1.ª persona | Sí, acoplado | `src/robotics/build/BuildCanvas.tsx` (786 líneas), `ViewCube.tsx` | **Adaptación**: copiar el patrón, no importar la escena |
| Transform gizmo, selección, marquesina, menú contextual | Sí | `BuildCanvas.tsx`, `interaction/ContextMenu.tsx`, `ContextToolbar.tsx` | Adaptación |
| Dock inferior flotante | Sí, solo CSS + markup | `RoboticsApp.tsx` L683-698, `styles/robotics.css` L104-110 (`tool-dock rb-dock`) | Reutilizar clases/patrón |
| Núcleo de montaje (`AnchorDefinition`, `hosts`, `attach`, `detach`, `findJoinCandidates`, OBB) | Sí | `robotics/catalog/types.ts`, `project/commands.ts`, `build/interference.ts` | **Adaptación** (ver §3) |
| Biblioteca de proyectos, guardado diferido, import/export, undo/redo 50 pasos | Sí | `robotics/project/library.ts`, `useRoboticsProjects.ts` | Adaptación (claves, límites y tipo fijos a robótica) |
| Grafo de redes (union-find), `Nets` | Sí | `robotics/circuit/graph.ts`, `lab/model.ts` | Directa/adaptación |
| Solver nodal DC | Sí, puro | `lab/dc.ts` (`solveDC`, 500 nodos) | **Directa** |
| Solver AC fasorial | Sí | `data/panelAC.ts` (`solvePanelAC`) | Directa (depende de la forma de entrada) |
| Motor de tablero con AC, trifásico, protecciones, motor, VFD | Sí, **no exportado** | `lab/equipment/engine.ts` (320 nodos), `model.ts` | **Adaptación**: hoy acoplado al PLC del laboratorio |
| **Multímetro: interfaz** (`MeterDevice`, `MeterLeads`, cuerdas, LCD, unidades) | Sí, sin lógica eléctrica | `lab/MeterInstrument.tsx`, `cords.ts`, `units.ts`, `meterReadout.ts`, `useRollingLcd.ts`, `components/MeterToast.tsx` | **Directa** |
| **Multímetro: lógica de medición** | Sí, **dos backends distintos** | `data/panelMeter.ts` (`readPanelMeter`, firma limpia), `lab/dc.ts` (`solveBreadboard`, `measureResistance`) | **No hay API común**: hay que escribir un tercer backend con la forma de `readPanelMeter` |
| Pinza amperimétrica | Solo panel físico | `components/PanelClampInstrument.tsx` | Adaptación (no existe en Laboratorio) |
| PLC: Ladder + Texto Estructurado | Sí, sin UI en el compilador | `lab/engine.ts` (`compilePLC`, `tick`), `lab/st.ts`, `PLCView.tsx`, `StEditor.tsx` | Adaptación: toma un `LabProject` |
| HMI (toggle, lámpara, número, barra) | Sí, básica | `lab/HMIView.tsx` | Adaptación |
| Cableado de tablero con ruta, puertos y plan guiado | Sí, escenario único (bomba marcha/paro) | `lab/EquipmentView.tsx`, `lab/equipment/*`, `cabinet.ts` | Patrón, no motor genérico |
| Guía de cableado por redes (no por cables) | Sí | `robotics/guide/wireGuide.ts` | Directa |
| Tubo de cable 3D | Sí | `robotics/build/CableTube.tsx`, `cableGeometry.ts` | Directa |
| Diagramas CADe | Solo lectura (JSON estático desde `.cad`) | `data/cade*.ts`, `components/CadeDiagram.tsx` | **No sirve como editor ni generador** |
| Tokens y estilos | Sí | `modo-identity.css` (`--id-*`), `modo-soft-ui.css`, `modo-tokens.css` | Usar `--id-*`, cargar al final |

## 3. Qué existe de verdad frente a lo que muestra la referencia

Hallazgos que contradicen o matizan los mockups:

1. **El "espectro" magnético no existe tal como se muestra.** En Robótica el snap al soltar elige el candidato más cercano a ≤15 mm (`snapAssembly` / `findJoinCandidates`); **no hay previsualización translúcida de la pieza arrastrada en su posición de encaje**. Los ghosts existentes son: caja translúcida al arrastrar desde el catálogo (`GhostMesh`), pieza translúcida de la plantilla de armado (`AssemblyGhost`) y cable fantasma de la guía. Debe construirse.
2. `attach` **solo traslada** el hijo; **no alinea rotación** con las normales de los anclajes. Para riel DIN/gabinete hace falta orientación.
3. El botón "Imán" del dock es **snap de rejilla**, no anclaje.
4. No existe `mountRelation`: la relación se llama `Attachment` (`kind:'rigid'|'wheel-hinge'`) y vive en `project.attachments[]`, fuera de la pieza. Árbol estricto: un padre por hijo, un hijo por anclaje. Conviene para riel DIN (varios módulos por riel) pero hay que ampliarlo a un anclaje que admita N hijos en posiciones.
5. **No existen**: ensamblajes/conjuntos guardables, GLTF (todo es geometría procedural con `switch` de ~290 líneas en `PartMesh.tsx`), migraciones reales de versión (`migrate.ts` es un stub), persistencia del historial, editor de diagramas CADe, más de un PLC, FBD/SFC, HMI con alarmas/tendencias, pinza en el Laboratorio, IndexedDB.
6. El PLC del tablero tiene **8 DI (I0.0–I0.7) y 4 DO (Q0.0–Q0.3) fijos en código**, y el proceso es **un único tanque** con una señal analógica `AI0`.
7. Los mockups muestran un S7-1200, valores trifásicos 400 V, etc. **No hay modelo ni datasheet de esos equipos en el repositorio.** Se tratarán como ilustrativos.

## 4. Funcionalidades existentes que necesitan ampliación

- Multímetro → backend para Industria; después, corriente en circuito y continuidad con topología industrial.
- Anclaje → vista previa translúcida + alineación por normales + anclajes de riel con varios hijos + liberación con evaluación de cables.
- Motor eléctrico del tablero → desacoplar del PLC fijo y exponer `volts` por puerto `partId:port` a los instrumentos.
- PLC → número configurable de E/S y módulos analógicos; ejecutar Ladder/ST sobre un modelo que no sea `LabProject`.
- HMI → escritura a variables sin restricción `I*/M*`, alarmas, varias pantallas.
- Persistencia → versionado y migración real, historial transaccional, estado de UI separado del estado eléctrico.
- Catálogo → registro de piezas con renderizador por pieza, categoría y fuente documental (hoy lista estática).

## 5. Dependencias, limitaciones y conflictos

- **Home**: `index.astro` monta `App`, no `Home`. Las tarjetas son un array `spaces` de 5 entradas en `src/components/Home.tsx`; el carrusel está calibrado para 5 (`--card-step`, centrado). Añadir la sexta exige recalibrar CSS y actualizar `verify-approved-home.cjs` (fija 5 tarjetas y el orden de teclado) y otras pruebas del Home.
- **Rutas nuevas**: una ruta como `/industria/` no entra al precache ni al `pageKey()` de `public/sw.js` hasta añadirla (regex en `astro.config.mjs`, lista en `sw.js`). Si es pesada hay que añadirla a `heavyPages` para que sus chunks no inflen el precache. Si se protege con contraseña beta, tocar `middleware.ts`.
- **CSP**: sin `unsafe-eval`. Solo `robotica/index.html` recibe `'wasm-unsafe-eval'`. Industria no debería necesitarlo salvo que use física Rapier. *Observación aparte*: `arena/index.html` no lo recibe aunque usa Rapier; no verificado en ejecución.
- **Avisos de terceros**: el build falla si a un paquete de la lista le falta la licencia; Rapier no figura en esa lista. Un paquete de runtime nuevo hay que añadirlo.
- **CSS**: tres sistemas de tokens (`--modo-*`, `--soft-*`, `--id-*`); `modo-identity.css` gana por cascada y `!important`. Muchos CSS del Home están huérfanos (solo `modo-home-approved.css` es activo). Componentes nuevos: usar `--id-*` y prefijo `ind-`.
- **Robótica y Laboratorio están muy acoplados a su dominio** (catálogo estático, `RobotProject`, `LabProject` monolítico, PLC fijo, `cabinet.ts` de una sola bomba). Reutilizar importando funciones puras; no refactorizar esos módulos durante Industria.
- **Pruebas**: no hay Playwright ni esbuild en `devDependencies`. Las ~250 pruebas `.cjs` cargan Playwright desde una ruta absoluta del equipo (`C:/Users/HUMANO LAB/.cache/codex-runtimes/...`, existe aquí; navegadores instalados no verificados), con puertos fijos y servidor levantado a mano. `verify-routes.cjs` es en realidad de CADe y usa esbuild, que falta. **`verify-modo-preservation.mjs` falla desde antes** (77 de 129 hashes difieren; `PROTECCION_HUMANO_LAB.md` lo declara): no sirve como puerta de calidad y no debe "arreglarse" regenerando el baseline.
- **Git**: existe repositorio; el trabajo de Industria va en la rama `industria-fase2`.
- Reglas del repositorio: no desplegar ni tocar remotos; créditos y enlace "Créditos y políticas"; sin tracking; documentar cada entrega en `ENTREGA_*.md` y `src/data/releases.ts` (con sección "Alcance" de lo no probado); no inventar datos de equipos; no energizar equipos reales a partir del simulador.

## 6. Propuesta técnica de integración (sin romper lo existente)

**Principio**: Industria es una página propia (`/industria/`), con carpeta propia `src/industria/`, que **importa** piezas genéricas existentes y **no modifica** archivos de Robótica ni Laboratorio. Donde el código existente está acoplado, se escribe un equivalente delgado en `src/industria/` con la misma forma de datos y se anota como deuda para una futura extracción con las pruebas de Robótica como red de seguridad. Justificación técnica: las funciones de montaje dependen de `getDefinition` del catálogo de robótica y de `wheel-hinge`; cambiarlas obligaría a tocar el núcleo de Robótica.

**Modelo compartido** (`src/industria/model/`): `IndustryProject { format:'modo-industria', version:1, id, name, entities, mounts, connections, bindings, views, programs, hmi, scenario, ui }`.
- `entities`: componente con ID estable, `definitionId`, propiedades, estado de simulación opcional.
- `mounts[]`: **montaje físico** (padre/anclaje → hijo/anclaje, pose relativa). Distinto de:
- `connections[]`: **conexión eléctrica/de proceso** terminal↔terminal con cable/tubería, ruta, tramos y derivaciones (netlist). Estados `válido | inválido | no verificado`.
- `bindings[]`: **asociación lógica** (terminal PLC ↔ tag, tag ↔ widget HMI, símbolo de diagrama ↔ entidad).
- `views`: pose 3D y coordenadas de símbolos por separado; `ui` (cámaras, paneles, selección, instrumentos) se guarda aparte del estado del proyecto.
- Operaciones como **comandos transaccionales** puros e inmutables (patrón de `robotics/project/commands.ts`), con validación previa y deshacer/rehacer; borrar una entidad devuelve dependencias en vez de borrar en silencio.
- Persistencia: `localStorage` con clave `modo:industria:library:v1` (UI en `modo:industria:ui:<id>:v1`), validador con límites y migrador real desde el primer día. Exportar/importar `*.industria.json`.

**Simulación (fases 5–6)**: un coordinador único (patrón de `robotics/sim/coordinator.ts`) que lee el proyecto, construye la netlist, llama a `solveDC` / `solvePanelAC` y expone un `SimState` de solo lectura a 3D, instrumentos, diagramas, PLC y HMI. El multímetro usará `MeterDevice` + `MeterLeads` con un `readIndustriaMeter(...)` nuevo con la forma de `readPanelMeter`. Lo no calculable se rotula "No verificado" y no se inventa lectura.

**Catálogo**: cada definición lleva `source` (fabricante/modelo/revisión/URL o "genérico didáctico") y `verification: 'verificado' | 'no verificado'`. Las piezas con bornes/valores solo se marcan verificadas con datasheet. Primera tanda: genéricas didácticas (riel DIN, canaleta, contactor genérico, motor genérico, tanque, bomba), no comerciales.

## 7. Plan detallado de la Fase 2: integración de Industria y arquitectura compartida

Objetivo: dejar Industria **abrible desde el Home**, con carcasa de interfaz aprobada, modelo compartido, persistencia y deshacer/rehacer funcionando y probados, sin construir aún el editor 3D completo (fase 3).

**Entregables**
1. Ruta `/industria/` con carcasa: cabecera (volver al home, nombre, guardado, insignia, play/pausa/reset, deshacer/rehacer, Construir/Simular, menú), dock inferior flotante, ruta Planta › Estación › Gabinete, panel flotante de Biblioteca vacío, escenario con rejilla y cámara orbital mínima (para validar chunks/CSP/SW).
2. Modelo `IndustryProject`, comandos, validador, migrador y biblioteca con guardado diferido.
3. Pestaña/vista selector (Planta 3D, Tablero, Diagramas, PLC, HMI, Documentación) como esqueleto navegable que lee el mismo proyecto.
4. Tarjeta "Industria" en el Home y CSS de las tres variantes responsive.
5. Documentación `ENTREGA_INDUSTRIA_FASE2.md` y entrada en `releases.ts`.

**Archivos nuevos**
- `src/pages/industria.astro`
- `src/industria/IndustriaApp.tsx`, `industria/shell/{TopBar,BottomDock,Breadcrumb,FloatingPanels}.tsx`
- `src/industria/model/{types,commands,validate,migrate,library,defaults}.ts`, `useIndustriaProject.ts`
- `src/industria/scene/IndustriaCanvas.tsx` (rejilla + cámara mínima)
- `src/styles/industria.css` (prefijo `ind-`, tokens `--id-*`)
- `public/images/home-approved/industria.webp` (900×900; derivada del asset de portada del kit, solo ilustrativa)
- `qa/verify-industria-model.mjs`, `qa/verify-industria-shell.cjs`, `qa/verify-industria-home.cjs`

**Archivos existentes que se tocan (mínimo)**
- `src/components/Home.tsx`: una entrada en `spaces`. (Archivo permitido como "presentación").
- `src/styles/modo-home-approved.css`: reglas `art-industria` en las tres posiciones, y recalibrar `--card-step`/centrado para 6 tarjetas.
- `astro.config.mjs`: regex de precache de páginas y, si procede, `heavyPages`.
- `public/sw.js`: `pageKey()`.
- `middleware.ts`: solo si se decide proteger la ruta como beta.
- `src/data/releases.ts` y `package.json`: subir versión.
- `qa/verify-approved-home.cjs` y las pruebas de Home que fijan "5 tarjetas": actualizarlas a 6 con el orden de teclado correcto.
- No se tocan `App.tsx`, `Board.tsx`, `src/lab/*` ni `src/robotics/*`.

**Criterios de aceptación**
- [ ] Antes de cualquier cambio existe un registro de **línea base** (resultado de `check`, `build` y la suite mínima de §8) y un respaldo (git o copia).
- [ ] El Home muestra 6 tarjetas, Industria navega a `/industria/`, y gestos, teclado, versión y aspecto de las otras 5 no cambian (capturas antes/después en 1440, 1920 y 390 px).
- [ ] `/industria/` carga sin errores en consola, respeta la CSP, con fondo claro, escenario protagonista, dock flotante y paneles cerrables; **sin barras laterales fijas**.
- [ ] Crear, renombrar, duplicar, exportar e importar un proyecto Industria; recargar la página conserva el proyecto, y el estado de UI se guarda por separado.
- [ ] Deshacer/rehacer sobre cambios del modelo (≥ 20 pasos), probado en Node.
- [ ] El validador rechaza archivos de otros módulos (`modo-robotica`, `panellab-laboratory`) y versiones futuras, con mensaje en español.
- [ ] Una entidad de prueba conserva el mismo ID en las vistas del selector; borrar una entidad con dependencias pide revisión.
- [ ] Offline: tras visitar `/industria/` una vez, abre sin conexión (service worker). `verify:pwa` y `verify:offline-travel` siguen pasando.
- [ ] Las claves de `localStorage` existentes no cambian de formato; no aparecen claves fuera de `modo:industria:*`.
- [ ] Teclado y tooltips en los íconos del dock; `prefers-reduced-motion` respetado.

## 8. Pruebas de regresión necesarias

Estado de partida: **ninguna se ejecutó en esta auditoría.** Antes de tocar nada, correr y guardar resultados.

- **Estático**: `npm run check`, `npm run build`.
- **Modelo (Node, sin navegador)**: `verify:data` (**sin** `--sync`), `verify:wiring`, `verify:simulation`, `verify:lab`, `verify:panel-history`, `verify:cabinet`, `verify:cabinet-cables`, `verify:equipment`, `verify:robotics-project`, `verify:robotics-assembly`, `verify:robotics-circuit`, `verify:robotics-interaction`, `verify-robotica-gate.mjs`.
- **UI con Playwright** (servidor `npm run preview` en un puerto y `PANELLAB_URL`/`HOME_QA_URL`): `verify-approved-home.cjs`, `verify-home-card-gestures.cjs`, `verify-home-previews.cjs`, `verify:modo`, `verify:lab-ui`, `verify:cabinet-ui`, `verify:cabinet-plc`, `verify-meter-parity-2.2.8.cjs`, `verify:robotics-ui`, `verify:robotics-build-ui`.
- **PWA/seguridad**: `verify:pwa`, `verify:security` (con `node qa/serve-security.cjs`), `verify:offline-travel`.
- **Suite larga opcional** al cerrar la fase: `npm run verify:robotics` (~50 scripts).
- **Excluir como puerta de calidad**: `verify-modo-preservation.mjs` (falla de origen), `verify-launchpad.cjs` (Home antiguo).
- **Nuevas** (fase 2): modelo, shell y Home, listadas arriba.
- **Riesgo operativo**: instalar Playwright como dependencia o fijar la ruta es decisión del usuario; hoy depende de la ruta de Codex.

## 9. Hoja de ruta de las fases siguientes (resumen)

3. Constructor 3D: escena, cámaras guardadas, selección, gizmo, anclaje con **espectro translúcido**, orientación por normales, liberar.
4. Biblioteca por familias y tableros (riel DIN, canaleta), catálogo con fuente y estado de verificación.
5. Cableado y netlist: terminales tipados, rutas, derivaciones, validación tri-estado.
6. Coordinador de simulación, backend del multímetro, pinza y mediciones registradas.
7. Diagramas generados desde el modelo (CADe no sirve de base), PLC con E/S configurables, HMI ampliada.
8. Documentación técnica (fichas con fuente), BOM, fallas y diagnóstico.
9. Modos Libre/Aprendizaje/Prueba como política sobre el mismo motor.
10. Pruebas, rendimiento (LOD/culling), accesibilidad y publicación.

## 10. Riesgos principales

1. **El motor de tablero y el PLC están acoplados al laboratorio**; la fase 6–7 será la más costosa. Alternativa: motor propio mínimo y reutilizar solo `solveDC`.
2. **Peso del bundle**: Industria cargará three/R3F/drei; hay que mantenerlo fuera del precache y medirlo (los chunks de Robótica ya suman ~13 MB entre workers).
3. **Honestidad técnica**: sin datasheets cargados, no se pueden afirmar bornes ni valores de equipos comerciales; la fase 4 debe incluir el proceso de verificación de fuentes.
4. **Deuda de pruebas**: dependencia de Playwright externo y de una prueba histórica rota.
5. **Calibración del carrusel del Home** para 6 tarjetas puede afectar la apariencia de las otras.
