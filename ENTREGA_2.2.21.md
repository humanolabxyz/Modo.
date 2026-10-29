# 2.2.21 · Laptop alta, transferencia y cables

Se conserva la escena existente. El acceso Entrar a la práctica HMI–PLC es una acción grande y de ancho completo en móvil. La laptop tiene una pantalla física más alta, accesos ISPSoft/DOPSoft, escritorio, vista ampliada Laptop y USB, y los editores dentro de una ventana con marco de laptop y barra de aplicaciones. Las pantallas LD y HMI tienen mayor altura útil. Los iconos y las vistas representan aplicaciones didácticas, no ejecutan software Delta ni archivos propietarios.

## Flujo

1. Preparar y compilar en la laptop, sin necesitar alimentación del PLC/HMI ni cable RS-485.
2. Conectar USB al destino, disponer de alimentación y usar STOP en el PLC. Transferir con progreso; el estado se valida nuevamente al finalizar. Desconectar USB, quitar alimentación o editar sin recompilar impide aplicar el proyecto.
3. Después de cargar los dos equipos se puede apagar y montar el cable. El cable RS-485 no es requisito para transferir por USB.
4. Encender y seleccionar RUN para probar marcha/paro.

La palanca RUN/STOP es independiente de la alimentación y conserva su posición al cortar energía. El interruptor de alimentación se muestra como parte del banco/fuente de 24 V, no como un interruptor inventado en la CPU. El modelo permite mover la palanca sin programa ni alimentación, pero no ejecutar ni comunicar hasta cumplir las condiciones.

Referencia de hardware: ficha oficial DVP-SX2 2024-02-22, alimentación 24 VDC y RUN/STOP independiente. ISPSoft documenta preparación/compilación y descarga al PLC como operaciones separadas. No se modela una alimentación de CPU por USB no verificada para el equipo de referencia.

## Cables

- Se diferencia el punto agarrado de la punta del conector. El umbral contempla el zoom y el punto de contacto real.
- Un hilo insertado pero aflojado sigue el gesto y puede retirarse, quedando en el lugar donde se soltó. Un hilo apretado sigue bloqueado.
- DB9 y USB pueden desacoplarse mediante arrastre. Se conserva el acceso por selección/toque y teclado.
- Se retiran los puentes gráficos que parecían otros cables entre un conector enchufable y el PLC. Se alinea la franja del aislamiento con la cubierta común.
- El agarre del conector se separa de la zona de los hilos. Los tornillos y entradas responden a pointerup táctil con deduplicación del clic compatible, de modo que el primer toque después de arrastrar no se pierde.
- PanStage cancela la supresión de un clic de desplazamiento previo al comenzar un gesto nuevo sobre un control, sin convertir el final del arrastre en activación.

## Archivos

commissioning.ts: proyectos compilados separados de cargados, validación de transferencia y palanca.
CommissionBench.tsx, LaptopDevice.tsx, DeviceLever.tsx: laptop, progreso, vista y palancas.
TerminalWiring.tsx, ProgrammingUsb.tsx: arrastre, desacople y geometría.
PanStage.tsx, CableBench.tsx, commission-bench.css: controles y acceso visible.
Guía pública, versión y registro de cambios actualizados.

## Validación

npm install (0 vulnerabilidades), check, build; modelo commissioning y laboratorio 38/38.
qa/verify-laptop-2.2.21.cjs: Chromium/CDP 393 y 1180 px, compilar offline, transferir antes de cablear, rechazar transferencia sin USB/alimentación o con RUN, progreso, y arrastrar/insertar/apretar/aflojar/retirar un hilo. Las coordenadas de arrastre se toman de la superficie real del agarre SVG, no del boundingBox ampliado por el trazo transparente.
qa/verify-commission-ui-2.2.18.cjs: recorrido completo actualizado para compilar y transferir, Chromium y WebKit 393/1180/1440 px.
qa/verify-solder-whiteboard-2.2.9.cjs: se actualizan selectores a pizarra visible y agarre de arrastre del estante, existentes desde las versiones anteriores.
Las comprobaciones son emuladas; no implican un ensayo en un PLC real.

Publicación: https://modo-lab.vercel.app, despliegue dpl_Gfc2yV7yXPgk4x6fyGY8EpdePRQa READY. Se comprueban nuevamente la laptop y transferencia previas al cableado a 393/1180 px y el recorrido completo móvil Chromium/WebKit sobre la URL pública.
