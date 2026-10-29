# 01 · Informe de investigación (código real, solo lectura)

Todo lo de este documento se verificó leyendo archivos concretos el 28/10/2026. Las rutas son relativas a `PanelLab-INACAP/`.

## 1. Datos del proyecto

| Dato | Valor verificado | Fuente |
| --- | --- | --- |
| Versión | `2.5.4` | `package.json`, `src/data/releases.ts` (`APP_VERSION`) |
| Framework | Astro 7.4.0, salida `static` | `astro.config.mjs`, `npm ls` |
| UI | React 19.3.0 + `@astrojs/react` 7.1, TypeScript 5.9 estricto | `package.json`, `tsconfig.json` |
| Iconos | `lucide-react` 0.468 | `package.json` |
| Node | 24.x (instalado 24.14.0) | `package.json` engines |
| Repositorio | git, rama `main`, **con cambios sin commitear** (`package.json`, `astro.config.mjs`, etc.) | `git status` |
| Despliegue | Vercel estático + PWA con service worker | `vercel.json`, `public/sw.js` |
| Dependencias 3D/física/MCU | **Ninguna instalada** | `node_modules` |

> Antes de la etapa 1, conviene commitear o respaldar los cambios pendientes para que el diff de Robótica quede aislado.

## 2. Gestor de ventanas flotantes (reutilizar, no duplicar)

**Archivo:** `src/components/FloatingWindow.tsx` (178 líneas). Estilos: `src/styles/floating-window.css`, `floating-window-touch.css`, `phone-window-navigation.css`. Geometría pura: `src/layout/floatRect.ts` (ya tiene prueba: `qa/verify-float.mjs`). Detección de teléfono: `src/layout/phoneViewport.ts`.

Se usa en ~40 componentes (Panel, Laboratorio, Estudio). Ejemplo simple: `src/lab/LaboratoryBar.tsx:24`.

### API (props)

| Prop | Uso en Robótica |
| --- | --- |
| `title`, `eyebrow` | Título visible. **También es la clave de persistencia** (ver riesgo R-W1). |
| `onClose` | Obligatorio. El estado abierto/cerrado vive en el componente padre. |
| `children`, `actions` | Contenido y barra de acciones inferior. |
| `width`, `side` (`left`/`center`/`right`), `top`, `heightFraction` | Posición y tamaño inicial al abrir. |
| `anchor='bottom'`, `dockFraction` | En pantallas angostas se acopla abajo como hoja. |
| `activation` (número) | Cambiarlo trae la ventana al frente y le da foco. |
| `passive` | No toma foco al abrirse **y no responde a Escape**. |
| `visible` | Ocultar sin desmontar (conserva estado interno, p. ej. el editor). |
| `scaleBody` | Escala el contenido como imagen. En Robótica: `false`. |
| `scope` | Selector del contenedor del portal (por defecto `document.body`). |
| `onMinimize` | Muestra botón minimizar; el padre decide qué hacer. |
| `freeOnTouch`, `showControlsHint`, `className`, `closeLabel` | Ajustes táctiles y de accesibilidad. |

### Comportamiento interno verificado

- **Portal** a `document.body` (o `scope`): la ventana está fuera del árbol DOM del canvas.
- **z-index** global: contador de módulo `nextLayer` desde 300; `raise()` al pulsar la ventana o cambiar `activation`.
- **Arrastre** por la cabecera con `setPointerCapture` y `transform` durante el gesto; **redimensionado** por 8 bordes/esquinas + botón de esquina + teclado (flechas, `Home` = restablecer).
- **Maximizar/restaurar**: botón o doble clic en la cabecera. **Restablecer**: botón en el pie (borra la posición guardada).
- **Persistencia** en `localStorage` con clave `panellab-win-v1:${title}` (posición y, si se redimensionó, tamaño). Solo en pantallas ≥ 700 px o con `freeOnTouch`.
- **Límites**: margen de 8 px, áreas seguras (`env(safe-area-inset-*)`), evita `.compact-bar` arriba y `.tool-dock, .lab-dock, .cab-controls` abajo. Se reencaja al cambiar tamaño u orientación (ResizeObserver + `visualViewport`). Ninguna ventana queda fuera de pantalla.
- **Teléfono** (`isPhoneViewport()`): ocupa el ancho disponible como lámina; en horizontal ocupa el 64 % a la derecha. No se arrastra.
- **Eventos**: `onPointerDown` y `onKeyDown` hacen `stopPropagation()` → arrastrar una ventana no rota la cámara y los atajos del editor no llegan al canvas. ✔ Resuelve dos «gestos conflictivos» del documento 02.
- **Escape**: listener global en fase de captura; cierra la ventana no pasiva de capa superior **aunque el foco esté en el canvas**.
- **Foco**: al abrir enfoca el botón cerrar (salvo `passive` o si un hijo ya tomó el foco); al cerrar devuelve el foco al elemento anterior. `role="dialog"` + `aria-labelledby`.

