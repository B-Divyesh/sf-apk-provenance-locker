import {resolve} from 'node:path';
import {chromium} from 'playwright';

const baseUrl=(process.env.LIVE_BASE_URL||'https://apk-provenance-locker.sociobot.in').replace(/\/$/,'');
const fixture=resolve('tests/fixtures/v1v2v3-lineage.apk');
const browser=await chromium.launch({headless:true});

try{
  for(const viewport of [{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844}]){
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height}});
    const page=await context.newPage();
    const requests=[];
    const errors=[];
    page.on('request',request=>requests.push({url:request.url(),method:request.method(),hasBody:request.postDataBuffer()!==null}));
    page.on('console',message=>{if(message.type()==='error')errors.push(`console: ${message.text()}`)});
    page.on('pageerror',error=>errors.push(`page: ${error.message}`));

    const response=await page.goto(`${baseUrl}/demo`,{waitUntil:'networkidle'});
    if(!response?.ok())throw new Error(`${viewport.name}: /demo returned ${response?.status()??'no response'}`);
    await page.getByRole('button',{name:/verify an apk/i}).first().click();
    await page.locator('input[type=file]').setInputFiles(fixture);
    await page.getByLabel('Source URL').fill('https://example.test/apk');
    await page.getByRole('button',{name:/verify and record apk/i}).click();
    await page.getByText('Signature verified · v1 + v2 + v3').waitFor();

    const remove=page.getByRole('button',{name:'Remove android.appsecurity.cts.tinyapp'}).first();
    await remove.click();
    await page.getByRole('heading',{name:'Remove android.appsecurity.cts.tinyapp?'}).waitFor();
    await page.getByRole('button',{name:'Keep record'}).click();
    await remove.waitFor();

    const allowedOrigins=new Set([baseUrl,'https://api.github.com']);
    const thirdParty=requests.filter(request=>!allowedOrigins.has(new URL(request.url).origin));
    const uploads=requests.filter(request=>request.method!=='GET'||request.hasBody);
    const githubApi=requests.filter(request=>request.url.includes('api.github.com'));
    if(thirdParty.length||uploads.length||githubApi.length!==1||errors.length){
      throw new Error(`${viewport.name}: dirty live flow\n${JSON.stringify({thirdParty,uploads,githubApi,errors},null,2)}`);
    }
    console.log(`${viewport.name}: clean /demo APK verification and removal confirmation; one bodyless GitHub metadata GET; zero console errors`);
    await context.close();
  }
}finally{
  await browser.close();
}
