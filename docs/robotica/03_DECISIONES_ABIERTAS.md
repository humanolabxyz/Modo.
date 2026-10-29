# 03 · Decisiones

Revisión del usuario: 28/10/2026. Sonnet no cambia ninguna decisión por su cuenta. Las pendientes se resuelven con la evidencia que pide cada una.

## Criterios generales aprobados

- **Primero en línea, preparado para funcionar sin conexión.** La versión inicial puede depender de un servicio propio (compilación Arduino). Todo lo demás (página, piezas, física, emulador) se sirve desde el mismo origen, sin CDN, y cada dependencia remota queda detrás de una interfaz que pueda sustituirse por una versión local más adelante.
- **Ventanas:** se usa el `FloatingWindow` existente del Panel de control. Prohibido crear otro gestor de ventanas.
- **Construcción 3D tipo pizarra de Figma:** el canvas es protagonista, las herramientas aparecen según el contexto (lo que hay seleccionado y la herramienta activa) y el estudiante manipula libremente.

## Estado

| ID | Tema | Estado | Resolución |
| --- | --- | --- | --- |
| D-01 | Dónde vive Robótica | ✅ Aprobada | Página propia `/robotica/` (`client:only="react"`). |
| D-02 | Stack 3D | ✅ Aprobada | three 0.186.1 + @react-three/fiber 9.8.2 + @react-three/drei 10.7.9, versiones exactas. No subir React a 19.4 mientras R3F no lo admita. |
| D-03 | Cambios en `FloatingWindow` | ✅ Aprobada | `storageId` opcional + exportar `forgetWindowLayout`. Ventanas de herramientas con `passive`. |
| D-04 | Ejecución del código Arduino | ✅ Aprobada (29/10/2026) | avr8js + compilador remoto + importar .hex (spike E1–E4 superado; implementada en etapa 4). El compilador solo existe en desarrollo: su alojamiento y despliegue siguen pendientes. Contexto: el usuario prefiere **emulación real del ATmega328P** en lugar de un intérprete propio. Ver detalle abajo. |
| D-05 | Editor de código | ✅ Aprobada | CodeMirror 6. |
| D-06 | Física | ✅ Confirmada (29/10/2026) | Rapier (`@dimforge/rapier3d-compat` 0.21.0). La etapa 1 incluye un banco de rendimiento e integración; el banco de la etapa 1 cumplió los umbrales. Criterio del usuario: que funcione, sea realista y rinda bien; se carga solo al pulsar Simular, con reloj fijo 1/240 s, y se mide en tablet real. |
| D-07 | Modelos 3D | ✅ Aprobada | Geometría procedural en v1. |
| D-08 | Medidas de piezas | ✅ Aprobada | Ficha técnica o medición del kit; si no, `approximate` declarado. |
| D-09 | Arte de la tarjeta del inicio | ⏸ Pendiente | La tarjeta usa el icono `Bot` sin ilustración hasta que llegue el recurso. El carrusel no debe depender de la imagen. |
| D-10 | Versión publicada | ✅ Aprobada | **2.6.0 Beta**, solo después de validar la etapa 1. Antes de eso, nada en `releases.ts`. |
| D-11 | Alimentación del robot | ⏸ Pendiente | Hasta verificar el kit físico. La etapa 3 no se inicia sin resolverla. |
| D-12 | Móvil | ✅ Aprobada | Tablet: todo. Teléfono: abrir, simular, ver código; construcción reducida con aviso honesto. |

## D-04 en detalle: emulación real del ATmega328P

### Lo que ya está comprobado

- `avr8js` 0.21.1 (MIT, actualizado en agosto de 2026) emula el núcleo AVR del ATmega328P y es el motor del simulador de Wokwi. Lo usa también el *Arduino Robot Virtual Lab* de Dawson College, un precedente de robótica educativa.
- `avr8js` **solo ejecuta código máquina ya compilado** (`.hex`). No compila C++. Los periféricos externos (L298N, motores, HC-SR04) los simulamos nosotros. Eso ya estaba previsto como dispositivos del coordinador.
- El service worker actual solo intercepta `GET` del mismo origen. Un `POST /api/compile` pasaría directo a la red, sin cambios en `sw.js`.

