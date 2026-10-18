import { useEffect, useRef } from "react";
import { ArrowRight, Check } from "lucide-react";

type Props = {
  topic: string;
  title: string;
  text: string;
  primary: string;
  primarySub?: string;
  onPrimary: () => void;
  secondary?: string;
  onSecondary?: () => void;
};

/** Panel de cierre de un tema: un botón principal grande y una alternativa. */
export function TopicDone({ topic, title, text, primary, primarySub, onPrimary, secondary, onSecondary }: Props) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    root.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);
  return (
    <section ref={root} className="topic-done" data-topic={topic} aria-label="Tema terminado">
      <div className="topic-done-badge" aria-hidden="true">
        <span className="topic-done-ring" />
        <Check size={34} strokeWidth={3.2} />
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} style={{ ["--a" as string]: `${i * 36}deg`, ["--d" as string]: `${i % 2 ? 54 : 42}px` }} />
        ))}
      </div>
      <div className="topic-done-copy">
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <div className="topic-done-actions">
        <button className="study-primary topic-done-next" onClick={onPrimary}>
          <span>
            <strong>{primary}</strong>
            {primarySub && <small>{primarySub}</small>}
          </span>
          <ArrowRight size={22} />
        </button>
        {secondary && onSecondary && (
          <button className="topic-done-secondary" onClick={onSecondary}>
            {secondary}
          </button>
        )}
      </div>
    </section>
  );
}
