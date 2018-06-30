// Set a name for the current cache
let staticCacheName = 'current-c-v1';

// Default files to always cache
const cacheFiles = [
    './',
    './index.html',
    './index.js',
    './main.js',
    './style.css',
    'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600',
    'https://picsum.photos/1600/800/?image=4',
    // 'https://free.currencyconverterapi.com/api/v5/currencies'

]

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(staticCacheName)
            .then((cache) => cache.addAll(cacheFiles))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames.filter((cacheName) => cacheName.startsWith('current-c-') && cacheName != staticCacheName)
                    .map((cacheName) => caches.delete(cacheName))
            )
            )
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.open(staticCacheName)
            .then((cache) => cache.match(event.request)
                .then((response) => {
                    // const fetchPromise = fetch(event.request)
                    //     .then((networkResponse) => {
                    //         cache.put(event.request, networkResponse.clone());
                    //         return networkResponse;
                    //     })
                        // .catch(err => {return response});
                    // return response || fetchPromise;
                    return response || fetch(event.request);
                })
            )
    );
});

self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});


