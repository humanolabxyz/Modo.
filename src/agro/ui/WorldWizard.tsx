import {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight, Check, Droplets, Layers3, MapPin, Mountain, Sprout, Sun, Warehouse, Wheat} from 'lucide-react';
import {newSeed} from '../model/defaults.ts';
import {clp, START_MONEY} from '../economy/economy.ts';
import {TerrainModel} from '../terrain/model.ts';
import {renderMinimap} from '../terrain/minimap.ts';
import {RESOURCES, SITES, TEMPLATES, TERRITORIES, setupTerrain, siteX, type Resource, type WorldSetup} from '../world/setup.ts';

const STEPS = ['Plantilla', 'Territorio', 'Emplazamiento', 'Edición', 'Recursos', 'Simulación', 'Revisión'];
const TITLES = ['Elige una plantilla', 'Elige el territorio', 'Define el emplazamiento', 'Edita el terreno', 'Recursos iniciales', 'Configura la simulación', 'Revisión y creación'];
const PRESETS = {
  blank: {Icon: Layers3, detail: 'Empieza con el terreno vacío.', resources: []},
  farm: {Icon: Wheat, detail: 'Parcela, red de riego y alimentación eléctrica.', resources: ['parcel', 'irrigation']},
  greenhouse: {Icon: Warehouse, detail: 'Invernadero y parcela para organizar tu finca.', resources: ['greenhouse', 'parcel']},
} satisfies Record<WorldSetup['template'], {Icon: typeof Wheat; detail: string; resources: Resource[]}>;
const RESOURCE_ICONS = {parcel: Wheat, greenhouse: Warehouse, irrigation: Droplets, solar: Sun};
const area = (side: number) => side ** 2 / 10000;

function TerritoryPreview({setup}: {setup: WorldSetup}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const {side, seed, site, relief, radius, territory} = setup;
  const hf = useMemo(() => TerrainModel.fromTerrain(setupTerrain(setup, 4)).hf, [side, seed, site, relief, radius, territory]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    canvas.current?.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(renderMinimap(hf, 240)), 240, 240), 0, 0);
  }, [hf]);
  return <figure className="agro-wizard-map">
    <canvas ref={canvas} width={240} height={240} aria-label="Mapa generado del terreno" role="img" />
    <span className="agro-wizard-site" style={{left: (0.5 + siteX(site) / side) * 100 + '%'}}><MapPin size={18} />{SITES[site]}</span>
    <figcaption><Mountain size={16} />{area(side)} ha · {TERRITORIES[territory]}</figcaption>
  </figure>;
}

