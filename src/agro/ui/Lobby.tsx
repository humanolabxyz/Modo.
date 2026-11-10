import {EXPERIENCE_POLICIES} from '../world/experience.ts';
import {useRef, useState} from 'react';
import {ArrowLeft, Copy, Download, FilePlus2, FileWarning, Play, Sprout, Trash2, Upload} from 'lucide-react';
import {WorldWizard} from './WorldWizard.tsx';
import type {WorldSetup} from '../world/setup.ts';
import type {Summary} from '../store/worlds.ts';

const when = new Intl.DateTimeFormat('es-CL', {dateStyle: 'medium', timeStyle: 'short'});
const dateOf = (iso: string): string => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? 'sin fecha' : when.format(d); };

export type LobbyProps = {
  worlds: Summary[]; activeId: string | null; error: string | null; memoryOnly: boolean; notice: string; busy: boolean;
  onOpen(id: string): void; onCreate(setup: WorldSetup): void; onDelete(id: string): void; onDuplicate(id: string): void; onExport(id: string): void; onImport(file: File): void;
};

/** Menú de entrada de Agro: continuar, crear un mundo nuevo y mis mundos. Sin barra lateral ni paneles de gestión. */
export function Lobby(p: LobbyProps) {
  const [creating, setCreating] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const latest = p.worlds.find(w => w.id === p.activeId && w.readable) ?? p.worlds.find(w => w.readable) ?? null;
  const first = p.worlds.length === 0;

  if (creating) return <WorldWizard busy={p.busy} error={p.error} onCancel={() => setCreating(false)} onCreate={p.onCreate} />;

  return <div className="agro-lobby" data-testid="agro-lobby">
    <header className="agro-lobby-bar">
      <a className="agro-back" href="/" aria-label="Volver al inicio de modo."><ArrowLeft size={16} aria-hidden="true" />modo.</a>
      <h1><Sprout size={22} aria-hidden="true" /><span>Agro</span><em>Beta</em></h1>
    </header>
    <main className="agro-lobby-main">
      <section className="agro-hero" aria-labelledby="agro-hero-title">
        <img src="/images/home-approved/agro.svg" alt="" width="320" height="320" />
        <h2 id="agro-hero-title">{first ? 'Construye tu primera finca' : 'Tu mundo agrícola'}</h2>
        <p>{first ? 'Elige el terreno, prepara tu finca y simula en 3D. Todo se guarda en este navegador.' : 'Continúa donde lo dejaste o crea un mundo nuevo.'}</p>
        <div className="agro-menu-buttons">
          {latest && <button type="button" className="agro-primary" data-testid="agro-continue" onClick={() => p.onOpen(latest.id)} disabled={p.busy}><span><Play size={18} aria-hidden="true" />Continuar</span><small>{latest.name}</small></button>}
          <button type="button" className={latest ? 'agro-secondary' : 'agro-primary'} data-testid="agro-new" onClick={() => setCreating(true)}><FilePlus2 size={18} aria-hidden="true" />Crear nuevo mundo</button>
        </div>
        {p.memoryOnly && <p className="agro-warn" role="alert">Este navegador no permite guardar mundos: lo que hagas se perderá al cerrar. Exporta tu trabajo desde el menú Archivo.</p>}
        {p.error && <p className="agro-warn" role="alert">{p.error}</p>}
        {p.notice && <p className="agro-note" role="status" data-testid="agro-lobby-notice">{p.notice}</p>}
      </section>

      <section className="agro-worlds" aria-labelledby="agro-worlds-title">
        <div className="agro-worlds-head">
          <h2 id="agro-worlds-title">Mis mundos <span>{p.worlds.length}</span></h2>
          <label className="agro-ghost agro-file"><Upload size={15} aria-hidden="true" />Importar<input ref={file} type="file" accept="application/json,.json" aria-label="Importar mundo desde archivo" onChange={e => { const f = e.target.files?.[0]; if (f) p.onImport(f); if (file.current) file.current.value = ''; }} /></label>
        </div>
        {first ? <p className="agro-empty">Todavía no hay mundos guardados.</p> : <ul className="agro-world-list" data-testid="agro-worlds">
          {p.worlds.map(w => <li key={w.id} className={w.readable ? '' : 'broken'} data-world-id={w.id}>
            <div className="agro-world-info">
              <strong>{w.name}</strong>
              {w.readable ? <span>{(Object.values(EXPERIENCE_POLICIES).find(p=>p.id===w.experience)?.label ?? 'Experiencia desconocida')} · {w.entities} {w.entities === 1 ? 'pieza' : 'piezas'} · {w.edits} {w.edits === 1 ? 'edición' : 'ediciones'} de terreno · Última sesión {dateOf(w.updatedAt)}</span>
                : <span className="agro-broken"><FileWarning size={14} aria-hidden="true" /> No se pudo leer: {w.error}. No se modificó.</span>}
            </div>
            <div className="agro-world-actions">
              {w.readable && <button type="button" className="agro-secondary" onClick={() => p.onOpen(w.id)} disabled={p.busy}>Abrir</button>}
              <button type="button" className="agro-icon" aria-label={`Exportar ${w.name}`} title="Exportar" onClick={() => p.onExport(w.id)}><Download size={16} aria-hidden="true" /></button>
              {w.readable && <button type="button" className="agro-icon" aria-label={`Duplicar ${w.name}`} title="Duplicar" onClick={() => p.onDuplicate(w.id)} disabled={p.busy}><Copy size={16} aria-hidden="true" /></button>}
              {confirm === w.id
                ? <span className="agro-confirm"><button type="button" className="agro-danger" onClick={() => { setConfirm(null); p.onDelete(w.id); }}>Eliminar para siempre</button><button type="button" className="agro-ghost" onClick={() => setConfirm(null)}>Cancelar</button></span>
                : <button type="button" className="agro-icon" aria-label={`Eliminar ${w.name}`} title="Eliminar" onClick={() => setConfirm(w.id)}><Trash2 size={16} aria-hidden="true" /></button>}
            </div>
          </li>)}
        </ul>}
      </section>
    </main>
  </div>;
}
