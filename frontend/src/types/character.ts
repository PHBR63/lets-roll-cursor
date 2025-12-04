/**
 * Tipos relacionados a personagens
 */

export interface Character {
  id: string
  name: string
  campaign_id: string
  user_id: string
  class?: string
  attributes?: Record<string, number>
  skills?: Record<string, { value: number; trained: boolean }>
  resources?: Record<string, { current: number; max: number }>
  conditions?: string[]
  inventory?: CharacterInventoryItem[]
  abilities?: CharacterAbility[]
  created_at?: string
  updated_at?: string
  campaign?: {
    id: string
    name: string
  }
  user?: {
    id: string
    username: string
    avatar_url?: string
  }
}

export interface CharacterInventoryItem {
  id: string
  character_id: string
  item_id: string
  quantity: number
  equipped: boolean
  item?: {
    id: string
    name: string
    description?: string
    type?: string
    attributes?: Record<string, unknown>
  }
}

export interface CharacterAbility {
  id: string
  character_id: string
  ability_id: string
  ability?: {
    id: string
    name: string
    description?: string
    type?: string
    cost?: Record<string, unknown>
    attributes?: Record<string, unknown>
  }
}

export interface CharacterUpdateData {
  name?: string
  class?: string
  attributes?: Record<string, number>
  skills?: Record<string, { value: number; trained: boolean }>
  resources?: Record<string, { current: number; max: number }>
  conditions?: string[]
  [key: string]: unknown
}

