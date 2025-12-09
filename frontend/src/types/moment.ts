/**
 * Tipos relacionados a momentos da campanha (stories)
 */

export interface CampaignMoment {
  id: string
  campaign_id: string
  session_id?: string | null
  created_by: string
  title: string
  description?: string | null
  image_url?: string | null
  dice_roll_id?: string | null
  created_at: string
  updated_at: string
  created_by_user?: {
    id: string
    username: string
    avatar_url?: string
  }
  session?: {
    id: string
    name: string
  }
  dice_roll?: {
    id: string
    formula: string
    result: number
  }
}

export interface CreateMomentData {
  campaignId: string
  sessionId?: string | null
  title: string
  description?: string
  imageUrl?: string
  diceRollId?: string | null
}

export interface UpdateMomentData {
  title?: string
  description?: string
  imageUrl?: string
  sessionId?: string | null
  diceRollId?: string | null
}

