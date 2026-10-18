import { useEffect, useMemo, useRef, useState } from "react";
import { Delete, History } from "lucide-react";
import { CalcError, evaluate, formatResult } from "./calcEngine";

/** Eventos que comparten la calculadora de la pantalla Cálculos, la de la ventana superpuesta y las fichas. */
const SEND = "study-calc-send", RESULT = "study-calc-result";

type Entry = { expr: string; result: string };
const KEYS: { label: string; kind: "num" | "op" | "fn" | "eq" | "clear"; insert?: string; aria: string; wide?: boolean }[] = [
  { label: "C", kind: "clear", aria: "Borrar todo" },
  { label: "⌫", kind: "fn", aria: "Borrar un carácter" },
  { label: "(", kind: "fn", insert: "(", aria: "Abrir paréntesis" },
  { label: ")", kind: "fn", insert: ")", aria: "Cerrar paréntesis" },
  { label: "√", kind: "fn", insert: "√(", aria: "Raíz cuadrada" },
  { label: "x²", kind: "fn", insert: "^2", aria: "Elevar al cuadrado" },
  { label: "ANS", kind: "fn", aria: "Último resultado" },
  { label: "÷", kind: "op", insert: "÷", aria: "Dividir" },
  { label: "7", kind: "num", insert: "7", aria: "7" },
  { label: "8", kind: "num", insert: "8", aria: "8" },
  { label: "9", kind: "num", insert: "9", aria: "9" },
  { label: "×", kind: "op", insert: "×", aria: "Multiplicar" },
  { label: "4", kind: "num", insert: "4", aria: "4" },
  { label: "5", kind: "num", insert: "5", aria: "5" },
  { label: "6", kind: "num", insert: "6", aria: "6" },
  { label: "−", kind: "op", insert: "−", aria: "Restar" },
  { label: "1", kind: "num", insert: "1", aria: "1" },
  { label: "2", kind: "num", insert: "2", aria: "2" },
  { label: "3", kind: "num", insert: "3", aria: "3" },
  { label: "+", kind: "op", insert: "+", aria: "Sumar" },
  { label: "0", kind: "num", insert: "0", aria: "0" },
  { label: ",", kind: "num", insert: ",", aria: "Coma decimal" },
  { label: "=", kind: "eq", aria: "Calcular", wide: true },
];

export function Calculator({ inject }: { inject?: { id: number; text: string } }) {
  const [expr, setExpr] = useState("");
  const [shown, setShown] = useState("");
  const [error, setError] = useState("");
  const [ans, setAns] = useState<number | null>(null);
  const [history, setHistory] = useState<Entry[]>([]);
  const [fresh, setFresh] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const preview = useMemo(() => {
    if (!expr.trim()) return "";
    try { return formatResult(evaluate(expr)); } catch { return ""; }
  }, [expr]);

  const put = (text: string, replaceAll = false) => {
    const el = input.current;
    const base = replaceAll ? "" : expr;
    const start = replaceAll ? 0 : el?.selectionStart ?? base.length;
    const end = replaceAll ? 0 : el?.selectionEnd ?? base.length;
    setExpr(base.slice(0, start) + text + base.slice(end));
    setError("");
    setFresh(false);
    requestAnimationFrame(() => {
      el?.focus({ preventScroll: true });
      el?.setSelectionRange(start + text.length, start + text.length);
    });
  };
  const press = (insert: string) => {
    // Tras un resultado, un dígito o paréntesis empieza una cuenta nueva.
    if (fresh && /^[0-9,√(]/.test(insert)) { setShown(""); put(insert, true); return; }
    put(insert);
  };
  const equals = () => {
    if (!expr.trim()) return;
    try {
      const value = evaluate(expr);
      const text = formatResult(value);
      setHistory((h) => [{ expr, result: text }, ...h].slice(0, 6));
      setShown(`${expr} =`);
      setAns(value);
      window.dispatchEvent(new CustomEvent(RESULT, { detail: formatResult(Math.round(value * 1e4) / 1e4) }));
      setExpr(text);
      setError("");
      setFresh(true);
    } catch (e) {
      setError(e instanceof CalcError ? e.message : "Revisa la operación");
    }
  };
  const backspace = () => {
    const el = input.current;
    const start = el?.selectionStart ?? expr.length;
    const end = el?.selectionEnd ?? expr.length;
    if (start !== end) { put(""); return; }
    if (start === 0) return;
    setExpr(expr.slice(0, start - 1) + expr.slice(end));
    setError("");
    requestAnimationFrame(() => { el?.focus({ preventScroll: true }); el?.setSelectionRange(start - 1, start - 1); });
  };
  const clear = () => { setExpr(""); setShown(""); setError(""); setFresh(false); input.current?.focus({ preventScroll: true }); };

  useEffect(() => {
    if (inject?.text) { setShown(""); put(inject.text, true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inject?.id]);

  useEffect(() => {
    const incoming = (e: Event) => { const text = String((e as CustomEvent).detail ?? ""); if (text) { setShown(""); put(text, true); } };
    window.addEventListener(SEND, incoming);
    return () => window.removeEventListener(SEND, incoming);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (value: string) => {
    setExpr(value.replace(/\*/g, "×").replace(/\//g, "÷").replace(/[^0-9+\-−×÷^()√,.\s]/g, ""));
    setError("");
    setFresh(false);
  };

  return (
    <section className="calculator" aria-label="Calculadora">
      <div className="calc-screen">
        <small className="calc-shown" aria-hidden="true">{shown || " "}</small>
        <input
          ref={input}
          className="calc-input"
          aria-label="Operación"
          inputMode="none"
          autoComplete="off"
          spellCheck={false}
          placeholder="0"
          value={expr}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); equals(); }
          }}
        />
        <p className={`calc-result${error ? " is-error" : ""}`} role="status" aria-live="polite">
          {error ? error : preview && !fresh ? `= ${preview}` : " "}
        </p>
      </div>
      <div className="calc-keys">
        {KEYS.map((k) => (
          <button
            key={k.label}
            type="button"
            className={`calc-key calc-${k.kind}${k.wide ? " calc-wide" : ""}`}
            aria-label={k.aria}
            onClick={() => {
              if (k.kind === "eq") equals();
              else if (k.kind === "clear") clear();
              else if (k.label === "⌫") backspace();
              else if (k.label === "ANS") { if (ans !== null) press(formatResult(ans)); }
              else press(k.insert!);
            }}
          >
            {k.label === "⌫" ? <Delete size={20} aria-hidden="true" /> : k.label}
          </button>
        ))}
      </div>
      {history.length > 0 && (
        <div className="calc-history">
          <h4><History size={15} aria-hidden="true" /> Últimos cálculos</h4>
          <ul>
            {history.map((h, i) => (
              <li key={`${h.expr}-${i}`}>
                <button type="button" onClick={() => { setShown(""); put(h.result, true); }} aria-label={`Usar ${h.result}`}>
                  <span>{h.expr}</span>
                  <strong>= {h.result}</strong>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="calc-tip">Puedes escribir con el teclado. Usa coma o punto decimal y √( ) para la raíz.</p>
    </section>
  );
}
