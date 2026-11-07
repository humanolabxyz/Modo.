# ENTREGA — modo. Industria · Fase 10 y cierre de pendientes (v2.17.0)

Fecha: 2026-11-07 · Rama git: `industria-fase2` (sin commits; todo está en el árbol de trabajo).
Documento de cierre completo: `docs/industria/CIERRE.md` (arquitectura, pruebas, matriz de pendientes, límites y hoja de ruta).

## Qué incluye

### 1. Pruebas finales
- **Un solo comando**: `npm run verify:industria` (tipos, build, 12 grupos de lógica en Node y 13 de interfaz sobre el build de producción con su CSP). Opciones `--no-build`, `--only node|ui`, `--port`. **28/28 grupos en verde, 281 comprobaciones.**
- Playwright se carga con `qa/lib/playwright.cjs` (paquete del proyecto → `PLAYWRIGHT_MODULE` → Codex). Ya no hay rutas absolutas en las pruebas de Industria. No se añadió como dependencia.
- Pruebas nuevas: **endurecimiento**, **rendimiento**, **adaptable** (4 tamaños × 6 vistas × 9 paneles), **accesibilidad automática**, **táctil** (toques reales por CDP), **sin conexión**, **resiliencia** y **pulido**.

### 2. Optimización y rendimiento
- Medido: con 301 piezas y 720 cables, validar 4 ms, evaluar 4 ms, simular 5 ms, diagnosticar 9 ms, documentación 15 ms; la simulación crece de forma lineal.
- Carga inicial de `/industria/`: **127 KB de JS y 38 KB de CSS (gzip)**; three y el escenario 3D (253 KB) se cargan aparte. La prueba lo exige con presupuestos (JS ≤ 220 KB, CSS ≤ 90 KB) y recorre el grafo real de importaciones.

### 3. Seguridad y robustez
- Ids, propiedades y respuestas `__proto__` / `constructor` / `prototype` rechazados; **600 proyectos mutados al azar** pasan por toda la lógica sin una sola excepción.
- **CSV**: textos que empiezan con `=`, `+`, `-` o `@` se neutralizan (inyección de fórmulas). **Markdown**: se escapan HTML, `|` y saltos de línea.
- **Resiliencia**: si el escenario 3D no se descarga o no hay WebGL, la aplicación sigue viva con un aviso claro; un estado de interfaz dañado se ignora; dos pestañas no corrompen lo guardado.
- `ErrorBoundary` en vistas, paneles y escenario.

### 4. Contraseña de la Beta
`/industria/` queda detrás de la misma contraseña y cookie que Robótica (`middleware.ts`, con su prueba). Es la decisión por coherencia con el resto de los módulos Beta; para quitarla basta eliminar las dos rutas de `config.matcher`. **Nada se desplegó.** En Vercel hay que definir `ROBOTICA_BETA_PASSWORD` (sin ella la ruta se cierra con 503, como Robótica).

### 5. Pendientes de las fases anteriores (resumen; detalle en `CIERRE.md`)
Hechos: sin conexión verificado, contraseña, aviso al arrastrar una pieza montada, giro en grados, paneles escalonados que no tapan el dock, panel Piezas más ancho, esquema SVG e impresión (PDF verificado), alzado que cabe y con rótulos girados, motor animado, pulsador NC, terminales más grandes con el dedo, accesibilidad automática con correcciones de contraste y nombres.
**No cerrados**: prueba en teléfono/tablet **reales** y con lector de pantalla; cables con grosor y enrutado; esquemas con varias páginas y sin cruces; temporizadores/contadores/térmicos y sonido; editor de actividades; catálogo verificado; `verify:security` global (selector obsoleto ajeno a Industria).

### 6. Defectos hallados por las pruebas nuevas y corregidos
Contrastes bajos (4 sitios), campo «Añadir» colapsado, panel Piezas tapando el dock y los botones de vistas a 768 px, aviso sin WebGL que bloqueaba las vistas 2D, caída total si el archivo del escenario no cargaba, `__proto__` como id, inyección de fórmulas en CSV y HTML sin escapar en Markdown.

## Cambio fuera de la carpeta de Industria
`src/components/FloatingWindow.tsx`: propiedad **opcional** `cascade` (px) para escalonar ventanas laterales; con el valor por defecto (0) el comportamiento es idéntico. Comprobado: `verify:float`, `robotics-menu`, `robotics-build-ui`, `robotica-gate` y los modelos de Robótica siguen pasando.
`middleware.ts` (compuerta) y `qa/verify-robotica-gate.mjs` (alcance ampliado a Industria). `package.json`: script `verify:industria`.

## Pruebas ejecutadas

| Grupo | Resultado |
|---|---|
| `npm run verify:industria` | 28/28 grupos, 281 comprobaciones en verde |
| `verify:robotica-gate`, `verify:float`, `verify:robotics-menu`, `verify:robotics-build-ui`, modelos de Robótica | OK |
| `verify:offline` (paquete de viaje) | pasa |
| `verify:security` | **falla** igual que antes (selector `.modo-primary` obsoleto, fuera del alcance) |

## No verificado / pendiente
- Dispositivos físicos y lector de pantalla (ver arriba).
- El `ErrorBoundary` de vistas y paneles no tiene prueba automática propia (sí el del escenario 3D).
- Las demás pruebas antiguas del proyecto (`verify:modo`, `verify:pwa`, `verify:lab-ui`…) no se relanzaron.

## Cómo probar
```bash
cd PanelLab-INACAP
npm run verify:industria          # todo, ≈6 min
npm run dev                       # y abrir http://127.0.0.1:4326/industria/
```
