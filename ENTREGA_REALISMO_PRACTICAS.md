# Revisión de realismo y prácticas — 20 octubre 2026

Trabajo sobre PanelLab-INACAP existente. Sin despliegue ni cambios en los PDF docentes. Las fotos suministradas orientan el banco, las conexiones y el instrumento compartido; no permiten identificar/calibrar todos los sensores de la fotografía.

## Recorrido para revisar

- Protoboard: `/laboratorio?tool=breadboard&practica=diode`, y prácticas `led`, `bjt`, `bridge`. Se abre la guía sobre la placa existente. Cargar una referencia es una acción explícita que sustituye el montaje de ese proyecto y conserva Deshacer.
- Temperatura: `/laboratorio?tool=temperature`. Insertar sonda, colocar puntas, elegir función, esperar estabilización, leer y transcribir. Repetir añade un ensayo y conserva los anteriores.
- Redes: `/estudio?curso=s2-4&clase=ri-cable&paso=1`, «Usar en clase». Preparar conductores, asignar pines/bornes en el dibujo, comprobar tres recorridos y tres aislamientos con las puntas, enviar orden y examinar TX/RX.

## Material docente contrastado

| Original | Actividad comprobada | Aplicación y límite |
|---|---|---|
| F03, p.14–15, Clase 2 | Diodo/resistencia; tabla con fuentes de 0,5 a 30 V; diodo 1N4001 y 330 Ω, LED y 220 Ω en p.15 | Dos montajes separados, V en paralelo, I calculada con VR/R y posibilidad de medición en serie. El original también menciona 1N4007 en otra tarea. La unión del simulador es genérica y se declara como tal. Tabla hasta 30 V no equivale a una condición física segura para cualquier componente. |
| F04, p.22, Clase 3 | BC337, 10 V, RB=100 kΩ, RC=270 Ω; VCC/VBE/VCE/VRB/VRC/IB/IC/IE | Referencia NPN montable, guion de mediciones. No es un modelo SPICE de BC337 ni garantiza el pinout del encapsulado físico. |
| F05, p.5 y p.13–14, Clase 4 | Puente de cuatro 2N2222 y puente L293D | Se conservan los dos ejemplos del proyecto y se explica su diferencia; no se fusionan como un único circuito. |
| F06/F07 | Amplificadores operacionales y práctica de ajuste | Material existente conservado; no se presenta una práctica de diodos como sustituto del AO. No se añadió aquí un motor analógico general de AO. |
| F34, pp.2–4 y p.7 | Fabricar cable DB9/bornes; HMI/PLC; modificar baud HMI a 115200 y explicar fallo | Continuidad y aislamiento por contacto, fallo de flexión/unión, ajuste 115200 disponible. La tabla de la guía mezcla etiquetas RS-232/RS-485 y +24 V en pin 1: contradicción señalada. El simulador conserva la referencia específica DOP-107EG; no instruye alimentar el pin de datos. |
| F33/F35 | Capas, medios, codificación y detección de errores | Se conserva el contenido. El ejemplo de CRC polinómico teórico y CRC16 de RTU se distinguen. Modbus RTU es una extensión de entrenamiento, no un protocolo demostrado por los proyectos del curso ausentes. |
| F10, pp.4–10 | Arranque manual estrella/triángulo, control/fuerza, prueba de sobrecarga | Se conserva la clase y su acceso al panel existente. No se confunde esta práctica trifásica con la protoboard DC. |
| F11/F12 | Banco EMS Lab-Volt, CC/inducción, tablas de tensión/corriente/velocidad y carga con dinamómetro | Se revisaron los procedimientos originales. Las clases mantienen la distinción entre preparación/registro y comportamiento físico; no se inventaron curvas de carga de equipos sin parámetros. |

Los 47 originales del catálogo conservan sus SHA-256. Evidencia visual de las páginas clave: `qa/realismo-guias/F03-p15.png`, `F04-p22.png`, `F34-p4.png`.

## Qué cambia en la simulación

