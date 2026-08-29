import {inflateSync} from 'fflate';

export type ApkIdentity={packageName:string;versionCode:number;versionName:string;minSdk?:number};
export type ApkSigner={scheme:'v1'|'v2'|'v3'|'v3.1';certificateSha256:string;subject:string};
export type LineageNode={certificateSha256:string;subject:string;capabilities:number};
export type ApkVerification={
  verified:true;
  schemes:Array<'v1'|'v2'|'v3'|'v3.1'>;
  signers:ApkSigner[];
  currentSigner:string;
  lineage:LineageNode[];
  warnings:string[];
};

type RawCert={certificateSha256?:string;subject?:string};
type RawSigner={scheme?:string;verified?:boolean;certs?:RawCert[];lineage?:LineageNode[];lineagePresent?:boolean};
type RawResult={verified?:boolean;v1Verified?:boolean;v2Verified?:boolean;v3Verified?:boolean;v31Verified?:boolean;signers?:RawSigner[];errors?:string[];warnings?:string[];error?:string};
type GoRuntime={importObject:WebAssembly.Imports;run(instance:WebAssembly.Instance):Promise<void>};

declare global {
  interface Window {
    Go?:new()=>GoRuntime;
    apksigVerify?:(bytes:Uint8Array)=>RawResult;
  }
}

let verifierReady:Promise<void>|undefined;
function loadScript(src:string){return new Promise<void>((resolve,reject)=>{const existing=document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);if(existing){if(window.Go)resolve();else existing.addEventListener('load',()=>resolve(),{once:true});return}const script=document.createElement('script');script.src=src;script.onload=()=>resolve();script.onerror=()=>reject(new Error('The local signature verifier could not load. Reload the app and try again.'));document.head.append(script)})}

async function loadVerifier(){
  if(window.apksigVerify)return;
  verifierReady??=(async()=>{
    await loadScript('/vendor/apksig/wasm_exec.js');
    if(!window.Go)throw new Error('The local signature verifier could not start.');
    const go=new window.Go();
    const response=await fetch('/vendor/apksig/apksig.wasm');
    if(!response.ok)throw new Error('The local signature verifier is unavailable.');
    const bytes=await response.arrayBuffer();
    const {instance}=await WebAssembly.instantiate(bytes,go.importObject);
    void go.run(instance);
    for(let attempt=0;attempt<100&&!window.apksigVerify;attempt++)await new Promise(resolve=>setTimeout(resolve,10));
    if(!window.apksigVerify)throw new Error('The local signature verifier did not start.');
  })();
  return verifierReady;
}

const asBytes=(input:ArrayBuffer|Uint8Array)=>input instanceof Uint8Array?input:new Uint8Array(input);
const u16=(v:DataView,p:number)=>v.getUint16(p,true);
const u32=(v:DataView,p:number)=>v.getUint32(p,true);

function zipEntry(input:ArrayBuffer|Uint8Array,wanted:string){
  const bytes=asBytes(input),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),n=bytes.length;
  let eocd=-1;
  for(let p=n-22;p>=Math.max(0,n-65557);p--)if(u32(view,p)===0x06054b50){eocd=p;break}
  if(eocd<0)throw new Error('This file is not a ZIP-based APK.');
  const entries=u16(view,eocd+10),cd=u32(view,eocd+16);let p=cd;
  for(let i=0;i<entries;i++){
    if(p+46>n||u32(view,p)!==0x02014b50)throw new Error('This APK has an invalid ZIP directory.');
    const method=u16(view,p+10),compressed=u32(view,p+20),uncompressed=u32(view,p+24),nameLength=u16(view,p+28),extraLength=u16(view,p+30),commentLength=u16(view,p+32),local=u32(view,p+42);
    const name=new TextDecoder().decode(bytes.subarray(p+46,p+46+nameLength));
    if(name===wanted){
      if(local+30>n||u32(view,local)!==0x04034b50)throw new Error(`The ${wanted} ZIP entry is invalid.`);
      const start=local+30+u16(view,local+26)+u16(view,local+28),payload=bytes.subarray(start,start+compressed);
      if(payload.length!==compressed)throw new Error(`The ${wanted} ZIP entry is truncated.`);
      const output=method===0?payload:method===8?inflateSync(payload):undefined;
      if(!output)throw new Error(`The ${wanted} ZIP compression method is not supported.`);
      if(output.length!==uncompressed)throw new Error(`The ${wanted} ZIP entry has the wrong size.`);
      return output;
    }
    p+=46+nameLength+extraLength+commentLength;
  }
  throw new Error(`This APK does not contain ${wanted}.`);
}

