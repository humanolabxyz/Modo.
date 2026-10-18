# Distribución y mando virtual de 24 V

Actualización del 14 de octubre de 2026, solicitada por el usuario sobre PanelLab y su sitio de Vercel.

El banco tiene seis módulos y 94 bornes activos: alimentación, botoneras/pilotos, KM1 con relé térmico, KM2 sin térmico, motor y un temporizador neumático. Se retiró TEMPORIZADOR_2, se mantuvo KM2 por confirmación expresa y se centró KM1. Los 16 bornes retirados siguen identificados para restaurar prácticas antiguas; sus cables, pasos y correspondencias se guardan en `archive` y se conservan en la exportación. El inventario fotográfico original no se reescribe. Respaldo previo: `qa/simulacion/antes-simulacion.zip`.

## Probar el encendido

1. Activa **Simular 24 V**, junto a «Ver módulo de cerca».
2. Si necesitas un ejemplo, abre la flecha **Opciones de simulación → Probar con un ejemplo virtual**. Carga piloto con pulsador o marcha/parada con KM1. Cargar un ejemplo reemplaza los cables actuales mediante el historial; Deshacer recupera el montaje anterior.
3. Cierra ambos interruptores **CONTROL** del módulo de alimentación. También están disponibles en el menú para pantallas pequeñas. El piloto ámbar de la fuente indica suministro virtual disponible.
4. Mantén pulsado el verde derecho. Un piloto conectado entre la salida del pulsador y el retorno N se ilumina mientras exista el circuito completo. Se puede actuar con ratón, teclado (Espacio/Enter mantenidos) o tacto.
5. En el ejemplo de KM1, el auxiliar 13–14 mantiene la bobina después de soltar marcha. El rojo abre la parada y la bobina cae. «Disparar térmico» abre 95–96 y cierra 97–98 para probar el piloto de falla, según los cables existentes.

La simulación empieza apagada, no modifica cables ni las reglas de evaluación de CADe y no se guarda energizada al recargar. Los contactos dinámicos pertenecen a un grafo separado de `cableNodes`; los pilotos y bobinas son cargas entre dos potenciales, no puentes internos. Las curvas con tensión virtual se resaltan en ámbar. Un corto F–N o un circuito que hace oscilar un contactor detiene la simulación, abre ambos interruptores y requiere corregir el montaje y restablecer.

## Alcance del modelo

Mando lógico de 24 V con contactos ideales. Se adopta F/N como suministro virtual y BOTONERAS:N como retorno común de los cuatro pilotos. Los pulsadores usan 1–2 NC y 3–4 NA por convención; KM1 y KM2 tienen auxiliares NC/NA, bobinas A1/A2 y polos separados. El térmico de KM1 se dispara manualmente: no se calcula intensidad de sobrecarga. No hay conexión implícita N–TP.

Estas relaciones están indicadas en «Qué representa este modelo»; siguen sin certificar el equipo físico. No se simulan potencia trifásica, caída de tensión, cargas en serie ni retardo neumático. KM2:95/96 permanece sin función interna modelada, porque el usuario confirmó su presencia pero no su función.

## Comprobación

`npm install`, tipos, compilación, inventario activo/retirado y topología de cables; motor lógico, ratón, teclado y tacto real emulado; dos polos, pulsador correcto, ausencia de retorno, marcha/mantenimiento/parada, disparo térmico, corto y restablecimiento, apagado al recargar y recuperación de prácticas antiguas. Tamaños: 1920×1080, 1440×900, 1024×768, 768×1024, 390×844, 360×800 y 844×390. También se comprueba que la guía, examen, selección de bornes y recorridos existentes sigan funcionando.

Evidencias: `qa/simulacion/model-verification.json`, `qa/simulacion/ui-verification.json`, `banco-desktop.png`, `piloto-pulsado.png` y `banco-mobile.png`. Archivos nuevos: `simulation.ts`, `useSimulation.ts`, `SimulationControls.tsx`, `simulation.css` y pruebas. Integración en Board/App/WireLayer, migración de prácticas en `wiring.ts`, inventario y pruebas previas.
