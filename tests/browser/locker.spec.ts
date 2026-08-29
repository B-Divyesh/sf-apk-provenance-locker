import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
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
  await page.goto('/demo');
  await chooseApk(page);
  await page.getByRole('button',{name:'View full evidence'}).first().click();
  await expect(page.locator('dd.mono').first()).toHaveText('9c6947bf9398a15e85a52bf83b07cfae6686ff49e03034d09cbea45a19bdaa15');
});

test('@claim:signature-verification verifies v1/v2/v3 and a three-certificate lineage',async({page})=>{
  await page.goto('/demo');
  await chooseApk(page);
  await expect(page.getByText('Signature verified · v1 + v2 + v3')).toBeVisible();
  await expect(page.getByText('3-certificate signing history verified')).toBeVisible();
  await page.getByRole('button',{name:'View full evidence'}).first().click();
  await expect(page.getByText('android.appsecurity.cts.tinyapp',{exact:true}).first()).toBeVisible();
  await expect(page.getByText('1.0 · code 10')).toBeVisible();
  await expect(page.getByText(/CN=rsa-2048_3/)).toBeVisible();
});

test('@claim:v1-verification verifies a genuine v1-only signer',async({page})=>{
  await page.goto('/demo');
  await chooseApk(page,v1Fixture);
  await expect(page.getByText('Signature verified · v1')).toBeVisible();
});

test('@claim:apk-identity reads package and version fields from the compiled manifest',async({page})=>{
  await page.goto('/demo');
  await chooseApk(page);
  await expect(page.getByRole('heading',{name:'android.appsecurity.cts.tinyapp 1.0 (10)'})).toBeVisible();
});

test('@claim:tamper-rejection rejects changed bytes from a signed APK',async({page})=>{
  const apk=new Uint8Array(await readFile(lineageFixture));
  const nameLength=new DataView(apk.buffer).getUint16(26,true),extraLength=new DataView(apk.buffer).getUint16(28,true);
  apk[30+nameLength+extraLength]^=1;
  await page.goto('/demo');
  await page.getByRole('button',{name:/verify an apk/i}).first().click();
  await page.locator('input[type=file]').setInputFiles({name:'tampered.apk',mimeType:'application/vnd.android.package-archive',buffer:Buffer.from(apk)});
  await page.getByRole('button',{name:/verify and record apk/i}).click();
  await expect(page.getByText(/signature verification failed/i)).toBeVisible();
});

test('@claim:lineage-integrity rejects a malformed v3 rotation lineage',async({page})=>{
  await page.goto('/demo');
  await page.getByRole('button',{name:/verify an apk/i}).first().click();
  await page.locator('input[type=file]').setInputFiles(invalidLineageFixture);
  await page.getByRole('button',{name:/verify and record apk/i}).click();
  await expect(page.getByText(/lineage is invalid/i)).toBeVisible();
});

test('@claim:downgrade-risk warns from extracted package and version codes',async({page})=>{
  await page.goto('/demo');
  await chooseApk(page);
  await page.evaluate(()=>{const records=JSON.parse(localStorage.getItem('demo:apk-locker:records')!);records[0].versionCode=11;localStorage.setItem('demo:apk-locker:records',JSON.stringify(records))});
  await page.reload();
  await chooseApk(page);
  await expect(page.locator('.record .risk')).toHaveText('Incompatible downgrade risk: version code 10 is below recorded 11. Android normally blocks this install.');
});

test('@claim:signer-drift warns when a signer is outside the verified lineage',async({page})=>{
  await page.goto('/demo');
  await chooseApk(page);
  await page.evaluate(()=>{const records=JSON.parse(localStorage.getItem('demo:apk-locker:records')!);records[0].currentSigner='f'.repeat(64);records[0].lineage=[];localStorage.setItem('demo:apk-locker:records',JSON.stringify(records))});
  await page.reload();
  await chooseApk(page);
  await expect(page.locator('.record .risk')).toContainText('Signer change: this certificate is outside the verified lineage');
});

