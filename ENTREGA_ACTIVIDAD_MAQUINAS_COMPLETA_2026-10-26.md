# Actividad de Máquinas Rotativas: guía completa — 26 de octubre de 2026

Se implementaron los ocho puntos de la revisión en el proyecto existente. La guía original permanece integrada y las fotografías, módulos, bornes y ventanas existentes se conservan.

## Recorrido para estudiar

Abrir https://modo-lab.vercel.app/?view=simulator&activity=maquinas-u2 → «Placa, protección y mi esquema» → completar los ejercicios de placa y ajuste → «Comenzar guía del profesor». Comenzar prepara solo mando. Tras sus pruebas, con el banco desenchufado y los interruptores abiertos, el punto 11 ofrece «Añadir circuito de fuerza». También puedes construirlo tú y usar «Medir mi montaje actual».

«Mi esquema» ofrece una plantilla de símbolos sin conductores, conexión entre bornes por tacto o selectores, movimiento de símbolos con arrastre/flechas, edición de conductores, comprobación de conectividad, explicación y exportación SVG. «Generar desde mi cableado actual» es una acción explícita. Antes de desmontar se solicita conservar el esquema.

La pinza permite arrastrar la mordaza o moverla con teclado. Al abarcar varios conductores calcula su suma vectorial, señala esa posición y no permite registrar como corriente de una sola línea.

Resultados permite descargar tablas CSV, respaldo JSON e informe HTML imprimible que incluye las cinco tablas, condiciones de giro/carga, relaciones calculadas, explicación, placa/protección y esquema SVG. El cuaderno de Estudio usa la misma presentación de resultados. El HTML se puede imprimir/guardar como PDF desde el navegador.

## Correcciones eléctricas

1. La memoria térmica recibe las corrientes de los tres polos de FR1, calculadas por KCL sobre el corte del conductor. No se añadió una resistencia ficticia ni se divide siempre la corriente de línea por raíz de tres. Se conserva la diferencia bajo desequilibrio.
2. El disparo cambia los auxiliares 95–96/97–98. La potencia depende de la bobina y de los contactos del contactor, con sus tiempos de apertura. Si el circuito de mando está anulado, el simulador conserva esa consecuencia y muestra el error. «Fallas» añade un caso exclusivamente virtual para diagnosticarlo.
3. El perfil incorpora tensiones nominales Δ/Y, corriente nominal y referencia. Los perfiles antiguos reciben un ejemplo identificado, sin perderse. La guía no acepta una medición de marcha cuya tensión excede la nominal de la conexión del perfil; no se inventa un enclavamiento físico de placa.
4. La validación compara conectividad de redes de cables y conserva separados contactos, devanados y dispositivos. Acepta derivaciones equivalentes y rechaza puentes indebidos. Durante la etapa de mando no exige el cableado de fuerza.

## Ejercicios

- Motor A de ejemplo: Δ 380 / Y 660 V, 10 A de línea nominales en Δ, red de 380 V.
- Tensión de cada bobina en Y = 380/√3 ≈ 219,4 V; en Δ = 380 V.
- Motor B de ejemplo: Δ 230 / Y 400 V. La respuesta requerida reconoce que no corresponde pasar a Δ en esa red.
- Relé dentro de triángulo: ajuste de ejemplo 10/√3 ≈ 5,77 A; relé antes de la bifurcación: ejemplo de 10 A. Se comprueba el rango y la función del dispositivo. «Usar el ejemplo en el banco desconectado» aplica explícitamente el ejemplo al perfil.

Los ejemplos no son datos del equipo físico. La lectura de placa aclara que las tensiones nominales Y/Δ son tensiones entre líneas para cada conexión; no copia la confusión del párrafo de la página 3 de la guía.

## Validación

