/**
 * Service Worker para PWA
 * Cache básico para recursos estáticos
 */
const CACHE_NAME = 'letsroll-v1'
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/src/main.tsx',
]

/**
 * Instalação do Service Worker
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE_URLS).catch((error) => {
        // Ignorar erros de cache (alguns recursos podem não existir)
        console.warn('Erro ao cachear recursos:', error)
      })
    })
  )
  self.skipWaiting()
})

/**
 * Ativação do Service Worker
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

/**
 * Estratégia: Network First, fallback para Cache
 * Para recursos dinâmicos, sempre buscar da rede primeiro
 */
self.addEventListener('fetch', (event) => {
  // Ignorar requisições não-GET
  if (event.request.method !== 'GET') {
    return
  }

  // Ignorar requisições para APIs externas
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase.co')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a requisição foi bem-sucedida, cachear e retornar
        if (response.status === 200) {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // Se falhar, tentar buscar do cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Se não houver no cache, retornar página offline básica
          if (event.request.destination === 'document') {
            return caches.match('/index.html')
          }
        })
      })
  )
})
