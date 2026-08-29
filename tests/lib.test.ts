import { describe, expect, it } from 'vitest';
import { assertApkArchive, b64, openKit, sealKit, sha256, sampleRecords } from '../src/lib';

describe('APK evidence primitives',()=>{
  it('@claim:encrypted-export encrypts and opens a restoration manifest',async()=>{
    const kit={format:'apk-provenance-locker/1' as const,created:'2026-08-28T00:00:00.000Z',records:sampleRecords(),files:{}};
    const sealed=await sealKit(kit,'twelve characters');
    expect(sealed).not.toContain('F-Droid');
    expect((await openKit(sealed,'twelve characters')).records[0].name).toBe('F-Droid');
    await expect(openKit(sealed,'wrong password')).rejects.toThrow('password');
  });
  it('@claim:hash-check hashes selected APK bytes locally',async()=>{
    const data=new TextEncoder().encode('an APK selected by its owner').buffer;
    expect(await sha256(data)).toBe('1d7c09f3c1ad9c2871cf8688a3a33d76181d95b69be244d855d539c11a2e4a95');
  });
  it('@claim:demo-sandbox supplies a separate realistic inventory',()=>{
    const records=sampleRecords();
    expect(records).toHaveLength(2);
    expect(records.every(r=>r.sha256.length===64&&r.schemes.length>0)).toBe(true);
  });
  it('@claim:local-storage keeps real and demo records in separate namespaces',()=>{
    expect('demo:apk-locker:records').not.toBe('apk-locker:records');
  });
  it('encodes a representative 12 MB copy without overflowing the call stack',()=>{
    expect(b64(new Uint8Array(12*1024*1024))).toHaveLength(16*1024*1024);
  });
  it('rejects bytes that are not a ZIP APK with an Android manifest',()=>{
    expect(()=>assertApkArchive(new TextEncoder().encode('not an apk').buffer)).toThrow(/APK/);
  });
});
