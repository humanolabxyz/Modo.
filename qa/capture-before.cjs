const { chromium } = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1100}});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file:///'+path.resolve('PANEL_LAB_INACAP.html').replaceAll('\\','/'));
  await page.locator('.socket-interactive').first().waitFor();
  await page.screenshot({path:path.join(__dirname,'antes-desktop.png'),fullPage:true});
  console.log(JSON.stringify({terminals:await page.locator('.socket-interactive').count(),errors}));
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(__dirname,'antes-mobile.png'),fullPage:true});
  await page.goto('file:///'+path.resolve('PANEL_LAB_INACAP.html').replaceAll('\\','/'));
  await page.screenshot({path:path.join(__dirname,'autonomo-mobile.png'),fullPage:true});
  await browser.close();
})();
