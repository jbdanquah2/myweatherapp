let filesToCache = resourceToCache();

const staticCacheName = 'weather-cache-v3';

self.addEventListener('install', event => {
  console.log('Attempting to install service worker and cache static assets');
  
  self.skipWaiting();

  event.waitUntil(
    caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // console.log('Fetch event for ', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Found ', event.request.url, ' in cache');
          return response;
        }
        console.log('Network request for ', event.request.url);
        return fetch(event.request).then(response => {
          // Respond with custom 404 page
          if (response.status === 404) {
            // console.log('404 ', event.request.url, ' not founds');
            return caches.match('/not-found.html');
          }
          return caches.open(staticCacheName).then(cache => {
            cache.put(event.request.url, response.clone());
            return response;
          });
        });

      }).catch(error => {
        console.log("Hey your app is offline")
        //Respond with custom offline page
        return caches.match('/offline.html');
      })
  );
});


self.addEventListener('activate', event => {
  console.log('Activating new service worker...');
  
  const cacheAllowlist = [staticCacheName];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


function resourceToCache() {
  return [
    '/',
    'css/main.min.css',
    'img/pic5.jpg',
    'index.html',
    'js/all.min.js',
    'js/main.min.js',
    'offline.html',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
    'apple-touch-icon.png',
    'browserconfig.xml',
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'mstile-150x150.png',
    'safari-pinned-tab.svg',
    'site.webmanifest',
    'not-found.html'
  ];
}
