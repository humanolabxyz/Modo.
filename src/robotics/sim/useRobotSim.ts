import {startTransition, useCallback, useEffect, useRef, useState} from 'react';
import type {SimModel, Snapshot} from './coordinator.ts';
import type {FromWorker, ToWorker} from './protocol.ts';

export type SimStatus = 'stopped' | 'running' | 'paused';
const SERIAL_LIMIT = 20000;
const STARTUP_TIMEOUT = 30000;

/** Ciclo de vida de la simulación: un worker por ejecución. Detener = `terminate()` (siempre funciona, aunque el worker esté colgado). */
export function useRobotSim() {
  const [status, setStatus] = useState<SimStatus>('stopped');
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [serial, setSerial] = useState('');
  const [ratio, setRatio] = useState(1);
  const [lag, setLag] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [message, setMessage] = useState('');
  const worker = useRef<Worker | null>(null), beat = useRef(0), speedRef = useRef(1);
  const frame = useRef(0), loadingSince = useRef<number | null>(null);

  const send = (m: ToWorker) => worker.current?.postMessage(m);
  const kill = useCallback((why?: string) => {
    worker.current?.terminate(); worker.current = null; loadingSince.current = null;
    cancelAnimationFrame(frame.current); frame.current = 0;
    setStatus('stopped'); setSnapshot(null); setRatio(1); setLag(false);
    if (why) setMessage(why);
  }, []);

  const start = useCallback((model: SimModel) => {
    kill();
    setSerial(''); setMessage('');
    let w: Worker;
    try { w = new Worker(new URL('./sim.worker.ts', import.meta.url), {type: 'module'}); }
    catch { kill('No se pudo abrir el motor de simulación. Recarga Robótica y vuelve a intentarlo.'); return; }
    worker.current = w;
    loadingSince.current = beat.current = Date.now();
    let pending: Extract<FromWorker, {t: 'snapshot'}> | null = null, serialBuffer = '';
    w.onmessage = (e: MessageEvent<FromWorker>) => {
      if (worker.current !== w) return;
      beat.current = Date.now();
      const m = e.data;
      if (m.t === 'snapshot') {
        // A slow graphics frame must not queue a React render for every worker message.
        // Keep the latest pose, but preserve all serial text (within the console limit).
        pending = m;
        serialBuffer = (serialBuffer + (m.snapshot.serial || '')).slice(-SERIAL_LIMIT);
        if (!frame.current) frame.current = requestAnimationFrame(() => {
          frame.current = 0;
          const next = pending, chunk = serialBuffer; pending = null; serialBuffer = '';
          if (!next || worker.current !== w) return;
          startTransition(() => {
            setSnapshot({...next.snapshot, serial: chunk}); setRatio(next.ratio); setLag(next.lag);
            if (chunk) setSerial(s => (s + chunk).slice(-SERIAL_LIMIT));
          });
        });
        if (m.snapshot.status === 'error') kill(m.snapshot.message ?? 'El programa dejó de responder.');
      } else if (m.t === 'loaded') {
        loadingSince.current = null;
        if (m.status === 'error') kill(m.message ?? 'No se pudo cargar el programa.');
        else if (m.message) setMessage(m.message);
      }
      else if (m.t === 'error') kill(`La simulación falló: ${m.message}`);
    };
    w.onerror = e => { if (worker.current === w) kill(`La simulación falló: ${e.message || 'error del worker'}`); };
    w.onmessageerror = () => { if (worker.current === w) kill('No se pudieron leer los datos de la simulación. Vuelve a ejecutarla.'); };
    try {
      w.postMessage({t: 'load', model} satisfies ToWorker);
      w.postMessage({t: 'speed', factor: speedRef.current} satisfies ToWorker);
      w.postMessage({t: 'visibility', visible: !document.hidden} satisfies ToWorker);
      w.postMessage({t: 'start'} satisfies ToWorker);
    } catch { kill('No se pudieron enviar los datos del proyecto al simulador.'); return; }
    setStatus('running');
  }, [kill]);

  useEffect(() => {
    const syncVisibility = () => {
      beat.current = Date.now();
      if (loadingSince.current !== null) loadingSince.current = beat.current;
      worker.current?.postMessage({t: 'visibility', visible: !document.hidden} satisfies ToWorker);
    };
    document.addEventListener('visibilitychange', syncVisibility);
    return () => document.removeEventListener('visibilitychange', syncVisibility);
  }, []);
  useEffect(() => {
    if (status === 'stopped') return;
    let n = 0;
    const timer = setInterval(() => {
      if (document.hidden) return;
      const now = Date.now();
      if (loadingSince.current !== null) {
        if (now - loadingSince.current > STARTUP_TIMEOUT) kill('El motor tardó demasiado en cargar. Revisa la conexión y vuelve a ejecutar.');
        return;
      }
      if (status !== 'running') return;
      send({t: 'ping', n: ++n});
      if (now - beat.current > 4000) kill('La simulación dejó de responder. Pulsa Ejecutar para volver a intentarlo.');
    }, 1000);
    return () => clearInterval(timer);
  }, [status, kill]);
  useEffect(() => () => { worker.current?.terminate(); cancelAnimationFrame(frame.current); }, []);

  return {
    status, snapshot, serial, ratio, lag, speed, message,
    start,
    pause: () => { send({t: 'pause'}); setStatus('paused'); },
    resume: () => { beat.current = Date.now(); send({t: 'start'}); setStatus('running'); },
    stop: (why?: string) => kill(why),
    setSpeed: (factor: number) => { speedRef.current = factor; setSpeedState(factor); send({t: 'speed', factor}); },
    setControl: (id: string, value: number) => send({t: 'control', id, value}),
    clearSerial: () => setSerial(''),
    setMessage,
  };
}
export type RobotSim = ReturnType<typeof useRobotSim>;
