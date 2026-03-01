/**
 * Service Worker for EV 3D Inspection System
 * Caches static assets for faster subsequent loads
 */

const CACHE_NAME = 'ev-inspection-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/css/style.css',
    '/src/js/app.js',
    '/src/js/3d-engine.js',
    '/src/js/inspection-data.js',
    '/src/js/report-export.js',
    '/src/js/tablet-fix.js',
    '/models/qin2019.glb'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((err) => {
                console.warn('[SW] Cache failed:', err);
            })
    );
    
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    
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

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Skip CDN resources (let browser handle caching)
    if (url.hostname.includes('cdn')) return;
    
    event.respondWith(
        caches.match(request).then((cached) => {
            // Return cached version if available
            if (cached) {
                // Fetch new version in background (cache refresh)
                fetch(request)
                    .then((response) => {
                        if (response.ok) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, response);
                            });
                        }
                    })
                    .catch(() => {});
                
                return cached;
            }
            
            // Fetch from network
            return fetch(request)
                .then((response) => {
                    if (!response.ok) return response;
                    
                    // Cache the response
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, clone);
                    });
                    
                    return response;
                })
                .catch((err) => {
                    console.error('[SW] Fetch failed:', err);
                    throw err;
                });
        })
    );
});
