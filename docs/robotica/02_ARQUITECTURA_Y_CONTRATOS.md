# 02 · Arquitectura y contratos

Las decisiones marcadas «recomendado» dependen de `03_DECISIONES_ABIERTAS.md`. Los tipos son el contrato: Sonnet debe implementarlos tal cual o justificar el cambio en el informe de etapa.

## 1. Vista general

```
/robotica/  (src/pages/robotica.astro, client:only="react")
└── RoboticsApp ─────────────────────────────────────────────── hilo principal
    ├── useRoboticsProjects  → biblioteca localStorage 'modo-robotica-v1', historial, import/export
    ├── RoboticsBar (.compact-bar)  nombre · guardado · deshacer/rehacer · Construir|Simular
    ├── ToolDock   (.tool-dock)     seleccionar · mover · rotar · cable · medir · encuadrar
    ├── BuildCanvas  (R3F)          piezas, gizmos, pines, cables          ← modo Construir
    ├── SimCanvas    (R3F)          cubo blanco, poses desde el worker     ← modo Simular
    └── Ventanas (FloatingWindow, passive): Piezas · Estructura · Propiedades · Programación · Consola
                         │  postMessage (comandos / instantáneas)
                         ▼
    sim.worker.ts ──────────────────────────────────────────── Web Worker
    └── Coordinator (reloj virtual µs)
        ├── McuRuntime     (sketch → pines)           etapa 4
        ├── CircuitSolver  (pines → tensiones, driver) etapa 3
        ├── Devices        (L298N, motor DC, HC-SR04, batería)
        └── PhysicsWorld   (Rapier: chasis, ruedas, obstáculos, raycast del sensor) etapa 5
```

Principio: **el proyecto (`RobotProject`) es la única fuente de verdad**. Construir lo edita; Simular lo compila a un `SimModel` inmutable y lo envía al worker. La simulación nunca escribe en el proyecto (salvo el registro de consola, que es transitorio).

## 2. Stack recomendado (fijar versiones exactas, sin `^`)

| Capa | Paquete | Versión |
| --- | --- | --- |
| Render 3D | `three` · `@react-three/fiber` · `@react-three/drei` | 0.186.1 · 9.8.2 · 10.7.9 |
| Tipos | `@types/three` | la que corresponda a 0.186 |
| Física | `@dimforge/rapier3d-compat` (en el worker, sin envoltorio React) | 0.21.0 |
| Editor | `codemirror` + `@codemirror/lang-cpp` | 6.0.2 · 6.0.3 |
| MCU | `avr8js` (emulación real ATmega328P), **sujeto al spike D-04** | 0.21.1 |
| Compilación | Servicio propio `/api/compile` con `arduino-cli` (en línea) + importación de `.hex` (sin conexión) | según spike |

No instalar nada fuera de esta tabla sin aprobación. Cada paquete nuevo → `THIRD_PARTY_NOTICES` en `astro.config.mjs`.

## 3. Estructura de carpetas

