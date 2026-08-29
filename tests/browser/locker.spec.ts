import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {expect,test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const encoder=new TextEncoder();
const concat=(...parts:Uint8Array[])=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let at=0;for(const part of parts){out.set(part,at);at+=part.length}return out};
const le32=(n:number)=>{const out=new Uint8Array(4);new DataView(out.buffer).setUint32(0,n,true);return out};
function apkBytes(size=0,trailer=new Uint8Array()){
  const name=encoder.encode('AndroidManifest.xml'),body=new Uint8Array(size);
  const local=new Uint8Array(30+name.length+body.length),localView=new DataView(local.buffer);
  localView.setUint32(0,0x04034b50,true);localView.setUint16(4,20,true);localView.setUint32(18,size,true);localView.setUint32(22,size,true);localView.setUint16(26,name.length,true);local.set(name,30);
  const cdOffset=local.length+trailer.length,central=new Uint8Array(46+name.length),centralView=new DataView(central.buffer);
  centralView.setUint32(0,0x02014b50,true);centralView.setUint16(4,20,true);centralView.setUint16(6,20,true);centralView.setUint32(20,size,true);centralView.setUint32(24,size,true);centralView.setUint16(28,name.length,true);central.set(name,46);
  const eocd=new Uint8Array(22),endView=new DataView(eocd.buffer);endView.setUint32(0,0x06054b50,true);endView.setUint16(8,1,true);endView.setUint16(10,1,true);endView.setUint32(12,central.length,true);endView.setUint32(16,cdOffset,true);
  return concat(local,trailer,central,eocd);
}

const lineageFixture=resolve('tests/fixtures/v1v2v3-lineage.apk');
const v1Fixture=resolve('tests/fixtures/v1-only-rsa-2048.apk');
const invalidLineageFixture=resolve('tests/fixtures/v1v2v3-invalid-lineage.apk');
const fixturePackage='android.appsecurity.cts.tinyapp';

async function chooseApk(page:any,file:string|Uint8Array=lineageFixture){
  await page.getByRole('button',{name:/verify an apk/i}).first().click();
  if(typeof file==='string')await page.locator('input[type=file]').setInputFiles(file);
  else await page.locator('input[type=file]').setInputFiles({name:'evidence.apk',mimeType:'application/vnd.android.package-archive',buffer:Buffer.from(file)});
  await page.getByLabel('Source URL').fill('https://example.test/apk');
  await page.getByRole('button',{name:/verify and record apk/i}).click();
  await expect(page.getByRole('button',{name:`Remove ${fixturePackage}`}).first()).toBeVisible();
}

test('@claim:hash-check shows the exact SHA-256 of fixed selected bytes',async({page})=>{
  await page.goto('/');
  await chooseApk(page);
  await page.getByRole('button',{name:'View full evidence'}).click();
  await expect(page.locator('dd.mono').first()).toHaveText('9c6947bf9398a15e85a52bf83b07cfae6686ff49e03034d09cbea45a19bdaa15');
});

test('@claim:signature-verification verifies v1/v2/v3 and a three-certificate lineage',async({page})=>{
  await page.goto('/');
  await chooseApk(page);
  await expect(page.getByText('Signature verified · v1 + v2 + v3')).toBeVisible();
  await expect(page.getByText('3-certificate lineage verified')).toBeVisible();
  await page.getByRole('button',{name:'View full evidence'}).click();
  await expect(page.getByText('android.appsecurity.cts.tinyapp',{exact:true}).first()).toBeVisible();
  await expect(page.getByText('1.0 · code 10')).toBeVisible();
  await expect(page.getByText(/CN=rsa-2048_3/)).toBeVisible();
});

test('@claim:v1-verification verifies a genuine v1-only signer',async({page})=>{
  await page.goto('/');
  await chooseApk(page,v1Fixture);
  await expect(page.getByText('Signature verified · v1')).toBeVisible();
});

test('@claim:apk-identity reads package and version fields from the compiled manifest',async({page})=>{
  await page.goto('/');
  await chooseApk(page);
  await expect(page.getByRole('heading',{name:'android.appsecurity.cts.tinyapp 1.0 (10)'})).toBeVisible();
});

