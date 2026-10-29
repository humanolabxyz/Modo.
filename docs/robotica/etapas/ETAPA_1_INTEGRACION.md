# Etapa 1 — Integración, pizarra 3D base y verificación técnica

**Estado:** ✅ **Aprobada por el usuario el 28/10/2026** («Aprobar Etapa 1», revisión 2). Lista para implementar.
**Permisos operativos a confirmar al empezar** (no estaban explícitos en el mensaje de aprobación): commitear o respaldar los cambios pendientes del repo, e instalar `arduino-cli` localmente para el spike E2. Si no hay confirmación, no commitear nada ajeno a Robótica y usar `.hex` de ejemplo en E2.
**Decisiones que aplica:** D-01, D-02, D-03, D-05 (solo se prepara), D-07, D-12 aprobadas · D-09 pendiente (icono sin arte) · D-04 y D-06 se **verifican** aquí.
**No incluye:** piezas reales, cables, firmware integrado ni física en la interfaz. Tampoco la publicación 2.6.0 Beta, que va después de validar esta etapa (D-10).

## Objetivo

1. La quinta tarjeta y la página `/robotica/` con una **pizarra 3D que ya se siente como Figma**: canvas protagonista, herramientas contextuales y gestos sin conflictos, con las ventanas del Panel de control.
2. Proyecto vacío versionado que se guarda, se exporta y se reabre.
3. **Evidencia técnica** para cerrar D-04 (emulación real del ATmega328P y compilación en línea) y D-06 (rendimiento de Rapier), sin integrarlas todavía.

## Entregables

### A. Preparación
- [ ] Respaldar o commitear los cambios pendientes del repo (con confirmación del usuario) y crear la rama `robotica/etapa-1`.
- [ ] Instalar con `--save-exact`: `three@0.186.1`, `@react-three/fiber@9.8.2`, `@react-three/drei@10.7.9`, `@types/three` compatible. Registrar sus licencias en `THIRD_PARTY_NOTICES` (`astro.config.mjs`).
- [ ] `avr8js` y `@dimforge/rapier3d-compat` se instalan **solo como dependencias de desarrollo para los spikes** (sección E). Pasan a producción cuando el usuario apruebe D-04/D-06.

### B. Ventanas: reutilizar `FloatingWindow` (D-03)
- [ ] `storageId?: string` opcional. La clave de guardado pasa a ser `storageId ?? title`, así el Panel y el Laboratorio no cambian.
- [ ] Exportar `forgetWindowLayout(storageId)`.
- [ ] `useRoboticsWindows.ts`: solo guarda qué ventanas están abiertas o visibles y el valor de `activation`. **No es un gestor de ventanas.** Todas empiezan cerradas.
- [ ] Ventanas con contenido de marcador: **Piezas**, **Estructura**, **Propiedades**, **Programación**, **Consola**. Todas con `passive` y `storageId="robotica:<nombre>"`.
- [ ] Minimizar = `visible={false}` + chip en la barra para restaurarla. «Restablecer disposición» en el menú del proyecto.
- [ ] Barra superior con clase `compact-bar` y dock con `tool-dock`, para que las ventanas respeten esos límites sin tocar `bounds()`.

### C. Pizarra 3D tipo Figma
Interacción (`src/robotics/interaction/`):

| Gesto / acción | Comportamiento |
| --- | --- |
| Clic en objeto | Selecciona y muestra la **barra contextual** junto al objeto (duplicar, borrar, bloquear, encuadrar; en la etapa 2 se suman mover y rotar). |
| Clic en vacío / Esc | Deselecciona; Esc también cancela la herramienta activa. Nunca cierra ventanas. |
| Shift + clic · arrastre en vacío | Selección múltiple · rectángulo de selección. |
| Clic secundario / pulsación larga (táctil) | **Menú contextual** con las acciones del objeto o del lienzo (encuadrar todo, vistas, restablecer cámara). |
| Arrastrar con botón central, o Espacio + arrastrar, o herramienta Mano | Desplazar (pan). |
| Arrastrar con botón derecho / Alt + arrastrar / un dedo en vacío | Orbitar. |
| Rueda / pellizco | Zoom **hacia el cursor** (como Figma). |
| `V` seleccionar · `H` mano · `F` encuadrar selección · `Shift+1` encuadrar todo · `1/3/7/0` vistas frontal/lateral/superior/isométrica · `Ctrl+Z / Ctrl+Shift+Z` | Atajos. Se desactivan si el foco está en un campo, en el editor o en una ventana. |
| Cubo de vistas (esquina) | Clic en una cara orienta la cámara con animación corta (se respeta «movimiento reducido»). |

