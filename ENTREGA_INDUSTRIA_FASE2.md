# ENTREGA — modo. Industria · Fase 2 (v2.9.0)

Fecha: 2026-11-07 · Rama git: `industria-fase2` (sin commits; los cambios están en el árbol de trabajo).
Auditoría previa: `docs/industria/FASE1_AUDITORIA.md`.

## Qué incluye

Industria abre desde el Home y trabaja sobre un **modelo compartido** con persistencia y deshacer/rehacer. Todavía **no** es el constructor industrial: el catálogo, el anclaje magnético, el cableado, los instrumentos, el PLC y la simulación son de las fases 3 a 7.

- Tarjeta «Industria · Beta» en el Home y ruta `/industria/` (`src/pages/industria.astro`).
- Carcasa con la identidad de Robótica: barra superior (inicio, nombre y guardado, play/stop deshabilitados, deshacer/rehacer, Construir/Simular, menú), escenario 3D protagonista, dock inferior flotante y paneles flotantes cerrables y movibles. Sin barras laterales fijas.
- Vistas Planta 3D, Tablero, Diagramas, PLC, HMI y Documentación: las cinco últimas son esqueletos honestos que listan los mismos componentes con el mismo id.
- Ruta de navegación Planta › componente seleccionado.
- Cámaras: Frente, Lateral, Superior, ISO y vistas guardadas por proyecto.
- Proyectos: nuevo, duplicar, renombrar, eliminar, exportar/importar `*.industria.json`, modo Libre/Aprendizaje/Prueba.
- Construir/Simular: en Simular no se añade, mueve ni elimina nada.

## Modelo compartido (`src/industria/model/`)

| Archivo | Contenido |
|---|---|
| `types.ts` | `IndustryProject` con `entities`, `mounts` (montaje físico), `connections` (netlist), `bindings` (asociación lógica), `poses` (3D) y `symbols` (diagramas) por separado. Límites. |
| `commands.ts` | Operaciones puras y validadas: añadir/renombrar/propiedades/pose, montar, **liberar** (solo borra el montaje), conectar, **desconectar** (solo ese enlace), asociar, eliminar con dependencias. |
| `validate.ts` | Validación e integridad referencial (ids únicos, referencias, ciclos de montaje, poses finitas). Rechaza archivos de Robótica, Laboratorio y Panel con mensaje claro. `migrate()` con cadena de migraciones (vacía: solo existe la versión 1) que rechaza versiones futuras. |
| `library.ts` | Biblioteca, lectura segura (los datos ilegibles no se sobrescriben), importar/exportar, historial de 50 pasos. |
| `ui.ts` | Estado de interfaz **aparte** (vista, cámara, cámaras guardadas, paneles, selección, ruta). |

- Claves de almacenamiento: `modo:industria:library:v1` y `modo:industria:ui:<id proyecto>:v1`. No se tocó ninguna clave existente.
- Una conexión nueva queda **«no verificada»**: no hay datos para validarla y nunca se presenta como válida.
- Eliminar un componente con dependencias exige confirmación explícita y muestra cuántas son.

## Archivos

**Nuevos:** `src/industria/{IndustriaApp.tsx, useIndustriaProject.ts, model/*, scene/IndustriaCanvas.tsx}`, `src/pages/industria.astro`, `src/styles/industria.css`, `public/images/home-approved/industry.webp`, `qa/verify-industria-model.mjs`, `qa/verify-industria-shell.cjs`, `docs/industria/FASE1_AUDITORIA.md`.

**Modificados (mínimo):**
- `src/components/Home.tsx` (una entrada en `spaces`) y `src/styles/modo-home-approved.css` (seis tarjetas en escritorio: tarjeta algo más pequeña y desplazada media separación para quedar centradas; arte de Industria en tres tamaños).
- `public/sw.js` (`pageKey` incluye `industria`) y `astro.config.mjs` (`/industria/` es página pesada: sus chunks no entran al precache y se guardan al visitarla, igual que Robótica).
- `src/data/releases.ts`, `package.json` y `package-lock.json`: versión 2.9.0.
- `qa/verify-approved-home.cjs`, `qa/verify-desktop-centering.cjs`, `qa/verify-robotics-ui.cjs`: actualizados de cinco a seis tarjetas.

