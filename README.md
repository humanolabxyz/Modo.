# PanelLab INACAP v2

> Pendientes de la investigación: [traspaso a Claude](CONTINUAR_ELECTRODESK_CON_CLAUDE.md), con estado por oportunidad y variantes de componentes.

> Ampliación local: [Equipos eléctricos adaptados](EQUIPOS_ELECTRICOS_ADAPTADOS.md), con 41 tipos de mando, automatización y energía, ejemplos e integración con el PLC del proyecto.

> Interfaz vigente: [lienzo a pantalla completa y movimiento](LIENZO_Y_MOVIMIENTO.md). Herramientas y fichas flotantes, rueda, zoom al cursor, Espacio + arrastrar y pinza táctil.

> Actualización vigente: [barra de herramientas y lector de PERFECTO / CADe SIMU](HERRAMIENTAS_Y_CADE.md). Para abrir tu esquema: **Leer diagrama → PERFECTO · CADe**.

> Interfaz simplificada: consulta [LIMPIEZA_INTERFAZ.md](LIMPIEZA_INTERFAZ.md). El diagrama y el inspector ahora se abren a demanda; las opciones secundarias están agrupadas.

Práctica educativa local: siete módulos, 108 bornes, cables banana conectables, diagrama junto al panel, nueve retos de reconocimiento y guía manual revisable.

**Abre `ABRIR_PANELLAB_ACTUAL.cmd`** o ejecuta:

```powershell
npm install
npm run dev
```

Abrir la URL que indique Astro. Los HTML autónomos del ZIP son referencias anteriores conservadas; la aplicación actual está en `src/`.

Ver [ENTREGA_V2.md](ENTREGA_V2.md) para instrucciones de uso, capturas, alcance, límites y evidencia.

```powershell
npm run check
npm run verify:data
npm run verify:wiring
npm run build
npm run preview -- --port 4322
```

Con el servidor activo:

```powershell
npm run verify:ui
npm run verify:practice
```

Las pruebas de navegador reutilizan Playwright del runtime de Codex. En otra máquina debe instalarse como herramienta de desarrollo, junto con Chromium. `PANELLAB_URL` permite cambiar la URL de prueba.

El guardado es local; la exportación incluye cables, imagen y pasos. Los nodos unen solo cables ideales. El comportamiento eléctrico de componentes y la seguridad de un montaje físico no se validan.

## Trabajar desde dos computadores

La versión actual se mantiene en `main`. La rama `robotica/etapa-1` se integró en `main` el 3 de noviembre de 2026. Usa `main` en ambos equipos para continuar el mismo trabajo.

Requiere Node.js 24 y Git. En un clon existente, antes de empezar y con tus cambios anteriores guardados en un commit:

```sh
git switch main
git pull --ff-only origin main
npm ci
npm run dev
```

Al terminar en un computador, revisa y sube tus cambios antes de pasar al otro:

```sh
git status
git add <archivos-modificados>
git commit -m "Describe los cambios realizados"
git push origin main
```

Reemplaza `<archivos-modificados>` por los archivos que quieras guardar. Si `git pull --ff-only` indica que las ramas divergieron, conserva los cambios y revisa el historial antes de fusionar; no uses `reset --hard` ni `push --force` para sincronizar.

Git sincroniza los archivos versionados del proyecto. Los circuitos y proyectos guardados en el navegador se trasladan con las opciones de exportar/importar de la aplicación. Las dependencias, archivos `.env` y materiales locales excluidos en `.gitignore` se preparan por separado en cada computador.

## Fotos, LOTO y grabación

En el panel, abre **Procedimientos** para consultar las seis fotos nuevas, revisar el ejercicio LOTO o grabar/reproducir las acciones de tu práctica. La guía de bornes avanza manualmente. Consulta [FOTOS_LOTO_Y_GRABACION.md](FOTOS_LOTO_Y_GRABACION.md). Trabajo local, sin despliegue.

## Historial del panel y JSON

Las exportaciones incluyen el circuito y su historial automático. En **Procedimientos → Grabación → Historial del panel** puedes comparar cables añadidos, retirados o modificados y leer los pasos anteriores de un JSON. Detalle: [HISTORIAL_Y_PANEL_JSON.md](HISTORIAL_Y_PANEL_JSON.md).
