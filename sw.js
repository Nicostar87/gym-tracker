const CACHE_NAME = "gym-tracker-v6";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js"
];


/* INSTALLAZIONE */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())

  );

});


/* ATTIVAZIONE */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))

        );

      })
      .then(() => self.clients.claim())

  );

});


/* RICHIESTE */

self.addEventListener("fetch", event => {

  /*
   * Strategia CACHE FIRST:
   * se la risorsa è già stata scaricata,
   * viene utilizzata anche senza Internet.
   */

  event.respondWith(

    caches.match(event.request)
      .then(cachedResponse => {

        if(cachedResponse){
          return cachedResponse;
        }

        return fetch(event.request)
          .then(networkResponse => {

            /*
             * Salviamo nella cache eventuali
             * nuove risorse locali.
             */

            if(
              event.request.method === "GET" &&
              networkResponse &&
              networkResponse.status === 200
            ){

              const copy =
                networkResponse.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(
                    event.request,
                    copy
                  );
                });

            }

            return networkResponse;

          })
          .catch(() => {

            /*
             * Se siamo completamente offline
             * e la pagina non è in cache,
             * torniamo alla home dell'app.
             */

            return caches.match("./index.html");

          });

      })

  );

});
