import {useCallback, useEffect, useRef, useState} from 'react';
import {createConfiguredWorld} from './world/setup.ts';
import {exportWorld, parseWorldText} from './model/validate.ts';
import {memoryBackend, openIndexedDb} from './store/backend.ts';
import {WorldStore, type Summary} from './store/worlds.ts';
import {WorldSession} from './world/session.ts';
import {Lobby} from './ui/Lobby.tsx';
import {Workspace} from './ui/Workspace.tsx';

type View = {kind: 'loading'} | {kind: 'lobby'} | {kind: 'world'; session: WorldSession};
const HASH = /^#\/mundo\/([\w-]+)$/;

function download(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], {type: 'application/json'})), a = document.createElement('a');
  a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Agro: lobby (continuar, crear, Mis mundos) y workspace de un mundo. Los mundos viven en IndexedDB; sin ella (ventana privada) se trabaja en memoria y se avisa. */
export default function AgroApp() {
  const [store, setStore] = useState<WorldStore | null>(null);
  const [persistent, setPersistent] = useState(true);
  const [view, setView] = useState<View>({kind: 'loading'});
  const [worlds, setWorlds] = useState<Summary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const bootDone = useRef(false);

  const refresh = useCallback(async (s: WorldStore) => {
    const r = await s.list();
    if (r.ok) { setWorlds(r.value); setError(null); } else setError(r.error);
    setActiveId(await s.getActive());
  }, []);

  const openWorld = useCallback(async (s: WorldStore, id: string, push = true) => {
    setBusy(true);
    const r = await s.load(id);
    setBusy(false);
    if (!r.ok) { setError(r.error); setView({kind: 'lobby'}); if (location.hash) history.replaceState(null, '', location.pathname + location.search); return; }
    setError(null); await s.setActive(id);
    if (push && location.hash !== `#/mundo/${id}`) history.pushState(null, '', `${location.pathname}${location.search}#/mundo/${id}`);
    setView({kind: 'world', session: WorldSession.fromWorld(r.value)});
  }, []);

  const goLobby = useCallback(async () => {
    if (!store) return;
    await refresh(store); setView({kind: 'lobby'});
    if (location.hash) history.pushState(null, '', location.pathname + location.search);
  }, [store, refresh]);

  useEffect(() => {
    if (bootDone.current) return; bootDone.current = true;
    (async () => {
      let s: WorldStore, mem = false;
      try { s = new WorldStore(await openIndexedDb()); } catch { s = new WorldStore(memoryBackend()); mem = true; }
      setStore(s); setPersistent(!mem);
      await refresh(s);
      const m = HASH.exec(location.hash);
      if (m) await openWorld(s, m[1], false); else setView({kind: 'lobby'});
    })();
  }, [refresh, openWorld]);

  useEffect(() => { // el botón «atrás» del navegador vuelve al lobby sin perder el guardado
    const onNav = () => { if (!store) return; const m = HASH.exec(location.hash); if (m) void openWorld(store, m[1], false); else if (view.kind === 'world') void goLobby(); };
    window.addEventListener('popstate', onNav); window.addEventListener('hashchange', onNav);
    return () => { window.removeEventListener('popstate', onNav); window.removeEventListener('hashchange', onNav); };
  }, [store, view.kind, openWorld, goLobby]);

  if (!store || view.kind === 'loading') return <div className="agro-ws agro-boot" data-testid="agro-app" data-view="loading"><span>Abriendo Agro…</span></div>;
  if (view.kind === 'world') return <Workspace key={view.session.id} session={view.session} store={store} persistent={persistent} onExit={goLobby} />;

  const act = async (fn: () => Promise<string | void>) => { setBusy(true); try { const msg = await fn(); if (msg) setNotice(msg); } finally { setBusy(false); await refresh(store); } };
  return <div className="agro-ws agro-lobby-root" data-testid="agro-app" data-view="lobby" data-ready="true">
    <Lobby worlds={worlds} activeId={activeId} error={error} memoryOnly={!persistent} notice={notice} busy={busy}
      onOpen={id => void openWorld(store, id)}
      onCreate={setup => void (async () => {
        setBusy(true); setError(null);
        try {
          // Deja que el asistente muestre el estado de creación antes de generar el terreno.
          await new Promise<void>(resolve => setTimeout(resolve, 0));
          const created = createConfiguredWorld(setup);
          if (!created.ok) { setError(created.error); return; }
          const w = created.value, saved = await store.save(w);
          if (!saved.ok) { setError(saved.error); return; }
          await store.setActive(w.id);
          history.pushState(null, '', `${location.pathname}${location.search}#/mundo/${w.id}`);
          setView({kind: 'world', session: WorldSession.fromWorld(w)});
        } finally { setBusy(false); }
      })()}
      onDelete={id => void act(async () => { const r = await store.remove(id); if (!r.ok) { setError(r.error); return; } return 'Mundo eliminado.'; })}
      onDuplicate={id => void act(async () => { const r = await store.duplicate(id); if (!r.ok) { setError(r.error); return; } return `«${r.value.name}» creado.`; })}
      onExport={id => void act(async () => {
        const loaded = await store.load(id);
        if (loaded.ok) { const {filename, text} = exportWorld(loaded.value); download(filename, text); return `«${loaded.value.name}» exportado.`; }
        const raw = await store.rawText(id); if (raw) { download(`mundo-danado-${id}.json`, raw); return 'Se descargó una copia sin modificar del mundo que no se pudo leer.'; }
        setError(loaded.error);
      })}
      onImport={file => void act(async () => {
        const r = parseWorldText(await file.text()); if (!r.ok) { setError(`No se pudo importar «${file.name}»: ${r.error}`); return; }
        const saved = await store.importWorld(r.value); if (!saved.ok) { setError(saved.error); return; }
        setError(null); return `«${saved.value.name}» importado.`;
      })} />
  </div>;
}
