// Funciona sin internet: guarda los archivos del juego y los actualiza en segundo plano.
const V = 'geoplay-v3';
const ARCHIVOS = ['./', 'index.html', 'estilo.css', 'juego.js', 'mapas.js', 'preguntas.js', 'manifest.webmanifest', 'icono.svg', 'icono-192.png', 'icono-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(V).then(async c => {
    const guardado = await c.match(e.request);
    const red = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => guardado);
    return guardado || red;
  }));
});