```
src/pages/robotica.astro
src/styles/robotics.css
src/robotics/
  RoboticsApp.tsx               # shell: barra, dock, modo, ventanas
  windows/
    useRoboticsWindows.ts       # qué ventanas están abiertas/visibles + activation (NO es un gestor de ventanas)
    PartsWindow.tsx  StructureWindow.tsx  PropertiesWindow.tsx  CodeWindow.tsx  ConsoleWindow.tsx
  project/
    types.ts                    # RobotProject y afines (sección 4)
    defaults.ts                 # newRobotProject(), plantilla de ejemplo opcional
    validate.ts                 # parseRobotProject(unknown) → {ok,project}|{ok:false,error}
    migrate.ts                  # migraciones por versión
    useRoboticsProjects.ts      # biblioteca, historial, import/export (patrón de useLaboratory)
    commands.ts                 # operaciones puras: addPart, movePart, attach, connect, removePart…
  catalog/
    index.ts                    # ComponentDefinition[] por id
    parts/arduinoUno.ts  l298n.ts  hcsr04.ts  dcMotor.ts  wheel.ts  caster.ts  chassis2wd.ts  battery.ts  bracket.ts
    meshes/                     # geometría procedural (React) por pieza
  build/
    BuildCanvas.tsx  PartMesh.tsx  PinMarkers.tsx  WireMesh.tsx  TransformGizmo.tsx  useCanvasShortcuts.ts  snapping.ts  interference.ts
  circuit/
    graph.ts                    # nets a partir de connections (union-find)
    solve.ts                    # tensiones / estados por net
    diagnostics.ts              # alimentación ausente, polaridad, GND no común, cortos
  mcu/
    types.ts                    # McuRuntime, PinBus, Compiler
    avr/                        # avr8js: carga de .hex, mapa de puertos B/C/D → pines UNO, timers, USART, ADC
    compiler/remote.ts          # POST /api/compile (en línea)
    compiler/hexImport.ts       # .hex del Arduino IDE (sin conexión)
  interaction/
    tools.ts                    # máquina de estados de herramientas (seleccionar, mover, rotar, cable, medir, mano)
    gestures.ts                 # arbitraje: cámara vs pieza vs pin vs ventana
    ContextToolbar.tsx          # barra contextual junto a la selección (tipo Figma)
    ContextMenu.tsx             # clic secundario / pulsación larga
    shortcuts.ts                # atajos, inactivos con foco en campos o editor
api/ (o servicio aparte)        # compilador; ubicación decidida tras el spike
  sim/
    sim.worker.ts  coordinator.ts  devices/*.ts  physics.ts  protocol.ts  compileSimModel.ts
  sim-view/
    SimCanvas.tsx  WhiteRoom.tsx  Obstacles.tsx  SimControls.tsx
qa/verify-robotics-*.mjs / *.cjs
```

## 4. Modelo canónico `RobotProject` (contrato)

Unidades: **metros, radianes, voltios, amperios, segundos**. Ejes: Y arriba (convención three.js). Todos los IDs son `string` únicos generados con `crypto.randomUUID()`.

```ts
// src/robotics/project/types.ts
export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];            // x,y,z,w
export type Transform = {position: Vec3; rotation: Quat; scale?: Vec3}; // scale solo si la definición lo permite

export type PartInstance = {
  instanceId: string;
  definitionId: string;            // 'arduino-uno-r3' | 'l298n-module' | 'hc-sr04' | 'dc-motor-tt' | 'wheel-65' | ...
  label: string;                   // 'Arduino 1', editable
  transform: Transform;            // relativo al mundo; si está unido, se recalcula desde el padre
  locked?: boolean;
  groupId?: string;
  props?: Record<string, number | string | boolean>; // validadas contra definition.props
};

export type Attachment = {
  id: string;
  kind: 'rigid' | 'wheel-hinge';   // rueda = articulación de un eje
  parent: {instanceId: string; anchorId: string};
  child:  {instanceId: string; anchorId: string};
  axis?: Vec3;                     // solo wheel-hinge, en coordenadas del ancla del padre
};

export type PinRef = {instanceId: string; pinId: string};
export type Connection = {
  id: string;
  a: PinRef; b: PinRef;            // LA conexión lógica. Nada más define el circuito.
  color: string;                   // presentación
  route?: Vec3[];                  // puntos de control, presentación
};

export type Firmware = {
  id: string;
  targetInstanceId: string;        // qué Arduino ejecuta este sketch
  board: 'arduino-uno-r3';
  source: string;                  // sketch .ino
  artifact?: {                     // regenerable; permite ejecutar sin conexión un proyecto ya compilado
    hex: string;                   // Intel HEX
    origin: 'remote-compiler' | 'hex-import';
    sourceHash: string;            // sha-256 del source compilado; si no coincide, "hay que recompilar"
    compiledAt: string;
  };
  updatedAt: string;
};

export type Obstacle = {id: string; shape: 'box' | 'cylinder'; transform: Transform; size: Vec3};
export type Scene = {obstacles: Obstacle[]; robotStart: Transform; physics: {gravity: number; friction: number}};

export type Workspace = {camera?: {position: Vec3; target: Vec3}; mode?: 'build' | 'simulate'};

export type RobotProject = {
  format: 'modo-robotica';
  version: 1;
  id: string;
  name: string;
  createdAt: string; updatedAt: string;
  parts: PartInstance[];
  attachments: Attachment[];
  connections: Connection[];
  firmware: Firmware[];
  scene: Scene;
  workspace: Workspace;           // la selección NO se persiste
};
```

