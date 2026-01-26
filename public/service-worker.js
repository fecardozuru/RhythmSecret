// Rhythm Trainer Service Worker
// Cache estratégico para PWA offline

const CACHE_NAME = 'rhythm-trainer-v1.0.0';
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Adicione outros assets críticos aqui
];

// Estratégias de cache
const STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
};

// Rotas e suas estratégias
const ROUTE_STRATEGIES = {
  '/': STRATEGIES.NETWORK_FIRST,
  '/index.html': STRATEGIES.NETWORK_FIRST,
  '/manifest.json': STRATEGIES.CACHE_FIRST,
  '/icon-': STRATEGIES.CACHE_FIRST,
  'firebase': STRATEGIES.NETWORK_FIRST,
  'api': STRATEGIES.NETWORK_FIRST,
  'googleapis': STRATEGIES.STALE_WHILE_REVALIDATE,
  'gstatic': STRATEGIES.CACHE_FIRST,
};

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Install failed:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Estratégia: Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache First failed:', error);
    throw error;
  }
}

// Estratégia: Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, falling back to cache');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Retorna cache imediatamente se disponível
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Ignora erros de fetch para revalidação
  });
  
  return cachedResponse || fetchPromise;
}

// Estratégia: Network Only
async function networkOnly(request) {
  return fetch(request);
}

// Determina a estratégia baseada na URL
function getStrategyForRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Verifica padrões de URL
  for (const [pattern, strategy] of Object.entries(ROUTE_STRATEGIES)) {
    if (pathname.includes(pattern) || url.href.includes(pattern)) {
      return strategy;
    }
  }
  
  // Default: Network First para conteúdo dinâmico
  return STRATEGIES.NETWORK_FIRST;
}

// Intercepta fetch events
self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Ignora chrome-extension
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // Determina estratégia
  const strategy = getStrategyForRequest(event.request);
  
  let responsePromise;
  switch (strategy) {
    case STRATEGIES.CACHE_FIRST:
      responsePromise = cacheFirst(event.request);
      break;
    case STRATEGIES.NETWORK_FIRST:
      responsePromise = networkFirst(event.request);
      break;
    case STRATEGIES.STALE_WHILE_REVALIDATE:
      responsePromise = staleWhileRevalidate(event.request);
      break;
    case STRATEGIES.NETWORK_ONLY:
      responsePromise = networkOnly(event.request);
      break;
    default:
      responsePromise = networkFirst(event.request);
  }
  
  event.respondWith(responsePromise);
});

// Background Sync para dados offline
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-presets') {
    event.waitUntil(syncPresets());
  }
});

async function syncPresets() {
  // Implementar sincronização de presets offline
  console.log('[Service Worker] Syncing presets...');
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  const options = {
    body: event.data?.text() || 'Novo exercício disponível no Rhythm Trainer!',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir App'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Rhythm Trainer', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Atualização periódica em background
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    console.log('[Service Worker] Periodic sync for content update');
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  // Atualizar conteúdo em background
  console.log('[Service Worker] Updating content in background...');
}

// Manipula mensagens do app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_ASSETS') {
    cacheAdditionalAssets(event.data.assets);
  }
});

async function cacheAdditionalAssets(assets) {
  const cache = await caches.open(CACHE_NAME);
  return Promise.all(
    assets.map((asset) => {
      return cache.add(asset).catch((error) => {
        console.error(`[Service Worker] Failed to cache ${asset}:`, error);
      });
    })
  );
}
