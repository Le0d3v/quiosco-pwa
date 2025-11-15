// ================================
//  SERVICE WORKER - PWA KIOSCO
// ================================

const CACHE_NAME = "kiosk-pwa-v1";
const OFFLINE_URL = "/offline.html";

// Archivos que se cachearán
const ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/db.js",
  "/manifest.json",
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ========================================
//  INSTALL
// ========================================
self.addEventListener("install", (event) => {
  console.log("SW: Instalando...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );

  self.skipWaiting();
});

// ========================================
//  ACTIVATE
// ========================================
self.addEventListener("activate", (event) => {
  console.log("SW: Activado");

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );

  self.clients.claim();
});

// ========================================
//  FETCH — Modo Offline
// ========================================
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Guardar nueva versión en caché (estrategia network-first)
        const resClone = res.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => {
        // Si falla, servir desde caché
        return caches.match(event.request).then((cacheRes) => {
          return cacheRes || caches.match(OFFLINE_URL);
        });
      })
  );
});
