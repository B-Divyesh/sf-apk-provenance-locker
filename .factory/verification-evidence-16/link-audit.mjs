import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = 'https://apk-provenance-locker.sociobot.in';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ serviceWorkers: 'block' });
const page = await context.newPage();
const links = new Set();
for (const route of ['/', '/demo', '/privacy', '/terms', '/404.html']) {
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  for (const href of await page.locator('a[href]').evaluateAll(elements => elements.map(element => element.href))) links.add(href);
}
const results = [];
for (const url of [...links].sort()) {
  const response = await context.request.get(url, { maxRedirects: 10, timeout: 30_000 });
  const final = new URL(response.url());
  final.search = '';
  const finalUrl = final.hostname === 'checkout.dodopayments.com' ? `${final.origin}/session/[redacted]` : final.href;
  results.push({ url, status: response.status(), finalUrl });
}
await browser.close();
await writeFile('.factory/verification-evidence-16/link-audit.json', `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
if (results.some(result => result.status >= 400)) process.exit(1);
