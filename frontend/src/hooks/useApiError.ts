import { useCallback } from 'react'
import { useToast } from '@/hooks/useToast'

/**
 * Tipos de erro da API
 */
export type ApiErrorType = 
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'rate_limit'
  | 'server'
  | 'unknown'

/**
 * Interface para erro da API
 */
export interface ApiError {
  type: ApiErrorType
  message: string
  status?: number
  retryAfter?: number
  originalError?: Error
}

/**
 * Hook para tratamento centralizado de erros de API
 * Fornece funções para tratar erros e exibir mensagens amigáveis
 */
export function useApiError() {
  const toast = useToast()

  /**
   * Traduz erro HTTP para tipo de erro
   */
  const getErrorType = useCallback((status?: number): ApiErrorType => {
    if (!status) return 'network'
    if (status === 401) return 'unauthorized'
    if (status === 403) return 'forbidden'
    if (status === 404) return 'not_found'
    if (status === 429) return 'rate_limit'
    if (status >= 400 && status < 500) return 'validation'
    if (status >= 500) return 'server'
    return 'unknown'
  }, [])

  /**
   * Traduz tipo de erro para mensagem amigável
   */
  const getErrorMessage = useCallback((type: ApiErrorType, customMessage?: string, retryAfter?: number): string => {
    if (customMessage) return customMessage

    const messages: Record<ApiErrorType, string> = {
      network: 'Erro de conexão. Verifique sua internet e tente novamente.',
      unauthorized: 'Sessão expirada. Faça login novamente.',
      forbidden: 'Você não tem permissão para realizar esta ação.',
      not_found: 'Item não encontrado.',
      validation: 'Dados inválidos. Verifique os campos e tente novamente.',
      rate_limit: retryAfter 
        ? `Muitas requisições. Tente novamente em ${Math.ceil(retryAfter / 60)} minuto(s).`
        : 'Muitas requisições. Tente novamente em alguns minutos.',
      server: 'Erro no servidor. Tente novamente mais tarde.',
      unknown: 'Ocorreu um erro inesperado. Tente novamente.',
    }

    return messages[type]
  }, [])

  /**
   * Trata erro de requisição fetch
   */
  const handleFetchError = useCallback(
    async (response: Response, customMessage?: string): Promise<ApiError> => {
      const type = getErrorType(response.status)
      let message = customMessage
      let retryAfter: number | undefined

      // Tentar extrair mensagem e retryAfter do corpo da resposta
      if (!message || type === 'rate_limit') {
        try {
          const data = await response.json()
          message = data.error || data.message || getErrorMessage(type, undefined, data.retryAfter)
          retryAfter = data.retryAfter || parseInt(response.headers.get('Retry-After') || '0', 10) || undefined
        } catch {
          // Se não conseguir parsear JSON, tentar pegar Retry-After do header
          retryAfter = parseInt(response.headers.get('Retry-After') || '0', 10) || undefined
          message = getErrorMessage(type, customMessage, retryAfter)
        }
      }

      // Se for rate limit e não tiver retryAfter, calcular baseado no padrão (15 minutos)
      if (type === 'rate_limit' && !retryAfter) {
        retryAfter = 900 // 15 minutos padrão
        message = getErrorMessage(type, customMessage, retryAfter)
      }

      return {
        type,
        message: message || 'Erro desconhecido',
        status: response.status,
        retryAfter,
      }
    },
    [getErrorType, getErrorMessage]
  )

  /**
   * Trata erro genérico
   */
  const handleError = useCallback(
    (error: unknown, customMessage?: string): ApiError => {
      if (error instanceof Error) {
        // Erro de rede
        if (error.message.includes('fetch') || error.message.includes('network')) {
          return {
            type: 'network',
            message: customMessage || getErrorMessage('network'),
            originalError: error,
          }
        }

        return {
          type: 'unknown',
          message: customMessage || error.message || getErrorMessage('unknown'),
          originalError: error,
        }
      }

      return {
        type: 'unknown',
        message: customMessage || getErrorMessage('unknown'),
      }
    },
    [getErrorMessage]
  )

  /**
   * Trata erro e exibe toast
   */
  const handleErrorWithToast = useCallback(
    (error: unknown, customMessage?: string) => {
      const apiError = handleError(error, customMessage)
      toast.error('Erro', { description: apiError.message })
      return apiError
    },
    [handleError, toast]
  )

  /**
   * Trata erro de resposta e exibe toast
   */
  const handleResponseError = useCallback(
    async (response: Response, customMessage?: string) => {
      const apiError = await handleFetchError(response, customMessage)
      toast.error('Erro', { description: apiError.message })
      return apiError
    },
    [handleFetchError, toast]
  )

  return {
    handleError,
    handleErrorWithToast,
    handleResponseError,
    handleFetchError,
    getErrorType,
    getErrorMessage,
  }
}

