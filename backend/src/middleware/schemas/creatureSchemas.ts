import { z } from 'zod'

/**
 * Schema para criação de criatura
 */
export const CreateCreatureSchema = z.object({
  campaignId: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(100),
  type: z.string().max(50).optional(),
  description: z.string().max(1000).optional(),
  attributes: z.record(z.any()).optional(),
  stats: z.record(z.any()).optional(),
  isGlobal: z.boolean().default(false),
})

/**
 * Schema para atualização de criatura
 */
export const UpdateCreatureSchema = CreateCreatureSchema.partial()

/**
 * Schema para filtros de criatura
 */
export const CreatureFilterSchema = z.object({
  campaignId: z.string().uuid().optional(),
  isGlobal: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

