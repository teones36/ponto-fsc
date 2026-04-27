// Service Worker — Farmácia Santa Cecília Ponto Digital
const CACHE_NAME = 'ponto-fsc-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalar e cachear arquivos principais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativar e limpar caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Interceptar requisições — network first, cache fallback
self.addEventListener('fetch', event => {
  // Não interceptar requisições do Firebase
  if (event.request.url.includes('firebaseio.com') ||
      event.request.url.includes('firebase') ||
      event.request.url.includes('googleapis')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cachear resposta válida
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Forçar ativação imediata quando solicitado
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
