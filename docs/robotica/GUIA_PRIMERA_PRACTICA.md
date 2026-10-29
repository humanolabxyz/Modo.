# Guía de primera práctica — «Robot que evita obstáculos»

Pensada para que la persona que aprende **arme, cablee y programe ella misma**. Esta guía solo da el orden, las preguntas que conviene hacerse y cómo comprobar cada paso; no entrega el robot hecho. El programa de referencia está al final, aparte, para comparar cuando ya se intentó.

**Tiempo:** 60–90 min. **Requisitos:** abrir Robótica (Beta) en un computador o tablet.

## 1. Montaje (modo Construir)
1. Abre **Piezas** y agrega el **Chasis 2WD**.
2. Une los dos **motores TT** a las ranuras del chasis (izquierda y derecha) y una **rueda** en el eje de cada motor.
3. Une la **rueda loca**, la **placa Arduino UNO**, el **driver L298N** y el **portapilas**. Coloca el **soporte del sensor** al frente y el **HC-SR04** sobre él.
4. Comprueba: ¿hay piezas marcadas en rojo por interferir? ¿Las ruedas tocan el suelo? ¿El sensor mira hacia adelante?

> Pregunta para pensar: ¿por qué la rueda loca va **adelante** y las ruedas con motor atrás? (Mira dónde queda el peso.)

## 2. Cableado (herramienta Cable, tecla W)
Conecta, en este orden, y revisa la **Consola** después de cada grupo:
1. Alimentación: portapilas → driver (+12V y GND) y portapilas → placa (VIN y GND). Sube el voltaje del portapilas si la placa no se enciende (la placa necesita ≥ 7 V por VIN).
2. Motores: cada motor a una salida del driver (OUT1/OUT2 el izquierdo, OUT3/OUT4 el derecho).
3. Control: las entradas del driver (IN1–IN4, ENA, ENB) a pines digitales y PWM de la placa.
4. Sensor: VCC a 5V, GND a GND, TRIG y ECHO a dos pines digitales.
5. Herramienta **Medir** (M): comprueba que el driver recibe tensión y que todos los GND están unidos.

## 3. Programa (ventana Programación)
Objetivo: avanzar; si el sensor mide menos de 20 cm, girar un momento y seguir.
- Piensa en tres funciones: **medir la distancia**, **mover los motores** (¿qué combinación de IN1–IN4 es «adelante»?) y **decidir**.
- Para medir: TRIG en alto 10 µs, y `pulseIn` sobre ECHO; la distancia en cm es el tiempo en µs dividido por 58.
- Compila (o importa un `.hex` si trabajas sin servicio de compilación).

## 4. Prueba (modo Simular)
1. Abre **Escenario** y agrega una **Caja** a unos 70 cm del frente del robot.
2. Pulsa ▶. Observa: ¿avanza recto? ¿Gira antes de tocar la caja? Abre **Consola → Serie y estado** para ver la distancia medida y la velocidad de cada rueda.
3. Prueba a **provocar fallas** y explica qué pasa y por qué:
   - invierte los cables de un motor;
   - quita un cable de GND entre el driver y la placa;
   - gira el sensor 90°;
   - quita una rueda;
   - cambia la fricción del suelo.
4. Detén (■), corrige y vuelve a ejecutar. El proyecto se guarda solo.

## Programa de referencia (para comparar, no para copiar)
Ver `qa/fixtures/robotica/sketches/avoid_obstacle.ino`. Pines usados: IN1=D4, IN2=D7, IN3=D8, IN4=D12, ENA=D5, ENB=D6, TRIG=D9, ECHO=D10.

## Límites a recordar
- La física es **aproximada** (motor TT y pilas supuestos); sirve para entender causas y efectos, no para predecir el robot real al milímetro.
- Las medidas de varias piezas son aproximadas hasta medir el kit (D-08) y el voltaje real de la batería sigue siendo un supuesto (D-11).
