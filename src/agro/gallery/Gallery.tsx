// Galería de candidatos de la biblioteca 3D (Etapa 6). Herramienta de revisión, no parte del simulador.
// Permite ver cada modelo desde varios ángulos con su escala real, compararlos en una hoja y probar cómo combinan en una escena con la iluminación del Workspace.
import {Canvas, useThree} from '@react-three/fiber';
import {Html, OrbitControls} from '@react-three/drei';
import {useEffect, useMemo, useState} from 'react';
import {Color} from 'three';
import {GlbInstances, GlbObject, useModel} from '../scene/GlbModels.tsx';
import {modelById, registerModel} from '../models/library.ts';
import type {ModelEntry, ModelStatus} from '../models/types.ts';
import './gallery.css';

type Candidate = {id: string; name: string; pack: string; packName: string; family: string; status: ModelStatus; why: string; file: string; tris: number; sizeM?: number[]; bytes: number; materials: string[]; anims: string[]; skinned: boolean; integratedAs: string | null; palette: string; original: string};
type Data = {generated: string; models: Candidate[]};

const STATUS: Record<ModelStatus, {label: string; color: string}> = {
  listo: {label: 'Listo', color: '#2f8f4e'}, adaptar: {label: 'Necesita adaptación', color: '#c58a1a'}, descartar: {label: 'Descartar', color: '#b3402f'}, pendiente: {label: 'Pendiente / futuro', color: '#5f6f8f'},
};
const FAMILY_LABEL: Record<string, string> = {'terrenos-rocas': 'Terrenos y rocas', 'arboles-vegetacion': 'Árboles y vegetación', cultivos: 'Cultivos', 'estructuras-agricolas': 'Estructuras agrícolas', animales: 'Animales'};
const VIEWS = {tresCuartos: [1, 0.7, 1.2], frontal: [0, 0.35, 2.2], lateral: [2.2, 0.35, 0], superior: [0.001, 2.6, 0.001], posterior: [0, 0.4, -2.2]} as const;
type ViewKey = keyof typeof VIEWS;
const VIEW_LABEL: Record<ViewKey, string> = {tresCuartos: '3/4', frontal: 'Frontal', lateral: 'Lateral', superior: 'Superior', posterior: 'Posterior'};

/** Entrada sintética para ver un candidato a tamaño real (1 unidad = 1 m), con la paleta de la biblioteca si ya está integrado. */
const entryFor = (c: Candidate): ModelEntry => {
  const base = c.integratedAs ? modelById(c.integratedAs) : undefined;
  return {id: 'g:' + c.id, label: c.name, family: 'arboles-vegetacion', status: c.status, file: c.file, source: base?.source ?? {pack: c.packName, author: 'Quaternius', license: 'CC0', licenseUrl: '', original: c.original}, fit: {mode: 'scale', scale: 1}, palette: base?.palette, tone: base?.tone};
};

