const CACHE_NAME = 'reset-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// インストール時
self.addEventListener('install', (event) => {
  console.log('SW: install event');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('キャッシュを作成:', CACHE_NAME);
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// アクティベーション時
self.addEventListener('activate', (event) => {
  console.log('SW: activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチイベント
self.addEventListener('fetch', (event) => {
  // GETリクエストのみキャッシュ
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // ネットワークエラーの場合はキャッシュから返す
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // 成功時はキャッシュに保存
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      }).catch(() => {
        // ネットワークエラー時はキャッシュから返す
        return caches.match(event.request);
      });
    })
  );
});
