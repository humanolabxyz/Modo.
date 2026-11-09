# modo. Agro · Fase 4 — Tiempo, suelo y cultivo

Estado: implementada y verificada (ver «Pruebas»). La demo 1 (terreno, piezas, conexiones, hidráulica) ahora **vive en el tiempo**: el agua del estanque se gasta, llega a la parcela, el suelo la guarda o la pierde y el cultivo crece, se estresa, muere o se cosecha.

## Qué se puede hacer
- **Reloj global** con pausa, 1×, 5×, 20×, 100×, **1 h/s** y **1 día/s**. Muestra fecha y hora locales, el día de la simulación y el clima del día (temperatura mínima–máxima, ET₀ y lluvia). Un mundo siempre se abre **en pausa**.
- **Estanque que se vacía:** entrega exactamente el agua que sale por los aspersores. Tiene un **volumen muerto** bajo la salida (≈ 1 860 L de 10 000) que no se puede extraer; al llegar a él, la red queda sin agua y se avisa. «Llenar el estanque» lo rellena a mano (es una acción del mundo y no se deshace; las compras y fuentes de agua llegan en la Fase 6).
- **Riego sobre la parcela:** cada aspersor moja un círculo (`radioM`, 8 m por defecto, editable). El agua que cae dentro de una parcela se le suma. El inspector del aspersor dice qué parcelas toca, a cuántos mm/h y si escurre.
- **Suelo por parcela:** arenoso, franco o arcilloso. Una capa de 0,5 m con capacidad de campo, punto de marchitez, saturación, drenaje e infiltración propios.
- **Tomate** (primer cultivo): sembrar, ver su etapa (establecimiento → desarrollo vegetativo → floración → llenado de frutos → lista para cosechar), el avance del ciclo, la edad, el estrés hídrico y el **rendimiento esperado**; cosechar (solo cuando está lista) o retirar el cultivo.
- **Sonda de humedad:** lee la parcela donde está clavada (humedad y agua útil); fuera de toda parcela dice que no mide nada.
- **Alertas** (derivadas del estado actual, por eso un mundo reabierto muestra las mismas): estanque sin agua utilizable o con menos del 15 %, estrés hídrico (aviso a <70 %, grave a <30 %), cultivo muerto, cultivo listo. Además un **registro de sucesos** de la sesión con su fecha simulada.
- **Vista 3D:** la parcela cambia de ocre (seca) a verde (húmeda); el cultivo es una capa que sube con su altura y cambia de color (verde sano → amarillo estresado → marrón muerto → rojo al madurar); el estanque tiene un medidor de nivel.

## Modelo (didáctico)
| Parte | Modelo | Ruta |
|---|---|---|
| Reloj | `simSeconds` + fecha local de inicio. Pasos de hasta 5 min con agua en movimiento y 30 min sin ella; nunca cruzan la medianoche | `sim/clock.ts`, `sim/step.ts` |
| Clima | Árido genérico del hemisferio sur, función pura de (semilla, día): temperatura estacional con ruido, ET₀ (≈ 6,3 mm/día en verano, 2,2 en invierno), lluvia esporádica (≈ 9 días al año, 1–12 mm entre las 14 y las 17 h). **Ficticio**: no son datos de una estación real | `sim/climate.ts` |
| Aleatoriedad | Hash con semilla de (canal, día): **sin estado**, así el mismo día da lo mismo sin importar cómo se avanzó el reloj, ni si se guardó y se reabrió | `sim/clock.ts` |
| Reparto del día | ET en media onda de seno (6–18 h) y lluvia constante (14–17 h), integradas de forma exacta por tramo | `sim/climate.ts` |
| Suelo | Balance de cubeta: Δ agua = riego + lluvia − escorrentía − ET real − drenaje. Drenaje exponencial sobre capacidad de campo (exacto para cualquier paso); escorrentía si la intensidad supera la infiltración o se supera la saturación | `sim/soil.ts` |
| Estrés | Ks (estilo FAO-56): 1 mientras se gasta menos del 40 % del agua útil, lineal hasta 0 en el punto de marchitez | `sim/soil.ts` |
| Cultivo | Grados-día (base 10 °C, tope 30 °C), Kc interpolado (0,5 → 1,15 → 0,8), daño por etapa con Ky (estilo FAO-33: 0,2 / 0,4 / 1,1 / 0,8). Muere tras 4 días con estrés casi total | `sim/crops.ts`, `sim/soil.ts` |
| Riego | Círculo de muestreo en espiral; reparto uniforme en la parcela, pero la **intensidad local** (caudal / área del círculo) decide la escorrentía | `sim/irrigation.ts` |
| Estanque | Entrega = caudal de la red × tiempo; si el paso lo vaciaría, se reparte lo que había (el balance de masa se cierra) | `sim/step.ts` |

