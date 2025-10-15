const CACHE_NAME = "gymapp-cache-v2";
const FILES_TO_CACHE = [
  "./index.html",
  "./home.html",
  "./scheda.html",
  "./sessione.html",
  "./progressi.html",
  "./timer.html",
  "./programmi.html",
  "./massimali.html",
  "./style.css",
  "./app.js",
  "./icon.png"
];

// Install: salva i file in cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const file of FILES_TO_CACHE) {
        try {
          await cache.add(file);
        } catch (err) {
          console.warn("⚠️ File non trovato, saltato:", file);
        }
      }
    })
  );
  self.skipWaiting();
});

// Attiva: cancella vecchie versioni
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: carica dalla cache o da rete
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
