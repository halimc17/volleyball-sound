const SHELL_CACHE = 'volleybeats-shell-v2';
const AUDIO_CACHE = 'volleybeats-audio-v1';

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/logo-light.png',
  '/icons/logo-dark.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== AUDIO_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Audio assets: cache-first so played or pre-cached tracks work offline in arenas.
  if (url.pathname.startsWith('/audio/')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(request, { ignoreSearch: true });
        if (cached) return cached;
        const response = await fetch(request);
        // Only cache full 200 responses; range 206 requests are passed through directly.
        if (response.status === 200) {
          cache.put(request, response.clone());
        }
        return response;
      })
    );
    return;
  }

  // HTML / navigation: network-first so Coolify redeploys take effect immediately when online.
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        try {
          const network = await fetch(request);
          if (network.status === 200) {
            cache.put(request, network.clone());
          }
          return network;
        } catch {
          const cached = await cache.match(request);
          return cached || (await cache.match('/index.html'));
        }
      })
    );
    return;
  }

  // Hashed static assets & icons: cache-first with network fallback.
  event.respondWith(
    caches.open(SHELL_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const network = await fetch(request);
      if (network.status === 200) {
        cache.put(request, network.clone());
      }
      return network;
    })
  );
});
