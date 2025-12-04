/**
 * Tipos relacionados a sessões de jogo
 */

export interface Session {
  id: string
  campaign_id: string
  name?: string
  notes?: string
  started_at?: string
  ended_at?: string | null
  board_state?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface SessionUpdateData {
  name?: string
  notes?: string
  ended_at?: string | null
  board_state?: Record<string, unknown>
}

