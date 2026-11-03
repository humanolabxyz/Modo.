import {useEffect, useMemo, useState} from 'react';
import {Check, CircleAlert, Copy} from 'lucide-react';
import {FloatingWindow} from '../../components/FloatingWindow';
import {storageIdOf} from '../windows/useRoboticsWindows';
import type {RobotProject} from '../project/types.ts';
import {PROGRAM_GUIDES, getProgramGuide} from './programGuides.ts';
import {hexForCheck, reachedStep, runStepChecks, stepHex} from './programCheck.ts';
import type {CheckReport, ProgramGuideDef, ProgramStep} from './programTypes.ts';

type Props = {
  project: RobotProject;
  guideId: string | undefined;
  /** Guía sugerida para el robot (por su plantilla), si hay. */
  suggestedId?: string;
  onChoose(id: string): void;
  /** Pone el código del paso (y su .hex) como programa de la placa. */
  onPut(step: ProgramStep): void;
  /** Muestra (o quita, con null) el código del paso en gris dentro del editor de Programación para escribirlo encima. */
  onGhost(step: ProgramStep | null): void;
  onClose(): void;
};

/** Líneas del código que son nuevas respecto del paso anterior (se resaltan para ver qué se agregó). */
export function addedLines(step: ProgramStep, previous?: ProgramStep): boolean[] {
  const before = new Set((previous?.source ?? '').split('\n').map(l => l.trim()));
  return step.source.split('\n').map(l => !!l.trim() && !before.has(l.trim()));
}

