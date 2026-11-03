// Captura de cerca del robot de orugas (brazos) para revisar su aspecto. Uso: PANELLAB_URL=http://localhost:4326 node qa/capture-robotics-arms.cjs
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = (process.env.PANELLAB_URL || 'http://localhost:4326').replace(/\/$/, ''), out = 'qa/robotics';
(async () => {
  const {buildTemplate} = await import('../src/robotics/project/templates.ts');
  const robot = buildTemplate('robot-oruga-recoger');
  const project = {...robot, workspace: {...robot.workspace, mode: (process.env.MODE || 'build')}};
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
  await ctx.addInitScript(l => { localStorage.setItem('modo-robotica-v1', JSON.stringify(l)); localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); }, {projects: [project], active: project.id});
  const p = await ctx.newPage();
  await p.goto(base + '/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor();
  await p.waitForFunction(n => window.__modoRobotics?.partIds?.().length >= n, robot.parts.length, {timeout: 25000}); await p.waitForTimeout(1200);
  const c = await p.evaluate(() => window.__modoRobotics.camera());
  console.log('camera', JSON.stringify(c));
  await p.mouse.move(Number(process.env.MX||640), Number(process.env.MY||400));
  for (let i = 0; i < Number(process.env.ZOOM || 0); i++) { await p.mouse.wheel(0, -400); await p.waitForTimeout(150); }
  await p.waitForTimeout(800);
  if (process.env.PLAY) { await p.mouse.click(660, 26); await p.waitForTimeout(Number(process.env.PLAY)); }
  await p.screenshot({path: `${out}/brazos-nuevos.png`});
  await browser.close();
})();