function readLength8(bytes:Uint8Array,offset:number){let value=bytes[offset++];if(value&0x80)value=((value&0x7f)<<8)|bytes[offset++];return [value,offset] as const}
function readLength16(view:DataView,offset:number){let value=u16(view,offset);offset+=2;if(value&0x8000){value=((value&0x7fff)<<16)|u16(view,offset);offset+=2}return [value,offset] as const}
function stringPool(bytes:Uint8Array,offset:number){
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  if(u16(view,offset)!==0x0001)throw new Error('The Android manifest has no readable string pool.');
  const header=u16(view,offset+2),size=u32(view,offset+4),count=u32(view,offset+8),flags=u32(view,offset+16),start=u32(view,offset+20),utf8=Boolean(flags&0x100),strings:string[]=[];
  if(header<28||offset+size>bytes.length||count>100000)throw new Error('The Android manifest string pool is invalid.');
  for(let i=0;i<count;i++){
    let p=offset+start+u32(view,offset+header+i*4);
    if(utf8){[,p]=readLength8(bytes,p);let length;[length,p]=readLength8(bytes,p);strings.push(new TextDecoder().decode(bytes.subarray(p,p+length)))}
    else {let length;[length,p]=readLength16(view,p);strings.push(new TextDecoder('utf-16le').decode(bytes.subarray(p,p+length*2)))}
  }
  return {strings,next:offset+size};
}

/** Extract the signed package/version identity from Android's binary XML. */
export async function extractApkIdentity(input:ArrayBuffer|Uint8Array):Promise<ApkIdentity>{
  const bytes=zipEntry(input,'AndroidManifest.xml'),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  if(bytes.length<16||u16(view,0)!==0x0003)throw new Error('AndroidManifest.xml is not compiled Android XML.');
  const pool=stringPool(bytes,8);let p=pool.next;
  while(p+8<=bytes.length){
    const type=u16(view,p),header=u16(view,p+2),size=u32(view,p+4);
    if(size<header||size<8||p+size>bytes.length)throw new Error('AndroidManifest.xml contains an invalid chunk.');
    if(type===0x0102){
      const tagName=pool.strings[u32(view,p+20)];
      if(tagName==='manifest'){
        const attrStart=u16(view,p+24),attrSize=u16(view,p+26),attrCount=u16(view,p+28),values=new Map<string,string|number>();
        if(attrSize<20||attrCount>1000)throw new Error('The manifest attributes are invalid.');
        for(let i=0;i<attrCount;i++){
          const a=p+16+attrStart+i*attrSize;
          if(a+20>p+size)throw new Error('A manifest attribute is truncated.');
          const name=pool.strings[u32(view,a+4)],raw=u32(view,a+8),dataType=bytes[a+15],data=u32(view,a+16);
          if(!name)continue;
          if(raw!==0xffffffff)values.set(name,pool.strings[raw]);
          else if(dataType===0x03)values.set(name,pool.strings[data]);
          else if(dataType===0x10||dataType===0x11)values.set(name,data);
        }
        const packageName=String(values.get('package')||''),versionCode=Number(values.get('versionCode')||0),versionCodeMajor=Number(values.get('versionCodeMajor')||0),versionName=String(values.get('versionName')||versionCode||'');
        if(!/^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/.test(packageName)||!Number.isInteger(versionCode)||versionCode<0)throw new Error('The APK package name or version code is missing.');
        return {packageName,versionCode:versionCodeMajor*0x100000000+versionCode,versionName};
      }
    }
    p+=size;
  }
  throw new Error('AndroidManifest.xml has no manifest element.');
}

