/**
 * Tipos compartilhados para DiceRoller
 */

export interface DiceRollResult {
  type: 'basic' | 'skill' | 'attack' | 'resistance'
  result?: number
  total?: number
  formula?: string
  details?: number[]
  dice?: number[]
  skillName?: string
  difficulty?: number
  skillBonus?: number
  success?: boolean
  advantage?: boolean
  disadvantage?: boolean
  targetDefense?: number
  hit?: boolean
  critical?: boolean
  damage?: {
    total: number
    dice: number[]
  }
}

export interface Character {
  id: string
  name: string
  skills?: Record<string, any>
}

