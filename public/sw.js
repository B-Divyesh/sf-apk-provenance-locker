const CACHE='apk-locker-v16';
const ASSETS=['/','/index.html','/archive-locker.webp','/manifest.webmanifest','/icons/favicon.svg','/icons/icon-192.png','/icons/icon-512.png','/vendor/apksig/wasm_exec.js','/vendor/apksig/apksig.wasm'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(ASSETS);
  const html=await (await cache.match('/index.html')).text();
  const builtAssets=[...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(match=>match[1]);
  if(builtAssets.length)await cache.addAll(builtAssets);
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('/index.html',copy))}return response}).catch(()=>caches.match('/index.html')));
    return;
  }
  event.respondWith(caches.match(new URL(request.url).pathname,{ignoreSearch:true,ignoreVary:true}).then(hit=>hit||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy))}return response})));
});
