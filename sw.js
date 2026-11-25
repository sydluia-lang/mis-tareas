// Service worker de "Control de tareas".
// VERSIÓN CONGELADA: quien la instala se queda con esta versión aunque los archivos del servidor cambien.
// La app sale siempre de la copia guardada en el equipo (también funciona sin internet).
// Solo cuando cambia este archivo (por ejemplo el número de VERSION) el navegador baja y guarda la versión nueva.
// Para sacar un arreglo a propósito: cambiar VERSION aquí y en index.html (la etiqueta junto al título).
const VERSION = '1.1';
const CACHE = 'control-tareas-' + VERSION;
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icono.svg',
  './icono-192.png', './icono-512.png', './icono-maskable-192.png', './icono-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', ev => {
  // cache:'reload' = pedir los archivos al servidor, no a la memoria del navegador (así se guarda justo esta versión)
  ev.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('control-tareas') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  // Solo archivos propios; el corrector de ortografía (otro sitio) pasa directo
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  ev.respondWith((async () => {
    const c = await caches.open(CACHE);
    const guardada = await c.match(req, { ignoreSearch: true })
      || (req.mode === 'navigate' && await c.match('./index.html'));
    return guardada || fetch(req);
  })());
});
