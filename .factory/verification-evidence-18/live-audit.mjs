import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base='https://apk-provenance-locker.sociobot.in';
const browser=await chromium.launch({headless:true});
const report={base,checkedAt:new Date().toISOString(),routes:[],firstRead:{},keyboard:{},reducedMotion:{},pwa:{}};
for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}]){
  for(const route of ['/','/demo','/privacy','/terms','/qa-not-found']){
    const context=await browser.newContext({viewport,serviceWorkers:'block'});
    const page=await context.newPage(); const errors=[]; const requests=[];
    page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`)}); page.on('pageerror',e=>errors.push(`page: ${e.message}`));
    page.on('request',r=>requests.push({method:r.method(),url:r.url(),bodyBytes:r.postDataBuffer()?.byteLength||0}));
    const response=await page.goto(base+route,{waitUntil:'networkidle'});
    const serious=(await new AxeBuilder({page}).analyze()).violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>v.id);
    const metrics=await page.evaluate(()=>({title:document.title,lang:document.documentElement.lang,h1:document.querySelectorAll('h1').length,main:document.querySelectorAll('main').length,description:document.querySelector('meta[name=description]')?.content||'',canonical:document.querySelector('link[rel=canonical]')?.href||'',overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,smallTargets:[...document.querySelectorAll('a,button')].filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.height>0&&(b.width<44||b.height<44)}).map(e=>({text:e.textContent?.trim(),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))}));
    await page.evaluate(()=>document.documentElement.style.fontSize='200%'); const zoomOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    const zoomSerious=(await new AxeBuilder({page}).analyze()).violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>v.id);
    report.routes.push({viewport:viewport.name,route,status:response?.status(),...metrics,zoomOverflow,seriousCritical:serious,zoomSeriousCritical:zoomSerious,errors,thirdParty:requests.filter(r=>new URL(r.url).origin!==base),nonGetOrBody:requests.filter(r=>r.method!=='GET'||r.bodyBytes)});
    await context.close();
  }
}
{
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}); const page=await context.newPage(); const req=[]; const errors=[];
 page.on('request',r=>req.push({method:r.method(),url:r.url(),bodyBytes:r.postDataBuffer()?.byteLength||0})); page.on('console',m=>{if(m.type()==='error')errors.push(m.text())}); page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'networkidle'}); await page.screenshot({path:'.factory/verification-evidence-18/cold-mobile.png'});
 report.firstRead={heading:await page.locator('h1').innerText(),audience:await page.locator('.hero-copy .lede').innerText(),action:await page.getByRole('link',{name:'Try it with sample data'}).innerText(),actionVisible:await page.getByRole('link',{name:'Try it with sample data'}).isVisible()};
 await page.getByRole('link',{name:'Try it with sample data'}).click(); await page.waitForURL(url=>url.pathname==='/demo'||url.searchParams.get('demo')==='1'); const first=page.locator('.record').first();
 report.firstRead.afterClick={url:page.url(),banner:await page.getByText('Demo — sample data, nothing is saved').isVisible(),records:await page.locator('.record').count(),firstRecordTop:(await first.boundingBox())?.y,reset:await page.getByRole('button',{name:'Reset demo'}).isVisible(),startReal:await page.getByRole('link',{name:'Start for real'}).isVisible(),requests:req,errors}; await page.screenshot({path:'.factory/verification-evidence-18/demo-mobile.png'}); await context.close();
}
{
 const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'}); const page=await context.newPage(); await page.goto(base+'/demo',{waitUntil:'networkidle'}); await page.keyboard.press('Tab'); const first=await page.evaluate(()=>({text:document.activeElement?.textContent?.trim(),href:document.activeElement?.getAttribute('href'),outline:getComputedStyle(document.activeElement).outline,boxShadow:getComputedStyle(document.activeElement).boxShadow})); await page.keyboard.press('Enter'); const skip=await page.evaluate(()=>({hash:location.hash,activeText:document.activeElement?.textContent?.trim()})); const trigger=page.getByRole('button',{name:/verify an apk/i}).first(); await trigger.focus(); await page.keyboard.press('Enter'); const dialog=page.getByRole('dialog'); const dialogOpened=await dialog.isVisible(); const focus=await page.evaluate(()=>({tag:document.activeElement?.tagName,name:document.activeElement?.getAttribute('aria-label')||document.activeElement?.textContent?.trim()})); await page.keyboard.press('Escape'); report.keyboard={first,skip,dialogOpened,focus,dialogClosed:await dialog.count()===0,returnedToTrigger:await trigger.evaluate(e=>e===document.activeElement)}; await context.close();
}
{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',serviceWorkers:'block'}); const page=await context.newPage(); await page.goto(base+'/demo',{waitUntil:'networkidle'}); await page.waitForTimeout(300); report.reducedMotion=await page.evaluate(()=>({reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,running:document.getAnimations().filter(a=>a.playState==='running').length})); await context.close();
}
{
 const context=await browser.newContext({viewport:{width:390,height:844}}); const page=await context.newPage(); await page.goto(base+'/demo',{waitUntil:'networkidle'}); await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller)); const update=await page.evaluate(async()=>{const r=await navigator.serviceWorker.ready;await r.update();return {active:r.active?.scriptURL,waiting:r.waiting?.scriptURL||null,caches:await caches.keys()}}); await context.setOffline(true); await page.reload({waitUntil:'domcontentloaded'}); report.pwa={controlled:await page.evaluate(()=>Boolean(navigator.serviceWorker.controller)),update,records:await page.locator('.record').count(),banner:await page.getByText('Demo — sample data, nothing is saved').isVisible()}; await context.close();
}
await browser.close(); await writeFile('.factory/verification-evidence-18/live-audit.json',JSON.stringify(report,null,2)+'\n'); console.log(JSON.stringify(report,null,2));
