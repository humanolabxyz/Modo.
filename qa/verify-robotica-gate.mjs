// Prueba la contraseña de la Beta de Robótica (middleware.ts) sin Vercel: llama a la función con Request reales.
import assert from 'node:assert/strict';
const {default: mw, config} = await import('../middleware.ts');
const url = 'https://ejemplo.test/robotica/', clave = 'clave-de-prueba';
assert.deepEqual(config.matcher, ['/robotica', '/robotica/:path*']);
delete process.env.ROBOTICA_BETA_PASSWORD;
assert.equal((await mw(new Request(url))).status, 503, 'sin variable de entorno la ruta se cierra');
process.env.ROBOTICA_BETA_PASSWORD = clave;
const sin = await mw(new Request(url)); assert.equal(sin.status, 401); assert.match(await sin.text(), /type="password"/);
const form = v => { const f = new FormData(); f.set('clave', v); return new Request(url, {method: 'POST', body: f}); };
assert.equal((await mw(form('otra'))).status, 401, 'clave incorrecta');
const ok = await mw(form(clave)); assert.equal(ok.status, 303);
const cookie = ok.headers.get('set-cookie'); assert.match(cookie, /HttpOnly/); assert.match(cookie, /Secure/); assert.ok(!cookie.includes(clave), 'la cookie no contiene la clave');
const pasa = await mw(new Request(url, {headers: {cookie: cookie.split(';')[0]}})); assert.equal(pasa.headers.get('x-middleware-next'), '1', 'con la cookie continúa a la página');
assert.equal((await mw(new Request(url, {headers: {cookie: 'modo-beta=falsa'}}))).status, 401, 'cookie falsa');
console.log('PASS contraseña de la Beta: cierra sin configurar, rechaza clave/cookie falsas, entra con la correcta y no guarda la clave en la cookie');
