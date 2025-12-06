/**
 * Tipos relacionados a habilidades
 */

export interface Ability {
  id: string
  name: string
  description?: string
  campaign_id?: string | null
  created_by?: string
  is_global?: boolean
  type?: string
  cost?: Record<string, unknown>
  attributes?: Record<string, unknown>
  created_at?: string
  updated_at?: string
  campaign?: {
    id: string
    name: string
  }
  created_by_user?: {
    id: string
    username: string
  }
}

export interface AbilityUpdateData {
  name?: string
  description?: string
  type?: string
  cost?: Record<string, unknown>
  attributes?: Record<string, unknown>
  is_global?: boolean
}
