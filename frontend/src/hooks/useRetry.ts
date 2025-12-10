import { useState, useCallback } from 'react'

/**
 * Opções para retry
 */
interface RetryOptions {
  maxRetries?: number
  baseDelay?: number // Delay base em ms (para backoff exponencial)
  maxDelay?: number // Delay máximo em ms
  exponentialBackoff?: boolean // Usar backoff exponencial
  retryableStatuses?: number[] // Status codes que devem ser retentados
  onRetry?: (attempt: number, delay: number) => void
  onError?: (error: Error, attempt: number) => void
}

/**
 * Verifica se um erro é retentável baseado no status code
 */
function isRetryableError(error: unknown, retryableStatuses: number[]): boolean {
  if (error instanceof Error && 'status' in error) {
    const status = (error as any).status
    return retryableStatuses.includes(status)
  }
  // Erros de rede são sempre retentáveis
  if (error instanceof TypeError && (
    error.message.includes('Failed to fetch') || 
    error.message.includes('network') ||
    error.message.includes('ERR_CONNECTION_REFUSED')
  )) {
    return true
  }
  return false
}

/**
 * Calcula delay com backoff exponencial
 */
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number, exponentialBackoff: boolean): number {
  if (!exponentialBackoff) {
    return baseDelay * (attempt + 1)
  }
  // Backoff exponencial: baseDelay * 2^attempt, limitado por maxDelay
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
  // Adicionar jitter aleatório (±20%) para evitar thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1)
  return Math.max(100, delay + jitter) // Mínimo 100ms
}

/**
 * Hook para retry logic em requisições
 * Tenta novamente automaticamente em caso de falha com backoff exponencial
 */
export function useRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000, // 30 segundos máximo
    exponentialBackoff = true,
    retryableStatuses = [429, 500, 502, 503, 504], // Rate limit e erros de servidor
    onRetry,
    onError,
  } = options

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [nextRetryDelay, setNextRetryDelay] = useState<number | null>(null)

  /**
   * Executa a função com retry automático
   */
  const execute = useCallback(async (): Promise<T | null> => {
    setLoading(true)
    setError(null)
    setRetryCount(0)
    setNextRetryDelay(null)

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn()
        setLoading(false)
        setRetryCount(0)
        setNextRetryDelay(null)
        return result
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        setRetryCount(attempt + 1)

        // Verificar se o erro é retentável
        const shouldRetry = attempt < maxRetries && isRetryableError(err, retryableStatuses)

        if (onError) {
          onError(lastError, attempt + 1)
        }

        if (shouldRetry) {
          // Calcular delay para próxima tentativa
          const delay = calculateDelay(attempt, baseDelay, maxDelay, exponentialBackoff)
          setNextRetryDelay(delay)

          // Se for erro 429, tentar usar retryAfter do erro se disponível
          let actualDelay = delay
          if (lastError && 'status' in lastError && (lastError as any).status === 429) {
            const retryAfter = (lastError as any).retryAfter
            if (retryAfter && retryAfter > 0) {
              // Converter segundos para ms
              actualDelay = retryAfter * 1000
              setNextRetryDelay(actualDelay)
            }
          }

          if (onRetry) {
            onRetry(attempt + 1, actualDelay)
          }

          // Aguardar antes de tentar novamente
          await new Promise((resolve) => setTimeout(resolve, actualDelay))
        } else {
          // Não é retentável ou esgotou tentativas
          setLoading(false)
          setError(lastError)
          setNextRetryDelay(null)
          return null
        }
      }
    }

    // Esgotou todas as tentativas
    setLoading(false)
    setError(lastError)
    setNextRetryDelay(null)
    return null
  }, [fn, maxRetries, baseDelay, maxDelay, exponentialBackoff, retryableStatuses, onRetry, onError])

  /**
   * Reseta o estado
   */
  const reset = useCallback(() => {
    setError(null)
    setRetryCount(0)
    setNextRetryDelay(null)
  }, [])

  return {
    execute,
    loading,
    error,
    retryCount,
    nextRetryDelay,
    reset,
  }
}

