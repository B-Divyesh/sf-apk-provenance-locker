import {createHash} from 'node:crypto';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {join,relative} from 'node:path';

const base='https://apk-provenance-locker.sociobot.in';
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const paths=[];
async function walk(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const path=join(directory,entry.name);
    if(entry.isDirectory())await walk(path);else paths.push(relative('dist',path).replaceAll('\\','/'));
  }
}
await walk('dist');
const files=[];
for(const path of paths.filter(path=>path!=='staticwebapp.config.json')){
  const local=await readFile(join('dist',path));
  const response=await fetch(`${base}/${path}`);
  const live=Buffer.from(await response.arrayBuffer());
  files.push({path,status:response.status,bytes:live.length,localSha256:sha256(local),liveSha256:sha256(live),equal:local.equals(live),cacheControl:response.headers.get('cache-control'),contentType:response.headers.get('content-type')});
}
const rootResponse=await fetch(base);
const buildResponse=await fetch(`${base}/build.json`);
const deploymentConfigResponse=await fetch(`${base}/staticwebapp.config.json`);
const report={
  checkedAt:new Date().toISOString(),
  candidate:'058fe2ce981fead74ea63fd612da05baaadaecfe',
  build:await buildResponse.json(),
  rootHeaders:Object.fromEntries(rootResponse.headers),
  deploymentConfigStatus:deploymentConfigResponse.status,
  files,
  mismatches:files.filter(file=>!file.equal),
};
await writeFile('.factory/verification-evidence-19/deployment-audit.json',`${JSON.stringify(report,null,2)}\n`);
console.log(JSON.stringify({build:report.build,fileCount:files.length,mismatches:report.mismatches,cacheClasses:[...new Set(files.map(file=>file.cacheControl))],rootHeaders:report.rootHeaders},null,2));
