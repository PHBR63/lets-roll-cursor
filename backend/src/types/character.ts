/**
 * Tipos relacionados a personagens
 */

export interface CreateCharacterData {
  name: string
  campaignId: string
  class?: string
  origin?: string // Origem do personagem
  attributes?: Record<string, number>
  skills?: Record<string, { value: number; trained: boolean }>
  resources?: Record<string, { current: number; max: number }>
  conditions?: string[]
  [key: string]: unknown
}

export interface UpdateCharacterData {
  name?: string
  class?: string
  origin?: string // Origem do personagem
  attributes?: Record<string, number>
  skills?: Record<string, { value: number; trained: boolean }>
  resources?: Record<string, { current: number; max: number }>
  conditions?: string[]
  [key: string]: unknown
}

export interface CharacterFilters {
  campaignId?: string
  userId?: string
  limit?: number
  offset?: number
}
