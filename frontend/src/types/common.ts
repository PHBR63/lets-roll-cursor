/**
 * Tipos comuns compartilhados no frontend
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
 * Tipo para dados de atualização genéricos
 */
export type UpdateData<T> = Partial<T> & Record<string, unknown>