### Riesgos y cambios mínimos propuestos (retrocompatibles)

| ID | Hallazgo | Cambio mínimo propuesto |
| --- | --- | --- |
| R-W1 | La clave de persistencia es el `title`. «Propiedades» o «Diagnóstico» en Robótica compartirían posición con ventanas homónimas del Laboratorio. | Prop opcional `storageId?: string` (por defecto `title`). Robótica usa `robotica:piezas`, etc. |
| R-W2 | Escape global cierra la ventana superior incluso cuando el usuario quiere cancelar un cable o deseleccionar en el canvas. | Abrir las ventanas de herramientas de Robótica con `passive` y gestionar Escape en el canvas. Solo diálogos modales (confirmar borrado) son no pasivos. Sin cambio de código en `FloatingWindow`. |
| R-W3 | «Restablecer disposición» de todas las ventanas no existe; `forget()` es privada. | Exportar `forgetWindowLayout(storageId)` y, si hace falta, `forgetWindowLayouts(prefix)`. |
| R-W4 | Los límites evitan barras con clases fijas (`.compact-bar`, `.tool-dock`…). | Dar a la barra superior de Robótica la clase `compact-bar` y a la de herramientas `tool-dock`, o añadir el selector `[data-fw-avoid]` a la lista. Preferir reusar las clases. |
| R-W5 | No hay minimizado real (solo callback). | Robótica minimiza con `visible={false}` + chip en la barra para restaurar. Sin cambio en `FloatingWindow`. |

**Conclusión:** el componente es reutilizable directamente. Cambios necesarios: R-W1 y R-W3 (≈10 líneas). Regresión obligatoria: `node qa/verify-float.mjs` y una ventana del Laboratorio abriéndose en la misma posición que antes.

## 3. Inicio (quinta tarjeta)

**Archivo:** `src/components/Home.tsx`. Las tarjetas están en el arreglo `spaces` (líneas 11-16): `panel` (botón, entra al simulador en la misma página) y `study`, `lab`, `community` (enlaces `<a href>`).

| Punto | Detalle | Acción en etapa 1 |
| --- | --- | --- |
| Arreglo `spaces` | 4 elementos con `id`, `name`, `Icon`, `href`, `color` (alterna `dark`/`blue`). | Añadir `{id:'robotics',name:'Robótica',Icon:Bot,href:'/robotica/',color:'dark'}` al final. |
| Carrusel | `if (offset===3) offset=-1;` (línea ~119) está escrito para 4 tarjetas. | Generalizar: `if (offset > spaces.length/2) offset -= spaces.length;` |
| Arte | `/images/home-approved/${id}.webp` 900×900 (`public/images/home-approved/`). | Falta `robotics.webp` (ver decisión D-09). |
| CSS de arte | `.home-module-art.art-*` en `src/styles/modo-home-approved.css` (líneas 82-83). | Añadir reglas `art-robotics` en los breakpoints existentes. |
| Reloj de palabras | Ya incluye `'ROBÓTICA'` en `words`. | Nada. |
| Pruebas | `qa/verify-approved-home.cjs:16` exige **4** `.home-module`; `qa/verify-home-card-gestures.cjs` prueba gestos. | Actualizar a 5 y verificar gestos con 5. |

## 4. Páginas, CSP, service worker y licencias

