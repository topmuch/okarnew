/**
 * OKAR - PWA Configuration
 * 
 * Configuration pour next-pwa
 * Ce fichier définit les options du Service Worker
 */

module.exports = {
  // Mode swc-loader pour de meilleures performances
  swcMinify: true,
  
  // Désactiver en développement pour éviter les problèmes de cache
  disable: process.env.NODE_ENV === 'development',
  
  // Chemins
  dest: 'public',
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  
  // Configuration du Service Worker
  register: true,
  skipWaiting: true,
  
  // Stratégies de cache
  runtimeCaching: [
    {
      // Cache des pages statiques
      urlPattern: /^https:\/\/.*\.(?:html|\/)$/i,
      handler: 'NetworkFirst',
      options: {
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 24 heures
        },
        cacheName: 'static-pages',
      },
    },
    {
      // Cache des assets statiques (JS, CSS, fonts)
      urlPattern: /^https:\/\/.*\.(?:js|css|woff2?|ttf|eot)$/i,
      handler: 'CacheFirst',
      options: {
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
        },
        cacheName: 'static-assets',
      },
    },
    {
      // Cache des images
      urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 jours
        },
        cacheName: 'images',
      },
    },
    {
      // Cache des API calls (NetworkFirst pour fraîcheur)
      urlPattern: /^\/api\//i,
      handler: 'NetworkFirst',
      options: {
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
        cacheName: 'api-cache',
      },
    },
  ],
  
  // Gestion offline
  fallbacks: {
    document: '/offline.html',
  },
}
