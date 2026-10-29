# Banco eléctrico: respuesta automática — 26 de octubre de 2026

## Cambios

- El motor de inducción, la inercia, el cálculo de corriente y la protección térmica actúan siempre según el circuito. No se ofrecen interruptores para habilitar o deshabilitar esos efectos.
- Temporizadores, contactos de fuerza, hélice, dinámica mecánica y calentamiento usan el mismo tiempo de simulación. La suspensión de la práctica y el paso a segundo plano no acumulan saltos de tiempo entre subsistemas.
- El temporizador mantiene su salida una vez terminado el retardo; cambiar el ajuste durante la cuenta la reinicia. Al caer su bobina vuelve a reposo.
- Los contactos de fuerza incorporan tiempos de cierre/apertura y transición abierta entre estrella y triángulo. La velocidad mecánica es continua durante la transición.
- El térmico acumula memoria I², dispara por corriente sostenida y se enfría gradualmente. TEST comprueba el disparo sin inventar temperatura. RESET queda bloqueado mientras la memoria supera el umbral de rearme; rearmar no vuelve a dar marcha.
- El cálculo eléctrico usa secuencias directa e inversa para que una fase ausente o desequilibrada afecte corriente y par. Se incorpora una aproximación del RMS de cierre RL, sin oscilaciones aleatorias.
- «Fallas» añade el caso de un cable de fase ausente. El caso modifica el cableado; no activa una animación ni deshabilita una ley física.
- Ω calcula caminos serie/paralelo a partir de las resistencias del perfil. Las resistencias aportadas exigen referencia. Un perfil que exige datos aportados muestra SIN DATOS si faltan; Ω/continuidad siguen bloqueadas con el enchufe conectado.
- La ventana «Banco» muestra protección, permite importar/exportar un perfil y contiene una comprobación del dispositivo actual. Los perfiles solo se aplican con el banco desenchufado y el motor detenido. Se conserva un guardado incompatible hasta que se aplica explícitamente un perfil válido.
- Abrir «Aprender a medir» conserva el panel vacío. Solo «Comenzar guía del profesor» o la continuación explícita preparan el circuito.

## Parámetros y límites

No se dispone de placa del motor, ajuste/rango del térmico ni ensayos del equipo. Por eso el perfil inicial es didáctico: 380 V entre fases, 50 Hz, cuatro polos, carga de 4 N·m, Ir de ejemplo de 6 A y clase térmica de ejemplo 10. No son datos confirmados del laboratorio.

El motor usa un equivalente de inducción por fase, deslizamiento y dinámica mecánica. La aproximación de secuencia inversa permite estudiar pérdidas/desequilibrios, pero no sustituye un modelo electromagnético completo. La memoria térmica es una aproximación de primer orden referida a 7,2×Ir; no es una curva certificada ni identificada de un relé concreto. Los tiempos de contactos 40/25/80 ms son parámetros de ejemplo.

La comprobación de tablet registra eventos observados y notas del usuario en ese navegador. Las pruebas automáticas usan emulación; no se ha operado una tablet física del usuario. Siguen pendientes contrastar el perfil con el equipo/docente y comprobar su dispositivo físico.

## Validación

- npm install: sin vulnerabilidades informadas.
- npm run check y npm run build.
- qa/verify-panel-dynamic.mjs: 11 comprobaciones de red compleja, arranque, carga, inercia y sentido.
- qa/verify-panel-automatic.mjs: reloj, temporizador, contactos, térmico, perfiles, falta de fase, RMS transitorio y Ω. El modelo frío clase 10 dispara a 7,51 s con 7,2×Ir.
- qa/verify-panel-automatic-ui.cjs: inicio explícito, ausencia de selectores de física, suspensión común, disparo automático por carga, RESET en caliente, perfil y exportaciones; ventanas a 390/820/1440 px.
- qa/verify-tablet-meter-dynamic.cjs: Chromium táctil 768×1024 y 820×1180; WebKit de escritorio con CSS táctil 768×1024; Chromium 1440×900. Desplazamiento, lectura capturada, retardo, carga y parada con inercia. Área visible reducida a 600 px para comprobar alcance de acciones.
- qa/verify-panel-probe-navigation.cjs: 600 teclas rápidas sin errores de React, captura e invalidación.
- qa/verify-meter-activity.mjs y qa/verify-motor.mjs: topologías y regresiones.
- output/revision-guias-2026-10-26/verificar-recorrido.cjs: 34 pasos, 15 mediciones, TEST/RESET, comparación, apagado, desmontaje y exportaciones CSV/JSON.
- qa/verify-guides-class.mjs: casos de fallas y conservación de guías de temperatura/planillas.

Evidencias en qa/tablet-meter-fix, qa/guides-class y output/revision-guias-2026-10-26. Capturas: automatic-thermal-tablet.png, automatic-bench-390.png, automatic-bench-1440.png y after-*-scroll.png. La captura previa para comparación está en el mismo directorio de QA.

## Referencias técnicas

- Motor de inducción: https://www.mathworks.com/help/simscape-electrical/ref/simplifiedinductionmotor.html
- Modelo de secuencia: https://www.mathworks.com/help/mcb/ref/inductionmotor.html
- Clases térmicas y memoria: https://www.se.com/au/en/faqs/FA22893// y documentación TeSys Giga de Schneider Electric.
- Ejemplo de transición abierta: https://library.e.abb.com/public/e9955fceef6440c8b8507db6fffa253d/2CDC111127D0201.pdf
- Transitorio RL: https://openstax.org/books/university-physics-volume-2/pages/14-4-rl-circuits

Las referencias fundamentan el tipo de aproximación. No identifican las piezas ni sus ajustes físicos en el laboratorio.

## Archivos de esta ampliación

Modelo y motor: `src/data/panelRuntime.ts`, `panelCalibration.ts`, `panelSequences.ts`, `panelAC.ts`, `panelMotorDynamics.ts`, `panelElectrical.ts`, `panelMeter.ts`, `simulation.ts` y `src/hooks/useSimulation.ts`.

Interfaz existente: `src/components/PanelBenchOptions.tsx`, `PanelGuideFaults.tsx`, `PanelMeterLesson.tsx`, `PanelMultimeter.tsx`, `Board.tsx` y `src/styles/panel-bench-options.css`.

Comparación visual: [antes, tablet 768 px](qa/tablet-meter-fix/before-768.png), [después, guía desplazable](qa/tablet-meter-fix/after-chromium-768-scroll.png), [disparo automático](qa/tablet-meter-fix/automatic-thermal-tablet.png), [protección en móvil](qa/tablet-meter-fix/automatic-bench-390.png), [protección en escritorio](qa/tablet-meter-fix/automatic-bench-1440.png).

## Publicación verificada

Vercel producción: https://modo-lab.vercel.app
Despliegue: `dpl_3jnvXpTPfDpYmiRDfVuTVrcMdCYV`, estado READY, alias asignado.

Verificación posterior en navegadores nuevos sin sesión de Vercel: qa/verify-panel-automatic-ui.cjs pasó sus siete grupos sobre el dominio público; qa/verify-tablet-meter-dynamic.cjs pasó la repetición pública táctil a 768×1024. Sin errores de página. Corriente capturada de arranque 14,124 A y lectura posterior estabilizada 3,144 A en esa ejecución; carga elevada 9,123 A. Son resultados del modelo didáctico, no mediciones físicas.