test('@claim:tamper-rejection rejects changed bytes from a signed APK',async({page})=>{
  const apk=new Uint8Array(await readFile(lineageFixture));
  const nameLength=new DataView(apk.buffer).getUint16(26,true),extraLength=new DataView(apk.buffer).getUint16(28,true);
  apk[30+nameLength+extraLength]^=1;
  await page.goto('/');
  await page.getByRole('button',{name:/verify an apk/i}).first().click();
  await page.locator('input[type=file]').setInputFiles({name:'tampered.apk',mimeType:'application/vnd.android.package-archive',buffer:Buffer.from(apk)});
  await page.getByRole('button',{name:/verify and record apk/i}).click();
  await expect(page.getByText(/signature verification failed/i)).toBeVisible();
});

test('@claim:lineage-integrity rejects a malformed v3 rotation lineage',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:/verify an apk/i}).first().click();
  await page.locator('input[type=file]').setInputFiles(invalidLineageFixture);
  await page.getByRole('button',{name:/verify and record apk/i}).click();
  await expect(page.getByText(/lineage is invalid/i)).toBeVisible();
});

test('@claim:downgrade-risk warns from extracted package and version codes',async({page})=>{
  await page.goto('/');
  await chooseApk(page);
  await page.evaluate(()=>{const records=JSON.parse(localStorage.getItem('apk-locker:records')!);records[0].versionCode=11;localStorage.setItem('apk-locker:records',JSON.stringify(records))});
  await page.reload();
  await chooseApk(page);
  await expect(page.locator('.record .risk')).toHaveText('Incompatible downgrade risk: version code 10 is below recorded 11. Android normally blocks this install.');
});

test('@claim:signer-drift warns when a signer is outside the verified lineage',async({page})=>{
  await page.goto('/');
  await chooseApk(page);
  await page.evaluate(()=>{const records=JSON.parse(localStorage.getItem('apk-locker:records')!);records[0].currentSigner='f'.repeat(64);records[0].lineage=[];localStorage.setItem('apk-locker:records',JSON.stringify(records))});
  await page.reload();
  await chooseApk(page);
  await expect(page.locator('.record .risk')).toContainText('Signer change: this certificate is outside the verified lineage');
});

test('@claim:demo-sandbox erases the separate demo record and file namespaces',async({page})=>{
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await chooseApk(page);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('demo:apk-locker:records')||'[]').some((record:any)=>record.verification==='verified'))).toBe(true);
  expect(await page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('demo:apk-locker-files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});return new Promise<number>((resolve,reject)=>{const request=db.transaction('files').objectStore('files').count();request.onsuccess=()=>{db.close();resolve(request.result)};request.onerror=()=>reject(request.error)})})).toBe(1);
  await page.getByRole('link',{name:'Start for real'}).click();
  await page.waitForURL('/');
  await expect(page.getByText('No APK evidence yet')).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('demo:apk-locker:records'))).toBeNull();
  expect(await page.evaluate(async()=>!(await indexedDB.databases()).some(database=>database.name==='demo:apk-locker-files'))).toBe(true);
});

test('@claim:local-storage persists a real record across reloads in the real namespace',async({page})=>{
  await page.goto('/');
  await chooseApk(page);
  await page.reload();
  await expect(page.getByRole('button',{name:`Remove ${fixturePackage}`})).toBeVisible();
  const namespaces=await page.evaluate(()=>Object.keys(localStorage).sort());
  expect(namespaces).toContain('apk-locker:records');
  expect(namespaces).not.toContain('demo:apk-locker:records');
});

