# Cierre de Etapa 5 — Cubo blanco, física y prueba integral

**Estado:** IMPLEMENTADA, con límites declarados (ver «Desviaciones y límites»). No se publicó: la versión **2.6.1** está preparada en el código, pero el último despliegue es la 2.6.0 Beta. Sin push.
**Fecha:** 29/10/2026 · **Rama:** `robotica/etapa-1` · **Commits:** ver al final.
**Aprobación:** el usuario escribió «ya ahora vamos con la etapa 5» después de aprobar la etapa 4 y confirmar D-06 (Rapier) con el criterio «que funcione, sea realista y tenga rendimiento».

## Qué hace ahora el robot
El mismo proyecto que se construyó (etapa 2), cableó (3) y programó (4) se mueve en un cuarto blanco de 4 × 4 m por causalidad física, sin animaciones predefinidas:

1. El programa maneja los pines del ATmega328P emulado → el circuito (solver nodal) da la tensión de cada motor.
2. Cada motor aplica a su rueda un par `k_t·(V − k_e·ω)/R` (y el opuesto al chasis) sobre una articulación de un eje (Rapier).
3. La rueda rueda sobre el suelo con fricción; el chasis choca con paredes y obstáculos.
4. El HC-SR04 lanza 7 rayos (±15°) desde su pose real cuando el programa lo dispara (TRIG), y la distancia más corta decide el tiempo del eco → el programa la lee con `pulseIn`.

## Archivos (todos bajo `PanelLab-INACAP/`)
- `src/robotics/sim/physics.ts` (nuevo): `RobotPhysics` — cuerpos por piezas unidas con `rigid`, ruedas con `wheel-hinge`, motores, suelo/paredes/obstáculos, haz del sensor, `frame()` con poses, ruedas y rayos.
- `src/robotics/sim/poses.ts` (nuevo): aplica las poses al proyecto para dibujar piezas, pines y cables moviéndose juntos.
- `src/robotics/sim/coordinator.ts`: acepta un `PhysicsPort` opcional; cada paso de 2 ms resuelve el circuito y avanza la física; el sensor mide en el instante del disparo. `SimModel.physics`.
- `src/robotics/sim/sim.worker.ts` + `protocol.ts`: carga Rapier (`import()` + `init()`), mensaje `warm` para precalentar, fallback sin física con aviso.
- `src/robotics/project/commands.ts`: `addObstacle`, `updateObstacle`, `removeObstacle`, `setFriction`.
- `src/robotics/build/BuildCanvas.tsx`: `RoomLayer` (suelo, paredes translúcidas, obstáculos, haz del sensor), `follow` y `frameRobot` (cámara), `partWorld` en depuración.
- `src/robotics/RoboticsApp.tsx`, `windows/BuildWindows.tsx` (`ScenePanel`), `windows/RoboticsWindows.tsx`, `windows/useRoboticsWindows.ts`: ventana **Escenario**, modo Simular con HUD (velocidad y distancia, botón «Seguir»), ▶ entra a Simular, volver a Construir detiene, estado «CARGANDO».
- `src/robotics/catalog/index.ts` y `build/PartMesh.tsx`: rueda loca más alta (43 mm con separador) y anclaje del chasis al **frente** (ver desviaciones).
- Pruebas: `qa/verify-robotics-physics.mjs`, `qa/verify-robotics-sim-ui.cjs`; fixtures `qa/fixtures/robotica/sketches/avoid_obstacle.ino` + `.hex`.
- Documentación: `docs/robotica/GUIA_PRIMERA_PRACTICA.md`; `src/data/releases.ts` (2.6.1, sin publicar).

## Evidencia
| Prueba | Resultado |
| --- | --- |
| `verify-robotics-physics.mjs` (sin interfaz, mismo Rapier y coordinador del worker) | 8 bloques OK |
| · ambos motores iguales | avanza 1,04 m en 3 s, desvío 0,0 %, 0,36 m/s |
| · motor izquierdo con M+/M− invertidos | gira 513° y avanza 0,03 m |
| · sin GND común (placa por USB) | no se mueve (0,1 mm) |
| · evitar obstáculos, caja a 0,75 m | se acerca hasta 0,16 m, gira 113°, nunca la toca (hueco mínimo 0,12 m) |
| · sensor girado 90° | no mide la caja (≥ 1,99 m) y el robot choca |
| · quitar la rueda derecha | giro 291°, avance −0,07 m (con rueda: 1,05 m) |
| · reproducibilidad | 200 muestras de trayectoria y distancia idénticas en dos ejecuciones |
| `verify-robotics-sim-ui.cjs` (dev y build servido, CSP real) | 8 comprobaciones OK: abre en Simular, ▶ mueve el robot por la física sin tocar la caja, Consola con ruedas y distancia, Detener lo devuelve, Escenario agregar/quitar, quitar rueda → resultado distinto, recargar y repetir, sin errores |
| Regresión etapas 1–4 | project 9 · interaction OK · assembly 17 · circuit 10 · mcu 13 · ui 61 · build-ui 36 · wiring-ui 24 · fly-ui 9 · code-ui 12 (dev) · offline-run 4 (build) |
| Inicio aprobado / PWA / contraseña Beta | 10 PASS · PASS · PASS |

