const SHELL_CACHE = 'cbtis258-shell-v1';
const SHELL_URL = '/';
const CACHEABLE_DESTINATIONS = new Set(['script', 'style', 'image', 'font']);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.add(new Request(SHELL_URL, { cache: 'reload' })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('cbtis258-shell-') && key !== SHELL_CACHE)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache authentication, transactions, or other live API data.
  if (url.pathname.startsWith('/api/') || url.pathname === '/health') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(SHELL_URL, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(SHELL_URL)) || Response.error()),
    );
    return;
  }

  const isPublicAsset = /^\/(imgs|CobraIcon|imagenesTienda)\//.test(url.pathname);
  if (!CACHEABLE_DESTINATIONS.has(request.destination) && !isPublicAsset) return;

  event.respondWith(
    caches.match(request).then(async (cached) => {
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok) {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      } catch {
        return cached || Response.error();
      }
    }),
  );
});