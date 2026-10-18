# PanelLab INACAP v2

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

## Fotos, LOTO y grabación

En el panel, abre **Procedimientos** para consultar las seis fotos nuevas, revisar el ejercicio LOTO o grabar/reproducir las acciones de tu práctica. La guía de bornes avanza manualmente. Consulta [FOTOS_LOTO_Y_GRABACION.md](FOTOS_LOTO_Y_GRABACION.md). Trabajo local, sin despliegue.

## Historial del panel y JSON

Las exportaciones incluyen el circuito y su historial automático. En **Procedimientos → Grabación → Historial del panel** puedes comparar cables añadidos, retirados o modificados y leer los pasos anteriores de un JSON. Detalle: [HISTORIAL_Y_PANEL_JSON.md](HISTORIAL_Y_PANEL_JSON.md).