**No se tocó:** `App.tsx`, `src/lab/*`, `src/robotics/*`, `middleware.ts`.

## Reutilizado de lo existente

`FloatingWindow` (paneles), clases `rb-*` de Robótica (barra, dock, escenario, ventanas) importando `robotics.css`, patrón de biblioteca/historial de `useRoboticsProjects`, patrón de página `robotica.astro` (CSP, splash, aviso de carga). La cámara de esta fase es un `OrbitControls` mínimo; en la fase 3 se adopta el sistema de cámaras de Robótica.

## Pruebas

Ejecutadas contra el build de producción (`npm run build` + `npm run preview`, con la CSP real) y Playwright:

| Prueba | Resultado |
|---|---|
| `npm run check` (tsc) y `npm run build` | OK |
| `qa/verify-industria-model.mjs` | 39 bloques OK |
| `qa/verify-industria-shell.cjs` | 12 comprobaciones OK: Home→ruta, carcasa, mismo id en las 6 vistas, deshacer/rehacer por botones y teclado, Simular protege la estructura, recarga conserva proyecto y UI, cámaras guardadas, exportar/importar, rechazo de archivo de Robótica, datos ilegibles no se sobrescriben, sin desbordes a 390/768/1024 px, cero errores de consola/JS/CSP/HTTP |
| `verify-approved-home.cjs` (9 tamaños + WebKit, con `SKIP_PROTECTED_HASHES=1`) | OK, incluye abrir `/industria/` desde la tarjeta |
| `verify-desktop-centering.cjs` | Centrado simétrico en 8 tamaños OK; falla al final por el hash de `src/lab/units.ts` (anterior a este cambio) |
| `verify-home-card-gestures.cjs` (Chromium y WebKit) | OK |
| Modelo: `verify:data`, `wiring`, `simulation`, `lab`, `panel-history`, `cabinet`, `cabinet-cables`, `equipment`, `robotics-project`, `robotics-assembly`, `robotics-circuit`, `robotics-interaction`, `robotica-gate` | OK |
| UI de Robótica: `verify:robotics-build-ui`, `verify:robotics-menu` | OK |

### Pruebas que ya fallaban antes (comprobado con una copia limpia de `HEAD`)

Fallan igual sin mis cambios: `verify:modo` (busca `.modo-home`), `verify:pwa` (URL inválida), `verify:lab-ui`, `verify:cabinet-ui`, `verify:meter-parity`, `verify:cabinet-plc` (busca controles que ya no existen) y `verify:robotics-ui` (afirma que la tarjeta de Robótica no tiene ilustración). `verify:security` falla por un selector `.modo-primary` obsoleto (no se comparó contra la línea base). `verify-modo-preservation.mjs` y los hashes de `protected-hashes.json` ya no sirven como puerta de calidad.

## No verificado / pendiente

- Teléfono y tablet reales; solo se probó con emulación (390, 768, 1024 px).
- `verify:security` completa y `verify:offline-travel` no se ejecutaron en esta fase. Tras visitar `/industria/` una vez se guarda para uso sin conexión (comportamiento igual al de Robótica); no se probó en ejecución.
- Industria **no** está detrás de la contraseña de la Beta (`middleware.ts` solo cubre `/robotica` y `/arena`); decidir antes de publicar. Esta entrega no despliega nada.
- La ilustración de la tarjeta es el arte del kit recortado y con borde difuminado; es ilustrativa, no un equipo verificado.
- Los componentes de la Estructura son genéricos de prueba; no hay catálogo ni valores eléctricos.

## Cómo probar

```bash
cd PanelLab-INACAP
npm run dev
```

Abrir `http://127.0.0.1:4326/industria/` (o la tarjeta Industria del inicio) → Estructura → añadir componentes → seleccionar → Propiedades → cambiar posición → Deshacer/Rehacer → recargar.
