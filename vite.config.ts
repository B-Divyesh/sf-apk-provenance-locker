import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const packageVersion=(JSON.parse(readFileSync('package.json','utf8')) as {version:string}).version;
const commit=(process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'})).trim();

export default defineConfig({
  build:{target:'es2022',cssCodeSplit:false},
  define:{
    __APP_VERSION__:JSON.stringify(packageVersion),
    __BUILD_COMMIT__:JSON.stringify(commit),
  },
  plugins:[{
    name:'release-identity',
    generateBundle(){
      this.emitFile({
        type:'asset',
        fileName:'build.json',
        source:`${JSON.stringify({product:'apk-provenance-locker',version:packageVersion,commit},null,2)}\n`,
      });
    },
  }],
  test:{environment:'jsdom',include:['tests/**/*.test.ts']},
});
