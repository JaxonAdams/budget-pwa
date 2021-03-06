const FILES_TO_CACHE = [
    './index.html',
    './js/index.js',
    './css/styles.css',
    './js/idb.js'
];

const APP_PREFIX = 'Budget_tracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

// Cache Files
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log(`Installing cache : ${CACHE_NAME}`);
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// On activation, clear old caches
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keyList) {
            let cacheKeepList = keyList.filter(function(key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeepList.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function(key, i) {
                    if (cacheKeepList.indexOf(key) === -1) {
                        console.log(`Deleting cache : ${keyList[i]}`);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});

// Intercept fetch requests
self.addEventListener('fetch', function(e) {
    console.log(`Fetch request : ${e.request.url}`);
    e.respondWith(
        caches.match(e.request, { ignoreVary: true }).then(function(response) {
            if (response) {
                console.log('responding with cache : ' + e.request.url)
                return response
            } else {
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }
        })
    );
});