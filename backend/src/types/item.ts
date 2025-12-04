/**
 * Tipos relacionados a itens
 */

export interface CreateItemData {
  name: string
  description?: string
  type?: string
  weight?: number
  price?: number
  attributes?: Record<string, unknown>
  rarity?: string
  campaignId?: string | null
  isGlobal?: boolean
  properties?: Record<string, unknown>
}

export interface UpdateItemData {
  name?: string
  description?: string
  type?: string
  weight?: number
  price?: number
  attributes?: Record<string, unknown>
  rarity?: string
  isGlobal?: boolean
  properties?: Record<string, unknown>
}

