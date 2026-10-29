# Etapa 5 — Cubo blanco, física y prueba integral

**Requiere:** etapa 4 aprobada; D-06 confirmada con el spike E3 de la etapa 1 (si no cumplió los umbrales, nueva decisión antes de empezar).
**Objetivo:** el mismo robot construido, cableado y programado se mueve en un escenario 3D por causalidad real.

## Tareas

### 5.1 Compilar el modelo de simulación
- [ ] `compileSimModel.ts`: `RobotProject` → cuerpos rígidos (masa por pieza, colisión por OBB/cilindro), uniones (`rigid` → fixed joint, `wheel-hinge` → revolute joint con motor), dispositivos y nets. Si falta algo esencial, lista de bloqueos legible («La rueda derecha no está unida a un motor»), pero permitir ejecutar fallas didácticas seguras.

### 5.2 Física en el worker (`physics.ts`)
- [ ] Cargar `@dimforge/rapier3d-compat@0.21.0` en el worker (init asíncrono). Comprobar CSP `'wasm-unsafe-eval'` en build.
- [ ] Gravedad, suelo, paredes del cubo, obstáculos, fricción configurable.
- [ ] Motor DC: par = k·(V_efectiva − k_e·ω)/R (modelo de primer orden), con V_efectiva desde la salida del L298N. Parámetros aproximados documentados.
- [ ] HC-SR04: raycast desde la pose real del sensor (cono por varios rayos), alcance 0,02–4 m. Girar el sensor cambia la lectura.

### 5.3 Vista Simular
- [ ] `WhiteRoom.tsx`: suelo, paredes, luz suave, sombras de contacto; paleta clara de modo.
- [ ] Poses interpoladas desde instantáneas del worker; cámara orbital y de seguimiento.
- [ ] Añadir/mover obstáculos (con el gizmo de la etapa 2) en pausa.
- [ ] Iniciar / Pausar / Reiniciar; volver a Construir sin perder nada.
- [ ] Observación contextual: al seleccionar motor, sensor o pin, mostrar tensión, ciclo útil, distancia medida y errores.

### 5.4 Cierre
- [ ] Guía de primera práctica (montaje → cableado → sketch de evitar obstáculos → prueba), sin hacer el trabajo por el estudiante.
- [ ] Rendimiento: 60 fps en escritorio, ≥ 30 fps en la tablet del aula; modo de baja calidad. Repetir el banco E3 con el robot real del proyecto y documentar ms por paso, emulador incluido.
- [ ] Responsive según D-12.
- [ ] Entrada en `src/data/releases.ts`.

## Pruebas

- `qa/verify-robotics-physics.mjs` (sin UI, worker en Node o coordinador directo): con ambos motores al 100 % el robot avanza en línea recta (desvío < 5 %); motor izquierdo invertido → gira; sin GND común → no se mueve; sketch de evitar obstáculos con caja a 0,5 m → se detiene o gira antes de 0,15 m; girar el sensor 90° → no detecta la caja; mismo proyecto y semilla → misma trayectoria (reproducible).
- `qa/verify-robotics-sim-ui.cjs`: flujo completo desde proyecto guardado; volver a Construir, quitar una rueda, ejecutar → comportamiento distinto; recargar y repetir.
- Regresión completa: Laboratorio, Panel, Estudio, Comunidad (`verify:modo`, `verify:lab-ui`, `verify:study`, `verify:approved-home`, `verify:pwa`, `verify:offline`).

## Aceptación

- [ ] El robot de las etapas 2–4 se desplaza, gira y evita un obstáculo sin animación predefinida.
- [ ] Quitar masa, cable de motor o rueda, o girar el sensor cambia el resultado coherentemente.
- [ ] Volver a Construir, corregir, guardar y ejecutar otra vez.
- [ ] Sin regresiones en los otros cuatro módulos.

**Bloquea el cierre si:** no hay causalidad entre montaje, código y física, o el experimento guardado no se reproduce.
