/**
 * Tipos relacionados a itens
 */

export interface Item {
  id: string
  name: string
  description?: string
  campaign_id?: string | null
  created_by?: string
  is_global?: boolean
  type?: string
  weight?: number
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

export interface ItemUpdateData {
  name?: string
  description?: string
  type?: string
  weight?: number
  attributes?: Record<string, unknown>
  is_global?: boolean
}
