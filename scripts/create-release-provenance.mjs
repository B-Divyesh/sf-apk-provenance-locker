import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createReadStream,readFileSync,statSync,writeFileSync} from 'node:fs';

const args=process.argv.slice(2);
const option=name=>{const index=args.indexOf(name);return index<0?undefined:args[index+1]};
const apk=option('--apk')||'app-release.apk';
const aab=option('--aab')||'app-release.aab';
const output=option('--output')||'RELEASE_PROVENANCE.json';
const packageInfo=JSON.parse(readFileSync('package.json','utf8'));
const commit=(option('--commit')||process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'})).trim();
const identity=JSON.parse(readFileSync('dist/build.json','utf8'));

if(!/^[0-9a-f]{40}$/.test(commit))throw new Error(`Invalid immutable commit: ${commit}`);
if(identity.product!=='apk-provenance-locker'||identity.version!==packageInfo.version||identity.commit!==commit)throw new Error('dist/build.json does not match the release source identity');

async function sha256(path){
  const hash=createHash('sha256');
  for await(const chunk of createReadStream(path))hash.update(chunk);
  return hash.digest('hex');
}

const artifacts=[];
for(const [name,path] of [['app-release.apk',apk],['app-release.aab',aab]])artifacts.push({name,bytes:statSync(path).size,sha256:await sha256(path)});
const provenance={
  schema:'https://sociobot.in/schemas/android-release-provenance/v1',
  product:'apk-provenance-locker',
  repository:'B-Divyesh/sf-apk-provenance-locker',
  version:packageInfo.version,
  tag:`v${packageInfo.version}`,
  commit,
  artifacts,
};
writeFileSync(output,`${JSON.stringify(provenance,null,2)}\n`);
console.log(JSON.stringify(provenance,null,2));
