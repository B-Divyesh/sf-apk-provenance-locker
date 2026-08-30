import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from 'playwright';

const base='https://apk-provenance-locker.sociobot.in';
const fixturePath=resolve('tests/fixtures/v1v2v3-lineage.apk');
const fixture=await readFile(fixturePath);
const expectedHash=createHash('sha256').update(fixture).digest('hex');
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true,serviceWorkers:'block'});
const page=await context.newPage();
const requests=[];
const errors=[];
page.on('request',request=>requests.push({method:request.method(),url:request.url(),bodyBytes:request.postDataBuffer()?.byteLength||0}));
page.on('console',message=>{if(message.type()==='error')errors.push(`console: ${message.text()}`)});
page.on('pageerror',error=>errors.push(`page: ${error.message}`));

await page.goto(`${base}/demo`,{waitUntil:'networkidle'});
const initial={
  banner:await page.getByText('Demo — sample data, nothing is saved').isVisible(),
  records:await page.locator('.record').count(),
  reset:await page.getByRole('button',{name:'Reset demo'}).isVisible(),
  startReal:await page.getByRole('link',{name:'Start for real'}).isVisible(),
};
await page.getByRole('button',{name:/verify an apk/i}).first().click();
const file=page.locator('input[type=file]');
await file.setInputFiles({name:'broken.apk',mimeType:'application/vnd.android.package-archive',buffer:Buffer.from('not an apk')});
await page.getByLabel('Source URL').fill('https://example.test/broken.apk');
await page.getByRole('button',{name:/verify and record apk/i}).click();
await page.locator('.form-error').filter({hasText:/.+/}).waitFor();
const invalidApkError=await page.locator('.form-error').innerText();

await file.setInputFiles(fixturePath);
await page.getByLabel('Source URL').fill('not a url');
await page.getByRole('button',{name:/verify and record apk/i}).click();
const invalidSource=await page.getByLabel('Source URL').evaluate(element=>({valid:element.checkValidity(),message:element.validationMessage}));
await page.getByLabel('Source URL').fill('https://example.test/lineage.apk');
await page.getByRole('button',{name:/verify and record apk/i}).click();
await page.getByText('Signature verified · v1 + v2 + v3').waitFor();
await page.getByRole('button',{name:'View full evidence'}).first().click();
const evidenceText=await page.getByRole('dialog').innerText();
await page.keyboard.press('Escape');

await page.getByRole('button',{name:'Export restore kit'}).click();
await page.getByLabel('Password',{exact:true}).fill('elevenchar!');
await page.getByLabel('Confirm password',{exact:true}).fill('elevenchar!');
await page.getByRole('button',{name:'Download encrypted kit'}).click();
const shortPassword=await page.getByLabel('Password',{exact:true}).evaluate(element=>({valid:element.checkValidity(),message:element.validationMessage}));
await page.getByLabel('Password',{exact:true}).fill('correct horse battery');
await page.getByLabel('Confirm password',{exact:true}).fill('different password');
await page.getByRole('button',{name:'Download encrypted kit'}).click();
const mismatchError=await page.locator('.form-error').innerText();
await page.getByLabel('Confirm password',{exact:true}).fill('correct horse battery');
const downloadPromise=page.waitForEvent('download');
await page.getByRole('button',{name:'Download encrypted kit'}).click();
const kit=await readFile(await (await downloadPromise).path());

await page.getByRole('button',{name:'Validate a restore kit'}).click();
await page.getByLabel('Encrypted kit').setInputFiles({name:'restore.locker',mimeType:'application/json',buffer:kit});
await page.getByLabel('Kit password').fill('wrong password');
await page.getByRole('button',{name:'Check APK evidence'}).click();
await page.locator('.form-error').filter({hasText:/.+/}).waitFor();
const wrongPasswordError=await page.locator('.form-error').innerText();
await page.getByLabel('Kit password').fill('correct horse battery');
await page.getByRole('button',{name:'Check APK evidence'}).click();
await page.getByRole('heading',{name:'1 APK matches'}).waitFor();
const validationText=await page.getByRole('dialog').innerText();
await page.keyboard.press('Escape');

await page.evaluate(async raw=>{
  const bytes=Uint8Array.from(atob(raw),character=>character.charCodeAt(0));
  const existing=JSON.parse(localStorage.getItem('demo:apk-locker:records')||'[]');
  const verified=existing.find(record=>record.verification==='verified');
  const records=Array.from({length:20},(_,index)=>({...verified,id:`verification-19-${index}`,filename:`lineage-${index}.apk`,added:new Date(Date.now()+index).toISOString(),backup:true}));
  localStorage.setItem('demo:apk-locker:records',JSON.stringify(records));
  const db=await new Promise((resolveDb,reject)=>{const request=indexedDB.open('demo:apk-locker-files',1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>resolveDb(request.result);request.onerror=()=>reject(request.error)});
  await new Promise((resolveTx,reject)=>{const transaction=db.transaction('files','readwrite');for(const record of records)transaction.objectStore('files').put(bytes.buffer.slice(0),record.id);transaction.oncomplete=resolveTx;transaction.onerror=()=>reject(transaction.error)});
  db.close();
},fixture.toString('base64'));
await page.reload({waitUntil:'networkidle'});
await page.getByRole('button',{name:'Export restore kit'}).click();
await page.getByLabel('Password',{exact:true}).fill('twenty record proof');
await page.getByLabel('Confirm password',{exact:true}).fill('twenty record proof');
const bulkDownloadPromise=page.waitForEvent('download');
await page.getByRole('button',{name:'Download encrypted kit'}).click();
const bulkKit=await readFile(await (await bulkDownloadPromise).path());
await page.getByRole('button',{name:'Validate a restore kit'}).click();
await page.getByLabel('Encrypted kit').setInputFiles({name:'twenty.locker',mimeType:'application/json',buffer:bulkKit});
await page.getByLabel('Kit password').fill('twenty record proof');
await page.getByRole('button',{name:'Check APK evidence'}).click();
await page.getByRole('heading',{name:'20 APKs match'}).waitFor({timeout:60000});
await page.screenshot({path:'.factory/verification-evidence-19/live-20-record-validation.png',fullPage:false});

const report={
  checkedAt:new Date().toISOString(),initial,invalidApkError,invalidSource,
  normal:{expectedHash,package:evidenceText.includes('android.appsecurity.cts.tinyapp'),version:evidenceText.includes('1.0 · code 10'),fingerprint:evidenceText.includes(expectedHash),signatures:evidenceText.includes('v1 + v2 + v3'),history:evidenceText.includes('Verified signing history')},
  passwordBoundary:shortPassword,mismatchError,encryptedKitHidesPackage:!kit.includes(Buffer.from('android.appsecurity.cts.tinyapp')),wrongPasswordError,
  validation:{oneMatch:validationText.includes('1 APK matches'),verifiedCopyDownload:validationText.includes('Download verified APK'),importAvailable:validationText.includes('Import verified records')},
  bulk:{records:20,report:await page.getByRole('heading',{name:'20 APKs match'}).innerText()},
  requests:{total:requests.length,thirdParty:requests.filter(request=>new URL(request.url).origin!==base),withBody:requests.filter(request=>request.bodyBytes||request.method!=='GET')},errors,
};
await writeFile('.factory/verification-evidence-19/live-flow.json',`${JSON.stringify(report,null,2)}\n`);
console.log(JSON.stringify(report,null,2));
await context.close();
await browser.close();
