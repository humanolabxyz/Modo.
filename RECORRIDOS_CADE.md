# Recorridos de CADe y bornes corregidos

Actualización local del 14 de octubre de 2026. Se conserva el circuito original PERFECTO, sus 47 conductores y las funciones del banco.

- **SB2 = verde derecho**, módulo BOTONERAS, pulsador S3. El esquema 13/14 se asocia a los bornes físicos 3/4; el estado NA sigue marcado por convención, pendiente de confirmar en el equipo.
- **KM1 = contactor con térmico; KM2 = contactor trifásico**. KM1:11/12 corresponde a 71/72, como indicó el usuario.
- **KM2 incorpora 95 y 96** por corrección expresa del usuario. Se conservan los 108 IDs originales y se agregan dos: 110 en total. No se alteró la auditoría fotográfica de los originales. La presencia de los dos nuevos está registrada aparte en `qa/user-terminal-corrections.json`; su posición y color son de referencia y su función interna sigue sin confirmar.

En modo libre, seleccionar una línea muestra automáticamente todas las siluetas pendientes de su red. Seleccionar un símbolo muestra las redes de sus bornes separadas, sin puentear contactos. **Todas las rutas** muestra la parte identificada de todo PERFECTO. Los cables reales de la selección se resaltan en azul; las siluetas no instalan cables ni alteran continuidad y desaparecen al conectar sus extremos, incluso mediante una topología equivalente.

El acceso al recorrido, los bornes, todas las rutas y el aprendizaje permanece fijo sobre el dibujo. **Ver bornes** abre las correspondencias de esa selección y permite localizar o asignar sus extremos. La guía conserva sus tres niveles y el examen no muestra ayudas.

Se dispone de 18 correspondencias de 51; otras 33 siguen pendientes, incluyendo alimentación, parada, fuerza y retornos de pilotos. Las rutas parciales señalan sus extremos desconocidos. La captura de la prueba y el material docente continúan disponibles como referencias complementarias; la selección y comprobación del lector siguen PERFECTO.

Validación: compilación y tipos; inventario original y adiciones independientes; clic en los 110 bornes y 47 conductores; rutas de ramales, selección de símbolo por ratón, correspondencias editables, instalación/deshacer, guía/examen y siete tamaños de pantalla, incluyendo 844×390. Evidencias: `qa/recorridos/verification.json`, `qa/diagrama-layout/verification.json`, `qa/aprendizaje/ui-verification.json`, `qa/cade/verification.json` y capturas en `qa/recorridos/`. Respaldo previo: `qa/recorridos/antes.zip`.
