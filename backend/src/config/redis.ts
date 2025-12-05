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
  const redisHost = process.env.REDIS_HOST
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10)
  const redisPassword = process.env.REDIS_PASSWORD

  // Verificar se Redis está realmente configurado (não apenas variável vazia)
  const hasRedisUrl = redisUrl && redisUrl.trim().length > 0
  const hasRedisHost = redisHost && redisHost.trim().length > 0

  if (!hasRedisUrl && !hasRedisHost) {
    logger.warn('Redis não configurado. Cache desabilitado.')
    return null
  }

  try {
    if (hasRedisUrl) {
      // Usar URL completa (ex: redis://localhost:6379 ou redis://:password@host:port)
      redisClient = new Redis(redisUrl, {
        retryStrategy: (times) => {
          // Limitar tentativas - após 5 tentativas, parar de tentar
          if (times > 5) {
            logger.warn('Redis: Limite de tentativas de reconexão atingido. Cache desabilitado.')
            return null // Para de tentar reconectar
          }
          const delay = Math.min(times * 50, 2000)
          return delay
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
        connectTimeout: 5000, // Timeout de 5 segundos
      })
    } else if (hasRedisHost) {
      // Usar host/port separados
      redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        retryStrategy: (times) => {
          // Limitar tentativas - após 5 tentativas, parar de tentar
          if (times > 5) {
            logger.warn('Redis: Limite de tentativas de reconexão atingido. Cache desabilitado.')
            return null // Para de tentar reconectar
          }
          const delay = Math.min(times * 50, 2000)
          return delay
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
        connectTimeout: 5000, // Timeout de 5 segundos
      })
    } else {
      return null
    }

    // Silenciar erros de conexão após algumas tentativas
    let errorCount = 0
    redisClient.on('error', (error: Error & { code?: string }) => {
      errorCount++
      // Só logar os primeiros 3 erros para não poluir os logs
      if (errorCount <= 3) {
        logger.error({ error }, 'Erro no Redis')
      }
      // Após 3 erros, silenciar (mas ainda manter o handler para evitar crashes)
      if (errorCount > 3 && error.code === 'ECONNREFUSED') {
        // Silenciar erros de conexão recusada após 3 tentativas
        return
      }
    })

    redisClient.on('connect', () => {
      logger.info('Redis conectado')
      errorCount = 0 // Resetar contador ao conectar
    })

    redisClient.on('ready', () => {
      logger.info('Redis pronto para uso')
    })

    // Conectar
    redisClient.connect().catch((error: Error & { code?: string }) => {
      // Só logar se for um erro diferente de ECONNREFUSED ou se for o primeiro erro
      if (error.code !== 'ECONNREFUSED' || errorCount === 0) {
        logger.error({ error }, 'Erro ao conectar Redis')
      }
      // Não definir redisClient como null aqui, deixar o retryStrategy lidar
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

