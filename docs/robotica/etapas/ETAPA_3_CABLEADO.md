# Etapa 3 — Cableado, electrónica y diagnóstico

**Requiere:** etapa 2 aprobada; **D-11 resuelta tras verificar el kit físico** (pendiente). Sin ella no se inicia esta etapa.
**Objetivo:** que las piezas formen un circuito conectable y comprobable. Todavía **sin** firmware.

## Tareas

### 3.1 Pines y cables
- [ ] `PinMarkers.tsx`: pines visibles al activar la herramienta Cable o al acercarse; área de toque ampliada (≥ 24 px en pantalla), etiqueta al pasar/tocar.
- [ ] Herramienta Cable (W): clic en pin origen → previsualización → clic en pin destino. Esc cancela. Pin ocupado o incompatible: aviso, no bloqueo (permitir errores didácticos).
- [ ] `WireMesh.tsx`: curva (tubo) entre las posiciones mundiales de los pines; se recalcula al mover piezas; puntos de control editables (`route`); color elegible. **El color nunca implica validez.**
- [ ] Ventana Propiedades para cable: extremos con nombre de instancia y pin («Arduino 1 · D9 → L298N 1 · ENA»), color, borrar.
- [ ] Borrar pieza elimina sus conexiones (con aviso y deshacer).

### 3.2 Grafo y solver (`src/robotics/circuit/`)
- [ ] `graph.ts`: union-find de `instanceId:pinId` usando `connections` + `internalNet` de cada definición.
- [ ] `solve.ts`: tensiones estáticas por net con fuentes (batería, regulador 5 V del L298N según jumper, pin 5V del UNO alimentado por USB virtual o VIN). Evaluar reutilizar la lógica de `src/lab/dc.ts` **sin modificarlo**; si no encaja, solver nodal propio pequeño.
- [ ] Modelos de dispositivo con estados: UNO (alimentado / no; VIN mínimo 7 V), L298N (lógica 5 V presente, motor supply, enable por jumper o pin), motor DC (polaridad), HC-SR04 (VCC 5 V).

### 3.3 Diagnóstico (`diagnostics.ts`) y ventana Consola/Diagnóstico
- [ ] Sin alimentación en un dispositivo; polaridad invertida de batería; masas no comunes entre UNO y L298N; corto entre alimentación y GND; pin de salida a salida; motor sin conectar; TRIG/ECHO sin conectar.
- [ ] Cada diagnóstico resalta los pines implicados en el canvas al hacer clic.
- [ ] Herramienta Medir (multímetro simplificado): tensión entre dos pines y continuidad. Reutilizar el estilo de lectura del multímetro existente si es razonable; no importar el componente del Panel si arrastra dependencias.

## Pruebas

- `qa/verify-robotics-circuit.mjs` (invariantes de `fuentes/03`): pin desconectado no propaga; dos UNO idénticos no mezclan nets; quitar componente elimina sus conexiones; batería invertida → diagnóstico de polaridad; GND no común → diagnóstico; serializar/restaurar idéntico.
- `qa/verify-robotics-wiring-ui.cjs`: cablear UNO D9→ENA, verificar etiqueta del cable, mover el UNO y comprobar que el cable sigue al pin, borrar y deshacer.

## Aceptación

- [ ] Conexiones eléctricas identificables.
- [ ] Continuidad y tensiones consultables.
- [ ] Detecta alimentación ausente, polaridad y masa no compartida.
- [ ] Desmontar pieza invalida sus conexiones.
- [ ] Serialización perfecta; dos Arduino iguales no comparten pines.

**Bloquea si:** el cable visual no coincide con la conexión lógica o se mezclan instancias.
