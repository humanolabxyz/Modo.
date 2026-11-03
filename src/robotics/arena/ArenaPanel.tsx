import {useEffect, useMemo, useRef, useState} from 'react';
import {buildTemplate, TEMPLATE_WEDGE, TEMPLATE_SCOOP, TEMPLATE_PUSHER, TEMPLATE_SUMO, TEMPLATE_ROVER_4WD, TEMPLATE_READY_ROBOT} from '../project/templates.ts';
import type {RobotProject} from '../project/types.ts';
import {ARENA_RADIUS, arenaEligibility, prepareArena, type ArenaFrame} from './model.ts';
import type {ArenaInput, ArenaOutput} from './protocol.ts';
import {ArenaStage} from './ArenaStage';
import {useArenaAudio} from './useArenaAudio';
import '../../styles/robotics-arena.css';

type Props = {projects: RobotProject[]; onClose(): void; onEdit(id: string, template: boolean): void};
type Status = 'ready' | 'loading' | 'running' | 'paused' | 'finished' | 'error';
const LABELS = ['Azul', 'Naranja'];

export default function ArenaPanel({projects, onClose, onEdit}: Props) {
  const builtin = useMemo(() => [TEMPLATE_WEDGE, TEMPLATE_SCOOP, TEMPLATE_PUSHER, TEMPLATE_SUMO, TEMPLATE_ROVER_4WD, TEMPLATE_READY_ROBOT].map(id => ({id: `template:${id}`, template: id, project: buildTemplate(id)!})), []);
  const choices = useMemo(() => [...projects.map(project => ({id: project.id, template: '', project})), ...builtin], [projects, builtin]);
  const [ids, setIds] = useState<[string, string]>([`template:${TEMPLATE_WEDGE}`, `template:${TEMPLATE_SCOOP}`]);
  const selected = ids.map(id => choices.find(x => x.id === id)!);
  const a = selected[0]?.project, b = selected[1]?.project;
  const info = [a, b].map(p => p ? arenaEligibility(p) : {error: 'Elige un robot.', mass: 0});
  const prepared = useMemo(() => {
    if (!a || !b || arenaEligibility(a).error || arenaEligibility(b).error) return null;
    return prepareArena(a, b);
  }, [a, b]);
  const [duration, setDuration] = useState(60);
  const [status, setStatus] = useState<Status>('ready');
  const [frame, setFrame] = useState<ArenaFrame | null>(null);
  const [error, setError] = useState('');
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [ratio, setRatio] = useState(1);
  const [reduced,setReduced]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [automatic,setAutomatic]=useState(true);
  const audio=useArenaAudio(frame,status);
  const worker = useRef<Worker | null>(null), layout = useRef<HTMLDivElement>(null), finished = useRef(false), beat = useRef(0);
  const busy = status === 'loading' || status === 'running' || status === 'paused';
  const statusRef = useRef(status); statusRef.current = status;
  useEffect(() => {
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)'),motionChanged=()=>setReduced(motion.matches);
    motion.addEventListener('change',motionChanged);
    const hidden = () => { if (document.hidden && statusRef.current === 'running') {worker.current?.postMessage({t: 'pause'} satisfies ArenaInput); setStatus('paused');} };
    document.addEventListener('visibilitychange', hidden);
    const timer = setInterval(() => {
      if ((statusRef.current === 'running' || statusRef.current === 'loading') && Date.now() - beat.current > 15000) {
        worker.current?.terminate(); worker.current = null; setError('La simulación no responde. Puedes reiniciar la ronda.'); setStatus('error');
      }
    }, 1000);
    return () => {worker.current?.terminate(); clearInterval(timer); document.removeEventListener('visibilitychange', hidden); motion.removeEventListener('change',motionChanged);};
  }, []);
  function stop() {
    worker.current?.terminate(); worker.current = null; setStatus('ready'); setFrame(null); setError('');
  }
  function start() {
    if (!a || !b || !prepared) return;
    worker.current?.terminate(); finished.current = false;
    setError(''); setFrame(null); setRatio(1); setStatus('loading'); beat.current = Date.now();
    layout.current?.scrollTo({top:0});
    const w = new Worker(new URL('./arena.worker.ts', import.meta.url), {type: 'module'}); worker.current = w;
    w.onmessage = ({data}: MessageEvent<ArenaOutput>) => {
      beat.current = Date.now();
      if (data.t === 'error') {setError(data.message); setStatus('error'); w.terminate(); return;}
      setFrame(data.frame); setRatio(data.ratio);
      if (data.frame.result) {
        setStatus('finished');
        if (!finished.current) {
          finished.current = true;
          const winner = data.frame.result.winner;
          if (winner !== null) setScore(s => winner === 0 ? [s[0] + 1, s[1]] : [s[0], s[1] + 1]);
        }
      } else setStatus(s => s === 'paused' ? s : 'running');
    };
    w.onerror = e => {setError(e.message || 'No se pudo abrir la simulación.'); setStatus('error'); w.terminate();};
    w.postMessage({t: 'load', a, b, duration} satisfies ArenaInput);
  }
  const result = frame?.result;
  const impact=frame?.physics.impacts?.at(-1);
  const margins=LABELS.map((_,i)=>{const id=prepared?.roots[i],p=id?frame?.physics.poses[id]?.p:undefined;return Math.max(0,Math.round((1-(p?Math.hypot(p[0],p[2]):.36)/ARENA_RADIUS)*100));});
  const active=status!=='ready'&&status!=='error';
  const headline = error ? 'Revisa el robot' : result ? result.winner === null ? 'Empate' : `Gana ${LABELS[result.winner]}` : status === 'loading' ? 'Preparando robots…' : status === 'paused' ? 'Ronda en pausa' : frame?.countdown ? `Comienza en ${frame.countdown}` : status === 'running' ? '¡Sumo!' : 'Construye. Prueba. Compite.';
  return <main className="rb-arena rb-arena-standalone" aria-labelledby="arena-title" data-playing={active} data-reduced={reduced}>
    <header><div><small>MODO COMBATE · ROBÓTICA</small><h2 id="arena-title">Sumo de robots</h2></div><div className="rb-arena-header-actions"><button type="button" aria-label="Sonido del combate" aria-pressed={audio.enabled} onClick={audio.toggle}>{audio.enabled?'Sonido activo':'Activar sonido'}</button><button type="button" aria-label="Volver al taller" onClick={onClose}>Volver al taller <span aria-hidden="true">↗</span></button></div></header>
    <div className="rb-arena-layout" ref={layout}>
      <section className="rb-arena-view" aria-label="Ronda de sumo" data-status={status}>
        <div className="rb-arena-score">{LABELS.map((label,i)=><div className={`rb-fighter team-${i===0?'blue':'orange'}`} key={label}><div><span>{label}</span><b>{score[i]}</b></div><strong>{selected[i]?.project.name??'Elige tu robot'}</strong><div className="rb-edge-meter" role="progressbar" aria-label={`Margen al borde ${label}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={margins[i]} data-danger={margins[i]<20}><i style={{width:`${margins[i]}%`}}/></div><small>{margins[i]<20?'¡Peligro de salida!':'Margen al borde'} · {margins[i]}%</small></div>)}<div className="rb-match-clock"><small>{frame?.countdown?'PREPÁRATE':status==='running'?'EN COMBATE':'SUMO'}</small><strong aria-label="Tiempo restante">{Math.max(0, duration - Math.floor(frame?.elapsed ?? 0))}<span>s</span></strong><div><i style={{width:`${Math.max(0,1-(frame?.elapsed??0)/duration)*100}%`}}/></div></div></div>
        <ArenaStage prepared={prepared} frame={frame} status={status} automatic={automatic} reduced={reduced}/>
        <div className="rb-arena-cameras"><button type="button" aria-label="Cámara automática" aria-pressed={automatic&&!reduced} disabled={reduced} onClick={()=>setAutomatic(v=>!v)}>{automatic&&!reduced?'Cámara de combate':'Cámara libre'}</button><button type="button" aria-label="Reducir movimiento" aria-pressed={reduced} onClick={()=>setReduced(v=>!v)}>{reduced?'Movimiento reducido':'Animaciones activas'}</button><span>Impactos <strong aria-label="Impactos registrados">{impact?.sequence??0}</strong></span></div>
        {status==='ready'&&<div className="rb-arena-versus" aria-hidden="true"><span>AZUL</span><strong>VS</strong><span>NARANJA</span></div>}
        {status==='running'&&!!frame?.countdown&&<div className="rb-arena-countdown" key={frame.countdown}><span>PREPÁRATE</span><strong>{frame.countdown}</strong></div>}
        {status==='running'&&frame?.countdown===0&&frame.elapsed<.9&&<div className="rb-arena-go">¡A COMBATIR!</div>}
        {status==='paused'&&<div className="rb-arena-pause"><span>Ⅱ</span><strong>RONDA EN PAUSA</strong></div>}
        {impact&&status==='running'&&<div key={impact.sequence} className="rb-arena-hit" aria-hidden="true">CONTACTO</div>}
        {margins.some(x=>x<20)&&status==='running'&&<div className="rb-arena-danger" aria-hidden="true"/>}
        {result&&result.winner!==null&&!reduced&&<div className="rb-confetti" aria-hidden="true">{Array.from({length:32},(_,i)=><i key={i} style={{left:`${(i*37)%100}%`,animationDelay:`${(i%8)*.09}s`,background:i%2?'#4c9bff':'#ffb84d',rotate:`${i*47}deg`}}/>)}</div>}
        <div className="rb-arena-result" data-finished={!!result} role="status">{result&&<span className="rb-arena-medal" aria-hidden="true">{result.winner===null?'＝':'★'}</span>}<strong>{headline}</strong><span>{result ? result.reason : status==='ready'?'Elige tus robots y entra a la arena':status==='running'?'Dos programas. Un solo ring.':status==='paused'?'La simulación está detenida':'Preparando los dos programas'}</span></div>
      </section>
      <section className="rb-arena-settings" aria-label="Preparar combate">
        <p>Elige dos construcciones. Cada una conserva sus piezas, cableado y programa Arduino.</p>
        {active&&<div className="rb-arena-live-brief"><span className="rb-live-label">{status==='finished'?'RESULTADO DE LA RONDA':status==='paused'?'COMBATE EN PAUSA':'PROGRAMAS EN EJECUCIÓN'}</span><h3>{status==='finished'?'Buen combate.':'Empuja. Resiste. Gana.'}</h3><p>Saca al rival del círculo. Cada robot se mueve según su construcción, su circuito y su programa.</p>{LABELS.map((label,i)=><div className={`rb-live-robot team-${i===0?'blue':'orange'}`} key={label}><span>{label}</span><strong>{selected[i]?.project.name}</strong><small>{(info[i].mass*1000).toFixed(0)} g · {frame?.physics.wheels.filter(w=>w.motorId.startsWith(`${i}/`)).length??0} ruedas motrices</small></div>)}<div className="rb-live-events"><span>CONTACTOS REGISTRADOS</span><strong>{impact?.sequence??0}</strong><small>Detectados por la física del ring</small></div></div>}
        {LABELS.map((label, i) => <fieldset key={label} disabled={busy} className={i === 0 ? 'team-blue' : 'team-orange'}>
          <legend>Robot {label}</legend>
          <select aria-label={`Robot ${label}`} value={ids[i]} onChange={e => {const value = e.target.value; stop(); setScore([0, 0]); setIds(v => i === 0 ? [value, v[1]] : [v[0], value]);}}>
            <optgroup label="Mis construcciones">{choices.filter(c => !c.template).map(c => <option key={c.id} value={c.id}>{c.project.name}</option>)}</optgroup>
            <optgroup label="Robots de ejemplo">{builtin.map(c => <option key={c.id} value={c.id}>{c.project.name}</option>)}</optgroup>
          </select>
          <small>{selected[i]?.project.parts.length ?? 0} piezas · {(info[i].mass * 1000).toFixed(0)} g de catálogo</small>
          {info[i].error && <span className="rb-arena-issue">{info[i].error}</span>}
          <button type="button" disabled={!selected[i]} onClick={() => {const choice = selected[i]; if (choice) onEdit(choice.template || choice.id, !!choice.template);}}>{selected[i]?.template ? 'Construir mi versión' : 'Editar construcción'}</button>
        </fieldset>)}
        <label className="rb-arena-duration">Duración<select aria-label="Duración de ronda" disabled={busy} value={duration} onChange={e => {stop(); setDuration(Number(e.target.value));}}><option value={30}>30 segundos</option><option value={60}>60 segundos</option><option value={90}>90 segundos</option></select></label>
        <div className="rb-arena-actions">
          {status === 'running' || status === 'paused' ? <button type="button" className="rb-arena-primary" onClick={() => {const resume = status === 'paused'; worker.current?.postMessage({t: resume ? 'resume' : 'pause'} satisfies ArenaInput); beat.current = Date.now(); setStatus(resume ? 'running' : 'paused');}}>{status === 'paused' ? 'Continuar ronda' : 'Pausar ronda'}</button> : <button type="button" className="rb-arena-primary" disabled={!prepared || status === 'loading'} onClick={start}>{status === 'finished' ? 'Revancha' : status === 'loading' ? 'Cargando…' : 'Iniciar combate'}</button>}
          {busy && <button type="button" onClick={stop}>Cancelar ronda</button>}
          {status==='finished'&&<button type="button" onClick={stop}>Preparar otro duelo</button>}
        </div>
        {error && <p className="rb-arena-issue" role="alert">{error}</p>}
        {status === 'running' && ratio < 0.75 && <p role="status">El dispositivo avanza más lento. El tiempo de la ronda sigue el reloj de la simulación.</p>}
        <details><summary>Reglas de esta arena</summary><p>Círculo de 1,50 m con borde negro. Pierde quien mantiene el centro de su chasis fuera del círculo, o cae por debajo de él, durante 0,15 s. Salida simultánea o fin del tiempo: empate.</p><p>Contacto, masa y tracción se calculan con el modelo didáctico existente. No hay daño ni piezas desprendidas en esta fase. Marcador de esta sesión.</p></details>
        <p className="rb-arena-footnote">Para competir con un compañero: importa su archivo .modo.json en Mis proyectos y selecciónalo aquí.</p>
      </section>
    </div>
  </main>;
}
