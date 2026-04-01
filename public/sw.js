/// <reference lib="webworker" />

/**
 * OKAR - Service Worker
 * 
 * Gestion du cache et du mode hors ligne
 * Version: 1.0.0
 */

const CACHE_NAME = 'okar-v1';
const STATIC_CACHE = 'okar-static-v1';
const DYNAMIC_CACHE = 'okar-dynamic-v1';

// Fichiers à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Installation du Service Worker
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Force l'activation immédiate
  (self as any).skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );
  
  // Prend le contrôle immédiatement
  (self as any).clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorer les requêtes externes
  if (url.origin !== location.origin) {
    return;
  }
  
  // Stratégie Network First pour les pages HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Mettre en cache la réponse
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => {
          // Retourner la version en cache ou la page offline
          return caches.match(request).then((cached) => {
            return cached || caches.match('/offline.html');
          });
        })
    );
    return;
  }
  
  // Stratégie Cache First pour les assets statiques
  if (url.pathname.match(/\.(js|css|woff2?|ttf|eot|png|jpg|jpeg|svg|gif|webp|ico)$/i)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        });
      })
    );
    return;
  }
  
  // Stratégie Network First pour les API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }
  
  // Par défaut: Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, clone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'Nouvelle notification OKAR',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
  };
  
  event.waitUntil(
    (self as any).registration.showNotification(data.title || 'OKAR', options)
  );
});

// Gestion du clic sur les notifications
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  
  event.waitUntil(
    (self as any).clients.openWindow(event.notification.data.url)
  );
});

// Export pour TypeScript
declare const self: ServiceWorkerGlobalScope;
