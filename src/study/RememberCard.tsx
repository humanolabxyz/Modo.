import { remember } from "./rememberContent";
import { Rich } from "./Rich";

export function RememberCard({ topic }: { topic: string }) {
  const info = remember[topic];
  if (!info) return null;
  return (
    <aside className="remember-card" aria-label="Para recordar">
      <span className="remember-eyebrow">PARA RECORDAR</span>
      <p className="remember-key">{info.key}</p>
      <ul>
        {info.points.map((point) => (
          <li key={point}><Rich text={point} /></li>
        ))}
      </ul>
    </aside>
  );
}