- Páginas Astro en `src/pages/`. El Laboratorio usa `src/pages/laboratorio.astro` con `<LaboratoryApp client:only="react">` y un fallback `.lab-loading`. **Robótica debe copiar este patrón** en `src/pages/robotica.astro` (así three.js no entra en el bundle del inicio).
- **CSP en build** (`astro.config.mjs`, `protectStaticPages`): `script-src 'self' <hashes>` **sin `'wasm-unsafe-eval'`**, `worker-src 'self' blob:`, `connect-src 'self'`. ⚠ Rapier usa WebAssembly: **se bloqueará en `/robotica/` al hacer build** aunque funcione en `npm run dev` (en dev no se inyecta CSP). Requiere añadir `'wasm-unsafe-eval'` solo a `robotica/index.html` (igual que ya se hace con `geogebra-frame.html`). Verificar también qué CSP reciben los workers (cabeceras de Vercel en `vercel.json` no definen `script-src`, así que el worker no hereda restricción de script; confirmarlo en la etapa 1).
- **Service worker** (`public/sw.js:25`) y precache (`astro.config.mjs`, `stampServiceWorker`): las rutas permitidas son una lista regex `estudio|laboratorio|legal|comunidad|versiones|sin-conexion`. **Añadir `robotica` en ambos sitios** o la página no funcionará sin conexión.
- **Avisos de terceros**: `astro.config.mjs` genera `THIRD_PARTY_NOTICES.txt` con una lista fija de paquetes y **falla el build si falta la licencia**. Añadir cada dependencia nueva (three, @react-three/fiber, @react-three/drei, @dimforge/rapier3d-compat, editor de código, avr8js si se usa).
- `src/data/releases.ts`: cada versión publicada lleva su entrada (Robótica = 2.6.0 al cerrar la etapa 1, a confirmar).

## 5. Sistema de proyectos (`.modo.json`)

**Archivos:** `src/lab/useLaboratory.ts`, `src/lab/model.ts`, `src/lab/validation.ts`.

- Biblioteca en `localStorage['panellab-laboratory-v1']`: `{projects: LabProject[], active}`; máximo 30 proyectos; guardado con retardo de 350 ms + `pagehide`/`beforeunload`.
- Si el guardado previo es ilegible **no se sobrescribe** (`storageBlocked`) y se pide exportar. Buen patrón a copiar.
- Historial deshacer/rehacer: 50 instantáneas del proyecto completo (`past/future`).
- Exportar: `JSON.stringify(project)` → `${nombre}.modo.json`. Importar: límite 2 MB (`MAX_IMPORT_BYTES`), validación estricta campo a campo, se importa **como copia con id nuevo**.
- Formato `{format:'panellab-laboratory', version: 1|2}`. `parseProject` rechaza cualquier otro `format` con mensaje claro → **un proyecto de Robótica con otro `format` no rompe al Laboratorio**. Hay también `modo-equipment` y `modo-cabinet-report`.

**Conclusión:** no mezclar Robótica dentro de `LabProject` (crecería un validador ya grande y acoplaría ciclos). Crear `useRoboticsProjects` copiando el patrón (biblioteca, bloqueo, historial, exportar/importar) con `format:'modo-robotica'`, `version:1` y su propio validador/migrador. Extraer helpers genéricos (`text`, `num`, `list`, `unique`) de `validation.ts` solo si es trivial; si no, duplicarlos en `src/robotics/project/validate.ts`.

## 6. Motores eléctricos existentes

- `src/lab/engine.ts` (75 l.): PLC/escalera, `tick` cada **100 ms** desde `setInterval` en `useLaboratory.ts`.
- `src/lab/dc.ts` (241 l.): resolución DC de la protoboard; componentes con `from/to` (orificios), no instancias con pines.
- `ProtoKind` ya incluye `motor`, `l293d`, `bjt`, `diode` (puente H didáctico en protoboard).
- El ciclo de 100 ms y el modelo `from/to` **no sirven** para PWM, `pulseIn` ni HC-SR04 (confirmado, coincide con la auditoría).

**Conclusión:** el grafo eléctrico de Robótica es nuevo (nodos = pines de instancias), pero puede **reutilizar la idea y, si encaja, el solver** de `dc.ts` para tensiones estáticas en la etapa 3. Investigar en la etapa 3 si `dc.ts` acepta una lista genérica de nodos/ramas; si no, escribir un solver nodal pequeño propio. No modificar `dc.ts`.

## 7. Pruebas existentes (estilo a seguir)

- `qa/*.mjs`: pruebas de lógica pura con `node:assert` y TypeScript ejecutado directamente por Node 24 (ej. `qa/verify-float.mjs` importa `.ts`).
- `qa/*.cjs`: pruebas de interfaz con Playwright cargado desde `C:/Users/HUMANO LAB/.cache/codex-runtimes/.../playwright` y `PANELLAB_URL` (por defecto `http://127.0.0.1:4325/`).
- Scripts en `package.json` → `verify:*`. Robótica añade `verify:robotics-*`.

