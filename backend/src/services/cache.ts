/**
 * Serviço de cache genérico usando Redis
 * Fallback para memória se Redis não estiver disponível
 */
import { getRedisClient } from '../config/redis'
import { logger } from '../utils/logger'

// Cache em memória como fallback
const memoryCache = new Map<string, { data: unknown; expiresAt: number }>()

/**
 * Limpa entradas expiradas do cache em memória
 */
function cleanMemoryCache(): void {
  const now = Date.now()
  for (const [key, value] of memoryCache.entries()) {
    if (value.expiresAt < now) {
      memoryCache.delete(key)
    }
  }
}

// Limpar cache a cada 5 minutos
setInterval(cleanMemoryCache, 5 * 60 * 1000)

/**
 * Obtém valor do cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedisClient()

  if (redis) {
    try {
      const value = await redis.get(key)
      if (value) {
        return JSON.parse(value) as T
      }
      return null
    } catch (error) {
      logger.error({ error, key }, 'Erro ao obter do cache Redis')
      // Fallback para memória
    }
  }

  // Fallback para memória
  const cached = memoryCache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T
  }

  if (cached) {
    memoryCache.delete(key)
  }

  return null
}

/**
 * Define valor no cache
 */
export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds: number = 300
): Promise<void> {
  const redis = getRedisClient()

  if (redis) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value))
      return
    } catch (error) {
      logger.error({ error, key }, 'Erro ao definir no cache Redis')
      // Fallback para memória
    }
  }

  // Fallback para memória
  memoryCache.set(key, {
    data: value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  })
}

/**
 * Remove valor do cache
 */
export async function deleteCache(key: string): Promise<void> {
  const redis = getRedisClient()

  if (redis) {
    try {
      await redis.del(key)
    } catch (error) {
      logger.error({ error, key }, 'Erro ao deletar do cache Redis')
    }
  }

  memoryCache.delete(key)
}

/**
 * Remove múltiplas chaves do cache (padrão)
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  const redis = getRedisClient()

  if (redis) {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      logger.error({ error, pattern }, 'Erro ao deletar padrão do cache Redis')
    }
  }

  // Fallback para memória - deletar chaves que correspondem ao padrão
  const regex = new RegExp(pattern.replace('*', '.*'))
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key)
    }
  }
}

/**
 * Limpa todo o cache
 */
export async function clearCache(): Promise<void> {
  const redis = getRedisClient()

  if (redis) {
    try {
      await redis.flushdb()
    } catch (error) {
      logger.error({ error }, 'Erro ao limpar cache Redis')
    }
  }

  memoryCache.clear()
}

/**
 * Gera chave de cache para personagens
 */
export function getCharacterCacheKey(filters: {
  campaignId?: string
  userId?: string
  characterId?: string
}): string {
  const parts = ['characters']
  if (filters.characterId) {
    parts.push(filters.characterId)
  } else {
    if (filters.campaignId) parts.push(`campaign:${filters.campaignId}`)
    if (filters.userId) parts.push(`user:${filters.userId}`)
  }
  return parts.join(':')
}

/**
 * Gera chave de cache para campanhas
 */
export function getCampaignCacheKey(filters: {
  campaignId?: string
  userId?: string
}): string {
  const parts = ['campaigns']
  if (filters.campaignId) {
    parts.push(filters.campaignId)
  } else if (filters.userId) {
    parts.push(`user:${filters.userId}`)
  }
  return parts.join(':')
}

/**
 * Gera chave de cache para criaturas
 */
export function getCreatureCacheKey(filters: {
  creatureId?: string
  campaignId?: string
}): string {
  const parts = ['creatures']
  if (filters.creatureId) {
    parts.push(filters.creatureId)
  } else if (filters.campaignId) {
    parts.push(`campaign:${filters.campaignId}`)
  }
  return parts.join(':')
}

/**
 * Gera chave de cache para momentos
 */
export function getMomentCacheKey(filters: {
  momentId?: string
  campaignId?: string
  sessionId?: string
}): string {
  const parts = ['moments']
  if (filters.momentId) {
    parts.push(filters.momentId)
  } else {
    if (filters.campaignId) parts.push(`campaign:${filters.campaignId}`)
    if (filters.sessionId) parts.push(`session:${filters.sessionId}`)
  }
  return parts.join(':')
}