function Lights({arid = true}: {arid?: boolean}) {
  // Misma iluminación que el Workspace de Agro en territorios áridos.
  return <><hemisphereLight args={['#d6ebff', arid ? '#986c48' : '#6f8a46', 1.1]} /><directionalLight position={[60, 90, 40]} intensity={2.45} color={arid ? '#ffd7a5' : '#fff1d6'} /></>;
}
function Person({x, z}: {x: number; z: number}) {
  return <group position={[x, 0, z]}><mesh position={[0, 0.875, 0]}><capsuleGeometry args={[0.2, 1.35, 4, 10]} /><meshStandardMaterial color="#6c8cc0" roughness={1} /></mesh><mesh position={[0, 1.72, 0]}><sphereGeometry args={[0.12, 12, 10]} /><meshStandardMaterial color="#d9b799" roughness={1} /></mesh></group>;
}
function Ground({size = 200, color = '#c8a878'}: {size?: number; color?: string}) {
  return <><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}><planeGeometry args={[size, size]} /><meshStandardMaterial color={color} roughness={1} /></mesh><gridHelper args={[size, size, '#8a7a62', '#b39c7a']} position={[0, 0, 0]} /></>;
}
function CameraRig({view, target, radius, token}: {view: ViewKey; target: [number, number, number]; radius: number; token: number}) {
  const {camera, invalidate} = useThree();
  useEffect(() => {
    const v = VIEWS[view];
    camera.position.set(target[0] + v[0] * radius, target[1] + v[1] * radius, target[2] + v[2] * radius); camera.lookAt(...target); invalidate();
  }, [view, target[0], target[1], target[2], radius, token]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function Single({c, view, token, showPerson}: {c: Candidate; view: ViewKey; token: number; showPerson: boolean}) {
  const entry = useMemo(() => entryFor(c), [c]);
  const model = useModel(entry.id), ready = useRegistered(entry);
  const size = model?.size ?? [1, 1, 1], radius = Math.max(1.6, Math.hypot(size[0], size[1], size[2]) * 0.95);
  return <>
    <Lights /><Ground size={60} />
    {ready && model && <GlbObject id={entry.id} fallback={null} />}
    {showPerson && <Person x={-(size[0] / 2 + 1.2)} z={0} />}
    <CameraRig view={view} target={[0, size[1] / 2, 0]} radius={radius} token={token} /><OrbitControls makeDefault target={[0, size[1] / 2, 0]} enableDamping={false} />
  </>;
}

// Los candidatos no están en la biblioteca integrada: se registran para que useModel/GlbObject los resuelvan.
function useRegistered(entry: ModelEntry): boolean {
  registerModel(entry);
  return true;
}

function Sheet({items, onPick}: {items: Candidate[]; onPick: (c: Candidate) => void}) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(items.length))), rows = Math.ceil(items.length / cols);
  // La separación sale del modelo más grande de la hoja, para que nada se superponga y se puedan comparar escalas.
  const gap = Math.max(2.6, ...items.map(c => Math.max(c.sizeM?.[0] ?? 1, c.sizeM?.[2] ?? 1) * 1.15)), span = Math.max(cols, rows) * gap;
  const {camera, invalidate} = useThree();
  useEffect(() => { camera.position.set(0, span * 0.78 + 3, span * 0.86 + 4); camera.lookAt(0, 0, 0); invalidate(); }, [span, items.length]); // eslint-disable-line react-hooks/exhaustive-deps
  return <>
    <Lights /><Ground size={Math.max(60, span * 2.2)} />
    {items.map((c, i) => <SheetItem key={c.id} c={c} gap={gap} x={(i % cols - (cols - 1) / 2) * gap} z={(Math.floor(i / cols) - (rows - 1) / 2) * gap} onPick={onPick} />)}
    <Person x={-cols * gap / 2 - 1.5} z={0} />
    <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.05} target={[0, 0, 0]} />
  </>;
}
function SheetItem({c, x, z, gap, onPick}: {c: Candidate; x: number; z: number; gap: number; onPick: (c: Candidate) => void}) {
  const entry = useMemo(() => entryFor(c), [c]); useRegistered(entry);
  const model = useModel(entry.id), color = STATUS[c.status].color;
  return <group position={[x, 0, z]} onClick={e => { e.stopPropagation(); onPick(c); }}>
    {model && <GlbObject id={entry.id} fallback={null} />}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}><ringGeometry args={[gap * 0.46, gap * 0.48, 40]} /><meshBasicMaterial color={new Color(color)} /></mesh>
    <Html position={[0, 0.02, gap * 0.5]} center zIndexRange={[5, 0]} style={{pointerEvents: 'none'}}><span className="gal-tag" style={{borderColor: color}}>{c.name}</span></Html>
  </group>;
}

