# ENTREGA — modo. Industria · Fase 14: nave industrial (v2.21.0)

Fecha: 2026-11-07 · Rama: `industria-fase2`.

## Qué hay
- **Nave industrial** alrededor de la planta (`src/industria/scene/hall.ts`, datos puros con prueba; se dibuja en `IndustriaCanvas.tsx`): suelo de hormigón con juntas, franja amarilla perimetral y pasillo verde; paredes con zócalo azul y cenefa; ventanas corridas; portón enrollable y puerta de personal; columnas de acero con base amarilla y negra; cerchas con lámparas colgantes; bandeja de cables y tubería de aire; estanterías con cajas, palets, extintor y señales. 256 primitivas.
- **Tamaño**: mínimo 24 × 16 m; crece con la planta (margen de 6 m) hasta 80 × 60 m.
- **Cuándo aparece**: cuando el proyecto contiene un «Piso de planta» (la mini fábrica lo trae). En ese caso reemplaza la rejilla.
- **Vista**: las paredes entre la cámara y la planta se ocultan solas al mirar desde fuera.

## Límites
Es decorado: no es parte del modelo, no se guarda, no se edita y no interfiere con montaje, cables ni simulación. Medidas y colores de ejemplo, no de una instalación real. No hay techo (para poder ver desde arriba).

## Pruebas
`npm run verify:industria`: nuevo grupo `hall` (7 comprobaciones).
