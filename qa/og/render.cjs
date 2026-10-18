const path = require('node:path');
const {chromium} = require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
  await page.goto('file:///' + path.join(__dirname, 'og.html').replace(/\\/g, '/'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const out = path.join(__dirname, '..', '..', 'public', 'brand', 'og-modo.jpg');
  await page.screenshot({path: out, type: 'jpeg', quality: 90});
  await browser.close();
  console.log(out);
})();
