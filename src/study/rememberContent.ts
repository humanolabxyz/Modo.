// Resumen de repaso por tema. Solo repite reglas y cifras ya presentes en
// teachingContent.ts y journeyContent.ts; no introduce valores nuevos.
export const remember: Record<string, { key: string; points: string[] }> = {
  "objetivos-fallas": {
    key: "Sobrecarga: la carga exige más · Cortocircuito: camino de muy baja impedancia",
    points: [
      "El calor aparece en ambas fallas: clasifica por la causa, no por el calentamiento.",
      "Un cortocircuito puede causar arco, calor y esfuerzos magnéticos (lámina 4).",
      "Sobretensión y fuga son otras categorías, con otras funciones de protección.",
    ],
  },
  coordinacion: {
    key: "In ≤ Ip ≤ Iz",
    points: [
      "In es la carga, Ip la nominal de la protección e Iz la capacidad corregida del cable.",
      "Cada desigualdad responde una pregunta distinta; una no compensa a la otra.",
      "Cumplirla no basta: faltan poder de corte, disparo y energía pasante.",
    ],
  },
  termomagnetico: {
    key: "B: 3–5× · C: 5–10× · D: 10–20× la nominal",
    points: [
      "El térmico responde a la sobrecarga y el magnético al cortocircuito.",
      "Las bandas se multiplican por la nominal: una C de 16 A da 80–160 A.",
      "No son tiempos de disparo; el poder de corte debe cubrir la Icc prevista.",
    ],
  },
  fusibles: {
    key: "Nominal, tensión y ruptura son tres datos distintos",
    points: [
      "200 kA es capacidad de ruptura, no corriente de funcionamiento.",
      "gG se menciona para conductores; aR o gR, para semiconductores.",
      "La forma o la carcasa no definen la función: confirma en la ficha técnica.",
    ],
  },
  conductores: {
    key: "Iz = Itabla × fT × fG",
    points: [
      "Los factores se multiplican, no se suman: 30 × 0,9 × 0,8 = 21,6 A.",
      "Coordina con Iz, no con la capacidad de la tabla.",
      "Caída de tensión y cortocircuito (I²t ≤ k²S²) se comprueban aparte.",
    ],
  },
  guardamotor: {
    key: "El rango incluye la corriente de placa · el ajuste sigue al fabricante",
    points: [
      "Parte de la placa: corriente nominal, tensión y conexión.",
      "Rango y ajuste son decisiones distintas; el extremo del rango no es la corriente del motor.",
      "Después: arranque, magnético y poder de corte. El contactor aporta el mando remoto.",
    ],
  },
  "tierra-sobretension": {
    key: "SPD limita tensión · RCD detecta fuga",
    points: [
      "Fuga = |ida − vuelta|: 10 A − 9,97 A = 0,03 A = 30 mA.",
      "1 A = 1000 mA: revisa siempre la unidad del resultado.",
      "El diferencial no sustituye la protección contra sobrecorriente.",
    ],
  },
  "motor-trifasico": {
    key: "In = Psalida / (√3 VLL η cosφ)",
    points: [
      "Potencia en W (5,5 kW = 5500 W); η y cosφ como fracciones, no como porcentaje.",
      "Con menor rendimiento, la corriente calculada sube.",
      "Compara con la placa: faltan arranque, Icc y datos del conductor.",
    ],
  },
};
