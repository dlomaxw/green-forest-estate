const CACHE_NAME = 'forest-green-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './overview.html',
  './location.html',
  './features.html',
  './gallery.html',
  './amenities.html',
  './payment.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/images/favicon.png',
  './assets/images/forest-green-logo-cropped.png',
  './assets/images/knight-frank-logo.png',
  './assets/images/dfcu-logo.png',
  './assets/images/dfcu-logo.webp'
];

// Install Event - Pre-cache core shell assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate strategy for optimal offline experience
self.addEventListener('fetch', (e) => {
  // Avoid caching YouTube embeds or tracking API requests
  if (e.request.url.includes('youtube.com') || e.request.url.includes('ytimg.com') || e.request.url.includes('googleapis.com') || e.request.url.includes('gstatic.com')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background update to keep the cache fresh
        fetch(e.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
            }
          })
          .catch(() => { /* Ignore offline fetch errors for background sync */ });
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache dynamically for media assets
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
