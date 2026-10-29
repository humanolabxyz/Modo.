/* Aviso de versión nueva. La app se sirve desde la caché del service worker, así que quien ya la tenía abierta sigue con el código
   anterior hasta recargar. El aviso aparece en dos tiempos, solo para quien tenía una versión anterior (con service worker previo):
   1) apenas el navegador detecta la versión nueva: «Descargándola…», sin botones (todavía no se puede usar);
   2) cuando el service worker nuevo toma el control: «Actualizar ahora» o «Después».
   Quien entra por primera vez no tiene service worker previo y no ve nada. */
const hadController = typeof navigator !== 'undefined' && 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
const CHECK_EVERY_MS = 60 * 60 * 1000;
const STYLE_ID = 'modo-update-style';

const CSS = `
.modo-update{position:fixed;left:50%;top:max(12px,env(safe-area-inset-top));transform:translateX(-50%);z-index:2147483000;display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:center;
 box-sizing:border-box;width:max-content;max-width:min(560px,calc(100vw - 24px));padding:12px 14px 12px 16px;border-radius:16px;background:#14201d;color:#f3f8f6;
 font:500 14px/1.35 system-ui,-apple-system,'Segoe UI',sans-serif;box-shadow:0 10px 30px #0000003d,0 0 0 1px #ffffff1f}
.modo-update p{margin:0;flex:1 1 220px}.modo-update strong{display:block;font-weight:700}.modo-update span{color:#c5d6d0;font-size:13px}
.modo-update div{display:flex;gap:8px}
.modo-update button{min-height:40px;padding:8px 14px;border:0;border-radius:11px;font:inherit;font-weight:700;cursor:pointer}
.modo-update .modo-update-go{background:#ffd60a;color:#2b2300}.modo-update .modo-update-later{background:transparent;color:#dfeae6;box-shadow:inset 0 0 0 1px #ffffff40}
.modo-update button:focus-visible{outline:3px solid #fff;outline-offset:2px}
.modo-update .modo-update-spin{flex:none;width:18px;height:18px;border-radius:50%;border:2.5px solid #ffffff40;border-top-color:#ffd60a;animation:modo-update-spin .9s linear infinite}
@keyframes modo-update-spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.modo-update .modo-update-spin{animation:none;border-top-color:#ffffff40;border-right-color:#ffd60a}}`;

type Stage = 'downloading' | 'ready';
let box: HTMLDivElement | null = null;
let stage: Stage | null = null;
let dismissed = false;

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.append(style);
}

function hideNotice() {
  box?.remove();
  box = null;
  stage = null;
}

function showUpdateNotice(next: Stage) {
  if (next === stage || (dismissed && next === 'ready') || !document.body) return;
  if (stage === 'ready') return;
  ensureStyle();
  if (!box) {
    box = document.createElement('div');
    box.className = 'modo-update';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    document.body.append(box);
  }
  stage = next;
  const current = box;
  current.replaceChildren();
  const text = document.createElement('p');
  const title = document.createElement('strong');
  title.textContent = 'Hay una versión nueva de modo.';
  const detail = document.createElement('span');
  if (next === 'downloading') {
    detail.textContent = 'Descargándola ahora. En unos segundos podrás actualizar.';
    const spin = document.createElement('i');
    spin.className = 'modo-update-spin';
    spin.setAttribute('aria-hidden', 'true');
    text.append(title, detail);
    current.append(spin, text);
    return;
  }
  detail.textContent = 'Actualiza la página para usarla. Si estás a mitad de algo, elige «Después».';
  text.append(title, detail);
  const actions = document.createElement('div');
  const go = document.createElement('button');
  go.type = 'button';
  go.className = 'modo-update-go';
  go.textContent = 'Actualizar ahora';
  go.addEventListener('click', () => location.reload());
  const later = document.createElement('button');
  later.type = 'button';
  later.className = 'modo-update-later';
  later.textContent = 'Después';
  later.addEventListener('click', () => { dismissed = true; hideNotice(); });
  actions.append(go, later);
  current.append(text, actions);
}

/** Vigila el service worker: avisa solo si esta página es de una versión anterior a la que se está instalando. */
export function watchForUpdate(registration: ServiceWorkerRegistration) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) showUpdateNotice('ready');
  });
  // Apenas se detecta la versión nueva (empieza a descargarse) se avisa; si la descarga falla, el aviso se retira.
  const track = (worker: ServiceWorker | null) => {
    if (!worker || !hadController) return;
    showUpdateNotice('downloading');
    worker.addEventListener('statechange', () => {
      if (worker.state === 'redundant' && stage === 'downloading') hideNotice();
    });
  };
  registration.addEventListener('updatefound', () => track(registration.installing));
  track(registration.installing);
  if (hadController && registration.waiting) showUpdateNotice('ready');
  // Se busca de inmediato al abrir, al volver a la pestaña y cada hora, sin esperar a la próxima navegación.
  const check = () => { registration.update().catch(() => {}); };
  check();
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
  window.setInterval(check, CHECK_EVERY_MS);
}
