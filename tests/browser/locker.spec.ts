import {readFile} from 'node:fs/promises';
import {expect,test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const encoder=new TextEncoder();
const concat=(...parts:Uint8Array[])=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let at=0;for(const part of parts){out.set(part,at);at+=part.length}return out};
const le32=(n:number)=>{const out=new Uint8Array(4);new DataView(out.buffer).setUint32(0,n,true);return out};
const le64=(n:number)=>{const out=new Uint8Array(8);new DataView(out.buffer).setBigUint64(0,BigInt(n),true);return out};
const lp=(bytes:Uint8Array)=>concat(le32(bytes.length),bytes);

function signingBlock(){
  const cert=encoder.encode('fixed-unverified-certificate-bytes');
  const signed=concat(lp(new Uint8Array()),lp(lp(cert)),lp(new Uint8Array()));
  const signer=concat(lp(signed),lp(new Uint8Array()),lp(new Uint8Array()));
  const value=lp(lp(signer));
  const pair=(id:number)=>concat(le64(4+value.length),le32(id),value);
  const pairs=concat(pair(0x7109871a),pair(0xf05368c0));
  const size=pairs.length+24;
  return concat(le64(size),pairs,le64(size),encoder.encode('APK Sig Block 42'));
}

function apkBytes(size=0,trailer=new Uint8Array()){
  const name=encoder.encode('AndroidManifest.xml'),body=new Uint8Array(size);
  const local=new Uint8Array(30+name.length+body.length),localView=new DataView(local.buffer);
  localView.setUint32(0,0x04034b50,true);localView.setUint16(4,20,true);localView.setUint32(18,size,true);localView.setUint32(22,size,true);localView.setUint16(26,name.length,true);local.set(name,30);
  const cdOffset=local.length+trailer.length,central=new Uint8Array(46+name.length),centralView=new DataView(central.buffer);
  centralView.setUint32(0,0x02014b50,true);centralView.setUint16(4,20,true);centralView.setUint16(6,20,true);centralView.setUint32(20,size,true);centralView.setUint32(24,size,true);centralView.setUint16(28,name.length,true);central.set(name,46);
  const eocd=new Uint8Array(22),endView=new DataView(eocd.buffer);endView.setUint32(0,0x06054b50,true);endView.setUint16(8,1,true);endView.setUint16(10,1,true);endView.setUint32(12,central.length,true);endView.setUint32(16,cdOffset,true);
  return concat(local,trailer,central,eocd);
}

async function chooseApk(page:any,name='Example',bytes=apkBytes(),version='1.0'){
  await page.getByRole('button',{name:/record an apk/i}).first().click();
  await page.locator('input[type=file]').setInputFiles({name:'evidence.apk',mimeType:'application/vnd.android.package-archive',buffer:Buffer.from(bytes)});
  await page.getByLabel('App name you checked').fill(name);
  await page.getByLabel('Version you checked').fill(version);
  await page.getByLabel('Source URL').fill('https://example.test/apk');
  await page.getByRole('button',{name:/hash and record apk/i}).click();
  await expect(page.getByRole('button',{name:`Remove ${name}`})).toBeVisible();
}

test('@claim:hash-check shows the exact SHA-256 of fixed selected bytes',async({page})=>{
  await page.goto('/');
  await chooseApk(page);
  await page.getByRole('button',{name:'View full evidence'}).click();
  await expect(page.locator('dd.mono').first()).toHaveText('40d656eec98277288d0b4c84bf8e9f2d84805849591ebe3f49a5e10916536c9c');
});

test('@claim:signer-evidence labels embedded v2/v3 certificate bytes as unverified',async({page})=>{
  await page.goto('/');
  await chooseApk(page,'Signing block sample',apkBytes(0,signingBlock()));
  await expect(page.getByText('v2 + v3 embedded certificate bytes')).toBeVisible();
  await expect(page.getByText('Not signature-verified')).toBeVisible();
  await page.getByRole('button',{name:'View full evidence'}).click();
  await expect(page.getByText('1685c148e7f12864425d091284878e966c526d9649817212fd3c8167c76627cd')).toBeVisible();
  await expect(page.getByText(/Android must verify the signature/)).toBeVisible();
});

test('@claim:demo-sandbox erases the separate demo record and file namespaces',async({page})=>{
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await chooseApk(page,'Demo APK');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('demo:apk-locker:records')||'[]').some((record:any)=>record.name==='Demo APK'))).toBe(true);
  expect(await page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('demo:apk-locker-files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});return new Promise<number>((resolve,reject)=>{const request=db.transaction('files').objectStore('files').count();request.onsuccess=()=>{db.close();resolve(request.result)};request.onerror=()=>reject(request.error)})})).toBe(1);
  await page.getByRole('link',{name:'Start for real'}).click();
  await page.waitForURL('/');
  await expect(page.getByText('No APK evidence yet')).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('demo:apk-locker:records'))).toBeNull();
  expect(await page.evaluate(async()=>!(await indexedDB.databases()).some(database=>database.name==='demo:apk-locker-files'))).toBe(true);
});

