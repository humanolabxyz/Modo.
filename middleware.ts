// Contraseña de la Beta de Robótica (solo Vercel). Protege /robotica/ y /robotica/*; el resto del sitio queda público.
// La clave NO está en el repositorio: se define en la variable de entorno ROBOTICA_BETA_PASSWORD. Sin ella la ruta se cierra (503).
// Límite conocido: los archivos con hash de /_astro/ que usa Robótica no se protegen (no contienen datos, y no se pueden abrir sin la página).
import {next} from '@vercel/functions';
declare const process: {env: {ROBOTICA_BETA_PASSWORD?: string}};

export const config = {matcher: ['/robotica', '/robotica/:path*', '/arena', '/arena/:path*']};

const COOKIE = 'modo-beta';
const MAX_AGE = 60 * 60 * 24 * 30;

async function token(password: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`modo-beta-v1:${password}`));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const page = (message: string, status: number) => new Response(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>modo. Robótica (Beta)</title>
<style>:root{color-scheme:light dark}body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.5 system-ui,sans-serif;background:#fafbfe;color:#111115}@media(prefers-color-scheme:dark){body{background:#111115;color:#f3f4f8}}
main{width:min(360px,calc(100vw - 32px));padding:28px;border-radius:24px;background:#fff;box-shadow:0 12px 40px #11111526}@media(prefers-color-scheme:dark){main{background:#1b1b22}}
h1{margin:0 0 4px;font-size:22px}p{margin:0 0 16px;color:#6b6f80}input,button{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:12px;font:inherit}input{border:1px solid #c8cbd8;background:transparent;color:inherit;margin-bottom:12px}button{border:0;background:#111115;color:#fff;font-weight:700;cursor:pointer}@media(prefers-color-scheme:dark){button{background:#fff;color:#111115}}.err{color:#c0392b;margin:-4px 0 12px;font-size:14px}</style></head>
<body><main><h1>Robótica <small>Beta</small></h1><p>Este modo está en prueba. Ingresa la contraseña para continuar.</p>${message ? `<p class="err" role="alert">${message}</p>` : ''}
<form method="post"><input type="password" name="clave" autocomplete="current-password" aria-label="Contraseña" placeholder="Contraseña" autofocus required><button type="submit">Entrar</button></form><p style="margin:16px 0 0"><a href="/">Volver al inicio</a></p></main></body></html>`, {
  status,
  headers: {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow'},
});

export default async function middleware(request: Request) {
  const password = process.env.ROBOTICA_BETA_PASSWORD;
  if (!password) return page('La Beta todavía no está configurada.', 503);
  const expected = await token(password);
  const cookies = request.headers.get('cookie') ?? '';
  const current = cookies.split(/;\s*/).find(c => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1) ?? '';
  if (same(current, expected)) return next();

  if (request.method === 'POST') {
    const sent = String((await request.formData().catch(() => null))?.get('clave') ?? '');
    if (same(await token(sent), expected)) {
      return new Response(null, {
        status: 303,
        headers: {location: new URL(request.url).pathname, 'cache-control': 'no-store', 'set-cookie': `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`},
      });
    }
    return page('Contraseña incorrecta.', 401);
  }
  return page('', 401);
}
