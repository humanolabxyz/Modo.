import { fmt } from "./model";
const data = (value: number) => value.toLocaleString("es-CL", { maximumFractionDigits: 8 });

export function CalculationSteps({ title, steps, meaning }: {
  title: string;
  steps: [string, string][];
  meaning: string;
}) {
  return <section className="calculation-steps" aria-label="Procedimiento del cálculo">
    <h4>{title}</h4>
    <ol>{steps.map(([label, calculation], index) => <li key={label}>
      <span aria-hidden="true">{index + 1}</span><div><strong>{label}</strong><p>{calculation}</p></div>
    </li>)}</ol>
    <p className="calculation-meaning"><strong>Interpretación:</strong> {meaning}</p>
  </section>;
}

export function MotorSteps({ power, voltage, eta, pf, current }: {
  power: number; voltage: number; eta: number; pf: number; current: number;
}) {
  return <CalculationSteps title="Así se calcula con tus datos" steps={[
    ["Convierte kW a W", `${data(power)} kW × 1000 = ${data(power * 1000)} W`],
    ["Calcula el denominador", `√3 × ${data(voltage)} × ${data(eta)} × ${data(pf)} ≈ ${fmt(Math.sqrt(3) * voltage * eta * pf)}`],
    ["Divide la potencia de salida", `${data(power * 1000)} / (√3 × ${data(voltage)} × ${data(eta)} × ${data(pf)}) ≈ ${fmt(current)} A`],
  ]} meaning="Corriente estimada para la potencia mecánica de salida indicada. Compárala con placa; todavía faltan datos para seleccionar conductor y protecciones." />;
}
