import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createReadStream,existsSync,readFileSync,statSync} from 'node:fs';
import {mkdtemp,readFile,rm,stat,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {tmpdir} from 'node:os';
import {extname,join,normalize} from 'node:path';
import {chromium} from 'playwright';
import {verifyReleaseCandidate} from './verify-release-candidate.mjs';

const args=process.argv.slice(2);
const option=name=>{const index=args.indexOf(name);return index<0?undefined:args[index+1]};
const has=name=>args.includes(name);
const packageInfo=JSON.parse(readFileSync('package.json','utf8'));
const version=packageInfo.version;
const tag=`v${version}`;
function taggedCommit(){try{return execFileSync('git',['rev-parse',`${tag}^{commit}`],{encoding:'utf8'}).trim()}catch{return undefined}}
const expectedCommit=(option('--expected-commit')||process.env.GITHUB_SHA||taggedCommit()||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'})).trim();
const repository='B-Divyesh/sf-apk-provenance-locker';
const apiBase=`https://api.github.com/repos/${repository}`;
const temporary=await mkdtemp(join(tmpdir(),'apk-locker-release-'));
const local=Boolean(option('--apk'));
const apk=option('--apk')||join(temporary,'app-release.apk');
const aab=option('--aab')||join(temporary,'app-release.aab');
const checksums=option('--checksums')||join(temporary,'SHA256SUMS');
const provenance=option('--provenance')||join(temporary,'RELEASE_PROVENANCE.json');
const expectedIdentity={product:'apk-provenance-locker',version,commit:expectedCommit};
let server;
let browser;
let publishedRelease;

function invariant(condition,message){if(!condition)throw new Error(message)}
function apiHeaders(){return {'user-agent':'apk-provenance-locker-release-check',accept:'application/vnd.github+json',...(process.env.GITHUB_TOKEN?{authorization:`Bearer ${process.env.GITHUB_TOKEN}`}:{})}}
async function githubJson(path){
  const response=await fetch(`${apiBase}${path}`,{headers:apiHeaders()});
  invariant(response.ok,`GitHub API ${path} returned HTTP ${response.status}`);
  return response.json();
}
async function inspectPublishedRelease(){
  const release=await githubJson(`/releases/tags/${tag}`);
  invariant(release.tag_name===tag,`Release tag is ${release.tag_name}; expected ${tag}`);
  invariant(release.draft===false,`${tag} is still a draft`);
  invariant(typeof release.body==='string'&&release.body.includes(`Built from immutable source commit ${expectedCommit}.`),'Release notes do not bind the immutable source commit');
  const ref=await githubJson(`/git/ref/tags/${tag}`);
  let object=ref.object;
  if(object?.type==='tag')object=(await githubJson(`/git/tags/${object.sha}`)).object;
  invariant(object?.type==='commit'&&object.sha===expectedCommit,`${tag} points to ${object?.sha}; expected ${expectedCommit}`);
  const assets=Object.fromEntries((release.assets||[]).map(asset=>[asset.name,asset]));
  for(const name of ['app-release.apk','app-release.aab','SHA256SUMS','RELEASE_PROVENANCE.json']){
    const asset=assets[name];
    invariant(asset,`${tag}/${name} is not published`);
    invariant(asset.browser_download_url===`https://github.com/${repository}/releases/download/${tag}/${name}`,`${name} has an unexpected download URL`);
  }
  return {release,assets};
}
async function download(name,destination){
  const response=await fetch(publishedRelease.assets[name].browser_download_url,{redirect:'follow',headers:{'user-agent':'apk-provenance-locker-release-check'}});
  invariant(response.ok,`${tag}/${name} returned HTTP ${response.status}`);
  await writeFile(destination,Buffer.from(await response.arrayBuffer()));
}
async function sha256(path){
  const hash=createHash('sha256');
  for await(const chunk of createReadStream(path))hash.update(chunk);
  return hash.digest('hex');
}
function zipText(path,entry){return execFileSync('unzip',['-p',path,entry],{encoding:'utf8'})}
function sameIdentity(actual,label){
  invariant(actual.product===expectedIdentity.product,`${label} product is ${actual.product}`);
  invariant(actual.version===expectedIdentity.version,`${label} version is ${actual.version}; expected ${version}`);
  invariant(actual.commit===expectedIdentity.commit,`${label} commit is ${actual.commit}; expected ${expectedCommit}`);
}
function contentType(path){return ({'.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm','.webmanifest':'application/manifest+json','.webp':'image/webp'}[extname(path)]||'application/octet-stream')}
async function servePackagedWeb(root){
  const http=createServer(async(request,response)=>{
    try{
      const pathname=decodeURIComponent(new URL(request.url||'/', 'http://127.0.0.1').pathname);
      const relative=normalize(pathname).replace(/^[/\\]+/,'');
      let path=join(root,relative);
      if(!existsSync(path)||(await stat(path)).isDirectory())path=join(root,'index.html');
      invariant(path.startsWith(root),'Request escaped the packaged web root');
      response.writeHead(200,{'content-type':contentType(path),'cache-control':'no-store'});
      createReadStream(path).pipe(response);
    }catch(error){response.writeHead(500,{'content-type':'text/plain'});response.end(error instanceof Error?error.message:String(error))}
  });
  await new Promise(resolve=>http.listen(0,'127.0.0.1',resolve));
  const address=http.address();
  invariant(address&&typeof address==='object','Packaged test server did not start');
  return {http,url:`http://127.0.0.1:${address.port}`};
}
async function seedRealStorage(page){
  await page.evaluate(async()=>{
    localStorage.setItem('apk-locker:records',JSON.stringify([{id:'real-sentinel',packageName:'in.example.real',versionCode:1,versionName:'1.0',source:'manual import',filename:'real.apk',size:3,sha256:'7'.repeat(64),currentSigner:'',signers:[],lineage:[],schemes:[],added:'2026-08-29T00:00:00.000Z',backup:true,verification:'sample'}]));
    const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('apk-locker-files',1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
    await new Promise((resolve,reject)=>{const request=db.transaction('files','readwrite').objectStore('files').put(new Uint8Array([7,8,9]).buffer,'real-sentinel');request.onsuccess=()=>resolve();request.onerror=()=>reject(request.error)});
    db.close();
  });
}
async function seedDemoStorage(page){
  await page.evaluate(async()=>{
    localStorage.setItem('demo:sb_license:apk-provenance-locker','demo-license');
    localStorage.setItem('demo:sb_license:apk-provenance-locker:verdict','{"valid":true}');
    const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('demo:apk-locker-files',1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
    await new Promise((resolve,reject)=>{const request=db.transaction('files','readwrite').objectStore('files').put(new Uint8Array([1,2,3]).buffer,'demo-sentinel');request.onsuccess=()=>resolve();request.onerror=()=>reject(request.error)});
    db.close();
  });
}
async function inspectStorage(page){
  return page.evaluate(async()=>{
    const databaseNames=(await indexedDB.databases()).map(database=>database.name);
    const realBytes=await new Promise((resolve,reject)=>{const request=indexedDB.open('apk-locker-files');request.onsuccess=()=>{const db=request.result;const read=db.transaction('files').objectStore('files').get('real-sentinel');read.onsuccess=()=>{db.close();resolve(read.result?Array.from(new Uint8Array(read.result)):null)};read.onerror=()=>{db.close();reject(read.error)}};request.onerror=()=>reject(request.error)});
    return {
      demoRecords:localStorage.getItem('demo:apk-locker:records'),
      demoLicense:localStorage.getItem('demo:sb_license:apk-provenance-locker'),
      demoVerdict:localStorage.getItem('demo:sb_license:apk-provenance-locker:verdict'),
      realRecords:localStorage.getItem('apk-locker:records'),
      databaseNames,
      realBytes,
    };
  });
}
async function verifyDemoErasure(baseUrl){
  browser=await chromium.launch({headless:true});
  const exits=[
    {name:'Start for real',url:url=>url.pathname==='/'&&!url.hash,click:page=>page.getByRole('link',{name:'Start for real'}).click()},
    {name:'Locker',url:url=>url.pathname==='/'&&url.hash==='#locker',click:page=>page.getByRole('link',{name:'Locker',exact:true}).click()},
    {name:'wordmark',url:url=>url.pathname==='/'&&!url.hash,click:page=>page.locator('.wordmark').click()},
  ];
  const results=[];
  for(const exit of exits){
    const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
    const page=await context.newPage();
    const errors=[];
    page.on('console',message=>{if(message.type()==='error')errors.push(`console: ${message.text()}`)});
    page.on('pageerror',error=>errors.push(`page: ${error.message}`));
    await page.goto(`${baseUrl}/`,{waitUntil:'networkidle'});
    await seedRealStorage(page);
    await page.goto(`${baseUrl}/demo`,{waitUntil:'networkidle'});
    await page.getByText('Demo — sample data, nothing is saved').waitFor();
    invariant(await page.locator('.record').count()===2,`${exit.name}: demo did not start with two sample records`);
    await seedDemoStorage(page);
    await Promise.all([page.waitForURL(exit.url),exit.click(page)]);
    invariant(await page.getByText('Demo — sample data, nothing is saved').count()===0,`${exit.name}: demo banner remained after exit`);
    const storage=await inspectStorage(page);
    invariant(storage.demoRecords===null,`${exit.name}: demo records remained`);
    invariant(storage.demoLicense===null,`${exit.name}: demo license remained`);
    invariant(storage.demoVerdict===null,`${exit.name}: demo license verdict remained`);
    invariant(!storage.databaseNames.includes('demo:apk-locker-files'),`${exit.name}: demo saved-copy database remained`);
    invariant(JSON.parse(storage.realRecords||'[]')[0]?.id==='real-sentinel',`${exit.name}: real records changed`);
    invariant(JSON.stringify(storage.realBytes)==='[7,8,9]',`${exit.name}: real saved copy changed`);
    invariant(errors.length===0,`${exit.name}: browser errors: ${errors.join('; ')}`);
    await page.goto(`${baseUrl}/demo`,{waitUntil:'networkidle'});
    invariant(await page.locator('.record').count()===2,`${exit.name}: demo did not reseed after exit`);
    results.push({exit:exit.name,demoErased:true,realStoragePreserved:true,reseededRecords:2,errors});
    await context.close();
  }
  return results;
}

try{
  if(!local){
    await verifyReleaseCandidate({expectedCommit});
    publishedRelease=await inspectPublishedRelease();
    await Promise.all([download('app-release.apk',apk),download('app-release.aab',aab),download('SHA256SUMS',checksums),download('RELEASE_PROVENANCE.json',provenance)]);
  }
  for(const [label,path] of [['APK',apk],['AAB',aab],['SHA256SUMS',checksums],['release provenance',provenance]])invariant(existsSync(path),`${label} is missing: ${path}`);
  invariant(statSync(apk).size>1_000_000,`APK is too small: ${statSync(apk).size} bytes`);
  invariant(statSync(aab).size>1_000_000,`AAB is too small: ${statSync(aab).size} bytes`);
  const expectedHashes=Object.fromEntries((await readFile(checksums,'utf8')).trim().split('\n').map(line=>{const [hash,name]=line.trim().split(/\s+/);return [name.replace(/^\*/,''),hash]}));
  const apkHash=await sha256(apk),aabHash=await sha256(aab);
  invariant(expectedHashes['app-release.apk']===apkHash,'APK does not match SHA256SUMS');
  invariant(expectedHashes['app-release.aab']===aabHash,'AAB does not match SHA256SUMS');
  const releaseProvenance=JSON.parse(await readFile(provenance,'utf8'));
  sameIdentity(releaseProvenance,'Release provenance');
  invariant(releaseProvenance.schema==='https://sociobot.in/schemas/android-release-provenance/v1','Release provenance schema is invalid');
  invariant(releaseProvenance.repository===repository,'Release provenance names the wrong repository');
  invariant(releaseProvenance.tag===tag,`Release provenance tag is ${releaseProvenance.tag}; expected ${tag}`);
  const provenanceArtifacts=Object.fromEntries((releaseProvenance.artifacts||[]).map(artifact=>[artifact.name,artifact]));
  invariant(provenanceArtifacts['app-release.apk']?.sha256===apkHash&&provenanceArtifacts['app-release.apk']?.bytes===statSync(apk).size,'Release provenance does not match the APK');
  invariant(provenanceArtifacts['app-release.aab']?.sha256===aabHash&&provenanceArtifacts['app-release.aab']?.bytes===statSync(aab).size,'Release provenance does not match the AAB');
  const apkIdentity=JSON.parse(zipText(apk,'assets/public/build.json'));
  const aabIdentity=JSON.parse(zipText(aab,'base/assets/public/build.json'));
  if(!has('--skip-identity')){sameIdentity(apkIdentity,'APK');sameIdentity(aabIdentity,'AAB')}
  const extracted=join(temporary,'packaged');
  execFileSync('unzip',['-q',apk,'assets/public/*','-d',extracted]);
  const served=await servePackagedWeb(join(extracted,'assets/public'));
  server=served.http;
  const exits=await verifyDemoErasure(served.url);
  console.log(JSON.stringify({tag,expectedCommit,tagCommit:publishedRelease?expectedCommit:'local package check',provenance:releaseProvenance,apk:{bytes:statSync(apk).size,sha256:apkHash,identity:apkIdentity},aab:{bytes:statSync(aab).size,sha256:aabHash,identity:aabIdentity},demoErasure:exits},null,2));
}finally{
  if(browser)await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
  await rm(temporary,{recursive:true,force:true});
}
