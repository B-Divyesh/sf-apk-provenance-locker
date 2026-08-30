declare const __APP_VERSION__: string;
declare const __RELEASE_COMMIT__: string;

export const releaseRepository='B-Divyesh/sf-apk-provenance-locker';
export const releaseTag=`v${__APP_VERSION__}`;
export const releaseCommit=__RELEASE_COMMIT__;

const assetNames=['app-release.apk','app-release.aab','SHA256SUMS','RELEASE_PROVENANCE.json'] as const;
type AssetName=typeof assetNames[number];
type GitHubAsset={name?:unknown;browser_download_url?:unknown;size?:unknown};
type GitHubRelease={tag_name?:unknown;draft?:unknown;body?:unknown;assets?:unknown};

export type ReleaseMetadata={
  tag:string;
  commit:string;
  assets:Record<AssetName,{url:string;bytes:number}>;
};

export function fallbackRelease():ReleaseMetadata{
  const base=`https://github.com/${releaseRepository}/releases/download/${releaseTag}`;
  return {
    tag:releaseTag,
    commit:releaseCommit,
    assets:Object.fromEntries(assetNames.map(name=>[name,{url:`${base}/${name}`,bytes:0}])) as ReleaseMetadata['assets'],
  };
}

export function parseReleaseMetadata(value:unknown):ReleaseMetadata{
  const release=value as GitHubRelease;
  if(!release||release.draft===true||release.tag_name!==releaseTag)throw new Error(`GitHub has not published ${releaseTag} yet.`);
  if(typeof release.body!=='string'||!release.body.includes(`Built from immutable source commit ${releaseCommit}.`))throw new Error('The GitHub release does not name this source commit.');
  if(!Array.isArray(release.assets))throw new Error('The GitHub release has no downloadable assets.');
  const base=`/B-Divyesh/sf-apk-provenance-locker/releases/download/${releaseTag}/`;
  const assets={} as ReleaseMetadata['assets'];
  for(const name of assetNames){
    const asset=(release.assets as GitHubAsset[]).find(item=>item.name===name);
    if(!asset||typeof asset.browser_download_url!=='string'||typeof asset.size!=='number')throw new Error(`${name} is not published.`);
    const url=new URL(asset.browser_download_url);
    if(url.protocol!=='https:'||url.hostname!=='github.com'||url.pathname!==`${base}${name}`)throw new Error(`${name} has an unexpected download address.`);
    if((name.endsWith('.apk')||name.endsWith('.aab'))&&asset.size<=1_000_000)throw new Error(`${name} is too small to be an Android package.`);
    assets[name]={url:url.href,bytes:asset.size};
  }
  return {tag:releaseTag,commit:releaseCommit,assets};
}
