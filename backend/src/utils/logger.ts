import pino from 'pino'

/**
 * Logger estruturado usando Pino
 * Desabilita logs em produção (NODE_ENV=production)
 */
export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
})

/**
 * Helper para criar logger com contexto
 */
export function createLogger(context: string) {
  return logger.child({ context })
}