/** Escena de prueba: la biblioteca integrada combinada, con la iluminación del Workspace en el Oasis nortino. */
function TestScene() {
  const pick = (ids: string[], n: number, r: number, rx: number, rz: number) => Array.from({length: n}, (_, i) => ({id: ids[i % ids.length], x: rx + Math.cos(i * 2.4) * r * (0.4 + (i % 5) / 5), z: rz + Math.sin(i * 2.4) * r * (0.4 + (i % 7) / 7), yaw: i * 1.7, s: 0.9 + (i % 4) * 0.08}));
  const groups: Record<string, {id: string; x: number; z: number; yaw: number; s: number}[]> = {};
  for (const it of [...pick(['veg-palma-a', 'veg-palma-b'], 9, 14, -14, -6), ...pick(['veg-citrico-a', 'veg-citrico-b'], 7, 9, 12, -12), ...pick(['veg-cactus-a', 'veg-cactus-b'], 8, 12, 22, 14), ...pick(['veg-arbusto-a', 'veg-arbusto-b'], 10, 11, -16, 12), ...pick(['roca-a', 'roca-b', 'roca-c'], 9, 16, 4, 26)]) (groups[it.id] ??= []).push(it);
  const stages = [1, 2, 3, 4];
  const fence = Array.from({length: 5}, (_, i) => ({x: -12 + i * 5.9, y: 0, z: 20}));
  return <>
    <Lights /><Ground size={140} color="#bfa070" />
    {Object.entries(groups).map(([id, list]) => <GlbInstances key={id} id={id} items={list.map(l => ({x: l.x, y: 0, z: l.z, yaw: l.yaw, s: l.s * (id.startsWith('roca') ? 0.9 + (l.s - 0.9) * 4 : 1)}))} />)}
    {stages.map(n => <GlbInstances key={n} id={`cultivo-tomate-${n}`} items={Array.from({length: 6}, (_, k) => ({x: -4 + (n - 1) * 3.2 + (k % 2) * 0.9, y: 0, z: -4 + Math.floor(k / 2) * 1.2, yaw: k}))} />)}
    <group position={[-22, 0, -22]}><GlbObject id="estructura-granero" fallback={null} /></group>
    <group position={[26, 0, -26]}><GlbObject id="estructura-molino" fallback={null} /></group>
    <GlbInstances id="estructura-cerca" items={fence} />
    <Person x={2} z={4} />
    <OrbitControls makeDefault target={[0, 2, 0]} maxPolarAngle={Math.PI / 2.05} />
    <CameraRig view="tresCuartos" target={[0, 2, 0]} radius={28} token={0} />
  </>;
}

