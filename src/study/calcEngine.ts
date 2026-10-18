// Evaluador aritmético seguro (sin eval) para la calculadora del estudio.
// Acepta: + − × ÷ * / ^ ( ) √ y coma o punto decimal. Multiplicación implícita:
// 2(3), 2√(9), (1+2)(3+4).
type Token = { t: "n"; v: number } | { t: "op"; v: string };

export class CalcError extends Error {}

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.,]/.test(c)) {
      let j = i;
      let dots = 0;
      while (j < src.length && /[0-9.,]/.test(src[j])) {
        if (src[j] === "." || src[j] === ",") dots++;
        j++;
      }
      if (dots > 1) throw new CalcError("Número con dos comas");
      const raw = src.slice(i, j).replace(",", ".");
      const v = Number(raw === "." ? NaN : raw);
      if (!Number.isFinite(v)) throw new CalcError("Número no válido");
      out.push({ t: "n", v });
      i = j;
      continue;
    }
    if (c === "+") out.push({ t: "op", v: "+" });
    else if (c === "-" || c === "−") out.push({ t: "op", v: "-" });
    else if (c === "×" || c === "*" || c === "·") out.push({ t: "op", v: "*" });
    else if (c === "÷" || c === "/") out.push({ t: "op", v: "/" });
    else if (c === "^") out.push({ t: "op", v: "^" });
    else if (c === "(" || c === ")") out.push({ t: "op", v: c });
    else if (c === "√") out.push({ t: "op", v: "√" });
    else throw new CalcError("Carácter no permitido");
    i++;
  }
  return out;
}

export function evaluate(src: string): number {
  const tokens = tokenize(src);
  if (tokens.length === 0) throw new CalcError("Escribe una operación");
  let p = 0;
  const peek = () => tokens[p];
  const isOp = (v: string) => peek()?.t === "op" && (peek() as { v: string }).v === v;
  const startsFactor = () => {
    const k = peek();
    return !!k && (k.t === "n" || (k.t === "op" && (k.v === "(" || k.v === "√")));
  };

  function expr(): number {
    let v = term();
    while (isOp("+") || isOp("-")) {
      const op = (tokens[p++] as { v: string }).v;
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  function term(): number {
    let v = unary();
    for (;;) {
      if (isOp("*") || isOp("/")) {
        const op = (tokens[p++] as { v: string }).v;
        const r = unary();
        if (op === "/" && r === 0) throw new CalcError("No se puede dividir por 0");
        v = op === "*" ? v * r : v / r;
      } else if (startsFactor()) {
        v *= unary();
      } else return v;
    }
  }
  function unary(): number {
    if (isOp("-")) { p++; return -unary(); }
    if (isOp("+")) { p++; return unary(); }
    return power();
  }
  function power(): number {
    const base = atom();
    if (isOp("^")) { p++; return Math.pow(base, unary()); }
    return base;
  }
  function atom(): number {
    const k = peek();
    if (!k) throw new CalcError("Falta un número");
    if (k.t === "n") { p++; return k.v; }
    if (k.v === "(") {
      p++;
      const v = expr();
      if (!isOp(")")) throw new CalcError("Falta cerrar el paréntesis");
      p++;
      return v;
    }
    if (k.v === "√") {
      p++;
      const v = atom();
      if (v < 0) throw new CalcError("No existe la raíz de un negativo");
      return Math.sqrt(v);
    }
    throw new CalcError("Revisa la operación");
  }

  const result = expr();
  if (p < tokens.length) throw new CalcError(isOp(")") ? "Paréntesis de más" : "Revisa la operación");
  if (!Number.isFinite(result)) throw new CalcError("Resultado fuera de rango");
  return result;
}

/** Formato con coma decimal y hasta 10 cifras significativas, sin separador de miles. */
export function formatResult(n: number): string {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-9) return n.toExponential(6).replace(".", ",").replace(/,?0+e/, "e");
  const rounded = Number(n.toPrecision(10));
  return rounded.toLocaleString("es-CL", { useGrouping: false, maximumFractionDigits: 10 });
}
