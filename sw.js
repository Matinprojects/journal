/* ============================================================
   Trading Journal — service worker
   Matin Projects

   Job: make the journal open instantly and keep working with no
   internet. It caches the app itself and its icons. It never touches
   the trader's data — that lives in localStorage and IndexedDB, which
   this file cannot see and does not manage.

   Bump CACHE when you upload a new build. Old caches are deleted on
   activate, so testers get the new version on their next visit.
   ============================================================ */

const CACHE = "tj-v1.0.0-beta.10";

const SHELL = [
  "./",
  "./index.html",
  "./install.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png"
];

self.addEventListener("install", e => {
  // one missing file should not stop the rest from caching
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Navigations: network first so a new build lands immediately,
  // falling back to the cached app when there is no connection.
  if (req.mode === "navigate") {
    e.respondWith(
      // no-cache: always ask the server whether the page changed (a cheap 304 when it
      // has not), instead of trusting a browser copy that can be ten minutes stale
      fetch(req, { cache: "no-cache" })
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put("./index.html", copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("./index.html").then(r => r || caches.match("./")))
    );
    return;
  }

  // Our own files: cache first, they are versioned by CACHE.
  if (sameOrigin) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit))
    );
    return;
  }

  // Third party (the webfont, and the OCR library when a screenshot is read):
  // use the network, fall back to whatever was cached before. Never block on it.
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && (res.status === 200 || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
