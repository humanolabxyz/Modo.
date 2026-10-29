# Protoboard y transistor — 2.2.13

Se separan físicamente los rieles inferiores de la fila j, sin cambiar identificadores ni grupos eléctricos. Se repiten letras en ambos extremos, se añaden números inferiores y se señalan los cortes centrales de los rieles. Se adapta el encuadre y los carriles de etiquetas.

El transistor muestra cuerpo de cara plana, tres patas y marcadores E/B/C sobre los orificios conectados. Ver pieza y patas abre una ampliación interactiva dentro del editor existente: cada pata explica su función y muestra su coordenada. La orientación inversa y PNP conservan sus correspondencias. Los parámetros avanzados quedan plegados.

No se afirma que E–B–C sea universal: corresponde al modelo virtual conservado. El ejemplo onsemi P2N2222A especifica C–B–E. Referencias: https://www.onsemi.com/pdf/datasheet/p2n2222a-d.pdf ; https://www.busboard.com/BB400 ; https://www.busboard.com/faq/power-rail-split . Los rieles partidos corresponden al circuito existente; otras placas pueden tener rieles continuos.

Verificación: TypeScript y build; modelo eléctrico; Chromium y WebKit con tamaños de móvil, tablet y escritorio para colocación, identificación de patas y orientación inversa. Regresiones de fuente física, colocación, pulsadores, motor y puntas. Emulación, sin prueba en dispositivos físicos.