test('@claim:demo-sandbox keeps demo storage isolated and erases it through every exit',async({browser})=>{
  const exits=[
    {name:'Start for real',url:/\/$/,click:(page:any)=>page.getByRole('link',{name:'Start for real'}).click()},
    {name:'Locker',url:/\/#locker$/,click:(page:any)=>page.getByRole('link',{name:'Locker',exact:true}).click()},
    {name:'wordmark',url:/\/$/,click:(page:any)=>page.locator('.wordmark').click()},
  ];
  for(const exit of exits){
    const context=await browser.newContext();
    const page=await context.newPage();
    await page.goto('/');
    await page.evaluate(async()=>{
      localStorage.setItem('apk-locker:records','[{"sentinel":"real"}]');
      const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('apk-locker-files',1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
      await new Promise<void>((resolve,reject)=>{const request=db.transaction('files','readwrite').objectStore('files').put(new Uint8Array([7,8,9]).buffer,'real-sentinel');request.onsuccess=()=>resolve();request.onerror=()=>reject(request.error)});
      db.close();
    });
    await page.goto('/demo');
    await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
    await chooseApk(page);
    await page.evaluate(()=>{
      localStorage.setItem('demo:sb_license:apk-provenance-locker','demo-license');
      localStorage.setItem('demo:sb_license:apk-provenance-locker:verdict','{"valid":true}');
    });
    await Promise.all([page.waitForURL(exit.url),exit.click(page)]);
    await expect(page.getByText('Demo — sample data, nothing is saved')).toHaveCount(0);
    const storage=await page.evaluate(async()=>{
      const databaseNames=(await indexedDB.databases()).map(database=>database.name);
      const realBytes=await new Promise<number[]|null>((resolve,reject)=>{const request=indexedDB.open('apk-locker-files');request.onsuccess=()=>{const db=request.result;const read=db.transaction('files').objectStore('files').get('real-sentinel');read.onsuccess=()=>{db.close();resolve(read.result?Array.from(new Uint8Array(read.result)):null)};read.onerror=()=>{db.close();reject(read.error)}};request.onerror=()=>reject(request.error)});
      return {demoRecords:localStorage.getItem('demo:apk-locker:records'),demoLicense:localStorage.getItem('demo:sb_license:apk-provenance-locker'),demoVerdict:localStorage.getItem('demo:sb_license:apk-provenance-locker:verdict'),realRecords:localStorage.getItem('apk-locker:records'),databaseNames,realBytes};
    });
    expect(storage.demoRecords).toBeNull();
    expect(storage.demoLicense).toBeNull();
    expect(storage.demoVerdict).toBeNull();
    expect(storage.databaseNames).not.toContain('demo:apk-locker-files');
    expect(storage.realRecords).toBe('[{"sentinel":"real"}]');
    expect(storage.realBytes).toEqual([7,8,9]);
    await page.goto('/demo');
    await expect(page.locator('.record')).toHaveCount(2);
    await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
    await context.close();
  }
});

test('@claim:local-storage persists a demo record across reloads without writing the real namespace',async({page})=>{
  await page.goto('/demo');
  await chooseApk(page);
  await page.reload();
  await expect(page.getByRole('button',{name:`Remove ${fixturePackage}`})).toBeVisible();
  const namespaces=await page.evaluate(()=>Object.keys(localStorage).sort());
  expect(namespaces).toContain('demo:apk-locker:records');
  expect(namespaces).not.toContain('apk-locker:records');
});

test('@claim:android-backup-disabled keeps private installed-app storage out of Android backup and transfer',async({page})=>{
  await page.goto('/demo');
  const manifest=await readFile(resolve('android/app/src/main/AndroidManifest.xml'),'utf8');
  const backupRules=await readFile(resolve('android/app/src/main/res/xml/backup_rules.xml'),'utf8');
  const extractionRules=await readFile(resolve('android/app/src/main/res/xml/data_extraction_rules.xml'),'utf8');
  const releaseWorkflow=(await readFile(resolve('.github/workflows/android.yml'))).toString();
  expect(manifest).toContain('android:allowBackup="false"');
  expect(manifest).toContain('android:fullBackupContent="@xml/backup_rules"');
  expect(manifest).toContain('android:dataExtractionRules="@xml/data_extraction_rules"');
  expect(manifest).not.toContain('android:allowBackup="true"');
  expect(releaseWorkflow).toContain("grep -q 'android:allowBackup.*0x0' packaged-manifest.txt");
  for(const domain of ['root','file','database','sharedpref','external']){
    expect(backupRules).toContain(`<exclude domain="${domain}" path="." />`);
    expect(extractionRules.match(new RegExp(`<exclude domain="${domain}" path="\\." />`,'g'))).toHaveLength(2);
  }
  expect(releaseWorkflow).toContain("grep -q 'android:fullBackupContent' packaged-manifest.txt");
  expect(releaseWorkflow).toContain("grep -q 'android:dataExtractionRules' packaged-manifest.txt");
});

test('@claim:saved-copy-erasure confirms removal before erasing demo metadata and saved APK bytes',async({page})=>{
  await page.goto('/demo');
  await chooseApk(page);
  expect(await page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('demo:apk-locker-files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});return new Promise<number>((resolve,reject)=>{const request=db.transaction('files').objectStore('files').count();request.onsuccess=()=>{db.close();resolve(request.result)};request.onerror=()=>reject(request.error)})})).toBe(1);
  await page.getByRole('button',{name:`Remove ${fixturePackage}`}).click();
  await expect(page.getByRole('heading',{name:`Remove ${fixturePackage}?`})).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('demo:apk-locker:records')||'[]').some((record:any)=>record.packageName==='android.appsecurity.cts.tinyapp'))).toBe(true);
  await page.getByRole('button',{name:'Keep record'}).click();
  await expect(page.getByRole('heading',{name:`Remove ${fixturePackage}?`})).toHaveCount(0);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('demo:apk-locker:records')||'[]').some((record:any)=>record.packageName==='android.appsecurity.cts.tinyapp'))).toBe(true);
  await page.getByRole('button',{name:`Remove ${fixturePackage}`}).click();
  await page.getByRole('button',{name:'Remove record'}).click();
  await expect(page.getByRole('heading',{name:`Remove ${fixturePackage}?`})).toHaveCount(0);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('demo:apk-locker:records')||'[]').some((record:any)=>record.packageName==='android.appsecurity.cts.tinyapp'))).toBe(false);
  expect(await page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('demo:apk-locker-files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});return new Promise<number>((resolve,reject)=>{const request=db.transaction('files').objectStore('files').count();request.onsuccess=()=>{db.close();resolve(request.result)};request.onerror=()=>reject(request.error)})})).toBe(0);
});