### Arquitectura propuesta (a confirmar con el spike)

```
Sketch .ino ──► Compiler (interfaz)  ──►  .hex  ──►  avr8js en sim.worker  ──►  PinBus ──► circuito / dispositivos
                 ├─ RemoteCompiler: POST /api/compile (arduino-cli + avr-gcc)   ← v1, en línea
                 ├─ HexImport: el estudiante sube un .hex del Arduino IDE       ← sin conexión, desde v1
                 └─ (futuro) compilador local o WASM                            ← sin conexión completo
```

- El `.hex` compilado se guarda en el proyecto como artefacto regenerable (`firmware.artifact`, con hash del código fuente). **Un proyecto ya compilado se puede ejecutar sin conexión.** Solo recompilar necesita red.
- El compilador vive en el **mismo origen** (`connect-src 'self'` sigue valiendo). Descartados: el servicio público de Wokwi (de terceros, sin acuerdo de uso) y compiladores en el navegador (inmaduros, decenas de MB).

### Lo que el spike de la etapa 1 debe demostrar

1. **Emulación:** un `.hex` de Blink corre en `avr8js` dentro de un Web Worker y conmuta D13 cada 1 000 ms virtuales (±1 ms).
2. **Periféricos necesarios para el robot:** `analogWrite` (PWM en D5, D6, D9, D10 por Timer0/1/2) → ciclo útil medido; `micros()`/`pulseIn()` con un pulso inyectado en un pin; `Serial.println` leído por USART; `analogRead` (ADC). Por cada uno: soportado / parcial / no soportado.
3. **Velocidad:** relación tiempo virtual / tiempo real en escritorio y en la tablet del aula (objetivo ≥ 1×, es decir, 16 MHz en tiempo real).
4. **Compilación:** prototipo **local** de `/api/compile` con `arduino-cli` (`arduino:avr:uno`). Medir tiempo de compilación, tamaño de la cadena de herramientas y errores devueltos con línea. Evaluar dónde alojarlo: función de Vercel (límite de tamaño, arranque en frío, solo `/tmp` escribible) frente a un contenedor pequeño propio. **Instalar `arduino-cli` en el equipo y desplegar el servicio necesitan aprobación aparte.** `AGENTS.md` prohíbe desplegar sin permiso.
5. **Seguridad del compilador:** límite de tamaño del sketch, tiempo máximo, sin `#include` de rutas del sistema, solo librerías de una lista permitida, y límite de peticiones.

**Si el spike sale bien,** D-04 queda: avr8js + RemoteCompiler + HexImport. **Si avr8js no cubre PWM/pulseIn o no alcanza la velocidad,** se presenta la evidencia y se decide de nuevo. El intérprete propio queda solo como último recurso.

## D-06 en detalle: umbrales del banco de Rapier (etapa 1)

| Medida | Umbral para aprobar |
| --- | --- |
| Carga e inicialización del WASM en el worker | < 1 s en escritorio, < 2,5 s en tablet |
| Paso de física (robot 2WD: ~10 cuerpos, 2 articulaciones de rueda con motor, 5 obstáculos, 5 rayos de sensor) a 240 Hz | < 1 ms por paso en escritorio, < 3 ms en tablet |
| Estabilidad | 60 s de avance recto sin explosiones ni ruedas que atraviesen el suelo |
| Determinismo | misma entrada → misma trayectoria (dos ejecuciones idénticas) |
| Build | funciona con la CSP de `/robotica/` que añade `'wasm-unsafe-eval'`; el resto de páginas no cambia |
| Peso | tamaño añadido (gzip) informado; no entra en el bundle del inicio |

## Preguntas abiertas para el usuario

1. ¿Qué kit físico usa el aula (chasis, motores, batería)? Resuelve D-08 y D-11.
2. ¿Dónde se aloja el compilador cuando salga el spike: Vercel o un servicio aparte? Lo decides con los números del spike.
3. ¿Los estudiantes usan Arduino IDE? Define la prioridad de HexImport.
4. ¿Quién produce la ilustración de la tarjeta (D-09)?
