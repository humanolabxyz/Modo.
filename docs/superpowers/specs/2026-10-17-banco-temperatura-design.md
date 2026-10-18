# Banco de temperatura (Pt100 / termocupla) — diseño

17 de octubre de 2026. Aprobado en conversación; implementado en la misma sesión. Primera entrega práctica del mapa maestro tras GeoGebra (guía G03 de Instrumentación Industrial).

## Decisiones

- Nueva herramienta **Temperatura** en el Laboratorio y tres lecciones en Estudio → Instrumentación Industrial → Unidad 2, una por experiencia de G03.
- **Pizarrón del simulador**: lienzo con `PanStage` (desplazar, Ctrl/Cmd + rueda, pellizco, ajustar), dock oscuro flotante, barra de zoom, tarjetas flotantes y edición contextual junto al equipo (hoja inferior en móvil). Sin fondo negro ni columnas permanentes.
- La termocupla es **K o J a elección** del estudiante. El ambiente es un valor explícito y editable (22 °C por defecto).
- Independiente del proyecto eléctrico: guardado propio por lección (`modo:temperature:bench:<lección|free>:v1`) y avance propio (`modo:temperature:progress:<lección>:v1`).

## Modelos (ideales y declarados)

- Termocupla: polinomios NIST ITS-90 (K y J), unión de referencia a temperatura ambiente. Inversa por bisección.
- Pt100: Callendar–Van Dusen, IEC 60751 (α = 0,00385), medición a dos hilos sin resistencia de cables.
- Transmisor: compensa la unión fría con el **tipo configurado**; un tipo distinto al de la termocupla produce error. Salida lineal 0–10 V sobre el rango que el estudiante define (no se fija 0–100 °C); satura en 0 y 10 V; sin alimentación o sin entrada vale 0 V.
- Horno y sondas con constantes de tiempo aceleradas; una sonda se lee solo cuando ella y el horno están estables. «Esperar» salta al equilibrio.
- Multímetro: la función (mV, Ω, V) y los bornes determinan la lectura. Funciones o bornes sin sentido físico se muestran, pero no se pueden registrar.

## Datos

Registros «simulada» (preparación) y «real» (clase, tecleados por el estudiante) en la misma lista, siempre separados. Un punto repetido reemplaza al anterior. Exportación CSV (separador «;» y coma decimal) para la planilla que pide la guía.

## Lecciones

| Experiencia | Recorrido |
|---|---|
| 1. Investigar y explicar | Cinco preguntas de comprensión. La presentación grupal queda como tarea independiente. |
| 2. Medir y comparar | Seis pasos con comprobación contra el estado real del banco, incluido un cálculo con los datos propios. |
| 3. Transmisor | Cinco pasos: conectar y alimentar, configurar tipo y rango, medir, registrar ambos sensores y predecir con el rango elegido. |

Cada una: Comprender → Practicar (o Responder) → Comprobar, con regreso a la clase y al momento.

## Fuera de alcance

Detectores/PLC (G01, G02), Pt100 conectado al transmisor (solo ampliación), tolerancias de sensor, resistencia de cables, bornes y colores de los equipos físicos de la sala, despliegue.
