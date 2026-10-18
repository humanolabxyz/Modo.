# Tabla técnica v1.1 — Banco de control INACAP

**Clave de verificación:** [F] se observa con claridad en las fotos; [C] deducción por convención eléctrica, requiere verificar el dispositivo; [P] requiere confirmar con rótulo/esquema original; [D] solo diseño futuro, no componente validado.

> Las fotos muestran un **banco modular reconfigurable**. La ubicación entre niveles cambia en distintas sesiones. La nomenclatura de los contactos se referencia por **módulo** y borne, no solo por el número.

| Módulo | Identificación física / terminales | Color de bornera | Verificación |
|---|---|---|---|
| Alimentación | R, S, T, N, F, TP | azul, negro, rojo, crema, rojo, verde | [F] color/nombre; [P] conexión interna de F/N |
| Fuente | transformador 220V / 24V 3A; protección, fusible FUS 3A; 3 pilotos rojos + 1 ámbar | — | [F] rotulación y disposición |
| Pilotos | cuatro pilotos superiores: verde, rojo, ámbar, verde, con un borne rojo bajo cada uno | rojo | [F] colores; [P] retorno eléctrico de cada piloto |
| Botonera 1 izquierda | pulsador verde; par 1–2 y par 3–4 | 1–2 rojo; 3–4 crema | [F] pares/colores; [C] NC/NA |
| Botonera 2 centro | pulsador rojo; par 1–2 y par 3–4 | 1–2 rojo; 3–4 crema | [F] pares/colores; [C] NC/NA |
| Botonera 3 derecha | pulsador verde; par 1–2 y par 3–4 | 1–2 rojo; 3–4 crema | [F] pares/colores; [C] NC/NA |
| Botonera | N derecha y TP verde dos esquinas inferiores | N crema; TP verde | [F] posiciones y colores; [P] circuito de retorno |
| Contactor + relé térmico | A1, A2; L1/L2/L3; T1/T2/T3; 71–72; 81–82; 95–96; 13–14; 63–64; 93–94; 97–98; TP | A1 crema; A2 rojo; fases azul/negro/rojo; NC negro; NA azul; TP verde | [F] etiquetas visibles; [C] función de algunos auxiliares |
| Contactor trifásico | A1, A2; L1/L2/L3; T1/T2/T3; 71–72; 81–82; 13–14; 63–64; 93–94; TP izquierda/derecha | A1 crema; A2 rojo; fases azul/negro/rojo; auxiliares negros/azules | [F] etiquetas, [P] KM exacto |
| Temporizador neumático 1 | A1/A2; L1/L2/L3; T1/T2/T3; 13–14; 55–56; 67–68; dos TP | crema/rojo; fases azul/negro/rojo; 55–56 negro; 67–68 azul; TP verde | [F] visible; [P] tipo y rango de retardo |
| Temporizador neumático 2 | A1/A2; L1/L2/L3; T1/T2/T3; 13–14; 55–56; 67–68; dos TP | como módulo 1 | [F] visible; [P] tipo y rango de retardo |
| Bornera de motor | U1, V1, W1 (arriba); W2, U2, V2 (abajo); TP lateral | azul, negro, rojo; rojo, azul, negro; verde | [F] bornes y colores |
| Dispositivo LOGO! | equipo visualizado en la proyección del diagrama, no confirmado como parte de este panel físico | — | [P] modelo, bornes, alimentación y existencia física en banco |

## Semántica pendiente de confirmar

- Los bloques de contactos **1–2 normalmente cerrados** y **3–4 normalmente abiertos** son la interpretación habitual conforme a numeración industrial, pero el banco concreto no ha sido ensayado ni se ve la referencia de fabricante en esas fotos. Registrar esos estados como **provisionales**, no como certezas por color.
- 95–96 suele ser NC y 97–98 suele ser NA del relé térmico, sujeto a verificación de ese componente.
- Contactos 55–56 y 67–68 se asocian a temporización, pero el funcionamiento y secuencia concreta varían; no programar retardo todavía.
- `N` no debe unirse con `TP` por presunción; son conceptos distintos.
- `KM1`, `KM2`, etc. deben mapearse al dispositivo físico y al símbolo del diagrama tras validación por el usuario/docente.

## Identificadores únicos

Conservar el formato de datos original para no confundir terminales repetidos: `BOTONERAS:S2:3`, `CONTACTOR_TRIFASICO:A1`, `CONTACTOR_TERMICO:95`, etc. El archivo `TABLA_DE_BORNES.csv` enumera los 108 bornes del proyecto base con sus colores y estados iniciales; **no** significa que todos hayan sido validados eléctricamente.
