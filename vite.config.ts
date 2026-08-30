import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const packageVersion=(JSON.parse(readFileSync('package.json','utf8')) as {version:string}).version;
const buildCommit=(process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'})).trim();
function taggedReleaseCommit(){
  try{return execFileSync('git',['rev-parse',`v${packageVersion}^{commit}`],{encoding:'utf8'}).trim();}
  catch{return buildCommit;}
}
const releaseCommit=(process.env.ANDROID_RELEASE_COMMIT||taggedReleaseCommit()).trim();
if(!/^[0-9a-f]{40}$/.test(releaseCommit))throw new Error('Android release commit must be a complete lowercase SHA.');

export default defineConfig({
  build:{target:'es2022',cssCodeSplit:false},
  define:{
    __APP_VERSION__:JSON.stringify(packageVersion),
    __BUILD_COMMIT__:JSON.stringify(buildCommit),
    __RELEASE_COMMIT__:JSON.stringify(releaseCommit),
  },
  plugins:[{
    name:'release-identity',
    generateBundle(){
      this.emitFile({
        type:'asset',
        fileName:'build.json',
        source:`${JSON.stringify({product:'apk-provenance-locker',version:packageVersion,commit:buildCommit},null,2)}\n`,
      });
    },
  }],
  test:{environment:'jsdom',include:['tests/**/*.test.ts']},
});
