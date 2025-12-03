import { useState, useCallback } from 'react'

/**
 * Opções para retry
 */
interface RetryOptions {
  maxRetries?: number
  delay?: number
  onRetry?: (attempt: number) => void
  onError?: (error: Error, attempt: number) => void
}

/**
 * Hook para retry logic em requisições
 * Tenta novamente automaticamente em caso de falha
 */
export function useRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    delay = 1000,
    onRetry,
    onError,
  } = options

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  /**
   * Executa a função com retry automático
   */
  const execute = useCallback(async (): Promise<T | null> => {
    setLoading(true)
    setError(null)
    setRetryCount(0)

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn()
        setLoading(false)
        setRetryCount(0)
        return result
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        setRetryCount(attempt + 1)

        if (onError) {
          onError(lastError, attempt + 1)
        }

        // Se não for a última tentativa, aguarda antes de tentar novamente
        if (attempt < maxRetries) {
          if (onRetry) {
            onRetry(attempt + 1)
          }
          await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)))
        }
      }
    }

    setLoading(false)
    setError(lastError)
    return null
  }, [fn, maxRetries, delay, onRetry, onError])

  /**
   * Reseta o estado
   */
  const reset = useCallback(() => {
    setError(null)
    setRetryCount(0)
  }, [])

  return {
    execute,
    loading,
    error,
    retryCount,
    reset,
  }
}

