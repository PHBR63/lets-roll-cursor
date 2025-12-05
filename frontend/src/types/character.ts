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
  skills?: Record<string, { value: number; trained: boolean } | { attribute: string; training: 'trained' | 'expert' | 'veteran' | 'master'; bonus: number }>
  resources?: Record<string, { current: number; max: number }>
  stats?: {
    pv?: { current: number; max: number }
    san?: { current: number; max: number }
    pe?: { current: number; max: number }
    nex?: number
    vida?: { current: number; max: number }
    energia?: { current: number; max: number }
    saude?: { current: number; max: number }
    xp?: number
  }
  conditions?: string[]
  conditionTimers?: Array<{ condition: string; duration: number }>
  inventory?: CharacterInventoryItem[]
  abilities?: CharacterAbility[]
  biography?: string
  origin?: string
  age?: number
  height?: string
  weight?: string
  carryCapacity?: number
  coins?: number
  paranormalPowers?: Array<{ id: string; name: string; [key: string]: unknown }>
  affinity?: string
  rituals?: Array<{ id: string; name: string; [key: string]: unknown }>
  ingredients?: Array<{ id: string; name: string; [key: string]: unknown }>
  resistances?: Record<string, number> // RD (Resistência a Dano) por tipo
  avatar_url?: string
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
    weight?: number
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

