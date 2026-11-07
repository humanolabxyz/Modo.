# ENTREGA — modo. Industria · Fase 11: formas reales y funciones pendientes (v2.18.0)

Fecha: 2026-11-07 · Rama git: `industria-fase2` (sin commits; todo está en el árbol de trabajo).
Cierre general y matriz de pendientes: `docs/industria/CIERRE.md`.

## 1. Contraseña de la Beta
- Quedó en **`.env.local`** (`ROBOTICA_BETA_PASSWORD=<la clave que pediste>`; el valor no se escribe en el repositorio ni en estos documentos). Ese archivo está ignorado por git (`.env*` en `.gitignore`): no llega al repositorio.
- **Importante**: `middleware.ts` solo se ejecuta en Vercel y lee la variable de **allí**. Para que `/industria/` y `/robotica/` pidan esa clave en producción hay que definirla en el panel de Vercel (Settings → Environment Variables → `ROBOTICA_BETA_PASSWORD`) y volver a desplegar. **No toqué Vercel ni desplegué nada.**
- La variable es **una sola** para Robótica, Arena e Industria: cambiarla afecta a las tres. Una clave tan simple se adivina en segundos; sirve para una Beta cerrada, no para proteger nada sensible.

## 2. Componentes 3D con sus formas originales
Cada tipo de aparato tiene su forma, construida con primitivas (sin archivos de modelos): `src/industria/scene/models.ts` (pura, con prueba) y `ModelMesh` en el escenario.
- **Riel DIN**: perfil omega con ranuras. **Placa**: 6 agujeros de fijación. **Bloque**: tapa y base.
- **Interruptor automático 1P/3P**: cuerpo modular, ventana, **una palanca por polo** y barra. **Contactor**: ventana, botón de prueba y 10 tornillos. **Relé térmico**: dial de ajuste y botón de rearme.
- **Fuente**: ranuras de ventilación y LED. **PLC**: LED por cada entrada y salida, etiqueta y bloques de bornes. **Borne**: separador y tornillos.
- **Pulsadores** NA (verde) y NC (rojo) con cabezal redondo y collarín; **piloto** con lente esférica que se enciende.
- **Motor**: carcasa cilíndrica con **aletas**, tapas, **eje**, patas y **caja de bornes**. **Red trifásica**: tablero con franja y barra de bornes.
- **Un tornillo por terminal** (cabeza metálica con ranura) en cada pieza.
- La caja del catálogo queda debajo, invisible, solo para seleccionar y arrastrar; con más de 80 piezas se usa un detalle ligero.
- **Honestidad**: son las formas de cada *tipo* de aparato, no la réplica de un producto ni de un fabricante; las **medidas siguen siendo de ejemplo** y el catálogo sigue siendo «Genérico · no verificado».

## 3. Funciones que faltaban
| Función | Qué se hizo |
|---|---|
| **Cables con grosor y enrutado** | Tubos con grosor (≈3,4 mm) que salen perpendiculares a la cara del terminal, suben por encima, rodean placas y piezas por un lado si hace falta y **no atraviesan ninguna** (comprobado). Cables cortos van directos. Rutas manuales respetadas. 540 cables entre 240 piezas en ≈0,2 s. |
| **Temporizador y contador en el PLC** | Bobinas **TON** (retardo a la conexión, en ms), **CTU** (contador por flanco) y **reset de contador**, con valor, límites, validación, documentación y visualización del avance. La simulación tiene un **reloj** (100 ms reales = 100 ms simulados cuando hay temporizadores). |
| **Relé térmico** | Fuerza 1–6 y auxiliar NC 95–96; se **dispara y rearma a mano** desde los mandos. **No modela la sobrecarga** (no hay corrientes). Admite falla de contactos y diagnóstico. |
| **Pulsador NC** | (de la ronda anterior) conduce en reposo y abre al pulsar. |
| **Sonido** | Botón «Sonido» (apagado por defecto): clic de contactores (cierra/abre), interruptores, pulsadores, disparo del relé y zumbido de motores, con WebAudio (sin archivos). Qué suena lo decide una función pura con prueba. |
| **Esquema en hojas** | Fuerza y Mando por defecto, más las que se creen («Mover a hoja»); cables entre hojas como referencias «→ hoja n · destino»; orden por vecinos que baja los cruces (6 → 1 en el ejemplo con PLC); SVG e impresión por hoja. |
| **Editor de actividades** | En el panel Actividad: título, enunciado y comprobaciones **como datos** (montaje, estado de un equipo tras una secuencia de mandos, variable del PLC, redes unidas o no, sin errores). Marca ✓/✗ si tu solución las cumple, guarda la actividad en el proyecto y **exporta una copia para alumnos** sin cables / sin programa / sin montajes, en el modo elegido. Advierte que una comprobación negativa también se cumple si no se hace nada. |

## 4. Lo que NO se hizo (y por qué)
- **Catálogo «Verificado»**: exige datasheets, normas o mediciones de fabricantes que no están en el repositorio; inventarlos contradice la regla del proyecto. Se hará cuando existan esos documentos.
- **Prueba en teléfono/tablet físicos y con lector de pantalla**: no se puede hacer desde aquí (hay emulación táctil, 4 tamaños y auditoría automática).
- **Simbología IEC 60617** y **modelo de sobrecarga**: sin fuente ni licencia / fuera del alcance lógico de la simulación.

## 5. Pruebas
`npm run verify:industria` → **todo en verde** (tipos, build, 15 grupos de lógica y 15 de interfaz). Nuevos: `models` (formas), `routing` (cables), `sound` (qué suena), `extras-ui` (formas, cables, temporizador con reloj real, sonido, relé, hojas, editor con exportación e importación). Ampliados: `plc` (TON/CTU), `sim` (relé térmico), `diagram` (hojas, referencias, cruces), `activities` (actividades propias, copias para alumnos, validación estricta).

### Defectos que las pruebas encontraron en esta ronda (ya corregidos)
- La disposición automática ordenaba por entidad y no por patilla: el orden por vecinos no reducía cruces; ahora usa la posición de cada patilla.
- Con hojas, los cables de la otra hoja se dibujaban fuera de lugar y el pulsador S1 quedaba debajo del dock (filas demasiado separadas): ahora cada hoja dibuja lo suyo y las filas están más juntas.
- Parpadeo (z-fighting) en la placa por una capa superpuesta.

## 6. Pendiente
Dispositivos físicos y lector de pantalla; catálogo verificado; que definas `ROBOTICA_BETA_PASSWORD` con la clave que pediste en Vercel (paso tuyo).
