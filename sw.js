// Incrementar el número de versión para forzar la actualización
const CACHE_VERSION = 'v2';
const CACHE_NAME = `el-campeon-${CACHE_VERSION}`;

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
    // Evita que el service worker complete la instalación hasta que se complete el caché
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log(`Cache ${CACHE_NAME} abierto`);
            return cache.addAll(urlsToCache)
                .then(() => {
                    console.log('Todos los recursos han sido cacheados exitosamente');
                    // Activa el nuevo service worker inmediatamente
                    return self.skipWaiting();
                })
                .catch(error => {
                    console.error('Error al guardar en caché:', error);
                    throw error;
                });
        })
    );
});

self.addEventListener('activate', event => {
    // Eliminar caches antiguos
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME && cache.startsWith('el-campeon-')) {
                        console.log('Eliminando cache antigua:', cache);
                        return caches.delete(cache);
                    }
                })
            ).then(() => {
                // Reclama el control de todos los clientes (páginas abiertas)
                console.log('Reclamando control de los clientes');
                return self.clients.claim();
            });
        })
    );
    
    // Forzar la actualización inmediata
    self.clients.claim();
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