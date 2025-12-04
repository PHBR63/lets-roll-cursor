import { z } from 'zod'

/**
 * Schema para criação de campanha
 */
export const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional().nullable(),
  system: z.string().max(50).optional(),
  settings: z.record(z.any()).optional(),
})

/**
 * Schema para atualização de campanha
 */
export const UpdateCampaignSchema = CreateCampaignSchema.partial()

/**
 * Schema para filtros de campanha
 */
export const CampaignFilterSchema = z.object({
  userId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