## 8. Tecnologías candidatas (versiones consultadas en npm el 28/10/2026)

| Paquete | Versión | Licencia | Compatibilidad comprobada |
| --- | --- | --- | --- |
| `three` | 0.186.1 | MIT | — |
| `@react-three/fiber` | 9.8.2 | MIT | peer `react >=19 <19.4` → **compatible con 19.3.0**. ⚠ Bloquea subir React a 19.4 hasta que R3F lo admita. |
| `@react-three/drei` | 10.7.9 | MIT | peer R3F ^9, React ^19. Aporta `CameraControls`/`OrbitControls`, `TransformControls`/`PivotControls`, `Bounds`, `GizmoHelper`, `Line`, `Html`. |
| `@dimforge/rapier3d-compat` | 0.21.0 | Apache-2.0 | WASM embebido en base64 (no requiere servir `.wasm`). Necesita `'wasm-unsafe-eval'`. Funciona en Web Worker. |
| `@react-three/rapier` | 2.2.0 | (verificar) | Envoltorio React. **No recomendado** aquí: la física debe correr en el worker del coordinador, no en el hilo de render. |
| `avr8js` | 0.21.1 | MIT | Emulador ATmega328P en JS puro (timers, GPIO, USART, ADC parcial). **Ejecuta `.hex`; no compila C++.** |
| `codemirror` + `@codemirror/lang-cpp` | 6.0.2 / 6.0.3 | MIT | Ligero, sin workers propios, funciona offline. |
| `@monaco-editor/react` | 4.7.0 | MIT | Pesado (MB), usa workers y CDN por defecto; choca con CSP y offline. No recomendado. |

Hallazgo clave: **compilar C++ de Arduino en el navegador, sin conexión, no tiene solución madura.** Wokwi compila en un servidor remoto. Esto es la decisión D-04.

## 9. Referentes UX (patrones funcionales, sin copiar interfaz)

| Patrón | Referente | Aplicación en Robótica | Riesgo | Decisión |
| --- | --- | --- | --- | --- |
| Lienzo protagonista, herramientas mínimas, inspector contextual | Figma | Canvas 3D a pantalla completa; ventanas flotantes cerradas por defecto. | Descubribilidad para principiantes. | Adoptar + estado vacío guiado. |
| Atajos de una tecla (V mover, R rotar, W cable, F encuadrar) | Figma / Fusion | Mismos atajos, desactivados cuando un campo/editor tiene foco. | Choque con editor de código. | Adoptar (el `stopPropagation` de la ventana ayuda). |
| Gizmo XYZ con ejes de color y entrada numérica | Fusion | `PivotControls`/`TransformControls` + Propiedades. | Gizmo pequeño en táctil. | Adoptar con tamaño adaptable. |
| Uniones rígidas/articuladas, árbol de componentes | Fusion | Ventana Estructura + `attachments`. | Complejidad CAD. | Adoptar versión mínima (rígida, rueda). |
| Colocación sobre plano de trabajo, objetos amistosos | Tinkercad | Arrastrar del catálogo a la superficie con previsualización. | — | Adoptar. |
| Cable pin a pin con resaltado de pin y lista de conexiones | Wokwi | Herramienta Cable, pines con área de toque ampliada. | Pines diminutos en 3D. | Adoptar + zoom automático al pin. |
| Editor junto a la simulación, monitor serie | Wokwi | Ventanas Programación y Consola. | — | Adoptar. |
| Ventanas arrastrables y redimensionables propias | Panel de control (modo.) | `FloatingWindow`. | Ver R-W1…R-W5. | **Obligatorio.** |

## 10. Riesgos verificados (resumen)

1. **CSP + WASM** en build (Rapier). Mitigable con política por página.
2. **Compilación Arduino offline** inexistente de forma madura (D-04).
3. **Techo de React 19.4** por R3F 9.
4. **Tamaño del bundle**: three + drei + rapier ≈ 1,5–2,5 MB sin comprimir; aislado en `/robotica/` con `client:only` y carga diferida del motor físico.
5. **Escape global** de `FloatingWindow` (R-W2).
6. **Pruebas del inicio** cuentan 4 tarjetas (se actualizan, no se borran).
7. **Cambios sin commitear** en el repositorio: aislar antes de empezar.
8. **WebGL perdido / sin GPU**: tablets del aula; necesita estado de error y modo de baja calidad.
