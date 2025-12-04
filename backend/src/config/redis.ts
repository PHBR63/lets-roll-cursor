/**
 * Configuração do Redis para cache
 */
import Redis from 'ioredis'
import { logger } from '../utils/logger'

let redisClient: Redis | null = null

/**
 * Inicializa cliente Redis
 * Se REDIS_URL não estiver configurado, retorna null (cache desabilitado)
 */
export function initRedis(): Redis | null {
  if (redisClient) {
    return redisClient
  }

  const redisUrl = process.env.REDIS_URL
  const redisHost = process.env.REDIS_HOST || 'localhost'
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10)
  const redisPassword = process.env.REDIS_PASSWORD

  if (!redisUrl && !redisHost) {
    logger.warn('Redis não configurado. Cache desabilitado.')
    return null
  }

  try {
    if (redisUrl) {
      // Usar URL completa (ex: redis://localhost:6379 ou redis://:password@host:port)
      redisClient = new Redis(redisUrl, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000)
          return delay
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
      })
    } else {
      // Usar host/port separados
      redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000)
          return delay
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
      })
    }

    redisClient.on('error', (error) => {
      logger.error({ error }, 'Erro no Redis')
    })

    redisClient.on('connect', () => {
      logger.info('Redis conectado')
    })

    redisClient.on('ready', () => {
      logger.info('Redis pronto para uso')
    })

    // Conectar
    redisClient.connect().catch((error) => {
      logger.error({ error }, 'Erro ao conectar Redis')
      redisClient = null
    })

    return redisClient
  } catch (error) {
    logger.error({ error }, 'Erro ao inicializar Redis')
    return null
  }
}

/**
 * Obtém cliente Redis (singleton)
 */
export function getRedisClient(): Redis | null {
  if (!redisClient) {
    return initRedis()
  }
  return redisClient
}

/**
 * Fecha conexão Redis
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    logger.info('Redis desconectado')
  }
}

