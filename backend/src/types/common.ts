/**
 * Tipos comuns compartilhados no backend
 */

/**
 * Tipo para erros em catch blocks
 */
export interface AppError extends Error {
  code?: string
  statusCode?: number
  details?: unknown
}

/**
 * Tipo genérico para dados de atualização
 */
export type UpdateData<T> = Partial<T> & Record<string, unknown>

/**
 * Tipo para dados de criação
 */
export type CreateData<T> = Omit<T, 'id' | 'created_at' | 'updated_at' | 'user_id'> & Record<string, unknown>

/**
 * Tipo para resposta paginada
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

/**
 * Tipo para parâmetros de paginação
 */
export interface PaginationParams {
  limit?: number
  offset?: number
}

/**
 * Tipo para filtros genéricos
 */
export interface FilterParams extends PaginationParams {
  [key: string]: unknown
}