### Catálogo (contrato)

```ts
export type PinDefinition = {
  id: string;                      // 'D9', 'GND.1', 'IN1', 'OUT1', 'TRIG', 'VCC'...
  label: string;
  position: Vec3;                  // local a la pieza, para render y picking
  role: 'power-in' | 'power-out' | 'ground' | 'digital' | 'analog' | 'pwm' | 'motor' | 'signal';
  electrical?: {vMax?: number; iMax?: number};
  internalNet?: string;            // pines unidos internamente (ej. los GND del UNO)
};
export type AnchorDefinition = {id: string; position: Vec3; normal: Vec3; accepts: string[]};
export type ComponentDefinition = {
  id: string; name: string; category: 'control' | 'driver' | 'sensor' | 'actuator' | 'power' | 'structure';
  dimensions: Vec3;                // caja envolvente en metros; 'verified' indica si se midió contra ficha
  dimensionsSource: 'datasheet' | 'measured' | 'approximate';
  massKg: number;
  pins: PinDefinition[];
  anchors: AnchorDefinition[];
  props?: {id: string; label: string; type: 'number' | 'boolean' | 'enum'; min?: number; max?: number; options?: string[]; default: unknown}[];
  scalable: false;                 // en v1 ninguna pieza electrónica escala
  model: 'procedural';             // GLB en el futuro, con licencia registrada
};
```

### Reglas de integridad (validador)

- IDs únicos por colección; `definitionId` existente; `pinId`/`anchorId` existentes en la definición de **esa** instancia.
- Una conexión no une un pin consigo mismo ni se duplica (par no ordenado).
- `removePart(id)` elimina sus `attachments`, `connections` y el `firmware` cuyo `targetInstanceId` sea esa instancia (con aviso).
- Números finitos y en rango; textos acotados; listas con máximos (≤ 200 piezas, ≤ 1 000 conexiones, sketch ≤ 64 KB). Import ≤ 2 MB.
- Archivo de otro `format` → error claro («Este archivo es de Laboratorio; ábrelo en Laboratorio»).

## 5. Contratos entre motores

```ts
// circuito: entrada = proyecto, salida = nets y diagnósticos estáticos
export type NetId = string;
export type CircuitGraph = {netOf: Map<string /*instanceId:pinId*/, NetId>; nets: Map<NetId, PinRef[]>};
export type Diagnostic = {severity: 'error' | 'warning' | 'info'; code: string; message: string; refs: PinRef[]};

// MCU: el runtime solo ve un bus de pines y un reloj
export interface PinBus {
  digitalRead(pin: string): 0 | 1;
  analogRead(pin: string): number;                 // 0..1023
  setPinMode(pin: string, mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'): void;
  writeDigital(pin: string, v: 0 | 1, atUs: number): void;
  writePwm(pin: string, duty: number, atUs: number): void;   // 0..1
  serial(text: string): void;
}
export interface McuRuntime {                       // implementación: avr8js
  load(hex: string): {ok: true} | {ok: false; error: string};
  runUntil(us: number, bus: PinBus): 'running' | 'halted' | {error: string};
  reset(): void;
}
export type CompileResult =
  | {ok: true; hex: string; sizeBytes: number; warnings: string[]}
  | {ok: false; errors: {line: number; column?: number; message: string}[]};
export interface Compiler {                         // RemoteCompiler hoy; uno local en el futuro
  available(): Promise<boolean>;                    // false sin conexión → la UI ofrece HexImport o el artefacto guardado
  compile(source: string, board: 'arduino-uno-r3'): Promise<CompileResult>;
}

// dispositivos: avanzan con el reloj del coordinador
export interface SimDevice {
  id: string;                                       // instanceId
  step(dtUs: number, nets: NetState, world: PhysicsQuery): void;
}

// worker ↔ UI
export type ToWorker =
  | {t: 'load'; model: SimModel} | {t: 'start'} | {t: 'pause'} | {t: 'reset'}
  | {t: 'set-obstacle'; obstacle: Obstacle} | {t: 'speed'; factor: number};
export type FromWorker =
  | {t: 'snapshot'; simTimeUs: number; poses: Record<string, Transform>; pins: Record<string, number>; devices: Record<string, unknown>}
  | {t: 'serial'; text: string} | {t: 'diagnostic'; d: Diagnostic} | {t: 'error'; message: string};
```

