import {spawnSync} from 'node:child_process';
import {describe,expect,it} from 'vitest';

const candidate='058fe2ce981fead74ea63fd612da05baaadaecfe';
const advancedMain='c6a968c31dc97443b743a932f09c335070aa70dd';

describe('immutable Android release candidate availability',()=>{
  it('accepts verifier 19’s tagged candidate when later QA documents advance origin/main',()=>{
    const result=spawnSync(process.execPath,['scripts/verify-release-candidate.mjs','--self-test'],{encoding:'utf8'});
    expect(result.status,result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual(expect.objectContaining({
      regression:'verifier-19-advanced-main-ancestor',
      candidate,
      advancedMain,
      relation:'ahead',
      accepted:true,
    }));
  });
});
