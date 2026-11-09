import {useEffect, useId, useLayoutEffect, useRef, useSyncExternalStore} from 'react';
import {createPortal} from 'react-dom';
import {PanelsTopLeft, X} from 'lucide-react';
import '../styles/window-browser.css';

type Entry = {id: string; key?: string; title: string; restore(): void; close(): void};
const entries = new Map<string, Entry>();
const listeners = new Set<() => void>();
const empty: Entry[] = [];
let snapshot = empty;
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
const publish = () => {
  snapshot = [...entries.values()];
  for (const listener of listeners) listener();
};

export function restoreWindowTab(key: string): boolean {
  const entry = snapshot.find(tab => tab.key === key);
  if (!entry) return false;
  entry.restore();
  return true;
}

export const windowTabsLayoutEvent = 'modo-window-tabs-layout';

function WindowTabStrip({tabs}: {tabs: Entry[]}) {
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const docks = Array.from(document.querySelectorAll('.tool-dock,.lab-dock,.cab-controls'));
    const update = () => {
      const height = window.visualViewport?.height ?? innerHeight;
      const top = window.visualViewport?.offsetTop ?? 0;
      const dockTop = docks.map(d => d.getBoundingClientRect())
        .filter(r => r.width > 0 && r.height > 0 && r.bottom > top + height - 110 && r.top < top + height)
        .reduce((best, r) => Math.min(best, r.top), top + height);
      el.style.setProperty('--fw-dock-offset', Math.max(0, innerHeight - dockTop) + 'px');
      dispatchEvent(new Event(windowTabsLayoutEvent));
    };
    const observer = new ResizeObserver(update);
    docks.forEach(dock => observer.observe(dock));
    observer.observe(el);
    addEventListener('resize', update);
    visualViewport?.addEventListener('resize', update);
    update();
    return () => {
      observer.disconnect();
      removeEventListener('resize', update);
      visualViewport?.removeEventListener('resize', update);
      requestAnimationFrame(() => dispatchEvent(new Event(windowTabsLayoutEvent)));
    };
  }, []);

  return createPortal(<nav ref={root} className="fw-tabstrip" aria-label="Ventanas minimizadas">
    {tabs.map(tab => <div key={tab.id} className="fw-window-tab">
      <button type="button" className="fw-tab-restore" aria-label={`Restaurar ventana: ${tab.title}`} title={tab.title} onClick={tab.restore}>
        <PanelsTopLeft size={14} aria-hidden="true" /><span>{tab.title}</span>
      </button>
      <button type="button" className="fw-tab-close" aria-label={`Cerrar ventana minimizada: ${tab.title}`} onClick={tab.close}><X size={15} aria-hidden="true" /></button>
    </div>)}
  </nav>, document.body);
}

/** Una sola barra compartida, aunque las ventanas pertenezcan a islas de React distintas. */
export function useWindowTab(title: string, minimized: boolean, restore: () => void, close: () => void, key?: string) {
  const id = useId();
  const handlers = useRef({restore, close});
  handlers.current = {restore, close};
  useEffect(() => {
    if (!minimized) return;
    entries.set(id, {id, key, title, restore: () => handlers.current.restore(), close: () => handlers.current.close()});
    publish();
    return () => { entries.delete(id); publish(); };
  }, [id, minimized, title, key]);
  const tabs = useSyncExternalStore(subscribe, () => snapshot, () => empty);
  return minimized && tabs[0]?.id === id ? <WindowTabStrip tabs={tabs} /> : null;
}