**Reutilizado:** la red hidráulica y la energía de la Fase 3 (`analyze`) se evalúan en cada paso; el reloj se apoya en el `Clock` del formato `modo-agro` v1.

## Decisiones
- **El estado vivo no entra en el historial.** Agua del estanque, humedad del suelo y cultivo son tiempo ya transcurrido. Deshacer y rehacer revierten la estructura (piezas, conexiones, relieve) y **conservan** el estado vivo (`sim/live.ts`). Cambiar nivel, suelo o cultivo, sembrar y cosechar tampoco se deshacen.
- **Formato `modo-agro` v1 sin cambio de versión:** `SIM_SPEEDS` suma 3600 y 86 400 (un archivo viejo sigue siendo válido; un archivo nuevo con esas velocidades no lo abre una versión anterior del programa). La parcela guarda su estado en `entity.state` con claves nuevas; el aspersor suma el parámetro `radioM`. Un mundo de la Fase 3 se abre y se completa solo.
- **Se abre en pausa:** la velocidad guardada se ignora al cargar.
- **Tiempo de pantalla:** el reloj corre cada 100 ms con un presupuesto de 12 ms de cálculo; si el equipo no alcanza la velocidad pedida, el tiempo avanza más lento y la barra lo avisa. Con la pestaña oculta el navegador detiene los temporizadores y el tiempo no corre.
- **Autoguardado:** guarda a más tardar 700 ms después del primer cambio pendiente (antes esperaba 700 ms de calma, que con el reloj corriendo nunca llegaban).
- **Reproducibilidad:** mismo navegador y misma versión, como se declaró al aprobar el plan.

## Qué NO es
Una parcela agregada (una sola capa, reparto uniforme del agua); sin plagas, sales, nutrientes, heladas ni calor; el estrés hídrico es la única causa de pérdida de rendimiento; un solo cultivo; sin raíces que crezcan; clima ficticio sin gradiente por altitud; sin economía (lo que se cosecha no se vende). La interfaz repite estas limitaciones.

## Pendientes conocidos
- Cada parcela tiene un solo suelo y un solo cultivo; sin zonas ni franjas.
- El volumen muerto del estanque y las curvas del tomate son números didácticos, no de un fabricante ni de una variedad.
- El riego automático (sensor → tablero → bomba) llega con el PLC incrustado de la Fase 5; hoy se riega con el interruptor del tablero.
- Los FPS reales siguen sin medirse en un equipo con GPU ni en una tablet.
- En móvil la barra de tiempo, el inspector y la lista de piezas comparten una pantalla estrecha y se solapan; conviene un diseño propio antes de la beta.

## Pruebas
`npm run verify:agro` → modelo (67), terreno (39), mundo (56), hidráulica (44) y **simulación (27 bloques)**. Esta última incluye: reloj y calendario (año nuevo, bisiesto), aleatorio uniforme y determinista, clima estacional, reparto horario exacto, etapas y Kc, Ks monótono, **balance de masa del suelo < 1e-9 mm en 2 400 pasos aleatorios**, drenaje contra la exponencial exacta, escorrentía por infiltración, cobertura del aspersor, **conservación de agua estanque → parcela**, vaciado hasta el volumen muerto y reanudación al llenar, ciclo completo con riego atendido (5 etapas, cosecha de 80 t/ha), sequía sin riego (muerte y alerta), sensibilidad por etapa, siembra y cosecha, avanzar de una vez o en 1 000 tramos, guardar y reabrir, deshacer sin deshacer el tiempo, mundos de la Fase 3 y rendimiento (30 días con riego continuo en ≈ 0,1 s).
`npm run verify:agro-ui` → 39 bloques con ratón y teclado reales; los nuevos recorren: abrir en pausa, sembrar, correr a 1 h/s y 1 día/s, alerta al agotarse el estanque, llenarlo, recargar conservando fecha y cultivo, Ctrl+Z sin deshacer el tiempo y la barra a 390 px.
