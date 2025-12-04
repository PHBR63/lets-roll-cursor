/**
 * Tipos relacionados a criaturas
 */

export interface Creature {
  id: string
  name: string
  description?: string
  campaign_id?: string | null
  created_by?: string
  is_global?: boolean
  type?: string
  attributes?: Record<string, number>
  stats?: Record<string, { current: number; max: number }>
  skills?: Record<string, { value: number; trained: boolean }>
  conditions?: string[]
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

export interface CreatureUpdateData {
  name?: string
  description?: string
  type?: string
  attributes?: Record<string, number>
  stats?: Record<string, { current: number; max: number }>
  skills?: Record<string, { value: number; trained: boolean }>
  conditions?: string[]
  is_global?: boolean
}

