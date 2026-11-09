# modo. Agro · Fase 6 — Colocación de precisión, inventario, compras y obras

Estado: implementada y verificada (ver «Pruebas»). Se basa en las referencias ilustradas del bloque 05 y 06 («Colocación de precisión», «Conexiones técnicas», «Constructor de estructuras», «Operación y gestión» y el panel técnico de la bomba), no en las imágenes fotográficas.

## Qué se puede hacer
- **Inspector con cuatro pestañas** (como en la referencia de la bomba): **Colocación**, **Propiedades**, **Conexiones** y **Datos**.
  - *Colocación:* posición X y Z exactas (con el motivo si no cabe: choque, pendiente o fuera del mapa), giro, cota y pendiente bajo la pieza con su máximo, escala bloqueada, imán a rejilla y **«Alinear y conectar»** con el puerto libre compatible más cercano (con la distancia).
  - *Propiedades:* los mandos y los parámetros de la pieza (largo, ancho, caudal…), y si está **en obra**, su avance y cuándo termina.
  - *Datos:* las medidas del cálculo. En la bomba se agregan **presión de succión (P1), de descarga (P2), diferencial (ΔP), altura manométrica (H) y eficiencia hidráulica**.
- **Modo de la finca** (Archivo → Modo libre / Modo real). **Libre** es como siempre: todo se coloca al instante, sin costo. **Real** activa inventario, compras y obras. Cambiar de modo no entra en el historial y conserva la economía.
- **Gestión → Inventario y compras:** pestañas *Inventario* (lo disponible, lo colocado y lo que viene en camino de cada pieza; comprar 1 a 50 unidades), *Pedidos* (con su plazo), *Obras* (avance y tiempo restante) y *Libro* (cada compra y cada pago de mano de obra). El dock de Gestión muestra también las fichas que llegan en fases posteriores (Producción, Recursos, Personal, Economía, Mantenimiento, Asesorías y Análisis), desactivadas y con su fase.
- **Dock de piezas con inventario:** en modo real cada ficha dice cuántas unidades hay disponibles y el fantasma rechaza colocar una que no está («No hay «Estanque» en el inventario: cómprala en Gestión → Inventario»).
- **Obras:** en modo real una pieza colocada queda **en obra** (se ve ámbar y su etiqueta dice «En obra · N %») durante su tiempo de montaje y **no existe para el agua ni la energía** hasta que termina; entonces el registro anota «Terminó el montaje…» y empieza a funcionar. El paso de la simulación se corta justo cuando termina una obra, para que el momento sea exacto.

## Modelo
- **Inventario derivado:** lo disponible es `unidades recibidas − piezas del mundo de ese tipo`. Eliminar una pieza la devuelve; deshacer y rehacer cuadran solos. Lo que se guarda es el dinero, los pedidos, lo recibido y el libro (campo opcional `economy` del mundo; un mundo libre se escribe igual que antes).
- **Estado vivo:** el dinero, los pedidos y el montaje avanzan con el tiempo y **no se deshacen** (como el agua y el cultivo): deshacer una colocación no devuelve la mano de obra pagada, y deshacer algo posterior no devuelve una pieza ya montada a «en obra».
- **Precios y plazos ilustrativos** (`economy/economy.ts`): capital inicial CLP 5 000 000, mano de obra CLP 8 000 por hora de montaje, plazo de 2 a 14 días y montaje de 0,5 a 72 horas según la pieza. **No son cotizaciones de mercado ni de un proveedor**, y la interfaz lo dice.
- **Al pasar a real** lo ya construido se considera recibido (nada deja de funcionar). **Al volver a libre** las obras en curso se terminan.
- La parcela es una zona del suelo: no se compra ni se monta.

## Qué NO es
Una economía completa: no hay ingresos por cosecha ni ventas, personal, mantenimiento ni proveedores distintos (llegan en la Fase 8); tampoco hay costos de agua o energía. No hay fases de obra con permisos, ni cuadrillas, ni materiales por separado (la obra es una sola etapa por pieza), ni grupos o plantillas, ni diseños guardados del constructor de estructuras (solo los parámetros de largo y ancho de cada pieza). La escala de las piezas está bloqueada; el giro es solo sobre el eje vertical.

## Pendientes conocidos
- «Confirmar colocación» de la referencia (vista previa sin confirmar) no se hizo: se coloca con un clic y se ajusta en la pestaña Colocación, y Ctrl+Z deshace.
- Validación y puesta en servicio (la lista de comprobaciones de la referencia 05H) queda para la Fase 7 con el asistente del mundo.
- Los FPS reales siguen sin medirse en una GPU ni en una tablet.

## Pruebas
`npm run verify:agro` suma `qa/verify-agro-economy.mjs` (**10 bloques**): tabla de precios cubre el catálogo, modo libre intacto, reglas de compra (pieza, cantidad, fondos, entrega justa y una sola vez), flujo real completo (comprar → esperar → colocar → obra → riego solo al terminar cada pieza), eliminar y deshacer, guardar y reabrir, volver a libre, obra interrumpida, archivos dañados y rendimiento. `npm run verify:agro-ui` queda en **54 bloques** con un bloque nuevo de 6 pruebas de interfaz (inventario, compras y pedidos, dock con inventario, pestaña Colocación, fin de la obra y cambio de modo).
