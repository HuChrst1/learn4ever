// public/sw.js
// Very simple "no-cache" service worker for Learn4ever.
// It only clears old caches and does NOT intercept network requests.

const CACHE_NAME = "learn4ever-no-cache-v1";

self.addEventListener("install", (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Delete all existing caches when a new SW is activated
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// No "fetch" event handler => the SW does not cache or serve files.
// The browser just loads everything normally from the network.
