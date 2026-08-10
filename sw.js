// Earnings Wire — Service Worker
// Caches the static app shell only. Live market data (Alpaca) and fonts
// are always fetched from the network and never cached, so quotes/candles
// are never stale and API keys never touch the cache.

const CACHE_VERSION = 'ew-shell-v2';
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png'
];

// Hosts that must always hit the network (never cached).
const NETWORK_ONLY_HOSTS = [
  'data.alpaca.markets',
  'api.alpaca.markets',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept/cache live data or third-party fonts.
  if (NETWORK_ONLY_HOSTS.includes(url.hostname)) {
    return;
  }

  // Page navigations (installed app launch, address-bar loads, links):
  // always resolve to the cached app-shell root. This sidesteps Cloudflare's
  // /index.html <-> / canonical redirect, which is what breaks the
  // installed Android app when start_url or a link points at index.html
  // directly.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => caches.match('./') || caches.match('./index.html'))
    );
    return;
  }

  // Other app-shell assets: cache-first, falling back to network, then updating cache.
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok && url.origin === self.location.origin) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
