# PanelLab — Fase 1: tablero interactivo INACAP

> **Esta guía describe el prototipo anterior.** Para la versión actual con cables y estudio guiado abre `ABRIR_PANELLAB_ACTUAL.cmd` y consulta [ENTREGA_V2.md](ENTREGA_V2.md).

## Abre el simulador ahora (sin programar)

**Doble clic en `PANEL_LAB_INACAP.html`.**

Es un archivo autónomo: las 7 fotografías de referencia y el inventario vienen incrustados. No necesita internet, servidor local ni instalación de paquetes.

## Qué funciona en esta entrega

- Reconstrucción gráfica de la disposición fotografiada en el banco.
- 7 módulos con **108 bornes seleccionables**: alimentación; pilotos + botoneras; contactor + térmico; contactor trifásico; temporizadores 1 y 2; motor.
- Números, colores y posiciones relativas visibles, incluidas botoneras 1–2 rojos y 3–4 crema.
- Buscar por nombre o terminal (ejemplos: `A1`, `95`, `13`, `S1`), elegir módulo, zoom, movimiento y ajustar vista.
- Inspector del borne seleccionado: identificador, color, función probable, estado de verificación y foto del laboratorio ampliable.
- Permite registrar etiquetas personalizadas como `KM1` tras confirmarlas; guarda selección y etiquetas en el navegador.
- Adaptación a pantalla de computador, tablet y móvil.

## Qué TODAVÍA NO está implementado

- Los cables banana, puentes, motor eléctrico, validación de diagramas y simulación de energía.
- Auto-reconocimiento de planos: los de proyección no son lo bastante legibles para asignar bornes con certeza.
- Una copia medida **1:1 en milímetros** del equipamiento: este dibujo es una reconstrucción visual/manual; aún hay diferencias que se deben corregir comparando con el equipo real.
- Confirmación del estado NO/NC de todos los contactos, referencias KM y conexiones internas.

**Seguridad**: solo herramienta visual y virtual. NO es una guía para intervenir o energizar un circuito real.

## Código para continuar con Codex (Astro + React + TS)

El directorio `src/` tiene la base React/SVG estructurada por componentes, el modelo de panel está en `src/data/panel.ts`, y el proyecto Astro está configurado en `package.json` y `astro.config.mjs`.

En un PC con Node.js e internet para instalar las dependencias:

```bash
npm install
npm run dev
```

Abrir la URL local que indique Astro. Trabajar **localmente**, no en Sites ni desplegar a Vercel en esta fase.

**Estado de pruebas**: la versión HTML autónoma fue probada en navegador para selección de bornes, búsqueda, zoom y render adaptable. El flujo Astro no pudo compilarse en este entorno porque el registro de npm estaba inaccesible; requiere validación local antes de tomarlo como fuente de producción.

## Orden recomendado

1. Comparar la reconstrucción con las fotos y corregir posiciones/etiquetas ambiguas.
2. Aprobar los terminales; confirmar las referencias KM/NA/NC con el docente.
3. Implementar la bandeja de cables banana y puentes compartidos como motor lógico de nodos.
4. Asociar un diagrama legible a segmentos, ejercicios y bornes del panel.
5. Desarrollar modo guiado (3 niveles), práctica y examen, sin añadir pantallas innecesarias.
