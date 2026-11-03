import {useEffect, useRef, useState} from 'react';
import {Link2Off} from 'lucide-react';

/** Explicit named target, cancellable by release, leaving, blur or Escape. */
export function HoldToRelease({label, onRelease}: {label: string; onRelease(): void}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false);
  const cancel = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; setHolding(false); };
  const start = () => { if (timer.current) return; setHolding(true); timer.current = setTimeout(() => { timer.current = null; setHolding(false); onRelease(); }, 700); };
  useEffect(() => { const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') cancel(); }; addEventListener('keydown', escape); return () => { if (timer.current) clearTimeout(timer.current); removeEventListener('keydown', escape); }; }, []);
  return <button type="button" className="rb-release" data-holding={holding} aria-label={`Mantener para soltar ${label}`}
    onPointerDown={e => { if (e.button === 0 && e.isPrimary) start(); else cancel(); }}
    onPointerMove={e => { const box = e.currentTarget.getBoundingClientRect(); if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) cancel(); }}
    onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel} onBlur={cancel}
    onKeyDown={e => {
      if (e.key === 'Escape') { cancel(); e.stopPropagation(); e.preventDefault(); }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) start(); }
    }} onKeyUp={cancel} onContextMenu={e => e.preventDefault()}>
    <Link2Off size={15} /><span>{holding ? 'Soltando…' : 'Mantén para soltar'}</span>
  </button>;
}
