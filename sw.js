/* Cache d'abord, 100 % hors ligne. Changer V à chaque mise à jour. */
const V='rls-v10.0',F=['./','index.html','style.css','js/core.js','js/config.js','js/data.js','js/state.js','js/exports.js','js/scan.js','js/reports.js','js/ui.js','js/boot.js','libs/jspdf.umd.min.js','libs/jspdf.plugin.autotable.min.js','libs/exceljs.min.js','manifest.json','logo.png','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET'||!q.url.startsWith(self.location.origin))return;
e.respondWith(caches.match(q,{ignoreSearch:true}).then(h=>{const n=fetch(q).then(r=>{if(r&&r.ok&&r.type==='basic'){const c=r.clone();caches.open(V).then(x=>x.put(q,c))}return r}).catch(()=>null);
if(h){e.waitUntil(n);return h}return n.then(r=>r||(q.mode==='navigate'?caches.match('index.html'):Response.error()))}))});
