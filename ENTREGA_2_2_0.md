# Entrega 2.2.0 · 20 de octubre de 2026

Publicado y verificado sin autenticación en https://modo-lab.vercel.app/.
Despliegue final: dpl_8DEsCyjLc9vB1DChv1JDZxDhVXLE.

## Cambios

- Siete lecciones de protoboard basadas en los recorridos existentes: fundamentos, divisor, diodo, LED, corriente en serie, BJT y puente H. Montaje comprobado eléctricamente; lecturas nuevas y anotadas, cálculos desde datos, ayuda progresiva y avance guardado por proyecto. Reutiliza FloatingWindow y LessonConnectionCard.
- Multímetro Fluke compartido: resolución normal de 6000 cuentas, cambios de rango por redondeo, OL por sobrerango y supresión del cero negativo. La toma de 10 A presenta A con resolución de su rango; no inventa precisión de la entrada mA. REL y MIN/MAX usan unidades base para mantener coherencia al cambiar Ω/kΩ o mV/V.
- Soldadura usa PanStage, FloatingDock y FloatingWindow del simulador: lienzo con zoom y desplazamiento, controles y comprobaciones en ventanas móviles. Acceso directo desde la navegación del laboratorio. El zoom no tapa los modos en móvil.
- Taller HMI–PLC DB9/RS-485 y empalme diferenciados. Copas posteriores reflejadas; tres conductores, bornera con tornillos, continuidad, aislamiento y extensión didáctica RTU. Cautín, Sn63Pb37/SAC305, flux, restaurador, pulidor, esponja y latón diferenciados. Preparación, mojado, enfriamiento y aislamiento afectan el resultado.
- Multímetro operativo en el panel: puntas en sus bornes, lectura desde cables/contactos y estados del simulador. Continuidad sin tensión, 24 V virtuales de mando y registro. No inventa impedancias ni tensión de fuerza.

## Verificación

- TypeScript y compilación local/Vercel correctos; npm ci sin vulnerabilidades reportadas.
- Modelo de laboratorio: 38/38; lecciones: 15 comprobaciones; resolución/unidades: 20; soldadura/panel: 4 grupos de comprobaciones.
- Navegador local: lección completa de fundamentos, divisor con dos lecturas y cálculos, menús de teclado y persistencia; recorridos previos de temperatura y redes sin errores.
- Producción: fabricación de tres conductores DB9, seis medidas de continuidad/aislamiento, orden RTU, Fluke del panel, protección de Ω energizado, 24 V F/N, arrastre de puntas y ausencia de cables creados al medir. Desktop, móvil vertical/horizontal sin desborde.
- Ventanas compartidas arrastrables, acceso a lecciones y acceso directo de soldadura comprobados en producción. Service worker nuevo, sin marcadores pendientes y con Cache-Control: no-cache.
- Evidencia: qa/release-2.2-public/, qa/soldadura-panel-public/, qa/protoboard-lecciones/, qa/meter-precision/.

La suite académica conserva el fallo histórico de hashes de App.tsx ya documentado en ENTREGA_REALISMO_PRACTICAS.md; no se cambió ese snapshot para ocultarlo. Sus comprobaciones funcionales y la integridad de 47 fuentes habían pasado.

## Alcance técnico

Resolución no equivale a exactitud calibrada. Los sensores, cargas y térmica de soldadura son modelos educativos; el tiempo térmico está acelerado. El modelo del panel fija la fuente de mando a 24 V y no resuelve impedancias de cargas no documentadas. La prueba RTU es una extensión didáctica, no emula DOPSoft/ISPSoft ni garantiza el funcionamiento de un cable físico.

Rangos de referencia: https://content.fluke.com/products/2018-fluke-tools-catalog/inc/html/25.html
Cuidado de puntas: https://www.hakko.com/english/support/maintenance/detail.php?seq=163
Aleaciones: https://www.kester.com/knowledge-base/alloy-temperature-chart
