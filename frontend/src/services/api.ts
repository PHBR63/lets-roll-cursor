/**
 * Serviço centralizado de API com tratamento robusto de erros e retry
 */
import { supabase } from '@/integrations/supabase/client'
import { getApiBaseUrl } from '@/utils/env'

/**
 * Opções para requisições da API
 */
export interface ApiRequestOptions extends RequestInit {
  retry?: {
    maxRetries?: number
    baseDelay?: number
    maxDelay?: number
    exponentialBackoff?: boolean
  }
  skipAuth?: boolean // Pular adicionar token de autenticação
}

/**
 * Resposta da API com metadados
 */
export interface ApiResponse<T> {
  data: T
  status: number
  headers: Headers
}

/**
 * Classe de erro da API com informações detalhadas
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfter?: number,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Faz uma requisição à API com tratamento robusto de erros e retry
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    retry = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      exponentialBackoff: true,
    },
    skipAuth = false,
    ...fetchOptions
  } = options

  // Obter token de autenticação se necessário
  let headers = new Headers(fetchOptions.headers)
  if (!skipAuth) {
    try {
      const { data: session } = await supabase.auth.getSession()
      if (session.session?.access_token) {
        headers.set('Authorization', `Bearer ${session.session.access_token}`)
      }
    } catch (error) {
      console.warn('Erro ao obter sessão para requisição:', error)
    }
  }

  // Garantir Content-Type se houver body
  if (fetchOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const apiUrl = getApiBaseUrl()
  const url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  let lastError: ApiError | null = null
  const maxRetries = retry.maxRetries || 3

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      })

      // Sucesso
      if (response.ok) {
        const data = await response.json().catch(() => ({})) as T
        return {
          data,
          status: response.status,
          headers: response.headers,
        }
      }

      // Erro HTTP - tentar extrair informações
      let errorMessage = `Erro ${response.status}`
      let retryAfter: number | undefined

      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
        retryAfter = errorData.retryAfter || parseInt(response.headers.get('Retry-After') || '0', 10) || undefined
      } catch {
        // Se não conseguir parsear JSON, tentar pegar Retry-After do header
        retryAfter = parseInt(response.headers.get('Retry-After') || '0', 10) || undefined
      }

      const error = new ApiError(errorMessage, response.status, retryAfter)

      // Verificar se deve retentar
      const shouldRetry = attempt < maxRetries && (
        response.status === 429 || // Rate limit
        response.status >= 500 || // Erros de servidor
        response.status === 408 // Request timeout
      )

      if (shouldRetry) {
        // Calcular delay com backoff exponencial
        let delay = retry.baseDelay || 1000
        if (retry.exponentialBackoff) {
          delay = Math.min(
            delay * Math.pow(2, attempt),
            retry.maxDelay || 30000
          )
          // Adicionar jitter
          delay = delay + (delay * 0.2 * (Math.random() * 2 - 1))
        }

        // Se for 429 e tiver retryAfter, usar ele
        if (response.status === 429 && retryAfter) {
          delay = retryAfter * 1000 // Converter segundos para ms
        }

        // Aguardar antes de retentar
        await new Promise((resolve) => setTimeout(resolve, Math.max(100, delay)))
        lastError = error
        continue
      }

      // Não retentável ou esgotou tentativas
      throw error
    } catch (error) {
      // Se for ApiError, propagar
      if (error instanceof ApiError) {
        // Verificar se deve retentar
        const shouldRetry = attempt < maxRetries && (
          error.status === 429 ||
          error.status >= 500 ||
          error.status === 408
        )

        if (!shouldRetry) {
          throw error
        }

        lastError = error
        continue
      }

      // Erro de rede - sempre retentável
      if (error instanceof TypeError && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('network') ||
        error.message.includes('ERR_CONNECTION_REFUSED')
      )) {
        if (attempt < maxRetries) {
          // Calcular delay com backoff exponencial
          let delay = retry.baseDelay || 1000
          if (retry.exponentialBackoff) {
            delay = Math.min(
              delay * Math.pow(2, attempt),
              retry.maxDelay || 30000
            )
            // Adicionar jitter
            delay = delay + (delay * 0.2 * (Math.random() * 2 - 1))
          }

          await new Promise((resolve) => setTimeout(resolve, Math.max(100, delay)))
          lastError = new ApiError('Erro de conexão', 0, undefined, error)
          continue
        }
      }

      // Outro tipo de erro - não retentável
      throw new ApiError(
        error instanceof Error ? error.message : 'Erro desconhecido',
        0,
        undefined,
        error instanceof Error ? error : undefined
      )
    }
  }

  // Esgotou todas as tentativas
  throw lastError || new ApiError('Erro desconhecido após múltiplas tentativas', 0)
}

/**
 * Métodos HTTP helpers
 */
export const api = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
}