### Coordinador temporal

- Reloj virtual en microsegundos, independiente del tick de 100 ms del Laboratorio.
- Paso de física fijo (p. ej. 1/240 s = 4 166 µs). Entre pasos de física, el MCU avanza hasta el siguiente evento o el siguiente paso.
- PWM: se modela por **ciclo útil promedio por paso físico** para motores (documentado como aproximación) y como flancos reales en el bus para lecturas digitales.
- HC-SR04: al detectar flanco de TRIG ≥ 10 µs, el dispositivo hace raycast desde la pose del sensor (cono configurable, alcance 0,02–4 m), y programa ECHO en alto durante `2·d/343 m/s`. `pulseIn` del sketch mide ese ancho con el reloj virtual.
- Presupuesto: si un sketch consume más de N ms reales por cuadro, el worker pausa y reporta «programa bloqueante»; la UI sigue respondiendo porque vive en otro hilo. Botón Detener siempre funcional (`worker.terminate()` como último recurso).

## 6. Persistencia

- `localStorage['modo-robotica-v1']` = `{projects: RobotProject[], active: string}`; máx. 30 proyectos; mismo patrón de bloqueo ante datos ilegibles que `useLaboratory`.
- Exportar: `${nombre}.modo.json` con `format:'modo-robotica'`. Importar: copia con id nuevo, validación completa, migración por `version`.
- Historial deshacer/rehacer: 50 instantáneas (las operaciones de `commands.ts` son puras e inmutables). Un arrastre del gizmo = un paso de historial (al soltar).
- Disposición de ventanas: la persiste `FloatingWindow` (clave `panellab-win-v1:robotica:*`). No se guarda en el proyecto.

## 7. Integración con el sitio

- `src/pages/robotica.astro` copia la cabecera de `laboratorio.astro` (fuentes, manifest, `MotionHead`, `ModoSplash`, clases `modo-soft-ui modo-identity`).
- CSP de build: política específica para `robotica/index.html` con `'wasm-unsafe-eval'` añadido a `script-src` (resto igual).
- **En línea primero, preparado para sin conexión:**
  - `public/sw.js` responde desde caché todo `GET` del mismo origen que ya visitaste. Añadir `robotica` a la regex de `pageKey` hace que `/robotica/` funcione sin conexión después de la primera visita. Los `POST` al compilador no pasan por el service worker.
  - ⚠ `stampServiceWorker` precachea **todos** los archivos `/_astro/`. Los chunks de three/Rapier/avr8js (~2 MB) se descargarían en cada instalación de la PWA aunque el usuario nunca abra Robótica. En la etapa 1, excluir del precache los chunks que solo importa `/robotica/` (identificarlos desde el build). Se cachean al visitarla. El paquete de viaje sin conexión podrá incluirlos más adelante.
  - Sin CDN: fuentes, WASM y modelos se sirven desde el propio sitio.
- `THIRD_PARTY_NOTICES`: añadir los paquetes nuevos.
- `src/data/releases.ts`: entrada nueva al publicar cada etapa.
- Estilos: tokens existentes (`modo-tokens.css`, `modo-soft-ui.css`). El cubo blanco usa la paleta clara del inicio. Nada de identidad nueva.
