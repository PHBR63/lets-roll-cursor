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
  category?: 'I' | 'II' | 'III' | 'IV' // Categoria do item para validação de patente
  modificationLevel?: number // Nível de modificação (aumenta categoria)
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
  category?: 'I' | 'II' | 'III' | 'IV'
  modificationLevel?: number
  isGlobal?: boolean
  properties?: Record<string, unknown>
}