- npm install: completado, sin vulnerabilidades informadas.
- npm run check y npm run build: completados.
- qa/verify-machines-guide-complete.mjs: corrientes FR1/línea equilibradas y desequilibradas; TEST correcto y mando anulado; separación mando/fuerza; equivalencias y rechazo de puentes; suma de la pinza; placas/ajustes; perfiles anteriores; persistencia, informe y SVG con todos los bornes del montaje representables.
- qa/verify-machines-guide-ui.cjs: ejercicios reales de placa/protección, inicio con 24 cables de mando, ampliación a 46, esquema propio generado y explicado, descarga SVG, 34 pasos con 15 medidas, comparación, TEST/RESET, cierre, CSV/JSON/HTML; preparación en móvil 390 px.
- qa/verify-machines-touch.cjs: Chromium táctil 820×1180 y WebKit de escritorio con tacto 390×844. Rechazo de respuestas incorrectas, aplicación del ejemplo, edición/persistencia/SVG, mordaza con tacto real emulado en Chromium y teclado en WebKit, varias fases e intento de registrar fase incorrecta, diagnóstico de mando anulado.
- qa/verify-tablet-meter-dynamic.cjs: Chromium táctil 768×1024 y 820×1180, WebKit de escritorio con CSS táctil 768×1024 y Chromium 1440×900. Desplazamiento nativo, captura, temporizador, carga y hélice/inercia.
- qa/verify-panel-dynamic.mjs, qa/verify-panel-automatic.mjs, qa/verify-meter-activity.mjs y qa/verify-motor.mjs: regresiones eléctricas, dinámicas y de topologías.
- qa/verify-panel-automatic-ui.cjs: disparo automático, enfriamiento/rearme bloqueado, reloj común y exportación de perfil.
- qa/verify-panel-probe-navigation.cjs: 600 teclas rápidas, muestra e invalidación sin errores de React. El escenario prepara las respuestas previas para centrarse en la navegación.
- qa/verify-guides-class.mjs: regresión de temperatura y cuaderno en escritorio/móvil.

Evidencias en `qa/machines-guide-complete/` y `qa/tablet-meter-fix/`. Incluyen resultados JSON, informes, SVG y capturas de preparación, esquema, pinza y diagnóstico.

## Archivos

Modelo: `src/data/panelElectrical.ts`, `simulation.ts`, `panelCalibration.ts`, `meterActivity.ts`, nuevos `machinePreparation.ts`, `machineDiagram.ts`, `machineReport.ts`; controlador `src/hooks/useSimulation.ts`.

Interfaz: `PanelMeterLesson.tsx`, `PanelBenchOptions.tsx`, `PanelGuideFaults.tsx`, nuevos `PanelMachinePreparation.tsx`, `PanelClampTraining.tsx`, `MachineDiagramExport.tsx` y `src/styles/machine-preparation.css`.

Estudio y entrega: `MachineActivityStudy.tsx`, `GuideWorkbook.tsx`, `guideWorkbookData.ts`.

## Fuentes y límites

Fuente docente: `public/activities/actividad-2-unidad-2.pdf`, idéntica a «Actividad 2 Unidad 2 (1).pdf» del usuario. La numeración de tablas original es 1, 3, 4, 5 y 6.

Ubicación y ajuste del térmico: https://www.se.com/nl/nl/faqs/FA173001/

Tensiones de placa: manual ABB ACS260-04, tabla de conexiones en página impresa 29: https://library.e.abb.com/public/85bb7f53868f4d549e537374c191838b/EN_ACS260-04_B_A4.pdf

Siguen pendientes contrastar placa, parámetros del motor y modelo/rango del relé con el equipo real, seleccionar las protecciones físicas con sus datos y documentación, y realizar la revisión docente y la prueba en la tablet física del usuario. Los ejercicios no certifican esos puntos. El modelo conserva sus aproximaciones RMS, de inducción y memoria térmica didáctica; no se presenta como curva certificada ni modelo electromagnético completo.

## Compatibilidad y cierre

La plantilla de esquema corresponde al cambio manual del profesor. La variante opcional de Matías conserva su respaldo JSON y puede terminar sin exigir el esquema de un circuito diferente. Se comprobó expresamente su cierre. Al volver a una actividad ya completada, «Continuar» abre sus resultados y conserva el banco; no vuelve a montarlo ni a energizarlo.

El informe HTML de prueba se abrió en Chromium: cinco tablas, SVG embebido, sin desbordamiento horizontal. Capturas en `qa/machines-guide-complete/informe-visual.png` y `esquema-exportado.png`.

## Publicación final comprobada

Vercel: https://modo-lab.vercel.app
Despliegue final: `dpl_2seZykBB1voRFvfUCtB2N47qETo7`, READY, alias de producción asignado.

Sobre esta publicación se repitieron `qa/verify-machines-guide-ui.cjs` (34 pasos, 15 mediciones, preparación, mando/fuerza, esquema y descargas) y `qa/verify-machines-touch.cjs` (Chromium táctil 820 px y WebKit 390 px). Los dos finalizaron sin errores de página y usando contextos nuevos sin sesión de Vercel.