/** Cryptographically verify the APK locally with the pinned apksig verifier. */
export async function verifyApk(input:ArrayBuffer|Uint8Array):Promise<ApkVerification>{
  if(typeof window==='undefined')throw new Error('APK verification requires the browser runtime.');
  await loadVerifier();
  const raw=window.apksigVerify!(asBytes(input));
  if(!raw.verified){const detail=[raw.error,...(raw.errors||[])].filter(Boolean).join(' ');throw new Error(`APK signature verification failed.${detail?` ${detail}`:''}`)}
  const flags:Array<[boolean|undefined,'v1'|'v2'|'v3'|'v3.1']>=[[raw.v1Verified,'v1'],[raw.v2Verified,'v2'],[raw.v3Verified,'v3'],[raw.v31Verified,'v3.1']];
  const schemes=flags.filter(([verified])=>verified).map(([,name])=>name);
  const verifiedSigners=(raw.signers||[]).filter(signer=>signer.verified&&schemes.includes(signer.scheme as typeof schemes[number]));
  const signers:ApkSigner[]=verifiedSigners.flatMap(signer=>(signer.certs||[]).map(cert=>({scheme:signer.scheme as ApkSigner['scheme'],certificateSha256:String(cert.certificateSha256||''),subject:String(cert.subject||'')}))).filter(signer=>/^[a-f0-9]{64}$/.test(signer.certificateSha256));
  const strongest=['v3.1','v3','v2','v1'].map(scheme=>verifiedSigners.find(signer=>signer.scheme===scheme&&(signer.certs||[]).length)).find(Boolean);
  const currentSigner=String(strongest?.certs?.[0]?.certificateSha256||'');
  if(!schemes.length||!currentSigner)throw new Error('APK signature verification did not return a verified signer certificate.');
  const lineageSigner=verifiedSigners.find(signer=>signer.scheme==='v3.1'&&signer.lineage?.length)||verifiedSigners.find(signer=>signer.scheme==='v3'&&signer.lineage?.length);
  return {verified:true,schemes,signers,currentSigner,lineage:lineageSigner?.lineage||[],warnings:raw.warnings||[]};
}

export type Compatibility={kind:'first'|'upgrade'|'same'|'downgrade'|'signer-change';message:string};
export function assessCompatibility(next:{packageName:string;versionCode:number;currentSigner:string;lineage:LineageNode[]},records:Array<{packageName:string;versionCode:number;currentSigner:string;lineage:LineageNode[]}>):Compatibility{
  const prior=records.filter(record=>record.packageName===next.packageName).sort((a,b)=>b.versionCode-a.versionCode)[0];
  if(!prior)return {kind:'first',message:'First verified record for this package.'};
  const nextAcceptsPrior=next.currentSigner===prior.currentSigner||next.lineage.some(node=>node.certificateSha256===prior.currentSigner);
  const priorAcceptsNext=prior.currentSigner===next.currentSigner||prior.lineage.some(node=>node.certificateSha256===next.currentSigner);
  if(!nextAcceptsPrior&&!priorAcceptsNext)return {kind:'signer-change',message:`Signer change: this certificate is outside the verified lineage recorded for version code ${prior.versionCode}. Android will reject it as an update.`};
  if(next.versionCode<prior.versionCode)return {kind:'downgrade',message:`Incompatible downgrade risk: version code ${next.versionCode} is below recorded ${prior.versionCode}. Android normally blocks this install.`};
  if(next.versionCode===prior.versionCode)return {kind:'same',message:`Same package, signer lineage, and version code ${next.versionCode}.`};
  return {kind:'upgrade',message:`Compatible signer lineage and a higher version code than ${prior.versionCode}.`};
}
