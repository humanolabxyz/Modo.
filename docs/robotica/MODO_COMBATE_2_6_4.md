# Modo de combate independiente · 2.6.4

30/10/2026. El usuario pidió que sumo se sintiera como un juego, tuviera una interfaz de combate y se separara para cuidar el rendimiento. Se añade una pantalla propia en `/arena/`, dentro de la misma aplicación y con la biblioteca actual de robots.

## Flujo y presentación

El taller `/robotica/` conserva construir, cablear y programar. Sus entradas a la arena navegan a `/arena/`; se descarga y monta únicamente el modo de combate. **Volver al taller**, **Editar construcción** y **Construir mi versión** usan la biblioteca existente. La creación de una copia se guarda antes de navegar. Una biblioteca ilegible se conserva y se avisa; no se sobrescribe con ejemplos.

La nueva interfaz incluye escenario de combate, iluminación por equipo, presentación VS, cuenta regresiva animada, cámara automática de entrada/seguimiento/victoria, estelas y celebración con confeti. Los marcadores muestran nombres y puntos; las barras indican **margen real al borde**, sin introducir salud o daño ficticio. Durante la ronda se ocultan los formularios y quedan los controles de combate. En móvil el ring ocupa casi toda la pantalla durante la ronda.

La cámara se puede dejar libre y el movimiento puede reducirse; también respeta inicialmente la preferencia del sistema. Los sonidos son sintetizados, opcionales e inicialmente apagados: cuenta regresiva, inicio, contacto y victoria. Se activan con una acción explícita del usuario y no descargan archivos de audio.

## Fidelidad al combate

Se mantienen los dos programas Arduino, sus circuitos, la física común, las reglas y el reloj virtual. Los efectos se activan mediante eventos de inicio de contacto entre colisionadores de equipos distintos y puntos de contacto del solver de Rapier. Tocar el suelo no genera un choque entre robots. Se limita la frecuencia de avisos a uno cada 180 ms y se retienen ocho eventos recientes.

Las poses y el giro de las ruedas se interpolan visualmente entre las muestras del worker, sin modificar posiciones o fuerzas del simulador. Las estelas muestrean posiciones físicas y se limitan a 44 puntos por robot. Cámara, partículas y confeti son presentación; no deciden el ganador ni añaden potencia.

## Separación y rendimiento

- Entrada Astro propia, `ArenaApp` y `ArenaPanel` propios; la arena no importa ni monta `RoboticsApp`, el editor de código, su inspector, el lienzo de construcción ni el controlador E6.
- El taller deja de importar el panel de combate. Navegar libera el documento anterior; no quedan dos lienzos activos dentro de una misma pantalla.
- Se reutiliza el render de piezas, cargando `ArmMesh` de forma diferida. Al entrar a la arena no se solicitan `ArmMesh` ni sus STL oficiales.
- Una escena WebGL, DPR limitado a 1–1,35; geometría estática memorizada y transformaciones actualizadas con referencias dentro del ciclo de render.
- Física/MCU en worker, efectos de contacto acotados y dibujos bajo demanda al pausar o reducir movimiento. La pestaña oculta pausa la ronda. El contexto de audio y el worker se liberan al salir.
- El inicio no precarga los módulos 3D exclusivos de `/robotica/` o `/arena/`. Se conserva el manifiesto de descarga completa para uso offline y se añade la normalización de la ruta de arena al service worker.
- La arena usa sus propias animaciones y excluye la transición de documento general. Esto evita capturar la escena WebGL al navegar y el rechazo «Transition was skipped» observado en Chromium durante el retorno.

Estas son medidas verificables de aislamiento y carga, no una garantía de FPS en hardware no probado. Queda pendiente medir teléfonos/tablets físicos. La emulación gráfica por software informa de sus límites y puede avanzar más lento que un navegador con GPU.

## Archivos

