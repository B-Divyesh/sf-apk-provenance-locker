import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';
import {assessCompatibility,extractApkIdentity} from '../src/apk';

const fixture=(name:string)=>readFile(resolve('tests/fixtures',name));

describe('researched APK provenance contract',()=>{
  it('extracts package identity from the compiled manifest',async()=>{
    const apk=await fixture('v1v2v3-lineage.apk');
    const identity=await extractApkIdentity(apk);
    expect(identity).toEqual({packageName:'android.appsecurity.cts.tinyapp',versionCode:10,versionName:'1.0'});
  });

  it('detects downgrade and signer incompatibility from verified fields',()=>{
    const base={packageName:'in.example.app',versionCode:20,currentSigner:'a'.repeat(64),lineage:[]};
    expect(assessCompatibility({...base,versionCode:19},[base]).kind).toBe('downgrade');
    expect(assessCompatibility({...base,versionCode:21,currentSigner:'b'.repeat(64)},[base]).kind).toBe('signer-change');
    expect(assessCompatibility({...base,versionCode:21,currentSigner:'b'.repeat(64),lineage:[{certificateSha256:'a'.repeat(64),subject:'old',capabilities:0}]},[base]).kind).toBe('upgrade');
  });
});
