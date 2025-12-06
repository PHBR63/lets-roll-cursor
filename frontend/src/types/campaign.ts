/**
 * Tipos relacionados a campanhas
 */
import { Character } from './character'

export interface Campaign {
  id: string
  name: string
  title?: string // Alias para name (compatibilidade)
  description?: string
  image_url?: string
  system_rpg?: string
  tags?: string[]
  status?: 'active' | 'finished' | 'paused'
  created_at?: string
  updated_at?: string
  created_by?: string
  role?: 'master' | 'player' | 'observer'
  participants?: CampaignParticipant[]
}

export interface CampaignParticipant {
  id?: string
  campaign_id: string
  user_id: string
  role: 'master' | 'player' | 'observer'
  character?: {
    id: string
    name: string
    [key: string]: unknown
  } | Character
  user?: {
    id: string
    username: string
    avatar_url?: string
  }
}

export interface CampaignUpdateData {
  name?: string
  description?: string
  system_rpg?: string
  tags?: string[]
  status?: 'active' | 'finished' | 'paused'
  [key: string]: unknown
}