- `src/pages/arena.astro`, `src/robotics/arena/ArenaApp.tsx`: entrada separada y transferencia segura de la biblioteca.
- `ArenaPanel.tsx`, `ArenaStage.tsx`, `useArenaAudio.ts`, `src/styles/robotics-arena.css`: presentación, controles y sonido.
- `src/robotics/sim/physics.ts`: eventos de contacto únicamente cuando se configura la arena; las otras simulaciones conservan su configuración.
- `src/robotics/RoboticsApp.tsx`: navegación; `build/PartMesh.tsx`: carga diferida de la malla del brazo.
- `astro.config.mjs`, `public/sw.js`: precarga y clave de navegación; `middleware.ts`: misma protección para `/arena/` y `/robotica/`.
- `src/data/releases.ts`, `package.json`, lockfile: versión y novedades 2.6.4.
- `qa/verify-robotics-combat-game.cjs`, verificaciones de arena/contactos/protección y ajustes de pruebas existentes para la navegación entre páginas.

## Validación

- `npm install`, TypeScript y compilación Astro: correctos; nueve páginas. Se conservan las advertencias anteriores de paquetes grandes y cuatro vulnerabilidades altas, sin actualizaciones forzadas ni dependencias nuevas.
- Pruebas de física de arena: reloj único, potencia real del circuito, colisión, ultrasonido al rival, salida, ganador y fuentes intactas. Nuevas comprobaciones: ningún aviso de choque antes del contacto y eventos con puntos finitos al chocar.
- Regresión de seis grupos del brazo E6 y protección de ambas rutas con la misma cookie/contraseña.
- Chromium 1440 × 900 y 390 × 844 con toque emulado: movimiento visible de cámara, opción reducida, sonido explícito, cuenta regresiva, impacto real, pausa, victoria y confeti, ausencia de desborde y biblioteca sin cambios. Se registra la lista de recursos: un lienzo y ninguna descarga del editor o de los STL del E6.
- Evidencia: [prueba del juego y recursos](../../qa/robotics-combat-game/ui-results.json), [arena](../../qa/robotics-arena/model-results.json).

No se cambia el formato de los proyectos ni se añaden partidas en red, daño, piezas desprendidas o control manual de motores.

## Publicación final

Publicado en **https://modo-lab.vercel.app/arena/**, versión **2.6.4**, proyecto existente `modo-lab` / `humanolabxyz-9765s-projects`. Despliegue `dpl_HTbjfYvA4vpw7sUKPDMuKZZtc8ZC`, estado READY, URL inmutable https://modo-61qbtehyo-humanolabxyz-9765s-projects.vercel.app. Se publicó la carpeta de trabajo mediante CLI, sin commit ni push, continuando la autorización de publicación de esta sesión.

Verificación pública final: siete rutas 200, Robótica y Arena 401 sin sesión con la protección conservada; 190 recursos revisados, 23 miniaturas y siete mallas E6. Los recursos de nombre idéntico coinciden por SHA-256 con la compilación local; los nombres que difieren por la compilación Windows/Linux se registran sin afirmar identidad binaria. El identificador del service worker coincide con su manifiesto de producción. Evidencia: [verificación pública](../../qa/release-2.6.4/public-verification.json).

La interfaz completa se verificó localmente en escritorio y móvil emulado; en el dominio se comprobaron los recursos y el acceso protegido. No se recuperó ni modificó la contraseña de producción. También pasó la regresión de copia editable, navegación taller/arena, revancha, cancelación y persistencia en ambos tamaños.

## Comparación

Antes, panel de arena dentro del taller:

![Arena anterior](../../qa/robotics-combat-parts/desktop-arena.png)

Nueva pantalla independiente:

![Presentación de combate](../../qa/robotics-combat-game/desktop-intro.png)

Combate con contacto físico:

![Combate](../../qa/robotics-combat-game/desktop-contact.png)

Victoria en móvil:

![Victoria móvil](../../qa/robotics-combat-game/mobile-victory.png)
