const CACHE_VERSION = 'v3';
const CACHE_NAME = `el-campeon-${CACHE_VERSION}`;

// Archivos esenciales que deben estar en caché inmediatamente
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './productos.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
].map(url => new URL(url, self.location).href); // Asegurar URLs absolutas

self.addEventListener('install', event => {
    // Saltar la fase de espera e instalar inmediatamente
    self.skipWaiting();
    
    // Pre-cache de recursos esenciales
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log(`[Service Worker] Abriendo caché: ${CACHE_NAME}`);
                return cache.addAll(urlsToCache)
                    .then(() => {
                        console.log('[Service Worker] Recursos cacheados exitosamente');
                    })
                    .catch(error => {
                        console.error('[Service Worker] Error al guardar en caché:', error);
                        throw error;
                    });
            })
    );
});

self.addEventListener('activate', event => {
    // Tomar el control inmediatamente
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    // Eliminar caches antiguas que no coincidan con la versión actual
                    if (cache !== CACHE_NAME && cache.startsWith('el-campeon-')) {
                        console.log('[Service Worker] Eliminando caché antigua:', cache);
                        return caches.delete(cache);
                    }
                })
            ).then(() => {
                console.log('[Service Worker] Activado y listo para controlar clientes');
                return self.clients.claim();
            });
        })
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Ignorar solicitudes que no son GET o que son de otro origen
    if (request.method !== 'GET' || !url.origin.startsWith(self.location.origin)) {
        return;
    }

    // Estrategia: Cache First, con actualización en segundo plano
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                // Para peticiones de navegación, siempre intenta la red primero
                const fetchPromise = fetch(request).then(response => {
                    // Si es una respuesta válida, actualiza la caché
                    if (response && (response.status === 200 || response.status === 0)) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                }).catch(() => {
                    // Si falla la red y no hay respuesta en caché, mostrar página offline
                    if (request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                    return new Response('Sin conexión', { status: 503, statusText: 'Sin conexión' });
                });

                // Para navegación, intenta la red primero, luego caché
                if (request.mode === 'navigate') {
                    return fetchPromise.catch(() => caches.match('./index.html'));
                }
                
                // Para otros recursos, devuelve caché primero, luego red
                return cachedResponse || fetchPromise;
            })
    );
});

// Escuchar mensajes para actualizaciones
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});