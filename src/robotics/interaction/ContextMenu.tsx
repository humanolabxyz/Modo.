import {useEffect, useLayoutEffect, useRef, useState, type ReactNode} from 'react';

export type MenuItem = {id: string; label: string; hint?: string; icon?: ReactNode; danger?: boolean; separatorBefore?: boolean};

/** Menú contextual (clic secundario o pulsación larga). Se cierra con Esc, al pulsar fuera o al elegir. */
export function ContextMenu({at, title, items, onChoose, onClose}: {at: {x: number; y: number}; title: string; items: MenuItem[]; onChoose(id: string): void; onClose(): void}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(at);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect(), vw = visualViewport?.width ?? innerWidth, vh = visualViewport?.height ?? innerHeight;
    setPos({x: Math.max(8, Math.min(at.x, vw - r.width - 8)), y: Math.max(8, Math.min(at.y, vh - r.height - 8))});
  }, [at.x, at.y]);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('button')?.focus({preventScroll: true});
    const outside = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    addEventListener('pointerdown', outside, true);
    return () => removeEventListener('pointerdown', outside, true);
  }, []);
  return <div ref={ref} className="rb-context-menu" role="menu" aria-label={title} style={{left: pos.x, top: pos.y}} onContextMenu={e => e.preventDefault()} onKeyDown={e => {
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
    const buttons = Array.from(ref.current?.querySelectorAll<HTMLElement>('button') ?? []), i = buttons.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); buttons[(i + 1) % buttons.length]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); buttons[(i - 1 + buttons.length) % buttons.length]?.focus(); }
  }}>
    {items.map(item => <div key={item.id} role="none">
      {item.separatorBefore && <hr />}
      <button type="button" role="menuitem" className={item.danger ? 'is-danger' : undefined} onClick={() => onChoose(item.id)}>{item.icon}<span>{item.label}</span>{item.hint && <kbd>{item.hint}</kbd>}</button>
    </div>)}
  </div>;
}
