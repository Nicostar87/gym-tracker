"use strict";

const CACHE_NAME = "gym-tracker-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js"
];

/* INSTALLAZIONE */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

/* ATTIVAZIONE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* RICHIESTE OFFLINE */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(networkResponse => {
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === "basic"
            ) {
              const copy = networkResponse.clone();

              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, copy));
            }

            return networkResponse;
          })
          .catch(() => {
            return caches.match("./index.html");
          });
      })
  );
});
