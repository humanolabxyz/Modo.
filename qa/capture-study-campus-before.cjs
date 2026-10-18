// Captura reproducible del punto de partida respaldado, sin sobrescribir src/.
const fs = require('node:fs');
const path = require('node:path');
const { build } = require('esbuild');
const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const out = 'qa/estudio-campus';
  const app = fs.readFileSync(`${out}/before/StudyApp.tsx`, 'utf8');
  const page = fs.readFileSync(`${out}/before/estudio.astro`, 'utf8');
  const css = [...page.matchAll(/import '(\.\.\/styles\/[^']+\.css)';/g)].map(match => `import ${JSON.stringify(path.resolve('src/pages', match[1]))};`).join('\n');
  const compiled = await build({ stdin: { contents: `${app}\n${css}\nimport {createRoot} from 'react-dom/client'; createRoot(document.getElementById('root')).render(<StudyApp/>);`, resolveDir: path.resolve('src/study'), loader: 'tsx' }, jsx: 'automatic', bundle: true, write: false, outfile: `${out}/baseline.js`, external: ['/fonts/*', '/brand/*', '/estudio/*', '/images/*', '/tutoriales/*'], logLevel: 'silent' });
  const js = compiled.outputFiles.find(file => file.path.endsWith('.js')).text;
  const styles = compiled.outputFiles.find(file => file.path.endsWith('.css')).text;
  const browser = await chromium.launch();
  try {
    const p = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    await p.route('**/baseline-study', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="es" class="modo-reduced"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${styles}</style><div id="root"></div><script>${js.replaceAll('</script', '<\\/script')}</script></html>` }));
    await p.goto('http://127.0.0.1:4341/baseline-study');
    await p.locator('.lesson-journey').waitFor();
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `${out}/before-desktop.png`, fullPage: true, animations: 'disabled' });
    await p.setViewportSize({ width: 390, height: 844 });
    await p.screenshot({ path: `${out}/before-mobile.png`, fullPage: true, animations: 'disabled' });
    console.log('Capturas del punto de partida recuperadas desde el respaldo');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