export function WorldWizard({busy, error, onCancel, onCreate}: {busy: boolean; error: string | null; onCancel(): void; onCreate(setup: WorldSetup): void}) {
  const [step, setStep] = useState(0);
  const [setup, setSetup] = useState<WorldSetup>(() => ({
    name: 'Mi granja', seed: newSeed(), template: 'blank', territory: 'free', side: 1000, site: 'center',
    relief: 'natural', radius: 60, resources: [], water: 80, experience: 'free', start: '2026-09-21',
  }));
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [step]);
  const patch = (data: Partial<WorldSetup>) => setSetup(current => ({...current, ...data}));
  const irrigation = setup.resources.includes('irrigation');
  const resourceNames = setup.resources.includes('irrigation') && !setup.resources.includes('parcel')
    ? [...setup.resources, 'parcel' as const] : setup.resources;
  const valid = setup.name.trim() !== '' && /^\d{4}-\d{2}-\d{2}$/.test(setup.start) && Number.isFinite(Date.parse(setup.start)) && setup.start >= '1900-01-01' && setup.start <= '2199-12-31';

  return <main className="agro-wizard" data-testid="agro-wizard">
    <header className="agro-wizard-top">
      <button className="agro-ghost" type="button" onClick={onCancel} disabled={busy}><ArrowLeft size={16} />Volver a Agro</button>
      <b><Sprout size={21} /> Crear nuevo mundo</b>
    </header>
    <section className="agro-wizard-sheet">
      <nav aria-label="Pasos para crear un mundo">
        <ol className="agro-wizard-steps">{STEPS.map((label, i) => <li key={label}>
          <button type="button" aria-current={step === i ? 'step' : undefined} data-done={i < step} onClick={() => setStep(i)} disabled={i > step || busy}>
            <span>{i < step ? <Check size={14} /> : i + 1}</span>{label}
          </button>
        </li>)}</ol>
      </nav>
      <h1 ref={heading} tabIndex={-1}>{TITLES[step]}</h1>
      <div className={step >= 1 && step <= 3 ? 'agro-wizard-split' : 'agro-wizard-body'}>
        {step >= 1 && step <= 3 && <TerritoryPreview setup={setup} />}
        <div className="agro-wizard-fields">
          {step === 0 && <>
            <label>Nombre del mundo<input value={setup.name} onChange={e => patch({name: e.target.value})} maxLength={80} required /></label>
            <div className="agro-wizard-tiles" role="group" aria-label="Plantillas">
              {(Object.keys(TEMPLATES) as WorldSetup['template'][]).map(id => {
                const {Icon, detail, resources} = PRESETS[id];
                return <button key={id} type="button" aria-pressed={setup.template === id} onClick={() => patch({template: id, resources: [...resources]})}><Icon /><strong>{TEMPLATES[id]}</strong><small>{detail}</small></button>;
              })}
            </div>
          </>}
          {step === 1 && <>
            <label>Origen del terreno<select value={setup.territory} onChange={e => patch({territory: e.target.value as WorldSetup['territory']})}>
              {Object.entries(TERRITORIES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select></label>
            <p>El mapa se genera para la simulación. El Valle central es un escenario didáctico con relieve reproducible.</p>
            {setup.territory === 'free' && <button className="agro-secondary" type="button" onClick={() => patch({seed: newSeed()})}>Generar otro relieve</button>}
          </>}
          {step === 2 && <>
            <label>Superficie del mundo <span className="agro-wizard-value">{area(setup.side)} ha</span><input type="range" min={400} max={1200} step={100} value={setup.side} onChange={e => patch({side: +e.target.value})} /></label>
            <label>Ubicación de la finca<select value={setup.site} onChange={e => patch({site: e.target.value as WorldSetup['site']})}>
              {Object.entries(SITES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select></label>
            <p>Los recursos iniciales se montarán alrededor del punto marcado.</p>
          </>}
          {step === 3 && <>
            <label>Relieve del emplazamiento<select value={setup.relief} onChange={e => patch({relief: e.target.value as WorldSetup['relief']})}><option value="natural">Conservar el terreno</option><option value="level">Nivelar la zona de montaje</option></select></label>
            {setup.relief === 'level' && <label>Radio de nivelación <span className="agro-wizard-value">{setup.radius} m</span><input type="range" min={30} max={120} step={5} value={setup.radius} onChange={e => patch({radius: +e.target.value})} /></label>}
            <p>El relieve del mapa refleja la edición. Puedes seguir modelando el terreno en el espacio de trabajo.</p>
          </>}
          {step === 4 && <>
            <div className="agro-wizard-tiles" role="group" aria-label="Recursos">
              {(Object.keys(RESOURCES) as Resource[]).map(id => {const Icon = RESOURCE_ICONS[id]; return <button key={id} type="button" aria-pressed={resourceNames.includes(id)} disabled={irrigation && id === 'parcel'} onClick={() => patch({resources: setup.resources.includes(id) ? setup.resources.filter(item => item !== id) : [...setup.resources, id]})}><Icon /><strong>{RESOURCES[id]}</strong></button>;})}
            </div>
            {irrigation && <label>Agua inicial del estanque <span className="agro-wizard-value">{setup.water} %</span><input type="range" min={0} max={100} step={5} value={setup.water} onChange={e => patch({water: +e.target.value})} /></label>}
            <p>El riego incluye parcela, estanque, bomba, tuberías, aspersor, tablero y acometida, con sus conexiones. El panel solar queda como equipo independiente.</p>
          </>}
          {step === 5 && <>
            <label>Modo de trabajo<select value={setup.experience} onChange={e => patch({experience: e.target.value as WorldSetup['experience']})}><option value="free">Libre · construcción inmediata</option><option value="real">Real · compras y tiempos de obra</option></select></label>
            <label>Fecha de inicio<input type="date" min="1900-01-01" max="2199-12-31" required value={setup.start} onChange={e => patch({start: e.target.value})} /></label>
            <p>La fecha determina la temporada del clima simulado. El mundo abre en pausa.{setup.experience === 'real' && ' Los recursos iniciales se entregan montados. Las nuevas compras usan el capital inicial de ' + clp(START_MONEY) + '.'}</p>
          </>}
          {step === 6 && <dl className="agro-wizard-review">
            {[
              ['Mundo', setup.name.trim()], ['Plantilla', TEMPLATES[setup.template]], ['Territorio', TERRITORIES[setup.territory]],
              ['Emplazamiento', area(setup.side) + ' ha · ' + SITES[setup.site]],
              ['Edición', setup.relief === 'level' ? 'Nivelación de ' + setup.radius + ' m' : 'Relieve natural'],
              ['Recursos', resourceNames.map(id => RESOURCES[id]).join(', ') || 'Terreno vacío'],
              ...(irrigation ? [['Agua inicial', setup.water + ' %']] : []),
              ['Simulación', (setup.experience === 'real' ? 'Modo real · ' + clp(START_MONEY) : 'Modo libre') + ' · ' + setup.start],
            ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>}
        </div>
      </div>
      {error && <p className="agro-warn" role="alert">{error}</p>}
      <footer className="agro-wizard-actions">
        <button className="agro-ghost" type="button" disabled={busy} onClick={() => step === 0 ? onCancel() : setStep(step - 1)}><ArrowLeft size={16} />{step === 0 ? 'Cancelar' : 'Atrás'}</button>
        {step < 6 ? <button className="agro-primary" type="button" data-testid="agro-wizard-next" disabled={!valid} onClick={() => setStep(step + 1)}>Continuar <ArrowRight size={17} /></button>
          : <button className="agro-primary" type="button" data-testid="agro-create" disabled={!valid || busy} onClick={() => onCreate({...setup, name: setup.name.trim()})}>{busy ? 'Creando el mundo…' : 'Crear mundo'} <Check size={17} /></button>}
      </footer>
    </section>
  </main>;
}
