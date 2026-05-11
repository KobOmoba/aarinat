const CACHE_NAME = 'bloom-v1';
// This list tells the browser which files to keep even when offline
const assets = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css'
];

// 1. Install: Save the files to the phone's "hidden" memory
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// 2. Fetch: When the user clicks the link, try the network first, 
// but if it fails, show the saved version.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
