// self.addEventListener('install', event => {
//     console.log('Service worker installing...');
//     self.skipWaiting();
// });

// self.addEventListener('activate', event => {
//     console.log('Service worker activating...');
// });

// // I'm a new service worker

// self.addEventListener('fetch', event => {
//     console.log('Fetching:', event.request.url);
// });


const filesToCache = [
    
    'css/main.css',
    'img/pic5.jpg',
    'index.html',
    'js/all.min.js',
    'js/main.js',
    '404.html',
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
    'site.webmanifest'
  ];
  
  const staticCacheName = 'weather-cache-v1';
  
  self.addEventListener('install', event => {
    console.log('Attempting to install service worker and cache static assets');
    event.waitUntil(
      caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
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
  
  self.addEventListener('fetch', event => {
    console.log('Fetch event for ', event.request.url);
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
            if(response.status === 404) {
                return caches.match('404.html');
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


  