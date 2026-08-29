import {describe,expect,it} from 'vitest';
import {parseReleaseMetadata,releaseCommit,releaseTag} from '../src/release';

const asset=(name:string,size=2_000_000)=>({
  name,
  size,
  browser_download_url:`https://github.com/B-Divyesh/sf-apk-provenance-locker/releases/download/${releaseTag}/${name}`,
});
const metadata=(commit=releaseCommit)=>({
  tag_name:releaseTag,
  draft:false,
  body:`Built from immutable source commit ${commit}.`,
  assets:[asset('app-release.apk'),asset('app-release.aab'),asset('SHA256SUMS',160),asset('RELEASE_PROVENANCE.json',850)],
});

describe('Android release metadata',()=>{
  it('accepts only the current tag with every provenance asset',()=>{
    expect(parseReleaseMetadata(metadata())).toMatchObject({tag:releaseTag,commit:releaseCommit});
  });

  it('rejects the exact stale-binary source-commit condition',()=>{
    expect(()=>parseReleaseMetadata(metadata('0809df82645dfecf73c1d9f592cc79728b2495e3'))).toThrow('does not name this source commit');
  });

  it('rejects missing provenance and undersized Android packages',()=>{
    const missing=metadata();missing.assets=missing.assets.filter(item=>item.name!=='RELEASE_PROVENANCE.json');
    expect(()=>parseReleaseMetadata(missing)).toThrow('RELEASE_PROVENANCE.json is not published');
    const small=metadata();small.assets[0]=asset('app-release.apk',900_000);
    expect(()=>parseReleaseMetadata(small)).toThrow('too small');
  });
});
