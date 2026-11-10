# modo. Agro · Integridad de la edición del terreno

La Etapa 2 parte de `f4fb524` (línea base) y `397848e` (migración v1 a v2), integrados en `agro-consolidacion`. Conserva el generador V1, el esquema v2 y la copia previa a la migración de IndexedDB.

## Flujo en el editor

1. Los pinceles Subir, Bajar y Nivelar muestran el relieve en vivo. En una zona libre, soltar confirma el trazo directamente.
2. Si cambian la huella o el apoyo de una pieza, los extremos de una tubería o el paso de una conexión, se abre el diálogo con los nombres y los puertos afectados. También muestra el cambio de cota propuesto y los límites de pendiente o de colocación.
3. **Cancelar** o pulsar Escape restaura la malla confirmada sin consumir un paso de historial. **Aplicar y reasentar** ajusta en vertical las piezas que lo admiten. Las que están bloqueadas, fuera de límites o en una pendiente excesiva quedan en su posición con una incidencia. **Aplicar y señalar** conserva todas las poses y las cotas de los extremos de las tuberías afectadas.
4. Las conexiones afectadas conservan su identidad, sus puertos, su ruta y su estado. La indicación de revalidación aparece en Alertas y en las conexiones del inspector. Las incidencias de apoyo también aparecen al inspeccionar la pieza.
5. Confirmar registra relieve, poses e incidencias en un solo paso. Deshacer y rehacer revierten ese conjunto. El agua, el reloj y los cultivos conservan su avance habitual.

El diálogo se ubica a la derecha en escritorio y abajo en móvil. La lista tiene desplazamiento propio y las acciones quedan fijas con el recuento de instalaciones que se moverán o quedarán por revisar. Seleccionar una instalación o conexión encuadra y resalta ese elemento en la escena. Cuando hay más de 80 elementos, la escena dibuja las marcas generales juntas y reserva el contorno o trazado detallado para la fila activa. Al cerrar la revisión vuelve el encuadre anterior.

## Implementación

- `terrain/model.ts` conserva los valores originales de los vértices tocados durante el trazo y permite restaurarlos exactamente. Los centros de pincel fuera del mapa se rechazan.
- `world/impact.ts` analiza la región de celdas tocadas, las huellas orientadas del catálogo, el límite de pendiente de colocación y las conexiones. El contacto de una ruta con el terreno se comprueba a la resolución de la malla.
- `world/session.ts` publica una sola revisión guardable por transacción. Mientras el jugador pinta o decide, la simulación y la exportación leen el relieve confirmado. Si ya había otros cambios guardables, un guardado forzado los puede conservar junto con ese relieve.
- Las cotas fijadas de una tubería y las incidencias de apoyo usan `Entity.state`. Los avisos de conexiones usan el `reason` existente. Se conserva un diagnóstico previo de conexión y se añade el aviso cuando cabe en el campo. El mundo sigue siendo v2.
- Recolocar explícitamente una pieza elimina su marca de apoyo y, en una tubería, devuelve las cotas de los extremos al comportamiento habitual. La revisión de una conexión queda visible mientras exista esa unión. Las parcelas y sus cultivos siguen usando la superficie del terreno para dibujarse.

## Verificación

- `npm run verify:agro` incluye `qa/verify-agro-terrain-impact.mjs`. Cubre bomba, estanque, invernadero, tubería conectada, cable afectado en medio del recorrido, bordes, historial y migración de un mundo v1 con 30 ediciones.
- `npm run verify:agro-migration-ui` usa Chromium e IndexedDB en un perfil aislado. Comprueba la decisión sobre la finca conectada, el guardado forzado con el trazo pendiente, la reapertura y las copias de seguridad. Con `AGRO_QA_OUT` guarda las capturas de escritorio y móvil fuera del repositorio.
- `npm run verify:agro-ui` cubre el trazo sin diálogo en terreno libre y el resto del editor.

El escenario B de Mundos y Mapas V2 y las reglas comunes del Editor V3 son la referencia funcional. En la matriz original V2, MAP-020 corresponde al solape de parcelas y MAP-021 al paisaje exterior en cenital. El primero conserva su prueba de colocación y el paisaje exterior corresponde a la Etapa 3. Los casos equivalentes de edición bajo bomba y junto a tubería son MAP-20 y MAP-21 en la matriz V3.
