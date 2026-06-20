// Service Worker for MP Cheque Bounce Desk — offline PWA support
const CACHE_NAME = 'mp-cheque-bounce-desk-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/app.js',
  '/manifest.json',
  '/logo.png',
  '/acts.html',
  '/acts.js',
  '/html2pdf.bundle.min.js',
];

// Install — cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
