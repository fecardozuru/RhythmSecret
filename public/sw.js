const CACHE_NAME = 'rhythm-secret-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
  ];

self.addEventListener('install', (event) => {
    event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => {
                  return cache.addAll(STATIC_ASSETS);
          })
        );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
          caches.keys().then((cacheNames) => {
                  return Promise.all(
                            cacheNames
                              .filter((name) => name !== CACHE_NAME)
                              .map((name) => caches.delete(name))
                          );
          })
        );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

                        const url = new URL(event.request.url);

                        // Skip non-http requests and Firebase/API calls
                        if (!url.protocol.startsWith('http')) return;
    if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) return;

                        event.respondWith(
                              caches.match(event.request).then((cached) => {
                                      if (cached) return cached;
                                      return fetch(event.request).then((response) => {
                                                if (!response || response.status !== 200 || response.type !== 'basic') {
                                                            return response;
                                                }
                                                const responseToCache = response.clone();
                                                caches.open(CACHE_NAME).then((cache) => {
                                                            cache.put(event.request, responseToCache);
                                                });
                                                return response;
                                      }).catch(() => {
                                                if (event.request.destination === 'document') {
                                                            return caches.match('/index.html');
                                                }
                                      });
                              })
                            );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
          self.skipWaiting();
    }
});
const CACHE_NAME = 'rhythm-secret-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
  ];

self.addEventListener('install', (event) => {
    event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => {
                  return cache.addAll(STATIC_ASSETS);
          })
        );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
          caches.keys().then((cacheNames) => {
                  return Promise.all(
                            cacheNames
                              .filter((name) => name !== CACHE_NAME)
                              .map((name) => caches.delete(name))
                          );
          })
        );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

                        const url = new URL(event.request.url);

                        // Skip non-http requests and Firebase/API calls
                        if (!url.protocol.startsWith('http')) return;
    if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) return;

                        event.respondWith(
                              caches.match(event.request).then((cached) => {
                                      if (cached) return cached;
                                      return fetch(event.request).then((response) => {
                                                if (!response || response.status !== 200 || response.type !== 'basic') {
                                                            return response;
                                                }
                                                const responseToCache = response.clone();
                                                caches.open(CACHE_NAME).then((cache) => {
                                                            cache.put(event.request, responseToCache);
                                                });
                                                return response;
                                      }).catch(() => {
                                                if (event.request.destination === 'document') {
                                                            return caches.match('/index.html');
                                                }
                                      });
                              })
                            );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
          self.skipWaiting();
    }
});
