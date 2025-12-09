/**
 * Service Worker Avançado para PWA
 * Cache estratégico, offline support, background sync
 */

const CACHE_VERSION = 'letsroll-v2'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const API_CACHE = `${CACHE_VERSION}-api`

// Recursos estáticos para cache imediato
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
]

// Estratégias de cache
const CACHE_STRATEGIES = {
  // Cache First: para assets estáticos
  CACHE_FIRST: 'cache-first',
  // Network First: para conteúdo dinâmico
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate: para APIs
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
}

/**
 * Instalação do Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Cacheando recursos estáticos...')
        return cache.addAll(STATIC_ASSETS).catch((error) => {
          console.warn('[SW] Erro ao cachear alguns recursos:', error)
        })
      })
      .then(() => {
        // Forçar ativação imediata
        return self.skipWaiting()
      })
  )
})

/**
 * Ativação do Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Remover caches antigos
              return name !== STATIC_CACHE && 
                     name !== DYNAMIC_CACHE && 
                     name !== API_CACHE &&
                     name.startsWith('letsroll-')
            })
            .map((name) => {
              console.log('[SW] Removendo cache antigo:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => {
        // Assumir controle de todas as páginas
        return self.clients.claim()
      })
  )
})

/**
 * Estratégia: Cache First
 * Para assets estáticos (JS, CSS, imagens)
 */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response.status === 200) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('[SW] Erro em cache-first:', error)
    // Retornar página offline se for documento
    if (request.destination === 'document') {
      return caches.match('/offline.html') || caches.match('/index.html')
    }
    throw error
  }
}

/**
 * Estratégia: Network First
 * Para conteúdo dinâmico
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.log('[SW] Rede falhou, buscando do cache...')
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    throw error
  }
}

/**
 * Estratégia: Stale While Revalidate
 * Para APIs - retorna cache imediatamente e atualiza em background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE)
  const cached = await cache.match(request)
  
  // Buscar atualização em background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.status === 200) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => {
      // Ignorar erros de rede em background
    })
  
  // Retornar cache imediatamente se disponível
  if (cached) {
    // Não aguardar fetchPromise, retornar cache imediatamente
    fetchPromise.catch(() => {})
    return cached
  }
  
  // Se não houver cache, aguardar resposta da rede
  return fetchPromise
}

/**
 * Determinar estratégia de cache baseado na requisição
 */
function getCacheStrategy(request) {
  const url = new URL(request.url)
  
  // Assets estáticos
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
    return CACHE_STRATEGIES.CACHE_FIRST
  }
  
  // APIs
  if (url.pathname.includes('/api/') || url.hostname.includes('supabase.co')) {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE
  }
  
  // HTML e outros
  return CACHE_STRATEGIES.NETWORK_FIRST
}

/**
 * Interceptar requisições
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  
  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return
  }
  
  // Ignorar requisições de extensões do navegador
  if (request.url.startsWith('chrome-extension://') || 
      request.url.startsWith('moz-extension://')) {
    return
  }
  
  const strategy = getCacheStrategy(request)
  
  event.respondWith(
    (async () => {
      try {
        switch (strategy) {
          case CACHE_STRATEGIES.CACHE_FIRST:
            return await cacheFirst(request)
          case CACHE_STRATEGIES.NETWORK_FIRST:
            return await networkFirst(request)
          case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            return await staleWhileRevalidate(request)
          default:
            return await networkFirst(request)
        }
      } catch (error) {
        console.error('[SW] Erro ao processar requisição:', error)
        // Fallback: tentar cache genérico
        const cached = await caches.match(request)
        if (cached) {
          return cached
        }
        // Se for documento, retornar página offline
        if (request.destination === 'document') {
          return caches.match('/offline.html') || caches.match('/index.html')
        }
        throw error
      }
    })()
  )
})

/**
 * Background Sync para ações offline
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions())
  }
})

/**
 * Sincronizar ações offline quando voltar online
 */
async function syncOfflineActions() {
  try {
    // Buscar ações pendentes do IndexedDB
    const db = await openDB()
    const actions = await db.getAll('offline-actions')
    
    for (const action of actions) {
      try {
        // Tentar executar ação
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        })
        
        if (response.ok) {
          // Remover ação do IndexedDB
          await db.delete('offline-actions', action.id)
          console.log('[SW] Ação offline sincronizada:', action.id)
        }
      } catch (error) {
        console.error('[SW] Erro ao sincronizar ação:', error)
      }
    }
  } catch (error) {
    console.error('[SW] Erro ao sincronizar ações offline:', error)
  }
}

/**
 * Push Notifications
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification recebida')
  
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Let\'s Roll'
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'default',
    data: data.data || {},
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

/**
 * Click em notificação
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event.notification.tag)
  
  event.notification.close()
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se já há uma janela aberta, focar nela
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus()
          }
        }
        // Caso contrário, abrir nova janela
        if (clients.openWindow) {
          const url = event.notification.data?.url || '/'
          return clients.openWindow(url)
        }
      })
  )
})

/**
 * Helper para IndexedDB (simplificado)
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('letsroll-offline', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      resolve({
        getAll: (store) => {
          return new Promise((res, rej) => {
            const tx = db.transaction(store, 'readonly')
            const storeObj = tx.objectStore(store)
            const req = storeObj.getAll()
            req.onsuccess = () => res(req.result)
            req.onerror = () => rej(req.error)
          })
        },
        delete: (store, id) => {
          return new Promise((res, rej) => {
            const tx = db.transaction(store, 'readwrite')
            const storeObj = tx.objectStore(store)
            const req = storeObj.delete(id)
            req.onsuccess = () => res()
            req.onerror = () => rej(req.error)
          })
        },
      })
    }
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('offline-actions')) {
        db.createObjectStore('offline-actions', { keyPath: 'id' })
      }
    }
  })
}

/**
 * Mensagens do cliente
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Mensagem recebida:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(STATIC_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    )
  }
})
