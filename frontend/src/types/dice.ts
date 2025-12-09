/**
 * Tipos relacionados a rolagem de dados
 */

export interface DiceRollResult {
  id?: string
  formula: string
  result: number
  total: number
  type?: 'basic' | 'skill' | 'attack' | 'resistance'
  bonus?: number
  details?: {
    rolls: Array<{
      die: number
      value: number
    }> | number[]
    modifiers?: number
  }
  dice?: number[]
  selectedDice?: number
  skillName?: string
  difficulty?: number
  skillBonus?: number
  success?: boolean
  advantage?: boolean
  disadvantage?: boolean
  targetDefense?: number
  threatRange?: number
  hit?: boolean
  critical?: boolean
  damage?: {
    total: number
    dice: number[]
  }
  resistanceType?: 'Fortitude' | 'Reflexos' | 'Vontade'
  session_id?: string | null
  campaign_id?: string
  character_id?: string | null
  character?: {
    id: string
    name: string
  }
  user_id?: string
  user?: {
    id: string
    username: string
  }
  is_private?: boolean
  created_at?: string
}

export interface DiceRollRequest {
  formula: string
  sessionId?: string | null
  campaignId?: string
  characterId?: string | null
  isPrivate?: boolean
  type?: 'basic' | 'skill' | 'attack'
}

