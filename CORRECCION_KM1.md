# Anotaciones 1 y 2: posición del aparato de KM1

Corrección del 14 de octubre de 2026 sobre las dos anotaciones del usuario en Vercel. El conjunto dibujado de contactor y relé térmico se mueve al hueco entre las columnas de bornes de su placa: coordenadas locales (288, 110), frente a (23, 90). El rótulo del térmico se coloca dentro de su bloque para dejar libres los bornes inferiores.

Cambio de código: `src/components/Board.tsx`. La placa, bornes, cables, referencias y lógica de simulación mantienen sus coordenadas y conexiones.

Tipos y compilación correctos. Inspección en 1062×834, coincidente con el viewport indicado en las anotaciones, y 390×844. El conjunto ocupa 129×181 unidades SVG; no se superpone con las caras de los bornes ni sus rótulos. Capturas y verificación: `qa/correccion-km1/despues-1062.png`, `despues-mobile.png`, `visual-verification.json`; respaldo del componente anterior en `Board-antes.tsx`.