type Mode = 'modelo' | 'hoja' | 'escena';
export default function Gallery() {
  const [data, setData] = useState<Data | null | undefined>(undefined);
  const [family, setFamily] = useState('todas'), [status, setStatus] = useState<'todos' | ModelStatus>('todos'), [q, setQ] = useState(''), [mode, setMode] = useState<Mode>('modelo');
  const [sel, setSel] = useState<Candidate | null>(null), [view, setView] = useState<ViewKey>('tresCuartos'), [token, setToken] = useState(0), [person, setPerson] = useState(true);
  useEffect(() => { fetch('/agro/_galeria/candidates.json').then(r => (r.ok ? r.json() : null)).then(d => { setData(d); if (d?.models?.length) setSel(d.models.find((m: Candidate) => m.integratedAs) ?? d.models[0]); }).catch(() => setData(null)); }, []);
  const list = useMemo(() => (data?.models ?? []).filter(m => (family === 'todas' || m.family === family) && (status === 'todos' || m.status === status) && (!q || (m.name + m.pack).toLowerCase().includes(q.toLowerCase()))), [data, family, status, q]);
  const counts = useMemo(() => { const c: Record<string, number> = {}; for (const m of data?.models ?? []) c[m.status] = (c[m.status] ?? 0) + 1; return c; }, [data]);
  if (data === undefined) return <div className="gal-msg">Cargando galería…</div>;
  if (!data) return <div className="gal-msg">La galería necesita los GLB de candidatos (<code>public/agro/_galeria/</code>), que se generan en local con <code>tools/agro-assets</code> y no se publican.</div>;
  const families = [...new Set(data.models.map(m => m.family))];
  return <div className="gal" data-testid="agro-gallery">
    <aside className="gal-side">
      <h1>Biblioteca 3D · candidatos</h1>
      <p className="gal-sub">{data.models.length} modelos del kit · {Object.entries(counts).map(([k, v]) => `${v} ${STATUS[k as ModelStatus].label.toLowerCase()}`).join(' · ')}</p>
      <div className="gal-filters">
        <input placeholder="Buscar por nombre o paquete" value={q} onChange={e => setQ(e.target.value)} aria-label="Buscar" />
        <select value={family} onChange={e => setFamily(e.target.value)} aria-label="Familia"><option value="todas">Todas las familias</option>{families.map(f => <option key={f} value={f}>{FAMILY_LABEL[f] ?? f}</option>)}</select>
        <select value={status} onChange={e => setStatus(e.target.value as 'todos' | ModelStatus)} aria-label="Estado"><option value="todos">Todos los estados</option>{(Object.keys(STATUS) as ModelStatus[]).map(s => <option key={s} value={s}>{STATUS[s].label}</option>)}</select>
      </div>
      <ul className="gal-list">{list.map(m => <li key={m.id}><button className={sel?.id === m.id ? 'on' : ''} onClick={() => { setSel(m); setMode('modelo'); setToken(t => t + 1); }}>
        <span className="dot" style={{background: STATUS[m.status].color}} /><span className="nm">{m.name}{m.integratedAs && <b title="Integrado en el simulador"> ●</b>}</span><span className="pk">{m.packName.replace('Quaternius · ', '')}</span><span className="tr">{m.tris} t</span></button></li>)}</ul>
    </aside>
    <main className="gal-main">
      <div className="gal-bar">
        {(['modelo', 'hoja', 'escena'] as Mode[]).map(m => <button key={m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{m === 'modelo' ? 'Modelo' : m === 'hoja' ? `Hoja comparativa (${Math.min(list.length, 48)})` : 'Escena de prueba · Oasis'}</button>)}
        {mode === 'modelo' && <span className="views">{(Object.keys(VIEWS) as ViewKey[]).map(v => <button key={v} className={view === v ? 'on' : ''} onClick={() => { setView(v); setToken(t => t + 1); }}>{VIEW_LABEL[v]}</button>)}<label><input type="checkbox" checked={person} onChange={e => setPerson(e.target.checked)} /> Persona 1,75 m</label></span>}
      </div>
      <div className="gal-canvas">
        <Canvas dpr={[1, 1.75]} camera={{position: [6, 5, 8], fov: 45, near: 0.05, far: 900}} gl={{antialias: true, alpha: false}} onCreated={({scene}) => { scene.background = new Color('#d9d2c3'); }}>
          {mode === 'modelo' && sel && <Single key={sel.id} c={sel} view={view} token={token} showPerson={person} />}
          {mode === 'hoja' && <Sheet items={list.slice(0, 48)} onPick={c => { setSel(c); }} />}
          {mode === 'escena' && <TestScene />}
        </Canvas>
        {mode === 'hoja' && <p className="gal-hint">Cada anillo indica el estado: verde listo · ámbar adaptar · rojo descartar · azul pendiente. Clic en un modelo para ver su ficha.</p>}
        {mode === 'escena' && <p className="gal-hint">Solo biblioteca integrada (palmas, cítricos, cactus, arbustos, rocas, tomate en 4 etapas, granero, molino y cerca) con la luz del Workspace árido.</p>}
      </div>
    </main>
    {sel && <aside className="gal-info" data-testid="gal-info">
      <h2>{sel.name}</h2><span className="chip" style={{background: STATUS[sel.status].color}}>{STATUS[sel.status].label}</span>{sel.integratedAs && <span className="chip int">Integrado: {sel.integratedAs}</span>}
      <p className="why">{sel.why}</p>
      <dl>
        <dt>Familia</dt><dd>{FAMILY_LABEL[sel.family] ?? sel.family}</dd><dt>Paquete</dt><dd>{sel.packName}</dd><dt>Licencia</dt><dd>CC0 1.0 (License.txt del paquete)</dd>
        <dt>Triángulos</dt><dd>{sel.tris.toLocaleString('es-CL')}</dd><dt>Medidas (m)</dt><dd>{sel.sizeM?.map(v => v.toFixed(2)).join(' × ')}</dd><dt>Peso GLB</dt><dd>{(sel.bytes / 1024).toFixed(0)} KB</dd>
        <dt>Materiales</dt><dd>{sel.materials.join(', ')}</dd><dt>Color</dt><dd>{sel.palette}</dd>{sel.anims.length > 0 && <><dt>Animaciones</dt><dd>{sel.anims.join(', ')}{sel.skinned ? ' · con esqueleto' : ''}</dd></>}
        <dt>Archivo original</dt><dd className="mono">{sel.original}</dd>
      </dl>
    </aside>}
  </div>;
}
