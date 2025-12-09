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
  selectedDice?: number
  skillName?: string
  difficulty?: number
  skillBonus?: number
  bonus?: number
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
}

export interface Character {
  id: string
  name: string
  skills?: Record<string, any>
}