- [ ] `tools.ts`: máquina de estados explícita (`idle`, `selecting`, `marquee`, `panning`, `orbiting`; en etapas siguientes `transforming` y `wiring`). Un gesto activo bloquea a los demás.
- [ ] `gestures.ts`: un `pointerdown` en una ventana no llega al canvas (ya lo garantiza `FloatingWindow`). Dentro del canvas, el objeto bajo el puntero decide: pieza → selección, vacío → marquee/órbita según el botón.
- [ ] Canvas: suelo con rejilla discreta, luz suave, fondo claro de la identidad de modo. Cámara con `CameraControls` de drei.
- [ ] Estado vacío útil: «Abre **Piezas** para empezar» con un botón que abre la ventana. Nada de paneles abiertos por defecto.
- [ ] **Objeto de prueba** (cubos seleccionables) solo con `?debug=1`, para validar selección, barra contextual y menú. No es una pieza del catálogo.
- [ ] WebGL: manejar `webglcontextlost`, falta de WebGL y GPU débil, con mensaje claro y botón Reintentar.
- [ ] Barra superior: volver al inicio, nombre del proyecto, estado de guardado, deshacer/rehacer y alternador **Construir / Simular**. Simular muestra «disponible en una próxima etapa», sin simular nada.

### D. Proyecto y persistencia
- [ ] `project/types.ts` con el contrato de `02_ARQUITECTURA_Y_CONTRATOS.md` §4, incluido `firmware.artifact`.
- [ ] `validate.ts` + `migrate.ts`: `format:'modo-robotica'`, `version:1`, límites y mensajes en español. Un archivo del Laboratorio da un error claro.
- [ ] `useRoboticsProjects.ts` con el patrón de `useLaboratory`: biblioteca `modo-robotica-v1`, máximo 30 proyectos, no sobrescribe datos ilegibles, historial de 50 pasos, nuevo/duplicar/renombrar/borrar, exportar/importar `.modo.json` como copia.
- [ ] Ventana «Mis proyectos» con `FloatingWindow`, siguiendo el estilo de «Mi proyecto» del Laboratorio.

### E. Spikes de verificación (aislados en `qa/spikes/robotica/`, fuera de `src/`)
**E1 · Emulación ATmega328P (D-04).** Worker con `avr8js` que carga `.hex` de prueba. Los `.hex` se generan con `arduino-cli`; instalarlo **requiere tu aprobación**. Si no la das, se usan `.hex` de ejemplo con licencia libre y procedencia documentada.
  - Blink: D13 cada 1 000 ms virtuales ±1 ms.
  - PWM en D5, D6, D9 y D10: ciclo útil medido para `analogWrite(…, 64/128/192)`.
  - `pulseIn` y `micros`: pulso inyectado de 1 749 µs → valor leído ±2 %.
  - `Serial.println` por USART y `analogRead`.
  - Relación tiempo virtual / tiempo real en escritorio y tablet.
  - Tabla final: soportado / parcial / no soportado.
**E2 · Compilación en línea (D-04).** Prototipo **local** de `POST /api/compile` con `arduino-cli compile --fqbn arduino:avr:uno`. Medir:
  - tiempo de compilación;
  - tamaño de la cadena de herramientas;
  - errores con número de línea;
  - límites de seguridad: tamaño, tiempo, includes permitidos.

  Comparar alojarlo en una función de Vercel o en un contenedor propio. **Nada se despliega.**

