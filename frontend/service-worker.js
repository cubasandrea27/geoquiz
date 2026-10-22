const CACHE = 'geoquiz-v2';
const ASSETS = [
  '../',
  '../pages/mobile.html',
  '../pages/index.html',
  '../js/config.js',
  '../js/notificaciones.js',
  '../css/styles.css',
  '../css/notificaciones.css',
  '../manifest.webmanifest',
  '../assets/icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match('../pages/mobile.html')))
  );
});
