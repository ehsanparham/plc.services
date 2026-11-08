// Offline shell. The installed copy is kept until the user confirms the update window (the page clears this cache and reloads).
const CACHE='plc-app-shell';
const FILES=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>c.match(f).then(m=>m||fetch(new Request(f,{cache:'reload'})).then(r=>r.ok?c.put(f,r):0).catch(()=>0))))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url); if(u.origin!==location.origin) return;
  if(u.searchParams.has('chk')) return;   // the page's own "is there a newer version?" check always goes to the network
  e.respondWith(caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:true}).then(m=>m||fetch(r.mode==='navigate'?new Request(r.url,{cache:'reload'}):r).then(n=>{ if(n&&n.ok&&n.type==='basic'){ c.put(u.origin+u.pathname,n.clone()); } return n; }).catch(()=>c.match('./index.html')))));
});
