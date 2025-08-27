const CACHE_NAME = 'el-campeon-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './productos.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Cache abierto');
            return cache.addAll(urlsToCache);
        })
    );
    // Activa el service worker inmediatamente
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    // Eliminar caches antiguos
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Eliminando cache antigua:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    // Reclama el control de la página inmediatamente
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
    // Ignorar solicitudes de navegación
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match('./index.html'))
        );
        return;
    }

    // Para otras solicitudes, usa la estrategia Cache First
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Devuelve el recurso de la cache si se encuentra
            if (response) {
                return response;
            }
            // Si no está en caché, haz la petición y guarda la respuesta
            return fetch(event.request).then(response => {
                // Solo cacheamos respuestas válidas
                if(!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                // Clonamos la respuesta para guardarla en caché
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                return response;
            });
        })
    );
});