/**
 * Tipos relacionados a habilidades
 */

export interface CreateAbilityData {
  name: string
  description?: string
  type?: string
  cost?: Record<string, unknown>
  attributes?: Record<string, unknown>
  campaignId?: string | null
  isGlobal?: boolean
}

export interface UpdateAbilityData {
  name?: string
  description?: string
  type?: string
  cost?: Record<string, unknown>
  attributes?: Record<string, unknown>
  isGlobal?: boolean
}

