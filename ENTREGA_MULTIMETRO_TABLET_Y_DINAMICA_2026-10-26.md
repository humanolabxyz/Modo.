# Multímetro, tablet vertical, temporizador y hélice

Fecha: 26 de octubre de 2026. Proyecto existente PanelLab-INACAP.

Producción: https://modo-lab.vercel.app. Despliegue `dpl_5jJJzvFJre1vXHfyeZB1xxBbZ15T`, READY, alias habitual asignado. La comprobación pública de tablet vertical queda registrada en `qa/tablet-meter-fix/ui-results-timer.json` con el dominio probado.

## Cambios

- «Aprender a medir» usa una sola zona de desplazamiento nativo que contiene explicaciones, controles, lectura y botones de registro. La cabecera de mover/cerrar queda fuera de esa zona. Funciona con contenido largo, una ventana reducida y altura equivalente a teclado abierto. Las cuatro pestañas ocupan una fila. La guía usa el mismo criterio de tablet que el resto del panel; localizar bornes puede minimizarla para dejar trabajar.
- El modelo predeterminado del motor pasa del equivalente resistivo a un circuito equivalente de inducción por fase: `Rs + jXs + (jXm || (Rr/s + jXr))`. La red AC se resuelve con fasores RMS y análisis nodal complejo. La impedancia del motor cambia con el deslizamiento. La resistencia de la alimentación produce caída de tensión bajo carga; no se agregan fluctuaciones aleatorias.
- La velocidad se integra con `J·dω/dt = Te − Tload − Bω`, conservando inercia al cambiar estrella/triángulo, parar o disparar TEST. La carga mecánica se ajusta desde la guía o la información del instrumento. Una carga excesiva puede impedir el arranque en estrella. Se conserva un modo resistivo ideal para comparación.
- La hélice integra su ángulo a partir de la velocidad y sentido calculados, con una escala visual constante reducida para distinguir las aspas. La flecha, rpm, estado de conexión y bloqueo ayudan a interpretar lo que ocurre. Al parar, puede seguir girando mientras pierde velocidad. Se respeta la preferencia de movimiento reducido con indicaciones numéricas.
- El temporizador muestra tiempo restante y progreso a partir de la misma cuenta que cambia sus contactos. Cambiar el retardo reinicia una cuenta en curso. Una salida ya temporizada se conserva hasta desenergizar la bobina; cambiar el ajuste no revierte por sí solo la conexión en marcha. Desenergizar cancela la cuenta y permite empezar otra con el nuevo ajuste.
- El multímetro actualiza la pantalla a una cadencia de simulación de 200 ms. La captura comprueba que la indicación se haya asentado antes de tomarla. HOLD conserva la indicación visible. Se evitó un ciclo de actualizaciones al navegar rápidamente con las puntas.
- «Tomar lectura actual» conserva la muestra visible, su instante, rpm, carga y modelo. El motor puede seguir acelerando mientras el alumno transcribe o registra esa muestra. Se invalida al cambiar bornes, función, etapa o condiciones. La pinza muestra la corriente aunque no corresponda a la etapa solicitada; el registro sigue requiriendo el estado correcto de la guía.
- La comparación utiliza las medidas efectivamente registradas. La relación de corrientes 3 solo se comprueba a igual impedancia/deslizamiento con red ideal; no se impone a dos puntos de operación distintos. Se rechazan respuestas numéricas no finitas.

## Fuentes y alcance físico