## Números de rendimiento (honestos)
- **Rapier solo:** 59 µs por paso de 2 ms virtuales (≈ 3 % del trabajo total); los rayos del sensor se lanzan solo cuando el programa dispara el sensor, no en cada paso.
- **Simulación completa** (emulador + circuito + física) en Node: ≈ 2,0 × tiempo real con física y 2,1–2,3 × sin ella.
- **En el navegador de prueba** (Chromium con GPU simulada, 1280×800): la simulación sigue el tiempo real a ×1 (razón 1,00). El dibujo es el límite: 17,7 fps parado y 13,3 fps ejecutando con render por software. **No se midió en una tablet real**: el criterio «60 fps en escritorio y ≥ 30 fps en la tablet del aula» queda **sin comprobar**; el banco LAN sigue pendiente.
- **Peso:** `sim.worker` pasa de 18,7 KB a **4,4 MB (1,68 MB gzip)** porque incluye Rapier y su wasm (coincide con el spike E3, 1,6 MB). Se descarga en reposo al precalentar y queda en la caché, así que funciona sin conexión (probado). La interfaz (`RoboticsApp`) sigue en 312 KB gzip.

## Criterios de aceptación
| Criterio | Estado |
| --- | --- |
| El robot de las etapas 2–4 se desplaza, gira y evita un obstáculo sin animación predefinida | ✅ (prueba de física y de interfaz) |
| Quitar masa/cable de motor/rueda o girar el sensor cambia el resultado coherentemente | ✅ cable de motor, GND, rueda y sensor probados; «quitar masa» solo por la rueda |
| Volver a Construir, corregir, guardar y ejecutar otra vez | ✅ |
| Sin regresiones en los otros módulos | ⚠️ inicio aprobado y PWA pasan; `verify:modo` y `verify:lab-ui` ya fallaban antes (pre-existentes, ver etapa 1); no se ejecutaron `verify:study`/`verify:offline` |
| 60 fps en escritorio y ≥ 30 fps en tablet | ❌ no medido en dispositivos reales |

## Desviaciones y límites
1. **La rueda loca cambió de medida y de lugar.** Con la geometría de la etapa 2 (rueda loca atrás y de 25 mm) el robot armado se **volcaba hacia el frente**: el peso (placa, batería, sensor) quedaba delante del eje y la rueda loca detrás. Para que el robot armado con los anclajes del chasis quede equilibrado, la rueda loca pasó a medir 43 mm (esfera de 25 mm + separador) y su anclaje en el chasis quedó **adelante**. Es un cambio al catálogo de la etapa 2 (las pruebas de ensamblaje siguen en verde); un proyecto guardado con la rueda loca atrás seguirá cargando pero puede volcarse en la simulación (ese efecto es físico y es parte de lo que se aprende).
2. **Los obstáculos se editan con la simulación detenida** y con números (ventana Escenario), no con el gizmo ni en pausa como pedía 5.3. Es más robusto en tablet; el gizmo queda como mejora.
3. **Motor aproximado:** `k_t = 0,104 N·m/A`, `k_e = 0,286 V·s/rad`, 8 Ω (≈ 0,08 N·m de arranque y 200 rpm en vacío a 6 V). No hay freno eléctrico (motor en corto) ni zona muerta: con |V| < 0,05 V el motor queda libre. El solver del circuito sigue sin fuerza contraelectromotriz propia.
4. **Sin «modo de baja calidad» nuevo:** se reutiliza el que ya bajaba la resolución. Sin sombras de contacto ni luz especial en el cuarto (suelo y paredes simples).
5. **Guía de primera práctica:** es un documento (`GUIA_PRIMERA_PRACTICA.md`), no una guía dentro de la aplicación.
6. **HC-SR04 fuera del robot** (sin unirse a un cuerpo) conserva la «distancia de prueba» de la etapa 4.
7. **Las poses de cables con puntos de paso** se ignoran mientras el robot se mueve (el cable va directo entre sus pines).
8. **Compilador en línea:** sigue sin desplegar; en producción solo se importa `.hex`.

## Riesgos y pendientes
- Rendimiento en tablet/teléfono sin medir (la Beta publicada, 2.6.0, no incluye física: la 2.6.1 sí; **conviene desplegarla solo con tu aprobación** y probarla con el banco LAN antes).
- Medidas del kit (D-08) y voltaje real de la batería (D-11) siguen como supuestos; la física hereda esos números.
- `verify:modo` y `verify:lab-ui` siguen fallando por motivos anteriores a Robótica.

## Próxima etapa sugerida (sin iniciarla)
No hay una etapa 6 definida en `docs/robotica/`. Candidatas, a tu decisión: (a) medir y optimizar en tablet real; (b) gizmo y pausa para editar obstáculos; (c) sensores/actuadores extra (servo, seguidor de línea); (d) desplegar el compilador. Antes: validar las etapas 1–5 y decidir si se publica la 2.6.1 Beta.
