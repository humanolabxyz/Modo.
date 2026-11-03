# Robots con cuña, pala y defensa frontal

Ampliación local del 30/10/2026, solicitada después de la arena: faltaban construcciones con accesorios específicos para empujar. Se agregan tres robots editables y tres piezas sueltas, conservando el taller y la arena existentes.

## Construcciones disponibles

| Plantilla | Tracción | Accesorio | Piezas |
|---|---|---|---:|
| Sumo cuña · perfil bajo | Dos motores TT, dos ruedas y apoyo trasero | Cuña inclinada de perfil bajo | 18 |
| Sumo pala · 4WD | Cuatro motores TT, cuatro ruedas y dos L298N | Pala con base inclinada, respaldo, laterales y pestañas de montaje | 22 |
| Sumo defensa · empujador | Dos motores TT, dos ruedas y apoyo trasero | Defensa vertical ancha | 18 |

Los tres incluyen UNO, alimentación a través de interruptor/regulador/protoboard, programa compilado de avance con retroceso/giro al detectar el borde, dos sensores TCRT5000 y HC-SR04 elevado. La variante 4WD conserva dos drivers; las señales de cada lado llegan a sus dos motores. No se cambiaron las plantillas antiguas ni los proyectos ya guardados.

## Accesorios de construcción libre

| Pieza | ID | Caja envolvente X × Y × Z | Masa del modelo | Contacto |
|---|---|---|---|---|
| Cuña de sumo | `sumo-wedge` | 180 × 40 × 75 mm | 65 g | Prisma convexo inclinado, punta de 2 mm |
| Pala empujadora | `sumo-scoop` | 200 × 45 × 110 mm | 100 g | Seis volúmenes convexos: base, respaldo, dos laterales y dos pestañas |
| Defensa frontal ancha | `sumo-bumper` | 200 × 65 × 18 mm | 90 g | Placa vertical convexa |

Son geometrías y masas didácticas adaptadas al chasis actual. La altura inferior inicial es de 5,5 mm; no se simula un filo infinitamente fino. Son accesorios **fijos**, sin servo ni mecanismo elevador. Su masa y superficie de contacto participan en la física, sin asignarles una fuerza especial o una bonificación de combate.

Referencia comercial verificada: la [Basic Sumo Blade de Pololu, artículo 1410](https://www.pololu.com/product/1410) se monta al frente del Zumo y usa una chapa de acero inoxidable de 0,036 pulgadas para empujar. Su [catálogo Zumo](https://www.pololu.com/category/129/zumo-robots-and-accessories) mantiene ese accesorio. Se reutiliza el principio mecánico; las piezas añadidas tienen las medidas de la tabla y no representan una réplica dimensional del Zumo. La investigación sobre oferta y uso en Chile continúa documentada en [la investigación previa](INVESTIGACION_VARIEDAD_ROBOTICA_CHILE_2026-10-29.md); esta ampliación no aporta una comprobación de stock chileno de estas piezas específicas.

## Cómo encontrarlos

1. **Opciones del proyecto →** elegir la plantilla con cuña, pala o defensa. También aparecen en Mis proyectos y en la referencia opcional de la guía de armado.
2. Para modificar una construcción libre, buscar **sumo**, **pala**, **cuña** o **defensa** en Piezas. Añadir el accesorio y acercar su fijación posterior al anclaje **Pala, cuña o defensa frontal** del chasis. El encaje usa las herramientas existentes. El anclaje admite un accesorio a la vez; separar el anterior permite reemplazarlo.
3. **Arena de sumo** abre por defecto cuña contra pala 4WD. Se pueden seleccionar los tres ejemplos o las versiones guardadas. **Construir mi versión** crea la copia habitual del proyecto y abre el taller.

## Geometría y física

`catalog/combat.ts` define una sola fuente de vértices y fracciones de masa. `CombatMesh.tsx` construye su superficie visible y `physics.ts` crea sus colisionadores convexos con esos mismos vértices. La pala conserva espacio vacío entre sus laterales; una caja envolvente única llenaría incorrectamente ese espacio.

Las advertencias de interferencia comprueban una caja orientada por volumen convexo en estos accesorios, conservando el algoritmo anterior para las otras piezas. Las advertencias siguen siendo aproximadas; el contacto del simulador usa los volúmenes convexos. Los sensores de la pala 4WD se montan entre sus pestañas y por delante de los motores; el sensor ultrasónico queda elevado sobre el frente. Se verificó que las tres construcciones iniciales no tengan interferencias.

## Verificación y límites

- `npm install`, `npm run check`, `npm run build`: correctos. Sin dependencias nuevas. Permanecen las cuatro vulnerabilidades altas y la advertencia de tamaño de paquetes ya existentes.
- `npm run verify:robotics-combat-parts`: cinco grupos. Revisa construcción, alimentación/circuito, montajes, dimensiones, masa, serialización, entrada a arena y contacto. Las sondas físicas confirman la pendiente de la cuña y el hueco, base, respaldo y laterales de la pala. Ejecuta un combate cuña/pala con dos programas y seis motores sin alterar los proyectos fuente.
- `npm run verify:robotics-combat-parts-ui`: escritorio 1440 × 900 y móvil 390 × 844 con toque emulado. Revisa las tres piezas con miniaturas, creación de las tres plantillas, guardado/reapertura y combate entre dos construcciones guardadas.
- Regresión: 17 bloques de montaje, ocho guías de robots móviles y siete grupos de arena, incluida victoria física por empuje y conservación de los proyectos fuente.
- Evidencia: [modelo](../../qa/robotics-combat-parts/model-results.json), [interfaz](../../qa/robotics-combat-parts/ui-results.json), y miniaturas generadas desde el modelo local en `public/robotics/components/sumo-*.webp`.

No se probó en hardware ni en teléfonos/tablets físicos. No se desplegó. La elevación activa de la pala, orugas, daño y desprendimiento de piezas permanecen pendientes.

## Archivos de esta ampliación

- `src/robotics/catalog/combat.ts`, `catalog/index.ts`: tres accesorios y anclajes del chasis.
- `src/robotics/build/CombatMesh.tsx`, `PartMesh.tsx`: formas visibles; `build/interference.ts`: comprobación por volúmenes separados.
- `src/robotics/sim/physics.ts`: contacto convexo y reparto de masa.
- `src/robotics/project/templates.ts`: tres construcciones y variante 4WD con sensores/programa de borde.
- `src/robotics/arena/ArenaPanel.tsx`: nuevos ejemplos y selección inicial cuña/pala.
- `public/robotics/components/sumo-wedge.webp`, `sumo-scoop.webp`, `sumo-bumper.webp`: miniaturas.
- `qa/verify-robotics-combat-parts.mjs`, `qa/verify-robotics-combat-parts-ui.cjs`, `package.json`: verificaciones nuevas. Se actualizan las expectativas de catálogo de 20 a 23 piezas y de plantillas de 6 a 9 en pruebas existentes; el generador de miniaturas espera el guardado inicial sin fallar cuando todavía está vacío.

## Comparación visual

La arena anterior con robots del kit:

![Arena anterior](../../qa/robotics-arena/desktop-arena.png)

Nuevas construcciones con cuña y pala:

![Cuña contra pala](../../qa/robotics-combat-parts/desktop-arena.png)

Pala 4WD editable en el taller:

![Pala 4WD](../../qa/robotics-combat-parts/desktop-sumo-scoop.png)

Versión móvil:

![Pala en móvil](../../qa/robotics-combat-parts/mobile-sumo-scoop.png)
