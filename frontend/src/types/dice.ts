/**
 * Tipos relacionados a rolagem de dados
 */

export interface DiceRollResult {
  id?: string
  formula: string
  result: number
  total: number
  type?: 'basic' | 'skill' | 'attack'
  details?: {
    rolls: Array<{
      die: number
      value: number
    }>
    modifiers?: number
  }
  session_id?: string | null
  campaign_id?: string
  character_id?: string | null
  user_id?: string
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

