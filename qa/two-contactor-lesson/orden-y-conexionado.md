# Lección · Estrella-triángulo · 2 contactores — orden y conexionado (40 cables)

KT1 (temporizador neumático) es el contactor principal: R, S y T entran por KT1. KM1 (contactor + relé térmico) es el de triángulo y KM2 (contactor trifásico) el de estrella. Mando: idéntico al tablero bien armado por el autor. Fuerza: figura Nº2 de la guía del profesor.

| # | Parte | Cable (de → a) | Paso |
|---|---|---|---|
| 1 | Mando | Fuente · F → KM1 · 95 | Protección del mando · F a 95 |
| 2 | Mando | KM1 · 96 → Botoneras · S2 borne 1 | Del térmico al paro · 96 a S2:1 |
| 3 | Mando | Botoneras · S2 borne 2 → Botoneras · S1 borne 3 | Salida del paro a marcha · S1 |
| 4 | Mando | Botoneras · S1 borne 4 → KT1 · A1 | Bobina del conjunto temporizado · A1 |
| 5 | Mando | KT1 · A2 → Fuente · N | Retorno de KT1 · A2 a N |
| 6 | Mando | Botoneras · N → Fuente · N | Neutro común de los pilotos |
| 7 | Mando | Botoneras · S2 borne 2 → KT1 · 13 | Retención de KT1 · entrada 13 |
| 8 | Mando | KT1 · 14 → Botoneras · S1 borne 4 | Retención de KT1 · salida 14 |
| 9 | Mando | Botoneras · S1 borne 4 → KT1 · 55 | Alimentación de la etapa estrella · 55 |
| 10 | Mando | KT1 · 56 → KM1 · 71 | Salida temporizada de estrella · 56 a KM1:71 |
| 11 | Mando | KM1 · 72 → KM2 · A1 | Enclavamiento de estrella · KM1:72 a KM2:A1 |
| 12 | Mando | KM2 · A2 → Fuente · N | Retorno de KM2 · A2 a N |
| 13 | Mando | Botoneras · S1 borne 4 → KT1 · 67 | Alimentación de la etapa triángulo · 67 |
| 14 | Mando | KT1 · 68 → KM2 · 71 | Salida temporizada de triángulo · 68 a KM2:71 |
| 15 | Mando | KM2 · 72 → KM1 · A1 | Enclavamiento de triángulo · KM2:72 a KM1:A1 |
| 16 | Mando | KM1 · A2 → Fuente · N | Retorno de KM1 · A2 a N |
| 17 | Mando | Fuente · F → KM1 · 81 | Piloto rojo · F a KM1:81 |
| 18 | Mando | KM1 · 82 → KM2 · 81 | Piloto rojo · KM1:82 a KM2:81 |
| 19 | Mando | KM2 · 82 → Botoneras · piloto 2 | Piloto rojo P2 · KM2:82 a P2 |
| 20 | Mando | Fuente · F → KM1 · 97 | Alimentación del aviso térmico · 97 |
| 21 | Mando | KM1 · 98 → Botoneras · piloto 3 | Aviso de disparo · 98 a P3 |
| 22 | Mando | KM2 · A1 → Botoneras · piloto 1 | Piloto P1 · estrella |
| 23 | Mando | KM1 · A1 → Botoneras · piloto 4 | Piloto P4 · triángulo |
| 24 | Fuerza | Fuente · R → KT1 · L1 | Fuerza · fase R a KT1 |
| 25 | Fuerza | Fuente · S → KT1 · L2 | Fuerza · fase S a KT1 |
| 26 | Fuerza | Fuente · T → KT1 · L3 | Fuerza · fase T a KT1 |
| 27 | Fuerza | KT1 · T1 → Motor · U1 | De KT1 al motor · U1 |
| 28 | Fuerza | KT1 · T2 → Motor · V1 | De KT1 al motor · V1 |
| 29 | Fuerza | KT1 · T3 → Motor · W1 | De KT1 al motor · W1 |
| 30 | Fuerza | Motor · W2 → KM2 · L1 | Extremo del motor hacia KM2 · estrella · W2 |
| 31 | Fuerza | Motor · U2 → KM2 · L2 | Extremo del motor hacia KM2 · estrella · U2 |
| 32 | Fuerza | Motor · V2 → KM2 · L3 | Extremo del motor hacia KM2 · estrella · V2 |
| 33 | Fuerza | KM2 · T1 → KM2 · T2 | Puente del punto estrella · KM2 · T1–T2 |
| 34 | Fuerza | KM2 · T2 → KM2 · T3 | Puente del punto estrella · KM2 · T2–T3 |
| 35 | Fuerza | KT1 · L1 → KM1 · L1 | Triángulo · L1 de KT1 a L1 de KM1 |
| 36 | Fuerza | KT1 · L2 → KM1 · L2 | Triángulo · L2 de KT1 a L2 de KM1 |
| 37 | Fuerza | KT1 · L3 → KM1 · L3 | Triángulo · L3 de KT1 a L3 de KM1 |
| 38 | Fuerza | KM1 · T1 → Motor · W2 | Rama de triángulo · KM1 · T1 a W2 |
| 39 | Fuerza | KM1 · T2 → Motor · U2 | Rama de triángulo · KM1 · T2 a U2 |
| 40 | Fuerza | KM1 · T3 → Motor · V2 | Rama de triángulo · KM1 · T3 a V2 |

## Fases en cada etapa (simulación)

| Etapa | Contactores cerrados | Tensión por devanado |
|---|---|---|
| Reposo | ninguno | — |
| Estrella | KT1 + KM2 | 219 V |
| Triángulo | KT1 + KM1 | 378 V |