- Voltímetro de protoboard agrega 10 MΩ a la red. En un divisor de 10 MΩ + 10 MΩ, medir baja el punto medio de 2,5 V a aproximadamente 1,6667 V.
- Toma roja A/VΩ manual, shunt de 0,1 Ω y protección existente: seleccionar A sin cambiar toma avisa; una toma de corriente conectada al circuito representa carga aunque el dial esté en V. No se cambia automáticamente la función al energizar.
- En «Valores reales», diodo/LED usan unión no lineal con resistencia serie, con corriente y caída calculadas iterativamente; se conservan los fallos por sobreesfuerzo. El modo anterior permanece para compatibilidad de proyectos.
- Puntas aparcadas fuera de la carcasa para poder agarrarlas; el contacto final se resuelve por la punta metálica. Cables anclados a la posición de los conectores compartidos.
- Cada anotación de protoboard guarda también la tensión aplicada (0 V al estar detenida). El CSV y el JSON la conservan; los guardados antiguos siguen admitidos.
- Pt100 permite variar resistencia por hilo. Medir con dos puntas incluye ambos hilos aunque la sonda tenga tres/cuatro conductores: no hay compensación mágica por escoger el número de hilos.
- Repeticiones manuales/de clase se conservan y numeran. La tabla muestra último ensayo de la condición y media/desviación muestral al repetir. CSV incluye temperatura de sonda, pozo, consigna, resistencia de hilo y repetición. No se añade ruido aleatorio. No se mezclan ambientes diferentes en las estadísticas. Los puntos automáticos antiguos de curva conservan su semántica para compatibilidad.
- Continuidad del cable usa un circuito resistivo según los conductores/uniones reales del ejercicio: parámetros didácticos explícitos, no resistencias supuestamente medidas en el cable físico. Una unión fría abre al flexionar.
- Extensión RTU calcula CRC16 y muestra bytes de solicitud/respuesta: 05 escribe la bobina de entrenamiento; 03 lee un registro de estado. Dirección, formato serie, CRC y camino eléctrico condicionan la respuesta. Timeout/error no borra la última salida válida. No es una función de seguridad de PLC real.

## Fuentes técnicas externas

- SparkFun, uso de protoboard y comprobación de continuidad de rieles: https://learn.sparkfun.com/tutorials/how-to-use-a-breadboard/all
- Fluke 80 Series V, manual de usuario, funciones/tomas y entrada del instrumento: https://media.fluke.com/72b063d9-22bd-44a7-a91b-b2c100f399c5_original%20file.pdf
- Analog Devices, errores de resistencia de hilos y compensación RTD: https://www.analog.com/en/resources/technical-articles/rtd-measurement-system-design-essentials.html
- Texas Instruments, RS-485 Design Guide, capa eléctrica y terminación: https://www.ti.com/lit/an/slla272d/slla272d.pdf
- Modbus Organization, Application Protocol v1.1b3: https://www.modbus.org/file/secure/modbusprotocolspecification.pdf

## Archivos principales

- Red DC e importación: `src/lab/dc.ts`, `model.ts`, `validation.ts`, `units.ts`.
- Instrumento y placa: `MeterInstrument.tsx`, `ManualBench.tsx`, `BreadboardView.tsx`, `BreadboardPractice.tsx`, `MeterPanel.tsx`.
- Temperatura: `src/lab/temperature/physics.ts`, `state.ts`, `BenchScene.tsx`, `TemperatureNotebook.tsx` y `src/lab/TemperatureView.tsx`.
- Redes/clases: `src/study/CableWorkshop.tsx`, `CableMeter.tsx`, `cableResistance.ts`, `SerialPractice.tsx`, `serialProtocol.ts`, `AcademicLessonView.tsx`, `academicContent.ts`.
- Estilos localizados: `src/styles/bench-practice.css` y `manual-bench.css`.
- Verificación nueva: `qa/verify-realism.mjs`, `qa/verify-realism-ui.cjs`; resultados/capturas en `qa/realismo-guias/`.

## Validación y límites

- `npm install`, sin vulnerabilidades reportadas.
- `npm run check` y `npm run build`: correctos.
- `npm run verify:lab`: 38/38; `npm run verify:temperature`: 38/38.
- `node qa/verify-realism.mjs`: 12 comprobaciones del modelo, CRC, continuidad, repeticiones y exportación/importación.
- `node qa/verify-realism-ui.cjs`: recorridos completos con arrastre de puntas, registros, construcción/comprobación del cable y errores RTU; capturas desktop, tablet y móvil emulados. `node qa/verify-fluke-practice.cjs` también pasó: las 12 transcripciones ambiente/50/75/100 °C, recarga, CSV, HOLD/REL y rechazo de lecturas inventadas.
- `npm run verify:academic`: pasan las 12 comprobaciones funcionales/de contenido, incluida integridad de 47 fuentes. Falla después en la comparación histórica de hashes de `src/components/App.tsx`, archivo con cambios locales previos a este trabajo. No se actualizó ese snapshot para ocultar el fallo; la suite completa no se declara aprobada.

No se emulan DOPSoft/ISPSoft ni los archivos DPA/ISP que no están disponibles. No se simulan propagación/reflexiones RS-485, calibración exacta del Fluke, todas sus funciones/rangos, curvas completas de cada fabricante ni un banco EMS físico. La soldadura sigue siendo una práctica de proceso/contacto, no una simulación metalúrgica. Revisión en navegador emulado no equivale a validación sobre equipos físicos ni aprobación docente final.
