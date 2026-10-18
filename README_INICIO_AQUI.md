# PanelLab INACAP — paquete completo para Codex

> **Versión actual: v2.** El usuario solicitó continuar con flujo de estudio y cables conectables. Abrir `ABRIR_PANELLAB_ACTUAL.cmd` y consultar [ENTREGA_V2.md](ENTREGA_V2.md). El contenido siguiente describe el paquete recibido; los HTML autónomos conservan la versión anterior.

Este ZIP incluye el proyecto **existente y aprobado visualmente (fase 1)**, más las **fotografías nuevas, la tabla técnica y las instrucciones para desarrollar la corrección v1.1**. **No afirma que la v1.1 esté implementada.**

## Qué abrir primero

1. `PANEL_LAB_INACAP.html` → demostración autocontenida de la fase 1, que puede abrirse con doble clic (no necesita servidor).
2. `referencias/capturas-prototipo-aprobado/preview-aprobada.png` → captura visual aprobada.
3. `INSTRUCCION_CODEX_V1_1.md` → alcance de las correcciones que debe ejecutar Codex.
4. `AGENTS.md` → reglas permanentes de trabajo para Codex en esta carpeta.
5. `TABLA_TECNICA_PANEL_V1_1.md` → posición, colores y nombres por módulo, con dudas explicitadas.
6. `PRUEBAS_Y_APROBACION_V1_1.md` → checklist de aceptación.

## Si vas a programar localmente

Requisitos: Node.js 20.19+ (o 22+) y npm. En la carpeta que contiene `package.json`:

```bash
npm install
npm run dev
```

Abre la URL local anunciada por Astro. Para compilar, ejecuta `npm run build` y `npm run check`.

> La **versión HTML autónoma** es una referencia para comparar la UI. La fuente editable es `src/` (Astro + React + TypeScript). La copia `ABRIR_SIMULADOR.html` utiliza archivos adyacentes; para abrir sin servidor usa `PANEL_LAB_INACAP.html`.

## Estructura principal

- `src/components/Board.tsx`: dibujo del panel y bornes seleccionables.
- `src/components/App.tsx`: búsqueda, inspector, zoom y controles.
- `src/data/panel.ts`: modelo de datos en TS.
- `public/panel-model.json`: catálogo exportado de módulos y bornes.
- `public/references/`: recortes integrados en la interfaz.
- `referencias/originales-panel/`: fotos de la primera entrega.
- `referencias/nuevas-fotos-2026-10-14/`: cinco fotos nuevas únicas con cables banana físicos.
- `referencias/diagramas-proyectados/`: tres fotos del circuito visto en clases; no tienen resolución suficiente para derivar una lista completa de cables.
- `TABLA_DE_BORNES.csv`: tabla extraída del modelo existente.

## Alcance actual versus próximo

**Ya está en el código:** visualización del panel con siete módulos y 108 conectores modelados, búsqueda, zoom/paneo, selección de borne e inspector (requiere validar compilación en tu equipo).

**Debe hacer Codex ahora (v1.1):** correcciones de realismo/precisión visual, mejorar geometría y etiquetas según nuevas fotos, probar interacción y diseñar estilo visual de cables como preparación.

**No hacer en v1.1:** prometer un motor eléctrico funcional, conectar físicamente equipos, inventar mapeos NA/NC o circuitos desde fotos ilegibles. Conexión interactiva banana y modo guiado son posteriores, salvo que tú pidas ampliar el alcance.

**Seguridad:** aplicación pedagógica digital, desenergizada. Para el montaje real, sigue la guía y supervisión del docente.
