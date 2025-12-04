import { supabase } from '@/integrations/supabase/client'
import { useApiError } from '@/hooks/useApiError'

/**
 * Opções para requisição API
 */
interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean
  retry?: {
    maxRetries?: number
    delay?: number
  }
}

/**
 * Cliente API centralizado
 * Gerencia autenticação, retry e tratamento de erros
 */
export class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  }

  /**
   * Obtém token de autenticação
   */
  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  /**
   * Faz requisição com retry automático
   */
  private async fetchWithRetry(
    url: string,
    options: ApiRequestOptions,
    retryCount = 0
  ): Promise<Response> {
    const { retry, requireAuth = true, ...fetchOptions } = options
    const maxRetries = retry?.maxRetries || 3
    const delay = retry?.delay || 1000

    try {
      // Adicionar token de autenticação se necessário
      if (requireAuth) {
        const token = await this.getAuthToken()
        if (!token) {
          throw new Error('Sessão não encontrada')
        }

        fetchOptions.headers = {
          ...fetchOptions.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      const response = await fetch(`${this.baseUrl}${url}`, fetchOptions)

      // Se erro 5xx e ainda há tentativas, retry
      if (response.status >= 500 && retryCount < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * (retryCount + 1)))
        return this.fetchWithRetry(url, options, retryCount + 1)
      }

      return response
    } catch (error) {
      // Se erro de rede e ainda há tentativas, retry
      if (retryCount < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * (retryCount + 1)))
        return this.fetchWithRetry(url, options, retryCount + 1)
      }
      throw error
    }
  }

  /**
   * GET request
   */
  async get<T>(url: string, options?: ApiRequestOptions): Promise<T> {
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'GET',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || error.message || 'Erro ao buscar dados')
    }

    return response.json()
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    const isFormData = data instanceof FormData

    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'POST',
      headers: isFormData
        ? options?.headers
        : {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
      body: isFormData ? data : JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || error.message || 'Erro ao criar recurso')
    }

    return response.json()
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<T> {
    const isFormData = data instanceof FormData

    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'PUT',
      headers: isFormData
        ? options?.headers
        : {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
      body: isFormData ? data : JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || error.message || 'Erro ao atualizar recurso')
    }

    return response.json()
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, options?: ApiRequestOptions): Promise<T> {
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || error.message || 'Erro ao deletar recurso')
    }

    // DELETE pode não retornar conteúdo
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }
}

// Instância singleton
export const apiClient = new ApiClient()

