const CACHE_NAME = 'school-admin-v7-netfirst';
const PRECACHE = ['./manifest.json'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

function isApiRequest(url) {
  return url.includes('script.google.com') || url.includes('script.googleusercontent.com');
}

function isHtmlRequest(request, url) {
  return request.mode === 'navigate'
    || url.endsWith('/')
    || url.endsWith('/index.html')
    || (request.headers.get('accept') || '').includes('text/html');
}

function isCdnScript(url) {
  return url.includes('cdn.jsdelivr.net') || url.includes('unpkg.com') || url.includes('cdn.tailwindcss.com');
}

async function networkFirst(request, fallbackToIndex) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(request, { cache: 'no-store' });
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackToIndex) {
      const idx = await cache.match('./index.html');
      if (idx) return idx;
    }
    throw e;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res && res.ok && res.type !== 'opaque') cache.put(request, res.clone());
  return res;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = request.url;

  if (isApiRequest(url)) return;

  if (isHtmlRequest(request, url)) {
    event.respondWith(networkFirst(request, true));
    return;
  }

  if (url.endsWith('/service-worker.js') || url.endsWith('/manifest.json')) {
    event.respondWith(networkFirst(request, false));
    return;
  }

  if (isCdnScript(url)) {
    event.respondWith(networkFirst(request, false));
    return;
  }

  event.respondWith(cacheFirst(request));
});
