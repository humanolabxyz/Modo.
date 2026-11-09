# Revisión de cables de la lección 05

KM1 del profesor corresponde al módulo temporizador neumático (KT1 en PanelLab). El cambio de nombres no cambia los bornes ni los cables.

Verificación local: 23 cables de mando y pilotos, 17 de fuerza. Las redes del diagrama coinciden con las de estos 40 cables. Marcha, retención, cambio temporizado, paro y TEST pasan en el modelo. Esto no verifica el montaje físico.

Se retiró del dibujo la retención auxiliar de triángulo heredada del esquema manual (símbolo 60 y conductores 101 y 110), que no existe en esta lección.

Pendiente de la guía: los 40 pasos no incluyen la TP del motor. La actividad de medición y el ejemplo la completan; el simulador la exige si está activada esa opción. La evaluación actual no la incluye en su referencia.

| Paso | Desde | Hasta |
|---|---|---|
| 1 | Fuente · F | KM2 del profesor / KM1 del banco (triángulo) · 95 |
| 2 | KM2 del profesor / KM1 del banco (triángulo) · 96 | Botonera · S2:1 |
| 3 | Botonera · S2:2 | Botonera · S1:3 |
| 4 | Botonera · S1:4 | KM1 del profesor / KT1 del banco · A1 |
| 5 | KM1 del profesor / KT1 del banco · A2 | Fuente · N |
| 6 | Botonera · N | Fuente · N |
| 7 | Botonera · S2:2 | KM1 del profesor / KT1 del banco · 13 |
| 8 | KM1 del profesor / KT1 del banco · 14 | Botonera · S1:4 |
| 9 | Botonera · S1:4 | KM1 del profesor / KT1 del banco · 55 |
| 10 | KM1 del profesor / KT1 del banco · 56 | KM2 del profesor / KM1 del banco (triángulo) · 71 |
| 11 | KM2 del profesor / KM1 del banco (triángulo) · 72 | KM3 del profesor / KM2 del banco (estrella) · A1 |
| 12 | KM3 del profesor / KM2 del banco (estrella) · A2 | Fuente · N |
| 13 | Botonera · S1:4 | KM1 del profesor / KT1 del banco · 67 |
| 14 | KM1 del profesor / KT1 del banco · 68 | KM3 del profesor / KM2 del banco (estrella) · 71 |
| 15 | KM3 del profesor / KM2 del banco (estrella) · 72 | KM2 del profesor / KM1 del banco (triángulo) · A1 |
| 16 | KM2 del profesor / KM1 del banco (triángulo) · A2 | Fuente · N |
| 17 | Fuente · F | KM2 del profesor / KM1 del banco (triángulo) · 81 |
| 18 | KM2 del profesor / KM1 del banco (triángulo) · 82 | KM3 del profesor / KM2 del banco (estrella) · 81 |
| 19 | KM3 del profesor / KM2 del banco (estrella) · 82 | Botonera · PILOTO_2 |
| 20 | Fuente · F | KM2 del profesor / KM1 del banco (triángulo) · 97 |
| 21 | KM2 del profesor / KM1 del banco (triángulo) · 98 | Botonera · PILOTO_3 |
| 22 | KM3 del profesor / KM2 del banco (estrella) · A1 | Botonera · PILOTO_1 |
| 23 | KM2 del profesor / KM1 del banco (triángulo) · A1 | Botonera · PILOTO_4 |
| 24 | Fuente · R | KM1 del profesor / KT1 del banco · L1 |
| 25 | Fuente · S | KM1 del profesor / KT1 del banco · L2 |
| 26 | Fuente · T | KM1 del profesor / KT1 del banco · L3 |
| 27 | KM1 del profesor / KT1 del banco · T1 | Motor · U1 |
| 28 | KM1 del profesor / KT1 del banco · T2 | Motor · V1 |
| 29 | KM1 del profesor / KT1 del banco · T3 | Motor · W1 |
| 30 | Motor · W2 | KM3 del profesor / KM2 del banco (estrella) · L1 |
| 31 | Motor · U2 | KM3 del profesor / KM2 del banco (estrella) · L2 |
| 32 | Motor · V2 | KM3 del profesor / KM2 del banco (estrella) · L3 |
| 33 | KM3 del profesor / KM2 del banco (estrella) · T1 | KM3 del profesor / KM2 del banco (estrella) · T2 |
| 34 | KM3 del profesor / KM2 del banco (estrella) · T2 | KM3 del profesor / KM2 del banco (estrella) · T3 |
| 35 | KM1 del profesor / KT1 del banco · L1 | KM2 del profesor / KM1 del banco (triángulo) · L1 |
| 36 | KM1 del profesor / KT1 del banco · L2 | KM2 del profesor / KM1 del banco (triángulo) · L2 |
| 37 | KM1 del profesor / KT1 del banco · L3 | KM2 del profesor / KM1 del banco (triángulo) · L3 |
| 38 | KM2 del profesor / KM1 del banco (triángulo) · T1 | Motor · W2 |
| 39 | KM2 del profesor / KM1 del banco (triángulo) · T2 | Motor · U2 |
| 40 | KM2 del profesor / KM1 del banco (triángulo) · T3 | Motor · V2 |