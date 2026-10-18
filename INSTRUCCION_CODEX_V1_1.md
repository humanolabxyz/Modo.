# Instrucción completa para Codex — PanelLab INACAP, correcciones v1.1

## Contexto

Hay una app local para aprender a identificar bornes de un banco eléctrico didáctico INACAP. La fase 1 fue aprobada visualmente. El ZIP trae el proyecto Astro + React + TypeScript original, un HTML autónomo que representa esa versión, recortes/fotos iniciales, nuevas fotos del banco con cables banana verde petróleo y datos de los 108 bornes modelados en 7 módulos.

Tu trabajo consiste en implementar una **v1.1 de fidelidad visual** **sobre el proyecto existente**, no inventar una segunda app ni programar toda la fase de cableado. Lee `AGENTS.md`, `TABLA_TECNICA_PANEL_V1_1.md`, `REFERENCIAS_FOTOGRAFICAS_V1_1.md` y `PRUEBAS_Y_APROBACION_V1_1.md` antes de modificar archivos.

## Restricciones no negociables

1. Trabaja en **local**: NO uses Sites, NO despliegues Vercel, NO publiques nada ni crees un proyecto distinto.
2. Conserva estética aprobada: panel blanco, bastidor gris, fondo sobrio y UI minimalista, alto contraste, legible. Sin dashboards extra, navegación compleja o look genérico.
3. Fuente editable: `src/components/Board.tsx`, `src/components/App.tsx`, `src/data/panel.ts`, `src/styles/global.css`, y datos de `public/`. Mantener Astro/React/TS.
4. **Ningún terminal desaparece:** preservar ids del inventario; cada borne debe ser seleccionable y tener identificador único compuesto módulo + borne.
5. No confundir referencia del contacto (p.ej. 13–14) con referencia de dispositivo (p.ej. KM1). Etiquetas KM solo editables/por confirmar.
6. Las fotos de sesiones distintas muestran módulos reubicados; tomar el prototipo aprobado como composición base y corregir cada módulo a partir de su foto, sin pretender que todas las fotos son simultáneas.
7. **NC/NA:** los pares 1–2 rojos y 3–4 crema están confirmados visualmente; interpretar 1–2 como NC y 3–4 como NA solo a título provisional hasta que se verifique la pieza real. Jamás deducirlo únicamente del color.
8. La app debe marcar que es un entrenamiento **virtual desenergizado**. No indicar que se puede energizar la maqueta real con conexiones inferidas.

## Tareas en orden

### A. Validar el punto de partida

- Revisar y ejecutar `npm install`, `npm run check` y `npm run dev` / `npm run build`.
- Abrir y comparar con `PANEL_LAB_INACAP.html` y la preview aprobada.
- Auditar en código que haya siete módulos y 108 bornes existentes; registrar cualquier error previo.

### B. Corregir soporte, escala y navegación

- Mejorar rieles metálicos horizontales, paneles de color blanco, separación y fondo acanalado.
- Ajustar tamaños y alineaciones de acuerdo con fotos reales. Evitar rejillas/espaciados simétricos ficticios.
- Mantener zoom suave, paneo, búsqueda, selección, inspector y tooltips; mejorar uso táctil y foco de teclado.
- Mostrar identificador completo `modulo:borne` para desambiguar números que se repiten.

### C. Corregir cada módulo

**Alimentación:** transformador con rótulo 220V/24V/3A, caja de 2 tomas, tres pilotos rojos, piloto ámbar, fusible `FUS 3A`. Mantener en fila inferior R azul, S negro, T rojo, N crema, F rojo, TP verde; `24V A.C.` en zona correcta. No inventar conexiones internas.

**Luces piloto y botoneras:** cuatro pilotos superiores verde/rojo/ámbar/verde, **cuatro bornes rojos independientes** debajo. Tres pulsadores verde/rojo/verde, cada uno con pares verticales 1–2 rojo y 3–4 crema, junto a cada pulsador. `N` crema arriba a la derecha y `TP` verde a ambos lados abajo. Mantener la numeración clara incluso con zoom medio.

**Contactor + relé térmico:** geometría del aparato a la izquierda y bornes en columnas; A2/A1, L1/L2/L3, T1/T2/T3, 71–72, 81–82, 95–96, 13–14, 63–64, 93–94, 97–98 y TP donde corresponda según foto. Evitar poner 95–96 en el contactor sin térmico.

**Contactor trifásico:** reproducir mejor frente del aparato; A2/A1, tres polos superiores/inferiores y pares auxiliares 71–72, 81–82, 13–14, 63–64, 93–94, TP a ambos lados. Etiqueta tipo KM debe ser configurable y mostrarse como 'por confirmar' cuando falte respaldo.

**Temporizadores:** dos módulos separados; mejorar forma del temporizador neumático, disco frontal y diferencias entre ambos. Respetar A1/A2, L1/L2/L3, T1/T2/T3, 13–14, 55–56, 67–68 y TP. NO definir tipo de retardo sin datos del fabricante.

**Bornera motor:** módulo independiente con U1/V1/W1 (azul/negro/rojo), W2/U2/V2 (rojo/azul/negro) y TP verde. Mantener forma rectangular y disposición como foto.

### D. Preparar estilo visual de cables banana SIN implementación eléctrica

- Usar las nuevas fotos para diseñar **un componente visual reutilizable** de cable verde petróleo/turquesa oscuro, conectores tipo banana cilíndricos con cabeza redondeada y trazo flexible de curva con caída.
- No dibujar cables permanentes que oculten el panel en estado 'vacío'. Si agregas preview de estilo, debe activarse explícitamente y rotularse **demostración visual sin simulación de continuidad**.
- Preparar su API de datos para futura fase: cable ID, origen, destino, color, desplazamientos opcionales para curva, y conexión física apilada. Sin límites arbitrarios de tres conectores; límites reales requieren modelo técnico verificado.
- No presentar trayectos automáticamente como validación de circuitos reales.

### E. Calidad y entrega

- Mantener compatibilidad responsive en desktop/móvil, mejorar las zonas pulsables y el control del zoom.
- Ejecutar `npm run check`, `npm run build` y comprobar manualmente (o con pruebas) buscar `95`, `A1`, `13`, `S2:3`; inspeccionar cualquier borne y cambiar de módulo.
- Entregar capturas antes/después de desktop y móvil y un registro de cambios.
- Enumerar dudas reales pendientes en lugar de inventar datos del equipo.

## No hacer todavía

- Ni motor lógico de circuitos, ni validación de continuidad real, ni interpretación automática de esquemas proyectados, ni modo guiado que conecte pares sin un diagrama validado.
- No añadir muchas pantallas, menús pesados, login, Supabase, backend o funciones ajenas.

## Definición de terminado

Puedes considerar la v1.1 lista para mostrar al usuario cuando sea reconociblemente más fiel en los **7 módulos**, sigan modelados los 108 bornes originales sin duplicidades, funcionen búsqueda/zoom/inspector, el proyecto compile y el estilo visual de los cables quede preparado. Si no puedes cumplir algo, explica el motivo y entrégalo como pendiente, no como hecho.
