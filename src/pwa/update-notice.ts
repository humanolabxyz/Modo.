import '../styles/install.css';

/* Aviso de versión nueva. La app se sirve desde la caché del service worker, así que quien ya la tenía abierta sigue con el código
   anterior hasta recargar. El aviso aparece en dos tiempos, solo para quien tenía una versión anterior (con service worker previo):
   1) apenas el navegador detecta la versión nueva: «Descargándola…», sin botones (todavía no se puede usar);
   2) cuando el service worker nuevo toma el control: «Actualizar ahora» o «Después».
   Quien entra por primera vez no tiene service worker previo y no ve nada. */
const hadController = typeof navigator !== 'undefined' && 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
const CHECK_EVERY_MS = 60 * 60 * 1000;
type Stage = 'downloading' | 'ready';
let box: HTMLDivElement | null = null;
let stage: Stage | null = null;
let dismissed = false;
let installing: ServiceWorker | null = null;
let progress: HTMLProgressElement | null = null;
let counter: HTMLSpanElement | null = null;

function hideNotice() {
  box?.remove();
  box = null;
  stage = null;
  progress = null;
  counter = null;
}

function showUpdateNotice(next: Stage) {
  if (next === stage || dismissed || !document.body) return;
  if (stage === 'ready') return;
  if (!box) {
    box = document.createElement('div');
    box.className = 'modo-update';
    document.body.append(box);
  }
  stage = next;
  const current = box;
  current.replaceChildren();
  progress = null;
  counter = null;
  const text = document.createElement('p');
  text.setAttribute('role', 'status');
  const title = document.createElement('strong');
  title.textContent = next === 'downloading' ? 'Descargando la actualización' : 'Actualización lista';
  const detail = document.createElement('span');
  if (next === 'downloading') {
    detail.textContent = 'Puedes seguir usando modo. Te avisaremos cuando esté lista.';
    const spin = document.createElement('i');
    spin.className = 'modo-update-spin';
    spin.setAttribute('aria-hidden', 'true');
    text.append(title, detail);
    const meter = document.createElement('div');
    meter.className = 'modo-update-meter';
    progress = document.createElement('progress');
    progress.setAttribute('aria-label', 'Archivos de la actualización');
    counter = document.createElement('span');
    counter.textContent = 'Preparando archivos…';
    meter.append(progress, counter);
    current.append(spin, text, meter);
    return;
  }
  detail.textContent = 'Actualizar vuelve a cargar modo. Guarda tu trabajo antes de continuar.';
  text.append(title, detail);
  const icon = document.createElement('span');
  icon.className = 'install-banner-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '↻';
  const actions = document.createElement('div');
  actions.className = 'install-banner-actions';
  const go = document.createElement('button');
  go.type = 'button';
  go.className = 'install-primary';
  go.textContent = 'Actualizar ahora';
  go.addEventListener('click', () => location.reload());
  const later = document.createElement('button');
  later.type = 'button';
  later.className = 'install-secondary';
  later.textContent = 'Después';
  later.addEventListener('click', () => { dismissed = true; hideNotice(); });
  actions.append(go, later);
  current.append(icon, text, actions);
}

/** Vigila el service worker: avisa solo si esta página es de una versión anterior a la que se está instalando. */
export function watchForUpdate(registration: ServiceWorkerRegistration) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) showUpdateNotice('ready');
  });
  // Apenas se detecta la versión nueva (empieza a descargarse) se avisa; si la descarga falla, el aviso se retira.
  navigator.serviceWorker.addEventListener('message', event => {
    if (!progress || !counter || event.source !== installing || event.data?.type !== 'UPDATE_PROGRESS') return;
    const {saved, total} = event.data;
    if (!Number.isInteger(saved) || !Number.isInteger(total) || total <= 0 || saved < 0 || saved > total) return;
    progress.max = total;
    progress.value = saved;
    counter.textContent = `${saved} de ${total} archivos preparados`;
  });
  const track = (worker: ServiceWorker | null) => {
    if (!worker || !hadController || worker === installing) return;
    installing = worker;
    showUpdateNotice('downloading');
    worker.addEventListener('statechange', () => {
      if (worker.state === 'redundant' && stage === 'downloading') hideNotice();
    });
  };
  registration.addEventListener('updatefound', () => track(registration.installing));
  track(registration.installing);
  if (hadController && registration.waiting) showUpdateNotice('ready');
  // Se busca de inmediato al abrir, al volver a la pestaña y cada hora, sin esperar a la próxima navegación.
  let lastCheck = -Infinity;
  const check = () => {
    if (!navigator.onLine || performance.now() - lastCheck < 60_000) return;
    lastCheck = performance.now();
    registration.update().catch(() => {});
  };
  check();
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
  window.setInterval(check, CHECK_EVERY_MS);
}