test('@claim:encrypted-export hides record names and opens with the supplied password',async({page})=>{
  test.setTimeout(120_000);
  await page.goto('/demo');
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

test('@claim:restore-import imports verified evidence and saved bytes into a clean demo locker',async({page,browser})=>{
  await page.goto('/demo');
  await chooseApk(page);
  await page.getByRole('button',{name:'Export restore kit'}).click();
  await page.getByLabel('Password',{exact:true}).fill('correct horse battery');
  await page.getByLabel('Confirm password',{exact:true}).fill('correct horse battery');
  const pending=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download encrypted kit'}).click();
  const encrypted=await readFile((await (await pending).path())!);
  const clean=await browser.newContext();
  const restored=await clean.newPage();
  await restored.goto('/demo');
  await restored.getByRole('button',{name:'Validate a restore kit'}).click();
  await restored.getByLabel('Encrypted kit').setInputFiles({name:'restore.locker',mimeType:'application/json',buffer:encrypted});
  await restored.getByLabel('Kit password').fill('correct horse battery');
  await restored.getByRole('button',{name:'Check APK evidence'}).click();
  await restored.getByRole('button',{name:'Import verified records'}).click();
  await restored.getByRole('button',{name:'Confirm import verified records'}).click();
  await expect(restored.getByRole('heading',{name:`${fixturePackage} 1.0 (10)`})).toBeVisible();
  const restoredBytes=await restored.evaluate(async()=>{const record=JSON.parse(localStorage.getItem('demo:apk-locker:records')!).find((item:any)=>item.packageName==='android.appsecurity.cts.tinyapp');const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('demo:apk-locker-files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});return await new Promise<number[]>((resolve,reject)=>{const request=db.transaction('files').objectStore('files').get(record.id);request.onsuccess=()=>{db.close();resolve(Array.from(new Uint8Array(request.result)))};request.onerror=()=>reject(request.error)})});
  expect(Buffer.from(restoredBytes)).toEqual(await readFile(lineageFixture));
  await clean.close();
});

test('@claim:saved-apk-download downloads a verified saved APK without changing its bytes',async({page})=>{
  await page.goto('/demo');
  await chooseApk(page);
  await page.getByRole('button',{name:'Export restore kit'}).click();
  await page.getByLabel('Password',{exact:true}).fill('correct horse battery');
  await page.getByLabel('Confirm password',{exact:true}).fill('correct horse battery');
  const pendingKit=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download encrypted kit'}).click();
  const encrypted=await readFile((await (await pendingKit).path())!);
  await page.getByRole('button',{name:'Validate a restore kit'}).click();
  await page.getByLabel('Encrypted kit').setInputFiles({name:'restore.locker',mimeType:'application/json',buffer:encrypted});
  await page.getByLabel('Kit password').fill('correct horse battery');
  await page.getByRole('button',{name:'Check APK evidence'}).click();
  const pendingApk=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download verified APK'}).click();
  expect(await readFile((await (await pendingApk).path())!)).toEqual(await readFile(lineageFixture));
});

test('shows a conflict choice before replacing a matching local record',async({page})=>{
  await page.goto('/demo');
  await chooseApk(page);
  await page.getByRole('button',{name:'Export restore kit'}).click();
  await page.getByLabel('Password',{exact:true}).fill('correct horse battery');
  await page.getByLabel('Confirm password',{exact:true}).fill('correct horse battery');
  const pending=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download encrypted kit'}).click();
  const encrypted=await readFile((await (await pending).path())!);
  await page.getByRole('button',{name:'Validate a restore kit'}).click();
  await page.getByLabel('Encrypted kit').setInputFiles({name:'restore.locker',mimeType:'application/json',buffer:encrypted});
  await page.getByLabel('Kit password').fill('correct horse battery');
  await page.getByRole('button',{name:'Check APK evidence'}).click();
  await page.getByRole('button',{name:'Import verified records'}).click();
  await expect(page.getByText('1 record already uses the same package and version.')).toBeVisible();
  await expect(page.getByRole('button',{name:'Replace matching records'})).toBeVisible();
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
  await page.goto('/demo');
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

test('@claim:apk-never-uploaded processes a real APK without sending its bytes or emitting errors',async({page})=>{
  const apk=await readFile(lineageFixture);
  const requests:Array<{url:string;method:string;body:Buffer|null}>=[];
  const errors:string[]=[];
  page.on('request',request=>requests.push({url:request.url(),method:request.method(),body:request.postDataBuffer()}));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
  page.on('pageerror',error=>errors.push(error.message));

  await page.goto('/demo');
  await chooseApk(page,lineageFixture);
  await expect(page.getByText('Signature verified · v1 + v2 + v3')).toBeVisible();
  await page.waitForTimeout(100);

  expect(requests.length).toBeGreaterThan(0);
  expect([...new Set(requests.map(request=>new URL(request.url).origin))]).toEqual(['http://127.0.0.1:4173']);
  expect(requests.some(request=>request.url.includes('api.github.com'))).toBe(false);
  expect(requests.every(request=>request.method==='GET'&&request.body===null)).toBe(true);
  expect(requests.some(request=>request.body?.includes(apk))).toBe(false);
  expect(errors).toEqual([]);
});

test('@claim:release-assets exposes deterministic direct APK, AAB, and checksum links without an API request',async({page})=>{
  const requests:string[]=[];page.on('request',request=>requests.push(request.url()));
  await page.goto('/demo');
  await expect(page.getByRole('link',{name:'Download APK from GitHub'})).toHaveAttribute('href',/\/releases\/download\/v0\.5\.4\/app-release\.apk$/);
  await expect(page.getByRole('link',{name:'Download AAB from GitHub'})).toHaveAttribute('href',/\/releases\/download\/v0\.5\.4\/app-release\.aab$/);
  await expect(page.getByRole('link',{name:'Download SHA256SUMS from GitHub'})).toHaveAttribute('href',/\/releases\/download\/v0\.5\.4\/SHA256SUMS$/);
  await expect(page.getByText("Use the versioned SHA256SUMS file to check the APK's SHA-256 file fingerprint.")).toBeVisible();
  await expect(page.getByText(/Google Play/)).toHaveCount(0);
  expect(requests.some(url=>url.includes('api.github.com'))).toBe(false);
});

test('publishes a build identity for the exact source commit',async({request})=>{
  const response=await request.get('/build.json');
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({
    product:'apk-provenance-locker',
    version:'0.5.4',
    commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  });
});

test('@claim:paid-unlock restores a valid one-time license and persists a private device label',async({page})=>{
  const verificationRequests:string[]=[];
  await page.route('https://api.sociobot.in/api/v1/products/apk-provenance-locker/verify?*',async route=>{
    verificationRequests.push(route.request().url());
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({valid:true,reason:'ok',expires_at:null})});
  });
  await page.goto('/demo');
  await expect(page.getByText('Locker Plus costs $12 once.')).toBeVisible();
  await expect(page.getByRole('link',{name:'Buy Locker Plus — $12'})).toHaveAttribute('href','https://api.sociobot.in/api/v1/products/apk-provenance-locker/checkout');
  await page.getByRole('button',{name:'Restore Locker Plus license'}).click();
  await page.getByLabel('License token').fill('qa-valid-license-123');
  await page.getByRole('button',{name:'Verify license'}).click();
  await expect(page.locator('.license-state')).toHaveText('Locker Plus is active on this device.');
  expect(await page.evaluate(()=>localStorage.getItem('demo:sb_license:apk-provenance-locker'))).toBe('qa-valid-license-123');
  expect(JSON.parse((await page.evaluate(()=>localStorage.getItem('demo:sb_license:apk-provenance-locker:verdict')))!)).toMatchObject({valid:true});
  expect(verificationRequests).toHaveLength(1);

  await chooseApk(page);
  await page.getByRole('button',{name:'View full evidence'}).first().click();
  await page.getByRole('button',{name:'Edit device label'}).click();
  await page.getByLabel('Device label').fill('Pixel 8 travel spare');
  await page.getByRole('button',{name:'Save device label'}).click();
  await expect(page.getByText('Device: Pixel 8 travel spare')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Device: Pixel 8 travel spare')).toBeVisible();
  expect(verificationRequests).toHaveLength(1);
  const cachedUrls=await page.evaluate(async()=>Promise.all((await caches.keys()).map(async name=>(await (await caches.open(name)).keys()).map(request=>request.url))).then(groups=>groups.flat()));
  expect(cachedUrls.join('\n')).not.toContain('qa-valid-license-123');
});

test('@claim:free-core-features keeps verification, both warnings, and restore-kit export available without a license',async({page})=>{
  test.setTimeout(120_000);
  await page.goto('/demo');
  expect(await page.evaluate(()=>localStorage.getItem('demo:sb_license:apk-provenance-locker'))).toBeNull();
  await expect(page.getByText('Verification, signer and downgrade warnings, and restore-kit export stay free.')).toBeVisible();

  await chooseApk(page);
  await expect(page.getByText('Signature verified · v1 + v2 + v3')).toBeVisible();
  await page.evaluate(()=>{
    const records=JSON.parse(localStorage.getItem('demo:apk-locker:records')!);
    const verified=records.find((record:any)=>record.packageName==='android.appsecurity.cts.tinyapp');
    verified.versionCode=11;
    localStorage.setItem('demo:apk-locker:records',JSON.stringify(records));
  });
  await page.reload();
  await chooseApk(page);
  await expect(page.locator('.record .risk').first()).toContainText('Incompatible downgrade risk');

  await page.evaluate(()=>{
    const records=JSON.parse(localStorage.getItem('demo:apk-locker:records')!);
    for(const record of records.filter((item:any)=>item.packageName==='android.appsecurity.cts.tinyapp')){
      record.versionCode=12;
      record.currentSigner='f'.repeat(64);
      record.lineage=[];
    }
    localStorage.setItem('demo:apk-locker:records',JSON.stringify(records));
  });
  await page.reload();
  await chooseApk(page);
  await expect(page.locator('.record .risk').first()).toContainText('Signer change: this certificate is outside the verified lineage');

  await page.getByRole('button',{name:'Export restore kit'}).click();
  await page.getByLabel('Password',{exact:true}).fill('free features proof');
  await page.getByLabel('Confirm password',{exact:true}).fill('free features proof');
  const pending=page.waitForEvent('download');
  await page.getByRole('button',{name:'Download encrypted kit'}).click();
  const encrypted=await readFile((await (await pending).path())!);
  expect(encrypted.toString('utf8')).not.toContain(fixturePackage);
  await page.getByRole('button',{name:'Validate a restore kit'}).click();
  await page.getByLabel('Encrypted kit').setInputFiles({name:'free-features.locker',mimeType:'application/json',buffer:encrypted});
  await page.getByLabel('Kit password').fill('free features proof');
  await page.getByRole('button',{name:'Check APK evidence'}).click();
  await expect(page.getByRole('heading',{name:/APKs match/})).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('demo:sb_license:apk-provenance-locker'))).toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem('demo:sb_license:apk-provenance-locker:verdict'))).toBeNull();
});

test('@claim:hosted-checkout shows the one-time price and reaches Sociobot hosted checkout',async({page,request})=>{
  await page.goto('/demo');
  await expect(page.getByText('Locker Plus costs $12 once.')).toBeVisible();
  const buy=page.getByRole('link',{name:'Buy Locker Plus — $12'});
  await expect(buy).toHaveAttribute('href','https://api.sociobot.in/api/v1/products/apk-provenance-locker/checkout');
  const response=await request.get(await buy.getAttribute('href') as string,{maxRedirects:0});
  expect(response.status()).toBe(303);
  expect(response.headers().location).toMatch(/^https:\/\/checkout\.dodopayments\.com\/session\//);
});

test('@claim:revoked-license removes paid labels after a revoked verdict without affecting core verification',async({page})=>{
  await page.route('https://api.sociobot.in/api/v1/products/apk-provenance-locker/verify?*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({valid:false,reason:'revoked',expires_at:null})}));
  await page.goto('/demo?license=qa-revoked-token');
  await expect(page).toHaveURL('/demo');
  await expect(page.getByText('This license is not active. Check the token or buy Locker Plus.')).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('demo:sb_license:apk-provenance-locker'))).toBeNull();
  await chooseApk(page);
  await expect(page.getByText('Signature verified · v1 + v2 + v3')).toBeVisible();
});

test('starts keyboard navigation at the skip link and focuses headings only after client navigation',async({page})=>{
  await page.goto('/');
  await expect(page.locator('body')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
  await page.getByRole('link',{name:'Privacy'}).first().click();
  await expect(page.getByRole('heading',{level:1})).toBeFocused();
});

test('keeps recurring controls and the saved-copy checkbox target at least 44 by 44 pixels',async({page})=>{
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.keyboard.press('Tab');
    for(const target of [page.getByRole('link',{name:'Skip to content'}),page.locator('.wordmark'),page.getByRole('contentinfo').getByRole('link',{name:'Terms'})]){
      const box=await target.boundingBox();
      expect(box?.width||0).toBeGreaterThanOrEqual(44);
      expect(box?.height||0).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole('button',{name:'Verify an APK'}).first().click();
    const savedCopyTarget=page.getByText('Save this APK copy in this browser',{exact:true});
    const savedCopyBox=await savedCopyTarget.boundingBox();
    expect(savedCopyBox?.height||0).toBeGreaterThanOrEqual(44);
    await page.keyboard.press('Escape');
  }
});

test('uses a dual focus indicator with at least 3:1 contrast on dark and light surfaces',async({page})=>{
  const luminance=(rgb:number[])=>{
    const values=rgb.map(value=>{const channel=value/255;return channel<=0.04045?channel/12.92:((channel+0.055)/1.055)**2.4});
    return 0.2126*values[0]+0.7152*values[1]+0.0722*values[2];
  };
  const contrast=(a:number[],b:number[])=>{const [light,dark]=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (light+0.05)/(dark+0.05)};
  await page.goto('/');
  const wordmark=page.locator('.wordmark');
  await wordmark.focus();
  const darkStyle=await wordmark.evaluate(node=>{const style=getComputedStyle(node);return {outline:style.outlineColor,width:style.outlineWidth,shadow:style.boxShadow}});
  expect(darkStyle).toMatchObject({outline:'rgb(255, 253, 246)',width:'3px'});
  expect(darkStyle.shadow).toContain('rgb(20, 34, 30) 0px 0px 0px 7px');
  expect(contrast([255,253,246],[22,35,31])).toBeGreaterThanOrEqual(3);

  await page.getByRole('button',{name:'Verify an APK'}).first().click();
  await page.keyboard.press('Tab');
  const input=page.getByLabel('Source URL');
  await expect(input).toBeFocused();
  const lightStyle=await input.evaluate(node=>{const style=getComputedStyle(node);return {outline:style.outlineColor,width:style.outlineWidth,shadow:style.boxShadow}});
  expect(lightStyle).toMatchObject({outline:'rgb(255, 253, 246)',width:'3px'});
  expect(lightStyle.shadow).toContain('rgb(20, 34, 30) 0px 0px 0px 7px');
  expect(contrast([20,34,30],[247,240,223])).toBeGreaterThanOrEqual(3);
});

test('manages dialog focus and closes it with Escape',async({page})=>{
  await page.goto('/');
  const trigger=page.getByRole('button',{name:'Verify an APK'}).first();
  await trigger.focus();await page.keyboard.press('Enter');
  await expect(page.locator('input[type=file]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await page.goto('/demo');
  const remove=page.getByRole('button',{name:/Remove org\.fdroid\.fdroid/});
  await remove.focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{name:'Remove org.fdroid.fdroid?'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(remove).toBeFocused();
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
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Restore Locker Plus license'}).click();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await page.goto('/demo');await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  await page.getByRole('button',{name:/Remove org\.fdroid\.fdroid/}).click();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test('opens sample records above the fold from the first-screen demo action',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.getByRole('link',{name:'Try it with sample data'}).click();
  await expect(page).toHaveURL(/\/\?demo=1$/);
  const record=page.locator('.record').first();
  await expect(record).toBeVisible();
  expect((await record.boundingBox())?.y||Infinity).toBeLessThan(844);
});

test('recorded evidence reflows long release identity and source at 390px and 200% text',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/demo');
  await page.evaluate(()=>{
    const key='demo:apk-locker:records';
    const records=JSON.parse(localStorage.getItem(key)!);
    records[0].packageName='in.sociobot.apk_provenance_locker';
    records[0].source='https://downloads.example.test/android/releases/apk-provenance-locker/v0.5.4/in.sociobot.apk_provenance_locker/app-release.apk';
    localStorage.setItem(key,JSON.stringify(records));
  });
  await page.reload();
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  await page.getByRole('button',{name:'View full evidence'}).first().click();

  const dialog=page.getByRole('dialog');
  await expect(dialog.getByRole('heading',{name:'in.sociobot.apk_provenance_locker'})).toBeVisible();
  await expect(dialog.getByRole('link',{name:/downloads\.example\.test/})).toBeVisible();
  const reflow=await dialog.evaluate(node=>({
    clientWidth:node.clientWidth,
    scrollWidth:node.scrollWidth,
    right:node.getBoundingClientRect().right,
  }));
  expect(reflow.scrollWidth).toBeLessThanOrEqual(reflow.clientWidth);
  expect(reflow.right).toBeLessThanOrEqual(390);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test('static 404 has complete route metadata and shared recovery navigation',async({page})=>{
  const response=await page.goto('/404.html');
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle('Page not found — APK Provenance Locker');
  await expect(page.locator('meta[name=description]')).toHaveAttribute('content',/Return to APK Provenance Locker/);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://apk-provenance-locker.sociobot.in/404');
  await expect(page.locator('link[rel=icon]')).toHaveAttribute('href','/icons/favicon.svg');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content','https://apk-provenance-locker.sociobot.in/social.webp');
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content','Page not found — APK Provenance Locker');
  await expect(page.getByRole('navigation',{name:'Main navigation'})).toContainText('Demo');
  await expect(page.getByRole('contentinfo')).toContainText('Records and saved APK copies stay on this device.');
  await expect(page.getByRole('link',{name:'Terms'})).toHaveAttribute('href','/terms');
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
  await expect(page.getByRole('heading',{level:1})).toHaveText('Check sample APK records');
  await expect(page.getByRole('heading',{name:/^org\.fdroid\.fdroid /})).toBeVisible();
  await context.setOffline(false);
});

test('@claim:offline-verification verifies an APK offline after the first visit',async({page,context})=>{
  await page.goto('/demo');
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await chooseApk(page,v1Fixture);
  await expect(page.getByText('Signature verified · v1')).toBeVisible();
  await context.setOffline(false);
});

test('checks for service-worker updates and removes old cache versions',async({page})=>{
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
  const state=await page.evaluate(async()=>{
    const registration=await navigator.serviceWorker.ready;
    await registration.update();
    return {script:registration.active?.scriptURL,caches:await caches.keys()};
  });
  expect(state.script).toMatch(/\/sw\.js$/);
  expect(state.caches).toContain('apk-locker-v14');
  expect(state.caches.filter(name=>name.startsWith('apk-locker-'))).toEqual(['apk-locker-v14']);
});
