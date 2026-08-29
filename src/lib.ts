export type ApkRecord = { id:string; name:string; version:string; source:string; filename:string; size:number; sha256:string; signer:string; schemes:string[]; added:string; backup:boolean };
export type Kit = { format:'apk-provenance-locker/1'; created:string; records:ApkRecord[]; files:Record<string,string> };
const te=new TextEncoder(), td=new TextDecoder();
export const bytesToHex=(b:ArrayBuffer|Uint8Array)=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');
/**
 * Convert in slices.  Spreading a normal APK into String.fromCharCode blows
 * the JavaScript argument stack at roughly a few megabytes.
 */
export function b64(b:ArrayBuffer|Uint8Array){
 const bytes=b instanceof Uint8Array?b:new Uint8Array(b), chunk=0x8000;
 let binary='';
 for(let offset=0;offset<bytes.length;offset+=chunk){
   binary+=String.fromCharCode(...bytes.subarray(offset,Math.min(offset+chunk,bytes.length)));
 }
 return btoa(binary);
}
export function unb64(s:string){
 const binary=atob(s), out=new Uint8Array(binary.length);
 for(let i=0;i<binary.length;i++)out[i]=binary.charCodeAt(i);
 return out;
}
export async function sha256(data:ArrayBuffer|Uint8Array){const input=data instanceof Uint8Array?data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength):data;return bytesToHex(await crypto.subtle.digest('SHA-256',input as ArrayBuffer))}
export function shortHash(hash:string){return `${hash.slice(0,12)}…${hash.slice(-8)}`}
export async function sealKit(kit:Kit,password:string){
 const salt=crypto.getRandomValues(new Uint8Array(16)), iv=crypto.getRandomValues(new Uint8Array(12));
 const base=await crypto.subtle.importKey('raw',te.encode(password),'PBKDF2',false,['deriveKey']);
 const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:210000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt']);
 const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,te.encode(JSON.stringify(kit)));
 return JSON.stringify({format:'apk-provenance-locker/encrypted/1',kdf:'PBKDF2-SHA256',iterations:210000,salt:b64(salt),iv:b64(iv),ciphertext:b64(ciphertext)});
}
export async function openKit(text:string,password:string):Promise<Kit>{
 const env=JSON.parse(text); if(env.format!=='apk-provenance-locker/encrypted/1') throw new Error('This is not a Locker restore kit.');
 const base=await crypto.subtle.importKey('raw',te.encode(password),'PBKDF2',false,['deriveKey']);
 const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:unb64(env.salt),iterations:env.iterations,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['decrypt']);
 try { const out=JSON.parse(td.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(env.iv)},key,unb64(env.ciphertext)))); if(out.format!=='apk-provenance-locker/1') throw 0; return out } catch { throw new Error('That password did not open this restore kit.'); }
}
function u32(v:DataView,p:number){return v.getUint32(p,true)}
function u64(v:DataView,p:number){return Number(v.getBigUint64(p,true))}
function readLen(bytes:Uint8Array,p:number){if(p+4>bytes.length)throw new Error('Unexpected end of signing block.');const n=new DataView(bytes.buffer,bytes.byteOffset+p,4).getUint32(0,true);if(p+4+n>bytes.length)throw new Error('Invalid signing block.');return [bytes.subarray(p+4,p+4+n),p+4+n] as const}
/** Validate the ZIP directory/local-header relationship and require AndroidManifest.xml. */
export function assertApkArchive(data:ArrayBuffer){
 const bytes=new Uint8Array(data), view=new DataView(data), n=bytes.length;
 if(n<22)throw new Error('This file is too short to be an APK.');
 let eocd=-1;
 for(let p=n-22;p>=Math.max(0,n-65557);p--)if(u32(view,p)===0x06054b50){eocd=p;break}
 if(eocd<0)throw new Error('This file is not a ZIP-based APK.');
 const commentLength=view.getUint16(eocd+20,true), entries=view.getUint16(eocd+10,true), cdSize=u32(view,eocd+12), cd=u32(view,eocd+16);
 if(eocd+22+commentLength!==n||view.getUint16(eocd+4,true)!==0||view.getUint16(eocd+6,true)!==0||view.getUint16(eocd+8,true)!==entries||entries<1||cd+cdSize!==eocd)throw new Error('This APK has an invalid ZIP directory.');
 let p=cd, hasManifest=false;
 for(let i=0;i<entries;i++){
   if(p+46>n||u32(view,p)!==0x02014b50)throw new Error('This APK has an invalid ZIP entry.');
   const flags=view.getUint16(p+8,true), compressedSize=u32(view,p+20), nameLength=view.getUint16(p+28,true), extraLength=view.getUint16(p+30,true), entryCommentLength=view.getUint16(p+32,true), local=u32(view,p+42);
   if(flags&1)throw new Error('Encrypted ZIP entries are not valid APK evidence.');
   if(p+46+nameLength+extraLength+entryCommentLength>eocd||local+30>cd||u32(view,local)!==0x04034b50)throw new Error('This APK has a truncated ZIP entry.');
   const name=new TextDecoder().decode(bytes.slice(p+46,p+46+nameLength));
   const localFlags=view.getUint16(local+6,true), localMethod=view.getUint16(local+8,true), method=view.getUint16(p+10,true), localCompressedSize=u32(view,local+18), localNameLength=view.getUint16(local+26,true), localExtraLength=view.getUint16(local+28,true), localName=new TextDecoder().decode(bytes.slice(local+30,local+30+localNameLength));
   if(localFlags!==flags||localMethod!==method||(!(flags&8)&&localCompressedSize!==compressedSize)||local+30+localNameLength+localExtraLength+compressedSize>cd||localName!==name)throw new Error('This APK has an invalid local ZIP entry.');
   if(name==='AndroidManifest.xml')hasManifest=true;
   p+=46+nameLength+extraLength+entryCommentLength;
 }
 if(p!==eocd)throw new Error('This APK has an inconsistent ZIP directory.');
 if(!hasManifest)throw new Error('This ZIP does not contain AndroidManifest.xml, so it is not an APK.');
}
/** Reads one embedded v2/v3 certificate fingerprint. It does not verify a signature. */
export async function readSigner(data:ArrayBuffer):Promise<{schemes:string[]; signer:string}>{
 const v=new DataView(data), n=data.byteLength; if(n<22) return {schemes:[],signer:'Not found'};
 let eocd=-1; for(let p=n-22;p>=Math.max(0,n-65557);p--){if(u32(v,p)===0x06054b50){eocd=p;break}} if(eocd<0)return {schemes:[],signer:'Not found'};
 const cd=u32(v,eocd+16); if(cd<24||cd>n)return {schemes:[],signer:'Not found'};
 const magic='APK Sig Block 42', m=te.encode(magic); for(let i=0;i<m.length;i++)if(new Uint8Array(data)[cd-16+i]!==m[i])return {schemes:[],signer:'No supported evidence'};
 const size=u64(v,cd-24); const block=cd-(size+8); if(!Number.isSafeInteger(size)||block<0||u64(v,block)!==size)return {schemes:[],signer:'Unreadable signing block'};
 let p=block+8; const schemes:string[]=[]; let cert:Uint8Array|undefined;
 while(p<cd-24){
   if(p+12>cd-24)break;
   const len=u64(v,p); if(!Number.isSafeInteger(len)||len<4||p+8+len>cd-24)break;
   const id=u32(v,p+8), value=new Uint8Array(data,p+12,len-4);
   if(id===0x7109871a||id===0xf05368c0){
     schemes.push(id===0x7109871a?'v2':'v3');
     try{const [signers]=readLen(value,0);const [signer]=readLen(signers,0);const [signed]=readLen(signer,0);const [,afterDigests]=readLen(signed,0);const [certs]=readLen(signed,afterDigests);const [first]=readLen(certs,0);cert??=first}catch{/* the UI reports unreadable certificate evidence */}
   }
   p+=8+len;
 }
 return {schemes:[...new Set(schemes)],signer:cert?await sha256(cert):schemes.length?'Certificate bytes unreadable':'No supported evidence'};
}
export function sampleRecords():ApkRecord[]{return [
 {id:'demo-fdroid',name:'F-Droid',version:'1.21.0',source:'https://f-droid.org',filename:'F-Droid_1.21.0.apk',size:12349122,sha256:'a9dc9e00fdb4c337ae4d5810aac881321ac771850b3d286d1be4f32d4c2a2b67',signer:'9a75c3ec0580dd84b9e32e94d96a74bdfd0e0f6a68321a7c1ef1946ee8275a0b',schemes:['v2','v3'],added:'2026-08-28T09:00:00.000Z',backup:false},
 {id:'demo-keepass',name:'KeePassDX',version:'4.1.7',source:'https://www.keepassdx.com',filename:'KeePassDX-4.1.7.apk',size:21906451,sha256:'87b7d3328f88b23e7d2e688f19c704753e4015ce0e45d0f437bcd35bb37a98e4',signer:'2c488611d1cbb90e7591bbd7a2fa354e5bf4ed805c1367df8619a454706b04bb',schemes:['v2'],added:'2026-08-28T09:00:00.000Z',backup:false}
]}
