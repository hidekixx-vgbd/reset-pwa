const CACHE_NAME = "reset-v3"; // ←更新のたびに v を上げる
const ASSETS = [
  "/reset-pwa/",
  "/reset-pwa/index.html",
  "/reset-pwa/manifest.json",
  "/reset-pwa/sw.js",
  "/reset-pwa/icon-192.png",
  "/reset-pwa/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // GET以外は無視
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // http/https 以外（chrome-extension: など）は無視
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // 別オリジンも無視（拡張機能や外部リソース等）
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
