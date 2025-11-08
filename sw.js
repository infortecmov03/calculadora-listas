// sw.js - Versão Simplificada e Segura
const CACHE_NAME = 'calculadora-listas-simple-v1';

self.addEventListener('install', function(event) {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker ativado');
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Estratégia: Network First
  event.respondWith(
    fetch(event.request)
      .catch(function() {
        // Se a rede falhar, tenta o cache
        return caches.match(event.request)
          .then(function(response) {
            // Fallback para página principal se não encontrar no cache
            if (response) {
              return response;
            }
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});