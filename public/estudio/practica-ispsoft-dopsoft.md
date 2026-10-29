# Prueba de comunicación HMI–PLC · apoyo para ISPSoft y DOPSoft

Ejemplo didáctico para realizar la actividad F34, páginas 5–8. No es el contenido recuperado de Instruccional.isp/Instruccional.dpa: esos archivos no venían adjuntos al PDF. El simulador no genera proyectos propietarios Delta.

## 1. Identificar antes de crear el proyecto

Confirma el modelo completo de CPU y pantalla en sus rótulos. La fotografía muestra un banco con equipos Delta; no permite identificar inequívocamente todos los modelos ni el cableado interno. La guía usa la familia DVP-SX2 y COM2 RS-485 del HMI. La referencia de la app es DOP-107EG; si tu pantalla es otra, selecciona la suya.

El puerto de comunicación y USB del HMI se acceden por detrás de la pantalla. La alimentación es independiente del cable de comunicación. El PDF contiene una rotulación +24 V contradictoria con el pin de datos de la referencia COM2 MODE2: usa el manual del modelo exacto para el cable físico. No copies conexiones de alimentación de esa lámina.

## 2. ISPSoft · programa equivalente

1. Archivo → Nuevo: crea el proyecto para la CPU exacta de la maqueta.
2. Crea un programa MAIN en lenguaje LD. Inserta un peldaño.
3. Coloca un contacto normalmente abierto con dirección M0.
4. Coloca una bobina SET con dirección Y0 (Motor). En una segunda red, coloca un contacto M1 (Parada) y una bobina RESET/RST del mismo Y0. La tercera red de la captura inicializa COM2 con un DFB.

```text
        Arranque M0                 Motor Y0
|-------| |----------------------(S)-------|
|-------| |----------------------(R)-------|
       Parada M1                 Motor Y0
```

Lista de instrucciones equivalente, para entender el funcionamiento (no es un archivo .isp):

```text
LD M0
SET Y0
LD M1
RST Y0
END
```

La captura de la guía muestra redes Arranque → SET Motor y Parada → RESET Motor. Las direcciones de las variables no se leen; aquí se asignan M0/M1/Y0 como ejemplo. M0 activa Y0 mediante SET, que conserva el estado tras soltar. M1 desactiva Y0 mediante RESET. No hace falta asignar un pulsador físico X0 para esta prueba. Esto comprueba la salida; no presupone que haya un motor conectado a ella.

5. Compila y resuelve los errores antes de transferir.
6. Configura en COMMGR el enlace de programación apropiado para tu PLC; selecciónalo en la configuración de comunicación de ISPSoft. Esto es el enlace PC–PLC, distinto del HMI–PLC.
7. Conecta el cable de programación y verifica el destino. Descarga el proyecto según las indicaciones del docente. Pasa el PLC a RUN y abre la monitorización para observar M0/Y0.

Los nombres de menú cambian entre versiones. Si la guía docente requiere inicializar el puerto serie desde ladder, utiliza sus valores verificados para esa CPU. No se incluye un MOV arbitrario a D1120: su formato y los relés de control dependen del protocolo y equipo.

## 3. DOPSoft · pantalla equivalente

1. Crea un proyecto con el modelo exacto de HMI.
2. En Communication Settings configura el enlace de controlador Delta DVP PLC, puerto COM2 y RS-485 si corresponden al modelo usado. Estación de destino = estación del PLC. La estación local del HMI no es la dirección del PLC.
3. Iguala la velocidad, protocolo, cantidad de bits, paridad y bits de parada de ambos equipos. La captura de la guía muestra 7 bits, paridad par y un bit de parada. El entrenamiento de la app usa RTU simplificado 8E1; no copies esa diferencia al proyecto real sin comprobar el protocolo.
4. Element → Button → Momentary (para un pulso de arranque). Dibuja el botón verde MARCHA. En propiedades, Write Address = M0 del PLC/enlace externo; no memoria local $M del HMI.
5. Element → Button → Momentary (para un pulso de parada). Dibuja el botón rojo PARO. Write Address = M1 del PLC (Parada).
6. Añade un indicador de estado con lectura del PLC. Puedes observar M0 como orden y comprobar Y0 en el monitor de ISPSoft/piloto del PLC. Si usas Y0 como dirección de lectura del HMI, confirma que el controlador seleccionado la admite.
7. Compila el proyecto, conecta el USB al HMI y descarga. El cable USB de programación no sustituye el cable RS-485 que fabricaste.

La retención se hace en SET/RESET del PLC. Marcha genera un pulso sobre M0; paro un pulso sobre M1. La pantalla encendida no demuestra que exista comunicación.

## 4. Prueba y entrega

- Cable aislado de los equipos: comprobar continuidad de los tres recorridos y ausencia de cortos. Después insertar cada conductor por arriba del conector verde, con su tornillo aflojado, apretar y enchufar el conector al PLC con los equipos apagados.
- Energizar la maqueta real solo según las indicaciones del docente.
- Marcha verde: observar M0 = 1 y Y0 encendida. Paro rojo: observar pulso M1 = 1 y Y0 apagada.
- Cambiar SOLO la velocidad del HMI a 115200, volver a cargar y repetir la prueba. Si el PLC conserva otra velocidad, no interpreta correctamente la comunicación. No afirmar falla por velocidad si ambos ya estaban a 115200.
- Restaurar una configuración compatible, cargar de nuevo y confirmar la recuperación.
- Registrar: cable, configuración de ambos equipos, observación marcha/paro, qué se cambió, resultado y explicación.

## Fuentes

- Guía F34: /estudio/fuentes/F34.pdf, páginas 5–8.
- Manual ISPSoft: https://filecenter.deltaww.com/Products/download/06/060302/Manual/DELTA_IA-PLC_ISPSoft_UM_EN_20210329.pdf
- Manual DOPSoft: https://filecenter.deltaww.com/Products/download/06/060302/Manual/DELTA_IA-HMI_DOPSoft_UM_EN_20211230.pdf (botones, sección 2-164).
- Referencia DOP-107EG: https://filecenter.deltaww.com/Products/download/06/060302/Manual/DELTA_IA-HMI_DOP-107EG_TC-SC-EN-TUR_20191016.pdf


## Secuencia en la laptop del simulador (2.2.21)

1. Abre Laptop, selecciona ISPSoft o DOPSoft, prepara el proyecto y pulsa Compilar. Esto funciona con ambos equipos apagados y sin cable RS-485.
2. Conecta el USB al equipo de destino. Para transferir al equipo real/virtual, dispón de la alimentación requerida. La compilación offline no es una transferencia.
3. En el ensayo del PLC, deja la palanca en STOP. Pulsa Transferir y espera la verificación. RUN no es la alimentación y no se exige para descargar.
4. Después de cargar ambos proyectos, apaga los equipos para montar el cable. Conecta DB9 y conector de tres vías; enciende y usa RUN para probar marcha/paro.
5. La palanca del PLC se representa separada del interruptor de alimentación de 24 V del banco. Se conserva la posición de RUN/STOP al cortar alimentación.

Referencia de hardware SX2 y alimentación: https://filecenter.deltaww.com/Products/download/06/060301/Manual/DELTA_IA-PLC_DVP-SX2_I_TSE_20240222.pdf
