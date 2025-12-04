/**
 * Tipos relacionados a campanhas
 */

export interface CreateCampaignData {
  name: string
  description?: string
  systemRpg?: string
  tags?: string[]
  config?: Record<string, unknown>
  image?: {
    buffer: Buffer
    originalname: string
  }
}

export interface UpdateCampaignData {
  name?: string
  description?: string
  systemRpg?: string
  tags?: string[]
  status?: 'active' | 'finished' | 'paused'
  config?: Record<string, unknown>
  image?: {
    buffer: Buffer
    originalname: string
  }
}

