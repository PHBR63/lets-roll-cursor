/**
 * Tipos relacionados a criaturas
 */

export interface CreateCreatureData {
  name: string
  description?: string
  campaignId?: string | null
  isGlobal?: boolean
  type?: string | null
  stats?: Record<string, unknown>
  attributes?: Record<string, number>
  skills?: Record<string, { value: number; trained: boolean }>
  conditions?: string[]
}

export interface UpdateCreatureData {
  name?: string
  description?: string
  isGlobal?: boolean
  type?: string | null
  stats?: Record<string, unknown>
  attributes?: Record<string, number>
  skills?: Record<string, { value: number; trained: boolean }>
  conditions?: string[]
}

