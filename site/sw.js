const CACHE_NAME = 'bph-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './ximen.html',
  './changchun.html',
  './nearby.html',
  './contact.html',
  './news.html',
  './privacy.html',
  './offline.html',
  './manifest.webmanifest',
  './assets/css/styles.css',
  './assets/css/location.css',
  './assets/css/nearby.css',
  './assets/css/content-pages.css',
  './assets/css/accessibility.css',
  './assets/js/app.js',
  './assets/js/translations.js',
  './assets/js/location.js',
  './assets/js/nearby.js',
  './assets/js/content-pages.js',
  './assets/icons/bph-icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') return caches.match('./offline.html');
        return Response.error();
      })
  );
});
