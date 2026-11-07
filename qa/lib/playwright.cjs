// Carga Playwright de forma portable: primero el paquete instalado en el proyecto, luego PLAYWRIGHT_MODULE y, por último, el del entorno de Codex.
// (No se añadió como dependencia del proyecto: ver docs/industria/CIERRE.md.)
const candidates = ['playwright', process.env.PLAYWRIGHT_MODULE, 'C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'].filter(Boolean);
let lastError;
for (const id of candidates) { try { module.exports = require(id); lastError = null; break; } catch (e) { lastError = e; } }
if (lastError) throw new Error('No se encontró Playwright. Instálalo (npm i -D playwright) o define PLAYWRIGHT_MODULE con su ruta. ' + lastError.message);