test('@claim:saved-copy-erasure removes both metadata and saved APK bytes',async({page})=>{
  await page.goto('/');
  await chooseApk(page);
  expect(await page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('apk-locker-files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});return new Promise<number>((resolve,reject)=>{const request=db.transaction('files').objectStore('files').count();request.onsuccess=()=>{db.close();resolve(request.result)};request.onerror=()=>reject(request.error)})})).toBe(1);
  await page.getByRole('button',{name:`Remove ${fixturePackage}`}).click();
  await expect(page.getByText('No APK evidence yet')).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('apk-locker:records'))).toBe('[]');
  expect(await page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('apk-locker-files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});return new Promise<number>((resolve,reject)=>{const request=db.transaction('files').objectStore('files').count();request.onsuccess=()=>{db.close();resolve(request.result)};request.onerror=()=>reject(request.error)})})).toBe(0);
});

test('@claim:encrypted-export hides record names and opens with the supplied password',async({page})=>{
  test.setTimeout(120_000);
  await page.goto('/');
  await chooseApk(page);
  await page.getByRole('button',{name:'Export restore kit'}).click();
  await page.getByLabel('Password',{exact:true}).fill('correct horse battery');
  await page.getByLabel('Confirm password',{exact:true}).fill('correct horse battery');
  const pending=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download encrypted kit'}).click();
  const download=await pending,path=await download.path();
  expect(download.suggestedFilename()).toMatch(/\.locker$/);
  const encrypted=await readFile(path!);
  expect(encrypted.toString('utf8')).not.toContain(fixturePackage);
  await page.getByRole('button',{name:'Validate a restore kit'}).click();
  await page.getByLabel('Encrypted kit').setInputFiles({name:'restore.locker',mimeType:'application/json',buffer:encrypted});
  await page.getByLabel('Kit password').fill('correct horse battery');
  await page.getByRole('button',{name:'Check APK evidence'}).click();
  await expect(page.getByRole('heading',{name:'1 APKs match'})).toBeVisible();
});

test('exports a 12 MiB saved copy without overflowing the browser stack',async({page})=>{
  test.setTimeout(120_000);
  await page.goto('/');await chooseApk(page);
  await page.evaluate(async()=>{const record=JSON.parse(localStorage.getItem('apk-locker:records')!)[0];const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('apk-locker-files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});await new Promise<void>((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(new Uint8Array(12*1024*1024).buffer,record.id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close()});
  await page.getByRole('button',{name:'Export restore kit'}).click();
  await page.getByLabel('Password',{exact:true}).fill('correct horse battery');
  await page.getByLabel('Confirm password',{exact:true}).fill('correct horse battery');
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download encrypted kit'}).click();const download=await pending;
  expect((await readFile((await download.path())!)).byteLength).toBeGreaterThan(12*1024*1024);
});

test('@claim:password-not-stored leaves the export password out of browser storage',async({page})=>{
  const password='storage-secret-123';
  await page.goto('/demo');
  await page.getByRole('button',{name:'Export restore kit'}).click();
  await page.getByLabel('Password',{exact:true}).fill(password);
  await page.getByLabel('Confirm password',{exact:true}).fill(password);
  const pending=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download encrypted kit'}).click();
  await pending;
  const stored=await page.evaluate(async()=>{
    const local=Object.entries(localStorage).flat().join('\n'),session=Object.entries(sessionStorage).flat().join('\n');
    const cache=await Promise.all((await caches.keys()).map(async name=>[name,...(await (await caches.open(name)).keys()).map(request=>request.url)].join('\n')));
    return [local,session,...cache].join('\n');
  });
  expect(stored).not.toContain(password);
});

test('@claim:apk-structure rejects non-ZIP and inconsistent APK-shaped files',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:/verify an apk/i}).first().click();
  await page.locator('input[type=file]').setInputFiles({name:'broken.apk',mimeType:'application/vnd.android.package-archive',buffer:Buffer.from('not an apk')});
  await page.getByRole('button',{name:/verify and record apk/i}).click();
  await expect(page.getByText(/not a ZIP-based APK|too short to be an APK/)).toBeVisible();
  const malformed=apkBytes();new DataView(malformed.buffer).setUint32(18,9,true);
  await page.locator('input[type=file]').setInputFiles({name:'malformed.apk',mimeType:'application/vnd.android.package-archive',buffer:Buffer.from(malformed)});
  await page.getByRole('button',{name:/verify and record apk/i}).click();
  await expect(page.getByText(/invalid local ZIP entry/)).toBeVisible();
});

test('@claim:no-account-network runs the demo without an account or automatic third-party request',async({page})=>{
  const requests:string[]=[];page.on('request',request=>requests.push(request.url()));
  await page.goto('/demo');
  await expect(page.getByRole('heading',{name:/^org\.fdroid\.fdroid /})).toBeVisible();
  await chooseApk(page,v1Fixture);
  await page.getByRole('button',{name:'Reset demo'}).click();
  await expect(page.locator('input[type=email], input[name*=account], input[name*=login]')).toHaveCount(0);
  expect([...new Set(requests.map(url=>new URL(url).origin))]).toEqual(['http://127.0.0.1:4173']);
});

test('@claim:release-assets exposes deterministic direct APK, AAB, and checksum links without an API request',async({page})=>{
  const requests:string[]=[];page.on('request',request=>requests.push(request.url()));
  await page.goto('/');
  await expect(page.getByRole('link',{name:'Download APK from GitHub'})).toHaveAttribute('href',/\/releases\/download\/v0\.3\.0\/app-release\.apk$/);
  await expect(page.getByRole('link',{name:'Download AAB from GitHub'})).toHaveAttribute('href',/\/releases\/download\/v0\.3\.0\/app-release\.aab$/);
  await expect(page.getByRole('link',{name:'Download SHA256SUMS from GitHub'})).toHaveAttribute('href',/\/releases\/download\/v0\.3\.0\/SHA256SUMS$/);
  expect(requests.some(url=>url.includes('api.github.com'))).toBe(false);
});

test('starts keyboard navigation at the skip link and focuses headings only after client navigation',async({page})=>{
  await page.goto('/');
  await expect(page.locator('body')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
  await page.getByRole('link',{name:'Privacy'}).first().click();
  await expect(page.getByRole('heading',{level:1})).toBeFocused();
});

test('manages dialog focus and closes it with Escape',async({page})=>{
  await page.goto('/');
  const trigger=page.getByRole('button',{name:'Verify an APK'}).first();
  await trigger.focus();await page.keyboard.press('Enter');
  await expect(page.locator('input[type=file]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('passes axe, has one page structure, and fits mobile at 200% text',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const path of ['/','/demo','/privacy','/terms']){
    await page.goto(path);
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
    expect(await page.locator('h1').count()).toBe(1);
    expect(await page.locator('main').count()).toBe(1);
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  }
  for(const target of await page.locator('nav a, .demo-banner a, .demo-banner button, footer a').all()){
    const box=await target.boundingBox();expect(box?.height||0).toBeGreaterThanOrEqual(44);
  }
  await page.goto('/');await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  await page.getByRole('button',{name:'Verify an APK'}).first().click();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test('loads every route without console errors and removes motion when requested',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors:string[]=[];page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});page.on('pageerror',error=>errors.push(error.message));
  for(const path of ['/','/demo','/privacy','/terms']){await page.goto(path);expect(await page.evaluate(()=>[...document.querySelectorAll('*')].every(node=>{const style=getComputedStyle(node);return parseFloat(style.animationDuration||'0')===0&&parseFloat(style.transitionDuration||'0')===0}))).toBe(true)}
  expect(errors).toEqual([]);
});

test('@claim:offline-reload reloads the demo shell without the browser HTTP cache',async({page,context})=>{
  await page.goto('/demo');
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
  const session=await context.newCDPSession(page);await session.send('Network.enable');await session.send('Network.setCacheDisabled',{cacheDisabled:true});await session.send('Network.clearBrowserCache');
  await context.setOffline(true);await page.reload();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Verify APKs before restoring');
  await expect(page.getByRole('heading',{name:/^org\.fdroid\.fdroid /})).toBeVisible();
  await context.setOffline(false);
});

test('@claim:offline-verification verifies an APK offline after the first visit',async({page,context})=>{
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await chooseApk(page,v1Fixture);
  await expect(page.getByText('Signature verified · v1')).toBeVisible();
  await context.setOffline(false);
});
