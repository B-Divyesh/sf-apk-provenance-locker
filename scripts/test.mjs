import {spawnSync} from 'node:child_process';

const args=process.argv.slice(2);
const grep=args.indexOf('--grep');
const run=(command,commandArgs)=>{
  const result=spawnSync(command,commandArgs,{stdio:'inherit',shell:process.platform==='win32'});
  process.exitCode=result.status??1;
};

if(grep>=0){
  const filter=args[grep+1]??'';
  run('npx',['playwright','test','--grep',filter]);
  if(!process.exitCode&&filter==='@claim:release-assets')run('node',['scripts/verify-android-release.mjs']);
}
else { run('npx',['vitest','run']); if(!process.exitCode)run('npx',['playwright','test']); }
