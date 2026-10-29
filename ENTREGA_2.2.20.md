# 2.2.20 · Conector de la guía, SET/RESET y USB

La inspección de las imágenes originales embebidas en F34.pdf, pp. 5–6, mostró dos diferencias con el ejemplo anterior:

- La figura 1.8 usa un conector verde desmontable de tres vías, instalado bajo el PLC. La bornera DIN gris enviada antes era una referencia de manipulación, no ese conector específico.
- La figura 1.11 muestra Arranque → SET Motor, Parada → RESET Motor, y una red de configuración COM2. El ejemplo anterior M0 → OUT Y0 no reproducía esa disposición.

Se corrige la práctica para esas referencias. Se mantienen tres entradas superiores con tornillos independientes, apertura previa, sujeción y bloqueo de extracción cuando están apretados. Después se selecciona y enchufa el conector al PLC; sin esa unión el enlace no responde. Las correspondencias del ensayo T1/T2/T3 no se presentan como identificación certificada de los bornes reales de la maqueta.

El destornillador se muestra durante el giro y desaparece tras 550 ms, con cancelación del temporizador al desmontar el componente. La acción puede repetirse sobre otra cabeza.

Se añade ProgrammingUsb: cable de programación en la pizarra que se selecciona o arrastra a USB trasero del HMI o USB del PLC. Los destinos se diferencian del DB9/RS485. La carga exige cable al equipo correcto y equipo encendido. Se conserva el acceso equivalente desde el editor.

El editor LD tiene dos redes configurables con SET y RESET. Asignación equivalente: Arranque=M0, Parada=M1, Motor=Y0. **Las direcciones de las variables no se distinguen en la captura**, por lo que estas no se atribuyen al archivo original Instruccional.isp. El modelo conserva Y0 tras marcha y lo reinicia al recibir parada; una pérdida de respuesta conserva la salida previa.

La tercera red representa la configuración COM2 mediante un bloque visual con los parámetros del ejemplo. No ejecuta DFB propietario ni copia códigos numéricos ilegibles. Continúa el transporte RTU 8E1 simplificado, explícitamente distinto del formato original 7E1 de la captura. La función transaction conserva su comportamiento previo por defecto; el ensayo SET/RESET permite el segundo índice lógico de comando para parada.

Se incluye la imagen original extraída del PDF para comparar dentro del editor y se actualiza la guía pública descargable. La pantalla didáctica muestra el motor y pulsadores verde/rojo; no supone un motor físico cableado a Y0.

Archivos: TerminalWiring, ProgrammingUsb, DeltaProjectEditor, DeltaHardware, CommissionBench, commissioning, serialProtocol, commission-bench.css; ayuda pública, imagen de referencia, versiones y pruebas.

Validación: npm install (0 vulnerabilidades), check y build. Modelo commissioning: PLC enchufado, apertura/inserción/apriete, dos redes SET/RESET y direcciones, carga, marcha/paro, timeout, retención y recuperación; laboratorio existente 38/38. UI en Chromium táctil y WebKit mouse/teclado a 393/1180/1440 px: bornera y su enchufe, retirada automática de destornillador, USB físico del HMI, ambas cargas, error de dirección, programa, Y0, falla115200 y recuperación. Son pruebas emuladas, no ensayo con hardware físico.

Publicación final: https://modo-lab.vercel.app, dpl_BGXcnk4FPuVGKifHzwErkSAXdvAd READY. Se verifican nuevamente los recorridos móviles públicos Chromium/WebKit tras publicar. El cable USB conectado detrás del HMI sale por debajo de la carcasa al ver el frente, sin dibujar el conector sobre la pantalla.
