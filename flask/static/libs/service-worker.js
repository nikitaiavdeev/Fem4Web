const CACHE_NAME = 'precache';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const FILES_TO_CACHE = [
    '/templates/index.html',
    '/templates/offline.html',
    '/static/min/fem4web.min.js',
    '/static/min/fem4web.min.css'
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Pre-caching offline page');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('fetch', e => {
    console.log('Service Worker Fetch...');
    // Skip cross-origin requests, like those for Google Analytics.
    if (e.request.mode !== 'navigate') {
        // Not a page navigation, bail.
        return;
    }
    e.respondWith(
        fetch(e.request)
        .catch(() => {
            return caches.open(CACHE_NAME)
                .then((cache) => {
                    console.log('[ServiceWorker] loading offline');
                    return cache.match('/templates/offline.html');
                });
        })
    );
});