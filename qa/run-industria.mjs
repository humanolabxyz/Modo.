// Ejecuta TODAS las pruebas de Industria en orden y resume el resultado: tipos, build, pruebas de modelo en Node y pruebas de interfaz con ratón real
// sobre el build de producción (con su CSP). Uso: npm run verify:industria [-- --no-build] [-- --port 4399] [-- --only ui|node]
import {spawn, spawnSync} from 'node:child_process';

const args = process.argv.slice(2), flag = name => args.includes(name), value = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const port = Number(value('--port', 4399)), only = value('--only', ''), url = `http://127.0.0.1:${port}`;
const NODE = ['model', 'build', 'catalog', 'wiring', 'sim', 'plc', 'diagram', 'faults', 'docs', 'activities', 'hardening', 'models', 'routing', 'flex', 'factory', 'hall', 'process', 'sound', 'perf'];
const UI = ['shell', 'builder', 'catalog-ui', 'wiring-ui', 'sim-ui', 'views-ui', 'docs-ui', 'modes-ui', 'polish-ui', 'extras-ui', 'responsive', 'a11y', 'touch', 'offline', 'resilience'];
const shell = process.platform === 'win32';
const results = [];

const run = (name, cmd, cmdArgs, env = {}) => new Promise(resolve => {
  const t0 = Date.now(), child = spawn(cmd, cmdArgs, {env: {...process.env, ...env}, shell: cmd.endsWith('.cmd'), stdio: ['ignore', 'pipe', 'pipe']});
  let out = ''; child.stdout.on('data', d => { out += d; }); child.stderr.on('data', d => { out += d; });
  child.on('close', code => { const passes = (out.match(/^PASS/gm) ?? []).length, blocks = out.match(/(\d+) bloques OK/); results.push({name, ok: code === 0, passes: blocks ? Number(blocks[1]) : passes, ms: Date.now() - t0, out}); resolve(code === 0); });
});

const waitFor = async () => { for (let i = 0; i < 60; i++) { try { if ((await fetch(url + '/industria/')).ok) return true; } catch { /* aún no */ } await new Promise(r => setTimeout(r, 500)); } return false; };

(async () => {
  console.log('Industria · pruebas completas');
  await run('tipos (tsc)', 'npx.cmd', ['tsc', '--noEmit']);
  if (!flag('--no-build')) await run('build de producción', 'npm.cmd', ['run', 'build']);
  if (only !== 'ui') for (const n of NODE) { const file = `qa/verify-industria-${n}.mjs`; try { (await import('node:fs')).accessSync(file); } catch { continue; } await run(`modelo · ${n}`, process.execPath, [file]); }
  if (only !== 'node') {
    const server = spawn('npm.cmd', ['run', 'preview', '--', '--port', String(port)], {stdio: 'ignore', shell});
    try {
      if (!(await waitFor())) results.push({name: 'servidor de vista previa', ok: false, passes: 0, ms: 0, out: 'No arrancó el servidor.'});
      else for (const n of UI) { const file = `qa/verify-industria-${n}.cjs`; try { (await import('node:fs')).accessSync(file); } catch { continue; } await run(`interfaz · ${n}`, process.execPath, [file], {INDUSTRIA_URL: url}); }
    } finally { spawnSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], {stdio: 'ignore'}); }
  }
  console.log('');
  for (const r of results) console.log(`${r.ok ? 'OK  ' : 'FALLA'}  ${r.name.padEnd(28)} ${String(r.passes).padStart(3)} comprobaciones  ${(r.ms / 1000).toFixed(1)} s`);
  const failed = results.filter(r => !r.ok);
  for (const r of failed) console.log(`\n--- ${r.name} ---\n${r.out.split('\n').filter(l => !/^\s+at /.test(l)).slice(-25).join('\n')}`);
  console.log(`\n${failed.length === 0 ? 'TODO EN VERDE' : `${failed.length} con fallas`}: ${results.length - failed.length}/${results.length} grupos, ${results.reduce((s, r) => s + r.passes, 0)} comprobaciones.`);
  process.exitCode = failed.length ? 1 : 0;
})();
