# 2.2.18 · Puesta en marcha HMI–PLC

La escena continúa Soldadura → Siguiente: HMI–PLC, sobre PanStage y la pizarra existente. Usa el mismo CableState y las seis mediciones vigentes del cable, sin fabricar ni aprobar automáticamente conductores.

## Fuente y alcance

Guía F34.pdf, pp. 5–8: terminar la bornera, medir continuidad, conectar COM2 HMI/RS-485 PLC, cargar pantalla y ladder, probar marcha/paro observando salida PLC, cambiar HMI a 115200 y volver a cargar. El PDF menciona Instruccional.dpa e Instruccional.isp, pero no contiene archivos adjuntos; sus contenidos no están disponibles.

Los editores ISPSoft/DOPSoft son interfaces didácticas simplificadas. El programa equivalente escribe M0 desde marcha/paro y ejecuta contacto NA M0 → bobina Y0. No se afirma que sea el ladder exacto de Instruccional.isp. No ejecuta software Delta, proyectos propietarios ni drivers USB/COMMGR.

Se conserva el motor transaccional RTU simplificado de entrenamiento: 8E1, CRC16, dirección lógica 0. La captura de la guía usa 7E1; no se presenta este transporte como protocolo Delta de la maqueta. Se informa dentro de los editores. Las bornas PLC se identifican como bornera genérica de ensayo, con disposición física por confirmar. Se conservan las advertencias previas sobre el rótulo +24 V contradictorio de F34.

## Interacción y criterios

- DB9 y bornera se conectan con toque o arrastre. Ambos equipos deben estar apagados para manipularlos.
- Encendidos separados, USB con destino explícito y proyectos compilables antes de descargar. El PLC queda en STOP tras cargar y requiere RUN.
- Los parámetros editados se separan de los descargados: cambiar el selector no cambia el equipo hasta transferir.
- Un envío sin respuesta conserva memoria/salida del PLC y elimina la lectura confirmada del HMI. La pantalla puede estar encendida sin comunicación.
- Se registran marcha, paro posterior, falla 115200 con dirección compatible y recuperación observada. No basta cambiar/restaurar el menú.
- La finalización exige las seis medidas vigentes, todas las evidencias, enlace actual y explicación correcta. Cambiar el cable invalida las evidencias. Apagar el PLC reinicia salida y RUN.
- Registro de eventos y resultados descargable como TXT. La sesión de puesta en marcha es temporal; el cable sigue guardándose con el sistema existente.
- Ver maqueta/HMI/PLC permite encuadrar cada equipo; zoom, desplazamiento y ventanas compartidas. El símbolo giratorio representa el estado virtual de Y0, no un motor físico.

## Comprobación

`npm install`, `npm run check`, `npm run build`; pruebas de modelo `qa/verify-commission-2.2.18.mjs` y térmicas `qa/verify-solder-2.2.5.mjs`.

`qa/verify-commission-ui-2.2.18.cjs`: Chromium con gestos táctiles y WebKit con mouse/teclado, 393/1180/1440 px. Fixture de cable previamente fabricado y medido; la prueba no sustituye fabricar manualmente ese cable. Comprueba construcción/carga de ambos proyectos, RUN, marcha/paro, cambio descargado a 115200, timeout, restauración, explicación y retorno a soldadura. Capturas en qa/redes-2.2.18. Emulación, no certificación de hardware móvil ni PLC real.

La observación del tamaño de FloatingWindow se agrupa en requestAnimationFrame para evitar un ciclo de ResizeObserver al cambiar el contenido de los editores.

## Archivos

- src/lab/soldering/CommissionBench.tsx y commissioning.ts: escena, editores y estado transaccional.
- src/lab/CableBench.tsx: continuación desde soldadura y conservación de la pizarra.
- src/study/CableWorkshop.tsx: permite ocultar el ensayo serie anterior dentro de Medir; conserva el modo Estudio.
- src/components/FloatingWindow.tsx: ajuste del observador por fotograma.
- src/styles/commission-bench.css: equipos, controles táctiles y ventanas.
- src/data/releases.ts, package.json, package-lock.json: versión 2.2.18.
- qa/verify-commission-2.2.18.mjs y verify-commission-ui-2.2.18.cjs: pruebas nuevas.

## Publicación

Vercel modo-lab, producción https://modo-lab.vercel.app, despliegue dpl_DJhi8Y7G8uSogxhFpMMmAHcTQFRj READY. Se conserva la autorización explícita del usuario para actualizar el enlace habitual. Se prueba la URL pública con el mismo recorrido de seis contextos.