test('@claim:local-storage persists a real record across reloads in the real namespace',async({page})=>{
  await page.goto('/');
  await chooseApk(page,'Real APK');
  await page.reload();
  await expect(page.getByRole('button',{name:'Remove Real APK'})).toBeVisible();
  const namespaces=await page.evaluate(()=>Object.keys(localStorage).sort());
  expect(namespaces).toContain('apk-locker:records');
  expect(namespaces).not.toContain('demo:apk-locker:records');
});

test('@claim:saved-copy-erasure removes both metadata and saved APK bytes',async({page})=>{
  await page.goto('/');
  await chooseApk(page,'Erase me');
  expect(await page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('apk-locker-files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});return new Promise<number>((resolve,reject)=>{const request=db.transaction('files').objectStore('files').count();request.onsuccess=()=>{db.close();resolve(request.result)};request.onerror=()=>reject(request.error)})})).toBe(1);
  await page.getByRole('button',{name:'Remove Erase me'}).click();
  await expect(page.getByText('No APK evidence yet')).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('apk-locker:records'))).toBe('[]');
  expect(await page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('apk-locker-files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});return new Promise<number>((resolve,reject)=>{const request=db.transaction('files').objectStore('files').count();request.onsuccess=()=>{db.close();resolve(request.result)};request.onerror=()=>reject(request.error)})})).toBe(0);
});

test('@claim:encrypted-export hides record names and opens with the supplied password',async({page})=>{
  test.setTimeout(120_000);
  await page.goto('/');
  await chooseApk(page,'Private large APK',apkBytes(12*1024*1024));
  await page.getByRole('button',{name:'Export restore kit'}).click();
  await page.getByLabel('Password',{exact:true}).fill('correct horse battery');
  await page.getByLabel('Confirm password',{exact:true}).fill('correct horse battery');
  const pending=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download encrypted kit'}).click();
  const download=await pending,path=await download.path();
  expect(download.suggestedFilename()).toMatch(/\.locker$/);
  const encrypted=await readFile(path!);
  expect(encrypted.toString('utf8')).not.toContain('Private large APK');
  await page.getByRole('button',{name:'Validate a restore kit'}).click();
  await page.getByLabel('Encrypted kit').setInputFiles({name:'restore.locker',mimeType:'application/json',buffer:encrypted});
  await page.getByLabel('Kit password').fill('correct horse battery');
  await page.getByRole('button',{name:'Check hashes and signers'}).click();
  await expect(page.getByRole('heading',{name:'1 hashes match'})).toBeVisible();
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
  await page.getByRole('button',{name:/record an apk/i}).first().click();
  await page.locator('input[type=file]').setInputFiles({name:'broken.apk',mimeType:'application/vnd.android.package-archive',buffer:Buffer.from('not an apk')});
  await page.getByLabel('App name you checked').fill('Broken');
  await page.getByRole('button',{name:/hash and record apk/i}).click();
  await expect(page.getByText(/not a ZIP-based APK|too short to be an APK/)).toBeVisible();
  const malformed=apkBytes();new DataView(malformed.buffer).setUint32(18,9,true);
  await page.locator('input[type=file]').setInputFiles({name:'malformed.apk',mimeType:'application/vnd.android.package-archive',buffer:Buffer.from(malformed)});
  await page.getByRole('button',{name:/hash and record apk/i}).click();
  await expect(page.getByText(/invalid local ZIP entry/)).toBeVisible();
});

test('@claim:no-account-network runs the demo without an account or automatic third-party request',async({page})=>{
  const requests:string[]=[];page.on('request',request=>requests.push(request.url()));
  await page.goto('/demo');
  await expect(page.getByRole('heading',{name:/^F-Droid /})).toBeVisible();
  await page.getByRole('button',{name:'Reset demo'}).click();
  await expect(page.locator('input[type=email], input[name*=account], input[name*=login]')).toHaveCount(0);
  expect([...new Set(requests.map(url=>new URL(url).origin))]).toEqual(['http://127.0.0.1:4173']);
});

test('@claim:release-assets exposes deterministic direct APK, AAB, and checksum links without an API request',async({page})=>{
  const requests:string[]=[];page.on('request',request=>requests.push(request.url()));
  await page.goto('/');
  await expect(page.getByRole('link',{name:'Download APK from GitHub'})).toHaveAttribute('href',/\/releases\/download\/v0\.2\.0\/app-release\.apk$/);
  await expect(page.getByRole('link',{name:'Download AAB from GitHub'})).toHaveAttribute('href',/\/releases\/download\/v0\.2\.0\/app-release\.aab$/);
  await expect(page.getByRole('link',{name:'Download SHA256SUMS from GitHub'})).toHaveAttribute('href',/\/releases\/download\/v0\.2\.0\/SHA256SUMS$/);
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
  await expect(page.getByRole('heading',{level:1})).toHaveText('Keep APK restore evidence');
  await expect(page.getByRole('heading',{name:/^F-Droid /})).toBeVisible();
  await context.setOffline(false);
});