**E3 · Rapier (D-06).** Worker con `@dimforge/rapier3d-compat@0.21.0`: robot 2WD esquemático (unos 10 cuerpos, 2 articulaciones de rueda con motor, 5 obstáculos, 5 rayos de sensor) a 240 Hz. Se mide contra los umbrales de `03_DECISIONES_ABIERTAS.md`: inicio, ms por paso, estabilidad de 60 s, determinismo y peso gzip.
**E4 · CSP y caché.** Política de `robotica/index.html` con `'wasm-unsafe-eval'`, comprobada con `npm run build` + `npm run preview`: E1 y E3 deben correr en la página compilada. Además:
  - excluir del precache del service worker los chunks que solo usa Robótica;
  - añadir `robotica` a `pageKey` en `sw.js`;
  - verificar que `/robotica/` abre sin conexión después de una visita.

### F. Quinta tarjeta del inicio
- [ ] `Home.tsx`: `{id:'robotics', name:'Robótica', Icon:Bot, href:'/robotica/', color:'dark'}` al final de `spaces`, con etiqueta «Beta».
- [ ] Generalizar el desplazamiento del carrusel a N tarjetas (`if (offset > spaces.length/2) offset -= spaces.length`).
- [ ] Sin ilustración (D-09 pendiente): el icono y el fondo de la tarjeta se ven bien sin `robotics.webp` y sin pedir una imagen inexistente.
- [ ] `qa/verify-approved-home.cjs` pasa a 5 tarjetas. Revisar `qa/verify-home-card-gestures.cjs` con 5 tarjetas (deslizar, primer toque centra, segundo toque entra).

## Pruebas

| Prueba | Qué verifica |
| --- | --- |
| `qa/verify-robotics-project.mjs` | Crear, validar, exportar y reimportar (id nuevo); archivo del Laboratorio → error claro; versión desconocida → error; datos corruptos en storage → no se sobrescriben. |
| `qa/verify-robotics-interaction.mjs` | Máquina de estados: un gesto activo bloquea los demás; Esc cancela; los atajos se ignoran con foco en un campo. |
| `qa/verify-robotics-ui.cjs` (escritorio 1440×900, tablet 1024×768, teléfono 390×844) | Entrar desde la tarjeta; abrir, arrastrar, redimensionar, minimizar, cerrar y restaurar cada ventana; arrastrar una ventana no mueve la cámara; Esc con una ventana abierta no la cierra; zoom hacia el cursor; selección, barra contextual y menú contextual (con `?debug=1`); restablecer disposición; ninguna ventana fuera de pantalla tras girar; recargar conserva el proyecto; volver al inicio. |
| Spikes E1–E4 | Informe con números, sin pruebas automáticas de producción. |
| Regresión | `npm run check`, `npm run build`, `verify:float`, `qa/verify-approved-home.cjs`, `qa/verify-home-card-gestures.cjs`, `verify:lab-ui`, `verify:modo`, `verify:pwa`. Comprobación manual de que «Mi proyecto» del Laboratorio conserva su posición guardada. |

## Criterios de aceptación

- [ ] Robótica se abre y se cierra desde la quinta tarjeta. Las otras cuatro funcionan igual.
- [ ] Ventanas: abrir, arrastrar, redimensionar, minimizar, cerrar y restaurar con **el `FloatingWindow` existente**, sin gestor nuevo.
- [ ] La pizarra 3D responde como Figma (tabla de la sección C) y no hay conflictos entre ventana, cámara y selección.
- [ ] Proyecto vacío: guardar, recargar, exportar y reimportar.
- [ ] Los `.modo.json` antiguos del Laboratorio siguen abriendo en el Laboratorio.
- [ ] Responsive sin ventanas inaccesibles. En teléfono, las ventanas se muestran como lámina.
- [ ] Informe de los spikes con una recomendación final para D-04 y D-06.

**Bloquea la etapa 2 si:** se duplicó el gestor de ventanas, cambió la navegación anterior, el proyecto no se recupera, o los spikes muestran que el stack no sirve sin que haya una alternativa aprobada.

## Después de validar esta etapa (no antes)

- Publicar **2.6.0 Beta**: entrada en `src/data/releases.ts` y `package.json`. Solo con tu aprobación explícita.
- Decidir D-04 y D-06 con los números de los spikes, y dónde se aloja el compilador.
