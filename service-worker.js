const CACHE_NAME = "gymapp-cache-v3";
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
  console.log("📦 [Service Worker] Installazione in corso...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const file of FILES_TO_CACHE) {
        try {
          await cache.add(file);
          console.log(`✅ [Cache] Aggiunto: ${file}`);
        } catch (err) {
          console.warn(`⚠️ [Cache] File non trovato: ${file}`);
        }
      }
    })
  );
  self.skipWaiting();
});

// Attiva: cancella vecchie versioni
self.addEventListener("activate", (event) => {
  console.log("♻️ [Service Worker] Attivazione...");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => {
            console.log(`🗑️ [Cache] Eliminata cache vecchia: ${k}`);
            return caches.delete(k);
          })
      );
    })
  );
  self.clients.claim();
  console.log("🆕 [Service Worker] Cache aggiornata e pronta!");
});

// Fetch: carica dalla cache o dalla rete
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log(`📁 [Cache] Risposta da cache: ${event.request.url}`);
      } else {
        console.log(`🌐 [Rete] Caricamento da rete: ${event.request.url}`);
      }
      return response || fetch(event.request);
    })
  );
});