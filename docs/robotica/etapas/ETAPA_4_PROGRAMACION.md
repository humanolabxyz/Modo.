# Etapa 4 — Programación Arduino y coordinación temporal

**Requiere:** etapa 3 aprobada; D-04 cerrada con los spikes E1/E2 de la etapa 1; ubicación del compilador aprobada; despliegue del compilador autorizado por el usuario.
**Objetivo:** ejecutar el sketch del estudiante en un worker, con reloj fino, afectando realmente el circuito.

## Tareas

### 4.1 Editor (ventana Programación)
- [ ] CodeMirror 6 con resaltado C++, números de línea, marcas de error; plantilla inicial `setup()/loop()`.
- [ ] Mantener la ventana `passive` y confiar en el `stopPropagation` de teclado de `FloatingWindow` para aislar los atajos. Verificar que Ctrl+Z en el editor no deshace el proyecto y que la rueda del ratón desplaza el código sin hacer zoom en el canvas.
- [ ] Selector de placa destino (qué Arduino del proyecto ejecuta el sketch). Guardado del sketch en `firmware[]` con historial propio del editor (no del proyecto por cada tecla).

### 4.2 Compilación y emulación real (D-04)
- [ ] `RemoteCompiler` (`POST /api/compile`, mismo origen) con los límites de seguridad del spike E2. Errores de `avr-gcc` traducidos a mensajes en español con línea en el editor.
- [ ] `HexImport`: subir un `.hex` del Arduino IDE («Exportar binario compilado») cuando no haya conexión.
- [ ] Guardar el `.hex` en `firmware.artifact` con `sourceHash`. Si el código cambió, aviso «hay que recompilar». Un proyecto compilado se ejecuta sin conexión.
- [ ] `mcu/avr/`: `avr8js` en el worker, puertos B/C/D mapeados a D0–D13/A0–A5, Timer0/1/2 (millis, PWM), USART (Serial) y ADC, según la tabla de soporte del spike E1. Lo no soportado se declara en la UI.
- [ ] Implementa `McuRuntime` y `Compiler` (`02_ARQUITECTURA` §5).

### 4.3 Worker y coordinador
- [ ] `sim.worker.ts` + `coordinator.ts`: reloj virtual, pasos, `PinBus` conectado a `circuit/solve.ts` y a los dispositivos.
- [ ] Estado RUN / PAUSA / STOP en la barra; velocidad ×0,25–×4.
- [ ] Protección: presupuesto de tiempo real por cuadro; bucle sin `delay` no congela la UI; Detener siempre funciona (terminate + recrear worker).
- [ ] Monitor serie mínimo en la ventana Consola.

### 4.4 Dispositivos con tiempo
- [ ] LED externo + resistencia (para la prueba de aceptación) como piezas de catálogo simples.
- [ ] L298N: salida OUT según IN1/IN2 y ENA (ciclo útil PWM promediado por paso).
- [ ] HC-SR04 en **banco de prueba controlado**: distancia fija configurable (la física llega en la etapa 5); TRIG ≥ 10 µs → ECHO de `2·d/343` s medido por `pulseIn`.

## Pruebas

- `qa/verify-robotics-mcu.mjs` (con `.hex` de prueba versionados en `qa/fixtures/robotica/`, para no depender del compilador): Blink conmuta D13 cada 1 000 ms virtuales (±1 ms); cambiar `delay(1000)` por `delay(200)` cambia el periodo; `analogWrite(9,128)` → ciclo útil 0,5 ±0,01; `pulseIn` con distancia simulada 0,30 m → ≈1 749 µs; sketch `while(1){}` → la UI sigue respondiendo y Detener funciona; error de sintaxis devuelto por el compilador → línea correcta; sin conexión → se ofrece el artefacto guardado o HexImport.
- `qa/verify-robotics-code-ui.cjs`: escribir sketch, ejecutar, ver LED encendido en 3D; retirar el cable del LED → no enciende; quitar batería → UNO apagado; recargar → sketch conservado.

## Aceptación

- [ ] Sketch enciende LED externo conectado.
- [ ] Cambio de programa cambia la señal.
- [ ] Sin alimentación o con cable retirado, falla observable.
- [ ] PWM altera la salida.
- [ ] TRIG/ECHO recibe distancias coherentes en prueba controlada.
- [ ] Timeout o sketch bloqueante no congela el canvas.
- [ ] Guardar/abrir recupera el sketch.

**Bloquea si:** se anima un LED sin programa, la UI se congela o el tiempo del sensor es ficticio.
