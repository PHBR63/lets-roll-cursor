/**
 * Sistema de Error Tracking
 * Integração com Sentry ou similar para captura de erros
 */

import { logger } from './logger'
import { AppError } from '@/types/common'

/**
 * Configuração do error tracking
 */
interface ErrorTrackingConfig {
  /**
   * DSN do Sentry (opcional)
   */
  sentryDsn?: string
  /**
   * Ambiente (development, production)
   */
  environment?: string
  /**
   * Versão da aplicação
   */
  release?: string
  /**
   * Habilitar tracking
   */
  enabled?: boolean
}

let errorTrackingEnabled = false
let sentryInitialized = false

/**
 * Inicializar error tracking
 */
export function initErrorTracking(config: ErrorTrackingConfig = {}) {
  const {
    sentryDsn,
    environment = import.meta.env.MODE || 'development',
    release = import.meta.env.VITE_APP_VERSION || '0.0.0',
    enabled = import.meta.env.PROD,
  } = config

  errorTrackingEnabled = enabled

  // Se não há DSN ou está desabilitado, usar apenas logger local
  if (!sentryDsn || !enabled) {
    logger.info('Error tracking desabilitado ou DSN não fornecido')
    return
  }

  // Inicializar Sentry (se disponível)
  try {
    // Dynamic import para não aumentar bundle se não usar
    import('@sentry/react').then((Sentry) => {
      Sentry.init({
        dsn: sentryDsn,
        environment,
        release,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      })
      sentryInitialized = true
      logger.info('Error tracking inicializado com sucesso')
    }).catch(() => {
      logger.warn('Sentry não disponível, usando logger local')
    })
  } catch (error) {
    logger.warn('Erro ao inicializar Sentry:', error)
  }
}

/**
 * Capturar erro
 */
export function captureError(
  error: Error | AppError | unknown,
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, unknown>
    user?: {
      id?: string
      username?: string
    }
    level?: 'error' | 'warning' | 'info'
  }
) {
  const errorObj = error instanceof Error ? error : new Error(String(error))
  const level = context?.level || 'error'

  // Log local
  logger[level]({ error: errorObj, context }, 'Erro capturado')

  // Se Sentry está inicializado, enviar para Sentry
  if (sentryInitialized && errorTrackingEnabled) {
    try {
      import('@sentry/react').then((Sentry) => {
        Sentry.captureException(errorObj, {
          tags: context?.tags,
          extra: context?.extra,
          user: context?.user,
          level,
        })
      }).catch(() => {
        // Sentry não disponível
      })
    } catch {
      // Ignorar erros de importação
    }
  }
}

/**
 * Capturar mensagem
 */
export function captureMessage(
  message: string,
  level: 'error' | 'warning' | 'info' = 'info',
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, unknown>
  }
) {
  logger[level]({ message, context }, 'Mensagem capturada')

  if (sentryInitialized && errorTrackingEnabled) {
    try {
      import('@sentry/react').then((Sentry) => {
        Sentry.captureMessage(message, {
          level,
          tags: context?.tags,
          extra: context?.extra,
        })
      }).catch(() => {
        // Sentry não disponível
      })
    } catch {
      // Ignorar erros de importação
    }
  }
}

/**
 * Adicionar breadcrumb (rastro de ações)
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  level: 'error' | 'warning' | 'info' = 'info',
  data?: Record<string, unknown>
) {
  if (sentryInitialized && errorTrackingEnabled) {
    try {
      import('@sentry/react').then((Sentry) => {
        Sentry.addBreadcrumb({
          message,
          category,
          level,
          data,
        })
      }).catch(() => {
        // Sentry não disponível
      })
    } catch {
      // Ignorar erros de importação
    }
  }
}

/**
 * Definir contexto do usuário
 */
export function setUserContext(user: {
  id?: string
  username?: string
  email?: string
  [key: string]: unknown
}) {
  if (sentryInitialized && errorTrackingEnabled) {
    try {
      import('@sentry/react').then((Sentry) => {
        Sentry.setUser(user)
      }).catch(() => {
        // Sentry não disponível
      })
    } catch {
      // Ignorar erros de importação
    }
  }
}

/**
 * Limpar contexto do usuário
 */
export function clearUserContext() {
  if (sentryInitialized && errorTrackingEnabled) {
    try {
      import('@sentry/react').then((Sentry) => {
        Sentry.setUser(null)
      }).catch(() => {
        // Sentry não disponível
      })
    } catch {
      // Ignorar erros de importação
    }
  }
}

/**
 * Capturar erro não tratado
 */
export function setupGlobalErrorHandlers() {
  // Capturar erros não tratados
  window.addEventListener('error', (event) => {
    captureError(event.error || new Error(event.message), {
      tags: {
        type: 'unhandled_error',
        filename: event.filename || 'unknown',
        lineno: String(event.lineno || 0),
        colno: String(event.colno || 0),
      },
      extra: {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
      },
    })
  })

  // Capturar promessas rejeitadas não tratadas
  window.addEventListener('unhandledrejection', (event) => {
    captureError(event.reason, {
      tags: {
        type: 'unhandled_promise_rejection',
      },
      extra: {
        reason: String(event.reason),
      },
    })
  })
}

/**
 * Helper para wrapper de função com error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: {
    name?: string
    tags?: Record<string, string>
  }
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args)
      
      // Se for Promise, capturar erros
      if (result instanceof Promise) {
        return result.catch((error) => {
          captureError(error, {
            tags: {
              ...context?.tags,
              function: context?.name || fn.name || 'unknown',
            },
          })
          throw error
        })
      }
      
      return result
    } catch (error) {
      captureError(error, {
        tags: {
          ...context?.tags,
          function: context?.name || fn.name || 'unknown',
        },
      })
      throw error
    }
  }) as T
}

