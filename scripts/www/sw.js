/**
 * ASEAN NEV Insight - Service Worker
 * PWA 离线功能支持
 */

const STATIC_CACHE = 'asean-nev-static-v1';
const DATA_CACHE = 'asean-nev-data-v1';

// 静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/base.css',
  '/css/loading.css',
  '/css/dashboard.css',
  '/js/main.js',
  '/manifest.json'
];

// 安装
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 激活
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== STATIC_CACHE && name !== DATA_CACHE)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 获取
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (request.method !== 'GET') return;
  
  // 数据请求 - Network First
  if (url.pathname.includes('/data/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // 验证响应状态和内容类型后才缓存
          if (response.ok && response.status === 200) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const clone = response.clone();
              caches.open(DATA_CACHE).then(cache => cache.put(request, clone));
            }
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached => 
          cached || new Response(JSON.stringify({ error: 'Offline' }), 
          { headers: { 'Content-Type': 'application/json' } })
        ))
    );
    return;
  }
  
  // 静态资源 - Cache First
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        // 后台更新缓存
        fetch(request).then(response => {
          if (response.ok && response.status === 200) {
            const contentType = response.headers.get('content-type');
            if (contentType && (contentType.includes('text/css') || 
                contentType.includes('javascript') || 
                contentType.includes('html'))) {
              caches.open(STATIC_CACHE).then(cache => cache.put(request, response));
            }
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(request).then(response => {
        if (response.ok && response.status === 200) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-valuations') {
    event.waitUntil(syncValuations());
  }
});

async function syncValuations() {
  const cache = await caches.open(DATA_CACHE);
  const requests = await cache.keys();
  const syncRequests = requests.filter(req => req.url.includes('/sync/'));
  
  for (const request of syncRequests) {
    try {
      const response = await fetch(request);
      if (response.ok) await cache.delete(request);
    } catch (err) {
      // 静默处理同步失败
    }
  }
}
