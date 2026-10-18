export const content: Record<
  string,
  {
    image: string;
    intro: string;
    what: string;
    how: string;
    choose: string;
    error: string;
    key: string;
  }
> = {
  "objetivos-fallas": {
    image: "03_arco_electrico.jpg",
    intro:
      "Comprende qué cambia en el circuito y por qué la protección debe responder a la falla.",
    what: "Una protección busca cuidar a las personas y las instalaciones, aislando la falla para mantener el servicio donde sea posible.",
    how: "La sobrecarga supera la corriente normal y recalienta el conductor. El cortocircuito crea un camino de impedancia muy baja; la pérdida de aislación puede originarlo.",
    choose:
      "Reconoce el fenómeno antes de elegir: sobrecorriente, sobretensión y fuga requieren funciones diferentes.",
    error:
      "No todo aumento de corriente es un cortocircuito. Importan la condición eléctrica y la evolución de la falla.",
    key: "El cortocircuito puede causar arco, calor y esfuerzos magnéticos. La comparación visual es conceptual, sin escala.",
  },
  coordinacion: {
    image: "01_tablero_electrico.jpg",
    intro:
      "Relaciona la carga, la protección y la capacidad corregida del conductor.",
    what: "La regla del docente In ≤ Ip ≤ Iz coordina tres corrientes: carga, nominal de protección y capacidad corregida del cable.",
    how: "La protección debe admitir la carga sin superar la capacidad del conductor. El ejemplo de la lámina 6 es 18 A ≤ 20 A ≤ 25 A.",
    choose:
      "Recopila tensión, tipo de carga, Icc prevista, conductor, temperatura, ambiente y arranque antes de consultar un catálogo.",
    error:
      "Cumplir la desigualdad no completa la selección. También faltan disparo, energía pasante y poder de corte.",
    key: "In es corriente de carga en esta presentación. En otros documentos IEC la notación puede cambiar.",
  },
  termomagnetico: {
    image: "04_interruptor_termomagnetico.jpg",
    intro:
      "Protege frente a sobrecargas y cortocircuitos mediante acción térmica y magnética.",
    what: "Interrumpe la corriente ante sobrecorrientes según sus características de actuación. Combina dos mecanismos de protección.",
    how: "Térmico → sobrecarga: responde al calentamiento del elemento bimetálico. Magnético → cortocircuito: responde a una corriente suficientemente elevada.",
    choose:
      "Revisa corriente nominal, tensión, polos, curva y poder de corte. Considera el arranque sin perder la protección del conductor.",
    error:
      "La curva D no protege mejor siempre. Elegirla exige justificar el arranque y verificar las condiciones de desconexión.",
    key: "El poder de corte debe ser mayor o igual a la corriente de cortocircuito prevista.",
  },
  fusibles: {
    image: "05_fusibles.jpg",
    intro: "Aprende a leer la función de un fusible más allá de su apariencia.",
    what: "Abre el circuito al fundirse su elemento cuando la sobrecorriente supera sus características de actuación.",
    how: "La actuación rápida o retardada depende del tipo y de la ficha técnica. La carcasa de vidrio o cerámica no basta para decidir su aplicación.",
    choose:
      "Revisa clase, corriente nominal, tensión, compatibilidad CA/CC, ruptura y energía pasante. El material menciona gG para conductores y aR/gR para semiconductores.",
    error:
      "200 kA es capacidad de ruptura en el ejemplo, no corriente de funcionamiento continuo.",
    key: "50 A · 700 V CA/CC · 200 kA son un ejemplo textual de la lámina 10; no identifican los objetos de la foto.",
  },
  conductores: {
    image: "01_tablero_electrico.jpg",
    intro:
      "Comprueba capacidad de corriente, caída de tensión y respuesta térmica a la falla.",
    what: "El conductor debe admitir la corriente en sus condiciones reales de instalación y soportar la falla hasta que actúe la protección.",
    how: "Iz = Itabla × fT × fG. La capacidad tabulada se corrige por temperatura y agrupamiento. El ejemplo del docente da 21,6 A.",
    choose:
      "Considera material, aislación, sección, instalación, longitud, temperatura y agrupamiento. Revisa además I²t ≤ k²S² bajo las condiciones del modelo adiabático.",
    error:
      "Iz ≥ Ip no demuestra que el cable soporte cualquier cortocircuito. El 3% de caída es un límite adoptado en el ejemplo, no universal.",
    key: "Tres comprobaciones separadas: corriente, caída de tensión y energía de cortocircuito.",
  },
  guardamotor: {
    image: "02_motor_electrico.jpg",
    intro: "Parte de la placa del motor y comprende el ajuste térmico.",
    what: "Es un aparato de maniobra y protección del motor, sin mando remoto propio. Para ese mando suele asociarse a un contactor.",
    how: "Lee corriente nominal, tensión y conexión. Escoge un rango térmico que incluya la corriente de placa y ajusta según el fabricante.",
    choose:
      "Después del rango verifica umbral magnético, tiempo y condiciones de arranque, tensión y poder de corte.",
    error:
      "El contactor y el guardamotor cumplen funciones distintas. El magnético puede ser fijo según modelo; el dial no representa un ajuste magnético universal.",
    key: "Leer placa → elegir rango → ajustar térmico → comprobar arranque y corte. Los valores de la actividad son ficticios.",
  },
  "tierra-sobretension": {
    image: "06_spd_y_diferencial.jpg",
    intro: "Distingue la sobretensión transitoria de la corriente de fuga.",
    what: "El SPD limita sobretensiones transitorias y deriva su corriente. El diferencial RCD detecta desequilibrio por fuga.",
    how: "Las descargas atmosféricas y maniobras pueden producir transitorios de tensión. Una falla a tierra puede causar diferencia entre corriente de ida y vuelta.",
    choose:
      "El docente menciona sensibilidad habitualmente ≤30 mA para protección adicional de personas bajo IEC. Revisa aplicación, selectividad, fugas y compatibilidad con variadores.",
    error:
      "SPD y RCD no se sustituyen entre sí. Un diferencial no sustituye la protección contra sobrecorriente; GFCI sigue criterios propios de su jurisdicción.",
    key: "Sobretensión → SPD. Fuga → diferencial. Ninguna sensibilidad garantiza protección absoluta en toda circunstancia.",
  },
  "motor-trifasico": {
    image: "07_motor_trifasico.jpg",
    intro:
      "Calcula corriente a partir de potencia mecánica de salida y reconoce los datos que faltan.",
    what: "La expresión del docente estima la corriente trifásica: I = Psalida / (√3 × VLL × η × cosφ).",
    how: "Convierte kW a W. Usa tensión entre líneas en V, rendimiento η y factor de potencia cosφ adimensionales. La corriente resulta en A.",
    choose:
      "Compara con placa y recopila arranque, Icc, longitud, instalación y temperatura para justificar protecciones y conductor.",
    error:
      "No omitas η ni cosφ. La fórmula usa potencia mecánica de salida, no potencia eléctrica de entrada.",
    key: "La lámina 15 deja los datos numéricos en blanco. Todos los motores numéricos de estas actividades son supuestos didácticos.",
  },
};
