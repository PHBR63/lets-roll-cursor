/**
 * Logger para frontend
 * Desabilita logs em produção
 */

const isProduction = import.meta.env.PROD

interface Logger {
  log: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  debug: (...args: unknown[]) => void
}

/**
 * Logger que desabilita logs em produção
 */
export const logger: Logger = {
  log: (...args: unknown[]) => {
    if (!isProduction) {
      console.log(...args)
    }
  },
  error: (...args: unknown[]) => {
    // Erros sempre são logados, mesmo em produção
    console.error(...args)
  },
  warn: (...args: unknown[]) => {
    if (!isProduction) {
      console.warn(...args)
    }
  },
  info: (...args: unknown[]) => {
    if (!isProduction) {
      console.info(...args)
    }
  },
  debug: (...args: unknown[]) => {
    if (!isProduction) {
      console.debug(...args)
    }
  },
}

