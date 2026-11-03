const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const {buildTemplate} = await import('../src/robotics/project/templates.ts');
  const robot = buildTemplate('robot-oruga-recoger');
  const project = {...robot, workspace: {...robot.workspace, mode: 'build'}};
  const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
  const ctx = await browser.newContext({viewport: {width: 1280, height: 800}});
  await ctx.addInitScript(l => { localStorage.setItem('modo-robotica-v1', JSON.stringify(l)); localStorage.setItem('modo-tutoriales-bienvenida-v1', 'seen'); sessionStorage.setItem('modo-opened-v2', '1'); }, {projects: [project], active: project.id});
  const p = await ctx.newPage();
  await p.goto('http://localhost:4326/robotica/?debug=1'); await p.locator('.rb-app[data-ready=true]').waitFor();
  await p.waitForFunction(n => window.__modoRobotics?.partIds?.().length >= n, robot.parts.length, {timeout: 25000}); await p.waitForTimeout(1000);
  for (const part of robot.parts) { if (/hombro|Brazo izq|codo izq|Antebrazo izq|Pinza izq|torso|chasis/i.test(part.label || '') || ['robot-torso'].includes(part.definitionId)) console.log(part.label, part.definitionId, JSON.stringify((await p.evaluate(id => window.__modoRobotics.partWorld(id), part.instanceId) || []).map(v => +(v*1000).toFixed(0)))); }
  await browser.close();
})();
