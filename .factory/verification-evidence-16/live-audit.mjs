import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base = 'https://apk-provenance-locker.sociobot.in';
const browser = await chromium.launch({ headless: true });
const report = { base, checkedAt: new Date().toISOString(), routes: [], firstRead: {}, keyboard: {}, reducedMotion: {}, pwa: {} };

for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  for (const route of ['/', '/demo', '/privacy', '/terms', '/verification-16-missing']) {
    const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
    const page = await context.newPage();
    const errors = [];
    const requests = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    page.on('pageerror', error => errors.push(`page: ${error.message}`));
    page.on('request', request => requests.push({ method: request.method(), url: request.url(), bodyBytes: request.postDataBuffer()?.byteLength || 0 }));
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    const serious = (await new AxeBuilder({ page }).analyze()).violations.filter(item => ['serious', 'critical'].includes(item.impact));
    const metrics = await page.evaluate(() => ({
      title: document.title,
      lang: document.documentElement.lang,
      h1: document.querySelectorAll('h1').length,
      main: document.querySelectorAll('main').length,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      smallTargets: [...document.querySelectorAll('a,button')].filter(element => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44);
      }).map(element => ({ text: element.textContent?.trim(), width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height })),
    }));
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const zoomOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const zoomSerious = (await new AxeBuilder({ page }).analyze()).violations.filter(item => ['serious', 'critical'].includes(item.impact));
    report.routes.push({ viewport: viewport.name, route, status: response?.status(), ...metrics, zoomOverflow, zoomSeriousCritical: zoomSerious.map(item => item.id), seriousCritical: serious.map(item => item.id), errors, thirdParty: requests.filter(item => new URL(item.url).origin !== base) });
    await context.close();
  }
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    window.__verification16Events = [];
    new PerformanceObserver(list => window.__verification16Events.push(...list.getEntries().map(entry => ({ name: entry.name, duration: entry.duration, interactionId: entry.interactionId })))).observe({ type: 'event', buffered: true, durationThreshold: 0 });
  });
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.waitForTimeout(500);
  report.interaction = await page.evaluate(() => ({ events: window.__verification16Events, maxDuration: Math.max(0, ...window.__verification16Events.map(entry => entry.duration)) }));
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  report.firstRead = {
    heading: await page.locator('h1').innerText(),
    audience: await page.locator('.hero-copy .lede').innerText(),
    action: await page.getByRole('link', { name: 'Try it with sample data' }).innerText(),
    actionVisible: await page.getByRole('link', { name: 'Try it with sample data' }).isVisible(),
  };
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.waitForURL(url => url.pathname === '/demo' || url.searchParams.get('demo') === '1');
  const firstRecord = page.locator('.record').first();
  report.firstRead.afterClick = {
    url: page.url(),
    banner: await page.getByText('Demo — sample data, nothing is saved').isVisible(),
    records: await page.locator('.record').count(),
    firstRecordTop: (await firstRecord.boundingBox())?.y,
    resetVisible: await page.getByRole('button', { name: 'Reset demo' }).isVisible(),
    startRealVisible: await page.getByRole('link', { name: 'Start for real' }).isVisible(),
  };
  await page.screenshot({ path: '.factory/verification-evidence-16/demo-one-click-mobile.png', fullPage: false });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const firstFocus = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), href: document.activeElement?.getAttribute('href') }));
  const focusStyle = await page.evaluate(() => { const style = getComputedStyle(document.activeElement); return { outline: style.outline, boxShadow: style.boxShadow }; });
  await page.keyboard.press('Enter');
  const skipTarget = await page.evaluate(() => ({ hash: location.hash, activeText: document.activeElement?.textContent?.trim() }));
  await page.getByRole('button', { name: /verify an apk/i }).first().focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  const dialogOpened = await dialog.isVisible();
  const openFocus = await page.evaluate(() => ({ tag: document.activeElement?.tagName, name: document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim() }));
  await page.keyboard.press('Escape');
  report.keyboard = { firstFocus, focusStyle, skipTarget, dialogOpened, openFocus, dialogClosed: await dialog.count() === 0, returnedToTrigger: await page.getByRole('button', { name: /verify an apk/i }).first().evaluate(element => element === document.activeElement) };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  report.reducedMotion = await page.evaluate(() => ({ activeAnimations: document.getAnimations().filter(animation => animation.playState === 'running').length, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches }));
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 15000 });
  const update = await page.evaluate(async () => { const registration = await navigator.serviceWorker.ready; await registration.update(); return { active: registration.active?.scriptURL, waiting: registration.waiting?.scriptURL || null }; });
  await page.waitForTimeout(500);
  const cacheNames = await page.evaluate(() => caches.keys());
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  report.pwa = { controlled: await page.evaluate(() => Boolean(navigator.serviceWorker.controller)), update, cacheNames, offlineRecords: await page.locator('.record').count(), offlineBanner: await page.getByText('Demo — sample data, nothing is saved').isVisible() };
  await context.close();
}

await browser.close();
await writeFile('.factory/verification-evidence-16/live-audit.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
