# Rendimiento de Simulador y Laboratorio

Publicación: https://modo-lab.vercel.app/ · 17 de octubre de 2026.
Proyecto existente `modo-lab`, despliegue `dpl_ARF1E4ts5HrivoHGseLEY1TUHXxX`, READY y promovido al dominio público.

## Cambios

- El motor conserva su dibujo, velocidad y sentido. El rotor gira en una superficie HTML independiente dentro del SVG, para evitar recalcular el tablero completo en cada fotograma.
- Los destellos de corriente conservan su recorrido y velocidad. Un reloj compartido actualiza solamente los trazos activos, se pausa durante gestos de navegación y se detiene cuando no hay cables energizados. Respeta la preferencia de movimiento reducido.
- La protoboard recibe un controlador estable con su circuito DC y acciones. Los ciclos del PLC no vuelven a renderizar su superficie; siguen funcionando los interruptores, el multímetro, las fallas y las anotaciones.
- Los cables del multímetro conservan su física al moverlos. Descansan al estabilizarse y despiertan cuando cambia un extremo. Se evitan búsquedas repetidas del multímetro y escrituras SVG sin cambios. La posición de las puntas se sincroniza antes de pintar los cambios de encuadre, incluida la inercia, sin avanzar dos veces la física.
- El motor de simulación, el intervalo de 100 ms, el solver, los modelos eléctricos, los circuitos, las lecciones y el formato de proyectos no cambiaron.

## Medición

Chromium con viewport 820×1180, densidad 2×, tacto y CPU limitada a 4×. Muestras de cuatro segundos después de cargar; las mediciones de rendimiento se ejecutaron separadas de las pruebas funcionales y de las compilaciones. Incluye perfiles de CPU, tareas largas, fotogramas, cálculos de layout y escrituras del multímetro. Estas mediciones emulan una tablet; no sustituyen probar el dispositivo físico ni su GPU/Safari.

Comparación del dominio público antes y después de publicar:

| Escenario | Trabajo del navegador antes / 4 s | Después / 4 s | Reducción |
| --- | ---: | ---: | ---: |
| Estrella-triángulo, motor girando | 3533 ms | 1120 ms | 68,3 % |
| Desplazar el banco durante simulación | 3201 ms | 2157 ms | 32,6 % |

En Laboratorio, las muestras locales de tablet registraron 30–57 % menos trabajo durante uso activo: simulación DC, puntas conectadas y puente H. La simulación DC de escritorio, con los cables ya estables, bajó de 1592 a 311 ms por muestra (80,5 %). El módulo Board medido en producción conserva exactamente su SHA-256 en el despliegue final, que añade la sincronización de las puntas del multímetro. El reposo del Simulador se mantuvo con un coste pequeño (71 frente a 80 ms por muestra); esa variación no es una mejora.

El percentil 95 de fotograma en el primer ensayo local del Simulador pasó de 33,3 a 16,8 ms. En la repetición pública fue 16,7 frente a 16,8 ms; el paneo dio 33,4 ms en ambos casos. La reducción de trabajo es consistente; no se afirma que los FPS se dupliquen en todos los dispositivos ni que haya mejorado la carga inicial.

Evidencias: `qa/performance-simulation/comparison.json`, `public-comparison.json`, carpetas `before`, `after`, `before-public`, `after-public` y perfiles `.cpuprofile`. `panel-direct` corresponde a la versión final del reloj de corriente. `diagnostic` conserva el aislamiento de motor, flujo y filtros; no es código publicado.

## Archivos

- `src/components/Board.tsx`: rotor independiente.
- `src/components/WireLayer.tsx`: reloj de corriente y pausa durante gestos.
- `src/styles/board-layout.css`: composición del rotor y trazo de corriente.
- `src/lab/useLaboratory.ts`: acciones estables y controlador DC.
- `src/lab/LaboratoryApp.tsx`, `BreadboardView.tsx`: protoboard memoizada y acceso directo al multímetro.
- `src/lab/MeterInstrument.tsx`: descanso de las cadenas y actualización visual cuando cambia.
- QA: `qa/perf-simulation.cjs`, `qa/verify-runtime-animation.cjs`.

## Validación

`npm install` sin vulnerabilidades; `npm run check` y `npm run build` correctos. Laboratorio 38/38; simulación, motor y cableado correctos. `verify:lab-ui` pasó edición, historial, instrumentos, fallas, física de cables, PLC, HMI y proceso. `verify-tablet-laboratory.cjs` pasó cinco herramientas en ocho tamaños, paneo/pellizco, ventanas, giro, simulación, exportación, recarga e importación; geometría de escritorio conservada.

`verify-runtime-animation.cjs` comprueba estrella → triángulo, cambio de velocidad, giro, inversión, parada, movimiento de corriente, pausa durante gestos, descanso/despertar de cables y lectura de 5 V con las puntas adheridas a la placa. Las pruebas local y pública del despliegue final pasaron. La validación pública se guarda en `qa/release-2026-10-17-performance/final/browser/results.json`.

Vercel compiló correctamente. Las páginas y los módulos optimizados del dominio público coinciden por SHA-256 con la construcción local comprobada. Los archivos QA, respaldos y referencias privadas se excluyeron del paquete.

## Comparación visual

[Simulación antes](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/qa/performance-simulation/before-public/panel-running-820.png>) · [Simulación publicada](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/qa/performance-simulation/after-public/panel-running-820.png>).

[Motor en estrella](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/qa/release-2026-10-17-performance/final/browser/motor-star-820.png>) · [Motor en triángulo](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/qa/release-2026-10-17-performance/final/browser/motor-delta-820.png>) · [Giro inverso horizontal](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/qa/release-2026-10-17-performance/final/browser/motor-reverse-1180.png>) · [Multímetro horizontal](<C:/Users/HUMANO LAB/Desktop/proyectos2026/paneldecontrol/PanelLab-INACAP/qa/release-2026-10-17-performance/final/browser/lab-probes-1180.png>).

Pendiente: comprobar la sensación de fluidez en la tablet física del usuario. Recargar la página permite recibir la versión nueva sin borrar los proyectos guardados.