/** Panel «Programar paso a paso»: explica cada paso, pone el código en el programa del robot y lo comprueba en el simulador con el circuito real. */
export function ProgramGuide({project, guideId, suggestedId, onChoose, onPut, onGhost, onClose}: Props) {
  const guide: ProgramGuideDef | undefined = getProgramGuide(guideId ?? suggestedId);
  const reached = guide ? reachedStep(project, guide) : -1;
  const [passed, setPassed] = useState<Record<string, boolean>>({});
  const [reports, setReports] = useState<Record<string, {ok: boolean; reports: CheckReport[]} | {reason: string}>>({});
  const [picked, setPicked] = useState<number | null>(null), [copied, setCopied] = useState(''), [ghostOn, setGhostOn] = useState(false);
  const firstOpen = guide ? Math.max(0, guide.steps.findIndex(s => !passed[`${guide.id}/${s.id}`])) : 0;
  const index = guide ? Math.min(picked ?? (guide.steps.every(s => passed[`${guide.id}/${s.id}`]) ? guide.steps.length - 1 : firstOpen), guide.steps.length - 1) : 0;
  const step = guide?.steps[index];
  const lines = useMemo(() => (step && guide ? addedLines(step, guide.steps[index - 1]) : []), [step, guide, index]);
  const key = guide && step ? `${guide.id}/${step.id}` : '';
  const report = key ? reports[key] : undefined, here = reached === index;
  const doneCount = guide ? guide.steps.filter(s => passed[`${guide.id}/${s.id}`]).length : 0;

  const copy = async () => {
    if (!step) return;
    try { await navigator.clipboard.writeText(step.source); setCopied('Código copiado. Pégalo en Programación: ya está compilado, no hace falta recompilar.'); }
    catch { // sin permiso del portapapeles (sitio sin HTTPS o iframe): se selecciona el texto para copiarlo a mano
      const pre = document.querySelector('.rb-program-code'); if (pre) { const r = document.createRange(); r.selectNodeContents(pre); const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(r); }
      setCopied('Texto seleccionado: pulsa Ctrl+C para copiarlo.');
    }
    setTimeout(() => setCopied(''), 5000);
  };
  // Con el espectro activo, al cambiar de paso el editor muestra el código del paso nuevo; al cerrar la guía se quita.
  useEffect(() => { onGhost(ghostOn && step ? step : null); }, [ghostOn, step?.id, guide?.id]);
  useEffect(() => () => onGhost(null), []);
  const test = () => {
    if (!step || !key) return;
    const h = hexForCheck(project, step);
    if ('reason' in h) { setReports(r => ({...r, [key]: {reason: h.reason}})); setPicked(index); return; }
    const result = runStepChecks(project, step, h.hex);
    setReports(r => ({...r, [key]: result})); setPassed(p => ({...p, [key]: result.ok})); setPicked(index); // se queda en este paso para que veas el resultado
  };

  return <FloatingWindow storageId={storageIdOf('program')} title="Programar paso a paso" eyebrow="Robótica" width={400} side="left" top={70} className="rb-guide-window" closeLabel="Cerrar programar paso a paso" onClose={onClose}><section className="rb-assembly-guide rb-program-guide rb-guide-in-window" aria-label="Programar paso a paso">
    <label>Qué quieres programar<select aria-label="Guía de programación" value={guide?.id ?? ''} onChange={e => { setPicked(null); onChoose(e.target.value); }}><option value="">Elige un programa…</option>{PROGRAM_GUIDES.map(g => <option key={g.id} value={g.id}>{g.name}{g.id === suggestedId ? ' · para tu robot' : ''}</option>)}</select></label>
    {!guide && <p>Elige qué comportamiento quieres que tenga tu robot. Cada paso agrega un poco de código, lo explica y lo comprueba en el simulador. Antes arma y cablea el robot.</p>}
    {guide && step && <>
      <p className="rb-guide-caption">{guide.summary}</p>
      <div className="rb-guide-progress"><span>{doneCount} de {guide.steps.length} pasos superados</span><progress aria-label="Avance de programación" value={doneCount} max={guide.steps.length} /></div>
      <nav className="rb-program-steps" aria-label="Pasos">{guide.steps.map((s, i) => <button type="button" key={s.id} aria-current={i === index ? 'step' : undefined} data-done={passed[`${guide.id}/${s.id}`] ? 'true' : undefined} aria-label={`${s.title}${passed[`${guide.id}/${s.id}`] ? ' (superado)' : ''}`} onClick={() => setPicked(i)}>{passed[`${guide.id}/${s.id}`] ? '✓' : i + 1}</button>)}</nav>
      <div className="rb-wiring-step" data-step={step.id}>
        <strong className="rb-guide-piece">{step.title}</strong>
        <p>{step.why}</p>
        <ul className="rb-program-learn" aria-label="Ideas nuevas">{step.learn.map(l => <li key={l}>{l}</li>)}</ul>
        <pre className="rb-program-code" aria-label={`Código del ${step.title}`} tabIndex={0}>{step.source.split('\n').map((l, i) => <span key={i} className={lines[i] ? 'is-new' : undefined}>{l || ' '}</span>)}</pre>
        <p className="rb-guide-caption">Las líneas con fondo verde son nuevas en este paso.</p>
        <p><b>Qué debes ver:</b> {step.see}</p>
        <div className="rb-guide-actions">
          <button type="button" onClick={() => { onPut(step); setPicked(index); }} disabled={!stepHex(step)}>{here ? 'Código puesto ✓' : 'Poner este código en mi programa'}</button>
          <button type="button" aria-pressed={ghostOn} onClick={() => setGhostOn(v => !v)}>{ghostOn ? 'Quitar el espectro del editor' : 'Escribirlo yo, con espectro'}</button>
          <button type="button" onClick={test}>Probar este paso</button>
          <button type="button" onClick={() => void copy()} aria-label="Copiar el código de este paso"><Copy size={14} /> Copiar código</button>
        </div>
        {copied && <p className="rb-guide-caption" role="status">{copied}</p>}
        {report && 'reason' in report && <p className="rb-warn" role="status" ref={el => { el?.scrollIntoView({block: 'nearest'}); }}><CircleAlert size={14} /><span>{report.reason}</span></p>}
        {report && 'reports' in report && <div className="rb-program-report" role="status" data-ok={report.ok} ref={el => { el?.scrollIntoView({block: 'nearest'}); }}>
          <b>{report.ok ? <><Check size={14} /> ¡Paso superado!</> : <><CircleAlert size={14} /> Todavía no</>}</b>
          {report.reports.map(r => <div key={r.scenario} className="rb-program-scenario" data-ok={r.ok}><small>Probado {r.scenario}</small>
            {r.message && <p className="rb-warn"><CircleAlert size={14} /><span>{r.message}</span></p>}
            <ul>{r.lines.map((l, i) => <li key={i} data-ok={l.ok}><span aria-hidden="true">{l.ok ? '✓' : '✗'}</span> {l.text}</li>)}</ul></div>)}
          {report.ok && index < guide.steps.length - 1 && <button type="button" onClick={() => setPicked(index + 1)}>Siguiente paso</button>}
          {report.ok && index === guide.steps.length - 1 && <p>Programa completo. Pasa a <b>Simular</b> y pulsa ▶ para ver al robot en acción.</p>}
        </div>}
      </div>
    </>}
  </section></FloatingWindow>;
}
