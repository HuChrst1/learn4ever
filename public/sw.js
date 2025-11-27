// public/sw.js

const CACHE_NAME = "l4e-cache-v1";

// Tu peux en rajouter plus tard (icônes, etc.)
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        // En dev, si un fichier manque, on log juste
        console.warn("[SW] Cache error:", err);
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).catch(() => {
        // Si offline et navigation → on renvoie index.html
        if (request.mode === "navigate") {
          return caches.match("/index.html");
        }
        return undefined;
      });
    })
  );
});
