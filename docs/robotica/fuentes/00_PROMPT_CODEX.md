# Instrucción principal para Codex — modo. Robótica

Estamos desarrollando modo. (versión declarada 2.5.4) y vamos a incorporar **Robótica como quinta tarjeta del inicio**, sin rehacer las cuatro secciones actuales: Laboratorio, Estudio, Panel de control y Comunidad.

Te adjunto cuatro documentos obligatorios de lectura:
1. `01_ESPECIFICACION_ROBOTICA.md` — visión y funciones esperadas.
2. `02_UX_UI_Y_VENTANAS.md` — experiencia tipo pizarra Figma, controles 3D y **reutilización del gestor de ventanas flotantes que ya tenemos en Panel de control**.
3. `03_ARQUITECTURA_TECNICA.md` — contratos y cuestiones a investigar.
4. `04_PLAN_5_ETAPAS.md` — etapas, entregables y pruebas de aceptación.

## Qué quiero que hagas primero
Lee el código real del repositorio y revisa el informe previo de auditoría. **No des por implementado nada que no encuentres en archivos concretos.** Localiza las ventanas existentes de Panel de control que se arrastran, redimensionan y cierran; quiero reutilizar exactamente ese sistema o extraerlo con el mínimo cambio posible.

Investiga cómo construir una aplicación Robótica con la experiencia de canvas de Figma, edición 3D libre, ensamblajes y cables; evalúa referentes como Figma, Fusion, Tinkercad y Wokwi por sus patrones funcionales. Analiza compatibilidad de Three.js/React Three Fiber, Rapier y posibles runtimes para Arduino UNO R3 (como AVR8js), pero no asumas que son la solución antes de comprobar la arquitectura del proyecto.

Entiende que Robótica tendrá dos espacios en el **mismo proyecto**: **Construir** (pizarra 3D con herramientas y ventanas flotantes) y **Simular** (cubo blanco donde el robot construido se mueve mediante su programa, conexiones y física). Las ventanas de Piezas, Propiedades, Estructura, Código y Diagnóstico serán herramientas contextuales arrastrables, redimensionables y cerrables gracias al sistema existente. No queremos volver al patrón de muchos submenús y paneles fijos.

Queremos que un estudiante pueda montar desde cero el robot móvil de dos ruedas con Arduino UNO, L298N y HC-SR04, conectarlo pin a pin, programarlo y probarlo; el robot de Simular será el mismo montaje. Fallos de cableado, ausencia de alimentación o cambios del código deben afectar el comportamiento. No aceptamos animaciones de demostración que parezcan simulación funcional.

## Primera entrega: INVESTIGACIÓN, sin cambios de código
Entregame:
- Mapa de archivos y sistemas existentes a reutilizar, con especial detalle del gestor de ventanas flotantes de Panel de control.
- Comparación funcional de referentes UX y propuesta para canvas, ventanas, manipulación 3D y cableado.
- Arquitectura técnica y estructura de datos del proyecto, conexiones y simulación.
- Comparación de tecnologías, compatibilidad, rendimiento y riesgos comprobados.
- Plan concreto de las cinco etapas del documento, adaptado a lo que descubras en el código.
- Pruebas de aceptación, riesgos y decisiones abiertas antes de la etapa 1.

**NO MODIFIQUES ARCHIVOS TODAVÍA, NI INSTALACIONES DEPENDENCIAS, NI COMIENCES UNA ETAPA SIN MI APROBACIÓN.** Después de revisar tu informe, avanzaremos una etapa a la vez; tras cada una presenta evidencia y espera aprobación explícita.
