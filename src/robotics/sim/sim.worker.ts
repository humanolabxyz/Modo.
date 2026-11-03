// Worker de la simulación: aquí corre el emulador, así que un sketch sin `delay` (o con `while(1)`) jamás congela el lienzo.
// Cada ~16 ms real avanza el reloj virtual `velocidad × tiempo real`, con un presupuesto de 12 ms de CPU por tick: si no alcanza, el
// tiempo virtual se queda atrás (se informa como `lag`) en vez de bloquear. «Detener» termina el worker desde la interfaz.
import {Coordinator, STEP_US, type SimModel} from './coordinator.ts';
import {RobotPhysics} from './physics.ts';
import type {FromWorker, ToWorker} from './protocol.ts';

const ctx = self as unknown as {postMessage(m: FromWorker): void; onmessage: ((e: {data: ToWorker}) => void) | null};
const BUDGET_MS = 12, POST_EVERY_MS = 33, MAX_DEBT_US = 100_000;

let coordinator: Coordinator | null = null;
let running = false, speed = 1, last = 0, lastPost = 0, ratio = 1, debt = 0;

function post(force = false) {
  const now = performance.now();
  if (!coordinator || (!force && now - lastPost < POST_EVERY_MS)) return;
  lastPost = now;
  ctx.postMessage({t: 'snapshot', snapshot: coordinator.snapshot(), ratio, lag: running && ratio < speed * 0.85});
}

function tick() {
  const now = performance.now(), elapsed = Math.min(now - last, 100); last = now;
  if (!running || !coordinator) return;
  let want = elapsed * 1000 * speed + debt, done = 0;
  const t0 = performance.now();
  try {
    while (want >= STEP_US && performance.now() - t0 < BUDGET_MS) { coordinator.advance(STEP_US); want -= STEP_US; done += STEP_US; }
  } catch (e) { running = false; ctx.postMessage({t: 'error', message: e instanceof Error ? e.message : String(e)}); return; }
  debt = Math.min(want, MAX_DEBT_US); // lo que no se alcanzó se arrastra, con tope: nunca se acumula una deuda imposible de pagar
  if (elapsed > 0) ratio = ratio * 0.8 + (done / (elapsed * 1000)) * 0.2;
  post();
}

/** Rapier se descarga solo cuando hace falta (pesa ~1,6 MB comprimido): al ejecutar con física o al precalentar. */
const loadRapier = () => import('@dimforge/rapier3d-compat').then(m => m.default);

async function load(model: SimModel) {
  try {
    let physics: RobotPhysics | undefined, note: string | undefined;
    if (model.physics) {
      try { const R = await loadRapier(); await R.init(); physics = RobotPhysics.create(R, model.project); if (physics.notes.length) note = physics.notes.join(' '); }
      catch (e) { note = `No se pudo cargar la física: ${e instanceof Error ? e.message : String(e)}. Se ejecuta solo el programa y el circuito.`; }
    }
    coordinator = new Coordinator(model, physics); debt = 0; ratio = speed; last = performance.now(); // «start» puede haber llegado antes de terminar la carga: no se pisa
    const snap = coordinator.snapshot();
    ctx.postMessage({t: 'loaded', status: snap.status, message: snap.message ?? note}); post(true);
  } catch (e) { ctx.postMessage({t: 'error', message: e instanceof Error ? e.message : String(e)}); }
}

ctx.onmessage = ({data}) => {
  if (data.t === 'load') void load(data.model as SimModel);
  else if (data.t === 'start') { running = true; last = performance.now(); }
  else if (data.t === 'pause') { running = false; post(true); }
  else if (data.t === 'speed') speed = Math.max(0.1, Math.min(8, data.factor));
  else if (data.t === 'control') coordinator?.setControl(data.id, data.value);
  else if (data.t === 'ping') ctx.postMessage({t: 'pong', n: data.n});
  else if (data.t === 'warm') void loadRapier().then(() => ctx.postMessage({t: 'warmed'}), () => ctx.postMessage({t: 'warmed'}));
};
setInterval(tick, 16);
ctx.postMessage({t: 'ready'});