- [MathWorks: Simplified Induction Motor](https://www.mathworks.com/help/simscape-electrical/ref/simplifiedinductionmotor.html): circuito equivalente, deslizamiento y relación par/velocidad.
- [EMTP: Asynchronous machine](https://www.emtp.com/documents/EMTP-Documentation/doc/asynchronous-machine/asynchronous-machine.pdf): circuito por fase y ecuación mecánica de masa única.
- [ABB: Star-delta starting](https://library.e.abb.com/public/1fdbe69d541a4dfaafbf24245dc1e9da/1SBC100179C0201_Main_Catalog_Motor_protection_and_control.pdf): reducción de corriente/par de arranque y comportamiento de la transición.

Parámetros de ejemplo, identificados como didácticos: Rs 4 Ω, Rr 3 Ω, Xs/Xr 7 Ω a 50 Hz, Xm 180 Ω, cuatro polos, J 0,18 kg·m², B 0,005 N·m·s/rad, resistencia de alimentación 0,15 Ω por fase y carga inicial 4 N·m. No proceden de una placa ni identificación del motor del laboratorio.

Se calcula la envolvente RMS de frecuencia fundamental y la dinámica mecánica. No se modelan formas de onda de conmutación, armónicos, saturación, identificación térmica ni secuencias negativas del motor. Las fallas de conexión conservan las reglas del panel existente. No se atribuye al equipo físico el comportamiento numérico del ejemplo.

## Verificación

- `npm install --no-audit --no-fund`, `npm run check`, `npm run build`: aprobados.
- `qa/verify-panel-dynamic.mjs`: 11 comprobaciones. Incluye soluciones analíticas R+jX, divisor complejo/Kirchhoff, relación Δ/Y con red ideal, caída de tensión, aceleración/corriente, carga, bloqueo, inversión, parada y continuidad.
- `qa/verify-meter-activity.mjs`: ambos perfiles de 34 pasos; la relación ideal se prueba separando la impedancia de la alimentación.
- Recorrido manual completo de 34 pasos en navegador, 15 medidas, muestras capturadas, comparación con medidas propias, TEST/RESET, cierre/desmontaje y descargas CSV/JSON: aprobado sin errores.
- `qa/verify-tablet-meter-dynamic.cjs`: Chromium táctil a 768×1024 y 820×1180, WebKit de escritorio con CSS táctil a 768×1024 y Chromium a 1440×900. Desplazamiento, altura reducida a 600 px, corriente durante aceleración, captura diferida, carga, hélice, reajuste del temporizador y parada por inercia: aprobados sin errores. WebKit móvil no permite inyectar rueda desde Playwright; no se presenta esta verificación como una prueba táctil física de iPad.
- Comprobación adicional del temporizador: cambiar el ajuste después de finalizar mantiene su salida activa hasta parar; resultado en `qa/tablet-meter-fix/ui-results-timer.json`.
- `qa/verify-panel-probe-navigation.cjs`: 600 pulsaciones rápidas, captura de 0,4 Ω e invalidación al mover una punta, sin errores de React.
- `qa/verify-motor.mjs`: regresión de cableado, inversión de fases, falta de fase, estrella/triángulo y TEST aprobada.

Evidencia: `qa/tablet-meter-fix/dynamic-model-results.json`, `ui-results.json`, `probe-navigation-results.json`; recorrido completo en `output/revision-guias-2026-10-26/recorrido-resultados.json`.

## Capturas comparativas

- [Antes: referencia recortada en la zona interior](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/qa/tablet-meter-fix/before-768.png>)
- [Después: desplazamiento de la guía en tablet vertical](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/qa/tablet-meter-fix/after-chromium-768-scroll.png>)
- [Después: resultados y descarga accesibles con altura reducida](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/qa/tablet-meter-fix/after-chromium-820-short.png>)

## Archivos principales

Nuevos: `src/data/panelAC.ts`, `src/data/panelMotorDynamics.ts` y tres comprobadores en `qa/`.

Actualizados: `src/data/panelElectrical.ts`, `src/data/panelMeter.ts`, `src/data/meterActivity.ts`, `src/hooks/useSimulation.ts`, `src/components/Board.tsx`, `PanelMultimeter.tsx`, `PanelMeterLesson.tsx`, `src/lab/MeterInstrument.tsx`, estilos de la guía y del tablero, textos de Máquinas y exportación del informe. Se conserva el inicio explícito de la práctica y los formatos anteriores de progreso.
