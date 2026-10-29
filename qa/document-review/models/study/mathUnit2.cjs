"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/study/mathUnit2.ts
var mathUnit2_exports = {};
__export(mathUnit2_exports, {
  correctUnit2: () => correctUnit2,
  freshUnit2: () => freshUnit2,
  readUnit2: () => readUnit2,
  unit2Curve: () => unit2Curve,
  unit2Questions: () => unit2Questions,
  unit2StorageKey: () => unit2StorageKey,
  unit2Topics: () => unit2Topics
});
module.exports = __toCommonJS(mathUnit2_exports);

// src/study/academicModels.ts
function decimal(raw) {
  const text = raw.trim().replace(",", ".");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;
  const n2 = Number(text);
  return Number.isFinite(n2) ? n2 : null;
}

// src/study/mathUnit2.ts
var n = (id, prompt, value, unit, hint, explanation, tolerance = 5e-3) => ({ id, prompt, value, unit, hint, explanation, tolerance });
var q = (id, prompt, options, correct, hint, explanation) => ({ id, prompt, options, correct, hint, explanation });
var unit2Topics = [
  { id: "exp", title: "Funciones exponenciales", source: "F37", pages: "1\u20136", lead: "Parte de la funci\xF3n de la gu\xEDa: f(x)=2\u02E3. Relaciona su expresi\xF3n, su gr\xE1fica y las operaciones que pide GeoGebra.", formula: "f(x) = 2\u02E3", ideas: [
    ["Qu\xE9 cambia al aumentar x", "En a\xB7b\u02E3, a es el valor en cero y b es el factor por unidad. Para a>0, una base b>1 produce crecimiento y 0<b<1 produce decrecimiento. El factor multiplica la cantidad anterior: no a\xF1ade siempre la misma cantidad."],
    ["Imagen y preimagen", "Calcular una imagen significa sustituir x: f(2)=2\xB2=4. Buscar la preimagen de 5 significa resolver 2\u02E3=5. Aplicas logaritmos y obtienes x=ln(5)/ln(2), aproximadamente 2,321928."],
    ["Cruces y ajustes de la gu\xEDa", "Las curvas 2\u02E3 y x+2 se cortan cerca de (\u22121,690;0,310) y exactamente en (2;4). Una intersecci\xF3n hallada por el software no garantiza que sea la \xFAnica: revisa los intervalos. El ajuste de los puntos (1,1),(3,2),(5,4),(6,8) se puede escribir como a\xB7b\u02E3 o a\xB7e\u1D9C\u02E3, con b=e\u1D9C; conserva cifras antes de redondear."]
  ], example: [["Calcular la imagen", "Sustituye x=2: 2\xB2=4. El punto es (2,4)."], ["Buscar una preimagen", "2\u02E3=5 \u21D2 x\xB7ln(2)=ln(5) \u21D2 x\u22482,321928."], ["Verificar el cruce derecho", "En x=2: 2\xB2=4 y 2+2=4. La misma entrada produce la misma salida."]], remember: "La exponencial 2\u02E3 es positiva, pasa por (0,1) y no corta el eje x.", questions: [
    n("exp-image", "Para f(x)=2\u02E3, calcula f(2).", 4, "", "Sustituye la entrada en el exponente.", "2\xB2=4."),
    n("exp-preimage", "\xBFQu\xE9 x cumple 2\u02E3=5? Usa al menos cuatro decimales.", Math.log(5) / Math.log(2), "", "Aplica ln a ambos lados y despeja x.", "x=ln(5)/ln(2)\u22482,321928.", 1e-4)
  ], commands: ["f(x)=2^x", "a=f(2)", "P=(2,a)", "Solve(f(x)=5,x)", "g(x)=x+2", "Intersect(f,g,-2,0)", "Intersect(f,g,1,3)", "Y=Intersect(f,yAxis)", "L={(1,1),(3,2),(5,4),(6,8)}", "p=FitGrowth(L)", "r=FitExp(L)"] },
  { id: "bacteria", title: "Crecimiento de bacterias", source: "F38", pages: "2\u20133", lead: "El ejercicio empieza con 100 bacterias y aumenta un 20% respecto de la hora anterior. Las preguntas distinguen calcular poblaci\xF3n, despejar tiempo y cambiar una condici\xF3n inicial.", formula: "N(t) = 100 \xB7 1,2\u1D57", ideas: [
    ["Del porcentaje al factor", "Conservar el 100% y a\xF1adir 20% da 1+0,20=1,20. Por eso N(t)=100\xB71,2\u1D57. Las primeras horas dan 100;120;144;172,8;207,36;248,832. Son valores del modelo; la poblaci\xF3n real es un conteo."],
    ["Tiempo continuo y observaciones por hora", "Para N(t)=2800 resuelves 1,2\u1D57=28: t=ln(28)/ln(1,2)\u224818,2765 h. Si se observa solo en horas enteras, la primera hora con al menos 2800 es la 19. Esas respuestas corresponden a preguntas distintas."],
    ["Las dos condiciones de la actividad 4 son independientes", "Para alcanzar 5000 en 10 h manteniendo el 20%, la cantidad inicial ser\xEDa 5000/1,2\xB9\u2070\u2248807,5279. Si se mantiene la cantidad inicial 100, el factor requerido ser\xEDa 50^(1/10), y la tasa (factor\u22121)\xB7100\u224847,8758%. No cambies simult\xE1neamente ambas condiciones."]
  ], example: [["Definir el modelo", "N(t)=100\xB71,2\u1D57. El tiempo t est\xE1 en horas."], ["Evaluar a las ocho horas", "N(8)=100\xB71,2\u2078\u2248429,981696. Comunica aproximadamente 430 bacterias seg\xFAn el modelo."], ["Despejar el umbral", "N(t)=2800 \u21D2 t\u224818,2765 h. La primera observaci\xF3n horaria que supera el umbral es t=19."]], remember: "El 20% se aplica a la cantidad anterior. El crecimiento compuesto no es sumar 20 bacterias por hora.", questions: [
    n("bacteria-eight", "\xBFQu\xE9 valor entrega el modelo a las ocho horas? Redondea a dos decimales.", 100 * 1.2 ** 8, "bacterias", "Eval\xFAa 100\xB71,2\u2078.", "N(8)\u2248429,98; el conteo aproximado es 430."),
    n("bacteria-hour", "Si se observa solo a horas enteras, \xBFcu\xE1l es la primera hora con al menos 2800?", 19, "h", "Distingue el tiempo continuo de la primera hora entera posterior.", "El umbral continuo es 18,2765 h; la primera hora entera es 19.")
  ] },
  { id: "elimination", title: "Eliminaci\xF3n de f\xE1rmacos", source: "F39", pages: "1", lead: "Al comenzar hay 1000 miligramos (mg) de un f\xE1rmaco. Cada hora se elimina el 10% de la cantidad que todav\xEDa queda. Queremos saber cu\xE1ntas horas deben pasar para que queden 500 mg, es decir, la mitad.", formula: "M(t) = 1000 \xB7 0,9\u1D57", ideas: [
    ["Primero, entiende qu\xE9 te preguntan", "No tenemos que averiguar cu\xE1nto hab\xEDa al comienzo: eso ya lo sabemos, son 1000 mg. Buscamos un tiempo. La pregunta es: \xBFdespu\xE9s de cu\xE1ntas horas quedar\xE1n 500 mg?"],
    ["Mira qu\xE9 pasa durante la primera hora", "El 10% de 1000 es 100. Se eliminan esos 100 mg, as\xED que quedan 1000 \u2212 100 = 900 mg. En la segunda hora se elimina el 10% de 900, que es 90: quedan 810 mg. Cada hora calculamos el porcentaje sobre lo que queda, no sobre los 1000 del comienzo."],
    ["Ahora escribe lo mismo con una f\xF3rmula", "Si se elimina el 10%, se conserva el 90%. Escribir 90% como n\xFAmero decimal da 0,9. Por eso multiplicamos por 0,9 una vez por cada hora: 1000 \xB7 0,9 despu\xE9s de una hora, y 1000 \xB7 0,9 \xB7 0,9 despu\xE9s de dos. El exponente t resume esas multiplicaciones."],
    ["Pide a la f\xF3rmula que te d\xE9 500 mg", "M(t) significa la cantidad que queda y t significa horas. Como queremos 500 mg, escribimos 1000 \xB7 0,9\u1D57 = 500. Dividimos ambos lados por 1000 y queda 0,9\u1D57 = 0,5. Para encontrar ese exponente usamos la tecla ln de la calculadora: t = ln(0,5) \xF7 ln(0,9)."],
    ["Explica el resultado con palabras", "La calculadora da 6,5788 horas: aproximadamente 6 horas y 35 minutos. Compru\xE9balo en la gr\xE1fica: a las 6 horas quedan unos 531 mg y a las 7, unos 478 mg. Los 500 mg se alcanzan entre esas dos horas. Si solo se revisa a horas completas, la primera con 500 mg o menos es la hora 7."]
  ], example: [["Elegir el factor correcto", "Se conserva 90%: M(t)=1000\xB70,9\u1D57."], ["Despejar el tiempo", "M(t)=500 \u21D2 0,9\u1D57=0,5 \u21D2 t=ln(0,5)/ln(0,9)."], ["Interpretar el resultado", "t\u22486,5788 h, aproximadamente 6 h 35 min. La primera hora entera con 500 mg o menos es la 7."]], remember: "Es el modelo matem\xE1tico del documento, sin considerar dosis adicionales ni usarlo para decidir una medicaci\xF3n.", questions: [
    n("elimination-factor", "Si se elimina 10% cada hora, \xBFqu\xE9 factor multiplica la cantidad?", 0.9, "", "Resta la fracci\xF3n eliminada a 1.", "1\u22120,10=0,90."),
    n("elimination-half", "\xBFCu\xE1ntas horas tarda en quedar la mitad? Usa cuatro decimales.", Math.log(0.5) / Math.log(0.9), "h", "Iguala a 500 y aplica logaritmos.", "ln(0,5)/ln(0,9)\u22486,578813 h.", 1e-4)
  ] },
  { id: "logs", title: "Funciones logar\xEDtmicas", source: "F20", pages: "1\u20134", lead: "La gu\xEDa compara bases, im\xE1genes, preim\xE1genes, cruces y ajustes. El dominio forma parte de la respuesta antes de usar la calculadora.", formula: "log\u1D66(x)=y \u21D4 b\u02B8=x", ideas: [
    ["Qu\xE9 pregunta un logaritmo", "log\u1D66(x) pregunta a qu\xE9 exponente hay que elevar b para obtener x. Se exige b>0, b\u22601 y x>0. ln usa la base e; log decimal usa la base 10."],
    ["Im\xE1genes y preim\xE1genes de la gu\xEDa", "Para f(x)=ln(x), la imagen de 3 es ln(3)\u22481,098612. Si f(x)=2, la preimagen es e\xB2\u22487,389056. No intercambies la entrada y la salida al escribir el punto de la gr\xE1fica."],
    ["Dominio, cortes y ajustes", "ln(1)=0: el corte horizontal es (1,0). No hay corte con el eje y porque exigir\xEDa x=0. La gu\xEDa ajusta los pares (0,5;\u22122),(1;1),(3;3),(6;4); un ajuste no tiene por qu\xE9 pasar exactamente por todos los puntos."]
  ], example: [["Leer la pregunta", "Se pide la entrada x cuando ln(x)=2."], ["Usar la operaci\xF3n inversa", "Eleva e a ambos lados: x=e\xB2\u22487,389056."], ["Representar y comprobar", "El punto es (e\xB2,2). Al sustituir, ln(e\xB2)=2."]], remember: "Antes de evaluar ln(argumento), imp\xF3n argumento>0.", questions: [
    n("logs-preimage", "\xBFQu\xE9 entrada produce ln(x)=2? Usa cuatro decimales.", Math.exp(2), "", "Usa la operaci\xF3n inversa del logaritmo natural.", "x=e\xB2\u22487,389056.", 1e-4),
    q("logs-domain", "\xBFCu\xE1l es el dominio real de ln(2x\u22121)?", ["x>0", "x>0,5", "Todos los reales"], 1, "El argumento completo debe ser positivo.", "2x\u22121>0 \u21D2 x>0,5.")
  ] },
  { id: "followers", title: "Seguidores y tasas medias", source: "F30", pages: "2\u20133", lead: "La situaci\xF3n de Instagram compara un ajuste de cinco pares con el modelo de Richard. Se interpretan dominio, origen temporal, predicciones y tasas medias.", formula: "g(x) = 600 + 1157,28 ln(2x\u22121)", ideas: [
    ["Conservar los datos y el origen", "Los cinco pares originales son (1,485),(2,1353),(3,2307),(4,2689),(5,3005). Si renombras el mes 1 como mes 0, debes transformar la variable: no basta cambiar la etiqueta ni evaluar ln(0)."],
    ["Separar aumento de incremento constante", "Los seguidores aumentan en la tabla, pero los incrementos son 868,954,382 y 316. No son iguales. Un crecimiento sostenido no implica una tasa constante; la interpretaci\xF3n debe comprobarse con los pares."],
    ["Calcular una tasa sobre un intervalo", "Para [7,10], calcula (g(10)\u2212g(7))/(10\u22127). El resultado es aproximadamente 146,3919 seguidores/mes. Para comparar con [10,12], vuelve a evaluar los extremos y divide por 2; no copies el resultado anterior."]
  ], example: [["Revisar el dominio", "2x\u22121>0 \u21D2 x>0,5."], ["Evaluar el primer mes", "g(1)=600+1157,28\xB7ln(1)=600."], ["Calcular la tasa media", "[g(10)\u2212g(7)]/3\u2248146,391916 seguidores/mes."]], remember: "Una tasa media necesita dos extremos y sus unidades. No es el total de seguidores de un mes.", questions: [
    n("followers-first", "\xBFCu\xE1nto vale g(1)?", 600, "seguidores", "ln(1)=0.", "g(1)=600."),
    n("followers-rate", "Calcula la tasa media de g entre 7 y 10. Redondea a dos decimales.", 1157.28 * Math.log(19 / 13) / 3, "seguidores/mes", "Eval\xFAa los dos extremos y divide la diferencia entre 3.", "[g(10)\u2212g(7)]/3\u2248146,3919 seguidores/mes.")
  ] }
];
var unit2Questions = unit2Topics.flatMap((t) => t.questions);
var correctUnit2 = (question, answer) => question.options ? answer === String(question.correct) : decimal(answer) !== null && Math.abs(decimal(answer) - question.value) <= (question.tolerance ?? 5e-3);
var unit2StorageKey = "modo:estudio:unidad2:v1";
var freshUnit2 = () => ({ version: 1, answers: {}, checked: [] });
function readUnit2(raw) {
  if (!raw || typeof raw !== "object") throw Error("Formato no reconocido");
  const p = raw, ids = unit2Questions.map((q2) => q2.id);
  if (p.version !== 1 || !p.answers || typeof p.answers !== "object" || Array.isArray(p.answers) || !Array.isArray(p.checked) || !Object.entries(p.answers).every(([id, v]) => ids.includes(id) && typeof v === "string" && v.length <= 100) || !p.checked.every((id) => ids.includes(id) && correctUnit2(unit2Questions.find((q2) => q2.id === id), p.answers[id] || ""))) throw Error("Avance incompatible");
  return { version: 1, answers: { ...p.answers }, checked: [...new Set(p.checked)] };
}
function unit2Curve(topic, x) {
  return topic === "exp" ? 2 ** x : topic === "bacteria" ? 100 * 1.2 ** x : topic === "elimination" ? 1e3 * 0.9 ** x : topic === "logs" ? Math.log(x) : 600 + 1157.28 * Math.log(2 * x - 1);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  correctUnit2,
  freshUnit2,
  readUnit2,
  unit2Curve,
  unit2Questions,
  unit2StorageKey,
  unit2Topics
});
